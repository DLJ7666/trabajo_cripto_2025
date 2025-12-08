def firmar(mensaje: int, clave_privada):
    # Lógica para firmar el mensaje
    firma = pow(mensaje, clave_privada.d, clave_privada.n)
    return firma