# Data Bronnen — Vjenne Woningmarkt

## Primaire bronnen (in gebruik)

| Bron | Tabel/ID | Beschrijving | Periode |
|------|----------|-------------|---------|
| CBS StatLine | 83625NED | Verkoopprijzen bestaande koopwoningen per gemeente | 1995–2025 |
| CBS StatLine | 70072ned | Regionale kerncijfers (bev, inkomen, hh, koop%) | 2003–2024 |
| CBS StatLine | 83765NED e.v. | Kerncijfers wijken en buurten (WOZ gem.) | 2017–2025 |
| CBS StatLine | 85036NED | Gemiddelde WOZ-waarde per eigendom, regio | 2019–2025 |
| CBS StatLine | 82900NED | Woningvoorraad; eigendom, type verhuurder | 2012–2025 |
| CBS StatLine | 71446ned | Woningvoorraad naar eigendom (oud, WRG) | 2006–2012 |
| CBS StatLine | 85663NED | CAO-lonen maandlonen index (2020=100) | 1972–2025 |
| CBS StatLine | 70188ned | Gemiddeld persoonlijk inkomen, alle personen | 1990–2000 |
| CBS StatLine | 70957ned | Gemiddeld persoonlijk inkomen, pers. met inkomen | 2000–2014 |
| CBS StatLine | 83931NED | Persoonlijk inkomen mean/median | 2011–2024 |
| CBS StatLine | 70936ned | CPI jaarmutatie | 1963–2025 |
| CBS StatLine | 81734NED | Verhuizingen tussen gemeenten | 2011–2024 |
| CBS StatLine | 37230ned | Bevolkingsontwikkeling per regio per maand | 2002–2025 |
| BIS/FRED | QNLN628BIS | Residential Property Price Index NL (2010=100) | 1970–2024 |
| PDOK/BAG | Basisregistratie Adressen en Gebouwen | Gebouwen, bouwjaar, oppervlakte, gebruiksdoel | actueel |
| Kadaster | Verkoopprijzen | Transactiedata (via CBS bewerking) | 1995–2025 |
| Rijksoverheid | Staatscourant | Wettelijk minimumloon bedragen | 2019–2026 |

## CBS OData API endpoints

```
# Catalogus doorzoeken
https://opendata.cbs.nl/ODataCatalog/Tables?$filter=substringof('ZOEKTERM',Title)

# Data ophalen (OData3)
https://opendata.cbs.nl/ODataApi/odata/{TABEL_ID}/TypedDataSet?$filter=...

# Data ophalen (OData4)
https://odata4.cbs.nl/CBS/{TABEL_ID}/Observations?$filter=...
```

## Aanvullende open data portalen (Nederland)

Via [OSINT-Tools-Netherlands](https://github.com/paulpogoda/OSINT-Tools-Netherlands):

### Overheidsdata
- **data.overheid.nl** — Centraal open data register Rijksoverheid
- **CBS Open Data** — https://www.cbs.nl/en-gb/our-services/open-data
- **CBS StatLine** — https://opendata.cbs.nl/statline/portal.html

### Vastgoed & Kaarten
- **BAG Viewer** — https://bagviewer.kadaster.nl/lvbag/bag-viewer/ — Adressen + gebouwen (bouwjaar, opp, status)
- **PDOK Viewer** — https://www.pdok.nl/viewer/ — Meerdere geo-datasets (hoogte, landgebruik, etc.)
- **Funda** — https://www.funda.nl — Grootste vastgoedplatform (actuele vraag-/verkoopprijzen)
- **Topotijdreis** — https://www.topotijdreis.nl/ — Historische kaarten Kadaster 1815–2007
- **DINO Loket** — https://www.dinoloket.nl/ — Bodemsamenstelling, grondwater, draagkracht

### Bedrijven & Registers
- **KVK** — https://www.kvk.nl/ — Handelsregister (uittreksel, betaald)
- **OpenKVK** — https://openkvk.nl/ — Gratis alternatief bedrijfsgegevens
- **BIG Register** — https://www.bigregister.nl/ — Beroepsregistratie zorgprofessionals

### Juridisch & Financieel
- **Rechtspraak** — https://www.rechtspraak.nl/ — Gepubliceerde rechterlijke uitspraken
- **Euronext Amsterdam** — https://live.euronext.com/en/markets/amsterdam/equities/list
- **TenderNed** — https://www.tenderned.nl/ — Overheidsopdrachten

### Historisch
- **Delpher** — https://www.delpher.nl/ — Krantarchief 1618–1995 (doorzoekbaar)
- **WUR RAF luchtfoto's** — https://library.wur.nl/WebQuery/geoportal/raf — WOII luchtfoto's

### Verkeer & Voertuigen
- **RDW** — https://ovi.rdw.nl/ — Kentekencheck
- **Rijkswaterstaat** — https://www.rwsverkeersinfo.nl/ — Live verkeersinformatie
- **Nationaal Wegenbestand** — https://www.nationaalwegenbestand.nl/ — Compleet wegenbestand

### Domeinregistratie
- **SIDN WHOIS** — https://www.sidn.nl/en/whois — .nl domein lookup
