# Vriezenveen Woningmarkt — Data Journalism Project

An interactive data journalism visualization of housing, demographics, and affordability for Vriezenveen / Twenterand (Overijssel, NL). Published as a static site on Cloudflare Pages.

## Live site

**https://vjenne.pages.dev** (Cloudflare Pages, auto-deployed from `main`)

- `/` — scrollytelling article with 17 charts (home page)
- `/kaart` → redirects to `/map.html` — interactive MapLibre map
- `/analyse` → redirects to `/index.html`

## What's in it

### `index.html` — Article (home page)
15 sections covering:
- Regional price history 1970–2025 (CBS + BIS index pre-1995)
- Neighbour municipality price comparison (Almelo, Wierden, Hellendoorn, Tubbergen)
- Housing tenure breakdown (koop / corporatiehuur / vrije huur)
- Household composition trends
- Affordability: income vs. mortgage capacity vs. prices
- 4-persona stories (starter, gezin, gepensioneerd, arbeidsmigrant)
- New build plans and 8-party political positions (GR2026)
- Migration flows (10 arc routes, origin fixed to Vriezenveen)
- WOZ-value development
- Income distribution by quintile
- Interactive scenario calculator (user-adjustable growth rates)
- Source tooltips on all key claims (hover for CBS table + year)

### `map.html` — Interactive map
- 6,683 BAG building dots from PDOK/Kadaster
- Color modes: betaalbaarheid, bouwjaar, koop/huur, WOZ, inkomen
- Persona income pills (minimumloon → dubbelmodaal) with CAO-indexed historical scaling (1972–2025)
- Year slider 1960–2025 with animated playback
- Building detail cards with OSM thumbnail
- Side panels: price chart (1970–2025), income chart, affordability gap, migration bars

## Data sources

| Dataset | Source | Table/ID | Period | File |
|---|---|---|---|---|
| House prices | CBS Statline | 83625NED | 1995–2025 | `data/cbs/verkoopprijzen_*.json` |
| House price index (pre-1995) | BIS/FRED | QNLN628BIS | 1970–1994 | `data/cbs/bis_huizenprijsindex_1970_2024.json` |
| Kerncijfers (bev, inkomen, hh) | CBS Statline | 70072ned | 2003–2024 | `data/cbs/kerncijfers_twenterand*.json` |
| WOZ-waarde | CBS Statline | 85036NED + kwb | 2003–2025 | `data/cbs/woz_twenterand_2003_2025.json` |
| Woningvoorraad eigendom | CBS Statline | 82900NED + 71446ned | 2006–2025 | `data/cbs/woningbezit_twenterand_2006_2025.json` |
| CAO loonindex | CBS Statline | 85663NED | 1972–2025 | `data/cbs/cao_loonindex_1972_2025.json` |
| Persoonlijk inkomen | CBS Statline | 70188ned, 70957ned, 83931NED | 1990–2024 | `data/cbs/inkomen_persoonlijk_1990_2024.json` |
| CPI inflatie | CBS Statline | 70936ned | 1963–2025 | `data/cbs/cpi_1963_2025.json` |
| Bevolkingsontwikkeling | CBS Statline | 37230ned | 2002–2025 | `data/cbs/bevolking_twenterand_2002_2025.json` |
| Verhuizingen | CBS Statline | 81734NED | 2011–2024 | `data/cbs/verhuizingen_twenterand.json` |
| Minimumloon | Rijksoverheid | Staatscourant | 2019–2026 | `data/cbs/minimumloon_2019_2026.json` |
| BAG gebouwen | PDOK / Kadaster | BAG WFS | actueel | `data/kadaster/adressen_compact.js` |
| Bouwvergunningen | CBS Statline | — | — | `data/cbs/bouwvergunningen_twenterand.json` |
| Nieuwscorpus | RTV Oost, Tubantia | — | 2021–2026 | `data/news/` (30 articles) |

All data is real CBS/Kadaster data — no fabricated or projected values. The scenario calculator in section 8 uses CBS 2024 start values with user-adjustable growth rates.

Full source documentation: [`data/cbs/BRONNEN.md`](data/cbs/BRONNEN.md)

## Special: Dutch OSINT data sources

Comprehensive list of Dutch open data tools and portals for further research:
**https://github.com/paulpogoda/OSINT-Tools-Netherlands**

Key resources for housing/property research:
- **[BAG Viewer](https://bagviewer.kadaster.nl/lvbag/bag-viewer/)** — Kadaster addresses & buildings register
- **[PDOK Viewer](https://www.pdok.nl/viewer/)** — Multi-dataset geo platform (elevation, land use, etc.)
- **[CBS Open Data](https://opendata.cbs.nl/statline/portal.html)** — All StatLine tables via OData API
- **[data.overheid.nl](https://data.overheid.nl/en)** — Central government open data register
- **[Topotijdreis](https://www.topotijdreis.nl/)** — Historical Kadaster maps 1815–2007
- **[DINO Loket](https://www.dinoloket.nl/)** — Soil composition, groundwater, bearing capacity
- **[Funda](https://www.funda.nl)** — Largest real estate platform (current asking/sold prices)
- **[Delpher](https://www.delpher.nl/)** — Searchable newspaper archive 1618–1995
- **[Rechtspraak](https://www.rechtspraak.nl/)** — Published court decisions
- **[OpenKVK](https://openkvk.nl/)** — Free company registration data

## Tech stack

- **Vanilla HTML/CSS/JS** — no build tooling, no framework, no npm install needed
- **[MapLibre GL JS](https://maplibre.org/)** — interactive map (CDN)
- **[Chart.js](https://www.chartjs.org/)** — all charts (CDN)
- **Google Fonts** — Playfair Display, JetBrains Mono (CDN)
- **Cloudflare Pages** — static hosting, no build step

## Design

NYT dark editorial aesthetic:
- Background `#08080e`
- Playfair Display serif for headings
- JetBrains Mono for data labels and numbers
- Accent `#e8c96d` (gold)

## Run locally

```bash
npm run dev
# or
python3 -m http.server 8765
```

Then open `http://localhost:8765`

## Deploy

Connected to Cloudflare Pages (`vjenne` project). Every push to `main` triggers a deploy.

- **Build command:** none (static files)
- **Output directory:** `.` (root)
- **Config:** `wrangler.toml`, `_headers`, `_redirects`

Manual deploy:
```bash
npx wrangler pages deploy . --project-name vjenne
```

## Repository

`github.com/leanderrj/vjenne` — branch `main`
