const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'auto',
  },

  entry: {
    index: './src/views/home/index.pug',
    about: './src/views/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      // test verbose option
      verbose: true,
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        verbose: true,
      },
      filename: (pathData, assetInfo) => {
        //console.log('filename: ', pathData.chunk.name, '\n', pathData.filename);
        return pathData.chunk.name + '.html';
      },
    }),
  ],

  module: {
    rules: [


      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|svg|jpg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      {
        test: /\.(png|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
      },

      // responsive loader
      {
        test: /\.(webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'assets/img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};
