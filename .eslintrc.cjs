// .eslintrc.cjs
module.exports = {
  root: true,
  ignorePatterns: [
    '**/.next/**',
    '**/dist/**',
    'apps/nextjs-app/scripts/**/*.js',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaVersion: 2023,
    sourceType: 'module',
  },

  plugins: ['@nx', '@typescript-eslint', 'import'],

  extends: [
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    // NX monorepo boundaries
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: [
          '^.*/eslint\\.config\\.[cm]?js$',
          'content-collections',
          'content-collections/.*',
        ],
        depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
      },
    ],

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
      // Plain JS files: no TS project, no unused-vars
      files: ['*.js', '**/*.js'],
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
