# 🧬 AI + AlphaFold Alcoholism Research Platform

An interactive web-based research dashboard for exploring AI-driven approaches to Alcohol Use Disorder (AUD). This platform brings together biological targets, 3D protein visualization, genomic variant data, and a structured research roadmap — all in one place.

> **Note**: This is a research visualization and exploration tool. It does not run bioinformatics pipelines or perform molecular simulations directly.

---

## 🎯 Mission

Alcohol Use Disorder is a complex condition involving genetics, neurobiology, environment, and behavior. This platform aims to:

- Identify and visualize **biological targets** involved in addiction
- Explore **3D protein structures** of addiction-related proteins via AlphaFold
- Look up **genetic variants** associated with alcoholism from the GWAS Catalog
- Present a structured **research roadmap** from genome analysis to personalized therapy
- Catalog the **tools, datasets, and architecture** needed for AI-driven addiction research

---

## ✨ Features

### 🔬 Live API Integrations

| Feature | API Source | What It Does |
|---------|-----------|--------------|
| **3D Protein Viewer** | [AlphaFold DB](https://alphafold.ebi.ac.uk/) + [3Dmol.js](https://3dmol.csb.pitt.edu/) | Interactive 3D rendering of addiction-related protein structures |
| **GWAS Variant Lookup** | [GWAS Catalog REST API v2](https://www.ebi.ac.uk/gwas/) | Search genetic variants by gene name (ADH1B, DRD2, etc.) |
| **Dataset Links** | Multiple public databases | Direct access to dbGaP, PDB, NIAAA, 1000 Genomes, and more |

### 🧪 Biological Targets

Explore five key systems involved in Alcohol Use Disorder:

| System | Genes | Role |
|--------|-------|------|
| Dopamine Reward | DRD2, DRD4, DAT1 (SLC6A3) | Reward sensitivity & addiction vulnerability |
| GABA Receptors | GABRA2, GABRB1 | Alcohol's effect on inhibitory signaling |
| Glutamate / NMDA | GRIN2B | Craving and withdrawal |
| Alcohol Metabolism | ADH1B, ALDH2 | How alcohol is processed |
| Stress & Impulse Control | OPRM1, COMT, MAOA | Cravings and behavioral control |

### 🗺️ Mapped Proteins (UniProt IDs)

| Gene | Protein | UniProt ID |
|------|---------|------------|
| DRD2 | D2 Dopamine Receptor | P14416 |
| DRD4 | D4 Dopamine Receptor | P21917 |
| GABRA2 | GABA-A Receptor Alpha-2 | P47869 |
| GRIN2B | NMDA Receptor 2B | Q13224 |
| ADH1B | Alcohol Dehydrogenase 1B | P00325 |
| ALDH2 | Aldehyde Dehydrogenase | P05091 |
| OPRM1 | Mu-Opioid Receptor | P35372 |

---

## 🛠️ Tech Stack

### Application

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (glassmorphism, dark mode, responsive) |
| Logic | Vanilla JavaScript (ES6 modules) |
| 3D Viewer | [3Dmol.js](https://3dmol.csb.pitt.edu/) via CDN |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) + [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts |

### External APIs (client-side, no backend)

| API | Endpoint | Purpose |
|-----|----------|---------|
| AlphaFold DB | `https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}` | Fetch predicted protein structures |
| GWAS Catalog v2 | `https://www.ebi.ac.uk/gwas/rest/api/v2/associations` | Query genetic variant associations |

### Recommended Research Stack (referenced in the platform)

| Category | Tools |
|----------|-------|
| Protein Prediction | AlphaFold, RoseTTAFold, ESMFold |
| Molecular Docking | AutoDock Vina, PyMOL, ChimeraX |
| Genomics & Variants | PLINK, GATK, bcftools |
| AI Frameworks | PyTorch, TensorFlow, DeepChem |
| Molecular Dynamics | GROMACS, OpenMM |

---

## 📁 Project Structure

```
Alcoholism/
├── README.md                          ← You are here
├── AI_Alcoholism_Research_Roadmap.md  ← Original research roadmap (source of truth)
├── AI_Alcoholism_Research_Roadmap.pdf ← PDF version of the roadmap
│
├── index.html                         ← Main entry point
│
├── css/
│   └── styles.css                     ← Design system, layout, components, animations
│
├── js/
│   ├── app.js                         ← Core: navigation, scroll animations, interactions
│   ├── data.js                        ← Static data: targets, proteins, tools, datasets
│   ├── protein-viewer.js              ← 3Dmol.js integration & AlphaFold API calls
│   └── gwas-lookup.js                 ← GWAS Catalog API queries & results display
│
└── assets/
    └── hero-bg.png                    ← Generated hero background image
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server, no Node.js, no build tools required

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Alcoholism.git
   cd Alcoholism
   ```

2. Open `index.html` in your browser:
   ```bash
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

3. That's it. No build step needed.

> **Tip**: For the best experience with API calls, use a local development server to avoid CORS issues:
> ```bash
> # Python
> python -m http.server 8000
>
> # Node.js (if available)
> npx serve .
> ```

---

## 📋 Development Phases

### Phase 1 — Foundation `[Current]`

- [x] Project documentation (README, roadmap files)
- [ ] Project scaffolding (file structure, placeholders)
- [ ] Design system (CSS variables, typography, color palette)
- [ ] Hero section with animated background
- [ ] Sticky navigation bar
- [ ] Biological targets section (interactive cards)
- [ ] Software stack grid
- [ ] Public datasets section
- [ ] Responsive layout (mobile, tablet, desktop)

### Phase 2 — Live Integrations

- [ ] 3Dmol.js protein viewer integration
- [ ] AlphaFold API: fetch and display protein structures
- [ ] Protein style controls (cartoon, stick, surface)
- [ ] GWAS Catalog API: gene variant lookup
- [ ] Results table with sortable columns
- [ ] Loading states, error handling, empty states

### Phase 3 — Research Workflows & Polish

- [ ] AlphaFold workflow pipeline (animated visualization)
- [ ] Personalized therapy pipeline flowchart
- [ ] System architecture diagram (interactive layers)
- [ ] Development phases timeline
- [ ] Reality check section
- [ ] Dark/light mode toggle
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 🏗️ System Architecture (Roadmap Vision)

The research roadmap envisions a four-layer system:

```
┌─────────────────────────────────────────────────────────┐
│  Patient Data Layer                                     │
│  Genome VCF · Wearables · Blood Markers · Behavioral   │
├─────────────────────────────────────────────────────────┤
│  AI Analysis Layer                                      │
│  Variant Interpretation · Risk Scoring · Modeling       │
├─────────────────────────────────────────────────────────┤
│  Bioinformatics Layer                                   │
│  AlphaFold · Docking · Pathway Analysis · Dynamics      │
├─────────────────────────────────────────────────────────┤
│  Clinical Layer                                         │
│  Personalized Interventions · Medication · Monitoring   │
└─────────────────────────────────────────────────────────┘
```

> This platform currently serves as the **visualization and exploration layer**. Future phases would add backend compute for the AI Analysis and Bioinformatics layers.

---

## 📊 Public Datasets & Resources

| Resource | URL | Category |
|----------|-----|----------|
| dbGaP | https://www.ncbi.nlm.nih.gov/gap/ | Genomics |
| GWAS Catalog | https://www.ebi.ac.uk/gwas/ | Genomics |
| 1000 Genomes Project | https://www.internationalgenome.org/ | Genomics |
| AlphaFold Protein Structure DB | https://alphafold.ebi.ac.uk/ | Protein Structures |
| Protein Data Bank (PDB) | https://www.rcsb.org/ | Protein Structures |
| NIAAA | https://www.niaaa.nih.gov/ | Addiction Research |

---

## ⚠️ Reality Check

AI can accelerate:
- Target discovery
- Drug development
- Precision medicine
- Relapse prediction
- Recovery optimization

However, alcoholism does not currently have a single cure because it involves complex neurological systems, environmental influences, behavioral reinforcement, and long-term adaptive brain chemistry. **Human trials and clinical validation remain essential.**

---

## 📄 License

This project is for research and educational purposes.

---

## 🙏 Acknowledgments

- [AlphaFold](https://alphafold.ebi.ac.uk/) by DeepMind & EMBL-EBI
- [3Dmol.js](https://3dmol.csb.pitt.edu/) by the University of Pittsburgh
- [GWAS Catalog](https://www.ebi.ac.uk/gwas/) by EMBL-EBI & NHGRI
- [RCSB Protein Data Bank](https://www.rcsb.org/)
- [NIAAA](https://www.niaaa.nih.gov/) — National Institute on Alcohol Abuse and Alcoholism
