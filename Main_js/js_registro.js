document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Buscamos el formulario en el HTML
    const form = document.getElementById('registration-form');
    const registerBtn = document.querySelector('.register-btn');

    // Validación de seguridad por si el archivo carga mal
    if (!form) return;

    // 2. Escuchamos cuando el usuario le da clic a "Register"
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // 🛑 IMPORTANTE: Evita que la página se recargue sola

        // 3. Validar que las contraseñas sean iguales
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert("❌ Passwords do not match! Please try again.");
            return; // Se detiene aquí si no coinciden
        }

        // 4. Recolectar TODOS los datos del formulario
        const datosUsuario = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: password,
            // Aquí tomamos el valor numérico (1 o 2) del select
            gender: document.getElementById('gender').value, 
            address: document.getElementById('address').value,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value
        };

        // 5. Enviar los datos al Servidor (server.js)
        try {
            // Efecto visual: Cambiar botón a "Cargando..."
            if(registerBtn) {
                registerBtn.textContent = "Registering...";
                registerBtn.disabled = true;
            }

            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();

            // 6. Verificar si el servidor dijo "SI" o "NO"
            if (response.ok) {
                alert("✅ Registration Successful! Please Log In.");
                // Redirigir al Login para que entre con su cuenta nueva
                window.location.href = "../Main_index/index.html"; 
            } else {
                alert("❌ Error: " + (data.message || "Registration failed."));
            }

        } catch (error) {
            console.error("Error:", error);
            alert("❌ Connection Error. Is the server (black window) running?");
        } finally {
            // Restaurar el botón a la normalidad
            if(registerBtn) {
                registerBtn.textContent = "Register";
                registerBtn.disabled = false;
            }
        }
    });
});