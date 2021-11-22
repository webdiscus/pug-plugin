# Pug plugin

## The concept (yet not implemented!)

This is just a announcement of the pug plugin for webpack.
The goal of this plugin is do same working as `mini-css-extract-plugin`. 
This mean that will be possible add more pug files directly in webpack `entry` and stop `"plugin hell"` in `webpack.plugins`
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

My idee is use for pug templates correct default native place  - webpack `entry`, like it used for Sass files.

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
    new PugPlugin(options), // needs only one instance of the pug plugin to handles all pug files from webpack entry
    // ...
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug loader, later it will be the code from my `@webdiscus/pug-loader`
      },
      // ...
    ],
  },
}
```

Of course, will be supports of extended webpack `entry` syntax, e.g.:
```
entry: {
  about: { import: './about.pug', filename: 'pages/[name].html' },
},
```

## Use the modern and faster pug-loader now

See my [`pug-loader`](https://github.com/webdiscus/pug-loader).

## P.S.
I am already experimenting with solutions to this problem.

Those who are interested in solving this problem, like (star) this project now, so that I know that this project is relevant and would speed up the development.