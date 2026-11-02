# DCN Internacional + ÓRBITA

Este espacio contiene dos experiencias web construidas a medida, sin frameworks ni dependencias externas.

**Palabra clave para retomar la próxima sesión:** **DCN NORTE** — ver [`CONTINUAR.md`](CONTINUAR.md).

**Abre el lanzador:** `http://localhost:8081/`

| Proyecto | Ruta | Descripción |
| --- | --- | --- |
| **DCN Internacional** | [`dcn/`](dcn/) | Sitio de la iglesia cristiana de visión carismática en San Francisco, Venezuela. La cruz es nuestro norte. |
| **ÓRBITA** | [`orbita/`](orbita/) | Estudio de diseño e inteligencia artificial con shader WebGL y laboratorio generativo. |

---

## Cómo abrirlo

```bat
start.cmd
```

o manualmente:

```bat
node server.mjs 8080
```

Luego visita `http://localhost:8080/` (lanzador), `http://localhost:8080/dcn/` (iglesia) u `http://localhost:8080/orbita/` (estudio).

---

## DCN Internacional — lo que incluye

- **Inicio** con brújula sagrada animada en canvas (la cruz como norte), horarios y llamadas a la acción.
- **Nosotros**: visión, misión, cinco valores con versículos y contadores.
- **Ministerios**: 9 áreas desplegables con líder, horario y descripción.
- **Liderazgo**: equipo pastoral y de liderazgo.
- **Instituto Bíblico**: catálogo de 5 clases con horario, modalidad, duración e inversión.
- **Galería**: mosaico filtrable de fotos y videos con lightbox.
- **Diezmos y ofrendas**: monto, frecuencia, destino y modalidades de pago (Pago Móvil, Zelle, transferencia, USDT).
- **Contacto**: formulario validado, mapa estilizado, teléfono, Instagram y WhatsApp.
- **Inscripción** (`dcn/inscripcion.html`): flujo de 3 pasos con validación, resumen en vivo y código de confirmación.

**Panel privado:** `/admin` (clave por defecto `dcn2026`, cámbiala con `DCN_ADMIN_PASSWORD`). Permite ver inscripciones y ofrendas por año y fecha, con exportación CSV.

Guía completa en [`dcn/README.md`](dcn/README.md).

---

## ÓRBITA — lo que incluye

- Shader WebGL propio (orbe raymarcheado con atmósfera y anillos).
- Laboratorio generativo con presets, semilla aleatoria, descarga PNG y enlace compartible.
- Tipografía cinética, carrusel de proyectos, paleta de comandos y sonido generativo.

Guía en [`orbita/README.md`](orbita/README.md).

---

## Estructura

```
/
├── index.html            lanzador de los dos sitios
├── server.mjs            servidor estático local (sin dependencias)
├── start.cmd             lanzador para Windows
├── dcn/                  sitio de la iglesia
│   ├── index.html
│   ├── inscripcion.html
│   ├── church.css
│   ├── church.js
│   ├── assets/           logo y versiones recortadas
│   └── README.md
└── orbita/               sitio del estudio creativo
    ├── index.html
    ├── styles.css
    ├── app.js
    ├── shader.js
    └── README.md
```

---

## Notas

- Todo el contenido de DCN es de demostración: nombres, teléfonos, correos, cuentas bancarias y fotos deben reemplazarse por los reales antes de publicar.
- Los formularios de inscripción, ofrendas y contacto guardan en la base SQLite y se consultan en el panel `/admin`. El correo de la iglesia es `dcninternacionalsanfrancisco@gmail.com`.
- El sitio funciona sin internet: fuentes del sistema, iconos SVG e ilustraciones incluidas en el proyecto.

---

## Paquete para hosting

- **Subir a producción:** `backups/dcn-hosting-2026-11-02.zip`
- **Guía paso a paso:** [`DESPLIEGUE.md`](DESPLIEGUE.md)
- **Respaldo completo del código:** `backups/dcn-source-2026-11-02.zip`

El paquete de hosting ya trae una portada que redirige a `/dcn/`, no incluye la base de datos local y está listo para Node 24 con disco persistente.
