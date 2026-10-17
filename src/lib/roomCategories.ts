export interface RoomAmenity {
  name: string;
  iconName: "Wifi" | "Droplets" | "Shirt" | "Sun" | "Tv" | "Briefcase" | "Crown" | "Sparkles" | "Eye" | "Wind" | "Bed";
  photo?: string;
  detail?: string;
}

export interface RoomGalleryItem {
  title: string;
  image: string;
  tag: string;
  description?: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  slug: string;
  typeMatch: string[];
  defaultPrice: number;
  image: string;
  badge: string;
  shortDescription: string;
  checkoutOffer: string;
  detailedDescription: string;
  specs: {
    size: string;
    bed: string;
    capacity: string;
    view: string;
  };
  amenities: RoomAmenity[];
  gallery: RoomGalleryItem[];
}

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "standard",
    name: "Standard",
    slug: "standard",
    typeMatch: ["Standard", "Standard Room", "standard", "standard room"],
    defaultPrice: 50000,
    image: "/sta.webp",
    badge: "Essential Comfort",
    shortDescription: "Offered with fast Wi-Fi, clean modern bathroom, and spacious wardrobe.",
    checkoutOffer: "Offered with Wi-Fi, good bathroom and wardrobe.",
    detailedDescription: "Designed for effortless comfort and everyday relaxation. Features high-speed Wi-Fi connectivity, a pristine private bathroom, and a spacious wardrobe for all your luggage.",
    specs: {
      size: "26 m²",
      bed: "Queen Size Bed",
      capacity: "Up to 2 Guests",
      view: "Courtyard & Garden View",
    },
    amenities: [
      { name: "High-Speed Wi-Fi", iconName: "Wifi", detail: "Unlimited high-speed internet" },
      { name: "Good Bathroom", iconName: "Droplets", photo: "/bath.webp", detail: "Hot water shower & complimentary toiletries" },
      { name: "Spacious Wardrobe", iconName: "Shirt", photo: "/robe.webp", detail: "Built-in wardrobe with hangers & storage" },
      { name: "Fresh Air & Fan", iconName: "Wind", detail: "Natural ventilation & fresh breeze" },
    ],
    gallery: [
      { title: "Standard Room", image: "/sta.webp", tag: "Main Bedroom", description: "Comfortable Queen-size bed and modern finish" },
      { title: "Clean Bathroom", image: "/bath.webp", tag: "Good Bathroom", description: "Hot shower, fresh towels and modern basin" },
      { title: "Spacious Wardrobe", image: "/robe.webp", tag: "Wardrobe", description: "Built-in wardrobe with ample storage" },
    ],
  },
  {
    id: "superior",
    name: "Superior",
    slug: "superior",
    typeMatch: ["Superior", "Superior Room", "superior", "superior room", "Premium", "Premium Room"],
    defaultPrice: 80000,
    image: "/lux.webp",
    badge: "Fancy Sky View",
    shortDescription: "Features fancy sky view, high-speed Wi-Fi, modern bathroom, and elegant wardrobe.",
    checkoutOffer: "Offered with fancy sky view, Wi-Fi, modern bathroom and wardrobe.",
    detailedDescription: "An upgraded experience with breathtaking panoramic sky views. Relax with fast Wi-Fi, designer bathroom with modern fittings, and a full-size wardrobe.",
    specs: {
      size: "34 m²",
      bed: "King Size Bed",
      capacity: "Up to 2 Guests",
      view: "Panoramic Sky & City View",
    },
    amenities: [
      { name: "Fancy Sky View", iconName: "Eye", photo: "/lux.webp", detail: "Elevated high-floor window with sky horizon" },
      { name: "High-Speed Wi-Fi", iconName: "Wifi", detail: "Dedicated wireless access point" },
      { name: "Modern Bathroom", iconName: "Droplets", photo: "/bath.webp", detail: "Contemporary walk-in shower & stone sink" },
      { name: "Elegant Wardrobe", iconName: "Shirt", photo: "/robe.webp", detail: "Full-height wardrobe with interior lighting" },
    ],
    gallery: [
      { title: "Superior Room (Sky View)", image: "/lux.webp", tag: "Room", description: "Luxury king bed with expansive sky window" },
      { title: "Modern Bathroom", image: "/bath.webp", tag: "Bathroom", description: "Clean modern tiles, rainfall shower and towels" },
      { title: "Elegant Wardrobe", image: "/robe.webp", tag: "Wardrobe", description: "Generous hanging space and garment care" },
      { title: "Sunset Sky View", image: "/evening.webp", tag: "Sky View", description: "Golden hour views across Rwimiyaga" },
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    slug: "deluxe",
    typeMatch: ["Deluxe", "Deluxe Room", "deluxe", "deluxe room", "Luxury", "Luxury Room"],
    defaultPrice: 120000,
    image: "/bed.webp",
    badge: "Balcony & Working Office",
    shortDescription: "Modern room with balcony, high Wi-Fi, working office with sky view, wardrobe, TV, and modern bathroom.",
    checkoutOffer: "Offered with private balcony, high Wi-Fi, working office sky view, wardrobe, TV, and modern bathroom.",
    detailedDescription: "A luxurious retreat crafted for both leisure and business. Step out onto your private balcony, work with ease in the sky-view office desk, unwind with the flat-screen TV, and enjoy the designer bathroom.",
    specs: {
      size: "46 m²",
      bed: "King Suite Bed",
      capacity: "Up to 3 Guests",
      view: "Private Balcony & Sky View",
    },
    amenities: [
      { name: "Private Balcony", iconName: "Sun", photo: "/balcony.webp", detail: "Furnished balcony with fresh outdoor breeze" },
      { name: "High-Speed Wi-Fi", iconName: "Wifi", detail: "Ultra-fast Wi-Fi suitable for streaming & meetings" },
      { name: "Working Office (Sky View)", iconName: "Briefcase", photo: "/tv.webp", detail: "Ergonomic work desk with panoramic views" },
      { name: "Smart Flat Screen TV", iconName: "Tv", photo: "/tv.webp", detail: "HD satellite channels & entertainment" },
      { name: "Spacious Wardrobe", iconName: "Shirt", photo: "/robe.webp", detail: "Double wardrobe with secure luggage shelving" },
      { name: "Modern Bathroom", iconName: "Droplets", photo: "/bath.webp", detail: "En-suite glass shower & premium toiletries" },
    ],
    gallery: [
      { title: "Deluxe Bedroom", image: "/bed.webp", tag: "Modern Room", description: "Plush King bed with luxury linens" },
      { title: "Private Balcony", image: "/balcony.webp", tag: "Balcony", description: "Open-air patio to take in morning sunrise" },
      { title: "Smart TV & Media", image: "/tv.webp", tag: "TV", description: "Widescreen smart television for movies & news" },
      { title: "Working Office Setup", image: "/tv.webp", tag: "Working Office", description: "Quiet desk area for productivity and focus" },
      { title: "Deluxe Wardrobe", image: "/robe.webp", tag: "Wardrobe", description: "Deep closet space for all garments" },
      { title: "Modern En-Suite Bathroom", image: "/bath.webp", tag: "Bathroom", description: "Sparkling clean contemporary bathroom" },
    ],
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    slug: "executive-suite",
    typeMatch: ["Executive Suite", "Executive Room", "executive suite", "Presidential", "Presidential Suite", "Hollywood Suite"],
    defaultPrice: 200000,
    image: "/bed.webp",
    badge: "VIP Saloon & Big Balcony",
    shortDescription: "Big balcony, wardrobe, modern bathroom, sky view, and fancy saloon / VIP lounge.",
    checkoutOffer: "Offered with big balcony, spacious wardrobe, modern bathroom, sky view, and fancy saloon (VIP lounge).",
    detailedDescription: "The crown jewel of Hollywood Hotel. Boasts a massive private balcony, an exclusive fancy saloon / VIP lounge for entertaining, majestic sky views, a lavish modern bathroom, and top-tier guest care.",
    specs: {
      size: "72 m²",
      bed: "Master King Bed",
      capacity: "Up to 4 Guests",
      view: "Full 360° Panoramic Sky View",
    },
    amenities: [
      { name: "Fancy Saloon (VIP Lounge)", iconName: "Crown", photo: "/vip.webp", detail: "Private living lounge with luxury sofa seating" },
      { name: "Big Balcony", iconName: "Sun", photo: "/balcony.webp", detail: "Expansive terrace with outdoor lounge chairs" },
      { name: "Breathtaking Sky View", iconName: "Sparkles", photo: "/night.webp", detail: "Unobstructed horizon & night sky stargazing" },
      { name: "Modern Luxury Bathroom", iconName: "Droplets", photo: "/bath.webp", detail: "High-spec bathroom with rainfall shower & bathrobe" },
      { name: "Spacious Wardrobe", iconName: "Shirt", photo: "/robe.webp", detail: "Walk-in style wardrobe with full-length mirror" },
      { name: "Executive Bed Suite", iconName: "Bed", photo: "/bed.webp", detail: "Master bedroom with premium orthopedic mattress" },
    ],
    gallery: [
      { title: "Fancy Saloon / VIP Lounge", image: "/vip.webp", tag: "Fancy Saloon", description: "Exclusive private salon for dining and receiving guests" },
      { title: "Master Bed Suite", image: "/bed.webp", tag: "Room", description: "Palatial bedroom setup with ambient lighting" },
      { title: "Big Balcony Terrace", image: "/balcony.webp", tag: "Big Balcony", description: "Sunlit expansive terrace with horizon views" },
      { title: "Modern Luxury Bathroom", image: "/bath.webp", tag: "Modern Bathroom", description: "Pristine designer bathroom with luxury amenities" },
      { title: "Spacious Wardrobe", image: "/robe.webp", tag: "Wardrobe", description: "Deluxe wardrobe storage and dressing area" },
      { title: "Sky View at Night", image: "/night.webp", tag: "Sky View", description: "Magical night lights and star-filled sky" },
    ],
  },
];

/**
 * Resolves the live price for a given category using the roomsData set by reception.
 * Falls back to default category price.
 */
export function getCategoryPrice(
  categoryIdOrName: string,
  roomsData?: Array<{ type?: string; price?: number }>
): number {
  const norm = categoryIdOrName.toLowerCase().trim();
  const cat = ROOM_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === norm ||
      c.name.toLowerCase() === norm ||
      c.typeMatch.some((tm) => tm.toLowerCase() === norm)
  );

  if (roomsData && roomsData.length > 0) {
    // Look for exact or partial type match in rooms registered by reception
    const match = roomsData.find((r) => {
      if (!r.type) return false;
      const rType = r.type.toLowerCase().trim();
      if (cat) {
        return cat.typeMatch.some((tm) => tm.toLowerCase() === rType) || rType.includes(cat.id);
      }
      return rType === norm || rType.includes(norm);
    });

    if (match && typeof match.price === "number" && match.price > 0) {
      return match.price;
    }
  }

  return cat ? cat.defaultPrice : 50000;
}

/**
 * Matches any room name or query param to a RoomCategory object.
 */
export function findCategoryByQuery(query?: string | null): RoomCategory {
  if (!query) return ROOM_CATEGORIES[0];
  const q = query.toLowerCase().trim();
  const found = ROOM_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.slug.toLowerCase() === q ||
      c.typeMatch.some((tm) => tm.toLowerCase() === q || q.includes(tm.toLowerCase()))
  );
  return found || ROOM_CATEGORIES[0];
}
