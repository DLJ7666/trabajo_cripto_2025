@echo off
echo Iniciando sistema...

:: 1. Iniciar Backend (Censo) en puerto 8000
:: Se abre en una ventana nueva
start "Backend Censo" uvicorn Censo.Cs:appC --reload --port 8000

:: 2. Iniciar Frontend en puerto 3000
:: Se abre en una ventana nueva
cd frontend
start "Frontend" python -m http.server 3000

echo.
echo Sistema iniciado!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:3000
echo.
pause