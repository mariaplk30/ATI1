# index.py
import os
import json
from urllib.parse import parse_qs
from http.cookies import SimpleCookie

# Sesiones simples en memoria
SESSIONS = {}

def application(env, start_response):
    path = env.get('PATH_INFO', '/')
    if path.startswith("/ATI/"):
        path = path[len("/ATI"):]  # elimina el prefijo /ATI

    method = env['REQUEST_METHOD']
    query = parse_qs(env.get('QUERY_STRING', ''))
    cookies = SimpleCookie(env.get('HTTP_COOKIE', ''))

    # Manejo de sesión
    session_id = cookies.get('session_id')
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
        SESSIONS[session_id] = {}
    else:
        session_id = session_id.value
        if session_id not in SESSIONS:
            SESSIONS[session_id] = {}

    # Obtener idioma (cookie o query)
    lang = query.get("lang", [cookies.get("lang", "es")])[0]
    if hasattr(lang, 'value'):
        lang = lang.value

    headers = [
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET"),
        ("Access-Control-Allow-Headers", "Content-Type"),
        ("Set-Cookie", f"session_id={session_id}; Path=/"),
        ("Set-Cookie", f"lang={lang}; Path=/"),
    ]

    base_dir = os.path.abspath(os.path.dirname(__file__))

    # SPA principal
    if path.endswith(".py") or path in ["/", ""]:
        file_path = os.path.join(base_dir, "index.html")
        if os.path.exists(file_path):
            with open(file_path, encoding="utf-8") as f:
                start_response("200 OK", headers + [("Content-Type", "text/html; charset=utf-8")])
                return [f.read().encode()]
        else:
            start_response("404 Not Found", headers)
            return [b"index.html no encontrado"]

    # Configuración por idioma
    if path.startswith("config"):
        config_path = os.path.join(base_dir, "conf", f"config{lang.upper()}.json")
        if os.path.exists(config_path):
            with open(config_path, encoding="utf-8") as f:
                start_response("200 OK", headers + [("Content-Type", "application/json")])
                return [f.read().encode()]
        else:
            start_response("404 Not Found", headers)
            return [b'{"error": "Idioma no soportado"}']

    # Perfil por CI
    elif path.startswith("perfil"):
        ci = query.get("ci", [None])[0]
        if ci:
            perfil_path = os.path.join(base_dir, ci, "perfil.json")
            if os.path.exists(perfil_path):
                with open(perfil_path, encoding="utf-8") as f:
                    start_response("200 OK", headers + [("Content-Type", "application/json")])
                    return [f.read().encode()]
            else:
                start_response("404 Not Found", headers)
                return [b'{"error": "Perfil no encontrado"}']
        else:
            start_response("400 Bad Request", headers)
            return [b'{"error": "Falta CI"}']

    # Listado de estudiantes
    elif path == "datos/index.json":
        file_path = os.path.join(base_dir, "datos", "index.json")
        if os.path.exists(file_path):
            with open(file_path, encoding="utf-8") as f:
                start_response("200 OK", headers + [("Content-Type", "application/json")])
                return [f.read().encode()]
        else:
            start_response("404 Not Found", headers)
            return [b"index.json no encontrado"]

    # Archivos estáticos (CSS, JS, JSON, imágenes)
    elif path.endswith((".css", ".js", ".json", ".png", ".jpg", ".ico", ".webp")):
        # Intentar primero en raíz, luego en subcarpetas conocidas
        file_path = os.path.join(base_dir, path.lstrip("/"))
        if not os.path.isfile(file_path):
            file_path = os.path.join(base_dir, "css", os.path.basename(path)) if "css/" in path else \
                        os.path.join(base_dir, "js", os.path.basename(path)) if "js/" in path else \
                        os.path.join(base_dir, "conf", os.path.basename(path)) if "conf/" in path else \
                        os.path.join(base_dir, "datos", os.path.basename(path))

        if os.path.isfile(file_path):
            ext = os.path.splitext(file_path)[1]
            content_types = {
                ".css": "text/css",
                ".js": "application/javascript",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".ico": "image/x-icon",
                ".webp": "image/webp",
            }
            content_type = content_types.get(ext, "application/octet-stream")
            with open(file_path, "rb") as f:
                start_response("200 OK", headers + [("Content-Type", content_type)])
                return [f.read()]
        else:
            start_response("404 Not Found", headers)
            return [f"{path} no encontrado".encode("utf-8")]

    # Fallback
    start_response("404 Not Found", headers)
    return ["Ruta no válida".encode("utf-8")]

# Local dev
if __name__ == "__main__":
    from wsgiref.simple_server import make_server
    print("Servidor WSGI corriendo en http://localhost:8080/ATI/index.py")
    make_server("", 8080, application).serve_forever()
