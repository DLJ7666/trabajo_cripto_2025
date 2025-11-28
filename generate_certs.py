#!/usr/bin/env python3
"""
Script para generar certificados SSL autofirmados para cada instancia HTTPS.
Genera un certificado y clave privada por cada puerto especificado.
"""

import os
import subprocess
import sys


def generate_certificate(port: int, certs_dir: str = "certs") -> tuple:
    """
    Genera un certificado SSL autofirmado para un puerto específico.
    
    Args:
        port: Número de puerto para el certificado
        certs_dir: Directorio donde guardar los certificados
        
    Returns:
        Tuple con las rutas al certificado y clave privada
    """
    os.makedirs(certs_dir, exist_ok=True)
    
    cert_file = os.path.join(certs_dir, f"cert_{port}.pem")
    key_file = os.path.join(certs_dir, f"key_{port}.pem")
    
    if os.path.exists(cert_file) and os.path.exists(key_file):
        print(f"Certificados para puerto {port} ya existen.")
        return cert_file, key_file
    
    # Generar certificado autofirmado con OpenSSL (2048 bits para mejor rendimiento)
    cmd = [
        "openssl", "req", "-x509", "-newkey", "rsa:2048",
        "-keyout", key_file,
        "-out", cert_file,
        "-days", "365",
        "-nodes",
        "-subj", f"/CN=localhost/O=TrabajoCripto/OU=Instance{port}"
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Certificado generado para puerto {port}: {cert_file}")
        return cert_file, key_file
    except subprocess.CalledProcessError as e:
        print(f"Error generando certificado para puerto {port}: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("Error: OpenSSL no está instalado. Por favor instálelo primero.")
        sys.exit(1)


def generate_all_certificates(ports: list, certs_dir: str = "certs") -> dict:
    """
    Genera certificados para todos los puertos especificados.
    
    Args:
        ports: Lista de puertos
        certs_dir: Directorio donde guardar los certificados
        
    Returns:
        Diccionario con puerto -> (cert_file, key_file)
    """
    certificates = {}
    for port in ports:
        cert_file, key_file = generate_certificate(port, certs_dir)
        certificates[port] = (cert_file, key_file)
    return certificates


if __name__ == "__main__":
    # Puertos por defecto para las 4 instancias
    DEFAULT_PORTS = [8443, 8444, 8445, 8446]
    
    if len(sys.argv) > 1:
        try:
            ports = [int(p) for p in sys.argv[1:]]
        except ValueError:
            print("Error: Los puertos deben ser números enteros.")
            sys.exit(1)
    else:
        ports = DEFAULT_PORTS
    
    print(f"Generando certificados para puertos: {ports}")
    certificates = generate_all_certificates(ports)
    print("\nCertificados generados exitosamente:")
    for port, (cert, key) in certificates.items():
        print(f"  Puerto {port}: {cert}, {key}")
