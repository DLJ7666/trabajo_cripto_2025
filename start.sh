echo "Iniciando C1"
uvicorn C1:app  --reload --port 8800 &
echo "Iniciando C2"
uvicorn C2:app  --reload --port 8801 &
echo "Iniciando C3"
uvicorn C3:app  --reload --port 8802 &
echo "Iniciando VS"
uvicorn VS:app  --reload --port 8888 &