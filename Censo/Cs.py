import rsa
from fastapi import FastAPI, Header, HTTPException

from firmar import firmar

appC = FastAPI()

clave_publica_C1, clave_privada_C1 = rsa.newkeys(512)
clave_publica_C2, clave_privada_C2 = rsa.newkeys(512)
clave_publica_C3, clave_privada_C3 = rsa.newkeys(512)
registro_C1 = set()
registro_C2 = set()
registro_C3 = set()

USUARIOS_VALIDOS = {
    "JohnnyMelabo": "password123",
    "NipinchoNipongo": "password456",
    }

@appC.get("/public_key/{c_id}")
def get_public_key(c_id: int):
    if c_id == 1:
        return {
            "n": clave_publica_C1.n,
            "e": clave_publica_C1.e
        }
    elif c_id == 2:
        return {
            "n": clave_publica_C2.n,
            "e": clave_publica_C2.e
        }
    elif c_id == 3:
        return {
            "n": clave_publica_C3.n,
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