# Estado del proyecto — DCN Internacional

**Última actualización:** 2 de noviembre de 2026 (paquete de hosting)
**Carpeta del proyecto:** `default-workspace/dcn/`

---

## Cómo verlo

```bat
start.cmd
```

o desde la carpeta raíz:

```bat
node server.mjs 8080
```

Luego abre **http://localhost:8080/dcn/**

Panel: **http://localhost:8080/admin** · clave por defecto **`dcn2026`** (cámbiala con `DCN_ADMIN_PASSWORD`).

La vista previa actual está en **http://127.0.0.1:8081/dcn/** (mientras el servidor siga encendido).

---

## Lo que ya está hecho

- **Identidad visual**: azul del logo, tipografía editorial, logo panorámico en la cabecera.
- **Barra superior**: horario en píldora grande con efecto de brillo al pasar el cursor.
- **Inicio**: lema «Donde tu familia es restaurada», Salmos 40:8, horarios (domingo 9:00–11:00 AM, miércoles 7:00–9:00 PM) y brújula animada.
- **Nosotros**: quiénes somos, misión, visión, lema, escalera del éxito (Ganar, Consolidar, Discipular, Enviar) con botón **Fórmate con nosotros**, enfoque en la familia y cobertura pastoral.
- **Pastorado**: Pastor Edgar Soto y Pastora Yazmín González de Soto (únicos nombres).
- **12 ministerios**: Alabanza y Adoración, Kids, Teens, Jóvenes, Media, Intercesión, Consolidación, Hombres, Mujeres, Matrimonios, Sonido y Protocolo.
- **Formación gratuita**: Universidad de la Vida (lunes 5:30–7:00 PM) y Capacitación Destino 1, 2 y 3 (miércoles 5:30–7:00 PM).
- **Equipos de 12**: un equipo de 12 mujeres y uno de 12 hombres, con sus doce lugares.
- **Galería** filtrable de 12 recuerdos (portadas de demostración, aún sin fotos reales).
- **Ofrendas**: reporte de transferencia con datos del titular, opción **Pacto** y botón **Enviar mi aporte**.
- **Contacto** y **mapa** enlazados a Google Maps.
- **Estadísticas**: 2 años de ministerio, 12 ministerios, 450 familias, 26 misioneros.
- **Responsive reforzado** para PC grande, tablet y móviles (1500, 1240, 1024, 760, 480 y 360 px), con protección contra desbordes y textos largos.
- **Backend con SQLite** (`server.mjs` + `data/dcn.db`): inscripciones, ofrendas y mensajes centralizados, con **respaldo automático diario** en `data/backups/` (14 copias).
- **Panel `/admin`**: login, filtros por año/fecha, búsqueda, totales, resumen mensual, exportación CSV e impresión.
- **Mensajes de contacto**: el formulario de “Visítanos” guarda nombre, correo, WhatsApp, motivo y mensaje; se ven en la pestaña **Mensajes** con estado **Nuevo / Respondido**.
- **Formularios conectados a la API** con respaldo local si el servidor no responde.
- **Video de inscripción**: recorre el formulario en 6 pasos, sin subtítulos, con voz en español latino y resaltados; se abre desde `inscripcion.html?tour=1` o con el botón “Ver video de inscripción”.
- **Presentación privada** (`presentacion.html`): 14 escenas con voz latina y animaciones; botón para grabar y descargar el video. No está enlazada desde el sitio.
- **Accesibilidad** básica.

---

## Pendientes para la próxima sesión

1. Subir el paquete a un hosting Node 24 con disco persistente (`DESPLIEGUE.md`).
2. Cambiar la clave del panel (`DCN_ADMIN_PASSWORD`).
3. Fotos y videos reales de la galería (hoy son portadas generadas con CSS).
4. Datos reales de contacto, cuentas bancarias y redes sociales.
5. Revisar y responder los mensajes desde el panel.
6. Instalar una voz en español latino en Windows para la narración del video de inscripción.

---

## Archivos principales

| Archivo | Contenido |
| --- | --- |
| `index.html` | Página principal |
| `inscripcion.html` | Inscripción a Formación |
| `church.css` | Estilos |
| `church.js` | Contenido dinámico e interacciones |
| `assets/` | Logos |
| `../admin.html` · `admin.css` · `admin.js` | Panel de administración |
| `../server.mjs` | Servidor, API y SQLite |
| `../data/dcn.db` | Base de datos (no se publica) |
| `README.md` | Guía de personalización |

**Respaldo:** `default-workspace/backups/dcn-2026-10-31.zip`
**Base de datos:** `default-workspace/data/dcn.db`
**Paquete para hosting:** `backups/dcn-hosting-2026-11-02.zip`
**Guía de despliegue:** `DESPLIEGUE.md`
