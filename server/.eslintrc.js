module.exports = {
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "env": {
        "browser": false,
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "prefer-const": ["error", {
            "destructuring": "any",
            "ignoreReadBeforeAssign": false
        }]
    }
};
