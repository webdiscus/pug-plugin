[![npm version](https://badge.fury.io/js/pug-plugin.svg)](https://badge.fury.io/js/pug-plugin)
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)
[![codecov](https://codecov.io/gh/webdiscus/pug-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/pug-plugin)
[![node](https://img.shields.io/npm/dm/pug-plugin)](https://www.npmjs.com/package/pug-plugin)

### **NEW:** first version is released!

# [pug-plugin](https://www.npmjs.com/package/pug-plugin)

Handles `.pug` templates directly from webpack `entry` via `pug-loader` and save rendered HTML to destination directory.

## The motivation

The goal of this plugin is do same working as `mini-css-extract-plugin`. 
This mean that is possible add more pug files directly in webpack `entry` and stop `"plugin hell"` in `webpack.plugins`
for huge amount of static pug files.

For example, my project has over 30 static pug files them will be rendered to 30 static HTML. 
For each pug file need add the `new HtmlWebpackPlugin({...})` to `webpack.plugins`.
In that case the `webpack.plugins` is like following:

```js
{
  plugins: [
    new HtmlWebpackPlugin({
      template: 'templates/index.pug',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page01.pug',
      filename: 'page01.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page02.pug',
      filename: 'page02.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page03.pug',
      filename: 'page03.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page04.pug',
      filename: 'page04.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page05.pug',
      filename: 'page05.html',
    }),
    new HtmlWebpackPlugin({
      template: 'templates/page06.pug',
      filename: 'page06.html',
    }),
    
    // ...
    
    new HtmlWebpackPlugin({
      template: 'templates/page66.pug',
      filename: 'page66.html',
    }),
    // ...
  ]
}
```

This is very bad praxis! Each time will be created new instance of the plugin, initialized and processed. This need extra CPU, RAM resources, and additional build time.

## I will stop this "hell"!

The pug templates are in the webpack config `entry`, like it used for Sass files.

## 


```js
const PugPlugin = require('pug-plugin');

const config = {
  entry: {
    'main': 'main.js',
    'styles': 'styles.scss',
    'index': 'index.pug',
    'page01': 'page01.pug',
    'page02': 'page02.pug',
    'page03': 'page03.pug',
    'page04': 'page04.pug',
    'page05': 'page05.pug',
    'page06': 'page06.pug',
    'page07': 'page07.pug',
    
    // ...
    
    'page77': 'page77.pug',
  },

  plugins: [
    // zero config 
    new PugPlugin(), // needs only one instance of the pug plugin to handles all pug files from webpack entry
    // ...
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug loader is powerful `@webdiscus/pug-loader`
      },
      // ...
    ],
  },
}

module.exports = config;
```

Of course, supports of extended webpack `entry` syntax, e.g.:
```
entry: {
  about: { import: './about.pug', filename: 'pages/[name].html' },
},
```


## Also See

- [`pug GitHub`][pug]
- [`pug API Reference`][pug-api]
- [`pug-loader`][pug-loader]

<!-- prettier-ignore-start -->
[pug]: https://github.com/pugjs/pug
[pug-api]: https://pugjs.org/api/reference.html
[pug-loader]: https://github.com/webdiscus/pug-loader
<!-- prettier-ignore-end -->

## Testing

`npm run test` will run the unit and integration tests.\
`npm run test:coverage` will run the tests with coverage.

## License

[ISC](https://github.com/webdiscus/pug-loader/blob/master/LICENSE)
