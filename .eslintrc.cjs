// .eslintrc.cjs
module.exports = {
  root: true,
  ignorePatterns: [
    '**/.next/**',
    '**/dist/**',
    // ignore any JS scripts you don’t want linted against your TS project
    'apps/nextjs-app/scripts/**/*.js',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],     // your root TS config
    tsconfigRootDir: __dirname,
    ecmaVersion: 2023,
    sourceType: 'module',
  },

  plugins: ['@nx', '@typescript-eslint', 'import'],

  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    // disable Next’s “no pages dir” check
    'next/no-html-link-for-pages': 'off',

    // keep no-explicit-any on by default
    '@typescript-eslint/no-explicit-any': 'error',

    // your monorepo boundaries
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        // allow CJS-style overrides and content-collections imports:
        allow: [
          '^.*/eslint\\.config\\.[cm]?js$',
          'content-collections',        // bare import
          'content-collections/.*'      // sub-paths
        ],
        depConstraints: [
          { sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }
        ],
      },
    ],

    // lower unused‐vars from error → warn, ignore args starting with _
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // your Jest config warning—you can turn it off or adjust per taste
    'import/no-anonymous-default-export': 'off',
  },

  overrides: [
    // turn off `no-explicit-any` in our app/ component and API routes
    {
      files: ['apps/nextjs-app/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // for plain JS files, drop the TS parserOptions.project requirement entirely
      files: ['*.js', '**/*.js'],
      parserOptions: {
        project: null,
      },
      rules: {
        // if you like, you can turn off TS-plugin rules entirely here:
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],

  settings: {
    react: { version: 'detect' },
  },
};
