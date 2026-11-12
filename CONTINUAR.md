# Punto de encuentro — DCN Internacional

**Palabra clave para retomar:** **DCN NORTE**

> Al iniciar la próxima sesión, escribe **DCN NORTE** y se leerá este archivo para continuar exactamente donde quedamos.

**Fecha de publicación:** 2 de noviembre de 2026  
**Sitio publicado:** https://dcninternacionalsf.com/dcn/  
**Panel publicado:** https://dcninternacionalsf.com/admin  
**Servidor local de pruebas:** http://127.0.0.1:8081/dcn/  
**Repositorio:** `LEE6586/dcn-internacional` (rama `main`)

---

## Dónde quedamos

### Listo
- Sitio público completo y responsive.
- Panel `/admin` con **Inscripciones**, **Ofrendas** y **Mensajes**.
- Base de datos SQLite con las tablas `inscripciones`, `ofrendas` y `contactos`.
- Filtros por año/fecha, búsqueda, CSV, impresión y respaldo manual.
- **Respaldo automático diario** en `data/backups/` (14 copias).
- Formularios conectados a la API con respaldo local si el servidor falla.
- Video de inscripción, sin subtítulos, con voz latina.
- Presentación privada `presentacion.html` con cursor humano simulado, voz latina y grabación/descarga.
- Paquete de hosting y guía de despliegue.
- Protección de `/data/`, `/server.mjs`, `/package.json` y archivos internos.

### Paquetes
- **Subir al hosting:** `backups/dcn-hosting-2026-11-02.zip` (0.41 MB).
- **Respaldo del código:** `backups/dcn-source-2026-11-02.zip` (0.66 MB).
- **Guía:** `DESPLIEGUE.md`.

El paquete de hosting **no incluye** `data/`; el servidor crea la base al arrancar.

---

## Estado del hosting (publicado)

- **Proveedor:** TruoCloud Venezuela.
- **Producto real:** **Truo Compute g1-2** (VPS 2 GB RAM / 2 vCPU / 40 GB NVMe) + **Coolify 4.5.3**.
- **IP:** `166.1.85.167`.
- **Dominio:** `dcninternacionalsf.com` (DNS en TruoCloud, A `@` y `www` a la IP).
- **HTTPS:** Let's Encrypt, gestionado por Coolify/Traefik.
- **Aplicación:** Dockerfile, puerto interno `8080`, sin mapeo de puertos al host.
- **Volumen persistente:** `/data` (base SQLite y respaldos).
- **Variables:** `HOST=0.0.0.0`, `PORT=8080`, `DCN_DATA_DIR=/data`, `DCN_ADMIN_PASSWORD` (no guardar aquí).
- **Repositorio:** GitHub `LEE6586/dcn-internacional`, rama `main`.
- **Carpeta `dcn/`:** ya está en GitHub; no borrarla.
- **Fix del panel:** `admin.css` incluye `[hidden] { display: none !important; }`.

## Flujo para actualizar el sitio

### Recomendado: local → GitHub → Coolify
1. Editar en local (workspace / `para-github`).
2. Probar con `node server.mjs` en `http://127.0.0.1:8081`.
3. Subir cambios a GitHub (`main`).
4. En Coolify, **Redeploy** (o dejar que el webhook lo haga).
5. Verificar el dominio y el panel.

**No editar archivos dentro del contenedor**: se pierden en el siguiente redeploy, salvo que se cambie el repositorio.

### La base de datos no se toca
Los formularios viven en `/data/dcn.db` (volumen). Un redeploy de código **no borra** inscripciones, ofrendas ni mensajes.

### Próximo cambio: video en la pantalla principal
- Guardar el video en `dcn/assets/video/` (MP4 H.264/AAC, muted, loop, 6–12 s, 1080p).
- Incluir `poster` (WebP/JPG) y fallback móvil.
- Comprimir a < 5–8 MB; si es más pesado, usar Object Storage de TruoCloud o YouTube.
- GitHub limita archivos a 100 MB; evitar videos largos en el repo.
- Implementar `<video autoplay muted loop playsinline poster>` en el hero de `dcn/index.html`.

## Módulo de líderes y células (nuevo)

- **Portal de líderes:** https://dcninternacionalsf.com/lideres
- **Administración:** https://dcninternacionalsf.com/admin/lideres
- **Tablas SQLite:** `lideres` y `celulas` (se crean automáticamente al iniciar).
- **Acceso de líderes:** usuario y contraseña asignados por el administrador.
- **Reporte de célula:** fecha, palabra utilizada, cantidad de personas y notas.
- **Filtros administrativos:** grupo (hombres, mujeres, jóvenes), rango de fechas y líder.
- **Reporte administrativo:** total de registros, total de personas, totales por grupo y gráfico mensual de progreso.
- **Recuperación de contraseña:** enlace por correo si se configura `RESEND_API_KEY` y `MAIL_FROM`; si no, el administrador puede copiar el enlace desde **Enlace clave**.
- **Estado:** probado en producción; los archivos nuevos están copiados al contenedor, pero **falta subirlos a GitHub** para que sobrevivan a un redeploy.

### Archivos nuevos/modificados
- `lideres-api.mjs`
- `lideres.html`, `lideres.js`, `lideres.css`
- `admin-lideres.html`, `admin-lideres.js`, `admin-lideres.css`
- `server.mjs` (importación y rutas)
- `admin.html` (enlace a Líderes y células)
- `dcn/index.html`, `dcn/church.js`, `dcn/church.css` (Equipo de 12 Jóvenes)

## Operación diaria

- **No editar** desde el editor de archivos del contenedor: esos cambios se pierden al redeploy.
- **Sí se puede** editar directamente en GitHub para cambios pequeños de texto; luego Redeploy.
- Para imágenes/videos, subirlos al repositorio (si son ligeros) o a Object Storage de TruoCloud.
- Descargar un respaldo del panel una vez por semana.
- Mantener activa la renovación automática del dominio.
- No cambiar `DCN_DATA_DIR`, `HOST`, `PORT`, el volumen `/data` ni el puerto interno `8080`.

### Pruebas mínimas
- [ ] Inscripción de prueba aparece en el panel.
- [ ] Ofrenda de prueba aparece en el panel.
- [ ] Mensaje de contacto aparece en **Mensajes**.
- [ ] Cambiar estado **Nuevo / Respondido**.
- [ ] Exportar CSV y descargar respaldo.
- [ ] Revisar que `/data/dcn.db` devuelva 404.
- [ ] Verificar el video de inscripción y la presentación.

---

## Pendientes de contenido

1. Fotos y videos reales de la galería.
2. Teléfono/WhatsApp real (hoy hay un número de ejemplo).
3. Datos reales de Zelle y Pago Móvil (hoy están en blanco).
4. Revisar el correo `dcninternacionalsanfrancisco@gmail.com`.
5. Grabar y descargar la presentación en alta definición.
6. Cambiar la clave del panel.

---

## Recordatorios importantes

- **No usar hosting solo estático** para el panel: necesita Node y disco persistente.
- **No subir `data/`** al repositorio ni al ZIP.
- El respaldo automático vive dentro del mismo disco; descargar una copia fuera del hosting al menos una vez por semana.
- Desactivar **Live Caption** de Chrome antes de grabar la presentación.
- El video se graba desde el navegador; no es un archivo pregenerado.
- El correo del sitio es `dcninternacionalsanfrancisco@gmail.com`.
- La palabra clave para retomar es **DCN NORTE**.
