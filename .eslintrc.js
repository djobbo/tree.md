module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": "error",
    },
    env: {
        es2021: true,
        node: true,
    },
}
