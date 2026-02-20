import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor, plot_tree
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# 1. Carregar o dataset pré-processado
df = pd.read_csv('dataset_governanca_admin_publica_preprocessado.csv')

# 2. Selecionar features e variável alvo
features = [
    'indicador_si', 'taxa_resolucao', 'tempo_resposta',
    'volume_interacoes', 'taxa_abandono',
    'erros_tecnicos', 'indicador_kpi'
]

X = df[features]
y = df['satisfacao_cidadao']

# 3. Dividir em treino e teste
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Criar e treinar a Árvore de Decisão
modelo_dt = DecisionTreeRegressor(
    max_depth=4,          # controla complexidade (bom para relatório)
    random_state=42
)

modelo_dt.fit(X_train, y_train)

# 5. Previsões
y_pred = modelo_dt.predict(X_test)

# 6. Avaliação
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("Árvore de Decisão (Regressão):")
print(f"MSE: {mse:.3f}")
print(f"MAE: {mae:.3f}")
print(f"R²: {r2:.3f}")

# 7. Visualização da Árvore
plt.figure(figsize=(18,10))
plot_tree(
    modelo_dt,
    feature_names=features,
    filled=True,
    rounded=True,
    fontsize=9
)
plt.title("Árvore de Decisão – Previsão da Satisfação do Cidadão")
plt.show()