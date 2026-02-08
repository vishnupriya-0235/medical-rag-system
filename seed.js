const mongoose = require('mongoose');
const Patient = require('./models/Patient');

mongoose.connect('mongodb://127.0.0.1:27017/observationDB')
    .then(async () => {
        console.log("🏥 Populating 10 Professional Clinical Cases...");
        await Patient.deleteMany({}); 

        const patients = [
            // --- RED SECTION (CRITICAL) ---
            {
                name: "Arjun Mehta", age: 45, problem: "Acute Respiratory Distress", problemCode: 3,
                vitals: { heartRate: 118, oxygen: 88, temp: 99.1, respiratoryRate: 32, systolicBP: 130, diastolicBP: 85 },
                severity: "Red" // Critical: Low O2 + High RR
            },
            {
                name: "Sara Williams", age: 62, problem: "Hypertensive Crisis", problemCode: 2,
                vitals: { heartRate: 95, oxygen: 96, temp: 98.4, respiratoryRate: 18, systolicBP: 185, diastolicBP: 110 },
                severity: "Red" // Critical: Extremely High BP
            },
            {
                name: "John Doe", age: 50, problem: "Post-Myocardial Infarction", problemCode: 2,
                vitals: { heartRate: 145, oxygen: 92, temp: 98.6, respiratoryRate: 24, systolicBP: 100, diastolicBP: 60 },
                severity: "Red" // Critical: Tachycardia (High HR)
            },

            // --- AMBER SECTION (MODERATE/OBSERVATION) ---
            {
                name: "Priya Nair", age: 29, problem: "Post-Surgical Infection", problemCode: 1,
                vitals: { heartRate: 102, oxygen: 95, temp: 102.5, respiratoryRate: 21, systolicBP: 115, diastolicBP: 75 },
                severity: "Amber" // Warning: High Temperature
            },
            {
                name: "Robert Fox", age: 72, problem: "Congestive Heart Failure", problemCode: 2,
                vitals: { heartRate: 88, oxygen: 93, temp: 97.9, respiratoryRate: 23, systolicBP: 145, diastolicBP: 92 },
                severity: "Amber" // Warning: Slightly low O2 and borderline BP
            },
            {
                name: "Ayesha Khan", age: 19, problem: "Severe Dehydration", problemCode: 3,
                vitals: { heartRate: 110, oxygen: 98, temp: 100.2, respiratoryRate: 20, systolicBP: 90, diastolicBP: 55 },
                severity: "Amber" // Warning: High HR and Low BP
            },

            // --- GREEN SECTION (STABLE) ---
            {
                name: "Dr. K. Rajesh", age: 55, problem: "Routine Post-Op Recovery", problemCode: 1,
                vitals: { heartRate: 72, oxygen: 99, temp: 98.6, respiratoryRate: 14, systolicBP: 120, diastolicBP: 80 },
                severity: "Green"
            },
            {
                name: "Kevin George", age: 34, problem: "Minor Trauma Observation", problemCode: 3,
                vitals: { heartRate: 78, oxygen: 98, temp: 98.2, respiratoryRate: 16, systolicBP: 122, diastolicBP: 82 },
                severity: "Green"
            },
            {
                name: "Emily Chen", age: 25, problem: "Appendectomy Recovery", problemCode: 1,
                vitals: { heartRate: 70, oxygen: 100, temp: 98.4, respiratoryRate: 12, systolicBP: 118, diastolicBP: 76 },
                severity: "Green"
            },
            {
                name: "Samuel Jackson", age: 68, problem: "Stable Cardiac Monitor", problemCode: 2,
                vitals: { heartRate: 65, oxygen: 97, temp: 98.0, respiratoryRate: 15, systolicBP: 125, diastolicBP: 85 },
                severity: "Green"
            }
        ];

        await Patient.insertMany(patients);
        console.log("✅ 10 Clinical Cases Seeded Successfully.");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    });