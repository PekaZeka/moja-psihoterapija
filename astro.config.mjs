import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://mojapsihoterapija.com",

  // All pages prerender to static HTML by default; only routes that opt out
  // with `export const prerender = false` (the /api/contact endpoint) are
  // rendered on-demand by the Node server.
  output: "static",
  adapter: node({ mode: "standalone" }),

  i18n: {
    defaultLocale: "sr",
    locales: ["sr", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "sr",
        locales: {
          sr: "sr",
          en: "en",
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});