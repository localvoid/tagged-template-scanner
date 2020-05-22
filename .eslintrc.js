const JS_RULES = {
  "comma-dangle": ["error", "always-multiline"],
  "eqeqeq": ["error", "smart"],
  "indent": ["error", 2],
  "linebreak-style": ["error", "unix"],
  "new-parens": "error",
  "no-caller": "error",
  "no-cond-assign": "off",
  "no-console": "error",
  "no-constant-condition": "off",
  "no-debugger": "error",
  "no-eval": "error",
  "no-fallthrough": "off",
  "no-new-wrappers": "error",
  "no-prototype-builtins": "off",
  "no-shadow": ["error", { "hoist": "all" }],
  "no-throw-literal": "error",
  "no-trailing-spaces": "error",
  "no-undef": "off",
  "no-undef-init": "error",
  "no-unused-expressions": "error",
  "no-var": "error",
  "one-var": ["error", "never"],
  "prefer-const": "off",
  "prefer-rest-params": "off",
  "prefer-spread": "off",
  "radix": "error",
  "semi": ["error", "always"],
};

module.exports = {
  root: true,
  env: {
    "es6": true,
    "node": true,
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  rules: JS_RULES,
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      plugins: [
        "@typescript-eslint",
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        ...JS_RULES,
        "indent": "off",
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": ["off", { "accessibility": "explicit" }],
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/unified-signatures": "off",
      },
    },
  ],
};
