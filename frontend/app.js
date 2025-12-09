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
    const vButtons = document.querySelectorAll('.btn-k');
    const mGrid = document.getElementById('m-grid');
    const mMsg = document.getElementById('m-selection-msg');

    const API_BASE_URL = 'http://127.0.0.1:8000';
    
    const USUARIOS_VALIDOS = {
    "JohnnyMentero": "password123",
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

    let currentUserRsaPrivate= null;
    let currentUserRsaPublic= null;
    let currentUser = null;
    let selectedK = null;

    let mensajeVS = null;

    function log(message) {
        console.log(message);
        logOutput.textContent = `${new Date().toLocaleTimeString()}: ${message}\n\n` + logOutput.textContent;
    }

    async function login() {
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
                 
                async function obtenerMiClaveRSA() {
                    try {
                        const response = await fetch(API_BASE_URL+'/myrsa_key');
                        if (!response.ok) {
                            throw new Error(`Error HTTP: ${response.status}`);
                        }
                        const data = await response.json();

                        currentUserRsaPublic = {
                            n: data.publica.n,
                            e: data.publica.e
                        }
                        currentUserRsaPrivate = data.privada.d
                        
                        console.log('Clave recibida del servidor:', currentUserRsaPublic,
                            currentUserRsaPrivate);
                        
                    } catch (error) {
                        console.error('Error al obtener la clave RSA:', error);
                        alert('No se pudo obtener la clave RSA del servidor.');
                    }
                }
            obtenerMiClaveRSA();
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
            const kProcesada = await fetch (`${API_BASE_URL}/pow`, {
                method: 'GET',
                headers: {
                    'a': JSON.stringify(selectedK),
                    'b': JSON.stringify(pk.e),
                    'n': JSON.stringify(pk.n)
                }
            });
            const kProcesadaData = await kProcesada.json();
            console.log('k procesada recibida:', kProcesadaData);
            const mensaje = (clave * kProcesadaData) % pk.n;
            
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
            signatures[`c${c_id}`] = { firma };
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

    let selectedParty = null;

    document.querySelectorAll('.btn-party').forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase de selección a todos
            document.querySelectorAll('.btn-party').forEach(b => b.classList.remove('selected'));
            // Marcar el botón clickeado
            btn.classList.add('selected');
            selectedParty = btn.dataset.party;
            document.getElementById('party-selection-msg').textContent = `Has seleccionado: ${selectedParty}`;
            // Habilitar botón de votar si ya se tienen las firmas
            if (signatures.c1 && signatures.c2 && signatures.c3) {
                document.getElementById('btn-vote').disabled = false;
            }
        });
    });

    async function vote() {
        if (!selectedParty) {
            alert("Debes seleccionar un candidato antes de votar.");
            return;
        }

        log('Iniciando proceso de voto...');

        const firmasDescegadas = {
            c1: null,
            c2: null,
            c3: null,
        }

        for (const c_id of [1, 2, 3]) {
            const sig = signatures[`c${c_id}`];
            const pk = publicKeys[`c${c_id}`];

            // Descegar la firma
            const inverso = await fetch(`${API_BASE_URL}/pow`, {
                method: 'GET',
                headers: {
                    'a': JSON.stringify(selectedK),
                    'b': JSON.stringify(-1),
                    'n': JSON.stringify(pk.n)
                }
            });
            const inversoData = await inverso.json();
            console.log(`Inverso de k para C${c_id} recibido:`, inversoData);
            const firmaDescegada = (sig.firma * inversoData) % pk.n;
            firmasDescegadas[`c${c_id}`] = firmaDescegada;
        }

        log('Firmas descegadas:');
        log(JSON.stringify(firmasDescegadas, null, 2));

        // Usar selectedParty como elección
        const voto = {
            eleccion: selectedParty,
            identificaciones: firmasDescegadas
        };

        log('Enviando voto al Servidor de Votación (VS)...');
        log(JSON.stringify(voto, null, 2));

        const cabecera = {
                'identificacion-c1': JSON.stringify(firmasDescegadas.c1),
                'n-c1': JSON.stringify(publicKeys.c1.n),
                'e-c1': JSON.stringify(publicKeys.c1.e),
                'identificacion-c2': JSON.stringify(firmasDescegadas.c2),
                'n-c2': JSON.stringify(publicKeys.c2.n),
                'e-c2': JSON.stringify(publicKeys.c2.e),
                'identificacion-c3': JSON.stringify(firmasDescegadas.c3),
                'n-c3': JSON.stringify(publicKeys.c3.n),
                'e-c3': JSON.stringify(publicKeys.c3.e),
                'e': JSON.stringify(currentUserRsaPublic.e),
            };

        log('Enviando identificación al VS...');
        log(JSON.stringify(cabecera, null, 2));

        const response = await fetch('http://localhost:8888/identify', {
            method: 'GET',
            headers: cabecera
        });
        const mensaje = await response.json();
        log(`Respuesta del Servidor de Votación:\n${JSON.stringify(mensaje)}`);
        mensajeVS = mensaje;

        const cabecera_pou = {
                'a': JSON.stringify(mensajeVS),
                'b': currentUserRsaPrivate,
                'n': currentUserRsaPublic.n
            }

        const potenciaRespuestaVS = await fetch(API_BASE_URL+"/pow", {
            method: 'GET',
            headers: cabecera_pou
        });

        const respuestaVS = await potenciaRespuestaVS.json();

        const cabecera_verificacion = {
                'mensaje': JSON.stringify(mensajeVS),
                'response': JSON.stringify(respuestaVS),
                'n': currentUserRsaPublic.n,
        };
        
        log(cabecera_verificacion);
        
        const verificacion = await fetch('http://localhost:8888/verify', {
            method: 'GET',
            headers: cabecera_verificacion
        });

        const chequeo = await verificacion.json();
        log(`Verificación de la respuesta del VS: \n${chequeo.mensaje}`);
        
        if (chequeo.status) {
            alert("¡Usuario verificado! Ya puede emitir su voto.")
        };
    };



    btnKeyC1.addEventListener('click', () => getPublicKey(1));
    btnKeyC2.addEventListener('click', () => getPublicKey(2));
    btnKeyC3.addEventListener('click', () => getPublicKey(3));

    btnC1.addEventListener('click', () => identifyWithC(currentUserRsaPublic.e,1));
    btnC2.addEventListener('click', () => identifyWithC(currentUserRsaPublic.e,2));
    btnC3.addEventListener('click', () => identifyWithC(currentUserRsaPublic.e,3));

    btnVote.addEventListener('click', vote);

    btnLogin.addEventListener('click', login);

    log('Sistema listo. Por favor, identifíquese.');
});
