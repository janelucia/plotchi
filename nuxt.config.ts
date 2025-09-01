import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,
  },

  modules: ["@nuxt/image", "@nuxt/icon"],

  devServer: {
    https: true,
  },

  css: ["./app/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'your-secret-key-change-in-production'
  }
});
