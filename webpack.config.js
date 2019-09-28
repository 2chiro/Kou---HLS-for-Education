const path = require('path')

module.exports = {
  target: 'electron-renderer',
  devtool: 'source-map',
  entry: {
    index: path.resolve(__dirname, 'src')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'out')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif)$/,
        loaders: 'url-loader'
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'initial',
          enforce: true
        }
      }
    }
  }
}