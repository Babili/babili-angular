import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config({
    ignores: [
        "projects/**/*",
        "dist/**/*",
        "node_modules/**/",
        "**/*.spec.ts",
        "**/*.js",
        "**/node_modules",
        "**/dist",
    ],
}, {
    files: ["**/*.ts"],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
        quotes: ["error", "double"],
        semi: ["error"],
        "prefer-arrow-callback": ["error"],
        "no-inferrable-types": "off",
        "@angular-eslint/prefer-standalone": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],
    },
});