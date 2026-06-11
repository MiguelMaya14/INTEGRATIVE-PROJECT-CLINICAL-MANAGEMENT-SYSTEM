document.addEventListener('DOMContentLoaded', async () => {
    
    
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "../Main_index/index.html"; // Redirigir al login
        return;
    }

    // Poner nombre en el header (si existe el elemento)
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo) {
        let nameSpan = document.createElement('span');
        nameSpan.style.color = 'white';
        nameSpan.style.marginLeft = '10px';
        nameSpan.style.fontWeight = 'bold';
        // Usamos nombre + apellido (manejando posibles errores de escritura en la BD)
        const nombre = usuarioLogueado.name || usuarioLogueado.Name || "";
        const apellido = usuarioLogueado.lastName || usuarioLogueado.lastname || "";
        nameSpan.textContent = `${nombre} ${apellido}`;
        profileInfo.appendChild(nameSpan);
    }

    
    const tablaCitas = document.getElementById('tablaCitasBody');
    const filterDateInput = document.getElementById('filterDate');
    const clearFilterBtn = document.getElementById('clearFilter');
    
    let todasMisCitas = []; // Aquí guardaremos la copia original de los datos

    try {
        const response = await fetch('http://localhost:3000/api/mis-citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuarioLogueado.email })
        });

        const citas = await response.json();
        
        // Guardamos los datos originales para poder filtrar después
        todasMisCitas = citas; 
        
        // Mostramos todo al principio
        mostrarCitas(todasMisCitas);

    } catch (error) {
        console.error("Error obteniendo historial:", error);
        tablaCitas.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error de conexión con el servidor.</td></tr>`;
    }

   
    function mostrarCitas(listaDeCitas) {
        tablaCitas.innerHTML = ''; // Limpiar tabla antes de dibujar

        if (listaDeCitas.length === 0) {
            tablaCitas.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No se encontraron citas.</td></tr>`;
            return;
        }

        listaDeCitas.forEach(cita => {
            // Convertir la fecha fea de la BD a algo bonito
            const fechaObj = new Date(cita.fechaCompleta);
            const fechaBonita = fechaObj.toLocaleDateString();
            const horaBonita = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${fechaBonita} <br> <small>${horaBonita}</small></td>
                <td>Dr(a). ${cita.docNombre} ${cita.docApellido}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.concepto}</td>
                <td>
                    <span class="status-badge status-${(cita.estatus || 'pendiente').toLowerCase()}">
                        ${cita.estatus || 'Pendiente'}
                    </span>
                </td>
            `;
            tablaCitas.appendChild(fila);
        });
    }

 
    filterDateInput.addEventListener('change', (e) => {
        const fechaSeleccionada = e.target.value; // Formato YYYY-MM-DD
        
        if (!fechaSeleccionada) return;

        console.log("📅 Filtrando historial por:", fechaSeleccionada);

        // Filtramos la lista original
        const citasFiltradas = todasMisCitas.filter(cita => {
            // La fecha viene del server como "2025-05-10T14:00:00.000Z"
            // Cortamos los primeros 10 caracteres para comparar solo "2025-05-10"
            const fechaCitaSoloDia = cita.fechaCompleta.substring(0, 10);
            return fechaCitaSoloDia === fechaSeleccionada;
        });

        mostrarCitas(citasFiltradas);
    });

    // Botón para limpiar y ver todas de nuevo
    clearFilterBtn.addEventListener('click', () => {
        filterDateInput.value = ''; // Borrar input
        mostrarCitas(todasMisCitas); // Mostrar lista completa original
    });

});