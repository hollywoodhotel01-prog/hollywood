import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hollywoodhotel.rw";
  const now = new Date();

  const routes = [
    {
      path: "",
      changeFrequency: "daily" as const,
      priority: 1.0,
      images: [
        `${baseUrl}/hero.webp`,
        `${baseUrl}/night.webp`,
        `${baseUrl}/evening.webp`,
      ],
    },
    {
      path: "/rooms",
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: [`${baseUrl}/bed.webp`],
    },
    {
      path: "/book",
      changeFrequency: "daily" as const,
      priority: 0.9,
      images: [`${baseUrl}/bed.webp`],
    },
    {
      path: "/dining",
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [
        `${baseUrl}/bar.webp`,
        `${baseUrl}/food.png`,
        `${baseUrl}/drinks.png`,
      ],
    },
    {
      path: "/conference",
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [`${baseUrl}/salle.webp`, `${baseUrl}/weed.webp`],
    },
    {
      path: "/facilities",
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [
        `${baseUrl}/garden.webp`,
        `${baseUrl}/gym.webp`,
        `${baseUrl}/sauna.webp`,
        `${baseUrl}/hollywood-bar.webp`,
      ],
    },
    {
      path: "/wellness",
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [`${baseUrl}/massage.webp`, `${baseUrl}/sauna.webp`],
    },
    {
      path: "/gym",
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [`${baseUrl}/gym.webp`],
    },
    {
      path: "/contact",
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [`${baseUrl}/front.webp`],
    },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    // Canonical root route entry
    entries.push({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${route.path}`,
          rw: `${baseUrl}/rw${route.path}`,
          "x-default": `${baseUrl}/en${route.path}`,
        },
      },
      images: route.images,
    });

    // English localized route
    entries.push({
      url: `${baseUrl}/en${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: Number((route.priority * 0.95).toFixed(2)),
      alternates: {
        languages: {
          en: `${baseUrl}/en${route.path}`,
          rw: `${baseUrl}/rw${route.path}`,
          "x-default": `${baseUrl}/en${route.path}`,
        },
      },
      images: route.images,
    });

    // Kinyarwanda localized route
    entries.push({
      url: `${baseUrl}/rw${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: Number((route.priority * 0.95).toFixed(2)),
      alternates: {
        languages: {
          en: `${baseUrl}/en${route.path}`,
          rw: `${baseUrl}/rw${route.path}`,
          "x-default": `${baseUrl}/en${route.path}`,
        },
      },
      images: route.images,
    });
  }

  return entries;
}
