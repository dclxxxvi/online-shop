import { defineConfig } from "eslint/config";
import base from './base.config.mjs'

export default defineConfig({
	extends: [base],
	files: ["**/*.{ts,mts}"],
	rules: [],
});
