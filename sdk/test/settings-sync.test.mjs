// A password setting's "sync": false (apiVersion 13), judged as the app's PluginSettings and ManifestParser.parseSync do.
import { test } from "node:test";
import assert from "node:assert/strict";
import { contract, validateManifest } from "../contract.mjs";

const base = { id: "demo", name: "Demo", version: "1.0.0", entry: "plugin.js", hosts: ["api.example.com"], capabilities: ["search", "resolve"] };
const v = (settings, extra = {}) => validateManifest(JSON.stringify({ ...base, apiVersion: 13, settings, ...extra }));
const pw = (extra = {}) => ({ key: "tg_password", label: "2FA", type: "password", ...extra });

test("the contract names the option, apiVersion 13, default true", () => {
  assert.equal(contract.settings.sync.apiVersion, 13);
  assert.equal(contract.settings.sync.default, true);
});

test("sync false or true is accepted on a password", () => {
  assert.equal(v([pw({ sync: false })]).ok, true);
  assert.equal(v([pw({ sync: true })]).ok, true);
  assert.equal(v([pw()]).ok, true);
});

test("sync on anything but a password, or not a boolean, is refused with the app's messages", () => {
  const only = v([{ key: "nick", label: "Nick", type: "text", sync: false }]);
  assert.equal(only.ok, false);
  assert.equal(only.message, 'Only a setting of type password has "sync" ("nick")');
  for (const type of ["toggle", "section", "action"]) assert.equal(v([{ key: "x", label: "X", type, sync: false }]).ok, false, type);
  const notBool = v([pw({ sync: "no" })]);
  assert.equal(notBool.ok, false);
  assert.equal(notBool.message, '"sync" of the setting "tg_password" must be true or false');
});

test("below apiVersion 13 the key is unknown, so ignored", () => {
  assert.equal(validateManifest(JSON.stringify({ ...base, apiVersion: 12, settings: [{ key: "nick", label: "Nick", type: "text", sync: "x" }] })).ok, true);
});

test("a sync provider can't provision a device-only setting", () => {
  const settings = [{ key: "botToken", label: "Token", type: "password" }, pw({ sync: false })];
  const m = (provision) => v(settings, { apiVersion: 13, capabilities: ["search", "resolve", "syncProvider"], sync: { keySecret: "botToken", provision } });
  const bad = m(["botToken", "tg_password"]);
  assert.equal(bad.ok, false);
  assert.equal(bad.message, contract.manifest.sync.provision.deviceOnlyMessage);
  assert.equal(m(["botToken"]).ok, true, JSON.stringify(m(["botToken"])));
});
