<div align="center">
    <h1>
        <a href="https://pugjs.org">
            <img height="135" src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg">
        </a>
        <a href="https://github.com/webpack/webpack">
            <img height="120" src="https://webpack.js.org/assets/icon-square-big.svg">
        </a>
        <a href="https://github.com/webdiscus/pug-plugin"><br>
        Pug Plugin
        </a>
    </h1>
  <div>Webpack plugin to extract HTML, CSS and JS from pug into separate files</div>
</div>

---
[![npm](https://img.shields.io/npm/v/pug-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/pug-plugin "download npm package")
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)
[![codecov](https://codecov.io/gh/webdiscus/pug-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/pug-plugin)
[![node](https://img.shields.io/npm/dm/pug-plugin)](https://www.npmjs.com/package/pug-plugin)


The pug plugin extract HTML, JavaScript and CSS from pug template defined in `webpack entry`.

Now is possible to define pug templates in webpack entry. All styles and scripts will be automatically extracted from pug.
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  entry: {
    'index': './src/index.pug', // extract html, css and js from pug
  },
  plugins: [
    new PugPlugin(),
  ],
  // ...
};
```

Now is possible to use the source files of styles and scripts directly in pug.
```pug
link(href=require('./styles.scss') rel='stylesheet')
script(src=require('./main.js'))
```
The generated HTML contains hashed css and js filenames, depending on how webpack is configured.
```html
<link rel="stylesheet" href="/assets/css/styles.05e4dd86.css">
<script src="/assets/js/main.f4b855d8.js"></script>
```

> 💡 The required styles and scripts in pug do not need to define in the webpack entry.
> All required resources will be automatically handled by webpack. 


The single pug plugin perform the most commonly used functions of the following packages:

| Packages                                                                                  | Features                                                      | 
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                    | extract HTML from pug                                         |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)     | extract CSS from styles                                       |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts) | prevent generating empty files by the `mini-css-extract-plugin` |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                     | resolve the url in CSS                                        |
| [pug-loader](https://github.com/webdiscus/pug-loader)                                     | the pug loader is already included in the pug plugin          |

You can replace all of the above packages with just one pug plugin.

<a id="install" name="install" href="#install"></a>
## Install

```bash
npm install pug-plugin --save-dev
```

## Quick Start

The minimal webpack config to extract HTML from pug:
```js
const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/', // must be defined any path, `auto` is not supported
  },

  entry: {
    index: './src/pages/index.pug', // output to public/index.html
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
To save extracted `HTML`, you must add the `new HtmlWebpackPlugin ({...})` to `webpack.plugins` for each file:
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    'main': './src/main.js',
    'styles': './src/styles.scss',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash:8].css',
    }),  
    new HtmlWebpackPlugin({
      template: './src/page01.pug',
      filename: 'page01.html',
    }),
    // ...
    new HtmlWebpackPlugin({
      template: './src/page66.pug',
      filename: 'page66.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: 'pug-loader',
      },  
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader',
          'scss-loader'
        ],
      },
    ],
  },
}
```
Each time will be created new instance of the plugin, initialized and processed. 
This is not good for huge amount of files.

### Now, using single pug-plugin
This plugin can extract and save `HTML` `CSS` directly from `webpack entries`. It is very practical to define all static resources (js, sass, pug, html) together in one place:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  entry: {
    'main': './src/main.js',
    'styles': './src/styles.scss', // the 'mini-css-extract-plugin' is needless  
    'index': './src/index.html', // define HTML file in entry
    'page01': './src/page01.pug', // define PUG file in entry
    // ...
    'page77': './src/page77.pug',
  },
  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        }
      }, 
      {
        test: /\.scss$/i,
        use: ['css-loader', 'scss-loader'],
      },
    ],
  },
};
```

Now is possible require `style` and `javascript` source files directly in pug, without necessary to define them in the webpack entry.

webpack.config.js
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    publicPath: '/',
    // js output filename 
    filename: 'assets/js/[name].[contenthash:8].js',
  },
  entry: {
    // all scripts and styles can be defined directly in pug
    'index': './src/index.pug',
  },
  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          // css output filename 
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        }
      },
      {
        test: /\.scss$/i,
        use: ['css-loader', 'scss-loader'],
      },
    ],
  },
};
```

index.pug
```pug
html
  head
    link(rel='stylesheet' href=require('./styles.scss'))
    script(src=require('./main.js'))
  body
```

Output index.html
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/assets/css/styles.05e4dd86.css">
    <script src="/assets/js/main.f4b855d8.js"></script>
  </head>
  <body></body>
</html>
```


## Features
- extract HTML from `pug` files defined in `webpack entry` into separate file
  ```js
  module.exports = {
    entry: {
      about: './src/index.pug', // output to `index.html`
    },
  }
  ```
- extract CSS and JavaScript via `require()` directly in pug and replace the source filename with a generated filename. In this case is no need to define the scripts and styles in the webpack entry:
  ```pug
  link(rel='stylesheet' href=require('./styles.scss'))
  script(src=require('./main.js'))
  ```
  output
  ```html
  <link rel="stylesheet" href="/assets/css/styles.05e4dd86.css">
  <script src="/assets/js/main.f4b855d8.js"></script>
  ```
  [see complete example of usage](#require-script-and-style)  
- handle `html` files defined in `webpack entry` without additional plugins like `html-webpack-plugin`
  ```js
  module.exports = {
    entry: {
      index: './src/index.html', // save the HTML to output directory as `index.html`
    },
  }
  ```
- extract CSS from style files defined in `webpack entry` without additional plugins like `mini-css-extract-plugin`
  ```js
  module.exports = {
    entry: {
      styles: './src/assets/scss/main.scss', // extract CSS and save to output directory as `styles.css`
    },
  }
  ```
- resolve url in CSS both in relative path and node_modules, extract resolved resource to output path
  ```css
  @use 'material-icons'; /* <= resolve urls in the imported node module */
  @font-face {
    font-family: 'Montserrat';
    src:
      url('../fonts/Montserrat-Regular.woff') format('woff'), /* <= resolve url relative by source */
      url('../fonts/Montserrat-Regular.ttf') format('truetype');
  }
  .logo {
    background-image: url("~Images/logo.png"); /* <= resolve url by webpack alias */
  }
  ```
  > ⚠️ Avoid using [resolve-url-loader](https://github.com/bholloway/resolve-url-loader) together with `PugPlugin.extractCss` because the `resolve-url-loader` is buggy, in some cases fails to resolve an url.
  > The pug plugin resolves all urls well and much faster than `resolve-url-loader`.
  > Unlike `resolve-url-loader`, this plugin resolves an url without requiring source-maps.
  [see test case to resolve url](https://github.com/webdiscus/pug-plugin/tree/master/test/cases/entry-sass-resolve-url)  
- supports the `webpack entry` syntax to define source / output files separately for each entry
  ```js
  module.exports = {
    entry: {
      about: { import: './src/pages/about/template.pug', filename: 'public/[name].html' },
      examples: { import: './vendor/examples/index.html', filename: 'public/some/path/[name].html' },
    },
  };
  ```  
- supports the `webpack entry` API for the plugin option `filename`, its can be as a [`template string`](https://webpack.js.org/configuration/output/#template-strings) or a [`function`](https://webpack.js.org/configuration/output/#outputfilename)
  ```js
  const PugPluginOptions = {
    filename: (pathData, assetInfo) => {
      return pathData.chunk.name === 'main' ? 'assets/css/styles.css' : '[path][name].css';
    }
  }
  ```
- supports the modules to separately handles of files of different types, that allow to define a separate source / output path and filename for each file type
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
        postprocess: (content, info, compilation) => {
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
The output directory for processed entries. This directory can be relative by `webpack.options.output.path` or absolute.

### `filename`
Type: `string | Function` Default: `webpack.output.filename || '[name].html'`<br>
The name of output file.
- If type is `string` then following substitutions (see [output.filename](https://webpack.js.org/configuration/output/#outputfilename) for chunk-level) are available in template string:
  - `[id]` The ID of the chunk.
  - `[name]` Only filename without extension or path.
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
  - `@param {string} content` The content of compiled entry.
  - `@param {ResourceInfo} info` The info of current asset.
  - `@param {webpack Compilation} compilation` The webpack [compilation object](https://webpack.js.org/api/compilation-object/).
  - `@return {string | null}` Return string content to save to output directory.\
    If return `null` then the compiled content of the entry will be ignored, and will be saved original content compiled as JS module.
    Returning `null` can be useful for debugging to see the source of the compilation of the webpack loader.

```js
/**
 * @typedef {Object} ResourceInfo
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {string} outputFile The absolute path to generated output file (issuer of asset).
 * @property {string | (function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} assetFile The output asset file relative by `output.publicPath`.
 */
```

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
 * @property {function(string, ResourceInfo, Compilation): string | null} postprocess
 */
```

### `verbose`
Type: `boolean` Default: `false`<br>
Show the file information at processing of entry.

## Usage examples

### Extract HTML from pug

webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },
  entry: {
    'index': 'templates/index.pug', // output public/index.html
  },
  plugins: [
    new PugPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          // this loader option is recommended for faster compilation
          method: 'render'
        },
      },
    ],
  },
};
```

<a id="require-script-and-style" name="require-script-and-style" href="#require-script-and-style"></a>
### Extract CSS and JavaScript files from pug

Dependencies:
- `css-loader` handles `.css` files and prepare CSS for any CSS extractor
- `sass-loader` handles `.scss` files
- `sass` compiles Sass to CSS

Install: `npm install css-loader sass sass-loader --save-dev`

In this case no need to define the style in webpack entry.
The CSS is extracted from a style using the `require()` function directly in the pug template.

The pug template `src/app/index.pug`:
```pug
html
  head
    link(rel='stylesheet' href=require('./styles.scss'))
    script(src=require('./main.js'))
  body
    p Hello World!
  #footer
    script(src=require('./app.js'))
```

The generated HTML:
```html
<html>
  <head>
    <link rel="stylesheet" href="/assets/css/styles.f57966f4.css">
    <script src="/assets/js/main.b855d8f4.js"></script>
  </head>
  <body>
    <p>Hello World!</p>
    <div id="footer">
      <script src="/assets/js/app.f4b855d8.js"></script>
    </div>
  </body>
</html>
```

The `webpack.config.js`:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'assets/js/[name].[contenthash:8].js',
  },
  entry: {
    index: './src/app/index.pug', // pug file includes styles and scripts
  },
  
  plugins: [
    // the plugin to handle pug and styles defined in webpack.entry
    new PugPlugin({
      modules: [
        // the module to extract CSS
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:8].css'
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug-loader is already included in the PugPlugin
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [ 'css-loader', 'sass-loader' ],
      }
    ],
  },
}

```

> **Note**: don't needed any additional plugin, like `mini-css-extract-plugin`.

## ! ACHTUNG ! ATTENTION !
### Don't import styles in JavaScript!
> ❌ BAD practice: `import './styles.scss'` is a popular but very tricky way.

### Clarification
The importing of styles in JavaScript triggers the events in Webpack which call the `mini-css-extract-plugin` loader 
to extract CSS from imported style source. Then the `html-webpack-plugin` using a magic add the `<link rel="stylesheet" href="styles.css">` with filename of extracted CSS to HTML file in head at last position.
Your can't define concrete position in HTML where should be added the style.
This process requires two different plugins and has poor performance.\
The single `pug-plugin` does it with right way, in one step and much faster.

> ### ✅ Correct way
> Add a source style file directly in pug via `require`:
> ```pug
> html
>   head
>     link(rel='stylesheet' href=require('./styles.scss'))
> ```

### Extract HTML from file defined in webpack entry

Dependency: `html-loader`  This loader is need to handle the `.html` file type.\
Install: `npm install html-loader --save-dev`

webpack.config.js
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },
  entry: {
    'example': 'vendor/pages/example.html', // output to public/example.html
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
        options: {
          sources: false, // disable processing of resources in static HTML, leave as is
          esModule: false, // webpack use CommonJS module
        },
      },
    ],
  },
};
```

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
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },
  entry: {
    'css/styles': './src/assets/main.scss', // output to public/css/styles.css
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
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
```

> 
> When using `PugPlugin.extractCss()` to extract CSS from `webpack entry` the following plugins are not needed:
> - [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
> - [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts) - fix plugin for mini-css-extract-plugin
> 
> The plugin module `PugPlugin.extractCss` extract and save pure CSS, without eny empty JS files.
> 
> ⚠️ When using `PugPlugin.extractCss()` don't use the `style-loader`. 

> ⚠️ **Limitation for CSS**\
> The `@import` CSS rule is not supported. 
> This is a [BAD practice](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/page-speed-rules-and-recommendations?hl=en#avoid_css_imports), avoid CSS imports.
> Use any CSS preprocessor like the Sass to create a style bundle using the preprocessor import.
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
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },
  entry: {
    // use source / output paths, defined in module options
    'assets/js/main': './src/assets/main.js', // output to public/assets/js/main.js
    'styles': './src/assets/main.scss', // output to public/assets/css/styles.css
    'about': './src/about.pug', // output to public/pages/about.html
    'examples': './src/examples.html', // output to public/static/examples.html
    
    // use absolute path if a source file is not in the defined `sourcePath` 
    // use custom output filename individual for the entry
    'js/demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.js'),
      filename: 'assets/js/[name]-[contenthash:8].js', // output to public/assets/js/demo-abcd1234.js
    },
    'css/demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.scss'),
      filename: 'assets/css/[name]-[contenthash:8].css', // output to public/assets/css/demo-abcd1234.css
    },
    'demo': {
      import: path.join(PATH_COMPONENTS, 'demo/main.pug'),
      filename: 'pages/[name].html', // output to public/pages/demo.html
    },
  },
  plugins: [
    new PugPlugin({
      enabled: true,
      verbose: false,
      modules: [
        // add the module to define custom options for `.pug`
        {
          test: /\.pug$/,
          filename: '[name].html',
          sourcePath: 'src/templates/pug/', // define custom path to sources, relative by webpack.config.js 
          outputPath: 'pages/', // define custom output path, relative by webpack output.path
        },
        // add the module to match `.html` files in webpack entry
        { 
          test: /\.html$/, 
          filename: '[name].html',
          sourcePath: 'src/templates/html/',
          outputPath: 'static/',
        },
        // add the module to extract CSS
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
          method: 'render'
        },
      },
      // html
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          sources: false, // disable processing of resources in static HTML, leave as is
          esModule: false, // webpack use CommonJS module
        },
      },
      // styles
      {
        test: /\.(css|sass|scss)$/,
        use: [ 'css-loader', 'sass-loader' ],
      },
    ],
  },
};
```

## Special rare case

### Usage `pug-plugin` and `pug-loader` with `html` render method.

> Don't use it if you don't know why you need it.\
> It's only the example of the solution for possible trouble by usage the `html-loader`.\
> Usually is used the `render` or `compile` method in `pug-loader` options.

For example, by usage in pug both static and dynamic resources.

index.pug
```pug
html
  head
    //- Static resource URL from public web path should not be parsed, leave as is.
    link(rel='stylesheet' href='/absolute/assets/about.css')
    //- Required resource must be processed.
        Output to /assets/css/styles.8c1234fc.css
    link(rel='stylesheet' href=require('./styles.scss'))
  body
    h1 Hello World!
    
    //- Static resource URL from public web path should not be parsed, leave as is.
    img(src='relative/assets/logo.jpeg')
    //- Required resource must be processed.
        Output to /assets/images/image.f472de4f4.jpg
    img(src=require('./image.jpeg'))

```

webpack.config.js
```js
const fs = require('fs');
const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:8].css',
        })
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              // Webpack use CommonJS module
              esModule: false,
              sources: {
                // MEGA IMPORTANT!
                urlFilter: (attribute, value) => path.isAbsolute(value) && fs.existsSync(value),
              },
            },
          },
          {
            loader: PugPlugin.loader,
            options: {
              method: 'html', // usually is used the `render` method
            },
          },
        ],
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpg|jpeg)/,
        type: 'asset/resource', // process required images in pug
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
```

> ### ⚠️ When used `PugPlugin` and `html-loader` 
>
> A static resource URL from a public web path should not be parsed by the `html-loader`. Leave the URL as is:
> ```html
> img(src='/assets/image.jpg')
> link(rel='stylesheet' href='assets/styles.css')
> ```
> Loading a resource with `require()` should be handled via webpack:
> ```html
> img(src=require('./image.jpg'))
> link(rel='stylesheet' href=require('./styles.css'))
> ```
> For this case add to `html-loader` the option:\
> `sources: { urlFilter: (attribute, value) => path.isAbsolute(value) && fs.existsSync(value) }`


## Testing

`npm run test` will run the unit and integration tests.\
`npm run test:coverage` will run the tests with coverage.

## Also See

- more examples of usages see in [test cases](https://github.com/webdiscus/pug-plugin/tree/master/test/cases)
- [ansis][ansis] - ANSI color styling of text in terminal
- [pug-loader][pug-loader]
- [pug GitHub][pug]
- [pug API Reference][pug-api]

## License

[ISC](https://github.com/webdiscus/pug-loader/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug]: https://github.com/pugjs/pug
[pug-api]: https://pugjs.org/api/reference.html
[pug-loader]: https://github.com/webdiscus/pug-loader
