# IA-ML - Governance and Public Administration

This repository contains scripts for data preprocessing, exploratory data analysis, and Machine Learning models (Linear Regression, Random Forest, and Decision Tree) applied to a public governance and administration dataset.

The main objective is to analyze operational indicators and predict **citizen satisfaction**.

---

## Project Structure (example)

- `dataset_governanca_admin_publica.csv` - original dataset  
- `dataset_governanca_admin_publica_preprocessado.csv` - preprocessed dataset  
- `preprocessamento.py` - data cleaning, missing values handling, normalization, and date conversion  
- `analise_exploratoria.py` - exploratory analysis (histograms, boxplots, correlation heatmap)  
- `regressao_satisfacao.py` - Linear Regression model to predict `satisfacao_cidadao`  
- `regressao_randomforest.py` - Random Forest Regressor  
- `arvore_decisao_satisfacao.py` - Decision Tree Regressor with image export  

> File names may vary slightly depending on project organization, but this README assumes they are located in the main project folder.

---

## Requirements

To run this project, the following software and libraries are required:

- **Python** 3.9 or higher (recommended)
- **pandas**
- **numpy**
- **matplotlib**
- **seaborn**
- **scikit-learn**
- **ydata-profiling** (for the EDA HTML report)

### Optional
- A web browser (e.g., Chrome, Firefox) to view the generated HTML report (`report.html`)

---

## Exploratory Data Analysis Report (EDA)

An interactive exploratory data analysis report generated with **ydata-profiling**
is available online:

👉 https://leticialoureiro04.github.io/IA-ML/report.html