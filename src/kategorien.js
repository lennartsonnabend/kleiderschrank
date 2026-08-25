// Hierarchische Kleidungskategorien (Auswahlbaum) für das Kategorie-Flyout.
// Zwei Varianten: male und female. Bei Erstnutzung wählt der Nutzer später
// "männlich" -> male, sonst -> female (female ist die umfangreichere Variante).

const n = (label, children) => (children ? { label, children } : { label });

// --- Tops & T-Shirts ---
const TOPS_BASE = [
  n('T-Shirt'),
  n('Langarmshirt'),
  n('Tanktop'),
  n('Hemden', [n('Klassisches Hemd'), n('Kurzarm'), n('Jeanshemd')]),
  n('Polohemd'),
];
const TOPS_MALE = n('Tops & T-Shirts', TOPS_BASE);
const TOPS_FEMALE = n('Tops & T-Shirts', [
  n('T-Shirt'),
  n('Langarmshirt'),
  n('Tanktop'),
  n('Hemden', [n('Klassisches Hemd'), n('Kurzarm'), n('Jeanshemd')]),
  n('Blusen'),
  n('Polohemd'),
]);

// --- Hosen ---
const SHORTS = n('Shorts', [n('Jeans'), n('Chino'), n('Trainingshose')]);
const HOSEN_MALE = n('Hosen', [
  n('Jeans'), n('Chino'), n('Anzugshose'), n('Trainingshose'), SHORTS,
]);
const HOSEN_FEMALE = n('Hosen', [
  n('Jeans'), n('Chino'), n('Anzugshose'), n('Trainingshose'),
  n('Leggings'), SHORTS,
]);

// --- Pullover & Sweater ---
const PULLOVER = n('Pullover & Sweater', [
  n('Klassischer Pullover'),
  n('Rollkragenpullover'),
  n('V-Ausschnitt'),
  n('Troyer / Quarterzip'),
]);

// --- Jacken & Mäntel ---
const JACKEN_MAENTEL = n('Jacken & Mäntel', [
  n('Jacken', [
    n('Strickjacke'), n('Lederjacke'), n('Jeansjacke'), n('Bomberjacke'),
    n('Fleecejacke'), n('Daunenjacke'), n('Steppjacke'), n('Harrington-Jacke'),
    n('Windbreaker'), n('Regenjacke'),
  ]),
  n('Mäntel', [
    n('Klassischer Mantel'), n('Parka'), n('Trenchcoat'), n('Kurzmantel'),
    n('Dufflecoat'), n('Regenmantel'),
  ]),
  n('Westen'),
]);

// --- Anzüge & Blazer ---
const ANZUEGE = n('Anzüge & Blazer', [
  n('Sakkos & Blazer'),
  n('Anzugsweste'),
]);

// --- Accessoires ---
const ACC_COMMON = [
  n('Ring'), n('Ohrringe'), n('Armband'), n('Armbanduhr'), n('Kette'), n('Gürtel'),
  n('Handschuhe'),
  n('Mützen & Hüte', [n('Beanie / Mütze'), n('Cap'), n('Hut')]),
  n('Schal & Tuch'),
  n('Sonnenbrille'),
  n('Krawatte & Fliege', [n('Krawatte'), n('Fliege')]),
];
const ACCESSOIRES_MALE = n('Accessoires', [
  ...ACC_COMMON,
  n('Taschen', [n('Umhängetasche'), n('Rucksack'), n('Aktentasche')]),
]);
const ACCESSOIRES_FEMALE = n('Accessoires', [
  ...ACC_COMMON,
  n('Taschen', [n('Handtasche'), n('Umhängetasche'), n('Rucksack')]),
]);

// --- female ---
export const KATEGORIE_TREE_FEMALE = [
  TOPS_FEMALE,
  HOSEN_FEMALE,
  PULLOVER,
  n('Röcke', [n('Minirock'), n('Knielanger Rock'), n('Midirock'), n('Maxirock')]),
  n('Kleider', [
    n('Minikleid'), n('Midikleid'), n('Maxikleid'), n('Sommerkleid'),
    n('Winterkleid'), n('Jeanskleid'), n('Cocktailkleid'),
    n('Formelles & Business-Kleid'),
  ]),
  JACKEN_MAENTEL,
  ANZUEGE,
  n('Jumpsuit'),
  n('Schuhe', [
    n('Sneaker'),
    n('Stiefel', [
      n('Chelsea Boots & Schlupfstiefel'), n('Schnürstiefel'),
      n('Kniehohe Stiefel'), n('Overknees'),
    ]),
    n('Bootsschuhe, Loafer & Mokassins'),
    n('Ballerinas'),
    n('Sandalen'),
    n('Anzugsschuhe'),
    n('Elegante Schuhe & High Heels'),
  ]),
  ACCESSOIRES_FEMALE,
];

// --- male ---
export const KATEGORIE_TREE_MALE = [
  TOPS_MALE,
  HOSEN_MALE,
  PULLOVER,
  JACKEN_MAENTEL,
  ANZUEGE,
  n('Schuhe', [
    n('Sneaker'),
    n('Stiefel', [n('Chelsea Boots & Schlupfstiefel'), n('Schnürstiefel')]),
    n('Bootsschuhe, Loafer & Mokassins'),
    n('Sandalen'),
    n('Anzugsschuhe'),
    n('Elegante Schuhe'),
  ]),
  ACCESSOIRES_MALE,
];

export function kategorieTree(gender) {
  return gender === 'male' ? KATEGORIE_TREE_MALE : KATEGORIE_TREE_FEMALE;
}

// Ordnet einen ausgewählten Pfad einer groben Kategorie zu, damit die
// Outfit-Regel-Engine (Oberteil/Unterteil/Schuhe/Jacke/Mantel/…) weiter funktioniert.
// Case-insensitiv: gespeicherte Pfade können klein- oder großgeschrieben sein.
export function grobkategorieFor(path) {
  if (!path || !path.length) return null;
  const top = (path[0] || '').toLowerCase();
  const second = (path[1] || '').toLowerCase();
  const leaf = (path[path.length - 1] || '').toLowerCase();
  switch (top) {
    case 'schuhe': return 'schuhe';
    case 'accessoires': return 'accessoire';
    case 'kleider': return 'einteiler';
    case 'jumpsuit': return 'einteiler';
    case 'hosen': return 'unterteil';
    case 'röcke': return 'unterteil';
    case 'jacken & mäntel': return second === 'mäntel' ? 'mantel' : 'jacke';
    case 'anzüge & blazer': return /hose/.test(leaf) ? 'unterteil' : 'oberteil';
    case 'tops & t-shirts': return 'oberteil';
    case 'pullover & sweater': return 'oberteil';
    default: return 'oberteil';
  }
}
