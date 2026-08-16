# Ruta 84 — de HTML a APK

La app es un solo archivo (`index.html`, sin dependencias de build). Funciona ya en Chrome Android. Para tener el `.apk` instalable, se envuelve con Capacitor.

## Requisitos en tu máquina

- Node.js 18+
- Android Studio (trae el SDK y el JDK 17)
- Variable `ANDROID_HOME` apuntando al SDK

## Pasos

```bash
mkdir ruta84 && cd ruta84
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android

mkdir www
cp /ruta/a/index.html www/index.html

npx cap init "Ruta 84" pe.jimmy.ruta84 --web-dir=www
npx cap add android
npx cap sync

cd android && ./gradlew assembleDebug
```

APK resultante:
`android/app/build/outputs/apk/debug/app-debug.apk`

Lo pasas al teléfono y lo instalas habilitando *Instalar apps desconocidas*.

## Para firmar una release

```bash
keytool -genkey -v -keystore ruta84.keystore -alias ruta84 \
  -keyalg RSA -keysize 2048 -validity 10000

cd android && ./gradlew assembleRelease
```

Con la firma configurada en `android/app/build.gradle` (bloque `signingConfigs`).

---

## Dos ajustes necesarios en el proyecto Android

**1. Permiso de red** — `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**2. Dominios permitidos** — `capacitor.config.json`, para que el WebView alcance la API del texto y las fuentes:

```json
{
  "appId": "pe.jimmy.ruta84",
  "appName": "Ruta 84",
  "webDir": "www",
  "server": { "androidScheme": "https" },
  "android": { "allowMixedContent": false }
}
```

---

## Almacenamiento

El código detecta el entorno: usa `window.storage` dentro de artifacts de Claude, y `localStorage` en cualquier otro lado — incluido el WebView de Capacitor. No hay que tocar nada. El progreso vive en el dispositivo, sin cuenta ni servidor.

Si quieres respaldo o sincronización entre dispositivos, el punto de enganche es la función `store` (línea ~200): reemplaza los dos métodos por llamadas a tu backend. La clave es una sola: `ruta84:v1`.

---

## Audio

Usa `SpeechSynthesis`, que en Android delega en el motor TTS del sistema (Google Text-to-Speech por defecto).

Antes de usarlo, en el teléfono:
**Ajustes → Sistema → Idiomas → Salida de texto a voz → Google TTS → Instalar datos de voz → Español**

Con la voz descargada funciona sin conexión. Sin descargarla, cae en voz remota y necesita datos.

Limitaciones reales que vas a notar:
- La entonación es sintética. Para Salmos y profetas se siente plana; para Números y genealogías da igual y ahorra mucho tiempo.
- El WebView pausa la síntesis cuando la app pasa a segundo plano. No sirve para escuchar con la pantalla apagada.
- Si necesitas audio en background con locución humana, la vía es un `MediaSessionService` nativo apuntando a un feed de audio bíblico licenciado. Eso ya es una app distinta, no un wrapper.

---

## Versión del texto

Por defecto Reina-Valera 1909 (dominio público) vía `bible-api.com`. Se puede cambiar en la pestaña **Plan**.

RVR1960, NVI, NTV, LBLA y DHH tienen derechos vigentes y no están en APIs públicas gratuitas. Si las quieres dentro de la app, la ruta legal es una llave de `api.scripture.api.bible` (API.Bible) con el acuerdo de licencia correspondiente; el punto de cambio es la URL en `openReader()`.

Si prefieres no depender de la red: descarga una vez el JSON completo de RV1909, guárdalo en `www/biblia.json` (~4,5 MB) y reemplaza el `fetch` remoto por una lectura local. La app queda 100% offline salvo las fuentes, que puedes empotrar igual.
