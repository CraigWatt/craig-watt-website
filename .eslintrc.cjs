// .eslintrc.cjs
module.exports = {
  root: true,
  ignorePatterns: [
    '**/.next/**',
    '**/dist/**',
    '**/out/**',
    '**/storybook-static/**',
    'services/website/scripts/**/*.js',
    '**/next-env.d.ts',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaVersion: 2023,
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint', 'import'],

  extends: [
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    // Warn about unused vars—but ignore ones prefixed with `_`
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // Allow anonymous default exports
    'import/no-anonymous-default-export': 'off',
  },

  overrides: [
    {
      // Plain JS / MJS files: no TS project, no unused-vars
      files: ['*.js', '**/*.js', '*.mjs', '**/*.mjs'],
      parserOptions: { project: null },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],

  settings: {
    react: { version: 'detect' },
  },
};
