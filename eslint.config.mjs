import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Allow common external packages and resolved node_modules paths so editor/TS
          // resolution doesn't create false positives for normal npm imports.
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^react($|/)',
            '^react-dom($|/)',
            '^react-router-dom($|/)',
            '^react-redux($|/)',
            '^@reduxjs/toolkit($|/)',
            '^redux-saga($|/)',
            '^redux-saga/effects($|/)',
            '^recharts($|/)',
            '^react-hook-form($|/)',
            '^react-toastify($|/)',
            '^axios($|/)',
            '^uuid($|/)',
            '.*node_modules.*',
            // Generic npm package pattern (allows scoped and hyphenated package names)
            '^(@?[-a-zA-Z0-9]+)(/.*)?$',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
