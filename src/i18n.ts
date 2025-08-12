// src/i18n.ts
import { useUi } from './state/uiStore';
import type { UniversalTheme } from './types';

// Tip: usa useTx() para mensajes con variables: tx('validation.minLength', { field: t('auth.password'), min: 8 })

type Locale = 'es' | 'en' | 'ca';

const dict: Record<Locale, Record<string, string>> = {
  es: {
    // ===== Marca / acciones comunes =====
    'brand': 'StoryLab',
    'action.close': 'Cerrar',
    'action.logout': 'Salir',

    // ===== UI =====
    'ui.dark': 'Modo oscuro',
    'ui.light': 'Modo claro',

    // ===== Navegación =====
    'nav.projects': 'Proyectos',
    'nav.storyMachine': 'Story Machine',
    'nav.storyDraft': 'Story Draft',
    'nav.activeProject': 'Proyecto activo',
    'nav.steps': 'Pasos',

    // Story Machine — pasos
    'nav.machine.s1': 'S1 — Ideación (Egri)',
    'nav.machine.s2': 'Tratamiento',
    'nav.machine.s3': 'Puntos de Giro',
    'nav.machine.s4': 'Personajes',
    'nav.machine.s5': 'Subtramas',
    'nav.machine.s6': 'Escenas clave',
    'nav.machine.s7': 'Todas las escenas',

    // AppBar
    'project.none': 'Sin proyecto',

    // ===== S1 — Ideación (Egri) =====
    's1.title': 'S1 — Ideación (Egri): Idea + Premisa + Tema + Género',
    's1.subtitle': 'Define hasta 5 ideas. Cada una lleva una Premisa (proposición causal de Egri), un Tema principal y un Género.',
    's1.idea': 'Idea',
    's1.idea.label': 'IDEA (frase 8–140 caracteres)',
    's1.idea.helper.invalid': 'Escribe una sola frase con 8–140 caracteres',
    's1.premise.label': 'PREMISA (proposición causal de Egri)',
    's1.premise.placeholder': 'Ej.: La ambición desmedida conduce a la autodestrucción.',
    's1.premise.helper.invalid': 'Incluye un conector causal: conduce a / lleva a / provoca / desemboca en / termina en / da lugar a',
    's1.theme.title': 'TEMA PRINCIPAL',
    's1.theme.help.tooltip': 'Ayuda: Temas universales y ejemplos',
    's1.genre.label': 'GÉNERO (sugerencias)',
    's1.genre.placeholder': 'Escribe para ver sugerencias…',
    's1.subgenres.label': 'SUBGÉNEROS (opcional, múltiple)',
    's1.subgenres.placeholder': 'Añade subgéneros (p. ej., Distopía, Space opera, Slasher…)',
    's1.btn.ia': 'IA: Generar sinopsis (mock)',
    's1.btn.viewBelow': 'Ver sinopsis abajo',
    's1.btn.useAsSynopsis': 'Usar como sinopsis del proyecto',
    's1.btn.markChosen': 'Marcar como idea elegida',
    's1.status.valid': 'Válida',
    's1.status.incomplete': 'Incompleta',
    's1.btn.addIdea': '+ Añadir idea',
    's1.needOneValid': 'Necesitas al menos 1 fila válida para continuar.',
    's1.synopsis.title': 'Sinopsis (idea seleccionada)',
    's1.synopsis.regen': 'IA: (re)generar sinopsis (mock)',
    's1.synopsis.selectPrompt': 'Selecciona una idea para ver/editar su sinopsis.',
    's1.chosen': 'Elegida',
    's1.tooltip.expand': 'Expandir',
    's1.tooltip.collapse': 'Colapsar',
    's1.tooltip.delete': 'Eliminar',
    's1.tooltip.keepOne': 'Deja al menos una idea',
    's1.help.egri.tooltip': 'Ver ayuda (teoría Egri)',
    's1.help.egri.title': 'Teoría de soporte — Egri',
    's1.help.themes.title': 'Temas universales — Ayuda',

    // S3 — Puntos de giro

    's3.title': 'S3 — Puntos de giro',
    's3.subtitle': 'Define los plot points clave y vincúlalos a tus escenas.',
    's3.help.general.title': 'Estructura de 3 actos — Ayuda',
    's3.help.general.tooltip': 'Ver ayuda general',
    's3.incidente': 'Incidente',
    's3.momentoCambio': 'Momento de Cambio',
    's3.puntoMedio': 'Punto Medio / Ordalía',
    's3.crisis': 'Crisis',
    's3.climax': 'Clímax',
    's3.summary.label': 'Descripción / función dramática',
    's3.link.label': 'Escena (opcional)',
    's3.examples': 'Ejemplos',
    's3.btn.ai': 'Propuesta IA',
    's3.btn.ai.tooltip': 'Generar borrador (mock) con IA',

    // S4 - Personajes
    's4.title': 'S4 — Personajes',
    's4.add': 'Añadir personaje',
    's4.edit': 'Editar',
    's4.delete': 'Eliminar',
    's4.noname': 'Sin nombre',

    's4.card.archetypes': 'Arquetipos (Vogler)',
    's4.card.nature': 'Naturaleza',
    's4.card.attitude': 'Actitud',
    's4.card.need.global': 'Necesidad dramática — Global',
    's4.card.need.h1': 'Necesidad dramática — 1ª mitad (hasta Ordalía)',
    's4.card.need.h2': 'Necesidad dramática — 2ª mitad (tras Ordalía)',
    's4.card.arc': 'Evolución (arco de personaje)',
    's4.card.conflict': 'Conflicto (McKee)',
    's4.card.conflict.level': 'Conflicto — nivel (McKee)',
    's4.card.conflict.desc': 'Conflicto — descripción',
    's4.card.relations': 'Relaciones con otros personajes',
    's4.card.paradoxes': 'Paradojas y contradicciones',
    's4.card.biography': 'Biografía',
    's4.card.voice': 'Voz propia',

    's4.relations.add': '+ Relación',
    's4.relations.none': 'Añade relaciones con otros personajes.',
    's4.relations.needMore': 'Crea otro personaje para poder añadir relaciones.',
    's4.relations.with': 'con',

    's4.modal.title': 'Editar personaje',
    's4.modal.name': 'Nombre',
    's4.modal.archetypes': 'Arquetipos (Vogler)',
    's4.modal.nature': 'Naturaleza (adjetivos)',
    's4.modal.attitude': 'Actitud (cómo se muestra)',
    's4.modal.cancel': 'Cancelar',
    's4.modal.save': 'Guardar',

    's4.search.label': 'Buscar',
    's4.search.placeholder': 'Nombre, arquetipos, rasgos, conflicto…',
    's4.search.results': '{n} resultados',
    's4.search.noResults': 'No se han encontrado personajes',

    // Niveles de conflicto (etiquetas UI)
    's4.conflict.level.extrapersonal': 'Extrapersonal',
    's4.conflict.level.personal': 'Personal',
    's4.conflict.level.internal': 'Interno',

    // Arquetipos (etiquetas UI)
    'arch.hero': 'Héroe',
    'arch.mentor': 'Mentor',
    'arch.threshold': 'Guardián (del umbral)',
    'arch.herald': 'Heraldo',
    'arch.trickster': 'Pícaro / Embaucador',
    'arch.shadow': 'Sombra',
    'arch.shapeshifter': 'Camaleón / Cambiante',

    // Etiquetas de temas (UI)
    'theme.Amor': 'Amor',
    'theme.Odio': 'Odio',
    'theme.Mesías': 'Mesías',
    'theme.Malvado': 'Malvado',
    'theme.Búsqueda': 'Búsqueda',
    'theme.Secreto': 'Secreto',
    'theme.Condena': 'Condena',
    'theme.Libertad': 'Libertad',
    'theme.Engaño': 'Engaño',
    'theme.Verdad': 'Verdad',

    // ===== Auth =====
    'auth.login.title': 'Iniciar sesión',
    'auth.register.title': 'Crear cuenta',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre',
    'auth.btn.login': 'Entrar',
    'auth.btn.register': 'Registrarme',
    'auth.link.toRegister': '¿No tienes cuenta? Regístrate',
    'auth.link.toLogin': '¿Ya tienes cuenta? Inicia sesión',
    'auth.error.generic': 'Ha ocurrido un error. Inténtalo de nuevo.',

    // ===== Projects =====
    'projects.title': 'Mis proyectos',
    'projects.open': 'Abrir',
    'projects.create.title': 'Crear nuevo',
    'projects.name.label': 'Nombre del proyecto',
    'projects.btn.create': 'Crear',
    'projects.createdAt': 'Creado',

    // ===== Placeholders genéricos =====
    'ph.email': 'tucorreo@dominio.com',
    'ph.password': 'Mínimo 8 caracteres',
    'ph.name': 'Tu nombre',
    'ph.projectName': 'Mi película',
    'ph.genre': 'Escribe para ver sugerencias…',
    'ph.subgenres': 'Añade subgéneros…',
    'ph.idea': 'Una frase breve que sugiera época/ambientación',
    'ph.premise': 'Rasgo → acción → consecuencia (Egri)',

    // ===== Validaciones =====
    'validation.required': '{field} es obligatorio',
    'validation.email': 'Formato de correo inválido',
    'validation.minLength': '{field}: mínimo {min} caracteres',
    'validation.maxLength': '{field}: máximo {max} caracteres',
    'validation.rangeLength': '{field}: entre {min} y {max} caracteres',
    'validation.pattern': '{field}: formato inválido',
    'validation.password.mismatch': 'Las contraseñas no coinciden',
    'validation.number': '{field} debe ser un número válido',
    'validation.url': 'URL inválida',
    'validation.unique': '{field} ya existe',
    'validation.atLeastOne': 'Selecciona al menos uno'
  },

  en: {
    // ===== Brand / common actions =====
    'brand': 'StoryLab',
    'action.close': 'Close',
    'action.logout': 'Log out',

    // ===== UI =====
    'ui.dark': 'Dark mode',
    'ui.light': 'Light mode',

    // ===== Navigation =====
    'nav.projects': 'Projects',
    'nav.storyMachine': 'Story Machine',
    'nav.storyDraft': 'Story Draft',
    'nav.activeProject': 'Active project',
    'nav.steps': 'Steps',

    // Story Machine — steps
    'nav.machine.s1': 'S1 — Ideation (Egri)',
    'nav.machine.s2': 'Treatment',
    'nav.machine.s3': 'Turning points',
    'nav.machine.s4': 'Characters',
    'nav.machine.s5': 'Subplots',
    'nav.machine.s6': 'Key scenes',
    'nav.machine.s7': 'All scenes',

    // AppBar
    'project.none': 'No project',

    // ===== S1 =====
    's1.title': 'S1 — Ideation (Egri): Idea + Premise + Theme + Genre',
    's1.subtitle': "Define up to 5 ideas. Each one has a Premise (Egri’s causal proposition), a main Theme and a Genre.",
    's1.idea': 'Idea',
    's1.idea.label': 'IDEA (single sentence 8–140 chars)',
    's1.idea.helper.invalid': 'Write a single sentence between 8–140 characters',
    's1.premise.label': 'PREMISE (Egri’s causal proposition)',
    's1.premise.placeholder': 'E.g.: Unchecked ambition leads to self-destruction.',
    's1.premise.helper.invalid': 'Include a causal connector: leads to / brings about / causes / results in / ends in / gives rise to',
    's1.theme.title': 'MAIN THEME',
    's1.theme.help.tooltip': 'Help: Universal themes & examples',
    's1.genre.label': 'GENRE (suggestions)',
    's1.genre.placeholder': 'Type to see suggestions…',
    's1.subgenres.label': 'SUBGENRES (optional, multiple)',
    's1.subgenres.placeholder': 'Add subgenres (e.g. Dystopia, Space opera, Slasher…)',
    's1.btn.ia': 'AI: Generate synopsis (mock)',
    's1.btn.viewBelow': 'View synopsis below',
    's1.btn.useAsSynopsis': 'Use as project synopsis',
    's1.btn.markChosen': 'Mark as chosen idea',
    's1.status.valid': 'Valid',
    's1.status.incomplete': 'Incomplete',
    's1.btn.addIdea': '+ Add idea',
    's1.needOneValid': 'You need at least 1 valid row to continue.',
    's1.synopsis.title': 'Synopsis (selected idea)',
    's1.synopsis.regen': 'AI: (re)generate synopsis (mock)',
    's1.synopsis.selectPrompt': 'Select an idea to view/edit its synopsis.',
    's1.chosen': 'Chosen',
    's1.tooltip.expand': 'Expand',
    's1.tooltip.collapse': 'Collapse',
    's1.tooltip.delete': 'Delete',
    's1.tooltip.keepOne': 'Keep at least one idea',
    's1.help.egri.tooltip': 'See help (Egri theory)',
    's1.help.egri.title': 'Background theory — Egri',
    's1.help.themes.title': 'Universal themes — Help',

    // S3 - Plot points

    's3.title': 'S3 — Turning points',
    's3.subtitle': 'Define the key plot points and link them to scenes.',
    's3.help.general.title': 'Three-act structure — Help',
    's3.help.general.tooltip': 'See general help',
    's3.incidente': 'Inciting Incident',
    's3.momentoCambio': 'Break into Act II',
    's3.puntoMedio': 'Midpoint / Ordeal',
    's3.crisis': 'Crisis',
    's3.climax': 'Climax',
    's3.summary.label': 'Description / dramatic function',
    's3.link.label': 'Scene (optional)',
    's3.examples': 'Examples',
    's3.btn.ai': 'AI Proposal',
    's3.btn.ai.tooltip': 'Generate draft (mock) with AI',

    // S4 - Characters
    's4.title': 'S4 — Characters',
    's4.add': 'Add character',
    's4.edit': 'Edit',
    's4.delete': 'Delete',
    's4.noname': 'No name',

    's4.card.archetypes': 'Archetypes (Vogler)',
    's4.card.nature': 'Nature',
    's4.card.attitude': 'Attitude',
    's4.card.need.global': 'Dramatic need — Global',
    's4.card.need.h1': 'Dramatic need — 1st half (until Ordeal)',
    's4.card.need.h2': 'Dramatic need — 2nd half (after Ordeal)',
    's4.card.arc': 'Evolution (character arc)',
    's4.card.conflict': 'Conflict (McKee)',
    's4.card.conflict.level': 'Conflict — level (McKee)',
    's4.card.conflict.desc': 'Conflict — description',
    's4.card.relations': 'Relationships with other characters',
    's4.card.paradoxes': 'Paradoxes & contradictions',
    's4.card.biography': 'Biography',
    's4.card.voice': 'Voice',

    's4.relations.add': '+ Relation',
    's4.relations.none': 'Add relationships with other characters.',
    's4.relations.needMore': 'Create another character to add relationships.',
    's4.relations.with': 'with',

    's4.modal.title': 'Edit character',
    's4.modal.name': 'Name',
    's4.modal.archetypes': 'Archetypes (Vogler)',
    's4.modal.nature': 'Nature (adjectives)',
    's4.modal.attitude': 'Attitude (how they present)',
    's4.modal.cancel': 'Cancel',
    's4.modal.save': 'Save',

    's4.conflict.level.extrapersonal': 'Extrapersonal',
    's4.conflict.level.personal': 'Personal',
    's4.conflict.level.internal': 'Internal',

    's4.search.label': 'Search',
    's4.search.placeholder': 'Name, archetypes, traits, conflict…',
    's4.search.results': '{n} results',
    's4.search.noResults': 'No characters found',

    'arch.hero': 'Hero',
    'arch.mentor': 'Mentor',
    'arch.threshold': 'Threshold Guardian',
    'arch.herald': 'Herald',
    'arch.trickster': 'Trickster',
    'arch.shadow': 'Shadow',
    'arch.shapeshifter': 'Shapeshifter',

    // Theme labels (UI)
    'theme.Amor': 'Love',
    'theme.Odio': 'Hate',
    'theme.Mesías': 'Messiah',
    'theme.Malvado': 'Villain',
    'theme.Búsqueda': 'Quest',
    'theme.Secreto': 'Secret',
    'theme.Condena': 'Damnation',
    'theme.Libertad': 'Freedom',
    'theme.Engaño': 'Deception',
    'theme.Verdad': 'Truth',

    // ===== Auth =====
    'auth.login.title': 'Sign in',
    'auth.register.title': 'Create account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.btn.login': 'Sign in',
    'auth.btn.register': 'Sign up',
    'auth.link.toRegister': "Don't have an account? Sign up",
    'auth.link.toLogin': 'Already have an account? Sign in',
    'auth.error.generic': 'An error occurred. Please try again.',

    // ===== Projects =====
    'projects.title': 'My projects',
    'projects.open': 'Open',
    'projects.create.title': 'Create new',
    'projects.name.label': 'Project name',
    'projects.btn.create': 'Create',
    'projects.createdAt': 'Created',

    // ===== Generic placeholders =====
    'ph.email': 'you@example.com',
    'ph.password': 'At least 8 characters',
    'ph.name': 'Your name',
    'ph.projectName': 'My movie',
    'ph.genre': 'Type to see suggestions…',
    'ph.subgenres': 'Add subgenres…',
    'ph.idea': 'A brief sentence suggesting era/setting',
    'ph.premise': 'Trait → action → consequence (Egri)',

    // ===== Validations =====
    'validation.required': '{field} is required',
    'validation.email': 'Invalid email format',
    'validation.minLength': '{field}: minimum {min} characters',
    'validation.maxLength': '{field}: maximum {max} characters',
    'validation.rangeLength': '{field}: between {min} and {max} characters',
    'validation.pattern': '{field}: invalid format',
    'validation.password.mismatch': 'Passwords do not match',
    'validation.number': '{field} must be a valid number',
    'validation.url': 'Invalid URL',
    'validation.unique': '{field} already exists',
    'validation.atLeastOne': 'Select at least one'
  },

  ca: {
    // ===== Marca / accions comunes =====
    'brand': 'StoryLab',
    'action.close': 'Tancar',
    'action.logout': 'Sortir',

    // ===== UI =====
    'ui.dark': 'Mode fosc',
    'ui.light': 'Mode clar',

    // ===== Navegació =====
    'nav.projects': 'Projectes',
    'nav.storyMachine': 'Story Machine',
    'nav.storyDraft': 'Story Draft',
    'nav.activeProject': 'Projecte actiu',
    'nav.steps': 'Passes',

    // Story Machine — passes
    'nav.machine.s1': 'S1 — Ideació (Egri)',
    'nav.machine.s2': 'Tractament',
    'nav.machine.s3': 'Punts de gir',
    'nav.machine.s4': 'Personatges',
    'nav.machine.s5': 'Subtrames',
    'nav.machine.s6': 'Escenes clau',
    'nav.machine.s7': 'Totes les escenes',

    // AppBar
    'project.none': 'Sense projecte',

    // ===== S1 — Ideació (Egri) =====
    's1.title': 'S1 — Ideació (Egri): Idea + Premissa + Tema + Gènere',
    's1.subtitle': 'Defineix fins a 5 idees. Cada una porta una Premissa (proposició causal d’Egri), un Tema principal i un Gènere.',
    's1.idea': 'Idea',
    's1.idea.label': 'IDEA (frase de 8–140 caràcters)',
    's1.idea.helper.invalid': 'Escriu una sola frase de 8–140 caràcters',
    's1.premise.label': 'PREMISSA (proposició causal d’Egri)',
    's1.premise.placeholder': 'Ex.: L’ambició desmesurada condueix a l’autodestrucció.',
    's1.premise.helper.invalid': 'Inclou un connector causal: condueix a / porta a / provoca / desemboca en / acaba en / dona lloc a',
    's1.theme.title': 'TEMA PRINCIPAL',
    's1.theme.help.tooltip': 'Ajuda: Temes universals i exemples',
    's1.genre.label': 'GÈNERE (suggeriments)',
    's1.genre.placeholder': 'Escriu per veure suggeriments…',
    's1.subgenres.label': 'SUBGÈNERES (opcional, múltiple)',
    's1.subgenres.placeholder': 'Afegeix subgèneres (p. ex., Distopia, Space opera, Slasher…)',
    's1.btn.ia': 'IA: Generar sinopsi (mock)',
    's1.btn.viewBelow': 'Veure sinopsi a sota',
    's1.btn.useAsSynopsis': 'Fer servir com a sinopsi del projecte',
    's1.btn.markChosen': 'Marcar com a idea escollida',
    's1.status.valid': 'Vàlida',
    's1.status.incomplete': 'Incompleta',
    's1.btn.addIdea': '+ Afegir idea',
    's1.needOneValid': 'Necessites com a mínim 1 fila vàlida per continuar.',
    's1.synopsis.title': 'Sinopsi (idea seleccionada)',
    's1.synopsis.regen': 'IA: (re)generar sinopsi (mock)',
    's1.synopsis.selectPrompt': 'Selecciona una idea per veure’n/editar-ne la sinopsi.',
    's1.chosen': 'Escollida',
    's1.tooltip.expand': 'Desplegar',
    's1.tooltip.collapse': 'Replegar',
    's1.tooltip.delete': 'Eliminar',
    's1.tooltip.keepOne': 'Deixa com a mínim una idea',
    's1.help.egri.tooltip': 'Veure ajuda (teoria d’Egri)',
    's1.help.egri.title': 'Teoria de suport — Egri',
    's1.help.themes.title': 'Temes universals — Ajuda',

    // S3 - Punts de Gir

    's3.title': 'S3 — Punts de gir',
    's3.subtitle': 'Defineix els plot points clau i enllaça’ls amb escenes.',
    's3.help.general.title': 'Estructura de tres actes — Ajuda',
    's3.help.general.tooltip': 'Veure ajuda general',
    's3.incidente': 'Incident',
    's3.momentoCambio': 'Moment de Canvi',
    's3.puntoMedio': 'Punt Mig / Ordalía',
    's3.crisis': 'Crisi',
    's3.climax': 'Clímax',
    's3.summary.label': 'Descripció / funció dramàtica',
    's3.link.label': 'Escena (opcional)',
    's3.examples': 'Exemples',
    's3.btn.ai': 'Proposta IA',
    's3.btn.ai.tooltip': 'Generar esborrany (mock) amb IA',

    // S4 - Personatges
    's4.title': 'S4 — Personatges',
    's4.add': 'Afegir personatge',
    's4.edit': 'Editar',
    's4.delete': 'Eliminar',
    's4.noname': 'Sense nom',

    's4.card.archetypes': 'Arquetips (Vogler)',
    's4.card.nature': 'Naturalesa',
    's4.card.attitude': 'Actitud',
    's4.card.need.global': 'Necessitat dramàtica — Global',
    's4.card.need.h1': 'Necessitat dramàtica — 1a meitat (fins a l’Ordalia)',
    's4.card.need.h2': 'Necessitat dramàtica — 2a meitat (després de l’Ordalia)',
    's4.card.arc': 'Evolució (arc de personatge)',
    's4.card.conflict': 'Conflicte (McKee)',
    's4.card.conflict.level': 'Conflicte — nivell (McKee)',
    's4.card.conflict.desc': 'Conflicte — descripció',
    's4.card.relations': 'Relacions amb altres personatges',
    's4.card.paradoxes': 'Paradoxes i contradiccions',
    's4.card.biography': 'Biografia',
    's4.card.voice': 'Veu',

    's4.relations.add': '+ Relació',
    's4.relations.none': 'Afegeix relacions amb altres personatges.',
    's4.relations.needMore': 'Crea un altre personatge per poder afegir relacions.',
    's4.relations.with': 'amb',

    's4.modal.title': 'Editar personatge',
    's4.modal.name': 'Nom',
    's4.modal.archetypes': 'Arquetips (Vogler)',
    's4.modal.nature': 'Naturalesa (adjectius)',
    's4.modal.attitude': 'Actitud (com es mostra)',
    's4.modal.cancel': 'Cancel·lar',
    's4.modal.save': 'Desar',

    's4.conflict.level.extrapersonal': 'Extrapersonal',
    's4.conflict.level.personal': 'Personal',
    's4.conflict.level.internal': 'Intern',

    's4.search.label': 'Cercar',
    's4.search.placeholder': 'Nom, arquetips, trets, conflicte…',
    's4.search.results': '{n} resultats',
    's4.search.noResults': 'No s’han trobat personatges',

    'arch.hero': 'Heroi',
    'arch.mentor': 'Mentor',
    'arch.threshold': 'Guardià (del llindar)',
    'arch.herald': 'Missatger',
    'arch.trickster': 'Pícar / Embaucador',
    'arch.shadow': 'Ombra',
    'arch.shapeshifter': 'Camaleó / Canviant',


    // Etiquetes de temes (UI)
    'theme.Amor': 'Amor',
    'theme.Odio': 'Odi',
    'theme.Mesías': 'Messies',
    'theme.Malvado': 'Malvat',
    'theme.Búsqueda': 'Recerca',
    'theme.Secreto': 'Secret',
    'theme.Condena': 'Condemna',
    'theme.Libertad': 'Llibertat',
    'theme.Engaño': 'Engany',
    'theme.Verdad': 'Veritat',

    // ===== Auth =====
    'auth.login.title': 'Inicia sessió',
    'auth.register.title': 'Crea un compte',
    'auth.email': 'Correu electrònic',
    'auth.password': 'Contrasenya',
    'auth.name': 'Nom',
    'auth.btn.login': 'Inicia sessió',
    'auth.btn.register': 'Registrar-me',
    'auth.link.toRegister': 'No tens compte? Registra’t',
    'auth.link.toLogin': 'Ja tens compte? Inicia sessió',
    'auth.error.generic': 'S’ha produït un error. Torna-ho a intentar.',

    // ===== Projectes =====
    'projects.title': 'Els meus projectes',
    'projects.open': 'Obrir',
    'projects.create.title': 'Crear nou',
    'projects.name.label': 'Nom del projecte',
    'projects.btn.create': 'Crear',
    'projects.createdAt': 'Creat',

    // ===== Placeholders genèrics =====
    'ph.email': 'elmeucorreu@domini.com',
    'ph.password': 'Mínim 8 caràcters',
    'ph.name': 'El teu nom',
    'ph.projectName': 'La meva pel·lícula',
    'ph.genre': 'Escriu per veure suggeriments…',
    'ph.subgenres': 'Afegeix subgèneres…',
    'ph.idea': 'Una frase breu que suggereixi època/ambientació',
    'ph.premise': 'Tret → acció → conseqüència (Egri)',

    // ===== Validacions =====
    'validation.required': '{field} és obligatori',
    'validation.email': 'Format de correu invàlid',
    'validation.minLength': '{field}: mínim {min} caràcters',
    'validation.maxLength': '{field}: màxim {max} caràcters',
    'validation.rangeLength': '{field}: entre {min} i {max} caràcters',
    'validation.pattern': '{field}: format invàlid',
    'validation.password.mismatch': 'Les contrasenyes no coincideixen',
    'validation.number': '{field} ha de ser un número vàlid',
    'validation.url': 'URL invàlida',
    'validation.unique': '{field} ja existeix',
    'validation.atLeastOne': 'Selecciona’n almenys un'
  }
};

// Hook simple para obtener strings planos
export function useT() {
  const { lang } = useUi();
  return (k: string) => (dict[lang as Locale] && dict[lang as Locale][k]) ?? k;
}

// Hook para strings con variables {var}
export function useTx() {
  const t = useT();
  return (k: string, vars?: Record<string, string | number>) => {
    const template = t(k);
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
  };
}

// Helper para rotular temas según idioma, manteniendo el valor del enum
export function themeLabel(theme: UniversalTheme, t: (k: string) => string) {
  return t(`theme.${theme}`);
}
