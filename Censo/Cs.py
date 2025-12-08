import rsa
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from firmar import firmar

appC = FastAPI()

appC.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clave_publica_C1, clave_privada_C1 = rsa.newkeys(16)
clave_publica_C2, clave_privada_C2 = rsa.newkeys(16)
clave_publica_C3, clave_privada_C3 = rsa.newkeys(16)
registro_C1 = set()
registro_C2 = set()
registro_C3 = set()

@appC.get("/myrsa_key")
def get_my_rsa_key():
    mi_clave_publica, mi_clave_privada = rsa.newkeys(16)
    return {
        "publica": int(mi_clave_publica),
        "privada": mi_clave_privada
    }

@appC.get("/public_key/{c_id}")
def get_public_key(c_id: int):
    if c_id == 1:
        return {
            "n": int(clave_publica_C1.n),
            "e": clave_publica_C1.e
        }
    elif c_id == 2:
        return {
            "n": int(clave_publica_C2.n),
            "e": clave_publica_C2.e
        }
    elif c_id == 3:
        return {
            "n": int(clave_publica_C3.n),
            "e": clave_publica_C3.e
        }
    else:
        raise HTTPException(status_code=404, detail="Clave pública no encontrada")

@appC.get("/identify/{c_id}")
def identify(c_id: int, mensaje : int = Header(...), certificado: str = Header(...)):
    clave_privada = None
    if c_id == 1:
        if certificado in registro_C1:
            raise HTTPException(status_code=400, detail="Certificado ya utilizado para C1")
        else :
            registro_C1.add(certificado)
            clave_privada = clave_privada_C1
    elif c_id == 2:
        if certificado in registro_C2:
            raise HTTPException(status_code=400, detail="Certificado ya utilizado para C2")
        else:
            registro_C2.add(certificado)
            clave_privada = clave_privada_C2
    elif c_id == 3:
        if certificado in registro_C3:
            raise HTTPException(status_code=400, detail="Certificado ya utilizado para C3")
        else:
            registro_C3.add(certificado)
            clave_privada = clave_privada_C3
    else:
        raise HTTPException(status_code=404, detail="Clave privada no encontrada")
    
    return {"message": firmar(mensaje, clave_privada)}