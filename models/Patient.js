const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    problem: { type: String, required: true }, 
    problemCode: { type: Number, required: true }, 
    vitals: {
        heartRate: { type: Number, default: 75 },
        oxygen: { type: Number, default: 98 },
        temp: { type: Number, default: 98.6 },
        // --- NEW VITAL SIGNS ADDED BELOW ---
        respiratoryRate: { type: Number, default: 16 }, // From your Kaggle reference
        systolicBP: { type: Number, default: 120 },    // From your Kaggle reference
        diastolicBP: { type: Number, default: 80 }      // From your Kaggle reference
    },
    severity: { type: String, default: 'Green' }, 
    alertLock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Patient', patientSchema);