[![npm](https://img.shields.io/npm/v/pug-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/pug-plugin "download npm package")
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)
[![codecov](https://codecov.io/gh/webdiscus/pug-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/pug-plugin)
[![node](https://img.shields.io/npm/dm/pug-plugin)](https://www.npmjs.com/package/pug-plugin)

# [pug-plugin](https://www.npmjs.com/package/pug-plugin)

Webpack plugin for the [Pug](https://pugjs.org) templates.\
This plugin extract HTML and CSS from `pug` `html` `scss` `css` files defined by `webpack entry` 
and dynamically replace in a template the required source filename of CSS, image with a public hashed name. 

Using the `pug-plugin` and `pug` `html` `scss` `css` assets in the `webpack entry` no longer requires additional plugins such as:
- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
- [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
- [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)
  or [webpack-fix-style-only-entries](https://github.com/fqborges/webpack-fix-style-only-entries) \
  (bug fix plugins for `mini-css-extract-plugin`)
- [pug-loader](https://github.com/webdiscus/pug-loader) (this loader is already included in the `pug-plugin`)

> The plugin can be used not only for `pug` but also for simply extracting `HTML` or `CSS` from  `webpack entry`, independent of pug usage.

<a id="install" name="install" href="#install"></a>
## Install

```bash
npm install pug-plugin --save-dev
```

## Quick Start

The minimal configuration in `webpack.config.js`:
```js
const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/', // must be defined any path, `auto` is not supported
  },

  entry: {
    index: './src/pages/index.pug', // ==> public/index.html
  },

  plugins: [
    new PugPlugin(), // add the plugin
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // add the pug-loader
      },
    ],
  },
};
```
> **Note**: this configuration work without `html-webpack-plugin`.

## Motivation

### Early
To save extracted `HTML`, you had to add `new HtmlWebpackPlugin ({...})` to `webpack.plugins` for each file:
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    'main': 'main.js',
    'styles': 'styles.scss',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'page01.pug',
      filename: 'page01.html',
    }),
    // ...
    new HtmlWebpackPlugin({
      template: 'page66.pug',
      filename: 'page66.html',
    }),
  ]
}
```
Each time will be created new instance of the plugin, initialized and processed. 
This is not good for huge amount of files.

### Now 
This plugin can extract and save `HTML` directly from `webpack entry`. It is very practical to define all static resources (js, sass, pug, html) together in one place:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  entry: {
    'main': 'main.js',
    'styles': 'styles.scss',
    'index': 'index.html', // now is possible define HTML file in entry
    'page01': 'page01.pug', // now is possible define PUG file in entry
    // ...
    'page77': 'page77.pug',
  },
  plugins: [
    new PugPlugin(), // supports zero config using default webpack output options 
  ]
};
```

## Features
- supports **Webpack 5** and **Pug 3**
- supports handle `pug` files from `webpack entry` and save extracted HTML into separate file
  ```js
  module.exports = {
    entry: {
      about: 'src/templates/about.pug', // extract HTML and save into output directory as `about.html`
    },
  }
  ```
- supports handle `html` files from `webpack entry` and save it without additional plugins like `html-webpack-plugin`
  ```js
  module.exports = {
    entry: {
      index: 'src/templates/index.html', // save the HTML into output directory as `index.html`
    },
  }
  ```
- supports handle `scss` `css` files from `webpack entry` without additional plugins like `mini-css-extract-plugin`
  ```js
  module.exports = {
    entry: {
      styles: 'src/assets/scss/main.scss', // extract CSS and save into output directory as `styles.css`
    },
  }
  ```
- supports `webpack entry` syntax to define source / output files separately for each entry
  ```js
  module.exports = {
    entry: {
      about: { import: 'src/pages/about/template.pug', filename: 'public/[name].html' },
      examples: { import: 'vendor/examples/index.html', filename: 'public/some/path/[name].html' },
    },
  };
  ```  
- supports `webpack entry` API for the plugin option `filename`, its can be as a [`template string`](https://webpack.js.org/configuration/output/#template-strings) or a [`function`](https://webpack.js.org/configuration/output/#outputfilename)
  ```js
  const PugPluginOptions = {
    filename: (pathData, assetInfo) => {
      return pathData.chunk.name === 'main' ? 'assets/css/styles.css' : '[path][name].css';
    }
  }
  ```
- supports modules to separately handles of files of different types, that allow to define a separate source / output path and filename for each file type
  ```js
  const PugPluginOptions = {
    modules: [
      {
        test: /\.(pug)$/,
        sourcePath: path.join(__dirname, 'src/templates/'),
        outputPath: path.join(__dirname, 'public/'),
        filename: '[name].html'
      },
      {
        test: /\.(html)$/,
        sourcePath: path.join(__dirname, 'src/vendor/static/'),
        outputPath: path.join(__dirname, 'public/some/other/path/'),
      },
      {
        test: /\.(sass|scss)$/,
        sourcePath: path.join(__dirname, 'src/assets/sass/'),
        outputPath: path.join(__dirname, 'public/assets/css/'),
        filename: isProduction ? '[name].[contenthash:8].css' : '[name].css'
      },
    ],
  };
  ```
- supports `post process` for modules to handle the extracted content `before emit`
  ```js
  const PugPluginOptions = {
    modules: [
      {
        test: /\.pug$/,
        postprocess: (content, entry, compilation) => {
          // TODO: your can here handle extracted HTML
          return content;
        },
      },
    ],
  };
  ```
- the [pug-loader](https://github.com/webdiscus/pug-loader) is the part of this plugin, no need additional loaders to render `pug` files
  ```js
  const PugPlugin = require('pug-plugin');
  module.exports = {
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: PugPlugin.loader,
        },
      ],
    },
  };
  ```
  > See the description of the [`pug-loader`](https://github.com/webdiscus/pug-loader) options [here](https://github.com/webdiscus/pug-loader#options-of-original-pug-loader).
- extract CSS files from `webpack entry` without generating unnecessary empty js files,\
  not need more for additional fix plugins like [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)
  or [webpack-fix-style-only-entries](https://github.com/fqborges/webpack-fix-style-only-entries)
  ```js
  const PugPlugin = require('pug-plugin');
  module.exports = {
    entry: {
      'styles': 'styles.scss',
    },
    plugins: [
      new PugPlugin({
        modules: [
          PugPlugin.extractCss({ ...extractCssOptions }),
        ],
      }),
    ]
  };
  ```
- extract CSS via `require()` directly in pug and replace the source filename with a public hashed name. In this case is no need to define the style in the webpack entry:
  ```pug
  link(rel='stylesheet' href=require('~Styles/main.scss'))
  ```
  output
  ```html
  <link rel="stylesheet" href="/assets/css/main.6f4d012e.css">
  ```
  [see complete example of usage](#require-style)

<a id="options" name="options" href="#options"></a>
## Plugin options

The plugin options are default options for self plugin and all plugin `modules`. 
In a defined `module` any option can be overridden.

### `enabled`
Type: `boolean` Default: `true`<br>
Enable/disable the plugin.

### `test`
Type: `RegExp` Default: `/\.pug$/`<br>
The search for a match of entry files.

### `sourcePath`
Type: `string` Default: `webpack.options.context`<br>
The absolute path to sources.

### `outputPath`
Type: `string` Default: `webpack.options.output.path`<br>
The output directory for processed entries.

### `filename`
Type: `string | Function` Default: `webpack.output.filename || '[name].html'`<br>
The file name of output file.
- If type is `string` then following substitutions are available in template strings
  - `[name]` Only filename without extension or path.
  - `[base]` Filename with extension.
  - `[path]` Only path, without filename.
  - `[path][name]` The path and filename without extension.
  - `[ext]` Extension with leading `.`.
  - `[id]` The ID of the chunk.
  - `[contenthash]` The hash of the content.
  - `[contenthash:nn]` The `nn` is the length of hashes (defaults to 20).
- If type is `Function` then following parameters are available in the function:
  - `@param {webpack PathData} pathData` See the description of this type [here](https://webpack.js.org/configuration/output/#template-strings)
  - `@param {webpack AssetInfo} assetInfo`
  - `@return {string}` The name or template string of output file.

### `postprocess`
Type: `Function` Default: `null`<br>
The post process for extracted content from compiled entry.
The following parameters are available in the function:
  - `@param {string | []} content` The content of compiled entry. Can be a string (for html entry), an array (for css).
  - `@param {AssetEntry} entry` The current entry object.
  - `@param {webpack Compilation} compilation` The webpack [compilation object](https://webpack.js.org/api/compilation-object/).
  - `@return {string | null}` Return a string content to save it into output directory.\
    If return `null` then the compiled content of the entry will be ignored, and will be saved original content compiled as JS module.
    Returning `null` can be useful for debugging to see the source of the compilation of the webpack loader.

### `modules`
Type: `PluginOptions[]` Default: `[]`<br>
The array of objects of type `PluginOptions` to separately handles of files of different types.\
The description of `@property` of the type `PluginOptions` see above, by Plugin options.
```js
/**
 * @typedef {Object} PluginOptions
 * @property {boolean} enabled
 * @property {boolean} verbose
 * @property {RegExp} test
 * @property {string} sourcePath
 * @property {string} outputPath
 * @property {string | function(PathData, AssetInfo): string} filename
 * @property {function(string, AssetEntry, Compilation): string | null} postprocess
 */
```

### `verbose`
Type: `boolean` Default: `false`<br>
Show the file information at processing of entry.

## Usage examples

### Output HTML file from Pug template

webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'), // output path
    publicPath: '/', // must be defined a real publicPath, `auto` not supported!
  },
  entry: {
    'index': 'templates/index.pug', // save HTML into '<__dirname>/public/index.html'
  },
  plugins: [
    new PugPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        // this loader options are optional, but recommended for faster compilation
        options: {
          method: 'render',
          esModule: true,
        },
      },
    ],
  },
};
```

### Output HTML file from a source directory

Dependency: `html-loader`  This loader is need to handle the `.html` file type.\
Install: `npm install html-loader --save-dev`

webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'), // output path
    publicPath: '/', // must be defined a real publicPath, `auto` not supported!
  },
  entry: {
    'example': 'vendor/pages/example.html', // save HTML into '<__dirname>/public/example.html'
  },
  plugins: [
    new PugPlugin({
      modules: [
        // add the module object to match `.html` files in webpack entry
        { test: /\.html$/, filename: '[name].html' }
      ],
    }),
  ],
  module: {
    rules: [
      // add the loader to handle `.html` files
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },
};
```

<a id="require-style" name="require-style" href="#require-style"></a>
### Extract CSS via `require` in pug

Dependencies:
- `css-loader` handles `.css` files and prepare CSS for any CSS extractor
- `sass-loader` handles `.scss` files
- `sass` compiles Sass to CSS

Install: `npm install css-loader sass sass-loader --save-dev`

In this case no need to define the style in webpack entry. 
The CSS will be extracted from a style source required directly in the pug template.

The pug template `src/templates/index.pug`:
```pug
html
  head
    link(href=require('~Styles/my-style.scss'))
  body
    p Hello World!
```
Add to the `webpack.config.js` following:
```js
module.exports = {
  entry: {
    // ...
    index: 'src/templates/index.pug', // the pug file with required style
  },
  
  plugins: [
    // ...
    // handle pug and style files defined in webpack.entry
    new PugPlugin({
      modules: [
        PugPlugin.extractCss(), // enable CSS extraction
      ],
    }),
  ],

  module: {
    rules: [
      // ...
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug-loader is already included in the PugPlugin
      },
      {
        test: /\.(css|sass|scss)$/,
        type: 'asset/resource', // extract css in pug via require
        generator: {
          filename: 'assets/css/[name].[hash:8].css', // save extracted css in public path
        },
        use: [ 'css-loader', 'sass-loader' ], // extract css from a style source
      }
    ],
  },
}

```

The generated HTML:
```html
<html>
  <head>
    <link rel="stylesheet" href="/assets/css/main.f57966f4.css">
  </head>
  <body>
    <p>Hello World!</p>
  </body>
</html>
```

> **Note**: don't needed any additional plugin, like `mini-css-extract-plugin`.

## ! ACHTUNG ! ATTENTION !
### STOP import styles in JavaScript! This is very BAD praxis.
**DON'T DO IT :** `import ./src/styles.scss` This is popular but `dirty way`!

### Clarification
The importing of styles in JavaScript triggers the events in Webpack which call the `mini-css-extract-plugin` loader 
to extract CSS from imported style source. Then the `html-webpack-plugin` using a magic add the `<link href="styles.css">` with filename of extracted CSS to any HTML file in head at last position.
Your can't define in which HTML file will be added style and in which order. You are not in control of this process!
This process requires two different plugins and has poor performance.\
The single `pug-plugin` does it with right way, in one step and much faster.

> ### Correct ways
> - add a source style file directly in pug via `require`, like `link(href=require('~Styles/styles.scss'))`
> - add a compiled css file directly in pug, like `link(href='/assets/styles.css')` and add the source of the style in webpack entry.\
>   Yes, in this case may be needed additional assets manifest plugin to replace original filename with hashed name. But this is the right way.\
>   In the future, will be added support to automatically replace the asset file name with a hashed one.


### Extract CSS from SASS defined in webpack entry

Dependencies:
- `css-loader` handles `.css` files and prepare CSS for any CSS extractor
- `sass-loader` handles `.scss` files
- `sass` compiles Sass to CSS

Install: `npm install css-loader sass sass-loader --save-dev`

webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'), // output path
    publicPath: '/', // must be defined a real publicPath, `auto` not supported!
  },
  entry: {
    'css/styles': 'src/assets/main.scss', // save CSS into '<__dirname>/public/css/styles.css'
  },
  plugins: [
    new PugPlugin({
      modules: [
        // add the module to extract CSS
        // see options https://github.com/webdiscus/pug-plugin#options
        PugPlugin.extractCss({
          filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
        })
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {}, // see options https://github.com/webpack-contrib/css-loader#options
          },
          {
            loader: 'sass-loader',
            options: {}, // see options https://github.com/webpack-contrib/sass-loader#options
          },
        ],
      },
    ],
  },
};
```

> If `sass` files are defined only in `webpack entry` and used `PugPlugin.extractCss()`, 
> then don't use [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
> because this plugin generates unnecessary empty JavaScript files and as the fix should be used additional
> [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts)
> or [webpack-fix-style-only-entries](https://github.com/fqborges/webpack-fix-style-only-entries).
> 
> So, if using `PugPlugin.extractCss()`, then following plugins are not needed:
> - `mini-css-extract-plugin` 
> - `webpack-remove-empty-scripts`
> 
> The plugin module `PugPlugin.extractCss` extract and save pure CSS, without eny empty JS files.

---

## Usage of Pug, HTML, SASS and JS together in `webpack entry`
webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
const isProduction = process.env.NODE_ENV === 'production';
const PATH_COMPONENTS = path.join(__dirname, 'src/components/'); 
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'), // output path
    publicPath: '/', // must be defined a real publicPath, `auto` not supported!
  },
  entry: {
    // use source / output paths, defined in module options
    'assets/js/main': './src/assets/main.js', // output '<__dirname>/public/assets/js/main.js'
    'styles': 'src/assets/main.scss', // output '<__dirname>/public/assets/css/styles.css'
    'about': 'about.pug', // output '<__dirname>/public/pages/about.html'
    'examples': 'examples.html', // output '<__dirname>/public/static/examples.html'
    
    // use absolute path if a source file is not in the defined `sourcePath` 
    // use custom output filename individual for the entry
    'js/demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.js'),
      filename: 'assets/[name]-[contenthash:8].js', 
      // output '<__dirname>/public/assets/js/demo-abcd1234.js'
    },
    'css/demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.scss'),
      filename: 'assets/[name]-[contenthash:8].css', 
      // output '<__dirname>/public/assets/css/demo-abcd1234.css'
    },
    'demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.pug'),
      filename: 'pages/[name].html', 
      // output '<__dirname>/public/pages/demo.html'
    },
  },
  plugins: [
    new PugPlugin({
      enabled: true,
      verbose: false,
      modules: [
        // add the module object to define custom options for `.pug`
        {
          test: /\.pug$/,
          filename: '[name].html',
          sourcePath: 'src/templates/pug/', // define custom path to sources, relative by webpack.config.js 
          outputPath: 'pages/', // define custom output path, relative by webpack output.path
        },
        // add the module object to match `.html` files in webpack entry
        { 
          test: /\.html$/, 
          filename: '[name].html',
          sourcePath: 'src/templates/html/',
          outputPath: 'static/',
        },
        // add the module to extract CSS into output file
        PugPlugin.extractCss({
          filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
          sourcePath: 'src/assets/sass/',
          outputPath: 'assets/css/',
        })
      ],
    }),
  ],
  module: {
    rules: [
      // pug
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
          esModule: true,
        },
      },
      // html
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      // styles
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
};
```


## Testing

`npm run test` will run the unit and integration tests.\
`npm run test:coverage` will run the tests with coverage.

## Also See

- more examples of usages see in [test cases](https://github.com/webdiscus/pug-plugin/tree/master/test/cases)
- [`pug GitHub`][pug]
- [`pug API Reference`][pug-api]
- [`pug-loader`][pug-loader]

## License

[ISC](https://github.com/webdiscus/pug-loader/blob/master/LICENSE)

<!-- prettier-ignore-start -->
[pug]: https://github.com/pugjs/pug
[pug-api]: https://pugjs.org/api/reference.html
[pug-loader]: https://github.com/webdiscus/pug-loader
<!-- prettier-ignore-end -->
