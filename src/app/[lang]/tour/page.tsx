"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TourPhoto {
  id: string;
  src: string;
  category: "gardens" | "architecture" | "rooms" | "dining" | "wellness";
  tagEn: string;
  tagRw: string;
  titleEn: string;
  titleRw: string;
  captionEn: string;
  captionRw: string;
  locationEn: string;
  locationRw: string;
}

const TOUR_PHOTOS: TourPhoto[] = [
  // 1. Garden Courtyard & Swings
  {
    id: "garden-swings",
    src: "/garden.webp",
    category: "gardens",
    tagEn: "Lush Gardens",
    tagRw: "Ubusitani Bwiza",
    titleEn: "Garden Courtyard & Wooden Swings",
    titleRw: "Ubusitani n'Imiduri y'Imbaho",
    captionEn: "Handcrafted wooden swing gazebos surrounded by manicured lawns, tall shade trees, parasols, and blooming flora.",
    captionRw: "Intebe z'imiduri zikoze mu mbaho mu busitani bwiza bwerurutse ibyatsi n'ibiti bitoshye, ahantu heza ho guhumeka umwuka mwiza.",
    locationEn: "Outdoor Grounds",
    locationRw: "Imbuga yo Hanze",
  },
  // 2. Central Water Fountain
  {
    id: "spring-fountain",
    src: "/spring.webp",
    category: "gardens",
    tagEn: "Water Feature",
    tagRw: "Iriba ry'Amazi",
    titleEn: "Illuminated Spring Water Fountain",
    titleRw: "Iriba ry'Amazi Rirabagirana",
    captionEn: "The peaceful centerpiece of our inner courtyard: a tiled mosaic water fountain with dancing jets and warm underwater illumination.",
    captionRw: "Iriba ry'amazi meza riri mu mbuga hagati, ririmbishijwe amatara meza yo mu mazi n'amazi asutamye agwa neza.",
    locationEn: "Inner Courtyard",
    locationRw: "Mu Mbuga Hagati",
  },
  // 3. Hotel Front Entrance
  {
    id: "front-facade",
    src: "/front.webp",
    category: "architecture",
    tagEn: "Main Entrance",
    tagRw: "Irembo Rikuru",
    titleEn: "Modern Architectural Facade",
    titleRw: "Imbere y'Inzu n'Irembo Rikuru",
    captionEn: "Contemporary stone masonry, expansive panoramic glass windows, and landscaped botanical walkways.",
    captionRw: "Inyubako igezweho ifite amadirishya manini n'amabuye y'agaciro, igaragiwe n'indabyo n'ibiti bitoshye.",
    locationEn: "Front Arrival",
    locationRw: "Ahabanza ku Irembo",
  },
  // 4. Open-Air Sports Bar & Pool Table
  {
    id: "sports-lounge-pool",
    src: "/Sunlit-Hotel-Bar-with-Pool-Table.webp",
    category: "dining",
    tagEn: "Sports & Leisure",
    tagRw: "Imikino n'Akayaga",
    titleEn: "Open-Air Billiards & Sports Lounge",
    titleRw: "Ahabanza h'Imikino na Pool Table",
    captionEn: "Spacious covered terrace featuring a tournament-grade pool table, wooden dining tables, and woven lantern lighting.",
    captionRw: "Agashami kagutse gafite ameza ya billard/pool table, intebe nziza z'imbaho n'amatara meza yo kwidagaduriramo.",
    locationEn: "Covered Terrace",
    locationRw: "Terasi yo Hanze",
  },
  // 5. The Baraza Pavilion
  {
    id: "baraza-pavilion",
    src: "/baraza.webp",
    category: "gardens",
    tagEn: "Garden Gazebo",
    tagRw: "Baraza y'Ubusitani",
    titleEn: "The Baraza Garden Pavilion",
    titleRw: "Baraza n'Ihema ry'Ubusitani",
    captionEn: "Covered veranda gazebo crowned with star-inlaid terrazzo flooring, amber hanging lanterns, and garden views.",
    captionRw: "Aheza ho gufatira ifunguro mu busitani, hateganijwe amatara meza, amakaro arimo inyenyeri n'akayaga gatuje.",
    locationEn: "Garden Pavilion",
    locationRw: "Baraza yo mu Busitani",
  },
  // 6. Courtyard Fountain at Night
  {
    id: "courtyard-night",
    src: "/night.jpeg",
    category: "gardens",
    tagEn: "Night Ambience",
    tagRw: "Amatara ya Nijoro",
    titleEn: "Courtyard Fountain at Night",
    titleRw: "Imbuga y'Iriba ry'Amazi Nijoro",
    captionEn: "Recessed stairway lighting and warm ambient spotlights illuminate the central courtyard and fountain pool.",
    captionRw: "Amatara y'inzira n'amabuye meza byaka bidasanzwe bigakora ahantu heza cyane ho gutembera ku mugoroba.",
    locationEn: "Central Courtyard",
    locationRw: "Ingazi n'Imbuga y'Amazi",
  },
  // 7. Executive Reception & Velvet Lounge
  {
    id: "reception-lounge",
    src: "/reception.jpeg",
    category: "architecture",
    tagEn: "Lobby & Lounge",
    tagRw: "Ahabakirirwa",
    titleEn: "Executive Reception & Velvet Lounge",
    titleRw: "Ibiro Byakira Abashyitsi n'Icyumba Cy'Icyubahiro",
    captionEn: "Halo backlighting, marble reception counters, emerald velvet armchairs, and refreshment displays.",
    captionRw: "Ahabakirirwa abashyitsi heza cyane harimo intebe z'agaciro z'icyatsi kibisi n'amatara meza.",
    locationEn: "Main Lobby",
    locationRw: "Saluni Nkuru",
  },
  // 8. Veranda Coffee Kiosk
  {
    id: "coffee-kiosk",
    src: "/coffee.webp",
    category: "dining",
    tagEn: "Coffee & Drinks",
    tagRw: "Ikawa n'Icyayi",
    titleEn: "Veranda Coffee Kiosk",
    titleRw: "Aho Bakirira Ikawa n'Icyayi",
    captionEn: "Located along the covered gallery, serving fresh Rwandan espresso, cappuccino, fruit juices, and cold drinks.",
    captionRw: "Akazu keza k'ikawa mu mbuga gatanga ikawa nziza y'u Rwanda, icyayi, n'ibinyobwa bikonje.",
    locationEn: "Side Veranda",
    locationRw: "Ku Nzira y'Ikoridoro",
  },
  // 9. Modern En-Suite Restroom
  {
    id: "suite-restroom",
    src: "/rest.jpeg",
    category: "rooms",
    tagEn: "En-Suite Bath",
    tagRw: "Ubwiherero Bugezweho",
    titleEn: "Contemporary Marble Restroom",
    titleRw: "Umusarani n'Icyumba cy'Amazi Kijyambere",
    captionEn: "Polished Italian grey marble tiles, walk-in rainfall shower, hygiene bidet wand, and pedestal basin.",
    captionRw: "Ubwiherero bugezweho bukozwe mu makaro ya maribure, bufite shower y'amazi ashyushye n'isuku yizewe.",
    locationEn: "Executive Suite",
    locationRw: "Mu Cyumba cya VIP",
  },
  // 10. Private Scenic Balcony
  {
    id: "guest-balcony",
    src: "/balcony.webp",
    category: "rooms",
    tagEn: "Private Balcony",
    tagRw: "Barukoni Yihariye",
    titleEn: "Panoramic Private Balcony",
    titleRw: "Barukoni y'Icyumba Ireba Kure",
    captionEn: "Polished marble tiling with stainless steel and glass balustrades overlooking the surrounding gardens and hills.",
    captionRw: "Barukoni nziza ireba imisozi y'i Nyagatare n'ubusitani bwiza, ifite intebe zo kwicaraho ku kayaga k'igitondo.",
    locationEn: "Deluxe & VIP Suites",
    locationRw: "Ibyumba bya Deluxe na VIP",
  },
  // 11. VIP Living Salon
  {
    id: "vip-living-salon",
    src: "/vip.webp",
    category: "rooms",
    tagEn: "VIP Salon",
    tagRw: "Saluni y'Icyubahiro",
    titleEn: "Presidential VIP Living Salon",
    titleRw: "Icyumba cy'Icyubahiro (VIP Lounge)",
    captionEn: "Private parlor with plush sofas, coffee table, widescreen TV, floor-to-ceiling windows, and direct balcony walkout.",
    captionRw: "Salo y'agaciro k'icyumba cya VIP irimo intebe nziza cyane, televiziyo nini, n'umuryango ufungukira kuri barukoni.",
    locationEn: "Presidential Suite",
    locationRw: "Icyumba cy'Icyubahiro",
  },
  // 12. In-Room Desk & Media
  {
    id: "room-desk-media",
    src: "/tv.webp",
    category: "rooms",
    tagEn: "Work & Media",
    tagRw: "Ibiro by'Icyumba",
    titleEn: "In-Room Workstation & Smart TV",
    titleRw: "Ibiro byo Gukoreramo mu Cyumba",
    captionEn: "Solid hardwood work desk, high-speed fiber internet, satellite smart TV, and private terrace access.",
    captionRw: "Ameza meza yo gukoreraho akazi, televiziyo y'amashusho meza, interineti yihuta n'urumuri rwinshi.",
    locationEn: "Deluxe Suite",
    locationRw: "Icyumba cya Deluxe",
  },
  // 13. Wardrobe & Amenities
  {
    id: "room-wardrobe",
    src: "/robe.webp",
    category: "rooms",
    tagEn: "Wardrobe & Care",
    tagRw: "Akabati k'Icyumba",
    titleEn: "Custom Wood Wardrobe & Amenities",
    titleRw: "Akabati k'Icyumba n'Ibikoresho by'Isuku",
    captionEn: "Spacious custom timber cabinetry stocked with fresh cotton towels, bottled water, toiletries, and slippers.",
    captionRw: "Akabati kagutse karimo amatawulo yera, amazi yo kunywa, ibikoresho by'isuku n'inkweto zo mu cyumba.",
    locationEn: "Guest Room Closet",
    locationRw: "Mu Kabati k'Icyumba",
  },
  // 14. Master Floating Vanity & Shower
  {
    id: "master-vanity-bath",
    src: "/bath.webp",
    category: "rooms",
    tagEn: "Designer Vanity",
    tagRw: "Icyumba cy'Amazi",
    titleEn: "Floating Stone Vanity & Rain Shower",
    titleRw: "Icyumba cy'Amazi n'Isuku",
    captionEn: "Quartz floating sink counter, electronic instant water heater, high-pressure rainfall shower, and vanity mirror.",
    captionRw: "Iteguriro ry'amazi ryiza rya maribure, amazi ashyushye ako kanya, na shower y'amazi meza agwa nk'imvura.",
    locationEn: "Suite Bathroom",
    locationRw: "Mu Cyumba cy'Amazi",
  },
  // 15. Standard Queen Room
  {
    id: "standard-room",
    src: "/sta.webp",
    category: "rooms",
    tagEn: "Standard Category",
    tagRw: "Standard Room",
    titleEn: "Standard Room Queen Bed",
    titleRw: "Icyumba cya Standard Room",
    captionEn: "Rich mahogany bed frame with crisp luxury linens, open shelving storage, and tranquil ambient lighting.",
    captionRw: "Uburiri bwagutse bw'imbaho nziza, amashuka yera ateye neza n'akabati k'imbaho koroshye gukoresha.",
    locationEn: "Standard Wing",
    locationRw: "Mu Gice cya Standard",
  },
  // 16. Superior Sky View Suite
  {
    id: "superior-sky-view",
    src: "/lux.webp",
    category: "rooms",
    tagEn: "Superior Sky View",
    tagRw: "Superior Room",
    titleEn: "Superior Sky-View King Bed",
    titleRw: "Icyumba cya Superior kireba Ikirere",
    captionEn: "Wide panoramic windows overlooking the countryside horizon right beside a plush king-sized bed.",
    captionRw: "Amashusho meza y'ikirere n'imisozi binyuze mu idirishya rinini riherereye iruhande rw'uburiri bwa King-size.",
    locationEn: "High-Floor Suites",
    locationRw: "Ibyumba byo Hejuru",
  },
  // 17. Deluxe Master Bedroom
  {
    id: "deluxe-master-bed",
    src: "/bed.webp",
    category: "rooms",
    tagEn: "Deluxe Category",
    tagRw: "Deluxe Room",
    titleEn: "Deluxe Master Bedroom",
    titleRw: "Uburiri bwa Deluxe bw'Umutuzo",
    captionEn: "Comfort sanctuary with orthopedic mattress, textured drapes, and indirect bedside reading lamps.",
    captionRw: "Uburiri bw'agaciro buteye amabengeza, amatara atuje yo gusoma, n'umutuzo usesuye wo kuruhuka.",
    locationEn: "Deluxe Wing",
    locationRw: "Mu Gice cya Deluxe",
  },
  // 18. Hollywood Bar Counter
  {
    id: "hollywood-bar-counter",
    src: "/bar.webp",
    category: "dining",
    tagEn: "Bar & Drinks",
    tagRw: "Hollywood Bar",
    titleEn: "Hollywood Bar Counter",
    titleRw: "Kawoitari ya Hollywood Bar",
    captionEn: "Cold local brews, international spirits, wines, and craft cocktails served in a vibrant atmosphere.",
    captionRw: "Inzoga z'amoko yose, imitobe, n'inzoga zikonje ziteguwe n'abahanga muri Hollywood Bar.",
    locationEn: "Hollywood Bar",
    locationRw: "Aho Bar Iherereye",
  },
  // 19. Conference Hall
  {
    id: "grand-conference-hall",
    src: "/salle.webp",
    category: "wellness",
    tagEn: "Grand Ballroom",
    tagRw: "Salle y'Inama",
    titleEn: "Grand Conference & Event Hall",
    titleRw: "Salle Nini y'Inama n'Ibirori",
    captionEn: "Indoor banquet venue featuring professional acoustics, wall-mounted display monitors, and a speaker podium.",
    captionRw: "Icyumba kigari cy'inama cyakira abantu benshi, gifite televiziyo nini, mikoro, n'amatara meza.",
    locationEn: "Conference Center",
    locationRw: "Mu Gice cy'Inama",
  },
  // 20. Wedding Marquee Tent
  {
    id: "garden-wedding-tent",
    src: "/weed.webp",
    category: "wellness",
    tagEn: "Wedding Marquee",
    tagRw: "Amahema y'Ubukwe",
    titleEn: "Outdoor Garden Wedding Marquee",
    titleRw: "Ihema Rikuru ry'Ubukwe mu Busitani",
    captionEn: "White silk canopies, ceremonial carpet runner, and fairy lighting on the grand lawn for wedding celebrations.",
    captionRw: "Urubuga rwiza rw'ubukwe mu busitani ruteguwe n'amahema yera y'agaciro n'inzira nziza y'abageni.",
    locationEn: "Garden Lawn",
    locationRw: "Mu Busitani bw'Ibirori",
  },
  // 21. Cedar Sauna
  {
    id: "timber-sauna",
    src: "/sauna.webp",
    category: "wellness",
    tagEn: "Finnish Sauna",
    tagRw: "Sawuna y'Imbaho",
    titleEn: "Finnish Cedarwood Dry Sauna",
    titleRw: "Sawuna y'Imbaho zo Kuruhuka",
    captionEn: "Natural cedar-paneled thermal sauna designed for muscle recovery, detoxification, and deep relaxation.",
    captionRw: "Icyumba cya Sawuna kigarura imbaraga mu mubiri, gifite ubushyuhe bwiza n'intebe z'imbaho z'umwimerere.",
    locationEn: "Spa Suite",
    locationRw: "Mu Gice cya Spa",
  },
  // 22. Fitness Gym
  {
    id: "fitness-gym-studio",
    src: "/gym.webp",
    category: "wellness",
    tagEn: "Gym & Recovery",
    tagRw: "Imyitozo n'Umutuzo",
    titleEn: "Fitness Gym & Massage Chairs",
    titleRw: "Icyumba cy'Imyitozo Ngororamubiri (Gym)",
    captionEn: "Cardio treadmills, spin bikes, dumbbells, workout benches, and zero-gravity robotic massage chairs.",
    captionRw: "Ibikoresho bigezweho byo gukora siporo, amagare, amamashini yo kwirukaho, n'intebe zikora massage.",
    locationEn: "Wellness Center",
    locationRw: "Mu Kigo cy'Ubutagatifu",
  },
  // 23. Private Massage Room
  {
    id: "massage-therapy-room",
    src: "/massage.webp",
    category: "wellness",
    tagEn: "Massage Suite",
    tagRw: "Icyumba cya Massage",
    titleEn: "Private Spa & Massage Suite",
    titleRw: "Icyumba cya Massage cy'Umwihariko",
    captionEn: "Tranquil massage room featuring a cushioned therapy bed, natural lighting, and en-suite hot shower.",
    captionRw: "Ahantu hihariye h'umutuzo ho gukorerwa massage y'umubiri wose, ifite shower y'amazi ashyushye.",
    locationEn: "Wellness Wing",
    locationRw: "Mu Gice cya Spa",
  },
  // 24. Paved Courtyard & Parking
  {
    id: "secure-parking",
    src: "/parking.webp",
    category: "architecture",
    tagEn: "Secure Parking",
    tagRw: "Parikingi Yizewe",
    titleEn: "Paved Courtyard & Secure Parking",
    titleRw: "Parikingi Nini Yizewe",
    captionEn: "Interlocking-brick parking area with 24/7 security guard post, perimeter lighting, and botanical walls.",
    captionRw: "Parikingi nini ifite amakaro meza, uburinzi bukora amasaha 24 kuri 24 n'umutekano wizewe.",
    locationEn: "Entrance Courtyard",
    locationRw: "Imbuga y'Imbere",
  },
  // 25. Night Hotel Facade
  {
    id: "hotel-night-facade",
    src: "/night.webp",
    category: "architecture",
    tagEn: "Night Panorama",
    tagRw: "Inyubako Nijoro",
    titleEn: "Hollywood Hotel Under the Stars",
    titleRw: "Hollywood Hotel Ibaraye Nijoro",
    captionEn: "Illuminated hotel facade glowing against the night sky with architectural floodlights reflecting off paved stones.",
    captionRw: "Inyubako yose ya Hollywood Hotel irabagirana nijoro munsi y'inyenyeri, yaka amatara y'agaciro.",
    locationEn: "Exterior View",
    locationRw: "Inyubako Yose",
  },
  // 26. Twilight Sunset Facade
  {
    id: "hotel-evening-sunset",
    src: "/evening.webp",
    category: "architecture",
    tagEn: "Sunset Vista",
    tagRw: "Izuba Rirenze",
    titleEn: "Golden Hour Twilight Facade",
    titleRw: "Umusozo w'Umunsi kuri Hollywood Hotel",
    captionEn: "Evening twilight blues paired with warm amber architectural lights as dusk settles over Rwimiyaga.",
    captionRw: "Ibihe byiza by'akagoroba izuba rirenze, aho inyubako yaka amatara meza hejuru y'ubusitani.",
    locationEn: "Driveway View",
    locationRw: "Ahagana ku Muryango",
  },
  // 27. Daylight Exterior Panorama
  {
    id: "hotel-daylight-hero",
    src: "/hero.webp",
    category: "architecture",
    tagEn: "Daylight Vista",
    tagRw: "Ku Manywa",
    titleEn: "Sunlit Architectural Panorama",
    titleRw: "Amashusho y'Inyubako Ku Manywa",
    captionEn: "Full daytime view showcasing clean geometric architecture, lush flowerbeds, and peaceful countryside surroundings.",
    captionRw: "Inyubako yose ku manywa y'ihangu mu mucyo mwiza, igaragaza ubwiza bwayo n'isuku yo ku rwego rwo hejuru.",
    locationEn: "Hotel Grounds",
    locationRw: "Urubuga rwa Hoteli",
  },
  // 28. Daylight Reception Counter
  {
    id: "reception-daylight",
    src: "/reception.webp",
    category: "architecture",
    tagEn: "Welcome Desk",
    tagRw: "Ahabakirirwa",
    titleEn: "Daylight Concierge Front Desk",
    titleRw: "Ibiro byo Kwakirirwamo ku Manywa",
    captionEn: "Bright check-in foyer with polished stone flooring, guest seating, and attentive 24/7 service.",
    captionRw: "Aho bakirira abashyitsi ku manywa, hose hakeye kandi hateguye kwakira abagana hoteli bose neza.",
    locationEn: "Front Desk",
    locationRw: "Ku Ibiro Bikuru",
  },
  // 29. Fine Dining & Restaurant Service
  {
    id: "restaurant-dining",
    src: "/lunch.png",
    category: "dining",
    tagEn: "Fine Dining",
    tagRw: "Amafunguro Meza",
    titleEn: "In-House Gourmet Restaurant",
    titleRw: "Resitora y'Amafunguro Aryoshe",
    captionEn: "Chef-curated breakfast, lunch, and dinner blending authentic Rwandan specialties with international cuisine.",
    captionRw: "Amafunguro meza ateguwe n'abahanga arimo iby'iwacu n'iby'amahanga ku ifunguro rya mu gitondo na nimugoroba.",
    locationEn: "Main Restaurant",
    locationRw: "Muri Resitora Nkuru",
  },
  // 30. Craft Drinks & Cocktails
  {
    id: "drinks-cocktails",
    src: "/drinks.png",
    category: "dining",
    tagEn: "Signature Drinks",
    tagRw: "Ibinyobwa n'Imitobe",
    titleEn: "Artisan Cocktails & Juices",
    titleRw: "Ibinyobwa Byiza n'Amahanga",
    captionEn: "Freshly pressed tropical juices, iced coffees, signature mocktails, and chilled refreshments.",
    captionRw: "Imitobe y'imbuto z'umwimerere, ikawa ikonje, na za cocktails zidasanzwe zo kuruhukiraho.",
    locationEn: "Bar & Lounge",
    locationRw: "Muri Hollywood Bar",
  },
  // 31. Outdoor Catering Banquet
  {
    id: "outdoor-catering",
    src: "/food.png",
    category: "dining",
    tagEn: "Catering",
    tagRw: "Amafunguro y'Ibirori",
    titleEn: "Event Catering & Buffets",
    titleRw: "Itegurwa ry'Amafunguro mu Birori",
    captionEn: "Full catering service tailored for weddings, private celebrations, and corporate conferences.",
    captionRw: "Serivisi yo gutegura amafunguro meza mu birori n'inama ahantu hose mu Ntara y'Iburasirazuba.",
    locationEn: "Catering Service",
    locationRw: "Serivisi y'Amafunguro",
  },
];

export default function TourPage() {
  const { lang, dict } = useLanguage();
  const isRw = lang === "rw";
  const t = dict.tourPage || {};

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return TOUR_PHOTOS.filter((photo) => {
      const matchesCategory =
        activeCategory === "all" || photo.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const title = (isRw ? photo.titleRw : photo.titleEn).toLowerCase();
      const caption = (isRw ? photo.captionRw : photo.captionEn).toLowerCase();
      const tag = (isRw ? photo.tagRw : photo.tagEn).toLowerCase();
      const location = (isRw ? photo.locationRw : photo.locationEn).toLowerCase();

      return (
        title.includes(q) ||
        caption.includes(q) ||
        tag.includes(q) ||
        location.includes(q)
      );
    });
  }, [activeCategory, searchQuery, isRw]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((prev) => (prev! + 1) % filteredPhotos.length);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  const handlePrevPhoto = useCallback(() => {
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((prev) =>
        prev! === 0 ? filteredPhotos.length - 1 : prev! - 1
      );
    }
  }, [lightboxIndex, filteredPhotos.length]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNextPhoto, handlePrevPhoto, handleCloseLightbox]);

  // Touch Swipe for mobile lightbox
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
    setTouchStartX(null);
  };

  const categories = [
    { id: "all", label: t.allFilter || (isRw ? "Yose" : "All") },
    { id: "gardens", label: t.gardensFilter || (isRw ? "Ubusitani n'Amariba" : "Gardens & Fountains") },
    { id: "architecture", label: t.architectureFilter || (isRw ? "Inyubako" : "Architecture") },
    { id: "rooms", label: t.roomsFilter || (isRw ? "Ibyumba" : "Rooms & Suites") },
    { id: "dining", label: t.diningFilter || (isRw ? "Amafunguro & Bar" : "Dining & Bar") },
    { id: "wellness", label: t.eventsFilter || (isRw ? "Sawuna & Ibirori" : "Wellness & Events") },
  ];

  return (
    <div className="pt-20 min-h-screen bg-white pb-20">
      {/* === MINIMALISTIC HEADER === */}
      <section className="pt-10 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          {t.title || (isRw ? "Amafoto ya Hoteli" : "Photo Tour")}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-xl">
          {t.subtitle ||
            (isRw
              ? "Umutambagiro mu mafoto ya Hollywood Hotel i Rwimiyaga."
              : "A visual journey through the spaces, suites, and gardens of Hollywood Hotel.")}
        </p>

        {/* Minimal Category Tabs & Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || (isRw ? "Shakisha..." : "Search photos...")}
              className="w-full pl-8 pr-7 py-1 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* === PHOTO GALLERY === */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {filteredPhotos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm mb-3">
              {t.noResults || (isRw ? "Nta foto ibonetse." : "No photos found.")}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="text-xs font-semibold text-black underline cursor-pointer"
            >
              {t.resetFilter || (isRw ? "Erekana Yose" : "Show All")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPhotos.map((photo, index) => {
              const title = isRw ? photo.titleRw : photo.titleEn;
              const caption = isRw ? photo.captionRw : photo.captionEn;
              const tag = isRw ? photo.tagRw : photo.tagEn;

              return (
                <div
                  key={photo.id}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  {/* CLEAN IMAGE — ZERO OVERLAYS ON TOP */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
                    <Image
                      src={photo.src}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* MINIMALISTIC CAPTION BELOW THE IMAGE */}
                  <div className="pt-3 pb-1">
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                      {tag}
                    </span>
                    <h2 className="font-heading font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors leading-tight mb-1.5">
                      {title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                      {caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* === CLEAN FULLSCREEN LIGHTBOX === */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Close Bar */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 z-20">
              <span className="text-white/60 text-xs font-medium">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                onClick={handleCloseLightbox}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Close (Esc)"
                aria-label="Close photo preview"
              >
                <X size={22} />
              </button>
            </div>

            {/* Photo Stage */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 sm:left-6 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
                <Image
                  src={activePhoto.src}
                  alt={isRw ? activePhoto.titleRw : activePhoto.titleEn}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              <button
                onClick={handleNextPhoto}
                className="absolute right-3 sm:right-6 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Caption Bar */}
            <div className="px-4 sm:px-8 py-4 bg-black/80 border-t border-white/10 z-20 text-center sm:text-left">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-0.5">
                    {isRw ? activePhoto.titleRw : activePhoto.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-normal">
                    {isRw ? activePhoto.captionRw : activePhoto.captionEn}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 shrink-0">
                  <Link
                    href={`/${lang}/book`}
                    className="bg-gold hover:bg-gold-light text-black px-4 py-1.5 rounded-full font-bold text-xs transition-colors"
                  >
                    {t.bookRoom || (isRw ? "Saba Icyumba" : "Book A Room")}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
