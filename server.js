const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const { spawn } = require('child_process');
const Patient = require('./models/Patient');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- 1. CONFIGURATION ---
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// --- 2. DATABASE CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/observationDB')
    .then(() => console.log("Connected to Hospital Database"))
    .catch(err => console.log("DB Connection Error:", err));

// --- 3. THE "BRAIN" (AI BRIDGE) UPDATED ---
// Now sends: problemCode, HR, O2, Temp, RespRate, SystolicBP, DiastolicBP, Age
function predictSeverity(p) {
    return new Promise((resolve) => {
        const python = spawn('python', [
            './ml_model/predict.py',
            p.problemCode,
            p.vitals.heartRate,
            p.vitals.oxygen,
            p.vitals.temp,
            p.vitals.respiratoryRate,
            p.vitals.systolicBP,
            p.vitals.diastolicBP,
            p.age
        ]);

        python.stdout.on('data', (data) => {
            const result = data.toString().trim();
            const map = { "0": "Green", "1": "Amber", "2": "Red" };
            resolve(map[result] || "Green");
        });

        python.stderr.on('data', (data) => {
            console.error(`AI Error: ${data}`);
        });
    });
}

// --- 4. THE SIMULATOR (VITAL MONITOR) UPDATED ---
setInterval(async () => {
    try {
        const patients = await Patient.find();

        for (let p of patients) {
            const oldSeverity = p.severity;

            // 1. Realistic Vitals Drift for all 7 parameters
            p.vitals.heartRate += Math.floor(Math.random() * 5) - 2;
            p.vitals.respiratoryRate += Math.floor(Math.random() * 3) - 1;
            p.vitals.systolicBP += Math.floor(Math.random() * 5) - 2;
            p.vitals.oxygen = Math.floor(Math.random() * (100 - 88) + 88); // O2 fluctuates realistically

            // Keep in healthy or logical bounds
            if (p.vitals.heartRate < 50) p.vitals.heartRate = 50;
            if (p.vitals.respiratoryRate < 12) p.vitals.respiratoryRate = 12;
            if (p.vitals.systolicBP > 180) p.vitals.systolicBP = 180;

            // 2. Get AI Prediction using the new 7-parameter function
            const newSeverity = await predictSeverity(p);

            // 3. THE LOCK LOGIC
            if (newSeverity === 'Red') {
                p.severity = 'Red';
                p.alertLock = 6; // Lock for 1 minute
            } else if (p.alertLock > 0) {
                p.severity = 'Red';
                p.alertLock -= 1;
            } else {
                p.severity = newSeverity;
            }

            await p.save();

            // 5. Trigger Socket Alert ONLY if it's NEW
            // Added RR and BP to the alert payload for your alert system
            if (p.severity === 'Red' && oldSeverity !== 'Red') {
                io.emit('emergency_alert', {
                    id: p._id,
                    name: p.name,
                    hr: p.vitals.heartRate,
                    o2: p.vitals.oxygen,
                    respRate: p.vitals.respiratoryRate,
                    sysBP: p.vitals.systolicBP,
                    diaBP: p.vitals.diastolicBP
                });
            }
        }
        io.emit('update_data');
    } catch (err) {
        console.error("Simulator Error:", err);
    }
}, 10000);

// --- 5. ROUTES ---

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        res.redirect('/dashboard');
    } else {
        res.send("Invalid Credentials. <a href='/'>Go back</a>");
    }
});

app.get('/dashboard', async (req, res) => {
    const patients = await Patient.find();
    const critical = patients.filter(p => p.severity === 'Red');
    const others = patients.filter(p => p.severity !== 'Red');
    res.render('dashboard', { critical, others });
});

app.get('/patient/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.render('patient-detail', { patient });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

app.get('/add-patient', (req, res) => {
    res.render('add-patient');
});

app.post('/add-patient', async (req, res) => {
    const {
        name, age, problem, problemCode,
        heartRate, oxygen, temp, respiratoryRate, systolicBP, diastolicBP
    } = req.body;

    await Patient.create({
        name,
        age,
        problem,
        problemCode: parseInt(problemCode),
        vitals: {
            heartRate: parseInt(heartRate) || 75,
            oxygen: parseInt(oxygen) || 98,
            temp: parseFloat(temp) || 98.6,
            respiratoryRate: parseInt(respiratoryRate) || 16,
            systolicBP: parseInt(systolicBP) || 120,
            diastolicBP: parseInt(diastolicBP) || 80
        }
    });
    res.redirect('/dashboard');
});

app.post('/delete-patient/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

server.listen(3000, () => console.log("System Online at http://localhost:3000"));