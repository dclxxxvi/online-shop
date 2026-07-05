import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig({
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended
		],
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		rules: [],
		languageOptions: { globals: globals.browser }
});
