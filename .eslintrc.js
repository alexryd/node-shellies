module.exports = {
  "env": {
    "node": true
  },

  "extends": [
    "eslint:recommended",
    "standard"
  ],

  "rules": {
    "comma-dangle": ["error", "only-multiline"],

    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }]
  }
}
