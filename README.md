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

## Where it differs from the app / Dónde difiere de la app

The kit cannot copy everything the app's engine does (memory and stack limits, the `/v` regex flag, `new URL` with
non-ASCII hosts...). The list, measured against the real engine, is in the documentation:
<https://kinotvapp.github.io/kino-plugins/engine-limits/#kit-differences>

El kit no puede copiar todo lo que hace el motor de la app (límites de memoria y de pila, la bandera `/v` de regex,
`new URL` con hosts no ASCII...). La lista, medida contra el motor real, está en la documentación.

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

`apiVersion` 13 llega en **Kino 0.9.74, la próxima versión, junto con apiVersion 12; todavía no está publicada**, y
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

## apiVersion 15 (the next Kino, not published yet) / apiVersion 15 (la próxima versión de Kino, sin publicar)

`apiVersion` 15 is **in the next Kino after 0.9.76 (not published yet)**; a Kino before it refuses it. It adds two declarative
capabilities that never stand alone, and the kit already runs both: **`identity`** (`kino.identity.telegram()`: a pseudonym id
of the person for your plugin plus Kino's gate token, and with a `challenge` a device-key signature your server can verify;
only plugins signed with Kino's own author key get an answer; `KINO_IDENTITY_*` variables in the kit) and **`notifications`**
(`kino.notifications.post({ id, title, text, go })` / `clear(id?)`: notices in the Home bell, 20 posts an hour; the kit keeps
them in `<folder>/.kino-notices.json`, `node sdk/run.mjs <folder> notifications`). Full reference: `GUIDE.md` of the example
plugins, sections `kino.identity` and `kino.notifications`. / `apiVersion` 15 **llega con Kino 0.9.76 (todavía sin
publicar)**; un Kino anterior lo rechaza. Agrega dos capacidades declarativas que nunca van solas, y el kit ya corre ambas:
**`identity`** (quién es la persona, sin login) y **`notifications`** (avisos en la campanita de Home).

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
  (`deviceKey`, `signature`, `author`, `codeHash`). **Only plugins signed with Kino's own author key get an answer**; any other
  plugin is refused with `permission_denied`. Allowed only inside a call the person started (a screen, a screen event, a panel
  action). The kit answers a fake account: `KINO_IDENTITY_TG=<id|none>`, `KINO_IDENTITY_TOKEN`, `KINO_IDENTITY_AUTHOR`,
  `KINO_IDENTITY_REVOKED=1`. Never log or show the token.
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
solo responde a plugins firmados con la llave de autor de Kino; el kit simula una cuenta con `KINO_IDENTITY_TG`,
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

## Tests

```
node --test sdk/test/*.test.mjs
```

Some tests read files of the app's repository, which this one does not carry; they are skipped here with the reason. The apiVersion 15 tests (identity, notifications, stores, `init --store`) run here.
Among them are the tests that run the guide's apiVersion 13 examples (catalog, images, QR, encoded frames) and the
catalog's shared test vectors: they run in the app's repository. So do the check of the `--bundle` scaffold against the
guide's bundled example and the user interface reference's tests, which read only that page and its example plugins
and are not copied here.

## Licence / Licencia

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

The kit is developed together with the app and this repository is a copy of it for plugin authors. / El kit se
desarrolla junto con la app y este repositorio es una copia para quien escribe plugins.
