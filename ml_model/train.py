import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# 1. Load the new data
df = pd.read_csv('../hospital_data.csv')

# 2. Define Features (Must match the CSV order)
features = [
    'problemCode', 'heartRate', 'oxygen', 'temp', 
    'respiratoryRate', 'systolicBP', 'diastolicBP', 'age'
]

X = df[features]
y = df['severity']

# 3. Train the Advanced AI
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 4. Save the "Brain"
joblib.dump(model, 'severity_model.pkl')

print("✅ Step 2: Advanced AI Model (8 Features) trained and saved!")