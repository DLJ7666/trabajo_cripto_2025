from fastapi import FastAPI, Header, HTTPException
import rsa
from firmar.py import firmar

appC1 = FastAPI()

clave_publica_C1, clave_privada_C1 = rsa.newkeys(512)

@appC1.get("/public_key")
def get_public_key():
    return {
        "n": clave_publica_C1.n,
        "e": clave_publica_C1.e
    }

@appC1.get("/identify")
def identify(mensaje : int = Header(...)):
    return {"message": firmar(mensaje)}