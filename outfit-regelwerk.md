# Outfit-Regelwerk v2 (programmierbare Spezifikation)

Diese Version ersetzt die vorherige. Änderungen: Material/Stoff wird nicht
erfasst. Formalität wird als **4 Item-Stufen** geführt, die sich auf
**3 tägliche Ausgabekategorien** abbilden. Alle Regeln sind als deterministische
Bedingungen formuliert (Hard-Filter = bestehen/verwerfen, Scoring = feste
Punktzahlen), damit sie 1:1 in Code übersetzt werden können.

---

## 1. Enums & Datenmodell

```
enum Wetter { KALT, MILD, WARM }

enum FormalitaetsStufe {
  1_FREIZEIT,     // Trainingshose, Sneaker, Hoodie-artig, Fleece
  2_ALLTAG,       // Jeans, Chino, Polohemd, schlichter Pullover
  3_BUSINESS,     // Anzugshose, Blazer, klassisches Hemd, Bluse
  4_ELEGANT       // Cocktailkleid, High Heels, Fliege, Abendlook
}

enum MusterTyp { EINFARBIG, GESTREIFT, KARIERT, GEMUSTERT }

enum SlotTyp {
  OBERTEIL,
  UNTERTEIL,
  GANZKOERPER,        // Kleid / Jumpsuit -- zählt als OBERTEIL + UNTERTEIL
  SCHUHE,
  AUSSENLAGE,          // Jacke / Mantel / Weste
  ACCESSOIRE_SCHMUCK,
  ACCESSOIRE_GUERTEL,
  ACCESSOIRE_KOPF,
  ACCESSOIRE_SCHAL,
  ACCESSOIRE_KRAWATTE,
  ACCESSOIRE_TASCHE,
  ACCESSOIRE_SONSTIGES
}

enum Farbfamilie {
  NEUTRAL,   // Schwarz, Weiß, Grau, Beige, Creme, Braun, Navy
  ROT, ORANGE, GELB, GRUEN, BLAU, LILA, ROSA
}
```

**Item-Schema (pro Kleidungsstück):**
```json
{
  "id": "string",
  "kategorie": "enum aus der 74-Kategorien-Liste (Abschnitt 2)",
  "slotTyp": "wird automatisch aus 'kategorie' abgeleitet, siehe Abschnitt 2",
  "farbfamilie": "Farbfamilie (Hauptfarbe)",
  "farbname": "string (z.B. 'Navy', 'Bordeaux') -- nur für Anzeige, nicht für Logik",
  "wetter": "Wetter (genau ein Wert; falls mehrfach tragbar: Array von Wetter)",
  "formalitaet": "FormalitaetsStufe",
  "muster": "MusterTyp",
  "istJoker": "boolean (default: false, vom Nutzer optional gesetzt)"
}
```

---

## 2. Kategorie → Slot-Typ (feste, hartcodierte Zuordnung)

Diese Zuordnung ist fix im Code hinterlegt und wird nicht vom Nutzer verändert.

| SlotTyp | Kategorien |
|---|---|
| **OBERTEIL** | T-Shirt, Langarmshirt, Tanktop, Klassisches Hemd, Kurzarm Hemd, Jeanshemd, Blusen, Polohemd, Klassischer Pullover, Rollkragenpullover, V-Ausschnitt Pullover, Troyer |
| **UNTERTEIL** | Jeans, Chino, Anzugshose, Trainingshose, Leggings, Jeans Short, Chino Short, Trainingshose Short, Minirock, Knielanger Rock, Midirock, Maxirock |
| **GANZKOERPER** | Minikleid, Midikleid, Maxikleid, Sommerkleid, Winterkleid, Jeanskleid, Cocktailkleid, Formelles/Business Kleid, Jumpsuit |
| **SCHUHE** | Sneaker, Chelsea Boots, Schnürstiefel, Kniehoher Stiefel, Overknee, Bootsschuhe/Loafer/Mokassins, Ballerinas, Sandalen, Elegante Schuhe & High Heels |
| **AUSSENLAGE** | Strickjacke, Lederjacke, Jeansjacke, Bomberjacke, Fleecejacke, Daunenjacke, Steppjacke, Harrington-Jacke, Windbreaker, Weste, Klassischer Mantel, Parka, Trenchcoat, Kurzmantel, Dufflecoat, Sakko/Blazer, Anzugsweste |
| **ACCESSOIRE_SCHMUCK** | Ring, Armband, Armbanduhr, Kette |
| **ACCESSOIRE_GUERTEL** | Gürtel |
| **ACCESSOIRE_KOPF** | Beanie/Mütze, Cap, Hut |
| **ACCESSOIRE_SCHAL** | Schal & Tuch |
| **ACCESSOIRE_KRAWATTE** | Krawatte, Fliege |
| **ACCESSOIRE_TASCHE** | Handtasche, Umhängetasche, Rucksack |
| **ACCESSOIRE_SONSTIGES** | Sonnenbrille |

*(Korrigierte Tippfehler ggü. eurer Ursprungsliste: "Klassischer Mantel", "Loafer".)*

---

## 3. Formalitätsstufen → Ausgabekategorien

```
OutfitTyp.FREIZEIT.erlaubteStufen = { 1_FREIZEIT }
OutfitTyp.ALLTAG.erlaubteStufen   = { 2_ALLTAG }
OutfitTyp.CHIC.erlaubteStufen     = { 3_BUSINESS, 4_ELEGANT }
```

**Joker-Regel (deterministisch):**
Ein Item mit `istJoker = true` darf **genau 1 Stufe** außerhalb der
erlaubten Stufen des Ziel-Outfit-Typs liegen und gilt trotzdem als gültig.
Ein Item ohne `istJoker` außerhalb der erlaubten Stufen führt zum
**sofortigen Verwerfen** des Outfits (kein Soft-Malus).

Beispiele:
- Ziel = ALLTAG (Stufe 2). Ein Sneaker mit Stufe 1 und `istJoker=true` → erlaubt.
- Ziel = ALLTAG. Eine Trainingshose mit Stufe 1 und `istJoker=false` → Outfit verworfen.
- Ziel = CHIC. Ein Item mit Stufe 4 ist erlaubt, auch ohne Joker (liegt bereits im Zielbereich).
- Ziel = CHIC. Ein Item mit Stufe 2 und `istJoker=true` → erlaubt (Abstand zur nächstgelegenen Zielstufe [3] = 1).
- Ziel = FREIZEIT. Ein Item mit Stufe 3 (Abstand 2) → **immer verworfen**, auch mit Joker (Joker deckt nur 1 Stufe Abstand ab).

---

## 4. Farbfamilien-Tabelle (für die Farb-Logik)

| Farbfamilie | Repräsentativer Farbton (Grad im Farbkreis) | Neutral? |
|---|---|---|
| NEUTRAL (Schwarz, Weiß, Grau, Beige, Creme, Braun, Navy) | – | ja |
| ROT (Rot, Bordeaux/Weinrot) | 0° | nein |
| ORANGE (Orange, Terrakotta) | 30° | nein |
| GELB (Gelb, Senfgelb) | 60° | nein |
| GRUEN (Grün, Oliv, Mint) | 120° | nein |
| BLAU (Blau, Hellblau, Türkis) | 210° | nein |
| LILA (Lila, Violett, Flieder) | 270° | nein |
| ROSA (Rosa, Pink, Fuchsia) | 330° | nein |

`hueDistance(f1, f2) = min(|h1 - h2|, 360 - |h1 - h2|)`

---

## 5. Outfit-Grundstruktur (Pflicht- und optionale Slots)

**Pflicht (immer):**
- 1× OBERTEIL + 1× UNTERTEIL, **ODER** 1× GANZKOERPER (zählt als beides)
- 1× SCHUHE

**Optional:**
- max. 1× AUSSENLAGE
- max. 3 Accessoires gesamt, davon:
  - max. 1× ACCESSOIRE_KOPF
  - max. 1× ACCESSOIRE_TASCHE
  - max. 1× ACCESSOIRE_GUERTEL
  - ACCESSOIRE_SCHMUCK: max. 3 Einzelteile zählen zusammen als 1 "Accessoire-Slot"
  - ACCESSOIRE_KRAWATTE: nur zulässig, wenn Outfit zusätzlich ein OBERTEIL der
    Kategorie "Klassisches Hemd"/"Kurzarm Hemd"/"Jeanshemd"/"Blusen" **oder**
    ein AUSSENLAGE-Item der Kategorie "Sakko/Blazer" enthält

---

## 6. Hard-Filter (Reihenfolge, alle müssen bestanden werden)

```
FUNCTION istGueltig(outfit, tagesWetter, zielOutfitTyp):

  // 6.1 Pflichtslots
  IF NOT (hatOberteilUndUnterteil(outfit) OR hatGanzkoerper(outfit)):
      RETURN false
  IF NOT hatGenauEinSchuh(outfit):
      RETURN false
  IF hatGanzkoerper(outfit) AND (hatZusaetzlichesOberteil(outfit) OR hatZusaetzlichesUnterteil(outfit)):
      RETURN false

  // 6.2 Wetter
  FOR EACH item IN outfit:
      IF tagesWetter NOT IN item.wetter:
          RETURN false
  IF tagesWetter == KALT AND NOT hatAussenlage(outfit):
      RETURN false

  // 6.3 Formalität (siehe Abschnitt 3)
  erlaubt = zielOutfitTyp.erlaubteStufen
  FOR EACH item IN outfit:
      IF item.formalitaet IN erlaubt:
          CONTINUE
      abstand = minAbstand(item.formalitaet, erlaubt)
      IF abstand == 1 AND item.istJoker == true:
          CONTINUE
      RETURN false   // zu große Abweichung oder kein Joker

  // 6.4 Slot-Limits
  IF countAccessoireSlot(outfit, ACCESSOIRE_KOPF) > 1: RETURN false
  IF countAccessoireSlot(outfit, ACCESSOIRE_TASCHE) > 1: RETURN false
  IF countAccessoireSlot(outfit, ACCESSOIRE_GUERTEL) > 1: RETURN false
  IF countAccessoireItems(outfit, ACCESSOIRE_SCHMUCK) > 3: RETURN false
  IF gesamtAnzahlAccessoireSlots(outfit) > 3: RETURN false
  IF hatKrawatteOderFliege(outfit) AND NOT hatPassendesOberteilOderBlazer(outfit):
      RETURN false

  RETURN true
END FUNCTION
```

---

## 7. Scoring (nur für Outfits, die Abschnitt 6 bestanden haben)

Maximal 100 Punkte, vier Kriterien:

| Kriterium | Max. Punkte |
|---|---|
| Farb-Harmonie | 32 |
| Formalitäts-Präzision | 24 |
| Muster-Kombination | 22 |
| Wetter-Feinabstimmung | 22 |

### 7.1 Farb-Harmonie (32 Punkte)

Nur Farben aus OBERTEIL, UNTERTEIL/GANZKOERPER, SCHUHE und AUSSENLAGE fließen
ein. Accessoire-Farben werden **nicht** gezählt (bewusste Vereinfachung).

```
families = distinct(farbfamilie von allen relevanten Items, NEUTRAL ausgeschlossen)

IF families.size == 0:        score = 32   // rein neutral
ELSE IF families.size == 1:   score = 30   // eine Farbfamilie (+ ggf. neutral)
ELSE IF families.size == 2:
    d = hueDistance(families[0], families[1])
    IF d <= 40:                score = 27  // analog
    ELSE IF 150 <= d <= 210:   score = 25  // komplementär
    ELSE:                      score = 12  // kein erkennbares Schema
ELSE:                          score = 0   // 3+ Farbfamilien
```

### 7.2 Formalitäts-Präzision (24 Punkte)

```
jokerCount = Anzahl Items im Outfit mit istJoker==true UND formalitaet NOT IN erlaubt

IF jokerCount == 0 AND alle Items gleiche formalitaet-Stufe:
      score = 24
ELSE IF jokerCount == 0 (nur bei CHIC: Mix aus Stufe 3 & 4 erlaubt):
      score = 20
ELSE IF jokerCount == 1:
      score = 14
ELSE (jokerCount >= 2):
      score = 8
```

### 7.3 Muster-Kombination (22 Punkte)

```
gemusterte = Items mit muster != EINFARBIG

IF gemusterte.count == 0:  score = 22
IF gemusterte.count == 1:  score = 19
IF gemusterte.count == 2 AND unterschiedlicher MusterTyp:  score = 10
IF gemusterte.count == 2 AND gleicher MusterTyp:           score = 3
IF gemusterte.count >= 3:  score = 0
```

### 7.4 Wetter-Feinabstimmung (22 Punkte)

```
IF tagesWetter == KALT:
    IF hatAussenlage(outfit): score = 22       // durch Hard-Filter ohnehin Pflicht
ELSE IF tagesWetter == MILD:
    IF hatAussenlage(outfit): score = 22
    ELSE:                     score = 16
ELSE (WARM):
    score = 22   // keine Aussenlage nötig, alle Items sind wetterpassend gefiltert
```

**Gesamt-Score = Summe aller vier Teil-Scores (0–100).**

---

## 8. Gesamt-Algorithmus

```
FUNCTION generiereTagesOutfits(kleiderschrank, tagesWetter):
  ergebnis = {}

  FOR EACH zielOutfitTyp IN [FREIZEIT, ALLTAG, CHIC]:
      kandidaten = []

      FOR EACH kombination IN erzeugeKombinationen(kleiderschrank):
          // kombination = 1 Basis-Set (Ober+Unter ODER Ganzkoerper) + Schuhe
          //               + 0–1 Aussenlage + 0–3 Accessoires
          IF istGueltig(kombination, tagesWetter, zielOutfitTyp):
              score = berechneScore(kombination, tagesWetter, zielOutfitTyp)
              kandidaten.add((kombination, score))

      kandidaten.sortiere_absteigend_nach_score()
      top3 = wendeDiversitaetsregel(kandidaten, bereitsGewaehlt=ergebnis)
      ergebnis[zielOutfitTyp] = top3

  RETURN ergebnis   // 9 Outfits gesamt (3x3)
END FUNCTION
```

---

## 9. Diversitätsregel (nur innerhalb der 9 Tages-Outfits)

```
FUNCTION wendeDiversitaetsregel(sortierteKandidaten, bereitsGewaehlt):
  ausgewaehlt = []
  itemNutzungsZaehler = zaehleVorkommen(bereitsGewaehlt)   // über alle Typen hinweg

  FOR EACH (kombination, score) IN sortierteKandidaten:
      IF ausgewaehlt.size == 3: BREAK

      maxNutzung = MAX(itemNutzungsZaehler[item.id] FOR item IN kombination.items)
      IF maxNutzung >= 2:
          CONTINUE   // Item wäre bereits zum 3. Mal am Tag verwendet -> überspringen

      IF ausgewaehlt.size >= 1:
          // mind. 1 unterschiedlicher Pflicht-Slot (Oberteil/Unterteil/Schuhe)
          IF identischeKernkombination(kombination, ausgewaehlt):
              CONTINUE

      ausgewaehlt.add(kombination)
      erhoeheZaehler(itemNutzungsZaehler, kombination.items)

  RETURN ausgewaehlt
END FUNCTION
```

---

## 10. Edge Cases (explizite Sonderregeln)

| Fall | Regel |
|---|---|
| GANZKOERPER + AUSSENLAGE | erlaubt, bei KALT sogar Pflicht |
| GANZKOERPER + zusätzliches OBERTEIL/UNTERTEIL | verboten (Hard-Filter 6.1) |
| Krawatte/Fliege ohne passendes Oberteil/Blazer | verboten (Hard-Filter 6.4) |
| Sonnenbrille bei KALT | erlaubt, kein Einfluss auf Score |
| 2 Schmuckstücke + 1 Tasche + 1 Kopfbedeckung | genau an der Grenze (3 Accessoire-Slots) → erlaubt |
| 2 Schmuckstücke + 1 Tasche + 1 Kopfbedeckung + 1 Gürtel | 4 Accessoire-Slots → verboten |
| Item ohne `istJoker`-Flag aber genau auf Zielstufe | kein Joker nötig, ganz normal gültig |

---

## 11. Output-Schema (generiertes Outfit)

```json
{
  "outfitTyp": "FREIZEIT | ALLTAG | CHIC",
  "score": 0-100,
  "items": [
    { "id": "string", "slotTyp": "enum" }
  ],
  "scoreDetails": {
    "farbharmonie": 0-32,
    "formalitaet": 0-24,
    "muster": 0-22,
    "wetter": 0-22
  }
}
```

---

## 12. Offene, bewusst nicht geregelte Punkte

- Passform/Silhouette: kein Attribut vorhanden → kein Kriterium.
- Mehrtages-Abwechslung: kein Datumsfeld vorhanden → nur Diversität innerhalb
  eines Tages (Abschnitt 9).
- Gewichtungen (32/24/22/22) sind erste sinnvolle Startwerte, sollten aber
  konfigurierbar bleiben (z. B. als Konstanten/Config-Datei, nicht hartcodiert
  im Algorithmus verstreut).
