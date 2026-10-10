import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hollywood Hotel",
    short_name: "Hollywood",
    description:
      "Premier luxury hotel in Rwimiyaga, Eastern Province, Rwanda. Offering luxury accommodations, conference halls, Hollywood Bar, wellness spa, and exquisite dining.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B0B",
    theme_color: "#D4AF37",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
