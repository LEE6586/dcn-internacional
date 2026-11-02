# Publicar DCN en Railway — guía sin Linux

**Objetivo:** subir el sitio a Railway con volumen persistente para que la base de datos de inscripciones, ofrendas y mensajes no se pierda.

**Costo aproximado:** $5/mes (Railway Hobby) + dominio (~$10–15/año).  
**Tiempo:** 20–30 minutos la primera vez.

---

## Antes de empezar

Necesitas:

- Cuenta de **GitHub** (gratis).
- Cuenta de **Railway** con tarjeta internacional.
- **GitHub Desktop** instalado: https://desktop.github.com/
- La carpeta **`para-github`** de este proyecto.

No necesitas usar Linux, SSH ni Docker.

---

## Paso 0 — Crear las cuentas desde cero

### 0.1 GitHub

1. Entra a https://github.com/signup
2. Escribe tu correo, una contraseña y un nombre de usuario.
   - Ejemplo de usuario: `dcn-internacional`
3. Verifica el correo que te envía GitHub.
4. Activa la verificación en dos pasos (2FA) en **Settings → Password and authentication**.
5. Instala **GitHub Desktop** desde https://desktop.github.com/ e inicia sesión.

> GitHub es gratis. El repositorio puede ser privado.

### 0.2 Railway

1. Entra a https://railway.com/
2. Pulsa **Login** o **Start a New Project**.
3. Elige **Continue with GitHub**.
4. Autoriza a Railway a usar tu cuenta de GitHub.
5. Verifica tu correo si te lo pide.
6. Cuando pregunte por el plan, elige **Hobby** (aproximadamente **$5/mes**).
7. Agrega una **tarjeta internacional**.
8. En **Billing / Usage**, configura un límite mensual de **$5 a $10** para evitar sorpresas.

> No contrates el plan Pro ni un plan anual. Empieza con Hobby mensual.

---

## Paso 1 — Subir el proyecto a GitHub

1. Abre **GitHub Desktop** e inicia sesión.
2. Menú **File → Add local repository**.
3. Selecciona la carpeta **`para-github`**.
4. Si dice que no es un repositorio, pulsa **create a repository**.
   - Nombre: `dcn-internacional`
   - Rama: `main`
   - Pulsa **Create repository**.
5. Verás todos los archivos. Escribe un resumen, por ejemplo:
   `Sitio DCN Internacional con panel y base de datos`
6. Pulsa **Commit to main**.
7. Pulsa **Publish repository**.
   - Marca **Keep this code private** si quieres que el repositorio sea privado (recomendado).
   - Railway podrá acceder con permiso.

> Importante: no subas las carpetas `data/` ni `backups/`. La carpeta `para-github` no las incluye.

---

## Paso 2 — Crear el proyecto en Railway

1. Entra a https://railway.com/ e inicia sesión con GitHub.
2. Pulsa **New Project → Deploy from GitHub repo**.
3. Si el repositorio no aparece, pulsa **Configure GitHub App** y autoriza solo el repositorio `dcn-internacional`.
4. Selecciona el repositorio.

Railway creará un servicio y comenzará un primer deploy. **No lo uses todavía**: primero configura la región, el volumen y las variables.

> Si el primer deploy falla porque aún no hay volumen, no pasa nada: la base está vacía. Configura lo que sigue y vuelve a desplegar.

---

## Paso 3 — Región y volumen persistente

### 3.1 Región

1. Abre el servicio.
2. Ve a **Settings → Region**.
3. Elige **US East** (Virginia) si está disponible.
4. Si el servicio ya está en otra región, cámbiala antes de crear el volumen. Cambiar de región después puede obligar a recrear el volumen.

### 3.2 Volumen

1. En el servicio, busca **Volumes** o **Settings → Volumes**.
2. Pulsa **Add Volume**.
3. Montaje: **`/data`**
4. Tamaño: **1 GB** es suficiente.
5. Guarda.

Sin este volumen, la base SQLite se borra en cada redeploy.

---

## Paso 4 — Variables de entorno

En el servicio, abre **Variables** y agrega:

| Variable | Valor |
| --- | --- |
| `DCN_ADMIN_PASSWORD` | Una clave nueva y segura, no `dcn2026` |
| `HOST` | `0.0.0.0` |
| `DCN_DATA_DIR` | `/data` |

No agregues `PORT`: Railway lo asigna automáticamente.

---

## Paso 5 — Confirmar que usa Dockerfile

En **Settings → Build**:

- Builder: **Dockerfile**
- Dockerfile path: **`Dockerfile`**

Esto garantiza **Node 24**, que es lo que necesita `node:sqlite`.

Si no aparece la opción, Railway suele detectar el `Dockerfile` automáticamente. Si usara Nixpacks, agrega la variable:

| Variable | Valor |
| --- | --- |
| `NIXPACKS_NODE_VERSION` | `24` |

---

## Paso 6 — Deploy

1. Pulsa **Deploy** o **Redeploy**.
2. Abre **Deployments → Logs**.
3. Debes ver algo como:

```text
[DCN] Servidor en http://0.0.0.0:...
[DCN] Sitio: /dcn/
[DCN] Admin: /admin
```

4. Si hay error, revisa la sección de problemas al final.

---

## Paso 7 — Probar antes del dominio

1. En **Settings → Networking**, pulsa **Generate Domain**.
2. Abre la URL que te da Railway:
   - `/dcn/`
   - `/admin`
3. Inicia sesión con la clave que pusiste en `DCN_ADMIN_PASSWORD`.
4. Prueba:
   - Una inscripción.
   - Una ofrenda.
   - Un mensaje de contacto.
   - Que aparezcan en el panel.
5. Haz un **redeploy** y verifica que los registros sigan ahí. Si desaparecen, el volumen o `DCN_DATA_DIR` están mal.

---

## Paso 8 — Dominio propio

1. Compra el dominio en **Cloudflare Registrar**, Namecheap o Porkbun.
2. En Railway: **Settings → Networking → Custom Domain**.
3. Escribe tu dominio, por ejemplo `dcninternacional.org`.
4. Railway te dará un **CNAME**.
5. En el DNS del dominio:
   - `@` → el CNAME que indica Railway (Cloudflare permite CNAME en la raíz).
   - `www` → el mismo CNAME.
6. Si usas Cloudflare, pon el registro en **DNS only** (nube gris) hasta que Railway valide el certificado. Después puedes activar el proxy naranja.
7. Espera el certificado HTTPS y prueba `https://tudominio/dcn/`.

---

## Paso 9 — Seguridad y respaldos

- [ ] Cambiar `DCN_ADMIN_PASSWORD` por una clave fuerte.
- [ ] Confirmar que `/admin` pide clave.
- [ ] Confirmar que `/data/dcn.db` devuelve 404.
- [ ] Descargar un **Respaldo** desde el panel.
- [ ] Revisar que el respaldo automático esté en el volumen (`data/backups`).
- [ ] No compartir la URL del panel.
- [ ] Anotar la URL y la clave en un lugar seguro.

---

## Problemas comunes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| Build falla | Railway usó Nixpacks | Builder = Dockerfile |
| 502 Bad Gateway | `HOST` no es `0.0.0.0` | Agregar variable `HOST` |
| La base se borra | Sin volumen o ruta incorrecta | Volumen en `/data` y `DCN_DATA_DIR=/data` |
| No puedo entrar al panel | Clave distinta | Revisar `DCN_ADMIN_PASSWORD` y redeploy |
| Error `node:sqlite` | Node menor a 24 | Dockerfile / `NIXPACKS_NODE_VERSION=24` |
| El sitio carga lento | Región lejana | US East; después Cloudflare |
| `/admin` da 404 | Ruta mal escrita | Usar `/admin`, sin `.html` |

---

## Después de publicar

1. Compartir el enlace con la iglesia.
2. Revisar los mensajes y ofrendas desde el panel.
3. Descargar un respaldo una vez por semana.
4. Reemplazar fotos de la galería por las reales.
5. Completar teléfono, Zelle y Pago Móvil.
6. Guardar la clave del panel en un gestor de contraseñas.

**Palabra clave de la sesión:** DCN NORTE.
