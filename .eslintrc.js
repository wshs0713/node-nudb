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
    // check if imports actually resolve
    settings: {
      'import/resolver': {
        webpack: {
          config: 'build/webpack.base.conf.js'
        }
      }
    },
    // add your custom rules here
    rules: {
      // don't require .vue extension when importing
      'import/extensions': ['error', 'always', {
        js: 'never',
        vue: 'never'
      }],
      'no-param-reassign': ['error', { props: false }],
      // disallow reassignment of function parameters
      // disallow parameter object manipulation except for specific exclusions
      /*'no-param-reassign': ['error', {
        props: true,
        ignorePropertyModificationsFor: [
          'state', // for vuex state
          'acc', // for reduce accumulators
          'e' // for e.returnvalue
        ]
      }],*/
      // allow optionalDependencies
      /*'import/no-extraneous-dependencies': ['error', {
        optionalDependencies: ['test/unit/index.js']
      }],*/
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': 'off',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-console': 'off',
      'linebreak-style': ['error', 'unix'],
      indent: ['warn', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
};
