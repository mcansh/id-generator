import tailwindFormsPlugin from "@tailwindcss/forms";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [tailwindFormsPlugin],
};
