#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read

/**
 * Download all BAG WFS feature types for all Overijssel municipalities
 * from the PDOK WFS endpoint using OGC XML POST requests.
 *
 * Strategy per feature type:
 *   verblijfsobject, pand, ligplaats, standplaats
 *     → paginate with CQL identificatie LIKE '<code>*' per municipality
 *   woonplaats
 *     → download nationally (only ~2500 records, no municipality reference)
 *
 * Usage:
 *   deno run --allow-net --allow-write --allow-read scripts/download-bag-wfs.ts
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WfsFeature {
  type: "Feature";
  id: string;
  geometry: GeoJsonGeometry | null;
  properties: Record<string, string | number | boolean | null>;
}

interface GeoJsonGeometry {
  type: string;
  coordinates: unknown;
}

interface WfsFeatureCollection {
  type: "FeatureCollection";
  name: string;
  numberMatched?: number;
  numberReturned?: number;
  features: WfsFeature[];
}

/** Layers where we filter per municipality using identificatie LIKE '<code>*' */
type MunicipalityLayer =
  | "bag:verblijfsobject"
  | "bag:pand"
  | "bag:ligplaats"
  | "bag:standplaats";

/** Layers downloaded without municipality split */
type NationalLayer = "bag:woonplaats";

type BagLayer = MunicipalityLayer | NationalLayer;

interface Gemeente {
  /** 4-digit CBS gemeentecode, e.g. "0183" */
  code: string;
  naam: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PDOK_WFS_URL = "https://service.pdok.nl/lv/bag/wfs/v2_0";

/** PDOK hard page limit */
const PAGE_SIZE = 1000;

/** Max concurrent HTTP requests */
const CONCURRENCY = 4;

/** Output directory */
const OUT_DIR = "data/bag";

/**
 * All 25 Overijssel municipalities.
 * Source: CBS gemeentegrenzen 2024.
 */
const OVERIJSSEL_GEMEENTEN: Gemeente[] = [
  { code: "0141", naam: "Almelo" },
  { code: "0147", naam: "Borne" },
  { code: "0148", naam: "Dalfsen" },
  { code: "0150", naam: "Deventer" },
  { code: "1774", naam: "Dinkelland" },
  { code: "0153", naam: "Enschede" },
  { code: "0158", naam: "Haaksbergen" },
  { code: "0160", naam: "Hardenberg" },
  { code: "0163", naam: "Hellendoorn" },
  { code: "0164", naam: "Hengelo" },
  { code: "0166", naam: "Kampen" },
  { code: "0168", naam: "Losser" },
  { code: "0171", naam: "Noordoostpolder" },
  { code: "0173", naam: "Oldenzaal" },
  { code: "1700", naam: "Twenterand" },
  { code: "0183", naam: "Tubbergen" },
  { code: "0184", naam: "Urk" },
  { code: "0189", naam: "Wierden" },
  { code: "0193", naam: "Zwolle" },
  { code: "1773", naam: "Olst-Wijhe" },
  { code: "1708", naam: "Steenwijkerland" },
  { code: "0180", naam: "Staphorst" },
  { code: "1896", naam: "Zwartewaterland" },
  { code: "1742", naam: "Rijssen-Holten" },
  { code: "0175", naam: "Ommen" },
];

const MUNICIPALITY_LAYERS: MunicipalityLayer[] = [
  "bag:verblijfsobject",
  "bag:pand",
  "bag:ligplaats",
  "bag:standplaats",
];

const NATIONAL_LAYERS: NationalLayer[] = [
  "bag:woonplaats",
];

// ---------------------------------------------------------------------------
// OGC XML POST body builders
// ---------------------------------------------------------------------------

/**
 * Build a WFS 2.0 GetFeature XML body that filters by identificatie LIKE '<code>*'.
 * This reliably selects all BAG objects belonging to a municipality.
 */
function buildIdentificatieXml(
  typeName: MunicipalityLayer,
  gemeentecode: string,
  startIndex: number,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<wfs:GetFeature
  xmlns:wfs="http://www.opengis.net/wfs/2.0"
  xmlns:fes="http://www.opengis.net/fes/2.0"
  service="WFS" version="2.0.0"
  count="${PAGE_SIZE}" startIndex="${startIndex}"
  outputFormat="application/json">
  <wfs:Query typeNames="${typeName}">
    <fes:Filter>
      <fes:PropertyIsLike wildCard="*" singleChar="?" escapeChar="!">
        <fes:ValueReference>identificatie</fes:ValueReference>
        <fes:Literal>${gemeentecode}*</fes:Literal>
      </fes:PropertyIsLike>
    </fes:Filter>
  </wfs:Query>
</wfs:GetFeature>`;
}

/** Build a WFS 2.0 GetFeature XML body with no spatial/attribute filter (national download). */
function buildNationalXml(typeName: NationalLayer, startIndex: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<wfs:GetFeature
  xmlns:wfs="http://www.opengis.net/wfs/2.0"
  service="WFS" version="2.0.0"
  count="${PAGE_SIZE}" startIndex="${startIndex}"
  outputFormat="application/json">
  <wfs:Query typeNames="${typeName}">
  </wfs:Query>
</wfs:GetFeature>`;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function postWfs(body: string): Promise<WfsFeatureCollection> {
  const response = await fetch(PDOK_WFS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} ${response.statusText}: ${text.slice(0, 300)}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    const text = await response.text();
    throw new Error(
      `Non-JSON response (${contentType}): ${text.slice(0, 300)}`,
    );
  }

  const data: WfsFeatureCollection = await response.json();
  if (data.type !== "FeatureCollection") {
    throw new Error(
      `Unexpected response type: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }
  return data;
}

// ---------------------------------------------------------------------------
// Download strategies
// ---------------------------------------------------------------------------

/** Download all pages for a municipality layer. */
async function downloadMunicipalityLayer(
  typeName: MunicipalityLayer,
  gemeentecode: string,
): Promise<WfsFeatureCollection> {
  const allFeatures: WfsFeature[] = [];
  let startIndex = 0;

  while (true) {
    const xml = buildIdentificatieXml(typeName, gemeentecode, startIndex);
    const page = await postWfs(xml);
    allFeatures.push(...page.features);

    if (page.features.length < PAGE_SIZE) break;
    startIndex += PAGE_SIZE;
  }

  const shortName = typeName.replace("bag:", "");
  return {
    type: "FeatureCollection",
    name: shortName,
    numberReturned: allFeatures.length,
    features: allFeatures,
  };
}

/** Download all pages for a national layer (no municipality filter). */
async function downloadNationalLayer(
  typeName: NationalLayer,
): Promise<WfsFeatureCollection> {
  const allFeatures: WfsFeature[] = [];
  let startIndex = 0;

  while (true) {
    const xml = buildNationalXml(typeName, startIndex);
    const page = await postWfs(xml);
    allFeatures.push(...page.features);

    if (page.features.length < PAGE_SIZE) break;
    startIndex += PAGE_SIZE;
  }

  const shortName = typeName.replace("bag:", "");
  return {
    type: "FeatureCollection",
    name: shortName,
    numberReturned: allFeatures.length,
    features: allFeatures,
  };
}

// ---------------------------------------------------------------------------
// Task types
// ---------------------------------------------------------------------------

interface MunicipalityTask {
  kind: "municipality";
  layer: MunicipalityLayer;
  gemeente: Gemeente;
  outputPath: string;
}

interface NationalTask {
  kind: "national";
  layer: NationalLayer;
  outputPath: string;
}

type Task = MunicipalityTask | NationalTask;

interface TaskResult {
  task: Task;
  success: boolean;
  featureCount: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

async function withConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Task runner
// ---------------------------------------------------------------------------

async function runTask(task: Task): Promise<TaskResult> {
  try {
    if (task.kind === "municipality") {
      const { layer, gemeente } = task;
      const shortLayer = layer.replace("bag:", "");
      console.log(`  → ${gemeente.naam} (${gemeente.code}) / ${shortLayer} …`);
      const collection = await downloadMunicipalityLayer(layer, gemeente.code);
      await writeJson(task.outputPath, collection);
      const n = collection.features.length;
      console.log(`  ✓ ${gemeente.naam} / ${shortLayer}: ${n} features`);
      return { task, success: true, featureCount: n };
    } else {
      const shortLayer = task.layer.replace("bag:", "");
      console.log(`  → [national] ${shortLayer} …`);
      const collection = await downloadNationalLayer(task.layer);
      await writeJson(task.outputPath, collection);
      const n = collection.features.length;
      console.log(`  ✓ [national] ${shortLayer}: ${n} features`);
      return { task, success: true, featureCount: n };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (task.kind === "municipality") {
      const label = `${task.gemeente.naam} / ${task.layer}`;
      console.error(`  ✗ ${label}: ${msg}`);
    } else {
      console.error(`  ✗ [national] ${task.layer}: ${msg}`);
    }
    return { task, success: false, featureCount: 0, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("PDOK BAG WFS download — Overijssel");
  console.log(`Output directory : ${OUT_DIR}/`);
  console.log(
    `Municipality layers : ${MUNICIPALITY_LAYERS.map((l) => l.replace("bag:", "")).join(", ")}`,
  );
  console.log(
    `National layers     : ${NATIONAL_LAYERS.map((l) => l.replace("bag:", "")).join(", ")}`,
  );
  console.log(`Municipalities      : ${OVERIJSSEL_GEMEENTEN.length}`);
  console.log(`Concurrency         : ${CONCURRENCY}`);
  console.log("");

  await ensureDir(OUT_DIR);

  const tasks: Task[] = [];

  // One subfolder per municipality for municipality layers
  for (const gemeente of OVERIJSSEL_GEMEENTEN) {
    const slug = gemeente.naam.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const dir = `${OUT_DIR}/${gemeente.code}_${slug}`;
    await ensureDir(dir);

    for (const layer of MUNICIPALITY_LAYERS) {
      const shortLayer = layer.replace("bag:", "");
      tasks.push({
        kind: "municipality",
        layer,
        gemeente,
        outputPath: `${dir}/${shortLayer}.geojson`,
      });
    }
  }

  // National layers go to OUT_DIR root
  for (const layer of NATIONAL_LAYERS) {
    const shortLayer = layer.replace("bag:", "");
    tasks.push({
      kind: "national",
      layer,
      outputPath: `${OUT_DIR}/${shortLayer}.geojson`,
    });
  }

  console.log(`Total tasks : ${tasks.length}`);
  console.log("");

  const taskFns = tasks.map((task) => () => runTask(task));
  const results = await withConcurrency(taskFns, CONCURRENCY);

  // Summary
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalFeatures = succeeded.reduce((s, r) => s + r.featureCount, 0);

  console.log("");
  console.log("─".repeat(60));
  console.log("Done.");
  console.log(`  Succeeded : ${succeeded.length} / ${results.length} tasks`);
  console.log(`  Failed    : ${failed.length} tasks`);
  console.log(`  Features  : ${totalFeatures.toLocaleString()} total`);

  if (failed.length > 0) {
    console.log("\nFailed tasks:");
    for (const r of failed) {
      const label =
        r.task.kind === "municipality"
          ? `${r.task.gemeente.naam} / ${r.task.layer}`
          : `[national] ${r.task.layer}`;
      console.log(`  ✗ ${label}: ${r.error}`);
    }
    Deno.exit(1);
  }
}

await main();
