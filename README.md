# Alcoholism Genomics Research Tool

A personal research dashboard I built to explore the genetic side of Alcohol Use Disorder. Combines some bioinformatics tools I had lying around (PLINK, GATK) with a few public APIs into something I can actually run locally without spinning up cloud infrastructure every time.

Started this because I was reading about ADH1B and ALDH2 variants and wanted a way to quickly visualize association data without fighting R or dealing with Jupyter kernel crashes. Built the frontend first as a quick HTML page, then it kind of grew from there.

---

## What it does

### Local Genomics Studio
The main thing. Runs actual PLINK and GATK pipelines from the browser via a small Python backend (`server.py`).

- Checks that your local tools (plink.exe, GATK jar, Java) are actually working before you waste time clicking buttons
- Runs PLINK association tests (allele frequency, chi-square case/control, Hardy-Weinberg) on `.ped`/`.map` datasets
- Runs GATK `CountVariants` on VCF files to sanity-check genotype data
- Streams raw stdout/stderr into a terminal console in the page
- Renders SVG Manhattan plots and MAF bar charts inline — capped at 100 SNPs so the browser doesn't die on large files like wgas1

### Protein Viewer
Pulls 3D structure predictions from AlphaFold DB and renders them with 3Dmol.js. Useful for visualising ADH1B, DRD2, OPRM1 etc. to get a rough feel for binding site geometry before going anywhere near wet lab.

### GWAS Variant Lookup
Queries the GWAS Catalog REST API for published associations by gene symbol. Good for quick literature cross-referencing without leaving the tab.

---

## Project layout

```
Alcoholism/
├── index.html              main page
├── server.py               tiny Python HTTP server + API endpoints
├── startup.bat             launches the server and opens the browser
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js              nav, particles, scroll animations
│   ├── data.js             static gene/target data
│   ├── protein-viewer.js   3Dmol + AlphaFold API
│   ├── gwas-lookup.js      GWAS Catalog v2 client
│   ├── genomics-studio.js  main orchestrator (wires up buttons/events)
│   ├── genomics-api.js     fetch wrappers for the backend
│   ├── genomics-ui.js      DOM helpers, console, badges
│   └── genomics-viz.js     parsers + SVG chart renderers
│
└── tools/
    ├── plink.exe                               PLINK v1.9
    ├── gatk/
    │   └── gatk-package-4.6.2.0-local.jar
    ├── generate_data.py                        generates simulated .ped/.map + VCF
    ├── download_hapmap.py                      grabs the real 83k-SNP tutorial dataset
    ├── alcoholism_study.ped/.map               simulated (100 subjects, 50 cases/controls)
    └── sample_genotypes.vcf                    6-variant diagnostic VCF
```

---

## Getting started

**Requirements:**
- Python 3.10+
- Java 17+ (needed for GATK — Java 11 won't work, learned this the hard way)

**Run it:**
```bash
# just double-click startup.bat, or:
python server.py
# then open http://localhost:8000
```

**Get some data to work with:**

Option A — simulated data (quickest): go to the Genomics Studio section in the browser and click *Generate Simulated Datasets*. This creates a 100-sample alcoholism study with biased genotype frequencies for ADH1B, ALDH2, DRD2, GABRA2, OPRM1, and COMT so the association tests actually produce interesting p-values.

Option B — real data: run `python tools/download_hapmap.py` to pull down the official PLINK tutorial dataset (83,534 SNPs, ~23MB). Takes a minute depending on your connection. Once it's there it'll show up in the dropdown automatically.

---

## Notes / caveats

- This is a research toy, not a clinical tool. AUD is polygenic and messy — there's no single risk SNP that explains anything meaningful on its own.
- GATK on a 6-variant VCF is obviously overkill. The real use case is validating that the Java + JAR setup is working before pointing it at actual sequencing data.
- The Manhattan plot Y-axis is -log10(p). The red dashed line is p=0.05, not genome-wide significance (p=5e-8). With 10 SNPs you're nowhere near needing Bonferroni correction but it's good to be clear about that.
- On large datasets (wgas1), results are sliced to the top 100 rows before rendering. Haven't profiled exactly where the browser starts struggling but 80k DOM nodes is obviously too many.

---

## License

Research / educational use. Not for clinical application.
