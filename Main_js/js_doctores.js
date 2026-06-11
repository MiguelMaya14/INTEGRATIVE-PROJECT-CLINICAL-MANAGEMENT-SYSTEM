document.addEventListener('DOMContentLoaded', async () => {
        console.log("🚀 Iniciando sistema de doctores...");

        // A) VERIFICAR LOGIN
        const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
        if (!usuarioLogueado) {
            window.location.href = "../Main_index/index.html";
            return;
        }

        // B) PONER NOMBRE EN EL HEADER
        const userNameSpan = document.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = `${usuarioLogueado.name || ''} ${usuarioLogueado.lastName || ''}`;
        }

        // C) DESCARGAR Y DIBUJAR DOCTORES
        const gridContainer = document.getElementById('gridDoctores');

        try {
            const response = await fetch('http://localhost:3000/api/doctores');
            const doctores = await response.json();

            console.log(" Doctores recibidos:", doctores);
            gridContainer.innerHTML = ''; 

            if (doctores.length === 0) {
                gridContainer.innerHTML = '<h3 style="color:#1A7352; text-align:center;">No hay doctores registrados en la base de datos.</h3>';
                return;
            }

            doctores.forEach(doc => {
                const nombreCompleto = `Dr(a). ${doc.name} ${doc.lastName}`;
                const especialidad = doc.specialty || doc.speciality || "Especialista";

                const cardHTML = `
                    <div class="doctor-card" style="
                        background-color: #ffffff; 
                        border-radius: 15px; 
                        padding: 20px; 
                        text-align: center; 
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        display: flex; flex-direction: column; align-items: center;
                        min-width: 260px; margin: 15px; border: 1px solid #BFE7D5;
                    ">
                        <div style="
                            width: 80px; height: 80px; 
                            background-color: #f0f0f0; 
                            border-radius: 50%; 
                            margin-bottom: 15px;
                            background-image: url('../Main_icons/user.svg');
                            background-size: 50%; background-repeat: no-repeat; background-position: center;">
                        </div>

                        <h3 class="doctor-name" style="color: #1A7352; margin: 5px 0; font-size: 1.2rem;">${nombreCompleto}</h3>
                        <p class="doctor-specialty" style="color: #2AB389; font-weight: bold; margin-bottom: 10px;">${especialidad}</p>
                        
                        <div style="width: 50px; height: 2px; background-color: #eee; margin: 10px 0;"></div>
                        
                        <p class="doctor-description" style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">
                            Expert in ${especialidad}. Committed to your health.
                        </p>
                        
                        <button class="cta-btn" onclick="agendarCita('${nombreCompleto}')" style="
                            padding: 10px 20px; 
                            background: linear-gradient(135deg, #2AB389 0%, #1A7352 100%);
                            color: white; 
                            border: none; 
                            border-radius: 5px; 
                            cursor: pointer; 
                            font-weight: bold;
                            width: 100%; transition: background 0.3s;">
                            Schedule Appointment
                        </button>
                    </div>
                `;
                gridContainer.innerHTML += cardHTML;
            });

        } catch (error) {
            console.error("Error:", error);
            gridContainer.innerHTML = '<h3 style="color:#1A7352; text-align:center;">Error al conectar con el servidor.</h3>';
        }
    });

    function agendarCita(nombreDoctor) {
        console.log("Agendando con:", nombreDoctor);
        window.location.href = `../Main_index/Nueva_cita.html?doctor=${encodeURIComponent(nombreDoctor)}`;
    }