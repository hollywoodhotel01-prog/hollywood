import { Image as ImageIcon } from "lucide-react";

interface PlaceholderImageProps {
  label: string;
  className?: string;
}

const labelToImageMap: Record<string, string> = {
  // Hero
  "Hero: Hotel Exterior": "/hero.png",

  // Home Page
  "Lobby / Reception Area": "/soloon.png",
  
  // Rooms & Suites
  "Photo: Standard Room": "/room.png",
  "Photo: Deluxe Room": "/room.png",
  "Photo: Executive Room": "/room.png",
  "Photo: Midland Suite": "/room.png",
  "Room View": "/room.png",
  
  // Conference Page
  "Conference Setup: U-Shape": "/conference.png",
  
  // Dining Page
  "Restaurant Dining Area": "/lunch.png",
  "Coffee Break Setup": "/drinks.png",
  "Outside Catering Setup": "/food.png",
  
  // Gym Page
  "Gym Interior & Equipment": "/gym.png",
};

export default function PlaceholderImage({ label, className = "" }: PlaceholderImageProps) {
  const imageUrl = labelToImageMap[label];

  // If we have an image mapped, render the actual image
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={label}
        className={`object-cover w-full h-full ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-navy-light dark:to-navy flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 rounded-lg ${className}`}
    >
      <ImageIcon size={32} className="mb-2 opacity-50" />
      <span className="text-xs font-medium uppercase tracking-wider opacity-70 px-4 text-center">
        Photo: {label}
      </span>
      {/* Decorative shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 animate-[shimmer_2s_infinite]"></div>
    </div>
  );
}
