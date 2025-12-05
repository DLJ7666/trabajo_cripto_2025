echo "Iniciando el censo"
uvicorn C:app  --reload --port 8800 &
echo "Iniciando VS"
uvicorn VS:app  --reload --port 8888 &