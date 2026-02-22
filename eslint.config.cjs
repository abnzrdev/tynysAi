const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({});

module.exports = [
  ...compat.extends(["next/core-web-vitals", "next/typescript"]),
];
