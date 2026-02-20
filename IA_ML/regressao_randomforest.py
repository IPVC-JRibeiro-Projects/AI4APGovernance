from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pandas as pd

# Carregar os dados
df = pd.read_csv('dataset_governanca_admin_publica_preprocessado.csv')

features = [
    'indicador_si', 'taxa_resolucao', 'tempo_resposta',
    'volume_interacoes', 'taxa_abandono',
    'erros_tecnicos', 'indicador_kpi'
]
X = df[features]
y = df['satisfacao_cidadao']

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Modelo Random Forest
modelo_rf = RandomForestRegressor(random_state=42)
modelo_rf.fit(X_train, y_train)

# Prever e avaliar
y_pred_rf = modelo_rf.predict(X_test)
mse_rf = mean_squared_error(y_test, y_pred_rf)
mae_rf = mean_absolute_error(y_test, y_pred_rf)
r2_rf = r2_score(y_test, y_pred_rf)

print("Random Forest:")
print(f"MSE: {mse_rf:.3f} | MAE: {mae_rf:.3f} | R²: {r2_rf:.3f}")

# Visualização rápida:
import matplotlib.pyplot as plt
plt.figure(figsize=(6,6))
plt.scatter(y_test, y_pred_rf, alpha=0.7, color='seagreen')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], '--', color='red')
plt.xlabel('Satisfação Real')
plt.ylabel('Satisfação Prevista (RF)')
plt.title('Random Forest: Previsão vs Valor Real')
plt.tight_layout()
plt.show()

# Guardar as previsões do Random Forest
resultados_rf = X_test.copy()
resultados_rf['satisfacao_real'] = y_test
resultados_rf['satisfacao_prevista_rf'] = y_pred_rf
resultados_rf.to_csv('resultados_regressao_randomforest.csv', index=False)
print("Ficheiro 'resultados_regressao_randomforest.csv' criado com sucesso!")
