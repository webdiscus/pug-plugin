<div align="center">
  <h1>
    <a href="https://pugjs.org">
      <img height="120" src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg">
    </a>
    <a href="https://github.com/webpack/webpack">
      <img height="120" src="https://webpack.js.org/assets/icon-square-big.svg">
    </a>
    <br>
    <a href="https://github.com/webdiscus/pug-plugin">Pug Plugin for Webpack</a>
  </h1>
  <div>The plugin renders Pug templates with referenced source asset files into HTML</div>
</div>

---
[![npm](https://img.shields.io/npm/v/pug-plugin?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/pug-plugin "download npm package")
[![node](https://img.shields.io/node/v/pug-plugin)](https://nodejs.org)
[![node](https://img.shields.io/github/package-json/dependency-version/webdiscus/pug-plugin/peer/webpack)](https://webpack.js.org/)
[![Test](https://github.com/webdiscus/pug-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/pug-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/pug-plugin/branch/master/graph/badge.svg?token=Q6YMEN536M)](https://codecov.io/gh/webdiscus/pug-plugin)
[![node](https://img.shields.io/npm/dm/pug-plugin)](https://www.npmjs.com/package/pug-plugin)


## Pug template as entry point

The **Pug Plugin** generates static HTML or [template function](https://github.com/webdiscus/html-bundler-webpack-plugin#template-in-js) from **Pug template** containing source files of scripts, styles, images, fonts and other resources, similar to how it works in [Vite](https://vitejs.dev/guide/#index-html-and-project-root).
This plugin allows using a template file as an [entry point](https://github.com/webdiscus/html-bundler-webpack-plugin#option-entry).

The plugin resolves source files of assets in templates and replaces them with correct output URLs in the generated HTML.
The resolved assets will be processed via Webpack plugins/loaders and placed into the output directory.
You can use a relative path or Webpack alias to a source file.

A template imported in JS will be compiled into [template function](https://github.com/webdiscus/html-bundler-webpack-plugin#template-in-js). You can use the **template function** in JS to render the template with variables in runtime on the client-side in the browser.

## 💡 Highlights

- An [entry point](https://github.com/webdiscus/html-bundler-webpack-plugin#option-entry) is the Pug template.
- **Auto processing** multiple templates in the [entry path](https://github.com/webdiscus/html-bundler-webpack-plugin#option-entry-path).
- Allows to specify [`script`](#option-js) and [`style`](https://github.com/webdiscus/html-bundler-webpack-plugin#option-css) **source files** directly in **Pug**:
  - `link(href="./style.scss" rel="stylesheet")`
  - `script(src="./app.tsx" defer="defer")`
- **Resolves** [source files](https://github.com/webdiscus/html-bundler-webpack-plugin#loader-option-sources) in [default attributes](https://github.com/webdiscus/html-bundler-webpack-plugin#loader-option-sources-default) `href` `src` `srcset` etc. using **relative path** or **alias**:
  - `link(href="../images/favicon.svg" type="image/svg" rel=icon)`
  - `img(src="@images/pic.png" srcset="@images/pic400.png 1x, @images/pic800.png 2x")`
- **Inlines** [JS](https://github.com/webdiscus/html-bundler-webpack-plugin#recipe-inline-js) and [CSS](https://github.com/webdiscus/html-bundler-webpack-plugin#recipe-inline-css) into HTML.
- **Inlines** [images](https://github.com/webdiscus/html-bundler-webpack-plugin#recipe-inline-image) into HTML and CSS.
- **Compile** the Pug template into [template function](https://github.com/webdiscus/html-bundler-webpack-plugin#template-in-js) for usage in JS on the client-side.
- Generates the [preload](https://github.com/webdiscus/html-bundler-webpack-plugin#option-preload) tags for fonts, images, video, scripts, styles, etc.
- Generates the [integrity](https://github.com/webdiscus/html-bundler-webpack-plugin#option-integrity) attribute in the `link` and `script` tags.
- Generates the [favicons](https://github.com/webdiscus/html-bundler-webpack-plugin#favicons-bundler-plugin) of different sizes for various platforms.
- Built-in filters: `:escape` `:code` `:highlight` `:markdown`.
- You can create **own plugin** using the [Plugin Hooks](https://github.com/webdiscus/html-bundler-webpack-plugin#plugin-hooks-and-callbacks).

See the [full list of features](https://github.com/webdiscus/html-bundler-webpack-plugin#features).


> **Note**
>
> ‼️ All [features](https://github.com/webdiscus/html-bundler-webpack-plugin#features) and [options](https://github.com/webdiscus/html-bundler-webpack-plugin?#plugin-options) of the [html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) available now in the `pug-plugin` too.


> **Warning**
> 
> Since the version `5.0.0`, the **Pug plugin** is essentially the [html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) preconfigured for using [Pug templates](https://github.com/webdiscus/html-bundler-webpack-plugin?#using-template-pug).

> **Warning**
> 
> Compared to the version `4.x`, in the new version `5.x` the source asset file can be specified in a template without the `require()` function.
> For compatibility, the `require()` function is still supported.
> 
> ```pug
> //- OLD syntax: the path is relative to the partial file or can be as the webpack alias
> link(href=require("./style.scss") rel="stylesheet")
> //- NEW syntax: the path is relative to the entry file or can be as the webpack alias
> link(href="./style.scss" rel="stylesheet")
> ```
> 
> See the full list of the [BREAKING CHANGES in v5](https://github.com/webdiscus/pug-plugin/blob/master/CHANGELOG.md#500-2024-02-08).

---

### 📋 [Table of Contents](https://github.com/webdiscus/html-bundler-webpack-plugin#contents)

### ⚙️ [Pug Plugin options](#options)

### 📜 [History of Pug Plugin](#history-pug-plugin)

---

## Install and Quick start

Install the `pug-plugin`:
```bash
npm install pug-plugin --save-dev
```

Install additional packages for styles:
```bash
npm install css-loader sass sass-loader --save-dev
```

For example, there is the Pug template with source asset files _./src/views/index.pug_:
```pug
html
  head
    //- relative path to SCSS source file
    link(href="../scss/style.scss" rel="stylesheet")
    //- relative path to TypeScript source file
    script(src="../app/main.js" defer="defer")
  body
    h1 Hello World!
    //- relative path to image source file
    img(src="../assets/images/picture1.png")
    //- Webpack alias as path (src/assets/images/) to image source file
    img(src="@images/picture2.png")
```

The minimal webpack config:

```js
const PugPlugin = require('PugPlugin');

module.exports = {
  plugins: [
    new PugPlugin({
      entry: {
        // define many page templates here
        index: 'src/views/index.pug', // => dist/index.html
      },
      js: {
        // JS output filename
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // CSS output filename
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(s?css|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
```

> **Warning**
> 
> No additional pug or html loaders required.


The generated HTML contains URLs of the output filenames:

```html
<html>
  <head>
    <link href="css/style.05e4dd86.css" rel="stylesheet" />
    <script src="js/main.f4b855d8.js" defer="defer"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    <img src="img/picture1.58b43bd8.png" />
    <img src="img/picture2.bd858b43.png" />
  </body>
</html>
```

<a id="options" name="options"></a>

## Pug Plugin options

The Pug plugin has all the [options](https://github.com/webdiscus/html-bundler-webpack-plugin?#plugin-options) of the `HTML Bundler Plugin`, plus a few options specific to Pug plugin.

<a id="option-pretty" name="option-pretty"></a>
### `pretty`

Type: `'auto'|boolean|Object` Default: `false`

The Pug compiler generate minimized HTML.
For formatting generated HTML is used the [js-beautify](https://github.com/beautifier/js-beautify) with the following `default options`:

```js
{
  html: {
    indent_size: 2,
    end_with_newline: true,
    indent_inner_html: true,
    preserve_newlines: true,
    max_preserve_newlines: 0,
    wrap_line_length: 120,
    extra_liners: [],
    space_before_conditional: true,
    js: {
      end_with_newline: false,
      preserve_newlines: true,
      max_preserve_newlines: 2,
      space_after_anon_function: true,
    },
    css: {
      end_with_newline: false,
      preserve_newlines: false,
      newline_between_rules: false,
    },
  },
}
```

Possible values:

- `false` - disable formatting
- `true` - enable formatting with default options
- `'auto'` - in `development` mode enable formatting with default options, in `production` mode disable formatting,
  use [prettyOptions](#option-pretty-options) to customize options
- `{}` - enable formatting with custom options, this object are merged with `default options`\
  see [options reference](https://github.com/beautifier/js-beautify#options)

  
<a id="option-pretty-options" name="option-pretty-options"></a>
### `prettyOptions`

Type: `Object` Default: `null`

When the [pretty](#option-pretty) option is set to `auto` or `true`, you can configure minification options using the `prettyOptions`.

<a id="history-pug-plugin" name="history-pug-plugin"></a>

---
## History of Pug Plugin

**Why the Pug Plugin since `v5.0` based on [html-bundler-webpack-plugin][html-bundler-webpack-plugin]?**

**2021**\
The history of the creation of the `pug-plugin` began back in October 2021.
Then, at the end of 2021, I created the [@webdiscus/pug-loader][pug-loader] that had all the features of the original [pug-loader](https://github.com/pugjs/pug-loader).

**2022**\
Using, then without an alternative, `html-webpack-plugin` caused me pain and suffering to configure webpack for rendering Pug templates containing various assets.
At the beginning of 2022, I started creating the `pug-plugin` as a complete replacement for the `html-webpack-plugin` and many other _"crutches"_.
During of the year, the `pug-plugin` has gained a lot of useful features and was able to replace the `html-webpack-plugin`, `mini-css-extract-plugin` and many other [plugins and loaders](https://github.com/webdiscus/html-bundler-webpack-plugin?tab=readme-ov-file#list-of-plugins).

**2023**\
Based on the `pug-plugin` code, I decided to create a universal [html-bundler-webpack-plugin][html-bundler-webpack-plugin] that would support all the most popular template engines, such as [Eta](https://eta.js.org), [EJS](https://ejs.co), [Handlebars](https://handlebarsjs.com), [Nunjucks](https://mozilla.github.io/nunjucks/), [Pug](https://pugjs.org/), [TwigJS](https://github.com/twigjs/twig.js), and would be [extendable](https://github.com/webdiscus/html-bundler-webpack-plugin#custom-templating-engine) for other template engines, e.g., [LiquidJS](https://github.com/webdiscus/html-bundler-webpack-plugin#using-the-liquidjs).
During 2023, this plugin has gained even more [useful features](https://github.com/webdiscus/html-bundler-webpack-plugin#features) and absorbed all the functionality of the `pug-plugin` and the `@webdiscus/pug-loader`.

**2024**\
At the beginning of 2024, the `pug-plugin` completely switched to the universal code `html-bundler-webpack-plugin`.
Starting from version `5.0`, the `pug-plugin` is the `html-bundler-webpack-plugin` [pre-configured for Pug](https://github.com/webdiscus/html-bundler-webpack-plugin#using-template-pug) templates with the pre-installed `pug` package.

The config of `pug-plugin >= v5.0`:

```js
const PugPlugin = require('pug-plugin');

module.exports = {
  plugins: [
    new PugPlugin({
      entry: {
        index: 'src/views/home.pug',
      },
    }),
  ],
};
```

is the same as:

```js
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/home.pug',
      },
      preprocessor: 'pug', // <= enable using Pug templating engine
    }),
  ],
};
```

> The `pug-plugin`'s heart now lives in the `html-bundler-webpack-plugin`.
> 
> `@webdiscus/pug-loader` -> `pug-plugin` -> `html-bundler-webpack-plugin` -> `pug-plugin`
> 

## Also See

- [ansis][ansis] - The Node.js library for ANSI color styling of text in terminal
- [pug-loader][pug-loader] - The Pug loader for webpack
- [html-bundler-webpack-plugin][html-bundler-webpack-plugin] - The plugin handles HTML template as entry point, extracts CSS, JS, images from their sources loaded directly in HTML

## License

[ISC](https://github.com/webdiscus/pug-loader/blob/master/LICENSE)

[ansis]: https://github.com/webdiscus/ansis
[pug-loader]: https://github.com/webdiscus/pug-loader
[pug-filter-highlight]: https://webdiscus.github.io/pug-loader/pug-filters/highlight.html
[pug-filter-markdown]: https://webdiscus.github.io/pug-loader/pug-filters/markdown.html
[html-bundler-webpack-plugin]: https://github.com/webdiscus/html-bundler-webpack-plugin
