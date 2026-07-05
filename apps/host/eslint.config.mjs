import { defineConfig } from 'eslint/config';
import reactConfig from '@shop-builder/eslint-config/react';

export default defineConfig({
	extends: [reactConfig],
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unused-vars': 'warn',
		'react/no-unescaped-entities': 'warn',
		'react-hooks/set-state-in-effect': 'warn',
	},
});
