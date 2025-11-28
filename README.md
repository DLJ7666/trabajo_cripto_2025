# Trabajo Cripto 2025

Aplicación HTTPS multi-instancia para el trabajo de criptografía.

## Descripción

Esta aplicación permite ejecutar múltiples instancias de un servidor HTTPS en diferentes puertos. Por defecto, se configuran 4 instancias en los puertos 8443, 8444, 8445 y 8446.

## Requisitos

- Python 3.8+
- OpenSSL (para generar certificados)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/DLJ7666/trabajo_cripto_2025.git
cd trabajo_cripto_2025
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Generar certificados SSL autofirmados:
```bash
python generate_certs.py
```

## Uso

### Opción 1: Ejecutar todas las instancias a la vez

```bash
python run_instances.py
```

Esto iniciará 4 servidores HTTPS en los puertos 8443, 8444, 8445 y 8446.

Para generar certificados automáticamente al iniciar:
```bash
python run_instances.py --generate-certs
```

### Opción 2: Ejecutar instancias individuales

```bash
# Primera instancia
python app.py --port 8443

# Segunda instancia (en otra terminal)
python app.py --port 8444

# Tercera instancia (en otra terminal)
python app.py --port 8445

# Cuarta instancia (en otra terminal)
python app.py --port 8446
```

### Opciones de configuración

**run_instances.py:**
- `--ports` o `-p`: Especificar puertos personalizados (ejemplo: `-p 9001 9002 9003 9004`)
- `--host` o `-H`: Host para los servidores (por defecto: 0.0.0.0)
- `--generate-certs` o `-g`: Generar certificados antes de iniciar

**app.py:**
- `--port` o `-p`: Puerto del servidor (por defecto: 8443)
- `--host` o `-H`: Host del servidor (por defecto: 0.0.0.0)
- `--cert`: Ruta al certificado SSL personalizado
- `--key`: Ruta a la clave privada SSL personalizada
- `--instance-id`: Identificador personalizado para la instancia

## Endpoints

Cada instancia expone los siguientes endpoints:

- `GET /` - Página principal con información de la instancia
- `GET /health` - Estado de salud de la instancia
- `GET /info` - Información detallada de la instancia

## Ejemplo de respuesta

```json
{
  "mensaje": "¡Bienvenido a la aplicación HTTPS!",
  "instancia": "instancia_8443",
  "protocolo": "HTTPS"
}
```

## Notas sobre certificados

Los certificados generados son autofirmados y solo deben usarse para desarrollo y pruebas. Los navegadores mostrarán una advertencia de seguridad que debe aceptarse para acceder a la aplicación.

Para acceder a las instancias:
- https://localhost:8443/
- https://localhost:8444/
- https://localhost:8445/
- https://localhost:8446/
