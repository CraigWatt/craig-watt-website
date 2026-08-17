import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

export default [
  ...nextVitals,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/.next/**',
      '**/dist/**',
      '**/out/**',
      '**/storybook-static/**',
      'services/website/scripts/**/*.js',
      '**/next-env.d.ts',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      'import/no-anonymous-default-export': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
