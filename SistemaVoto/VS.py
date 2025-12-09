from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random

appV = FastAPI()

appV.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

registro = {}

@appV.get("/identify")
def identify(identificacion_c1: int = Header(...), n_c1: int = Header(...), e_c1: int = Header(...),
             identificacion_c2: int = Header(...), n_c2: int = Header(...), e_c2: int = Header(...),
             identificacion_c3: int = Header(...), n_c3: int = Header(...), e_c3: int = Header(...),
             e= Header(...)):
    e_int = int(e.replace('"', ''))
    # alias_c1 = pow(identificacion_c1, e_c1, n_c1)
    # alias_c2 = pow(identificacion_c2, e_c2, n_c2)
    # alias_c3 = pow(identificacion_c3, e_c3, n_c3)
    if e_int in registro:
            raise HTTPException(status_code=401, detail="Votante ya registrado")
    else:
            mensaje = random.randint(1, 2**8)
            registro[e_int] = mensaje
            return mensaje
    # else:
    #     raise HTTPException(status_code=400, detail="Identificaciones no coinciden "
    #                         +str(alias_c1)+" "+str(alias_c2)+" "+str(alias_c3))

@appV.get("/verify")
def verify(mensaje: int = Header(...), response: int = Header(...), n: int = Header(...)):
    print(registro)
    alias = None
    for key in registro.keys():
        expected_message = registro[key]
        if expected_message == mensaje:
            alias = key
            break
    if alias is None:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if pow(response, alias, n) == mensaje:
            return {
                  "mensaje": "Usuario verificado correctamente",
                  "status": True
                  }
    else:
            raise HTTPException(status_code=400, detail="Voto no verificado")