import { defineConfig } from 'eslint/config';
import baseConfig from '@shop-builder/eslint-config/base';
import tseslint from 'typescript-eslint';

export default defineConfig({
	extends: [baseConfig],
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unused-vars': 'warn',
	},
});
