import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    languageOptions: {
        globals: {
            ...globals.node,
            process: true,
            module: true,
            require: true,
        },
    },

    rules: {
        "key-spacing": [2, {
            beforeColon: false,
            afterColon: true,
        }],

        indent: [2, 2],
        quotes: [2, "single"],
        "no-console": [0],
        semi: [2, "always"],
        "no-undef": 0,
    },
}];