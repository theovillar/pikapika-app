import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Compass, PlusCircle, BookMarked, UserCircle2, Search, MapPin,
  CalendarDays, Users, X, ChevronRight, Sparkles, Heart, Check,
  Baby, Trees, Palette, Music4, Puzzle, Bike, Coffee, Dumbbell,
  Landmark, Gamepad2, Film, Clock, ShieldCheck, Lock, ChevronDown, List, Map,
  Footprints, BookOpen, Flower2, PartyPopper, HeartHandshake, Trophy
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabaseClient";

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
    tab_enfants: "Enfants", tab_ados: "Jeune", tab_adultes: "Adultes", tab_aine: "Ainé", tab_creer: "Créer",
    tab_mes_sorties: "Mes sorties", tab_profil: "Profil",
    tab_creer_adulte: "Créer rencontre", tab_mes_adultes: "Mes rencontres",
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
    cat_marche: "Marche santé", cat_ateliers: "Ateliers", cat_jardinage: "Jardinage",
    cat_mairie: "Mairie", cat_solidaire: "Solidaire", cat_fete: "Fête de quartier",
    create_title: "Proposer une sortie",
    create_subtitle: "Partagez une activité, d'autres parents pourront rejoindre avec leurs enfants.",
    label_titre: "Titre de la sortie", placeholder_titre: "Ex. Balade contée au parc",
    label_categorie: "Catégorie", label_lieu: "Lieu", placeholder_lieu: "Parc, adresse…",
    label_date: "Date & heure", placeholder_date: "Sam. 9 août · 10h", label_heure: "Heure",
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
    val_validated_text: "Vous avez accès aux sorties enfants et jeune : Enfants, Jeune, Créer une sortie et Mes sorties. Les sorties Adultes et Ainé restent accessibles à tous, sans validation.",
    val_pending_title: "Validation de la mairie en attente",
    val_pending_text: "Pour la sécurité des enfants, l'accès aux sorties enfants et jeune (Enfants, Jeune, Créer, Mes sorties) n'est ouvert qu'aux parents dont l'identité a été vérifiée par la mairie de leur commune. Les sorties Adultes et Ainé restent accessibles sans validation. Vous recevrez une notification dès que ce sera fait.",
    val_demo_on: "Simuler : repasser en attente (démo)", val_demo_off: "Simuler : validation par la mairie (démo)",
    detail_participants: "{a}/{b} participants · organisé par {org}",
    detail_registered_children: "Enfants déjà inscrits", legend_girl: "Fille", legend_boy: "Garçon",
    detail_joined: "Vous participez", detail_join_kids: "Rejoindre avec mon enfant",
    detail_already_registered: "Déjà inscrit(e)s",
    community_adult_title: "Rencontres entre parents",
    community_adult_subtitle: "Des moments entre adultes, sans les enfants, pour se connaître entre parents du quartier.",
    community_teen_title: "Rencontres entre jeunes",
    community_teen_subtitle: "Des activités entre jeunes, toujours encadrées par une association, une MJC ou un professeur.",
    community_empty: "Aucune rencontre ne correspond. Essayez une autre recherche !",
    join_label_adult: "Rejoindre ce moment", join_label_teen: "Rejoindre cette rencontre", join_label_senior: "Rejoindre ce moment",
    community_senior_title: "Rencontres entre aînés",
    community_senior_subtitle: "Des moments conviviaux entre retraités du quartier, à leur rythme.",
    community_kids_title: "Sorties enfants", community_kids_subtitle: "Des sorties à partager avec vos enfants près de chez vous.",
    tab_associations: "Commune", community_asso_title: "Associations & Mairie",
    community_asso_subtitle: "Événements organisés par la mairie et les associations de votre commune.",
    join_label_asso: "Je participe",
    chip_intergen: "Intergénérationnel", intergen_badge: "Intergénérationnel",
    btn_sign_out: "Se déconnecter",
    auth_title: "Bienvenue sur Pikapika", auth_subtitle: "Connectez-vous pour retrouver vos sorties.",
    auth_email: "Adresse email", auth_password: "Mot de passe", auth_name: "Votre prénom",
    auth_login_btn: "Se connecter", auth_signup_btn: "Créer mon compte",
    auth_switch_to_signup: "Pas encore de compte ? Inscrivez-vous",
    auth_switch_to_login: "Déjà un compte ? Connectez-vous",
    auth_error_generic: "Une erreur est survenue. Vérifiez vos informations et réessayez.",
    auth_loading: "Chargement…",
    loc_placeholder: "Ville, code postal, département…", loc_all_france: "Toute la France",
    loc_no_result: 'Aucun résultat pour "{q}"', loc_dept: "Département", loc_ville: "Ville",
    loc_ville_dept: "Ville · dept. {d}", loc_radius_title: "Rayon autour de {ville}",
    map_centered_on: "Carte centrée sur {loc}", map_empty: "Aucune sortie géolocalisée pour ces filtres.",
    map_see_detail: "Voir la fiche",
    day_today: "Aujourd'hui", day_tomorrow: "Demain", day_after_tomorrow: "Après-demain",
    day_after_after_tomorrow: "Après-après-demain",
    legend_femme: "Femme", legend_homme: "Homme",
    accordion_empty: "Aucune rencontre ce jour-là.",
    create_toggle_child: "Sortie enfant", create_toggle_adult: "Rencontre adulte",
    note_needs_validation: "Vous pourrez aussi proposer des sorties enfants une fois votre identité validée par la mairie (voir Profil).",
    section_kids_outings: "Sorties enfants", section_adult_meetups: "Rencontres adultes",
    adult_sub_decouvrir: "Découvrir", adult_sub_creer: "Créer", adult_sub_mes: "Mes rencontres",
    create_meetup_title: "Proposer une rencontre",
    create_meetup_subtitle: "Partagez un moment entre adultes, d'autres parents pourront vous rejoindre.",
    label_info: "Info complémentaire (optionnel)", placeholder_info: "Ex. Pendant que les enfants sont à l'école",
    success_message_meetup: "Rencontre publiée ! Elle apparaît dans l'onglet Découvrir.",
    my_meetups_title: "Mes rencontres",
    my_meetups_subtitle: "Les rencontres que vous avez proposées ou rejointes.",
    my_meetups_empty: "Vous n'avez pas encore de rencontre. Rejoignez-en une dans Découvrir, ou proposez la vôtre dans Créer !",
  },
  en: {
    tab_enfants: "Kids", tab_ados: "Youth", tab_adultes: "Adults", tab_aine: "Seniors", tab_creer: "Create",
    tab_mes_sorties: "My outings", tab_profil: "Profile",
    tab_creer_adulte: "Create meetup", tab_mes_adultes: "My meetups",
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
    cat_marche: "Health walk", cat_ateliers: "Workshops", cat_jardinage: "Gardening",
    cat_mairie: "Town hall", cat_solidaire: "Solidarity", cat_fete: "Neighbourhood fair",
    create_title: "Propose an outing",
    create_subtitle: "Share an activity, other parents can join with their kids.",
    label_titre: "Outing title", placeholder_titre: "E.g. Storytelling walk in the park",
    label_categorie: "Category", label_lieu: "Location", placeholder_lieu: "Park, address…",
    label_date: "Date & time", placeholder_date: "Sat. Aug 9 · 10am", label_heure: "Time",
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
    val_validated_text: "You have access to kids and youth outings: Kids, Youth, Create an outing and My outings. Adults and Seniors outings remain open to everyone, no verification needed.",
    val_pending_title: "Town hall verification pending",
    val_pending_text: "For children's safety, access to kids and youth outings (Kids, Youth, Create, My outings) is only open to parents whose identity has been verified by their town hall. Adults and Seniors outings remain open without verification. You'll be notified as soon as it's done.",
    val_demo_on: "Simulate: back to pending (demo)", val_demo_off: "Simulate: town hall verification (demo)",
    detail_participants: "{a}/{b} participants · hosted by {org}",
    detail_registered_children: "Already registered kids", legend_girl: "Girl", legend_boy: "Boy",
    detail_joined: "You're in", detail_join_kids: "Join with my child",
    detail_already_registered: "Already registered",
    community_adult_title: "Meetups between parents",
    community_adult_subtitle: "Moments between adults, without the kids, to meet other parents nearby.",
    community_teen_title: "Meetups between young people",
    community_teen_subtitle: "Youth activities, always supervised by an association, a youth club or a teacher.",
    community_empty: "No meetup matches. Try another search!",
    join_label_adult: "Join this meetup", join_label_teen: "Join this meetup", join_label_senior: "Join this meetup",
    community_senior_title: "Meetups between seniors",
    community_senior_subtitle: "Friendly moments between retirees in the neighbourhood, at their own pace.",
    community_kids_title: "Kids outings", community_kids_subtitle: "Outings to share with your kids near you.",
    tab_associations: "Community", community_asso_title: "Town Hall & Associations",
    community_asso_subtitle: "Events organised by the town hall and local associations.",
    join_label_asso: "I'm in",
    chip_intergen: "Intergenerational", intergen_badge: "Intergenerational",
    btn_sign_out: "Sign out",
    auth_title: "Welcome to Pikapika", auth_subtitle: "Sign in to find your outings.",
    auth_email: "Email address", auth_password: "Password", auth_name: "Your first name",
    auth_login_btn: "Sign in", auth_signup_btn: "Create my account",
    auth_switch_to_signup: "No account yet? Sign up",
    auth_switch_to_login: "Already have an account? Sign in",
    auth_error_generic: "Something went wrong. Check your details and try again.",
    auth_loading: "Loading…",
    loc_placeholder: "City, postcode, department…", loc_all_france: "All of France",
    loc_no_result: 'No result for "{q}"', loc_dept: "Department", loc_ville: "City",
    loc_ville_dept: "City · dept. {d}", loc_radius_title: "Radius around {ville}",
    map_centered_on: "Map centred on {loc}", map_empty: "No located outing for these filters.",
    map_see_detail: "See details",
    day_today: "Today", day_tomorrow: "Tomorrow", day_after_tomorrow: "Day after tomorrow",
    day_after_after_tomorrow: "In 3 days",
    legend_femme: "Woman", legend_homme: "Man",
    accordion_empty: "No meetup that day.",
    create_toggle_child: "Kids outing", create_toggle_adult: "Adult meetup",
    note_needs_validation: "You'll also be able to propose kids outings once your identity is verified by the town hall (see Profile).",
    section_kids_outings: "Kids outings", section_adult_meetups: "Adult meetups",
    adult_sub_decouvrir: "Discover", adult_sub_creer: "Create", adult_sub_mes: "My meetups",
    create_meetup_title: "Propose a meetup",
    create_meetup_subtitle: "Share a moment between adults, other parents can join you.",
    label_info: "Extra info (optional)", placeholder_info: "E.g. While the kids are at school",
    success_message_meetup: "Meetup published! It now appears in the Discover tab.",
    my_meetups_title: "My meetups",
    my_meetups_subtitle: "The meetups you've proposed or joined.",
    my_meetups_empty: "No meetups yet. Join one in Discover, or propose your own in Create!",
  },
  es: {
    tab_enfants: "Niños", tab_ados: "Jóvenes", tab_adultes: "Adultos", tab_aine: "Mayores", tab_creer: "Crear",
    tab_mes_sorties: "Mis salidas", tab_profil: "Perfil",
    tab_creer_adulte: "Crear encuentro", tab_mes_adultes: "Mis encuentros",
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
    cat_marche: "Marcha saludable", cat_ateliers: "Talleres", cat_jardinage: "Jardinería",
    cat_mairie: "Ayuntamiento", cat_solidaire: "Solidaridad", cat_fete: "Fiesta de barrio",
    create_title: "Proponer una salida",
    create_subtitle: "Comparte una actividad, otros padres podrán unirse con sus hijos.",
    label_titre: "Título de la salida", placeholder_titre: "Ej. Paseo cuentacuentos en el parque",
    label_categorie: "Categoría", label_lieu: "Lugar", placeholder_lieu: "Parque, dirección…",
    label_date: "Fecha y hora", placeholder_date: "Sáb. 9 ago · 10h", label_heure: "Hora",
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
    val_validated_text: "Tienes acceso a las salidas de niños y jóvenes: Niños, Jóvenes, Crear una salida y Mis salidas. Las salidas de Adultos y Mayores siguen abiertas a todos, sin validación.",
    val_pending_title: "Validación del ayuntamiento pendiente",
    val_pending_text: "Por la seguridad de los niños, el acceso a las salidas de niños y jóvenes (Niños, Jóvenes, Crear, Mis salidas) solo está abierto a los padres cuya identidad haya sido verificada por su ayuntamiento. Las salidas de Adultos y Mayores siguen abiertas sin validación. Recibirás una notificación en cuanto se haga.",
    val_demo_on: "Simular: volver a pendiente (demo)", val_demo_off: "Simular: validación del ayuntamiento (demo)",
    detail_participants: "{a}/{b} participantes · organizado por {org}",
    detail_registered_children: "Niños ya inscritos", legend_girl: "Niña", legend_boy: "Niño",
    detail_joined: "Estás participando", detail_join_kids: "Unirme con mi hijo/a",
    detail_already_registered: "Ya inscritos",
    community_adult_title: "Encuentros entre padres",
    community_adult_subtitle: "Momentos entre adultos, sin los niños, para conocer a otros padres del barrio.",
    community_teen_title: "Encuentros entre jóvenes",
    community_teen_subtitle: "Actividades entre jóvenes, siempre supervisadas por una asociación, un centro juvenil o un profesor.",
    community_empty: "Ningún encuentro coincide. ¡Prueba otra búsqueda!",
    join_label_adult: "Unirme a este encuentro", join_label_teen: "Unirme a este encuentro", join_label_senior: "Unirme a este encuentro",
    community_senior_title: "Encuentros entre mayores",
    community_senior_subtitle: "Momentos agradables entre jubilados del barrio, a su propio ritmo.",
    community_kids_title: "Salidas infantiles", community_kids_subtitle: "Salidas para compartir con tus hijos cerca de ti.",
    tab_associations: "Comunidad", community_asso_title: "Ayuntamiento y asociaciones",
    community_asso_subtitle: "Eventos organizados por el ayuntamiento y las asociaciones locales.",
    join_label_asso: "Participo",
    chip_intergen: "Intergeneracional", intergen_badge: "Intergeneracional",
    btn_sign_out: "Cerrar sesión",
    auth_title: "Bienvenido/a a Pikapika", auth_subtitle: "Inicia sesión para encontrar tus salidas.",
    auth_email: "Correo electrónico", auth_password: "Contraseña", auth_name: "Tu nombre",
    auth_login_btn: "Iniciar sesión", auth_signup_btn: "Crear mi cuenta",
    auth_switch_to_signup: "¿Aún no tienes cuenta? Regístrate",
    auth_switch_to_login: "¿Ya tienes cuenta? Inicia sesión",
    auth_error_generic: "Algo salió mal. Comprueba tus datos e inténtalo de nuevo.",
    auth_loading: "Cargando…",
    loc_placeholder: "Ciudad, código postal, departamento…", loc_all_france: "Toda Francia",
    loc_no_result: 'Sin resultados para "{q}"', loc_dept: "Departamento", loc_ville: "Ciudad",
    loc_ville_dept: "Ciudad · dpto. {d}", loc_radius_title: "Radio alrededor de {ville}",
    map_centered_on: "Mapa centrado en {loc}", map_empty: "Ninguna salida geolocalizada para estos filtros.",
    map_see_detail: "Ver la ficha",
    day_today: "Hoy", day_tomorrow: "Mañana", day_after_tomorrow: "Pasado mañana",
    day_after_after_tomorrow: "En 3 días",
    legend_femme: "Mujer", legend_homme: "Hombre",
    accordion_empty: "Ningún encuentro ese día.",
    create_toggle_child: "Salida infantil", create_toggle_adult: "Encuentro de adultos",
    note_needs_validation: "También podrás proponer salidas infantiles una vez que tu identidad sea validada por el ayuntamiento (ver Perfil).",
    section_kids_outings: "Salidas infantiles", section_adult_meetups: "Encuentros de adultos",
    adult_sub_decouvrir: "Descubrir", adult_sub_creer: "Crear", adult_sub_mes: "Mis encuentros",
    create_meetup_title: "Proponer un encuentro",
    create_meetup_subtitle: "Comparte un momento entre adultos, otros padres podrán unirse.",
    label_info: "Info adicional (opcional)", placeholder_info: "Ej. Mientras los niños están en el colegio",
    success_message_meetup: "¡Encuentro publicado! Aparece en la pestaña Descubrir.",
    my_meetups_title: "Mis encuentros",
    my_meetups_subtitle: "Los encuentros que has propuesto o a los que te has unido.",
    my_meetups_empty: "Todavía no tienes encuentros. ¡Únete a uno en Descubrir, o propón el tuyo en Crear!",
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
// Même palette que pour les enfants (couleur cohérente, indépendante de la catégorie de l'annonce),
// mais avec un libellé adapté aux adultes.
const adultGenreLabel = (genre) => (genre === "F" ? t("legend_femme") : t("legend_homme"));

// Libellé de jour relatif à aujourd'hui (Aujourd'hui, Demain, Après-demain, puis "jeudi 6 septembre"…)
function relativeDayLabel(offsetDays) {
  if (offsetDays === 0) return t("day_today");
  if (offsetDays === 1) return t("day_tomorrow");
  if (offsetDays === 2) return t("day_after_tomorrow");
  if (offsetDays === 3) return t("day_after_after_tomorrow");
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const locale = LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US";
  const label = d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Affiche soit une date relative calculée (rencontres adultes), soit la date libre existante (ados, sorties enfants)
function displayDate(item) {
  return item.offsetDays !== undefined ? `${relativeDayLabel(item.offsetDays)} · ${item.time}` : item.date;
}

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

const SENIOR_CATEGORIES = [
  { id: "cafe", label: t("cat_cafe"), icon: Coffee, color: COLORS.sun },
  { id: "marche", label: t("cat_marche"), icon: Footprints, color: COLORS.grass },
  { id: "ateliers", label: t("cat_ateliers"), icon: BookOpen, color: COLORS.sky },
  { id: "culture", label: t("cat_culture"), icon: Landmark, color: COLORS.grape },
  { id: "jardinage", label: t("cat_jardinage"), icon: Flower2, color: COLORS.coral },
];

const ASSO_CATEGORIES = [
  { id: "mairie", label: t("cat_mairie"), icon: Landmark, color: COLORS.ink },
  { id: "sport", label: t("cat_sport"), icon: Trophy, color: COLORS.grass },
  { id: "culture", label: t("cat_culture"), icon: Palette, color: COLORS.grape },
  { id: "solidaire", label: t("cat_solidaire"), icon: HeartHandshake, color: COLORS.coral },
  { id: "fete", label: t("cat_fete"), icon: PartyPopper, color: COLORS.sun },
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
    offsetDays: 0, time: "10h00",
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
    offsetDays: 1, time: "14h30",
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
    offsetDays: 4, time: "16h00",
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
    offsetDays: 7, time: "15h00",
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
    offsetDays: 8, time: "10h00",
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
  {
    id: 6,
    title: "Après-midi contes avec les aînés du quartier",
    category: "creatif",
    ville: "grenoble",
    lieu: "Médiathèque - espace jeunesse",
    offsetDays: 6, time: "15h00",
    age: "3-8 ans",
    places: 15,
    inscrits: 8,
    organisateur: "Médiathèque",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux enfants et aux aînés du quartier",
    desc: "Des aînés du quartier viennent raconter des histoires et légendes locales aux enfants, dans une ambiance chaleureuse. Un moment de transmission entre générations.",
    participants: [
      { name: "Léo", genre: "G" }, { name: "Mila", genre: "F" }, { name: "Sacha", genre: "G" },
      { name: "Iris", genre: "F" }, { name: "Noé", genre: "G" },
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
    offsetDays: 0, time: "9h00",
    info: "Pendant que les enfants sont à l'école",
    places: 10,
    inscrits: 6,
    organisateur: "Sophie L.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [
      { name: "Sophie", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Elodie", genre: "F" },
      { name: "Marc", genre: "H" }, { name: "Fanny", genre: "F" }, { name: "Julien", genre: "H" },
    ],
  },
  {
    id: 102,
    title: "Footing détente entre parents",
    category: "sport",
    ville: "grenoble",
    lieu: "Bords du canal",
    offsetDays: 1, time: "19h00",
    info: "Tous niveaux bienvenus",
    places: 12,
    inscrits: 5,
    organisateur: "Marc D.",
    desc: "Une sortie running à allure tranquille pour décompresser après le boulot, suivie d'un étirement collectif.",
    participants: [
      { name: "Marc", genre: "H" }, { name: "Alice", genre: "F" }, { name: "Yasmine", genre: "F" },
      { name: "Paul", genre: "H" }, { name: "Claire", genre: "F" },
    ],
  },
  {
    id: 103,
    title: "Visite de l'expo photo",
    category: "culture",
    ville: "lyon",
    lieu: "Médiathèque centrale",
    offsetDays: 2, time: "11h00",
    info: "Visite libre, échange ensuite",
    places: 8,
    inscrits: 3,
    organisateur: "Elodie F.",
    desc: "On se retrouve pour visiter l'exposition puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [
      { name: "Elodie", genre: "F" }, { name: "Nadia", genre: "F" }, { name: "Vincent", genre: "H" },
    ],
  },
  {
    id: 104,
    title: "Atelier yoga en plein air",
    category: "bienetre",
    ville: "chambery",
    lieu: "Parc des Tilleuls",
    offsetDays: 5, time: "9h30",
    info: "Tapis non fourni",
    places: 15,
    inscrits: 11,
    organisateur: "Claire B.",
    desc: "Une heure de yoga doux animée par une pratiquante du quartier, ouverte à tous les niveaux.",
    participants: [
      { name: "Claire", genre: "F" }, { name: "Julien", genre: "H" }, { name: "Fanny", genre: "F" },
      { name: "Karim", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Nadia", genre: "F" },
    ],
  },
  {
    id: 105,
    title: "Soirée jeux de société",
    category: "jeux",
    ville: "annecy",
    lieu: "Chez Julien",
    offsetDays: 12, time: "20h00",
    info: "Chacun amène un jeu ou une boisson",
    places: 8,
    inscrits: 4,
    organisateur: "Julien P.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux de société et d'un apéro partagé.",
    participants: [
      { name: "Julien", genre: "H" }, { name: "Marc", genre: "H" }, { name: "Alice", genre: "F" }, { name: "Vincent", genre: "H" },
    ],
  },
  {
    id: 106,
    title: "Café des parents du quartier",
    category: "cafe",
    ville: "grenoble",
    lieu: "Café Le Marronnier",
    offsetDays: 47, time: "14h00",
    places: 9,
    inscrits: 5,
    organisateur: "Julie D.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Léa", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Céline", genre: "F" }, { name: "Benjamin", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Marion", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Maxime", genre: "H" }, { name: "Yasmine", genre: "F" }, { name: "Maxime", genre: "H" }],
  },
  {
    id: 107,
    title: "Footing détente entre parents",
    category: "sport",
    ville: "varces",
    lieu: "Bords du canal",
    offsetDays: 24, time: "9h30",
    info: "Pendant que les enfants sont à l'école",
    places: 11,
    inscrits: 7,
    organisateur: "Mathieu J.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Romain", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Rachid", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Julien", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Julien", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Alexandre", genre: "H" }],
  },
  {
    id: 108,
    title: "Sortie théâtre entre adultes",
    category: "culture",
    ville: "vif",
    lieu: "Musée des Beaux-Arts",
    offsetDays: 22, time: "11h00",
    places: 16,
    inscrits: 6,
    organisateur: "Nadia V.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "David", genre: "H" }, { name: "Emma", genre: "F" }, { name: "Laura", genre: "F" }, { name: "Manon", genre: "F" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 109,
    title: "Séance de méditation collective",
    category: "bienetre",
    ville: "lyon",
    lieu: "Parc des Tilleuls",
    offsetDays: 51, time: "15h00",
    info: "Chacun amène quelque chose à partager",
    places: 12,
    inscrits: 6,
    organisateur: "Nadia G.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Aurélie", genre: "F" }, { name: "Marion", genre: "F" }, { name: "Nadia", genre: "F" }, { name: "Laura", genre: "F" }, { name: "Mathieu", genre: "H" }, { name: "Pauline", genre: "F" }, { name: "Camille", genre: "F" }, { name: "Paul", genre: "H" }],
  },
  {
    id: 110,
    title: "Tournoi de mölkky au parc",
    category: "jeux",
    ville: "chambery",
    lieu: "Café des jeux",
    offsetDays: 5, time: "9h00",
    info: "Tous niveaux bienvenus",
    places: 19,
    inscrits: 5,
    organisateur: "Sarah W.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Romain", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Benjamin", genre: "H" }, { name: "Karim", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Benjamin", genre: "H" }, { name: "Maxime", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Sophie", genre: "F" }],
  },
  {
    id: 111,
    title: "Petit-déjeuner convivial",
    category: "cafe",
    ville: "annecy",
    lieu: "Chez Léon",
    offsetDays: 48, time: "10h00",
    info: "Chacun amène quelque chose à partager",
    places: 14,
    inscrits: 3,
    organisateur: "Amandine W.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Alice", genre: "F" }, { name: "Adrien", genre: "H" }, { name: "Rachid", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Charlotte", genre: "F" }, { name: "Hugo", genre: "H" }],
  },
  {
    id: 112,
    title: "Session vélo en groupe",
    category: "sport",
    ville: "valence",
    lieu: "Bords du canal",
    offsetDays: 15, time: "19h00",
    info: "Chacun amène quelque chose à partager",
    places: 7,
    inscrits: 2,
    organisateur: "Alexandre C.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Aurélie", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Amandine", genre: "F" }, { name: "Yasmine", genre: "F" }, { name: "Nicolas", genre: "H" }],
  },
  {
    id: 113,
    title: "Balade patrimoine du centre-ville",
    category: "culture",
    ville: "paris",
    lieu: "Centre culturel",
    offsetDays: 42, time: "19h30",
    info: "Pendant que les enfants sont à l'école",
    places: 11,
    inscrits: 9,
    organisateur: "Kevin Q.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Manon", genre: "F" }, { name: "Laura", genre: "F" }, { name: "Camille", genre: "F" }, { name: "Elodie", genre: "F" }, { name: "Elodie", genre: "F" }, { name: "Julien", genre: "H" }],
  },
  {
    id: 114,
    title: "Sophrologie en groupe",
    category: "bienetre",
    ville: "grenoble",
    lieu: "Salle municipale",
    offsetDays: 17, time: "19h30",
    places: 13,
    inscrits: 5,
    organisateur: "Guillaume E.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Aurélie", genre: "F" }, { name: "Nicolas", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Elodie", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Manon", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Yasmine", genre: "F" }, { name: "Paul", genre: "H" }],
  },
  {
    id: 115,
    title: "Soirée quiz entre voisins",
    category: "jeux",
    ville: "varces",
    lieu: "Salle des fêtes",
    offsetDays: 17, time: "17h00",
    info: "Pendant que les enfants sont à l'école",
    places: 9,
    inscrits: 3,
    organisateur: "Antoine T.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Benjamin", genre: "H" }, { name: "Julien", genre: "H" }, { name: "David", genre: "H" }],
  },
  {
    id: 116,
    title: "Brunch entre parents",
    category: "cafe",
    ville: "vif",
    lieu: "Le Comptoir",
    offsetDays: 31, time: "17h00",
    info: "Ouvert à tous les parents du quartier",
    places: 9,
    inscrits: 8,
    organisateur: "Claire F.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Antoine", genre: "H" }, { name: "Guillaume", genre: "H" }, { name: "Laura", genre: "F" }],
  },
  {
    id: 117,
    title: "Randonnée douce du dimanche",
    category: "sport",
    ville: "lyon",
    lieu: "Piste cyclable du Lac",
    offsetDays: 9, time: "11h00",
    places: 10,
    inscrits: 5,
    organisateur: "Claire U.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Manon", genre: "F" }, { name: "Pauline", genre: "F" }, { name: "Céline", genre: "F" }, { name: "Céline", genre: "F" }, { name: "Alice", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "David", genre: "H" }, { name: "Pauline", genre: "F" }, { name: "Amandine", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Pauline", genre: "F" }],
  },
  {
    id: 118,
    title: "Ciné-club entre parents",
    category: "culture",
    ville: "chambery",
    lieu: "Cinéma Le Rex",
    offsetDays: 20, time: "14h00",
    info: "Ouvert à tous les parents du quartier",
    places: 9,
    inscrits: 7,
    organisateur: "Aurélie J.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Hugo", genre: "H" }, { name: "Fanny", genre: "F" }, { name: "Amandine", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Yasmine", genre: "F" }],
  },
  {
    id: 119,
    title: "Sophrologie en groupe",
    category: "bienetre",
    ville: "annecy",
    lieu: "Studio Zen",
    offsetDays: 8, time: "15h00",
    info: "Venez comme vous êtes",
    places: 20,
    inscrits: 4,
    organisateur: "Aurélie M.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Laura", genre: "F" }, { name: "Rachid", genre: "H" }, { name: "Adrien", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Claire", genre: "F" }],
  },
  {
    id: 120,
    title: "Tournoi de belote entre parents",
    category: "jeux",
    ville: "valence",
    lieu: "Ludothèque municipale",
    offsetDays: 7, time: "9h30",
    info: "Chacun amène quelque chose à partager",
    places: 17,
    inscrits: 6,
    organisateur: "Laura K.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Nicolas", genre: "H" }, { name: "Antoine", genre: "H" }, { name: "Antoine", genre: "H" }, { name: "Marc", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 121,
    title: "Café des parents du quartier",
    category: "cafe",
    ville: "paris",
    lieu: "Café des Arts",
    offsetDays: 49, time: "10h00",
    info: "Chacun amène quelque chose à partager",
    places: 16,
    inscrits: 6,
    organisateur: "Manon Q.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Vincent", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Alexandre", genre: "H" }, { name: "Paul", genre: "H" }, { name: "Elodie", genre: "F" }, { name: "Elodie", genre: "F" }, { name: "Nicolas", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Laura", genre: "F" }],
  },
  {
    id: 122,
    title: "Cours de fitness en plein air",
    category: "sport",
    ville: "grenoble",
    lieu: "City stade",
    offsetDays: 47, time: "10h00",
    info: "Ouvert à tous les parents du quartier",
    places: 20,
    inscrits: 9,
    organisateur: "Manon F.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Manon", genre: "F" }, { name: "Kevin", genre: "H" }, { name: "David", genre: "H" }],
  },
  {
    id: 123,
    title: "Balade patrimoine du centre-ville",
    category: "culture",
    ville: "varces",
    lieu: "Théâtre municipal",
    offsetDays: 50, time: "20h00",
    info: "Tous niveaux bienvenus",
    places: 7,
    inscrits: 5,
    organisateur: "Fanny R.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Guillaume", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Yasmine", genre: "F" }, { name: "Julie", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Céline", genre: "F" }],
  },
  {
    id: 124,
    title: "Atelier relaxation et respiration",
    category: "bienetre",
    ville: "vif",
    lieu: "Salle des fêtes",
    offsetDays: 21, time: "9h00",
    info: "Venez comme vous êtes",
    places: 7,
    inscrits: 4,
    organisateur: "Charlotte U.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Léa", genre: "F" }, { name: "Manon", genre: "F" }, { name: "Céline", genre: "F" }],
  },
  {
    id: 125,
    title: "Soirée jeux de société",
    category: "jeux",
    ville: "lyon",
    lieu: "Café des jeux",
    offsetDays: 57, time: "19h00",
    info: "Pendant que les enfants sont à l'école",
    places: 9,
    inscrits: 6,
    organisateur: "Fanny P.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Benjamin", genre: "H" }, { name: "Nicolas", genre: "H" }, { name: "Fanny", genre: "F" }, { name: "Maxime", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Kevin", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Nicolas", genre: "H" }, { name: "Emma", genre: "F" }, { name: "Thomas", genre: "H" }],
  },
  {
    id: 126,
    title: "Pause café entre voisins",
    category: "cafe",
    ville: "chambery",
    lieu: "Chez Léon",
    offsetDays: 19, time: "16h00",
    info: "Tous niveaux bienvenus",
    places: 14,
    inscrits: 2,
    organisateur: "Amandine K.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Rachid", genre: "H" }, { name: "Guillaume", genre: "H" }, { name: "Yasmine", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Rachid", genre: "H" }, { name: "Camille", genre: "F" }, { name: "David", genre: "H" }, { name: "Paul", genre: "H" }],
  },
  {
    id: 127,
    title: "Footing détente entre parents",
    category: "sport",
    ville: "annecy",
    lieu: "Bords du canal",
    offsetDays: 15, time: "17h00",
    info: "Ouvert à tous les parents du quartier",
    places: 15,
    inscrits: 15,
    organisateur: "Nadia Q.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Romain", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "David", genre: "H" }, { name: "Céline", genre: "F" }],
  },
  {
    id: 128,
    title: "Après-midi musée",
    category: "culture",
    ville: "valence",
    lieu: "Médiathèque centrale",
    offsetDays: 35, time: "11h00",
    info: "Ouvert à tous les parents du quartier",
    places: 20,
    inscrits: 5,
    organisateur: "Hugo E.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Rachid", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Adrien", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Alice", genre: "F" }, { name: "Florian", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Adrien", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Fanny", genre: "F" }],
  },
  {
    id: 129,
    title: "Cours de pilates du soir",
    category: "bienetre",
    ville: "paris",
    lieu: "Salle municipale",
    offsetDays: 17, time: "15h00",
    info: "Tous niveaux bienvenus",
    places: 11,
    inscrits: 10,
    organisateur: "Alice E.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Nadia", genre: "F" }, { name: "Julien", genre: "H" }, { name: "Manon", genre: "F" }, { name: "Kevin", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Pauline", genre: "F" }],
  },
  {
    id: 130,
    title: "Soirée jeux de société",
    category: "jeux",
    ville: "grenoble",
    lieu: "Maison des associations",
    offsetDays: 24, time: "17h00",
    info: "Ouvert à tous les parents du quartier",
    places: 6,
    inscrits: 4,
    organisateur: "Amandine N.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Benjamin", genre: "H" }, { name: "David", genre: "H" }, { name: "Julie", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Emma", genre: "F" }, { name: "Guillaume", genre: "H" }, { name: "Rachid", genre: "H" }, { name: "Romain", genre: "H" }, { name: "Karim", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Marion", genre: "F" }],
  },
  {
    id: 131,
    title: "Brunch entre parents",
    category: "cafe",
    ville: "varces",
    lieu: "Café Le Marronnier",
    offsetDays: 16, time: "16h00",
    info: "Venez comme vous êtes",
    places: 11,
    inscrits: 5,
    organisateur: "Hugo L.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Léa", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Laura", genre: "F" }, { name: "Charlotte", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Marc", genre: "H" }, { name: "David", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "David", genre: "H" }],
  },
  {
    id: 132,
    title: "Session vélo en groupe",
    category: "sport",
    ville: "vif",
    lieu: "Piste cyclable du Lac",
    offsetDays: 42, time: "9h30",
    info: "Venez comme vous êtes",
    places: 15,
    inscrits: 5,
    organisateur: "Hugo J.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Vincent", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Romain", genre: "H" }],
  },
  {
    id: 133,
    title: "Après-midi musée",
    category: "culture",
    ville: "lyon",
    lieu: "Théâtre municipal",
    offsetDays: 4, time: "19h00",
    places: 17,
    inscrits: 9,
    organisateur: "Yasmine K.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Mathieu", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Manon", genre: "F" }],
  },
  {
    id: 134,
    title: "Atelier yoga en plein air",
    category: "bienetre",
    ville: "chambery",
    lieu: "Jardin partagé",
    offsetDays: 52, time: "17h00",
    info: "Ouvert à tous les parents du quartier",
    places: 7,
    inscrits: 5,
    organisateur: "Vincent W.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Céline", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Benjamin", genre: "H" }, { name: "Guillaume", genre: "H" }, { name: "Pauline", genre: "F" }],
  },
  {
    id: 135,
    title: "Après-midi jeux de cartes",
    category: "jeux",
    ville: "annecy",
    lieu: "Ludothèque municipale",
    offsetDays: 54, time: "11h00",
    info: "Tous niveaux bienvenus",
    places: 19,
    inscrits: 4,
    organisateur: "Laura Q.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Romain", genre: "H" }, { name: "Aurélie", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Charlotte", genre: "F" }, { name: "Maxime", genre: "H" }, { name: "Amandine", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Adrien", genre: "H" }, { name: "Julien", genre: "H" }, { name: "Léa", genre: "F" }],
  },
  {
    id: 136,
    title: "Café-discussion du matin",
    category: "cafe",
    ville: "valence",
    lieu: "Chez Léon",
    offsetDays: 48, time: "11h00",
    info: "Pendant que les enfants sont à l'école",
    places: 17,
    inscrits: 17,
    organisateur: "Alexandre Q.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Emma", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Céline", genre: "F" }],
  },
  {
    id: 137,
    title: "Marche nordique matinale",
    category: "sport",
    ville: "paris",
    lieu: "Piste cyclable du Lac",
    offsetDays: 47, time: "18h00",
    info: "Venez comme vous êtes",
    places: 11,
    inscrits: 7,
    organisateur: "Hugo J.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Yasmine", genre: "F" }, { name: "Laura", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Aurélie", genre: "F" }, { name: "Pauline", genre: "F" }, { name: "Adrien", genre: "H" }, { name: "Vincent", genre: "H" }],
  },
  {
    id: 138,
    title: "Sortie théâtre entre adultes",
    category: "culture",
    ville: "grenoble",
    lieu: "Musée des Beaux-Arts",
    offsetDays: 14, time: "15h00",
    info: "Tous niveaux bienvenus",
    places: 8,
    inscrits: 4,
    organisateur: "Sophie T.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Elodie", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Florian", genre: "H" }, { name: "Manon", genre: "F" }, { name: "Elodie", genre: "F" }],
  },
  {
    id: 139,
    title: "Cours de pilates du soir",
    category: "bienetre",
    ville: "varces",
    lieu: "Jardin partagé",
    offsetDays: 7, time: "9h30",
    places: 12,
    inscrits: 9,
    organisateur: "Nadia U.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Pauline", genre: "F" }, { name: "Julien", genre: "H" }, { name: "Vincent", genre: "H" }],
  },
  {
    id: 140,
    title: "Tournoi de mölkky au parc",
    category: "jeux",
    ville: "vif",
    lieu: "Café des jeux",
    offsetDays: 38, time: "19h00",
    info: "Ouvert à tous les parents du quartier",
    places: 18,
    inscrits: 9,
    organisateur: "Kevin N.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Pauline", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Marc", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Nicolas", genre: "H" }, { name: "Antoine", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Amandine", genre: "F" }],
  },
  {
    id: 141,
    title: "Café-discussion du matin",
    category: "cafe",
    ville: "lyon",
    lieu: "Café des Arts",
    offsetDays: 2, time: "11h00",
    places: 10,
    inscrits: 6,
    organisateur: "Hugo C.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Mathieu", genre: "H" }, { name: "Nicolas", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Nadia", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Alice", genre: "F" }],
  },
  {
    id: 142,
    title: "Marche nordique matinale",
    category: "sport",
    ville: "chambery",
    lieu: "City stade",
    offsetDays: 47, time: "19h00",
    info: "Ouvert à tous les parents du quartier",
    places: 20,
    inscrits: 11,
    organisateur: "Antoine D.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Antoine", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Amandine", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Rachid", genre: "H" }, { name: "Fanny", genre: "F" }, { name: "Pauline", genre: "F" }],
  },
  {
    id: 143,
    title: "Ciné-club entre parents",
    category: "culture",
    ville: "annecy",
    lieu: "Médiathèque centrale",
    offsetDays: 48, time: "19h30",
    info: "Tous niveaux bienvenus",
    places: 19,
    inscrits: 10,
    organisateur: "Adrien B.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Guillaume", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Kevin", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Manon", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Maxime", genre: "H" }, { name: "Aurélie", genre: "F" }, { name: "Emma", genre: "F" }],
  },
  {
    id: 144,
    title: "Sophrologie en groupe",
    category: "bienetre",
    ville: "valence",
    lieu: "Parc des Tilleuls",
    offsetDays: 29, time: "9h30",
    info: "Ouvert à tous les parents du quartier",
    places: 11,
    inscrits: 6,
    organisateur: "Karim D.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Karim", genre: "H" }, { name: "Benjamin", genre: "H" }, { name: "Elodie", genre: "F" }, { name: "Charlotte", genre: "F" }, { name: "Florian", genre: "H" }, { name: "Marc", genre: "H" }, { name: "Laura", genre: "F" }, { name: "Sarah", genre: "F" }, { name: "Aurélie", genre: "F" }, { name: "Amandine", genre: "F" }, { name: "Thomas", genre: "H" }],
  },
  {
    id: 145,
    title: "Après-midi jeux de cartes",
    category: "jeux",
    ville: "paris",
    lieu: "Maison des associations",
    offsetDays: 0, time: "18h00",
    info: "Ouvert à tous les parents du quartier",
    places: 12,
    inscrits: 3,
    organisateur: "Marion D.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Paul", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Aurélie", genre: "F" }],
  },
  {
    id: 146,
    title: "Café-discussion du matin",
    category: "cafe",
    ville: "grenoble",
    lieu: "Boulangerie du centre",
    offsetDays: 29, time: "18h00",
    info: "Chacun amène quelque chose à partager",
    places: 8,
    inscrits: 5,
    organisateur: "Emma V.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Antoine", genre: "H" }, { name: "Kevin", genre: "H" }, { name: "Céline", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Sarah", genre: "F" }],
  },
  {
    id: 147,
    title: "Partie de tennis amicale",
    category: "sport",
    ville: "varces",
    lieu: "City stade",
    offsetDays: 42, time: "17h00",
    info: "Ouvert à tous les parents du quartier",
    places: 19,
    inscrits: 6,
    organisateur: "Antoine T.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Laura", genre: "F" }, { name: "Manon", genre: "F" }, { name: "David", genre: "H" }, { name: "David", genre: "H" }, { name: "Kevin", genre: "H" }, { name: "Aurélie", genre: "F" }, { name: "Romain", genre: "H" }, { name: "Nadia", genre: "F" }],
  },
  {
    id: 148,
    title: "Après-midi musée",
    category: "culture",
    ville: "vif",
    lieu: "Médiathèque centrale",
    offsetDays: 8, time: "18h00",
    info: "Pendant que les enfants sont à l'école",
    places: 15,
    inscrits: 7,
    organisateur: "Yasmine Q.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Karim", genre: "H" }, { name: "Kevin", genre: "H" }, { name: "Paul", genre: "H" }, { name: "Julie", genre: "F" }, { name: "Emma", genre: "F" }, { name: "Maxime", genre: "H" }, { name: "Benjamin", genre: "H" }, { name: "Manon", genre: "F" }, { name: "Florian", genre: "H" }, { name: "Marc", genre: "H" }, { name: "David", genre: "H" }],
  },
  {
    id: 149,
    title: "Cours de pilates du soir",
    category: "bienetre",
    ville: "lyon",
    lieu: "Salle municipale",
    offsetDays: 47, time: "9h30",
    info: "Tous niveaux bienvenus",
    places: 12,
    inscrits: 3,
    organisateur: "Yasmine Q.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Marc", genre: "H" }, { name: "Elodie", genre: "F" }, { name: "Charlotte", genre: "F" }, { name: "Camille", genre: "F" }, { name: "Mathieu", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Fanny", genre: "F" }],
  },
  {
    id: 150,
    title: "Tournoi de mölkky au parc",
    category: "jeux",
    ville: "chambery",
    lieu: "Café des jeux",
    offsetDays: 39, time: "19h30",
    info: "Tous niveaux bienvenus",
    places: 9,
    inscrits: 9,
    organisateur: "Benjamin E.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Guillaume", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Guillaume", genre: "H" }, { name: "Benjamin", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Mathieu", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Guillaume", genre: "H" }, { name: "Nicolas", genre: "H" }, { name: "Florian", genre: "H" }],
  },
  {
    id: 151,
    title: "Café des parents du quartier",
    category: "cafe",
    ville: "annecy",
    lieu: "Boulangerie du centre",
    offsetDays: 24, time: "19h00",
    info: "Pendant que les enfants sont à l'école",
    places: 11,
    inscrits: 11,
    organisateur: "Pauline K.",
    desc: "Un moment convivial entre parents pour souffler, échanger des bons plans et faire connaissance, autour d'un café.",
    participants: [{ name: "Pauline", genre: "F" }, { name: "Marc", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "David", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Yasmine", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 152,
    title: "Marche nordique matinale",
    category: "sport",
    ville: "valence",
    lieu: "Piste cyclable du Lac",
    offsetDays: 2, time: "19h00",
    info: "Venez comme vous êtes",
    places: 11,
    inscrits: 4,
    organisateur: "Alice K.",
    desc: "Une sortie sportive à allure tranquille, tous niveaux bienvenus, pour se dépenser entre adultes du quartier.",
    participants: [{ name: "Nadia", genre: "F" }, { name: "Alexandre", genre: "H" }, { name: "Antoine", genre: "H" }, { name: "Antoine", genre: "H" }, { name: "Florian", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Maxime", genre: "H" }, { name: "Guillaume", genre: "H" }, { name: "Paul", genre: "H" }],
  },
  {
    id: 153,
    title: "Sortie théâtre entre adultes",
    category: "culture",
    ville: "paris",
    lieu: "Centre culturel",
    offsetDays: 54, time: "18h00",
    info: "Venez comme vous êtes",
    places: 11,
    inscrits: 3,
    organisateur: "Thomas A.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter de tout et de rien.",
    participants: [{ name: "Charlotte", genre: "F" }, { name: "Antoine", genre: "H" }, { name: "Alexandre", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Amandine", genre: "F" }, { name: "Benjamin", genre: "H" }, { name: "Amandine", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Guillaume", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Vincent", genre: "H" }],
  },
  {
    id: 154,
    title: "Séance de méditation collective",
    category: "bienetre",
    ville: "grenoble",
    lieu: "Parc des Tilleuls",
    offsetDays: 2, time: "14h00",
    info: "Chacun amène quelque chose à partager",
    places: 13,
    inscrits: 3,
    organisateur: "Yasmine H.",
    desc: "Une heure de bien-être animée par une intervenante du quartier, ouverte à tous les niveaux.",
    participants: [{ name: "Charlotte", genre: "F" }, { name: "Benjamin", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Rachid", genre: "H" }],
  },
  {
    id: 155,
    title: "Soirée quiz entre voisins",
    category: "jeux",
    ville: "varces",
    lieu: "Ludothèque municipale",
    offsetDays: 2, time: "20h00",
    info: "Tous niveaux bienvenus",
    places: 11,
    inscrits: 5,
    organisateur: "Antoine Q.",
    desc: "Une soirée détente entre parents, sans les enfants, autour de jeux et d'un apéro partagé.",
    participants: [{ name: "Charlotte", genre: "F" }, { name: "Alexandre", genre: "H" }, { name: "Julie", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Guillaume", genre: "H" }, { name: "Yasmine", genre: "F" }, { name: "Rachid", genre: "H" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 160,
    title: "Café des générations : parents et aînés du quartier",
    category: "cafe",
    ville: "grenoble",
    lieu: "Foyer des aînés",
    offsetDays: 5, time: "10h00",
    info: "Ouvert aux parents et aux retraités du quartier",
    places: 16,
    inscrits: 7,
    organisateur: "Foyer des aînés",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux parents et aux aînés du quartier",
    desc: "Un café convivial où parents et retraités du quartier se retrouvent pour échanger, sans thème imposé — juste l'envie de se connaître entre générations.",
    participants: [
      { name: "Sophie", genre: "F" }, { name: "Bernard", genre: "H" }, { name: "Karim", genre: "H" },
      { name: "Jacqueline", genre: "F" }, { name: "Fanny", genre: "F" }, { name: "Robert", genre: "H" },
    ],
  },
];

const TEEN_MEETUPS = [
  {
    id: 201,
    title: "Tournoi FIFA à la médiathèque",
    category: "jeuxvideo",
    ville: "valence",
    lieu: "Médiathèque - espace jeunesse",
    offsetDays: 2, time: "14h00",
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
    offsetDays: 5, time: "15h00",
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
    offsetDays: 6, time: "16h30",
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
    offsetDays: 9, time: "14h00",
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
    offsetDays: 12, time: "17h00",
    info: "12-17 ans · encadré par un professeur",
    places: 10,
    inscrits: 5,
    organisateur: "Conservatoire",
    desc: "Séance ouverte pour découvrir ou rejoindre le groupe des ados du conservatoire, encadrée par un professeur.",
    participants: ["Gabriel", "Anna", "Ethan", "Juliette", "Oscar"],
  },
  {
    id: 206,
    title: "Coup de pouce numérique pour les aînés",
    category: "creatif",
    ville: "vif",
    lieu: "Foyer des aînés",
    offsetDays: 3, time: "14h00",
    info: "12-17 ans · en binôme avec les aînés du quartier",
    places: 10,
    inscrits: 5,
    organisateur: "Espace jeunesse",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux jeunes et aux aînés du quartier",
    desc: "Viens aider des aînés du quartier à prendre en main leur smartphone ou leur tablette, dans une ambiance détendue et sans jugement.",
    participants: ["Lina", "Malo", "Yanis", "Chloé"],
  },
];

const SENIOR_MEETUPS = [
  {
    id: 301,
    title: "Petit-déjeuner convivial",
    category: "cafe",
    ville: "grenoble",
    lieu: "Foyer des aînés",
    offsetDays: 25, time: "9h00",
    info: "Encadré par un bénévole de l'association",
    places: 7,
    inscrits: 6,
    organisateur: "Danielle M.",
    desc: "Un moment convivial entre retraités pour échanger, papoter et faire connaissance, autour d'un café.",
    participants: [{ name: "Gérard", genre: "H" }, { name: "Bernadette", genre: "F" }, { name: "Danielle", genre: "F" }],
  },
  {
    id: 302,
    title: "Marche santé matinale",
    category: "marche",
    ville: "varces",
    lieu: "City stade",
    offsetDays: 27, time: "9h00",
    places: 15,
    inscrits: 3,
    organisateur: "Yvette W.",
    desc: "Une marche à allure tranquille, accessible à tous, pour se maintenir en forme en bonne compagnie.",
    participants: [{ name: "Claude", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Claude", genre: "H" }, { name: "Suzanne", genre: "F" }],
  },
  {
    id: 303,
    title: "Initiation smartphone et tablette",
    category: "ateliers",
    ville: "vif",
    lieu: "Médiathèque centrale",
    offsetDays: 37, time: "10h30",
    info: "Encadré par un bénévole de l'association",
    places: 11,
    inscrits: 3,
    organisateur: "Michel C.",
    desc: "Un atelier animé par un bénévole, dans une ambiance détendue, pour apprendre à son rythme.",
    participants: [{ name: "Alain", genre: "H" }, { name: "Daniel", genre: "H" }, { name: "Alain", genre: "H" }],
  },
  {
    id: 304,
    title: "Ciné-club de l'après-midi",
    category: "culture",
    ville: "lyon",
    lieu: "Centre culturel",
    offsetDays: 23, time: "14h00",
    info: "Accessible à tous, rythme tranquille",
    places: 9,
    inscrits: 4,
    organisateur: "Alain H.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter tranquillement.",
    participants: [{ name: "Yvette", genre: "F" }, { name: "Marcel", genre: "H" }, { name: "Nicole", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Daniel", genre: "H" }],
  },
  {
    id: 305,
    title: "Atelier jardinage partagé",
    category: "jardinage",
    ville: "chambery",
    lieu: "Jardin partagé",
    offsetDays: 35, time: "14h30",
    info: "Encadré par un bénévole de l'association",
    places: 11,
    inscrits: 7,
    organisateur: "André R.",
    desc: "Un moment convivial au grand air, pour jardiner ensemble et échanger conseils et boutures.",
    participants: [{ name: "Suzanne", genre: "F" }, { name: "Colette", genre: "F" }, { name: "Annie", genre: "F" }, { name: "Ginette", genre: "F" }, { name: "Henri", genre: "H" }, { name: "Henri", genre: "H" }, { name: "André", genre: "H" }, { name: "Pierre", genre: "H" }, { name: "Bernard", genre: "H" }],
  },
  {
    id: 306,
    title: "Café-discussion du matin",
    category: "cafe",
    ville: "annecy",
    lieu: "Café des Arts",
    offsetDays: 10, time: "9h30",
    info: "Venez comme vous êtes",
    places: 13,
    inscrits: 2,
    organisateur: "Bernadette K.",
    desc: "Un moment convivial entre retraités pour échanger, papoter et faire connaissance, autour d'un café.",
    participants: [{ name: "Bernadette", genre: "F" }, { name: "Alain", genre: "H" }, { name: "Yvette", genre: "F" }, { name: "Colette", genre: "F" }, { name: "Jacques", genre: "H" }, { name: "Michèle", genre: "F" }, { name: "Bernadette", genre: "F" }, { name: "Henri", genre: "H" }],
  },
  {
    id: 307,
    title: "Promenade en bord de rivière",
    category: "marche",
    ville: "valence",
    lieu: "Parc des Tilleuls",
    offsetDays: 9, time: "9h30",
    info: "Accessible à tous, rythme tranquille",
    places: 8,
    inscrits: 3,
    organisateur: "Yvette H.",
    desc: "Une marche à allure tranquille, accessible à tous, pour se maintenir en forme en bonne compagnie.",
    participants: [{ name: "Michel", genre: "H" }, { name: "Jacqueline", genre: "F" }, { name: "Michèle", genre: "F" }, { name: "Nicole", genre: "F" }, { name: "Françoise", genre: "F" }, { name: "Roger", genre: "H" }],
  },
  {
    id: 308,
    title: "Café numérique entre seniors",
    category: "ateliers",
    ville: "paris",
    lieu: "Médiathèque centrale",
    offsetDays: 29, time: "15h00",
    info: "Chacun amène quelque chose à partager",
    places: 12,
    inscrits: 8,
    organisateur: "Denise D.",
    desc: "Un atelier animé par un bénévole, dans une ambiance détendue, pour apprendre à son rythme.",
    participants: [{ name: "Danielle", genre: "F" }, { name: "Danielle", genre: "F" }, { name: "Monique", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Nicole", genre: "F" }, { name: "Monique", genre: "F" }, { name: "Claude", genre: "H" }, { name: "Suzanne", genre: "F" }],
  },
  {
    id: 309,
    title: "Sortie théâtre entre aînés",
    category: "culture",
    ville: "grenoble",
    lieu: "Cinéma Le Rex",
    offsetDays: 24, time: "10h00",
    info: "Ouvert à tous les retraités du quartier",
    places: 16,
    inscrits: 6,
    organisateur: "Ginette V.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter tranquillement.",
    participants: [{ name: "Suzanne", genre: "F" }, { name: "Yvette", genre: "F" }, { name: "Colette", genre: "F" }, { name: "Monique", genre: "F" }, { name: "Marcel", genre: "H" }, { name: "Suzanne", genre: "F" }],
  },
  {
    id: 310,
    title: "Après-midi au jardin communal",
    category: "jardinage",
    ville: "varces",
    lieu: "Square des Tilleuls",
    offsetDays: 1, time: "10h30",
    info: "Accessible à tous, rythme tranquille",
    places: 14,
    inscrits: 7,
    organisateur: "Colette T.",
    desc: "Un moment convivial au grand air, pour jardiner ensemble et échanger conseils et boutures.",
    participants: [{ name: "Henri", genre: "H" }, { name: "Marcel", genre: "H" }, { name: "Roger", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Danielle", genre: "F" }, { name: "Serge", genre: "H" }, { name: "Henri", genre: "H" }, { name: "Denise", genre: "F" }, { name: "Serge", genre: "H" }],
  },
  {
    id: 311,
    title: "Brunch entre retraités",
    category: "cafe",
    ville: "vif",
    lieu: "Foyer des aînés",
    offsetDays: 25, time: "10h30",
    info: "Accessible à tous, rythme tranquille",
    places: 9,
    inscrits: 9,
    organisateur: "Ginette A.",
    desc: "Un moment convivial entre retraités pour échanger, papoter et faire connaissance, autour d'un café.",
    participants: [{ name: "Colette", genre: "F" }, { name: "Nicole", genre: "F" }, { name: "Alain", genre: "H" }, { name: "Marcel", genre: "H" }, { name: "Jean", genre: "H" }, { name: "Monique", genre: "F" }, { name: "Danielle", genre: "F" }, { name: "Yvette", genre: "F" }, { name: "Pierre", genre: "H" }],
  },
  {
    id: 312,
    title: "Sortie marche entre voisins",
    category: "marche",
    ville: "lyon",
    lieu: "Bords du canal",
    offsetDays: 30, time: "14h30",
    info: "Chacun amène quelque chose à partager",
    places: 18,
    inscrits: 4,
    organisateur: "Marcel D.",
    desc: "Une marche à allure tranquille, accessible à tous, pour se maintenir en forme en bonne compagnie.",
    participants: [{ name: "Gérard", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Annie", genre: "F" }, { name: "Denise", genre: "F" }, { name: "Marcel", genre: "H" }, { name: "Bernadette", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Bernard", genre: "H" }],
  },
  {
    id: 313,
    title: "Initiation smartphone et tablette",
    category: "ateliers",
    ville: "chambery",
    lieu: "Maison des associations",
    offsetDays: 29, time: "10h00",
    places: 15,
    inscrits: 15,
    organisateur: "André R.",
    desc: "Un atelier animé par un bénévole, dans une ambiance détendue, pour apprendre à son rythme.",
    participants: [{ name: "Michèle", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Marcel", genre: "H" }, { name: "Roger", genre: "H" }, { name: "Michel", genre: "H" }],
  },
  {
    id: 314,
    title: "Après-midi musée",
    category: "culture",
    ville: "annecy",
    lieu: "Théâtre municipal",
    offsetDays: 13, time: "9h00",
    info: "Venez comme vous êtes",
    places: 10,
    inscrits: 5,
    organisateur: "Nicole S.",
    desc: "On se retrouve pour visiter ensemble puis prendre un verre juste à côté et discuter tranquillement.",
    participants: [{ name: "André", genre: "H" }, { name: "Jacques", genre: "H" }, { name: "Christiane", genre: "F" }, { name: "Pierre", genre: "H" }, { name: "Nicole", genre: "F" }, { name: "Roger", genre: "H" }, { name: "Christiane", genre: "F" }, { name: "Michel", genre: "H" }, { name: "Roger", genre: "H" }],
  },
  {
    id: 315,
    title: "Entretien du jardin partagé",
    category: "jardinage",
    ville: "valence",
    lieu: "Jardin partagé",
    offsetDays: 28, time: "10h00",
    info: "Venez comme vous êtes",
    places: 15,
    inscrits: 2,
    organisateur: "Claude E.",
    desc: "Un moment convivial au grand air, pour jardiner ensemble et échanger conseils et boutures.",
    participants: [{ name: "Ginette", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Michèle", genre: "F" }, { name: "Alain", genre: "H" }],
  },
  {
    id: 316,
    title: "Racontage d'histoires aux enfants de la médiathèque",
    category: "ateliers",
    ville: "grenoble",
    lieu: "Médiathèque - espace jeunesse",
    offsetDays: 6, time: "15h00",
    info: "En binôme avec les enfants du quartier",
    places: 15,
    inscrits: 6,
    organisateur: "Médiathèque",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux enfants et aux aînés du quartier",
    desc: "Racontez vos histoires et légendes locales aux enfants du quartier, dans une ambiance chaleureuse. Un moment de transmission entre générations.",
    participants: [
      { name: "Jacqueline", genre: "F" }, { name: "Bernard", genre: "H" }, { name: "Monique", genre: "F" },
      { name: "Robert", genre: "H" }, { name: "Colette", genre: "F" }, { name: "André", genre: "H" },
    ],
  },
  {
    id: 317,
    title: "Initiation smartphone avec les jeunes du quartier",
    category: "ateliers",
    ville: "vif",
    lieu: "Foyer des aînés",
    offsetDays: 3, time: "14h00",
    info: "Encadré par des jeunes bénévoles du quartier",
    places: 10,
    inscrits: 5,
    organisateur: "Espace jeunesse",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux jeunes et aux aînés du quartier",
    desc: "Des jeunes du quartier viennent aider les aînés à prendre en main leur smartphone ou leur tablette, dans une ambiance détendue et sans jugement.",
    participants: [
      { name: "Danielle", genre: "F" }, { name: "Gérard", genre: "H" }, { name: "Françoise", genre: "F" },
      { name: "Michel", genre: "H" }, { name: "Simone", genre: "F" },
    ],
  },
  {
    id: 318,
    title: "Café des générations : aînés et parents du quartier",
    category: "cafe",
    ville: "grenoble",
    lieu: "Foyer des aînés",
    offsetDays: 5, time: "10h00",
    info: "Ouvert aux retraités et aux parents du quartier",
    places: 16,
    inscrits: 6,
    organisateur: "Foyer des aînés",
    intergen: true,
    intergenNote: "Sortie intergénérationnelle · ouverte aux parents et aux aînés du quartier",
    desc: "Un café convivial où retraités et parents du quartier se retrouvent pour échanger, sans thème imposé — juste l'envie de se connaître entre générations.",
    participants: [
      { name: "Jacqueline", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Monique", genre: "F" },
      { name: "André", genre: "H" }, { name: "Colette", genre: "F" },
    ],
  },
];


const ASSO_EVENTS = [
  {
    id: 401,
    title: "Cérémonie commémorative",
    category: "mairie",
    ville: "grenoble",
    lieu: "Place de la mairie",
    offsetDays: 26, time: "20h30",
    info: "Ouvert à tous, sans inscription",
    places: 56,
    inscrits: 35,
    organisateur: "Cabinet du maire",
    desc: "Un rendez-vous organisé par la mairie, ouvert à tous les habitants de la commune, sans inscription préalable.",
    participants: [{ name: "Paul", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Françoise", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Claire", genre: "F" }, { name: "Bernard", genre: "H" }, { name: "Paul", genre: "H" }, { name: "Monique", genre: "F" }],
  },
  {
    id: 402,
    title: "Gala de fin de saison",
    category: "sport",
    ville: "varces",
    lieu: "City stade",
    offsetDays: 9, time: "10h00",
    info: "Entrée libre et gratuite",
    places: 35,
    inscrits: 30,
    organisateur: "AS Varces",
    desc: "Une journée sportive organisée par le club local, ouverte à tous, petits et grands, licenciés ou non.",
    participants: [{ name: "Nadia", genre: "F" }, { name: "Françoise", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Sophie", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Thomas", genre: "H" }],
  },
  {
    id: 403,
    title: "Exposition des artistes locaux",
    category: "culture",
    ville: "vif",
    lieu: "Théâtre municipal",
    offsetDays: 32, time: "16h00",
    info: "Accessible aux personnes à mobilité réduite",
    places: 60,
    inscrits: 36,
    organisateur: "Les Amis du Patrimoine",
    desc: "Un temps fort culturel organisé avec les associations du territoire, gratuit et ouvert à tous.",
    participants: [{ name: "Monique", genre: "F" }, { name: "Marion", genre: "F" }, { name: "Monique", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Françoise", genre: "F" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 404,
    title: "Vide-grenier solidaire",
    category: "solidaire",
    ville: "lyon",
    lieu: "Centre social",
    offsetDays: 15, time: "10h00",
    info: "Ouvert à tous, sans inscription",
    places: 41,
    inscrits: 9,
    organisateur: "Croix-Rouge locale",
    desc: "Une action solidaire portée par une association du quartier, toute aide ou présence est bienvenue.",
    participants: [{ name: "Jacqueline", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Monique", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Vincent", genre: "H" }],
  },
  {
    id: 405,
    title: "Fête de quartier",
    category: "fete",
    ville: "chambery",
    lieu: "Parc municipal",
    offsetDays: 16, time: "20h30",
    info: "Accessible aux personnes à mobilité réduite",
    places: 57,
    inscrits: 7,
    organisateur: "Comité des fêtes de Chambéry",
    desc: "Un rendez-vous convivial et festif ouvert à tous les habitants, petits et grands.",
    participants: [{ name: "Monique", genre: "F" }, { name: "Michel", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Françoise", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Sophie", genre: "F" }],
  },
  {
    id: 406,
    title: "Réunion publique de quartier",
    category: "mairie",
    ville: "annecy",
    lieu: "Salle du conseil",
    offsetDays: 38, time: "16h00",
    info: "Accessible aux personnes à mobilité réduite",
    places: 82,
    inscrits: 79,
    organisateur: "Service culture de la ville",
    desc: "Un rendez-vous organisé par la mairie, ouvert à tous les habitants de la commune, sans inscription préalable.",
    participants: [{ name: "Léa", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Françoise", genre: "F" }, { name: "Bernard", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Claire", genre: "F" }, { name: "Michel", genre: "H" }],
  },
  {
    id: 407,
    title: "Forum des associations sportives",
    category: "sport",
    ville: "valence",
    lieu: "Gymnase du centre",
    offsetDays: 25, time: "10h00",
    places: 43,
    inscrits: 6,
    organisateur: "AS Valence",
    desc: "Une journée sportive organisée par le club local, ouverte à tous, petits et grands, licenciés ou non.",
    participants: [{ name: "Robert", genre: "H" }, { name: "Julien", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Michel", genre: "H" }, { name: "Claire", genre: "F" }, { name: "Sarah", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Bernard", genre: "H" }],
  },
  {
    id: 408,
    title: "Lecture publique au jardin",
    category: "culture",
    ville: "paris",
    lieu: "Jardin public",
    offsetDays: 25, time: "20h00",
    info: "Buvette et restauration sur place",
    places: 42,
    inscrits: 19,
    organisateur: "Service culturel municipal",
    desc: "Un temps fort culturel organisé avec les associations du territoire, gratuit et ouvert à tous.",
    participants: [{ name: "Karim", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Julien", genre: "H" }, { name: "Paul", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Léa", genre: "F" }],
  },
  {
    id: 409,
    title: "Journée don du sang",
    category: "solidaire",
    ville: "grenoble",
    lieu: "Centre social",
    offsetDays: 4, time: "20h00",
    info: "Buvette et restauration sur place",
    places: 61,
    inscrits: 17,
    organisateur: "Les Restos du Cœur",
    desc: "Une action solidaire portée par une association du quartier, toute aide ou présence est bienvenue.",
    participants: [{ name: "Claire", genre: "F" }, { name: "Monique", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Vincent", genre: "H" }],
  },
  {
    id: 410,
    title: "Fête foraine annuelle",
    category: "fete",
    ville: "varces",
    lieu: "Esplanade",
    offsetDays: 24, time: "16h00",
    info: "Entrée libre et gratuite",
    places: 29,
    inscrits: 12,
    organisateur: "Mairie de Varces",
    desc: "Un rendez-vous convivial et festif ouvert à tous les habitants, petits et grands.",
    participants: [{ name: "Bernard", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Sophie", genre: "F" }],
  },
  {
    id: 411,
    title: "Inauguration du nouveau parc",
    category: "mairie",
    ville: "vif",
    lieu: "Place de la mairie",
    offsetDays: 31, time: "11h00",
    info: "Entrée libre et gratuite",
    places: 100,
    inscrits: 88,
    organisateur: "Service culture de la ville",
    desc: "Un rendez-vous organisé par la mairie, ouvert à tous les habitants de la commune, sans inscription préalable.",
    participants: [{ name: "Marion", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Vincent", genre: "H" }, { name: "Hugo", genre: "H" }],
  },
  {
    id: 412,
    title: "Gala de fin de saison",
    category: "sport",
    ville: "lyon",
    lieu: "Boulodrome municipal",
    offsetDays: 15, time: "18h00",
    info: "Buvette et restauration sur place",
    places: 83,
    inscrits: 54,
    organisateur: "Office municipal des sports",
    desc: "Une journée sportive organisée par le club local, ouverte à tous, petits et grands, licenciés ou non.",
    participants: [{ name: "Bernard", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Robert", genre: "H" }, { name: "Hugo", genre: "H" }, { name: "Vincent", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Karim", genre: "H" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 413,
    title: "Nuit des musées",
    category: "culture",
    ville: "chambery",
    lieu: "Conservatoire",
    offsetDays: 12, time: "14h00",
    info: "Buvette et restauration sur place",
    places: 30,
    inscrits: 5,
    organisateur: "Association culturelle locale",
    desc: "Un temps fort culturel organisé avec les associations du territoire, gratuit et ouvert à tous.",
    participants: [{ name: "Françoise", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Léa", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Claire", genre: "F" }, { name: "Claire", genre: "F" }, { name: "Camille", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Robert", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Nadia", genre: "F" }, { name: "Sarah", genre: "F" }],
  },
  {
    id: 414,
    title: "Journée don du sang",
    category: "solidaire",
    ville: "annecy",
    lieu: "Place du marché",
    offsetDays: 38, time: "18h00",
    info: "Ouvert à tous, sans inscription",
    places: 109,
    inscrits: 62,
    organisateur: "Comité de quartier",
    desc: "Une action solidaire portée par une association du quartier, toute aide ou présence est bienvenue.",
    participants: [{ name: "Michel", genre: "H" }, { name: "Camille", genre: "F" }, { name: "Nadia", genre: "F" }, { name: "Marc", genre: "H" }],
  },
  {
    id: 415,
    title: "Marché de Noël",
    category: "fete",
    ville: "valence",
    lieu: "Square des Tilleuls",
    offsetDays: 50, time: "16h00",
    info: "Buvette et restauration sur place",
    places: 87,
    inscrits: 11,
    organisateur: "Mairie de Valence",
    desc: "Un rendez-vous convivial et festif ouvert à tous les habitants, petits et grands.",
    participants: [{ name: "Sarah", genre: "F" }, { name: "Léa", genre: "F" }, { name: "Hugo", genre: "H" }, { name: "Bernard", genre: "H" }, { name: "Robert", genre: "H" }, { name: "Sophie", genre: "F" }, { name: "Marion", genre: "F" }],
  },
  {
    id: 416,
    title: "Permanence des élus",
    category: "mairie",
    ville: "paris",
    lieu: "Salle des mariages",
    offsetDays: 39, time: "18h00",
    info: "Ouvert à tous, sans inscription",
    places: 80,
    inscrits: 48,
    organisateur: "Cabinet du maire",
    desc: "Un rendez-vous organisé par la mairie, ouvert à tous les habitants de la commune, sans inscription préalable.",
    participants: [{ name: "Camille", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Robert", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Karim", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Jacqueline", genre: "F" }, { name: "Julien", genre: "H" }],
  },
  {
    id: 417,
    title: "Gala de fin de saison",
    category: "sport",
    ville: "grenoble",
    lieu: "Complexe sportif",
    offsetDays: 2, time: "10h00",
    info: "Animation prévue en cas de pluie",
    places: 49,
    inscrits: 27,
    organisateur: "Comité des fêtes",
    desc: "Une journée sportive organisée par le club local, ouverte à tous, petits et grands, licenciés ou non.",
    participants: [{ name: "Sophie", genre: "F" }, { name: "Paul", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Karim", genre: "H" }, { name: "Marc", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Françoise", genre: "F" }],
  },
  {
    id: 418,
    title: "Lecture publique au jardin",
    category: "culture",
    ville: "varces",
    lieu: "Centre culturel",
    offsetDays: 43, time: "9h00",
    info: "Animation prévue en cas de pluie",
    places: 47,
    inscrits: 46,
    organisateur: "Les Amis du Patrimoine",
    desc: "Un temps fort culturel organisé avec les associations du territoire, gratuit et ouvert à tous.",
    participants: [{ name: "Robert", genre: "H" }, { name: "Thomas", genre: "H" }, { name: "Marion", genre: "F" }, { name: "Marc", genre: "H" }, { name: "Nadia", genre: "F" }, { name: "Camille", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Michel", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Thomas", genre: "H" }, { name: "Sarah", genre: "F" }, { name: "Vincent", genre: "H" }],
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

// Accepte un participant sous forme de chaîne ("Julien") ou d'objet { name, genre }.
// En mode genderMode, la couleur vient du genre (constante quelle que soit l'annonce) ;
// sinon elle vient de la catégorie (comportement précédent, utilisé pour les ados).
function participantName(p) { return typeof p === "string" ? p : p.name; }

function PlainAvatar({ participant, color, size, overlap = false, genderMode = false }) {
  const name = participantName(participant);
  const avatarColor = genderMode && participant?.genre ? genreColor(participant.genre) : color;
  const label = genderMode && participant?.genre ? `${name} (${adultGenreLabel(participant.genre)})` : name;
  // Sans taille explicite : suit la variable CSS --pika-avatar-size (réduite sur petit écran via media query)
  const dim = size !== undefined ? `${size}px` : "var(--pika-avatar-size, 26px)";
  const fontSize = size !== undefined ? size * 0.42 : "calc(var(--pika-avatar-size, 26px) * 0.42)";
  return (
    <div
      title={label}
      style={{
        width: dim, height: dim, borderRadius: "50%", background: avatarColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800,
        fontSize, border: "2px solid #fff",
        marginLeft: overlap ? -8 : 0, flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Affiche autant d'avatars que la place le permet réellement (mesurée via ResizeObserver),
// avec un maximum de `max`, et un "…" explicite dès que ça ne rentre plus — plutôt qu'un
// nombre de bulles qui varie silencieusement selon la taille de l'écran.
function PlainParticipantsRow({ names, color, max = 8, genderMode = false }) {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(max);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined" || !names || names.length === 0) return;
    const AVATAR_SIZE = 26, STEP = 18, ELLIPSIS_WIDTH = 26;

    const compute = (width) => {
      if (names.length <= max) {
        // Tout tient dans le maximum autorisé : voir si ça rentre sans "…"
        const neededAll = AVATAR_SIZE + (names.length - 1) * STEP;
        if (neededAll <= width) return names.length;
      }
      // Cherche le plus grand nombre d'avatars + "…" qui rentre dans la largeur
      let n = Math.min(max, names.length);
      while (n > 1) {
        const needed = AVATAR_SIZE + (n - 1) * STEP + (n < names.length ? ELLIPSIS_WIDTH : 0);
        if (needed <= width) break;
        n -= 1;
      }
      return n;
    };

    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 0) setVisibleCount(compute(width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [names, max]);

  if (!names || names.length === 0) return null;
  const shown = names.slice(0, visibleCount);
  const extra = names.length - shown.length;

  return (
    <div ref={containerRef} style={{ display: "flex", alignItems: "center", marginTop: 2, minWidth: 0, flexShrink: 1, overflow: "hidden" }}>
      {shown.map((p, i) => (
        <PlainAvatar key={i} participant={p} color={color} overlap={i > 0} genderMode={genderMode} />
      ))}
      {extra > 0 && (
        <div style={{
          width: 26, height: 26, borderRadius: "50%", background: "#EDEAF4",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          color: COLORS.ink, fontFamily: "Nunito, sans-serif", fontWeight: 800,
          fontSize: 13, border: "2px solid #fff", marginLeft: -8,
        }}>
          …
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
        <Row icon={<CalendarDays size={14} color={COLORS.ink} />} text={displayDate(activity)} />
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
        padding: "9px 15px", borderRadius: 12, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13.5,
      }}
    >
      <Icon size={16} /> {label}
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
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "", category: "nature", lieu: "", dateStr: todayISO, timeStr: "10:00", age: "", places: 6, desc: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.lieu || !form.dateStr) return;
    onCreate({
      title: form.title, category: form.category, lieu: form.lieu, age: form.age, desc: form.desc,
      dateStr: form.dateStr, timeStr: form.timeStr, places: Number(form.places) || 1,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ title: "", category: "nature", lieu: "", dateStr: todayISO, timeStr: "10:00", age: "", places: 6, desc: "" });
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_date")}</label>
            <input type="date" min={todayISO} style={inputStyle} value={form.dateStr} onChange={set("dateStr")} />
          </div>
          <div>
            <label style={label}>{t("label_heure")}</label>
            <input type="time" style={inputStyle} value={form.timeStr} onChange={set("timeStr")} />
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
              <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485" }}>{displayDate(a)} · {a.lieu}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ joinedCount, validated, onToggleDemo, displayName, email, kids, onAddKid, onSignOut }) {
  const [addingKid, setAddingKid] = useState(false);
  const [kidName, setKidName] = useState("");
  const [kidAge, setKidAge] = useState("");
  const [kidGenre, setKidGenre] = useState("F");

  const submitKid = () => {
    if (!kidName.trim()) return;
    onAddKid({ name: kidName.trim(), age: Number(kidAge) || null, genre: kidGenre });
    setKidName(""); setKidAge(""); setKidGenre("F"); setAddingKid(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: COLORS.sky,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: "#fff",
        }}>
          {(displayName || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>{displayName}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF" }}>{email}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#6B6485" }}>{t("profile_outings_count", { n: joinedCount })}</div>
        </div>
      </div>

      <ValidationStatus validated={validated} onToggleDemo={onToggleDemo} />

      <SectionLabel>{t("profile_children")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {kids.map((k) => (
          <div key={k.id} style={{
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

        {addingKid ? (
          <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              autoFocus value={kidName} onChange={(e) => setKidName(e.target.value)}
              placeholder={t("placeholder_titre")}
              style={{ border: "2px solid #F0EADB", borderRadius: 10, padding: "8px 10px", fontFamily: "Nunito, sans-serif", fontSize: 13.5 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number" min={0} value={kidAge} onChange={(e) => setKidAge(e.target.value)}
                placeholder={t("profile_years")}
                style={{ flex: 1, border: "2px solid #F0EADB", borderRadius: 10, padding: "8px 10px", fontFamily: "Nunito, sans-serif", fontSize: 13.5 }}
              />
              <select
                value={kidGenre} onChange={(e) => setKidGenre(e.target.value)}
                style={{ flex: 1, border: "2px solid #F0EADB", borderRadius: 10, padding: "8px 10px", fontFamily: "Nunito, sans-serif", fontSize: 13.5 }}
              >
                <option value="F">{t("legend_girl")}</option>
                <option value="G">{t("legend_boy")}</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PillButton color={COLORS.grass} textColor="#fff" onClick={submitKid} style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}>
                {t("btn_publier")}
              </PillButton>
              <button onClick={() => setAddingKid(false)} style={{ background: "transparent", border: "none", color: "#9A93AF", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13 }}>
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingKid(true)} style={{
            border: `2px dashed #D8D2C2`, background: "transparent", borderRadius: 16, padding: "12px 16px",
            fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#9A93AF", cursor: "pointer", fontSize: 13.5,
          }}>
            {t("profile_add_child")}
          </button>
        )}
      </div>

      <SectionLabel>{t("profile_preferences")}</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {CATEGORIES.map((c) => (
          <span key={c.id} style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
            background: `${c.color}20`, color: c.color, padding: "7px 12px", borderRadius: 999,
          }}>
            {c.label}
          </span>
        ))}
      </div>

      <button onClick={onSignOut} style={{
        background: "transparent", border: "2px solid #F0EADB", borderRadius: 14,
        padding: "10px 16px", cursor: "pointer", fontFamily: "Nunito, sans-serif",
        fontWeight: 800, fontSize: 13, color: COLORS.coral, width: "100%",
      }}>
        {t("btn_sign_out")}
      </button>
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
        className="pika-location-btn"
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "#fff",
          border: "2px solid #F0EADB", borderRadius: 999, padding: "7px 12px 7px 10px",
          cursor: "pointer", fontFamily: "Nunito, sans-serif", maxWidth: "100%", overflow: "hidden",
        }}
      >
        <MapPin size={15} color={COLORS.coral} style={{ flexShrink: 0 }} />
        <span className="pika-location-label" style={{ fontWeight: 800, fontSize: 12.5, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {locationLabel(location)}
        </span>
        <ChevronDown size={14} color="#B7AF98" />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff",
            border: "2px solid #F0EADB", borderRadius: 16, padding: 12, width: 280,
            boxShadow: "0 12px 28px rgba(43,37,96,0.14)", zIndex: 9999,
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
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999,
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

        {activity.intergen && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "#FFF4DD",
            border: `2px solid ${COLORS.sun}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 18 }}>🤝</span>
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink }}>
              {activity.intergenNote || t("intergen_badge")}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(activity)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={displayDate(activity)} />
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
function CommunityCard({ item, categories, onOpen, favorite, onToggleFav, genderMode = false }) {
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
          transform: "rotate(-8deg)", boxShadow: "0 2px 6px rgba(43,37,96,0.12)", flexShrink: 0, position: "relative",
        }}>
          <Icon size={20} color={meta.color} strokeWidth={2.4} />
          {item.intergen && (
            <span
              title={t("intergen_badge")}
              style={{
                position: "absolute", top: -6, right: -6, fontSize: 14, lineHeight: 1,
                background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(43,37,96,0.3)",
              }}
            >
              🤝
            </span>
          )}
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
        <Row icon={<CalendarDays size={14} color={COLORS.ink} />} text={displayDate(item)} />
        {item.info && <Row icon={<Users size={14} color={COLORS.ink} />} text={item.info} />}
      </div>

      <PlainParticipantsRow names={item.participants} color={meta.color} genderMode={genderMode} />

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

// Ligne fine (quasi une seule ligne) pour une rencontre, utilisée dans l'affichage groupé par jour.
function NarrowMeetupRow({ item, categories, onOpen, favorite, onToggleFav, genderMode }) {
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const full = item.inscrits >= item.places;
  return (
    <div
      onClick={() => onOpen(item)}
      style={{
        display: "flex", alignItems: "center", gap: 10, background: "#fff",
        border: "2px solid #F0EADB", borderRadius: 14, padding: "9px 12px", cursor: "pointer",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: "50%", border: `2px dashed ${meta.color}`,
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        position: "relative",
      }}>
        <Icon size={15} color={meta.color} strokeWidth={2.4} />
        {item.intergen && (
          <span
            title={t("intergen_badge")}
            style={{
              position: "absolute", top: -4, right: -4, fontSize: 11, lineHeight: 1,
              background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(43,37,96,0.3)",
            }}
          >
            🤝
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: "15ch" }}>
        <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14.5, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", marginTop: 3 }}>
          <span style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 800, color: COLORS.ink, flexShrink: 0,
            background: COLORS.sun, padding: "2px 7px", borderRadius: 8, fontSize: 11.5,
          }}>
            {item.time ? item.time : displayDate(item)}
          </span>
          <span style={{ fontFamily: "Nunito, sans-serif", color: "#8A8399", overflow: "hidden", textOverflow: "ellipsis" }}>
            {lieuAvecVille(item)}
          </span>
        </div>
      </div>

      <PlainParticipantsRow names={item.participants} color={meta.color} max={8} genderMode={genderMode} />

      <span style={{
        fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0,
        color: full ? COLORS.coral : COLORS.grass,
      }}>
        {item.inscrits}/{item.places}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}
        aria-label={t("fav_aria")}
      >
        <Heart size={16} color={favorite ? COLORS.coral : "#D8D2C2"} fill={favorite ? COLORS.coral : "none"} strokeWidth={2.2} />
      </button>
    </div>
  );
}

// Regroupe les rencontres par jour (Aujourd'hui, Demain, Après-demain, puis "jeudi 6 septembre"…)
// et les affiche comme une liste de sections dépliables.
function DayAccordion({ items, categories, onOpen, favorites, onToggleFav, genderMode }) {
  const groups = useMemo(() => {
    const byOffset = {};
    items.forEach((it) => {
      const key = it.offsetDays !== undefined ? it.offsetDays : "autre";
      if (!byOffset[key]) byOffset[key] = [];
      byOffset[key].push(it);
    });
    const keys = Object.keys(byOffset).sort((a, b) => {
      if (a === "autre") return 1;
      if (b === "autre") return -1;
      return Number(a) - Number(b);
    });
    return keys.map((k) => ({
      key: k,
      label: k === "autre" ? item_autre_label() : relativeDayLabel(Number(k)),
      items: byOffset[k],
    }));
  }, [items]);

  const [closed, setClosed] = useState({});
  const toggle = (key) => setClosed((c) => ({ ...c, [key]: !c[key] }));

  if (groups.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((g) => (
        <div key={g.key}>
          <button
            onClick={() => toggle(g.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none",
              border: "none", cursor: "pointer", padding: "4px 2px 8px",
            }}
          >
            <ChevronDown size={15} color="#B7AF98" style={{ transform: closed[g.key] ? "rotate(-90deg)" : "none", transition: "transform .15s ease" }} />
            <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15.5, color: COLORS.ink, textTransform: "capitalize" }}>
              {g.label}
            </span>
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, color: "#B7AF98" }}>
              · {g.items.length}
            </span>
          </button>
          {!closed[g.key] && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map((item) => (
                <NarrowMeetupRow
                  key={item.id} item={item} categories={categories} onOpen={onOpen}
                  favorite={favorites.includes(item.id)} onToggleFav={onToggleFav} genderMode={genderMode}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function item_autre_label() { return t("chip_all"); }

function CommunityExplorer({ title, subtitle, categories, items, favorites, onToggleFav, onOpen, emptyText, location, layout = "grid", genderMode = false }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("tous");
  const [view, setView] = useState("liste");

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const matchCat = cat === "tous" || (cat === "intergen" ? a.intergen : a.category === cat);
      const matchLoc = matchLocation(a.ville, location);
      const matchQuery = a.title.toLowerCase().includes(query.toLowerCase()) || a.lieu.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchLoc && matchQuery;
    });
  }, [items, query, cat, location]);
  const hasIntergen = items.some((a) => a.intergen);

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
        {hasIntergen && (
          <Chip active={cat === "intergen"} onClick={() => setCat("intergen")} color={COLORS.coral}>
            🤝 {t("chip_intergen")}
          </Chip>
        )}
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>{c.label}</Chip>
        ))}
      </div>

      <ViewToggle view={view} onChange={setView} />

      {view === "carte" ? (
        <MapView items={filtered} categories={categories} onOpen={onOpen} location={location} />
      ) : layout === "days" ? (
        filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9A93AF", fontFamily: "Nunito, sans-serif" }}>
            {emptyText}
          </div>
        ) : (
          <DayAccordion items={filtered} categories={categories} onOpen={onOpen} favorites={favorites} onToggleFav={onToggleFav} genderMode={genderMode} />
        )
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {filtered.map((item) => (
            <CommunityCard key={item.id} item={item} categories={categories} onOpen={onOpen}
              favorite={favorites.includes(item.id)} onToggleFav={onToggleFav} genderMode={genderMode} />
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

function CommunityDetailModal({ item, categories, onClose, joined, onJoin, joinLabel, genderMode = false }) {
  if (!item) return null;
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const isJoined = joined.includes(item.id);
  const full = item.inscrits >= item.places && !isJoined;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999 }}>
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

        {item.intergen && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "#FFF4DD",
            border: `2px solid ${COLORS.sun}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 18 }}>🤝</span>
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink }}>
              {item.intergenNote || t("intergen_badge")}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(item)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={displayDate(item)} />
          <Row icon={<Users size={15} color={COLORS.ink} />} text={t("detail_participants", { a: item.inscrits, b: item.places, org: item.organisateur })} />
          {item.info && <Row icon={<Sparkles size={15} color={COLORS.ink} />} text={item.info} />}
        </div>

        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: "#5C5578", lineHeight: 1.6, marginBottom: 20 }}>
          {item.desc}
        </p>

        {item.participants && item.participants.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>{t("detail_already_registered")}</SectionLabel>
              {genderMode && (
                <div style={{ display: "flex", gap: 12 }}>
                  <Legend color={COLORS.girl} label={t("legend_femme")} />
                  <Legend color={COLORS.boy} label={t("legend_homme")} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {item.participants.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PlainAvatar participant={p} color={meta.color} size={30} genderMode={genderMode} />
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{participantName(p)}</span>
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

// ---------- Créer / lister ses propres rencontres (adultes, sans validation mairie) ----------
function CreateMeetup({ categories, onCreate }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "", category: categories[0].id, lieu: "", dateStr: todayISO, timeStr: "18:00", places: 8, info: "", desc: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.lieu || !form.dateStr) return;
    onCreate({
      title: form.title, category: form.category, lieu: form.lieu, info: form.info, desc: form.desc,
      dateStr: form.dateStr, timeStr: form.timeStr, places: Number(form.places) || 1,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ title: "", category: categories[0].id, lieu: "", dateStr: todayISO, timeStr: "18:00", places: 8, info: "", desc: "" });
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
        {t("create_meetup_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {t("create_meetup_subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={label}>{t("label_titre")}</label>
          <input style={inputStyle} placeholder={t("placeholder_titre")} value={form.title} onChange={set("title")} />
        </div>

        <div>
          <label style={label}>{t("label_categorie")}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => (
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_date")}</label>
            <input type="date" min={todayISO} style={inputStyle} value={form.dateStr} onChange={set("dateStr")} />
          </div>
          <div>
            <label style={label}>{t("label_heure")}</label>
            <input type="time" style={inputStyle} value={form.timeStr} onChange={set("timeStr")} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_info")}</label>
            <input style={inputStyle} placeholder={t("placeholder_info")} value={form.info} onChange={set("info")} />
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
            <Check size={16} /> {t("success_message_meetup")}
          </div>
        )}
      </div>
    </div>
  );
}

function MyMeetups({ items, joined, categories, onOpen }) {
  const mine = items.filter((it) => joined.includes(it.id));
  return (
    <div>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("my_meetups_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {t("my_meetups_subtitle")}
      </p>

      {mine.length === 0 ? (
        <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 20, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "#9A93AF", fontSize: 14, margin: 0 }}>
            {t("my_meetups_empty")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mine.map((item) => {
            const meta = metaFrom(categories, item.category);
            const Icon = meta.icon;
            return (
              <div key={item.id} onClick={() => onOpen(item)} style={{
                background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: 14,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", border: `2px dashed ${meta.color}`,
                  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={18} color={meta.color} strokeWidth={2.4} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15, color: COLORS.ink }}>{item.title}</div>
                  <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485" }}>{displayDate(item)} · {lieuAvecVille(item)}</div>
                </div>
                <ChevronRight size={18} color="#C7C0AE" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section "Adultes" avec sa propre sous-navigation Découvrir / Créer / Mes rencontres —
// entièrement indépendante de la validation mairie (réservée aux sorties Enfants/Ados).
// Onglet "Créer" fusionné : sortie enfant (si validé par la mairie) ou rencontre adulte (toujours).
// Pas d'onglet séparé pour les adultes — tout passe par les mêmes onglets Créer / Mes sorties.
function CreatePage({ parentValidated, onCreateKid, onCreateAdult }) {
  const [kind, setKind] = useState(parentValidated ? "enfant" : "adulte");

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {parentValidated && (
        <div style={{ display: "inline-flex", background: "#F0EADB", borderRadius: 14, padding: 4, marginBottom: 18 }}>
          {[
            { id: "enfant", label: t("create_toggle_child") },
            { id: "adulte", label: t("create_toggle_adult") },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setKind(opt.id)}
              style={{
                border: "none", cursor: "pointer",
                background: kind === opt.id ? COLORS.ink : "transparent",
                color: kind === opt.id ? "#fff" : "#6B6485",
                padding: "8px 16px", borderRadius: 12, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {kind === "enfant" && parentValidated ? (
        <CreateActivity onCreate={onCreateKid} />
      ) : (
        <>
          <CreateMeetup categories={ADULT_CATEGORIES} onCreate={onCreateAdult} />
          {!parentValidated && (
            <p style={{
              fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF",
              textAlign: "center", marginTop: 16,
            }}>
              {t("note_needs_validation")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Onglet "Mes sorties" fusionné : passeport enfants (si validé) + rencontres adultes (toujours).
function MesSortiesPage({ parentValidated, joined, activities, adultItems, joinedAdult, onOpenAdult }) {
  return (
    <div>
      {parentValidated && (
        <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: "2px solid #F0EADB" }}>
          <MyOutings joined={joined} activities={activities} />
        </div>
      )}
      <MyMeetups items={adultItems} joined={joinedAdult} categories={ADULT_CATEGORIES} onOpen={onOpenAdult} />
    </div>
  );
}

// ---------- Authentification ----------
function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "12px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff", marginBottom: 12,
  };

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name } },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      // onAuthStateChange (écouté dans le hook parent) prendra le relais automatiquement
    } catch (e) {
      setError(e?.message || t("auth_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: COLORS.cloud, minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Nunito, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap');
      `}</style>
      <PikaMascot size={56} rotate={-4} />
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "14px 0 4px", textAlign: "center" }}>
        {t("auth_title")}
      </h1>
      <p style={{ color: "#6B6485", fontSize: 14, textAlign: "center", margin: "0 0 22px", maxWidth: 320 }}>
        {t("auth_subtitle")}
      </p>

      <div style={{ width: "100%", maxWidth: 340 }}>
        {mode === "signup" && (
          <input style={inputStyle} placeholder={t("auth_name")} value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input style={inputStyle} type="email" placeholder={t("auth_email")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder={t("auth_password")} value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && (
          <div style={{ color: COLORS.coral, fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{error}</div>
        )}

        <PillButton color={COLORS.grass} textColor="#fff" onClick={submit} style={{ width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? t("auth_loading") : mode === "signup" ? t("auth_signup_btn") : t("auth_login_btn")}
        </PillButton>

        <button
          onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
          style={{
            display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
            color: "#6B6485", fontWeight: 700, fontSize: 13, marginTop: 16, cursor: "pointer",
          }}
        >
          {mode === "signup" ? t("auth_switch_to_login") : t("auth_switch_to_signup")}
        </button>
      </div>
    </div>
  );
}

// ---------- Hook central : authentification + données + actions Supabase ----------
// Tout ce qui parle à la base de données passe par ici. Le reste de l'app ne connaît
// que les tableaux d'items déjà "mis en forme" (mêmes champs qu'avant : offsetDays/time,
// participants, etc.) pour ne pas avoir à retoucher tous les composants d'affichage.
function usePikapikaData() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState({ displayName: "", parentValidated: false });
  const [kids, setKids] = useState([]);
  const [rows, setRows] = useState([]);
  const [regByActivity, setRegByActivity] = useState({});
  const [myRegs, setMyRegs] = useState(new Set());
  const [myFavs, setMyFavs] = useState(new Set());
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      const [profRes, kidsRes, actRes, allRegsRes, myRegsRes, favRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("kids").select("*").eq("parent_id", user.id),
        supabase.from("activities").select("*"),
        supabase.from("registrations").select("activity_id"),
        supabase.from("registrations").select("activity_id").eq("user_id", user.id),
        supabase.from("favorites").select("activity_id").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      if (profRes.data) setProfile({ displayName: profRes.data.display_name, parentValidated: profRes.data.parent_validated });
      setKids(kidsRes.data || []);
      setRows(actRes.data || []);
      const counts = {};
      (allRegsRes.data || []).forEach((r) => { counts[r.activity_id] = (counts[r.activity_id] || 0) + 1; });
      setRegByActivity(counts);
      setMyRegs(new Set((myRegsRes.data || []).map((r) => r.activity_id)));
      setMyFavs(new Set((favRes.data || []).map((r) => r.activity_id)));
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const mapRow = (row) => {
    const start = new Date(row.starts_at);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
    const offsetDays = Math.round((startDay - today) / 86400000);
    const time = `${String(start.getHours()).padStart(2, "0")}h${String(start.getMinutes()).padStart(2, "0")}`;
    return {
      id: row.id, title: row.title, category: row.category, ville: row.ville, lieu: row.lieu,
      offsetDays, time, age: row.age, info: row.info, places: row.places,
      inscrits: (row.demo_inscrits || 0) + (regByActivity[row.id] || 0),
      organisateur: row.organisateur, desc: row.description,
      intergen: row.intergen, intergenNote: row.intergen_note,
      participants: row.demo_participants || [],
    };
  };

  const bySpace = (space) => rows.filter((r) => r.space === space).map(mapRow);
  const activities = useMemo(() => bySpace("kids"), [rows, regByActivity]);
  const teenItems = useMemo(() => bySpace("teen"), [rows, regByActivity]);
  const adultItems = useMemo(() => bySpace("adult"), [rows, regByActivity]);
  const seniorItems = useMemo(() => bySpace("senior"), [rows, regByActivity]);
  const assoItems = useMemo(() => bySpace("asso"), [rows, regByActivity]);

  const idsIn = (items, set) => items.filter((it) => set.has(it.id)).map((it) => it.id);
  const favorites = useMemo(() => idsIn(activities, myFavs), [activities, myFavs]);
  const favTeen = useMemo(() => idsIn(teenItems, myFavs), [teenItems, myFavs]);
  const favAdult = useMemo(() => idsIn(adultItems, myFavs), [adultItems, myFavs]);
  const favSenior = useMemo(() => idsIn(seniorItems, myFavs), [seniorItems, myFavs]);
  const favAsso = useMemo(() => idsIn(assoItems, myFavs), [assoItems, myFavs]);
  const joined = useMemo(() => idsIn(activities, myRegs), [activities, myRegs]);
  const joinedTeen = useMemo(() => idsIn(teenItems, myRegs), [teenItems, myRegs]);
  const joinedAdult = useMemo(() => idsIn(adultItems, myRegs), [adultItems, myRegs]);
  const joinedSenior = useMemo(() => idsIn(seniorItems, myRegs), [seniorItems, myRegs]);
  const joinedAsso = useMemo(() => idsIn(assoItems, myRegs), [assoItems, myRegs]);

  const toggleFavGeneric = async (id) => {
    if (!user) return;
    if (myFavs.has(id)) {
      setMyFavs((s) => { const n = new Set(s); n.delete(id); return n; });
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("activity_id", id);
    } else {
      setMyFavs((s) => new Set(s).add(id));
      await supabase.from("favorites").insert({ user_id: user.id, activity_id: id });
    }
  };

  const joinGeneric = async (id) => {
    if (!user || myRegs.has(id)) return;
    setMyRegs((s) => new Set(s).add(id));
    setRegByActivity((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const { error } = await supabase.from("registrations").insert({ user_id: user.id, activity_id: id });
    if (error) console.error("Erreur inscription :", error);
  };

  const insertActivity = async (space, form) => {
    if (!user) return null;
    const starts_at = `${form.dateStr}T${form.timeStr}:00`;
    const newRow = {
      id: Date.now(), space, title: form.title, category: form.category, ville: null, lieu: form.lieu,
      starts_at, age: form.age || null, info: form.info || null, places: form.places,
      demo_inscrits: 0, organisateur: profile.displayName || t("you_organizer"),
      description: form.desc || "", intergen: false, intergen_note: null,
      demo_participants: [], created_by: user.id,
    };
    const { data, error } = await supabase.from("activities").insert(newRow).select().single();
    if (error) { console.error("Erreur création :", error); return null; }
    setRows((r) => [data, ...r]);
    await joinGeneric(data.id);
    return data.id;
  };

  const toggleParentValidated = async () => {
    if (!user) return;
    const next = !profile.parentValidated;
    setProfile((p) => ({ ...p, parentValidated: next }));
    const { error } = await supabase.from("profiles").update({ parent_validated: next }).eq("id", user.id);
    if (error) console.error("Erreur validation :", error);
  };

  const addKid = async ({ name, age, genre }) => {
    if (!user) return;
    const { data, error } = await supabase.from("kids").insert({ parent_id: user.id, name, age, genre }).select().single();
    if (error) { console.error("Erreur ajout enfant :", error); return; }
    setKids((k) => [...k, data]);
  };

  return {
    user, authLoading, dataLoading,
    displayName: profile.displayName, email: user?.email || "", parentValidated: profile.parentValidated,
    kids,
    activities, teenItems, adultItems, seniorItems, assoItems,
    favorites, favTeen, favAdult, favSenior, favAsso,
    joined, joinedTeen, joinedAdult, joinedSenior, joinedAsso,
    toggleFav: toggleFavGeneric,
    join: joinGeneric,
    toggleFavCommunity: (_kind, id) => toggleFavGeneric(id),
    joinCommunity: (_kind, id) => joinGeneric(id),
    createActivity: (form) => insertActivity("kids", form),
    createAdultMeetup: (form) => insertActivity("adult", form),
    toggleParentValidated,
    addKid,
    signOut: () => supabase.auth.signOut(),
  };
}

// ---------- Root ----------
export default function RecreApp() {
  const pika = usePikapikaData();
  const [tab, setTab] = useState("profil");
  const [selected, setSelected] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null); // { item, kind: "adult" | "teen" | "senior" | "asso" }
  const [location, setLocation] = useState(null);

  const {
    activities, teenItems, adultItems, seniorItems, assoItems,
    favorites, favTeen, favAdult, favSenior, favAsso,
    joined, joinedTeen, joinedAdult, joinedSenior, joinedAsso,
    parentValidated, kids, displayName, email,
  } = pika;

  const toggleFav = pika.toggleFav;

  // Rejoindre une sortie enfant met aussi à jour l'aperçu ouvert (fiche détaillée), le temps
  // que le nombre d'inscrits recalculé depuis Supabase redescende dans le tableau `activities`.
  const join = (id) => {
    pika.join(id);
    setSelected((s) => s && s.id === id ? { ...s, inscrits: s.inscrits + 1 } : s);
  };

  const createActivity = pika.createActivity;

  const toggleFavCommunity = (kind, id) => pika.toggleFavCommunity(kind, id);

  const joinCommunity = (kind, id) => {
    pika.joinCommunity(kind, id);
    setSelectedCommunity((s) => s && s.item.id === id ? { ...s, item: { ...s.item, inscrits: s.item.inscrits + 1 } } : s);
  };

  const createAdultMeetup = pika.createAdultMeetup;

  const TABS_ALL = [
    { id: "explorer", label: t("tab_enfants"), icon: Compass, kidsOnly: true },
    { id: "ados", label: t("tab_ados"), icon: Gamepad2, kidsOnly: true },
    { id: "adultes", label: t("tab_adultes"), icon: Coffee },
    { id: "aine", label: t("tab_aine"), icon: Flower2 },
    { id: "asso", label: t("tab_associations"), icon: Landmark },
  ];
  const TABS = TABS_ALL.filter((tb) => !tb.kidsOnly || parentValidated);
  // Ces trois-là ne sont plus dans la barre du bas : ils vivent en icônes dans l'en-tête,
  // pour laisser la barre du bas uniquement aux 4 catégories d'âge (plus lisible sur petit écran).
  const HEADER_ACTIONS = [
    { id: "creer", label: t("tab_creer"), icon: PlusCircle },
    { id: "mes-sorties", label: t("tab_mes_sorties"), icon: BookMarked },
    { id: "profil", label: t("tab_profil"), icon: UserCircle2 },
  ];

  // Si le parent n'est plus validé (démo) alors qu'il est sur un onglet enfants, on le repositionne
  useEffect(() => {
    const stillVisible = TABS.some((tb) => tb.id === tab) || HEADER_ACTIONS.some((a) => a.id === tab);
    if (!stillVisible) setTab("profil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentValidated]);

  if (pika.authLoading) {
    return (
      <div style={{ background: COLORS.cloud, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PikaMascot size={48} />
      </div>
    );
  }

  if (!pika.user) {
    return <AuthScreen />;
  }

  if (pika.dataLoading) {
    return (
      <div style={{ background: COLORS.cloud, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <PikaMascot size={48} />
        <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "#6B6485" }}>{t("auth_loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.cloud, minHeight: "100vh", fontFamily: "Nunito, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: ${COLORS.sky} !important; }
        ::placeholder { color: #C7C0AE; }
        :root { --pika-avatar-size: 26px; }
        @media (max-width: 480px) {
          :root { --pika-avatar-size: 20px; }
        }
      `}</style>

      {/* Top bar (desktop) / logo (mobile) */}
      <div className="pika-header-row" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 20px", maxWidth: 960, margin: "0 auto", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PikaMascot size={32} />
          <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>
            Pikapika
          </span>
        </div>

        {/* Desktop nav + sélecteur de ville + actions d'en-tête (Créer / Mes sorties / Profil) */}
        <div className="pika-header-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {HEADER_ACTIONS.map((a) => {
              const active = tab === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setTab(a.id)}
                  aria-label={a.label}
                  title={a.label}
                  className="pika-header-action"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: active ? COLORS.ink : "#fff",
                    boxShadow: active ? "none" : "0 0 0 2px #F0EADB inset", flexShrink: 0,
                  }}
                >
                  <a.icon size={17} className="pika-header-action-icon" color={active ? "#fff" : COLORS.ink} />
                </button>
              );
            })}
          </div>

          <LocationFilter location={location} onChange={setLocation} />
        </div>
      </div>

      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "0 20px 110px",
      }}>
        {tab === "explorer" && parentValidated && (
          <CommunityExplorer
            title={t("community_kids_title")}
            subtitle={t("community_kids_subtitle")}
            categories={CATEGORIES}
            items={activities}
            favorites={favorites}
            onToggleFav={toggleFav}
            onOpen={setSelected}
            emptyText={t("empty_kids")}
            location={location}
            layout="days"
            genderMode
          />
        )}
        {tab === "creer" && (
          <CreatePage
            parentValidated={parentValidated}
            onCreateKid={createActivity}
            onCreateAdult={createAdultMeetup}
          />
        )}
        {tab === "mes-sorties" && (
          <MesSortiesPage
            parentValidated={parentValidated}
            joined={joined}
            activities={activities}
            adultItems={adultItems}
            joinedAdult={joinedAdult}
            onOpenAdult={(item) => setSelectedCommunity({ item, kind: "adult" })}
          />
        )}
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
            layout="days"
            genderMode
          />
        )}
        {tab === "aine" && (
          <CommunityExplorer
            title={t("community_senior_title")}
            subtitle={t("community_senior_subtitle")}
            categories={SENIOR_CATEGORIES}
            items={seniorItems}
            favorites={favSenior}
            onToggleFav={(id) => toggleFavCommunity("senior", id)}
            onOpen={(item) => setSelectedCommunity({ item, kind: "senior" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
            genderMode
          />
        )}
        {tab === "asso" && (
          <CommunityExplorer
            title={t("community_asso_title")}
            subtitle={t("community_asso_subtitle")}
            categories={ASSO_CATEGORIES}
            items={assoItems}
            favorites={favAsso}
            onToggleFav={(id) => toggleFavCommunity("asso", id)}
            onOpen={(item) => setSelectedCommunity({ item, kind: "asso" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
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
            layout="days"
          />
        )}
        {tab === "profil" && (
          <Profile
            joinedCount={joined.length}
            validated={parentValidated}
            onToggleDemo={pika.toggleParentValidated}
            displayName={displayName}
            email={email}
            kids={kids}
            onAddKid={pika.addKid}
            onSignOut={pika.signOut}
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
              className="pika-tab-btn"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer", flex: "1 0 56px",
              }}
            >
              <t.icon size={26} className="pika-tab-icon" color={active ? COLORS.coral : "#6B6485"} strokeWidth={active ? 2.6 : 2.2} />
              <span className="pika-tab-label" style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 14.5,
                color: active ? COLORS.coral : COLORS.ink,
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <DetailModal activity={selected} onClose={() => setSelected(null)} joined={joined} onJoin={join} />

      {(() => {
        const kindMeta = {
          adult: { categories: ADULT_CATEGORIES, joined: joinedAdult, joinLabel: t("join_label_adult"), genderMode: true },
          teen: { categories: TEEN_CATEGORIES, joined: joinedTeen, joinLabel: t("join_label_teen"), genderMode: false },
          senior: { categories: SENIOR_CATEGORIES, joined: joinedSenior, joinLabel: t("join_label_senior"), genderMode: true },
          asso: { categories: ASSO_CATEGORIES, joined: joinedAsso, joinLabel: t("join_label_asso"), genderMode: false },
        };
        const meta = kindMeta[selectedCommunity?.kind] || kindMeta.adult;
        return (
          <CommunityDetailModal
            item={selectedCommunity?.item}
            categories={meta.categories}
            onClose={() => setSelectedCommunity(null)}
            joined={meta.joined}
            onJoin={(id) => joinCommunity(selectedCommunity?.kind, id)}
            joinLabel={meta.joinLabel}
            genderMode={meta.genderMode}
          />
        );
      })()}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 400px) {
          .mobile-nav { padding: 8px 4px 14px !important; gap: 2px !important; }
          .pika-tab-btn { flex: 1 0 60px !important; }
          .pika-tab-icon { width: 24px !important; height: 24px !important; }
          .pika-tab-label { font-size: 13px !important; }
          .pika-header-row { padding: 12px 12px !important; }
          .pika-header-right { gap: 6px !important; }
          .pika-header-action { width: 36px !important; height: 36px !important; }
          .pika-header-action-icon { width: 17px !important; height: 17px !important; }
          .pika-location-label { max-width: 90px !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
}
