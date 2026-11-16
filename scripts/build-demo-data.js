#!/usr/bin/env node
/*
 * Nyilvános DEMÓ-adat előállítása a valódi tagi tartalomból.
 *
 *   private/companies/<cég>.json  →  data/companies/<cég>.json
 *
 * A private/ mappa nincs a gitben, és nem kerül a nyilvános deployba. A demó-változatból kimarad
 * minden, ami tagoknak szól: a bizalmik neve és elérhetősége (csak a létszámuk marad), valamint a
 * privát dokumentumok letöltőlinkje (a cím és a leírás látszik, a fájl élesítés után, belépéssel
 * nyílik). A nyilvános fájlok (assets/docs) linkje megmarad.
 *
 * Futtatás a projekt gyökeréből:  node scripts/build-demo-data.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "private", "companies");
const OUT = path.join(ROOT, "data", "companies");

if (!fs.existsSync(SRC)) {
  console.error("Nincs private/companies mappa — a demó-adat csak a valódi tartalomból állítható elő.");
  process.exit(1);
}

const isSteward = (c) => !(c.group && c.group.hu === "Szolgáltatások");

for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".json"))) {
  const c = JSON.parse(fs.readFileSync(path.join(SRC, file), "utf8"));
  c._info = "NYILVÁNOS DEMÓ — a scripts/build-demo-data.js állítja elő, kézzel ne szerkeszd. A bizalmik adatai és a tagi dokumentumok csak belépés után érhetők el.";
  // A szakszervezeti iroda és a szolgáltatók a szolgáltatások oldalon is szerepelnek; a bizalmik nem
  const stewards = (c.contacts || []).filter(isSteward).length;
  c.contacts = (c.contacts || []).filter((p) => !isSteward(p) && p.name === "Szakszervezeti iroda");
  c.locked = { contacts: stewards };
  c.documents = (c.documents || []).map((d) => {
    const out = { type: d.type, cat: d.cat, title: d.title, meta: d.meta };
    if (!d.file && d.url && d.url.startsWith("assets/")) out.url = d.url;
    return out;
  });
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(c, null, 2) + "\n");
  console.log(file, "→ dokumentumok:", c.documents.length, "| rejtett bizalmik:", stewards);
}
