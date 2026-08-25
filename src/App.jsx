import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Compass, PlusCircle, BookMarked, UserCircle2, Search, MapPin,
  CalendarDays, Users, X, ChevronRight, Sparkles, Heart, Check, Mail,
  Baby, Trees, Palette, Music4, Puzzle, Bike, Coffee, Dumbbell,
  Landmark, Gamepad2, Film, Clock, ShieldCheck, Lock, ChevronDown, List, Map,
  Footprints, BookOpen, Flower2, PartyPopper, HeartHandshake, Trophy, Eye, EyeOff, Share2, Link2,
  Tag, ArrowLeft, Camera, BarChart3
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from "react-leaflet";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
    tab_enfants: "Famille", tab_ados: "Jeune", tab_adultes: "Adultes", tab_aine: "Retraité", tab_creer: "Créer",
    tab_mes_sorties: "Mes sorties", tab_profil: "Profil",
    tab_creer_adulte: "Créer une sortie", tab_mes_adultes: "Mes sorties",
    greeting: "Bonjour {name} 👋",
    explorer_subtitle: "{n} sortie(s) à partager avec vos enfants près de chez vous",
    search_placeholder: "Chercher une sortie, un lieu…",
    search_placeholder_community: "Chercher une sortie, un lieu…",
    chip_all: "Toutes", voir_plus: "Voir plus ({n} restantes)", view_liste: "Liste", view_carte: "Carte",
    empty_kids: "Aucune sortie ne correspond. Essayez une autre recherche !",
    fav_aria: "Ajouter aux favoris",
    card_full: "Complet", card_places_left: "{n} place(s) libre(s)", card_kids_left: "{n} place(s) enfant",
    cat_nature: "Nature", cat_creatif: "Créatif", cat_musique: "Musique", cat_jeux: "Jeux", cat_sport: "Sport",
    cat_cafe: "Café / Brunch", cat_culture: "Sorties culture", cat_bienetre: "Bien-être", cat_jeuxsociete: "Jeux de société",
    cat_jeuxvideo: "Jeux vidéo", cat_cinema: "Ciné / Sorties",
    cat_marche: "Marche santé", cat_ateliers: "Ateliers", cat_jardinage: "Jardinage",
    cat_mairie: "Mairie", cat_solidaire: "Solidaire", cat_fete: "Fête de quartier",
    create_title: "Proposer une sortie",
    create_subtitle: "Partagez une activité, d'autres parents pourront rejoindre avec leurs enfants.",
    label_titre: "Titre de la sortie", placeholder_titre: "Ex. Balade contée au parc", placeholder_kid_name: "Prénom de l'enfant", btn_ajouter: "Ajouter",
    label_categorie: "Catégorie", idees_titre: "Besoin d'inspiration ? Choisissez une idée", label_lieu: "Lieu", placeholder_lieu: "Parc, adresse…",
    label_date: "Date & heure", placeholder_date: "Sam. 9 août · 10h", label_heure: "Heure",
    label_age: "Âge conseillé", placeholder_age: "Ex. 4-8 ans",
    label_places: "Places disponibles", label_places_parents: "Places parents", label_places_enfants: "Places enfants", detail_parents_count: "{a}/{b} parents", detail_kids_count: "{a}/{b} enfants", join_kids_question: "Combien d'enfants amenez-vous ?", join_kids_max: "Vous avez déclaré {n} enfant(s) sur votre profil.", profile_nb_enfants_label: "Nombre d'enfants", profile_nb_moins12_label: "Dont enfants de moins de 12 ans", access_parent_ok: "Vous avez accès aux sorties Famille et Jeune.", access_parent_locked: "Les sorties Famille et Jeune sont réservées aux personnes ayant au moins un enfant de moins de 12 ans.", auth_nb_moins12: "Combien ont moins de 12 ans ?", profile_nb_enfants_note: "Sert à limiter le nombre d'enfants que vous pouvez inscrire à une sortie.", label_description: "Description", label_signe: "Signe distinctif (optionnel)", placeholder_signe: "Ex. Je porterai une casquette rouge, poussette bleue",
    placeholder_description: "Que va-t-on faire ? Quoi apporter ?",
    label_payant: "Sortie payante ?", toggle_oui: "Oui", toggle_non: "Non",
    badge_payant: "Payant", badge_gratuit: "Gratuit",
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
    detail_participants: "{a}/{b} participants",
    detail_registered_children: "Enfants déjà inscrits", detail_registered_parents: "Parents déjà inscrits", legend_girl: "Fille", legend_boy: "Garçon",
    detail_joined: "Vous participez", detail_join_kids: "Rejoindre avec mon enfant",
    detail_already_registered: "Déjà inscrit(e)s",
    community_adult_title: "Sorties adultes",
    community_adult_subtitle: "Des moments pour se retrouver entre parents du quartier.",
    community_teen_title: "Sorties entre jeunes",
    community_teen_subtitle: "Des activités entre jeunes, toujours encadrées par une association, une MJC ou un professeur.",
    community_empty: "Aucune sortie ne correspond. Essayez une autre recherche !",
    join_label_adult: "Rejoindre ce moment", join_label_teen: "Rejoindre cette sortie", join_label_senior: "Rejoindre ce moment",
    community_senior_title: "Sorties entre aînés",
    community_senior_subtitle: "Des moments conviviaux entre retraités du quartier, à leur rythme.",
    community_kids_title: "Sorties enfants", community_kids_subtitle: "Des sorties à partager avec vos enfants près de chez vous.",
    tab_associations: "Commune", community_asso_title: "Associations & Mairie",
    community_asso_subtitle: "Événements organisés par la mairie et les associations de votre commune.",
    join_label_asso: "Je participe",
    chip_intergen: "Intergénérationnel", intergen_badge: "Intergénérationnel", chip_favorites: "Favoris", filter_from_date: "À partir du", filter_from_date_short: "Date", filter_reset_date: "Toutes dates",
    btn_sign_out: "Se déconnecter",
    auth_title: "Bienvenue sur Orée", auth_subtitle: "Connectez-vous pour retrouver vos sorties.",
    auth_email: "Adresse email", auth_password: "Mot de passe", auth_name: "Votre prénom",
    auth_login_btn: "Se connecter", auth_signup_btn: "Créer mon compte",
    auth_switch_to_signup: "Pas encore de compte ? Inscrivez-vous",
    auth_switch_to_login: "Déjà un compte ? Connectez-vous", auth_forgot: "Mot de passe oublié ?", auth_forgot_need_email: "Saisissez d'abord votre adresse email.", auth_forgot_sent: "Un lien de réinitialisation vient de vous être envoyé par email.",
    auth_error_generic: "Une erreur est survenue. Vérifiez vos informations et réessayez.",
    auth_loading: "Chargement…",
    account_type_parent: "Particulier", account_type_association: "Association",
    auth_association_name: "Nom de l'association",
    auth_association_note: "Votre compte sera activé après validation par la mairie.",
    auth_last_name: "Votre nom de famille", auth_pseudo: "Votre pseudo", auth_pseudo_note: "C'est ce nom qui sera visible par les autres membres sur les annonces.", auth_pseudo_required: "Merci de choisir un pseudo.", auth_birthdate_required: "Merci d'indiquer votre date de naissance.", pseudo_pris: "Ce pseudo est déjà utilisé, choisissez-en un autre.", pseudo_libre: "Ce pseudo est disponible.", show_password: "Afficher le mot de passe", hide_password: "Masquer le mot de passe",
    auth_commune_placeholder: "Votre commune", auth_birthdate_label: "Date de naissance", avg_age_badge: "~{age} ans", btn_enregistrer: "Enregistrer", legal_mentions_title: "Mentions légales", legal_cgu_title: "Conditions générales d'utilisation", legal_confidentialite_title: "Politique de confidentialité", legal_links_signup: "En créant un compte, vous acceptez nos {cgu} et notre {conf}.", profile_bio_label: "Un petit mot sur vous", profile_bio_placeholder: "Ex. Maman de deux enfants, toujours partante pour une balade ou un café !", profile_genre_label: "Vous êtes", profile_situation_label: "Situation familiale", profile_commune_label: "Votre commune", profile_commune_none: "Non renseignée", profile_commune_search: "Rechercher votre commune…", profile_commune_note: "Utilisée par défaut pour filtrer les sorties près de chez vous.", profile_profession_label: "Profession", profile_profession_ph: "Ex. Infirmière, enseignant, retraité…", profile_interets_label: "Centres d'intérêt", profile_interets_ph: "Ex. Randonnée, cuisine, lecture, jardinage…", profile_animaux_label: "Animaux", profile_animaux_ph: "Ex. Un chien, deux chats…", profile_coeur_label: "Ce que j'aime par-dessus tout", profile_coeur_ph: "Ex. Les balades en forêt le dimanche matin", profile_about_section: "À propos", situation_celibataire: "Célibataire", situation_en_couple: "En couple", situation_marie: "Marié(e)", situation_famille_mono: "Famille monoparentale", situation_autre: "Autre", situation_non_precise: "Je préfère ne pas préciser", profile_edit_title: "Modifier mon profil", btn_back: "Retour", back_home: "Retour à l'accueil", btn_edit_profile: "Modifier mon profil", profile_not_filled: "Non renseigné", profile_private_info: "Informations privées", profile_no_child: "Aucun enfant renseigné.", profile_count_created: "Sorties créées", profile_count_joined: "Sorties rejointes", edit_title: "Modifier la sortie", edit_warning: "Toute modification retirera les personnes déjà inscrites (vous restez inscrit).", edit_save: "Enregistrer les modifications", btn_edit: "Modifier", btn_cancel_outing: "Annuler la sortie", btn_delete: "Supprimer", leave_confirm: "Confirmer : ne plus participer ?", cancel_outing_confirm: "Confirmer l'annulation ?",
    mairie_no_commune: "Aucune commune assignée à ce compte mairie — contactez l'administrateur du site.",
    mairie_territory: "Territoire : {commune}",
    profile_not_found: "Ce profil n'est pas disponible.", member_since: "Membre depuis {date}",
    change_photo: "Changer la photo", photo_uploading: "Envoi de la photo…", photo_refusee: "Cette photo ne peut pas être utilisée : elle contient un contenu inapproprié. Merci d'en choisir une autre.", profile_cover_label: "Photo de couverture", profile_cover_add: "Ajouter une couverture", profile_cover_change: "Changer la couverture",
    share_btn: "Partager", defi_btn: "La roue des défis", chat_btn: "Discussion du groupe", chat_open: "Discussion ouverte", chat_closed: "Discussion fermée", chat_placeholder: "Écrire un message…", chat_emoji: "Émoticônes", chat_insulte: "Ce message contient des propos inappropriés. Merci de rester bienveillant.", chat_empty: "Aucun message pour le moment.\nÉcrivez le premier pour organiser vos retrouvailles !", chat_closed_note: "La discussion est fermée (5h après le début de la sortie). Vous pouvez toujours relire les messages.", defi_btn_view: "Voir le défi du groupe", defi_title: "La roue des défis", defi_subtitle: "Un petit défi à faire ensemble, une fois sur place !", defi_spin: "Tourner la roue", defi_again: "Tourner à nouveau", defi_spinning: "La roue tourne…", defi_hint: "Appuyez sur le bouton pour tirer un défi au sort.", defi_result_label: "Votre défi", defi_spins_left: "Il vous reste {n} tirage(s).", defi_no_more: "Plus de tirage : c'est ce défi qu'il faut relever !", defi_accept: "Défi accepté !", defi_validate: "Valider ce défi pour le groupe", defi_group_label: "Le défi du groupe", defi_group_subtitle: "Le défi a déjà été tiré pour cette sortie — le voici !", share_copy_link: "Copier le lien", share_link_copied: "Lien copié !",
    share_whatsapp: "WhatsApp", share_facebook: "Facebook", share_message: "Regarde cette sortie sur Orée : {title}",
    report_btn: "Signaler", report_user_btn: "Signaler cet utilisateur", pm_title: "Messages", pm_subtitle: "Vos échanges avec les personnes rencontrées lors de sorties.", pm_requests: "Demandes de contact", pm_conversations: "Conversations", pm_search_placeholder: "Rechercher un membre par pseudo…", pm_search_empty: "Aucun membre trouvé avec ce pseudo.", pm_quota_atteint: "Vous avez atteint la limite de 3 demandes par jour. Réessayez demain.", pm_age_bloque: "Pour la sécurité des plus jeunes, les échanges se font entre personnes de la même tranche d'âge.", pm_ask: "Demander à discuter", pm_asked: "Demande envoyée", pm_quota_reste: "{n} demande(s) restante(s) aujourd'hui", pm_retry: "Refaire une demande", pm_empty: "Aucune conversation pour le moment.", pm_no_message: "Aucun message", pm_wants_to_talk: "Souhaite discuter avec vous", pm_accept: "Accepter", pm_refuse: "Refuser", pm_block: "Bloquer", pm_block_confirm: "Confirmer ?", pm_write_to: "Envoyer un message", pm_need_shared_outing: "Pour la sécurité des plus jeunes, les échanges se font entre personnes de la même tranche d'âge.", pm_waiting_accept: "Votre demande est en attente. Vous pourrez écrire dès qu'elle sera acceptée.", pm_wait_reply: "En attente de la réponse de votre correspondant.", pm_refused: "Cette demande a été refusée.", pm_open_error: "Impossible d'ouvrir la discussion pour le moment. Réessayez dans un instant.", pm_refused_section: "Demandes refusées", pm_blocked_section: "Personnes bloquées", pm_blocked_note: "Cette personne ne peut plus vous écrire", pm_unblock: "Débloquer", pm_refused_by_me: "Vous avez refusé cette demande", pm_refused_by_them: "Votre demande a été refusée", pm_change_mind: "Finalement, accepter la discussion", pm_send_error: "Impossible d'envoyer ce message.", tab_messages: "Messages", orga_btn: "Écrire à l'organisateur", orga_btn_owner: "Questions reçues", orga_title: "Contacter l'organisateur", orga_title_owner: "Questions sur votre sortie", orga_badge: "organisateur", orga_placeholder: "Poser une question sur la sortie…", orga_reply_placeholder: "Répondre…", orga_empty: "Une question sur cette sortie ? Écrivez à l'organisateur.", orga_empty_owner: "Aucune question pour le moment.", orga_closed: "Les échanges sont clos (5h après le début de la sortie).", report_user_title: "Signaler cet utilisateur", report_title: "Signaler cette annonce",
    report_reason_label: "Raison du signalement", report_details_label: "Détails (optionnel)",
    report_details_placeholder: "Expliquez ce qui vous a alerté…",
    report_reason_inapproprie: "Comportement inapproprié", report_reason_contenu: "Contenu inadapté",
    report_reason_securite: "Sécurité des enfants", report_reason_spam: "Spam / faux compte",
    report_reason_autre: "Autre", report_submit: "Envoyer le signalement",
    report_sent: "Signalement envoyé, merci — la mairie va l'examiner.",
    login_required_title: "Connexion nécessaire",
    login_required_text: "Créez un compte ou connectez-vous pour rejoindre ou proposer une sortie.",
    tab_mairie: "Mairie", mairie_title: "Espace mairie",
    mairie_pending_parents: "Parents en attente de validation", mairie_pending_assos: "Associations en attente de validation",
    mairie_reports: "Signalements", mairie_validate: "Valider", mairie_no_pending: "Rien en attente pour le moment.",
    mairie_report_status_pending: "En attente", mairie_report_status_reviewed: "Traité", mairie_report_status_dismissed: "Classé",
    mairie_mark_reviewed: "Marquer traité", mairie_dismiss: "Classer sans suite",
    mairie_sub_validations: "Validations", mairie_sub_reports: "Signalements", mairie_sub_stats: "Statistiques",
    stats_users: "Utilisateurs", stats_total_users: "Comptes créés",
    stats_by_space: "Sorties proposées par catégorie",
    stats_all_time_note: "Depuis le lancement, toutes sorties confondues (passées et à venir).",
    stats_active_today: "Sorties actuellement proposées",
    stats_active_today_note: "Total, toutes catégories confondues, sorties déjà passées exclues.",
    stats_monthly_chart: "Sorties créées par mois (12 derniers mois)",
    stats_outings_created: "sortie(s) créée(s)",
    deleted_account_name: "Compte supprimé",
    admin_sub_stats: "Statistiques", admin_sub_users: "Utilisateurs", admin_sub_reports: "Signalements", admin_reports_title: "Signalements reçus", admin_photos_title: "Photos à vérifier", admin_photos_note: "Ces photos ont passé le filtre automatique mais méritent un coup d'œil.", admin_photo_ok: "Valider", admin_photo_remove: "Supprimer", admin_reports_empty: "Aucun signalement dans cette catégorie.", admin_reports_pending: "{n} signalement(s) en attente de traitement", admin_report_reporter: "Signalé par", admin_report_reported: "Personne visée", admin_report_activity: "Sortie concernée", admin_report_note: "Note interne", admin_report_note_ph: "Ex. Contacté par téléphone le 12/03, avertissement donné.", admin_report_add_note: "Ajouter une note", admin_report_escalate: "Transmis aux autorités", admin_report_reopen: "Remettre en attente", report_status_escalated: "Transmis",
    admin_users_title: "Tous les utilisateurs", admin_no_users: "Aucun utilisateur pour le moment.", admin_no_commune: "Aucune commune",
    admin_search_placeholder: "Rechercher par nom ou email…", admin_no_results: "Aucun utilisateur ne correspond.",
    admin_block: "Bloquer", admin_unblock: "Débloquer", admin_delete: "Supprimer",
    admin_delete_confirm: "Confirmer la suppression ?",
    admin_banned_badge: "Bloqué", admin_you: "(vous)",
    banned_title: "Compte suspendu", banned_text: "Votre compte a été suspendu par un administrateur. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
    preauth_title: "Valider des parents par email", preauth_subtitle: "Fonctionne même si la personne ne s'est pas encore inscrite : son compte sera validé automatiquement dès sa création.",
    preauth_single_label: "Ajouter un email", preauth_single_placeholder: "parent@exemple.com",
    preauth_bulk_label: "Ou coller une liste (un email par ligne, ou séparés par des virgules)",
    preauth_bulk_placeholder: "parent1@exemple.com\nparent2@exemple.com\nparent3@exemple.com…",
    preauth_bulk_submit: "Valider la liste", preauth_processing: "Traitement en cours…",
    preauth_result: "{added} email(s) ajouté(s) · {validated} compte(s) déjà existant(s) validé(s) immédiatement · {invalid} ignoré(s) (format invalide)",
    by_organiser: "Par {org}",
    loc_placeholder: "Ville, commune, département…", loc_all_france: "Partout",
    loc_no_result: 'Aucun résultat pour "{q}"', loc_dept: "Département", loc_ville: "Ville",
    loc_ville_dept: "Ville · dept. {d}", loc_radius_title: "Rayon autour de {ville}",
    map_centered_on: "Carte centrée sur {loc}", map_empty: "Aucune sortie géolocalisée pour ces filtres.",
    map_see_detail: "Voir la fiche",
    day_today: "Aujourd'hui", day_tomorrow: "Demain", day_yesterday: "Hier", day_after_tomorrow: "Après-demain",
    day_after_after_tomorrow: "Après-après-demain",
    legend_femme: "Femme", legend_homme: "Homme",
    accordion_empty: "Aucune sortie ce jour-là.",
    create_toggle_child: "Famille", create_toggle_teen: "Jeune", create_toggle_adult: "Adulte", create_toggle_senior: "Retraité",
    note_needs_validation: "Vous pourrez aussi proposer des sorties enfants une fois votre identité validée par la mairie (voir Profil).",
    section_kids_outings: "Sorties enfants", section_adult_meetups: "Sorties adultes",
    adult_sub_decouvrir: "Découvrir", adult_sub_creer: "Créer", adult_sub_mes: "Mes sorties",
    create_meetup_title: "Proposer une sortie",
    create_meetup_subtitle: "Partagez un moment entre adultes, d'autres parents pourront vous rejoindre.",
    label_info: "Info complémentaire (optionnel)", placeholder_info: "Ex. Pendant que les enfants sont à l'école",
    success_message_meetup: "Sortie publiée ! Elle apparaît dans l'onglet Découvrir.",
    my_meetups_title: "Mes sorties adultes",
    my_meetups_subtitle: "Les sorties que vous avez proposées ou rejointes.",
    my_meetups_empty: "Vous n'avez pas encore de sortie. Rejoignez-en une dans Découvrir, ou proposez la vôtre dans Créer !",
    my_all_subtitle: "Toutes vos sorties, toutes catégories confondues.", legend_created: "Créée par vous", legend_joined: "Rejointe", badge_organiser: "Organisateur", badge_past: "Passée",
    my_created_label: "Sorties que j'ai créées", my_created_empty: "Vous n'avez encore créé aucune sortie ici.",
    my_joined_label: "Sorties que j'ai rejointes", my_joined_empty: "Vous n'avez encore rejoint aucune sortie ici.",
    my_teen_title: "Mes sorties jeune", my_teen_subtitle: "Les sorties que vous avez proposées ou rejointes.",
    my_senior_title: "Mes sorties retraité", my_senior_subtitle: "Les sorties que vous avez proposées ou rejointes.",
  },
  en: {
    tab_enfants: "Family", tab_ados: "Youth", tab_adultes: "Adults", tab_aine: "Retired", tab_creer: "Create",
    tab_mes_sorties: "My outings", tab_profil: "Profile",
    tab_creer_adulte: "Create meetup", tab_mes_adultes: "My meetups",
    greeting: "Hi {name} 👋",
    explorer_subtitle: "{n} outing(s) to share with your kids near you",
    search_placeholder: "Search an outing, a place…",
    search_placeholder_community: "Search a meetup, a place…",
    chip_all: "All", voir_plus: "Show more ({n} left)", view_liste: "List", view_carte: "Map",
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
    label_titre: "Outing title", placeholder_titre: "E.g. Storytelling walk in the park", placeholder_kid_name: "Child's first name", btn_ajouter: "Add",
    label_categorie: "Category", label_lieu: "Location", placeholder_lieu: "Park, address…",
    label_date: "Date & time", placeholder_date: "Sat. Aug 9 · 10am", label_heure: "Time",
    label_age: "Recommended age", placeholder_age: "E.g. 4-8 years",
    label_places: "Available spots", label_description: "Description", label_signe: "How to recognise you (optional)", placeholder_signe: "E.g. I'll wear a red cap, blue stroller",
    placeholder_description: "What will you do? What to bring?",
    label_payant: "Is it a paid outing?", toggle_oui: "Yes", toggle_non: "No",
    badge_payant: "Paid", badge_gratuit: "Free",
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
    detail_participants: "{a}/{b} participants",
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
    chip_intergen: "Intergenerational", intergen_badge: "Intergenerational", chip_favorites: "Favourites",
    btn_sign_out: "Sign out",
    auth_title: "Welcome to Orée", auth_subtitle: "Sign in to find your outings.",
    auth_email: "Email address", auth_password: "Password", auth_name: "Your first name",
    auth_login_btn: "Sign in", auth_signup_btn: "Create my account",
    auth_switch_to_signup: "No account yet? Sign up",
    auth_switch_to_login: "Already have an account? Sign in", auth_forgot: "Forgot password?", auth_forgot_need_email: "Enter your email address first.", auth_forgot_sent: "A reset link has just been sent to your email.",
    auth_error_generic: "Something went wrong. Check your details and try again.",
    auth_loading: "Loading…",
    account_type_parent: "Individual", account_type_association: "Association",
    auth_association_name: "Association name",
    auth_association_note: "Your account will be activated after town hall validation.",
    auth_last_name: "Your last name", show_password: "Show password", hide_password: "Hide password",
    auth_commune_placeholder: "Your town (optional)", auth_birthdate_label: "Date of birth", avg_age_badge: "~{age} yo", btn_enregistrer: "Save",
    mairie_no_commune: "No town assigned to this town hall account — contact the site administrator.",
    mairie_territory: "Territory: {commune}",
    profile_not_found: "This profile is not available.", member_since: "Member since {date}",
    change_photo: "Change photo", photo_uploading: "Uploading photo…",
    share_btn: "Share", share_copy_link: "Copy link", share_link_copied: "Link copied!",
    share_whatsapp: "WhatsApp", share_facebook: "Facebook", share_message: "Check out this outing on Orée: {title}",
    report_btn: "Report", report_title: "Report this listing",
    report_reason_label: "Reason for report", report_details_label: "Details (optional)",
    report_details_placeholder: "Explain what concerned you…",
    report_reason_inapproprie: "Inappropriate behaviour", report_reason_contenu: "Unsuitable content",
    report_reason_securite: "Child safety", report_reason_spam: "Spam / fake account",
    report_reason_autre: "Other", report_submit: "Send report",
    report_sent: "Report sent, thank you — the town hall will review it.",
    login_required_title: "Sign in required",
    login_required_text: "Create an account or sign in to join or propose an outing.",
    tab_mairie: "Town Hall", mairie_title: "Town hall dashboard",
    mairie_pending_parents: "Parents pending validation", mairie_pending_assos: "Associations pending validation",
    mairie_reports: "Reports", mairie_validate: "Validate", mairie_no_pending: "Nothing pending right now.",
    mairie_report_status_pending: "Pending", mairie_report_status_reviewed: "Reviewed", mairie_report_status_dismissed: "Dismissed",
    mairie_mark_reviewed: "Mark reviewed", mairie_dismiss: "Dismiss",
    mairie_sub_validations: "Validations", mairie_sub_reports: "Reports", mairie_sub_stats: "Statistics",
    stats_users: "Users", stats_total_users: "Accounts created",
    stats_by_space: "Outings by category",
    stats_all_time_note: "Since launch, all outings combined (past and upcoming).",
    stats_active_today: "Currently proposed outings",
    stats_active_today_note: "Total across all categories, past outings excluded.",
    stats_monthly_chart: "Outings created per month (last 12 months)",
    stats_outings_created: "outing(s) created",
    deleted_account_name: "Deleted account",
    admin_sub_stats: "Statistics", admin_sub_users: "Users",
    admin_users_title: "All users", admin_no_users: "No users yet.", admin_no_commune: "No town",
    admin_search_placeholder: "Search by name or email…", admin_no_results: "No matching user.",
    admin_block: "Block", admin_unblock: "Unblock", admin_delete: "Delete",
    admin_delete_confirm: "Confirm deletion?",
    admin_banned_badge: "Blocked", admin_you: "(you)",
    banned_title: "Account suspended", banned_text: "Your account has been suspended by an administrator. Contact support if you think this is a mistake.",
    preauth_title: "Validate parents by email", preauth_subtitle: "Works even if the person hasn't signed up yet: their account will be validated automatically as soon as it's created.",
    preauth_single_label: "Add an email", preauth_single_placeholder: "parent@example.com",
    preauth_bulk_label: "Or paste a list (one email per line, or comma-separated)",
    preauth_bulk_placeholder: "parent1@example.com\nparent2@example.com\nparent3@example.com…",
    preauth_bulk_submit: "Validate the list", preauth_processing: "Processing…",
    preauth_result: "{added} email(s) added · {validated} existing account(s) validated immediately · {invalid} ignored (invalid format)",
    by_organiser: "By {org}",
    loc_placeholder: "City, town, region…", loc_all_france: "Everywhere",
    loc_no_result: 'No result for "{q}"', loc_dept: "Department", loc_ville: "City",
    loc_ville_dept: "City · dept. {d}", loc_radius_title: "Radius around {ville}",
    map_centered_on: "Map centred on {loc}", map_empty: "No located outing for these filters.",
    map_see_detail: "See details",
    day_today: "Today", day_tomorrow: "Tomorrow", day_yesterday: "Yesterday", day_after_tomorrow: "Day after tomorrow",
    day_after_after_tomorrow: "In 3 days",
    legend_femme: "Woman", legend_homme: "Man",
    accordion_empty: "No meetup that day.",
    create_toggle_child: "Family", create_toggle_teen: "Youth", create_toggle_adult: "Adult", create_toggle_senior: "Retired",
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
    tab_enfants: "Familia", tab_ados: "Jóvenes", tab_adultes: "Adultos", tab_aine: "Jubilados", tab_creer: "Crear",
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
    label_titre: "Título de la salida", placeholder_titre: "Ej. Paseo cuentacuentos en el parque", placeholder_kid_name: "Nombre del niño/a", btn_ajouter: "Añadir",
    label_categorie: "Categoría", label_lieu: "Lugar", placeholder_lieu: "Parque, dirección…",
    label_date: "Fecha y hora", placeholder_date: "Sáb. 9 ago · 10h", label_heure: "Hora",
    label_age: "Edad recomendada", placeholder_age: "Ej. 4-8 años",
    label_places: "Plazas disponibles", label_description: "Descripción", label_signe: "Cómo reconocerte (opcional)", placeholder_signe: "Ej. Llevaré una gorra roja, carrito azul",
    placeholder_description: "¿Qué vais a hacer? ¿Qué traer?",
    label_payant: "¿Es una salida de pago?", toggle_oui: "Sí", toggle_non: "No",
    badge_payant: "De pago", badge_gratuit: "Gratis",
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
    detail_participants: "{a}/{b} participantes",
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
    chip_intergen: "Intergeneracional", intergen_badge: "Intergeneracional", chip_favorites: "Favoritos",
    btn_sign_out: "Cerrar sesión",
    auth_title: "Bienvenido/a a Orée", auth_subtitle: "Inicia sesión para encontrar tus salidas.",
    auth_email: "Correo electrónico", auth_password: "Contraseña", auth_name: "Tu nombre",
    auth_login_btn: "Iniciar sesión", auth_signup_btn: "Crear mi cuenta",
    auth_switch_to_signup: "¿Aún no tienes cuenta? Regístrate",
    auth_switch_to_login: "¿Ya tienes cuenta? Inicia sesión", auth_forgot: "¿Olvidaste tu contraseña?", auth_forgot_need_email: "Introduce primero tu correo electrónico.", auth_forgot_sent: "Se acaba de enviar un enlace de restablecimiento a tu correo.",
    auth_error_generic: "Algo salió mal. Comprueba tus datos e inténtalo de nuevo.",
    auth_loading: "Cargando…",
    account_type_parent: "Particular", account_type_association: "Asociación",
    auth_association_name: "Nombre de la asociación",
    auth_association_note: "Tu cuenta se activará tras la validación del ayuntamiento.",
    auth_last_name: "Tu apellido", show_password: "Mostrar contraseña", hide_password: "Ocultar contraseña",
    auth_commune_placeholder: "Tu localidad (opcional)", auth_birthdate_label: "Fecha de nacimiento", avg_age_badge: "~{age} años", btn_enregistrer: "Guardar",
    mairie_no_commune: "Ningún municipio asignado a esta cuenta de ayuntamiento — contacta con el administrador del sitio.",
    mairie_territory: "Territorio: {commune}",
    profile_not_found: "Este perfil no está disponible.", member_since: "Miembro desde {date}",
    change_photo: "Cambiar foto", photo_uploading: "Subiendo foto…",
    share_btn: "Compartir", share_copy_link: "Copiar enlace", share_link_copied: "¡Enlace copiado!",
    share_whatsapp: "WhatsApp", share_facebook: "Facebook", share_message: "Mira esta salida en Orée: {title}",
    report_btn: "Denunciar", report_title: "Denunciar este anuncio",
    report_reason_label: "Motivo de la denuncia", report_details_label: "Detalles (opcional)",
    report_details_placeholder: "Explica qué te preocupó…",
    report_reason_inapproprie: "Comportamiento inapropiado", report_reason_contenu: "Contenido inadecuado",
    report_reason_securite: "Seguridad infantil", report_reason_spam: "Spam / cuenta falsa",
    report_reason_autre: "Otro", report_submit: "Enviar denuncia",
    report_sent: "Denuncia enviada, gracias — el ayuntamiento la revisará.",
    login_required_title: "Inicio de sesión necesario",
    login_required_text: "Crea una cuenta o inicia sesión para unirte o proponer una salida.",
    tab_mairie: "Ayuntamiento", mairie_title: "Panel del ayuntamiento",
    mairie_pending_parents: "Padres pendientes de validación", mairie_pending_assos: "Asociaciones pendientes de validación",
    mairie_reports: "Denuncias", mairie_validate: "Validar", mairie_no_pending: "Nada pendiente por ahora.",
    mairie_report_status_pending: "Pendiente", mairie_report_status_reviewed: "Revisado", mairie_report_status_dismissed: "Descartado",
    mairie_mark_reviewed: "Marcar revisado", mairie_dismiss: "Descartar",
    mairie_sub_validations: "Validaciones", mairie_sub_reports: "Denuncias", mairie_sub_stats: "Estadísticas",
    stats_users: "Usuarios", stats_total_users: "Cuentas creadas",
    stats_by_space: "Salidas por categoría",
    stats_all_time_note: "Desde el lanzamiento, todas las salidas (pasadas y futuras).",
    stats_active_today: "Salidas actualmente propuestas",
    stats_active_today_note: "Total de todas las categorías, salidas pasadas excluidas.",
    stats_monthly_chart: "Salidas creadas por mes (últimos 12 meses)",
    stats_outings_created: "salida(s) creada(s)",
    deleted_account_name: "Cuenta eliminada",
    admin_sub_stats: "Estadísticas", admin_sub_users: "Usuarios",
    admin_users_title: "Todos los usuarios", admin_no_users: "Todavía no hay usuarios.", admin_no_commune: "Sin municipio",
    admin_search_placeholder: "Buscar por nombre o email…", admin_no_results: "Ningún usuario coincide.",
    admin_block: "Bloquear", admin_unblock: "Desbloquear", admin_delete: "Eliminar",
    admin_delete_confirm: "¿Confirmar eliminación?",
    admin_banned_badge: "Bloqueado", admin_you: "(tú)",
    banned_title: "Cuenta suspendida", banned_text: "Tu cuenta ha sido suspendida por un administrador. Contacta con soporte si crees que es un error.",
    preauth_title: "Validar padres por email", preauth_subtitle: "Funciona incluso si la persona aún no se ha registrado: su cuenta se validará automáticamente en cuanto se cree.",
    preauth_single_label: "Añadir un email", preauth_single_placeholder: "padre@ejemplo.com",
    preauth_bulk_label: "O pega una lista (un email por línea, o separados por comas)",
    preauth_bulk_placeholder: "padre1@ejemplo.com\npadre2@ejemplo.com\npadre3@ejemplo.com…",
    preauth_bulk_submit: "Validar la lista", preauth_processing: "Procesando…",
    preauth_result: "{added} email(s) añadido(s) · {validated} cuenta(s) existente(s) validada(s) al instante · {invalid} ignorado(s) (formato inválido)",
    by_organiser: "Por {org}",
    loc_placeholder: "Ciudad, municipio, región…", loc_all_france: "En todas partes",
    loc_no_result: 'Sin resultados para "{q}"', loc_dept: "Departamento", loc_ville: "Ciudad",
    loc_ville_dept: "Ciudad · dpto. {d}", loc_radius_title: "Radio alrededor de {ville}",
    map_centered_on: "Mapa centrado en {loc}", map_empty: "Ninguna salida geolocalizada para estos filtros.",
    map_see_detail: "Ver la ficha",
    day_today: "Hoy", day_tomorrow: "Mañana", day_yesterday: "Ayer", day_after_tomorrow: "Pasado mañana",
    day_after_after_tomorrow: "En 3 días",
    legend_femme: "Mujer", legend_homme: "Hombre",
    accordion_empty: "Ningún encuentro ese día.",
    create_toggle_child: "Familia", create_toggle_teen: "Jóvenes", create_toggle_adult: "Adultos", create_toggle_senior: "Jubilados",
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
  if (offsetDays === -1) return t("day_yesterday");
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const locale = LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US";
  // Au-delà d'un an d'écart, on précise l'année pour éviter toute confusion
  const options = Math.abs(offsetDays) > 330
    ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    : { weekday: "long", day: "numeric", month: "long" };
  const label = d.toLocaleDateString(locale, options);
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
// Situations familiales proposées (toujours optionnel — la personne peut ne rien indiquer)
const SITUATIONS = [
  { id: "celibataire", label: "Célibataire" },
  { id: "en_couple", label: "En couple" },
  { id: "marie", label: "Marié(e) / Pacsé(e)" },
  { id: "famille_mono", label: "Famille monoparentale" },
  { id: "separe", label: "Séparé(e) / Divorcé(e)" },
  { id: "veuf", label: "Veuf / Veuve" },
];
const situationLabel = (id) => (SITUATIONS.find((s) => s.id === id) || {}).label || null;

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

// Redimensionne et compresse une image côté navigateur, en réduisant la qualité JPEG
// jusqu'à passer sous la limite demandée (1 Mo par défaut) — rien n'est envoyé en base
// avant d'être déjà allégé.
function compressImage(file, maxBytes = 1024 * 1024, maxDim = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.9;
        const tryExport = () => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error("Échec de la compression")); return; }
            if (blob.size > maxBytes && quality > 0.3) {
              quality -= 0.1;
              tryExport();
            } else {
              resolve(blob);
            }
          }, "image/jpeg", quality);
        };
        tryExport();
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

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

// Retourne le nom affichable d'une ville : soit depuis la liste intégrée (anciens
// identifiants type "grenoble"), soit le nom tel quel pour les villes européennes.
const villeName = (id) => {
  if (!id) return "";
  const connue = CITY_META[id];
  if (connue) return connue.label;
  // Ville libre enregistrée directement sous son nom
  return String(id);
};

// Calcule un âge à partir d'une date de naissance, sans jamais avoir besoin d'afficher
// la date exacte ailleurs dans l'appli (plus respectueux de la vie privée).
function ageFromBirthdate(birthdate) {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const notYetBirthday = now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (notYetBirthday) age -= 1;
  return age;
}
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
    desc: "Une soirée détente entre parents, autour de jeux de société et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    desc: "Une soirée détente entre parents, autour de jeux et d'un apéro partagé.",
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
    participants: [
      { name: "Lucas", genre: "G" }, { name: "Nina", genre: "F" }, { name: "Yanis", genre: "G" },
      { name: "Camille", genre: "F" }, { name: "Théo", genre: "G" }, { name: "Sarah", genre: "F" },
      { name: "Enzo", genre: "G" }, { name: "Léa", genre: "F" },
    ],
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
    participants: [
      { name: "Rayan", genre: "G" }, { name: "Chloé", genre: "F" }, { name: "Maxime", genre: "G" },
      { name: "Lina", genre: "F" }, { name: "Noa", genre: "G" }, { name: "Jules", genre: "G" },
      { name: "Inès", genre: "F" }, { name: "Sacha", genre: "G" }, { name: "Tom", genre: "G" },
    ],
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
    participants: [
      { name: "Manon", genre: "F" }, { name: "Adam", genre: "G" }, { name: "Zoé", genre: "F" },
      { name: "Nathan", genre: "G" }, { name: "Jade", genre: "F" }, { name: "Hugo", genre: "G" },
      { name: "Chloé", genre: "F" },
    ],
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
    participants: [
      { name: "Emma", genre: "F" }, { name: "Léon", genre: "G" }, { name: "Alice", genre: "F" },
      { name: "Nathan", genre: "G" }, { name: "Rose", genre: "F" }, { name: "Malo", genre: "G" },
    ],
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
    participants: [
      { name: "Gabriel", genre: "G" }, { name: "Anna", genre: "F" }, { name: "Ethan", genre: "G" },
      { name: "Juliette", genre: "F" }, { name: "Oscar", genre: "G" },
    ],
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
    participants: [
      { name: "Lina", genre: "F" }, { name: "Malo", genre: "G" }, { name: "Yanis", genre: "G" }, { name: "Chloé", genre: "F" },
    ],
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

function Avatar({ name, genre, size = 26, overlap = false, genderMode = true, color, avatarUrl, userId, onViewProfile }) {
  const finalColor = genderMode ? genreColor(genre) : (color || COLORS.grape);
  const clickable = !!(userId && onViewProfile);
  const style = {
    width: size, height: size, minWidth: size, borderRadius: "50%", background: finalColor,
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, lineHeight: 1,
    fontSize: size * 0.42, border: "2px solid #fff", boxSizing: "content-box", boxShadow: "none",
    marginLeft: overlap ? -10 : 0, flexShrink: 0,
    cursor: clickable ? "pointer" : "default", padding: 0,
  };
  const content = avatarUrl ? (
    <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : (
    name.charAt(0).toUpperCase()
  );
  const title = genderMode ? `${name} (${genreLabel(genre)})` : name;
  if (clickable) {
    return (
      <button title={title} onClick={(e) => { e.stopPropagation(); onViewProfile(userId); }} style={style}>
        {content}
      </button>
    );
  }
  return <div title={title} style={style}>{content}</div>;
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

// Met en avant le pseudo de l'organisateur, coloré par genre quand il est connu
// (les comptes association/institutions n'ont pas de genre : couleur neutre).
// Petite carte qui apparaît au survol d'un pseudo (ordinateur uniquement — sur mobile,
// le clic reste le moyen d'ouvrir la fiche complète). Les données sont chargées une seule
// fois, puis gardées en mémoire pour éviter de réinterroger la base à chaque survol.
const hoverProfileCache = {};

function ProfileHoverCard({ userId, children }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(hoverProfileCache[userId] || null);
  const timerRef = useRef(null);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setVisible(true);
      if (!hoverProfileCache[userId]) {
        const { data: row } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, genre, birthdate, bio, role, association_name")
          .eq("id", userId).single();
        if (row) {
          hoverProfileCache[userId] = row;
          setData(row);
        }
      } else {
        setData(hoverProfileCache[userId]);
      }
    }, 350);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!userId) return children;

  const name = data?.role === "association" ? (data?.association_name || data?.display_name) : data?.display_name;
  const age = data?.birthdate ? ageFromBirthdate(data.birthdate) : null;
  const color = data?.genre ? genreColor(data.genre) : COLORS.ink;

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && data && (
        <span
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: 0, zIndex: 9998,
            background: "#fff", border: "2px solid #F0EADB", borderRadius: 20,
            boxShadow: "0 12px 32px rgba(43,37,96,0.2)", padding: 16,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 260,
            pointerEvents: "none",
          }}
        >
          <span style={{
            width: 150, height: 150, borderRadius: "50%", background: color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            color: "#fff", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 56,
            boxShadow: data.genre ? `0 0 0 3px #fff, 0 0 0 6px ${genreColor(data.genre)}70` : "none",
          }}>
            {data.avatar_url
              ? <img src={data.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (name || "?").charAt(0).toUpperCase()}
          </span>
          <span style={{ minWidth: 0, textAlign: "center", width: "100%" }}>
            <span style={{ display: "block", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </span>
            {age !== null && (
              <span style={{ display: "block", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: "#6B6485", marginTop: 2 }}>
                {age} {t("profile_years")}
              </span>
            )}
            {data.bio && (
              <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF", marginTop: 6, lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {data.bio}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

function OrganiserBadge({ name, genre, size = 14, userId, onClick, age }) {
  if (!name) return null;
  const color = genre ? genreColor(genre) : COLORS.ink;
  const clickable = !!(userId && onClick);
  const label = age ? `${t("by_organiser", { org: name })} · ${age} ${t("profile_years")}` : t("by_organiser", { org: name });
  const content = (
    <>
      <div style={{
        width: size + 8, height: size + 8, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: size * 0.6,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: clickable ? "underline" : "none" }}>
        {label}
      </span>
    </>
  );
  if (clickable) {
    return (
      <ProfileHoverCard userId={userId}>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(userId); }}
          style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          {content}
        </button>
      </ProfileHoverCard>
    );
  }
  return <div style={{ display: "flex", alignItems: "center", gap: 7 }}>{content}</div>;
}

// Donne une intuition de la tranche d'âge d'une sortie — n'apparaît que s'il y a
// suffisamment de vraies personnes inscrites avec un âge connu (jamais de date exacte affichée).
function AvgAgeBadge({ avg, size = 11 }) {
  if (!avg) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, background: "#EDEAF4",
      color: COLORS.grape, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: size,
      padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {t("avg_age_badge", { age: avg })}
    </span>
  );
}

function PlainAvatar({ participant, color, size, overlap = false, genderMode = false, onViewProfile }) {
  const name = participantName(participant);
  const avatarColor = genderMode && participant?.genre ? genreColor(participant.genre) : color;
  const label = genderMode && participant?.genre ? `${name} (${adultGenreLabel(participant.genre)})` : name;
  // Sans taille explicite : suit la variable CSS --pika-avatar-size (réduite sur petit écran via media query)
  const dim = size !== undefined ? `${size}px` : "var(--pika-avatar-size, 26px)";
  const fontSize = size !== undefined ? size * 0.42 : "calc(var(--pika-avatar-size, 26px) * 0.42)";
  const clickable = participant?.isReal && participant?.userId && onViewProfile;
  // Le sexe est déjà indiqué par la couleur de fond de la bulle : pas d'anneau supplémentaire,
  // juste un fin liseré blanc pour détacher les bulles qui se chevauchent.
  const style = {
    width: dim, height: dim, minWidth: dim, borderRadius: "50%", background: avatarColor,
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, lineHeight: 1,
    fontSize, border: "2px solid #fff", boxSizing: "content-box", boxShadow: "none",
    marginLeft: overlap ? -10 : 0, flexShrink: 0,
    cursor: clickable ? "pointer" : "default", padding: 0,
  };
  // Les bulles n'affichent que l'initiale : charger une photo pleine taille pour une
  // vignette de 26px gaspillerait beaucoup de bande passante sur les longues listes.
  const content = name.charAt(0).toUpperCase();
  if (clickable) {
    return (
      <ProfileHoverCard userId={participant.userId}>
        <button title={label} onClick={(e) => { e.stopPropagation(); onViewProfile(participant.userId); }} style={style}>
          {content}
        </button>
      </ProfileHoverCard>
    );
  }
  return <div title={label} style={style}>{content}</div>;
}

// Affiche les participants sous forme de pastilles qui se chevauchent.
// Approche entièrement CSS : plus de mesure du conteneur (source de débordements),
// c'est le navigateur qui gère la largeur disponible.
function PlainParticipantsRow({ names, color, max = 5, genderMode = false, onViewProfile }) {
  if (!names || names.length === 0) return null;
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <div
      className="pika-avatars"
      style={{
        display: "flex", alignItems: "center", marginTop: 2,
        flexShrink: 0, paddingLeft: 2,
      }}
    >
      {shown.map((p, i) => (
        <PlainAvatar key={i} participant={p} color={color} overlap={i > 0} genderMode={genderMode} onViewProfile={onViewProfile} />
      ))}
      {extra > 0 && (
        <div
          title={`+${extra}`}
          style={{
            width: "var(--pika-avatar-size, 26px)", height: "var(--pika-avatar-size, 26px)",
            minWidth: "var(--pika-avatar-size, 26px)",
            borderRadius: "50%", background: "#EDEAF4",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            color: "#6B6485", fontFamily: "Nunito, sans-serif", fontWeight: 800, lineHeight: 1,
            fontSize: 10.5, border: "2px solid #fff", boxSizing: "content-box", marginLeft: -10,
          }}
        >
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

// Champ d'adresse avec suggestions en direct, via l'API officielle et gratuite du gouvernement
// (Base Adresse Nationale) — aide à saisir une adresse réelle et bien formée, sans obliger à la choisir.
// Petite mémoire des recherches déjà faites : les villes ne changent jamais,
// donc inutile d'interroger la base deux fois pour la même saisie.
const cacheVilles = {};

// Recherche de villes dans notre propre base (table "cities" sur Supabase) :
// couvre toute l'Europe, sans dépendre d'un service tiers qui pourrait nous limiter.
// Replis successifs : base Supabase → API française → liste locale intégrée.
function CommunePicker({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    let cancelled = false;

    // Déjà cherché : réponse immédiate, sans aller-retour serveur
    const cle = q.toLowerCase();
    if (cacheVilles[cle]) { setResults(cacheVilles[cle]); return; }

    const timer = setTimeout(async () => {
      // 1. Notre base de villes européennes
      try {
        const { data, error } = await supabase.rpc("search_cities", { q, lim: 8 });
        if (!cancelled && !error && data && data.length > 0) {
          const trouves = data.map((d) => ({
            nom: d.name, dept: d.country === "FR" ? (d.admin1 || "FR") : d.country,
            lat: d.lat, lon: d.lon,
          }));
          cacheVilles[cle] = trouves;
          setResults(trouves);
          return;
        }
      } catch (e) { /* on passe au repli suivant */ }

      // 2. API officielle française (plus précise sur les petites communes)
      try {
        const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,codeDepartement,centre&boost=population&limit=8`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setResults(data
              .map((d) => ({
                nom: d.nom, dept: d.codeDepartement,
                lat: d.centre?.coordinates?.[1], lon: d.centre?.coordinates?.[0],
              }))
              .filter((d) => d.lat && d.lon));
            return;
          }
        }
      } catch (e) { /* on passe au repli suivant */ }

      // 3. Liste locale intégrée, en dernier recours
      if (!cancelled) {
        setResults(Object.entries(CITY_META)
          .filter(([, v]) => v.label.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 6)
          .map(([, v]) => ({ nom: v.label, dept: v.dept, lat: v.lat, lon: v.lon })));
      }
    }, 150);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "11px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };

  return (
    <div style={{ position: "relative" }}>
      {value && !open ? (
        <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={15} color={COLORS.grass} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 700 }}>{value}</span>
          <button
            onClick={() => { setOpen(true); setQuery(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, color: COLORS.sky }}
          >
            {t("btn_edit")}
          </button>
        </div>
      ) : (
        <input
          autoFocus={open}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}

      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff",
          border: "2px solid #F0EADB", borderRadius: 14, boxShadow: "0 10px 24px rgba(43,37,96,0.14)",
          zIndex: 30, maxHeight: 220, overflowY: "auto",
        }}>
          {results.map((r, i) => (
            <button
              key={`${r.nom}-${r.dept}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(r); setQuery(""); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer",
                fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: COLORS.ink, borderBottom: "1px solid #F5F1E6",
              }}
            >
              <MapPin size={14} color="#B7AF98" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{r.nom}</span>
              <span style={{ fontSize: 11, color: "#B7AF98", fontWeight: 700 }}>{r.dept}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressInput({ value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value || value.trim().length < 3 || typeof fetch === "undefined") { setSuggestions([]); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled || !data) return;
          setSuggestions((data.features || []).map((f) => ({ label: f.properties.label, id: f.properties.id })));
        })
        .catch(() => { if (!cancelled) setSuggestions([]); });
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [value]);

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "12px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff",
          border: "2px solid #F0EADB", borderRadius: 14, boxShadow: "0 10px 24px rgba(43,37,96,0.14)",
          zIndex: 20, maxHeight: 220, overflowY: "auto",
        }}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s.label); setSuggestions([]); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer",
                fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: COLORS.ink, borderBottom: "1px solid #F5F1E6",
              }}
            >
              <MapPin size={14} color="#B7AF98" style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Idées de sorties proposées à la création : aide à démarrer quand on manque
// d'inspiration. Un clic remplit le titre, qui reste librement modifiable.
const IDEES_SORTIES = {
  // Famille
  nature: ["Balade au parc", "Chasse aux trésors en forêt", "Pique-nique au bord de l'eau", "Ramassage de feuilles et bricolage", "Observation des oiseaux"],
  creatif: ["Atelier peinture", "Fabrication de cerfs-volants", "Après-midi pâte à modeler", "Décoration de galets", "Atelier origami"],
  musique: ["Éveil musical", "Karaoké des enfants", "Fabrication d'instruments", "Petit concert improvisé"],
  jeux: ["Après-midi jeux de société", "Grands jeux en plein air", "Parcours d'obstacles", "Cache-cache géant"],
  sport: ["Sortie vélo en famille", "Initiation au foot", "Course d'orientation", "Après-midi trottinette"],
  // Adultes
  cafe: ["Café entre voisins", "Petit-déjeuner du dimanche", "Apéro de quartier", "Brunch entre parents"],
  culture: ["Visite du musée", "Sortie cinéma", "Balade patrimoine", "Visite d'exposition"],
  bienetre: ["Séance de yoga au parc", "Marche méditative", "Atelier relaxation", "Sophrologie en plein air"],
  jeuxsociete: ["Soirée jeux de société", "Tournoi de belote", "Soirée quiz", "Initiation aux échecs"],
  // Jeune
  jeuxvideo: ["Tournoi Mario Kart", "Soirée jeux en réseau", "Découverte de jeux rétro"],
  cinema: ["Sortie cinéma", "Ciné-club en plein air", "Marathon de films"],
  // Retraité
  marche: ["Marche douce du matin", "Randonnée tranquille", "Balade au bord du canal", "Marche nordique découverte"],
  ateliers: ["Atelier mémoire", "Club de lecture", "Atelier informatique", "Atelier cuisine"],
  jardinage: ["Jardinage partagé", "Bouturage entre voisins", "Entretien du jardin collectif", "Troc de graines"],
  // Commune
  mairie: ["Conseil de quartier", "Réunion d'information", "Cérémonie municipale"],
  benevolat: ["Nettoyage du quartier", "Distribution solidaire", "Aide aux devoirs"],
  fete: ["Fête des voisins", "Vide-grenier", "Marché de producteurs", "Kermesse"],
};

function IdeesSorties({ categorie, onChoisir }) {
  const idees = IDEES_SORTIES[categorie];
  if (!idees || idees.length === 0) return null;
  return (
    <div style={{
      background: "#FFF9EC", border: `2px solid ${COLORS.sun}`, borderRadius: 14,
      padding: "10px 12px", marginBottom: 4,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
        fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
      }}>
        <Sparkles size={14} color={COLORS.sun} /> {t("idees_titre")}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {idees.map((idee) => (
          <button
            key={idee}
            type="button"
            onClick={() => onChoisir(idee)}
            style={{
              background: "#fff", border: "2px solid #F0EADB", borderRadius: 999,
              padding: "5px 11px", cursor: "pointer", fontFamily: "Nunito, sans-serif",
              fontWeight: 700, fontSize: 12, color: COLORS.ink,
            }}
          >
            {idee}
          </button>
        ))}
      </div>
    </div>
  );
}

function CreateActivity({ onCreate }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "", category: "nature", lieu: "", dateStr: todayISO, timeStr: "10:00", age: "", places: 6, placesEnfants: 10, desc: "", payant: false, signeDistinctif: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.lieu || !form.dateStr) return;
    onCreate({
      title: form.title, category: form.category, lieu: form.lieu, age: form.age, desc: form.desc,
      dateStr: form.dateStr, timeStr: form.timeStr, places: Number(form.places) || 1, placesEnfants: Number(form.placesEnfants) || 0, payant: !!form.payant,
      signeDistinctif: form.signeDistinctif || null,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ title: "", category: "nature", lieu: "", dateStr: todayISO, timeStr: "10:00", age: "", places: 6, placesEnfants: 10, desc: "", payant: false, signeDistinctif: "" });
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

        <IdeesSorties categorie={form.category} onChoisir={(idee) => setForm({ ...form, title: idee })} />

        <div>
          <label style={label}>{t("label_categorie")}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={form.category === c.id} onClick={() => setForm({ ...form, category: c.id })} color={c.color}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <c.icon size={13} /> {c.label}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_lieu")}</label>
            <AddressInput value={form.lieu} onChange={(v) => setForm({ ...form, lieu: v })} placeholder={t("placeholder_lieu")} />
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
            <label style={label}>{t("label_places_parents")}</label>
            <input type="number" min={1} style={inputStyle} value={form.places} onChange={set("places")} />
          </div>
          <div>
            <label style={label}>{t("label_places_enfants")}</label>
            <input type="number" min={0} style={inputStyle} value={form.placesEnfants} onChange={set("placesEnfants")} />
          </div>
        </div>


        <div>
          <label style={label}>{t("label_payant")}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip active={!form.payant} onClick={() => setForm({ ...form, payant: false })} color={COLORS.grass}>{t("toggle_non")}</Chip>
            <Chip active={!!form.payant} onClick={() => setForm({ ...form, payant: true })} color={COLORS.coral}>{t("toggle_oui")}</Chip>
          </div>
        </div>
        <div>
          <label style={label}>{t("label_signe")}</label>
          <input style={inputStyle} placeholder={t("placeholder_signe")} value={form.signeDistinctif} onChange={set("signeDistinctif")} />
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

function MyOutings({ joined, activities, currentUserId, onOpen }) {
  const mine = activities.filter((a) => joined.includes(a.id));
  const created = mine.filter((a) => a.createdBy && a.createdBy === currentUserId);
  const joinedOnly = mine.filter((a) => !a.createdBy || a.createdBy !== currentUserId);

  const row = (a) => (
    <div key={a.id} onClick={() => onOpen && onOpen(a)} style={{
      background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: 14,
      display: "flex", alignItems: "center", gap: 12, cursor: onOpen ? "pointer" : "default",
    }}>
      <Stamp category={a.category} size={40} rotate={0} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15, color: COLORS.ink }}>{a.title}</div>
        <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485" }}>{displayDate(a)} · {lieuAvecVille(a)}</div>
      </div>
      {onOpen && <ChevronRight size={18} color="#C7C0AE" />}
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("my_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {t("my_subtitle")}
      </p>

      <SectionLabel>{t("my_created_label")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {created.length === 0 ? <EmptyBox text={t("my_created_empty")} /> : created.map(row)}
      </div>

      <SectionLabel>{t("my_joined_label")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {joinedOnly.length === 0 ? <EmptyBox text={t("my_joined_empty")} /> : joinedOnly.map(row)}
      </div>
    </div>
  );
}

// Formulaire de modification du profil (atteint via le bouton Modifier de la page profil)
// Page profil en lecture : une vraie fiche présentable, avec un bouton "Modifier"
// qui bascule vers le formulaire d'édition (ProfileEdit).
function ProfileView({ displayName, email, avatarUrl, coverUrl, genre, birthdate, bio, nbEnfants, joinedCount, createdCount, validated, commune, communeNom, role, situation, profession, interets, animaux, coupDeCoeur, onEdit, onSignOut, onOpenLegal }) {
  const age = birthdate ? ageFromBirthdate(birthdate) : null;
  const color = genre ? genreColor(genre) : COLORS.sky;

  // Ligne courte : label à gauche, valeur à droite (email, genre, date…)
  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, padding: "10px 0", borderBottom: "1px solid #F5F1E6" }}>
      <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF", fontWeight: 700, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: value ? COLORS.ink : "#C7C0AE",
        fontWeight: 700, textAlign: "right", lineHeight: 1.45, minWidth: 0,
        overflowWrap: "anywhere", wordBreak: "break-word",
      }}>
        {value || t("profile_not_filled")}
      </span>
    </div>
  );

  // Carte "À propos" : le label au-dessus, le texte dessous sur toute la largeur —
  // adapté aux textes longs, qui ne débordent plus et restent lisibles.
  const AboutCard = ({ icon, label, value, accent }) => (
    <div style={{
      background: "#fff", border: "2px solid #F0EADB", borderRadius: 18,
      padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: `${accent}18`, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: "Nunito, sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5,
          textTransform: "uppercase", color: accent, marginBottom: 3,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, fontWeight: 600,
          lineHeight: 1.5, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap",
        }}>
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* En-tête : couverture, photo, pseudo, âge */}
      <div style={{
        background: "#fff", border: "2px solid #F0EADB", borderRadius: 22,
        textAlign: "center", marginBottom: 14,
      }}>
        {/* Bandeau de couverture : hauteur proportionnelle à la largeur (ratio ~2.6:1),
            donc bien plus généreuse sur grand écran, avec des bornes pour rester raisonnable. */}
        <div className="pika-cover" style={{
          width: "100%", position: "relative",
          aspectRatio: "26 / 10", minHeight: 190, maxHeight: 380,
          borderRadius: "20px 20px 0 0",
          background: coverUrl
            ? `url(${coverUrl}) center center / cover no-repeat`
            : `linear-gradient(135deg, ${COLORS.sun}, ${COLORS.coral})`,
        }}>
          <div className="pika-cover-avatar" style={{
            width: 160, height: 160, borderRadius: "50%", background: color,
            position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 62, color: "#fff",
            boxShadow: genre
              ? `0 0 0 6px #fff, 0 0 0 9px ${genreColor(genre)}60`
              : "0 0 0 6px #fff",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (displayName || "?").charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div style={{ padding: "34px 18px 24px" }}>
        <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 22, color: COLORS.ink }}>
          {displayName}
        </div>
        {age !== null && (
          <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#6B6485", marginTop: 2 }}>
            {age} {t("profile_years")}
          </div>
        )}
        {commune && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485", fontWeight: 700 }}>
            <MapPin size={13} color="#B7AF98" /> {communeNom || villeName(commune)}
          </div>
        )}

        {bio && (
          <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#5C5578", lineHeight: 1.55, margin: "14px 4px 0" }}>
            {bio}
          </p>
        )}

        <PillButton color={COLORS.ink} textColor="#fff" onClick={onEdit} style={{ marginTop: 18, padding: "10px 22px", fontSize: 13.5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <UserCircle2 size={16} /> {t("btn_edit_profile")}
          </span>
        </PillButton>
        </div>
      </div>

      {/* Compteurs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: "14px 10px", textAlign: "center" }}>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.grass }}>{createdCount}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485" }}>{t("profile_count_created")}</div>
        </div>
        <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: "14px 10px", textAlign: "center" }}>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.sky }}>{joinedCount}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485" }}>{t("profile_count_joined")}</div>
        </div>
      </div>

      {/* Validation mairie */}
      <div style={{
        background: validated ? "#EAF8ED" : "#FFF4DD",
        border: `2px solid ${validated ? COLORS.grass : COLORS.sun}`,
        borderRadius: 18, padding: "12px 16px", marginBottom: 14,
        display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
      }}>
        {validated ? <ShieldCheck size={18} color={COLORS.grass} style={{ flexShrink: 0, marginTop: 1 }} /> : <Baby size={18} color={COLORS.sun} style={{ flexShrink: 0, marginTop: 1 }} />}
        <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5 }}>
          {validated ? t("access_parent_ok") : t("access_parent_locked")}
        </span>
      </div>

      {/* Informations privées */}
      {(profession || interets || animaux || coupDeCoeur) && (
        <>
          <SectionLabel>{t("profile_about_section")}</SectionLabel>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 10, marginBottom: 20,
          }}>
            {profession && (
              <AboutCard icon={<BookOpen size={16} color={COLORS.sky} />} label={t("profile_profession_label")} value={profession} accent={COLORS.sky} />
            )}
            {interets && (
              <AboutCard icon={<Sparkles size={16} color={COLORS.grape} />} label={t("profile_interets_label")} value={interets} accent={COLORS.grape} />
            )}
            {animaux && (
              <AboutCard icon={<HeartHandshake size={16} color={COLORS.grass} />} label={t("profile_animaux_label")} value={animaux} accent={COLORS.grass} />
            )}
            {coupDeCoeur && (
              <AboutCard icon={<Heart size={16} color={COLORS.coral} />} label={t("profile_coeur_label")} value={coupDeCoeur} accent={COLORS.coral} />
            )}
          </div>
        </>
      )}

      <SectionLabel>{t("profile_private_info")}</SectionLabel>
      <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 18, padding: "6px 16px 10px", marginBottom: 20 }}>
        <InfoRow label={t("auth_email")} value={email} />
        <InfoRow label={t("profile_genre_label")} value={genre ? (genre === "F" ? t("legend_femme") : t("legend_homme")) : null} />
        <InfoRow label={t("profile_situation_label")} value={situationLabel(situation)} />
        <InfoRow label={t("profile_nb_enfants_label")} value={nbEnfants > 0 ? `${nbEnfants}` : null} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0" }}>
          <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF", fontWeight: 700 }}>{t("auth_birthdate_label")}</span>
          <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: birthdate ? COLORS.ink : "#C7C0AE", fontWeight: 700 }}>
            {birthdate ? new Date(birthdate).toLocaleDateString(LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US") : t("profile_not_filled")}
          </span>
        </div>
      </div>

      {/* Nombre d'enfants (affiché dans les informations privées) */}

      {/* Liens légaux + déconnexion */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { id: "mentions", label: t("legal_mentions_title") },
          { id: "cgu", label: t("legal_cgu_title") },
          { id: "confidentialite", label: t("legal_confidentialite_title") },
        ].map((d) => (
          <button key={d.id} onClick={() => onOpenLegal(d.id)} style={{
            background: "none", border: "none", color: "#9A93AF", fontFamily: "Nunito, sans-serif",
            fontWeight: 700, fontSize: 11.5, cursor: "pointer", textDecoration: "underline",
          }}>
            {d.label}
          </button>
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

// Petit champ texte du profil, avec son propre bouton d'enregistrement et son accusé de réception.
function ProfileTextField({ label, placeholder, value, onSave, multiline = false, maxLength = 160 }) {
  const [input, setInput] = useState(value || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await onSave(input);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const baseStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "10px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <SectionLabel>{label}</SectionLabel>
      {multiline ? (
        <textarea
          rows={2} value={input} onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          placeholder={placeholder} style={{ ...baseStyle, resize: "vertical", marginBottom: 6 }}
        />
      ) : (
        <input
          value={input} onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          placeholder={placeholder} style={{ ...baseStyle, marginBottom: 6 }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#B7AF98" }}>{input.length}/{maxLength}</span>
        <PillButton color={saved ? COLORS.grass : COLORS.ink} textColor="#fff" onClick={save} style={{ padding: "7px 14px", fontSize: 12.5 }}>
          {saved ? <Check size={14} /> : t("btn_enregistrer")}
        </PillButton>
      </div>
    </div>
  );
}

function ProfileEdit({ onBack,  joinedCount, validated, displayName, email, nbEnfants, onUpdateNbEnfants, nbEnfantsMoins12, onUpdateNbEnfantsMoins12, onSignOut, avatarUrl, onUploadAvatar, birthdate, onUpdateBirthdate, onOpenLegal, bio, onUpdateBio, genre, onUpdateGenre, onUpdatePseudo, situation, onUpdateSituation, profession, interets, animaux, coupDeCoeur, onUpdateField, coverUrl, onUploadCover, onRemoveCover, communeNom, onUpdateCommune }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [birthdateInput, setBirthdateInput] = useState(birthdate || "");
  const [bioInput, setBioInput] = useState(bio || "");
  const [bioSaved, setBioSaved] = useState(false);
  const [birthdateSaved, setBirthdateSaved] = useState(false);
  const [genreSaving, setGenreSaving] = useState(false);
  const [pseudoInput, setPseudoInput] = useState(displayName || "");
  const [pseudoSaved, setPseudoSaved] = useState(false);
  const [pseudoErreur, setPseudoErreur] = useState("");
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setUploadError("");
    const res = await onUploadCover(file);
    if (res && res.error) setUploadError(res.error);
    setCoverUploading(false);
  };

  const saveBirthdate = async () => {
    await onUpdateBirthdate(birthdateInput);
    setBirthdateSaved(true);
    setTimeout(() => setBirthdateSaved(false), 2000);
  };

  const saveBio = async () => {
    await onUpdateBio(bioInput);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  };

  const savePseudo = async () => {
    if (!pseudoInput.trim()) return;
    setPseudoErreur("");
    const res = await onUpdatePseudo(pseudoInput);
    if (res && res.error) { setPseudoErreur(res.error); return; }
    setPseudoSaved(true);
    setTimeout(() => setPseudoSaved(false), 2000);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    setUploading(true);
    const { error } = await onUploadAvatar(file);
    if (error) setUploadError(error);
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} aria-label={t("btn_back")} style={{
          width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "2px solid #F0EADB",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <ArrowLeft size={16} color={COLORS.ink} />
        </button>
        <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink, margin: 0 }}>
          {t("profile_edit_title")}
        </h1>
      </div>

      {/* Photo de couverture */}
      <SectionLabel>{t("profile_cover_label")}</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          height: 130, borderRadius: 18, marginBottom: 8, position: "relative", overflow: "hidden",
          border: "2px solid #F0EADB",
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${COLORS.sun}, ${COLORS.coral})`,
        }}>
          {coverUploading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(255,255,255,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13, color: COLORS.ink,
            }}>
              {t("photo_uploading")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => coverInputRef.current?.click()} disabled={coverUploading} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#fff", border: "2px solid #F0EADB", borderRadius: 12, padding: "9px 14px",
            color: COLORS.ink, fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "Nunito, sans-serif",
            opacity: coverUploading ? 0.6 : 1,
          }}>
            <Camera size={14} /> {coverUrl ? t("profile_cover_change") : t("profile_cover_add")}
          </button>
          {coverUrl && (
            <button onClick={onRemoveCover} style={{
              background: "transparent", border: `2px solid ${COLORS.coral}`, borderRadius: 12,
              padding: "9px 14px", color: COLORS.coral, fontWeight: 800, fontSize: 12.5,
              cursor: "pointer", fontFamily: "Nunito, sans-serif",
            }}>
              {t("btn_delete")}
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 104, height: 104, borderRadius: "50%", background: COLORS.sky,
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 40, color: "#fff",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (displayName || "?").charAt(0).toUpperCase()
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label={t("change_photo")}
            style={{
              position: "absolute", bottom: 2, right: 2, width: 34, height: 34, borderRadius: "50%",
              background: COLORS.ink, border: "3px solid #fff", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1,
            }}
          >
            <Camera size={16} color="#fff" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
        </div>
        <div>
          <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>{displayName}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF" }}>{email}</div>
          <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#6B6485" }}>{t("profile_outings_count", { n: joinedCount })}</div>
        </div>
      </div>

      {uploading && (
        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#9A93AF", margin: "-14px 0 16px" }}>{t("photo_uploading")}</p>
      )}
      {uploadError && (
        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: COLORS.coral, margin: "-14px 0 16px" }}>{uploadError}</p>
      )}

      <SectionLabel>{t("auth_pseudo")}</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <input
          value={pseudoInput} onChange={(e) => setPseudoInput(e.target.value)}
          style={{
            flex: 1, border: "2px solid #F0EADB", borderRadius: 14, padding: "10px 14px",
            fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, outline: "none", boxSizing: "border-box",
          }}
        />
        <PillButton color={pseudoSaved ? COLORS.grass : COLORS.ink} textColor="#fff" onClick={savePseudo} style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}>
          {pseudoSaved ? <Check size={16} /> : t("btn_enregistrer")}
        </PillButton>
      </div>
      <p style={{
        fontFamily: "Nunito, sans-serif", fontSize: 11.5,
        color: pseudoErreur ? COLORS.coral : "#9A93AF",
        fontWeight: pseudoErreur ? 700 : 400, margin: "0 0 22px",
      }}>
        {pseudoErreur || t("auth_pseudo_note")}
      </p>

      <SectionLabel>{t("profile_genre_label")}</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[
          { id: "F", label: t("legend_femme") },
          { id: "H", label: t("legend_homme") },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={async () => {
              setGenreSaving(true);
              await onUpdateGenre(opt.id);
              setGenreSaving(false);
            }}
            style={{
              flex: 1, border: `2px solid ${genre === opt.id ? genreColor(opt.id) : "#F0EADB"}`,
              background: genre === opt.id ? genreColor(opt.id) : "#fff",
              color: genre === opt.id ? "#fff" : COLORS.ink,
              borderRadius: 14, padding: "10px 8px", fontFamily: "Nunito, sans-serif",
              fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: genreSaving ? 0.6 : 1,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <SectionLabel>{t("profile_commune_label")}</SectionLabel>
      <div style={{ marginBottom: 6 }}>
        <CommunePicker
          value={communeNom}
          onSelect={onUpdateCommune}
          placeholder={t("profile_commune_search")}
        />
      </div>
      <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF", margin: "0 0 22px" }}>
        {t("profile_commune_note")}
      </p>

      <SectionLabel>{t("profile_situation_label")}</SectionLabel>
      <select
        value={situation || ""}
        onChange={(e) => onUpdateSituation(e.target.value || null)}
        style={{
          width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "11px 14px",
          fontFamily: "Nunito, sans-serif", fontSize: 14, color: situation ? COLORS.ink : "#B7AF98",
          outline: "none", boxSizing: "border-box", background: "#fff", marginBottom: 22,
        }}
      >
        <option value="">{t("situation_non_precise")}</option>
        {SITUATIONS.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      <ProfileTextField
        label={t("profile_profession_label")} placeholder={t("profile_profession_ph")}
        value={profession} onSave={(v) => onUpdateField("profession", v)} maxLength={60}
      />
      <ProfileTextField
        label={t("profile_interets_label")} placeholder={t("profile_interets_ph")}
        value={interets} onSave={(v) => onUpdateField("interets", v)} multiline maxLength={160}
      />
      <ProfileTextField
        label={t("profile_animaux_label")} placeholder={t("profile_animaux_ph")}
        value={animaux} onSave={(v) => onUpdateField("animaux", v)} maxLength={80}
      />
      <ProfileTextField
        label={t("profile_coeur_label")} placeholder={t("profile_coeur_ph")}
        value={coupDeCoeur} onSave={(v) => onUpdateField("coupDeCoeur", v)} multiline maxLength={160}
      />

      <SectionLabel>{t("auth_birthdate_label")}</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 22, alignItems: "center" }}>
        <input
          type="date" value={birthdateInput} onChange={(e) => setBirthdateInput(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          style={{
            flex: 1, border: "2px solid #F0EADB", borderRadius: 14, padding: "10px 14px",
            fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, outline: "none", boxSizing: "border-box",
          }}
        />
        <PillButton color={birthdateSaved ? COLORS.grass : COLORS.ink} textColor="#fff" onClick={saveBirthdate} style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}>
          {birthdateSaved ? <Check size={16} /> : t("btn_enregistrer")}
        </PillButton>
      </div>

      <SectionLabel>{t("profile_bio_label")}</SectionLabel>
      <div style={{ marginBottom: 22 }}>
        <textarea
          rows={3} value={bioInput} onChange={(e) => setBioInput(e.target.value.slice(0, 220))}
          placeholder={t("profile_bio_placeholder")}
          style={{
            width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "10px 14px",
            fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: COLORS.ink, outline: "none",
            boxSizing: "border-box", resize: "vertical", marginBottom: 6,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#B7AF98" }}>{bioInput.length}/220</span>
          <PillButton color={bioSaved ? COLORS.grass : COLORS.ink} textColor="#fff" onClick={saveBio} style={{ padding: "8px 16px", fontSize: 12.5 }}>
            {bioSaved ? <Check size={15} /> : t("btn_enregistrer")}
          </PillButton>
        </div>
      </div>

      <SectionLabel>{t("profile_nb_enfants_label")}</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button
          onClick={() => onUpdateNbEnfants(Math.max(0, (nbEnfants || 0) - 1))}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "2px solid #F0EADB", background: "#fff",
            cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 20, color: COLORS.ink, flexShrink: 0,
          }}
        >
          −
        </button>
        <div style={{
          flex: 1, textAlign: "center", background: "#fff", border: "2px solid #F0EADB", borderRadius: 12,
          padding: "9px 0", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink,
        }}>
          {nbEnfants || 0}
        </div>
        <button
          onClick={() => onUpdateNbEnfants(Math.min(12, (nbEnfants || 0) + 1))}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "2px solid #F0EADB", background: "#fff",
            cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 20, color: COLORS.ink, flexShrink: 0,
          }}
        >
          +
        </button>
      </div>
      <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF", margin: "0 0 22px" }}>
        {t("profile_nb_enfants_note")}
      </p>

      <SectionLabel>{t("profile_nb_moins12_label")}</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button
          onClick={() => onUpdateNbEnfantsMoins12(Math.max(0, (nbEnfantsMoins12 || 0) - 1))}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "2px solid #F0EADB", background: "#fff",
            cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 20, color: COLORS.ink, flexShrink: 0,
          }}
        >
          −
        </button>
        <div style={{
          flex: 1, textAlign: "center", background: "#fff", border: "2px solid #F0EADB", borderRadius: 12,
          padding: "9px 0", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink,
        }}>
          {nbEnfantsMoins12 || 0}
        </div>
        <button
          onClick={() => onUpdateNbEnfantsMoins12(Math.min(nbEnfants || 0, (nbEnfantsMoins12 || 0) + 1))}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "2px solid #F0EADB", background: "#fff",
            cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 20, color: COLORS.ink, flexShrink: 0,
          }}
        >
          +
        </button>
      </div>
      <p style={{
        fontFamily: "Nunito, sans-serif", fontSize: 11.5,
        color: (nbEnfantsMoins12 || 0) > 0 ? COLORS.grass : "#9A93AF",
        fontWeight: (nbEnfantsMoins12 || 0) > 0 ? 700 : 400,
        margin: "0 0 22px",
      }}>
        {(nbEnfantsMoins12 || 0) > 0 ? t("access_parent_ok") : t("access_parent_locked")}
      </p>

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

      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { id: "mentions", label: t("legal_mentions_title") },
          { id: "cgu", label: t("legal_cgu_title") },
          { id: "confidentialite", label: t("legal_confidentialite_title") },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => onOpenLegal(d.id)}
            style={{ background: "none", border: "none", color: "#9A93AF", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, cursor: "pointer", textDecoration: "underline" }}
          >
            {d.label}
          </button>
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

// Mascotte originale pour "Orée" — un soleil levant qui perce derrière une lisière
// de collines/arbres arrondis, avec une petite feuille qui s'envole en accent.
// Petit compagnon qui se promène en bas de l'écran et fait des grimaces.
// Volontairement discret : il ne gêne aucun clic (pointerEvents: none sauf sur lui-même),
// et un clic le fait partir pour la session si on préfère être tranquille.
function OreeMascot({ size = 28, rotate = -6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `rotate(${rotate}deg)`, flexShrink: 0 }}>
      <circle cx="20" cy="19" r="12" fill={COLORS.sun} />
      <circle cx="7" cy="30" r="8" fill={COLORS.grass} />
      <circle cx="18" cy="27" r="10" fill={COLORS.grass} />
      <circle cx="30" cy="30" r="8" fill={COLORS.grass} />
      <rect x="0" y="32" width="40" height="8" fill={COLORS.grass} />
      <path d="M33 5 Q38 5 37 10 Q32 11 32 6 Q32 5 33 5 Z" fill={COLORS.sky} />
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

  // Recherche dans notre base de villes européennes (table "cities"), avec repli
  // sur l'API française puis sur la liste locale intégrée.
  useEffect(() => {
    if (query.trim().length < 2) { setRemoteResults([]); return; }
    let cancelled = false;
    const cle = query.trim().toLowerCase();
    if (cacheVilles[cle]) { setRemoteResults(cacheVilles[cle]); return; }

    const timer = setTimeout(async () => {
      // 1. Base de villes européennes
      try {
        const { data, error } = await supabase.rpc("search_cities", { q: query, lim: 6 });
        if (!cancelled && !error && data && data.length > 0) {
          const trouves = data.map((d) => ({
            nom: d.name, dept: d.country === "FR" ? (d.admin1 || "FR") : d.country,
            lat: d.lat, lon: d.lon,
          }));
          cacheVilles[cle] = trouves;
          setRemoteResults(trouves);
          return;
        }
      } catch (e) { /* repli suivant */ }

      // 2. API officielle française
      if (typeof fetch === "undefined") return;
      try {
        const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codeDepartement,centre&boost=population&limit=6`);
        const data = r.ok ? await r.json() : [];
        if (!cancelled && Array.isArray(data)) {
          setRemoteResults(data.map((d) => ({
            nom: d.nom, dept: d.codeDepartement,
            lat: d.centre?.coordinates?.[1], lon: d.centre?.coordinates?.[0],
          })).filter((d) => d.lat && d.lon));
        }
      } catch (e) { if (!cancelled) setRemoteResults([]); }
    }, 150);
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
    setQuery(p.nom);
  };
  const pickDept = (d) => {
    onChange({ type: "departement", code: d.code, nom: d.nom });
    setQuery(d.nom);
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
              onFocus={() => { if (location && query === location.nom) setQuery(""); }}
              placeholder={t("loc_placeholder")}
              style={{
                width: "100%", border: "2px solid #F0EADB", borderRadius: 12, padding: "9px 12px",
                fontFamily: "Nunito, sans-serif", fontSize: 13.5, outline: "none", boxSizing: "border-box",
                marginBottom: 8,
              }}
            />

            <CityOption label={t("loc_all_france")} active={!location} onClick={() => { onChange(null); setQuery(""); setOpen(false); }} />

            {/* Le lieu choisi reste visible même quand la recherche est vide */}
            {location && (query.trim().length === 0 || query.trim() === location.nom) && (
              <CityOption
                label={location.type === "departement" ? `${location.nom} (${location.code})` : location.nom}
                sub={location.type === "departement" ? t("loc_dept") : (location.dept ? t("loc_ville_dept", { d: location.dept }) : t("loc_ville"))}
                active
                onClick={() => {}}
              />
            )}

            {query.trim().length > 0 && query.trim() !== (location?.nom || "") && (
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

// Fiche publique minimale d'un utilisateur : juste ce qui est nécessaire pour savoir qui organise
// (pseudo, genre, ancienneté) — jamais l'email ni d'autre donnée privée.
// ---------- Contenus juridiques ----------
// Rédigés à partir des fonctionnalités réelles d'Orée. Ce sont des premiers jets :
// à faire relire par un professionnel avant toute mise en ligne publique,
// notamment sur les points liés aux mineurs.
const LEGAL_MENTIONS = `
**Éditeur du site**
[Votre nom ou raison sociale à compléter]
[Adresse à compléter]
Email de contact : [votre-email@exemple.com]

**Hébergement**
Le site est hébergé par Vercel Inc. (hébergement de l'application) et Supabase Inc. (base de données et authentification). Leurs conditions et politiques respectives s'appliquent au traitement technique des données.

**Directeur de publication**
[Votre nom à compléter]

**Propriété intellectuelle**
L'ensemble des éléments graphiques et le nom "Orée" sont la propriété de l'éditeur, sauf mention contraire. Les contenus publiés par les utilisateurs (titres, descriptions de sorties, photos de profil) restent la propriété de leurs auteurs.
`.trim();

const LEGAL_CGU = `
**1. Objet**
Orée est une application permettant à des particuliers, associations et mairies d'organiser et de rejoindre des sorties locales (enfants, jeunes, adultes, aînés) et des événements communaux.

**2. Accès au service**
L'inscription nécessite une adresse email valide. La consultation des sorties Adultes et Aînés est possible sans compte ; la création de compte est nécessaire pour rejoindre une sortie, en proposer une, ou accéder aux sorties concernant des enfants ou des jeunes.

**3. Validation par la mairie**
L'accès aux sorties impliquant des enfants ou des jeunes est soumis à une validation par la mairie du territoire concerné. Cette validation est un contrôle organisationnel et ne constitue pas une vérification d'identité approfondie ; les utilisateurs restent responsables de leur propre vigilance.

**4. Comportement attendu**
Chaque utilisateur s'engage à :
- fournir des informations exactes ;
- adopter un comportement respectueux envers les autres membres ;
- ne pas publier de contenu illicite, trompeur ou inapproprié, en particulier vis-à-vis des mineurs ;
- signaler tout comportement ou contenu problématique via la fonction de signalement intégrée.

**5. Modération**
L'éditeur se réserve le droit de suspendre, bloquer ou supprimer tout compte ne respectant pas ces règles, sans préavis en cas de manquement grave (sécurité des mineurs notamment).

**6. Responsabilité**
Orée est un service de mise en relation. L'éditeur n'est pas partie aux sorties organisées entre utilisateurs et ne peut être tenu responsable du déroulement de ces rencontres, du comportement des participants, ou des informations qu'ils publient. Chaque utilisateur reste seul responsable des sorties qu'il organise ou rejoint, notamment s'agissant de la surveillance de ses propres enfants.

**7. Droit applicable**
Les présentes CGU sont soumises au droit français.
`.trim();

const LEGAL_CONFIDENTIALITE = `
**1. Données collectées**
Selon les fonctionnalités utilisées, Orée peut collecter : adresse email, prénom et nom, genre, date de naissance, commune de résidence, photo de profil, informations sur les enfants renseignées par le parent (prénom, âge, genre), participation aux sorties, contenu des sorties créées, et le contenu des éventuels signalements effectués.

**2. Finalités**
Ces données sont utilisées pour : créer et gérer le compte, permettre la mise en relation entre utilisateurs, assurer la validation des comptes par la mairie compétente, afficher une tranche d'âge indicative sur les sorties, assurer la modération et la sécurité du service.

**3. Base légale**
Le traitement repose sur l'exécution du contrat (fourniture du service) et, pour certaines données optionnelles (date de naissance, photo, commune), sur le consentement de l'utilisateur.

**4. Mineurs**
Les comptes "Particulier" peuvent être créés par des personnes mineures. Conformément à la réglementation, la création de compte par un mineur de moins de 15 ans requiert le consentement d'un titulaire de l'autorité parentale. Les informations concernant les enfants sont renseignées par le parent titulaire du compte, sous sa responsabilité.

**5. Durée de conservation**
Les données sont conservées tant que le compte est actif. En cas de suppression de compte par un administrateur, les sorties créées et les informations des enfants associées sont effacées ; certaines données peuvent être conservées de façon anonymisée à des fins statistiques.

**6. Destinataires et sous-traitants**
Les données sont hébergées par Supabase Inc. (base de données, authentification, stockage des photos) et Vercel Inc. (hébergement de l'application). Aucune donnée n'est vendue à des tiers.

**7. Vos droits**
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition sur vos données. Vous pouvez modifier directement votre profil (photo, date de naissance) depuis l'application, ou nous contacter à [votre-email@exemple.com] pour toute autre demande.

**8. Sécurité**
L'accès aux données est protégé par des règles de sécurité au niveau de la base de données (chaque utilisateur n'accède qu'à ce qui le concerne), et les actions de modération sont réservées aux comptes habilités (mairie, administration).

**9. Cookies**
Orée utilise uniquement des cookies strictement nécessaires au fonctionnement (maintien de la connexion). Aucun cookie publicitaire ou de suivi n'est utilisé.
`.trim();

function LegalTextBlock({ text }) {
  return (
    <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#5C5578", lineHeight: 1.7, whiteSpace: "pre-line" }}>
      {text.split("\n\n").map((para, i) => {
        const parts = para.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ margin: "0 0 14px" }}>
            {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} style={{ color: COLORS.ink }}>{part}</strong> : part))}
          </p>
        );
      })}
    </div>
  );
}

function LegalModal({ doc, onClose }) {
  if (!doc) return null;
  const docs = {
    mentions: { title: t("legal_mentions_title"), text: LEGAL_MENTIONS },
    cgu: { title: t("legal_cgu_title"), text: LEGAL_CGU },
    confidentialite: { title: t("legal_confidentialite_title"), text: LEGAL_CONFIDENTIALITE },
  };
  const current = docs[doc];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 10000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cloud, width: "100%", maxWidth: 560, borderRadius: "26px 26px 0 0",
        padding: "24px 24px calc(24px + env(safe-area-inset-bottom))", maxHeight: "calc(100dvh - 100px)", overflowY: "auto", boxSizing: "border-box", position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "sticky", top: 0, float: "right", background: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", marginLeft: 12 }}>
          <X size={18} color={COLORS.ink} />
        </button>
        <h2 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink, margin: "0 0 16px" }}>
          {current.title}
        </h2>
        <LegalTextBlock text={current.text} />
      </div>
    </div>
  );
}

// Page profil publique d'un autre membre : même présentation que sa propre page profil
// (couverture, grande photo, informations), en lecture seule et sans les données privées.
function UserProfilePage({ userId, onClose, currentUserId, onReport, onMessage, canMessage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    supabase.from("profiles")
      .select("display_name, genre, role, association_name, created_at, avatar_url, cover_url, bio, birthdate, commune, situation, profession, interets, animaux, coup_de_coeur")
      .eq("id", userId).single()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data) { setError(true); } else { setProfile(data); }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const name = profile?.role === "association" ? (profile?.association_name || profile?.display_name) : profile?.display_name;
  const age = profile?.birthdate ? ageFromBirthdate(profile.birthdate) : null;
  const color = profile?.genre ? genreColor(profile.genre) : COLORS.sky;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(
    LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" }
  ) : null;

  const AboutCard = ({ icon, label, value, accent }) => (
    <div style={{
      background: "#fff", border: "2px solid #F0EADB", borderRadius: 18,
      padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: `${accent}18`, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: "Nunito, sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5,
          textTransform: "uppercase", color: accent, marginBottom: 3,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, fontWeight: 600,
          lineHeight: 1.5, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap",
        }}>
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: COLORS.cloud, zIndex: 9999,
      overflowY: "auto", padding: "16px 16px calc(24px + env(safe-area-inset-bottom))",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={onClose} style={{
          display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14,
          background: "#fff", border: "2px solid #F0EADB", borderRadius: 999,
          padding: "8px 16px", cursor: "pointer", fontFamily: "Nunito, sans-serif",
          fontWeight: 800, fontSize: 13, color: COLORS.ink,
        }}>
          <ArrowLeft size={15} /> {t("btn_back")}
        </button>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <OreeMascot size={44} />
          </div>
        )}
        {!loading && error && (
          <EmptyBox text={t("profile_not_found")} />
        )}

        {!loading && !error && profile && (
          <>
            <div style={{
              background: "#fff", border: "2px solid #F0EADB", borderRadius: 22,
              textAlign: "center", marginBottom: 14,
            }}>
              <div className="pika-cover" style={{
                width: "100%", position: "relative",
                aspectRatio: "26 / 10", minHeight: 190, maxHeight: 380,
                borderRadius: "20px 20px 0 0",
                background: profile.cover_url
                  ? `url(${profile.cover_url}) center center / cover no-repeat`
                  : `linear-gradient(135deg, ${COLORS.sun}, ${COLORS.coral})`,
              }}>
                <div className="pika-cover-avatar" style={{
                  width: 160, height: 160, borderRadius: "50%", background: color,
                  position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                  fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 62, color: "#fff",
                  boxShadow: profile.genre
                    ? `0 0 0 6px #fff, 0 0 0 9px ${genreColor(profile.genre)}60`
                    : "0 0 0 6px #fff",
                }}>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (name || "?").charAt(0).toUpperCase()}
                </div>
              </div>

              <div style={{ padding: "34px 18px 24px" }}>
                <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 22, color: COLORS.ink }}>
                  {name}
                </div>
                {age !== null && (
                  <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#6B6485", marginTop: 2 }}>
                    {age} {t("profile_years")}
                  </div>
                )}
                {profile.role === "association" && (
                  <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, color: COLORS.grape, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 6 }}>
                    {t("account_type_association")}
                  </div>
                )}
                {profile.commune && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485", fontWeight: 700 }}>
                    <MapPin size={13} color="#B7AF98" /> {villeName(profile.commune)}
                  </div>
                )}
                {profile.bio && (
                  <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#5C5578", lineHeight: 1.55, margin: "14px 4px 0" }}>
                    {profile.bio}
                  </p>
                )}
                {memberSince && (
                  <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#B7AF98", marginTop: 12 }}>
                    {t("member_since", { date: memberSince })}
                  </div>
                )}
              </div>
            </div>

            {(profile.profession || profile.interets || profile.animaux || profile.coup_de_coeur || profile.situation) && (
              <>
                <SectionLabel>{t("profile_about_section")}</SectionLabel>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 10, marginBottom: 20,
                }}>
                  {profile.situation && (
                    <AboutCard icon={<Users size={16} color={COLORS.sun} />} label={t("profile_situation_label")} value={situationLabel(profile.situation)} accent={COLORS.sun} />
                  )}
                  {profile.profession && (
                    <AboutCard icon={<BookOpen size={16} color={COLORS.sky} />} label={t("profile_profession_label")} value={profile.profession} accent={COLORS.sky} />
                  )}
                  {profile.interets && (
                    <AboutCard icon={<Sparkles size={16} color={COLORS.grape} />} label={t("profile_interets_label")} value={profile.interets} accent={COLORS.grape} />
                  )}
                  {profile.animaux && (
                    <AboutCard icon={<HeartHandshake size={16} color={COLORS.grass} />} label={t("profile_animaux_label")} value={profile.animaux} accent={COLORS.grass} />
                  )}
                  {profile.coup_de_coeur && (
                    <AboutCard icon={<Heart size={16} color={COLORS.coral} />} label={t("profile_coeur_label")} value={profile.coup_de_coeur} accent={COLORS.coral} />
                  )}
                </div>
              </>
            )}

            {userId !== currentUserId && canMessage && (
              <PillButton color={COLORS.sky} textColor="#fff" onClick={() => onMessage(userId)} style={{ width: "100%", marginBottom: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <Mail size={16} /> {t("pm_write_to")}
                </span>
              </PillButton>
            )}
            {userId !== currentUserId && !canMessage && (
              <p style={{
                fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF",
                textAlign: "center", lineHeight: 1.5, margin: "0 0 10px",
              }}>
                {t("pm_need_shared_outing")}
              </p>
            )}
            {userId !== currentUserId && (
              <button
                onClick={() => onReport(userId)}
                style={{
                  display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
                  color: "#B7AF98", fontWeight: 700, fontSize: 12, marginTop: 6, cursor: "pointer",
                  fontFamily: "Nunito, sans-serif", textDecoration: "underline",
                }}
              >
                {t("report_user_btn")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// La roue des défis : un petit gage tiré au sort, à faire ensemble une fois sur place.
// Toujours bienveillant et tourné vers l'échange — jamais gênant ni moqueur.
const DEFIS = [
  "Trouve un point commun avec quelqu'un que tu ne connaissais pas.",
  "Fais une photo de groupe avec la plus belle grimace possible.",
  "Apprends un mot dans une autre langue à quelqu'un du groupe.",
  "Raconte ton meilleur souvenir de vacances en 30 secondes.",
  "Demande à quelqu'un quel est son plat préféré, et pourquoi.",
  "Trouve quelqu'un né le même mois que toi.",
  "Invente un cri de ralliement pour le groupe.",
  "Dis un compliment sincère à la personne à ta droite.",
  "Trouve trois choses vertes autour de toi avant les autres.",
  "Fais deviner ton animal préféré en le mimant.",
  "Raconte une chose que tu as apprise cette semaine.",
  "Propose une idée de sortie pour la prochaine fois.",
  "Trouve quelqu'un qui a le même nombre de frères et sœurs que toi.",
  "Fais un high five à trois personnes différentes.",
  "Décris ta journée idéale en une seule phrase.",
];

const MAX_SPINS = 2;

// Un seul défi par sortie, partagé par tout le groupe : la première personne à le tirer
// le fixe pour tout le monde. Deux tirages possibles avant validation définitive.
// Chat de groupe entre participants d'une même sortie : sert surtout à se retrouver
// le jour J. L'écriture se ferme automatiquement 5h après le début de la sortie,
// mais l'historique reste consultable.
// Filtre anti-insultes du chat : masque les termes injurieux sans bloquer la conversation.
// La détection ignore accents, majuscules et lettres répétées (ex. "coooon").
// Ce filtre reste volontairement simple : il décourage les débordements sans prétendre
// à l'exhaustivité — le signalement reste le vrai recours en cas de problème.
const MOTS_INTERDITS = [
  "connard", "connasse", "conard", "salope", "salaud", "encule", "enculee", "enfoire",
  "batard", "batarde", "pute", "putain", "putes", "pd", "tapette", "tarlouze",
  "negre", "bougnoule", "youpin", "bicot", "raton", "chinetoque",
  "fdp", "ntm", "tg", "tafiole", "gouine", "trav",
  "debile", "cretin", "abruti", "attarde", "mongol", "trisomique",
  "cheh", "creve", "ferme ta gueule", "ta gueule", "va te faire",
];

function normaliserPourFiltre(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // enlève les accents
    .replace(/[0@]/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e")
    .replace(/5/g, "s").replace(/4/g, "a").replace(/7/g, "t")
    .replace(/(.)\1+/g, "$1")                             // "coooonnard" -> "conard"
    .replace(/[^a-z\s]/g, " ");
}

function contientInsulte(texte) {
  const n = normaliserPourFiltre(texte);
  return MOTS_INTERDITS.some((mot) => {
    const m = normaliserPourFiltre(mot).trim();
    if (m.includes(" ")) return n.includes(m);
    return new RegExp(`\\b${m}\\b`).test(n);
  });
}

function masquerInsultes(texte) {
  let sortie = texte;
  MOTS_INTERDITS.forEach((mot) => {
    if (mot.includes(" ")) return;
    const re = new RegExp(`\\b${mot.split("").join("[\\W_]*")}\\w*`, "gi");
    sortie = sortie.replace(re, (m) => "•".repeat(Math.max(3, m.length)));
  });
  return sortie;
}

// Sélection d'émojis utiles pour se retrouver et échanger simplement
// Palette d'émojis, organisée par familles pour retrouver facilement une émotion.
const EMOJIS = [
  // Joie et bonne humeur
  "😀", "😃", "😄", "😁", "😆", "😂", "🤣", "🙂",
  "😊", "😇", "🥰", "😍", "🤩", "😘", "😋", "🤗",
  // Complicité et humour
  "😉", "😜", "😝", "🤪", "😎", "🤓", "🥳", "🤭",
  // Doutes et réflexion
  "🤔", "🤨", "😐", "😶", "🙄", "😬", "😏", "😅",
  // Peine, du plus léger au plus marqué
  "🙁", "😕", "😞", "😔", "🥲", "😟", "😢", "😭",
  "😪", "😴", "🥱", "😮‍💨", "😩", "😫", "🫤", "☹️",
  // Surprise et inquiétude
  "😮", "😯", "😲", "😳", "🤯", "😰", "😱", "🥺",
  // Agacement
  "😤", "😠", "😡", "🤦", "🤷", "😑", "🫠", "🥴",
  // Santé et divers
  "🤒", "🤧", "🥶", "🥵", "😷", "🤢", "🫡", "🤫",
  // Gestes
  "👍", "👎", "👌", "🤙", "✌️", "🤝", "👏", "🙌",
  "🙏", "👋", "💪", "🫶", "🤞", "✊", "👉", "☝️",
  // Cœurs et symboles
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "💔",
  "✨", "⭐", "🔥", "💯", "🎉", "🎈", "🎁", "🏆",
  // Se retrouver
  "⏰", "📍", "🗺️", "🚗", "🚲", "🚶", "🏃", "🧭",
  "📅", "✅", "❌", "❓", "❗", "💬", "📱", "🔔",
  // Météo et nature
  "☀️", "⛅", "🌧️", "⛈️", "❄️", "🌈", "🌳", "🌸",
  "🍂", "🌊", "⛰️", "🏖️", "🌙", "🐦", "🐶", "🐱",
  // Activités et gourmandises
  "⚽", "🏀", "🎾", "🎨", "🎵", "📚", "🎬", "🎲",
  "☕", "🍎", "🍕", "🍰", "🥐", "🧃", "🍦", "🥗",
];


function ChatModal({ activity, currentUserId, onClose, onViewProfile }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [alerte, setAlerte] = useState("");
  const bottomRef = useRef(null);

  const chatOuvert = activity.chatOpen;

  const load = async () => {
    const { data, error } = await supabase
      .from("messages_with_author")
      .select("*")
      .eq("activity_id", activity.id)
      .order("created_at", { ascending: true });
    if (error) console.error("Erreur chargement messages :", error);
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Rafraîchissement régulier : simple et suffisant pour un petit groupe
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const texte = draft.trim();
    if (!texte || sending) return;
    if (contientInsulte(texte)) {
      setAlerte(t("chat_insulte"));
      setTimeout(() => setAlerte(""), 4000);
      return;
    }
    setAlerte("");
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      activity_id: activity.id, user_id: currentUserId, content: texte.slice(0, 500),
    });
    if (error) console.error("Erreur envoi message :", error);
    else { setDraft(""); setEmojiOpen(false); await load(); }
    setSending(false);
  };

  const heure = (iso) => new Date(iso).toLocaleTimeString(
    LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cloud, width: "100%", maxWidth: 520, borderRadius: "26px 26px 0 0",
        height: "calc(100dvh - 90px)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* En-tête */}
        <div style={{
          padding: "16px 18px 12px", borderBottom: "2px solid #F0EADB", background: "#fff",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 17, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activity.title}
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: chatOuvert ? COLORS.grass : "#9A93AF", fontWeight: 700 }}>
              {chatOuvert ? t("chat_open") : t("chat_closed")}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: COLORS.cloud, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", flexShrink: 0,
          }}>
            <X size={16} color={COLORS.ink} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {loading && (
            <p style={{ textAlign: "center", fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#9A93AF" }}>
              {t("auth_loading")}
            </p>
          )}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <Sparkles size={26} color="#D8D2C2" />
              <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#9A93AF", marginTop: 8, lineHeight: 1.5 }}>
                {t("chat_empty")}
              </p>
            </div>
          )}
          {messages.map((m, i) => {
            const mine = m.user_id === currentUserId;
            const prev = messages[i - 1];
            const grouped = prev && prev.user_id === m.user_id;
            return (
              <div key={m.id} style={{
                display: "flex", justifyContent: mine ? "flex-end" : "flex-start",
                gap: 8, marginBottom: grouped ? 3 : 10,
              }}>
                {!mine && (
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {!grouped && (
                      <button
                        onClick={() => onViewProfile(m.user_id)}
                        style={{
                          width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer",
                          background: m.author_genre ? genreColor(m.author_genre) : COLORS.grape,
                          color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
                          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0,
                        }}
                      >
                        {m.author_avatar
                          ? <img src={m.author_avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (m.author_name || "?").charAt(0).toUpperCase()}
                      </button>
                    )}
                  </div>
                )}
                <div style={{ maxWidth: "72%" }}>
                  {!grouped && !mine && (
                    <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, color: "#9A93AF", marginBottom: 2, paddingLeft: 2 }}>
                      {m.author_name}
                    </div>
                  )}
                  <div style={{
                    background: mine ? COLORS.ink : "#fff",
                    color: mine ? "#fff" : COLORS.ink,
                    border: mine ? "none" : "2px solid #F0EADB",
                    borderRadius: 16, padding: "8px 12px",
                    fontFamily: "Nunito, sans-serif", fontSize: 14, lineHeight: 1.45,
                    overflowWrap: "anywhere", whiteSpace: "pre-wrap",
                  }}>
                    {masquerInsultes(m.content)}
                  </div>
                  <div style={{
                    fontFamily: "Nunito, sans-serif", fontSize: 10, color: "#B7AF98",
                    marginTop: 2, textAlign: mine ? "right" : "left", paddingInline: 2,
                  }}>
                    {heure(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Saisie */}
        <div style={{
          padding: "10px 14px calc(14px + env(safe-area-inset-bottom))",
          borderTop: "2px solid #F0EADB", background: "#fff", flexShrink: 0,
        }}>
          {alerte && (
            <div style={{
              background: "#FFF0EC", border: `2px solid ${COLORS.coral}`, borderRadius: 12,
              padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 7,
            }}>
              <ShieldCheck size={15} color={COLORS.coral} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.ink }}>
                {alerte}
              </span>
            </div>
          )}
          {chatOuvert ? (
            <>
            {emojiOpen && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2,
                background: COLORS.cloud, border: "2px solid #F0EADB", borderRadius: 16,
                padding: 8, marginBottom: 8, maxHeight: 200, overflowY: "auto",
              }}>
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setDraft((d) => (d + e).slice(0, 500))}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 22, padding: "5px 0", lineHeight: 1, borderRadius: 8,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label={t("chat_emoji")}
                style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                  background: emojiOpen ? COLORS.sun : "#fff",
                  border: `2px solid ${emojiOpen ? COLORS.sun : "#F0EADB"}`,
                  fontSize: 18, lineHeight: 1, padding: 0,
                }}
              >
                🙂
              </button>
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 500))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={t("chat_placeholder")}
                style={{
                  flex: 1, border: "2px solid #F0EADB", borderRadius: 18, padding: "10px 14px",
                  fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, outline: "none",
                  resize: "none", maxHeight: 100, boxSizing: "border-box",
                }}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || sending}
                style={{
                  width: 42, height: 42, borderRadius: "50%", border: "none", flexShrink: 0,
                  background: draft.trim() ? COLORS.coral : "#EDEAF4",
                  cursor: draft.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronRight size={20} color={draft.trim() ? "#fff" : "#B7AF98"} />
              </button>
            </div>
            </>
          ) : (
            <p style={{
              textAlign: "center", fontFamily: "Nunito, sans-serif", fontSize: 12.5,
              color: "#9A93AF", margin: "6px 0", lineHeight: 1.5,
            }}>
              {t("chat_closed_note")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DefiWheel({ onClose, existingDefi, onSaveDefi }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS);
  const [saving, setSaving] = useState(false);

  const locked = !!existingDefi;

  const spin = () => {
    if (spinning || spinsLeft <= 0 || locked) return;
    setSpinning(true);
    setResult(null);
    const pick = Math.floor(Math.random() * DEFIS.length);
    // Plusieurs tours complets, puis on s'arrête sur un secteur au hasard
    const turns = 4 + Math.random() * 2;
    setAngle((a) => a + turns * 360 + Math.random() * 360);
    setTimeout(() => {
      setResult(DEFIS[pick]);
      setSpinning(false);
      setSpinsLeft((n) => n - 1);
    }, 2600);
  };

  const validate = async () => {
    if (!result) return;
    setSaving(true);
    await onSaveDefi(result);
    setSaving(false);
    onClose();
  };

  const SECTORS = 8;
  const sectorColors = [COLORS.sun, COLORS.coral, COLORS.grass, COLORS.sky, COLORS.grape, COLORS.sun, COLORS.coral, COLORS.grass];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(43,37,96,0.55)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cloud, borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 360,
        position: "relative", textAlign: "center",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, background: "#fff", border: "none",
          borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
        }}>
          <X size={16} color={COLORS.ink} />
        </button>

        <h3 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink, margin: "0 0 4px" }}>
          {t("defi_title")}
        </h3>
        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: "#6B6485", margin: "0 0 18px" }}>
          {locked ? t("defi_group_subtitle") : t("defi_subtitle")}
        </p>

        <div style={{ position: "relative", width: 210, height: 210, margin: "0 auto 18px" }}>
          {/* Pointeur */}
          <div style={{
            position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
            borderTop: `18px solid ${COLORS.ink}`, zIndex: 2,
          }} />
          {/* Roue */}
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            border: `6px solid #fff`, boxShadow: "0 6px 18px rgba(43,37,96,0.18)",
            transform: `rotate(${angle}deg)`,
            transition: spinning ? "transform 2.5s cubic-bezier(.17,.67,.21,1)" : "none",
            background: `conic-gradient(${sectorColors.map((c, i) =>
              `${c} ${(i * 360) / SECTORS}deg ${((i + 1) * 360) / SECTORS}deg`).join(", ")})`,
          }} />
          {/* Moyeu */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 54, height: 54, borderRadius: "50%", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(43,37,96,0.2)",
          }}>
            <Sparkles size={22} color={COLORS.sun} />
          </div>
        </div>

        {locked ? (
          <div style={{
            background: "#fff", border: `2px solid ${COLORS.grass}`, borderRadius: 16,
            padding: "14px 16px", marginBottom: 14,
          }}>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10.5, fontWeight: 800, color: COLORS.grass, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {t("defi_group_label")}
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
              {existingDefi}
            </div>
          </div>
        ) : result ? (
          <div style={{
            background: "#fff", border: `2px solid ${COLORS.sun}`, borderRadius: 16,
            padding: "14px 16px", marginBottom: 14,
          }}>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10.5, fontWeight: 800, color: COLORS.sun, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {t("defi_result_label")}
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
              {result}
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#9A93AF", marginBottom: 14, minHeight: 40 }}>
            {spinning ? t("defi_spinning") : t("defi_hint")}
          </p>
        )}

        {locked ? (
          <PillButton color={COLORS.grass} textColor="#fff" onClick={onClose} style={{ width: "100%" }}>
            {t("btn_back")}
          </PillButton>
        ) : spinsLeft > 0 ? (
          <>
            <PillButton color={COLORS.sun} onClick={spin} style={{ width: "100%", opacity: spinning ? 0.6 : 1 }}>
              {spinning ? t("defi_spinning") : result ? t("defi_again") : t("defi_spin")}
            </PillButton>
            {result && (
              <PillButton color={COLORS.grass} textColor="#fff" onClick={validate} style={{ width: "100%", marginTop: 8, opacity: saving ? 0.6 : 1 }}>
                {saving ? t("auth_loading") : t("defi_validate")}
              </PillButton>
            )}
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF", marginTop: 8 }}>
              {t("defi_spins_left", { n: spinsLeft })}
            </div>
          </>
        ) : (
          <>
            <PillButton color={COLORS.grass} textColor="#fff" onClick={validate} style={{ width: "100%", opacity: saving ? 0.6 : 1 }}>
              {saving ? t("auth_loading") : t("defi_accept")}
            </PillButton>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF", marginTop: 8 }}>
              {t("defi_no_more")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Contact avec l'organisateur d'une sortie : chacun peut lui poser une question,
// l'organisateur voit tous les échanges. Se ferme 5h après le début de la sortie,
// comme le chat de groupe — l'objet de la discussion, c'est la sortie elle-même.
function ContactOrganisateurModal({ activity, currentUserId, onClose, onViewProfile }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [alerte, setAlerte] = useState("");
  const [palette, setPalette] = useState(null);   // null | "emoji" | "sticker"
  const bottomRef = useRef(null);

  const jeSuisOrganisateur = activity.createdBy === currentUserId;
  const ouvert = activity.chatOpen;

  const load = async () => {
    const { data, error } = await supabase
      .from("organizer_messages_detailed")
      .select("*")
      .eq("activity_id", activity.id)
      .order("created_at", { ascending: true });
    if (error) console.error("Erreur chargement messages organisateur :", error);
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    const texte = draft.trim();
    if (!texte || sending) return;
    if (contientInsulte(texte)) {
      setAlerte(t("chat_insulte"));
      setTimeout(() => setAlerte(""), 4000);
      return;
    }
    setAlerte("");
    setSending(true);
    const { error } = await supabase.from("organizer_messages").insert({
      activity_id: activity.id, sender_id: currentUserId, content: texte.slice(0, 800),
    });
    if (error) { console.error("Erreur envoi :", error); setAlerte(t("pm_send_error")); }
    else { setDraft(""); setPalette(null); await load(); }
    setSending(false);
  };

  // L'organisateur voit les questions regroupées par personne
  const groupes = {};
  messages.forEach((m) => {
    const cle = m.sender_id === activity.createdBy ? "organisateur" : m.sender_id;
    if (!groupes[cle]) groupes[cle] = [];
    groupes[cle].push(m);
  });

  // Pour un participant : seulement ses messages et les réponses de l'organisateur
  const visibles = jeSuisOrganisateur
    ? messages
    : messages.filter((m) => m.sender_id === currentUserId || m.sender_id === activity.createdBy);

  const heure = (iso) => new Date(iso).toLocaleTimeString(
    LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cloud, width: "100%", maxWidth: 520, borderRadius: "26px 26px 0 0",
        height: "calc(100dvh - 90px)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 18px 12px", borderBottom: "2px solid #F0EADB", background: "#fff",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 17, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {jeSuisOrganisateur ? t("orga_title_owner") : t("orga_title")}
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: ouvert ? COLORS.grass : "#9A93AF", fontWeight: 700 }}>
              {activity.title}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: COLORS.cloud, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", flexShrink: 0,
          }}>
            <X size={16} color={COLORS.ink} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {loading && (
            <p style={{ textAlign: "center", fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#9A93AF" }}>
              {t("auth_loading")}
            </p>
          )}
          {!loading && visibles.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <Mail size={26} color="#D8D2C2" />
              <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#9A93AF", marginTop: 8, lineHeight: 1.5 }}>
                {jeSuisOrganisateur ? t("orga_empty_owner") : t("orga_empty")}
              </p>
            </div>
          )}

          {visibles.map((m, i) => {
            const mien = m.sender_id === currentUserId;
            const deLOrga = m.sender_id === activity.createdBy;
            const prec = visibles[i - 1];
            const groupe = prec && prec.sender_id === m.sender_id;
            return (
              <div key={m.id} style={{
                display: "flex", justifyContent: mien ? "flex-end" : "flex-start",
                gap: 8, marginBottom: groupe ? 3 : 10,
              }}>
                {!mien && (
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {!groupe && (
                      <button
                        onClick={() => onViewProfile(m.sender_id)}
                        style={{
                          width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer",
                          background: m.sender_genre ? genreColor(m.sender_genre) : COLORS.grape,
                          color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
                          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0,
                        }}
                      >
                        {m.sender_avatar
                          ? <img src={m.sender_avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (m.sender_name || "?").charAt(0).toUpperCase()}
                      </button>
                    )}
                  </div>
                )}
                <div style={{ maxWidth: "74%" }}>
                  {!groupe && !mien && (
                    <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, color: deLOrga ? COLORS.grass : "#9A93AF", marginBottom: 2, paddingLeft: 2 }}>
                      {m.sender_name}{deLOrga ? ` · ${t("orga_badge")}` : ""}
                    </div>
                  )}
                  <div style={{
                    background: mien ? COLORS.ink : "#fff",
                    color: mien ? "#fff" : COLORS.ink,
                    border: mien ? "none" : `2px solid ${deLOrga ? COLORS.grass + "60" : "#F0EADB"}`,
                    borderRadius: 16, padding: "9px 13px",
                    fontFamily: "Nunito, sans-serif", fontSize: 14, lineHeight: 1.45,
                    overflowWrap: "anywhere", whiteSpace: "pre-wrap",
                  }}>
                    {masquerInsultes(m.content)}
                  </div>
                  <div style={{
                    fontFamily: "Nunito, sans-serif", fontSize: 10, color: "#B7AF98",
                    marginTop: 2, textAlign: mien ? "right" : "left", paddingInline: 2,
                  }}>
                    {heure(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{
          padding: "10px 14px calc(14px + env(safe-area-inset-bottom))",
          borderTop: "2px solid #F0EADB", background: "#fff", flexShrink: 0,
        }}>
          {alerte && (
            <div style={{
              background: "#FFF0EC", border: `2px solid ${COLORS.coral}`, borderRadius: 12,
              padding: "8px 12px", marginBottom: 8, fontFamily: "Nunito, sans-serif",
              fontWeight: 700, fontSize: 12, color: COLORS.ink,
            }}>
              {alerte}
            </div>
          )}
          {ouvert ? (
            <>
            {palette === "emoji" && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2,
                background: COLORS.cloud, border: "2px solid #F0EADB", borderRadius: 16,
                padding: 8, marginBottom: 8, maxHeight: 200, overflowY: "auto",
              }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setDraft((d) => (d + e).slice(0, 800))} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 22, padding: "5px 0", lineHeight: 1, borderRadius: 8,
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
              <button
                onClick={() => setPalette((p) => (p === "emoji" ? null : "emoji"))}
                aria-label={t("chat_emoji")}
                style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                  background: palette === "emoji" ? COLORS.sun : "#fff",
                  border: `2px solid ${palette === "emoji" ? COLORS.sun : "#F0EADB"}`,
                  fontSize: 18, lineHeight: 1, padding: 0,
                }}
              >
                🙂
              </button>
              <textarea
                rows={1} value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 800))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={jeSuisOrganisateur ? t("orga_reply_placeholder") : t("orga_placeholder")}
                style={{
                  flex: 1, border: "2px solid #F0EADB", borderRadius: 18, padding: "10px 14px",
                  fontFamily: "Nunito, sans-serif", fontSize: 14, color: COLORS.ink, outline: "none",
                  resize: "none", maxHeight: 100, boxSizing: "border-box",
                }}
              />
              <button onClick={send} disabled={!draft.trim() || sending} style={{
                width: 42, height: 42, borderRadius: "50%", border: "none", flexShrink: 0,
                background: draft.trim() ? COLORS.coral : "#EDEAF4",
                cursor: draft.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChevronRight size={20} color={draft.trim() ? "#fff" : "#B7AF98"} />
              </button>
            </div>
            </>
          ) : (
            <p style={{
              textAlign: "center", fontFamily: "Nunito, sans-serif", fontSize: 12.5,
              color: "#9A93AF", margin: "6px 0", lineHeight: 1.5,
            }}>
              {t("orga_closed")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}?activity=${item.id}`;
  const message = t("share_message", { title: item.title });
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = async () => {
    try { await navigator.share({ title: item.title, text: message, url }); onClose(); } catch (e) { /* annulé par la personne, rien à faire */ }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) { /* clipboard indisponible, on ignore silencieusement */ }
  };
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const btnStyle = {
    display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #F0EADB",
    borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontFamily: "Nunito, sans-serif",
    fontWeight: 800, fontSize: 14, color: COLORS.ink, width: "100%", textAlign: "left",
  };
  const iconWrap = (bg) => ({ width: 32, height: 32, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.cloud, borderRadius: 22, padding: 22, width: "100%", maxWidth: 360, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}>
          <X size={15} color={COLORS.ink} />
        </button>
        <h3 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, margin: "0 0 16px" }}>
          {t("share_btn")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {canNativeShare && (
            <button onClick={nativeShare} style={{ ...btnStyle, background: COLORS.ink, color: "#fff", border: "none" }}>
              <span style={iconWrap("rgba(255,255,255,0.15)")}><Share2 size={16} color="#fff" /></span>
              {t("share_btn")}
            </button>
          )}
          <button onClick={() => window.open(whatsappUrl, "_blank")} style={btnStyle}>
            <span style={iconWrap("#25D366")}><Share2 size={16} color="#fff" /></span>
            {t("share_whatsapp")}
          </button>
          <button onClick={() => window.open(facebookUrl, "_blank", "width=580,height=400")} style={btnStyle}>
            <span style={iconWrap("#1877F2")}><Share2 size={16} color="#fff" /></span>
            {t("share_facebook")}
          </button>
          <button onClick={copyLink} style={btnStyle}>
            <span style={iconWrap(COLORS.sky)}><Link2 size={16} color="#fff" /></span>
            {copied ? t("share_link_copied") : t("share_copy_link")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ onClose, onSubmit, isUser = false }) {
  const [reason, setReason] = useState("inapproprie");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  const REASONS = [
    { id: "inapproprie", label: t("report_reason_inapproprie") },
    { id: "contenu", label: t("report_reason_contenu") },
    { id: "securite", label: t("report_reason_securite") },
    { id: "spam", label: t("report_reason_spam") },
    { id: "autre", label: t("report_reason_autre") },
  ];

  const submit = async () => {
    const ok = await onSubmit({ reason, details });
    if (ok) {
      setSent(true);
      setTimeout(onClose, 1800);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.cloud, borderRadius: 22, padding: 22, width: "100%", maxWidth: 380, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}>
          <X size={15} color={COLORS.ink} />
        </button>
        <h3 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, margin: "0 0 14px" }}>
          {isUser ? t("report_user_title") : t("report_title")}
        </h3>

        {sent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#EAF8ED", color: COLORS.grass, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13.5, padding: "10px 14px", borderRadius: 12 }}>
            <Check size={16} /> {t("report_sent")}
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, color: "#6B6485", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {t("report_reason_label")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {REASONS.map((r) => (
                <Chip key={r.id} active={reason === r.id} onClick={() => setReason(r.id)} color={COLORS.coral}>{r.label}</Chip>
              ))}
            </div>
            <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, color: "#6B6485", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {t("report_details_label")}
            </div>
            <textarea
              rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
              placeholder={t("report_details_placeholder")}
              style={{ width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "10px 12px", fontFamily: "Nunito, sans-serif", fontSize: 13.5, resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
            />
            <PillButton color={COLORS.coral} textColor="#fff" onClick={submit} style={{ width: "100%" }}>
              {t("report_submit")}
            </PillButton>
          </>
        )}
      </div>
    </div>
  );
}

function DetailModal({ activity, onClose, joined, onJoin, onReport, onViewProfile, onShare, currentUserId, onEdit, onCancelOuting, onLeave, myNbEnfants = 0, myKidsHere = 0, onOpenDefi, onOpenChat, onOpenOrga }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [kidsToBring, setKidsToBring] = useState(Math.min(myNbEnfants, 1));
  if (!activity) return null;
  const meta = catMeta(activity.category);
  const isJoined = joined.includes(activity.id);
  const full = activity.inscrits >= activity.places && !isJoined;
  const isPast = (activity.offsetDays ?? 0) < 0;
  // La roue des défis n'a de sens que le jour même, sur place
  const isToday = (activity.offsetDays ?? 0) === 0;

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
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom))", maxHeight: "calc(100dvh - 100px)", overflowY: "auto", boxSizing: "border-box",
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

        {activity.payant && (
          <div style={{ marginBottom: 12 }}>
            <PriceBadge payant={activity.payant} size={14} />
          </div>
        )}

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

        {activity.signeDistinctif && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "#EDEAF4",
            border: `2px solid ${COLORS.grape}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <Eye size={16} color={COLORS.grape} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink }}>
              {activity.signeDistinctif}
            </span>
          </div>
        )}

        {activity.defi && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "#FFF9EC",
            border: `2px solid ${COLORS.sun}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <Sparkles size={16} color={COLORS.sun} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10, fontWeight: 800, color: COLORS.sun, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                {t("defi_group_label")}
              </div>
              <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink, lineHeight: 1.45 }}>
                {activity.defi}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(activity)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={displayDate(activity)} />
          <Row icon={<Users size={15} color={COLORS.ink} />} text={t("detail_parents_count", { a: activity.inscrits, b: activity.places })} />
          {activity.placesEnfants != null && activity.placesEnfants > 0 && (
            <Row icon={<Baby size={15} color={COLORS.ink} />} text={t("detail_kids_count", { a: activity.inscritsEnfants || 0, b: activity.placesEnfants })} />
          )}
        </div>

        {(activity.organisateur || activity.participantsAvgAge) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <OrganiserBadge name={activity.organisateur} genre={activity.organisateurGenre} size={20} userId={activity.createdBy} onClick={onViewProfile} age={activity.organiserAge} />
            <AvgAgeBadge avg={activity.participantsAvgAge} size={13} />
          </div>
        )}

        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: "#5C5578", lineHeight: 1.6, marginBottom: 20 }}>
          {activity.desc}
        </p>

        {activity.participants && activity.participants.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>{t("detail_registered_parents")}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {activity.participants.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={p.name} genre={p.genre} genderMode size={30} avatarUrl={p.avatarUrl} userId={p.isReal ? p.userId : null} onViewProfile={onViewProfile} />
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink }}>
                    {p.name}{p.isReal && p.age ? ` · ${p.age} ${t("profile_years")}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPast ? (
          <PillButton color={"#EDEAF4"} textColor={"#8A8399"} style={{ width: "100%", boxShadow: "none" }}>
            {t("badge_past")}
          </PillButton>
        ) : isJoined ? (
          activity.createdBy === currentUserId ? (
            <PillButton color={"#EAF8ED"} textColor={COLORS.grass} style={{ width: "100%", boxShadow: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Check size={18} /> {t("detail_joined")}
              </span>
            </PillButton>
          ) : (
            <PillButton
              color={confirmLeave ? COLORS.coral : "#EAF8ED"}
              textColor={confirmLeave ? "#fff" : COLORS.grass}
              style={{ width: "100%", boxShadow: "none" }}
              onClick={() => {
                if (confirmLeave) { onLeave(activity.id); setConfirmLeave(false); }
                else { setConfirmLeave(true); setTimeout(() => setConfirmLeave(false), 4000); }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                {confirmLeave ? t("leave_confirm") : (<><Check size={18} /> {t("detail_joined")}</>)}
              </span>
            </PillButton>
          )
        ) : (
          <>
            {myNbEnfants > 0 && !full && (
              <div style={{
                background: "#FFF9EC", border: `2px solid ${COLORS.sun}`, borderRadius: 14,
                padding: "12px 14px", marginBottom: 10,
              }}>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5, color: COLORS.ink, marginBottom: 8 }}>
                  {t("join_kids_question")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setKidsToBring((n) => Math.max(0, n - 1))}
                    style={{ width: 36, height: 36, borderRadius: 10, border: "2px solid #F0EADB", background: "#fff", cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 18, color: COLORS.ink }}
                  >
                    −
                  </button>
                  <div style={{ flex: 1, textAlign: "center", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink }}>
                    {kidsToBring}
                  </div>
                  <button
                    onClick={() => setKidsToBring((n) => Math.min(myNbEnfants, n + 1))}
                    style={{ width: 36, height: 36, borderRadius: 10, border: "2px solid #F0EADB", background: "#fff", cursor: "pointer", fontFamily: "Fredoka, sans-serif", fontSize: 18, color: COLORS.ink }}
                  >
                    +
                  </button>
                </div>
                <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#9A93AF", marginTop: 6 }}>
                  {t("join_kids_max", { n: myNbEnfants })}
                </div>
              </div>
            )}
            <PillButton
              color={full ? "#EDEAF4" : COLORS.coral}
              textColor={full ? "#B7AF98" : "#fff"}
              onClick={() => !full && onJoin(activity.id, kidsToBring)}
              style={{ width: "100%" }}
            >
              {full ? t("card_full") : t("detail_join_kids")}
            </PillButton>
          </>
        )}

        {!isPast && (
          <button
            onClick={onOpenOrga}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "#fff", border: `2px solid ${COLORS.grass}`, borderRadius: 12, padding: "11px 14px",
              color: COLORS.grass, fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Mail size={16} /> {activity.createdBy === currentUserId ? t("orga_btn_owner") : t("orga_btn")}
          </button>
        )}

        {isJoined && (
          <button
            onClick={onOpenChat}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: COLORS.sky, border: "none", borderRadius: 12, padding: "11px 14px",
              color: "#fff", fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Users size={16} /> {t("chat_btn")}
          </button>
        )}

        {isToday && isJoined && (
          <button
            onClick={onOpenDefi}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: COLORS.sun, border: "none", borderRadius: 12, padding: "11px 14px",
              color: COLORS.ink, fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif", boxShadow: `0 3px 0 ${shade(COLORS.sun, -18)}`,
            }}
          >
            <Sparkles size={16} /> {activity.defi ? t("defi_btn_view") : t("defi_btn")}
          </button>
        )}

        {!isPast && (
          <button
            onClick={() => onShare(activity)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "#fff", border: "2px solid #F0EADB", borderRadius: 12, padding: "10px 14px",
              color: COLORS.ink, fontWeight: 800, fontSize: 13, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Share2 size={15} /> {t("share_btn")}
          </button>
        )}

        {!isPast && activity.createdBy && activity.createdBy === currentUserId && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => onEdit(activity)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "#fff", border: "2px solid #F0EADB", borderRadius: 12, padding: "10px 14px",
                color: COLORS.ink, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif",
              }}
            >
              {t("btn_edit")}
            </button>
            <button
              onClick={() => {
                if (confirmCancel) { onCancelOuting(activity.id); onClose(); }
                else { setConfirmCancel(true); setTimeout(() => setConfirmCancel(false), 4000); }
              }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: confirmCancel ? COLORS.coral : "#fff", border: `2px solid ${COLORS.coral}`, borderRadius: 12, padding: "10px 14px",
                color: confirmCancel ? "#fff" : COLORS.coral, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif",
              }}
            >
              {confirmCancel ? t("cancel_outing_confirm") : t("btn_cancel_outing")}
            </button>
          </div>
        )}

        <button
          onClick={() => onReport(activity)}
          style={{
            display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
            color: "#B7AF98", fontWeight: 700, fontSize: 12, marginTop: 10, cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {t("report_btn")}
        </button>
      </div>
    </div>
  );
}

// ---------- Community meetups (adultes / ados) ----------
function CommunityCard({ item, categories, onOpen, favorite, onToggleFav, genderMode = false, onViewProfile }) {
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
            display: "flex", alignItems: "center", gap: 8, marginBottom: 2,
          }}>
            <span style={{
              fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 0.6,
              textTransform: "uppercase", color: meta.color,
            }}>
              {meta.label}
            </span>
            <PriceBadge payant={item.payant} size={13} />
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

      <PlainParticipantsRow names={item.participants} color={meta.color} genderMode={genderMode} onViewProfile={onViewProfile} />

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Users size={14} color={full ? COLORS.coral : COLORS.grass} />
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5, color: full ? COLORS.coral : COLORS.ink }}>
              {full ? t("card_full") : t("card_places_left", { n: item.places - item.inscrits })}
            </span>
          </span>
          {/* Places enfants : uniquement sur les sorties Famille */}
          {item.placesEnfants != null && item.placesEnfants > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Baby size={14} color={(item.inscritsEnfants || 0) >= item.placesEnfants ? COLORS.coral : COLORS.grape} />
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
                color: (item.inscritsEnfants || 0) >= item.placesEnfants ? COLORS.coral : shade(COLORS.grape, -22),
              }}>
                {t("card_kids_left", { n: Math.max(0, item.placesEnfants - (item.inscritsEnfants || 0)) })}
              </span>
            </span>
          )}
        </div>
        <ChevronRight size={18} color="#C7C0AE" />
      </div>

      {(item.organisateur || item.participantsAvgAge) && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <OrganiserBadge name={item.organisateur} genre={item.organisateurGenre} size={16} userId={item.createdBy} onClick={onViewProfile} age={item.organiserAge} />
          <AvgAgeBadge avg={item.participantsAvgAge} size={12} />
        </div>
      )}
    </div>
  );
}

// Ligne fine (quasi une seule ligne) pour une rencontre, utilisée dans l'affichage groupé par jour.
// Petit badge "Payant" (avec le prix si connu) — rien n'est affiché si la sortie est gratuite,
// pour ne pas surcharger visuellement la majorité des annonces (qui restent gratuites).
function PriceBadge({ payant, size = 11 }) {
  if (!payant) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, background: COLORS.coral,
      color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: size,
      padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, letterSpacing: 0.3,
    }}>
      <Tag size={size} /> {t("badge_payant")}
    </span>
  );
}

// `isCreator` et `isPast` ne servent que dans "Mes sorties" : ailleurs, la ligne s'affiche normalement.
function NarrowMeetupRow({ item, categories, onOpen, favorite, onToggleFav, genderMode, onViewProfile, isCreator = false, isPast = false, spaceLabel }) {
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const full = item.inscrits >= item.places;
  const iconColor = isPast ? "#C7C0AE" : meta.color;
  return (
    <div
      onClick={() => onOpen(item)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: isPast ? "#F7F5F0" : (isCreator ? "#FFF9EC" : "#fff"),
        border: `2px solid ${isPast ? "#E8E4DA" : (isCreator ? COLORS.sun : "#F0EADB")}`,
        borderRadius: 14, padding: "9px 12px", cursor: "pointer", opacity: isPast ? 0.65 : 1,
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: "50%", border: `2px dashed ${iconColor}`,
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        position: "relative",
      }}>
        <Icon size={15} color={iconColor} strokeWidth={2.4} />
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
        {(spaceLabel || isCreator || isPast) && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 2 }}>
            {spaceLabel && (
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 9.5, letterSpacing: 0.4,
                textTransform: "uppercase", color: isPast ? "#B7AF98" : meta.color,
              }}>
                {spaceLabel}
              </span>
            )}
            {isCreator && (
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 9, padding: "1px 6px",
                borderRadius: 999, background: isPast ? "#E8E4DA" : COLORS.sun, color: isPast ? "#8A8399" : COLORS.ink,
                letterSpacing: 0.3, textTransform: "uppercase",
              }}>
                {t("badge_organiser")}
              </span>
            )}
            {isPast && (
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 9, padding: "1px 6px",
                borderRadius: 999, background: "#E8E4DA", color: "#8A8399",
                letterSpacing: 0.3, textTransform: "uppercase",
              }}>
                {t("badge_past")}
              </span>
            )}
          </div>
        )}
        <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14.5, color: isPast ? "#8A8399" : COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", marginTop: 3 }}>
          <span style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 800, color: COLORS.ink, flexShrink: 0,
            background: isPast ? "#E8E4DA" : COLORS.sun, padding: "2px 7px", borderRadius: 8, fontSize: 11.5,
          }}>
            {/* Dans "Mes sorties" (repérable au libellé de catégorie), les jours se mélangent :
                on affiche la date en plus de l'heure pour s'y retrouver. */}
            {spaceLabel ? displayDate(item) : (item.time ? item.time : displayDate(item))}
          </span>
          {/* L'adresse peut être tronquée, mais la ville reste toujours lisible :
              c'est l'information la plus utile pour savoir si la sortie est proche. */}
          <span style={{ fontFamily: "Nunito, sans-serif", color: "#8A8399", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
            {item.lieu}
          </span>
          {villeName(item.ville) && (
            <span style={{
              fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 10.5, flexShrink: 0,
              background: "#EDEAF4", color: COLORS.grape, padding: "2px 7px", borderRadius: 8,
              maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {villeName(item.ville)}
            </span>
          )}
          <PriceBadge payant={item.payant} size={12} />
        </div>
        {item.organisateur && (
          <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
            <OrganiserBadge name={item.organisateur} genre={item.organisateurGenre} size={15} userId={item.createdBy} onClick={onViewProfile} age={item.organiserAge} />
            <AvgAgeBadge avg={item.participantsAvgAge} size={10.5} />
          </div>
        )}
      </div>

      <PlainParticipantsRow names={item.participants} color={meta.color} max={8} genderMode={genderMode} onViewProfile={onViewProfile} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
        <span style={{
          fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11,
          color: full ? COLORS.coral : COLORS.grass,
        }}>
          {item.inscrits}/{item.places}
        </span>
        {/* Places enfants : n'apparaît que sur les sorties Famille, qui sont les seules à en définir */}
        {item.placesEnfants != null && item.placesEnfants > 0 && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 2,
            fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 10,
            color: (item.inscritsEnfants || 0) >= item.placesEnfants ? COLORS.coral : shade(COLORS.grape, -22),
          }}>
            <Baby size={10} /> {item.inscritsEnfants || 0}/{item.placesEnfants}
          </span>
        )}
      </div>

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
function DayAccordion({ items, categories, onOpen, favorites, onToggleFav, genderMode, onViewProfile }) {
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
                  onViewProfile={onViewProfile}
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

function CommunityExplorer({ title, subtitle, categories, items, favorites, onToggleFav, onOpen, emptyText, location, layout = "grid", genderMode = false, onViewProfile }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("tous");
  const [onlyFav, setOnlyFav] = useState(false);
  const [view, setView] = useState("liste");
  // Date de départ de l'affichage : permet de se projeter dans le futur (ex. dans un mois)
  const [fromDate, setFromDate] = useState("");
  const dateInputRef = useRef(null);

  // Nombre de jours entre aujourd'hui et la date choisie
  const fromOffset = useMemo(() => {
    if (!fromDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const picked = new Date(fromDate + "T00:00:00");
    if (Number.isNaN(picked.getTime())) return null;
    return Math.round((picked - today) / 86400000);
  }, [fromDate]);

  // On n'affiche qu'un nombre limité d'annonces à la fois : au-delà, la page devient
  // lourde à faire défiler, surtout sur téléphone.
  const PAR_PAGE = 50;
  const [limite, setLimite] = useState(PAR_PAGE);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const matchCat = cat === "tous" || (cat === "intergen" ? a.intergen : a.category === cat);
      const matchLoc = matchLocation(a.ville, location);
      const matchFav = !onlyFav || favorites.includes(a.id);
      const matchDate = fromOffset === null || (a.offsetDays ?? 0) >= fromOffset;
      const matchQuery = a.title.toLowerCase().includes(query.toLowerCase()) || a.lieu.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchLoc && matchFav && matchDate && matchQuery;
    });
  }, [items, query, cat, location, onlyFav, favorites, fromOffset]);

  const affichees = useMemo(() => filtered.slice(0, limite), [filtered, limite]);

  // Tout changement de filtre remet la liste au début
  useEffect(() => { setLimite(PAR_PAGE); }, [query, cat, location, onlyFav, fromOffset]);
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
        {/* Se positionner à une date : petit bouton discret, le calendrier natif s'ouvre au clic */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Chip active={!!fromDate} onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.focus()} color={COLORS.sky}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={13} />
              {fromDate
                ? new Date(fromDate + "T00:00:00").toLocaleDateString(
                    LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US",
                    { day: "numeric", month: "short" })
                : t("filter_from_date_short")}
            </span>
          </Chip>
          <input
            ref={dateInputRef}
            type="date"
            value={fromDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              position: "absolute", inset: 0, opacity: 0, pointerEvents: "none",
              width: "100%", height: "100%", border: "none",
            }}
          />
        </div>
        {fromDate && (
          <Chip active={false} onClick={() => setFromDate("")} color={COLORS.coral}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <X size={12} /> {t("filter_reset_date")}
            </span>
          </Chip>
        )}
        <Chip active={cat === "tous"} onClick={() => setCat("tous")} color={COLORS.ink}>{t("chip_all")}</Chip>
        <Chip active={onlyFav} onClick={() => setOnlyFav((v) => !v)} color={COLORS.coral}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Heart size={13} fill={onlyFav ? "#fff" : "none"} /> {t("chip_favorites")}
          </span>
        </Chip>
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
        <MapView items={affichees} categories={categories} onOpen={onOpen} location={location} />
      ) : layout === "days" ? (
        filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9A93AF", fontFamily: "Nunito, sans-serif" }}>
            {emptyText}
          </div>
        ) : (
          <DayAccordion items={affichees} categories={categories} onOpen={onOpen} favorites={favorites} onToggleFav={onToggleFav} genderMode={genderMode} onViewProfile={onViewProfile} />
        )
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {affichees.map((item) => (
            <CommunityCard key={item.id} item={item} categories={categories} onOpen={onOpen}
              favorite={favorites.includes(item.id)} onToggleFav={onToggleFav} genderMode={genderMode} onViewProfile={onViewProfile} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#9A93AF", fontFamily: "Nunito, sans-serif" }}>
              {emptyText}
            </div>
          )}
        </div>
      )}

      {view !== "carte" && filtered.length > affichees.length && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <PillButton color={COLORS.ink} textColor="#fff" onClick={() => setLimite((n) => n + PAR_PAGE)} style={{ padding: "10px 22px", fontSize: 13.5 }}>
            {t("voir_plus", { n: filtered.length - affichees.length })}
          </PillButton>
        </div>
      )}
    </div>
  );
}

function CommunityDetailModal({ item, categories, onClose, joined, onJoin, joinLabel, genderMode = false, onReport, genderLabels, onViewProfile, onShare, currentUserId, onEdit, onCancelOuting, onLeave, onOpenDefi, onOpenChat, onOpenOrga }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  if (!item) return null;
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  const isJoined = joined.includes(item.id);
  const full = item.inscrits >= item.places && !isJoined;
  const isPast = (item.offsetDays ?? 0) < 0;
  const isToday = (item.offsetDays ?? 0) === 0;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.cloud, width: "100%", maxWidth: 520, borderRadius: "26px 26px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom))", maxHeight: "calc(100dvh - 100px)", overflowY: "auto", boxSizing: "border-box" }}>
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

        {item.payant && (
          <div style={{ marginBottom: 12 }}>
            <PriceBadge payant={item.payant} size={14} />
          </div>
        )}

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

        {item.signeDistinctif && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "#EDEAF4",
            border: `2px solid ${COLORS.grape}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <Eye size={16} color={COLORS.grape} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink }}>
              {item.signeDistinctif}
            </span>
          </div>
        )}

        {item.defi && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "#FFF9EC",
            border: `2px solid ${COLORS.sun}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14,
          }}>
            <Sparkles size={16} color={COLORS.sun} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10, fontWeight: 800, color: COLORS.sun, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                {t("defi_group_label")}
              </div>
              <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink, lineHeight: 1.45 }}>
                {item.defi}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <Row icon={<MapPin size={15} color={COLORS.ink} />} text={lieuAvecVille(item)} />
          <Row icon={<CalendarDays size={15} color={COLORS.ink} />} text={displayDate(item)} />
          <Row icon={<Users size={15} color={COLORS.ink} />} text={t("detail_participants", { a: item.inscrits, b: item.places })} />
          {item.info && <Row icon={<Sparkles size={15} color={COLORS.ink} />} text={item.info} />}
        </div>

        {(item.organisateur || item.participantsAvgAge) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <OrganiserBadge name={item.organisateur} genre={item.organisateurGenre} size={20} userId={item.createdBy} onClick={onViewProfile} age={item.organiserAge} />
            <AvgAgeBadge avg={item.participantsAvgAge} size={13} />
          </div>
        )}

        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: "#5C5578", lineHeight: 1.6, marginBottom: 20 }}>
          {item.desc}
        </p>

        {item.participants && item.participants.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>{t("detail_already_registered")}</SectionLabel>
              {genderMode && (
                <div style={{ display: "flex", gap: 12 }}>
                  <Legend color={COLORS.girl} label={genderLabels?.f || t("legend_femme")} />
                  <Legend color={COLORS.boy} label={genderLabels?.m || t("legend_homme")} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {item.participants.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PlainAvatar participant={p} color={meta.color} size={30} genderMode={genderMode} onViewProfile={onViewProfile} />
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink }}>
                    {participantName(p)}{p.isReal && p.age ? ` · ${p.age} ${t("profile_years")}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPast ? (
          <PillButton color={"#EDEAF4"} textColor={"#8A8399"} style={{ width: "100%", boxShadow: "none" }}>
            {t("badge_past")}
          </PillButton>
        ) : isJoined ? (
          item.createdBy === currentUserId ? (
            <PillButton color={"#EAF8ED"} textColor={COLORS.grass} style={{ width: "100%", boxShadow: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Check size={18} /> {t("detail_joined")}
              </span>
            </PillButton>
          ) : (
            <PillButton
              color={confirmLeave ? COLORS.coral : "#EAF8ED"}
              textColor={confirmLeave ? "#fff" : COLORS.grass}
              style={{ width: "100%", boxShadow: "none" }}
              onClick={() => {
                if (confirmLeave) { onLeave(item.id); setConfirmLeave(false); }
                else { setConfirmLeave(true); setTimeout(() => setConfirmLeave(false), 4000); }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                {confirmLeave ? t("leave_confirm") : (<><Check size={18} /> {t("detail_joined")}</>)}
              </span>
            </PillButton>
          )
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

        {!isPast && (
          <button
            onClick={onOpenOrga}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "#fff", border: `2px solid ${COLORS.grass}`, borderRadius: 12, padding: "11px 14px",
              color: COLORS.grass, fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Mail size={16} /> {item.createdBy === currentUserId ? t("orga_btn_owner") : t("orga_btn")}
          </button>
        )}

        {isJoined && (
          <button
            onClick={onOpenChat}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: COLORS.sky, border: "none", borderRadius: 12, padding: "11px 14px",
              color: "#fff", fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Users size={16} /> {t("chat_btn")}
          </button>
        )}

        {isToday && isJoined && (
          <button
            onClick={onOpenDefi}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: COLORS.sun, border: "none", borderRadius: 12, padding: "11px 14px",
              color: COLORS.ink, fontWeight: 800, fontSize: 13.5, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif", boxShadow: `0 3px 0 ${shade(COLORS.sun, -18)}`,
            }}
          >
            <Sparkles size={16} /> {item.defi ? t("defi_btn_view") : t("defi_btn")}
          </button>
        )}

        {!isPast && (
          <button
            onClick={() => onShare(item)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "#fff", border: "2px solid #F0EADB", borderRadius: 12, padding: "10px 14px",
              color: COLORS.ink, fontWeight: 800, fontSize: 13, marginTop: 14, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            <Share2 size={15} /> {t("share_btn")}
          </button>
        )}

        {!isPast && item.createdBy && item.createdBy === currentUserId && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => onEdit(item)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "#fff", border: "2px solid #F0EADB", borderRadius: 12, padding: "10px 14px",
                color: COLORS.ink, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif",
              }}
            >
              {t("btn_edit")}
            </button>
            <button
              onClick={() => {
                if (confirmCancel) { onCancelOuting(item.id); onClose(); }
                else { setConfirmCancel(true); setTimeout(() => setConfirmCancel(false), 4000); }
              }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: confirmCancel ? COLORS.coral : "#fff", border: `2px solid ${COLORS.coral}`, borderRadius: 12, padding: "10px 14px",
                color: confirmCancel ? "#fff" : COLORS.coral, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif",
              }}
            >
              {confirmCancel ? t("cancel_outing_confirm") : t("btn_cancel_outing")}
            </button>
          </div>
        )}

        <button
          onClick={() => onReport(item)}
          style={{
            display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
            color: "#B7AF98", fontWeight: 700, fontSize: 12, marginTop: 10, cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {t("report_btn")}
        </button>
      </div>
    </div>
  );
}

// ---------- Créer / lister ses propres rencontres (adultes, sans validation mairie) ----------
function CreateMeetup({ categories, onCreate }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "", category: categories[0].id, lieu: "", dateStr: todayISO, timeStr: "18:00", places: 8, info: "", desc: "", payant: false, signeDistinctif: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.lieu || !form.dateStr) return;
    onCreate({
      title: form.title, category: form.category, lieu: form.lieu, info: form.info, desc: form.desc,
      dateStr: form.dateStr, timeStr: form.timeStr, places: Number(form.places) || 1, payant: !!form.payant,
      signeDistinctif: form.signeDistinctif || null,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ title: "", category: categories[0].id, lieu: "", dateStr: todayISO, timeStr: "18:00", places: 8, info: "", desc: "", payant: false, signeDistinctif: "" });
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

        <IdeesSorties categorie={form.category} onChoisir={(idee) => setForm({ ...form, title: idee })} />

        <div>
          <label style={label}>{t("label_categorie")}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <Chip key={c.id} active={form.category === c.id} onClick={() => setForm({ ...form, category: c.id })} color={c.color}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <c.icon size={13} /> {c.label}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>{t("label_lieu")}</label>
            <AddressInput value={form.lieu} onChange={(v) => setForm({ ...form, lieu: v })} placeholder={t("placeholder_lieu")} />
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
          <label style={label}>{t("label_payant")}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip active={!form.payant} onClick={() => setForm({ ...form, payant: false })} color={COLORS.grass}>{t("toggle_non")}</Chip>
            <Chip active={!!form.payant} onClick={() => setForm({ ...form, payant: true })} color={COLORS.coral}>{t("toggle_oui")}</Chip>
          </div>
        </div>
        <div>
          <label style={label}>{t("label_signe")}</label>
          <input style={inputStyle} placeholder={t("placeholder_signe")} value={form.signeDistinctif} onChange={set("signeDistinctif")} />
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

// Modale de modification d'une sortie existante, réutilisée pour les sorties enfants et adultes/asso.
// Toute modification retire les personnes déjà inscrites (sauf l'organisateur, ré-inscrit automatiquement).
function EditActivityModal({ activity, space, categories, onClose, onSave }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const initialDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (activity.offsetDays || 0));
    return d.toISOString().slice(0, 10);
  })();
  const initialTime = (activity.time || "10h00").replace("h", ":");

  const [form, setForm] = useState({
    title: activity.title || "", category: activity.category || (categories[0] && categories[0].id),
    lieu: activity.lieu || "", dateStr: initialDate, timeStr: initialTime,
    places: activity.places || 6, desc: activity.desc || "", payant: !!activity.payant,
    signeDistinctif: activity.signeDistinctif || "", age: activity.age || "", info: activity.info || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "12px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };
  const label = { fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5, color: "#6B6485", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.4 };

  const submit = async () => {
    if (!form.title || !form.lieu || !form.dateStr) return;
    setSaving(true);
    const ok = await onSave({ ...form, places: Number(form.places) || 1 });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cloud, width: "100%", maxWidth: 560, borderRadius: "26px 26px 0 0",
        padding: "24px 24px calc(24px + env(safe-area-inset-bottom))", maxHeight: "calc(100dvh - 100px)", overflowY: "auto", boxSizing: "border-box", position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer" }}>
          <X size={18} color={COLORS.ink} />
        </button>
        <h2 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink, margin: "0 40px 6px 0" }}>
          {t("edit_title")}
        </h2>

        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: "#FFF4DD",
          border: `2px solid ${COLORS.sun}`, borderRadius: 14, padding: "10px 12px", marginBottom: 18,
        }}>
          <ShieldCheck size={16} color={COLORS.sun} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>
            {t("edit_warning")}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={label}>{t("label_titre")}</label>
            <input style={inputStyle} value={form.title} onChange={set("title")} />
          </div>

          <div>
            <label style={label}>{t("label_categorie")}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((c) => (
                <Chip key={c.id} active={form.category === c.id} onClick={() => setForm({ ...form, category: c.id })} color={c.color}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <c.icon size={13} /> {c.label}
                  </span>
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label style={label}>{t("label_lieu")}</label>
            <AddressInput value={form.lieu} onChange={(v) => setForm({ ...form, lieu: v })} placeholder={t("placeholder_lieu")} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>{t("label_date")}</label>
              <input type="date" min={todayISO} style={inputStyle} value={form.dateStr} onChange={set("dateStr")} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>{t("label_heure")}</label>
              <input type="time" style={inputStyle} value={form.timeStr} onChange={set("timeStr")} />
            </div>
          </div>

          {space === "kids" ? (
            <div>
              <label style={label}>{t("label_age")}</label>
              <input style={inputStyle} placeholder={t("placeholder_age")} value={form.age} onChange={set("age")} />
            </div>
          ) : (
            <div>
              <label style={label}>{t("label_info")}</label>
              <input style={inputStyle} placeholder={t("placeholder_info")} value={form.info} onChange={set("info")} />
            </div>
          )}

          <div>
            <label style={label}>{t("label_places")}</label>
            <input type="number" min={1} style={inputStyle} value={form.places} onChange={set("places")} />
          </div>

          <div>
            <label style={label}>{t("label_payant")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <Chip active={!form.payant} onClick={() => setForm({ ...form, payant: false })} color={COLORS.grass}>{t("toggle_non")}</Chip>
              <Chip active={!!form.payant} onClick={() => setForm({ ...form, payant: true })} color={COLORS.coral}>{t("toggle_oui")}</Chip>
            </div>
          </div>

          <div>
            <label style={label}>{t("label_signe")}</label>
            <input style={inputStyle} placeholder={t("placeholder_signe")} value={form.signeDistinctif} onChange={set("signeDistinctif")} />
          </div>

          <div>
            <label style={label}>{t("label_description")}</label>
            <textarea rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "Nunito, sans-serif" }}
              placeholder={t("placeholder_description")} value={form.desc} onChange={set("desc")} />
          </div>

          <PillButton color={COLORS.grass} textColor="#fff" onClick={submit} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? t("auth_loading") : t("edit_save")}
          </PillButton>
        </div>
      </div>
    </div>
  );
}

// Une seule ligne de sortie, réutilisée dans les listes "créées" et "rejointes".
function OutingRow({ item, categories, onOpen }) {
  const meta = metaFrom(categories, item.category);
  const Icon = meta.icon;
  return (
    <div onClick={() => onOpen(item)} style={{
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
}

function EmptyBox({ text }) {
  return (
    <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 20, padding: 18, textAlign: "center" }}>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#9A93AF", fontSize: 13.5, margin: 0 }}>{text}</p>
    </div>
  );
}

// Affiche séparément les sorties que l'on a créées (on en est l'organisateur)
// et celles que l'on a simplement rejointes — la distinction est plus claire à l'usage.
function MyMeetups({ items, joined, categories, onOpen, title, subtitle, currentUserId }) {
  const mine = items.filter((it) => joined.includes(it.id));
  const created = mine.filter((it) => it.createdBy && it.createdBy === currentUserId);
  const joinedOnly = mine.filter((it) => !it.createdBy || it.createdBy !== currentUserId);

  return (
    <div>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {title || t("my_meetups_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 18px" }}>
        {subtitle || t("my_meetups_subtitle")}
      </p>

      <SectionLabel>{t("my_created_label")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {created.length === 0
          ? <EmptyBox text={t("my_created_empty")} />
          : created.map((item) => <OutingRow key={item.id} item={item} categories={categories} onOpen={onOpen} />)}
      </div>

      <SectionLabel>{t("my_joined_label")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {joinedOnly.length === 0
          ? <EmptyBox text={t("my_joined_empty")} />
          : joinedOnly.map((item) => <OutingRow key={item.id} item={item} categories={categories} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

// Section "Adultes" avec sa propre sous-navigation Découvrir / Créer / Mes rencontres —
// entièrement indépendante de la validation mairie (réservée aux sorties Enfants/Ados).
// Onglet "Créer" fusionné : sortie enfant (si validé par la mairie) ou rencontre adulte (toujours).
// Pas d'onglet séparé pour les adultes — tout passe par les mêmes onglets Créer / Mes sorties.
function CreatePage({ parentValidated, onCreateKid, onCreateTeen, onCreateAdult, onCreateSenior, onCreateAsso, role }) {
  const [kind, setKind] = useState(parentValidated ? "enfant" : "adulte");

  // Une mairie ou une association propose uniquement des événements Commune —
  // pas de sortie en son nom propre dans une autre catégorie.
  if (role === "mairie" || role === "association") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <CreateMeetup categories={ASSO_CATEGORIES} onCreate={onCreateAsso} />
      </div>
    );
  }

  const OPTIONS = [
    { id: "enfant", label: t("create_toggle_child"), needsValidation: true },
    { id: "jeune", label: t("create_toggle_teen"), needsValidation: true },
    { id: "adulte", label: t("create_toggle_adult"), needsValidation: false },
    { id: "aine", label: t("create_toggle_senior"), needsValidation: false },
  ].filter((opt) => !opt.needsValidation || parentValidated);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "inline-flex", flexWrap: "wrap", background: "#F0EADB", borderRadius: 14, padding: 4, marginBottom: 18 }}>
        {OPTIONS.map((opt) => (
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

      {kind === "enfant" && parentValidated && <CreateActivity onCreate={onCreateKid} />}
      {kind === "jeune" && parentValidated && <CreateMeetup categories={TEEN_CATEGORIES} onCreate={onCreateTeen} />}
      {kind === "adulte" && <CreateMeetup categories={ADULT_CATEGORIES} onCreate={onCreateAdult} />}
      {kind === "aine" && <CreateMeetup categories={SENIOR_CATEGORIES} onCreate={onCreateSenior} />}
    </div>
  );
}

// Onglet "Mes sorties" fusionné : passeport enfants (si validé) + rencontres adultes (toujours).
// Une seule liste unifiée : toutes catégories confondues (Parent, Jeune, Adulte, Ainé),
// créées ET rejointes, triées par date. Les sorties créées par la personne se distinguent
// visuellement, et les sorties déjà passées sont grisées.
function MesSortiesPage({
  parentValidated, currentUserId, onViewProfile,
  joined, activities, onOpenKid, favorites, onToggleFavKid,
  teenItems, joinedTeen, onOpenTeen, favTeen, onToggleFavTeen,
  adultItems, joinedAdult, onOpenAdult, favAdult, onToggleFavAdult,
  seniorItems, joinedSenior, onOpenSenior, favSenior, onToggleFavSenior,
}) {
  const groups = [
    { items: activities, joinedIds: joined, categories: CATEGORIES, onOpen: onOpenKid, label: t("tab_enfants"), visible: parentValidated, genderMode: false, favorites: favorites, onToggleFav: onToggleFavKid },
    { items: teenItems, joinedIds: joinedTeen, categories: TEEN_CATEGORIES, onOpen: onOpenTeen, label: t("tab_ados"), visible: parentValidated, genderMode: true, favorites: favTeen, onToggleFav: onToggleFavTeen },
    { items: adultItems, joinedIds: joinedAdult, categories: ADULT_CATEGORIES, onOpen: onOpenAdult, label: t("tab_adultes"), visible: true, genderMode: true, favorites: favAdult, onToggleFav: onToggleFavAdult },
    { items: seniorItems, joinedIds: joinedSenior, categories: SENIOR_CATEGORIES, onOpen: onOpenSenior, label: t("tab_aine"), visible: true, genderMode: true, favorites: favSenior, onToggleFav: onToggleFavSenior },
  ];

  const all = [];
  groups.forEach((g) => {
    if (!g.visible) return;
    g.items.filter((it) => g.joinedIds.includes(it.id)).forEach((it) => {
      all.push({
        item: it, categories: g.categories, onOpen: g.onOpen, spaceLabel: g.label,
        genderMode: g.genderMode, favorites: g.favorites || [], onToggleFav: g.onToggleFav,
      });
    });
  });

  // Tri chronologique : les plus proches d'abord, les sorties passées relèguées à la fin
  const withDate = all.map((entry) => {
    const d = new Date();
    d.setDate(d.getDate() + (entry.item.offsetDays || 0));
    d.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return { ...entry, isPast: d < today, sortKey: entry.item.offsetDays ?? 0 };
  });
  withDate.sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    return a.sortKey - b.sortKey;
  });

  return (
    <div>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("my_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", color: "#6B6485", fontSize: 14, margin: "0 0 12px" }}>
        {t("my_all_subtitle")}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#6B6485", fontWeight: 700 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: "#FFF9EC", border: `2px solid ${COLORS.sun}`, display: "inline-block" }} />
          {t("legend_created")}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#6B6485", fontWeight: 700 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: "#fff", border: "2px solid #F0EADB", display: "inline-block" }} />
          {t("legend_joined")}
        </span>
      </div>

      {withDate.length === 0 ? (
        <EmptyBox text={t("my_meetups_empty")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {withDate.map(({ item, categories, onOpen, spaceLabel, isPast, genderMode, favorites, onToggleFav }) => (
            <NarrowMeetupRow
              key={`${spaceLabel}-${item.id}`}
              item={item}
              categories={categories}
              onOpen={onOpen}
              favorite={favorites.includes(item.id)}
              onToggleFav={onToggleFav}
              genderMode={genderMode}
              onViewProfile={onViewProfile}
              isCreator={!!(item.createdBy && item.createdBy === currentUserId)}
              isPast={isPast}
              spaceLabel={spaceLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Authentification ----------
function AuthScreen({ onClose, onOpenLegal }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [accountType, setAccountType] = useState("parent"); // "parent" | "association"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [nbEnfants, setNbEnfants] = useState(0);
  const [nbMoins12, setNbMoins12] = useState(0);
  const [genre, setGenre] = useState("F");
  const [commune, setCommune] = useState(null);
  const [birthdate, setBirthdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", border: "2px solid #F0EADB", borderRadius: 14, padding: "12px 14px",
    fontFamily: "Nunito, sans-serif", fontSize: 14.5, color: COLORS.ink, outline: "none",
    boxSizing: "border-box", background: "#fff", marginBottom: 12,
  };

  // Envoi d'un lien de réinitialisation par email (Supabase gère le reste)
  const resetPassword = async () => {
    setError("");
    if (!email.trim()) { setError(t("auth_forgot_need_email")); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    setError(err ? (err.message || t("auth_error_generic")) : t("auth_forgot_sent"));
  };

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) return;
    if (mode === "signup" && accountType === "parent" && !pseudo.trim()) {
      setError(t("auth_pseudo_required"));
      return;
    }
    // Le pseudo est public et sert à identifier chacun : il doit être unique
    if (mode === "signup" && accountType === "parent") {
      // La date de naissance conditionne l'accès à la messagerie (mineurs séparés des majeurs)
      if (!birthdate) { setError(t("auth_birthdate_required")); return; }
      const { data: libre } = await supabase.rpc("pseudo_disponible", { p: pseudo.trim() });
      if (libre === false) { setError(t("pseudo_pris")); return; }
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        // Le pseudo est ce qui s'affiche publiquement ; prénom et nom restent privés.
        const publicName = accountType === "association" ? name : (pseudo.trim() || name);
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: {
            display_name: publicName,
            pseudo: publicName,
            first_name: accountType === "parent" ? name : null,
            last_name: accountType === "parent" ? (lastName || null) : null,
            commune_nom: accountType === "parent" && commune ? commune.nom : null,
            commune_lat: accountType === "parent" && commune ? commune.lat : null,
            commune_lon: accountType === "parent" && commune ? commune.lon : null,
            commune_dept: accountType === "parent" && commune ? (commune.dept || null) : null,
            birthdate: accountType === "parent" && birthdate ? birthdate : null,
            nb_enfants: accountType === "parent" ? nbEnfants : 0,
            nb_enfants_moins_12: accountType === "parent" ? nbMoins12 : 0,
          } },
        });
        if (err) throw err;
        if (data?.user?.id) {
          const patch = accountType === "association"
            ? { role: "association", association_name: name }
            : { genre };
          await supabase.from("profiles").update(patch).eq("id", data.user.id);
        }
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

  const content = (
    <>
      <OreeMascot size={56} rotate={-4} />
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "14px 0 4px", textAlign: "center" }}>
        {t("auth_title")}
      </h1>
      <p style={{ color: "#6B6485", fontSize: 14, textAlign: "center", margin: "0 0 22px", maxWidth: 320 }}>
        {t("auth_subtitle")}
      </p>

      <div style={{ width: "100%", maxWidth: 340 }}>
        {mode === "signup" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { id: "parent", label: t("account_type_parent") },
              { id: "association", label: t("account_type_association") },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAccountType(opt.id)}
                style={{
                  flex: 1, border: `2px solid ${accountType === opt.id ? COLORS.grass : "#F0EADB"}`,
                  background: accountType === opt.id ? COLORS.grass : "#fff",
                  color: accountType === opt.id ? "#fff" : COLORS.ink,
                  borderRadius: 12, padding: "9px 8px", fontFamily: "Nunito, sans-serif",
                  fontWeight: 800, fontSize: 12.5, cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {mode === "signup" && (
          <input
            style={inputStyle}
            placeholder={accountType === "association" ? t("auth_association_name") : t("auth_name")}
            value={name} onChange={(e) => setName(e.target.value)}
          />
        )}
        {mode === "signup" && accountType === "parent" && (
          <input
            style={inputStyle}
            placeholder={t("auth_last_name")}
            value={lastName} onChange={(e) => setLastName(e.target.value)}
          />
        )}
        {mode === "signup" && accountType === "parent" && (
          <>
            <input
              style={inputStyle}
              placeholder={t("auth_pseudo")}
              value={pseudo} onChange={(e) => setPseudo(e.target.value)}
            />
            <p style={{ fontSize: 11, color: "#9A93AF", margin: "-6px 0 12px" }}>{t("auth_pseudo_note")}</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485", display: "block", marginBottom: 4 }}>
                  {t("profile_nb_enfants_label")}
                </label>
                <input
                  type="number" min={0} max={12} style={{ ...inputStyle, marginBottom: 0 }}
                  value={nbEnfants}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(12, Number(e.target.value) || 0));
                    setNbEnfants(v);
                    if (nbMoins12 > v) setNbMoins12(v);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485", display: "block", marginBottom: 4 }}>
                  {t("auth_nb_moins12")}
                </label>
                <input
                  type="number" min={0} max={nbEnfants} style={{ ...inputStyle, marginBottom: 0 }}
                  value={nbMoins12}
                  onChange={(e) => setNbMoins12(Math.max(0, Math.min(nbEnfants, Number(e.target.value) || 0)))}
                />
              </div>
            </div>
            <p style={{ fontSize: 11, color: nbMoins12 > 0 ? COLORS.grass : "#9A93AF", fontWeight: nbMoins12 > 0 ? 700 : 400, margin: "-4px 0 12px", lineHeight: 1.4 }}>
              {nbMoins12 > 0 ? t("access_parent_ok") : t("access_parent_locked")}
            </p>
          </>
        )}
        {mode === "signup" && accountType === "parent" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { id: "F", label: t("legend_femme") },
              { id: "H", label: t("legend_homme") },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGenre(opt.id)}
                style={{
                  flex: 1, border: `2px solid ${genre === opt.id ? genreColor(opt.id) : "#F0EADB"}`,
                  background: genre === opt.id ? genreColor(opt.id) : "#fff",
                  color: genre === opt.id ? "#fff" : COLORS.ink,
                  borderRadius: 12, padding: "9px 8px", fontFamily: "Nunito, sans-serif",
                  fontWeight: 800, fontSize: 12.5, cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {mode === "signup" && accountType === "parent" && (
          <div style={{ marginBottom: 12 }}>
            <CommunePicker
              value={commune?.nom}
              onSelect={setCommune}
              placeholder={t("auth_commune_placeholder")}
            />
          </div>
        )}
        {mode === "signup" && accountType === "parent" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 12, color: "#6B6485", display: "block", marginBottom: 6 }}>
              {t("auth_birthdate_label")}
            </label>
            <input
              type="date" style={inputStyle} value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
        )}
        <input
          style={inputStyle} type="email" placeholder={t("auth_email")} value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email" name="email"
        />
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, paddingRight: 42 }}
            type={showPassword ? "text" : "password"}
            placeholder={t("auth_password")} value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"} name="password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hide_password") : t("show_password")}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex",
              marginTop: -6,
            }}
          >
            {/* Œil ouvert = mot de passe visible ; œil barré = masqué */}
            {showPassword ? <Eye size={18} color="#9A93AF" /> : <EyeOff size={18} color="#9A93AF" />}
          </button>
        </div>

        {mode === "signup" && accountType === "association" && (
          <p style={{ fontSize: 12, color: "#9A93AF", margin: "-4px 0 12px" }}>{t("auth_association_note")}</p>
        )}

        {error && (
          <div style={{ color: COLORS.coral, fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{error}</div>
        )}

        <PillButton color={COLORS.grass} textColor="#fff" onClick={submit} style={{ width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? t("auth_loading") : mode === "signup" ? t("auth_signup_btn") : t("auth_login_btn")}
        </PillButton>

        {mode === "signup" && (
          <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#9A93AF", textAlign: "center", margin: "10px 0 0" }}>
            En créant un compte, vous acceptez nos{" "}
            <button type="button" onClick={() => onOpenLegal("cgu")} style={{ background: "none", border: "none", padding: 0, color: "#6B6485", fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>
              {t("legal_cgu_title")}
            </button>{" "}
            et notre{" "}
            <button type="button" onClick={() => onOpenLegal("confidentialite")} style={{ background: "none", border: "none", padding: 0, color: "#6B6485", fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>
              {t("legal_confidentialite_title")}
            </button>.
          </p>
        )}

        <button
          onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
          style={{
            display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
            color: "#6B6485", fontWeight: 700, fontSize: 13, marginTop: 16, cursor: "pointer",
          }}
        >
          {mode === "signup" ? t("auth_switch_to_login") : t("auth_switch_to_signup")}
        </button>

        {mode === "login" && (
          <button
            onClick={resetPassword}
            style={{
              display: "block", width: "100%", textAlign: "center", background: "none", border: "none",
              color: "#9A93AF", fontWeight: 700, fontSize: 12, marginTop: 10, cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {t("auth_forgot")}
          </button>
        )}
      </div>
    </>
  );

  if (onClose) {
    return (
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(43,37,96,0.5)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: COLORS.cloud, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 380,
          maxHeight: "90vh", overflowY: "auto", position: "relative", display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}>
            <X size={15} color={COLORS.ink} />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.cloud, minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Nunito, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap');
      `}</style>
      {content}
    </div>
  );
}

// ---------- Espace mairie ----------
const SPACE_LABELS = {
  kids: "tab_enfants", teen: "tab_ados", adult: "tab_adultes", senior: "tab_aine", asso: "tab_associations",
};

function StatCard({ value, label, color }) {
  return (
    <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 26, color: color || COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: "#6B6485", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StatsSection({ allProfiles, allActivitiesRaw }) {
  const stats = useMemo(() => {
    const totalUsers = allProfiles.length;
    const parents = allProfiles.filter((p) => p.role === "parent");
    const femmes = parents.filter((p) => p.genre === "F").length;
    const hommes = parents.filter((p) => p.genre === "H").length;

    const now = new Date();
    const spaceTotal = {}; const spaceActive = {};
    allActivitiesRaw.forEach((a) => {
      spaceTotal[a.space] = (spaceTotal[a.space] || 0) + 1;
      if (new Date(a.starts_at) >= now) spaceActive[a.space] = (spaceActive[a.space] || 0) + 1;
    });
    const totalActiveToday = Object.values(spaceActive).reduce((s, n) => s + n, 0);

    // 12 derniers mois, y compris le mois courant
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, date: d, count: 0 });
    }
    allActivitiesRaw.forEach((a) => {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((mo) => mo.key === key);
      if (m) m.count += 1;
    });
    const locale = LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US";
    const monthlyData = months.map((m) => ({
      label: m.date.toLocaleDateString(locale, { month: "short" }),
      count: m.count,
    }));

    return { totalUsers, femmes, hommes, spaceTotal, spaceActive, totalActiveToday, monthlyData };
  }, [allProfiles, allActivitiesRaw]);

  return (
    <div>
      <SectionLabel>{t("stats_users")}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 26 }}>
        <StatCard value={stats.totalUsers} label={t("stats_total_users")} />
        <StatCard value={stats.femmes} label={t("legend_femme")} color={COLORS.girl} />
        <StatCard value={stats.hommes} label={t("legend_homme")} color={COLORS.boy} />
      </div>

      <SectionLabel>{t("stats_by_space")}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 10 }}>
        {Object.entries(SPACE_LABELS).map(([space, labelKey]) => (
          <StatCard key={space} value={stats.spaceTotal[space] || 0} label={t(labelKey)} />
        ))}
      </div>
      <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#9A93AF", margin: "0 0 26px" }}>
        {t("stats_all_time_note")}
      </p>

      <SectionLabel>{t("stats_active_today")}</SectionLabel>
      <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: "18px 16px", marginBottom: 26, textAlign: "center" }}>
        <div style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 32, color: COLORS.grass }}>{stats.totalActiveToday}</div>
        <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 12.5, color: "#6B6485", marginTop: 2 }}>{t("stats_active_today_note")}</div>
      </div>

      <SectionLabel>{t("stats_monthly_chart")}</SectionLabel>
      <div style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: "14px 8px 4px", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EADB" vertical={false} />
            <XAxis dataKey="label" tick={{ fontFamily: "Nunito, sans-serif", fontSize: 11, fill: "#6B6485" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontFamily: "Nunito, sans-serif", fontSize: 11, fill: "#6B6485" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ fontFamily: "Nunito, sans-serif", fontSize: 12.5, borderRadius: 10, border: "2px solid #F0EADB" }}
              labelStyle={{ fontWeight: 800, color: COLORS.ink }}
              formatter={(value) => [value, t("stats_outings_created")]}
            />
            <Bar dataKey="count" fill={COLORS.sun} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UsersAdminSection({ allProfiles, currentUserId, onToggleBan, onDelete, onSetCommune }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [query, setQuery] = useState("");

  const roleLabel = (p) => {
    if (p.role === "mairie") return t("tab_mairie");
    if (p.role === "association") return t("account_type_association");
    return t("account_type_parent");
  };

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProfiles;
    return allProfiles.filter((p) => {
      const name = (p.role === "association" ? (p.association_name || p.display_name) : p.display_name) || "";
      return name.toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q);
    });
  }, [allProfiles, query]);

  const handleDelete = (id) => {
    if (confirmingId === id) {
      onDelete(id);
      setConfirmingId(null);
    } else {
      setConfirmingId(id);
      setTimeout(() => setConfirmingId((c) => (c === id ? null : c)), 4000);
    }
  };

  return (
    <div>
      <SectionLabel>{t("admin_users_title")}</SectionLabel>

      <div style={{
        display: "flex", alignItems: "center", gap: 8, background: "#fff",
        border: "2px solid #F0EADB", borderRadius: 14, padding: "9px 12px", marginBottom: 14,
      }}>
        <Search size={16} color="#B7AF98" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin_search_placeholder")}
          style={{ border: "none", outline: "none", fontFamily: "Nunito, sans-serif", fontSize: 13.5, flex: 1, background: "transparent", color: COLORS.ink }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredProfiles.length === 0 && (
          <p style={{ color: "#9A93AF", fontFamily: "Nunito, sans-serif", fontSize: 13.5 }}>
            {allProfiles.length === 0 ? t("admin_no_users") : t("admin_no_results")}
          </p>
        )}
        {filteredProfiles.map((p) => {
          const isSelf = p.id === currentUserId;
          const name = p.role === "association" ? (p.association_name || p.display_name) : p.display_name;
          const color = p.genre ? genreColor(p.genre) : COLORS.ink;
          return (
            <div key={p.id} style={{
              background: "#fff", border: `2px solid ${p.banned ? COLORS.coral : "#F0EADB"}`, borderRadius: 16,
              padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", background: color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14,
              }}>
                {(name || "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13.5, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {name} {isSelf && <span style={{ color: "#B7AF98", fontWeight: 700 }}>{t("admin_you")}</span>}
                  {p.banned && (
                    <span style={{ background: "#FFF0EC", color: COLORS.coral, fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                      {t("admin_banned_badge")}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF" }}>
                  {roleLabel(p)}{p.commune ? ` · ${villeName(p.commune)}` : ""}{ageFromBirthdate(p.birthdate) !== null ? ` · ${ageFromBirthdate(p.birthdate)} ${t("profile_years")}` : ""}
                </div>
              </div>
              {(p.role === "mairie" || p.role === "association") && (
                <select
                  value={p.commune || ""}
                  onChange={(e) => onSetCommune(p.id, e.target.value)}
                  style={{
                    border: "2px solid #F0EADB", borderRadius: 10, padding: "6px 8px",
                    fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 11.5, color: COLORS.ink,
                  }}
                >
                  <option value="">{t("admin_no_commune")}</option>
                  {Object.entries(CITY_META).map(([id, c]) => (
                    <option key={id} value={id}>{c.label}</option>
                  ))}
                </select>
              )}
              {!isSelf && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onToggleBan(p.id, !p.banned)}
                    style={{
                      fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, cursor: "pointer",
                      background: "transparent", border: "2px solid #F0EADB", borderRadius: 10, padding: "6px 10px", color: COLORS.ink,
                    }}
                  >
                    {p.banned ? t("admin_unblock") : t("admin_block")}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, cursor: "pointer",
                      background: confirmingId === p.id ? COLORS.coral : "transparent",
                      border: `2px solid ${COLORS.coral}`, borderRadius: 10, padding: "6px 10px",
                      color: confirmingId === p.id ? "#fff" : COLORS.coral,
                    }}
                  >
                    {confirmingId === p.id ? t("admin_delete_confirm") : t("admin_delete")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Traitement des signalements par l'administrateur : consulter, annoter,
// classer, bloquer la personne visée ou marquer comme transmis aux autorités.
// Traitement des signalements : une ligne compacte par signalement, dépliable au clic
// pour consulter le détail complet et agir (traiter, transmettre, bloquer, annoter).
function ReportsAdminSection({ reports, onHandle, onToggleBan, onViewProfile, photos = [], onTraiterPhoto }) {
  const [filter, setFilter] = useState("pending");
  const [openId, setOpenId] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");

  const FILTERS = [
    { id: "pending", label: t("mairie_report_status_pending") },
    { id: "reviewed", label: t("mairie_report_status_reviewed") },
    { id: "escalated", label: t("report_status_escalated") },
    { id: "dismissed", label: t("mairie_report_status_dismissed") },
    { id: "all", label: t("chip_all") },
  ];

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const reasonLabel = (r) => {
    const key = `report_reason_${r}`;
    return t(key) !== key ? t(key) : r;
  };
  const statusStyle = (s) => ({
    pending: { bg: "#FFF4DD", fg: COLORS.sun, label: t("mairie_report_status_pending") },
    reviewed: { bg: "#EAF8ED", fg: COLORS.grass, label: t("mairie_report_status_reviewed") },
    escalated: { bg: "#FFF0EC", fg: COLORS.coral, label: t("report_status_escalated") },
    dismissed: { bg: "#EDEAF4", fg: "#9A93AF", label: t("mairie_report_status_dismissed") },
  }[s] || { bg: "#EDEAF4", fg: "#9A93AF", label: s });

  const saveNote = async (id) => {
    const r = reports.find((x) => x.id === id);
    await onHandle(id, r.status, noteText);
    setNoteFor(null);
    setNoteText("");
  };

  const actionBtn = (label, onClick, accent = COLORS.ink, filled = false) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5, cursor: "pointer",
      background: filled ? accent : "transparent", color: filled ? "#fff" : accent,
      border: `2px solid ${accent}`, borderRadius: 10, padding: "6px 11px",
    }}>
      {label}
    </button>
  );

  return (
    <div>
      {photos.length > 0 && (
        <>
          <SectionLabel>{t("admin_photos_title")}</SectionLabel>
          <div style={{
            background: "#FFF4DD", border: `2px solid ${COLORS.sun}`, borderRadius: 14,
            padding: "10px 14px", marginBottom: 12, fontFamily: "Nunito, sans-serif",
            fontWeight: 700, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5,
          }}>
            {t("admin_photos_note")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {photos.map((p) => (
              <div key={p.id} style={{
                background: "#fff", border: "2px solid #F0EADB", borderRadius: 16,
                padding: 12, display: "flex", alignItems: "center", gap: 12,
              }}>
                <img
                  src={p.image_url} alt=""
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "#EDEAF4" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => onViewProfile(p.user_id)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                      fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13.5, color: COLORS.ink, textDecoration: "underline" }}
                  >
                    {p.display_name}
                  </button>
                  <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#9A93AF" }}>
                    {p.type === "cover" ? t("profile_cover_label") : t("change_photo")}
                    {p.score_sexual != null ? ` · ${Math.round(p.score_sexual * 100)}%` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onTraiterPhoto(p.id, "ok", p.user_id, p.type)} style={{
                    background: "transparent", border: `2px solid ${COLORS.grass}`, borderRadius: 10,
                    padding: "6px 11px", color: COLORS.grass, cursor: "pointer",
                    fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5,
                  }}>
                    {t("admin_photo_ok")}
                  </button>
                  <button onClick={() => onTraiterPhoto(p.id, "removed", p.user_id, p.type)} style={{
                    background: COLORS.coral, border: "none", borderRadius: 10,
                    padding: "6px 11px", color: "#fff", cursor: "pointer",
                    fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11.5,
                  }}>
                    {t("admin_photo_remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel>{t("admin_reports_title")}</SectionLabel>
      {pendingCount > 0 && (
        <div style={{
          background: "#FFF4DD", border: `2px solid ${COLORS.sun}`, borderRadius: 14,
          padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
        }}>
          <Clock size={16} color={COLORS.sun} />
          <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13, color: COLORS.ink }}>
            {t("admin_reports_pending", { n: pendingCount })}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} color={COLORS.ink}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <EmptyBox text={t("admin_reports_empty")} />}
        {filtered.map((r) => {
          const st = statusStyle(r.status);
          const isOpen = openId === r.id;
          const shortDate = new Date(r.created_at).toLocaleDateString(
            LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "2-digit" }
          );
          const fullDate = new Date(r.created_at).toLocaleDateString(
            LANG === "fr" ? "fr-FR" : LANG === "es" ? "es-ES" : "en-US",
            { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
          );

          return (
            <div key={r.id} style={{
              background: "#fff", border: `2px solid ${r.status === "pending" ? COLORS.sun : "#F0EADB"}`,
              borderRadius: 14, overflow: "hidden",
            }}>
              {/* Ligne compacte */}
              <div
                onClick={() => { setOpenId(isOpen ? null : r.id); setNoteFor(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer",
                }}
              >
                <span style={{
                  fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 10, padding: "2px 7px",
                  borderRadius: 999, background: st.bg, color: st.fg, flexShrink: 0, whiteSpace: "nowrap",
                }}>
                  {st.label}
                </span>
                <span style={{
                  fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13, color: COLORS.ink,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0,
                }}>
                  {reasonLabel(r.reason)}
                </span>
                <span style={{
                  fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#8A8399", flex: 1, minWidth: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {r.reported_name ? `→ ${r.reported_name}` : (r.activity_title || "")}
                </span>
                {r.reported_banned && (
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 9.5, color: COLORS.coral, flexShrink: 0 }}>
                    {t("admin_banned_badge")}
                  </span>
                )}
                <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#B7AF98", flexShrink: 0 }}>
                  {shortDate}
                </span>
                <ChevronDown
                  size={16} color="#C7C0AE"
                  style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}
                />
              </div>

              {/* Détail déplié */}
              {isOpen && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid #F5F1E6" }}>
                  <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11.5, color: "#9A93AF", margin: "10px 0" }}>
                    {fullDate}
                  </div>

                  {r.details && (
                    <p style={{
                      fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#5C5578", lineHeight: 1.5,
                      background: "#F9F7F2", borderRadius: 12, padding: "10px 12px", margin: "0 0 12px",
                      overflowWrap: "anywhere",
                    }}>
                      {r.details}
                    </p>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: "#F9F7F2", borderRadius: 12, padding: "8px 12px" }}>
                      <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10, fontWeight: 800, color: "#9A93AF", textTransform: "uppercase", letterSpacing: 0.4 }}>
                        {t("admin_report_reporter")}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); r.reporter_id && onViewProfile(r.reporter_id); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: r.reporter_id ? "pointer" : "default", textAlign: "left", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink, textDecoration: r.reporter_id ? "underline" : "none" }}
                      >
                        {r.reporter_name || "—"}
                      </button>
                      {r.reporter_email && (
                        <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#9A93AF", overflowWrap: "anywhere" }}>{r.reporter_email}</div>
                      )}
                    </div>

                    <div style={{ background: r.reported_banned ? "#FFF0EC" : "#F9F7F2", borderRadius: 12, padding: "8px 12px" }}>
                      <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 10, fontWeight: 800, color: "#9A93AF", textTransform: "uppercase", letterSpacing: 0.4 }}>
                        {t("admin_report_reported")}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); r.reported_user_id && onViewProfile(r.reported_user_id); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: r.reported_user_id ? "pointer" : "default", textAlign: "left", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.ink, textDecoration: r.reported_user_id ? "underline" : "none" }}
                      >
                        {r.reported_name || "—"}
                      </button>
                      {r.reported_email && (
                        <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#9A93AF", overflowWrap: "anywhere" }}>{r.reported_email}</div>
                      )}
                    </div>
                  </div>

                  {r.activity_title && (
                    <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#6B6485", marginBottom: 12 }}>
                      <span style={{ fontWeight: 800, color: "#9A93AF" }}>{t("admin_report_activity")} : </span>
                      {r.activity_title}
                    </div>
                  )}

                  {r.admin_note && noteFor !== r.id && (
                    <div style={{
                      background: "#EDEAF4", borderRadius: 12, padding: "8px 12px", marginBottom: 12,
                      fontFamily: "Nunito, sans-serif", fontSize: 12.5, color: COLORS.grape, overflowWrap: "anywhere",
                    }}>
                      <span style={{ fontWeight: 800 }}>{t("admin_report_note")} : </span>{r.admin_note}
                    </div>
                  )}

                  {noteFor === r.id ? (
                    <div>
                      <textarea
                        autoFocus rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={t("admin_report_note_ph")}
                        style={{
                          width: "100%", border: "2px solid #F0EADB", borderRadius: 12, padding: "8px 12px",
                          fontFamily: "Nunito, sans-serif", fontSize: 13, boxSizing: "border-box", resize: "vertical", marginBottom: 6,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        {actionBtn(t("btn_enregistrer"), () => saveNote(r.id), COLORS.grass, true)}
                        {actionBtn("✕", () => { setNoteFor(null); setNoteText(""); }, "#C7C0AE")}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {r.status !== "pending" && actionBtn(t("admin_report_reopen"), () => onHandle(r.id, "pending"), COLORS.sun)}
                      {r.status !== "reviewed" && actionBtn(t("mairie_mark_reviewed"), () => onHandle(r.id, "reviewed"), COLORS.grass)}
                      {r.status !== "escalated" && actionBtn(t("admin_report_escalate"), () => onHandle(r.id, "escalated"), COLORS.coral)}
                      {r.status !== "dismissed" && actionBtn(t("mairie_dismiss"), () => onHandle(r.id, "dismissed"), "#9A93AF")}
                      {actionBtn(t("admin_report_add_note"), () => { setNoteFor(r.id); setNoteText(r.admin_note || ""); }, COLORS.grape)}
                      {r.reported_user_id && actionBtn(
                        r.reported_banned ? t("admin_unblock") : t("admin_block"),
                        () => onToggleBan(r.reported_user_id, !r.reported_banned),
                        COLORS.coral, !r.reported_banned
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminArea({ allProfiles, allActivitiesRaw, currentUserId, onToggleBan, onDelete, onSetCommune, reportsDetailed, onHandleReport, onViewProfile, photos, onTraiterPhoto }) {
  const [sub, setSub] = useState("stats");
  const pendingReports = (reportsDetailed || []).filter((r) => r.status === "pending").length;
  const subTabs = [
    { id: "stats", label: t("admin_sub_stats") },
    { id: "users", label: t("admin_sub_users") },
    { id: "reports", label: t("admin_sub_reports") + (pendingReports > 0 ? ` (${pendingReports})` : "") },
  ];
  return (
    <div>
      <div style={{ display: "inline-flex", background: "#F0EADB", borderRadius: 14, padding: 4, marginBottom: 22 }}>
        {subTabs.map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            style={{
              border: "none", cursor: "pointer",
              background: sub === s.id ? COLORS.ink : "transparent",
              color: sub === s.id ? "#fff" : "#6B6485",
              padding: "8px 14px", borderRadius: 12, fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sub === "stats" && <StatsSection allProfiles={allProfiles} allActivitiesRaw={allActivitiesRaw} />}
      {sub === "users" && (
        <UsersAdminSection allProfiles={allProfiles} currentUserId={currentUserId} onToggleBan={onToggleBan} onDelete={onDelete} onSetCommune={onSetCommune} />
      )}
      {sub === "reports" && (
        <ReportsAdminSection reports={reportsDetailed || []} onHandle={onHandleReport} onToggleBan={onToggleBan} onViewProfile={onViewProfile} photos={photos || []} onTraiterPhoto={onTraiterPhoto} />
      )}
    </div>
  );
}

// Écran plein affiché à la place de l'appli si le compte a été bloqué par un administrateur.
function BannedScreen({ onSignOut }) {
  return (
    <div style={{ background: COLORS.cloud, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <OreeMascot size={48} />
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "16px 0 8px" }}>
        {t("banned_title")}
      </h1>
      <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 14, color: "#6B6485", maxWidth: 320, marginBottom: 20 }}>
        {t("banned_text")}
      </p>
      <button onClick={onSignOut} style={{
        background: "transparent", border: "2px solid #F0EADB", borderRadius: 14,
        padding: "10px 20px", cursor: "pointer", fontFamily: "Nunito, sans-serif",
        fontWeight: 800, fontSize: 13, color: COLORS.coral,
      }}>
        {t("btn_sign_out")}
      </button>
    </div>
  );
}

// Espace mairie : uniquement la modération des signalements.
// (La validation des comptes a été supprimée : l'accès aux sorties Parent dépend
// désormais simplement du fait d'avoir déclaré un enfant de moins de 12 ans.)
function MairieDashboard({ reports, onResolveReport, commune }) {
  const reasonLabel = (r) => t(`report_reason_${r}`) !== `report_reason_${r}` ? t(`report_reason_${r}`) : r;
  const statusLabel = (s) => t(`mairie_report_status_${s}`);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink, margin: "4px 0 4px" }}>
        {t("mairie_title")}
      </h1>
      {commune && (
        <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.grass, margin: "0 0 16px" }}>
          {t("mairie_territory", { commune: villeName(commune) })}
        </p>
      )}

      <SectionLabel>{t("mairie_reports")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reports.length === 0 && (
          <EmptyBox text={t("mairie_no_pending")} />
        )}
        {reports.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "2px solid #F0EADB", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 10 }}>
              <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>{reasonLabel(r.reason)}</span>
              <span style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 999, flexShrink: 0,
                background: r.status === "pending" ? "#FFF4DD" : r.status === "reviewed" ? "#EAF8ED" : "#EDEAF4",
                color: r.status === "pending" ? COLORS.sun : r.status === "reviewed" ? COLORS.grass : "#9A93AF",
              }}>
                {statusLabel(r.status)}
              </span>
            </div>
            {r.details && (
              <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#5C5578", margin: "0 0 10px" }}>{r.details}</p>
            )}
            {r.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onResolveReport(r.id, "reviewed")} style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, background: COLORS.ink, color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer" }}>
                  {t("mairie_mark_reviewed")}
                </button>
                <button onClick={() => onResolveReport(r.id, "dismissed")} style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12, background: "transparent", color: "#9A93AF", border: "2px solid #F0EADB", borderRadius: 10, padding: "7px 12px", cursor: "pointer" }}>
                  {t("mairie_dismiss")}
                </button>
              </div>
            )}
          </div>
        ))}
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
  const [profile, setProfile] = useState({ displayName: "", parentValidated: false, role: "parent", associationValidated: false, genre: null, avatarUrl: null, isAdmin: false, banned: false, commune: null });
  const [rows, setRows] = useState([]);
  const [regByActivity, setRegByActivity] = useState({});
  const [kidsByActivity, setKidsByActivity] = useState({});
  const [myRegsKids, setMyRegsKids] = useState({});
  const [ageStats, setAgeStats] = useState({});
  const [realParticipants, setRealParticipants] = useState({});
  const [organiserProfiles, setOrganiserProfiles] = useState({});
  const [myRegs, setMyRegs] = useState(new Set());
  const [myFavs, setMyFavs] = useState(new Set());
  const [dataLoading, setDataLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [reportsDetailed, setReportsDetailed] = useState([]);
  const [photosAVerifier, setPhotosAVerifier] = useState([]);

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

  // Les activités sont publiques : on les charge que la personne soit connectée ou non
  // (Adultes/Aînés doivent être consultables sans compte, seule la création/inscription l'exige).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // On ne charge que les sorties encore pertinentes (pas terminées depuis plus de 5h),
      // les plus proches en premier, avec un plafond pour ne pas tout télécharger.
      const depuis = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .gte("starts_at", depuis)
        .order("starts_at", { ascending: true })
        .limit(500);
      if (cancelled) return;
      if (error) console.error("Erreur chargement activités :", error);

      // On complète avec les sorties passées auxquelles la personne a participé,
      // pour que "Mes sorties" garde son historique.
      let toutes = data || [];
      if (user) {
        const { data: mesRegs } = await supabase
          .from("registrations").select("activity_id").eq("user_id", user.id);
        const ids = (mesRegs || []).map((r) => r.activity_id);
        const dejaLa = new Set(toutes.map((a) => a.id));
        const manquants = ids.filter((id) => !dejaLa.has(id));
        if (manquants.length > 0) {
          const { data: anciennes } = await supabase
            .from("activities").select("*").in("id", manquants.slice(0, 200));
          if (cancelled) return;
          toutes = [...toutes, ...(anciennes || [])];
        }
      }
      setRows(toutes);
      const { data: regRows } = await supabase.from("registrations").select("activity_id, nb_enfants");
      if (cancelled) return;
      const counts = {};
      const kidCounts = {};
      (regRows || []).forEach((r) => {
        counts[r.activity_id] = (counts[r.activity_id] || 0) + 1;
        kidCounts[r.activity_id] = (kidCounts[r.activity_id] || 0) + (r.nb_enfants || 0);
      });
      setRegByActivity(counts);
      setKidsByActivity(kidCounts);

      // Âges (moyennes/arrondis uniquement — jamais de date de naissance individuelle transmise)
      const { data: ageRows } = await supabase.from("activity_age_stats").select("*");
      if (cancelled) return;
      const ages = {};
      (ageRows || []).forEach((a) => { ages[a.activity_id] = { organiserAge: a.organiser_age, participantsAvgAge: a.participants_avg_age }; });
      setAgeStats(ages);

      // Les vraies personnes inscrites (en plus des participants fictifs de démonstration)
      const { data: realRows } = await supabase.from("activity_participants_public").select("*");
      if (cancelled) return;
      const byActivity = {};
      (realRows || []).forEach((p) => {
        if (!byActivity[p.activity_id]) byActivity[p.activity_id] = [];
        byActivity[p.activity_id].push({
          name: p.display_name, genre: p.genre, userId: p.user_id, avatarUrl: p.avatar_url, age: p.age, isReal: true,
        });
      });
      setRealParticipants(byActivity);

      // Profils des organisateurs, lus en direct : le pseudo affiché sur une annonce suit
      // désormais toujours le profil actuel, même si le nom avait été figé à la création.
      const creatorIds = [...new Set((data || []).map((a) => a.created_by).filter(Boolean))];
      if (creatorIds.length > 0) {
        const { data: creatorRows } = await supabase
          .from("profiles").select("id, display_name, genre").in("id", creatorIds);
        if (cancelled) return;
        const byId = {};
        (creatorRows || []).forEach((p) => { byId[p.id] = { displayName: p.display_name, genre: p.genre }; });
        setOrganiserProfiles(byId);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setDataLoading(false); setMyRegs(new Set()); setMyFavs(new Set()); return; }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      const [profRes, myRegsRes, favRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("registrations").select("activity_id, nb_enfants").eq("user_id", user.id),
        supabase.from("favorites").select("activity_id").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      if (profRes.data) {
        setProfile({
          displayName: profRes.data.display_name,
          parentValidated: profRes.data.parent_validated,
          role: profRes.data.role || "parent",
          associationValidated: profRes.data.association_validated,
          genre: profRes.data.genre,
          avatarUrl: profRes.data.avatar_url,
          coverUrl: profRes.data.cover_url,
          nbEnfants: profRes.data.nb_enfants ?? 0,
          nbEnfantsMoins12: profRes.data.nb_enfants_moins_12 ?? 0,
          isAdmin: !!profRes.data.is_admin,
          bio: profRes.data.bio,
          situation: profRes.data.situation,
          profession: profRes.data.profession,
          interets: profRes.data.interets,
          animaux: profRes.data.animaux,
          coupDeCoeur: profRes.data.coup_de_coeur,
          birthdate: profRes.data.birthdate,
          commune: profRes.data.commune,
          communeNom: profRes.data.commune_nom,
          communeLat: profRes.data.commune_lat,
          communeLon: profRes.data.commune_lon,
          communeDept: profRes.data.commune_dept,
          banned: !!profRes.data.banned,
        });
      }
      setMyRegs(new Set((myRegsRes.data || []).map((r) => r.activity_id)));
      const mineKids = {};
      (myRegsRes.data || []).forEach((r) => { mineKids[r.activity_id] = r.nb_enfants || 0; });
      setMyRegsKids(mineKids);
      setMyFavs(new Set((favRes.data || []).map((r) => r.activity_id)));
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Données réservées à la mairie : profils en attente de validation + signalements
  useEffect(() => {
    if (user && profile.role === "mairie") {
      supabase.from("reports").select("*").order("created_at", { ascending: false })
        .then(({ data }) => setReports(data || []));
    }
    if (user && profile.isAdmin) {
      supabase.from("profiles").select("id, display_name, association_name, genre, role, banned, is_admin, created_at, commune, email, birthdate")
        .then(({ data }) => setAllProfiles(data || []));
      supabase.from("reports_detailed").select("*").order("created_at", { ascending: false })
        .then(({ data }) => setReportsDetailed(data || []));
      supabase.from("photo_reviews_detailed").select("*").eq("status", "pending").order("created_at", { ascending: false })
        .then(({ data }) => setPhotosAVerifier(data || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile.role, profile.isAdmin]);

  const mapRow = (row) => {
    const start = new Date(row.starts_at);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
    const offsetDays = Math.round((startDay - today) / 86400000);
    const time = `${String(start.getHours()).padStart(2, "0")}h${String(start.getMinutes()).padStart(2, "0")}`;
    const ages = ageStats[row.id] || {};
    const real = realParticipants[row.id] || [];
    // Si l'annonce a un vrai créateur, on affiche son pseudo actuel (et non celui figé à la création).
    const creator = row.created_by ? organiserProfiles[row.created_by] : null;
    return {
      id: row.id, title: row.title, category: row.category, ville: row.ville, lieu: row.lieu,
      offsetDays, time, age: row.age, info: row.info, places: row.places,
      inscrits: (row.demo_inscrits || 0) + (regByActivity[row.id] || 0),
      organisateur: creator?.displayName || row.organisateur,
      organisateurGenre: creator?.genre ?? row.organisateur_genre,
      desc: row.description,
      intergen: row.intergen, intergenNote: row.intergen_note,
      participants: [...real, ...(row.demo_participants || [])],
      createdBy: row.created_by, payant: row.payant, signeDistinctif: row.signe_distinctif,
      defi: row.defi, defiLe: row.defi_le,
      starts_at: row.starts_at,
      chatOpen: Date.now() < new Date(row.starts_at).getTime() + 5 * 60 * 60 * 1000,
      placesEnfants: row.places_enfants, inscritsEnfants: kidsByActivity[row.id] || 0,
      organiserAge: ages.organiserAge ?? null, participantsAvgAge: ages.participantsAvgAge ?? null,
    };
  };

  // Une sortie disparaît des listes 5h après son heure de début : elle reste visible
  // pendant qu'elle se déroule, puis s'efface une fois clairement terminée.
  const MASQUAGE_APRES_MS = 5 * 60 * 60 * 1000;
  const estEncoreVisible = (row) => {
    const debut = new Date(row.starts_at).getTime();
    if (Number.isNaN(debut)) return true;
    return Date.now() < debut + MASQUAGE_APRES_MS;
  };

  // Listes publiques (masquent les sorties terminées) et listes complètes (pour "Mes sorties",
  // qui conserve l'historique en grisé).
  const bySpace = (space) => rows.filter((r) => r.space === space && estEncoreVisible(r)).map(mapRow);
  const bySpaceAll = (space) => rows.filter((r) => r.space === space).map(mapRow);
  const activities = useMemo(() => bySpace("kids"), [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles]);
  const teenItems = useMemo(() => bySpace("teen"), [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles]);
  const adultItems = useMemo(() => bySpace("adult"), [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles]);
  const seniorItems = useMemo(() => bySpace("senior"), [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles]);
  const assoItems = useMemo(() => bySpace("asso"), [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles]);

  const deps = [rows, regByActivity, kidsByActivity, ageStats, realParticipants, organiserProfiles];
  const allActivities = useMemo(() => bySpaceAll("kids"), deps);
  const allTeenItems = useMemo(() => bySpaceAll("teen"), deps);
  const allAdultItems = useMemo(() => bySpaceAll("adult"), deps);
  const allSeniorItems = useMemo(() => bySpaceAll("senior"), deps);

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

  const joinGeneric = async (id, nbEnfants = 0) => {
    if (!user || myRegs.has(id)) return;
    const n = Math.max(0, Math.min(profile.nbEnfants || 0, Number(nbEnfants) || 0));
    setMyRegs((s) => new Set(s).add(id));
    setRegByActivity((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setKidsByActivity((c) => ({ ...c, [id]: (c[id] || 0) + n }));
    setMyRegsKids((m) => ({ ...m, [id]: n }));
    const { error } = await supabase.from("registrations").insert({ user_id: user.id, activity_id: id, nb_enfants: n });
    if (error) console.error("Erreur inscription :", error);
  };

  const leaveGeneric = async (id) => {
    if (!user || !myRegs.has(id)) return;
    const mine = myRegsKids[id] || 0;
    setMyRegs((s) => { const n = new Set(s); n.delete(id); return n; });
    setRegByActivity((c) => ({ ...c, [id]: Math.max(0, (c[id] || 1) - 1) }));
    setKidsByActivity((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - mine) }));
    const { error } = await supabase.from("registrations").delete().eq("user_id", user.id).eq("activity_id", id);
    if (error) console.error("Erreur désinscription :", error);
  };

  const insertActivity = async (space, form) => {
    if (!user) return null;
    const starts_at = `${form.dateStr}T${form.timeStr}:00`;
    const newRow = {
      id: Date.now(), space, title: form.title, category: form.category, ville: profile.commune || null, lieu: form.lieu,
      starts_at, age: form.age || null, info: form.info || null, places: form.places, places_enfants: form.placesEnfants ?? null,
      demo_inscrits: 0, organisateur: profile.displayName || t("you_organizer"), organisateur_genre: profile.genre || null,
      description: form.desc || "", intergen: false, intergen_note: null,
      demo_participants: [], created_by: user.id, payant: !!form.payant, signe_distinctif: form.signeDistinctif || null,
    };
    const { data, error } = await supabase.from("activities").insert(newRow).select().single();
    if (error) { console.error("Erreur création :", error); return null; }
    // On force notre propre identifiant (celui qu'on a généré et qu'on maîtrise) plutôt que
    // celui renvoyé par Supabase : les grands nombres (bigint) peuvent subir un léger arrondi
    // lors de l'aller-retour, ce qui cassait silencieusement le lien avec l'inscription créée juste après.
    const savedRow = { ...data, id: newRow.id };
    setRows((r) => [savedRow, ...r]);
    await joinGeneric(newRow.id);
    return newRow.id;
  };

  // Modifier une sortie retire toutes les personnes déjà inscrites (le changement peut être
  // suffisamment important — lieu, horaire — pour que l'accord initial des participants ne tienne plus).
  // L'organisateur, lui, reste automatiquement inscrit à sa propre sortie modifiée.
  const updateActivity = async (id, space, form) => {
    if (!user) return false;
    const starts_at = `${form.dateStr}T${form.timeStr}:00`;
    const patch = {
      title: form.title, category: form.category, lieu: form.lieu, starts_at,
      places: form.places, places_enfants: form.placesEnfants ?? null, description: form.desc || "", payant: !!form.payant,
      signe_distinctif: form.signeDistinctif || null,
      ...(space === "kids" ? { age: form.age || null } : { info: form.info || null }),
    };
    const { data, error } = await supabase.from("activities").update(patch).eq("id", id).eq("created_by", user.id).select().single();
    if (error) { console.error("Erreur modification :", error); return false; }
    setRows((rs) => rs.map((r) => (r.id === id ? data : r)));

    await supabase.from("registrations").delete().eq("activity_id", id);
    await supabase.from("registrations").insert({ user_id: user.id, activity_id: id });

    const { data: regRows } = await supabase.from("registrations").select("activity_id");
    const counts = {};
    (regRows || []).forEach((r) => { counts[r.activity_id] = (counts[r.activity_id] || 0) + 1; });
    setRegByActivity(counts);
    setMyRegs((s) => new Set(s).add(id));
    return true;
  };

  // Fixe le défi d'une sortie : partagé par tout le groupe, et définitif une fois tiré.
  const setActivityDefi = async (id, defi) => {
    if (!user) return false;
    const { data, error } = await supabase.from("activities")
      .update({ defi, defi_par: user.id, defi_le: new Date().toISOString() })
      .eq("id", id).is("defi", null).select().single();
    if (error || !data) { console.error("Erreur défi :", error); return false; }
    setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
    return true;
  };

  const deleteActivity = async (id) => {
    if (!user) return false;
    const { error } = await supabase.from("activities").delete().eq("id", id).eq("created_by", user.id);
    if (error) { console.error("Erreur suppression :", error); return false; }
    setRows((rs) => rs.filter((r) => r.id !== id));
    return true;
  };

  const updateBirthdate = async (birthdate) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ birthdate: birthdate || null }).eq("id", user.id);
    if (error) { console.error("Erreur date de naissance :", error); return; }
    setProfile((p) => ({ ...p, birthdate: birthdate || null }));
  };

  const updateBio = async (bio) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ bio: bio || null }).eq("id", user.id);
    if (error) { console.error("Erreur bio :", error); return; }
    setProfile((p) => ({ ...p, bio: bio || null }));
  };

  // Le pseudo est le nom public : on met à jour les deux colonnes pour rester cohérent partout.
  // Vérifie qu'un pseudo n'est pas déjà pris (insensible à la casse)
  const pseudoDisponible = async (p) => {
    if (!p || !p.trim()) return false;
    const { data, error } = await supabase.rpc("pseudo_disponible", { p: p.trim() });
    if (error) { console.error("Erreur vérification pseudo :", error); return true; }
    return !!data;
  };

  // Recherche de membres par pseudo (aucune donnée privée transmise)
  const rechercherMembres = async (q) => {
    if (!q || q.trim().length < 2) return [];
    const { data, error } = await supabase.rpc("search_users", { q: q.trim(), lim: 10 });
    if (error) { console.error("Erreur recherche membres :", error); return []; }
    return data || [];
  };

  const updatePseudo = async (pseudo) => {
    if (!user || !pseudo.trim()) return { error: null };
    const clean = pseudo.trim();
    const libre = await pseudoDisponible(clean);
    if (!libre) return { error: t("pseudo_pris") };
    const { error } = await supabase.from("profiles").update({ pseudo: clean, display_name: clean }).eq("id", user.id);
    if (error) {
      console.error("Erreur pseudo :", error);
      return { error: error.code === "23505" ? t("pseudo_pris") : t("auth_error_generic") };
    }
    setProfile((p) => ({ ...p, displayName: clean }));
    // Répercute aussitôt sur toutes les annonces affichées, sans attendre un rechargement
    setOrganiserProfiles((m) => ({ ...m, [user.id]: { ...(m[user.id] || {}), displayName: clean } }));
    return { error: null };
  };

  const updateGenre = async (genre) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ genre }).eq("id", user.id);
    if (error) { console.error("Erreur genre :", error); return; }
    setProfile((p) => ({ ...p, genre }));
    setOrganiserProfiles((m) => ({ ...m, [user.id]: { ...(m[user.id] || {}), genre } }));
  };

  const updateSituation = async (situation) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ situation: situation || null }).eq("id", user.id);
    if (error) { console.error("Erreur situation :", error); return; }
    setProfile((p) => ({ ...p, situation: situation || null }));
  };

  // Accepte n'importe quelle commune française : on garde son nom et ses coordonnées,
  // ce qui permet de centrer le filtre de lieu même hors de la liste pré-enregistrée.
  const updateCommune = async (c) => {
    if (!user) return;
    const patch = c
      ? { commune_nom: c.nom, commune_lat: c.lat, commune_lon: c.lon, commune_dept: c.dept || null }
      : { commune_nom: null, commune_lat: null, commune_lon: null, commune_dept: null };
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) { console.error("Erreur commune :", error); return; }
    setProfile((p) => ({
      ...p,
      communeNom: patch.commune_nom, communeLat: patch.commune_lat,
      communeLon: patch.commune_lon, communeDept: patch.commune_dept,
    }));
  };

  const updateNbEnfantsMoins12 = async (nb) => {
    if (!user) return;
    const n = Math.max(0, Math.min(profile.nbEnfants || 0, Number(nb) || 0));
    const { error } = await supabase.from("profiles").update({ nb_enfants_moins_12: n }).eq("id", user.id);
    if (error) { console.error("Erreur enfants -12 ans :", error); return; }
    setProfile((p) => ({ ...p, nbEnfantsMoins12: n }));
  };

  const updateNbEnfants = async (nb) => {
    if (!user) return;
    const n = Math.max(0, Math.min(12, Number(nb) || 0));
    // Le nombre d'enfants de moins de 12 ans ne peut pas dépasser le total
    const moins12 = Math.min(profile.nbEnfantsMoins12 || 0, n);
    const { error } = await supabase.from("profiles")
      .update({ nb_enfants: n, nb_enfants_moins_12: moins12 }).eq("id", user.id);
    if (error) { console.error("Erreur nombre d'enfants :", error); return; }
    setProfile((p) => ({ ...p, nbEnfants: n, nbEnfantsMoins12: moins12 }));
  };

  // Champs texte libres du profil (profession, centres d'intérêt, animaux, coup de cœur).
  // Une seule fonction générique plutôt qu'une par champ.
  const PROFILE_TEXT_FIELDS = {
    profession: "profession",
    interets: "interets",
    animaux: "animaux",
    coupDeCoeur: "coup_de_coeur",
  };
  const updateProfileField = async (field, value) => {
    if (!user) return;
    const column = PROFILE_TEXT_FIELDS[field];
    if (!column) return;
    const clean = (value || "").trim() || null;
    const { error } = await supabase.from("profiles").update({ [column]: clean }).eq("id", user.id);
    if (error) { console.error(`Erreur ${field} :`, error); return; }
    setProfile((p) => ({ ...p, [field]: clean }));
  };

  // Vérifie qu'une photo ne contient pas de contenu inapproprié.
  // L'analyse tourne côté serveur (fonction Supabase), jamais dans le navigateur.
  const verifierPhoto = async (imageUrl, type) => {
    try {
      const { data, error } = await supabase.functions.invoke("moderer-image", {
        body: { imageUrl },
      });
      if (error) { console.error("Vérification photo indisponible :", error); return { autorise: true }; }

      // Cas limite : la photo passe, mais on la signale pour un contrôle humain
      if (data?.aVerifier && user) {
        await supabase.from("photo_reviews").insert({
          user_id: user.id, image_url: imageUrl, type,
          score_sexual: data?.scores?.sexual ?? null,
        });
      }
      return data || { autorise: true };
    } catch (e) {
      console.error("Erreur vérification photo :", e);
      return { autorise: true };   // on ne bloque pas en cas de panne technique
    }
  };

  const uploadAvatar = async (file) => {
    if (!user) return { error: t("auth_error_generic") };
    try {
      const blob = await compressImage(file, 1024 * 1024, 800);
      const path = `${user.id}.jpg`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, blob, {
        contentType: "image/jpeg", upsert: true,
      });
      if (uploadErr) throw uploadErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      // on ajoute un paramètre unique pour forcer le rechargement de l'image (le nom de fichier ne change pas)
      const avatarUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const verif = await verifierPhoto(avatarUrl, "avatar");
      if (!verif.autorise) {
        await supabase.storage.from("avatars").remove([path]);
        return { error: t("photo_refusee") };
      }

      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
      setProfile((p) => ({ ...p, avatarUrl }));
      return { error: null };
    } catch (e) {
      console.error("Erreur envoi photo :", e);
      return { error: e?.message || t("auth_error_generic") };
    }
  };

  // La couverture est plus large mais fortement compressée (300 Ko max) : elle ne s'affiche
  // que sur la page profil, jamais dans les listes, pour limiter la bande passante.
  const uploadCover = async (file) => {
    if (!user) return { error: t("auth_error_generic") };
    try {
      const blob = await compressImage(file, 300 * 1024, 1200);
      const path = `${user.id}.jpg`;
      const { error: uploadErr } = await supabase.storage.from("covers").upload(path, blob, {
        contentType: "image/jpeg", upsert: true,
      });
      if (uploadErr) throw uploadErr;
      const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
      const coverUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const verif = await verifierPhoto(coverUrl, "cover");
      if (!verif.autorise) {
        await supabase.storage.from("covers").remove([path]);
        return { error: t("photo_refusee") };
      }

      await supabase.from("profiles").update({ cover_url: coverUrl }).eq("id", user.id);
      setProfile((p) => ({ ...p, coverUrl }));
      return { error: null };
    } catch (e) {
      console.error("Erreur envoi couverture :", e);
      return { error: e?.message || t("auth_error_generic") };
    }
  };

  const removeCover = async () => {
    if (!user) return;
    await supabase.storage.from("covers").remove([`${user.id}.jpg`]);
    await supabase.from("profiles").update({ cover_url: null }).eq("id", user.id);
    setProfile((p) => ({ ...p, coverUrl: null }));
  };

  const submitReport = async ({ activityId, reportedUserId, reason, details }) => {
    if (!user) return false;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id, activity_id: activityId || null, reported_user_id: reportedUserId || null,
      reason, details: details || null,
    });
    if (error) { console.error("Erreur signalement :", error); return false; }
    return true;
  };

  // ---------- Actions réservées à la mairie ----------
  // Traitement d'une photo signalée automatiquement : on valide ou on supprime
  const traiterPhoto = async (reviewId, action, userId, type) => {
    if (!user) return;
    if (action === "removed") {
      const bucket = type === "cover" ? "covers" : "avatars";
      await supabase.storage.from(bucket).remove([`${userId}.jpg`]);
      const colonne = type === "cover" ? { cover_url: null } : { avatar_url: null };
      await supabase.from("profiles").update(colonne).eq("id", userId);
    }
    await supabase.from("photo_reviews").update({ status: action }).eq("id", reviewId);
    setPhotosAVerifier((l) => l.filter((p) => p.id !== reviewId));
  };

  // Traitement d'un signalement par l'administrateur : changement de statut + note interne
  const handleReport = async (reportId, status, note) => {
    if (!user) return false;
    const patch = { status, handled_at: new Date().toISOString(), handled_by: user.id };
    if (note !== undefined) patch.admin_note = note || null;
    const { error } = await supabase.from("reports").update(patch).eq("id", reportId);
    if (error) { console.error("Erreur traitement signalement :", error); return false; }
    setReportsDetailed((list) => list.map((r) => r.id === reportId
      ? { ...r, status, admin_note: note !== undefined ? note : r.admin_note, handled_at: patch.handled_at }
      : r));
    return true;
  };

  const resolveReport = async (reportId, status) => {
    await supabase.from("reports").update({ status }).eq("id", reportId);
    setReports((list) => list.map((r) => r.id === reportId ? { ...r, status } : r));
  };

  // ---------- Modération : bloquer / supprimer un utilisateur (réservé à l'admin) ----------
  const toggleBanUser = async (userId, nextBanned) => {
    const { error } = await supabase.from("profiles").update({ banned: nextBanned }).eq("id", userId);
    if (error) { console.error("Erreur blocage :", error); return; }
    setAllProfiles((list) => list.map((p) => p.id === userId ? { ...p, banned: nextBanned } : p));
  };

  const setUserCommune = async (userId, communeId) => {
    const { error } = await supabase.from("profiles").update({ commune: communeId || null }).eq("id", userId);
    if (error) { console.error("Erreur assignation commune :", error); return; }
    setAllProfiles((list) => list.map((p) => p.id === userId ? { ...p, commune: communeId || null } : p));
  };

  // Efface les données de l'utilisateur (sorties créées, enfants) et bloque le compte.
  // La ligne de connexion elle-même reste dans Supabase Auth (suppression réelle possible
  // manuellement depuis le tableau de bord Supabase si nécessaire).
  const deleteUserData = async (userId) => {
    await supabase.from("activities").delete().eq("created_by", userId);
    const { error } = await supabase.from("profiles").update({
      banned: true, display_name: t("deleted_account_name"), association_name: null, avatar_url: null,
    }).eq("id", userId);
    if (error) { console.error("Erreur suppression :", error); return; }
    setAllProfiles((list) => list.map((p) => p.id === userId ? { ...p, banned: true, display_name: t("deleted_account_name") } : p));
    setRows((list) => list.filter((r) => r.created_by !== userId));
  };

  return {
    user, authLoading, dataLoading,
    displayName: profile.displayName, email: user?.email || "", parentValidated: (profile.nbEnfantsMoins12 || 0) > 0,
    role: profile.role, associationValidated: profile.associationValidated, avatarUrl: profile.avatarUrl, coverUrl: profile.coverUrl, nbEnfants: profile.nbEnfants, nbEnfantsMoins12: profile.nbEnfantsMoins12,
    isAdmin: profile.isAdmin, banned: profile.banned, commune: profile.commune, communeNom: profile.communeNom, communeLat: profile.communeLat, communeLon: profile.communeLon, communeDept: profile.communeDept, birthdate: profile.birthdate, bio: profile.bio, genre: profile.genre, situation: profile.situation, profession: profile.profession, interets: profile.interets, animaux: profile.animaux, coupDeCoeur: profile.coupDeCoeur,
    activities, teenItems, adultItems, seniorItems, assoItems,
    allActivities, allTeenItems, allAdultItems, allSeniorItems,
    favorites, favTeen, favAdult, favSenior, favAsso,
    joined, joinedTeen, joinedAdult, joinedSenior, joinedAsso,
    toggleFav: toggleFavGeneric,
    join: (id, nb) => joinGeneric(id, nb),
    leave: leaveGeneric,
    toggleFavCommunity: (_kind, id) => toggleFavGeneric(id),
    joinCommunity: (_kind, id, nb) => joinGeneric(id, nb),
    leaveCommunity: (_kind, id) => leaveGeneric(id),
    createActivity: (form) => insertActivity("kids", form),
    createAdultMeetup: (form) => insertActivity("adult", form),
    createAssoEvent: (form) => insertActivity("asso", form),
    createTeenMeetup: (form) => insertActivity("teen", form),
    createSeniorMeetup: (form) => insertActivity("senior", form),
    updateActivity, deleteActivity, setActivityDefi,
    updateBirthdate,
    updateGenre,
    updateBio,
    updatePseudo, pseudoDisponible, rechercherMembres,
    updateSituation,
    updateNbEnfants,
    updateNbEnfantsMoins12,
    updateCommune,
    myRegsKids,
    updateProfileField,
    uploadAvatar,
    uploadCover, removeCover,
    submitReport,
    reports, reportsDetailed, photosAVerifier, traiterPhoto, allProfiles, allActivitiesRaw: rows,
    toggleBanUser, deleteUserData, setUserCommune,
    resolveReport, handleReport,
    signOut: () => supabase.auth.signOut(),
  };
}

// ---------- Root ----------
export default function RecreApp() {
  const pika = usePikapikaData();
  const [tab, setTab] = useState(pika.user ? "profil" : "adultes");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null); // { id, kind: "adult" | "teen" | "senior" | "asso" }
  const [location, setLocation] = useState(null);
  // Au premier chargement, on centre le filtre sur la commune renseignée dans le profil
  const locationPrefilled = useRef(false);
  useEffect(() => {
    if (locationPrefilled.current || location) return;
    // Commune libre enregistrée sur le profil (n'importe quelle commune française)
    if (pika.communeNom && pika.communeLat && pika.communeLon) {
      locationPrefilled.current = true;
      setLocation({
        type: "commune", nom: pika.communeNom, lat: pika.communeLat,
        lon: pika.communeLon, dept: pika.communeDept, radius: 0,
      });
      return;
    }
    // Repli sur l'ancienne commune pré-listée, pour les comptes créés avant
    const meta = pika.commune ? CITY_META[pika.commune] : null;
    if (meta) {
      locationPrefilled.current = true;
      setLocation({ type: "commune", nom: meta.label, lat: meta.lat, lon: meta.lon, dept: meta.dept, radius: 0 });
    }
  }, [pika.commune, pika.communeNom, pika.communeLat, pika.communeLon, pika.communeDept, location]);
  const [authPrompt, setAuthPrompt] = useState(false);

  const {
    activities, teenItems, adultItems, seniorItems, assoItems,
    favorites, favTeen, favAdult, favSenior, favAsso,
    joined, joinedTeen, joinedAdult, joinedSenior, joinedAsso,
    parentValidated, kids, displayName, email,
  } = pika;

  // Ferme automatiquement la fenêtre de connexion dès qu'une session existe
  useEffect(() => {
    if (pika.user) setAuthPrompt(false);
  }, [pika.user]);

  // Action qui nécessite un compte : ouvre la fenêtre de connexion si besoin, sinon exécute directement
  const requireAuth = (action) => (...args) => {
    if (!pika.user) { setAuthPrompt(true); return; }
    action(...args);
  };

  const toggleFav = requireAuth(pika.toggleFav);

  // Rejoindre une sortie enfant met aussi à jour l'aperçu ouvert (fiche détaillée), le temps
  // que le nombre d'inscrits recalculé depuis Supabase redescende dans le tableau `activities`.
  const join = requireAuth((id, nb) => pika.join(id, nb));

  const leave = requireAuth((id) => pika.leave(id));

  const createActivity = pika.createActivity;

  const toggleFavCommunity = requireAuth((kind, id) => pika.toggleFavCommunity(kind, id));

  const joinCommunity = requireAuth((kind, id) => pika.joinCommunity(kind, id));

  const leaveCommunity = requireAuth((kind, id) => pika.leaveCommunity(kind, id));

  const createAdultMeetup = pika.createAdultMeetup;

  const [reportTarget, setReportTarget] = useState(null); // { id, createdBy }
  const openReport = requireAuth((item) => setReportTarget({ id: item.id, createdBy: item.createdBy }));

  const [viewingUserId, setViewingUserId] = useState(null);
  const openUserProfile = requireAuth((userId) => setViewingUserId(userId));

  const [shareTarget, setShareTarget] = useState(null);
  const [legalDoc, setLegalDoc] = useState(null);
  const [defiOpen, setDefiOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [orgaOpen, setOrgaOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Compteurs toutes catégories confondues, pour la fiche profil
  const allMine = [
    ...activities.filter((it) => joined.includes(it.id)),
    ...teenItems.filter((it) => joinedTeen.includes(it.id)),
    ...adultItems.filter((it) => joinedAdult.includes(it.id)),
    ...seniorItems.filter((it) => joinedSenior.includes(it.id)),
  ];
  const allCreatedCount = allMine.filter((it) => it.createdBy && it.createdBy === pika.user?.id).length;
  const allJoinedCount = allMine.length - allCreatedCount;

  const [editTarget, setEditTarget] = useState(null); // { activity, space, categories }
  const openEditKid = (item) => setEditTarget({ activity: item, space: "kids", categories: CATEGORIES });
  const openEditAdult = (item) => setEditTarget({ activity: item, space: "adult", categories: ADULT_CATEGORIES });
  const openEditCommunity = (kind, item) => {
    const catMap = { adult: ADULT_CATEGORIES, teen: TEEN_CATEGORIES, senior: SENIOR_CATEGORIES, asso: ASSO_CATEGORIES };
    const spaceMap = { adult: "adult", teen: "teen", senior: "senior", asso: "asso" };
    setEditTarget({ activity: item, space: spaceMap[kind], categories: catMap[kind] });
  };
  const saveEdit = async (form) => {
    if (!editTarget) return false;
    const ok = await pika.updateActivity(editTarget.activity.id, editTarget.space, form);
    if (ok) {
      const id = editTarget.activity.id;
      setSelectedId((s) => (s === id ? null : s));
      setSelectedCommunity((s) => (s && s.id === id ? null : s));
    }
    return ok;
  };
  const cancelOuting = async (id) => {
    await pika.deleteActivity(id);
    setSelectedId((s) => (s === id ? null : s));
    setSelectedCommunity((s) => (s && s.id === id ? null : s));
  };

  // Ouvre automatiquement une annonce si on arrive via un lien partagé (?activity=ID)
  const deepLinkDone = useRef(false);
  useEffect(() => {
    if (deepLinkDone.current) return;
    const idParam = new URLSearchParams(window.location.search).get("activity");
    if (!idParam) { deepLinkDone.current = true; return; }
    const id = Number(idParam);
    const spaces = [
      { items: activities, tabId: "explorer", kind: null },
      { items: teenItems, tabId: "ados", kind: "teen" },
      { items: adultItems, tabId: "adultes", kind: "adult" },
      { items: seniorItems, tabId: "aine", kind: "senior" },
      { items: assoItems, tabId: "asso", kind: "asso" },
    ];
    for (const s of spaces) {
      const found = s.items.find((it) => it.id === id);
      if (found) {
        setTab(s.tabId);
        if (s.kind) setSelectedCommunity({ id: found.id, kind: s.kind });
        else setSelectedId(found.id);
        deepLinkDone.current = true;
        break;
      }
    }
  }, [activities, teenItems, adultItems, seniorItems, assoItems]);

  const TABS_ALL = [
    { id: "ados", label: t("tab_ados"), icon: Gamepad2, kidsOnly: true, authRequired: true },
    { id: "adultes", label: t("tab_adultes"), icon: Coffee },
    { id: "explorer", label: t("tab_enfants"), icon: Baby, kidsOnly: true, authRequired: true },
    { id: "aine", label: t("tab_aine"), icon: Flower2 },
    { id: "asso", label: t("tab_associations"), icon: Landmark, authRequired: true },
    { id: "mairie", label: t("tab_mairie"), icon: ShieldCheck, mairieOnly: true },
  ];
  const TABS = TABS_ALL.filter((tb) => {
    if (tb.mairieOnly) return pika.role === "mairie";
    if (tb.authRequired && !pika.user) return false;
    if (tb.kidsOnly && !parentValidated) return false;
    return true;
  });
  // Ces trois-là ne sont plus dans la barre du bas : ils vivent en icônes dans l'en-tête,
  // pour laisser la barre du bas uniquement aux catégories d'âge (plus lisible sur petit écran).
  const HEADER_ACTIONS = pika.user ? [
    { id: "creer", label: t("tab_creer"), icon: PlusCircle },
    { id: "mes-sorties", label: t("tab_mes_sorties"), icon: BookMarked },
    ...(pika.isAdmin ? [{ id: "stats", label: t("mairie_sub_stats"), icon: BarChart3 }] : []),
    { id: "profil", label: t("tab_profil"), icon: UserCircle2 },
  ] : [];

  // Si le parent n'est plus validé (démo), ou si la session change, on repositionne si besoin
  useEffect(() => {
    const stillVisible = TABS.some((tb) => tb.id === tab) || HEADER_ACTIONS.some((a) => a.id === tab);
    if (!stillVisible) setTab(pika.user ? "profil" : "adultes");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentValidated, pika.user, pika.role]);

  if (pika.authLoading) {
    return (
      <div style={{ background: COLORS.cloud, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OreeMascot size={48} />
      </div>
    );
  }

  if (pika.user && pika.dataLoading) {
    return (
      <div style={{ background: COLORS.cloud, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <OreeMascot size={48} />
        <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "#6B6485" }}>{t("auth_loading")}</span>
      </div>
    );
  }

  if (pika.user && pika.banned) {
    return <BannedScreen onSignOut={pika.signOut} />;
  }

  return (
    <div style={{ background: COLORS.cloud, minHeight: "100dvh", fontFamily: "Nunito, sans-serif" }}>
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

      {/* Top bar (desktop) / logo (mobile) — reste visible pendant le défilement,
          pour pouvoir changer de lieu à tout moment. */}
      <div className="pika-header-sticky" style={{
        position: "sticky", top: 0, zIndex: 500,
        background: COLORS.cloud, borderBottom: "2px solid #F0EADB",
      }}>
      <div className="pika-header-row" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", maxWidth: 960, margin: "0 auto", flexWrap: "wrap", gap: 10,
      }}>
        <button
          onClick={() => {
            setTab(pika.user && parentValidated ? "explorer" : "adultes");
            setSelectedId(null);
            setSelectedCommunity(null);
            setEditingProfile(false);
          }}
          aria-label={t("back_home")}
          title={t("back_home")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", padding: 0, cursor: "pointer",
          }}
        >
          <OreeMascot size={32} />
          <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>
            Orée
          </span>
        </button>

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

          <LocationFilter location={location} onChange={setLocation} />

          {pika.user && (
            <button
              onClick={() => setTab("mes-sorties")}
              aria-label={t("tab_mes_sorties")}
              title={t("tab_mes_sorties")}
              className="pika-header-action"
              style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                borderRadius: 999, border: "none", padding: "7px 12px", flexShrink: 0,
                background: tab === "mes-sorties" ? COLORS.ink : "#fff",
                boxShadow: tab === "mes-sorties" ? "none" : "0 0 0 2px #F0EADB inset",
              }}
            >
              <BookMarked size={16} className="pika-header-action-icon" color={tab === "mes-sorties" ? "#fff" : COLORS.ink} />
              <span className="pika-header-action-label" style={{
                fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12.5,
                color: tab === "mes-sorties" ? "#fff" : COLORS.ink, whiteSpace: "nowrap",
              }}>
                {t("tab_mes_sorties")}
              </span>
            </button>
          )}

          {/* Compte, toujours tout à droite : la photo de profil le rend immédiatement reconnaissable */}
          {pika.user ? (
            <button
              onClick={() => setTab("profil")}
              aria-label={t("tab_profil")}
              title={t("tab_profil")}
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0, padding: 0, overflow: "hidden",
                border: `3px solid ${tab === "profil" ? COLORS.ink : "#F0EADB"}`,
                background: pika.genre ? genreColor(pika.genre) : COLORS.sky,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 18,
              }}
            >
              {pika.avatarUrl
                ? <img src={pika.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (displayName || "?").charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => setAuthPrompt(true)}
              style={{
                background: COLORS.ink, color: "#fff", border: "none", borderRadius: 999,
                padding: "9px 16px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {t("auth_login_btn")}
            </button>
          )}
        </div>
      </div>
      </div>

      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "18px 20px 110px",
      }}>
        {tab === "explorer" && parentValidated && (
          <CommunityExplorer
            title={t("community_kids_title")}
            subtitle={t("community_kids_subtitle")}
            categories={CATEGORIES}
            items={activities}
            favorites={favorites}
            onToggleFav={toggleFav}
            onOpen={(item) => setSelectedId(item.id)}
            emptyText={t("empty_kids")}
            location={location}
            layout="days"
            genderMode
          onViewProfile={openUserProfile}
          />
        )}
        {tab === "creer" && (
          <CreatePage
            parentValidated={parentValidated}
            onCreateKid={async (f) => { await createActivity(f); setTab("explorer"); }}
            onCreateTeen={async (f) => { await pika.createTeenMeetup(f); setTab("ados"); }}
            onCreateAdult={async (f) => { await createAdultMeetup(f); setTab("adultes"); }}
            onCreateSenior={async (f) => { await pika.createSeniorMeetup(f); setTab("aine"); }}
            onCreateAsso={async (f) => { await pika.createAssoEvent(f); setTab("asso"); }}
            role={pika.role}
          />
        )}
        {tab === "mes-sorties" && (
          <MesSortiesPage
            parentValidated={parentValidated}
            currentUserId={pika.user?.id}
            onViewProfile={openUserProfile}
            joined={joined}
            activities={pika.allActivities}
            onOpenKid={(item) => setSelectedId(item.id)}
            favorites={favorites}
            onToggleFavKid={toggleFav}
            teenItems={pika.allTeenItems}
            joinedTeen={joinedTeen}
            onOpenTeen={(item) => setSelectedCommunity({ id: item.id, kind: "teen" })}
            favTeen={favTeen}
            onToggleFavTeen={(id) => toggleFavCommunity("teen", id)}
            adultItems={pika.allAdultItems}
            joinedAdult={joinedAdult}
            onOpenAdult={(item) => setSelectedCommunity({ id: item.id, kind: "adult" })}
            favAdult={favAdult}
            onToggleFavAdult={(id) => toggleFavCommunity("adult", id)}
            seniorItems={pika.allSeniorItems}
            joinedSenior={joinedSenior}
            onOpenSenior={(item) => setSelectedCommunity({ id: item.id, kind: "senior" })}
            favSenior={favSenior}
            onToggleFavSenior={(id) => toggleFavCommunity("senior", id)}
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
            onOpen={(item) => setSelectedCommunity({ id: item.id, kind: "adult" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
            genderMode
          onViewProfile={openUserProfile}
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
            onOpen={(item) => setSelectedCommunity({ id: item.id, kind: "senior" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
            genderMode
          onViewProfile={openUserProfile}
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
            onOpen={(item) => setSelectedCommunity({ id: item.id, kind: "asso" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
            genderMode
          onViewProfile={openUserProfile}
          />
        )}
        {tab === "mairie" && pika.role === "mairie" && (
          <MairieDashboard
            reports={pika.reports}
            onResolveReport={pika.resolveReport}
            commune={pika.commune}
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
            onOpen={(item) => setSelectedCommunity({ id: item.id, kind: "teen" })}
            emptyText={t("community_empty")}
            location={location}
            layout="days"
            genderMode
          onViewProfile={openUserProfile}
          />
        )}
        {tab === "stats" && pika.isAdmin && (
          <AdminArea
            allProfiles={pika.allProfiles}
            allActivitiesRaw={pika.allActivitiesRaw}
            currentUserId={pika.user?.id}
            onToggleBan={pika.toggleBanUser}
            onDelete={pika.deleteUserData}
            onSetCommune={pika.setUserCommune}
            reportsDetailed={pika.reportsDetailed}
            onHandleReport={pika.handleReport}
            onViewProfile={openUserProfile}
            photos={pika.photosAVerifier}
            onTraiterPhoto={pika.traiterPhoto}
          />
        )}
        {tab === "profil" && (
          editingProfile ? (
            <ProfileEdit
              onBack={() => setEditingProfile(false)}
              joinedCount={joined.length}
              validated={parentValidated}
              displayName={displayName}
              email={email}
              nbEnfants={pika.nbEnfants}
              onUpdateNbEnfants={pika.updateNbEnfants}
              nbEnfantsMoins12={pika.nbEnfantsMoins12}
              onUpdateNbEnfantsMoins12={pika.updateNbEnfantsMoins12}
              onSignOut={pika.signOut}
              avatarUrl={pika.avatarUrl}
              onUploadAvatar={pika.uploadAvatar}
              birthdate={pika.birthdate}
              onUpdateBirthdate={pika.updateBirthdate}
              onOpenLegal={setLegalDoc}
              bio={pika.bio}
              onUpdateBio={pika.updateBio}
              genre={pika.genre}
              onUpdateGenre={pika.updateGenre}
              onUpdatePseudo={pika.updatePseudo}
              situation={pika.situation}
              onUpdateSituation={pika.updateSituation}
              profession={pika.profession}
              interets={pika.interets}
              animaux={pika.animaux}
              coupDeCoeur={pika.coupDeCoeur}
              onUpdateField={pika.updateProfileField}
              coverUrl={pika.coverUrl}
              onUploadCover={pika.uploadCover}
              onRemoveCover={pika.removeCover}
              communeNom={pika.communeNom}
              onUpdateCommune={pika.updateCommune}
            />
          ) : (
            <ProfileView
              displayName={displayName}
              email={email}
              avatarUrl={pika.avatarUrl}
              coverUrl={pika.coverUrl}
              genre={pika.genre}
              birthdate={pika.birthdate}
              bio={pika.bio}
              nbEnfants={pika.nbEnfants}
              joinedCount={allJoinedCount}
              createdCount={allCreatedCount}
              validated={parentValidated}
              commune={pika.commune}
              communeNom={pika.communeNom}
              role={pika.role}
              situation={pika.situation}
              profession={pika.profession}
              interets={pika.interets}
              animaux={pika.animaux}
              coupDeCoeur={pika.coupDeCoeur}
              onEdit={() => setEditingProfile(true)}
              onSignOut={pika.signOut}
              onOpenLegal={setLegalDoc}
            />
          )
        )}
      </div>

      {/* Bouton flottant "Créer" : l'action principale de l'appli, toujours accessible */}
      {pika.user && tab !== "creer" && (
        <button
          onClick={() => setTab("creer")}
          aria-label={t("tab_creer")}
          className="pika-fab"
          style={{
            position: "fixed", right: 18, bottom: "calc(84px + env(safe-area-inset-bottom))",
            zIndex: 900, display: "flex", alignItems: "center", gap: 8,
            background: COLORS.coral, color: "#fff", border: "none",
            borderRadius: 999, padding: "14px 20px", cursor: "pointer",
            fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15,
            boxShadow: "0 6px 20px rgba(43,37,96,0.25)",
          }}
        >
          <PlusCircle size={20} className="pika-fab-icon" />
          <span className="pika-fab-label">{t("tab_creer")}</span>
        </button>
      )}

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

      <DetailModal
        activity={(pika.allActivities || []).find((a) => a.id === selectedId) || null} onClose={() => setSelectedId(null)} joined={joined} onJoin={join} onReport={openReport}
        onViewProfile={openUserProfile} onShare={setShareTarget} currentUserId={pika.user?.id}
        onEdit={openEditKid} onCancelOuting={cancelOuting} onLeave={leave} onOpenDefi={() => setDefiOpen(true)} onOpenChat={() => setChatOpen(true)} onOpenOrga={() => setOrgaOpen(true)}
        myNbEnfants={pika.nbEnfants || 0} myKidsHere={(pika.myRegsKids || {})[selectedId] || 0}
      />

      {(() => {
        const kindMeta = {
          adult: { categories: ADULT_CATEGORIES, items: pika.allAdultItems || [], joined: joinedAdult, joinLabel: t("join_label_adult"), genderMode: true },
          teen: { categories: TEEN_CATEGORIES, items: pika.allTeenItems || [], joined: joinedTeen, joinLabel: t("join_label_teen"), genderMode: true, genderLabels: { f: t("legend_girl"), m: t("legend_boy") } },
          senior: { categories: SENIOR_CATEGORIES, items: pika.allSeniorItems || [], joined: joinedSenior, joinLabel: t("join_label_senior"), genderMode: true },
          asso: { categories: ASSO_CATEGORIES, items: assoItems, joined: joinedAsso, joinLabel: t("join_label_asso"), genderMode: true },
        };
        const meta = kindMeta[selectedCommunity?.kind] || kindMeta.adult;
        const communityItem = selectedCommunity ? meta.items.find((it) => it.id === selectedCommunity.id) || null : null;
        return (
          <CommunityDetailModal
            item={communityItem}
            categories={meta.categories}
            onClose={() => setSelectedCommunity(null)}
            joined={meta.joined}
            onJoin={(id) => joinCommunity(selectedCommunity?.kind, id)}
            joinLabel={meta.joinLabel}
            genderMode={meta.genderMode}
            genderLabels={meta.genderLabels}
            onReport={openReport}
            onViewProfile={openUserProfile}
            onShare={setShareTarget}
            currentUserId={pika.user?.id}
            onEdit={(item) => openEditCommunity(selectedCommunity?.kind, item)}
            onCancelOuting={cancelOuting}
            onLeave={(id) => leaveCommunity(selectedCommunity?.kind, id)}
            onOpenDefi={() => setDefiOpen(true)}
            onOpenChat={() => setChatOpen(true)}
            onOpenOrga={() => setOrgaOpen(true)}
          />
        );
      })()}

      {authPrompt && <AuthScreen onClose={() => setAuthPrompt(false)} onOpenLegal={setLegalDoc} />}

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />

      {orgaOpen && (() => {
        const kindMap = { teen: pika.allTeenItems, adult: pika.allAdultItems, senior: pika.allSeniorItems, asso: assoItems };
        const current = selectedCommunity
          ? (kindMap[selectedCommunity.kind] || []).find((it) => it.id === selectedCommunity.id)
          : (pika.allActivities || []).find((a) => a.id === selectedId);
        if (!current) return null;
        return (
          <ContactOrganisateurModal
            activity={current}
            currentUserId={pika.user?.id}
            onViewProfile={openUserProfile}
            onClose={() => setOrgaOpen(false)}
          />
        );
      })()}

      {chatOpen && (() => {
        const kindMap = { teen: pika.allTeenItems, adult: pika.allAdultItems, senior: pika.allSeniorItems, asso: assoItems };
        const current = selectedCommunity
          ? (kindMap[selectedCommunity.kind] || []).find((it) => it.id === selectedCommunity.id)
          : (pika.allActivities || []).find((a) => a.id === selectedId);
        if (!current) return null;
        return (
          <ChatModal
            activity={current}
            currentUserId={pika.user?.id}
            onViewProfile={openUserProfile}
            onClose={() => setChatOpen(false)}
          />
        );
      })()}

      {defiOpen && (() => {
        const kindMap = { teen: teenItems, adult: adultItems, senior: seniorItems, asso: assoItems };
        const current = selectedCommunity
          ? (kindMap[selectedCommunity.kind] || []).find((it) => it.id === selectedCommunity.id)
          : (pika.allActivities || []).find((a) => a.id === selectedId);
        if (!current) return null;
        return (
          <DefiWheel
            existingDefi={current.defi}
            onSaveDefi={(defi) => pika.setActivityDefi(current.id, defi)}
            onClose={() => setDefiOpen(false)}
          />
        );
      })()}

      {editTarget && (
        <EditActivityModal
          activity={editTarget.activity}
          space={editTarget.space}
          categories={editTarget.categories}
          onClose={() => setEditTarget(null)}
          onSave={saveEdit}
        />
      )}

      {viewingUserId && (
        <UserProfilePage
          userId={viewingUserId}
          currentUserId={pika.user?.id}
          onReport={(uid) => setReportTarget({ userId: uid, isUser: true })}
          onClose={() => setViewingUserId(null)}
        />
      )}

      {shareTarget && <ShareModal item={shareTarget} onClose={() => setShareTarget(null)} />}

      {reportTarget && (
        <ReportModal
          isUser={!!reportTarget.isUser}
          onClose={() => setReportTarget(null)}
          onSubmit={({ reason, details }) => pika.submitReport({
            activityId: reportTarget.isUser ? null : reportTarget.id,
            reportedUserId: reportTarget.isUser ? reportTarget.userId : reportTarget.createdBy,
            reason, details,
          })}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        /* Sur écran étroit, on masque les dernières pastilles plutôt que de déborder.
           Le compteur "+N" reste toujours visible, lui. */
        @media (max-width: 560px) {
          .pika-avatars > *:nth-child(n+4):not(:last-child) { display: none !important; }
        }
        @media (max-width: 420px) {
          .pika-avatars > *:nth-child(n+3):not(:last-child) { display: none !important; }
        }
        @media (max-width: 460px) {
          /* Sur petit écran : le bouton flottant devient rond (icône seule) et les
             libellés d'en-tête sont masqués pour laisser la place au sélecteur de lieu. */
          .pika-fab { padding: 16px !important; right: 14px !important; }
          .pika-fab-label { display: none !important; }
          .pika-fab-icon { width: 30px !important; height: 30px !important; }
          /* Libellé masqué : le bouton devient un carré parfait avec l'icône centrée
             (sans le gap résiduel qui la décalait vers la gauche). */
          .pika-header-action {
            padding: 0 !important;
            gap: 0 !important;
            width: 40px !important;
            height: 40px !important;
            justify-content: center !important;
          }
          .pika-header-action-label { display: none !important; }
        }
        @media (max-width: 560px) {
          .pika-cover { min-height: 150px !important; }
          .pika-cover-avatar { width: 116px !important; height: 116px !important; font-size: 44px !important; }
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
