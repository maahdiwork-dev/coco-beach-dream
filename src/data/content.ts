export const content = {
  fr: {
    nav: {
      accueil: "Accueil",
      forfaits: "Forfaits",
      supplements: "Suppléments",
      galerie: "Galerie",
      contact: "Contact",
      reserver: "Réserver Maintenant",
    },
    supplementsTitle: "Suppléments à la Carte",
    supplementsSubtitle:
      "En plus du déjeuner inclus dans nos forfaits, profitez de notre carte de plats grillés et fruits de mer",
    supplementsSidesLabel: "Accompagnements",
    supplementsNote:
      "Prix indiqués en Dinars Tunisiens. Carte susceptible de modifications selon arrivage.",
    heroTitle: "VIP Coco Beach — Ghar el Melh",
    heroSub:
      "Plage privée accessible uniquement en bateau — 5 min depuis parking sécurisé",
    warning: "Pas de taxis à Ghar el Melh — réservation obligatoire",
    forfaitsTitle: "Nos Forfaits",
    forfaitsNote:
      "Tout compris : transfert bateau, parking sécurisé, déjeuner complet",
    packages: [
      {
        name: "Parasol",
        price: "70 DT / pers.",
        items: [
          "Transfert aller-retour bateau",
          "Parking sécurisé",
          "Déjeuner complet",
          "Parasol sur la plage",
        ],
      },
      {
        name: "Cabane Sable",
        price: "70 DT / pers.",
        items: [
          "Transfert aller-retour bateau",
          "Parking sécurisé",
          "Déjeuner complet",
          "Cabane de sable",
        ],
      },
      {
        name: "Paillote",
        price: "80 DT / pers.",
        items: [
          "Transfert aller-retour bateau",
          "Parking sécurisé",
          "Déjeuner complet",
          "Paillote privée",
        ],
      },
      {
        name: "Paillote 1ère Position",
        price: "85 DT / pers.",
        items: [
          "Transfert aller-retour bateau",
          "Parking sécurisé",
          "Déjeuner complet",
          "Vue mer optimale",
        ],
      },
    ],
    rating: "4.6/5 sur Google (103 avis)",
    avisTitle: "Avis de nos visiteurs",
    faq: [
      {
        q: "Comment arriver?",
        a: "Parking sécurisé au port de Ghar el Melh, puis bateau 5 min inclus. Pas de taxis sur place.",
      },
      {
        q: "Jet ski?",
        a: "Zone baignade délimitée, jet ski à distance pour sécurité.",
      },
      {
        q: "Le déjeuner inclus quoi?",
        a: "Salade, riz, dorade grillée ou poulet, eau.",
      },
      {
        q: "Enfants?",
        a: "Piscine enfants disponible, tarif réduit sur demande.",
      },
    ],
  },
  ar: {
    nav: {
      accueil: "الرئيسية",
      forfaits: "العروض",
      supplements: "الكارت",
      galerie: "الصور",
      contact: "اتصل",
      reserver: "احجز الآن",
    },
    supplementsTitle: "الكارت الإضافية",
    supplementsSubtitle:
      "علاوة على الفطور المشمول في العروض، تنجم تطلب من كارتنا : مشاوي وفواكه البحر",
    supplementsSidesLabel: "إضافات",
    supplementsNote: "الأسعار بالدينار التونسي. الكارت تتبدل حسب التوفر.",
    heroTitle: "VIP Coco Beach — غار الملح",
    heroSub: "شط خاص توصلو كان بالفلوكة — 5 دقايق من الباركينغ",
    warning: "مافماش تاكسي في غار الملح، لازم تحجز قبل",
    forfaitsTitle: "العروض",
    forfaitsNote: "الكل شامل : فلوكة، باركينغ، فطور كامل",
    packages: [
      {
        name: "Parasol",
        price: "70 د / شخص",
        items: ["فلوكة ذهاب و إياب", "باركينغ", "فطور كامل", "مظلة"],
      },
      {
        name: "Cabane",
        price: "70 د / شخص",
        items: ["فلوكة", "باركينغ", "فطور", "كبانة"],
      },
      {
        name: "Paillote",
        price: "80 د / شخص",
        items: ["فلوكة", "باركينغ", "فطور", "عرّيشة"],
      },
      {
        name: "Paillote 1ère",
        price: "85 د / شخص",
        items: ["فلوكة", "باركينغ", "فطور", "اطلالة بحر"],
      },
    ],
    rating: "4.6/5 على Google (103 تقييم)",
    avisTitle: "آراء الزوار",
    faq: [
      { q: "كيفاش نجي ؟", a: "باركينغ في الميناء، بعد فلوكة 5 دق شاملة" },
      { q: "Jet ski ؟", a: "منطقة سباحة محمية" },
      { q: "الفطور ؟", a: "سلاطة، روز، حوت مشوي" },
      { q: "صغار ؟", a: "مسبح صغار موجود" },
    ],
  },
} as const;

export type Lang = keyof typeof content;
