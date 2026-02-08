import sys
import joblib
import numpy as np
import os
import pandas as pd

# 1. Dynamically find the "Brain" (severity_model.pkl)
base_dir = os.path.dirname(__file__)
model_path = os.path.join(base_dir, 'severity_model.pkl')

try:
    # 2. Load the model
    # Note: Ensure you have re-trained the model using generate_data.py 
    # so it expects 8 features (excluding the severity label)
    model = joblib.load(model_path)

    # 3. Convert Node.js arguments to a list of numbers
    # The order must be: [probCode, hr, o2, temp, respRate, sysBP, diaBP, age]
    # Note: server.js sends these in sys.argv[1:]
    input_data = [float(arg) for arg in sys.argv[1:]]
    
    # Validation: Check if we have exactly the right number of features
    # If your model was trained on 8 features, len(input_data) should be 8
    if len(input_data) != 8:
        # If the number of inputs is wrong, default to Green (0)
        print(0)
        sys.exit()

    # 4. Prepare input with correct feature names (if model expects them)
    feature_names = getattr(model, 'feature_names_in_', None)
    if feature_names is not None:
        try:
            X = pd.DataFrame([input_data], columns=feature_names)
        except Exception:
            # Fallback to numpy array if DataFrame construction fails
            X = np.array([input_data])
    else:
        X = np.array([input_data])

    # Make the prediction
    prediction = model.predict(X)[0]
    
    # 5. Output ONLY the result (0, 1, or 2) for Node.js to read
    print(int(prediction))

except Exception as e:
    # If something fails (like model not found), send 0 (Green) 
    # so the dashboard stays stable
    print(0)