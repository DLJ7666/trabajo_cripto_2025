#!/usr/bin/env python3
"""
Script para ejecutar múltiples instancias HTTPS en diferentes puertos.

Inicia 4 servidores HTTPS en paralelo, cada uno en su propio puerto.
"""

import os
import sys
import signal
import subprocess
import time
import argparse

try:
    from generate_certs import generate_all_certificates
except ImportError:
    generate_all_certificates = None


# Puertos por defecto para las 4 instancias
DEFAULT_PORTS = [8443, 8444, 8445, 8446]

# Lista para mantener los procesos con estado
processes = []
terminated_processes = set()


def cleanup(signum=None, frame=None):
    """Detiene todos los procesos hijos de forma limpia."""
    print("\n\nDeteniendo todas las instancias...")
    for proc in processes:
        if proc.poll() is None:  # Si el proceso sigue corriendo
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
    print("Todas las instancias detenidas.")
    sys.exit(0)


def start_instance(port: int, host: str = "0.0.0.0") -> subprocess.Popen:
    """
    Inicia una instancia del servidor en el puerto especificado.
    
    Args:
        port: Puerto para el servidor
        host: Host para el servidor
        
    Returns:
        Proceso Popen de la instancia
    """
    cmd = [
        sys.executable, "app.py",
        "--port", str(port),
        "--host", host
    ]
    
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    return proc


def main():
    """Función principal."""
    parser = argparse.ArgumentParser(
        description='Ejecutar múltiples instancias HTTPS'
    )
    parser.add_argument(
        '--ports', '-p',
        type=int,
        nargs='+',
        default=DEFAULT_PORTS,
        help=f'Puertos para las instancias (por defecto: {DEFAULT_PORTS})'
    )
    parser.add_argument(
        '--host', '-H',
        type=str,
        default='0.0.0.0',
        help='Host para los servidores (por defecto: 0.0.0.0)'
    )
    parser.add_argument(
        '--generate-certs', '-g',
        action='store_true',
        help='Generar certificados antes de iniciar'
    )
    
    args = parser.parse_args()
    
    # Configurar manejadores de señales
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    # Generar certificados si se solicita
    if args.generate_certs:
        if generate_all_certificates is None:
            print("Error: No se pudo importar el módulo generate_certs.")
            print("Asegúrese de que generate_certs.py existe.")
            return 1
        print("Generando certificados...")
        generate_all_certificates(args.ports)
        print()
    
    # Verificar que existen los certificados
    for port in args.ports:
        cert_file = f"certs/cert_{port}.pem"
        key_file = f"certs/key_{port}.pem"
        if not os.path.exists(cert_file) or not os.path.exists(key_file):
            print(f"Error: Certificados no encontrados para puerto {port}")
            print("Ejecute: python generate_certs.py")
            print("O use: python run_instances.py --generate-certs")
            return 1
    
    print("=" * 60)
    print("     INICIANDO MÚLTIPLES INSTANCIAS HTTPS")
    print("=" * 60)
    print()
    
    # Iniciar todas las instancias
    for port in args.ports:
        print(f"Iniciando instancia en puerto {port}...")
        proc = start_instance(port, args.host)
        processes.append(proc)
        time.sleep(0.5)  # Pequeña pausa entre inicios
    
    print()
    print("=" * 60)
    print("     INSTANCIAS ACTIVAS")
    print("=" * 60)
    for port in args.ports:
        print(f"  → https://localhost:{port}/")
    print()
    print("Presione Ctrl+C para detener todas las instancias")
    print("=" * 60)
    print()
    
    # Mantener el script corriendo y mostrar output
    try:
        while True:
            # Verificar si algún proceso terminó
            for i, proc in enumerate(processes):
                if proc.poll() is not None and i not in terminated_processes:
                    terminated_processes.add(i)
                    print(f"Instancia en puerto {args.ports[i]} terminó inesperadamente")
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()
    
    return 0


if __name__ == '__main__':
    exit(main())
