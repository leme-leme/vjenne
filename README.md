# Vriezenveen Woningmarkt — Datajournalistiek

Interactieve datavisualisatie over de woningmarkt, demografie en betaalbaarheid in Vriezenveen / Twenterand (Overijssel). Gepubliceerd als statische site op Cloudflare Pages.

## Live site

**https://vjenne.pages.dev** (Cloudflare Pages, automatisch gedeployed vanuit `main`)

- `/` — scrollytelling artikel met 17 grafieken (homepagina)
- `/kaart` → verwijst naar `/map.html` — interactieve MapLibre kaart
- `/analyse` → verwijst naar `/index.html`

## Inhoud

### `index.html` — Artikel (homepagina)
15 secties over:
- Regionale prijsontwikkeling 1970–2025 (CBS + BIS-index vóór 1995)
- Prijsvergelijking buurgemeenten (Almelo, Wierden, Hellendoorn, Tubbergen)
- Woningbezit: koop / corporatiehuur / vrije huur
- Huishoudenssamenstelling en vergrijzing
- Betaalbaarheid: inkomen vs. hypotheekcapaciteit vs. woningprijzen
- 4 persona-portretten (starter, gezin, gepensioneerde, arbeidsmigrant)
- Bouwplannen en standpunten 8 partijen (GR2026)
- Migratiestromen (10 booglijnen, oorsprong Vriezenveen)
- WOZ-waardeontwikkeling
- Inkomensverdeling per type huishouden
- Interactieve scenario-calculator (instelbare groeipercentages)
- Brontooltips op alle kernfeiten (hover voor CBS-tabel + jaar)

### `map.html` — Interactieve kaart
- 6.683 BAG-gebouwpunten van PDOK/Kadaster
- Kleurmodi: betaalbaarheid, bouwjaar, koop/huur, WOZ, inkomen
- Inkomens-pills (minimumloon → dubbelmodaal) met CAO-geïndexeerde historische schaling (1972–2025)
- Jaarschuifregelaar 1960–2025 met geanimeerde afspeelmodus
- Gebouwkaarten met OSM-thumbnail
- Zijpanelen: prijsgrafiek (1970–2025), inkomensgrafiek, betaalbaarheidskloof, migratiebalk

## Databronnen

| Dataset | Bron | Tabel/ID | Periode | Bestand |
|---|---|---|---|---|
| Verkoopprijzen | CBS Statline | 83625NED | 1995–2025 | `data/cbs/verkoopprijzen_*.json` |
| Huizenprijsindex (vóór 1995) | BIS/FRED | QNLN628BIS | 1970–1994 | `data/cbs/bis_huizenprijsindex_1970_2024.json` |
| Kerncijfers (bev, inkomen, hh) | CBS Statline | 70072ned | 2003–2024 | `data/cbs/kerncijfers_twenterand*.json` |
| WOZ-waarde | CBS Statline | 85036NED + kwb | 2003–2025 | `data/cbs/woz_twenterand_2003_2025.json` |
| Woningvoorraad eigendom | CBS Statline | 82900NED + 71446ned | 2006–2025 | `data/cbs/woningbezit_twenterand_2006_2025.json` |
| CAO-loonindex | CBS Statline | 85663NED | 1972–2025 | `data/cbs/cao_loonindex_1972_2025.json` |
| Persoonlijk inkomen | CBS Statline | 70188ned, 70957ned, 83931NED | 1990–2024 | `data/cbs/inkomen_persoonlijk_1990_2024.json` |
| CPI inflatie | CBS Statline | 70936ned | 1963–2025 | `data/cbs/cpi_1963_2025.json` |
| Bevolkingsontwikkeling | CBS Statline | 37230ned | 2002–2025 | `data/cbs/bevolking_twenterand_2002_2025.json` |
| Verhuizingen | CBS Statline | 81734NED | 2011–2024 | `data/cbs/verhuizingen_twenterand.json` |
| Minimumloon | Rijksoverheid | Staatscourant | 2019–2026 | `data/cbs/minimumloon_2019_2026.json` |
| BAG gebouwen | PDOK / Kadaster | BAG WFS | actueel | `data/kadaster/adressen_compact.js` |
| Bouwvergunningen | CBS Statline | — | — | `data/cbs/bouwvergunningen_twenterand.json` |
| Nieuwscorpus | RTV Oost, Tubantia | — | 2021–2026 | `data/news/` (30 artikelen) |

Alle data is echte CBS/Kadaster-data — geen verzonnen of geprojecteerde waarden. De scenario-calculator in sectie 8 gebruikt CBS-startwaarden 2024 met door de lezer instelbare groeipercentages.

Volledige brondocumentatie: [`data/cbs/BRONNEN.md`](data/cbs/BRONNEN.md)

## Nederlandse OSINT-databronnen

Uitgebreide lijst van Nederlandse open data tools en portalen voor verder onderzoek:
**https://github.com/paulpogoda/OSINT-Tools-Netherlands**

Belangrijkste bronnen voor woning-/vastgoedonderzoek:
- **[BAG Viewer](https://bagviewer.kadaster.nl/lvbag/bag-viewer/)** — Kadaster adressen- en gebouwenregister
- **[PDOK Viewer](https://www.pdok.nl/viewer/)** — Multi-dataset geoplatform (hoogte, landgebruik, etc.)
- **[CBS Open Data](https://opendata.cbs.nl/statline/portal.html)** — Alle StatLine-tabellen via OData API
- **[data.overheid.nl](https://data.overheid.nl/en)** — Centraal open data register Rijksoverheid
- **[Topotijdreis](https://www.topotijdreis.nl/)** — Historische Kadasterkaarten 1815–2007
- **[DINO Loket](https://www.dinoloket.nl/)** — Bodemsamenstelling, grondwater, draagkracht
- **[Funda](https://www.funda.nl)** — Grootste vastgoedplatform (actuele vraag-/verkoopprijzen)
- **[Delpher](https://www.delpher.nl/)** — Doorzoekbaar krantenarchief 1618–1995
- **[Rechtspraak](https://www.rechtspraak.nl/)** — Gepubliceerde rechterlijke uitspraken
- **[OpenKVK](https://openkvk.nl/)** — Gratis bedrijfsregistratiedata

## Technische stack

- **Vanilla HTML/CSS/JS** — geen build tooling, geen framework, geen npm install nodig
- **[MapLibre GL JS](https://maplibre.org/)** — interactieve kaart (CDN)
- **[Chart.js](https://www.chartjs.org/)** — alle grafieken (CDN)
- **Google Fonts** — Playfair Display, JetBrains Mono (CDN)
- **Cloudflare Pages** — statische hosting, geen build-stap

## Ontwerp

NYT donker redactioneel ontwerp:
- Achtergrond `#08080e`
- Playfair Display serif voor koppen
- JetBrains Mono voor datalabels en cijfers
- Accent `#e8c96d` (goud)

## Lokaal draaien

```bash
npm run dev
# of
python3 -m http.server 8765
```

Open vervolgens `http://localhost:8765`

## Deployen

Gekoppeld aan Cloudflare Pages (`vjenne` project). Elke push naar `main` triggert een deploy.

- **Build command:** geen (statische bestanden)
- **Output directory:** `.` (root)
- **Config:** `wrangler.toml`, `_headers`, `_redirects`

Handmatig deployen:
```bash
npx wrangler pages deploy . --project-name vjenne
```

## Repository

`github.com/leme-leme/vjenne` — branch `main`
