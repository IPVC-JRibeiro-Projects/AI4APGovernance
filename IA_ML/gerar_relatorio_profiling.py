import pandas as pd
from ydata_profiling import ProfileReport

df = pd.read_csv("dataset_governanca_admin_publica_preprocessado.csv")

profile = ProfileReport(df, title="Governance & Public Administration - EDA Report", explorative=True)
profile.to_file("report.html")
