# Ruta 84 — publicar como web e instalar en el celular

## Por qué no Google Sites

| | Google Sites | GitHub Pages |
|---|---|---|
| Subir HTML propio | No — solo "Insertar código", tope ~10.000 caracteres (el archivo tiene 33.000) | Sí |
| `localStorage` | Iframe sandboxed en otro origen: poco fiable, el progreso se puede perder | Origen propio, estable |
| `SpeechSynthesis` | Suele bloquearse en iframe de origen cruzado | Funciona |
| Service worker / offline | No permitido | Sí |
| Ícono e instalación como app | No — queda un acceso directo con barra de URL | Sí, pantalla completa |
| Costo | Gratis | Gratis |

Google Sites está pensado para páginas de contenido, no para aplicaciones. El "insertar código" existe para widgets pequeños.

---

## Publicar en GitHub Pages

Sube estos 7 archivos a la raíz de un repo:

```
index.html
sw.js
manifest.webmanifest
icon-192.png
icon-512.png
icon-maskable-512.png
apple-touch-icon.png
```

Por línea de comandos:

```bash
cd ruta84
git init && git add . && git commit -m "Ruta 84"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ruta84.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: `main` / `(root)` → Save**.

En 1–2 minutos queda en:
`https://TU-USUARIO.github.io/ruta84/`

Si prefieres no usar git, la interfaz web de GitHub permite arrastrar los 7 archivos directamente en *Add file → Upload files*.

### Alternativas equivalentes

- **Netlify Drop** (`app.netlify.com/drop`) — arrastras la carpeta, URL al instante, sin repo.
- **Cloudflare Pages** — igual de directo, buen rendimiento desde Perú.

Cualquiera sirve. El único requisito real es **HTTPS**, porque sin él el navegador no registra el service worker y pierdes offline e instalación.

---

## Instalar en Android

1. Abre la URL en **Chrome** (no en el navegador de Instagram o WhatsApp — esos no permiten instalar).
2. Aparece abajo el botón **＋ Instalar en el celular**. Si no aparece, usa el menú ⋮ → *Instalar aplicación* / *Añadir a pantalla de inicio*.
3. Queda un ícono propio. Al abrirlo arranca en pantalla completa, sin barra de direcciones — indistinguible de una app nativa.

En iOS: Safari → Compartir → *Añadir a pantalla de inicio*. Funciona, pero el TTS de iOS es más limitado.

---

## Uso sin conexión

Ve a la pestaña **Plan → Descargar capítulos** y elige el horizonte. Descarga los capítulos de los próximos días y los guarda de forma permanente en el dispositivo.

Diseño de la caché, por si lo quieres tocar:

- `ruta84-v1-shell` — el HTML y los íconos. Se reemplaza al publicar una versión nueva.
- `ruta84-v1-fonts` — tipografías de Google.
- `ruta84-texto` — los capítulos. **Sin número de versión a propósito**: sobrevive a las actualizaciones de la app, así que publicar cambios no obliga a volver a descargar el texto.

Después de la primera descarga la app funciona completa en modo avión: lectura, audio y seguimiento. Lo único que necesita red es descargar capítulos nuevos.

---

## Publicar una actualización

Cambia `index.html`, haz push, y listo. La estrategia del service worker para el código es *red primero*, así que la próxima vez que abras con conexión ya tienes la versión nueva. Si además tocas `sw.js`, sube el número en la constante `V` para que se limpien las cachés viejas — el texto bíblico ya descargado no se toca.

---

## Lo que sigue sin resolverse con la web

- **Audio en segundo plano.** Con la pantalla apagada, Android suspende `SpeechSynthesis`. Esto es limitación del navegador, no del código. Solo se resuelve con app nativa y `MediaSessionService`.
- **RVR1960.** Derechos vigentes; no hay API pública. Requiere licencia de API.Bible.
- **Notificaciones de recordatorio.** Técnicamente posibles vía Push API, pero necesitan un servidor propio. Más simple: una alarma recurrente del celular a la hora que reserves para leer.
