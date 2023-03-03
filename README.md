<div align="center">
  <h1>
    <a href="https://pugjs.org">
      <img height="120" src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg">
    </a>
    <a href="https://github.com/webpack/webpack">
      <img height="120" src="https://webpack.js.org/assets/icon-square-big.svg">
    </a>
    <br>
    <a href="https://github.com/webdiscus/pug-plugin">Pug Plugin</a>
  </h1>
  <div>Pug plugin for Webpack compiles Pug files to HTML, extracts CSS and JS from their sources specified in Pug</div>
</div>

---
[![npm](https://img.shields.io/npm/v/pug-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/pug-plugin "download npm package")
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)
[![Test](https://github.com/webdiscus/pug-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/pug-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/pug-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/pug-plugin)
[![node](https://img.shields.io/npm/dm/pug-plugin)](https://www.npmjs.com/package/pug-plugin)


Pug Plugin enable to use Pug file as entry-point in Webpack. This plugin creates HTML files containing
hashed output JS and CSS filenames whose source files are specified in the Pug template.

💡 **Highlights**:

- Pug file is the entry-point for all scripts and styles.
- Source scripts and styles should be specified directly in Pug.
- All JS and CSS files will be extracted from their sources specified in Pug.
- Pug loader has built-in filters: `:escape` `:code` `:highlight` `:markdown`.

Specify the Pug files in the Webpack entry:

```js
const PugPlugin = require('pug-plugin');
module.exports = {
  entry: {
    // define your Pug files here
    index: './src/views/home/index.pug',  // output dist/index.html
    'route/to/page': './src/views/page/index.pug', // output dist/route/to/page.html
  },
  plugins: [
    new PugPlugin(), // rendering of Pug files defined in Webpack entry
  ],
  module: {
    rules: [
      {
        test: /.pug$/,
        loader: PugPlugin.loader, // Pug loader
      },
    ],
  },
};
```

Add source scripts and styles directly to Pug using `require()`:
```pug
link(href=require('./style.scss') rel='stylesheet')
script(src=require('./main.js') defer='defer')
```

The generated HTML contains hashed output CSS and JS filenames:
```html
<link href="/assets/css/style.05e4dd86.css" rel="stylesheet">
<script src="/assets/js/main.f4b855d8.js" defer="defer"></script>
```

## Contents

---
1. [Install and Quick start](#install)
2. [Features](#features)
3. [Plugin options](#plugin-options)
4. [Loader options](#loader-options)
   - [Method `render`](#method-render) 
   - [Method `compile`](#method-compile) 
5. [Usage examples](#usage-examples)
   - [Using JS, SCSS, images and fonts with Pug](#example-pug-js-scss-img-font)
   - [Using Pug in JavaScript with `render` method](#example-pug-in-js-render)
   - [Using Pug in JavaScript with `compile` method](#example-pug-in-js-compile)
   - [Simple multiple pages](https://github.com/webdiscus/pug-plugin/tree/master/examples/simple-multipage) (source code)
6. [Recipes](#recipes)
   - [How to inline CSS in HTML](#recipe-inline-css)
   - [How to inline JS in HTML](#recipe-inline-js)
   - [How to keep the source folder structure in output directory for individual Pug files](#recipe-keep-individual-pug-dirs)
   - [How to keep the source folder structure in output directory for all Pug files](#recipe-keep-all-pug-dirs)
   - [How to keep the source folder structure in output directory for all resources like fonts](#recipe-keep-all-resource-dirs)
   - [How to load JS and CSS for browser from `node_modules` in Pug](#recipe-default-script-style-from-module)
   - [How to import style from `node_module` in SCSS](#recipe-import-style-from-module)
   - [How to use @import url() in CSS](#recipe-import-url-in-css)
   - [How to config `splitChunks`](#recipe-split-chunks)
   - [How to split multiple node modules and save under own names](#recipe-split-many-modules)
   - [How to use HMR live reload](#recipe-hmr)
7. Demo sites
   - [Hello World!](https://webdiscus.github.io/pug-plugin/hello-world/) ([source](https://github.com/webdiscus/pug-plugin/tree/master/examples/hello-world))
   - [Multi-language pages using i18next](https://webdiscus.github.io/pug-plugin/multi-language-i18next/) ([source](https://github.com/webdiscus/pug-plugin/tree/master/examples/multi-language-i18next))
   - [Responsive images](https://webdiscus.github.io/pug-plugin/responsive-image/) ([source](https://github.com/webdiscus/pug-plugin/tree/master/examples/responsive-image))
   - [Usage `:highlight` filter](https://webdiscus.github.io/pug-loader/pug-filters/highlight.html) ([source](https://github.com/webdiscus/pug-loader/tree/master/examples/pug-filters))
   - [Usage `:markdown` filter](https://webdiscus.github.io/pug-loader/pug-filters/markdown.html) ([source](https://github.com/webdiscus/pug-loader/tree/master/examples/pug-filters))


<a id="features" name="features" href="#features"></a>
## Features

- Pug file is entry-point for all resources (styles, scripts)
- compiles HTML files from Pug files defined in Webpack entry
- extracts CSS from source style loaded in Pug via a `link` tag
- extracts JS from source script loaded in Pug via a `script` tag
- generated HTML contains hashed CSS and JS output filenames
- resolves source files of URLs in CSS and extract resolved resources to output path\
  not need more additional plugin such as [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)
- support the `auto` publicPath
- support the module types `asset/resource` `asset/inline` `asset`
- `inline CSS` in HTML
- `inline JavaScript` in HTML
- `inline image` as `base64 encoded` data-URL for PNG, JPG, etc. in HTML and CSS
- `inline SVG` as SVG tag in HTML
- `inline SVG` as `utf-8` data-URL in CSS
  ```scss
  background: url('./icons/iphone.svg') // CSS: url("data:image/svg+xml,<svg>...</svg>")
- enable/disable extraction of comments to `*.LICENSE.txt` file
- support the `postprocess` for modules to handle the extracted content
- support the [responsive-loader](https://github.com/dazuaz/responsive-loader), see [docs](https://webdiscus.github.io/pug-plugin/responsive-image/) and [usage example](https://github.com/webdiscus/pug-plugin/tree/master/examples/responsive-image)

Just one Pug plugin replaces the functionality of many plugins and loaders used with Pug:

| Package                                                                                   | Features                                                         | 
|-------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)                    | extract HTML and save in a file                                  |
| [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)     | extract CSS and save in a file                                   |
| [webpack-remove-empty-scripts](https://github.com/webdiscus/webpack-remove-empty-scripts) | remove empty JS files generated by the `mini-css-extract-plugin` |
| [pug-loader](https://github.com/webdiscus/pug-loader)                                     | the Pug loader is already included in the Pug plugin             |
| [style-loader](https://github.com/webpack-contrib/style-loader)                           | inject CSS into the DOM                                          |
| [resolve-url-loader](https://github.com/bholloway/resolve-url-loader)                     | resolve url in CSS                                               |
| [svg-url-loader](https://github.com/bhovhannes/svg-url-loader)                            | encode SVG data-URL as utf8                                      |
| [posthtml-inline-svg](https://github.com/andrey-hohlov/posthtml-inline-svg)               | inline SVG icons in HTML                                         |

> **Warning**
>
> Don't use the `pug-plugin` together with `html-webpack-plugin` and `mini-css-extract-plugin`.\
> The `pug-plugin` is designed to replace these plugins to make Pug easier to use and faster to compile.

<a id="install" name="install" href="#install"></a>
## Install and Quick start

Install the `pug-plugin`:
```bash
npm install pug-plugin --save-dev
```

Install additional packages for styles:
```bash
npm install css-loader sass sass-loader --save-dev
```

Change your `webpack.config.js` according to the following minimal configuration:

```js
const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    // define Pug files here
    index: './src/views/index.pug', // => dist/index.html
    'pages/about': './src/views/about/index.pug', // => dist/pages/about.html
    // ...
  },

  plugins: [
    new PugPlugin({
      pretty: true, // formatting HTML, useful for development mode
      js: {
        // output filename of extracted JS file from source script
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS file from source style
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // Pug loader
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
```

> **Note** 
> 
> - The key of `entry` object is an output file w/o extension `.html`, relative by output path.
> - The default `output.path` is `path.join(__dirname, 'dist')`.
> - The default `output.publicPath` is `auto`, recommended to use the server-relative `'/'` path.
> - The default JS output filename is `[name].js`, where the `[name]` is the base filename of a source file.
> - The default CSS output filename is `[name].css`, where the `[name]` is the base filename of a source file.

Add source styles and scripts using `require()` directly in a Pug file, e.g. `src/views/index.pug`:
```pug
html
  head
    //- add styles in head
    link(href=require('./style.scss') rel='stylesheet')
  body
    h1 Hello Pug!
    
    //- add scripts at last position in body
    script(src=require('./main.js'))
```

The generated HTML:
```html
<html>
  <head>
    <link href="/assets/css/style.f57966f4.css" rel="stylesheet">
  </head>
  <body>
    <h1>Hello Pug!</h1>
    <script src="/assets/js/main.b855d8f4.js"></script>
  </body>
</html>
```

> **Warning**
> 
> - Don't define scripts and styles in the Webpack entry. Use `require()` to load source files in Pug.
> - Don't import styles in JavaScript.
> - Don't use `html-webpack-plugin` to render Pug files in HTML. The Pug plugin compiles the files defined in the Webpack entry.
> - Don't use `mini-css-extract-plugin` to extract CSS from styles. The Pug plugin extract CSS from styles required in Pug.

<a id="plugin-options" name="plugin-options" href="#plugin-options"></a>
## Plugin options

### `enabled`
Type: `boolean` Default: `true`<br>
Enable/disable the plugin.

### `verbose`
Type: `boolean` Default: `false`<br>
Display the file information at processing.

### `pretty`
Type: `boolean` Default: `false`<br>
Pretty formatting the resulting HTML. Use this option for debugging only. For production build should be disabled.
This option only works for Pug files defined in the Webpack entry.

```js
const PugPlugin = require('pug-plugin');
module.exports = {
  plugins: [
    new PugPlugin({
      pretty: true, // enable formatting of HTML
    }),
  ],
};
```
> **Warning**️
>
> The `pretty` option of the `pug-loader` is deprecated, therefore use the `pretty` option in `pug-plugin`.

### `test`
Type: `RegExp` Default: `/\.pug$/`<br>
The `test` option allows то handel only those resources that match their source filename.
For example, save all extracted  `svg` files from `fonts/` to the separate output directory:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  plugins: [
    new PugPlugin({
      modules: [
        {
          test: /fonts\/.+\.svg$/,
          outputPath: path.join(__dirname, 'dist/some/other/path/'),
        },
      ],
    }),
  ],
};
```

### `sourcePath`
Type: `string` Default: `webpack.options.context`<br>
The absolute path to sources.

<a id="plugin-option-outputPath" name="plugin-option-outputPath" href="#plugin-option-outputPath"></a>
### `outputPath`
Type: `string` Default: `webpack.options.output.path`<br>
The output directory for processed file. This directory can be relative by `webpack.options.output.path` or absolute.

<a id="plugin-option-filename" name="plugin-option-filename" href="#plugin-option-filename"></a>
### `filename`
Type: `string | Function` Default: `webpack.output.filename || '[name].html'`<br>
The name of output file.
- If type is `string` then following substitutions (see [output.filename](https://webpack.js.org/configuration/output/#template-strings) for chunk-level) are available in template string:
  - `[id]` The ID of the chunk.
  - `[name]` Only filename without extension or path.
  - `[contenthash]` The hash of the content.
  - `[contenthash:nn]` The `nn` is the length of hashes (defaults to 20).
- If type is `Function` then following arguments are available in the function:
  - `@param {PathData} pathData` has the useful properties (see the [type PathData](https://webpack.js.org/configuration/output/#outputfilename)):
     - `pathData.filename` the full path to source file 
     - `pathData.chunk.name` the name of entry key 
  - `@param {AssetInfo} assetInfo` Mostly this object is empty.
  - `@return {string}` The name or template string of output file.

### `modules`
Type: `ModuleOptions[]` Default: `[]`<br>
The array of objects of type `ModuleOptions` to separately handles of different file types.\
The description of `@property` see by Pug plugin options.
```js
/**
 * @typedef {Object} ModuleOptions
 * @property {boolean} enabled
 * @property {boolean} verbose
 * @property {RegExp} test
 * @property {string} sourcePath
 * @property {string} outputPath
 * @property {string | function(PathData, AssetInfo): string} filename
 * @property {function(string, ResourceInfo, Compilation): string | null} postprocess
 */
```

### `css`
Type: `ModuleOptions`\
Default properties:
```js
{
  test: /\.(css|scss|sass|less|styl)$/,
  enabled: true,
  verbose: false,
  filename: '[name].css',
  outputPath: null,
}
```
The `filename` property see by [filename option](#plugin-option-filename).
The `outputPath` property see by [outputPath option](#plugin-option-outputPath).

The option to extract CSS from a style source file loaded in the Pug tag `link` using `require()`:
```pug
link(href=require('./style.scss') rel='stylesheet')
```

> **Warning**
>
> Don't import source styles in JavaScript! Styles must be loaded directly in Pug.

The default CSS output filename is `[name].css`. You can specify your own filename using [webpack filename substitutions](https://webpack.js.org/configuration/output/#outputfilename):

```js
const PugPlugin = require('pug-plugin');
module.exports = {
  plugins: [
    new PugPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
};
```

The `[name]` is the base filename of a loaded style.
For example, if source file is `style.scss`, then output filename will be `assets/css/style.1234abcd.css`.\
If you want to have a different output filename, you can use the `filename` options as the [function](https://webpack.js.org/configuration/output/#outputfilename).

> **Warning**
> 
> Don't use `mini-css-extract-plugin`, `style-loader`, `resolve-url-loader`, they are not required more.\
> The `pug-plugin` resolves all resource URLs in CSS and extracts CSS much faster than others.

### `js`
Type: `Object`\
Default properties:
```js
{
  verbose: false,
  filename: '[name].js', 
  outputPath: null,
}
```
The `filename` property see by [filename option](#plugin-option-filename).
The `outputPath` property see by [outputPath option](#plugin-option-outputPath).

> **Note**
> 
> - the extract `js` module is always enabled
> - the `test` property not exist because all required scripts are automatically detected

The option to extract JS from a script source file loaded in the Pug tag `script` using `require()`:
```pug
script(src=require('./main.js'))
```

The default JS output filename is `[name].js`. You can specify your own filename using [webpack filename substitutions](https://webpack.js.org/configuration/output/#outputfilename):

```js
const PugPlugin = require('pug-plugin');
module.exports = {
  plugins: [
    new PugPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],
};
```

The `[name]` is the base filename of a loaded script.
For example, if source file is `main.js`, then output filename will be `assets/js/main.1234abcd.js`.\
If you want to have a different output filename, you can use the `filename` options as the [function](https://webpack.js.org/configuration/output/#outputfilename).


### `extractComments`
Type: `boolean` Default: `false`<br>
Enable / disable extraction of comments to `*.LICENSE.txt` file.

When using `splitChunks` optimization for node modules containing comments,
Webpack extracts those comments into a separate text file.
By default, the plugin don't create such unwanted text files.
But if you want to extract files like `*.LICENSE.txt`, set this option to `true`:

```js
const PugPlugin = require('pug-plugin');
module.exports = {
  plugins: [
    new PugPlugin({
      extractComments: true,
    }),
  ],
};
```

### `postprocess`
Type: `Function` Default: `null`<br>
The post process for extracted content from compiled entry.
The following parameters are available in the function:
  - `@param {string} content` The content of compiled entry.
  - `@param {ResourceInfo} info` The info of current asset.
  - `@param {webpack Compilation} compilation` The Webpack [compilation object](https://webpack.js.org/api/compilation-object/).
  - `@return {string | null}` Return string content to save to output directory.\
    If return `null` then the compiled content of the entry will be ignored, and will be saved original content compiled as JS module.
    Returning `null` can be useful for debugging to see the source of the compilation of the Webpack loader.

```js
/**
 * @typedef {Object} ResourceInfo
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {string | (function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} outputPath The absolute path to output directory of asset.
 * @property {string} assetFile The output asset file relative by outputPath.
 */
```

<a id="loader-options" name="loader-options" href="#loader-options"></a>
## Loader options

The Pug plugin contain the [pug-loader](https://github.com/webdiscus/pug-loader).
Complete description see under [pug-loader options](https://github.com/webdiscus/pug-loader#options).

### `method`

Type: `string` Default: `render`<br>

> **Note**
>
> The default method of `pug-loader` is `compile`, but using the `pug-plugin` the default loader method is `render`,
> because the plugin renders Pug to static HTML and this method is fastest.

<a id="method-render" name="method-render" href="#method-render"></a>
### Method `render`

The `render` method renders Pug into HTML at compile time and exports the HTML as a string.

Add to Webpack config the module rule:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // default method is 'render'
      },
    ],
  },
};
```

See the [example code](#example-pug-in-js-render).

<a id="method-compile" name="method-compile" href="#method-compile"></a>
### Method `compile`
The `compile` method compiles Pug into a template function and in JavaScript can be called with variables to render into HTML at runtime.

To use the `render` method for rendering Pug from the Webpack entry and the `compile` method in JavaScript, use the `oneOf` Webpack rule:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        oneOf: [
          // import Pug in JavaScript/TypeScript as template function
          {
            issuer: /\.(js|ts)$/, // match scripts where Pug is used
            loader: PugPlugin.loader,
            options: {
              method: 'compile', // compile Pug into template function
            },
          },
          // render Pug from Webpack entry into static HTML
          {
            loader: PugPlugin.loader, // default method is 'render'
          },
        ],
      },
    ],
  },
};
```

See the [example code](#example-pug-in-js-compile).

---


<a id="usage-examples" name="usage-examples" href="#usage-examples"></a>
## Usage examples

<a id="example-pug-js-scss-img-font" name="example-pug-js-scss-img-font" href="#example-pug-js-scss-img-font"></a>
### Using JS, SCSS, images and fonts with Pug
The simple example of resolving the asset resources via require() in Pug and via url() in scss.

The Webpack config:
```js
const PugPlugin = require('pug-plugin');
module.exports = {
  entry: {
    // define all Pug files here
    index: './src/pages/home/index.pug',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },
  
  resolve: {
    alias: {
      // use alias to avoid relative paths like `./../../images/`
      Images: path.join(__dirname, './src/images/'),
      Fonts: path.join(__dirname, './src/fonts/')
    }
  },

  plugins: [
    new PugPlugin({
      js: {
        // output filename of extracted JS file from source script
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS file from source style
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          // output filename of images
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
          // output filename of fonts
          filename: 'assets/fonts/[name][ext][query]',
        },
      },
    ],
  },
};
```

The Pug template `./src/pages/home/index.pug`:
```pug
html
  head
    link(rel="icon" type="image/png" href=require('Images/favicon.png'))
    link(href=require('./style.scss') rel='stylesheet')
  body
    .header Here is the header with background image
    h1 Hello Pug!
    img(src=require('Images/pug-logo.jpg') alt="pug logo")
    script(src=require('./main.js'))
```

The source script `./src/pages/home/main.js`
```js
console.log('Hello Pug!');
```

The source styles `./src/pages/home/style.scss`
```scss
// Pug plugin can resolve styles in node_modules. 
// The package 'material-icons' must be installed in packages.json.
@use 'material-icons'; 

// Resolve the font in the directory using the Webpack alias.
@font-face {
  font-family: 'Montserrat';
  src: url('Fonts/Montserrat/Montserrat-Regular.woff2'); // pug-plugin can resolve url
  ...
}

body {
  font-family: 'Montserrat', serif;
}

.header {
  background-image: url('Images/header.png'); // pug-plugin can resolve url
  ...
}
```

> **Note**
> 
> The Pug plugin can resolve an url (as relative path, with alias, from node_modules) without requiring `source-maps`. Do not need additional loader such as `resolve-url-loader`.

The generated CSS `dist/assets/css/style.f57966f4.css`:
```css
/*
 * All styles of npm package 'material-icons' are included here.
 * The imported fonts from `node_modules` will be coped in output directory. 
 */
@font-face {
  font-family: "Material Icons";
  src: 
      url(/assets/fonts/material-icons.woff2) format("woff2"),
      url(/assets/fonts/material-icons.woff) format("woff");
  ...
}
.material-icons {
  font-family: "Material Icons";
  ...
}

/* 
 * Fonts from local directory. 
 */
@font-face {
  font-family: 'Montserrat';
  src: url(/assets/fonts/Montserrat-Regular.woff2);
  ...
}

body {
  font-family: 'Montserrat', serif;
}

.header {
  background-image: url(/assets/img/header.4fe56ae8.png);
  ...
}
```

> **Note**
> 
> All resolved files will be coped to the output directory, so no additional plugin is required, such as `copy-webpack-plugin`.

The generated HTML `dist/index.html` contains the hashed output filenames of the required assets:
```html
<html>
  <head>
    <link rel="stylesheet" href="/assets/css/style.f57966f4.css">
  </head>
  <body>
    <div class="header">Here is the header with background image</div>
    <h1>Hello Pug!</h1>
    <img src="/assets/img/pug-logo.85e6bf55.jpg" alt="pug logo">
    <script src="/assets/js/main.b855d8f4.js"></script>
  </body>
</html>
```

All this is done by one Pug plugin, without additional plugins and loaders. To save build time, to keep your Webpack config clear and clean, just use this plugin.

---


<a id="example-pug-in-js-render" name="example-pug-in-js-render" href="#example-pug-in-js-render"></a>
### Using Pug in JavaScript with `render` method

_./webpack.config.js_
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  entry: {
    index: './src/index.pug' // => dist/index.html
  },
  plugins: [
    new PugPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],
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

_./src/index.pug_
```pug
html
  head
  body
    h1 Hello Pug!
    #js-component-container
    script(src=require('./component.js'))
```

_./src/component.pug_
```pug
.component
  h1 Title
  p The teaser.
```

_./src/component.js_
```js
import componentHtml from './component.pug';
const containerElm = document.getElementById('js-component-container');
containerElm.innerHTML = componentHtml;
```

The `componentHtml` contain rendered HTML string:
```html
<div class="component">
  <h1>Title</h1>
  <p>The teaser.</p>
</div>
```

The generated `./dist/index.html`:
```html
<html>
  <head></head>
  <body>
    <h1>Hello Pug!</h1>
    <div id="js-component-container">
      <!-- The Pug component inserted in JavaScript -->
      <div class="component">
        <h1>Title</h1>
        <p>The teaser.</p>
      </div>
    </div>
    <script src='component.b855d8f4.js'></script>
  </body>
</html>
```

---


<a id="example-pug-in-js-compile" name="example-pug-in-js-compile" href="#example-pug-in-js-compile"></a>
### Using Pug in JavaScript with `compile` method

_./webpack.config.js_
```js
const path = require('path');
const PugPlugin = require('pug-plugin');
module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  entry: {
    index: './src/index.pug' // => dist/index.html
  },
  plugins: [
    new PugPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        oneOf: [
          // import Pug in JavaScript/TypeScript as template function
          {
            issuer: /\.(js|ts)$/,
            loader: PugPlugin.loader,
            options: {
              method: 'compile',
            },
          },
          // render Pug from Webpack entry into static HTML
          {
            loader: PugPlugin.loader,
          },
        ],
      },
    ],
  },
};
```

_./src/index.pug_
```pug
html
  head
  body
    h1 Hello Pug!
    #js-component-container
    script(src=require('./component.js'))
```

_./src/component.pug_ with variables
```pug
.component
  h1 #{title}
  p #{teaser}
```

_./src/component.js_
```js
import componentTmpl from './component.pug';
const componentHtml = componentTmpl({
  title: 'My component',
  teaser: 'My teaser.'
});
const containerElm = document.getElementById('js-component-container');
containerElm.innerHTML = componentHtml;
```

The `componentTmpl` contain the template function.
The `componentHtml` contain rendered HTML string with passed data at runtime:
```html
<div class="component">
  <h1>My component</h1>
  <p>My teaser.</p>
</div>
```

The generated `./dist/index.html`:
```html
<html>
  <head></head>
  <body>
    <h1>Hello Pug!</h1>
    <div id="js-component-container">
      <!-- The Pug component with variables passed in JavaScript -->
      <div class="component">
        <h1>My component</h1>
        <p>My teaser.</p>
      </div>
    </div>
    <script src='component.b855d8f4.js'></script>
  </body>
</html>
```

---


<a id="recipes" name="recipes" href="#recipes"></a>
## Recipes


<a id="recipe-keep-individual-pug-dirs" name="recipe-keep-individual-pug-dirs" href="#recipe-keep-individual-pug-dirs"></a>
### Keep the source folder structure in output directory for individual Pug files

There are two ways to keep/change the output filename for Pug files:

- use the Webpack entry key as unique path to output file
- use the Webpack entry as object with `filename` property as a Function like `keepPugFolderStructure()` in the example below

```js
const path = require('path');
const PugPlugin = require('pug-plugin');

const sourcePath = path.join(__dirname, 'src');               // => /path/to/src

const keepPugFolderStructure = (pathData) => {
  const sourceFile = pathData.filename;                       // => /path/to/src/pages/about.pug
  const relativeFile = path.relative(sourcePath, sourceFile); // => pages/about.pug
  const { dir, name } = path.parse(relativeFile);             // dir: 'pages', name: 'about'
  return `${dir}/${name}.html`;                               // => dist/pages/about.html
};

module.exports = {
  entry: {
    index: './src/index.pug', // dist/index.html
    'pages/contact': './src/pages/contact/index.pug', // dist/pages/contact.html
    // any unique key, not used to generate the output filename
    page001: {
      import: './src/pages/about.pug',
      filename: keepPugFolderStructure, // => dist/pages/about.html
    },
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};
```

<a id="recipe-keep-all-pug-dirs" name="recipe-keep-all-pug-dirs" href="#recipe-keep-all-pug-dirs"></a>
### Keep the source folder structure in output directory for all Pug files

To keep/change the output filename for all Pug files, use the `filename` option of the Pug plugin as a Function like `keepPugFolderStructure()` in the example:

```js
const path = require('path');
const PugPlugin = require('pug-plugin');

const sourcePath = path.join(__dirname, 'src');               // => /path/to/src

const keepPugFolderStructure = (pathData) => {
  const sourceFile = pathData.filename;                       // => /path/to/src/pages/about.pug
  const relativeFile = path.relative(sourcePath, sourceFile); // => pages/about.pug
  const { dir, name } = path.parse(relativeFile);             // dir: 'pages', name: 'about'
  return `${dir}/${name}.html`;                               // => dist/pages/about.html
};

module.exports = {
  entry: {
    // Note: each key must be unique, not used to generate the output filename.
    // The output filename will be generated by source filename via the keepPugFolderStructure().
    page001: './src/index.pug', // => dist/index.html
    page002: './src/pages/about.pug', // => dist/pages/about.html
    page003: './src/pages/contact/index.pug', // => dist/pages/contact/index.html
  },

  plugins: [
    new PugPlugin({
      // use the function to dynamic generate output filenames for all Pug files defined in the entry
      filename: keepPugFolderStructure,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};
```

<a id="recipe-keep-all-resource-dirs" name="recipe-keep-all-resource-dirs" href="#recipe-keep-all-resource-dirs"></a>
### Keep the source folder structure in output directory for all fonts

To keep/change the output filename for all asset resources, like fonts, use the `generator.filename` as a Function, for example:

```js
const path = require('path');
const PugPlugin = require('pug-plugin');

const sourceDirname = 'src/';

module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|svg|eot|ttf|otf)$/,
        include: /[\\/]fonts[\\/]/, // match SVG font only from '/fonts/' directory
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            const { dir } = path.parse(pathData.filename); // the filename is relative path by project
            const outputPath = dir.replace(sourceDirname, '');
            return outputPath + '/[name][ext]';
          },
        },
      },
    ],
  },
};
```

The source font files: 
```
src/assets/fonts/OpenSans/open-sans-italic.svg
src/assets/fonts/OpenSans/open-sans-regular.svg
```

The font files in output `dist/` directory will have original folder structure:
```
dist/assets/fonts/OpenSans/open-sans-italic.svg
dist/assets/fonts/OpenSans/open-sans-regular.svg
```

<a id="recipe-default-script-style-from-module" name="recipe-default-script-style-from-module" href="#recipe-default-script-style-from-module"></a>
### Using JS and CSS for browser from module in Pug

Many node modules specify compiled bundles for the browser in fields of its own `package.json`.

For example, the [material-icons](https://github.com/marella/material-icons/blob/main/package.json) use the field `browser` for compiled CSS file.
The [bootstrap](https://github.com/twbs/bootstrap/blob/main/package.json) use the `main` field for compiled JS and the `style` field for CSS.

You can specify only module name, Pug plugin automatically resolves files for script and style: 

```pug
link(href=require('bootstrap') rel='stylesheet') // bootstrap/dist/css/bootstrap.css
script(src=require('bootstrap'))                 // bootstrap/dist/js/bootstrap.js
```

If you need to load a specific version of a file, use the path to that file, for example:
```pug
link(href=require('bootstrap/dist/css/bootstrap.rtl.css') rel='stylesheet')
script(src=require('bootstrap/dist/js/bootstrap.bundle.js'))
```

> **Warning**
> 
> Don't use a relative path to `node_modules`, like `../../../node_modules/bootstrap`.
> The Pug plugin resolves node modules by their name.

<a id="recipe-import-style-from-module" name="recipe-import-style-from-module" href="#recipe-import-style-from-module"></a>
### Import style from module in SCSS

Pug plugin can resolve styles in `node_modules`.

> **Note**
> 
> Pug plugin resolves styles much fasted than the [resolve-url-loader](https://github.com/bholloway/resolve-url-loader) 
> and don't require to use the source map in `sass-loader`.


```scss
@use 'MODULE_NAME/path/to/style';
```

> **Important:** the file extension, e.g. .scss, .css, must be omitted.

Example how to import source styles of [material-icons](https://github.com/marella/material-icons):

```scss
// import styles from installed module `material-icons`
@use 'material-icons';

// define short class name
.mat-icon {
  @extend .material-icons-outlined;
}
```

Usage of the icon `home` in Pug:

```pug
.mat-icon home
```

Example how to import the style theme `tomorrow` of the [prismjs](https://github.com/PrismJS/prism) module:

```scss
// import default prismjs styles from installed module `prismjs`
@use 'prismjs/themes/prism-tomorrow.min';
```

> **Note**
>
> Use the `@use` instead of `@import`, because it is [deprecated](https://github.com/sass/sass/blob/main/accepted/module-system.md#timeline).


<a id="recipe-inline-css" name="recipe-inline-css" href="#recipe-inline-css"></a>
### Inline CSS in HTML

_Webpack config rule for styles_
```js
{
  test: /\.(css|sass|scss)$/,
  use: ['css-loader', 'sass-loader'],
},
```

For example, the _style.scss_
```scss
$color: crimson;
h1 {
  color: $color;
}
```

Add the `?inline` query to the source filename which you want to inline:

```pug
html
  head
    //- load style as file
    link(href=require('./main.scss') rel='stylesheet')
    //- inline style
    style=require('./style.scss?inline')
  body
    h1 Hello World!
```

The generated HTML contains inline CSS already processed via Webpack:
```html
<html>
  <head>
    <link href="assets/css/main.05e4dd86.css" rel="stylesheet">
    <style>
      h1 {
        color: crimson;
      }
    </style>
  </head>
  <body>
    <h1>Hello Pug!</h1>
  </body>
</html>
```

> **Note**
>
> To enable source map in inline CSS set the Webpack option `devtool: 'source-map'`.


<a id="recipe-inline-js" name="recipe-inline-js" href="#recipe-inline-js"></a>
## How to inline JS in HTML

For example, the _main.js_:
```js
console.log('Hello JS!');
```

Add the `?inline` query to the source filename which you want to inline:

```pug
html
  head
    //- load script as file
    script(src=require('./main.js'))
    //- inline script
    script=require('./main.js?inline')
  body
    h1 Hello World!
```

The generated HTML contains inline JS already compiled via Webpack:

```html
<html>
  <head>
    <script src="assets/js/main.992ba657.js" defer="defer"></script>
    <script>
      (()=>{"use strict";console.log("Hello JS!")})();
    </script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

<a id="recipe-import-url-in-css" name="recipe-import-url-in-css" href="#recipe-import-url-in-css"></a>
### How to use @import url() in CSS

> **Warning**
> 
> Don't use `@import in CSS`. It's very `bad practice`.
>

Bad example:\
_main.css_
```css
@import 'path/to/style.css';
```

Pug plugin not support handling of `@import url` in CSS. Imported url will be passed 1:1 into resulting CSS.
**The problem:** defaults, `css-loader` handles @import at-rule, which causes an issue in the Pug plugin.
To avoid this problem add the `import: false` option to `css-loader` to disable handling of @import at-rule in CSS:

```js
{
  test: /.(css)$/i,
  use: [
    {
      loader: 'css-loader',
      options: {
        import: false, // pass @import url as is
      },
    },
  ],
},
```

> **Note**
> 
> Because imported in CSS files are not handled, these files need to be manually copied to a `dist` folder using the `copy-webpack-plugin`.


<a id="recipe-split-chunks" name="recipe-split-chunks" href="#recipe-split-chunks"></a>
### How to config `splitChunks`

Webpack tries to split every entry file, include template files, which completely breaks the compilation process in the plugin.

To avoid this issue, you must specify which scripts should be split, using `optimization.splitChunks.cacheGroups`:

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /\.(js|ts)$/,
          chunks: 'all',
        },
      },
    },
  },
};
```

> **Note**
>
> In the `test` option must be specified all extensions of scripts which should be split.

See details by [splitChunks.cacheGroups](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups).

For example, in a template are used the scripts and styles from `node_modules`:
```pug
html
  head
    link(href=require('bootstrap/dist/css/bootstrap.min.css') rel='stylesheet')
    script(src=require('bootstrap/dist/js/bootstrap.min.js') defer)
  body
    h1 Hello Pug!
    script(src=require('./main.js'))
```

In this use case the `optimization.cacheGroups.{cacheGroup}.test` option must match exactly only JS files from `node_modules`:
```js
module.exports = {
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use exactly this Regexp
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
};
```

> **Warning**
> 
> Splitting CSS to many chunk is principal impossible. Splitting works only for JS files.
> If you use vendor styles in your style file, e.g.: 
> 
> _style.scss_
> ```scss
> @use "bootstrap/scss/bootstrap";
> body {
>   color: bootstrap.$primary;
> }
> ```
> 
> Then vendor styles will not be saved to a separate file, because `sass-loader` generates one CSS bundle code.
> Therefore vendor styles should be loaded in a template separately.

> **Warning**
>
> If you will to use the `test` as `/[\\/]node_modules[\\/]`, without extension specification, 
> then Webpack concatenates JS code together with CSS in one file, 
> because Webpack can't differentiate CSS module from JS module, therefore you MUST match only JS files.
>
> If you want save module styles separate from your styles, then load them in a template separately:
> ```Pug
> html
>   head
>     //- require module styles separately:
>     link(href=require('bootstrap/dist/css/bootstrap.min.css') rel='stylesheet')
>     //- require your styles separately:
>     link(href=require('./style.scss') rel='stylesheet')
>   body
>     h1 Hello Pug!
>     script(src=require('./main.js'))
> ```

<a id="recipe-split-many-modules" name="recipe-split-many-modules" href="#recipe-split-many-modules"></a>
### How to split multiple node modules and save under own names

If you use many node modules and want save each module to separate file then use `optimization.cacheGroups.{cacheGroup}.name` as function.

For example, many node modules are imported in the `script.js`:
```js
import { Button } from 'bootstrap';
import _, { map } from 'underscore';
// ...
```

Then, use the `optimization.splitChunks.cacheGroups.{cacheGroup}.name` as following function:
```js
const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  plugins: [
    new PugPlugin({
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 10000, // extract modules bigger than 10KB, defaults is 30KB
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // split JS only, ignore CSS modules
          // save chunk under a name
          name(module, chunks, groupName) {
            const moduleName = module.resourceResolveData.descriptionFileData.name.replace('@', '');
            return `${groupName}.${moduleName}`;
          },
        },
      },
    },
  },
};
```

The split files will be saved like this:
```
dist/js/npm.popperjs/core.f96a1152.js <- the `popperjs/core` used in bootstrap will be extracted too
dist/js/npm.bootstrap.f69a4e44.js
dist/js/npm.underscore.4e44f69a.js
dist/js/runtime.9cd0e0f9.js <- common runtime code
dist/js/script.3010da09.js
```


<a id="recipe-hmr" name="recipe-hmr" href="#recipe-hmr"></a>
### HMR live reload

To enable live reload by changes any file add in the Webpack config the `devServer` option:
```js
module.exports = {
  // enable HMR with live reload
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
```

> **Note**
>
> Live reload works only if in Pug used a JS file.
> If your Pug template has not a JS, then create one empty JS file, e.g. `hmr.js` and add it in Pug for `development` mode only:
> ```js
> if isDev
>   script(src=require('./hmr.js'))
> ```
> 
> Where `isDev` is the passed variable from Webpack config.
>
To pass global variables into all Pug files, add a variable in the `data` option of `PugPlugin.loader`:
```js
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          data: {
            isDev, // pass global variable into all Pug files
          }
        },
      },
    ],
  },
};
```

---

## Testing

`npm run test` will run the unit and integration tests.\
`npm run test:coverage` will run the tests with coverage.

## Also See

- more examples of usages see in [test cases](https://github.com/webdiscus/pug-plugin/tree/master/test/cases)
- [ansis][ansis] - The Node.js library for ANSI color styling of text in terminal
- [pug-loader][pug-loader] see here configuration options for `PugPlugin.loader`
- [pug-loader `:highlight` filter][pug-filter-highlight] highlights code syntax
- [pug-loader `:markdown` filter][pug-filter-markdown] transform markdown to HTML and highlights code syntax
- [html-bundler-webpack-plugin][html-bundler-webpack-plugin] - The plugin handles HTML template as entry point, extracts CSS, JS, images from their sources loaded directly in HTML

## License

[ISC](https://github.com/webdiscus/pug-loader/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-filter-highlight]: https://webdiscus.github.io/pug-loader/pug-filters/highlight.html
[pug-filter-markdown]: https://webdiscus.github.io/pug-loader/pug-filters/markdown.html
[html-bundler-webpack-plugin]: https://github.com/webdiscus/html-bundler-webpack-plugin
