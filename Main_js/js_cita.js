document.addEventListener('DOMContentLoaded', async () => {
    // 1. OBTENER ELEMENTOS DEL DOM
    const newAppointmentForm = document.getElementById('newAppointmentForm');
    const registerBtn = document.querySelector('.register-btn');
    const doctorSelect = document.getElementById('doctor');
    const specialtySelect = document.getElementById('specialty');

    
    // 2. VERIFICAR LOGIN Y MOSTRAR NOMBRE (CORREGIDO) 
    
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    // Si no hay usuario, lo mandamos al login
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "../Main_index/index.html";
        return;
    }

    // LÓGICA PARA PONER EL NOMBRE EN EL HEADER
    const profileInfo = document.querySelector('.profile-info'); 
    let userNameSpan = document.querySelector('.user-name');
    
    // Si no existe el espacio para el nombre, lo creamos dinámicamente
    if (!userNameSpan && profileInfo) {
        userNameSpan = document.createElement('span');
        userNameSpan.className = 'user-name';
        userNameSpan.style.color = 'white';
        userNameSpan.style.fontWeight = 'bold';
        userNameSpan.style.marginLeft = '10px';
        profileInfo.appendChild(userNameSpan);
    }

    // ESCRIBIR EL NOMBRE (A prueba de errores "undefined")
    if (userNameSpan) {
        // Buscamos el nombre (o vacío si no existe)
        const nombre = usuarioLogueado.name || usuarioLogueado.Name || "";
        
        // Buscamos el apellido (probamos varias formas de escribirlo)
        const apellido = usuarioLogueado.lastName || usuarioLogueado.lastname || usuarioLogueado.LastName || "";

        // Escribimos en el HTML quitando espacios extra
        userNameSpan.textContent = `${nombre} ${apellido}`.trim();
        
        console.log("👤 Usuario activo:", nombre, apellido);
    }

    // 3. CARGAR DOCTORES Y PREPARAR MENÚS
    
    let doctorsBySpecialty = {}; 
    let listaCompletaDoctores = [];

    try {
        const response = await fetch('http://localhost:3000/api/doctores');
        const doctoresBD = await response.json();
        listaCompletaDoctores = doctoresBD; 

        // A) Organizar doctores por especialidad
        doctoresBD.forEach(doc => {
            const nombreCompleto = `Dr(a). ${doc.name} ${doc.lastName}`;
            // Normalizar especialidad (por si viene en inglés o español)
            const especialidad = doc.specialty || doc.speciality || "General"; 

            if (!doctorsBySpecialty[especialidad]) {
                doctorsBySpecialty[especialidad] = [];
            }
            doctorsBySpecialty[especialidad].push(nombreCompleto);
        });

        // B) Llenar el menú de Especialidades
        specialtySelect.innerHTML = '<option value="">-- Selecciona Especialidad --</option>';
        Object.keys(doctorsBySpecialty).forEach(especialidad => {
            const option = document.createElement('option');
            option.value = especialidad;
            option.textContent = especialidad;
            specialtySelect.appendChild(option);
        });

        
        // 4. LÓGICA DE PRE-SELECCIÓN (Si vienes desde "Doctores") 
        
        const urlParams = new URLSearchParams(window.location.search);
        const doctorPreseleccionado = urlParams.get('doctor');

        if (doctorPreseleccionado) {
            console.log(" Pre-seleccionando a:", doctorPreseleccionado);
            // Buscar al doctor en la lista para saber su especialidad
            const doctorFound = doctoresBD.find(d => `Dr(a). ${d.name} ${d.lastName}` === doctorPreseleccionado);

            if (doctorFound) {
                const especialidadDelDoctor = doctorFound.specialty || doctorFound.speciality;
                
                // 1. Seleccionar especialidad
                specialtySelect.value = especialidadDelDoctor;
                
                // 2. Llenar lista de doctores de esa área
                llenarDoctores(especialidadDelDoctor);
                
                // 3. Seleccionar al doctor
                doctorSelect.value = doctorPreseleccionado;
            }
        }

    } catch (error) {
        console.error("Error cargando datos:", error);
    }

    
    // 5. FUNCIÓN AUXILIAR PARA LLENAR LA LISTA DE DOCTORES
    
    function llenarDoctores(especialidad) {
        doctorSelect.innerHTML = '<option value="">-- Selecciona Doctor --</option>';
        if (especialidad && doctorsBySpecialty[especialidad]) {
            doctorsBySpecialty[especialidad].forEach(docNombre => {
                const opt = document.createElement('option');
                opt.value = docNombre;
                opt.textContent = docNombre;
                doctorSelect.appendChild(opt);
            });
        }
    }

    // Evento: Al cambiar especialidad, actualizar doctores
    specialtySelect.addEventListener('change', function() {
        llenarDoctores(this.value);
    });

    
    // 6. ENVIAR FORMULARIO (GUARDAR CITA)
    if (newAppointmentForm) {
        newAppointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const citaData = {
                emailUsuario: usuarioLogueado.email,
                specialty: document.getElementById('specialty').value,
                doctorName: document.getElementById('doctor').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                concept: document.getElementById('concept').value,
                description: document.getElementById('description').value || ""
            };

            // Validación simple
            if(!citaData.specialty || !citaData.doctorName) {
                alert("Por favor selecciona especialidad y doctor.");
                return;
            }

            // Cambiar botón visualmente
            if(registerBtn) {
                registerBtn.textContent = 'Guardando...';
                registerBtn.disabled = true;
            }

            try {
                const response = await fetch('http://localhost:3000/api/citas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(citaData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Cita guardada correctamente!');
                    // Limpiar URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    newAppointmentForm.reset();
                } else {
                    alert(' Error: ' + (data.message || "Error desconocido"));
                }
            } catch (error) {
                console.error(error);
                alert('Error de conexión con el servidor.');
            } finally {
                if(registerBtn) {
                    registerBtn.textContent = 'Agendar Cita';
                    registerBtn.disabled = false;
                }
            }
        });
    }
});