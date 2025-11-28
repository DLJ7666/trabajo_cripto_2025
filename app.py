#!/usr/bin/env python3
"""
Aplicación Flask HTTPS que puede ejecutarse en múltiples instancias
en diferentes puertos.

Cada instancia tiene su propia identidad basada en el puerto.
"""

import os
import argparse
from flask import Flask, jsonify


def create_app(instance_id: str = None):
    """
    Crea y configura una instancia de la aplicación Flask.
    
    Args:
        instance_id: Identificador único de la instancia
        
    Returns:
        Aplicación Flask configurada
    """
    app = Flask(__name__)
    app.config['INSTANCE_ID'] = instance_id or os.environ.get('INSTANCE_ID', 'default')
    
    @app.route('/')
    def index():
        """Página principal con información de la instancia."""
        return jsonify({
            "mensaje": "¡Bienvenido a la aplicación HTTPS!",
            "instancia": app.config['INSTANCE_ID'],
            "protocolo": "HTTPS"
        })
    
    @app.route('/health')
    def health():
        """Endpoint de salud para verificar que la instancia está funcionando."""
        return jsonify({
            "estado": "saludable",
            "instancia": app.config['INSTANCE_ID']
        })
    
    @app.route('/info')
    def info():
        """Información detallada de la instancia."""
        return jsonify({
            "instancia_id": app.config['INSTANCE_ID'],
            "version": "1.0.0",
            "descripcion": "Servidor HTTPS multi-instancia para trabajo de criptografía"
        })
    
    return app


def main():
    """Función principal para ejecutar el servidor."""
    parser = argparse.ArgumentParser(
        description='Servidor HTTPS multi-instancia'
    )
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=8443,
        help='Puerto para el servidor HTTPS (por defecto: 8443)'
    )
    parser.add_argument(
        '--host', '-H',
        type=str,
        default='0.0.0.0',
        help='Host para el servidor (por defecto: 0.0.0.0)'
    )
    parser.add_argument(
        '--cert',
        type=str,
        default=None,
        help='Ruta al archivo de certificado SSL'
    )
    parser.add_argument(
        '--key',
        type=str,
        default=None,
        help='Ruta al archivo de clave privada SSL'
    )
    parser.add_argument(
        '--instance-id',
        type=str,
        default=None,
        help='Identificador de la instancia (por defecto: puerto)'
    )
    
    args = parser.parse_args()
    
    # Usar el puerto como ID de instancia si no se especifica
    instance_id = args.instance_id or f"instancia_{args.port}"
    
    # Rutas por defecto para certificados
    cert_file = args.cert or f"certs/cert_{args.port}.pem"
    key_file = args.key or f"certs/key_{args.port}.pem"
    
    # Verificar que existen los certificados
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print(f"Error: No se encontraron los certificados para el puerto {args.port}")
        print(f"  Certificado esperado: {cert_file}")
        print(f"  Clave esperada: {key_file}")
        print("\nEjecute primero: python generate_certs.py")
        return 1
    
    app = create_app(instance_id)
    
    print(f"\n=== Iniciando servidor HTTPS ===")
    print(f"  Instancia: {instance_id}")
    print(f"  Puerto: {args.port}")
    print(f"  URL: https://{args.host}:{args.port}/")
    print(f"  Certificado: {cert_file}")
    print("================================\n")
    
    # Ejecutar con SSL
    app.run(
        host=args.host,
        port=args.port,
        ssl_context=(cert_file, key_file),
        debug=False
    )
    
    return 0


if __name__ == '__main__':
    exit(main())
