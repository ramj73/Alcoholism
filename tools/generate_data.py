import os
import random

# SNPs I'm modelling here are the ones with reasonable literature backing for AUD.
# Genotype probabilities are loosely based on published case/control studies — I've
# exaggerated the effect sizes a bit so the association test actually produces
# interesting p-values with only 100 samples.

# Format per entry:
#   (snp_id, chrom, pos_bp, gene, case_probs, control_probs, (ref_allele, alt_allele))

SNPS = [
    # ADH1B rs1229984 — A allele is protective (reduces alcohol metabolism rate)
    # carriers tend to get flushing/nausea and drink less
    ("rs1229984", 4, 100224143, "ADH1B",
     {("G","G"): 0.95, ("A","G"): 0.05, ("A","A"): 0.00},
     {("G","G"): 0.78, ("A","G"): 0.20, ("A","A"): 0.02},
     ("G", "A")),

    # ALDH2 rs671 — same idea, A allele causes acetaldehyde buildup
    # very common in East Asian populations, massive protective effect
    ("rs671", 12, 111803962, "ALDH2",
     {("G","G"): 0.98, ("A","G"): 0.02, ("A","A"): 0.00},
     {("G","G"): 0.82, ("A","G"): 0.16, ("A","A"): 0.02},
     ("G", "A")),

    # DRD2/ANKK1 TaqIA rs1800497 — T allele reduces D2 receptor density
    # replicated in multiple AUD GWAS, also linked to impulsivity
    ("rs1800497", 11, 113409618, "DRD2",
     {("C","C"): 0.45, ("C","T"): 0.45, ("T","T"): 0.10},
     {("C","C"): 0.68, ("C","T"): 0.28, ("T","T"): 0.04},
     ("C", "T")),

    # GABRA2 rs279871 — G allele, GABA-A receptor subunit
    # found in multiple family-based and population studies
    ("rs279871", 4, 46337851, "GABRA2",
     {("A","A"): 0.35, ("A","G"): 0.50, ("G","G"): 0.15},
     {("A","A"): 0.58, ("A","G"): 0.36, ("G","G"): 0.06},
     ("A", "G")),

    # OPRM1 rs1799971 (A118G) — affects mu-opioid receptor binding and naltrexone response
    # the effect on AUD risk itself is modest but clinically relevant for pharmacogenomics
    ("rs1799971", 6, 154038166, "OPRM1",
     {("A","A"): 0.60, ("A","G"): 0.34, ("G","G"): 0.06},
     {("A","A"): 0.70, ("A","G"): 0.26, ("G","G"): 0.04},
     ("A", "G")),

    # COMT Val158Met rs4680 — G (Val) allele associated with higher dopamine turnover
    # and impulsivity; AUD association is weaker/more indirect
    ("rs4680", 22, 19932408, "COMT",
     {("A","A"): 0.15, ("A","G"): 0.45, ("G","G"): 0.40},
     {("A","A"): 0.25, ("A","G"): 0.50, ("G","G"): 0.25},
     ("A", "G")),

    # --- null SNPs (no association) to make the dataset realistic ---
    ("rs21917_null", 11, 11320491, "DRD4",
     {("C","C"): 0.25, ("C","T"): 0.50, ("T","T"): 0.25},
     {("C","C"): 0.25, ("C","T"): 0.50, ("T","T"): 0.25},
     ("C", "T")),

    ("rs18505_null", 5, 15104921, "GABRB1",
     {("G","G"): 0.36, ("G","A"): 0.48, ("A","A"): 0.16},
     {("G","G"): 0.36, ("G","A"): 0.48, ("A","A"): 0.16},
     ("G", "A")),

    ("rs13224_null", 12, 13490212, "GRIN2B",
     {("T","T"): 0.49, ("C","T"): 0.42, ("C","C"): 0.09},
     {("T","T"): 0.49, ("C","T"): 0.42, ("C","C"): 0.09},
     ("T", "C")),

    ("rs21397_null", 23, 43653112, "MAOA",
     {("G","G"): 0.64, ("G","T"): 0.32, ("T","T"): 0.04},
     {("G","G"): 0.64, ("G","T"): 0.32, ("T","T"): 0.04},
     ("G", "T")),
]


def generate_simulated_gwas():
    """Write alcoholism_study.map and alcoholism_study.ped to tools/."""
    os.makedirs('tools', exist_ok=True)

    # MAP file: one row per SNP
    # columns: chrom, snp_id, genetic_dist (always 0), position_bp
    map_path = 'tools/alcoholism_study.map'
    with open(map_path, 'w') as f:
        for snp in SNPS:
            f.write(f'{snp[1]}\t{snp[0]}\t0\t{snp[2]}\n')
    print(f'wrote {map_path}')

    # PED file: 50 cases + 50 controls
    # columns: fam_id, ind_id, pat_id, mat_id, sex, phenotype (2=case 1=ctrl), genotypes...
    ped_path = 'tools/alcoholism_study.ped'
    n_each = 50

    with open(ped_path, 'w') as f:
        for i in range(1, (n_each * 2) + 1):
            is_case = i <= n_each
            phenotype = 2 if is_case else 1
            probs_col = 4 if is_case else 5  # index into SNPS tuple

            sex = random.choice([1, 2])
            genos = []
            for snp in SNPS:
                probs = snp[probs_col]
                choices = list(probs.keys())
                weights = list(probs.values())
                g = random.choices(choices, weights=weights)[0]
                genos.append(f'{g[0]} {g[1]}')

            f.write(f'FAM001 IND_{i:03d} 0 0 {sex} {phenotype} {" ".join(genos)}\n')

    print(f'wrote {ped_path}')


def generate_sample_vcf():
    """Write a small 6-variant VCF to tools/sample_genotypes.vcf.

    This is mostly just for testing GATK CountVariants — not meant to be
    a realistic sequencing output.
    """
    vcf_path = 'tools/sample_genotypes.vcf'

    header = """\
##fileformat=VCFv4.2
##fileDate=20260529
##source=simulate_for_gatk_testing
##reference=GRCh38
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">
##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allele Depths">
##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Read Depth">
##FORMAT=<ID=GQ,Number=1,Type=Integer,Description="Genotype Quality">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE001\tSAMPLE002\tSAMPLE003"""

    # six variants matching what's in the simulated PED study
    records = [
        "4\t46337851\trs279871\tA\tG\t999\tPASS\tDP=60;AF=0.35\tGT:AD:DP:GQ\t0/1:18,12:30:99\t0/0:30,0:30:99\t1/1:0,28:28:99",
        "4\t100224143\trs1229984\tG\tA\t999\tPASS\tDP=58;AF=0.08\tGT:AD:DP:GQ\t0/0:25,0:25:99\t0/1:16,11:27:99\t0/0:32,0:32:99",
        "6\t154038166\trs1799971\tA\tG\t999\tPASS\tDP=45;AF=0.20\tGT:AD:DP:GQ\t0/1:15,8:23:99\t0/0:22,0:22:99\t0/1:14,8:22:99",
        "11\t113409618\trs1800497\tC\tT\t999\tPASS\tDP=50;AF=0.25\tGT:AD:DP:GQ\t0/0:24,0:24:99\t0/1:16,10:26:99\t0/1:15,11:26:99",
        "12\t111803962\trs671\tG\tA\t999\tPASS\tDP=65;AF=0.05\tGT:AD:DP:GQ\t0/0:31,0:31:99\t0/0:29,0:29:99\t0/1:20,15:35:99",
        "22\t19932408\trs4680\tA\tG\t999\tPASS\tDP=48;AF=0.60\tGT:AD:DP:GQ\t0/1:12,12:24:99\t1/1:0,24:24:99\t0/0:24,0:24:99",
    ]

    with open(vcf_path, 'w') as f:
        f.write(header + '\n')
        for r in records:
            f.write(r + '\n')

    print(f'wrote {vcf_path}')


if __name__ == '__main__':
    generate_simulated_gwas()
    generate_sample_vcf()
    print('done')
