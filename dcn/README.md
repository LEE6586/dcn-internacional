# DCN Internacional — sitio web + panel de administración

Sitio de la iglesia **DCN Internacional** (San Francisco, Zulia, Venezuela), construido alrededor de su eslogan —**«Donde tu familia es restaurada»**—, su versículo de casa (Salmos 40:8) y el azul del logo como identidad.

Incluye un **backend propio** con base de datos SQLite y un **panel privado** para consultar inscripciones y ofrendas por año y fecha.

---

## Cómo abrirlo

**Windows**

```bat
start.cmd
```

o directamente:

```bat
node server.mjs 8080
```

Luego:

- Sitio: **http://localhost:8080/dcn/**
- Panel: **http://localhost:8080/admin**

> Importante: el panel y los formularios necesitan el servidor de Node (`server.mjs`). Abrir solo con `python -m http.server` sirve para ver el diseño, pero **no guarda datos** en la base.

---

## Panel de administración

1. Entra a **`/admin`**.
2. Clave por defecto: **`dcn2026`**.
3. Cámbiala antes de publicar definiendo la variable de entorno:

```bat
set DCN_ADMIN_PASSWORD=UnaClaveSegura2026
node server.mjs 8080
```

En el panel puedes:

- Ver **inscripciones** con nombre, WhatsApp, correo, edad, módulo, horario y modalidad.
- Ver **ofrendas** con titular, cédula, método, banco, monto, referencia y destino.
- Ver **mensajes** de contacto con nombre, correo, WhatsApp, motivo, texto y estado (**Nuevo / Respondido**).
- **Filtrar por año**, rango de fechas (desde/hasta) y búsqueda por texto.
- Ver totales en **USD y Bs**, donantes únicos, módulo más solicitado y resumen por mes.
- **Exportar a CSV** (abre en Excel) e **imprimir** el reporte.

### Seguridad

- Cambia la clave por defecto.
- Publica siempre con **HTTPS**; la cookie de sesión se marca `Secure` detrás de un proxy HTTPS.
- La sesión dura 8 horas y se guarda en memoria: al reiniciar el servidor hay que volver a entrar.
- El panel está en `noindex` y no se enlaza desde el sitio público.

---

## Base de datos

- Motor: **SQLite** (`node:sqlite`, incluido en Node.js).
- Archivo: **`data/dcn.db`** (se crea solo).
- Tablas: `inscripciones` y `ofrendas`.
- Fechas guardadas en hora de Venezuela (`America/Caracas`, UTC−4).

### Respaldo

- El servidor crea un **respaldo automático diario** en `data/backups/` y conserva los 14 más recientes.
- Desde el panel, el botón **Respaldo** descarga una copia de la base.
- También puedes detener el servidor y copiar la carpeta **`data/`** completa (incluye `dcn.db`, `-wal` y `-shm`).
- Descarga una copia fuera del hosting al menos una vez por semana.

---

## Video de inscripción

- **Video:** `dcn/inscripcion.html?tour=1` (botón **“▶ Ver video de inscripción”** en la cabecera).
- Recorre el formulario en 6 pasos: módulos, proceso, datos, preguntas y cierre.
- **Sin subtítulos**: solo la voz y el foco sobre cada sección.
- Usa la **voz en español latino** del navegador (prioriza `es-MX`, `es-419`, `es-US`, etc.).
- No hay tour del sitio completo ni botón de descarga.

Si el navegador no tiene voz latina, instala **Español (México)** en Windows y recarga la página.

## Presentación privada para compartir

- **URL:** `dcn/presentacion.html` (no está enlazada desde el sitio y tiene `noindex`).
- **14 escenas:** inicio, horarios, nosotros, escalera del éxito, ministerios, pastorado, equipos, formación, galería, ofrendas, contacto, redes, inscripción y cierre.
- Voz en **español latino**, transiciones y animaciones del sitio en vivo.
- **Cursor humano simulado**: se mueve por cada opción, hace hover, clic y activa acciones reales (abrir un ministerio, filtrar la galería, elegir un módulo, enfocar campos).
- Botón **“Grabar y descargar”**: graba la pestaña con audio y descarga el video como MP4 o WebM.
- Antes de grabar, desactiva **Live Caption** de Chrome para que no salgan subtítulos automáticos.

## Lo que incluye el sitio

- **Inicio**: brújula animada, lema, Salmos 40:8, horarios (domingo 9:00–11:00 AM y miércoles 7:00–9:00 PM).
- **Nosotros**: quiénes somos, misión, visión, lema, escalera del éxito (Ganar, Consolidar, Discipular, Enviar) y enfoque en la familia.
- **12 ministerios**: alabanza y adoración, Kids, Teens, Jóvenes, Media, Intercesión, Consolidación, Hombres, Mujeres, Matrimonios, Sonido y Protocolo.
- **Pastorado**: Edgar Soto y Yazmín González de Soto.
- **Equipos de 12**: un equipo de mujeres y uno de hombres, con sus doce lugares.
- **Formación gratuita**: Universidad de la Vida y Capacitación Destino 1, 2 y 3, con horarios reales.
- **Galería** filtrable con lightbox (portadas de demostración).
- **Ofrendas**: reporte de transferencia con datos del titular, opción **Pacto** y botón **Enviar mi aporte**; se guarda en la base y se puede enviar por WhatsApp.
- **Inscripción**: flujo de 3 pasos; se guarda en la base y genera un código.
- **Contacto**: formulario, mapa de Google Maps, teléfono, redes y WhatsApp.
- **Diseño responsive** para PC, tablet y móvil, con accesibilidad básica.

---

## Dónde se guardan los datos

| Formulario | Antes | Ahora |
| --- | --- | --- |
| Inscripción | Solo en el navegador | Base de datos SQLite + código |
| Reporte de ofrenda | Solo en el navegador | Base de datos SQLite + código |
| Mensaje de contacto | Abría el correo | Base de datos SQLite + código (`DCN-MSG`) |

Si el servidor no responde, el sitio guarda una copia local y avisa al usuario; cuando el servidor vuelva, el equipo puede pedirle el comprobante por WhatsApp.

---

## Hosting recomendado

El sitio ya **no es solo estático**: necesita Node.js y un disco persistente para conservar la base de datos.

| Opción | Sirve para este proyecto | Nota |
| --- | --- | --- |
| **VPS** (Hetzner, DigitalOcean, Contabo) | Sí | La más recomendable: disco persistente y control total. |
| **Railway / Render / Fly.io** | Sí, con volumen o disco persistente | Verifica que el plan incluya almacenamiento persistente; sin él, la base se pierde al reiniciar. |
| **Cloudflare Pages / Netlify (solo estáticos)** | No para el panel | El sitio se ve, pero los formularios no guardan datos centralizados. |

Pasos generales en un VPS:

```bash
# Node.js 22 o superior
node server.mjs 8080
# Delante de un proxy HTTPS (Caddy/Nginx) y con DCN_ADMIN_PASSWORD definida
```

---

## Estructura

| Archivo | Contenido |
| --- | --- |
| `dcn/index.html` | Página principal |
| `dcn/inscripcion.html` | Inscripción a Formación |
| `dcn/church.css` | Estilos del sitio |
| `dcn/church.js` | Interacciones y envío de formularios a la API |
| `admin.html` · `admin.css` · `admin.js` | Panel de administración |
| `server.mjs` | Servidor, API y base de datos |
| `data/` | Base SQLite (se crea al iniciar) |
| `dcn/assets/` | Logos |

---

## Pendientes

1. Fotos y videos reales de la galería.
2. Datos definitivos de contacto, cuentas y redes.
3. Revisar los mensajes desde la pestaña **Mensajes** del panel.
4. Elegir hosting con disco persistente y cambiar la clave del panel.
