const path = require('path')

const cjsConfig = {
  mode: 'production',
  target: 'node14',
  devtool: 'source-map',
  entry: {
    cjs: {
      import: './dist/cjs/index',
      library: {
        type: 'commonjs',
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ge-commercetools-auth0-node.[name].js',
  },
}

const esmConfig = {
  mode: 'production',
  target: 'node14',
  entry: {
    esm: {
      import: './dist/esm/index',
      library: {
        type: 'module',
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ge-commercetools-auth0-node.[name].js',
  },
  experiments: {
    outputModule: true,
  },
}

module.exports = [cjsConfig, esmConfig]
