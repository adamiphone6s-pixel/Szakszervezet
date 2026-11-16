# Tartalmi állapot

A szövegek Tóth Éva anyagaiból készültek: az első csomag 2026. november 5-i, a második (OneDrive-zip) 2026. november 16-i. Ha a Word-összefoglaló és a hivatalos szabályzat eltér, a szabályzat szövegét követjük. Kitalált adat nincs az oldalon.

## Mi hol van, és miért

| Tartalom | Hely | Indok |
|---|---|---|
| Alapszabály, adatkezelési tájékoztató, adatvédelmi szabályzat | Főoldal (`#dokumentumok`), lábléc, Rólunk, Adatvédelem oldal | Éva kérése, és az átláthatóság miatt nyilvános |
| Jogsegély, ügyvéd, adótanácsadó (általánosan) | `services.html#jogsegely` | Fontos érv a belépéshez, ezért nyilvános |
| Támogatások összegei és az igénylés menete | `services.html#tamogatasok`, `#igenyles` | Ez győzi meg a leendő tagot |
| Tagkártya, MAKASZ, VDSZ, mézvásár, ajándékok | `services.html#kedvezmenyek` | |
| Teljes jogú és pártoló tagság összevetése | `join.html#tagsag` | A belépés előtti döntéshez kell |
| Belépési nyilatkozatok (cégenként és pártoló) | `join.html#nyomtatvanyok` és `assets/docs/` | Ezt tölti ki az új tag, ezért nyilvános |
| Postacím: 1045 Budapest, Tó u. 1–5. | Kapcsolat oldal, lábléc | |
| Kollektív szerződések, Mt.–KSZ összehasonlítás, kalkulátor | Tagi felület, Dokumentumok, „Kollektív szerződés” kategória | A munkáltatóval kötött belső anyag |
| Belső szabályzatok (támogatási, kölcsön, rekreáció, sztrájk) | Tagi felület, „Szabályzatok” kategória | |
| Tagi nyomtatványok (kérelem, kölcsön, jogfenntartói, kilépési) | Tagi felület, „Nyomtatványok” kategória | Csak tag igényelhet |
| Bizalmik névvel és e-mail címmel, ügyvéd és adótanácsadó elérhetősége | Tagi felület, Bizalmik | Szakszervezeti tagság = különleges személyes adat, ezért nem nyilvános |

## A valódi tagi tartalom kezelése (`private/`)

- A valós vállalati anyagok a `private/` mappában vannak: `private/companies/*.json` és `private/docs/*.pdf`. A mappa **nincs gitben** (`.gitignore`), és a **Vercelre sem kerül fel** (`.vercelignore`).
- A nyilvános demó a `data/companies/*.json` fájlokat használja. Ezeket a `node scripts/build-demo-data.js` parancs állítja elő a private-ból: kiveszi a bizalmik nevét és elérhetőségét (helyettük csak a létszám marad), és kiveszi a privát dokumentumok linkjét (ezek lakatos kártyaként jelennek meg).
- Helyben, demó módban a portál először a `private/companies/<id>.json` fájlt próbálja betölteni, így a helyi gépen a teljes tartalom látszik.
- **Élesben** ezt az anyagot az admin felületen kell feltölteni a Supabase-be (vállalatonként: dokumentumok PDF-ként, bizalmik a kapcsolatoknál). Lásd `docs/SETUP.md`, 6. lépés.

## Még hiányzik

| Tartalom | Hol jelenik meg |
|---|---|
| Vezetők neve és fotója | `about.html`, a Felépítésünk szekció után |
| Opella-cégek bizalmijainak listája | Tagi felület, Bizalmik |
| Bérmegállapodások (cégenként) | Tagi felület, Bérek |
| Közösségi oldalak | Lábléc, kapcsolat |
| Végleges domain | canonical, `sitemap.xml`, `robots.txt`, Open Graph |

## Tisztázandó Évával (a levélbe)

1. **Pártoló tag és jogsegély:** az egyik anyag szerint jár neki jogsegély, a másik szerint nem. Most „igen” szerepel.
2. **Üdülési támogatás:** a szabályzat „Sanofi-cégcsoport és Euroapi” tagjait említi. Jár-e az Opella-cégeknél dolgozóknak?
3. **Opella Healthcare Hungary:** nincs saját belépési nyilatkozata, most az üres „külső cég” változat szerepel. Az „Opella H.H Kft” nevű fájl valójában az Opella Healthcare Commercial Kft-nek szól.
4. **Ügyvédi szöveg:** az anyag Euroapi-specifikus. Az oldalon általánosítva szerepel; meg kell erősíteni, hogy minden cégre igaz.
5. **Elírásgyanús e-mail címek:** Hetényi Gergő → `gergo.veszelei@…`; `danile.molnar-ujp@…`.
6. **2018-as GDPR-tájékoztató:** freemail-cím és a NAIH régi címe szerepel benne. Az oldal a NAIH mostani címét használja (Falk Miksa u. 9–11.). Érdemes frissíteni a PDF-et.
7. **Weboldal-adatkezelési tájékoztató** (`privacy.body`): a megőrzési idők és az EU-s adatközpont vállalása tervezet, jóvá kell hagyni.
8. **Csanyikvölgy:** 5 bizalminak nincs e-mail címe („Elérhető a munkahelyén” szerepel). Melyik KSZ vonatkozik rájuk? Most a Sanofié.
9. **Taglétszám** (most 720): frissíteni kell induláskor (`index.html`, `i18n.js`: `hero.loc`, `about.t4.d`).

## Korábbról

- Az „Mt. XXI. fejezet” hivatkozás kimaradt, amíg a fejezetszámot nem ellenőriztük.
- A SharePoint-link és az irodaszám belső adat, ezért nincs a nyilvános oldalon.
- A plakát illusztrációjának licence nem ismert, ezért csak a színeit használjuk.

## Bemutató-belépés

Éva tesztelése miatt a demó-hozzáférés egyelőre **mindig látszik** a belépőoldalon: tagi kód `DEMO`, jelszó `demo1234` (a cégkódok, pl. `CH-1001`, ugyanezzel a jelszóval mennek). Elrejtés: az `assets/js/portal.js`-ben a kikommentelt `?demo`-feltételes sort kell visszakapcsolni. Amíg nincs éles háttér, a jelentkezési és a kapcsolati űrlap levelet állít össze a chinoinvdsz@gmail.com címre.

## Ha változik egy szám

- **Taglétszám:** az `index.html` `data-members` értéke (a „720 pont” történet pontjai és felirata), valamint az `i18n.js` `hero.loc` és `about.t4.d` kulcsa.
- **Támogatási összegek:** az `i18n.js` `support.*` kulcsai (a lista) **és** az `assets/js/wizard.js` `ITEMS` táblája (a támogatás-kereső számol vele). A kettőt együtt kell átírni.
- **Támogatás-kereső:** csak a nyilvános támogatási adatokból dolgozik, nem küld és nem tárol semmit. Ahol a szabályzat nem mond biztosat (pl. Opella-cégek és üdülés), ott a bizalmihoz irányít.
