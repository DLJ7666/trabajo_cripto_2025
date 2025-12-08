function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) result = (result * base) % mod;
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }
    return result;
}

function inverso(a, n) {
    // Asegurarnos de que a sea positivo
    a = ((a % n) + n) % n;

    let t = 0, nuevoT = 1;
    let r = n, nuevoR = a;

    while (nuevoR !== 0) {
        const cociente = Math.floor(r / nuevoR);

        // Actualizamos t
        let tempT = t;
        t = nuevoT;
        nuevoT = tempT - cociente * nuevoT;

        // Actualizamos r
        let tempR = r;
        r = nuevoR;
        nuevoR = tempR - cociente * nuevoR;
    }

    if (r > 1) {
        // No existe inverso si gcd(a,n) != 1
        return null;
    }

    // Aseguramos que el inverso sea positivo
    if (t < 0) {
        t += n;
    }

    return t;
}

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
    const btnLogin = document.getElementById('btn-login');
    const loginSection = document.getElementById('login-section');
    const votingSection = document.getElementById('voting-section');
    const userDisplay = document.getElementById('user-display');
    const kButtons = document.querySelectorAll('.btn-k');
    const kGrid = document.getElementById('k-grid');
    const kMsg = document.getElementById('k-selection-msg');

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

    const currentUserRsa= null;

    let currentUser = null;
    let selectedK = null;

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

    kButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (signatures.c1 || signatures.c2 || signatures.c3) {
                return;
            }

            kButtons.forEach(b => {
                b.style.backgroundColor = ''; // Restaurar color original
                b.style.color = '';
                b.classList.remove('selected');
            });

            btn.style.backgroundColor = '#4CAF50'; // Verde selección
            btn.style.color = 'white';
            btn.classList.add('selected');
            
            selectedK = parseInt(btn.getAttribute('data-value'));
            log(`Valor k seleccionado: ${selectedK}`);
            
            btnC1.disabled = false;
            btnC2.disabled = false;
            btnC3.disabled = false;
            kMsg.textContent = `Valor k=${selectedK} seleccionado. Procede a identificarte.`;
        });
    });

    async function identifyWithC(clave, c_id) {
        if (!selectedK) {
            alert("Por favor, selecciona un valor para k primero.");
            return;
        }

        const pk = publicKeys[`c${c_id}`];
        console.log('Public Key:', pk);
        if (!pk) {
            alert(`Primero debes obtener la clave pública de C${c_id}.`);
            log(`Error: Intento de identificación sin clave pública de C${c_id}.`);
            return;
        }

        kButtons.forEach(b => b.disabled = true);
        kMsg.textContent = `Valor k=${selectedK} fijado.`;

        log(`Iniciando identificación con C${c_id}...`);

        const certUsername = currentUser;
        const certPassword = USUARIOS_VALIDOS[currentUser];

        try {
            const kProcesada = modPow(selectedK, pk.e, pk.n)
            const mensaje = (clave * kProcesada) % pk.n;
            
            const certificado = `${certUsername}-${certPassword}`;

            log(`Enviando a C${c_id}:\nMensaje: ${mensaje}\nCertificado: ${certificado}`);

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

        const firmasDescegadas = {
            c1: null,
            c2: null,
            c3: null,
        }

        for (const c_id of [1, 2, 3]) {
            const sig = signatures[`c${c_id}`];
            const pk = publicKeys[`c${c_id}`];

            // Descegar la firma
            const firmaDescegada = sig.firma * inverso(selectedK, pk.n);
            firmasDescegadas[`c${c_id}`] = firmaDescegada;
        }
        
        const voto = {
            eleccion: "Candidato_A", // O la opción que elija el usuario
            identificaciones: firmasDescegadas
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

    btnKeyC1.addEventListener('click', () => getPublicKey(1));
    btnKeyC2.addEventListener('click', () => getPublicKey(2));
    btnKeyC3.addEventListener('click', () => getPublicKey(3));

    btnC1.addEventListener('click', () => identifyWithC(33,1));
    btnC2.addEventListener('click', () => identifyWithC(33,2));
    btnC3.addEventListener('click', () => identifyWithC(33,3));

    btnVote.addEventListener('click', vote);

    btnLogin.addEventListener('click', login);

    log('Sistema listo. Por favor, identifíquese.');
});
