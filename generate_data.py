import pandas as pd
import numpy as np
import os

def generate_medical_data():
    rows = []
    for _ in range(2000):
        prob_code = np.random.randint(1, 4) 
        hr = np.random.randint(50, 160)
        o2 = np.random.randint(85, 100)
        temp = round(np.random.uniform(96.0, 105.0), 1)
        resp_rate = np.random.randint(10, 35)
        sys_bp = np.random.randint(70, 180)
        dia_bp = np.random.randint(40, 110)
        age = np.random.randint(18, 90)
        
        if (o2 < 91 and resp_rate > 26) or (sys_bp > 165):
            severity = 2 
        elif (hr > 110 or o2 < 94 or temp > 101.5):
            severity = 1 
        else:
            severity = 0 
            
        rows.append([prob_code, hr, o2, temp, resp_rate, sys_bp, dia_bp, age, severity])

    cols = ['problemCode', 'heartRate', 'oxygen', 'temp', 'respiratoryRate', 'systolicBP', 'diastolicBP', 'age', 'severity']
    df = pd.DataFrame(rows, columns=cols)
    
    # --- CHANGED LINE HERE ---
    # This ensures it saves in the folder you are currently in
    df.to_csv('hospital_data.csv', index=False) 
    print(f"✅ Success! Created file at: {os.getcwd()}\\hospital_data.csv")

if __name__ == "__main__":
    generate_medical_data()