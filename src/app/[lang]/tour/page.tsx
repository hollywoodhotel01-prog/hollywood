"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Compass,
  Check,
  Share2,
  LayoutGrid,
  Square,
  Trees,
  Droplets,
  Hotel,
  Wine,
  Flame,
  Bed,
  MapPin,
  Calendar,
  Phone,
  Eye,
} from "lucide-react";
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
  isNewHighlight?: boolean;
}

const TOUR_PHOTOS: TourPhoto[] = [
  // 1. Garden Courtyard & Swings (uncovered on website)
  {
    id: "garden-swings",
    src: "/garden.webp",
    category: "gardens",
    tagEn: "Lush Gardens",
    tagRw: "Ubusitani Bwiza",
    titleEn: "Tranquil Garden Courtyard & Swings",
    titleRw: "Ubusitani Bwuje Amahumbezi n'Imiduri",
    captionEn: "Unwind on custom wooden swing gazebos surrounded by lush manicured lawns, tall shade trees, tropical parasols, and blooming flora.",
    captionRw: "Iruhukire ku ntebe z'imiduri zikoze mu mbaho mu busitani bwiza bwerurutse ibyatsi n'ibiti bitoshye, ahantu heza ho guhumeka umwuka mwiza.",
    locationEn: "Outdoor Courtyard Grounds",
    locationRw: "Imbuga y'Ubusitani bwo Hanze",
    isNewHighlight: true,
  },
  // 2. Central Water Fountain (uncovered on website)
  {
    id: "spring-fountain",
    src: "/spring.webp",
    category: "gardens",
    tagEn: "Water Feature",
    tagRw: "Iriba ry'Amazi",
    titleEn: "Illuminated Spring Fountain",
    titleRw: "Iriba ry'Amazi Rirabagirana",
    captionEn: "The peaceful centerpiece of our inner courtyard: a tiled mosaic water fountain with dancing water jets and warm evening underwater lights.",
    captionRw: "Iriba ry'amazi meza riri mu mbuga hagati, ririmbishijwe amatara meza yo mu mazi n'amazi asutamye agwa neza atanga ituze.",
    locationEn: "Inner Atrium Courtyard",
    locationRw: "Mu Mbuga Hagati y'Inyubako",
    isNewHighlight: true,
  },
  // 3. Hotel Front Entrance (uncovered on website)
  {
    id: "front-facade",
    src: "/front.webp",
    category: "architecture",
    tagEn: "Main Entrance",
    tagRw: "Irembo Rikuru",
    titleEn: "Modern Architectural Facade & Entrance",
    titleRw: "Imbere y'Inzu n'Irembo Rikuru",
    captionEn: "Striking contemporary architecture featuring natural stone masonry, panoramic tinted glass windows, and landscaped botanical walkways.",
    captionRw: "Inyubako igezweho ifite amadirishya manini n'amabuye y'agaciro, igaragiwe n'indabyo n'ibiti bitoshye byakira neza abashyitsi bose.",
    locationEn: "Front Arrival Driveway",
    locationRw: "Ahabanza ku Irembo",
    isNewHighlight: true,
  },
  // 4. Open-Air Sports Bar & Pool Table (uncovered on website)
  {
    id: "sports-lounge-pool",
    src: "/Sunlit-Hotel-Bar-with-Pool-Table.webp",
    category: "dining",
    tagEn: "Sports & Leisure",
    tagRw: "Imikino n'Akayaga",
    titleEn: "Open-Air Billiards & Sports Lounge",
    titleRw: "Ahabanza h'Imikino n'Akayaga k'Ibibatsi",
    captionEn: "A high-ceilinged open terrace equipped with a tournament-grade pool table, wooden dining tables, and woven rattan lantern lighting.",
    captionRw: "Agashami kagutse gafite ameza ya billard/pool table, intebe nziza z'imbaho n'amatara ateguye mu rutsinga, aheza ho kwidagadurira.",
    locationEn: "Open Covered Terrace",
    locationRw: "Kuri Terasi Igerekeranye",
    isNewHighlight: true,
  },
  // 5. The Baraza Pavilion (uncovered on website)
  {
    id: "baraza-pavilion",
    src: "/baraza.webp",
    category: "gardens",
    tagEn: "Garden Gazebo",
    tagRw: "Baraza y'Ubusitani",
    titleEn: "The Baraza Garden Pavilion",
    titleRw: "Baraza n'Ihema ry'Ubusitani",
    captionEn: "An intimate covered veranda crowned with star-inlaid terrazzo flooring, amber hanging lanterns, and views across the night gardens.",
    captionRw: "Aheza ho gufatira ifunguro mu busitani, hateganijwe amatara meza, amakaro arimo inyenyeri n'akayaga gatuje ku mugoroba.",
    locationEn: "Garden Pavilion Veranda",
    locationRw: "Baraza yo mu Busitani",
    isNewHighlight: true,
  },
  // 6. Courtyard Fountain at Night (uncovered on website)
  {
    id: "courtyard-night",
    src: "/night.jpeg",
    category: "gardens",
    tagEn: "Night Ambience",
    tagRw: "Amatara ya Nijoro",
    titleEn: "Fountain Courtyard Illuminated at Night",
    titleRw: "Imbuga y'Iriba ry'Amazi Nijoro",
    captionEn: "At sunset, recessed step lighting and glowing wall sconces illuminate the central courtyard stairs and peaceful fountain pool.",
    captionRw: "Iyo bwije, amatara y'inzira n'amabuye meza byaka bidasanzwe bigakora ahantu heza cyane ho gutembera ku mugoroba.",
    locationEn: "Central Courtyard & Staircase",
    locationRw: "Ingazi n'Imbuga y'Amazi",
    isNewHighlight: true,
  },
  // 7. Executive Reception & Velvet Lounge (uncovered on website)
  {
    id: "reception-lounge",
    src: "/reception.jpeg",
    category: "architecture",
    tagEn: "Lobby & Lounge",
    tagRw: "Ahabakirirwa",
    titleEn: "Executive Reception & Velvet Lounge",
    titleRw: "Ibiro Byakira Abashyitsi n'Icyumba Cy'Icyubahiro",
    captionEn: "A five-star welcome featuring halo backlighting, marble reception counters, emerald velvet armchairs, and refreshment displays.",
    captionRw: "Ahabakirirwa abashyitsi heza cyane harimo intebe z'agaciro z'icyatsi kibisi, amatara meza, n'isuku yo ku rwego rwo hejuru.",
    locationEn: "Main Hotel Lobby",
    locationRw: "Saluni Nkuru y'Ahabanza",
    isNewHighlight: true,
  },
  // 8. Veranda Coffee Kiosk (uncovered on website)
  {
    id: "coffee-kiosk",
    src: "/coffee.webp",
    category: "dining",
    tagEn: "Coffee & Drinks",
    tagRw: "Ikawa n'Icyayi",
    titleEn: "Veranda Coffee & Refreshment Kiosk",
    titleRw: "Aho Bakirira Ikawa n'Icyayi Hanze",
    captionEn: "Located right along the covered hotel gallery, ready to serve fresh Rwandan espresso, cappuccino, fruit shakes, and chilled refreshments.",
    captionRw: "Akazu keza k'ikawa mu mbuga igaragaza ikawa nziza y'u Rwanda, ibinyobwa bikonje n'imitobe iryoshye.",
    locationEn: "Side Veranda Gallery",
    locationRw: "Ku Nzira y'Ikoridoro",
    isNewHighlight: true,
  },
  // 9. Modern En-Suite Restroom (uncovered on website)
  {
    id: "suite-restroom",
    src: "/rest.jpeg",
    category: "rooms",
    tagEn: "En-Suite Bath",
    tagRw: "Ubwiherero Bugezweho",
    titleEn: "Contemporary Marble Restroom",
    titleRw: "Umusarani n'Icyumba cy'Amazi Kijyambere",
    captionEn: "Immaculate en-suite guest bathroom with grey Italian marble tiles, walk-in rainfall shower, hygiene bidet wand, and pedestal basin.",
    captionRw: "Ubwiherero bugezweho bukozwe mu makaro meza ya maribure, bufite shower y'amazi ashyushye n'isuku yizewe.",
    locationEn: "Executive Guest Suite",
    locationRw: "Mu Cyumba cya VIP",
    isNewHighlight: true,
  },
  // 10. Private Scenic Balcony (uncovered on website)
  {
    id: "guest-balcony",
    src: "/balcony.webp",
    category: "rooms",
    tagEn: "Private Balcony",
    tagRw: "Barukoni Yihariye",
    titleEn: "Panoramic Private Guest Balcony",
    titleRw: "Barukoni y'Icyumba Ireba Kure",
    captionEn: "Step out onto polished marble tiles with stainless steel and glass railings to enjoy sunrise breezes and views of Rwimiyaga.",
    captionRw: "Igorofa ifite barukoni nziza ireba imisozi y'i Nyagatare n'ubusitani bwiza, ifite intebe zo kwicaraho ku kayaga k'igitondo.",
    locationEn: "Deluxe & VIP Suites",
    locationRw: "Ibyumba bya Deluxe na VIP",
    isNewHighlight: true,
  },
  // 11. VIP Living Salon (uncovered on website)
  {
    id: "vip-living-salon",
    src: "/vip.webp",
    category: "rooms",
    tagEn: "VIP Salon",
    tagRw: "Saluni y'Icyubahiro",
    titleEn: "Presidential VIP Living Salon",
    titleRw: "Icyumba cy'Icyubahiro (VIP Lounge)",
    captionEn: "An opulent living suite with plush couches, coffee table, widescreen 4K TV, floor-to-ceiling windows, and direct balcony walkout.",
    captionRw: "Salo y'agaciro k'icyumba cya VIP irimo intebe nziza cyane, televiziyo nini, n'umuryango ufungukira kuri barukoni.",
    locationEn: "Presidential VIP Suite",
    locationRw: "Icyumba cy'Icyubahiro",
    isNewHighlight: true,
  },
  // 12. In-Room Desk & Media (uncovered on website)
  {
    id: "room-desk-media",
    src: "/tv.webp",
    category: "rooms",
    tagEn: "Work & Media",
    tagRw: "Ibiro by'Icyumba",
    titleEn: "In-Room Workstation & Smart TV",
    titleRw: "Ibiro byo Gukoreramo mu Cyumba",
    captionEn: "Solid hardwood study desk with ergonomic chair, high-speed fiber internet, satellite smart TV, and private glass terrace access.",
    captionRw: "Ameza meza yo gukoreraho akazi, televiziyo y'amashusho meza, interineti yihuta n'amadirishya yinjiza urumuri rwinshi.",
    locationEn: "Deluxe Bedroom Suite",
    locationRw: "Icyumba cya Deluxe",
    isNewHighlight: true,
  },
  // 13. Wardrobe & Amenities (uncovered on website)
  {
    id: "room-wardrobe",
    src: "/robe.webp",
    category: "rooms",
    tagEn: "Wardrobe & Care",
    tagRw: "Akabati k'Icyumba",
    titleEn: "Custom Wood Wardrobe & Amenities",
    titleRw: "Akabati k'Icyumba n'Ibikoresho by'Isuku",
    captionEn: "Floor-to-ceiling custom timber shelving stocked with fresh Egyptian cotton towels, bottled mineral water, artisan soaps, and slippers.",
    captionRw: "Akabati kagutse karimo amatawulo yera atoshye, amazi yo kunywa, ibikoresho by'isuku n'inkweto zo mu cyumba.",
    locationEn: "Guest Room Closet",
    locationRw: "Mu Kabati k'Icyumba",
    isNewHighlight: true,
  },
  // 14. Master Floating Vanity & Shower
  {
    id: "master-vanity-bath",
    src: "/bath.webp",
    category: "rooms",
    tagEn: "Designer Vanity",
    tagRw: "Icyumba cy'Amazi",
    titleEn: "Floating Stone Vanity & Rain Shower",
    titleRw: "Icyumba cy'Amazi cy'Akataraboneka",
    captionEn: "Double-tiered quartz floating sink counter, electronic instant water heater, high-pressure rainfall shower, and expansive vanity mirror.",
    captionRw: "Iteguriro ry'amazi ryiza rya maribure, amazi ashyushye ako kanya, na shower y'amazi meza agwa nk'imvura.",
    locationEn: "Suite Private Bathroom",
    locationRw: "Mu Cyumba cy'Amazi",
    isNewHighlight: true,
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
    captionEn: "Rich hardwood bed frame with crisp luxury linens, open shelving storage, bedside table, and tranquil ambient wall lighting.",
    captionRw: "Uburiri bwagutse bw'imbaho nziza zikomeye, amashuka yera ateye neza n'akabati k'imbaho koroshye gukoresha.",
    locationEn: "Ground & 1st Floor",
    locationRw: "Igorofa ya 1 n'Ahabanza",
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
    captionEn: "Wake up to unobstructed skyline and greenery views through massive picture windows right beside your king-sized bed.",
    captionRw: "Kangukira ku mashusho meza y'ikirere n'imisozi binyuze mu idirishya rinini riherereye iruhande rw'uburiri bwa King-size.",
    locationEn: "Upper High-Floor Suites",
    locationRw: "Ibyumba byo Hejuru",
  },
  // 17. Deluxe Master Bedroom
  {
    id: "deluxe-master-bed",
    src: "/bed.webp",
    category: "rooms",
    tagEn: "Deluxe Category",
    tagRw: "Deluxe Room",
    titleEn: "Deluxe Master Sanctuary",
    titleRw: "Uburiri bwa Deluxe bw'Umutuzo",
    captionEn: "An oasis of restful tranquility with premium orthopedic mattress, upholstered pillows, ambient reading lamps, and heavy blackout curtains.",
    captionRw: "Uburiri bw'agaciro buteye amabengeza, amatara atuje yo gusoma, n'umutuzo usesuye wo kuruhuka neza.",
    locationEn: "Deluxe Wing",
    locationRw: "Mu Gice cya Deluxe",
  },
  // 18. Hollywood Bar Counter
  {
    id: "hollywood-bar-counter",
    src: "/bar.webp",
    category: "dining",
    tagEn: "Bar & Cocktails",
    tagRw: "Hollywood Bar",
    titleEn: "The Signature Hollywood Bar Counter",
    titleRw: "Kawoitari ya Hollywood Bar",
    captionEn: "The beating heart of our nightlife: craft beers, international spirits, sparkling wines, and cocktail service with live music on weekends.",
    captionRw: "Akabari kagezweho karimo inzoga z'amoko yose, imitobe, n'inzoga zikonje ziteguwe n'abahanga, karangwa n'umuziki mwiza.",
    locationEn: "Hollywood Bar & Lounge",
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
    captionEn: "Spacious indoor banquet and corporate event hall featuring state-of-the-art acoustics, multiple display monitors, and a keynote podium.",
    captionRw: "Icyumba kigari cy'inama cyakira abantu benshi, gifite amashusho meza ya televiziyo, mikoro, n'amatara meza yo mu gisenge.",
    locationEn: "Events Center Wing",
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
    captionEn: "A storybook setting for wedding ceremonies and grand receptions with white silk canopies, ceremonial carpet aisle, and flower borders.",
    captionRw: "Urubuga rwiza rw'ubukwe mu busitani, ruteguwe n'amahema yera y'agaciro, inzira nziza y'abageni n'amatara arabagirana.",
    locationEn: "Grand Garden Lawn",
    locationRw: "Mu Busitani Bunini bw'Ibirori",
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
    captionEn: "Natural cedar-paneled thermal sauna designed for deep muscular relief, detoxification, and peaceful revitalization.",
    captionRw: "Icyumba cya Sawuna kigarura imbaraga mu mubiri, gifite ubushyuhe bwiza n'intebe z'imbaho z'umwimerere.",
    locationEn: "Spa & Wellness Suite",
    locationRw: "Mu Gice cya Spa na Sawuna",
  },
  // 22. Fitness Gym
  {
    id: "fitness-gym-studio",
    src: "/gym.webp",
    category: "wellness",
    tagEn: "Gym & Recovery",
    tagRw: "Imyitozo n'Umutuzo",
    titleEn: "Fitness Gym & Zero-Gravity Massage",
    titleRw: "Icyumba cy'Imyitozo Ngororamubiri (Gym)",
    captionEn: "Stay fit on professional treadmills, bikes, and free weights, or sink into luxury zero-gravity robotic massage chairs after a workout.",
    captionRw: "Ibikoresho bigezweho byo gukora siporo, amagare, amamashini yo kwirukaho, n'intebe zikora massage zikomeye.",
    locationEn: "Ground Floor Wellness Center",
    locationRw: "Mu Kigo cy'Ubutagatifu bwo Kuruhande",
  },
  // 23. Private Massage Room
  {
    id: "massage-therapy-room",
    src: "/massage.webp",
    category: "wellness",
    tagEn: "Massage Suite",
    tagRw: "Icyumba cya Massage",
    titleEn: "Private Spa & Body Therapy Suite",
    titleRw: "Icyumba cya Massage cy'Umwihariko",
    captionEn: "Tranquil massage room featuring a cushioned hardwood therapy bed, hot water shower, and soothing aromatherapy ambiance.",
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
    captionEn: "Generous interlocking-brick parking facilities with round-the-clock security surveillance, guard gates, and perimeter palm hedges.",
    captionRw: "Parikingi nini ifite amakaro meza, uburinzi bukora amasaha 24 kuri 24 n'umutekano wizewe w'ibinyabiziga byose.",
    locationEn: "Main Entrance Courtyard",
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
    captionEn: "The illuminated multi-wing hotel glows against the Rwandan night sky with architectural floodlights reflecting off paved stones.",
    captionRw: "Inyubako yose ya Hollywood Hotel irabagirana nijoro munsi y'inyenyeri, yaka amatara y'agaciro mu busitani no ku nyubako.",
    locationEn: "Full Property Exterior",
    locationRw: "Amashusho Yose y'Inyubako",
  },
  // 26. Twilight Sunset Facade
  {
    id: "hotel-evening-sunset",
    src: "/evening.webp",
    category: "architecture",
    tagEn: "Sunset Vista",
    tagRw: "Izuba Rirenze",
    titleEn: "Golden Hour Sunset Over the Hotel",
    titleRw: "Umusozo w'Umunsi kuri Hollywood Hotel",
    captionEn: "Deep twilight blues blend with warm amber architectural lights as evening descends on Rwimiyaga.",
    captionRw: "Ibihe byiza by'akagoroba izuba rirenze, aho inyubako yaka amatara meza acanye hejuru y'ubusitani.",
    locationEn: "Exterior Driveway View",
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
    captionEn: "Crisp daytime perspective showing the clean geometric lines, landscaped gardens, and quiet countryside atmosphere of Nyagatare.",
    captionRw: "Inyubako yose ku manywa y'ihangu mu mucyo mwiza, igaragaza ubwiza bwayo n'isuku yo ku rwego rwo hejuru.",
    locationEn: "Main Compound Grounds",
    locationRw: "Urubuga rwose rwa Hoteli",
  },
  // 28. Daylight Reception Counter
  {
    id: "reception-daylight",
    src: "/reception.webp",
    category: "architecture",
    tagEn: "Welcome Desk",
    tagRw: "Ahabakirirwa",
    titleEn: "Daylight Concierge & Reception",
    titleRw: "Ibiro byo Kwakirirwamo ku Manywa",
    captionEn: "Bright sunlit check-in foyer with polished stone floors, comfortable visitor seating, and 24/7 attentive guest service.",
    captionRw: "Aho bakirira abashyitsi ku manywa, hose hakeye kandi hateguye kwakira abagana hoteli bose neza.",
    locationEn: "Lobby Front Desk",
    locationRw: "Ku Ibiro Bikuru Byakira Abantu",
  },
  // 29. Fine Dining & Restaurant Service
  {
    id: "restaurant-dining",
    src: "/lunch.png",
    category: "dining",
    tagEn: "Fine Dining",
    tagRw: "Amafunguro Meza",
    titleEn: "In-House Gourmet Dining",
    titleRw: "Resitora y'Amafunguro Aryoshe",
    captionEn: "Savor chef-curated breakfast, lunch, and candlelit dinners blending authentic Rwandan specialties with international gastronomy.",
    captionRw: "Sogongera ku mafunguro meza ateguwe n'abahanga, arimo iby'iwacu n'iby'amahanga ku ifunguro rya mu gitondo, saa sita n'umugoroba.",
    locationEn: "Main Hotel Restaurant",
    locationRw: "Muri Resitora Nkuru",
  },
  // 30. Craft Drinks & Cocktails
  {
    id: "drinks-cocktails",
    src: "/drinks.png",
    category: "dining",
    tagEn: "Signature Drinks",
    tagRw: "Ibinyobwa n'Imitobe",
    titleEn: "Artisan Cocktails & Refreshments",
    titleRw: "Ibinyobwa Byiza n'Amahanga",
    captionEn: "Cool off with freshly pressed tropical juices, iced coffee creations, signature mocktails, and imported wines.",
    captionRw: "Iruhukire unywe imitobe y'imbuto z'umwimerere, ikawa ikonje, na za cocktails zidasanzwe.",
    locationEn: "Hollywood Bar & Lounge",
    locationRw: "Muri Hollywood Bar",
  },
  // 31. Outdoor Catering Banquet
  {
    id: "outdoor-catering",
    src: "/food.png",
    category: "dining",
    tagEn: "Catering & Buffets",
    tagRw: "Amafunguro y'Ibirori",
    titleEn: "Grand Event Catering & Buffets",
    titleRw: "Itegurwa ry'Amafunguro mu Birori",
    captionEn: "Exceptional outside catering services for celebrations, conferences, and weddings across the Eastern Province.",
    captionRw: "Serivisi y'icyitegererezo yo gutegura amafunguro mu birori n'inama ahantu hose mu Ntara y'Iburasirazuba.",
    locationEn: "Events & Catering Service",
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
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");
  const [copiedLink, setCopiedLink] = useState(false);

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
        location.includes(q) ||
        photo.category.includes(q)
      );
    });
  }, [activeCategory, searchQuery, isRw]);

  // Handle Lightbox Navigation
  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((prev) => ((prev! + 1) % filteredPhotos.length));
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

  // Keyboard navigation for lightbox
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
        handleNextPhoto(); // Swiped left -> next
      } else {
        handlePrevPhoto(); // Swiped right -> prev
      }
    }
    setTouchStartX(null);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const categories = [
    { id: "all", label: t.allFilter || (isRw ? "Amafoto Yose" : "All Photos"), count: TOUR_PHOTOS.length, icon: Compass },
    { id: "gardens", label: t.gardensFilter || (isRw ? "Ubusitani n'Amariba" : "Gardens & Fountains"), count: TOUR_PHOTOS.filter(p => p.category === "gardens").length, icon: Trees },
    { id: "architecture", label: t.architectureFilter || (isRw ? "Inyubako n'Imbuga" : "Architecture & Grounds"), count: TOUR_PHOTOS.filter(p => p.category === "architecture").length, icon: Hotel },
    { id: "rooms", label: t.roomsFilter || (isRw ? "Ibyumba by'Ubwiza" : "Rooms & Suites"), count: TOUR_PHOTOS.filter(p => p.category === "rooms").length, icon: Bed },
    { id: "dining", label: t.diningFilter || (isRw ? "Amafunguro & Bar" : "Dining & Lounge"), count: TOUR_PHOTOS.filter(p => p.category === "dining").length, icon: Wine },
    { id: "wellness", label: t.eventsFilter || (isRw ? "Sawuna, Gym & Ibirori" : "Wellness & Events"), count: TOUR_PHOTOS.filter(p => p.category === "wellness").length, icon: Flame },
  ];

  return (
    <div className="pt-20 min-h-screen bg-neutral-50/50 pb-28">
      {/* === HERO SECTION === */}
      <section className="relative bg-white border-b border-gray-200 overflow-hidden pt-12 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold/15 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 border border-gold/40 shadow-sm"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>{t.badge || "Photographic Tour & Hidden Highlights"}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 tracking-tight leading-tight mb-5"
            >
              {t.title || (isRw ? "Tembera Buri Nguni ya Hollywood Hotel" : "Explore Every Corner of Hollywood Hotel")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-8"
            >
              {t.subtitle ||
                (isRw
                  ? "Irebere ubusitani bwiza bwuje amahumbezi, amariba y'amazi arimbishijwe amatara, ahabanza ho kwidagadurira na pool table, ibyumba by'agaciro n'ahantu h'ibirori i Rwimiyaga, Nyagatare."
                  : "Discover our lush gardens with wooden swings, illuminated courtyard fountain, open-air sports lounge, luxury suites, and secluded relaxation havens in Rwimiyaga, Nyagatare.")}
            </motion.p>

            {/* Quick highlights bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-700"
            >
              <span className="bg-gray-100/90 border border-gray-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                📸 {TOUR_PHOTOS.length} {isRw ? "Amafoto Mazima" : "Full-Resolution Views"}
              </span>
              <span className="bg-gray-100/90 border border-gray-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                🌿 {isRw ? "Ubusitani n'Imiduri" : "Courtyard Swings & Greenery"}
              </span>
              <span className="bg-gray-100/90 border border-gray-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                ⛲ {isRw ? "Iriba ry'Amazi" : "Illuminated Spring Fountain"}
              </span>
              <span className="bg-gray-100/90 border border-gray-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                🎱 {isRw ? "Terasi y'Imikino" : "Open-Air Sports & Pool Bar"}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === NOTICE BANNER FOR NEWLY FEATURED PHOTOS === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-amber-500/10 via-gold/20 to-amber-500/10 border border-gold/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-gold rounded-xl text-black shrink-0 mt-0.5 sm:mt-0 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                {isRw
                  ? "Duhereye ku bice bishya n'ibihariye bitari biri ku rubuga!"
                  : "Starting with exclusive photos never before showcased on the website!"}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {isRw
                  ? "Reba ubusitani bwiza n'imiduri (garden), iriba ry'amazi (spring), imbere y'inzu (front), terasi ya pool table n'ibindi byinshi."
                  : "Explore the garden swings, inner courtyard fountain, modern entrance facade, sports billiards lounge, and presidential suite."}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-black bg-white hover:bg-gray-50 border border-black/10 px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0 self-end sm:self-auto cursor-pointer"
          >
            {copiedLink ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
            <span>{copiedLink ? (isRw ? "Byakoporowe!" : "Link Copied!") : (isRw ? "Sangiza Tour" : "Share Tour")}</span>
          </button>
        </div>
      </div>

      {/* === CONTROLS & FILTER TABS BAR === */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-y border-gray-200 mt-6 shadow-xs py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Horizontal scrollable category filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-gold" : "text-gray-500"} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Layout toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder || (isRw ? "Shakisha..." : "Search photos...")}
                className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Layout Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
              <button
                onClick={() => setViewMode("cards")}
                title="Curated Tour Cards"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === "cards" ? "bg-white text-black shadow-xs font-bold" : "text-gray-500 hover:text-black"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Compact Grid"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-black shadow-xs font-bold" : "text-gray-500 hover:text-black"
                }`}
              >
                <Square size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* === PHOTO RESULTS COUNT === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between text-xs sm:text-sm text-gray-500 font-medium">
        <div>
          <span>{t.showing || (isRw ? "Hagaragaye" : "Showing")} </span>
          <span className="font-bold text-gray-900">{filteredPhotos.length}</span>
          <span> {t.of || (isRw ? "kuri" : "of")} </span>
          <span className="font-bold text-gray-900">{TOUR_PHOTOS.length}</span>
          <span> {t.photos || (isRw ? "amafoto ya hoteli" : "views across the hotel")}</span>
          {activeCategory !== "all" && (
            <span className="ml-2 text-gold-dark font-semibold">
              • {categories.find((c) => c.id === activeCategory)?.label}
            </span>
          )}
        </div>
        {activeCategory !== "all" || searchQuery ? (
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-bold text-black hover:text-amber-700 underline cursor-pointer"
          >
            {t.resetFilter || (isRw ? "Tangira Bushya" : "Reset Filter")}
          </button>
        ) : null}
      </div>

      {/* === PHOTO GALLERY GRID === */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 mt-6 shadow-sm">
            <Compass size={44} className="mx-auto text-gold mb-4" />
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
              {t.noResults || (isRw ? "Nta foto ibonetse" : "No photos found matching your criteria")}
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {isRw
                ? "Gerageza gukoresha irindi jambo cyangwa ukande kuri 'Amafoto Yose'."
                : "Try searching with a different term or reset your active filters to explore all areas."}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="bg-black hover:bg-gold hover:text-black text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              {t.resetFilter || (isRw ? "Reba Amafoto Yose" : "View All Photos")}
            </button>
          </div>
        ) : viewMode === "cards" ? (
          /* CURATED TOUR CARDS (ELEGANT ON MOBILE & DESKTOP) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPhotos.map((photo, index) => {
              const title = isRw ? photo.titleRw : photo.titleEn;
              const caption = isRw ? photo.captionRw : photo.captionEn;
              const tag = isRw ? photo.tagRw : photo.tagEn;
              const location = isRw ? photo.locationRw : photo.locationEn;

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-gold hover:shadow-xl transition-all duration-300 flex flex-col relative"
                >
                  {/* Photo Frame */}
                  <div
                    onClick={() => setLightboxIndex(index)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 cursor-pointer"
                  >
                    <Image
                      src={photo.src}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/10 shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        {tag}
                      </span>

                      {photo.isNewHighlight && (
                        <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles size={11} />
                          {isRw ? "Gishya" : "Highlight"}
                        </span>
                      )}
                    </div>

                    {/* Expand overlay button on hover / tap */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      title={t.viewDetails || "Tap to expand view"}
                      aria-label="Expand image"
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-gold text-black p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                    >
                      <Maximize2 size={16} />
                    </button>

                    {/* Photo number index indicator */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Card Content & Caption */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-2">
                      <MapPin size={13} className="text-gold shrink-0" />
                      <span>{location}</span>
                    </div>

                    <h2
                      onClick={() => setLightboxIndex(index)}
                      className="text-xl font-heading font-black text-gray-900 group-hover:text-amber-600 transition-colors cursor-pointer mb-2.5 leading-snug"
                    >
                      {title}
                    </h2>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                      {caption}
                    </p>

                    {/* Bottom Card Actions */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setLightboxIndex(index)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-amber-600 transition-colors cursor-pointer"
                      >
                        <Eye size={14} className="text-gold" />
                        <span>{isRw ? "Reba Ifoto Yuzuye" : "View Full Size"}</span>
                      </button>

                      <Link
                        href={`/${lang}/book`}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-gray-50 hover:bg-gold hover:text-black text-gray-800 px-3 py-1.5 rounded-full border border-gray-200 transition-all"
                      >
                        <span>{isRw ? "Gana Hoteli" : "Experience"}</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* COMPACT PHOTO GRID */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPhotos.map((photo, index) => {
              const title = isRw ? photo.titleRw : photo.titleEn;
              const tag = isRw ? photo.tagRw : photo.tagEn;

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                >
                  <Image
                    src={photo.src}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between" />
                  
                  {/* Subtle top indicator */}
                  {photo.isNewHighlight && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                      {isRw ? "Gishya" : "Highlight"}
                    </span>
                  )}

                  {/* Caption on hover/touch */}
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gold font-bold block">{tag}</span>
                    <span className="font-heading font-black line-clamp-1">{title}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* === BOTTOM CTA BANNER === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-black text-white rounded-3xl p-8 sm:p-12 border-2 border-gold/40 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/15 rounded-full blur-[90px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block mb-2">
              {isRw ? "Ubwiza n'Umutuzo Bwite" : "Live the Hollywood Experience"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black mb-4">
              {isRw
                ? "Witeguye Kwirebera Ubu Bwiza n'Amaso Yawe?"
                : "Ready to Experience Hollywood Hotel in Person?"}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              {isRw
                ? "Sura hoteli yacu i Rwimiyaga, Nyagatare cyangwa ubike icyumba cyawe nonaha. Twiteguye kuguha ibihe bidasanzwe n'akanyamuneza."
                : "Book your luxury suite today or contact our front desk for event inquiries, wedding garden bookings, and corporate conferences."}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={`/${lang}/book`}
                className="bg-gold hover:bg-gold-light text-black px-8 py-3.5 rounded-full font-bold text-center text-sm sm:text-base transition-all shadow-md hover:-translate-y-0.5"
              >
                {t.bookRoom || (isRw ? "Saba Icyumba Nonaha" : "Book Your Suite")}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-center text-sm sm:text-base transition-all"
              >
                {t.inquire || (isRw ? "Twandikire / Tubaze" : "Contact & Inquiries")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === FULL-SCREEN LIGHTBOX MODAL === */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black/60 border-b border-white/10 z-20">
              <div className="flex items-center gap-3">
                <span className="bg-gold text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {isRw ? activePhoto.tagRw : activePhoto.tagEn}
                </span>
                <span className="text-gray-300 text-xs sm:text-sm font-semibold">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-white hover:text-gold transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                  title="Share / Copy Link"
                >
                  {copiedLink ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                </button>
                <button
                  onClick={handleCloseLightbox}
                  className="p-2 text-white hover:text-gold transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                  title="Close (Esc)"
                  aria-label="Close photo preview"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Main Stage with Image & Navigation */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
              {/* Prev Button */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-6 z-30 p-2.5 sm:p-4 rounded-full bg-black/60 hover:bg-gold hover:text-black text-white transition-all backdrop-blur-md border border-white/15 cursor-pointer shadow-lg active:scale-90"
                title="Previous photo (Arrow Left)"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Central Photo */}
              <div className="relative w-full h-full max-w-5xl max-h-[72vh] flex items-center justify-center">
                <Image
                  src={activePhoto.src}
                  alt={isRw ? activePhoto.titleRw : activePhoto.titleEn}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-6 z-30 p-2.5 sm:p-4 rounded-full bg-black/60 hover:bg-gold hover:text-black text-white transition-all backdrop-blur-md border border-white/15 cursor-pointer shadow-lg active:scale-90"
                title="Next photo (Arrow Right)"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Info Bar */}
            <div className="bg-black/90 border-t border-white/10 px-4 sm:px-8 py-4 sm:py-5 z-20">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-gold font-bold mb-1">
                    <MapPin size={13} />
                    <span>{isRw ? activePhoto.locationRw : activePhoto.locationEn}</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-heading font-black text-white mb-1.5 leading-snug">
                    {isRw ? activePhoto.titleRw : activePhoto.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    {isRw ? activePhoto.captionRw : activePhoto.captionEn}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/${lang}/book`}
                    className="bg-gold hover:bg-gold-light text-black px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md text-center"
                  >
                    {t.bookRoom || (isRw ? "Saba Icyumba" : "Book This Stay")}
                  </Link>
                  <Link
                    href={`/${lang}/contact`}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all text-center"
                  >
                    {t.inquire || (isRw ? "Twandikire" : "Contact")}
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
