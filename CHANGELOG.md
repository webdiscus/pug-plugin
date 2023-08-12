# Change log

## 4.9.9 (2023-08-12)
- fix: resolve filename containing a URI fragment, e.g.:
  ```pug
  use(href=require("./icons.svg#home"))
  ```
- chore: update npm packages

## 4.9.8 (2023-07-06)
- fix: missing slash in output filename when publicPath is an url
- test: add test for bugfix with missing slash in output filename

## 4.9.7 (2023-03-10)
- fix: add missing node modules to compilation after rebuild, #65
- fix: correct inline JS when used split chunks
- refactor: optimize code for script processing
- test: add manual test for missing node modules after rebuild

## 4.9.6 (2023-03-04)
- fix: correct loader export when template contain CRLF line separators

## 4.9.5 (2023-02-20)
- chore: bump dev packages
- test: fix testing helpers for exceptions in some cases
- test: add base test template for new issues
- docs: update readme

## 4.9.4 (2023-02-03)
- fix: remove info comments before inlined SVG
- chore: update dev packages
- test: update tests

## 4.9.3 (2023-01-26)
- fix: error after the process when in the template are no scripts

## 4.9.2 (2023-01-20)
- fix: automatic publicPath must be empty string when used HMR
- fix: corrupted inline JS code when code contains '$$' chars chain

## 4.9.1 (2023-01-19)
- fix: resolving an inline script when the `pretty` option is true
- fix: inline SVG in link tag as data-URL
- refactor: improve processing of inline SVG

## 4.9.0 (2023-01-15)
- DEPRECATE: use the `css` option name instead of the `extractCss`
- DEPRECATE: the outdated syntax of CSS option is deprecated, and in next version will be removed:
  ```
  new PugPlugin({
    modules: [
      PugPlugin.extractCss({
        filename: 'assets/css/[name].[contenthash].css',
      }),
    ],
  }),
  ```
  Use the new syntax, since `v4.6.0`:
  ```
  new PugPlugin({
    css: {
      filename: 'assets/css/[name].[contenthash].css',
    },
  }),
  ```
- feat: add support of an inline script using the `?inline` query
- fix: resolving inlined styles on windows
- refactor: optimize code and message output
- test: refactor tests
- test: add test for inline JS
- chore: update dev packages
- docs: update readme

## 4.8.0 (2023-01-03)
- feat: resolve required resources in attribute blocks:
  ```pug
  img&attributes({
    src: require('./image.png'),
    srcset: `${require('./image1.png')} 80w, ${require('./image2.png')} 90w`,
  })
  ```

## 4.7.0 (2022-12-31)
- feat: add the `js.verbose` option to display extract info
- feat: add the `js.outputPath` option
  ```js
  new PugPlugin({
    js: {
      verbose: true,
      filename: '[name].[contenthash].js',
      outputPath: 'assets/js/',
    },
  }),
  ```
- fix: resolving the `js.filename` option when used split chunk
- fix: resolving the asset path when used the `css.outputPath` option
- fix: when `css.filename` is a function, pass the `pathData.filename` property as a source file
- test: optimize test for new options 
- docs: update readme

## 4.6.0 (2022-12-28)
- feat: add short option name `css` as alias for `extractCss` option.
  Now use the new option name `css` instead of `extractCss`:
  ```js
  new PugPlugin({
    css: {
      filename: 'assets/css/[name].[contenthash].css',
    },
  }),
  ```
- feat: add new `js` option with `filename` property as alias for Webpack `output.filename`.
  ```js
  new PugPlugin({
    js: {
      filename: 'assets/js/[name].[contenthash].js',
    },
  }),
  ```
  The `js.filename` option has prio over `output.filename` option.


## 4.5.2 (2022-12-28)
- fix: CSS output path when `publicPath` has `auto` value

## 4.5.1 (2022-12-26)
- fix: generate correct script asset filename by HMR after changes, sometimes filenames are mixed up between files
- fix: passing `data` in loader option when the `self` loader option is true in the `compile` method
- refactor: optimize code
- docs: update readme
- chore: update GitHub workflows

## 4.5.0 (2022-10-20)
- feat: add resolving url() in inlined CSS using the `?inline` query\
  **USAGE CHANGES since v4.4.0**\
  _Pug template_
  ```pug
  //- to inline CSS use exact the `?inline` query
  style=require('./styles.scss?inline')
  ```
  _use Webpack config without the type `asset/source`_
  ```js
  {
    test: /\.(css|sass|scss)$/,
    use: ['css-loader', 'sass-loader'],
  }
  ``` 
- fix: source map in inlined CSS
- docs: update readme

## 4.4.0 (2022-10-17)
- feat: add support for the inline CSS w/o supporting of url()

## 4.3.4 (2022-10-13)
- fix: set default value of `output.path` as `path.join(__dirname, 'dist')`
- fix: set default value of `output.filename` as `[name].js`

## 4.3.3 (2022-10-11)
- fix: resolving of assets in pug templates with an url query
- chore: add example for usage multi-language pages with i18next
- chore: update pug-loader
- chore: update dev dependencies

## 4.3.2 (2022-09-11)
- fix: resolving of modules whose package.json contains `exports` field
- chore: update pug-loader
- chore: update dev dependencies

## 4.3.1 (2022-09-08)
- fix: fixed last stable version of ansis in dependency

## 4.3.0 (2022-09-03)
- feat: add resolving for require in Pug conditional
- feat: add resolving for require in Pug mixin argument
- feat: add resolving for require in Pug `each in` and in `each of` iteration object
- fix: resolve outdated asset filenames after rebuild via webpack dev server, #42
- chore: remove warning 'scripts and styles should be specified in Pug'
- chore: update pug-loader
- chore: update dev dependencies

## 4.2.1 (2022-08-24)
- fix: correct resolve output path of url() in CSS with relative public path,\
       if the public path is relative, then an output path of asset required not in Pug file
       will be auto resolved relative to the issuer
- test: add the test case for correct import CSS node module contained the '.css' extension in module name, e.g. 'normalize.css'

## 4.2.0 (2022-08-22)
- feat: display details verbose data for extracted CSS, images, data-URL, inline SVG, etc.
- fix: fix `info.filename` property of postprocess() argument for pug files
- fix: prevents webpack generating needless alternative requests for pug files\
       to avoid double compiling some pug files containing the require() function
- fix: the entry filename as a function is replaced by the resolved asset name to avoid redundant calling of the filename function by access to the filename property
- refactor: optimize Webpack hook functions
- refactor: optimize resolving and improve performance
- refactor: optimize verbose output
- test: add test for using pug-plugin with svgo-loader

## 4.1.1 (2022-08-12)
- fix: resolve style in Pug from node_modules by module name, e.g.: `link(href=require('bootstrap') rel='stylesheet')`
- fix: avoids generating a needless runtime code of css-loader in user js file when specified both style and script with using splitChunks
- chore: update pug-loader
- test: reduce test fixtures size and test time
- docs: update readme

## 4.1.0 (2022-08-03)
- feat: add the `filename` property to the `pathData` argument of the `filename(pathData)` function in entry object
- docs: add in readme recipes how to keep original folder structure in output directory

## 4.0.0 (2022-08-03)
- BREAKING CHANGE: 
  default value `PugPlugin.loader.option.method` is now `render` instead of `compile`,
  because it makes sense in the vast majority of use cases.\
  By compatibility issues (when the method was not specified), add the `method` option:
```js
{
  loader: PugPlugin.loader,
  options: {
    method: 'compile', // now the default method is `render`
  }
},
```
- BREAKING CHANGE:
  the `outputFile` property of the ResourceInfo (the argument of `postprocess` function) was replaced with `outputPath`.\
  By compatibility issues (when in the `postprocess` was used the `outputFile`),
  add in your postprocess function the code line:
```js
new PugPlugin({
  postprocess: (content, info) => {
    const outputFile = path.join(info.outputPath, info.assetFile); // add this line to get the removed outputFile
    // ...
    return content;
  }
}),
```
- feat: add resolving of file alias for scripts and styles
- feat: improve resolving of script files specified w/o an extension
- feat: improve performance
- feat: update verbose output format to display output path and asset file separately
- feat: update pug-loader to last version optimized for using with pug-plugin
- fix: allow using url query in script source file
- fix: resolving of an absolute path using root context
- fix: resolving of alias to file using root context
- refactor: optimize code
- docs: update readme with usage examples for `render` and `compile` methods

## 3.1.3 (2022-07-23)
- fix: issue by webpack serv/watch when Pug contains duplicate scripts
- fix: display warning when Pug contains duplicate scripts
- fix: verbose outputs data when asset is data URL

## 3.1.2 (2022-07-23)
- feat(experimental): display a warning when using duplicate scripts or styles in the same Pug file
- fix: resolving of duplicate assets in difference style files processed via responsive-loader
- fix: auto publicPath for assets processed via responsive-loader

## 3.1.1 (2022-07-21)
- fix: resolving issues on Windows
- fix: resolving issues by assets with the root path using context
- fix: issue by split chunks from some node modules
- docs: update readme for correct usage of split chunks configuration

## 3.1.0 (2022-07-19) DEPRECATED, use v3.1.1
- feat: add `extractComments` option to enable/disable saving comments in *.LICENSE.txt file
- fix: split chunks for some node modules causes error
- fix: resolving of unique script filename when file required w/o extension

## 3.0.1 (2022-07-17)
- fix: auto public path for windows

## 3.0.0 (2022-07-17)

### ⚠ BREAKING CHANGES

- Drop support for `Node 12`, minimum supported version is `14.18`
  - Node 12 is End-of-Life.
  - Actual version of `sass-loader` 13.x requires Node 14.

- By default, the embedded CSS extractor module is now enabled.
  For compatibility with external extractor, you can disable extractCss module:
```js
new PugPlugin({
  extractCss: {
    enabled: false, // disable embedded extractCss module to bypass extracting via external plugin
  },
}),
  ```

### ⚠ DEPRECATION

definition of extractCss as plugin module is deprecated:
```js
new PugPlugin({
  modules: [
    PugPlugin.extractCss({
      filename: 'assets/css/[name].[contenthash].css',
    })
  ],
}),
```
now use the new `extractCss` option:
```js
new PugPlugin({
  extractCss: {
    filename: 'assets/css/[name].[contenthash].css',
  },
}),
```
> Note: you can still use the `modules: []` option for custom settings.

### Features

- feat: add support auto `publicPath`
- feat: add `extractCss` option for embedded CSS extract module
- feat: defaults, the `extractCss` module is enabled with default options
- feat: improved resolving of assets
- feat: add supports for zero config,\
  it means, that w/o any plugin options the pug, scss and js module will be processed with default options.\
  Zero config `new PugPlugin()` is equivalent to:
  ```js
  new PugPlugin({
    test: /\.(pug)$/,
    enabled: true,
    verbose: false,
    pretty: false,
    sourcePath: null,
    outputPath: null,
    filename: '[name].html',
    extractComments: false,
    extractCss: {
      test: /\.(css|scss|sass|less|styl)$/,
      enabled: true,
      verbose: false,
      filename: '[name].css',
      sourcePath: null,
      outputPath: null,
    },
    modules: [],
  }),
  ```

### Bug Fixes

- fix: assets resolving using auto `publicPath`

## 2.9.3 (2022-07-05)
- fix: remove wrong runtime files split when using splitChunks
- docs: update readme with info how to use split chunk for JS only

## 2.9.2 (2022-07-03)
- fix: HMR issue on Windows

## 2.9.1 (2022-07-03)
- fix: remove unused module

## 2.9.0 (2022-07-03)
- feat: display the error message on broken page due to fatal error
- feat: add HMR support on broken page due to fatal error

## 2.8.0 (2022-06-28)
- feat: improve url dependency resolving in styles using webpack snapshot

## 2.7.9 (2022-06-27)
- refactor: optimize resolving of url in styles

## 2.7.8 (2022-06-27)
- fix: resolving of relative url in deep imported style files
- fix: resolving url with a query in CSS

## 2.7.7 (2022-06-22)
- fix: issue by resolving asset aliases on Windows

## 2.7.6 (2022-06-20)
- fix: warning by watching interpolated dependencies with `compile` method of pug loader
- docs: update readme

## 2.7.5 (2022-06-19)
- fix: missing script attributes after re-compiling with HMR, #21

## 2.7.4 (2022-06-16)
- fix: issue by usage webpack context with webpack alias as a relative path

## 2.7.3 (2022-06-15)
- fix: issue with responsive-loader under Win10

## 2.7.2 (2022-06-10)
- fix: add supports for webpack resolve modules
- fix: encode reserved chars for resource query
- fix: parse require() value with complex interpolation
- refactor: optimized working with [responsible-loader](https://GitHub.com/dazuaz/responsive-loader)
- docs: add the documentation: How to use responsive images with Pug

## 2.7.1 (2022-06-06)
- fix: add support the prefixes `~` `@` for file alias
- chore: code cleanup, remove unused modules

## 2.7.0 (2022-06-04)
- feat: add support the resolving an alias as a full path to a file in `include`
- chore: update modules

## 2.6.0 (2022-06-02)
- feat: add `watchFiles` loader option to watch for file changes in resolved dependencies
- fix: in `:markdown` filter enable HTML tags in the markdown source
- chore: add example - preview README.md

## 2.5.2 (2022-05-23)
- fix: add support style types `.less` `.styl` in extract CSS module
- chore: update pug-loader to last version

## 2.5.1 (2022-05-23)
- fix: using @import with external url

## 2.5.0 (2022-05-22)
- feat: add supports for pug filter `:markdown` with highlighting code blocks

## 2.4.1 (2022-05-19)
- fix: pug error in dependency requires restart of webpack

## 2.4.0 (2022-05-17)
- feat: add supports for pug filters `:code` and `:highlight`
- chore: update pug-loader

## 2.3.1 (2022-05-11)
- fix: support resolving npm modules in pug template

## 2.3.0 (2022-05-09)
- feat: add supports for module type `asset/inline` the inline SVG in HTML and data-URL for binary images
- feat: add supports for module type `asset/inline` the utf8 encoding for SVG data-URL in CSS
- feat: add supports for module type `asset` to automatically choose between `resource` and `inline`
- chor: new `hello world` web app example
- test: add tests for module types `asset/inline` and `asset`

## 2.2.0 (2022-04-21)
- feat: add the `pretty` option to format the resulting HTML

## 2.1.1 (2022-04-20)
- fix: issue of resolving the js split chunks in generated html
- test: add new test for usage the pug plugin with the `responsive-loader`
- refactor: code refactoring
- docs: update readme

## 2.1.0 (2022-04-18)
- feat: add supports the `responsive-loader`
- feat: caching of an already processed asset when the same asset is required in different issuer files
- fix: conflict of multiple styles with the same filename
- fix: resolving url() in styles required in pug
- fix: missing js file after rebuild by webpack serv
- fix: potential collision when resolving resources for `compile` method
- test: caching for styles required with the same name

## 2.0.1 (2022-04-03)
- fix: incorrect output directory for a module if the option `outputPath` was relative
- docs: update readme

## 2.0.0 (2022-04-01)
- feat: add supports the `require()` of the javascript source files directly in pug.\
  It is no longer necessary to define a js file in webpack entrypoint.\
  For example, using the `pug-plugin` now is possible usage of source js files in pug:
  ```pug
  script(src=require('./main.js'))
  ```
  Generated HTML:
  ```html
  <script src='/assets/js/main.1234abcd.js'></script>
  ```
- feat: add support a function in loader option `data` for `compile` method  

## 1.5.0 (2022-03-06)
- feat: update pug-loader to v1.8.0 containing the resolving and watching improvements
- chore: update npm packages

## 1.4.3 (2022-02-21)
- fix: the webpack option inline-source-map to save css and source map in single file
- chore: update pug-loader to the latest version

## 1.4.2 (2022-02-19)
- fix: update pug-loader to fix collision with local variables passed in template function for the `compile` method

## 1.4.1 (2022-02-19)
- fix: update pug-loader to fix path error in Windows when watching dependencies 

## 1.4.0 (2022-02-18)
- BREAKING CHANGE (low probability):
  When using required style in pug, like `link(rel='stylesheet' href=require('./styles.css'))` then no need anymore the `type: 'asset/resource'` in the rule for styles.\
  **UPDATE** your `webpack.config.js`: remove in the rule for styles (css, scss, sass, etc.) the `type` and the `generator` fields.\
  Following is enough to extract CSS everywhere:
  ```js
  {
    test: /\.(css|sass|scss)$/,
    // type: 'asset/resource', <-- remove the type property
    // generator: { 'assets/css/[name].[contenthash:8].css' } <-- remove the generator property
    use: [ 'css-loader', 'sass-loader' ],
  },
  ```
  To define a filename for extracted CSS use the option `filename` in the `extractCss` module:
  ```js
  new PugPlugin({
    modules: [
      PugPlugin.extractCss({
        filename: 'assets/css/[name].[contenthash:8].css'
      }),
    ],
  }),
  ```
  For mode details see [plugin options](https://GitHub.com/webdiscus/pug-plugin#plugin-options).

- feat: add resolving url in CSS and export resolved resource to the output path 
- feat: add caching of already resolved resources by enhanced resolver
- feat: improved html and css extraction
- refactor: complete refactoring of all code
- fix: issue for the option `outputPath`
- fix: resolving issue by import styles directly from node_modules, e.g.: @import 'material-icons';

## 1.3.2 (2022-02-10)
- fix: issue in module extractCss by usage the data-url in css property, #3
- fix: update pug-loader to the latest version with fixed issues

## 1.3.1 (2022-02-10)
- test: add the test case for @font-face src

## 1.3.0 (2022-02-07)
- feat: add extraction of the source map for CSS in separate file
- fix: no extract source map for CSS in node <=14
- chore: replace console.log with `process.stdout` by output in terminal
- chore: update the pug-loader to the new version
- docs: update readme: remove unsupported substitutions `[base]` `[path]` `[ext]` by the option filename 

## 1.2.5 (2022-01-31)
- feat: update the pug-loader to the latest version supported the `htmlWebpackPlugin.options` in pug template
- test: add the test case for require fonts in pug template
- refactor: tests
- docs: update readme

## 1.2.4 (2022-01-28)
- fix: issue by output info with enabled verbose and filename as a function
- fix: issue by usage a query string in entry filename
- fix: issue when the same asset file is defined webpack entry-point and required in pug
- refactor: exceptions
- chore: update npm packages
- docs: update readme

## 1.2.3 (2022-01-21)
- fix: issue with a path in windows
- chore: update npm packages

## 1.2.2 (2022-01-20)
- fix: webpack bug in windows generating wrong backslash in url
- chore: update the `pug-loader` package

## 1.2.1 (2022-01-14)
- fix: throw an exception if `output.publicPath` is `undefined` or `auto`
- fix: real source path of required CSS file
- fix: extract styles and images via require with method `html`

## 1.2.0 (2022-01-11)
- feat: add support for `webpack serve`
- feat: add support for require of the style source directly in pug
- feat: add ansi styling by console output
- refactor: code optimisation
- perf: improve performance

## 1.1.1 (2021-12-10)
- fix: update pug-loader: fixed path issues on Windows 

## 1.1.0 (2021-12-07)
- feat: add option `enabled` for enable/disable the plugin
- feat: add option `verbose` for show the compilation information
- feat: add option `sourcePath` as the absolute path to sources
- feat: add option `outputPath` as output directory for assets
- feat: add option `filename` as file name of output file, can be a template string or function 
- feat: add option `modules` for processing different types of entries separately
- feat: add module `extractCss` to fast extract CSS and source map from webpack entry without `mini-css-extract-plugin`
- test: add tests for code coverage more than 90%
- docs: update readme

## 1.0.0 (2021-12-03)
First release
- feat: handles pug templates from webpack entry
- feat: zero config
