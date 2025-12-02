import rsa

def firmar(mensaje: int, clave_privada):
    # Lógica para firmar el mensaje
    firma = rsa.sign(str(mensaje), clave_privada, 'SHA-512')
    return firma