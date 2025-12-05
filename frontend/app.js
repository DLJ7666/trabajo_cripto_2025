document.addEventListener('DOMContentLoaded', () => {
    const btnC1 = document.getElementById('btn-c1');
    const btnC2 = document.getElementById('btn-c2');
    const btnC3 = document.getElementById('btn-c3');
    const btnVote = document.getElementById('btn-vote');
    const logOutput = document.getElementById('log-output');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // URL base de tu API. Asegúrate de que el puerto sea el correcto.
    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Almacenaremos las firmas aquí
    const signatures = {
        c1: null,
        c2: null,
        c3: null,
    };

    function log(message) {
        console.log(message);
        logOutput.textContent = `${new Date().toLocaleTimeString()}: ${message}\n\n` + logOutput.textContent;
    }

    async function identifyWithC(clave, c_id) {
        log(`Iniciando identificación con C${c_id}...`);

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            log("Error: Debes introducir usuario y contraseña.");
            return;
        }

        try {
            const mensaje = 1000000000
            
            // 2. Generamos un "certificado" único para esta solicitud.
            //    Usamos un timestamp para asegurar que no se repita.
            const certificado = `cert-${c_id}-${Date.now()}`;

            log(`Enviando a C${c_id}:\nMensaje: ${mensaje}\nCertificado: ${certificado}`);

            // 3. Hacemos la llamada a la API
            const response = await fetch(`${API_BASE_URL}/identify/${c_id}`, {
                method: 'GET',
                headers: {
                    'mensaje': mensaje,
                    'certificado': certificado,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error del servidor: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            const firma = data.message;

            // 4. Guardamos la firma y actualizamos la UI
            signatures[`c${c_id}`] = { mensaje, firma };
            log(`Éxito con C${c_id}! Firma recibida:\n${firma}`);
            
            document.getElementById(`btn-c${c_id}`).disabled = true;
            document.getElementById(`btn-c${c_id}`).textContent = `✓ Identificado con C${c_id}`;

            // 5. Verificamos si ya tenemos todas las firmas para habilitar el voto
            checkAllSignatures();

        } catch (error) {
            log(`Error al identificarse con C${c_id}: ${error.message}`);
        }
    }

    function checkAllSignatures() {
        if (signatures.c1 && signatures.c2 && signatures.c3) {
            log('¡Todas las firmas obtenidas! Ya puedes votar.');
            btnVote.disabled = false;
        }
    }

    function vote() {
        log('Iniciando proceso de voto...');
        // Aquí iría la lógica para comunicarte con el servidor de votación (VS)
        // Deberías enviar tu elección de voto junto con las tres firmas obtenidas.
        
        const voto = {
            eleccion: "Candidato_A", // O la opción que elija el usuario
            identificaciones: signatures
        };

        log('Enviando voto al Servidor de Votación (VS)...');
        log(JSON.stringify(voto, null, 2));

        // Simulación de llamada a la API de VS
        // fetch('http://<url_vs>/votar', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(voto)
        // })
        // .then(response => response.json())
        // .then(data => log(`Respuesta de VS: ${data.message}`))
        // .catch(error => log(`Error al votar: ${error.message}`));

        alert("¡Voto enviado! (Simulación)");
        btnVote.disabled = true;
    }

    btnC1.addEventListener('click', () => identifyWithC(1));
    btnC2.addEventListener('click', () => identifyWithC(2));
    btnC3.addEventListener('click', () => identifyWithC(3));
    btnVote.addEventListener('click', vote);

    log('Sistema listo. Por favor, identifíquese.');
});
