import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# 1. Carregar os dados e selecionar features/target
df = pd.read_csv('dataset_governanca_admin_publica_preprocessado.csv')

features = [
    'indicador_si', 'taxa_resolucao', 'tempo_resposta',
    'volume_interacoes', 'taxa_abandono',
    'erros_tecnicos', 'indicador_kpi'
]
X = df[features]
y = df['satisfacao_cidadao']

print("Formato dos dados X (features):", X.shape)
print("Formato dos dados y (target):", y.shape)

# 2. Dividir os dados em treino e teste
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Formato X_train:", X_train.shape)
print("Formato X_test:", X_test.shape)
print("Formato y_train:", y_train.shape)
print("Formato y_test:", y_test.shape)

# 3. Criar e treinar o modelo de regressão
modelo = LinearRegression()
modelo.fit(X_train, y_train)

# 4. Fazer previsões e avaliar o modelo
y_pred = modelo.predict(X_test)

print("Previsões para o conjunto de teste (primeiros 10 valores):")
print(y_pred[:10])

mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MSE (erro quadrático médio): {mse:.3f}")
print(f"MAE (erro absoluto médio): {mae:.3f}")
print(f"R² (score de explicação): {r2:.3f}")

# 5. Gráfico de dispersão: verdadeiro vs previsto
plt.figure(figsize=(6,6))
plt.scatter(y_test, y_pred, alpha=0.7, color='royalblue')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], '--', color='red')  # linha ideal
plt.xlabel('Satisfação Real')
plt.ylabel('Satisfação Prevista')
plt.title('Previsão vs Valor Real (Satisfação)')
plt.tight_layout()
plt.show()

# 6. Exportar previsões vs reais para CSV
resultados = X_test.copy()
resultados['satisfacao_real'] = y_test
resultados['satisfacao_prevista'] = y_pred
resultados.to_csv('resultados_regressao_satisfacao.csv', index=False)
print("Ficheiro 'resultados_regressao_satisfacao.csv' criado com sucesso!")

