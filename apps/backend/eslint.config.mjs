import { defineConfig } from 'eslint/config';
import nestConfig from '@shop-builder/eslint-config/nest';
import tseslint from 'typescript-eslint';

export default defineConfig({
	extends: [nestConfig],
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
	},
});
