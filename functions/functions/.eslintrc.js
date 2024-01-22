module.exports = {
  root: true,
  env: {
    es2024: true,
    node: true,
  },
  extends: ["eslint:recommended"], // Remove "plugin:prettier/recommended"
  plugins: [], // Remove "prettier"
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2],
    "require-jsdoc": "off",
  },
};
