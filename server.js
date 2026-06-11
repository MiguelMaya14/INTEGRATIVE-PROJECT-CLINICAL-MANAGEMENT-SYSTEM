const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 🔌 CONEXIÓN A BASE DE DATOS
// ==========================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // 👇 TU CONTRASEÑA DE WORKBENCH (¡No borres las comillas!)
    password: '', 
    database: 'integradora'
});

db.connect((err) => {
    if (err) {
        console.log('❌ Error conectando a BD:', err);
        console.log('👉 Tip: Revisa si la contraseña en server.js es correcta.');
    } else {
        console.log('✅ Conectado a base de datos: integradora');
    }
});

// ==========================================
// RUTA 1: LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.status(200).json({ message: "Login OK", user: result[0] });
        } else {
            res.status(401).json({ message: "Credenciales incorrectas" });
        }
    });
});

// ==========================================
// RUTA 2: OBTENER DOCTORES (Para la lista)
// ==========================================
app.get('/api/doctores', (req, res) => {
    const sql = `
        SELECT user.name, user.lastName, doctor.specialty 
        FROM doctor 
        INNER JOIN user ON doctor.User_idUser = user.idUser
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ==========================================
// RUTA 3: GUARDAR CITA (Agenda)
// ==========================================
app.post('/api/citas', (req, res) => {
    const { emailUsuario, doctorName, date, time, concept, description } = req.body;
    const fechaCompleta = `${date} ${time}`; 

    console.log(`📝 Agendando cita: ${emailUsuario} con ${doctorName}`);

    // PASO 1: Buscar Paciente por Email
    const queryPaciente = `
        SELECT p.idPatient, p.User_idUser, p.User_Gender_idGender 
        FROM patient p 
        JOIN user u ON p.User_idUser = u.idUser 
        WHERE u.email = ?`;

    db.query(queryPaciente, [emailUsuario], (err, resPaciente) => {
        if (err) return res.status(500).json(err);
        if (resPaciente.length === 0) return res.status(400).json({ message: "Usuario no es paciente registrado." });

        const paciente = resPaciente[0];

        // PASO 2: Buscar Doctor por Nombre (Limpiando prefijos "Dr.")
        const nombreDocLimpio = doctorName
            .replace("Dr(a). ", "")
            .replace("Dr. ", "")
            .replace("Dra. ", "")
            .trim()
            .split(" ")[0]; // Toma el primer nombre
        
        const queryDoctor = `
            SELECT d.idDoctor, d.User_idUser, d.User_Gender_idGender 
            FROM doctor d 
            JOIN user u ON d.User_idUser = u.idUser 
            WHERE u.name LIKE ? OR u.lastName LIKE ? LIMIT 1`;

        db.query(queryDoctor, [`%${nombreDocLimpio}%`, `%${nombreDocLimpio}%`], (err, resDoctor) => {
            if (err) return res.status(500).json(err);
            
            // Si no encuentra doctor exacto, usa el primero disponible (Fallback)
            let doctor = resDoctor.length > 0 ? resDoctor[0] : null;
            
            if (!doctor) {
                 db.query("SELECT * FROM doctor LIMIT 1", (err, fallback) => {
                    if (fallback.length > 0) guardarCita(paciente, fallback[0]);
                    else res.status(400).json({ message: "No hay doctores registrados." });
                 });
            } else {
                guardarCita(paciente, doctor);
            }
        });
    });

    function guardarCita(p, d) {
        const sqlInsert = `
            INSERT INTO appoinment 
            (date, reason, 
             Patient_idPatient, Patient_User_idUser, Patient_User_Gender_idGender,
             Doctor_idDoctor, Doctor_User_idUser, Doctor_User_Gender_idGender,
             Satus_idSatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // EL "1" AL FINAL ES EL ID DEL ESTATUS (PENDIENTE)
        const values = [
            fechaCompleta, `${concept} - ${description}`,
            p.idPatient, p.User_idUser, p.User_Gender_idGender,
            d.idDoctor, d.User_idUser, d.User_Gender_idGender,
            1 
        ];

        db.query(sqlInsert, values, (err, result) => {
            if (err) {
                console.error("❌ Error SQL Citas:", err);
                return res.status(500).json({ message: "Error SQL: " + err.sqlMessage });
            }
            res.status(200).json({ message: "Cita guardada con éxito" });
        });
    }
});

// ==========================================
// RUTA 4: HISTORIAL DE CITAS (Mis Citas)
// ==========================================
app.post('/api/mis-citas', (req, res) => {
    const { email } = req.body;
    const sql = `
        SELECT 
            a.idAppoiment as id,
            a.date as fechaCompleta,
            a.reason as concepto,
            docUser.name as docNombre,
            docUser.lastName as docApellido,
            d.specialty as especialidad,
            s.name as estatus
        FROM appoinment a
        JOIN patient p ON a.Patient_idPatient = p.idPatient
        JOIN user u ON p.User_idUser = u.idUser
        JOIN doctor d ON a.Doctor_idDoctor = d.idDoctor
        JOIN user docUser ON d.User_idUser = docUser.idUser
        JOIN status s ON a.Satus_idSatus = s.idSatus
        WHERE u.email = ?
        ORDER BY a.date DESC
    `;
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ==========================================
// RUTA 5: REGISTRO CON VERIFICACIÓN DE CORREO 🛡️
// ==========================================
app.post('/api/register', (req, res) => {
    console.log("\n--- INTENTO DE REGISTRO ---");
    const { fullName, email, password, gender, address, height, weight } = req.body;

    // 1. Validar datos obligatorios
    if (!fullName || !email || !password || !gender) {
        return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // 🛑 PASO 0: EL PORTERO (Verificar si el correo ya existe)
    const sqlCheck = "SELECT email FROM user WHERE email = ?";
    
    db.query(sqlCheck, [email], (err, resultCheck) => {
        if (err) {
            console.log("❌ Error verificando correo:", err);
            return res.status(500).json({ message: "Error del servidor al verificar correo." });
        }

        // Si la lista NO está vacía, significa que el correo YA EXISTE
        if (resultCheck.length > 0) {
            console.log(`⚠️ Registro bloqueado: El correo ${email} ya está registrado.`);
            return res.status(409).json({ message: "¡Este correo ya está registrado! Usa otro." });
        }

        // --- SI PASAMOS AQUÍ, EL CORREO ESTÁ LIBRE ---
        
        // 2. Separar nombre
        const partesNombre = fullName.split(' ');
        const name = partesNombre[0];
        const lastName = partesNombre.slice(1).join(' ') || '';

        // 3. Insertar en tabla USER
        const sqlUser = "INSERT INTO user (name, lastName, email, password, idGender) VALUES (?, ?, ?, ?, ?)";
        
        db.query(sqlUser, [name, lastName, email, password, gender], (err, resultUser) => {
            if (err) return res.status(500).json({ message: "Error al crear usuario." });

            const newUserId = resultUser.insertId;

            // 4. Insertar en tabla PATIENT
            const sqlPatient = `
                INSERT INTO patient 
                (User_idUser, User_Gender_idGender, address, height, weight) 
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(sqlPatient, [newUserId, gender, address, height, weight], (err, resultPatient) => {
                if (err) {
                    // Si falla el paciente, sería bueno borrar el user, pero por ahora mostramos error
                    console.log("❌ Error creando paciente:", err);
                    return res.status(500).json({ message: "Error creando ficha médica." });
                }

                console.log(`✅ ¡Éxito! Usuario nuevo: ${email} (ID: ${newUserId})`);
                res.status(200).json({ message: "Registro exitoso" });
            });
        });
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(3000, () => {
    console.log('🚀 SERVIDOR FULL LISTO EN PUERTO 3000');
});