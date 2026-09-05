import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kargosetu.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
// Add other public pages here if they exist
  ];
}
