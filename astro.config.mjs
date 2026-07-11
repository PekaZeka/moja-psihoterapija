import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://mojapsihoterapija.com",

  // All pages prerender to static HTML by default; only routes that opt out
  // with `export const prerender = false` (the /api/contact endpoint) are
  // rendered on-demand by the Node server.
  output: "static",
  adapter: node({ mode: "standalone" }),

  // Trust the Host header from nginx for these domains; without this, Astro's
  // security default treats every request's origin as "localhost", which
  // breaks Keystatic's GitHub OAuth redirect_uri.
  security: {
    allowedDomains: [
      { hostname: "mojapsihoterapija.com", protocol: "https" },
      { hostname: "www.mojapsihoterapija.com", protocol: "https" },
    ],
  },

  // Locale routing is file-based (src/pages/sr/, src/pages/en/) with hardcoded
  // URLs; Astro's i18n routing config isn't used and it 404-flags non-locale
  // injected routes like /keystatic, so it stays off.

  integrations: [
    react(),
    keystatic(),
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