// Minimale i18n: Deutsch ist der Schlüssel. Für Englisch greift die EN-Map,
// für Deutsch bleibt der Text unverändert. Platzhalter {0},{1} via t(key, a, b).
import { getLang } from './settings.js';

const EN = {
  // Navigation / global
  'Schrank': 'Wardrobe', 'Kalender': 'Calendar',
  // Wiki
  'Wie funktioniert die App?': 'How does the app work?',
  'Kleiderschrank füllen: ': 'Fill your wardrobe: ',
  'Kleidung fotografieren, freistellen lassen und danach Kategorie, Farben, Wetter, Anlass, Muster und Passform festlegen.': 'Photograph your clothes, remove the background, then set category, colors, weather, occasion, pattern and fit.',
  'Vorschläge: ': 'Suggestions: ',
  'Die App stellt täglich Outfits zusammen – nach Anlass (Alltag, Chic, Freizeit) und passend zum Wetter (Temperatur und Regen).': 'The app puts together outfits every day – by occasion (Everyday, Chic, Casual) and to match the weather (temperature and rain).',
  'Merken und planen: ': 'Save and plan: ',
  'Outfits favorisieren, eigene Looks hochladen und einzelnen Tagen im Kalender zuordnen.': 'Favorite outfits, upload your own looks and assign them to days in the calendar.',
  'Daten: ': 'Data: ',
  'Alle Daten bleiben lokal im Browser gespeichert. Lediglich der Standort kann für regengerechte Outfits abgerufen werden.': 'All data stays stored locally in your browser. Only your location may be used for rain-appropriate outfits.',
  // OOTD
  'Alltag': 'Everyday', 'Chic': 'Chic', 'Freizeit': 'Casual',
  'Heute': 'Today', 'Zum Kalender': 'To calendar', 'Merk dir Outfits vor': 'Bookmark outfits',
  'Wetter wird geladen': 'Loading weather', 'Wetter nicht verfügbar': 'Weather unavailable', 'Regen': 'rain',
  'Für Vorschläge fehlt noch: ': 'Still missing for suggestions: ', 'Teile hinzufügen →': 'Add items →',
  'Noch keine Kombination – markiere Teile als „{0}".': 'No combination yet – tag items as “{0}”.',
  'Als Favorit speichern': 'Save as favorite', 'In den Kalender': 'Add to calendar',
  'Anderes Outfit': 'Another outfit', 'Als Favorit gespeichert.': 'Saved as favorite.',
  'Oberteil': 'Top', 'Unterteil': 'Bottom',
  // Wardrobe
  'Mein Kleiderschrank': 'My wardrobe', 'Hinzufügen': 'Add', 'Alles': 'All',
  'Noch keine Kleidungsstücke. ': 'No clothes yet. ', 'Jetzt eins hinzufügen →': 'Add one now →',
  'Schließen': 'Close', 'Kleidungsstück': 'Item', 'Bearbeiten': 'Edit', 'Löschen': 'Delete',
  'Kleidungsstück bearbeiten': 'Edit item', 'Speichern': 'Save', 'Abbrechen': 'Cancel',
  'Möchten Sie „{0}" wirklich löschen?': 'Really delete “{0}”?', 'dieses Kleidungsstück': 'this item',
  // Outfits
  'Favoriten': 'Favorites', 'Looks': 'Looks',
  'Noch keine Looks. Lade unten ein Foto deines getragenen Outfits hoch.': 'No looks yet. Upload a photo of your worn outfit below.',
  'Look entfernen': 'Remove look', 'Möchtest du den Look wirklich löschen?': 'Really delete this look?',
  'Noch keine Favoriten. Speichere Outfits mit dem Herz-Icon.': 'No favorites yet. Save outfits with the heart icon.',
  'Favorit entfernen': 'Remove favorite', 'Das Outfit wirklich entfernen?': 'Really remove this outfit?',
  'Getragenen Look hochladen': 'Upload a worn look', 'Outfit erstellen': 'Create outfit',
  'Noch keine Kleidungsstücke im Schrank.': 'No clothes in the wardrobe yet.',
  'Erst vervollständigen (Oberteil, Unterteil, Schuhe)': 'Complete first (top, bottom, shoes)',
  'Tippe unten Teile an – pro Kategorie ein Teil.': 'Tap items below – one per category.',
  'Jacken & Mäntel': 'Jackets & Coats', 'Oberteile': 'Tops', 'Unterteile': 'Bottoms', 'Accessoires': 'Accessories',
  'Passt gut zusammen!': 'Great match!', 'Kann man tragen.': 'Wearable.', 'Eher kritisch.': 'A bit off.',
  'Outfit noch unvollständig.': 'Outfit still incomplete.', 'Keine Einwände – gute Kombi!': 'No objections – nice combo!',
  // Outfit-Engine Hinweise
  'ein Oberteil': 'a top', 'ein Unterteil (Hose/Rock)': 'a bottom (pants/skirt)', 'Schuhe': 'Shoes',
  'Es fehlt noch:': 'Still missing:',
  'Ein Kleid/Jumpsuit ersetzt Ober- und Unterteil – kombiniere es nicht zusätzlich.': 'A dress/jumpsuit replaces top and bottom – don’t combine it with extra items.',
  'Die Farben harmonieren nicht ideal – neutrale Töne (Schwarz, Weiß, Grau, Beige, Marineblau) lassen sich leichter kombinieren.': 'The colors don’t harmonize ideally – neutral tones (black, white, gray, beige, navy) are easier to combine.',
  'Mehrere Muster wirken unruhig – kombiniere höchstens ein auffälliges Muster.': 'Several patterns look busy – combine at most one bold pattern.',
  'Die Teile passen vom Anlass her nicht zusammen (z. B. sportlich mit festlich).': 'The items don’t match in occasion (e.g. sporty with formal).',
  'Die Teile sind für unterschiedliches Wetter gedacht.': 'The items are meant for different weather.',
  // Kalender
  'Einstellungen': 'Settings',
  'Look ausgewählt – klick auf einen Tag, um es einzuplanen.': 'Look selected – tap a day to schedule it.',
  'Outfit ausgewählt – klick auf einen Tag, um es einzuplanen.': 'Outfit selected – tap a day to schedule it.',
  'Teile antippen zum Hinzufügen/Entfernen.': 'Tap items to add/remove.', '✔ Speichern': '✔ Save',
  'Mo': 'Mon', 'Di': 'Tue', 'Mi': 'Wed', 'Do': 'Thu', 'Fr': 'Fri', 'Sa': 'Sat', 'So': 'Sun',
  'Januar': 'January', 'Februar': 'February', 'März': 'March', 'April': 'April', 'Mai': 'May', 'Juni': 'June',
  'Juli': 'July', 'August': 'August', 'September': 'September', 'Oktober': 'October', 'November': 'November', 'Dezember': 'December',
  // Settings
  'Zurück': 'Back', 'Kleiderschrank': 'Wardrobe', 'Garderobe': 'Wardrobe style',
  'Bestimmt die verfügbaren Kategorien.': 'Determines the available categories.',
  'Startseite & Vorschläge': 'Home & suggestions', 'Wetter anzeigen': 'Show weather',
  'Wetter-Kachel auf der OOTD-Startseite.': 'Weather tile on the OOTD home screen.',
  'Wetterbasierte Vorschläge': 'Weather-based suggestions', 'Outfits passend zum heutigen Wetter filtern.': 'Filter outfits to match today’s weather.',
  'Temperatureinheit': 'Temperature unit', 'Sonstiges': 'Other', 'Einführung erneut ansehen': 'View the intro again',
  'Alle Daten bleiben lokal auf deinem Gerät.': 'All data stays local on your device.',
  'Herrengarderobe': 'Men’s', 'Damengarderobe': 'Women’s', 'Gemischt': 'Mixed',
  // Onboarding
  'Digitalisier deinen Kleiderschrank und erhalte Outfit-Vorschläge': 'Digitize your wardrobe and get outfit suggestions',
  'Weiter': 'Next',
  'Enthält dein Kleiderschrank eher Teile aus der Herren- oder aus der Damengarderobe?': 'Does your wardrobe mostly contain men’s or women’s clothing?',
  'Auswahl kann später geändert werden.': 'You can change this later.',
  // Add item
  'Kleidungsstück hinzufügen': 'Add item',
  '💡 Tipp: Kleidungsstück am besten ': '💡 Tip: best to photograph the item ',
  'ungetragen': 'not worn', ' und vor einem glatten Hintergrund fotografieren. ': ' against a plain background. ',
  'Getragene Fotos kannst du im nächsten Schritt mit „Bearbeiten" bereinigen.': 'You can clean up worn photos in the next step with “Edit”.',
  'Foto aufnehmen': 'Take photo', 'Aus Galerie wählen': 'Choose from gallery',
  'Schneide Kleidungsstück aus …': 'Cutting out the item …', 'Fehler beim Freistellen: ': 'Background removal failed: ',
  'Passt so': 'Looks good', 'Verwerfen': 'Discard',
  '„Bearbeiten": Kleidungsstück antippen (Rest wird weggeschnitten) – oder gezielt Kopf/Hände entfernen.': '“Edit”: tap the item (the rest is cut away) – or remove head/hands specifically.',
  'Freigestelltes Kleidungsstück': 'Cut-out item', 'Wird vorbereitet …': 'Preparing …', 'Bereit.': 'Ready.',
  'SAM konnte nicht geladen werden: ': 'SAM could not be loaded: ', 'Klicke an, was gelöscht werden soll.': 'Click what should be removed.',
  '↶ Rückgängig': '↶ Undo', '✔ Fertig': '✔ Done', 'Entferne…': 'Removing…',
  'Entfernt. Weiter klicken oder „Fertig".': 'Removed. Keep clicking or “Done”.',
  'Fehler bei der Segmentierung: ': 'Segmentation error: ', 'Farben werden analysiert…': 'Analyzing colors…',
  'Bitte alle Felder ausfüllen.': 'Please fill in all fields.',
  // Tag-Formular
  'Für welchen Anlass?': 'For which occasion?', 'Muster': 'Pattern', 'Passform': 'Fit',
  'Für welches Wetter?': 'For which weather?', 'regentauglich': 'rain-proof', 'Kategorie': 'Category',
  'Farben': 'Colors', 'Name': 'Name', 'Name des Kleidungsstücks': 'Item name', 'Farbe ändern': 'Change color',
  'entfernen': 'remove', '+ Farbe': '+ Color', '✓ Fertig': '✓ Done', '– Kategorie wählen –': '– Choose category –',
  // Wärme / Anlass / Muster
  'Warm': 'Warm', 'Mild': 'Mild', 'Kalt': 'Cold',
  'Business/Formal': 'Business/Formal', 'Elegant/Chic': 'Elegant/Chic',
  'einfarbig': 'solid', 'gestreift': 'striped', 'kariert': 'checked', 'Animalprint': 'Animal print', 'geblümt': 'floral', 'Sonstiges Muster': 'Other pattern',
  // Kategorie-Baum
  'Tops & T-Shirts': 'Tops & T-Shirts', 'Langarmshirt': 'Long-sleeve', 'Tanktop': 'Tank top', 'Hemden': 'Shirts',
  'Klassisches Hemd': 'Classic shirt', 'Kurzarm': 'Short sleeve', 'Jeanshemd': 'Denim shirt', 'Blusen': 'Blouses', 'Polohemd': 'Polo shirt',
  'Hosen': 'Pants', 'Anzugshose': 'Suit pants', 'Trainingshose': 'Sweatpants', 'Shorts': 'Shorts',
  'Pullover & Sweater': 'Sweaters', 'Klassischer Pullover': 'Classic sweater', 'Rollkragenpullover': 'Turtleneck', 'V-Ausschnitt': 'V-neck', 'Troyer / Quarterzip': 'Troyer / quarter-zip',
  'Röcke': 'Skirts', 'Minirock': 'Mini skirt', 'Knielanger Rock': 'Knee-length skirt', 'Midirock': 'Midi skirt', 'Maxirock': 'Maxi skirt',
  'Kleider': 'Dresses', 'Minikleid': 'Mini dress', 'Midikleid': 'Midi dress', 'Maxikleid': 'Maxi dress', 'Sommerkleid': 'Summer dress', 'Winterkleid': 'Winter dress', 'Jeanskleid': 'Denim dress', 'Cocktailkleid': 'Cocktail dress', 'Formelles & Business-Kleid': 'Formal & business dress',
  'Jacken': 'Jackets', 'Strickjacke': 'Cardigan', 'Lederjacke': 'Leather jacket', 'Jeansjacke': 'Denim jacket', 'Bomberjacke': 'Bomber jacket', 'Fleecejacke': 'Fleece jacket', 'Daunenjacke': 'Down jacket', 'Steppjacke': 'Quilted jacket', 'Harrington-Jacke': 'Harrington jacket', 'Windbreaker': 'Windbreaker', 'Regenjacke': 'Rain jacket',
  'Mäntel': 'Coats', 'Klassischer Mantel': 'Classic coat', 'Parka': 'Parka', 'Trenchcoat': 'Trench coat', 'Kurzmantel': 'Short coat', 'Dufflecoat': 'Duffle coat', 'Regenmantel': 'Raincoat', 'Westen': 'Vests',
  'Anzüge & Blazer': 'Suits & Blazers', 'Sakkos & Blazer': 'Blazers', 'Anzugsweste': 'Suit vest', 'Jumpsuit': 'Jumpsuit',
  'Sneaker': 'Sneakers', 'Stiefel': 'Boots', 'Chelsea Boots & Schlupfstiefel': 'Chelsea & slip-on boots', 'Schnürstiefel': 'Lace-up boots', 'Kniehohe Stiefel': 'Knee-high boots', 'Overknees': 'Over-the-knee boots', 'Bootsschuhe, Loafer & Mokassins': 'Boat shoes, loafers & moccasins', 'Ballerinas': 'Ballet flats', 'Sandalen': 'Sandals', 'Anzugsschuhe': 'Dress shoes', 'Elegante Schuhe & High Heels': 'Elegant shoes & heels', 'Elegante Schuhe': 'Elegant shoes',
  'Ring': 'Ring', 'Ohrringe': 'Earrings', 'Armband': 'Bracelet', 'Armbanduhr': 'Watch', 'Kette': 'Necklace', 'Gürtel': 'Belt', 'Handschuhe': 'Gloves', 'Mützen & Hüte': 'Hats & caps', 'Beanie / Mütze': 'Beanie', 'Cap': 'Cap', 'Hut': 'Hat', 'Schal & Tuch': 'Scarf', 'Sonnenbrille': 'Sunglasses', 'Krawatte & Fliege': 'Tie & bow tie', 'Krawatte': 'Tie', 'Fliege': 'Bow tie', 'Taschen': 'Bags', 'Umhängetasche': 'Shoulder bag', 'Rucksack': 'Backpack', 'Aktentasche': 'Briefcase', 'Handtasche': 'Handbag',
  // Farben
  'Schwarz': 'Black', 'Grau': 'Gray', 'Weiß': 'White', 'Creme': 'Cream', 'Beige': 'Beige', 'Aprikose': 'Apricot', 'Orange': 'Orange', 'Korallenrot': 'Coral', 'Rot': 'Red', 'Burgunderrot': 'Burgundy', 'Pink': 'Pink', 'Rose': 'Rose', 'Lila': 'Purple', 'Flieder': 'Lilac', 'Hellblau': 'Light blue', 'Blau': 'Blue', 'Marineblau': 'Navy', 'Türkis': 'Turquoise', 'Mintgrün': 'Mint', 'Grün': 'Green', 'Dunkelgrün': 'Dark green', 'Khaki': 'Khaki', 'Braun': 'Brown', 'Senffarben': 'Mustard', 'Gelb': 'Yellow', 'Silber': 'Silver', 'Gold': 'Gold', 'Bunt': 'Multicolor',
};

export function t(s, ...args) {
  let out = getLang() === 'en' ? (EN[s] ?? s) : s;
  args.forEach((a, i) => { out = out.split('{' + i + '}').join(a); });
  return out;
}
