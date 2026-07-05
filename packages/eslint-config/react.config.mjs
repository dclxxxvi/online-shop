import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

import base from './base.config.mjs'

export default defineConfig({
		extends: [base, react.configs.flat.recommended, reactHooks.configs.flat.recommended],
		files: ["**/*.{ts,tsx,mts}"],
		settings: {
			react: {
				version: "detect",
			},
		},
});
