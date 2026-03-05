// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-jakarta)"],
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                popover: "var(--popover)",
                "popover-foreground": "var(--popover-foreground)",
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                secondary: "var(--secondary)",
                "secondary-foreground": "var(--secondary-foreground)",
                muted: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
                accent: "var(--accent-color)",
                "accent-foreground": "var(--accent-foreground)",
                destructive: "var(--destructive)",
                "destructive-foreground": "var(--destructive-foreground)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                // Memora brand tokens
                "bg-base": "var(--bg-base)",
                "bg-surface": "var(--bg-surface)",
                "bg-raised": "var(--bg-raised)",
                "text-primary": "var(--text-primary)",
                "text-muted": "var(--text-muted)",
                "brand-accent": "var(--accent)",
                "accent-light": "var(--accent-light)",
                success: "var(--success)",
                warning: "var(--warning)",
                danger: "var(--danger)",
            },
            transitionDuration: {
                instant: "var(--duration-instant)",
                fast: "var(--duration-fast)",
                base: "var(--duration-base)",
                answer: "var(--duration-answer)",
                progress: "var(--duration-progress)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
