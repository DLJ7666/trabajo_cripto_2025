@echo off
echo Iniciando sistema...

:: 1. Iniciar Backend (Censo) en puerto 8000
:: Se abre en una ventana nueva
start "Backend Censo" uvicorn Censo.Cs:appC --reload --port 8000

:: 2, Iniciar Backend (Sistema de voto) en puerto 8888
start "Backend Sistema de Voto" uvicorn SistemaVoto.VS:appV --reload --port 8888

:: 3. Iniciar Frontend en puerto 3000
:: Se abre en una ventana nueva
cd frontend
start "Frontend" python -m http.server 3000

echo.
echo Sistema iniciado!
echo Backend Censo: http://127.0.0.1:8000
echo Backend Sistema de Voto: http://127.0.0.1:8888
echo Frontend: http://127.0.0.1:3000
echo.
pause