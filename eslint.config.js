import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      //'no-undef': 'off',
      //'@typescript-eslint/no-empty-function': 'off',
      //'@typescript-eslint/no-unused-vars': 'off',
    },
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    }
  },
  {
    files: ["assets/**/*.ts"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto",
        }
      ]
    },
  },
  {
    ignores: [
      "build/",
      "temp/",
      "library/",
      "local/",
      "node_modules/",
      "**/*.d.ts",
      "**/*.js",
    ],
  },
);