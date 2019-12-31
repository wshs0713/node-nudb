module.exports = {
    root: true,
    parserOptions: {
      parser: 'babel-eslint',
      ecmaVersion: 8
    },
    env: {
      browser: true,
      es6: true,
      node: true,
      mocha: true
    },
    extends: ['eslint:recommended'],
    rules: {
      'import/extensions': ['error', 'always', {
        js: 'never',
        vue: 'never'
      }],
      'no-param-reassign': ['error', {
        props: true,
        ignorePropertyModificationsFor: [
          'state',  // for vuex state
          'acc',    // for reduce accumulators
          'e'       // for e.returnvalue
        ]
      }],
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-console': 'off',
      'linebreak-style': ['error', 'unix'],
      'no-unused-vars': ['error', { 
        'vars': 'all', 
        'args': 'none', 
        'ignoreRestSiblings': false 
      }],
      'no-constant-condition': ['error', {
        'checkLoops': false 
      }],
      indent: ['warn', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
};
