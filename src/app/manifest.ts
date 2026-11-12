import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Dira Creative | Business OS",
    short_name: "Dira",
    description: "Building brands that communicate clearly, operate efficiently, and scale effectively.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f5f0",
    theme_color: "#0097b2",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/dira-icon.svg", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/dira-icon.svg", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/dira-icon.svg", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/dira-icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      
      { src: "/dira-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      {
        name: "Explore Dira services",
        short_name: "Services",
        description: "Browse brand and business development services",
        url: "/",
        icons: [{ src: "/dira-icon.svg", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "My account",
        short_name: "Account",
        description: "Review requests in this browser preview",
        url: "/?view=account",
        icons: [{ src: "/dira-icon.svg", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Owner Briefcase preview",
        short_name: "Briefcase",
        description: "Open the local owner workspace preview",
        url: "/#admin",
        icons: [{ src: "/dira-icon.svg", sizes: "192x192", type: "image/png" }]
      }
    ]
  };
}
