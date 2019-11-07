module.exports = {
  "extends": "airbnb-base",
  "env": {
    "browser": true,
  },
  "rules": {
    "linebreak-style": 0,
    "comma-dangle": ["error", "never"],
    "no-use-before-define": ["error", {
      "functions": false,
      "classes": true
    }],
    "space-before-function-paren": ["error", "never"],
    "func-names": ["error", "never"],
    "no-plusplus": ["error", {
      "allowForLoopAfterthoughts": true
    }],
    "no-param-reassign": ["error", {
      "props": false
    }],
    "operator-linebreak": ["error", "after"],
    "no-nested-ternary": 0,
    "consistent-return": 0,
    "eol-last": 0,
    "max-len": ["error", {
      "code": 150
    }],
    "prefer-default-export": 0
  }
};