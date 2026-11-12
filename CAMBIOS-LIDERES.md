# Módulo de líderes y células — despliegue

## Acceso al panel administrativo

- **Usuario:** `admin`
- **Contraseña:** el valor de `DCN_ADMIN_PASSWORD`.
- Si quieres otro usuario, configura `DCN_ADMIN_USER` en Coolify.
- Este acceso es solo para `/admin`. El portal `/lideres` usa el usuario y contraseña de cada líder, creados en **Admin → Líderes y células**.

## Ya está funcionando en producción

- **Portal de líderes:** https://dcninternacionalsf.com/lideres
- **Administración:** https://dcninternacionalsf.com/admin/lideres
- **Equipo de 12 Jóvenes:** visible en la sección **Equipos de 12** del sitio.

Los archivos se copiaron al contenedor para que puedas probarlo ya. **Si haces Redeploy antes de subirlos a GitHub, el módulo desaparece.**

## Cómo usarlo

### 1. Crear un líder
1. Entra a https://dcninternacionalsf.com/admin
2. Pulsa **Líderes y células**.
3. Completa:
   - Nombre completo
   - Correo
   - Teléfono
   - Usuario
   - Contraseña inicial (mínimo 8 caracteres)
   - Grupo: Hombres, Mujeres o Jóvenes
4. Pulsa **Crear líder**.

### 2. Reportar una célula
1. El líder entra a https://dcninternacionalsf.com/lideres
2. Inicia sesión con su usuario y contraseña.
3. Registra:
   - Fecha
   - Palabra utilizada
   - Cantidad de personas
   - Notas opcionales
4. Pulsa **Guardar reporte**.

El reporte queda asociado automáticamente al líder que inició sesión y a su grupo.

### 3. Ver reportes
En **Admin → Líderes y células** puedes filtrar por:
- Hombres
- Mujeres
- Jóvenes
- Rango de fechas
- Líder específico

También ves:
- **Total de registros**
- **Total de personas**
- Totales separados por hombres, mujeres y jóvenes
- Un **gráfico de progreso mensual** con barras por grupo
- El detalle de cada célula reportada

## Recuperación de contraseña

### Opción A: enlace manual (ya funciona)
En la tabla de líderes, pulsa **Enlace clave**. Copia el enlace y compártelo con el líder. Vence en 1 hora.

### Opción B: correo automático
El servidor puede enviar el enlace por correo con **Resend**.

1. Crea una cuenta en https://resend.com
2. Verifica el dominio `dcninternacionalsf.com` (Resend te da los registros DNS).
3. Crea una API Key.
4. En Coolify agrega estas variables:

| Variable | Valor |
| --- | --- |
| `RESEND_API_KEY` | La API Key de Resend |
| `MAIL_FROM` | `DCN Internacional <no-reply@dcninternacionalsf.com>` |

5. Redeploy.

Sin esas variables, el líder puede solicitar el enlace, pero el correo no se envía; el administrador debe usar **Enlace clave**.

## Subir los cambios a GitHub

Sube estos archivos a la raíz del repositorio:

- `server.mjs`
- `lideres-api.mjs`
- `lideres.html`
- `lideres.js`
- `lideres.css`
- `admin.html`
- `admin-lideres.html`
- `admin-lideres.js`
- `admin-lideres.css`
- `admin.css`

Y estos dentro de la carpeta `dcn/`:

- `dcn/index.html`
- `dcn/church.js`
- `dcn/church.css`

### Pasos
1. GitHub → repositorio `dcn-internacional`.
2. **Add file → Upload files**.
3. Sube los archivos de la raíz.
4. Entra a la carpeta `dcn` y sube los tres archivos de esa carpeta.
5. Commit a `main`.
6. En Coolify, **Redeploy**.

No subas `data/`, `backups/` ni archivos `.db`.

## Seguridad

- Las contraseñas de los líderes se guardan con **scrypt + sal**; no en texto plano.
- Las sesiones usan cookie `HttpOnly` y `SameSite=Strict`.
- El portal de líderes no da acceso al panel administrativo.
- Cambia la contraseña del panel administrativo si aún usas una débil.
- Descarga un respaldo antes y después de cargar los primeros líderes reales.
