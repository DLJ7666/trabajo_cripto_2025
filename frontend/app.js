document.addEventListener('DOMContentLoaded', () => {
    const btnC1 = document.getElementById('btn-c1');
    const btnC2 = document.getElementById('btn-c2');
    const btnC3 = document.getElementById('btn-c3');
    const btnKeyC1 = document.getElementById('clave-c1');
    const btnKeyC2 = document.getElementById('clave-c2');
    const btnKeyC3 = document.getElementById('clave-c3');
    const btnVote = document.getElementById('btn-vote');
    const logOutput = document.getElementById('log-output');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    const USUARIOS_VALIDOS = {
    "JohnnyMelabo": "password123",
    "NipinchoNipongo": "password456",
    }

    const signatures = {
        c1: null,
        c2: null,
        c3: null,
    };

    const publicKeys = {
        c1: null,
        c2: null,
        c3: null
    };

    let currentUser = null;

    const btnLogin = document.getElementById('btn-login');
    const loginSection = document.getElementById('login-section');
    const votingSection = document.getElementById('voting-section');
    const userDisplay = document.getElementById('user-display');

    function log(message) {
        console.log(message);
        logOutput.textContent = `${new Date().toLocaleTimeString()}: ${message}\n\n` + logOutput.textContent;
    }

    function login() {
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        if (!username || !password) {
            log("Error: Debes introducir usuario y contraseña.");
            alert("Por favor, introduce usuario y contraseña.");
            return;
        }

        if (USUARIOS_VALIDOS[username]) {
            if (USUARIOS_VALIDOS[username] === password) {
                log(`Inicio de sesión exitoso para: ${username}`);
            
                if (loginSection) loginSection.style.display = 'none';
                if (votingSection) votingSection.style.display = 'block';
            
                if (userDisplay) userDisplay.textContent = username;
                currentUser = username;

                passwordInput.value = '';
            } else {
                log(`Intento de inicio de sesión fallido para: ${username}`);
                alert("Contraseña incorrecta.");
            }
        } else {
            log(`Intento de inicio de sesión no válido para: ${username}`);
            alert("Usuario no registrado.");
        }
    }

    async function getPublicKey(c_id) {
        log(`Solicitando clave pública de C${c_id}...`);
        try {
            const response = await fetch(`${API_BASE_URL}/public_key/${c_id}`);
            const pubkeySpan = document.getElementById(`pubkey-c${c_id}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Guardamos la clave
            publicKeys[`c${c_id}`] = data;

            if (pubkeySpan) {
                pubkeySpan.textContent = `n: ${data.n}, e: ${data.e}`;
                pubkeySpan.style.color = 'green';
                pubkeySpan.style.fontWeight = 'bold';
            }
            
            log(`Clave Pública C${c_id} recibida:\nn: ${data.n}\ne: ${data.e}`);
            
            // Opcional: Deshabilitar el botón para indicar que ya se tiene
            document.getElementById(`clave-c${c_id}`).textContent = `✓ Clave C${c_id} Recibida`;
            document.getElementById(`clave-c${c_id}`).disabled = true;

        } catch (error) {
            log(`Error al obtener clave de C${c_id}: ${error.message}`);
        }
    }

    async function identifyWithC(clave, c_id) {
        log(`Iniciando identificación con C${c_id}...`);

        const certUsername = currentUser;
        const certPassword = USUARIOS_VALIDOS[currentUser];

        try {
            const mensaje = 1000000000
            
            // 2. Generamos un "certificado" único para esta solicitud.
            //    Usamos un timestamp para asegurar que no se repita.
            const certificado = `${certUsername}-${certPassword}`;

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

    btnKeyC1.addEventListener('click', () => getPublicKey(1));
    btnKeyC2.addEventListener('click', () => getPublicKey(2));
    btnKeyC3.addEventListener('click', () => getPublicKey(3));

    btnVote.addEventListener('click', vote);

    btnLogin.addEventListener('click', login);

    log('Sistema listo. Por favor, identifíquese.');
});
