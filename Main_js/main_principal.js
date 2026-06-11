// Selecciona todos los elementos con la clase 'list_button--click'
let listElement = document.querySelectorAll('.list_button--click');

// Sonido opcional (puedes eliminar si no lo usarás)
const clickSound = new Audio('click.mp3');

// Itera sobre cada elemento encontrado
listElement.forEach(listElement => {

    // Permitir activación con teclado (accesibilidad)
    listElement.setAttribute('tabindex', '0');

    // Evento de click
    listElement.addEventListener('click', () => {

        // Reproducir sonido (opcional)
        clickSound.play();

        // Alterna la clase 'arrow' (para rotación de icono/flecha)
        listElement.classList.toggle('arrow');

        // Cierra otros menús abiertos
        document.querySelectorAll('.list_show').forEach(otherMenu => {
            if (otherMenu !== listElement.nextElementSibling) {
                otherMenu.style.height = '0px';
                otherMenu.previousElementSibling.classList.remove('arrow');
            }
        });

        // Manejo del menú actual
        let menu = listElement.nextElementSibling;
        if (!menu || !menu.classList.contains('list_show')) return;

        let height = 0;

        if (menu.clientHeight === 0) {
            height = menu.scrollHeight;
        }

        menu.style.height = `${height}px`;
    });

    // Activación con tecla Enter
    listElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            listElement.click();
        }
    });
});

// Cerrar el menú si se hace clic afuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.list_button--click')) {
        document.querySelectorAll('.list_show').forEach(menu => {
            menu.style.height = '0px';
            menu.previousElementSibling.classList.remove('arrow');
        });
    }
});


listElement.forEach(button => {
    const menu = button.nextElementSibling;

    // Si el cursor sale del botón
    button.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!menu.matches(':hover') && !button.matches(':hover')) {
                menu.style.height = '0px';
                button.classList.remove('arrow');
            }
        }, 200);
    });

    // Si el cursor sale del menú
    menu.addEventListener('mouseleave', () => {
        menu.style.height = '0px';
        button.classList.remove('arrow');
    });
});

