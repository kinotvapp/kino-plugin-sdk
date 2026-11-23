# Kino plugin SDK

The kit for writing and testing a [Kino](https://github.com/kinotvapp/kino-light) plugin on your computer, with Node 18
or newer and nothing to install. It runs your plugin the way the app does: inside a sandbox that holds only what Kino
provides (no `setTimeout`, `Buffer`, `process` or `fetch`; `import` is refused), and it checks your manifest with the
app's own rules.

El kit para escribir y probar un plugin de [Kino](https://github.com/kinotvapp/kino-light) en tu computador, con Node 18
o más nuevo y sin instalar nada. Corre tu plugin como lo hace la app: dentro de un sandbox que solo tiene lo que Kino
ofrece (sin `setTimeout`, `Buffer`, `process` ni `fetch`; el `import` se rechaza), y revisa tu manifiesto con las reglas
de la app.

## Use it / Úsalo

```
git clone https://github.com/kinotvapp/kino-plugin-sdk
node kino-plugin-sdk/sdk/init.mjs my-plugin --host example.com   # a plugin skeleton / el esqueleto de un plugin
cp -r kino-plugin-sdk/sdk kino-plugin-sdk/contract.json kino-plugin-sdk/kino.d.ts my-plugin/
cd my-plugin
node sdk/validate.mjs .
# edit plugin.js and kino-plugin.json for your site, then run a function of it / edítalos para tu sitio y corre una función:
node sdk/run.mjs ./plugin.js home
```

The kit is the `sdk/` folder; it reads `contract.json` from the folder next to it. Copy both into your plugin, or start
from a template that already carries them / El kit es la carpeta `sdk/` y lee `contract.json` de la carpeta que tiene al
lado. Copia las dos a tu plugin, o parte de una plantilla que ya las trae:

- [kino-plugin-archive](https://github.com/kinotvapp/kino-plugin-archive): the simplest / el más simple.
- [kino-plugin-own-server](https://github.com/kinotvapp/kino-plugin-own-server): every feature / todas las funciones.

`kino.d.ts` gives your editor the types of the global `kino` object.

## See it drawn: the `kino-parity` companion / Verlo dibujado: el complemento `kino-parity`

The kit checks and runs a plugin with the app's rules, but it never draws a screen, opens a real socket or presses a
button: `run.mjs . screen` prints the validated tree. **`kino-parity`** is a companion repository (a separate clone; it
installs nothing here) that puts this kit in front of the app's own renderer, taken from the published APK, and drives
it: it draws every frame with the renderer Kino ships, taps by `key`, types, goes back, records what changed and leaves
one folder per step with the screen as text, the canonical HTML and, when a browser is available, a screenshot.

```
git clone <kino-parity>                 # the companion, not this repo
cd kino-parity && npm ci
npx kino-parity setup                   # clones this kit into vendor/, pinned by commit + apiVersion + tree hash
npx kino-parity doctor                  # kit version, APK lock, render level (text only / + PNG)
npx kino-parity open --plugin ../my-plugin --device tv --size compact --out runs/my-plugin/1
npx kino-parity tap  --run runs/my-plugin/1 --key sk:play
npx kino-parity digest --run runs/my-plugin/1
```

It never edits the copy of the kit it uses: `vendor/kino-plugin-sdk` is read-only and `setup` replaces it whole, so this
repository's `sdk/` stays dependency-free. Without a browser it still renders and drives the screens with jsdom; only
the PNG needs Chromium. Levels, flags and the agent loop: the companion's `README.md` and `AGENTS.md`.

El kit revisa y corre un plugin con las reglas de la app, pero no dibuja una pantalla, no abre una conexión real ni
pulsa un botón: `run.mjs . screen` imprime el árbol validado. **`kino-parity`** es un repositorio complemento (un clon
aparte; no instala nada aquí) que pone este kit delante del renderizador de la propia app, sacado del APK publicado, y
lo conduce: dibuja cada frame con el renderizador que trae Kino, pulsa por `key`, escribe, vuelve atrás, anota qué cambió
y deja una carpeta por paso con la pantalla en texto, el HTML canónico y, si hay navegador, una captura.

No edita nunca la copia del kit que usa: `vendor/kino-plugin-sdk` es de solo lectura y `setup` lo reemplaza entero, así
que el `sdk/` de este repositorio sigue sin dependencias. Sin navegador también dibuja y conduce las pantallas con
jsdom; solo el PNG necesita Chromium. Niveles, opciones y el bucle de un agente: el `README.md` y el `AGENTS.md` del
complemento.

## Where it differs from the app / Dónde difiere de la app

The kit cannot copy everything the app's engine does (memory and stack limits, the `/v` regex flag, `new URL` with
non-ASCII hosts...). The list, measured against the real engine, is in the documentation:
<https://kinotvapp.github.io/kino-plugins/engine-limits/#kit-differences>

El kit no puede copiar todo lo que hace el motor de la app (límites de memoria y de pila, la bandera `/v` de regex,
`new URL` con hosts no ASCII...). La lista, medida contra el motor real, está en la documentación.

It also does not build a `clockLive` window (apiVersion 27, Kino 0.9.88). `run.mjs . resolve` and `validate.mjs --run resolve`
refuse a stream whose `url` is `""` as an invalid address; with a real `url` next to it they print `clockLive` as you sent it,
and `validate.mjs` checks only its `template`, `mediaCode`, `grid` and `anchor`. Try a clock channel on a device. / Tampoco arma
la ventana de `clockLive` (apiVersion 27, Kino 0.9.88): `run.mjs . resolve` y `validate.mjs --run resolve` rechazan un stream
cuyo `url` es `""` por dirección inválida; con un `url` real al lado muestran `clockLive` tal como lo enviaste, y `validate.mjs`
solo revisa su `template`, `mediaCode`, `grid` y `anchor`. Prueba un canal por reloj en un aparato.

## Plugins that use Nuvio scrapers / Plugins que usan scrapers de Nuvio

`kino.nuvio` (Kino 0.9.71, `apiVersion` 11, capability `nuvio` with `nuvioRepos`) needs scrapers the kit does not have, so
the kit answers it from a fixture, with the app's checks and limits (20 calls a minute, 12 scrapers per call, `timeoutMs`
2000 to 60000). Without a fixture it answers `unavailable`. / `kino.nuvio` necesita scrapers que el kit no tiene, así que
el kit lo responde desde una fixture, con las mismas revisiones y límites de la app. Sin fixture responde `unavailable`.

```
KINO_NUVIO_FIXTURE=kino-plugin-sdk/fixtures/nuvio.json node sdk/run.mjs . resolve '{"k":"movie","t":603}'
```

[`fixtures/nuvio.json`](fixtures/nuvio.json) is a sample: the repository the manifest names, the scrapers it offers and
what each answers for a title. The guide, with a complete example: <https://kinotvapp.github.io/kino-plugins/en/nuvio-plugins/>.

## Sync providers / Proveedores de sincronización

From `apiVersion` 12 (Kino 0.9.74) a plugin can be the transport of the person's sync between devices: the
`syncProvider` capability with the `syncPull`, `syncPush` and optional `syncStatus` exports, and the manifest's `sync`
block (`mode`, `pullEveryMs`, `pushDebounceMs`, `maxBlobBytes` up to 4 MiB, the required `keySecret`, `provision`).
`validate.mjs` checks that block with the app's rules and prints the consent line (always red: the plugin and its
service can read the synced data); the settings form's
`link` and `help` types and an action's `setSettings` and `link` answers are checked too. `run.mjs` does not call the
sync exports: test them with your own tests. The guide: <https://kinotvapp.github.io/kino-plugins/en/sync-providers/>.
Settings items may carry `devices` (`["phone"]` / `["tv"]`: where Kino draws them) and an action `linkOnly`
(never drawn, run only as a link's `confirm`), both apiVersion 12: `validate.mjs` checks them like the app; the kit
renders no form, so it does not filter by device. Three complete, signed providers to copy:
<https://github.com/kinotvapp/kino-plugin-sync-gram> (Sync-Gram, a Telegram bot of the person's own),
<https://github.com/kinotvapp/kino-plugin-sync-server> (Sync Servidor, a server of the person's own) and
<https://github.com/kinotvapp/kino-plugin-sync-gram-account> (Sync-Gram Cuenta, the person's own Telegram account,
apiVersion 13; not in any catalog: installed by pasting its repository address).

Desde `apiVersion` 12 (Kino 0.9.74) un plugin puede ser el transporte de la sincronización entre los aparatos de la
persona (capacidad `syncProvider`). `validate.mjs` revisa el bloque `sync` con las reglas de la app y muestra la línea de
consentimiento; `run.mjs` no llama a las funciones de sincronización: pruébalas con tus propias pruebas.
Los ajustes pueden llevar `devices` (`["phone"]` / `["tv"]`: dónde los dibuja Kino) y una acción `linkOnly` (nunca
se dibuja, solo corre como `confirm` de un `link`), los dos desde apiVersion 12: `validate.mjs` los revisa como la app.
Tres proveedores completos y firmados para copiar: <https://github.com/kinotvapp/kino-plugin-sync-gram> (Sync-Gram,
un bot de Telegram de la persona), <https://github.com/kinotvapp/kino-plugin-sync-server> (Sync Servidor, un servidor
de la persona) y <https://github.com/kinotvapp/kino-plugin-sync-gram-account> (Sync-Gram Cuenta, la propia cuenta de
Telegram de la persona, apiVersion 13; no está en ningún catálogo: se instala pegando la dirección de su repositorio).

## apiVersion 13 (Kino 0.9.74 and later) / apiVersion 13 (Kino 0.9.74 en adelante)

`apiVersion` 13 arrives in **Kino 0.9.74, together with apiVersion 12**, and
every Kino before 0.9.74 refuses both (`validate.mjs` says "needs Kino 0.9.74 or later").
The kit already checks and runs all of it with the app's rules:

- `socket`: `kino.ws` over Node's global `WebSocket`, `wss://` to a declared host on port 443 only, 4 sockets, the frame
  cap, frames as `Uint8Array` or `hex`/`base64` strings. Swap `globalThis.WebSocket` for a fake to test offline.
- `byteSource`: `validate.mjs` requires the `read` export; `run.mjs . resolve` accepts a
  `{ source: "plugin", handle, size, mime }` stream with the app's rules; `node sdk/run.mjs --size <total bytes> . read
  <handle> <offset> <length>` calls your `read` as Kino's proxy does and prints the byte count, the sha256 and the first
  bytes; `askRead(plugin, manifest, stream, offset, length)` in `sdk/kino-shim.mjs` does the same from a test. A complete
  plugin with its test: <https://kinotvapp.github.io/kino-plugins/en/bytes/#example>
- `storageLarge`: `kino.storage` with 16 MB in total, 2 MB per value, 1,000 keys.
- `catalog`: `kino.catalog` (upsert, search, get, remove, clear, count) in memory, with the app's answers and errors.
- `qrScan` and the settings `qr` type (`refreshMs` 2000 to 60000): `createKino(manifest, { qrScan })` takes a fake
  scanner; without it, or with `--device tv`, `kino.qr.scan` answers `unavailable`.
- `imageSource`: `validate.mjs` requires the `image` export; `node sdk/run.mjs --out poster.jpg . image <handle>` writes
  what your `image` answers, and `askImage(plugin, manifest, ref)` in `sdk/kino-shim.mjs` asks it the way Kino does.
- `kino.crypto.aesIge`, `aesIgeVerify`, `modPow`, `gunzip` and `convert`. They are gated on the Kino you run on, not on
  your manifest's `apiVersion` (`convert` and `aesIgeVerify` arrived after the first apiVersion 13 builds): feature-detect
  each one, `typeof kino.crypto.convert === "function"`, and keep a fallback. The kit offers what its own contract has.
- `node sdk/init.mjs my-plugin --host example.com --with byteSource,images,catalog,socket` (any of them) scaffolds an
  apiVersion 13 plugin that declares those capabilities with a working, commented example of each.
- A `password` or `text` setting may say `"sync": false` (apiVersion 13): its value stays on the device where it was
  typed (never sent to a paired device, in no backup or kit). `sync.provision` may name a device-only password, as a
  one-shot secret sent once to a new device, but never as the `keySecret`; it may never name a device-only text.
  `validate.mjs` refuses `"sync"` on any other type or as a non-boolean; below apiVersion 13 the key is ignored.
- `syncProvider` (or another standalone capability) may sit next to `socket`, `storageLarge`, `catalog` and `qrScan`
  and still need no `resolve`, `search` or `home`.
- An action's `setSettings` may fill one of the plugin's own `password` settings; `run.mjs` prints it masked.
- `sync.generateKey: true`: Kino makes the `keySecret` value itself (32 random bytes as 64 hex characters) while it is
  empty; `validate.mjs` refuses anything but a boolean.
- A `settingsStatus` answer may carry `hide: [setting keys]` (at most 32, unknown keys dropped): the form does not draw
  them while that answer is current. A `qr` setting with no text draws nothing.

The guide: <https://kinotvapp.github.io/kino-plugins/en/bytes/>, <https://kinotvapp.github.io/kino-plugins/en/catalog/>,
<https://kinotvapp.github.io/kino-plugins/en/images/>, <https://kinotvapp.github.io/kino-plugins/en/qr/>.

`apiVersion` 13 llegó en **Kino 0.9.74, junto con apiVersion 12**, y
todo Kino anterior a 0.9.74 rechaza las dos. El kit
ya revisa y corre todo con las reglas de la app: `kino.ws` (`socket`), `byteSource` (`run.mjs . resolve` acepta el
stream `{ source: "plugin" }`, `run.mjs --size <bytes> . read <handle> <offset> <length>` y `askRead` llaman tu `read`),
`storageLarge`, `kino.catalog`, `kino.qr.scan` con un lector de mentira y el ajuste `qr`, `"sync": false` en un ajuste `password` o
`text` (se queda en el aparato donde se escribió; `sync.provision` puede nombrar una contraseña así como secreto de un solo uso,
nunca como `keySecret`), `sync.generateKey` (Kino crea la clave), `setSettings` que llena una contraseña, `hide` en la
respuesta de `settingsStatus`, `syncProvider` junto a `socket`, `storageLarge`, `catalog` o `qrScan` sin `resolve` ni
`search`, `run.mjs --out <archivo> .
image <handle>` y `askImage` para `imageSource`, y las operaciones de bytes de `kino.crypto` (dependen de la versión de
Kino, no del `apiVersion` del manifiesto: revisa cada una con `typeof`). `init.mjs --with
byteSource,images,catalog,socket` arma un plugin de apiVersion 13 con un ejemplo de cada una. La guía: <https://kinotvapp.github.io/kino-plugins/bytes/>.

## apiVersion 14 (Kino 0.9.74 and later) / apiVersion 14 (Kino 0.9.74 en adelante)

`apiVersion` 14 **ships in Kino 0.9.74**, together with apiVersion 12 and
13; every Kino before 0.9.74 refuses it. It brings plugin screens and the capabilities around them. The kit already
checks and runs all of it with the app's rules:

**Building a plugin's UI / Construir la interfaz de un plugin.** For any plugin that needs its own screen,
configuration, onboarding, dashboard or panel, build it with Kino's screens UI (`screen`/`screenEvent`, Flutter-style
components, per-size values, the phone and the TV from the same tree) and keep the old settings form only for
compatibility; to stay installable on older Kinos keep your `apiVersion` and offer the screen through `enhancements`;
put the code in `src/` and bundle it to `plugin.js` with esbuild (`init.mjs --bundle`); check it with
`node sdk/validate.mjs .` and `node sdk/run.mjs . screen` (also `--device tv`). Guide and component catalogue:
<https://kinotvapp.github.io/kino-plugins/en/screens/>. / Para cualquier plugin que necesite su propia pantalla,
configuración, bienvenida, tablero o panel, constrúyela con las pantallas de Kino y deja el formulario de ajustes viejo
solo por compatibilidad; para seguir instalándose en un Kino anterior conserva tu `apiVersion` y ofrece la pantalla con
`enhancements`; pon el código en `src/` y empaquétalo en `plugin.js` con esbuild; revísalo con `validate.mjs` y
`run.mjs . screen`. Guía y catálogo: <https://kinotvapp.github.io/kino-plugins/screens/>.

- `screen`: a plugin draws its own screens (the `screen` block of `kino-plugin.json`, the `screen` and `screenEvent`
  exports). `node sdk/run.mjs . screen` prints the validated tree; `node sdk/run.mjs . screenEvent <name> [arg] ['<value
  json>'] [--trigger tap|change|submit]` runs the export and prints the validated answer (the first call of a real
  session is the reserved event `open`). The fake context is a phone at compact width with an empty state: `--device
  tv` draws the TV side, `--context '<json>'` merges over the context and `--state '<json>'` over its state. A tap or
  submit is the person's press; a `change` is not, so its `go.titleByIds` / `go.url` is dropped, as in the app.
- The player panel in screen mode: `panel` reads a result with `format: "screen"` as the app does; `panelAction` takes
  `--screen` and a field name. `playerPanelTab` (with `"panel": { "contributes": true }`) adds a tab to another plugin's
  title: `--foreign <plugin id>[:<name>]` gives the panel the app's foreign context, and `--live-channel
  <provider>:<code>[:<name>]` an En vivo channel's.
- `playerControl`: every panel answer's `player` is sifted by its origin and the capability, and `run.mjs` prints what
  is dropped and the notice Kino shows the person (`KINO_PLAYER_CONTROL_REVOKED=1`: the person switched it off).
- `schedule` and `jobs`: `node sdk/run.mjs . job [jobId] [scheduled|manual]` runs one background job as Kino does, with
  the run's caps on `kino.fetch` and `kino.storage` and the forbidden APIs refused with `not_allowed`.
- `shared`: `kino.shared`, a small store that syncs between the person's devices, simulated on two devices (`phone`,
  `tv`) kept in `.kino-shared.json`; a run uses `--device` and the two sync when it ends. So `job --device phone` then
  `screen --device tv` shows what the TV reads; `node sdk/run.mjs . shared` prints what each device holds.
- `ai`: `kino.ai.ask`, only after the person's press (or inside a job run), through a fake AI: `KINO_AI_REPLY=<text>`
  (the reply), `KINO_AI_ERROR=<code>` (`unavailable`, `rate_limited`, `too_large`, `timeout`, `refused`),
  `KINO_AI_REVOKED=1` (switched off).
- `room`: `kino.room`, an in-memory room with two simulated members, with the app's payload rules and refusals
  (`KINO_ROOM_REVOKED=1`: switched off).
- `library`: `kino.library.watched()` and `saved()`, read-only, from `KINO_LIBRARY_FIXTURE=<file.json>` (`[]` without
  one; `KINO_LIBRARY_REVOKED=1`: switched off).
- `kino.fetch` options `maxBytes` (stop reading after that many bytes) and `stopAt` (stop once the text holds a
  marker); the answer says `truncated`.
- A `toggle` or `select` setting may say `"unlockWith": "adultCode"`: Kino asks the device's 18+ code before the person
  moves it away from its default. The kit refuses, as the app does, a screen answer's `config` away from the default and
  a field bound to that setting.
- `enhancements`: a plugin keeps its own `apiVersion` and lists, under `"enhancements": { "14": { ... } }`, what only a
  newer Kino reads (`capabilities`, `screen`, `settings`, `panel`). An older Kino ignores the block. `validate.mjs` notes
  the enhancements Kino applies and reports each one it drops ("Kino ignores this enhancement and runs the plugin as its
  apiVersion N says"), so the plugin must keep working without them.
- `node sdk/init.mjs my-plugin --host example.com --bundle` scaffolds a plugin whose source is split into `src/` and
  bundled into `plugin.js` by `npm run build` (esbuild). `--with` keeps its apiVersion 13 options.

The guide: <https://kinotvapp.github.io/kino-plugins/en/screens/>,
<https://kinotvapp.github.io/kino-plugins/en/screen-components/>,
<https://kinotvapp.github.io/kino-plugins/en/screen-forms/>,
<https://kinotvapp.github.io/kino-plugins/en/screen-reference/>, <https://kinotvapp.github.io/kino-plugins/en/rooms/>,
<https://kinotvapp.github.io/kino-plugins/en/jobs-and-shared/>,
<https://kinotvapp.github.io/kino-plugins/en/enhancements/>, <https://kinotvapp.github.io/kino-plugins/en/plugin-files/>,
<https://kinotvapp.github.io/kino-plugins/en/structure/>.

`apiVersion` 14 **llega con Kino 0.9.74**, junto con apiVersion 12 y 13; todo
Kino anterior a 0.9.74 la rechaza. Trae las pantallas de plugin y las capacidades que las rodean, y el kit ya las revisa
y corre con las reglas de la app: `run.mjs . screen` imprime el árbol validado y `run.mjs . screenEvent <nombre>` corre
el evento (`--device tv` para el lado de la TV, `--state '<json>'` y `--context '<json>'` para el estado y el contexto);
el panel del reproductor en modo pantalla (`panelAction --screen`), `playerPanelTab` (`--foreign`, `--live-channel`) y
`playerControl`; `run.mjs . job [id]` corre una tarea en segundo plano con los topes de Kino; `kino.shared` en dos aparatos
simulados (`--device phone|tv`, `run.mjs . shared`); `kino.ai.ask` con una IA de mentira (`KINO_AI_REPLY`,
`KINO_AI_ERROR`, `KINO_AI_REVOKED`); `kino.room` en memoria con dos miembros simulados; `kino.library` desde
`KINO_LIBRARY_FIXTURE`; las opciones `maxBytes` y `stopAt` de `kino.fetch`; `"unlockWith": "adultCode"` en un ajuste
`toggle` o `select`; y `enhancements`: `validate.mjs` dice cuáles aplica Kino y avisa de cada una que descarta, porque el
plugin debe seguir funcionando sin ellas. `init.mjs --bundle` arma un plugin con el código en `src/` que `npm run build`
junta en `plugin.js`. La guía: <https://kinotvapp.github.io/kino-plugins/screens/>,
<https://kinotvapp.github.io/kino-plugins/screen-components/>, <https://kinotvapp.github.io/kino-plugins/screen-forms/>,
<https://kinotvapp.github.io/kino-plugins/screen-reference/>, <https://kinotvapp.github.io/kino-plugins/rooms/>,
<https://kinotvapp.github.io/kino-plugins/jobs-and-shared/>, <https://kinotvapp.github.io/kino-plugins/enhancements/>,
<https://kinotvapp.github.io/kino-plugins/plugin-files/>, <https://kinotvapp.github.io/kino-plugins/structure/>.

## apiVersion 15 (Kino 0.9.77) / apiVersion 15 (Kino 0.9.77)

`apiVersion` 15 arrives in **Kino 0.9.77**; every Kino before it refuses it. It brings
three capabilities, the library's episodes and a new kind of plugin, a store. The kit already checks and runs all of it with
the app's rules:

- `identity` (declarative, never alone): `kino.identity.telegram({ challenge? })` answers a pseudonym of the person for your
  plugin (`id`) and the signed token that proves it (`token`); with a `challenge` it also answers a device signature
  (`deviceKey`, `signature`, `author`, `codeHash`). **Up to Kino 0.9.87 only plugins signed with Kino's own author key get an
  answer**, and any other plugin is refused with `permission_denied`; from Kino 0.9.88 every approved author gets the `id` and the
  attestation, and only the keys in `kinoIdentity.tokenAuthors` get the `token` (see Kino 0.9.88 below). Allowed only inside a
  call the person started (a screen, a screen event, a panel action). The kit answers a fake account:
  `KINO_IDENTITY_TG=<id|none>`, `KINO_IDENTITY_TOKEN`, `KINO_IDENTITY_AUTHOR`, `KINO_IDENTITY_REVOKED=1`. Never log or show the
  token.
- `notifications` (declarative, never alone): `kino.notifications.post({ id, title, titleEn?, text?, textEn?, go? })` and
  `clear(id?)` leave short notices in the Home bell (80-character titles, 160-character texts, 20 posts an hour, 30 kept, 30
  days; `go` opens your own screen, `go.screen`). From a screen, a screen event or your scheduled job. The kit keeps what you
  post in `<folder>/.kino-notices.json`: `node sdk/run.mjs <folder> notifications` (`KINO_NOTIFICATIONS_REVOKED=1`: switched off).
- `library` episodes: `kino.library.watched()` carries `season` and `episode` (the latest watched) on series, never on movies.
- `pluginStore`: your plugin becomes a **source of plugins** for Kino's store. `storeSync({ reason, since, state })` answers
  `{ full, entries, removed?, state? }` (the whole list, or a change); a **live** store (`"pluginStore": { "mode": "live" }`)
  also answers `storeList({ category, sort, cursor })` and `storeSearch({ q, category, cursor })` while the person browses.
  Kino keeps one local index of every store, paints the store from it, applies the owner's blocklist and the 18+ code, and
  installs through its own consent sheet: a store only hands over addresses. The store view has three tabs, "From Kino"
  (Kino Plugins' default list), "Community" (everything else from every store; sort, store filter and live stores live
  here) and "Installed". There is one plugin per id across all stores: when two repos claim an id, the one in Kino Plugins'
  list wins, otherwise one is kept deterministically, and no store may list the id `kino-plugins`. Be ready for `since` to
  be absent at any time: when Kino loses a store's rows it syncs that store from scratch, with no `since` and no `state`,
  and the store must answer its full list. The owner's blocklist is refreshed with every store sync. `node sdk/run.mjs <folder> storeSync [--since n]
  [--state '<json>']`, `storeList [popular|recent] [category]` and `storeSearch "q"` print the answers as Kino's index would
  keep them and say what Kino drops. `node sdk/init.mjs my-store --host store.example.org --store local|live` scaffolds a store.
  Two complete examples (a static JSON list and a store with its own API) are in the guide:
  <https://kinotvapp.github.io/kino-plugins/en/store-examples/>. Authors are responsible for the plugins they list; Kino only
  lists them.

The guide: <https://kinotvapp.github.io/kino-plugins/en/plugin-stores/>,
<https://kinotvapp.github.io/kino-plugins/en/identity/>, <https://kinotvapp.github.io/kino-plugins/en/notifications/>.

`apiVersion` 15 **llega con Kino 0.9.77**; todo Kino anterior la rechaza. Trae tres
capacidades, los episodios de la biblioteca y un nuevo tipo de plugin, la tienda. El kit ya las revisa y corre con las reglas
de la app: `identity` (`kino.identity.telegram`: un seudónimo de la persona para tu plugin y el token firmado que lo prueba;
hasta Kino 0.9.87 solo responde a plugins firmados con la llave de autor de Kino, y desde Kino 0.9.88 responde a todo autor
aprobado, pero el `token` solo va a las llaves de `kinoIdentity.tokenAuthors`; el kit simula una cuenta con `KINO_IDENTITY_TG`,
`KINO_IDENTITY_TOKEN`, `KINO_IDENTITY_AUTHOR` y `KINO_IDENTITY_REVOKED`), `notifications` (`kino.notifications.post` y
`clear`: avisos en la campanita de Inicio; `run.mjs <carpeta> notifications` muestra lo publicado), los episodios de
`kino.library.watched()` (`season` y `episode` en las series) y `pluginStore` (tu plugin es una fuente de plugins para la tienda
de Kino: `storeSync`, y `storeList` y `storeSearch` si la tienda es en vivo; `run.mjs <carpeta> storeSync|storeList|storeSearch`;
`init.mjs mi-tienda --store local|live` arma una tienda). Quien escribe un plugin es responsable de él; Kino solo lo lista.
La vista de la tienda tiene tres pestañas, «De Kino» (la lista por defecto de Kino Plugins), «De la comunidad» (todo lo demás
de todas las tiendas, con el orden, el filtro de tiendas y las tiendas en vivo) e «Instalados». Hay un plugin por `id` en todas
las tiendas: si dos repositorios reclaman un `id`, gana el de la lista de Kino Plugins y, si no, se conserva uno de forma
determinista; ninguna tienda puede listar el `id` `kino-plugins`. Prepárate para que `since` falte en cualquier momento: si Kino
pierde las filas de una tienda, la sincroniza desde cero, sin `since` ni `state`, y la tienda responde su lista completa. La lista
de bloqueo del dueño se refresca con cada sincronización de tiendas.
La guía: <https://kinotvapp.github.io/kino-plugins/plugin-stores/>, <https://kinotvapp.github.io/kino-plugins/identity/>,
<https://kinotvapp.github.io/kino-plugins/notifications/>.

## apiVersion 16 and 17 (Kino 0.9.78 and 0.9.81) / apiVersion 16 y 17 (Kino 0.9.78 y 0.9.81)

- **apiVersion 16, `coins`:** `kino.coins.balance()` and `kino.coins.give({ to, postId })`. The kit answers a pretend balance with the app's
  gates (`KINO_COINS_*`, `coinsRevoked`); `give` only from a screen, `screenEvent` or `panelAction`.
  / `kino.coins.balance()` y `kino.coins.give(...)`: el kit responde un saldo de mentira con las mismas reglas de la app.
- **`kino.sync.active()` and `kino.sync.setActive(on)` (Kino 0.9.78, not an apiVersion):** for a `syncProvider` plugin; the kit logs what Kino would ask.
- **apiVersion 17 (Kino 0.9.81):** `kino.library.stats({ month })` (a month's aggregates; the fixture's `stats`),
  jobs with `"perProfile": true` (`kino.jobOn`, the `enableJob` answer, `jobsOn` in `createKino`), `kino.tmdb` in jobs, AI runs of 60 s and 20 requests,
  the `pages` widget and the `hero` text style, the `share` answer, `go.search` with `"scope": "all"` and `go: { syncProvider: true }`.
  Every rule is in [the docs](https://kinotvapp.github.io/kino-plugins/en/changelog/).
  / apiVersion 17 (Kino 0.9.81): `kino.library.stats`, trabajos `perProfile`, `kino.tmdb` en trabajos, ejecuciones de IA de 60 s y 20 peticiones,
  el widget `pages`, el estilo `hero`, la respuesta `share`, `go.search` con `scope: "all"` y `go: { syncProvider: true }`.

## apiVersion 18 to 20 (Kino 0.9.81) / apiVersion 18 a 20 (Kino 0.9.81)

These numbers carry API of **Kino 0.9.81**; every Kino before it refuses them.

- **apiVersion 18 and 19:** app themes (`appThemes`) and the `lyrics` capability, with an audio item's `ids` (`isrc`, `musicbrainz`, `youtube`).
- **apiVersion 19, screen additions:** `go: { installPlugin: { repo } }` (Kino's install sheet over your own screen), the manifest's
  `"recommends"` and the `installed` argument of `screen` and `screenEvent`, `Scaffold.onBack`, `AppBar.mergeWithKinoBar`, and text fields that
  hide the keyboard on submit. `enhancements` may now carry `visualBrowser`.
- **apiVersion 20, `kino.visualBrowser`:** the manifest key `"visualBrowser": true` and `kino.visualBrowser.available()` / `.open({ url, title,
  doneWhen, collect, userAgent, timeoutMs })`: a web window the person sees and drives (Android phone and tablet; experimental on TV), on the
  plugin's own `hosts`, to sign in or finish a step. Kino asks in its own sheet at every open; `collect` can return the cookies, the page's
  HTML or the final address, or store them straight into a secret setting (`storeAs`, which can `spill` a longer text over up to 3 more password settings). The window's own `timeoutMs` is its only time bound. `run.mjs` and `validate.mjs` check it like the app.
- **apiVersion 20, the plugin protocol:** a provider plugin opens named doors (`"provides"`) and a consumer uses them through Kino
  (`"consumes"` and `kino.plugins.call(alias, call, argument)`); no plugin ever calls another directly. Types are a small closed language
  (`string`, `number`, `boolean`, `T?`, `T[]`, named and inline objects); a request is checked strictly and a response loosely, and the errors
  are `provider_missing`, `not_declared`, `bad_input`, `bad_output`, `rate_limited`, `timeout` and `provider_failed`. A plugin whose only
  purpose is to provide (apiVersion 20, a non-empty `"provides"`, no capabilities, no settings) is **provides-only** and may leave `"hosts"`
  empty. That is derived from the manifest: there is no `providesOnly` field (`validate.mjs` warns if you write one). So may a **screen-only
  consumer** (apiVersion 20, a non-empty `"consumes"`, `capabilities` exactly `["screen"]`): `"hosts": []`; with no host its own `kino.fetch`
  is refused (unless it declares `fetchHosts: "any"` or a `url` setting) and pictures from public https addresses need no declaration.
  Kino's card says it connects to nothing only when it also has no settings. A consumer's arguments
  reach the provider, which may send them to its own hosts: never pass what you would not hand to the provider's author. `validate.mjs` checks
  both blocks like the app (also inside `enhancements["20"]`), fails a declared call or stream without its `proto_<door>_<name>` export, and
  warns about a consumed repo missing from `"recommends"` and an `everySeconds` outside 30..86400.
- **Start from a scaffold:** `node sdk/init.mjs my-provider --kind provider` (provides-only, one door with a call and a stream, its own test)
  or `node sdk/init.mjs my-consumer --kind consumer --repo owner/provider-repo --door <door> --call <call>` (writes `"hosts": []`;
  add `--host <a host the screen really fetches from>` only if it fetches one) (a screen with the install gate, one compact bar, a detail route, the error codes and a stream switch, tested against `test/provider`: a
  **stand-in** that opens the same door, call and stream names; replace it with a copy of the real provider, see its README). `--door`,
  `--call` and `--stream` (default `quotes`, `byId`, `latest`) take the real door's names, for a provider too. `node sdk/init.mjs --help`
  lists the options. Copy `sdk/` (without `sdk/test/`) and `contract.json` (required) next to the plugin; `kino.d.ts` is optional (editor typings).
- **Placeholder hosts:** `validate.mjs` warns (`!`, still accepted) on a `hosts` entry such as `example.com`, `*.example.com`, `example.org`
  or anything under `.test`, `.invalid` or `.example`; for a screen-only consumer the warning says to declare none (`"hosts": []`), see
  [a consumer's hosts](https://kinotvapp.github.io/kino-plugins/en/protocol/#text-only-consumer).
- **`run.mjs --provider <folder>`** (repeatable): the consumer's `kino.plugins.call` is answered by the plugin in that folder, in its own sandbox;
  without `--provider` a call rejects with `provider_missing`. A small provider and consumer to try it are in `fixtures/protocol/`:
  `node sdk/run.mjs --context '{"installed":{"kinotvapp/kino-plugin-tmdb":true}}' --provider fixtures/protocol/provider fixtures/protocol/consumer screen`
  (it prints no "dropped" line; add `--lang en` for the English texts) and
  `node sdk/run.mjs --context '{"installed":{"kinotvapp/kino-plugin-tmdb":true}}' --provider fixtures/protocol/provider fixtures/protocol/consumer screenEvent play`.
  `screenEvent protocol <alias>.<stream>` polls a stream once (`--cursor '<json>'` polls from a given cursor).
- **A provider on its own:** `node sdk/run.mjs <provider folder> proto <door>.<call> '<argument json>'` and
  `node sdk/run.mjs <provider folder> proto <door>.<stream> ['<cursor json>']`, with the app's checks and error codes (exit 0 with the checked
  answer, 1 with `✗ <code>: <message>`, 2 for a bad command).
  The rules: [The plugin protocol](https://kinotvapp.github.io/kino-plugins/en/protocol/) (Spanish:
  [El protocolo entre plugins](https://kinotvapp.github.io/kino-plugins/protocol/)).

Estos números traen API de **Kino 0.9.81**; todo Kino anterior los rechaza.

- **apiVersion 18 y 19:** temas de la app (`appThemes`) y la capability `lyrics`, con los `ids` de un ítem de audio (`isrc`, `musicbrainz`, `youtube`).
- **apiVersion 19, pantallas:** `go: { installPlugin: { repo } }` (la hoja de instalación de Kino sobre tu propia pantalla), `"recommends"` en el manifest
  y el argumento `installed` de `screen` y `screenEvent`, `Scaffold.onBack`, `AppBar.mergeWithKinoBar` y campos de texto que esconden el teclado al enviar.
  `enhancements` ahora puede llevar `visualBrowser`.
- **apiVersion 20, `kino.visualBrowser`:** la clave `"visualBrowser": true` del manifest y `kino.visualBrowser.available()` / `.open({ url, title,
  doneWhen, collect, userAgent, timeoutMs })`: una ventana web que la persona ve y maneja (teléfono y tableta Android; experimental en TV), sobre los
  `hosts` del plugin, para iniciar sesión o terminar un paso. Kino pregunta en su propia hoja en cada apertura; `collect` puede devolver las cookies, el HTML
  o la dirección final, o guardarlas directo en un ajuste secreto (`storeAs`, que puede repartir con `spill` un texto más largo en hasta 3 ajustes password más). El `timeoutMs` de la ventana es su único límite de tiempo. `run.mjs` y `validate.mjs` lo revisan como la app.
- **apiVersion 20, el protocolo entre plugins:** un plugin proveedor abre puertas con nombre (`"provides"`) y uno consumidor las usa a través de Kino
  (`"consumes"` y `kino.plugins.call(alias, llamada, argumento)`); ningún plugin llama a otro directamente. Un plugin que solo provee (apiVersion 20,
  `"provides"` no vacío, sin capabilities ni settings) puede dejar `"hosts"` vacío; eso se deduce del manifest: no existe un campo `providesOnly`.
  También un **consumidor solo de pantalla** (apiVersion 20, `"consumes"` no vacío, `capabilities` exactamente `["screen"]`): `"hosts": []`; sin host
  su propio `kino.fetch` se rechaza (salvo con `fetchHosts: "any"` o un ajuste `url`) y las imágenes de direcciones https públicas no se declaran.
  Los argumentos del consumidor llegan al proveedor, que puede enviarlos a sus propios hosts: no pases lo que no le darías a quien lo escribió.
  `validate.mjs` revisa los dos bloques como la app, falla si falta la exportación `proto_<puerta>_<nombre>` de una llamada o flujo declarado y avisa
  si el repo consumido no está en `"recommends"`.
- **Empieza con una plantilla:** `node sdk/init.mjs mi-proveedor --kind provider` o
  `node sdk/init.mjs mi-consumidor --kind consumer --repo dueño/repo-del-proveedor --door <puerta> --call <llamada>` (escribe `"hosts": []`;
  `--host <un host del que la pantalla de verdad descarga>` solo si descarga de uno).
  `test/provider` es un proveedor **de reemplazo**: cámbialo por una copia del proveedor real (lee su README). `validate.mjs` avisa (`!`, sin rechazar)
  si un host es de relleno (`example.com`, `*.example.com`, `example.org`, `.test`, `.invalid`, `.example`); a un consumidor solo de pantalla le dice que
  no declare ninguno (`"hosts": []`), lee [los hosts de un consumidor](https://kinotvapp.github.io/kino-plugins/protocol/#text-only-consumer).
- **`run.mjs --provider <carpeta>`** (repetible): el `kino.plugins.call` del consumidor lo responde el plugin de esa carpeta, en su propio sandbox; sin
  `--provider` la llamada se rechaza con `provider_missing`. En `fixtures/protocol/` hay un proveedor y un consumidor pequeños para probarlo.
  Un proveedor solo: `node sdk/run.mjs <carpeta> proto <puerta>.<llamada> '<json>'` (un flujo: `proto <puerta>.<flujo> ['<cursor>']`).
  Las reglas: [El protocolo entre plugins](https://kinotvapp.github.io/kino-plugins/protocol/).

## apiVersion 21 (Kino 0.9.82) / apiVersion 21 (Kino 0.9.82)

- **apiVersion 21, `files`:** the capability for a plugin that works with files on the person's device (a reader, a music or video player).
  `kino.files.pick({ kinds?, multiple?, copy? })` and `pickFolder({ kinds? })` open Kino's picker and answer opaque handles, never an address;
  `list`, `folders`, `info`, `read(id, { start?, end? })`, `readText`, `forget` and `url(id)` (`kino-file:<id>`, which a stream's or an audio
  track's `url` may carry) work with them. `pick` and `pickFolder` run only from a press (a settings action, a `panelAction` or a `screenEvent`
  that follows a tap or submit). The kit answers from the folder named by `KINO_FILES_DIR` (default `./.kino-files`), with the app's limits and
  error codes. Nothing is uploaded or sent anywhere. Every rule is in the guide, "Files on the device".
  / `files`: archivos del aparato de la persona. `kino.files.pick` y `pickFolder` abren el selector de Kino y devuelven manijas opacas;
  `read` lee por rangos y `url(id)` da una dirección `kino-file:` para reproducir. El kit responde desde la carpeta `KINO_FILES_DIR`.
- **Screens, additive (no new apiVersion; an older Kino ignores them):** `onSwipeLeft` / `onSwipeRight` on any node, an `Image` `url` that is a
  `data:image/png|jpeg|webp|gif;base64,…` (up to 200,000 characters), `divider: false` on `AppBar` and `TabBar`, and `logo` and `h` on `heroCard`.
  / Pantallas, sin apiVersion nuevo: deslizar a los lados, imágenes `data:`, `divider: false` y `logo`/`h` en `heroCard`.
- **App themes, additive:** `colors.border` and the borders `shape.dialogBorder`, `menuBorder`, `headerBorder`, `cardBorder` and `panelBorder`
  (0 to 4 dp; Kino has none until a theme asks), and a light background is accepted when the theme brings its own readable text.
  / Temas: `colors.border` y los bordes `shape.*Border`; un fondo claro se acepta si el tema trae su propio texto legible.

## apiVersion 22 (Kino 0.9.83) / apiVersion 22 (Kino 0.9.83)

- **apiVersion 22, `progress`:** the capability for a plugin that keeps where the person is in something that is not a video (a chapter, a
  book, an episode of audio). `kino.progress.set({ id, fraction, title?, label?, labelEn?, poster?, resume?, done?, doneAt? })`, `get(id)`,
  `clear(id)` and `list({ limit?, sinceMs? })`. Kino draws nothing from it: you build your own "keep reading" shelf from `list`, and `resume`
  is your own JSON (up to 1 KB) that comes back as you set it. It needs no approval line and no extra host. The kit keeps the elements in memory
  for the run, with the app's argument rules, limits (500 elements, 80-character labels) and error codes. Every rule is in the guide,
  "Saving where the person is".
  / `progress`: guarda en qué punto va la persona en algo que no es video (un capítulo, un libro). `kino.progress.set`, `get`, `clear` y `list`;
  Kino no dibuja nada con ello: tú armas tu propio estante con `list`, y `resume` es tu JSON (hasta 1 KB). El kit lo guarda en memoria durante la corrida.
- **Screens, additive (Kino 0.9.83; an older Kino ignores it):** an `Image` takes `headers: { Referer?, User-Agent? }`, for a site that serves
  its pictures only to requests that carry its own page. They are sent only when the picture's host is in your manifest's `hosts`; the kit
  reads and validates them like the app does. See "Pictures that need a Referer" in the user interface reference.
  / Pantallas, sin apiVersion nuevo: una `Image` acepta `headers` (`Referer` y `User-Agent`) para sitios que solo sirven sus imágenes a quien trae su página; solo se envían a hosts de tu manifest.

## apiVersion 23 (Kino 0.9.83) / apiVersion 23 (Kino 0.9.83)

- **apiVersion 23, `playerSlot`:** up to three small elements (a `text`, an `icon`, an `image` or a `button`) in the top-right corner of the
  TV player, declared in the manifest's `slot` block (1 to 3 `{ id, kind, mode }`, `mode` `overlay` with the controls or `fixed` all the time)
  and filled by your `playerSlot(context)` export (`{ items, refreshMs }`, 2,000 to 60,000 ms); a press calls `playerSlotAction({ id, context })`
  (`{ openPanel?, player? }`). A `fixed` element shows a red approval line. The kit's `sdk/slot.mjs` reads a frame and a press the way the app
  does: `node sdk/run.mjs <folder> playerSlot [ref]`, `node sdk/run.mjs <folder> playerSlotAction <ref> <button id>`, with `--bare`,
  `--foreign` and `--live-channel` for the other contexts; `validate.mjs` checks the block and both exports. A complete clock is on the
  guide's "The player slot" page.
  / `playerSlot`: hasta tres elementos pequeños en la esquina superior derecha del reproductor de la TV, declarados en el bloque `slot` del
  manifiesto y llenados por `playerSlot(context)`; un toque llama a `playerSlotAction`. Un elemento `fixed` pide aprobación en rojo. El kit
  los prueba con `run.mjs playerSlot` y `run.mjs playerSlotAction`.
- **The look of a slot text and where it sits (no new apiVersion):** a `text` item may carry `size` (`small`, `normal`, `large`, `xlarge`),
  `weight` (`extralight`, `light`, `normal`, `medium`, `semibold`, `bold`), `color` and `background` (`#RRGGBB` or `#RRGGBBAA`; a
  `background` with alpha 0 draws no pill), and any item may carry `left` and `top` (whole dp, clamped, to nudge it). Each invalid field is
  ignored on its own, the letters never get less than half opacity, and a `color` that cannot be read on its opaque pill is dropped.
  The kit's `sdk/slot.mjs` applies the same rules. A plugin offers them as ordinary settings, as the clock example does (a time zone as a
  fixed UTC offset that does not follow daylight saving time, size, weight, colour, background and position).
  / Un `text` puede traer `size`, `weight`, `color` y `background`, y cualquier elemento `left` y `top` (dp enteros, acotados) para
  moverlo; Kino ignora cada campo inválido y mantiene el texto legible. El reloj de ejemplo los ofrece como ajustes, con la zona horaria
  como un desfase fijo respecto de UTC (no sigue el horario de verano).

## Kino 0.9.84 (no new apiVersion) / Kino 0.9.84 (sin apiVersion nuevo)

- **`go.plugin` and `openFrom`:** a screen button may carry `go: { plugin: { repo, route?, args?, query? } }` (only from the person's
  press) to open one of another plugin's screen routes or, failing that, its search with `query` or its section. The target lists
  the routes others may open in its manifest, `"openFrom": { "routes": ["detail"] }` (apiVersion 20 and the `screen` capability;
  `enhancements["20"]` may carry it). When the target is not installed Kino shows its install sheet first, and when it is off Kino
  asks to turn it on. `validate.mjs` and `run.mjs` check both like the app.
- **`ctx.caller`:** every `proto_<door>_<name>` export gets a second argument, `ctx`, that Kino fills in: `ctx.caller` is
  `{ id, repo, name, adult }`, the plugin that calls (`repo` is `owner/name[/path][@ref]`, or `null` for a plugin installed from a
  manifest URL or a file; cut any `@ref` off before using it as `go.plugin`'s `repo`). `run.mjs proto` takes `--repo <owner/name>`.
- **`kino.image.thumbnail(url, { maxWidth?, maxBytes? })`:** Kino downloads an https picture with your plugin's own fetch rules
  and answers a small JPEG as a `data:` address (`maxWidth` 32 to 400, default 200; `maxBytes` 2048 to 32768, default 16384; 20
  calls a minute). Feature-detect it with `typeof kino.image === "object"`. The kit has no image codec: it answers the bytes only
  when they already are a JPEG or PNG within those limits, else `kit_unsupported`; `KINO_THUMBNAIL_FIXTURE=<file>` answers that file.
- **The `fullscreen` ui operation:** `{ ui: [{ fullscreen: true }] }` hides Kino's title bar and the phone's bars for a
  full-bleed screen, and `false` brings them back; the phone's Back always closes the screen. An older Kino ignores it.

The guide: <https://kinotvapp.github.io/kino-plugins/en/share/>, <https://kinotvapp.github.io/kino-plugins/en/protocol/>,
<https://kinotvapp.github.io/kino-plugins/en/kino-api/>, <https://kinotvapp.github.io/kino-plugins/en/screen-components/>.

- `go.plugin` y `openFrom`: un botón de pantalla puede llevar `go: { plugin: { repo, route?, args?, query? } }` (solo desde un
  toque de la persona) para abrir una de las rutas de pantalla de otro plugin o, si no se puede, su búsqueda con `query` o su
  sección. El plugin de destino nombra en su manifiesto las rutas que otros pueden abrir, `"openFrom": { "routes": ["detail"] }`.
  Si no está instalado, Kino muestra primero su hoja de instalación, y si está apagado, pregunta si lo activa.
- `ctx.caller` (`{ id, repo, name, adult }`) le dice a un proveedor qué plugin lo llama; `run.mjs proto` acepta `--repo`.
- `kino.image.thumbnail` descarga una imagen https con las reglas de red de tu plugin y devuelve una miniatura JPEG como dirección
  `data:`. El kit no tiene códec de imágenes: responde `kit_unsupported`, o el archivo de `KINO_THUMBNAIL_FIXTURE`.
- La operación `{ ui: [{ fullscreen: true }] }` esconde la barra de Kino y las del teléfono, y `false` las devuelve; el botón Atrás
  del teléfono siempre cierra la pantalla.

## apiVersion 24 to 26 (Kino 0.9.85 to 0.9.87) / apiVersion 24 a 26 (Kino 0.9.85 a 0.9.87)

- **apiVersion 24 (Kino 0.9.85):** a stream's `drm` may be a list of options (best first) and a block may be `type: "clearkey"` with its `keys`;
  `validate.mjs --run resolve` prints the options in the order a phone would try them. / El `drm` de un stream puede ser una lista de opciones
  (la mejor primero) y un bloque puede ser `type: "clearkey"` con sus `keys`.
- **apiVersion 25 (Kino 0.9.86):** a stream's `subtitles` entry may carry its own decrypted `text` (with `format` `vtt` or `srt`) instead of a `url`. /
  Una entrada `subtitles` puede llevar su propio `text` descifrado.
- **apiVersion 26 (Kino 0.9.87), app themes that paint:** `appThemes` may declare `surfaces` (fill, stroke and glow per element), `style.gloss`,
  `layout` (a framed hero and a floating rail, TV only), `assets` (a picture and a font from your own repository, hash-checked at install),
  `background.image`, `typography.fontFamily`, and the tokens `shape.heroRadius` and `shape.railItemRadius`. `validate.mjs` checks the **format** of
  these keys with the app's rules (`sdk/appthemes.mjs`); it does not yet replay the app's contrast and range warnings for them, so look at the theme
  in Kino. A complete example: <https://github.com/kinotvapp/kino-plugin-theme-crimson>. Guide:
  <https://kinotvapp.github.io/kino-plugins/en/themes/#level2>. / Los temas pueden pintar: `surfaces`, `style.gloss`, `layout`, `assets`,
  `background.image`, `typography.fontFamily`. `validate.mjs` revisa el **formato** con las reglas de la app, pero todavía no repite sus avisos de
  contraste y de rangos: mira el tema en Kino.
- **`kino.visualBrowser` and `localStorage` (additive inside apiVersion 20, Kino 0.9.87):** `collect.localStorage: [keys]` and `doneWhen.localStorage: [keys]`
  read only the named keys of the page the window ends on (the `visualBrowser` option of `createKino` plays the person: answer
  `{ status: "done", localStorage: { token: "…" } }`); an older Kino ignores them and answers no `localStorage`. Guide:
  <https://kinotvapp.github.io/kino-plugins/en/visual-browser/#rules>. / Lee solo las claves nombradas del `localStorage` de la página donde termina la ventana.

## apiVersion 27 and Kino 0.9.88 / apiVersion 27 y Kino 0.9.88

- **apiVersion 27, `clockLive` (live channels only):** a `live` stream may hand Kino a clock instead of a playlist, and Kino builds
  the sliding HLS window itself on its own local proxy: `template` (each segment's address, with the required `{seg}` and an
  optional `{mc}` that `mediaCode` fills), `grid` (the repeating segment durations, in ms), `anchor` (`{ t, s, firstStep? }`, one
  real segment) and the tuning knobs `rate`, `window`, `reanchor` and `segWidth` (clamped, never refused). Next to it Kino ignores
  the stream's `url`, and also `alternatives`, `audioTracks`, `durationMs`, `skip` and `expiresInSeconds`; a `drm`, `signing` or
  `external` beside it refuses the stream. Each segment address passes a live channel's host rule (a declared host, `liveStreamHosts: "any"` or
  `streamHosts: "any"`; http only where a channel's own `url` may be http, never the home network). No plugin call runs while it plays. The kit
  does not build that window: see "Where it differs from the app" above.
- **Keep your base `apiVersion`:** Kino reads `clockLive` from your plugin's feature apiVersion, so keep the base you need and add
  `"enhancements": { "27": {} }`. Send `clockLive` only when `typeof kino.pluginApiVersion === "number" && kino.pluginApiVersion >= 27`,
  and a plain `url` otherwise: an older Kino ignores `clockLive` and refuses a stream whose `url` is `""`.
- **`kino.pluginApiVersion` (no new apiVersion):** your plugin's feature apiVersion on this Kino, the manifest's `apiVersion` or the
  highest `enhancements` key this Kino applied, whichever is higher; `undefined` on Kino 0.9.87 and older. The kit sets it from the
  manifest it validated.
- **`"resolveAhead": true` (a manifest field, at any apiVersion):** once the person has stayed about 0.3 s on one of your title
  pages, Kino may call your `resolve` for what its play button would start (a movie or an episode), as a background call, and the
  player starts from that answer if the person presses play within 20 minutes, or before 60 s are left of its `expiresInSeconds`
  when that comes first.
  Kino checks its hosts as it checks the player's own `resolve`, and does not keep an answer that would need the person to approve
  a host. It resolves ahead only for a plugin whose `resolve` can ask the person nothing: an approved `"fetchHosts": "any"`, video
  from any server (an approved `"streamHosts": "any"` or the broad video permission) and no `externalResolve`; for any other
  plugin the field does nothing, and Kino does not call `prepare` instead (the kit does not check those approvals). Declare it only if a `resolve` nobody plays has no effect the person would notice: no play counted, no quota or trial
  spent, no hidden page. Kino ignores it next to `catalogOnly` and `browser`, and drops a value that is not a boolean;
  `validate.mjs` warns about both and notes what `true` means.
- **The optional export `prepare(ref)` (at any apiVersion, with `resolve`):** for a plugin whose `resolve` must not run for titles
  nobody plays. After about 0.3 s on a title page, Kino calls `prepare(ref)` with the `ref` your `resolve` would get (a movie, an
  episode or a lone track; never a series or a live channel), so you can warm a session or an authorization; the answer is
  ignored. It is a background call of 15 s (never "No responde", and never a host question), at most once every 5 minutes per `ref`
  and 6 a minute per plugin. Kino never calls it next to `"resolveAhead": true`, `catalogOnly` or `browser`, nor for a locked 18+
  plugin, a downloaded title, or a plugin that is off or waiting for its settings. It must not start or count a play, nor spend a
  quota, a trial or a free play. `node sdk/run.mjs . prepare <ref>` runs it and says on stderr what Kino does with it, or why Kino
  never calls it (and warns past 15 s); `validate.mjs` notes it and warns where Kino never calls it.
- **`kino.screen.httpImages` (no new apiVersion):** any picture of a screen may be http on a public host, by a Home poster's rule
  (never the home network, a private IP address or, over http, a name without a dot): an `Image`'s `url`, a `heroCard`'s `image`
  and `logo`, a `CircleAvatar`'s `image`, the `poster` and `backdrop` of `titleCard`, `titleRail` and `titleGrid` items, and a
  player panel built with the screen kit, so an IPTV panel's http channel logos show. `headers` still go only with an https
  picture, and `go.url` stays https-only. An older Kino drops an http picture (the fallback or the placeholder draws): check
  `kino.screen.httpImages === true`. The kit says `true` and checks the pictures that way.
- **`kino.identity` (apiVersion 15):** from Kino 0.9.88 only a plugin signed with one of contract.json
  `kinoIdentity.tokenAuthors` (`07DA-B67F-2ACF-B4D3`, Kino's own; `E04E-EA25-1A34-290E`, a second author key Kino trusts like its
  own) gets the `token`. Any other approved author gets the `id` and, with a challenge, the attestation, but no `token` (`token` is
  optional in `kino.d.ts`); Kino 0.9.87 and older answer such an author `permission_denied`. The kit hands the token to any author,
  like a debug build of Kino.

The guide: <https://kinotvapp.github.io/kino-plugins/en/live-channels/>, <https://kinotvapp.github.io/kino-plugins/en/contract/>,
<https://kinotvapp.github.io/kino-plugins/en/screen-components/>, <https://kinotvapp.github.io/kino-plugins/en/identity/>,
<https://kinotvapp.github.io/kino-plugins/en/changelog/>.

- **apiVersion 27, `clockLive` (solo canales en vivo):** un stream `live` puede darle a Kino un reloj en vez de una lista, y Kino
  arma él mismo la ventana HLS en su proxy local: `template` (la dirección de cada segmento, con `{seg}` obligatorio y un `{mc}`
  opcional que llena `mediaCode`), `grid` (las duraciones de los segmentos en ms, que se repiten), `anchor` (`{ t, s, firstStep? }`,
  un segmento real) y los ajustes `rate`, `window`, `reanchor` y `segWidth` (se acotan, nunca rechazan). Junto a él, Kino ignora el
  `url` del stream y también `alternatives`, `audioTracks`, `durationMs`, `skip` y `expiresInSeconds`; un `drm`, un `signing` o un
  `external` a su lado rechazan el stream. Cada dirección de segmento pasa la regla de hosts de un canal en vivo (un host declarado,
  `liveStreamHosts: "any"` o `streamHosts: "any"`; http solo donde la `url` de un canal puede ser http, nunca la red de la casa). Mientras se
  reproduce no se llama al plugin. El kit no arma esa ventana: lee «Dónde difiere de la app», más arriba.
- **Conserva tu `apiVersion` base:** Kino lee `clockLive` del apiVersion efectivo de tu plugin, así que conserva la base que
  necesitas y agrega `"enhancements": { "27": {} }`. Envía `clockLive` solo cuando
  `typeof kino.pluginApiVersion === "number" && kino.pluginApiVersion >= 27`, y si no, un `url` normal: un Kino anterior ignora
  `clockLive` y rechaza un stream cuyo `url` es `""`.
- **`kino.pluginApiVersion` (sin apiVersion nuevo):** el apiVersion efectivo de tu plugin en este Kino, el mayor entre el
  `apiVersion` del manifiesto y la clave más alta de `enhancements` que este Kino aplicó; `undefined` en Kino 0.9.87 y anteriores.
  El kit lo calcula del manifiesto que valida.
- **`"resolveAhead": true` (un campo del manifiesto, en cualquier apiVersion):** cuando la persona lleva unos 0,3 s en la página de
  uno de tus títulos, Kino puede llamar a tu `resolve` en segundo plano para lo que iniciaría su botón de reproducir (una película o
  un episodio), y el reproductor arranca con esa respuesta si la persona presiona reproducir dentro de 20 minutos, o antes de que
  falten 60 s para que venza su `expiresInSeconds`, lo que ocurra primero. Kino revisa sus hosts como en el `resolve` del
  reproductor y no guarda una respuesta que necesitaría que la persona apruebe un host. Solo resuelve por adelantado un plugin cuyo
  `resolve` no puede preguntarle nada a la persona: un `"fetchHosts": "any"` aprobado, video desde cualquier servidor (un
  `"streamHosts": "any"` aprobado o el permiso de video amplio) y sin `externalResolve`; en cualquier otro plugin el campo no hace
  nada, y Kino tampoco llama a `prepare` en su lugar (el kit no revisa esas aprobaciones). Decláralo solo si un `resolve` que nadie reproduce no tiene ningún efecto que la
  persona note: no cuenta una reproducción, no gasta una cuota ni una prueba, no abre una página oculta. Kino lo ignora junto a
  `catalogOnly` y `browser`, y descarta un valor que no sea booleano; `validate.mjs` avisa de los dos casos y explica qué significa
  `true`.
- **La exportación opcional `prepare(ref)` (en cualquier apiVersion, con `resolve`):** para un plugin cuyo `resolve` no debe correr
  para títulos que nadie reproduce. Tras unos 0,3 s en la página de un título, Kino llama a `prepare(ref)` con el `ref` que
  recibiría tu `resolve` (una película, un episodio o una pista suelta; nunca una serie ni un canal en vivo), para que prepares una
  sesión o una autorización; Kino ignora la respuesta. Es una llamada en segundo plano de 15 s (nunca cuenta para «No responde» y
  nunca pregunta por un host), como mucho una vez cada 5 minutos por `ref` y 6 por minuto por plugin. Kino nunca la llama junto a
  `"resolveAhead": true`, `catalogOnly` o `browser`, ni para un plugin 18+ bloqueado, un título descargado o un plugin apagado o que
  espera sus ajustes. No debe iniciar ni contar una reproducción, ni gastar una cuota, una prueba o una reproducción gratis.
  `node sdk/run.mjs . prepare <ref>` la corre y dice en stderr qué hace Kino con ella, o por qué nunca la llama (y avisa si pasa de
  15 s); `validate.mjs` la explica y avisa cuando Kino nunca la llamaría.
- **`kino.screen.httpImages` (sin apiVersion nuevo):** cualquier imagen de una pantalla puede ser http en un host público, con la
  regla de un póster de Inicio (nunca la red de la casa, una IP privada ni, por http, un nombre sin punto): el `url` de una
  `Image`, el `image` y el `logo` de un `heroCard`, el `image` de un `CircleAvatar`, el `poster` y el `backdrop` de los ítems de
  `titleCard`, `titleRail` y `titleGrid`, y un panel del reproductor hecho con el kit de pantallas; así se ven los logos de canal
  que un panel IPTV entrega por http. Los `headers` siguen yendo solo con una imagen https y `go.url` sigue siendo solo https. Un
  Kino anterior descarta una imagen http (se dibuja el respaldo o el marcador): revisa `kino.screen.httpImages === true`. El kit
  responde `true` y revisa las imágenes así.
- **`kino.identity` (apiVersion 15):** desde Kino 0.9.88 solo un plugin firmado con una de las llaves de
  `kinoIdentity.tokenAuthors` en contract.json (`07DA-B67F-2ACF-B4D3`, la de Kino; `E04E-EA25-1A34-290E`, una segunda llave de
  autor en la que Kino confía como en la suya) recibe el `token`. Cualquier otro autor aprobado recibe el `id` y, con un
  `challenge`, la firma del aparato, pero nunca el `token` (`token` es opcional en `kino.d.ts`); Kino 0.9.87 y anteriores le
  responden `permission_denied`. El kit le da el token a cualquier autor, como una versión de depuración de Kino.

## apiVersion 28 and Kino 0.9.90 / apiVersion 28 y Kino 0.9.90

- **apiVersion 28, `vault` (declarative, needs `identity`, never alone):** `kino.vault.get()` answers your plugin's own sealed
  secret from the Kino secrets vault. Kino runs the whole exchange from the inside — a challenge, the identity attestation (the
  same machinery as `identity`: the per-plugin pseudonym, the device-key signature, your author fingerprint and `codeHash`, and,
  for a `tokenAuthors` author, the gate token the vault checks group membership with live) and the read — and resolves the secret
  by your `(pluginId, author)`. You never see the vault's address, the challenge nor the `pluginId`/`author` it resolves by, so a
  plugin can only ever read ITS OWN secret, and a copy re-signed with another key resolves a different (missing) scope. Because
  the read is gated by who the person is exactly as `identity` is, `vault` rides on `identity`'s consent and adds no approval of
  its own — declare both capabilities. Only inside a call the person started (a screen, a screen event, a panel action), 6 a
  minute; it rejects with `permission_denied`, `not_member`, `not_found`, `rate_limited`, `unavailable` or `not_available`. Cache
  the secret yourself (`kino.storage`, ~1 h). The kit answers a fake: `KINO_VAULT_SECRET=<the JSON secret>`, or
  `KINO_VAULT_ERROR=<code>` to make `get()` throw.
- **`go: { searchScreen: true }` (additive, no apiVersion):** opens Kino's own native search screen, empty — nothing typed and no
  source narrowed to, so the person searches from there. Unlike `go.search`, it carries no query (it is the "send me to search"
  button) and needs no capability. An older Kino that does not know the key drops the whole go, the screen staying as it is.

The guide: <https://kinotvapp.github.io/kino-plugins/en/vault/>, <https://kinotvapp.github.io/kino-plugins/en/identity/>,
<https://kinotvapp.github.io/kino-plugins/en/screen-components/>.

- **apiVersion 28, `vault` (declarativa, necesita `identity`, nunca sola):** `kino.vault.get()` devuelve el propio secreto sellado
  de tu plugin desde la bóveda de secretos de Kino. Kino hace todo el intercambio por dentro —un desafío, la atestación de
  identidad (la misma maquinaria de `identity`: el seudónimo por plugin, la firma con la llave del aparato, tu huella de autor y el
  `codeHash`, y —para un autor de `tokenAuthors`— el token del gate con el que la bóveda verifica la membresía del grupo en vivo) y
  la lectura— y resuelve el secreto por tu `(pluginId, author)`. Nunca ves la dirección de la bóveda, el desafío ni el
  `pluginId`/`author` con el que resuelve, así que un plugin solo puede leer SU PROPIO secreto, y una copia re-firmada con otra
  llave resuelve un ámbito distinto (inexistente). Como la lectura está gateada por quién es la persona igual que `identity`,
  `vault` se monta sobre el consentimiento de `identity` y no agrega ninguna aprobación propia —declara ambas capacidades. Solo
  dentro de una llamada que la persona inició (una pantalla, un evento de pantalla, una acción de panel), 6 por minuto; rechaza con
  `permission_denied`, `not_member`, `not_found`, `rate_limited`, `unavailable` o `not_available`. Cachea el secreto vos mismo
  (`kino.storage`, ~1 h). El kit responde uno falso: `KINO_VAULT_SECRET=<el secreto en JSON>`, o `KINO_VAULT_ERROR=<código>` para
  que `get()` lance.
- **`go: { searchScreen: true }` (aditivo, sin apiVersion nuevo):** abre la pantalla de búsqueda nativa de Kino, vacía —nada
  escrito y sin ninguna fuente acotada—, para que la persona busque desde ahí. A diferencia de `go.search`, no lleva consulta (es
  el botón «mándame a buscar») y no necesita capacidad. Un Kino anterior que no la conoce descarta todo el go (la pantalla queda
  como está).

## apiVersion 29 and 30 (Kino 0.9.91) / apiVersion 29 y 30 (Kino 0.9.91)

- **apiVersion 29, `go: { relinkTelegram: true }`:** opens Kino's own «Reautenticar Telegram» screen, where the person
  re-validates this device with their Telegram account — the fix to offer when `kino.identity.telegram` answered
  `not_available`. It carries nothing and signs no one in, so pair it with your own "Reintentar". Only for a plugin that declares
  `identity` (any other's is dropped, logged `not_identity`), only from the person's own press or submit. Below apiVersion 29 the
  whole go is dropped: show the button only when `kino.pluginApiVersion >= 29` (keep a lower base and opt in with
  `"enhancements": { "29": {} }`) and keep a written instruction beside it for an older Kino.
- **apiVersion 30, the manifest's `setup` block:** a plugin that needs a one-time job before it is useful (downloading a
  catalog, say) declares `"setup": { "route"?, "inputs"? }` (at apiVersion 30, or inside `enhancements["30"]`). `route` (needs
  the `screen` capability) is the screen that shows the setup; without it Kino shows its own setup sheet. `inputs` whitelists
  your OWN `select`, `toggle` or `text` settings (never a `password`) that another plugin may set, with the setting's own type
  and, for a select, a subset of its options. Declaring `setup` requires the exports `setupStatus()` (`{ ready, label?,
  progress? }`, cheap, 10 s) and `setupRun({ inputs?, step })` (one bounded chunk, 20 s, `{ done, progress?, label? }`; Kino
  calls it with step 0, 1, 2… until `done`); keep your progress in `kino.storage`. `validate` checks the block and the exports;
  an enhancement whose exports are missing is dropped, not refused.
- **apiVersion 30, `kino.plugins.setup(repo, inputs?)` and `kino.plugins.setupStatus(repo)`:** one plugin asks Kino to set up
  another installed plugin (by its plain `owner/name`), limited to the inputs that one declares, after the person's OK in
  Kino's own dialog; `setup` resolves `{ state: "SETTING_UP" }` (or `{ state: "READY" }`) at once and `setupStatus` answers
  `{ ready, running, progress?, label? }` from what Kino last heard (`!ready && !running`: it stopped without finishing). No
  `consumes` entry and no capability. `setup` only from a call the person started (`screen`, `screenEvent`, `panelAction`),
  never a timer's tick, a background job or your own `setupRun`; 4 `setup` and 30 `setupStatus` calls in any 10 s; the
  person's 120 s to answer never come out of your call's own time. Codes: `not_installed`, `no_setup`, `bad_request`,
  `refused`, `permission_denied`, `busy`, `rate_limited`, `timeout`. Feature-detect with
  `typeof kino.plugins.setup === "function"`. The kit installs no other plugin: it checks the arguments as the app does
  (`bad_request`) and then answers `not_installed`, and refuses both calls inside `sign()` and a scheduled job.
- **`kino.nuvio`'s `removed` (additive, no apiVersion):** a scraper the person deleted in Plugins ▸ De terceros (one by one,
  or the whole repository with Borrar todo) and has not installed again comes in `available()` with `removed: true`, and
  `use()` lists it in `failed` with code `removed`: Kino never reinstalls it for a plugin, so drop it from what you offer. An
  older Kino never sends either. In the kit's nuvio fixture put `removed: true` on an `available` entry, or on the repository
  for all of them.

The guide: <https://kinotvapp.github.io/kino-plugins/en/identity/>, <https://kinotvapp.github.io/kino-plugins/en/screen-components/>,
<https://kinotvapp.github.io/kino-plugins/en/nuvio-plugins/>.

- **apiVersion 29, `go: { relinkTelegram: true }`:** abre la pantalla «Reautenticar Telegram» de Kino, donde la persona
  vuelve a validar este aparato con su cuenta de Telegram —el arreglo a ofrecer cuando `kino.identity.telegram` respondió
  `not_available`—. No lleva nada y no inicia sesión a nadie, así que acompáñalo con tu propio «Reintentar». Solo para un
  plugin que declara `identity` (el de cualquier otro se descarta, registrado `not_identity`), solo desde la pulsación o el
  envío de la propia persona. Por debajo de apiVersion 29 se descarta todo el go: muestra el botón solo cuando
  `kino.pluginApiVersion >= 29` (mantén una base más baja y actívalo con `"enhancements": { "29": {} }`) y deja una
  instrucción escrita al lado para un Kino anterior.
- **apiVersion 30, el bloque `setup` del manifiesto:** un plugin que necesita un trabajo único antes de servir (descargar un
  catálogo, por ejemplo) declara `"setup": { "route"?, "inputs"? }` (en apiVersion 30, o dentro de `enhancements["30"]`).
  `route` (necesita la capacidad `screen`) es la pantalla que muestra la configuración; sin ella Kino muestra su propia hoja.
  `inputs` lista tus PROPIOS ajustes `select`, `toggle` o `text` (nunca un `password`) que otro plugin puede fijar, con el
  tipo del propio ajuste y, para un select, un subconjunto de sus opciones. Declarar `setup` exige los exports
  `setupStatus()` (`{ ready, label?, progress? }`, barato, 10 s) y `setupRun({ inputs?, step })` (un tramo acotado, 20 s,
  `{ done, progress?, label? }`; Kino lo llama con step 0, 1, 2… hasta `done`); guarda tu avance en `kino.storage`.
  `validate` revisa el bloque y los exports; una mejora (enhancement) a la que le faltan los exports se descarta, no se rechaza.
- **apiVersion 30, `kino.plugins.setup(repo, inputs?)` y `kino.plugins.setupStatus(repo)`:** un plugin le pide a Kino que
  configure otro plugin instalado (por su `owner/name` simple), limitado a los inputs que ese declara, tras el visto bueno de
  la persona en un diálogo de Kino; `setup` resuelve `{ state: "SETTING_UP" }` (o `{ state: "READY" }`) enseguida y
  `setupStatus` responde `{ ready, running, progress?, label? }` con lo último que Kino supo (`!ready && !running`: se detuvo
  sin terminar). Sin entrada en `consumes` y sin capacidad. `setup` solo desde una llamada que inició la persona (`screen`,
  `screenEvent`, `panelAction`), nunca un tick de temporizador, un trabajo en segundo plano ni tu propio `setupRun`; 4
  llamadas a `setup` y 30 a `setupStatus` en cualquier ventana de 10 s; los 120 s que tiene la persona para responder nunca
  salen del tiempo de tu propia llamada. Códigos: `not_installed`, `no_setup`, `bad_request`, `refused`,
  `permission_denied`, `busy`, `rate_limited`, `timeout`. Detéctalo con `typeof kino.plugins.setup === "function"`. El kit no
  instala ningún otro plugin: revisa los argumentos como la app (`bad_request`) y luego responde `not_installed`, y rechaza
  ambas llamadas dentro de `sign()` y de un trabajo programado.
- **`removed` de `kino.nuvio` (aditivo, sin apiVersion nuevo):** un scraper que la persona borró en Plugins ▸ De terceros
  (uno a uno, o todo el repositorio con Borrar todo) y no volvió a instalar llega en `available()` con `removed: true`, y
  `use()` lo pone en `failed` con el código `removed`: Kino nunca lo reinstala para un plugin, así que quítalo de lo que
  ofreces. Un Kino anterior no envía ninguno de los dos. En la fixture de nuvio del kit pon `removed: true` en una entrada de
  `available`, o en el repositorio para todos.

## Tests

```
node --test sdk/test/*.test.mjs
```

These tests are offline and synthetic on purpose: they check rules, not what the person sees. For behaviour —a drawn
screen, a real request, a pressed button— use the `kino-parity` companion above: it runs this same `sdk/` against the
renderer taken from the published app and compares the result with it.

Some tests read files of the app's repository, which this one does not carry; they are skipped here with the reason. The apiVersion 20 protocol tests run here too, against `fixtures/protocol/`. The apiVersion 15 tests (identity, notifications, stores, `init --store`) run here.
Among them are the tests that run the guide's apiVersion 13 examples (catalog, images, QR, encoded frames) and the
catalog's shared test vectors: they run in the app's repository. So do the check of the `--bundle` scaffold against the
guide's bundled example and the user interface reference's tests, which read only that page and its example plugins
and are not copied here.

## Licence / Licencia

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

The kit is developed together with the app and this repository is a copy of it for plugin authors. / El kit se
desarrolla junto con la app y este repositorio es una copia para quien escribe plugins.
