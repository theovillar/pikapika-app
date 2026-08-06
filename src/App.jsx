import React, { useState, useMemo, useEffect } from "react";
import {
  Compass, PlusCircle, BookMarked, UserCircle2, Search, MapPin,
  CalendarDays, Users, X, ChevronRight, Sparkles, Heart, Check,
  Baby, Trees, Palette, Music4, Puzzle, Bike, Coffee, Dumbbell,
  Landmark, Gamepad2, Film, Clock, ShieldCheck, Lock, ChevronDown, List, Map
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------- Internationalisation ----------
// Langue déduite du navigateur (reflet du pays/de la région de la personne).
// Ne s'applique qu'à l'interface : les annonces (titre, lieu, description) écrites
// par les personnes qui proposent une sortie ne sont jamais traduites automatiquement.
function detectLang() {
  try {
    const nav = (typeof navigator !== "undefined" && (navigator.language || (navigator.languages && navigator.languages[0]))) || "fr";
    const code = nav.slice(0, 2).toLowerCase();
    if (code === "fr" || code === "es") return code;
    return "en";
  } catch (e) {
    return "fr";
  }
}
const LANG = detectLang();

const TRANSLATIONS = {
  fr: {
    tab_enfants: "Enfants", tab_ados: "Ados", tab_adultes: "Adultes", tab_creer: "Créer",
    tab_mes_sorties: "Mes sorties", tab_profil: "Profil",
    greeting: "Bonjour {name} 👋",
    explorer_subtitle: "{n} sortie(s) à partager avec vos enfants près de chez vous",
    search_placeholder: "Chercher une sortie, un lieu…",
    search_placeholder_community: "Chercher une rencontre, un lieu…",
    chip_all: "Toutes", view_liste: "Liste", view_carte: "Carte",
    empty_kids: "Aucune sortie ne correspond. Essayez une autre recherche !",
    fav_aria: "Ajouter aux favoris",
    card_full: "Complet", card_places_left: "{n} place(s) libre(s)",
    cat_nature: "Nature", cat_creatif: "Créatif", cat_musique: "Musique", cat_jeux: "Jeux", cat_sport: "Sport",
    cat_cafe: "Café / Brunch", cat_culture: "Sorties culture", cat_bienetre: "Bien-être", cat_jeuxsociete: "Jeux de société",
    cat_jeuxvideo: "Jeux vidéo", cat_cinema: "Ciné / Sorties",
    create_title: "Proposer une sortie",
    create_subtitle: "Partagez une activité, d'autres parents pourront rejoindre avec leurs enfants.",
    label_titre: "Titre de la sortie", placeholder_titre: "Ex. Balade contée au parc",
    label_categorie: "Catégorie", label_lieu: "Lieu", placeholder_lieu: "Parc, adresse…",
    label_date: "Date & heure", placeholder_date: "Sam. 9 août · 10h",
    label_age: "Âge conseillé", placeholder_age: "Ex. 4-8 ans",
    label_places: "Places disponibles", label_description: "Description",
    placeholder_description: "Que va-t-on faire ? Quoi apporter ?",
    btn_publier: "Publier la sortie",
    success_message: "Sortie publiée ! Elle apparaît dans l'onglet Explorer.",
    you_organizer: "Vous",
    my_title: "Mes sorties",
    my_subtitle: "Chaque sortie rejointe ajoute un tampon à votre passeport d'aventures.",
    passport_title: "Passeport d'aventures",
    passport_empty: "Rejoignez une sortie dans l'onglet Explorer pour gagner votre premier tampon !",
    profile_outings_count: "{n} sortie(s) rejointe(s)",
    profile_children: "Mes enfants", profile_add_child: "+ Ajouter un enfant",
    profile_preferences: "Préférences", profile_years: "ans",
    val_validated_title: "Identité validée par la mairie",
    val_validated_text: "Vous avez accès aux sorties enfants et ados : Enfants, Ados, Créer une sortie et Mes sorties. Les sorties Adultes restent accessibles à tous, sans validation.",
    val_pending_title: "Validation de la mairie en attente",
    val_pending_text: "Pour la sécurité des enfants, l'accès aux sorties enfants et ados (Enfants, Ados, Créer, Mes sorties) n'est ouvert qu'aux parents dont l'identité a été vérifiée par la mairie de leur commune. Les sorties Adultes restent accessibles sans validation. Vous recevrez une notification dès que ce sera fait.",
    val_demo_on: "Simuler : repasser en attente (démo)", val_demo_off: "Simuler : validation par la mairie (démo)",
    detail_participants: "{a}/{b} participants · organisé par {org}",
    detail_registered_children: "Enfants déjà inscrits", legend_girl: "Fille", legend_boy: "Garçon",
    detail_joined: "Vous participez", detail_join_kids: "Rejoindre avec mon enfant",
    detail_already_registered: "Déjà inscrit(e)s",
    community_adult_title: "Rencontres entre parents",
    community_adult_subtitle: "Des moments entre adultes, sans les enfants, pour se connaître entre parents du quartier.",
    community_teen_title: "Rencontres entre ados",
    community_teen_subtitle: "Des activités entre ados, toujours encadrées par une association, une MJC ou un professeur.",
    community_empty: "Aucune rencontre ne correspond. Essayez une autre recherche !",
    join_label_adult: "Rejoindre ce moment", join_label_teen: "Rejoindre cette rencontre",
    loc_placeholder: "Ville, code postal, département…", loc_all_france: "Toute la France",
    loc_no_result: 'Aucun résultat pour "{q}"', loc_dept: "Département", loc_ville: "Ville",
    loc_ville_dept: "Ville · dept. {d}", loc_radius_title: "Rayon autour de {ville}",
    map_centered_on: "Carte centrée sur {loc}", map_empty: "Aucune sortie géolocalisée pour ces filtres.",
    map_see_detail: "Voir la fiche",
  },
  en: {
    tab_enfants: "Kids", tab_ados: "Teens", tab_adultes: "Adults", tab_creer: "Create",
    tab_mes_sorties: "My outings", tab_profil: "Profile",
    greeting: "Hi {name} 👋",
    explorer_subtitle: "{n} outing(s) to share with your kids near you",
    search_placeholder: "Search an outing, a place…",
    search_placeholder_community: "Search a meetup, a place…",
    chip_all: "All", view_liste: "List", view_carte: "Map",
    empty_kids: "No outing matches. Try another search!",
    fav_aria: "Add to favourites",
    card_full: "Full", card_places_left: "{n} spot(s) left",
    cat_nature: "Nature", cat_creatif: "Creative", cat_musique: "Music", cat_jeux: "Games", cat_sport: "Sport",
    cat_cafe: "Coffee / Brunch", cat_culture: "Culture outings", cat_bienetre: "Wellness", cat_jeuxsociete: "Board games",
    cat_jeuxvideo: "Video games", cat_cinema: "Movies / Outings",
    create_title: "Propose an outing",
    create_subtitle: "Share an activity, other parents can join with their kids.",
    label_titre: "Outing title", placeholder_titre: "E.g. Storytelling walk in the park",
    label_categorie: "Category", label_lieu: "Location", placeholder_lieu: "Park, address…",
    label_date: "Date & time", placeholder_date: "Sat. Aug 9 · 10am",
    label_age: "Recommended age", placeholder_age: "E.g. 4-8 years",
    label_places: "Available spots", label_description: "Description",
    placeholder_description: "What will you do? What to bring?",
    btn_publier: "Publish outing",
    success_message: "Outing published! It now appears in the Explore tab.",
    you_organizer: "You",
    my_title: "My outings",
    my_subtitle: "Every outing you join adds a stamp to your adventure passport.",
    passport_title: "Adventure passport",
    passport_empty: "Join an outing in the Explore tab to earn your first stamp!",
    profile_outings_count: "{n} outing(s) joined",
    profile_children: "My kids", profile_add_child: "+ Add a child",
    profile_preferences: "Preferences", profile_years: "y.o.",
    val_validated_title: "Identity verified by the town hall",
    val_validated_text: "You have access to kids and teens outings: Kids, Teens, Create an outing and My outings. Adults outings remain open to everyone, no verification needed.",
    val_pending_title: "Town hall verification pending",
    val_pending_text: "For children's safety, access to kids and teens outings (Kids, Teens, Create, My outings) is only open to parents whose identity has been verified by their town hall. Adults outings remain open without verification. You'll be notified as soon as it's done.",
    val_demo_on: "Simulate: back to pending (demo)", val_demo_off: "Simulate: town hall verification (demo)",
    detail_participants: "{a}/{b} participants · hosted by {org}",
    detail_registered_children: "Already registered kids", legend_girl: "Girl", legend_boy: "Boy",
    detail_joined: "You're in", detail_join_kids: "Join with my child",
    detail_already_registered: "Already registered",
    community_adult_title: "Meetups between parents",
    community_adult_subtitle: "Moments between adults, without the kids, to meet other parents nearby.",
    community_teen_title: "Meetups between teens",
    community_teen_subtitle: "Teen activities, always supervised by an association, a youth club or a teacher.",
    community_empty: "No meetup matches. Try another search!",
    join_label_adult: "Join this meetup", join_label_teen: "Join this meetup",
    loc_placeholder: "City, postcode, department…", loc_all_france: "All of France",
    loc_no_result: 'No result for "{q}"', loc_dept: "Department", loc_ville: "City",
    loc_ville_dept: "City · dept. {d}", loc_radius_title: "Radius around {ville}",
    map_centered_on: "Map centred on {loc}", map_empty: "No located outing for these filters.",
    map_see_detail: "See details",
  },
  es: {
    tab_enfants: "Niños", tab_ados: "Adolescentes", tab_adultes: "Adultos", tab_creer: "Crear",
    tab_mes_sorties: "Mis salidas", tab_profil: "Perfil",
    greeting: "Hola {name} 👋",
    explorer_subtitle: "{n} salida(s) para compartir con tus hijos cerca de ti",
    search_placeholder: "Buscar una salida, un lugar…",
    search_placeholder_community: "Buscar un encuentro, un lugar…",
    chip_all: "Todas", view_liste: "Lista", view_carte: "Mapa",
    empty_kids: "Ninguna salida coincide. ¡Prueba otra búsqueda!",
    fav_aria: "Añadir a favoritos",
    card_full: "Completo", card_places_left: "{n} plaza(s) libre(s)",
    cat_nature: "Naturaleza", cat_creatif: "Creativo", cat_musique: "Música", cat_jeux: "Juegos", cat_sport: "Deporte",
    cat_cafe: "Café / Brunch", cat_culture: "Salidas culturales", cat_bienetre: "Bienestar", cat_jeuxsociete: "Juegos de mesa",
    cat_jeuxvideo: "Videojuegos", cat_cinema: "Cine / Salidas",
    create_title: "Proponer una salida",
    create_subtitle: "Comparte una actividad, otros padres podrán unirse con sus hijos.",
    label_titre: "Título de la salida", placeholder_titre: "Ej. Paseo cuentacuentos en el parque",
    label_categorie: "Categoría", label_lieu: "Lugar", placeholder_lieu: "Parque, dirección…",
    label_date: "Fecha y hora", placeholder_date: "Sáb. 9 ago · 10h",
    label_age: "Edad recomendada", placeholder_age: "Ej. 4-8 años",
    label_places: "Plazas disponibles", label_description: "Descripción",
    placeholder_description: "¿Qué vais a hacer? ¿Qué traer?",
    btn_publier: "Publicar salida",
    success_message: "¡Salida publicada! Aparece en la pestaña Explorar.",
    you_organizer: "Tú",
    my_title: "Mis salidas",
    my_subtitle: "Cada salida a la que te unes añade un sello a tu pasaporte de aventuras.",
    passport_title: "Pasaporte de aventuras",
    passport_empty: "¡Únete a una salida en la pestaña Explorar para ganar tu primer sello!",
    profile_outings_count: "{n} salida(s) realizadas",
    profile_children: "Mis hijos", profile_add_child: "+ Añadir un hijo/a",
    profile_preferences: "Preferencias", profile_years: "años",
    val_validated_title: "Identidad validada por el ayuntamiento",
    val_validated_text: "Tienes acceso a las salidas de niños y adolescentes: Niños, Adolescentes, Crear una salida y Mis salidas. Las salidas de Adultos siguen abiertas a todos, sin validación.",
    val_pending_title: "Validación del ayuntamiento pendiente",
    val_pending_text: "Por la seguridad de los niños, el acceso a las salidas de niños y adolescentes (Niños, Adolescentes, Crear, Mis salidas) solo está abierto a los padres cuya identidad haya sido verificada por su ayuntamiento. Las salidas de Adultos siguen abiertas sin validación. Recibirás una notificación en cuanto se haga.",
    val_demo_on: "Simular: volver a pendiente (demo)", val_demo_off: "Simular: validación del ayuntamiento (demo)",
    detail_participants: "{a}/{b} participantes · organizado por {org}",
    detail_registered_children: "Niños ya inscritos", legend_girl: "Niña", legend_boy: "Niño",
    detail_joined: "Estás participando", detail_join_kids: "Unirme con mi hijo/a",
    detail_already_registered: "Ya inscritos",
    community_adult_title: "Encuentros entre padres",
    community_adult_subtitle: "Momentos entre adultos, sin los niños, para conocer a otros padres del barrio.",
    community_teen_title: "Encuentros entre adolescentes",
    community_teen_subtitle: "Actividades entre adolescentes, siempre supervisadas por una asociación, un centro juvenil o un profesor.",
    community_empty: "Ningún encuentro coincide. ¡Prueba otra búsqueda!",
    join_label_adult: "Unirme a este encuentro", join_label_teen: "Unirme a este encuentro",
    loc_placeholder: "Ciudad, código postal, departamento…", loc_all_france: "Toda Francia",
    loc_no_result: 'Sin resultados para "{q}"', loc_dept: "Departamento", loc_ville: "Ciudad",
    loc_ville_dept: "Ciudad · dpto. {d}", loc_radius_title: "Radio alrededor de {ville}",
    map_centered_on: "Mapa centrado en {loc}", map_empty: "Ninguna salida geolocalizada para estos filtros.",
    map_see_detail: "Ver la ficha",
  },
};

function t(key, vars) {
  let str = (TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key]) || TRANSLATIONS.fr[key] || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
  }
  return str;
}

// ---------- Design tokens ----------
const COLORS = {
  ink: "#2B2560",
  cloud: "#FFF9EE",
  sun: "#FFC93C",
  sky: "#4EC5F1",
  grass: "#6BCB77",
  coral: "#FF6F61",
  grape: "#8B5FBF",
  boy: "#4EC5F1",
  girl: "#FF8FB1",
};

const genreColor = (genre) => (genre === "F" ? COLORS.girl : COLORS.boy);
const genreLabel = (genre) => (genre === "F" ? "Fille" : "Garçon");

const CATEGORIES = [
  { id: "nature", label: t("cat_nature"), icon: Trees, color: COLORS.grass },
  { id: "creatif", label: t("cat_creatif"), icon: Palette, color: COLORS.grape },
  { id: "musique", label: t("cat_musique"), icon: Music4, color: COLORS.coral },
  { id: "jeux", label: t("cat_jeux"), icon: Puzzle, color: COLORS.sky },
  { id: "sport", label: t("cat_sport"), icon: Bike, color: COLORS.sun },
];

const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

// ---------- Localisation (villes, départements, distances) ----------
// Coordonnées des villes utilisées par les sorties de démo (id "ville" -> position + département)
const CITY_META = {
  grenoble: { label: "Grenoble", lat: 45.1885, lon: 5.7245, dept: "38" },
  varces: { label: "Varces-Allières-et-Risset", lat: 45.1024, lon: 5.6698, dept: "38" },
  vif: { label: "Vif", lat: 45.0733, lon: 5.6754, dept: "38" },
  lyon: { label: "Lyon", lat: 45.7640, lon: 4.8357, dept: "69" },
  chambery: { label: "Chambéry", lat: 45.5646, lon: 5.9178, dept: "73" },
  annecy: { label: "Annecy", lat: 45.8992, lon: 6.1294, dept: "74" },
  valence: { label: "Valence", lat: 44.9334, lon: 4.8924, dept: "26" },
  paris: { label: "Paris", lat: 48.8566, lon: 2.3522, dept: "75" },
};

// Index nom normalisé -> coordonnées exactes utilisées par les sorties de démo.
// Permet de faire coïncider parfaitement une ville choisie dans la recherche avec
// les sorties qui lui sont rattachées, même si une source externe (API, saisie)
// renvoie des coordonnées légèrement différentes pour le même endroit.
const KNOWN_BY_NAME = {};
Object.entries(CITY_META).forEach(([id, m]) => { KNOWN_BY_NAME[normalize(m.label)] = { id, ...m }; });

// Communes proposées à la recherche (au-delà des villes ayant déjà des sorties de démo),
// pour représenter une couverture nationale : agglomération grenobloise + grandes villes de France.
const LOCAL_PLACES = [
  ...Object.entries(CITY_META).map(([id, c]) => ({ nom: c.label, lat: c.lat, lon: c.lon, dept: c.dept })),
  { nom: "Vizille", lat: 45.0796, lon: 5.7738, dept: "38" },
  { nom: "Claix", lat: 45.1333, lon: 5.6499, dept: "38" },
  { nom: "Seyssins", lat: 45.1590, lon: 5.6767, dept: "38" },
  { nom: "Seyssinet-Pariset", lat: 45.1747, lon: 5.6889, dept: "38" },
  { nom: "Fontaine", lat: 45.1912, lon: 5.6883, dept: "38" },
  { nom: "Échirolles", lat: 45.1500, lon: 5.7167, dept: "38" },
  { nom: "Saint-Martin-d'Hères", lat: 45.1789, lon: 5.7644, dept: "38" },
  { nom: "Meylan", lat: 45.2075, lon: 5.7736, dept: "38" },
  { nom: "Eybens", lat: 45.1553, lon: 5.7413, dept: "38" },
  { nom: "Pont-de-Claix", lat: 45.1394, lon: 5.6928, dept: "38" },
  { nom: "Villeurbanne", lat: 45.7667, lon: 4.8794, dept: "69" },
  { nom: "Marseille", lat: 43.2965, lon: 5.3698, dept: "13" },
  { nom: "Aix-en-Provence", lat: 43.5297, lon: 5.4474, dept: "13" },
  { nom: "Toulouse", lat: 43.6047, lon: 1.4442, dept: "31" },
  { nom: "Nice", lat: 43.7102, lon: 7.2620, dept: "06" },
  { nom: "Nantes", lat: 47.2184, lon: -1.5536, dept: "44" },
  { nom: "Strasbourg", lat: 48.5734, lon: 7.7521, dept: "67" },
  { nom: "Montpellier", lat: 43.6108, lon: 3.8767, dept: "34" },
  { nom: "Bordeaux", lat: 44.8378, lon: -0.5792, dept: "33" },
  { nom: "Lille", lat: 50.6292, lon: 3.0573, dept: "59" },
  { nom: "Rennes", lat: 48.1173, lon: -1.6778, dept: "35" },
  { nom: "Reims", lat: 49.2583, lon: 4.0317, dept: "51" },
  { nom: "Toulon", lat: 43.1242, lon: 5.9280, dept: "83" },
  { nom: "Saint-Étienne", lat: 45.4397, lon: 4.3872, dept: "42" },
  { nom: "Dijon", lat: 47.3220, lon: 5.0415, dept: "21" },
  { nom: "Angers", lat: 47.4784, lon: -0.5632, dept: "49" },
  { nom: "Nîmes", lat: 43.8367, lon: 4.3601, dept: "30" },
  { nom: "Clermont-Ferrand", lat: 45.7772, lon: 3.0870, dept: "63" },
  { nom: "Le Mans", lat: 48.0061, lon: 0.1996, dept: "72" },
  { nom: "Brest", lat: 48.3904, lon: -4.4861, dept: "29" },
  { nom: "Tours", lat: 47.3941, lon: 0.6848, dept: "37" },
  { nom: "Limoges", lat: 45.8336, lon: 1.2611, dept: "87" },
  { nom: "Amiens", lat: 49.8941, lon: 2.2958, dept: "80" },
  { nom: "Metz", lat: 49.1193, lon: 6.1757, dept: "57" },
  { nom: "Besançon", lat: 47.2378, lon: 6.0241, dept: "25" },
  { nom: "Orléans", lat: 47.9029, lon: 1.9093, dept: "45" },
  { nom: "Mulhouse", lat: 47.7508, lon: 7.3359, dept: "68" },
  { nom: "Rouen", lat: 49.4431, lon: 1.0993, dept: "76" },
  { nom: "Caen", lat: 49.1829, lon: -0.3707, dept: "14" },
  { nom: "Nancy", lat: 48.6921, lon: 6.1844, dept: "54" },
  { nom: "Perpignan", lat: 42.6887, lon: 2.8948, dept: "66" },
];

// Liste complète des départements français, pour la recherche par département
const FR_DEPARTEMENTS = [
  ["01","Ain"],["02","Aisne"],["03","Allier"],["04","Alpes-de-Haute-Provence"],["05","Hautes-Alpes"],
  ["06","Alpes-Maritimes"],["07","Ardèche"],["08","Ardennes"],["09","Ariège"],["10","Aube"],
  ["11","Aude"],["12","Aveyron"],["13","Bouches-du-Rhône"],["14","Calvados"],["15","Cantal"],
  ["16","Charente"],["17","Charente-Maritime"],["18","Cher"],["19","Corrèze"],["2A","Corse-du-Sud"],
  ["2B","Haute-Corse"],["21","Côte-d'Or"],["22","Côtes-d'Armor"],["23","Creuse"],["24","Dordogne"],
  ["25","Doubs"],["26","Drôme"],["27","Eure"],["28","Eure-et-Loir"],["29","Finistère"],
  ["30","Gard"],["31","Haute-Garonne"],["32","Gers"],["33","Gironde"],["34","Hérault"],
  ["35","Ille-et-Vilaine"],["36","Indre"],["37","Indre-et-Loire"],["38","Isère"],["39","Jura"],
  ["40","Landes"],["41","Loir-et-Cher"],["42","Loire"],["43","Haute-Loire"],["44","Loire-Atlantique"],
  ["45","Loiret"],["46","Lot"],["47","Lot-et-Garonne"],["48","Lozère"],["49","Maine-et-Loire"],
  ["50","Manche"],["51","Marne"],["52","Haute-Marne"],["53","Mayenne"],["54","Meurthe-et-Moselle"],
  ["55","Meuse"],["56","Morbihan"],["57","Moselle"],["58","Nièvre"],["59","Nord"],
  ["60","Oise"],["61","Orne"],["62","Pas-de-Calais"],["63","Puy-de-Dôme"],["64","Pyrénées-Atlantiques"],
  ["65","Hautes-Pyrénées"],["66","Pyrénées-Orientales"],["67","Bas-Rhin"],["68","Haut-Rhin"],["69","Rhône"],
  ["70","Haute-Saône"],["71","Saône-et-Loire"],["72","Sarthe"],["73","Savoie"],["74","Haute-Savoie"],
  ["75","Paris"],["76","Seine-Maritime"],["77","Seine-et-Marne"],["78","Yvelines"],["79","Deux-Sèvres"],
  ["80","Somme"],["81","Tarn"],["82","Tarn-et-Garonne"],["83","Var"],["84","Vaucluse"],
  ["85","Vendée"],["86","Vienne"],["87","Haute-Vienne"],["88","Vosges"],["89","Yonne"],
  ["90","Territoire de Belfort"],["91","Essonne"],["92","Hauts-de-Seine"],["93","Seine-Saint-Denis"],
  ["94","Val-de-Marne"],["95","Val-d'Oise"],["971","Guadeloupe"],["972","Martinique"],
  ["973","Guyane"],["974","La Réunion"],["976","Mayotte"],
].map(([code, nom]) => ({ code, nom }));

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// location: null (toute la France) | { type: "commune", nom, lat, lon, dept, radius }
//         | { type: "departement", code, nom }
function matchLocation(villeId, location) {
  if (!location) return true;
  const meta = CITY_META[villeId];
  if (!meta) return true;
  if (location.type === "departement") return meta.dept === location.code;
  if (location.type === "commune") {
    // "Ville exacte" (0 km) tolère un petit écart de géocodage (quelques centaines de mètres) :
    // deux sources de coordonnées pour une même ville ne tombent presque jamais pile au même point.
    const effectiveRadius = location.radius === 0 ? 1.5 : location.radius;
    return haversineKm(location.lat, location.lon, meta.lat, meta.lon) <= effectiveRadius;
  }
  return true;
}

function locationLabel(location) {
  if (!location) return t("loc_all_france");
  if (location.type === "departement") return `${location.nom} (${location.code})`;
  return `${location.nom} · ${location.radius} km`;
}

const villeName = (id) => (CITY_META[id] || {}).label || "";
const lieuAvecVille = (item) => (villeName(item.ville) ? `${item.lieu} · ${villeName(item.ville)}` : item.lieu);

// ---------- Carte ----------
// Un point représentatif par département (première ville connue de ce département),
// utilisé pour centrer la carte sur un département recherché.
const DEPT_LABEL_POINTS = {};
LOCAL_PLACES.forEach((p) => { if (p.dept && !DEPT_LABEL_POINTS[p.dept]) DEPT_LABEL_POINTS[p.dept] = p; });




const ADULT_CATEGORIES = [
  { id: "cafe", label: t("cat_cafe"), icon: Coffee, color: COLORS.sun },
  { id: "sport", label: t("cat_sport"), icon: Dumbbell, color: COLORS.grass },
  { id: "culture", label: t("cat_culture"), icon: Landmark, color: COLORS.grape },
  { id: "bienetre", label: t("cat_bienetre"), icon: Sparkles, color: COLORS.sky },
  { id: "jeux", label: t("cat_jeuxsociete"), icon: Puzzle, color: COLORS.coral },
];

const TEEN_CATEGORIES = [
  { id: "sport", label: t("cat_sport"), icon: Dumbbell, color: COLORS.grass },
  { id: "jeuxvideo", label: t("cat_jeuxvideo"), icon: Gamepad2, color: COLORS.grape },
  { id: "musique", label: t("cat_musique"), icon: Music4, color: COLORS.coral },
  { id: "cinema", label: t("cat_cinema"), icon: Film, color: COLORS.sky },
  { id: "creatif", label: t("cat_creatif"), icon: Palette, color: COLORS.sun },
];

const metaFrom = (categories, id) => categories.find((c) => c.id === id) || categories[0];

// ---------- Mock data ----------
const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: "Chasse aux trésors en forêt",
    category: "nature",
    ville: "grenoble",
    lieu: "Parc de la Cascade",
    date: "Sam. 9 août · 10h00",
    age: "4-8 ans",
    places: 6,
    inscrits: 4,
    organisateur: "Léa M.",
    desc: "Une matinée à explorer les sentiers, chercher des indices en bois et repartir avec un trésor de forêt (pommes de pin dorées incluses).",
    participants: [
      { name: "Léa", genre: "F" }, { name: "Hugo", genre: "G" },
      { name: "Chloé", genre: "F" }, { name: "Nathan", genre: "G" },
    ],
  },
  {
    id: 2,
    title: "Atelier peinture à doigts",
    category: "creatif",
    ville: "varces",
    lieu: "Chez Camille (jardin)",
    date: "Dim. 10 août · 14h30",
    age: "2-5 ans",
    places: 8,
    inscrits: 6,
    organisateur: "Camille R.",
    desc: "Grandes feuilles, peintures lavables et tabliers fournis. Prévoir des vêtements qui ne craignent rien !",
    participants: [
      { name: "Camille", genre: "F" }, { name: "Jade", genre: "F" },
      { name: "Louis", genre: "G" }, { name: "Mia", genre: "F" },
      { name: "Sacha", genre: "G" }, { name: "Adam", genre: "G" },
    ],
  },
  {
    id: 3,
    title: "Éveil musical en plein air",
    category: "musique",
    ville: "chambery",
    lieu: "Square des Tilleuls",
    date: "Mer. 13 août · 16h00",
    age: "1-4 ans",
    places: 10,
    inscrits: 3,
    organisateur: "Nassim B.",
    desc: "Comptines, petites percussions et rondes pour les tout-petits, animées par une intervenante musique.",
    participants: [
      { name: "Nassim", genre: "G" }, { name: "Alice", genre: "F" }, { name: "Léon", genre: "G" },
    ],
  },
  {
    id: 4,
    title: "Après-midi jeux de société géants",
    category: "jeux",
    ville: "annecy",
    lieu: "Salle des fêtes",
    date: "Sam. 16 août · 15h00",
    age: "5-10 ans",
    places: 12,
    inscrits: 9,
    organisateur: "Inès D.",
    desc: "Puissance 4 géant, memory XXL et kapla à volonté. Goûter partagé sur place.",
    participants: [
      { name: "Inès", genre: "F" }, { name: "Tom", genre: "G" }, { name: "Rose", genre: "F" },
      { name: "Gabriel", genre: "G" }, { name: "Anna", genre: "F" }, { name: "Ethan", genre: "G" },
      { name: "Zoé", genre: "F" }, { name: "Malo", genre: "G" }, { name: "Léa", genre: "F" },
    ],
  },
  {
    id: 5,
    title: "Initiation vélo sans stabilisateurs",
    category: "sport",
    ville: "valence",
    lieu: "Piste cyclable du Lac",
    date: "Dim. 17 août · 10h00",
    age: "4-7 ans",
    places: 5,
    inscrits: 5,
    organisateur: "Thomas G.",
    desc: "Deux éducateurs sportifs pour accompagner les enfants qui se lancent sans petites roues.",
    participants: [
      { name: "Thomas", genre: "G" }, { name: "Juliette", genre: "F" }, { name: "Oscar", genre: "G" },
      { name: "Manon", genre: "F" }, { name: "Paul", genre: "G" },
    ],
  },
];

const KIDS = [
  { name: "Emma", age: 6, genre: "F" },
  { name: "Noah", age: 3, genre: "G" },
];

const ADULT_MEETUPS = [
  {
    id: 101,
    title: "Café des parents du quartier",
    category: "cafe",
    ville: "paris",
    lieu: "Café Le Marronnier",
    date: "Mar. 12 août · 9h00",
    info: "Pendant que les enfants sont à l'école",
    places: 10,
    inscrits: 6,
    organisateur: "Sophie L.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: ["Sophie", "Karim", "Elodie", "Marc", "Fanny", "Julien"],
  },
  {
    id: 102,
    title: "Footing détente entre parents",
    category: "sport",
    ville: "grenoble",
    lieu: "Bords du canal",
    date: "Jeu. 14 août · 19h00",
    info: "Tous niveaux bienvenus",
    places: 12,
    inscrits: 5,
    organisateur: "Marc D.",
    desc: "Une sortie running à allure tranquille pour décompresser après le boulot, suivie d'un étirement collectif.",
    participants: ["Marc", "Alice", "Yasmine", "Paul", "Claire"],
  },
  {
    id: 103,
    title: "Visite de l'expo photo",
    category: "culture",
    ville: "lyon",
    lieu: "Médiathèque centrale",
    date: "Sam. 16 août · 11h00",
    info: "Visite libre, échange ensuite",
    places: 8,
    inscrits: 3,
    organisateur: "Elodie F.",
    desc: "On se retrouve pour visiter l'exposition puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: ["Elodie", "Nadia", "Vincent"],
  },
  {
    id: 104,
    title: "Atelier yoga en plein air",
    category: "bienetre",
    ville: "chambery",
    lieu: "Parc des Tilleuls",
    date: "Dim. 17 août · 9h30",
    info: "Tapis non fourni",
    places: 15,
    inscrits: 11,
    organisateur: "Claire B.",
    desc: "Une heure de yoga doux animée par une pratiquante du quartier, ouverte à tous les niveaux.",
    participants: ["Claire", "Julien", "Fanny", "Karim", "Sophie", "Paul", "Nadia"],
  },
  {
    id: 105,
    title: "Soirée jeux de société",
    category: "jeux",
    ville: "annecy",
    lieu: "Chez Julien",
    date: "Ven. 22 août · 20h00",
    info: "Chacun amène un jeu ou une boisson",
    places: 8,
    inscrits: 4,
    organisateur: "Julien P.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux de société et d'un apéro partagé.",
    participants: ["Julien", "Marc", "Alice", "Vincent"],
  },
];

const TEEN_MEETUPS = [
  {
    id: 201,
    title: "Tournoi FIFA à la médiathèque",
    category: "jeuxvideo",
    ville: "valence",
    lieu: "Médiathèque - espace jeunesse",
    date: "Mer. 13 août · 14h00",
    info: "12-15 ans · encadré par l'équipe jeunesse",
    places: 12,
    inscrits: 8,
    organisateur: "Espace jeunesse",
    desc: "Petit tournoi amical sur consoles mises à disposition, animé par l'équipe de la médiathèque.",
    participants: ["Lucas", "Nina", "Yanis", "Camille", "Théo", "Sarah", "Enzo", "Léa"],
  },
  {
    id: 202,
    title: "City stade basket entre ados",
    category: "sport",
    ville: "vif",
    lieu: "City stade du parc",
    date: "Sam. 16 août · 15h00",
    info: "13-17 ans · coaché par un éducateur sportif",
    places: 14,
    inscrits: 9,
    organisateur: "Service jeunesse de la ville",
    desc: "Session basket 3x3 encadrée par un éducateur sportif municipal, tous niveaux bienvenus.",
    participants: ["Rayan", "Chloé", "Maxime", "Lina", "Noa", "Jules", "Inès", "Sacha", "Tom"],
  },
  {
    id: 203,
    title: "Ciné-débat ado",
    category: "cinema",
    ville: "lyon",
    lieu: "MJC du centre",
    date: "Dim. 17 août · 16h30",
    info: "14-17 ans · animé par la MJC",
    places: 20,
    inscrits: 13,
    organisateur: "MJC",
    desc: "Projection suivie d'un débat animé par l'équipe de la MJC, autour d'un film choisi par les ados eux-mêmes.",
    participants: ["Manon", "Adam", "Zoé", "Nathan", "Jade", "Hugo", "Chloé"],
  },
  {
    id: 204,
    title: "Atelier BD & manga",
    category: "creatif",
    ville: "chambery",
    lieu: "Médiathèque - espace jeunesse",
    date: "Mar. 19 août · 14h00",
    info: "11-14 ans · matériel fourni",
    places: 10,
    inscrits: 6,
    organisateur: "Espace jeunesse",
    desc: "Initiation au dessin de BD et manga avec une illustratrice invitée, tout matériel fourni sur place.",
    participants: ["Emma", "Léon", "Alice", "Nathan", "Rose", "Malo"],
  },
  {
    id: 205,
    title: "Répétition ouverte du groupe ado",
    category: "musique",
    ville: "annecy",
    lieu: "Conservatoire municipal",
    date: "Ven. 22 août · 17h00",
    info: "12-17 ans · encadré par un professeur",
    places: 10,
    inscrits: 5,
    organisateur: "Conservatoire",
    desc: "Séance ouverte pour découvrir ou rejoindre le groupe des ados du conservatoire, encadrée par un professeur.",
    participants: ["Gabriel", "Anna", "Ethan", "Juliette", "Oscar"],
  },
];

// ---------- Small building blocks ----------
function Stamp({ category, size = 46, rotate = -8 }) {
  const meta = catMeta(category);
  const Icon = meta.icon;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px dashed ${meta.color}`,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 2px 6px rgba(43,37,96,0.12)",
        flexShrink: 0,
      }}
    >
      <Icon size={size * 0.45} color={meta.color} strokeWidth={2.4} />
    </div>
  );
}

function Avatar({ name, genre, size = 26, overlap = false }) {
  const color = genreColor(genre);
  return (
    <div
      title={`${name} (${genreLabel(genre)})`}
      style={{
        width: size, height: size, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800,
        fontSize: size * 0.42, border: "2px solid #fff",
        marginLeft: overlap ? -8 : 0, flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ParticipantsRow({ participants, max = 5 }) {
  if (!participants || participants.length === 0) return null;
  const shown = participants.slice(0, max);
  const extra = participants.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} genre={p.genre} overlap={i > 0} />
      ))}
      {extra > 0 && (
        <div style={{
          width: 26, height: 26, borderRadius: "50%", background: "#EDEAF4",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: COLORS.ink, fontFamily: "Nunito, sans-serif", fontWeight: 800,
          fontSize: 10.5, border: "2px solid #fff", marginLeft: -8,
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function PlainAvatar({ name, color, size = 26, overlap = false }) {
  return (
    <div
      title={name}
      style={{
        width: size, height: size, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800,
        fontSize: size * 0.42, border: "2px solid #fff",
        marginLeft: overlap ? -8 : 0, flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PlainParticipantsRow({ names, color, max = 5 }) {
  if (!names || names.length === 0) return null;
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
      {shown.map((n, i) => (
        <PlainAvatar key={i} name={n} color={color} overlap={i > 0} />
      ))}
      {extra > 0 && (
        <div style={{
          width: 26, height: 26, borderRadius: "50%", background: "#EDEAF4",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: COLORS.ink, fontFamily: "Nunito, sans-serif", fontWeight: 800,
          fontSize: 10.5, border: "2px solid #fff", marginLeft: -8,
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Nunito, sans-serif",
        fontWeight: 800,
        fontSize: 13,
        padding: "8px 14px",
        borderRadius: 999,
        border: `2px solid ${active ? color : "#E7E1D4"}`,
        background: active ? color : "#fff",
        color: active ? "#fff" : COLORS.ink,
        whiteSpace: "nowrap",
        transition: "all .15s ease",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ActivityCard({ activity, onOpen, favorite, onToggleFav }) {
  const meta = catMeta(activity.category);
  const full = activity.inscrits >= activity.places;
  return (
    <div
      onClick={() => onOpen(activity)}
      style={{
        background: "#fff",
        borderRadius: 22,
        border: "2px solid #F0EADB",
        padding: 16,
        cursor: "pointer",
        position: "relative",
        transition: "transform .15s ease, box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(43,37,96,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(activity.id); }}
        style={{
          position: "absolute", top: 14, right: 14, background: "transparent",
          border: "none", cursor: "pointer", padding: 4,
        }}
        aria-label={t("fav_aria")}
      >
        <Heart
          size={20}
          color={favorite ? COLORS.coral : "#D8D2C2"}
          fill={favorite ? COLORS.coral : "none"}
          strokeWidth={2.2}
        />
      </button>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Stamp category={activity.category} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11,
              letterSpacing: 0.6, textTransform: "uppercase", color: meta.color,
              marginBottom: 2,
            }}
          >
            {meta.label} · {activity.age}
          </div>
          <h3
            style={{
              fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18,
              color: COLORS.ink, margin: "0 34px 6px 0", lineHeight: 1.15,
            }}
          >
            {activity.title}
          </h3>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <Row icon={<MapPin size={14} color={COLORS.ink} />} text={lieuAvecVille(activity)} />
        <Row icon={<CalendarDays size={14} color={COLORS.ink} />} text={activity.date} />
      </div>

      <ParticipantsRow participants={activity.participants} />

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} color={full ? COLORS.coral : COLORS.grass} />
          <span
            style={{
              fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
              color: full ? COLORS.coral : COLORS.ink,
            }}
          >
            {full ? t("card_full") : t("card_places_left", { n: activity.places - activity.inscrits })}
          </span>
        </div>
        <ChevronRight size={18} color="#C7C0AE" />
      </div>
    </div>
  );
}

function Row({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {icon}
      <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#5C5578" }}>{text}</span>
    </div>
  );
}

function dotIcon(color, size) {
  size = size || 22;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(43,37,96,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Repositionne/zoome la carte Leaflet quand la recherche de localisation change
function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!location) {
      map.setView([46.6, 2.4], 6);
    } else if (location.type === "departement") {
      const p = DEPT_LABEL_POINTS[location.code];
      if (p) map.setView([p.lat, p.lon], 9);
    } else if (location.type === "commune") {
      const zoom = location.radius === 0 ? 13
        : location.radius <= 5 ? 12
        : location.radius <= 10 ? 11
        : location.radius <= 25 ? 10
        : location.radius <= 50 ? 9
        : 8;
      map.setView([location.lat, location.lon], zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  return null;
}

function MapView({ items, categories, onOpen, location }) {
  const points = useMemo(() => {
    return items.map((it) => {
      const meta = CITY_META[it.ville];
      if (!meta) return null;
      return { item: it, meta, cat: metaFrom(categories, it.category) };
    }).filter(Boolean);
  }, [items, categories]);

  return (
    <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 22, padding: 10, position: "relative" }}>
      <div style={{ width: "100%", height: 440, borderRadius: 16, overflow: "hidden" }}>
        <MapContainer center={[46.6, 2.4]} zoom={6} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap location={location} />

          {/* Villes de repère, pour se situer même sans sortie à cet endroit */}
          {LOCAL_PLACES.map((c, i) => (
            <CircleMarker
              key={`c-${i}`}
              center={[c.lat, c.lon]}
              radius={3}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: "#B7AF98", fillOpacity: 1 }}
            >
              <Popup>
                <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>{c.nom}{c.dept ? ` (${c.dept})` : ""}</span>
              </Popup>
            </CircleMarker>
          ))}

          {/* Rayon + centre de la recherche en cours */}
          {location?.type === "commune" && location.radius > 0 && (
            <Circle
              center={[location.lat, location.lon]}
              radius={location.radius * 1000}
              pathOptions={{ color: COLORS.coral, fillColor: COLORS.coral, fillOpacity: 0.08, dashArray: "6 5", weight: 2 }}
            />
          )}
          {location?.type === "commune" && (
            <CircleMarker
              center={[location.lat, location.lon]}
              radius={7}
              pathOptions={{ color: "#fff", weight: 2.5, fillColor: COLORS.coral, fillOpacity: 1 }}
            />
          )}

          {/* Sorties */}
          {points.map((p, i) => (
            <Marker key={i} position={[p.meta.lat, p.meta.lon]} icon={dotIcon(p.cat.color)}>
              <Popup>
                <div style={{ fontFamily: "Nunito, sans-serif", minWidth: 170 }}>
                  <div style={{ fontWeight: 800, fontSize: 10.5, color: p.cat.color, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>
                    {p.cat.label}
                  </div>
                  <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.ink, marginBottom: 4, lineHeight: 1.2 }}>
                    {p.item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B6485", marginBottom: 8 }}>
                    📍 {lieuAvecVille(p.item)}
                  </div>
                  <button
                    onClick={() => onOpen(p.item)}
                    style={{
                      width: "100%", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12,
                      background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8,
                      padding: "7px 8px", cursor: "pointer",
                    }}
                  >
                    {t("map_see_detail")}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {location && (
        <div style={{ marginTop: 10, fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#9A93AF", textAlign: "center" }}>
          {t("map_centered_on", { loc: locationLabel(location) })}
        </div>
      )}

      {points.length === 0 && (
        <div style={{ textAlign: "center", padding: "10px 0 4px", color: "#9A93AF", fontFamily: "Nunito, sans-serif", fontSize: 13.5 }}>
          {t("map_empty")}
        </div>
      )}
    </div>
  );
}

function PillButton({ children, color = COLORS.sun, onClick, style, textColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15,
        background: color, color: textColor || COLORS.ink, border: "none",
        padding: "13px 20px", borderRadius: 16, cursor: "pointer",
        boxShadow: `0 4px 0 ${shade(color, -18)}`,
        transition: "transform .1s ease",
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(3px)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {children}
    </button>
  );
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ---------- Screens ----------
function ViewToggle({ view, onChange }) {
  const opt = (id, Icon, label) => (
    <button
      onClick={() => onChange(id)}
      style={{
        display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
        background: view === id ? COLORS.ink : "transparent",
        color: view === id ? "#fff" : "#6B6485",
        padding: "8px 14px", borderRadius: 12, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
  return (
    <div style={{ display: "inline-flex", background: "#F0EADB", borderRadius: 14, padding: 4, marginBottom: 16 }}>
      {opt("liste", List, t("view_liste"))}
      {opt("carte", Map, t("view_carte"))}
    </div>
  );
}

function Explorer({ activities, favorites, onToggleFav, onOpen, location }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("tous");
  const [view, setView] = useState("liste");

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchCat = cat === "tous" || a.category === cat;
      const matchLoc = matchLocation(a.ville, location);
      const matchQuery = a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.lieu.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchLoc && matchQuery;
    });
  }, [activities, query, cat, location]);

  return (
    <div>
      <div style={{ padding: "4px 4px 14px" }}>
        <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 26, color: COLORS.ink, margin: "0 0 4px" }}>
          {t("greeting", { name: "Sarah" })}
        </h1>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14.5, margin: 0 }}>
          {t("explorer_subtitle", { n: filtered.length })}
        </p>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8, background: "#fff",
        border: "2px solid #F0EADB", borderRadius: 16, padding: "10px 14px", marginBottom: 14,
      }}>
        <Search size={18} color="#B7AF98" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
          style={{
            border: "none", outline: "none", fontFamily: "Nunito, sans-serif",
            fontSize: 14.5, flex: 1, background: "transparent", color: COLORS.ink,
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 10 }}>
        <Chip active={cat === "tous"} onClick={() => setCat("tous")} color={COLORS.ink}>
          {t("chip_all")}
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>
            {c.label}
          </Chip>
        ))}
      </div>

      <ViewToggle view={view} onChange={setView} />

      {view === "carte" ? (
        <MapView items={filtered} categories={CATEGORIES} onOpen={onOpen} location={location} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {filtered.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onOpen={onOpen}
              favorite={favorites.includes(a.id)}
              onToggleFav={onToggleFav}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#9A93AF", fontFamily: "Nunito, sans-serif" }}>
              {t("empty_kids")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateActivity({ onCreate }) {
  const [form, setForm] = useState({
    title: "", category: "nature", lieu: "", date: "", age: "", places: 6, desc: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.lieu || !form.date) return;
    onCreate({ ...form, id: Date.now(), inscrits: 1, organisateur: t("you_organizer"), places: Number(form.places) || 1 });
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ title: "", category: "nature", lieu: "", date: "", age: "", places: 6, desc: "" });
  };

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "12px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };
  const label = { fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5, color: "#6B6485", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.4 };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("create_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {t("create_subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={label}>{t("label_titre")}</label>
          <input style={inputStyle} placeholder={t("placeholder_titre")} value={form.title} onChange={set("title")} />
        </div>

        <div>
          <label style={label}>{t("label_categorie")}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={form.category === c.id} onClick={() => setForm({ ...form, category: c.id })} color={c.color}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_lieu")}</label>
            <input style={inputStyle} placeholder={t("placeholder_lieu")} value={form.lieu} onChange={set("lieu")} />
          </div>
          <div>
            <label style={label}>{t("label_date")}</label>
            <input style={inputStyle} placeholder={t("placeholder_date")} value={form.date} onChange={set("date")} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_age")}</label>
            <input style={inputStyle} placeholder={t("placeholder_age")} value={form.age} onChange={set("age")} />
          </div>
          <div>
            <label style={label}>{t("label_places")}</label>
            <input type="number" min={1} style={inputStyle} value={form.places} onChange={set("places")} />
          </div>
        </div>

        <div>
          <label style={label}>{t("label_description")}</label>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "Nunito, sans-serif" }}
            placeholder={t("placeholder_description")} value={form.desc} onChange={set("desc")} />
        </div>

        <PillButton color={COLORS.grass} textColor="#fff" onClick={submit} style={{ marginTop: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <PlusCircle size={18} /> {t("btn_publier")}
          </span>
        </PillButton>

        {sent && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "#EAF8ED",
            color: COLORS.grass, fontFamily: "Nunito, sans-serif", fontWeight: 800,
            fontSize: 13.5, padding: "10px 14px", borderRadius: 12,
          }}>
            <Check size={16} /> {t("success_message")}
          </div>
        )}
      </div>
    </div>
  );
}

function MyOutings({ joined, activities }) {
  const myActivities = activities.filter((a) => joined.includes(a.id));
  return (
    <div>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("my_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {t("my_subtitle")}
      </p>

      <div style={{
        background: "#fff", border: "2px solid #F0EADB", borderRadius: 20, padding: 20, marginBottom: 22,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Sparkles size={18} color={COLORS.sun} />
          <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 16, color: COLORS.ink }}>
            {t("passport_title")}
          </span>
        </div>
        {myActivities.length === 0 ? (
          <p style={{ fontFamily: "Nunito, sans-serif", color: "#9A93AF", fontSize: 14 }}>
            {t("passport_empty")}
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {myActivities.map((a, i) => (
              <div key={a.id} style={{ textAlign: "center", width: 78 }}>
                <Stamp category={a.category} size={58} rotate={(i % 2 === 0 ? -1 : 1) * (6 + (i * 3) % 10)} />
                <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, fontWeight: 700, color: "#6B6485", marginTop: 6 }}>
                  {a.title.split(" ").slice(0, 2).join(" ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {myActivities.map((a) => (
          <div key={a.id} style={{
            background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: 14,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <Stamp category={a.category} size={40} rotate={0} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15, color: COLORS.ink }}>{a.title}</div>
              <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485" }}>{a.date} · {a.lieu}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ joinedCount, validated, onToggleDemo }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: COLORS.sky,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: "#fff",
        }}>
          S
        </div>
        <div>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>Sarah Bertrand</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#6B6485" }}>{t("profile_outings_count", { n: joinedCount })}</div>
        </div>
      </div>

      <ValidationStatus validated={validated} onToggleDemo={onToggleDemo} />

      <SectionLabel>{t("profile_children")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {KIDS.map((k) => (
          <div key={k.name} style={{
            background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: COLORS.sun,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Baby size={18} color={COLORS.ink} />
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif" }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: COLORS.ink }}>{k.name}</div>
              <div style={{ fontSize: 12.5, color: "#6B6485" }}>{k.age} {t("profile_years")}</div>
            </div>
          </div>
        ))}
        <button style={{
          border: `2px dashed #D8D2C2`, background: "transparent", borderRadius: 16, padding: "12px 16px",
          fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#9A93AF", cursor: "pointer", fontSize: 13.5,
        }}>
          {t("profile_add_child")}
        </button>
      </div>

      <SectionLabel>{t("profile_preferences")}</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.map((c) => (
          <span key={c.id} style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
            background: `${c.color}20`, color: c.color, padding: "7px 12px", borderRadius: 999,
          }}>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ValidationStatus({ validated, onToggleDemo }) {
  return (
    <div style={{
      background: validated ? "#EAF8ED" : "#FFF4DD",
      border: `2px solid ${validated ? COLORS.grass : COLORS.sun}`,
      borderRadius: 20, padding: 18, marginBottom: 22,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: validated ? COLORS.grass : COLORS.sun,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {validated ? <ShieldCheck size={19} color="#fff" /> : <Clock size={19} color={COLORS.ink} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15.5, color: COLORS.ink, marginBottom: 4 }}>
            {validated ? t("val_validated_title") : t("val_pending_title")}
          </div>
          <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#5C5578", lineHeight: 1.5, margin: 0 }}>
            {validated ? t("val_validated_text") : t("val_pending_text")}
          </p>
          {onToggleDemo && (
            <button
              onClick={onToggleDemo}
              style={{
                marginTop: 10, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12,
                background: "transparent", border: `2px solid ${COLORS.ink}`, color: COLORS.ink,
                borderRadius: 10, padding: "6px 12px", cursor: "pointer",
              }}
            >
              {validated ? t("val_demo_on") : t("val_demo_off")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 0.6,
      textTransform: "uppercase", color: "#B7AF98", marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// Mascotte originale pour "Pikapika" — une petite étincelle ronde et joyeuse.
// Design volontairement différent de tout personnage existant : bosses arrondies
// (pas d'oreilles pointues), pas de joues rouges, pas de queue en éclair.
function PikaMascot({ size = 28, rotate = -6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `rotate(${rotate}deg)`, flexShrink: 0 }}>
      <circle cx="12" cy="11" r="5.5" fill={COLORS.sun} />
      <circle cx="28" cy="11" r="5.5" fill={COLORS.sun} />
      <circle cx="20" cy="23" r="15" fill={COLORS.sun} />
      <circle cx="14.5" cy="21" r="3" fill={COLORS.ink} />
      <circle cx="25.5" cy="21" r="3" fill={COLORS.ink} />
      <circle cx="13.5" cy="20" r="1" fill="#fff" />
      <circle cx="24.5" cy="20" r="1" fill="#fff" />
      <path d="M15 27 Q20 30.5 25 27" stroke={COLORS.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M32 2 L34 7 L39 8.5 L34 10 L32 15 L30 10 L25 8.5 L30 7 Z" fill={COLORS.sky} />
    </svg>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485" }}>
        {label}
      </span>
    </div>
  );
}

function normalize(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function LocationFilter({ location, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);

  // Tentative de recherche nationale en direct (API officielle "geo.api.gouv.fr").
  // Si le réseau n'est pas disponible ici, la recherche locale ci-dessous prend le relais.
  useEffect(() => {
    if (query.trim().length < 2) { setRemoteResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (typeof fetch === "undefined") return;
      fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codeDepartement,centre&boost=population&limit=6`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (cancelled || !Array.isArray(data)) return;
          setRemoteResults(data.map((d) => ({
            nom: d.nom, dept: d.codeDepartement,
            lat: d.centre?.coordinates?.[1], lon: d.centre?.coordinates?.[0],
          })).filter((d) => d.lat && d.lon));
        })
        .catch(() => { if (!cancelled) setRemoteResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const communeSuggestions = useMemo(() => {
    const q = normalize(query);
    if (q.length < 1) return [];
    const local = LOCAL_PLACES.filter((p) => normalize(p.nom).includes(q));
    const merged = [...remoteResults, ...local];
    const seen = new Set();
    return merged.filter((p) => {
      const key = normalize(p.nom);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 7);
  }, [query, remoteResults]);

  const deptSuggestions = useMemo(() => {
    const q = normalize(query);
    if (q.length < 1) return [];
    return FR_DEPARTEMENTS.filter((d) => normalize(d.nom).includes(q) || d.code.includes(q)).slice(0, 4);
  }, [query]);

  const pickCommune = (p) => {
    const known = KNOWN_BY_NAME[normalize(p.nom)];
    const lat = known ? known.lat : p.lat;
    const lon = known ? known.lon : p.lon;
    const dept = known ? known.dept : p.dept;
    onChange({ type: "commune", nom: p.nom, lat, lon, dept, radius: 0 });
    setQuery("");
  };
  const pickDept = (d) => {
    onChange({ type: "departement", code: d.code, nom: d.nom });
    setQuery("");
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "#fff",
          border: "2px solid #F0EADB", borderRadius: 999, padding: "7px 12px 7px 10px",
          cursor: "pointer", fontFamily: "Nunito, sans-serif",
        }}
      >
        <MapPin size={15} color={COLORS.coral} />
        <span style={{ fontWeight: 800, fontSize: 12.5, color: COLORS.ink, whiteSpace: "nowrap" }}>
          {locationLabel(location)}
        </span>
        <ChevronDown size={14} color="#B7AF98" />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 55 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff",
            border: "2px solid #F0EADB", borderRadius: 16, padding: 12, width: 280,
            boxShadow: "0 12px 28px rgba(43,37,96,0.14)", zIndex: 56,
          }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("loc_placeholder")}
              style={{
                width: "100%", border: "2px solid #F0EADB", borderRadius: 12, padding: "9px 12px",
                fontFamily: "Nunito, sans-serif", fontSize: 13.5, outline: "none", boxSizing: "border-box",
                marginBottom: 8,
              }}
            />

            <CityOption label={t("loc_all_france")} active={!location} onClick={() => { onChange(null); setQuery(""); setOpen(false); }} />

            {query.trim().length > 0 && (
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {deptSuggestions.map((d) => (
                  <CityOption key={d.code} label={`${d.nom} (${d.code})`} sub={t("loc_dept")}
                    active={location?.type === "departement" && location.code === d.code}
                    onClick={() => pickDept(d)} />
                ))}
                {communeSuggestions.map((p, i) => (
                  <CityOption key={p.nom + i} label={p.nom} sub={p.dept ? t("loc_ville_dept", { d: p.dept }) : t("loc_ville")}
                    active={location?.type === "commune" && location.nom === p.nom}
                    onClick={() => pickCommune(p)} />
                ))}
                {deptSuggestions.length === 0 && communeSuggestions.length === 0 && (
                  <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF", padding: "8px 6px" }}>
                    {t("loc_no_result", { q: query })}
                  </div>
                )}
              </div>
            )}

            {location?.type === "commune" && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0EADB" }}>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, color: "#9A93AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {t("loc_radius_title", { ville: location.nom })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[0, 1, 5, 10, 25, 50, 100].map((km) => (
                    <button
                      key={km}
                      onClick={() => onChange({ ...location, radius: km })}
                      style={{
                        fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5,
                        padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                        border: `2px solid ${location.radius === km ? COLORS.coral : "#F0EADB"}`,
                        background: location.radius === km ? COLORS.coral : "#fff",
                        color: location.radius === km ? "#fff" : COLORS.ink,
                      }}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CityOption({ label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
        background: active ? "#FFF4DD" : "transparent", border: "none", borderRadius: 10,
        padding: "8px 10px", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left",
      }}
    >
      <span>
        <span style={{ display: "block", fontWeight: active ? 800 : 700, fontSize: 13.5, color: COLORS.ink }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 11, color: "#9A93AF", fontWeight: 700 }}>{sub}</span>}
      </span>
      {active && <Check size={14} color={COLORS.grass} />}
    </button>
  );
}

function DetailModal({ activity, onClose, joined, onJoin }) {
  if (!activity) return null;
  const meta = catMeta(activity.category);
  const isJoined = joined.includes(activity.id);
  const full = activity.inscrits >= activity.places && !isJoined;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(43,37,96,0.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.cloud, width: "100%", maxWidth: 520, borderRadius: "26px 26px 0 0",
          padding: 24, maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <Stamp category={activity.category} size={56} rotate={-6} />
          <button onClick={onClose} style={{ background: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer" }}>
            <X size={18} color={COLORS.ink} />
          </button>
        </div>

        <div style={{
          fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, letterSpacing: 0.6,
          textTransform: "uppercase", color: meta.color, marginBottom: 4,
        }}>
          {meta.label} · {activity.age}
        </div>
        <h2 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 12px" }}>
          {activity.title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(activity)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={activity.date} />
          <Row icon={<Users size={15} color={COLORS.ink} />} text={t("detail_participants", { a: activity.inscrits, b: activity.places, org: activity.organisateur })} />
        </div>

        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: "#5C5578", lineHeight: 1.6, marginBottom: 20 }}>
          {activity.desc}
        </p>

        {activity.participants && activity.participants.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>{t("detail_registered_children")}</SectionLabel>
              <div style={{ display: "flex", gap: 12 }}>
                <Legend color={COLORS.girl} label={t("legend_girl")} />
                <Legend color={COLORS.boy} label={t("legend_boy")} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activity.participants.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={p.name} genre={p.genre} size={30} />
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isJoined ? (
          <PillButton color={"#EAF8ED"} textColor={COLORS.grass} style={{ width: "100%", boxShadow: "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Check size={18} /> {t("detail_joined")}
            </span>
          </PillButton>
        ) : (
          <PillButton
            color={full ? "#EDEAF4" : COLORS.coral}
            textColor={full ? "#B7AF98" : "#fff"}
            onClick={() => !full && onJoin(activity.id)}
            style={{ width: "100%" }}
          >
            {full ? t("card_full") : t("detail_join_kids")}
          </PillButton>
        )}
      </div>
    </div>
  );
}

// ---------- Community meetups (adultes / ados) ----------
function CommunityCard({ item, categories, onOpen, favorite, onToggleFav }) {
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const full = item.inscrits >= item.places;
  return (
    <div
      onClick={() => onOpen(item)}
      style={{
        background: "#fff", borderRadius: 22, border: "2px solid #F0EADB",
        padding: 16, cursor: "pointer", position: "relative",
        transition: "transform .15s ease, box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(43,37,96,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }}
        style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
        aria-label={t("fav_aria")}
      >
        <Heart size={20} color={favorite ? COLORS.coral : "#D8D2C2"} fill={favorite ? COLORS.coral : "none"} strokeWidth={2.2} />
      </button>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%", border: `2px dashed ${meta.color}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-8deg)", boxShadow: "0 2px 6px rgba(43,37,96,0.12)", flexShrink: 0,
        }}>
          <Icon size={20} color={meta.color} strokeWidth={2.4} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 0.6,
            textTransform: "uppercase", color: meta.color, marginBottom: 2,
          }}>
            {meta.label}
          </div>
          <h3 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, margin: "0 34px 6px 0", lineHeight: 1.15 }}>
            {item.title}
          </h3>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <Row icon={<MapPin size={14} color={COLORS.ink} />} text={lieuAvecVille(item)} />
        <Row icon={<CalendarDays size={14} color={COLORS.ink} />} text={item.date} />
        {item.info && <Row icon={<Users size={14} color={COLORS.ink} />} text={item.info} />}
      </div>

      <PlainParticipantsRow names={item.participants} color={meta.color} />

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} color={full ? COLORS.coral : COLORS.grass} />
          <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5, color: full ? COLORS.coral : COLORS.ink }}>
            {full ? t("card_full") : t("card_places_left", { n: item.places - item.inscrits })}
          </span>
        </div>
        <ChevronRight size={18} color="#C7C0AE" />
      </div>
    </div>
  );
}

function CommunityExplorer({ title, subtitle, categories, items, favorites, onToggleFav, onOpen, emptyText, location }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("tous");
  const [view, setView] = useState("liste");

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const matchCat = cat === "tous" || a.category === cat;
      const matchLoc = matchLocation(a.ville, location);
      const matchQuery = a.title.toLowerCase().includes(query.toLowerCase()) || a.lieu.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchLoc && matchQuery;
    });
  }, [items, query, cat, location]);

  return (
    <div>
      <div style={{ padding: "4px 4px 14px" }}>
        <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 26, color: COLORS.ink, margin: "0 0 4px" }}>
          {title}
        </h1>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14.5, margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8, background: "#fff",
        border: "2px solid #F0EADB", borderRadius: 16, padding: "10px 14px", marginBottom: 14,
      }}>
        <Search size={18} color="#B7AF98" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_placeholder_community")}
          style={{ border: "none", outline: "none", fontFamily: "Nunito, sans-serif", fontSize: 14.5, flex: 1, background: "transparent", color: COLORS.ink }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 10 }}>
        <Chip active={cat === "tous"} onClick={() => setCat("tous")} color={COLORS.ink}>{t("chip_all")}</Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>{c.label}</Chip>
        ))}
      </div>

      <ViewToggle view={view} onChange={setView} />

      {view === "carte" ? (
        <MapView items={filtered} categories={categories} onOpen={onOpen} location={location} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {filtered.map((item) => (
            <CommunityCard key={item.id} item={item} categories={categories} onOpen={onOpen}
              favorite={favorites.includes(item.id)} onToggleFav={onToggleFav} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#9A93AF", fontFamily: "Nunito, sans-serif" }}>
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommunityDetailModal({ item, categories, onClose, joined, onJoin, joinLabel }) {
  if (!item) return null;
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const isJoined = joined.includes(item.id);
  const full = item.inscrits >= item.places && !isJoined;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.cloud, width: "100%", maxWidth: 520, borderRadius: "26px 26px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", border: `2px dashed ${meta.color}`,
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(-6deg)", boxShadow: "0 2px 6px rgba(43,37,96,0.12)",
          }}>
            <Icon size={24} color={meta.color} strokeWidth={2.4} />
          </div>
          <button onClick={onClose} style={{ background: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer" }}>
            <X size={18} color={COLORS.ink} />
          </button>
        </div>

        <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase", color: meta.color, marginBottom: 4 }}>
          {meta.label}
        </div>
        <h2 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 12px" }}>
          {item.title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(item)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={item.date} />
          <Row icon={<Users size={15} color={COLORS.ink} />} text={t("detail_participants", { a: item.inscrits, b: item.places, org: item.organisateur })} />
          {item.info && <Row icon={<Sparkles size={15} color={COLORS.ink} />} text={item.info} />}
        </div>

        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: "#5C5578", lineHeight: 1.6, marginBottom: 20 }}>
          {item.desc}
        </p>

        {item.participants && item.participants.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>{t("detail_already_registered")}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {item.participants.map((n, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PlainAvatar name={n} color={meta.color} size={30} />
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isJoined ? (
          <PillButton color={"#EAF8ED"} textColor={COLORS.grass} style={{ width: "100%", boxShadow: "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Check size={18} /> {t("detail_joined")}
            </span>
          </PillButton>
        ) : (
          <PillButton
            color={full ? "#EDEAF4" : COLORS.coral}
            textColor={full ? "#B7AF98" : "#fff"}
            onClick={() => !full && onJoin(item.id)}
            style={{ width: "100%" }}
          >
            {full ? t("card_full") : joinLabel}
          </PillButton>
        )}
      </div>
    </div>
  );
}

// ---------- Root ----------
export default function RecreApp() {
  const [parentValidated, setParentValidated] = useState(false);
  const [tab, setTab] = useState("profil");
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [favorites, setFavorites] = useState([]);
  const [joined, setJoined] = useState([]);
  const [selected, setSelected] = useState(null);

  const [adultItems, setAdultItems] = useState(ADULT_MEETUPS);
  const [teenItems, setTeenItems] = useState(TEEN_MEETUPS);
  const [favAdult, setFavAdult] = useState([]);
  const [favTeen, setFavTeen] = useState([]);
  const [joinedAdult, setJoinedAdult] = useState([]);
  const [joinedTeen, setJoinedTeen] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null); // { item, kind: "adult" | "teen" }
  const [location, setLocation] = useState(null);

  const toggleFav = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const join = (id) => {
    setJoined((j) => [...j, id]);
    const addKids = (a) => ({
      ...a,
      inscrits: a.inscrits + KIDS.length,
      participants: [...(a.participants || []), ...KIDS.map((k) => ({ name: k.name, genre: k.genre }))],
    });
    setActivities((acts) => acts.map((a) => a.id === id ? addKids(a) : a));
    setSelected((s) => s && s.id === id ? addKids(s) : s);
  };

  const createActivity = (a) => setActivities((acts) => [a, ...acts]);

  const toggleFavCommunity = (kind, id) => {
    const setFav = kind === "adult" ? setFavAdult : setFavTeen;
    setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  const joinCommunity = (kind, id) => {
    const setJoinedFn = kind === "adult" ? setJoinedAdult : setJoinedTeen;
    const setItemsFn = kind === "adult" ? setAdultItems : setTeenItems;
    setJoinedFn((j) => [...j, id]);
    setItemsFn((items) => items.map((it) => it.id === id ? { ...it, inscrits: it.inscrits + 1 } : it));
    setSelectedCommunity((s) => s && s.item.id === id ? { ...s, item: { ...s.item, inscrits: s.item.inscrits + 1 } } : s);
  };

  const TABS_ALL = [
    { id: "explorer", label: t("tab_enfants"), icon: Compass, kidsOnly: true },
    { id: "ados", label: t("tab_ados"), icon: Gamepad2, kidsOnly: true },
    { id: "adultes", label: t("tab_adultes"), icon: Coffee },
    { id: "creer", label: t("tab_creer"), icon: PlusCircle, kidsOnly: true },
    { id: "mes-sorties", label: t("tab_mes_sorties"), icon: BookMarked, kidsOnly: true },
    { id: "profil", label: t("tab_profil"), icon: UserCircle2 },
  ];
  const TABS = TABS_ALL.filter((tb) => !tb.kidsOnly || parentValidated);

  // Si le parent n'est plus validé (démo) alors qu'il est sur un onglet enfants, on le repositionne
  useEffect(() => {
    const stillVisible = TABS.some((tb) => tb.id === tab);
    if (!stillVisible) setTab("profil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentValidated]);

  return (
    <div style={{ background: COLORS.cloud, minHeight: "100vh", fontFamily: "Nunito, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: ${COLORS.sky} !important; }
        ::placeholder { color: #C7C0AE; }
      `}</style>

      {/* Top bar (desktop) / logo (mobile) */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 20px", maxWidth: 960, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PikaMascot size={32} />
          <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>
            Pikapika
          </span>
        </div>

        {/* Desktop nav + sélecteur de ville */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="desktop-nav" style={{ display: "none", gap: 6 }}>
            {TABS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
                  background: tab === tb.id ? COLORS.ink : "transparent",
                  color: tab === tb.id ? "#fff" : COLORS.ink,
                  padding: "9px 16px", borderRadius: 12, fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14.5,
                }}
              >
                <tb.icon size={16} /> {tb.label}
              </button>
            ))}
          </div>
          <LocationFilter location={location} onChange={setLocation} />
        </div>
      </div>

      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "0 20px 110px",
      }}>
        {tab === "explorer" && parentValidated && (
          <Explorer activities={activities} favorites={favorites} onToggleFav={toggleFav} onOpen={setSelected} location={location} />
        )}
        {tab === "creer" && parentValidated && <CreateActivity onCreate={createActivity} />}
        {tab === "mes-sorties" && parentValidated && <MyOutings joined={joined} activities={activities} />}
        {tab === "adultes" && (
          <CommunityExplorer
            title={t("community_adult_title")}
            subtitle={t("community_adult_subtitle")}
            categories={ADULT_CATEGORIES}
            items={adultItems}
            favorites={favAdult}
            onToggleFav={(id) => toggleFavCommunity("adult", id)}
            onOpen={(item) => setSelectedCommunity({ item, kind: "adult" })}
            emptyText={t("community_empty")}
            location={location}
          />
        )}
        {tab === "ados" && parentValidated && (
          <CommunityExplorer
            title={t("community_teen_title")}
            subtitle={t("community_teen_subtitle")}
            categories={TEEN_CATEGORIES}
            items={teenItems}
            favorites={favTeen}
            onToggleFav={(id) => toggleFavCommunity("teen", id)}
            onOpen={(item) => setSelectedCommunity({ item, kind: "teen" })}
            emptyText={t("community_empty")}
            location={location}
          />
        )}
        {tab === "profil" && (
          <Profile
            joinedCount={joined.length}
            validated={parentValidated}
            onToggleDemo={() => setParentValidated((v) => !v)}
          />
        )}
      </div>

      {/* Bottom tab bar (mobile) */}
      <div
        className="mobile-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
          borderTop: "2px solid #F0EADB", display: "flex", justifyContent: "space-around",
          padding: "10px 6px 14px", zIndex: 40, overflowX: "auto", gap: 2,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer", flex: "1 0 56px",
              }}
            >
              <t.icon size={22} color={active ? COLORS.coral : "#B7AF98"} strokeWidth={active ? 2.6 : 2} />
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 10.5,
                color: active ? COLORS.coral : "#B7AF98",
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <DetailModal activity={selected} onClose={() => setSelected(null)} joined={joined} onJoin={join} />

      <CommunityDetailModal
        item={selectedCommunity?.item}
        categories={selectedCommunity?.kind === "teen" ? TEEN_CATEGORIES : ADULT_CATEGORIES}
        onClose={() => setSelectedCommunity(null)}
        joined={selectedCommunity?.kind === "teen" ? joinedTeen : joinedAdult}
        onJoin={(id) => joinCommunity(selectedCommunity?.kind, id)}
        joinLabel={selectedCommunity?.kind === "teen" ? t("join_label_teen") : t("join_label_adult")}
      />

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
