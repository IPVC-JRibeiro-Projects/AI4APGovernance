import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Carregar o dataset pré-processado
df = pd.read_csv('dataset_governanca_admin_publica_preprocessado.csv')

# 2. Visualização de distribuições (histogramas)
numeric_fields = [
    'indicador_si', 'taxa_resolucao', 'tempo_resposta',
    'satisfacao_cidadao', 'volume_interacoes', 'taxa_abandono',
    'erros_tecnicos', 'indicador_kpi'
]

for col in numeric_fields:
    plt.figure(figsize=(7,4))
    sns.histplot(df[col], bins=20, kde=True)
    plt.title(f'Distribuição de {col}')
    plt.xlabel(col)
    plt.ylabel('Frequência')
    plt.tight_layout()
    plt.show()

# 3. Detecção de outliers (boxplots)
for col in numeric_fields:
    plt.figure(figsize=(7,1.5))
    sns.boxplot(x=df[col])
    plt.title(f'Boxplot de {col}')
    plt.tight_layout()
    plt.show()

# 4. Lista de outliers para um campo (exemplo: tempo_resposta)
q1 = df['tempo_resposta'].quantile(0.25)
q3 = df['tempo_resposta'].quantile(0.75)
iqr = q3 - q1
limite_inf = q1 - 1.5 * iqr
limite_sup = q3 + 1.5 * iqr
outliers = df[(df['tempo_resposta'] < limite_inf) | (df['tempo_resposta'] > limite_sup)]
print(f"\nOutliers em 'tempo_resposta': {outliers.shape[0]} registos.")
print(outliers[['id_registo', 'tempo_resposta']])

# 5. Identificação de correlações (heatmap)
corr_matrix = df[numeric_fields].corr().round(2)
print("\nMatriz de correlação:\n", corr_matrix)

plt.figure(figsize=(8,6))
sns.heatmap(corr_matrix, annot=True, cmap='Blues')
plt.title('Correlação entre Indicadores Numéricos')
plt.tight_layout()
plt.show()
