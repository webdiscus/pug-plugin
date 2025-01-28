const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  //mode: 'development',

  entry: {
    index: './src/index.pug',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new PugPlugin({
      //pretty: true,
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single', // extract runtime script from all modules
    splitChunks: {
      minSize: 10000, // extract modules bigger than 10KB, defaults is 30KB
      cacheGroups: {
        vendor: {
          //test: /[\\/]node_modules[\\/]/,
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use it when in Pug is defined CSS from node modules to exclude CSS from group
          name(module, chunks, groupName) {
            const moduleName = module.resourceResolveData.descriptionFileData.name.replace('@', '');
            return `${groupName}.${moduleName}`;
          },
          enforce: true,
          chunks: 'all',
        },
      },
    },
  },
};
