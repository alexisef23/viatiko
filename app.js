/**
 * VIATIKO - Advanced Travel Planning & AI Itinerary Generator
 * Interactive Logic, Dynamic Synthesis, Audio Gamification & Currency Engine
 */

// ==========================================
// 1. STATE & USER CONFIGURATION
// ==========================================
const appState = {
  currentStep: 1,
  totalSteps: 5,
  destination: "Oaxaca, México",
  company: "amigos",
  days: 5,
  season: "Primavera",
  budgetTier: "equilibrado",
  interests: ["gastronomia", "aventura", "relax"],
  specialNotes: "",
  currency: "MXN",
  soundEnabled: true,
  currentTimelineDay: 1,
  generatedPlan: null,
  groupTravelers: 4,
  showingAllDays: false
};

// Currency Exchange Rates (Base: MXN)
const CURRENCY_RATES = {
  MXN: { symbol: "$", rate: 1, label: "MXN" },
  USD: { symbol: "$", rate: 0.054, label: "USD" },
  EUR: { symbol: "€", rate: 0.050, label: "EUR" }
};

// ==========================================
// 2. AUDIO SYNTHESIS (Web Audio API)
// ==========================================
let audioCtx = null;

function playUiSound(type = 'click') {
  if (!appState.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'select') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      // Arpeggio chord
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const chordOsc = audioCtx.createOscillator();
        const chordGain = audioCtx.createGain();
        chordOsc.connect(chordGain);
        chordGain.connect(audioCtx.destination);
        chordOsc.type = 'sine';
        chordOsc.frequency.setValueAtTime(freq, now + (i * 0.07));
        chordGain.gain.setValueAtTime(0.08, now + (i * 0.07));
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.07) + 0.25);
        chordOsc.start(now + (i * 0.07));
        chordOsc.stop(now + (i * 0.07) + 0.25);
      });
    }
  } catch (e) {
    // Audio context not allowed or not supported yet
  }
}

// ==========================================
// 3. CURRENCY FORMATTER
// ==========================================
function formatMoney(amountInMxn) {
  const current = CURRENCY_RATES[appState.currency];
  const converted = Math.round(amountInMxn * current.rate);
  return `${current.symbol}${converted.toLocaleString()} ${current.label}`;
}

// ==========================================
// 4. RICH TRAVEL DATABASE
// ==========================================
const DESTINATIONS_DB = {
  "Oaxaca, México": {
    country: "México",
    image: "assets/oaxaca.jpg",
    dailyBudget: { mochilero: 750, equilibrado: 2200, lujo: 5800 },
    summary: "La meca gastronómica y cultural de México: mezcalerías de autor, mercados vivos de mole y cecina, artesanías en barro negro y la majestuosidad de Monte Albán y Hierve el Agua.",
    highlights: ["Mole negro & Tlayudas", "Hierve el Agua", "Mezcal ancestral", "Monte Albán", "Barro Negro"],
    hotels: [
      { name: "Hostal Casa del Tío", tier: "mochilero", price: 650, score: "9.4", desc: "Patio tradicional con hamacas, excelente vibra para viajeros y café oaxaqueño de cortesía.", badge: "Top Mochilero" },
      { name: "Hotel Boutique Parador San Agustín", tier: "equilibrado", price: 2100, score: "9.7", desc: "Casona colonial restaurada a 3 cuadras del Templo de Santo Domingo con terraza hermosa.", badge: "Favorito Calidad-Precio" },
      { name: "Quinta Real Oaxaca", tier: "lujo", price: 6200, score: "9.9", desc: "Exconvento del siglo XVI declarado Patrimonio de la Humanidad con alberca entre arcos de cantera.", badge: "Lujo Histórico" }
    ],
    foodSpots: [
      { name: "Pasillo de Humo (Mdo. 20 de Nov.)", type: "Mercado Tradicional", price: "$$", desc: "Elige tu cecina, tasajo y chorizo asados al carbón con chiles de agua y tortillas hechas a mano." },
      { name: "Sabina Sabe", type: "Coctelería & Mezcal", price: "$$$", desc: "Uno de los 50 mejores bares del mundo: mixología con destilados silvestres y botanitas de autor." },
      { name: "Levadura de Olla", type: "Cocina Tradicional de Autor", price: "$$$", desc: "De la Chef Thalia Barrios: homenaje a maíces criollos, tamales ceremoniales y moles oaxaqueños." },
      { name: "Criollo", type: "Fine Dining", price: "$$$$", desc: "Del chef Enrique Olvera: menú degustación sorpresa de 6 tiempos servido en un jardín encantado." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Llegada al Corazón Colonial y Fiesta de Sabores",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Desayuno en Mercado 20 de Noviembre & Pasillo de Humo", desc: "Comienza con chocolate oaxaqueño caliente con pan de yema, y recorre el pasillo de las carnes asadas para tu almuerzo.", loc: "Centro de Oaxaca", tip: "Compra tus aguacates criollos y tortillas tlayudas calientes en los puestos contiguos." },
          { time: "02:30 PM", slot: "afternoon", title: "Templo de Santo Domingo y Jardín Etnobotánico", desc: "Maravíllate con el retablo de hoja de oro de Santo Domingo y haz el recorrido guiado por cactáceas gigantes.", loc: "Andador Turístico", tip: "Llega 20 minutos antes para asegurar boleto del recorrido guiado de las 3:00 PM." },
          { time: "07:30 PM", slot: "evening", title: "Cata de Mezcales y Cena en Terraza Colonial", desc: "Visita la mezcalería Sabina Sabe para catar variedades como Tobalá, Tepeztate y Espadín artesanal.", loc: "Calle 5 de Mayo", tip: "El mezcal no se toma de golpe: dale un 'besito' suave para despertar las papilas." }
        ]
      },
      {
        day: 2,
        title: "Hierve el Agua y Ruta de las Destilerías Ancestrales",
        activities: [
          { time: "08:00 AM", slot: "morning", title: "Cascadas Petrificadas de Hierve el Agua", desc: "Nada en las pozas naturales al borde del abismo con vistas de 360 grados a la sierra antes de que lleguen los autobuses turísticos.", loc: "San Isidro Roaguía", tip: "Lleva toalla, traje de baño y calzado antiderrapante." },
          { time: "01:30 PM", slot: "afternoon", title: "Palenque Tradicional en Santiago Matatlán", desc: "Conoce a un maestro mezcalero de tercera generación, observa el horno cónico de tierra y destilación en alambique de cobre.", loc: "Matatlán (Capital del Mezcal)", tip: "Pregunta por mezcales destilados con pechuga de pavo criollo." },
          { time: "07:00 PM", slot: "evening", title: "Cena de Tlayudas Gigantes en El Negro o Doña Flavia", desc: "Crujiente tlayuda con asiento, frijoles negros con hoja de aguacate, quesillo y tasajo asado.", loc: "Colonia Reforma", tip: "Acompáñala con agua fresca de horchata con tuna y nuez." }
        ]
      },
      {
        day: 3,
        title: "Arqueología Zapoteca, Barro Negro y Alta Gastronomía",
        activities: [
          { time: "09:00 AM", slot: "morning", title: "Zona Arqueológica de Monte Albán", desc: "La antigua capital del imperio zapoteco sobre la cima de la montaña. Vistas espectaculares de los Valles Centrales.", loc: "Monte Albán", tip: "Lleva sombrero y bloqueador; la explanada central tiene muy poca sombra." },
          { time: "02:00 PM", slot: "afternoon", title: "Talleres Artesanales de San Bartolo Coyotepec", desc: "Observa en vivo el bruñido a mano del barro negro tradicional con cuarzo para lograr su brillo metálico natural.", loc: "San Bartolo Coyotepec", tip: "Compra piezas directamente a los artesanos locales en sus talleres familiares." },
          { time: "08:00 PM", slot: "evening", title: "Cena de Degustación en Los Danzantes o Criollo", desc: "Experiencia sensorial de alta cocina oaxaqueña contemporánea maridada con vinos mexicanos y mezcales.", loc: "Plaza Jardín Santo Domingo", tip: "Reserva con al menos 3 días de anticipación para mesa en el patio principal." }
        ]
      },
      {
        day: 4,
        title: "Mercados Indígenas, Textiles y Cacao Puro",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Ruta de Tejidos de Lana en Teotitlán del Valle", desc: "Aprende cómo tiñen la lana con tintes 100% naturales como grana cochinilla, añil y cáscaras de granada.", loc: "Teotitlán del Valle", tip: "Pide que te muestren el truco del limón sobre la grana cochinilla para ver el cambio de color." },
          { time: "02:30 PM", slot: "afternoon", title: "Comida en Restaurante Tlamanalli o Cocina de Humo", desc: "Prueba recetas zapotecas intactas desde hace siglos elaboradas con metate de piedra volcánica.", loc: "Teotitlán", tip: "La sopa de flor de calabaza y el mole coloradito son de otro planeta." },
          { time: "07:00 PM", slot: "evening", title: "Atardecer en Rooftop con Vista a las Cúpulas", desc: "Disfruta de cócteles frescos mientras el cielo se pinta de violeta sobre la cantera verde de la ciudad.", loc: "Terraza Casa Oaxaca", tip: "Pide el cóctel insignia con mezcal joven, maracuyá y sal de gusano." }
        ]
      },
      {
        day: 5,
        title: "Sierra Norte, Bosque de Niebla o Relax en Temazcal",
        activities: [
          { time: "09:00 AM", slot: "morning", title: "Caminata por los Pueblos Mancomunados o San Agustín Etla", desc: "Visita el Centro de las Artes de San Agustín (antigua fábrica textil) o realiza senderismo en la Sierra Juárez.", loc: "San Agustín Etla", tip: "El espacio alberga galerías de arte contemporáneo con jardines de papel hecho a mano." },
          { time: "02:00 PM", slot: "afternoon", title: "Sesión Tradicional de Temazcal Medicinal", desc: "Purificación con hierbas aromáticas locales (albahaca, ruda y romero) guiada por una curandera tradicional.", loc: "Valle de Oaxaca", tip: "Hidrátate bien antes de entrar; te dejará completamente renovado." },
          { time: "07:30 PM", slot: "evening", title: "Noche de Despedida: Música en Vivo y Mezcal Bar", desc: "Cierre festivo con amigos o pareja en un bar con jazz o son jarocho en vivo en el centro.", loc: "Bar Txalaparta / Archivo Maguey", tip: "Baila en las dos terrazas al aire libre con vista nocturna." }
        ]
      }
    ],
    packingTips: [
      "Calzado antiderrapante y cómodo para calles de adoquín empedradas.",
      "Suéter o chamarra ligera para las noches (en el valle la temperatura refresca bastante).",
      "Efectivo en billetes pequeños para mercados y artesanos locales.",
      "Mochila pequeña para excursiones de día a Hierve el Agua y Monte Albán.",
      "Protector solar biodegradable y repelente de insectos."
    ]
  },

  "Tokio, Japón": {
    country: "Japón",
    image: "assets/tokyo.jpg",
    dailyBudget: { mochilero: 1100, equilibrado: 3200, lujo: 9500 },
    summary: "Una metrópolis deslumbrante donde santuarios ancestrales se entrelazan con rascacielos cyberpunk, izakayas secretas, ramen galardonado y la hospitalidad zen más refinada.",
    highlights: ["Cruce de Shibuya & Neón", "Senso-ji & Asakusa", "TeamLab Planets", "Ramen & Izakayas", "Akihabara & Harajuku"],
    hotels: [
      { name: "Book and Bed Tokyo Shinjuku", tier: "mochilero", price: 950, score: "9.3", desc: "Dormir dentro de estanterías de libros en el vibrante Shinjuku, ultra moderno y social.", badge: "Concepto Único" },
      { name: "Candeo Hotels Tokyo Shimbashi", tier: "equilibrado", price: 3400, score: "9.6", desc: "Baño termal tradicional japonés 'Sky Spa' en la azotea con vista panorámica a la ciudad.", badge: "Spa & Vistas Top" },
      { name: "Aman Tokyo / Park Hyatt", tier: "lujo", price: 13500, score: "9.9", desc: "Habitaciones de ensueño inspiradas en casas tradicionales de té suspendidas sobre el skyline de Tokio.", badge: "Ultralujo Zen" }
    ],
    foodSpots: [
      { name: "Omoide Yokocho (Memory Lane)", type: "Callejón de Izakayas", price: "$$", desc: "Pequeños puestos de 6 asientos donde asan brochetas yakitori al carbón y sirven cerveza fría." },
      { name: "Fuunji Shinjuku", type: "Tsukemen & Ramen", price: "$$", desc: "El mejor dip de fideos tsukemen con caldo denso de pollo y pescado que cambiará tu vida." },
      { name: "Sushi Dai / Sushizanmai", type: "Sushi Fresco de Mercado", price: "$$$", desc: "Pescado traído esa misma madrugada directo de Toyosu; nigiris de atún graso (otoro) que se deshacen." },
      { name: "Gonpachi Nishi-Azabu", type: "Izakaya Legendaria", price: "$$$", desc: "Famosa taberna que inspiró la icónica escena de 'Kill Bill', con soba hecha a mano y ambiente vibrante." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Impacto Futurista: Shinjuku, Cruce de Shibuya y Noche de Izakayas",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Cruce de Shibuya y Estatua de Hachiko", desc: "Cruza la intersección peatonal más transitada del planeta y sube al mirador Shibuya Sky.", loc: "Shibuya", tip: "Reserva Shibuya Sky para 40 minutos antes del atardecer para ver el monte Fuji si está despejado." },
          { time: "03:00 PM", slot: "afternoon", title: "Exploración Vintage en Shimokitazawa", desc: "Barrio bohemio repleto de tiendas de ropa retro japonesa, cafeterías de filtro y tiendas de vinilos.", loc: "Shimokitazawa", tip: "Prueba el pan japonés al vapor de curry en las tienditas locales." },
          { time: "07:30 PM", slot: "evening", title: "Cena en Omoide Yokocho y Bares de Golden Gai", desc: "Tapeo japonés en callejones estrechos iluminados por linternas rojas de papel en Shinjuku.", loc: "Shinjuku Este", tip: "Muchos bares de Golden Gai cobran cover charge simbólico; busca los letreros 'No Cover'." }
        ]
      },
      {
        day: 2,
        title: "Tradición Milenaria y Arte Inmersivo",
        activities: [
          { time: "08:30 AM", slot: "morning", title: "Templo Senso-ji y Calle Comercial Nakamise", desc: "El templo budista más antiguo de Tokio. Pasa bajo la linterna gigante de Kaminarimon.", loc: "Asakusa", tip: "Saca tu fortuna Omikuji; si es mala suerte, átala al alambre para dejarla atrás." },
          { time: "01:00 PM", slot: "afternoon", title: "Paseo en Barco Fluvial hasta Odaiba & TeamLab Planets", desc: "Camina descalzo sobre aguas con carpas de luz y jardines flotantes de orquídeas vivas.", loc: "Toyosu / Odaiba", tip: "Lleva pantalones que se puedan arremangar fácilmente hasta las rodillas." },
          { time: "07:30 PM", slot: "evening", title: "Ramen de autor y Noche en Ginza", desc: "Cuenco humeante de ramen con caldo de horas y fideos al dente en una barra tradicional.", loc: "Ginza", tip: "Sorber los fideos con ruido se considera un cumplido al chef." }
        ]
      },
      {
        day: 3,
        title: "Cultura Pop, Santuario Meiji y Moda Urbana",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Santuario Meiji Jingu y Bosque Sagrado", desc: "Paz absoluta en medio de la ciudad entrando por toriis de cedro milenario.", loc: "Harajuku", tip: "Escribe tus deseos de viaje en una tablilla de madera votiva 'Ema'." },
          { time: "01:30 PM", slot: "afternoon", title: "Takeshita Street y Omotesando Hills", desc: "El contraste entre la moda urbana extravagante y la arquitectura de lujo en Omotesando.", loc: "Harajuku / Omotesando", tip: "Come un crepe japonés caliente relleno de fresas y matcha." },
          { time: "08:00 PM", slot: "evening", title: "Karaoke Box Privado con Bebidas", desc: "La experiencia clásica japonesa: sala privada con luces de neón, micrófonos y servicio a la sala.", loc: "Shibuya", tip: "Pide el plan 'Nomihodai' (barra libre) de 2 horas para el grupo." }
        ]
      },
      {
        day: 4,
        title: "Paraíso Gamer en Akihabara y Jardines Imperiales",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Jardines Orientales del Palacio Imperial", desc: "Paseo tranquilo entre fosos históricos, muros de piedra maciza y árboles bonsái centenarios.", loc: "Chiyoda", tip: "La entrada es gratuita pero cierra los lunes y viernes." },
          { time: "02:00 PM", slot: "afternoon", title: "Inmersión Tecnológica y Anime en Akihabara", desc: "Tiendas de coleccionismo, arcades retro de 7 pisos de SEGA/Gigo y cafés temáticos.", loc: "Electric Town", tip: "Lleva tu pasaporte para comprar libre de impuestos (Tax-Free)." },
          { time: "08:00 PM", slot: "evening", title: "Cena Teppanyaki de Carne Wagyu A5", desc: "Carne veteada que se funde en la boca cocinada a la plancha frente a ti por un maestro.", loc: "Roppongi", tip: "Acompáñala con sal de wasabi fresco rallado al instante." }
        ]
      },
      {
        day: 5,
        title: "Mercado de Toyosu, Aguas Termales y Despedida Épica",
        activities: [
          { time: "09:00 AM", slot: "morning", title: "Desayuno de Sushi en el Mercado de Toyosu", desc: "Degusta donburi de sashimi fresco y tamagoyaki dulce recién hecho en los puestos del mercado.", loc: "Toyosu", tip: "Llega temprano para evitar las colas en las barras más cotizadas." },
          { time: "02:30 PM", slot: "afternoon", title: "Relajación en Onsen Tradicional Urbano", desc: "Sumérgete en aguas termales ricas en minerales para descansar el cuerpo de tantos kilómetros caminados.", loc: "Odaiba / Oedo", tip: "Verifica las políticas sobre tatuajes si tienes tinta visible." },
          { time: "08:00 PM", slot: "evening", title: "Cócteles en Terraza con Vista a la Torre de Tokio", desc: "Brindis final contemplando la torre iluminada como en una película de cine.", loc: "Torre de Tokio / Roppongi", tip: "La música ambiental y la vista nocturna son inmejorables para la foto grupal." }
        ]
      }
    ],
    packingTips: [
      "Calzado ultra cómodo para caminar (fácilmente caminarás 15,000 a 20,000 pasos al día).",
      "Calcetines limpios y sin agujeros (en muchos templos y restaurantes tendrás que descalzarte).",
      "Tarjeta Suica o Pasmo en tu Apple Wallet o Google Wallet para moverte en metro sin comprar boletos individuales.",
      "Bolsa pequeña para tu basura diaria (casi no hay botes de basura en las calles públicas de Tokio).",
      "Adaptador de corriente tipo A/B americano."
    ]
  },

  "Bali, Indonesia": {
    country: "Indonesia",
    image: "assets/hero.jpg",
    dailyBudget: { mochilero: 600, equilibrado: 1900, lujo: 6800 },
    summary: "Paraíso tropical entre arrozales esmeralda, templos en acantilados sobre el océano Índico, cascadas ocultas en la jungla, surf y la mejor cultura de clubes de playa.",
    highlights: ["Terrazas de Arroz de Tegallalang", "Templo Uluwatu & Danza Kecak", "Cascadas de Ubud", "Canggu Beach Clubs", "Nusa Penida Snorkel"],
    hotels: [
      { name: "The Farm Hostel Canggu", tier: "mochilero", price: 550, score: "9.5", desc: "Hostal de diseño rodeado de arrozales con 2 albercas enormes y ambiente inmejorable.", badge: "Top Social" },
      { name: "Adiwana Resort Jembawan Ubud", tier: "equilibrado", price: 2100, score: "9.7", desc: "Oasis de tranquilidad en el centro de Ubud con tratamientos de spa ayurveda y yoga matutino.", badge: "Paz & Bienestar" },
      { name: "Hanging Gardens of Bali", tier: "lujo", price: 8900, score: "9.9", desc: "Villas privadas suspendidas en el dosel de la jungla con la alberca infinita de 2 niveles más famosa del mundo.", badge: "Lujo Icónico" }
    ],
    foodSpots: [
      { name: "Warung Babi Guling Ibu Oka", type: "Cerdo Asado Balinés", price: "$", desc: "El plato más emblemático de Bali: cerdo crujiente sazonado con cúrcuma, hierba limón y jengibre." },
      { name: "Crate Cafe Canggu", type: "Brunch & Bowls", price: "$$", desc: "Açaí bowls gigantes, café tostado en la isla y aguacates frescos con vista a los campos de arroz." },
      { name: "La Brisa Beach Club", type: "Club de Playa & Pescados", price: "$$$", desc: "Construido con madera de barcos pesqueros reciclados, mariscos a la parrilla y atardecer mágico en Echo Beach." },
      { name: "Locavore NXT", type: "Cocina Balinesa de Vanguardia", price: "$$$$", desc: "Experiencia culinaria galardonada que utiliza exclusivamente ingredientes nativos de productores balineses." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Espiritualidad en Ubud y Bosque de los Monos",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Santuario Sagrado del Bosque de los Monos", desc: "Camina bajo árboles banianos centenarios mientras cientos de macacos conviven entre templos antiguos cubiertos de musgo.", loc: "Ubud", tip: "Guarda gafas de sol y botellas de agua dentro de tu mochila bien cerrada." },
          { time: "02:30 PM", slot: "afternoon", title: "Mercado de Arte Tradicional y Palacio de Ubud", desc: "Pasea por los callejones llenos de pareos de batik, bolsos de mimbre y tallas de madera hechas a mano.", loc: "Ubud Central", tip: "El regateo con sonrisa es parte de la cultura en los mercados de artesanías." },
          { time: "07:30 PM", slot: "evening", title: "Cena Balinesa y Masaje Tradicional", desc: "Termina el día con un masaje de tejido profundo con aceites de jazmín y frangipani.", loc: "Ubud", tip: "Los masajes en Bali son extremadamente accesibles y de altísima calidad." }
        ]
      },
      {
        day: 2,
        title: "Amanecer en Arrozales y Cascadas Salvajes",
        activities: [
          { time: "06:30 AM", slot: "morning", title: "Terrazas de Arroz de Tegallalang al Amanecer", desc: "Disfruta de la neblina matutina y los rayos dorados filtrándose entre las palmeras sin tumultos.", loc: "Tegallalang", tip: "Llega antes de las 7:30 AM para tener los senderos prácticamente para ti solo." },
          { time: "11:30 AM", slot: "afternoon", title: "Purificación en el Templo del Agua Tirta Empul", desc: "Participa en el ritual de purificación balinés sumergiéndote bajo los 12 manantiales sagrados.", loc: "Tampak Siring", tip: "Te prestarán un sarong verde especial para entrar al agua; no uses tu propia ropa de baño." },
          { time: "03:30 PM", slot: "afternoon", title: "Cascada Oculta Kanto Lampo", desc: "Trepa por las rocas escalonadas mientras el agua cae con fuerza creando una cortina natural.", loc: "Gianyar", tip: "Hay guías locales que te toman fotos épicas por una pequeña propina voluntaria." }
        ]
      },
      {
        day: 3,
        title: "Acantilados de Uluwatu, Surf y Danza del Fuego",
        activities: [
          { time: "11:00 AM", slot: "morning", title: "Playa Padang Padang y Relax en Arena Blanca", desc: "Desciende por la cueva de roca natural hacia una de las playas más bellas y famosas de Bali.", loc: "Península de Bukit", tip: "El oleaje es ideal para ver a surfistas profesionales en acción." },
          { time: "05:00 PM", slot: "afternoon", title: "Templo Uluwatu sobre el Acantilado", desc: "Templo sagrado construido a 70 metros sobre el romper de las olas del océano Índico.", loc: "Uluwatu", tip: "Consigue tus boletos para la Danza Kecak en cuanto llegues porque se agotan diario." },
          { time: "06:30 PM", slot: "evening", title: "Espectáculo de Danza Kecak al Atardecer", desc: "Coro hipnótico de 50 hombres mientras el sol desciende en el horizonte y se encienden las antorchas.", loc: "Anfiteatro de Uluwatu", tip: "Es uno de los espectáculos culturales más sobrecogedores de Asia." }
        ]
      },
      {
        day: 4,
        title: "Vibra Costera en Canggu, Cafés y Clubes de Playa",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Clase de Surf para Principiantes en Batu Bolong", desc: "Aprende a pararte en la tabla con instructores locales en una de las mejores rompientes del mundo.", loc: "Canggu Beach", tip: "Las olas son nobles y el fondo es de arena en la zona de novatos." },
          { time: "01:00 PM", slot: "afternoon", title: "Brunch Orgánico y Tour de Cafeterías Especiales", desc: "Soursop smoothies, huevos benedictinos sobre pan de masa madre y café frío cold brew.", loc: "Canggu", tip: "Canggu es la capital mundial de los nómadas digitales y la comida saludable." },
          { time: "05:30 PM", slot: "evening", title: "Fiesta y Atardecer en Finns Beach Club o La Brisa", desc: "Camas balinesas frente al mar, DJ en vivo, alberca y cócteles tropicales con amigos.", loc: "Berawa Beach", tip: "Llega antes de las 4 PM para asegurar un buen camastro con vista al mar." }
        ]
      },
      {
        day: 5,
        title: "Expedición a Nusa Penida: Manta Rays y Kelingking",
        activities: [
          { time: "07:30 AM", slot: "morning", title: "Lancha Rápida hacia la Isla de Nusa Penida", desc: "Cruce de 35 minutos desde el puerto de Sanur hacia las aguas turquesas de la isla vecina.", loc: "Sanur Port", tip: "Toma una pastilla contra el mareo si eres sensible al oleaje." },
          { time: "11:00 AM", slot: "afternoon", title: "Mirador de Kelingking Beach (El Tiranosaurio)", desc: "El acantilado con forma de dinosaurio que corona la playa virgen más fotografiada de Indonesia.", loc: "Nusa Penida", tip: "El descenso a la playa es empinado; si no tienes calzado adecuado, quédate en el mirador superior." },
          { time: "03:00 PM", slot: "afternoon", title: "Snorkel con Mantarrayas Gigantes en Manta Point", desc: "Nada junto a majestuosas mantas de hasta 4 metros de envergadura en aguas cristalinas.", loc: "Manta Point", tip: "Una experiencia pacífica e inolvidable para cerrar tu aventura en Bali." }
        ]
      }
    ],
    packingTips: [
      "Trajes de baño y licras de secado rápido.",
      "Zapatos de agua o escarpines para arrecifes y cascadas.",
      "Licencia de conducir internacional si planeas rentar scooter.",
      "Adaptador universal de corriente (clavijas redondas tipo C/F europeas).",
      "Bolsa impermeable para el celular en lanchas rápidas y cascadas."
    ]
  },

  "Roma, Italia": {
    country: "Italia",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    dailyBudget: { mochilero: 1100, equilibrado: 2900, lujo: 8200 },
    summary: "La Ciudad Eterna: un museo viviente donde cada esquina revela 2,500 años de grandeza imperial, fuentes barrocas, trattorias con cacio e pepe y gelato artesanal.",
    highlights: ["Coliseo & Foro Romano", "Fontana di Trevi & Panteón", "Trastevere de noche", "Vaticano & Capilla Sixtina", "Pasta & Gelato Tour"],
    hotels: [
      { name: "The RomeHello Hostel", tier: "mochilero", price: 900, score: "9.6", desc: "Hostel artístico a pasos de Termini con eventos nocturnos, bar propio y cuartos impecables.", badge: "Top Valoración" },
      { name: "Hotel Campo de' Fiori", tier: "equilibrado", price: 2900, score: "9.5", desc: "Encanto renacentista con terraza privada con vistas a los techos de teja de Roma.", badge: "Ubicación Soñada" },
      { name: "Hotel de Russie", tier: "lujo", price: 11500, score: "9.8", desc: "Elegancia pura cerca de Piazza del Popolo con jardines secretos y bar de celebridades.", badge: "Lujo Clásico" }
    ],
    foodSpots: [
      { name: "Da Enzo al 29 (Trastevere)", type: "Trattoria Tradicional", price: "$$", desc: "La mejor carbonara y flores de calabaza fritas con anchoa y mozzarella de búfala." },
      { name: "All'Antico Vinaio Roma", type: "Panini Toscano", price: "$", desc: "Focaccias rellenas al momento de porchetta, crema de pistacho y trufas." },
      { name: "Roscioli Salumeria con Cucina", type: "Gastronomía Selecta", price: "$$$", desc: "Templo del queso pecorino, embutidos curados y vinos italianos de pequeñas bodegas." },
      { name: "Frigidarium", type: "Gelatería Artesanal", price: "$", desc: "Gelato natural bañado en chocolate oscuro o blanco crujiente al instante sin costo extra." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Roma Imperial: Coliseo, Foros y Noche en Monti",
        activities: [
          { time: "09:00 AM", slot: "morning", title: "Coliseo Romano y Acceso a la Arena", desc: "Camina por donde luchaban gladiadores y emperadores hace dos milenios.", loc: "Piazza del Colosseo", tip: "Reserva boletos con entrada a la arena para saltarte las filas kilométricas." },
          { time: "02:00 PM", slot: "afternoon", title: "Foro Romano y Monte Palatino", desc: "Pasea entre las columnas del Senado, templos vestales y las ruinas de los palacios imperiales.", loc: "Foro Romano", tip: "Sube al Palatino para la mejor vista panorámica del Foro con el Coliseo al fondo." },
          { time: "07:30 PM", slot: "evening", title: "Aperitivo y Cena en el Barrio de Monti", desc: "Piazza della Madonna con una copa de Aperol Spritz rodeado de jóvenes romanos.", loc: "Rione Monti", tip: "Pide el supplì caliente (croqueta romana de arroz con mozzarella derretida)." }
        ]
      },
      {
        day: 2,
        title: "Barroco, Deseos en la Fuente y Callejuelas de Trastevere",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Fontana di Trevi y Panteón de Agripa", desc: "Lanza tu moneda de espaldas a la fuente para asegurar tu regreso a Roma y entra al domo abierto del Panteón.", loc: "Piazza di Trevi", tip: "Para ver la Fontana sin masas, visítala a las 7:30 AM." },
          { time: "02:00 PM", slot: "afternoon", title: "Piazza Navona y Gelato en Giolitti o Frigidarium", desc: "Adéntrate en la plaza de las tres fuentes de Bernini y deléitate con helado de pistacho siciliano.", loc: "Piazza Navona", tip: "Pide siempre 'con panna' (crema batida fresca encima)." },
          { time: "07:00 PM", slot: "evening", title: "Puente Sisto y Noche Bohemia en Trastevere", desc: "Cruza el río Tíber para perderte entre hiedras, faroles dorados, músicos callejeros y trattorias.", loc: "Trastevere", tip: "Llega antes de las 8:00 PM si quieres sentarte en Da Enzo sin esperar 1 hora." }
        ]
      },
      {
        day: 3,
        title: "Vaticano, Capilla Sixtina y Atardecer en Castel Sant'Angelo",
        activities: [
          { time: "08:30 AM", slot: "morning", title: "Museos Vaticanos y Capilla Sixtina", desc: "Admira la Creación de Adán y el Juicio Final de Miguel Ángel en persona.", loc: "Ciudad del Vaticano", tip: "Cubre hombros y rodillas; el código de vestimenta es estricto." },
          { time: "02:00 PM", slot: "afternoon", title: "Basílica de San Pedro y Subida a la Cúpula", desc: "La Piedad de Miguel Ángel y vistas de 360 grados de toda la ciudad de Roma.", loc: "Plaza de San Pedro", tip: "Subir los 551 escalones a la cúpula vale cada gota de sudor por la vista." },
          { time: "06:30 PM", slot: "evening", title: "Atardecer en el Puente de los Ángeles", desc: "Castel Sant'Angelo iluminado sobre el río Tíber con artistas tocando violín.", loc: "Ponte Sant'Angelo", tip: "La postal fotográfica definitiva de Roma al crepúsculo." }
        ]
      },
      {
        day: 4,
        title: "Plaza de España, Villa Borghese y Terraza del Pincio",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Escalinata de Piazza di Spagna y Via Condotti", desc: "Sube las míticas escaleras barrocas y recorre las vitrinas de alta costura.", loc: "Piazza di Spagna", tip: "Recuerda que está prohibido sentarse a comer en las escaleras para proteger el mármol." },
          { time: "02:30 PM", slot: "afternoon", title: "Jardines de Villa Borghese y Renta de Bicis", desc: "El gran pulmón verde de Roma con lago de botes de remos y fuentes de mármol.", loc: "Villa Borghese", tip: "Renta un carrito a pedales de 4 plazas para reírte a carcajadas con tus acompañantes." },
          { time: "06:30 PM", slot: "evening", title: "Puesta de Sol en la Terraza del Pincio", desc: "Vista icónica sobre Piazza del Popolo mientras el cielo tiñe la cúpula de San Pedro.", loc: "Terrazza del Pincio", tip: "Lleva una botella de vino y copas para brindar mientras cae la noche." }
        ]
      },
      {
        day: 5,
        title: "Barrio Judío, Catacumbas y Banquete de Cierre",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Ghetto Judío y Alcachofas a la Judía (Carciofi alla Giudia)", desc: "Uno de los rincones con más carácter de Roma. Prueba las alcachofas fritas crujientes como papas fritas.", loc: "Ghetto Ebraico", tip: "Pide el postre de ricotta y guindas en la pastelería Boccione." },
          { time: "02:30 PM", slot: "afternoon", title: "Vía Appia Antica y Catacumbas de San Calixto", desc: "Camina sobre los adoquines originales por donde entraban las legiones romanas.", loc: "Via Appia", tip: "Renta una bicicleta para recorrer los pinos milenarios de la calzada." },
          { time: "08:00 PM", slot: "evening", title: "Gran Banquete de Pasta en Roscioli", desc: "El mejor Cacio e Pepe y Amatriciana de tu existencia, maridado con Chianti Clásico.", loc: "Via dei Giubbonari", tip: "Pide de entrada la burrata fresca con anchoas del Cantábrico." }
        ]
      }
    ],
    packingTips: [
      "Zapatos con suela acolchonada para caminar sobre los 'sampietrini' (adoquines romanos).",
      "Ropa respetuosa (hombros y rodillas cubiertos) para entrar al Vaticano y basílicas.",
      "Botella de agua recargable (hay más de 2,500 fuentes públicas de agua potable fresca 'nasoni' en Roma).",
      "Monedero seguro / cangurera discreta para el metro y zonas concurridas.",
      "Adaptador de corriente tipo C o L italiano."
    ]
  },

  "Nueva York, EE. UU.": {
    country: "Estados Unidos",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    dailyBudget: { mochilero: 1400, equilibrado: 3800, lujo: 11000 },
    summary: "La capital del mundo: energía vertiginosa entre rascacielos legendarios, musicales de Broadway, museos de clase mundial, gastronomía de todas las naciones y Central Park.",
    highlights: ["Central Park en bici", "Miradores SUMMIT / Edge", "Broadway & Times Square", "Brooklyn Bridge & DUMBO", "Chelsea Market & High Line"],
    hotels: [
      { name: "Pod 51 / Pod Times Square", tier: "mochilero", price: 1600, score: "9.1", desc: "Habitaciones micro de diseño moderno en Midtown con terraza y ambiente joven.", badge: "Económico Midtown" },
      { name: "Arlo SoHo / Arlo NoMad", tier: "equilibrado", price: 3900, score: "9.5", desc: "Hotel boutique con rooftop bar con suelo de cristal sobre Manhattan y estética industrial.", badge: "Vistas & Estilo" },
      { name: "The Plaza Hotel / 1 Hotel Central Park", tier: "lujo", price: 14500, score: "9.9", desc: "Lujo legendario frente a Central Park con servicio de cinco estrellas y restaurantes icónicos.", badge: "Leyenda Neoyorquina" }
    ],
    foodSpots: [
      { name: "Joe's Pizza (Greenwich Village)", type: "Slice Clásica NY", price: "$", desc: "La rebanada de queso neoyorquina más perfecta y crujiente de la ciudad desde 1975." },
      { name: "Katz's Delicatessen", type: "Deli Judío Legendario", price: "$$", desc: "El sándwich de pastrami más famoso del mundo: carne jugosa cortada a mano con mostaza spicy." },
      { name: "Chelsea Market (Los Tacos No.1 / Lobster)", type: "Mercado Gastronómico", price: "$$", desc: "Antigua fábrica de galletas Oreo convertida en meca gastronómica con tacos de adobada y rollos de langosta." },
      { name: "Peak NYC / Overstory", type: "Rooftop & Coctelería de Altura", price: "$$$$", desc: "Tragos de autor en el piso 101 contemplando la ciudad iluminada como una galaxia." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Midtown, Luces de Times Square y Mirador del Futuro",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Grand Central Terminal y Biblioteca Pública", desc: "Maravíllate con el techo astronómico de la estación y la sala de lectura Rose Main Reading Room.", loc: "42nd Street", tip: "Prueba la 'Galería de los Susurros' frente al Oyster Bar en la terminal." },
          { time: "02:30 PM", slot: "afternoon", title: "Experiencia Inmersiva en SUMMIT One Vanderbilt", desc: "Salas de espejos en las alturas, globos plateados flotantes y vista directa al Empire State.", loc: "Midtown East", tip: "Lleva gafas de sol; el reflejo del sol en los espejos de cristal es muy intenso." },
          { time: "08:00 PM", slot: "evening", title: "Cena y Neones en Times Square", desc: "Siente el rugido de la Gran Manzana rodeado de las pantallas gigantes más luminosas del mundo.", loc: "Times Square / Broadway", tip: "Compra boletos 'Rush' o en la taquilla TKTS para ver un musical de Broadway a mitad de precio." }
        ]
      },
      {
        day: 2,
        title: "Parque Elevado High Line, Arte en Chelsea y Atardecer en West Village",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Paseo por The High Line y The Vessel", desc: "Camina por la antigua vía de tren elevada convertida en parque botánico con vista al río Hudson.", loc: "Hudson Yards a Chelsea", tip: "Comienza en Hudson Yards y camina hacia el sur en dirección a Chelsea." },
          { time: "01:30 PM", slot: "afternoon", title: "Almuerzo en Chelsea Market y Muelle Little Island", desc: "Prueba rollos de langosta de Maine y visita el nuevo parque flotante sobre pilotes en forma de tulipán.", loc: "Meatpacking District", tip: "Los helados de Ample Hills adentro del mercado son irresistibles." },
          { time: "07:00 PM", slot: "evening", title: "Paseo por las casas victorianas de Greenwich Village & Jazz", desc: "Calles arboladas, la casa de 'Friends' y una sesión íntima de jazz en vivo en el mítico Blue Note.", loc: "Greenwich Village", tip: "Reserva mesa para el primer set de jazz de las 8:00 PM." }
        ]
      },
      {
        day: 3,
        title: "Puente de Brooklyn, DUMBO y Skyline al Crepúsculo",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Caminar por el Puente de Brooklyn", desc: "Cruza las pasarelas de madera y los arcos góticos sobre el East River con vistas al distrito financiero.", loc: "Brooklyn Bridge", tip: "Cruza desde Manhattan hacia Brooklyn para tener la vista de DUMBO esperándote." },
          { time: "01:00 PM", slot: "afternoon", title: "Foto Clásica en Washington St & Pizza en Grimaldi's", desc: "La icónica foto con el Empire State enmarcado por las patas del Manhattan Bridge.", loc: "DUMBO Brooklyn", tip: "Camina por el parque Brooklyn Bridge Park hasta los muelles 'Piers' para tumbarte en el pasto." },
          { time: "07:30 PM", slot: "evening", title: "Rooftop con Vista al Skyline de Manhattan", desc: "Contempla los rascacielos encenderse con una copa en Time Out Market Rooftop o 1 Hotel Brooklyn Bridge.", loc: "Brooklyn Heights", tip: "La mejor vista del mundo de la silueta nocturna de Manhattan." }
        ]
      },
      {
        day: 4,
        title: "Central Park en Bici y Museo MET de Arte",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Renta de Bicis en Central Park", desc: "Pedalea por Bow Bridge, Bethesda Terrace, Strawberry Fields (John Lennon) y el embalse Jacqueline Kennedy.", loc: "Central Park", tip: "Compra una caja de galletas de Levain Bakery antes de entrar para hacer picnic." },
          { time: "02:00 PM", slot: "afternoon", title: "Museo Metropolitano de Arte (MET)", desc: "El templo egipcio de Dendur, salas de pintura europea y azotea con escultura moderna.", loc: "Upper East Side", tip: "Con tu boleto puedes subir al 'Roof Garden' del MET con vista a las copas de los árboles." },
          { time: "08:00 PM", slot: "evening", title: "Sándwich de Pastrami en Katz's Delicatessen", desc: "Siéntate en las mesas históricas del Lower East Side y disfruta una montaña de pastrami ahumado.", loc: "Lower East Side", tip: "¡No pierdas tu ticket de papel pequeño que te dan en la entrada! Lo necesitas para pagar al salir." }
        ]
      },
      {
        day: 5,
        title: "Estatua de la Libertad, SoHo de Compras y Fiesta en Rooftop",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Ferry Gratuito de Staten Island y Memorial 9/11", desc: "Vistas espectaculares y gratuitas de la Estatua de la Libertad y los rascacielos de Wall Street desde el agua.", loc: "Battery Park", tip: "El ferry de Staten Island es 100% gratis y sale cada 30 minutos sin reservación." },
          { time: "02:30 PM", slot: "afternoon", title: "Compras y Fachadas de Hierro en SoHo", desc: "Las calles adoquinadas más chic con boutiques de diseñadores independientes y galerías.", loc: "SoHo", tip: "Entra a las tiendas de diseño en Greene Street y Prince Street." },
          { time: "08:30 PM", slot: "evening", title: "Noche de Despedida: Rooftop Party en 230 Fifth o Le Bain", desc: "Cócteles bajo mantas calientes o pistas de baile con vistas épicas para cerrar el viaje a lo grande.", loc: "Flatiron / Meatpacking", tip: "Lleva vestimenta elegante casual (Smart casual) para evitar problemas en puerta." }
        ]
      }
    ],
    packingTips: [
      "Calzado extremadamente cómodo y con soporte (caminarás hasta 25,000 pasos diarios).",
      "Batería externa portátil para tu celular (los mapas, fotos y tickets consumen batería rápido).",
      "Tarjeta contactless lista para usar OMNY en los torniquetes del metro.",
      "Abrigo adecuado según la época (el invierno en Manhattan es helado con viento; el verano es caluroso y húmedo).",
      "Gafas de sol para los miradores de cristal."
    ]
  },

  "Medellín, Colombia": {
    country: "Colombia",
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80",
    dailyBudget: { mochilero: 600, equilibrado: 1700, lujo: 5200 },
    summary: "La Ciudad de la Eterna Primavera: rodeada de montañas verdes, transformación social vibrante en la Comuna 13, rooftops en El Poblado, café suave y la calidez inigualable de los paisas.",
    highlights: ["Comuna 13 & Graffitour", "Guatapé & El Peñol", "Provenza & Parque Lleras", "Metrocable Arví", "Café de Especialidad"],
    hotels: [
      { name: "Los Patios Hostel Boutique", tier: "mochilero", price: 550, score: "9.6", desc: "Galardonado como uno de los mejores hostales del mundo con rooftop pool, gimnasio y eventos diarios.", badge: "Top Mundial" },
      { name: "The Click Clack Hotel Medellín", tier: "equilibrado", price: 1900, score: "9.5", desc: "Diseño vanguardista rodeado de vegetación tropical en el corazón de El Poblado.", badge: "Estilo & Ubicación" },
      { name: "The Charlee Hotel", tier: "lujo", price: 5400, score: "9.8", desc: "Habitaciones de lujo con jacuzzi privado en terraza con vista al parque y lounge Envy en la azotea.", badge: "Lujo & Vida Nocturna" }
    ],
    foodSpots: [
      { name: "Mondongo's El Poblado", type: "Comida Paisa Tradicional", price: "$$", desc: "Bandeja paisa monumental con chicharrón crujiente de 100 patas, aguacate, plátano maduro y arepa." },
      { name: "Carmen Medellín", type: "Alta Cocina Contemporánea", price: "$$$", desc: "Técnicas modernas aplicadas a la biodiversidad marina y selvática colombiana en un patio mágico." },
      { name: "Café Pergamino", type: "Café de Especialidad", price: "$", desc: "Pioneros del café especial en Provenza; filtrados V60 y Chemex cultivados en fincas familiares de Antioquia." },
      { name: "Envy Rooftop", type: "Coctelería & Fiesta", price: "$$$", desc: "Alberca transparente, DJs internacionales y los mejores cócteles con vista nocturna a Medellín." }
    ],
    timelineDays: [
      {
        day: 1,
        title: "Llegada, El Poblado y Noche en Provenza",
        activities: [
          { time: "11:00 AM", slot: "morning", title: "Café de Especialidad y Caminata por Provenza", desc: "Calles arboladas llenas de riachuelos naturales, boutiques de diseño y cafés al aire libre.", loc: "Provenza / El Poblado", tip: "Pide un café filtrado con notas a maracuyá y panela en Pergamino." },
          { time: "02:00 PM", slot: "afternoon", title: "Bandeja Paisa Tradicional en Mondongo's", desc: "Frijoles cargamanto en cazuela, carne molida, chicharrón extra crujiente y huevo frito.", loc: "Calle 10", tip: "¡Llega con mucho apetito porque las porciones son gigantes!" },
          { time: "08:00 PM", slot: "evening", title: "Rooftop Bar y Música en Vivo", desc: "Brindis con amigos en terrazas con alberca y vista panorámica a las luces del valle de Aburrá.", loc: "Envy Rooftop / Click Clack", tip: "La vida nocturna en Provenza de jueves a sábado es de las mejores de Latinoamérica." }
        ]
      },
      {
        day: 2,
        title: "Transformación Social en Comuna 13 y Metrocable",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Graffitour y Escaleras Eléctricas de Comuna 13", desc: "Conoce la historia de resiliencia guiado por artistas locales con muestras de hip-hop y breakdance.", loc: "Comuna 13", tip: "Toma el tour con un guía nacido en la comuna para apoyar directamente a la comunidad." },
          { time: "01:30 PM", slot: "afternoon", title: "Helados Artesanales de Mango Biche y Empanadas", desc: "Prueba las paletas de mango con limón y sal mientras contemplas los murales gigantes.", loc: "San Javier", tip: "Las empanaditas de papa y carne recién salidas con ají son una delicia." },
          { time: "04:30 PM", slot: "afternoon", title: "Vuelo en Metrocable hasta Parque Arví", desc: "El sistema de transporte público por teleférico que cruza sobre las colinas hasta el bosque de niebla.", loc: "Estación Acevedo / Santo Domingo", tip: "El trayecto en cabina ofrece una de las vistas aéreas más impresionantes de Medellín." }
        ]
      },
      {
        day: 3,
        title: "Día Mágico en Guatapé y Piedra del Peñol",
        activities: [
          { time: "07:30 AM", slot: "morning", title: "Salida hacia la Piedra del Peñol", desc: "El monolito colosal de 220 metros de altura que domina la represa de islas verdes.", loc: "Guatapé, Antioquia", tip: "Sube con calma los 740 escalones; arriba hay puestos con micheladas de mango y vistas paradisíacas." },
          { time: "01:00 PM", slot: "afternoon", title: "Almuerzo de Trucha y Calles de los Zócalos", desc: "Pasea por el pueblo más colorido de Colombia con zócalos tallados en cada casa que cuentan oficios e historias.", loc: "Pueblo de Guatapé", tip: "Siéntate en la Plazoleta de los Zócalos con un café recién molido." },
          { time: "04:00 PM", slot: "afternoon", title: "Paseo en Lancha o Moto Acuática por el Embalse", desc: "Navega entre las islas y contempla las antiguas propiedades campestres desde el agua.", loc: "Represa de Guatapé", tip: "El clima suele ser templado y agradable para navegar." }
        ]
      },
      {
        day: 4,
        title: "Arte de Botero, Centro Histórico y Finca Cafetera",
        activities: [
          { time: "09:30 AM", slot: "morning", title: "Plaza Botero y Museo de Antioquia", desc: "Camina entre 23 esculturas monumentales de bronce donadas por el maestro Fernando Botero.", loc: "Centro de Medellín", tip: "Cuida tus pertenencias en el centro y muévete por las calles peatonales concurridas." },
          { time: "02:00 PM", slot: "afternoon", title: "Visita a Finca Cafetera Tradicional", desc: "Aprende el proceso de recolección de granos maduros, despulpado, secado y tostión artesanal.", loc: "Sabaneta / Fredonia", tip: "Tendrás la oportunidad de recolectar café con el canasto tradicional en la cintura." },
          { time: "07:30 PM", slot: "evening", title: "Cena en Carmen o Alambique", desc: "Cena en un restaurante escondido en un segundo piso lleno de plantas, antigüedades y platillos creativos.", loc: "El Poblado", tip: "Prueba el lomo de res marinado en café y panela con puré de yuca." }
        ]
      },
      {
        day: 5,
        title: "Jardín Botánico, Cacao & Noche de Despedida con Salsa",
        activities: [
          { time: "10:00 AM", slot: "morning", title: "Jardín Botánico y Orquideorama", desc: "Estructura arquitectónica de madera rodeada de orquídeas nativas e iguanas libres en los jardines.", loc: "Zona Norte", tip: "El restaurante In Situ dentro del jardín es perfecto para un almuerzo fresco rodeado de verde." },
          { time: "03:00 PM", slot: "afternoon", title: "Mercados de Artesanías y Dulces Paisas", desc: "Lleva recuerdos de viaje: café empacado al vacío, arequipe artesanal y sombreros aguadeños.", loc: "Mercado del Río", tip: "Mercado del Río tiene más de 30 opciones gastronómicas gourmet bajo el mismo techo." },
          { time: "09:00 PM", slot: "evening", title: "Noche de Salsa en Son Havana o Tibiri Bar", desc: "Aprende pasos básicos de salsa y baila con música en vivo para despedirte con toda la energía paisa.", loc: "La 70 / Laureles", tip: "La calidez de la gente local te hará sentir como en casa desde el primer minuto." }
        ]
      }
    ],
    packingTips: [
      "Ropa versátil 'clima de primavera' (hace calor agradable de día, refresca con brisa en la noche).",
      "Calzado cómodo para subir la piedra de Guatapé y caminar la Comuna 13.",
      "Paraguas compacto o impermeable ligero (en la tarde puede caer una lluvia tropical rápida).",
      "Efectivo en pesos colombianos (COP) para Guatapé y puestos callejeros.",
      "Gafas de sol y gorra."
    ]
  }
};

// ==========================================
// 5. GENERIC DYNAMIC ITINERARY SYNTHESIZER
// (If user types any other city in the world)
// ==========================================
function synthesizeCustomDestination(cityName, days, company, budgetTier, interests) {
  const baseCost = budgetTier === 'mochilero' ? 700 : budgetTier === 'lujo' ? 5500 : 2100;
  
  // Custom activities generated dynamically according to interests
  const activitiesByInterest = {
    gastronomia: [
      { title: `Tour de Sabores Locales y Mercados en ${cityName}`, desc: "Degustación de especialidades locales, puestos de comida callejera auténtica y dulces tradicionales.", tip: "Pregunta a los vendedores cuál es el plato de temporada." },
      { title: `Cena en Restaurante Emblemático de ${cityName}`, desc: "Disfruta de la gastronomía más destacada de la región en un restaurante con excelente reputación.", tip: "Reserva con antelación si viajas en fin de semana." }
    ],
    aventura: [
      { title: `Excursión Panorámica y Senderismo en los alrededores de ${cityName}`, desc: "Explora rutas escénicas en la naturaleza, miradores naturales y vistas privilegiadas.", tip: "Lleva calzado adecuado y suficiente agua." },
      { title: `Actividad de Aventura al Aire Libre`, desc: "Experiencia de adrenalina (kayak, tirolesa, paseo en bici o lancha) adaptada a tu grupo.", tip: "Sigue las recomendaciones del guía local." }
    ],
    cultura: [
      { title: `Recorrido Histórico por el Casco Antiguo de ${cityName}`, desc: "Monumentos icónicos, plazas principales, arquitectura histórica y templos centenarios.", tip: "Inicia temprano para disfrutar de las calles con menos gente." },
      { title: `Visita a Museos y Galerías de Arte`, desc: "Conoce las colecciones artísticas y el legado cultural que distingue a esta ciudad.", tip: "Verifica si hay días de entrada libre o descuentos para estudiantes." }
    ],
    relax: [
      { title: `Día de Descanso, Spa o Playa/Parques en ${cityName}`, desc: "Desconecta del ritmo diario con una mañana tranquila en jardines, playas o baños termales.", tip: "Apaga las notificaciones del móvil durante la mañana." },
      { title: `Atardecer Relajante en Terraza con Vista`, desc: "Disfruta de una bebida refrescante mientras observas la puesta de sol sobre el horizonte.", tip: "Llega 30 minutos antes para tener los mejores asientos." }
    ],
    fiesta: [
      { title: `Ruta de Coctelería y Bares Secretos en ${cityName}`, desc: "Ambiente vibrante, coctelería de autor y música en vivo para convivir y divertirse.", tip: "Viste casual elegante para no tener inconvenientes en la entrada." }
    ],
    fotografia: [
      { title: `Safari Fotográfico en los Rincones más Fotogénicos de ${cityName}`, desc: "Miradores de postal, callejones con encanto y spots únicos para tus fotos de recuerdo.", tip: "La hora dorada (1 hora antes de ocultarse el sol) ofrece la mejor luz." }
    ]
  };

  const daysTimeline = [];
  for (let d = 1; d <= days; d++) {
    const dayInterests = interests.length > 0 ? interests : ["cultura", "gastronomia", "relax"];
    const chosenInterest = dayInterests[(d - 1) % dayInterests.length];
    const actPool = activitiesByInterest[chosenInterest] || activitiesByInterest.cultura;
    
    daysTimeline.push({
      day: d,
      title: `Día ${d}: Descubrimiento de ${cityName} (${capitalize(chosenInterest)})`,
      activities: [
        {
          time: "09:30 AM",
          slot: "morning",
          title: `Paseo Matutino e Iconos de ${cityName}`,
          desc: `Comienza explorando el corazón de ${cityName}, sus avenidas principales y monumentos más emblemáticos.`,
          loc: `Centro de ${cityName}`,
          tip: "Comienza temprano para aprovechar al máximo las horas de luz y evitar filas."
        },
        {
          time: "02:30 PM",
          slot: "afternoon",
          title: actPool[0]?.title || `Almuerzo Típico y Experiencia Cultural`,
          desc: actPool[0]?.desc || `Saborea la comida típica y camina por los barrios con más encanto de ${cityName}.`,
          loc: `${cityName}`,
          tip: actPool[0]?.tip || "Pide sugerencias al camarero sobre el plato del día."
        },
        {
          time: "07:30 PM",
          slot: "evening",
          title: actPool[1]?.title || `Cena y Velada con Encanto`,
          desc: actPool[1]?.desc || `Cena relajada con vista nocturna para cerrar el día con broche de oro.`,
          loc: `${cityName}`,
          tip: actPool[1]?.tip || "Prueba una bebida típica de la región."
        }
      ]
    });
  }

  return {
    country: "Destino Global",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    dailyBudget: { mochilero: baseCost, equilibrado: baseCost, lujo: baseCost },
    summary: `Un itinerario 100% a tu medida en ${cityName}: optimizado para viajar ${companyLabel(company)}, con presupuesto ${budgetLabel(budgetTier)} e intereses en ${interests.join(", ")}.`,
    highlights: [`Exploración en ${cityName}`, "Gastronomía Auténtica", "Rutas sin Trampas", "Atardeceres Únicos"],
    hotels: [
      { name: `Hostel Boutique Central ${cityName}`, tier: "mochilero", price: Math.round(baseCost * 0.45), score: "9.2", desc: "Excelente ubicación para moverte a pie, limpio, seguro y con excelente ambiente para viajeros.", badge: "Opción Económica" },
      { name: `Hotel & Suites Gran ${cityName}`, tier: "equilibrado", price: Math.round(baseCost * 1.1), score: "9.6", desc: "Habitaciones amplias con desayuno buffet incluido, atención personalizada y terraza.", badge: "Mejor Calidad-Precio" },
      { name: `Resort & Spa Palacio Real ${cityName}`, tier: "lujo", price: Math.round(baseCost * 3.2), score: "9.9", desc: "Servicio 5 estrellas, concierge privado para reservas VIP y amenidades de máxima gama.", badge: "Lujo & Confort" }
    ],
    foodSpots: [
      { name: `Mercado Central de ${cityName}`, type: "Mercado Tradicional", price: "$$", desc: "El lugar perfecto para probar los platillos más frescos y representativos a precios justos." },
      { name: `Bistró & Taberna Las Luces`, type: "Cocina Local", price: "$$$", desc: "Ambiente cálido con excelente carta de vinos y especialidades de la región." },
      { name: `Rooftop Mirador ${cityName}`, type: "Terraza & Cócteles", price: "$$$", desc: "Vistas panorámicas a la ciudad iluminada y aperitivos de autor." }
    ],
    timelineDays: daysTimeline,
    packingTips: [
      `Calzado cómodo para caminatas largas en ${cityName}.`,
      "Cargador portátil y adaptador internacional de clavija.",
      "Documentos esenciales de viaje y pasaporte con copia digital.",
      "Chamarra ligera para cambios de clima.",
      "Botella de agua reutilizable."
    ]
  };
}

// Helpers
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function companyLabel(code) {
  const map = { solo: "en solitario", pareja: "en pareja", amigos: "con amigos", familia: "en familia" };
  return map[code] || "con amigos";
}

function budgetLabel(code) {
  const map = { mochilero: "mochilero / económico", equilibrado: "equilibrado / confort", lujo: "de lujo" };
  return map[code] || "equilibrado";
}

// ==========================================
// 6. INITIALIZATION & DOM EVENTS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  updateBudgetSimulation();
  checkUrlParamsForDirectTrip();
});

function initEventListeners() {
  // Currency Selector
  const currencySelect = document.getElementById("currency-select");
  if (currencySelect) {
    currencySelect.addEventListener("change", (e) => {
      appState.currency = e.target.value;
      playUiSound('select');
      updateAllPricesUI();
      showToast(`Divisa cambiada a ${appState.currency}`, 'info');
    });
  }

  // Audio Toggle Button
  const soundBtn = document.getElementById("sound-toggle-btn");
  const soundIcon = document.getElementById("sound-icon");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      appState.soundEnabled = !appState.soundEnabled;
      if (soundIcon) {
        soundIcon.className = appState.soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
      }
      if (appState.soundEnabled) playUiSound('click');
      showToast(appState.soundEnabled ? "Sonido activado 🔊" : "Sonido silenciado 🔇", 'info');
    });
  }

  // Quick Search Box (Hero)
  const quickStartBtn = document.getElementById("quick-start-btn");
  const quickDestInput = document.getElementById("quick-dest-input");
  const quickDropdown = document.getElementById("quick-dest-dropdown");
  const quickCompany = document.getElementById("quick-company-select");
  const quickBudget = document.getElementById("quick-budget-select");

  if (quickStartBtn) {
    quickStartBtn.addEventListener("click", () => {
      playUiSound('click');
      if (quickDestInput && quickDestInput.value.trim()) {
        appState.destination = quickDestInput.value.trim();
        const mainDestInput = document.getElementById("destination-input");
        if (mainDestInput) mainDestInput.value = appState.destination;
      }
      if (quickCompany) appState.company = quickCompany.value;
      if (quickBudget) appState.budgetTier = quickBudget.value;
      syncWizardUIWithState();

      // Smooth scroll to wizard
      document.getElementById("wizard-section")?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Quick Dest Input Autocomplete
  if (quickDestInput && quickDropdown) {
    quickDestInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase().trim();
      if (val.length < 1) {
        quickDropdown.classList.remove("active");
        return;
      }
      const matches = Object.keys(DESTINATIONS_DB).filter(d => d.toLowerCase().includes(val));
      if (matches.length > 0) {
        quickDropdown.innerHTML = matches.map(city => `
          <div class="quick-dropdown-item" data-city="${city}">
            <i class="fa-solid fa-location-dot"></i>
            <span>${city}</span>
          </div>
        `).join("");
        quickDropdown.classList.add("active");
      } else {
        quickDropdown.classList.remove("active");
      }
    });

    quickDropdown.addEventListener("click", (e) => {
      const item = e.target.closest(".quick-dropdown-item");
      if (item) {
        const city = item.getAttribute("data-city");
        quickDestInput.value = city;
        quickDropdown.classList.remove("active");
        playUiSound('click');
      }
    });

    document.addEventListener("click", (e) => {
      if (!quickDestInput.contains(e.target) && !quickDropdown.contains(e.target)) {
        quickDropdown.classList.remove("active");
      }
    });
  }

  // Trending destination chips in Hero
  document.querySelectorAll(".floating-chips-row .tag-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const dest = chip.getAttribute("data-dest");
      if (!dest) return;
      playUiSound('select');
      appState.destination = dest;
      const mainDest = document.getElementById("destination-input");
      if (mainDest) mainDest.value = dest;
      document.querySelectorAll(".floating-chips-row .tag-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      showToast(`Destino fijado: ${dest}`, 'info');
    });
  });

  // Surprise Random Destination Button
  const heroRandomBtn = document.getElementById("hero-random-btn");
  if (heroRandomBtn) {
    heroRandomBtn.addEventListener("click", () => {
      playUiSound('success');
      const cities = ["Oaxaca, México", "Tokio, Japón", "Bali, Indonesia", "Roma, Italia", "Nueva York, EE. UU.", "Medellín, Colombia"];
      const chosen = cities[Math.floor(Math.random() * cities.length)];
      appState.destination = chosen;
      const mainDest = document.getElementById("destination-input");
      const quickDest = document.getElementById("quick-dest-input");
      if (mainDest) mainDest.value = chosen;
      if (quickDest) quickDest.value = chosen;
      document.querySelectorAll(".floating-chips-row .tag-chip").forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-dest") === chosen);
      });
      showToast(`¡Destino sorpresa: ${chosen}! 🎲✨`, 'success');
      document.getElementById("wizard-section")?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // WIZARD CONTROLS: Next / Prev
  const nextBtn = document.getElementById("wizard-next-btn");
  const prevBtn = document.getElementById("wizard-prev-btn");
  const generateBtn = document.getElementById("wizard-generate-btn");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (validateCurrentStep()) {
        goToStep(appState.currentStep + 1);
        playUiSound('click');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (appState.currentStep > 1) {
        goToStep(appState.currentStep - 1);
        playUiSound('click');
      }
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      playUiSound('click');
      triggerAIGeneration();
    });
  }

  // Wizard Step Click (Direct navigation)
  document.querySelectorAll(".wizard-progress-bar .progress-step").forEach(stepEl => {
    stepEl.addEventListener("click", () => {
      const targetStep = parseInt(stepEl.getAttribute("data-step"), 10);
      if (targetStep < appState.currentStep || validateCurrentStep()) {
        goToStep(targetStep);
        playUiSound('click');
      }
    });
  });

  // STEP 1: Destination Autocomplete & Popular Cards
  const destInput = document.getElementById("destination-input");
  const clearDestBtn = document.getElementById("clear-dest-btn");
  const destAutocomplete = document.getElementById("dest-autocomplete");

  if (destInput && destAutocomplete) {
    destInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase().trim();
      clearDestBtn.classList.toggle("hidden", val.length === 0);
      
      if (val.length < 1) {
        destAutocomplete.classList.remove("active");
        return;
      }
      const matches = Object.keys(DESTINATIONS_DB).filter(d => d.toLowerCase().includes(val));
      if (matches.length > 0) {
        destAutocomplete.innerHTML = matches.map(city => `
          <div class="autocomplete-item" data-city="${city}">
            <div><i class="fa-solid fa-location-dot gradient-icon"></i> <strong>${city}</strong></div>
            <span class="badge-pill">${DESTINATIONS_DB[city].country}</span>
          </div>
        `).join("");
        destAutocomplete.classList.add("active");
      } else {
        destAutocomplete.classList.remove("active");
      }
    });

    destAutocomplete.addEventListener("click", (e) => {
      const item = e.target.closest(".autocomplete-item");
      if (item) {
        const city = item.getAttribute("data-city");
        destInput.value = city;
        appState.destination = city;
        destAutocomplete.classList.remove("active");
        clearDestBtn.classList.remove("hidden");
        playUiSound('select');
        highlightPopularCardIfMatches(city);
      }
    });

    if (clearDestBtn) {
      clearDestBtn.addEventListener("click", () => {
        destInput.value = "";
        clearDestBtn.classList.add("hidden");
        destAutocomplete.classList.remove("active");
        destInput.focus();
      });
    }
  }

  // Popular Cards in Step 1
  document.querySelectorAll(".popular-dest-grid .popular-card").forEach(card => {
    card.addEventListener("click", () => {
      playUiSound('select');
      document.querySelectorAll(".popular-dest-grid .popular-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const city = card.getAttribute("data-city");
      appState.destination = city;
      if (destInput) {
        destInput.value = city;
        clearDestBtn.classList.remove("hidden");
      }
    });
  });

  // STEP 2: Company Selection
  document.querySelectorAll(".company-grid .option-card").forEach(card => {
    card.addEventListener("click", () => {
      playUiSound('select');
      document.querySelectorAll(".company-grid .option-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      appState.company = card.getAttribute("data-value");
      updateBudgetSimulation();
    });
  });

  // STEP 3: Duration Presets & Range Slider
  const daysSlider = document.getElementById("days-slider");
  const daysDisplay = document.getElementById("days-display");

  document.querySelectorAll(".duration-presets .duration-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playUiSound('select');
      document.querySelectorAll(".duration-presets .duration-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const days = parseInt(btn.getAttribute("data-days"), 10);
      appState.days = days;
      if (daysSlider) daysSlider.value = days;
      if (daysDisplay) daysDisplay.textContent = `${days} días de viaje`;
      updateBudgetSimulation();
    });
  });

  if (daysSlider) {
    daysSlider.addEventListener("input", (e) => {
      const days = parseInt(e.target.value, 10);
      appState.days = days;
      if (daysDisplay) daysDisplay.textContent = `${days} días de viaje`;
      document.querySelectorAll(".duration-presets .duration-btn").forEach(b => {
        b.classList.toggle("active", parseInt(b.getAttribute("data-days"), 10) === days);
      });
      updateBudgetSimulation();
    });
  }

  // Season chips
  document.querySelectorAll(".season-chips .season-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      playUiSound('select');
      document.querySelectorAll(".season-chips .season-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      appState.season = chip.getAttribute("data-season");
    });
  });

  // STEP 4: Budget Tiers
  document.querySelectorAll(".budget-tiers-grid .budget-card").forEach(card => {
    card.addEventListener("click", () => {
      playUiSound('select');
      document.querySelectorAll(".budget-tiers-grid .budget-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      appState.budgetTier = card.getAttribute("data-tier");
      updateBudgetSimulation();
    });
  });

  // STEP 5: Interests Multi-select Chips
  document.querySelectorAll("#interests-grid .interest-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      playUiSound('select');
      chip.classList.toggle("selected");
      const interest = chip.getAttribute("data-interest");
      if (chip.classList.contains("selected")) {
        if (!appState.interests.includes(interest)) appState.interests.push(interest);
      } else {
        appState.interests = appState.interests.filter(i => i !== interest);
      }
    });
  });

  // Special Notes input
  const specialNotesInput = document.getElementById("special-notes-input");
  if (specialNotesInput) {
    specialNotesInput.addEventListener("input", (e) => {
      appState.specialNotes = e.target.value.trim();
    });
  }

  // Showcase Destination Filter Tabs
  document.querySelectorAll("#dest-filter-buttons .filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      playUiSound('click');
      document.querySelectorAll("#dest-filter-buttons .filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");

      document.querySelectorAll("#showcase-grid .dest-showcase-card").forEach(card => {
        const cat = card.getAttribute("data-category") || "";
        if (filter === "all" || cat.includes(filter)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Result Tabs (Timeline, Hotels, Food, Budget, Packing)
  document.querySelectorAll(".itinerary-tabs-bar .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playUiSound('click');
      document.querySelectorAll(".itinerary-tabs-bar .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.querySelectorAll(".itinerary-tab-pane").forEach(pane => pane.classList.remove("active"));
      document.getElementById(targetId)?.classList.add("active");
    });
  });

  // Action buttons in Itinerary Header
  const printBtn = document.getElementById("btn-print-pdf");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      if (appState.generatedPlan) {
        displayAllDays(appState.generatedPlan);
      }
      setTimeout(() => {
        window.print();
      }, 250);
    });
  }

  const exportIcsBtn = document.getElementById("btn-export-ics");
  if (exportIcsBtn) {
    exportIcsBtn.addEventListener("click", () => {
      exportPlanToIcs(appState.generatedPlan || DESTINATIONS_DB[appState.destination]);
    });
  }

  const shareWhatsappBtn = document.getElementById("btn-share-whatsapp");
  if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener("click", () => {
      shareOnWhatsApp();
    });
  }

  const copyLinkBtn = document.getElementById("btn-copy-link");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      copyShareLink();
    });
  }

  const editPlanBtn = document.getElementById("btn-edit-plan");
  if (editPlanBtn) {
    editPlanBtn.addEventListener("click", () => {
      goToStep(1);
      document.getElementById("wizard-section")?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Show All Days Toggle
  const showAllDaysBtn = document.getElementById("btn-show-all-days");
  if (showAllDaysBtn) {
    showAllDaysBtn.addEventListener("click", () => {
      playUiSound('click');
      appState.showingAllDays = !appState.showingAllDays;
      const plan = appState.generatedPlan || DESTINATIONS_DB[appState.destination];
      if (!plan) return;

      if (appState.showingAllDays) {
        displayAllDays(plan);
        showAllDaysBtn.innerHTML = `<i class="fa-solid fa-calendar-day"></i> <span>Ver por Día Individual</span>`;
        document.querySelectorAll("#timeline-day-pills .day-pill").forEach(p => p.classList.remove("active"));
      } else {
        showAllDaysBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>Ver Todos los Días</span>`;
        displayActivitiesForDay(plan, appState.currentTimelineDay);
        document.querySelector(`#timeline-day-pills .day-pill[data-day="${appState.currentTimelineDay}"]`)?.classList.add("active");
      }
    });
  }

  // Group Stepper Controls
  const btnGroupDec = document.getElementById("btn-group-dec");
  const btnGroupInc = document.getElementById("btn-group-inc");
  if (btnGroupDec && btnGroupInc) {
    btnGroupDec.addEventListener("click", () => {
      if (appState.groupTravelers > 1) {
        appState.groupTravelers--;
        updateGroupBudgetDisplay();
        playUiSound('click');
      }
    });
    btnGroupInc.addEventListener("click", () => {
      if (appState.groupTravelers < 20) {
        appState.groupTravelers++;
        updateGroupBudgetDisplay();
        playUiSound('click');
      }
    });
  }

  // Mobile Drawer Controls
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const drawerOverlay = document.getElementById("mobile-drawer-overlay");
  const drawerClose = document.getElementById("drawer-close-btn");
  const drawerCta = document.getElementById("drawer-cta-btn");

  if (mobileToggle && drawerOverlay) {
    mobileToggle.addEventListener("click", () => {
      drawerOverlay.classList.remove("hidden");
      playUiSound('click');
    });
    drawerClose?.addEventListener("click", () => {
      drawerOverlay.classList.add("hidden");
    });
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) drawerOverlay.classList.add("hidden");
    });
    document.querySelectorAll(".drawer-link").forEach(link => {
      link.addEventListener("click", () => {
        drawerOverlay.classList.add("hidden");
      });
    });
    drawerCta?.addEventListener("click", () => {
      drawerOverlay.classList.add("hidden");
    });
  }
}

// ==========================================
// 7. WIZARD STEP NAVIGATION & VALIDATION
// ==========================================
function validateCurrentStep() {
  if (appState.currentStep === 1) {
    const destInput = document.getElementById("destination-input");
    const val = destInput ? destInput.value.trim() : "";
    if (!val) {
      showToast("Por favor escribe o selecciona un destino 🗺️", "info");
      destInput?.focus();
      return false;
    }
    appState.destination = val;
    return true;
  }
  if (appState.currentStep === 5) {
    if (appState.interests.length < 1) {
      showToast("Selecciona al menos 1 interés o vibra para personalizar tu plan ✨", "info");
      return false;
    }
  }
  return true;
}

function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > appState.totalSteps) return;
  appState.currentStep = stepNumber;

  // Update panels
  document.querySelectorAll(".wizard-step-panel").forEach((panel, i) => {
    panel.classList.toggle("active", i + 1 === stepNumber);
  });

  // Update progress bar
  document.querySelectorAll(".wizard-progress-bar .progress-step").forEach((stepEl, i) => {
    const stepIdx = i + 1;
    stepEl.classList.toggle("active", stepIdx === stepNumber);
    stepEl.classList.toggle("completed", stepIdx < stepNumber);
  });

  // Update footer buttons
  const prevBtn = document.getElementById("wizard-prev-btn");
  const nextBtn = document.getElementById("wizard-next-btn");
  const generateBtn = document.getElementById("wizard-generate-btn");
  const stepDisplay = document.getElementById("current-step-display");

  if (stepDisplay) stepDisplay.textContent = stepNumber;
  if (prevBtn) prevBtn.style.visibility = stepNumber === 1 ? "hidden" : "visible";

  if (stepNumber === appState.totalSteps) {
    nextBtn?.classList.add("hidden");
    generateBtn?.classList.remove("hidden");
  } else {
    nextBtn?.classList.remove("hidden");
    generateBtn?.classList.add("hidden");
  }
}

function highlightPopularCardIfMatches(city) {
  document.querySelectorAll(".popular-dest-grid .popular-card").forEach(card => {
    card.classList.toggle("selected", card.getAttribute("data-city") === city);
  });
}

function syncWizardUIWithState() {
  const destInput = document.getElementById("destination-input");
  if (destInput) destInput.value = appState.destination;
  highlightPopularCardIfMatches(appState.destination);

  document.querySelectorAll(".company-grid .option-card").forEach(c => {
    c.classList.toggle("selected", c.getAttribute("data-value") === appState.company);
  });

  document.querySelectorAll(".budget-tiers-grid .budget-card").forEach(b => {
    b.classList.toggle("selected", b.getAttribute("data-tier") === appState.budgetTier);
  });
}

// ==========================================
// 8. BUDGET SIMULATION & UI PRICE UPDATES
// ==========================================
function updateBudgetSimulation() {
  const destData = DESTINATIONS_DB[appState.destination];
  let dailyBase = 2200; // default MXN

  if (destData && destData.dailyBudget[appState.budgetTier]) {
    dailyBase = destData.dailyBudget[appState.budgetTier];
  } else {
    if (appState.budgetTier === 'mochilero') dailyBase = 750;
    else if (appState.budgetTier === 'lujo') dailyBase = 5800;
    else dailyBase = 2200;
  }

  const totalPerPerson = dailyBase * appState.days;

  const bannerDays = document.getElementById("banner-days");
  const bannerTotal = document.getElementById("banner-total");

  if (bannerDays) bannerDays.textContent = appState.days;
  if (bannerTotal) bannerTotal.textContent = formatMoney(totalPerPerson);

  // Update Tier cards prices in step 4
  const pMochilero = document.getElementById("price-tier-mochilero");
  const pEquilibrado = document.getElementById("price-tier-equilibrado");
  const pLujo = document.getElementById("price-tier-lujo");

  const mDaily = destData ? destData.dailyBudget.mochilero : 750;
  const eDaily = destData ? destData.dailyBudget.equilibrado : 2200;
  const lDaily = destData ? destData.dailyBudget.lujo : 5800;

  if (pMochilero) pMochilero.textContent = `${formatMoney(mDaily)} / día`;
  if (pEquilibrado) pEquilibrado.textContent = `${formatMoney(eDaily)} / día`;
  if (pLujo) pLujo.textContent = `${formatMoney(lDaily)} / día`;
}

function updateAllPricesUI() {
  updateBudgetSimulation();
  if (appState.generatedPlan) {
    renderItineraryResults(appState.generatedPlan);
  }
}

// ==========================================
// 9. AI GENERATION SIMULATOR & RENDERER
// ==========================================
function triggerAIGeneration() {
  const modal = document.getElementById("ai-loading-modal");
  const targetSpan = document.getElementById("loading-target-dest");
  const fillBar = document.getElementById("loader-progress-fill");
  const statusText = document.getElementById("loader-status-text");
  const quoteText = document.getElementById("loader-quote-text");

  if (targetSpan) targetSpan.textContent = appState.destination;
  if (modal) modal.classList.remove("hidden");

  const loaderQuotes = [
    '"El mundo es un libro y aquellos que no viajan solo leen una página." – San Agustín',
    '"Viajar no es escapar de la vida, es hacer que la vida no se nos escape."',
    '"No viajas para llegar a un destino, viajas para descubrirte a ti mismo."',
    '"La felicidad no es una estación a la que se llega, sino una forma de viajar."',
    '"Colecciona momentos inolvidables, no cosas."'
  ];
  let quoteIdx = 0;
  if (quoteText) quoteText.textContent = loaderQuotes[0];

  // Reset step checklist items
  const stepItems = [
    { id: "l-step-1", text: "Destino y preferencias fijadas" },
    { id: "l-step-2", text: "Seleccionando mejores alojamientos y zonas seguras" },
    { id: "l-step-3", text: "Curando restaurantes y spots locales sin trampas" },
    { id: "l-step-4", text: "Optimizando presupuesto y cronograma día a día" }
  ];

  stepItems.forEach((s, idx) => {
    const el = document.getElementById(s.id);
    if (el) {
      el.className = idx === 0 ? "l-step done" : "l-step pending";
      el.innerHTML = idx === 0 
        ? `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald)"></i> <span>${s.text}</span>`
        : `<i class="fa-regular fa-circle"></i> <span>${s.text}</span>`;
    }
  });

  const steps = [
    { pct: 25, text: `Analizando más de 1,400 opiniones verificadas en ${appState.destination}...`, activeId: "l-step-2", doneId: "l-step-1" },
    { pct: 55, text: `Filtrando hoteles y zonas seguras para viajar ${companyLabel(appState.company)}...`, activeId: "l-step-3", doneId: "l-step-2" },
    { pct: 85, text: `Curando joyas gastronómicas y evitando trampas para turistas...`, activeId: "l-step-4", doneId: "l-step-3" },
    { pct: 100, text: `¡Cronograma día a día y presupuesto calculado con éxito!`, activeId: null, doneId: "l-step-4" }
  ];

  let currentIdx = 0;
  if (fillBar) fillBar.style.width = "10%";

  const interval = setInterval(() => {
    if (currentIdx < steps.length) {
      const step = steps[currentIdx];
      if (fillBar) fillBar.style.width = `${step.pct}%`;
      if (statusText) statusText.textContent = step.text;

      quoteIdx = (quoteIdx + 1) % loaderQuotes.length;
      if (quoteText) quoteText.textContent = loaderQuotes[quoteIdx];

      if (step.doneId) {
        const doneEl = document.getElementById(step.doneId);
        const itemInfo = stepItems.find(s => s.id === step.doneId);
        if (doneEl && itemInfo) {
          doneEl.className = "l-step done";
          doneEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald)"></i> <span>${itemInfo.text}</span>`;
        }
      }

      if (step.activeId) {
        const activeEl = document.getElementById(step.activeId);
        const itemInfo = stepItems.find(s => s.id === step.activeId);
        if (activeEl && itemInfo) {
          activeEl.className = "l-step active";
          activeEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--primary)"></i> <span>${itemInfo.text}</span>`;
        }
      }

      currentIdx++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        if (modal) modal.classList.add("hidden");
        generateAndShowPlan();
        playUiSound('success');
      }, 500);
    }
  }, 650);
}

function generateAndShowPlan() {
  let plan = DESTINATIONS_DB[appState.destination];

  if (!plan) {
    // Generate dynamically for any city
    plan = synthesizeCustomDestination(appState.destination, appState.days, appState.company, appState.budgetTier, appState.interests);
  }

  appState.generatedPlan = plan;
  appState.showingAllDays = false;
  renderItineraryResults(plan);

  const resultSection = document.getElementById("itinerary-result-section");
  if (resultSection) {
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth" });
  }

  showToast(`¡Tu itinerario para ${appState.destination} está listo! 🎉`, "success");
}

function renderItineraryResults(plan) {
  // 1. Header Card Info
  const resDestTitle = document.getElementById("res-destination-title");
  const resSummary = document.getElementById("res-summary-text");
  const resBadgeCompany = document.getElementById("res-badge-company");
  const resBadgeBudget = document.getElementById("res-badge-budget");
  const resBadgeDuration = document.getElementById("res-badge-duration");
  const resHeroImg = document.getElementById("res-hero-image");
  const resBudgetAmount = document.getElementById("res-budget-amount");

  if (resDestTitle) resDestTitle.textContent = `Aventura en ${appState.destination}`;
  if (resSummary) resSummary.textContent = plan.summary;
  if (resBadgeCompany) resBadgeCompany.textContent = `Viaje ${capitalize(companyLabel(appState.company))}`;
  if (resBadgeBudget) resBadgeBudget.textContent = `Estilo ${capitalize(budgetLabel(appState.budgetTier))}`;
  if (resBadgeDuration) resBadgeDuration.textContent = `${appState.days} Días (${appState.season})`;
  if (resHeroImg) resHeroImg.src = plan.image;

  const dailyCost = plan.dailyBudget[appState.budgetTier] || 2200;
  const totalCost = dailyCost * appState.days;
  if (resBudgetAmount) resBudgetAmount.textContent = formatMoney(totalCost);

  // 2. Render Timeline Day Pills & Activities
  renderTimelineDays(plan);

  // 3. Render Hotels
  renderHotels(plan);

  // 4. Render Gastronomy
  renderFood(plan);

  // 5. Render Budget Breakdown
  renderBudgetBreakdown(dailyCost, totalCost);

  // 6. Render Packing Checklist
  renderPackingList(plan);

  // 7. Render Weather & Climate
  renderWeather(plan);
}

function renderTimelineDays(plan) {
  const pillsContainer = document.getElementById("timeline-day-pills");
  const timelineContainer = document.getElementById("day-timeline-container");
  if (!pillsContainer || !timelineContainer) return;

  const totalDays = Math.min(appState.days, plan.timelineDays.length);

  // Day buttons
  let pillsHtml = "";
  for (let i = 1; i <= totalDays; i++) {
    const isActive = i === appState.currentTimelineDay && !appState.showingAllDays ? "active" : "";
    pillsHtml += `<button type="button" class="day-pill ${isActive}" data-day="${i}">Día ${i}</button>`;
  }
  pillsContainer.innerHTML = pillsHtml;

  // Add click to day pills
  pillsContainer.querySelectorAll(".day-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      playUiSound('click');
      appState.showingAllDays = false;
      const showAllDaysBtn = document.getElementById("btn-show-all-days");
      if (showAllDaysBtn) {
        showAllDaysBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>Ver Todos los Días</span>`;
      }
      pillsContainer.querySelectorAll(".day-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const dayNum = parseInt(pill.getAttribute("data-day"), 10);
      appState.currentTimelineDay = dayNum;
      displayActivitiesForDay(plan, dayNum);
    });
  });

  if (appState.showingAllDays) {
    displayAllDays(plan);
  } else {
    displayActivitiesForDay(plan, appState.currentTimelineDay);
  }
}

function renderActivitiesHtml(activities) {
  return activities.map((act, idx) => {
    const slotClass = act.slot === 'morning' ? 'slot-morning' : act.slot === 'afternoon' ? 'slot-afternoon' : 'slot-evening';
    const slotName = act.slot === 'morning' ? 'Mañana' : act.slot === 'afternoon' ? 'Tarde' : 'Noche';
    const mapsQuery = encodeURIComponent(`${act.loc || act.title} ${appState.destination}`);

    return `
      <div class="activity-card" data-act-idx="${idx}">
        <div class="activity-time-col">
          <span class="time-slot-badge ${slotClass}">${slotName}</span>
          <span class="activity-exact-time">${act.time}</span>
        </div>
        <div class="activity-info-col">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
            <h4 class="activity-title">${act.title}</h4>
            <button type="button" class="activity-check-btn" title="Marcar como hecha" aria-label="Marcar como realizada">
              <i class="fa-regular fa-circle-check"></i>
            </button>
          </div>
          <p class="activity-desc">${act.desc}</p>
          <div class="activity-meta-row">
            <span><i class="fa-solid fa-location-dot"></i> ${act.loc}</span>
            <span><i class="fa-solid fa-wand-magic-sparkles"></i> Optimizado por IA</span>
            <a href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:600; margin-left:auto; display:inline-flex; align-items:center; gap:4px;">
              <span>Ver en Maps</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
            </a>
          </div>
          ${act.tip ? `
            <div class="tip-banner">
              <strong>💡 Consejo de local:</strong> ${act.tip}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function attachActivityCheckListeners() {
  document.querySelectorAll(".activity-check-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".activity-card");
      if (!card) return;
      const isDone = card.classList.toggle("activity-done");
      btn.innerHTML = isDone ? `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald)"></i>` : `<i class="fa-regular fa-circle-check"></i>`;
      playUiSound('select');
    });
  });
}

function displayActivitiesForDay(plan, dayNum) {
  const container = document.getElementById("day-timeline-container");
  if (!container) return;

  const dayData = plan.timelineDays[dayNum - 1] || plan.timelineDays[0];

  let html = `<h4 style="font-size: 1.3rem; margin-bottom: 20px; color: var(--accent-coral);"><i class="fa-solid fa-calendar-day"></i> Día ${dayNum}: ${dayData.title}</h4>`;
  html += `<div style="display:flex; flex-direction:column; gap:18px;">${renderActivitiesHtml(dayData.activities)}</div>`;

  container.innerHTML = html;
  attachActivityCheckListeners();
}

function displayAllDays(plan) {
  const container = document.getElementById("day-timeline-container");
  if (!container || !plan) return;

  const totalDays = Math.min(appState.days, plan.timelineDays.length);
  let html = "";

  for (let d = 1; d <= totalDays; d++) {
    const dayData = plan.timelineDays[d - 1];
    html += `
      <div class="day-full-block" style="margin-bottom: 32px;">
        <h4 style="font-size: 1.35rem; margin-bottom: 16px; color: var(--accent-coral); display:flex; align-items:center; gap:10px;">
          <span style="background:var(--accent-coral); color:white; border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700;">${d}</span>
          <span>Día ${d}: ${dayData.title}</span>
        </h4>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${renderActivitiesHtml(dayData.activities)}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  attachActivityCheckListeners();
}

function renderHotels(plan) {
  const grid = document.getElementById("hotels-grid");
  if (!grid) return;

  grid.innerHTML = plan.hotels.map(h => {
    const bookingQuery = encodeURIComponent(`${h.name} ${appState.destination}`);
    return `
      <div class="item-card">
        <div class="item-img-wrap">
          <img src="${plan.image}" alt="${h.name}">
          <span class="item-badge-top">${h.badge}</span>
          <span class="item-score-badge"><i class="fa-solid fa-star"></i> ${h.score}</span>
        </div>
        <div class="item-body">
          <h4>${h.name}</h4>
          <p>${h.desc}</p>
          <div class="item-details-row">
            <span class="item-price">${formatMoney(h.price)} <small style="font-size:0.75rem; color:var(--text-muted)">/ noche</small></span>
            <a href="https://www.google.com/travel/hotels?q=${bookingQuery}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; color:var(--primary); font-weight:600; display:inline-flex; align-items:center; gap:4px;">
              <span>Buscar Tarifas</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderFood(plan) {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  grid.innerHTML = plan.foodSpots.map(f => `
    <div class="item-card">
      <div class="item-body" style="padding-top: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <span class="badge-pill" style="font-size:0.72rem;">${f.type}</span>
          <strong style="color:var(--accent-coral); font-size:0.9rem">${f.price}</strong>
        </div>
        <h4 style="margin-top: 6px;">${f.name}</h4>
        <p style="margin: 12px 0 18px;">${f.desc}</p>
        <div class="item-details-row">
          <span class="item-tag"><i class="fa-solid fa-check" style="color:var(--accent-emerald)"></i> Cero trampa de turista</span>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(f.name + ' ' + appState.destination)}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; color:var(--primary); font-weight:600;">
            Ver en Mapa <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

function renderBudgetBreakdown(dailyCost, totalCost) {
  const bDaily = document.getElementById("breakdown-daily");
  const bDaysCount = document.getElementById("breakdown-days-count");
  const bTotal = document.getElementById("breakdown-total");

  if (bDaily) bDaily.textContent = formatMoney(dailyCost);
  if (bDaysCount) bDaysCount.textContent = appState.days;
  if (bTotal) bTotal.textContent = formatMoney(totalCost);

  if (!appState.groupTravelers) {
    if (appState.company === 'pareja') appState.groupTravelers = 2;
    else if (appState.company === 'solo') appState.groupTravelers = 1;
    else appState.groupTravelers = 4;
  }

  updateGroupBudgetDisplay(totalCost);
}

function updateGroupBudgetDisplay(optionalTotalCost) {
  const bGroupCount = document.getElementById("breakdown-group-count");
  const bGroupTotal = document.getElementById("breakdown-group-total");
  const groupValEl = document.getElementById("group-travelers-num");

  const plan = appState.generatedPlan || DESTINATIONS_DB[appState.destination];
  const dailyCost = plan ? (plan.dailyBudget[appState.budgetTier] || 2200) : 2200;
  const totalCost = optionalTotalCost || (dailyCost * appState.days);

  if (groupValEl) groupValEl.textContent = appState.groupTravelers;
  if (bGroupCount) bGroupCount.textContent = `${appState.groupTravelers} ${appState.groupTravelers === 1 ? 'persona' : 'personas'}`;
  if (bGroupTotal) bGroupTotal.textContent = formatMoney(totalCost * appState.groupTravelers);
}

function renderWeather(plan) {
  const grid = document.getElementById("weather-grid");
  if (!grid) return;

  const weatherPresets = {
    "Oaxaca, México": {
      temp: "26°C",
      condition: "Soleado y templado",
      icon: "fa-sun",
      bestMonths: "Octubre a Mayo",
      rain: "Baja (Temporada seca)",
      clothing: "Ropa ligera de día, chamarra ligera por la noche."
    },
    "Tokio, Japón": {
      temp: "19°C",
      condition: "Clima fresco y agradable",
      icon: "fa-cloud-sun",
      bestMonths: "Marzo-Mayo (Cerezo) y Octubre-Noviembre",
      rain: "Moderada (Cuidado con tifones en sep)",
      clothing: "Capas de ropa, calzado impermeable y bufanda ligera."
    },
    "Bali, Indonesia": {
      temp: "29°C",
      condition: "Cálido tropical con brisa marina",
      icon: "fa-temperature-high",
      bestMonths: "Abril a Octubre (Estación seca)",
      rain: "Baja en estación seca / Monzón en dic-feb",
      clothing: "Ropa fresca de lino/algodón, traje de baño y repelente."
    },
    "Roma, Italia": {
      temp: "22°C",
      condition: "Mediterráneo templado",
      icon: "fa-sun",
      bestMonths: "Abril a Junio y Septiembre a Octubre",
      rain: "Baja a moderada",
      clothing: "Calzado cómodo para adoquines, sombrero y gafas de sol."
    },
    "Nueva York, EE. UU.": {
      temp: "18°C",
      condition: "Clima variable y energético",
      icon: "fa-cloud-bolt",
      bestMonths: "Mayo a Junio y Septiembre a Noviembre",
      rain: "Moderada durante todo el año",
      clothing: "Chaqueta cortavientos, capas adaptables y zapatos cómodos."
    },
    "Medellín, Colombia": {
      temp: "24°C",
      condition: "Eterna Primavera (Templado todo el año)",
      icon: "fa-seedling",
      bestMonths: "Diciembre a Marzo y Julio a Agosto",
      rain: "Lluvias vespertinas ocasionales",
      clothing: "Casual ligero, paraguas plegable y lentes oscuros."
    }
  };

  const info = weatherPresets[appState.destination] || {
    temp: "23°C",
    condition: "Clima favorable para turismo",
    icon: "fa-cloud-sun",
    bestMonths: "Primavera y Otoño",
    rain: "Baja / Moderada",
    clothing: "Ropa cómoda en capas y calzado de caminata."
  };

  grid.innerHTML = `
    <div class="weather-card glass-card">
      <div class="weather-card-header">
        <div>
          <span class="sub-badge" style="margin-bottom:6px;"><i class="fa-solid fa-location-dot"></i> ${appState.destination}</span>
          <div class="weather-temp">${info.temp}</div>
        </div>
        <div class="weather-icon-box">
          <i class="fa-solid ${info.icon}"></i>
        </div>
      </div>
      <div class="weather-condition">${info.condition} en temporada de ${appState.season}</div>
      <ul class="weather-detail-list">
        <li><span>Mejor época para ir:</span> <strong>${info.bestMonths}</strong></li>
        <li><span>Probabilidad de lluvia:</span> <strong>${info.rain}</strong></li>
      </ul>
    </div>

    <div class="weather-card glass-card">
      <div class="weather-card-header">
        <h4 style="font-size:1.15rem; margin:0;"><i class="fa-solid fa-shirt gradient-icon"></i> Qué vestir según el clima</h4>
      </div>
      <p style="margin: 12px 0 16px; font-size:0.92rem; color:var(--text-muted);">${info.clothing}</p>
      <ul class="weather-detail-list">
        <li><span>Radiación UV:</span> <strong>Moderada - Alta (Llevar SPF 50+)</strong></li>
        <li><span>Calzado:</span> <strong>Caminatas de +10,000 pasos/día</strong></li>
      </ul>
    </div>

    <div class="weather-card glass-card">
      <div class="weather-card-header">
        <h4 style="font-size:1.15rem; margin:0;"><i class="fa-solid fa-clock-rotate-left gradient-icon"></i> Horarios Ideales</h4>
      </div>
      <ul class="weather-detail-list" style="border-top:none; padding-top:0;">
        <li><span>Mañanas (08:30 - 12:00):</span> <strong>Monumentos y templos al aire libre</strong></li>
        <li><span>Mediodía (13:00 - 16:00):</span> <strong>Comida, museos y descanso fresco</strong></li>
        <li><span>Tarde / Noche (17:30+):</span> <strong>Atardeceres, miradores y terrazas</strong></li>
      </ul>
    </div>
  `;
}

function exportPlanToIcs(plan) {
  if (!plan) return;
  playUiSound('click');

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatDateToIcs = (d) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viatiko//AI Travel Planner ES//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Viatiko - Viaje a ${appState.destination}`,
    'X-WR-TIMEZONE:UTC'
  ];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 14);

  plan.timelineDays.slice(0, appState.days).forEach((dayData, dayIndex) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    dayData.activities.forEach((act, actIndex) => {
      let hours = 9;
      let minutes = 0;
      if (act.time) {
        const parts = act.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (parts) {
          hours = parseInt(parts[1], 10);
          minutes = parseInt(parts[2], 10);
          if (parts[3] && parts[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (parts[3] && parts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }

      const eventStart = new Date(dayDate);
      eventStart.setHours(hours, minutes, 0, 0);
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(hours + 2, minutes, 0, 0);

      const uid = `viatiko-${Date.now()}-${dayIndex}-${actIndex}@viatiko.app`;
      const description = `${act.desc || ''}\\n\\n💡 Consejo: ${act.tip || 'Disfruta al máximo'}\\nOrganizado por Viatiko AI Planner`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${uid}`);
      icsContent.push(`DTSTAMP:${formatDateToIcs(now)}`);
      icsContent.push(`DTSTART:${formatDateToIcs(eventStart)}`);
      icsContent.push(`DTEND:${formatDateToIcs(eventEnd)}`);
      icsContent.push(`SUMMARY:${(act.title || 'Actividad Viatiko').replace(/,/g, '\\,')}`);
      icsContent.push(`DESCRIPTION:${description.replace(/,/g, '\\,')}`);
      icsContent.push(`LOCATION:${(act.loc ? act.loc + ', ' + appState.destination : appState.destination).replace(/,/g, '\\,')}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `itinerario-viatiko-${appState.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("¡Calendario (.ics) descargado con éxito! Listo para importar en tu móvil o PC 📅", "success");
}

function renderPackingList(plan) {
  const grid = document.getElementById("packing-grid");
  if (!grid) return;

  const defaultTips = plan.packingTips || [
    "Cargador portátil y cables de respaldo.",
    "Calzado cómodo para caminatas extensas.",
    "Botella de agua reutilizable.",
    "Copia física y digital de pasaporte y reservas."
  ];

  grid.innerHTML = `
    <div class="packing-column">
      <h4><i class="fa-solid fa-suitcase gradient-icon"></i> Qué llevar en tu equipaje</h4>
      <ul class="checklist" id="packing-checklist-items">
        ${defaultTips.map((tip, idx) => `
          <li class="checklist-item" data-idx="${idx}">
            <input type="checkbox" id="pack-chk-${idx}">
            <label for="pack-chk-${idx}"><span>${tip}</span></label>
          </li>
        `).join("")}
      </ul>
    </div>
    <div class="packing-column">
      <h4><i class="fa-solid fa-lightbulb gradient-icon"></i> Consejos de oro para este viaje</h4>
      <ul class="checklist">
        <li style="display:flex; gap:10px; margin-bottom:12px;">
          <i class="fa-solid fa-shield-halved" style="color:var(--accent-emerald); margin-top:4px;"></i>
          <div><strong>Seguridad y Pagos:</strong> Lleva dos tarjetas (débito/crédito) y retira algo de efectivo local para pequeños comercios y propinas.</div>
        </li>
        <li style="display:flex; gap:10px; margin-bottom:12px;">
          <i class="fa-solid fa-clock" style="color:var(--primary); margin-top:4px;"></i>
          <div><strong>Tiempo libre:</strong> Deja al menos 2 horas libres cada tarde para improvisar, sentarte en un café o descansar.</div>
        </li>
        <li style="display:flex; gap:10px;">
          <i class="fa-solid fa-mobile-screen-button" style="color:var(--accent-coral); margin-top:4px;"></i>
          <div><strong>Internet en el viaje:</strong> Compra una eSIM digital antes de aterrizar para tener conexión inmediata al llegar.</div>
        </li>
      </ul>
    </div>
  `;

  // Attach interactive toggle for checklist
  grid.querySelectorAll(".checklist-item input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", (e) => {
      const parentLi = e.target.closest(".checklist-item");
      parentLi?.classList.toggle("done", e.target.checked);
      playUiSound('select');
    });
  });
}

// ==========================================
// 10. SHARING & EXPORTING ACTIONS
// ==========================================
function shareOnWhatsApp() {
  playUiSound('click');
  const title = `¡Miren el plan que organicé para nuestro viaje a ${appState.destination}! ✈️`;
  const summary = `📅 ${appState.days} días | 👥 ${capitalize(companyLabel(appState.company))} | 💰 ${formatMoney((DESTINATIONS_DB[appState.destination]?.dailyBudget[appState.budgetTier] || 2200) * appState.days)} aprox.`;
  const link = window.location.href;
  const msg = encodeURIComponent(`${title}\n\n${summary}\n\nRevisen el itinerario completo con hoteles, restaurantes y rutas aquí:\n${link}`);
  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

function copyShareLink() {
  playUiSound('click');
  const params = new URLSearchParams({
    dest: appState.destination,
    days: appState.days,
    budget: appState.budgetTier,
    company: appState.company
  });
  const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}#itinerary-result-section`;

  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast("¡Enlace copiado al portapapeles! Listo para enviar 📋", "success");
  }).catch(() => {
    showToast("Enlace listo en la barra de direcciones", "info");
  });
}

function checkUrlParamsForDirectTrip() {
  const params = new URLSearchParams(window.location.search);
  const destParam = params.get("dest");
  if (destParam) {
    appState.destination = destParam;
    if (params.get("days")) appState.days = parseInt(params.get("days"), 10);
    if (params.get("budget")) appState.budgetTier = params.get("budget");
    if (params.get("company")) appState.company = params.get("company");
    syncWizardUIWithState();
    setTimeout(() => {
      generateAndShowPlan();
    }, 400);
  }
}

// Global helper for direct cards click in showcase
window.loadPlanDirectly = function(cityName) {
  playUiSound('click');
  appState.destination = cityName;
  syncWizardUIWithState();
  triggerAIGeneration();
};

// ==========================================
// 11. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-bell';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
