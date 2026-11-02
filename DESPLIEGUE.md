# Despliegue de DCN Internacional

**Paquete:** `backups/dcn-hosting-2026-11-02.zip`  
**Fecha:** 2 de noviembre de 2026

---

## 1. Qué contiene

- `dcn/` — sitio público, inscripción, video de inscripción y presentación privada.
- `admin.html`, `admin.css`, `admin.js` — panel privado.
- `server.mjs` — servidor Node, API y SQLite.
- `package.json`, `.node-version` — arranque y versión de Node.
- `Dockerfile`, `.dockerignore` — despliegue con Docker.
- `README.md` — guía del proyecto.
- `index.html` — redirección de la raíz a `/dcn/` (solo en el paquete de hosting).

**No incluye** `data/` (la base se crea en el servidor) ni `backups/`.

---

## 2. Requisitos del hosting

| Requisito | Valor |
| --- | --- |
| Node.js | **24 o superior** (`node:sqlite`) |
| Disco persistente | **1 GB** como mínimo |
| Comando de inicio | `node server.mjs` o `npm start` |
| Puerto | El que asigne el hosting (`PORT`) |
| HTTPS | Obligatorio para el panel y las cookies |

> No sirve un hosting solo estático (Cloudflare Pages, Netlify estático): el panel y los formularios necesitan Node y disco persistente.

---

## 3. Variables de entorno

| Variable | Valor |
| --- | --- |
| `DCN_ADMIN_PASSWORD` | Una clave segura, distinta de `dcn2026` |
| `HOST` | `0.0.0.0` |
| `PORT` | Lo asigna el hosting |
| `DCN_DATA_DIR` | `/data` o la ruta del disco persistente |

Ejemplo en VPS:

```bash
DCN_ADMIN_PASSWORD='ClaveSegura2026' \
HOST=0.0.0.0 \
PORT=8080 \
DCN_DATA_DIR=/data \
node server.mjs
```

---

## 4. Montaje del disco

El disco debe montarse en la misma ruta de `DCN_DATA_DIR`.

- Render: disco persistente en `/var/data` → `DCN_DATA_DIR=/var/data`.
- Railway: volumen en `/data` → `DCN_DATA_DIR=/data`.
- Docker/VPS: volumen `dcn-data` en `/data` → `DCN_DATA_DIR=/data`.

Sin disco persistente, la base se pierde al reiniciar.

### Respaldos automáticos

El servidor crea un respaldo diario en `data/backups/` usando `VACUUM INTO`. Conserva los **14 más recientes** y no requiere detener el sitio.

Además, el panel tiene el botón **Respaldo** para descargar una copia fuera del hosting. Descarga una copia a tu computadora al menos una vez por semana.

---

## 5. Pasos recomendados (Railway o Render)

1. Sube el contenido del ZIP a un repositorio de GitHub.
2. Crea un **Web Service** con Node 24.
3. Comando de inicio: `npm start`.
4. Agrega las variables de entorno.
5. Monta el disco persistente.
6. Deploy.
7. Abre `https://tu-dominio/dcn/` y `https://tu-dominio/admin`.
8. Prueba una inscripción, una ofrenda y un mensaje.
9. Descarga el CSV y el respaldo desde el panel.
10. Conecta el dominio y verifica HTTPS.

### VPS con Docker

```bash
docker build -t dcn .
docker run -d --name dcn --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  -v dcn-data:/data \
  -e DCN_ADMIN_PASSWORD='ClaveSegura2026' \
  dcn
```

Delante de Caddy o Nginx con HTTPS.

---

## 6. Pruebas después de publicar

- [ ] `/dcn/` carga en computadora y teléfono.
- [ ] El menú, la escalera del éxito y las animaciones funcionan.
- [ ] Una inscripción de prueba aparece en `/admin`.
- [ ] Una ofrenda de prueba aparece en `/admin`.
- [ ] Un mensaje de contacto aparece en `/admin → Mensajes`.
- [ ] El cambio de estado **Nuevo / Respondido** guarda.
- [ ] La exportación CSV descarga.
- [ ] El botón **Respaldo** descarga la base.
- [ ] El video de inscripción se reproduce.
- [ ] El panel no es accesible sin clave.
- [ ] `/data/dcn.db`, `/server.mjs` y `/package.json` devuelven 404.

---

## 7. Seguridad antes de publicar

1. Cambiar `DCN_ADMIN_PASSWORD`.
2. Usar HTTPS.
3. No publicar la carpeta `data/`.
4. No compartir la URL `/admin`.
5. Descargar un respaldo después de la primera semana.
6. Desactivar **Live Caption** de Chrome si se va a grabar la presentación.

---

## 8. Presentación privada

`dcn/presentacion.html` incluye el recorrido completo con voz latina, cursor simulado y botón para grabar/descargar el video. No está enlazada desde el sitio y tiene `noindex`; se puede subir sin problema.

El video se genera en el navegador; no es un archivo que se suba al hosting.

---

## 9. Pendientes

1. Fotos y videos reales de la galería.
2. Datos reales de contacto, cuentas y redes.
3. Cambiar la clave del panel.
4. Verificar la voz latina en el equipo donde se grabe.
5. Revisar el correo `dcninternacionalsanfrancisco@gmail.com`.
