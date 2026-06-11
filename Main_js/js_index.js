const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorAlert = document.getElementById('errorAlert');
const successAlert = document.getElementById('successAlert');
const errorMessage = document.getElementById('errorMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    successAlert.style.display = 'none';
}

function showSuccess() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'flex';
}

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;

    // 1. Poner botón en modo carga
    loginBtn.innerHTML = 'Verificando...';
    loginBtn.disabled = true;

    try {
        // 2. ENVIAR DATOS AL SERVIDOR (A TU VENTANA NEGRA)
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 3. SI EL LOGIN ES CORRECTO
            showSuccess();
            // Guardamos el usuario para que las otras páginas sepan quién entró
            localStorage.setItem('usuarioLogueado', JSON.stringify(data.user));
            
            setTimeout(() => {
                window.location.href = "../Main_index/principal.html"; 
            }, 1500);
        } else {
            // 4. SI LA CONTRASEÑA ESTÁ MAL
            showError(data.message || 'Correo o contraseña incorrectos');
        }

    } catch (error) {
        console.error(error);
        showError('Error: No se puede conectar con el servidor (Revisa la ventana negra)');
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
});