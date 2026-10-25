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
renders no form, so it does not filter by device. A complete, signed provider to copy:
<https://github.com/kinotvapp/kino-plugin-sync-gram>.

Desde `apiVersion` 12 (Kino 0.9.74) un plugin puede ser el transporte de la sincronización entre los aparatos de la
persona (capacidad `syncProvider`). `validate.mjs` revisa el bloque `sync` con las reglas de la app y muestra la línea de
consentimiento; `run.mjs` no llama a las funciones de sincronización: pruébalas con tus propias pruebas.
Los ajustes pueden llevar `devices` (`["phone"]` / `["tv"]`: dónde los dibuja Kino) y una acción `linkOnly` (nunca
se dibuja, solo corre como `confirm` de un `link`), los dos desde apiVersion 12: `validate.mjs` los revisa como la app.
Un proveedor completo y firmado para copiar: <https://github.com/kinotvapp/kino-plugin-sync-gram>.

## Tests

```
node --test sdk/test/*.test.mjs
```

Some tests read files of the app's repository, which this one does not carry; they are skipped here with the reason.

## Licence / Licencia

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

The kit is developed together with the app and this repository is a copy of it for plugin authors. / El kit se
desarrolla junto con la app y este repositorio es una copia para quien escribe plugins.
