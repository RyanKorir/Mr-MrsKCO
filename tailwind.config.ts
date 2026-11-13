import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { emerald: { deep: "#0a3d2b", stage: "#0f6b49" }, gold: "#d4a537", ivory: "#f6f1e4" },
    fontFamily: { display: ["var(--font-display)", "serif"], body: ["var(--font-body)", "sans-serif"] } } },
  plugins: [] } satisfies Config;
