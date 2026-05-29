/**
 * data.js — Static data constants for the Alcoholism Research Platform
 * Contains all biological targets, protein mappings, tool descriptions,
 * dataset URLs, and phase definitions.
 */

// ─── Biological Targets ─────────────────────────────────────────────
export const BIOLOGICAL_TARGETS = [
  {
    id: 'dopamine',
    title: 'Dopamine Reward System',
    icon: '⚡',
    color: 'var(--accent-cyan)',
    description: 'Affects reward sensitivity and addiction vulnerability. The dopamine system is central to how the brain processes pleasure and motivation.',
    genes: [
      { name: 'DRD2', fullName: 'D2 Dopamine Receptor', uniprotId: 'P14416', pdbId: '6CM4', description: 'Mediates reward signaling; reduced expression linked to addiction risk.' },
      { name: 'DRD4', fullName: 'D4 Dopamine Receptor', uniprotId: 'P21917', pdbId: null, description: 'Associated with novelty-seeking behavior and impulsivity.' },
      { name: 'DAT1', fullName: 'Dopamine Transporter (SLC6A3)', uniprotId: 'Q01959', pdbId: null, description: 'Regulates dopamine reuptake; variants affect dopamine availability.' }
    ]
  },
  {
    id: 'gaba',
    title: 'GABA Receptors',
    icon: '🛡️',
    color: 'var(--accent-teal)',
    description: 'Alcohol strongly affects GABA signaling. GABA is the brain\'s primary inhibitory neurotransmitter, and alcohol enhances its effects.',
    genes: [
      { name: 'GABRA2', fullName: 'GABA-A Receptor Alpha-2', uniprotId: 'P47869', pdbId: '6X40', description: 'Strongly associated with alcohol dependence in genetic studies.' },
      { name: 'GABRB1', fullName: 'GABA-A Receptor Beta-1', uniprotId: 'P18505', pdbId: null, description: 'Contributes to sedative and anxiolytic effects of alcohol.' }
    ]
  },
  {
    id: 'glutamate',
    title: 'Glutamate / NMDA System',
    icon: '🔥',
    color: 'var(--accent-amber)',
    description: 'Important for craving and withdrawal. Glutamate is the brain\'s primary excitatory neurotransmitter, counterbalancing GABA.',
    genes: [
      { name: 'GRIN2B', fullName: 'NMDA Receptor Subunit 2B', uniprotId: 'Q13224', pdbId: null, description: 'Involved in alcohol withdrawal severity and craving intensity.' }
    ]
  },
  {
    id: 'metabolism',
    title: 'Alcohol Metabolism',
    icon: '🧪',
    color: 'var(--accent-violet)',
    description: 'Determines how alcohol is processed in the body. Variants in these enzymes significantly affect alcohol tolerance and risk.',
    genes: [
      { name: 'ADH1B', fullName: 'Alcohol Dehydrogenase 1B', uniprotId: 'P00325', pdbId: '1HTB', description: 'Converts ethanol to acetaldehyde; fast-acting variant is protective.' },
      { name: 'ALDH2', fullName: 'Aldehyde Dehydrogenase 2', uniprotId: 'P05091', pdbId: null, description: 'Clears toxic acetaldehyde; deficiency causes alcohol flush reaction.' }
    ]
  },
  {
    id: 'stress',
    title: 'Stress & Impulse Control',
    icon: '🧠',
    color: 'var(--accent-rose)',
    description: 'Linked to cravings and behavioral control. These genes influence how the brain handles stress, pain, and impulse regulation.',
    genes: [
      { name: 'OPRM1', fullName: 'Mu-Opioid Receptor', uniprotId: 'P35372', pdbId: null, description: 'Target of naltrexone; mediates alcohol\'s pleasurable effects.' },
      { name: 'COMT', fullName: 'Catechol-O-Methyltransferase', uniprotId: 'P21964', pdbId: null, description: 'Degrades dopamine; variants affect stress response and impulsivity.' },
      { name: 'MAOA', fullName: 'Monoamine Oxidase A', uniprotId: 'P21397', pdbId: null, description: 'Metabolizes serotonin and dopamine; linked to aggression and risk-taking.' }
    ]
  }
];

// ─── Protein Viewer Presets ─────────────────────────────────────────
export const PROTEIN_PRESETS = [
  { gene: 'DRD2', uniprotId: 'P14416', label: 'D2 Dopamine Receptor' },
  { gene: 'DRD4', uniprotId: 'P21917', label: 'D4 Dopamine Receptor' },
  { gene: 'GABRA2', uniprotId: 'P47869', label: 'GABA-A Receptor α2' },
  { gene: 'GRIN2B', uniprotId: 'Q13224', label: 'NMDA Receptor 2B' },
  { gene: 'ADH1B', uniprotId: 'P00325', label: 'Alcohol Dehydrogenase 1B' },
  { gene: 'ALDH2', uniprotId: 'P05091', label: 'Aldehyde Dehydrogenase' },
  { gene: 'OPRM1', uniprotId: 'P35372', label: 'Mu-Opioid Receptor' }
];

// ─── AlphaFold Workflow Steps ───────────────────────────────────────
export const WORKFLOW_STEPS = [
  { id: 'genome', icon: '🧬', title: 'Genome Variant', description: 'Identify genetic variants from patient genome data (VCF files, SNP arrays).' },
  { id: 'mutation', icon: '🔀', title: 'Protein Mutation', description: 'Map genomic variants to amino acid changes in target proteins.' },
  { id: 'alphafold', icon: '🏗️', title: 'AlphaFold Prediction', description: 'Predict 3D protein structure from amino acid sequence using AlphaFold.' },
  { id: 'binding', icon: '🎯', title: 'Binding Site Analysis', description: 'Identify and characterize binding pockets on the predicted structure.' },
  { id: 'docking', icon: '🔬', title: 'Drug Docking', description: 'Simulate how drug molecules interact with the protein\'s binding sites.' },
  { id: 'therapy', icon: '💊', title: 'Candidate Therapy', description: 'Rank and select the most promising drug candidates for further study.' }
];

// ─── Software Stack ─────────────────────────────────────────────────
export const SOFTWARE_STACK = [
  {
    category: 'Protein Structure Prediction',
    icon: '🧬',
    color: 'var(--accent-cyan)',
    tools: [
      { name: 'AlphaFold', description: 'DeepMind\'s protein structure prediction system. Gold standard for accuracy.' },
      { name: 'RoseTTAFold', description: 'Three-track neural network for protein structure prediction by Baker Lab.' },
      { name: 'ESMFold', description: 'Meta\'s fast single-sequence structure prediction using language models.' }
    ]
  },
  {
    category: 'Molecular Docking',
    icon: '🔬',
    color: 'var(--accent-teal)',
    tools: [
      { name: 'AutoDock Vina', description: 'Open-source molecular docking program for drug discovery.' },
      { name: 'PyMOL', description: 'Molecular visualization system for rendering and analyzing 3D structures.' },
      { name: 'ChimeraX', description: 'Next-generation molecular visualization from UCSF.' }
    ]
  },
  {
    category: 'Genomics & Variant Analysis',
    icon: '🧪',
    color: 'var(--accent-amber)',
    tools: [
      { name: 'PLINK', description: 'Whole-genome association analysis toolset for large datasets.' },
      { name: 'GATK', description: 'Genome Analysis Toolkit for variant discovery and genotyping.' },
      { name: 'bcftools', description: 'Utilities for variant calling and manipulating VCF/BCF files.' }
    ]
  },
  {
    category: 'AI Frameworks',
    icon: '🤖',
    color: 'var(--accent-violet)',
    tools: [
      { name: 'PyTorch', description: 'Deep learning framework favored in research for flexibility.' },
      { name: 'TensorFlow', description: 'End-to-end ML platform for production-ready models.' },
      { name: 'DeepChem', description: 'Democratizing deep learning for drug discovery and chemistry.' }
    ]
  },
  {
    category: 'Molecular Dynamics',
    icon: '⚛️',
    color: 'var(--accent-rose)',
    tools: [
      { name: 'GROMACS', description: 'High-performance molecular dynamics simulation package.' },
      { name: 'OpenMM', description: 'GPU-accelerated molecular simulation toolkit with Python API.' }
    ]
  }
];

// ─── Public Datasets ────────────────────────────────────────────────
export const PUBLIC_DATASETS = [
  {
    category: 'Genomics',
    datasets: [
      { name: 'dbGaP', url: 'https://www.ncbi.nlm.nih.gov/gap/', description: 'Database of Genotypes and Phenotypes. Archive of genotype-phenotype studies.' },
      { name: 'GWAS Catalog', url: 'https://www.ebi.ac.uk/gwas/', description: 'Curated collection of published genome-wide association studies.' },
      { name: '1000 Genomes Project', url: 'https://www.internationalgenome.org/', description: 'Deep catalog of human genetic variation across populations.' }
    ]
  },
  {
    category: 'Protein Structures',
    datasets: [
      { name: 'AlphaFold DB', url: 'https://alphafold.ebi.ac.uk/', description: 'Over 200M predicted protein structures from DeepMind & EMBL-EBI.' },
      { name: 'Protein Data Bank', url: 'https://www.rcsb.org/', description: 'Archive of experimentally determined 3D structures of biological macromolecules.' }
    ]
  },
  {
    category: 'Addiction Research',
    datasets: [
      { name: 'NIAAA', url: 'https://www.niaaa.nih.gov/', description: 'National Institute on Alcohol Abuse and Alcoholism. Leading federal agency for alcohol research.' },
      { name: 'Addiction Genetics Consortium', url: 'https://www.med.unc.edu/pgc/', description: 'Collaborative research consortium for psychiatric and addiction genetics.' }
    ]
  }
];

// ─── System Architecture Layers ─────────────────────────────────────
export const ARCHITECTURE_LAYERS = [
  {
    id: 'patient',
    title: 'Patient Data Layer',
    icon: '👤',
    color: 'var(--accent-cyan)',
    components: ['Genome VCF', 'Wearables', 'Blood Markers', 'Behavioral Data', 'Medical History']
  },
  {
    id: 'ai',
    title: 'AI Analysis Layer',
    icon: '🤖',
    color: 'var(--accent-teal)',
    components: ['Variant Interpretation', 'Risk Scoring', 'Protein Modeling', 'Relapse Prediction', 'Drug Recommendation']
  },
  {
    id: 'bioinformatics',
    title: 'Bioinformatics Layer',
    icon: '🔬',
    color: 'var(--accent-violet)',
    components: ['AlphaFold', 'Docking Engine', 'Pathway Analysis', 'Molecular Dynamics']
  },
  {
    id: 'clinical',
    title: 'Clinical Layer',
    icon: '🏥',
    color: 'var(--accent-rose)',
    components: ['Personalized Interventions', 'Medication Optimization', 'Therapy Matching', 'Longitudinal Monitoring']
  }
];

// ─── Development Phases ─────────────────────────────────────────────
export const DEVELOPMENT_PHASES = [
  {
    phase: 1,
    title: 'Foundation',
    status: 'current',
    items: [
      'Genome ingestion pipeline',
      'Addiction-risk scoring model',
      'Wearable device integration',
      'Gene interpretation tools'
    ]
  },
  {
    phase: 2,
    title: 'Bioinformatics',
    status: 'planned',
    items: [
      'AlphaFold prediction workflows',
      'Molecular docking pipelines',
      'AI drug candidate ranking'
    ]
  },
  {
    phase: 3,
    title: 'Clinical AI',
    status: 'planned',
    items: [
      'Clinical decision support system',
      'Personalized intervention engine',
      'Relapse prediction AI model'
    ]
  }
];

// ─── Therapy Pipeline Steps ─────────────────────────────────────────
export const THERAPY_PIPELINE = [
  { icon: '🧬', title: 'Patient Genome', description: 'Analyze genome to predict alcohol sensitivity and metabolic profile.' },
  { icon: '⌚', title: 'Wearable Data', description: 'Monitor real-time stress levels, heart rate, and craving patterns.' },
  { icon: '🤖', title: 'AI Analysis', description: 'Predict relapse risk using combined genomic and behavioral data.' },
  { icon: '💊', title: 'Precision Medicine', description: 'Select optimal therapy based on individual biological profile.' }
];

// ─── Navigation Items ───────────────────────────────────────────────
export const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'targets', label: 'Targets' },
  { id: 'protein-viewer', label: 'Proteins' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'gwas', label: 'GWAS' },
  { id: 'genomics-studio', label: 'Genomics Studio' },
  { id: 'stack', label: 'Stack' },
  { id: 'therapy', label: 'Therapy' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'phases', label: 'Phases' },
  { id: 'reality', label: 'Reality Check' }
];
