import pandas as pd

# Carrega o dataset
df = pd.read_csv('dataset_governanca_admin_publica.csv')

# 1. Verificar os valores nulos
print("\nValores nulos por campo antes do tratamento:")
print(df.isnull().sum())

# 2. Preencher os valores nulos
for col in df.columns:
    if df[col].dtype in ['float64', 'int64']:
        df[col] = df[col].fillna(df[col].median())
    else:
        df[col] = df[col].fillna('Desconhecido')

# 3. Normalização de categorias e textos
cat_cols = [
    'unidade_organizacional', 'tipo_servico', 'canal_utilizado',
    'transparencia', 'feedback_cidadao', 'segmentacao_utilizador', 'area_tematica'
]
for col in cat_cols:
    df[col] = df[col].str.strip().str.title()

# 4. Conversão de datas
df['data_registo'] = pd.to_datetime(df['data_registo'], errors='coerce')

# 5. Estatísticas rápidas após pré-processamento
print("\nValores nulos por campo após tratamento:")
print(df.isnull().sum())

print("\nEstatísticas descritivas dos campos numéricos e categóricos:")
print(df.describe(include='all').transpose())

# 6. Guarda o novo CSV para análise posterior
df.to_csv('dataset_governanca_admin_publica_preprocessado.csv', index=False, encoding='utf-8-sig')

print('\nPré-processamento concluído! O novo ficheiro foi guardado como "dataset_governanca_admin_publica_preprocessado.csv".')
