# Change log

## 2.3.1 (2022-05-11)
- fix: support resolving npm modules in pug template

## 2.3.0 (2022-05-09)
- feat: add supports for module type `asset/inline` the inline SVG in HTML and data-URL for binary images
- feat: add supports for module type `asset/inline` the utf8 encoding for SVG data-URL in CSS
- feat: add supports for module type `asset` to automatically choose between `resource` and `inline`
- chor: new `hello world` web app example
- test: add tests for module types `asset/inline` and `asset`

## 2.2.0 (2022-04-21)
- feat: added the `pretty` option to format the resulting HTML

## 2.1.1 (2022-04-20)
- fix: issue of resolving the js split chunks in generated html
- test: added new test for usage the pug plugin with the `responsive-loader`
- refactor: code refactoring
- docs: update readme

## 2.1.0 (2022-04-18)
- feat: added supports the `responsive-loader`
- feat: caching of an already processed asset when the same asset is required in different issuer files
- fix: conflict of multiple styles with the same filename
- fix: resolving url() in styles required in pug
- fix: missing js file after rebuild by webpack serv
- fix: potential collision when resolving resources for `compile` method
- test: caching for styles required with same name

## 2.0.1 (2022-04-03)
- fix: incorrect output directory for a module if the option `outputPath` was relative
- docs: update readme

## 2.0.0 (2022-04-01)
### NEW feature
Added supports the require() of the javascript source files directly in pug. \
It is no longer necessary to define a js file in webpack entry-point.

For example, using the `pug-plugin` now following is possible:
```pug
html
  head
    script(src=require('./main.js'))
  body
```
Output:
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/assets/js/main.1234abcd.js"></script>
  </head>
  <body></body>
</html>
```

### Improving for passing data in pug
Added supports a function in loader option `data` for `compile` method.

## 1.5.0 (2022-03-06)
- feat: update pug-loader to v1.8.0 containing the resolving and watching improvements
- chore: update npm packages

## 1.4.3 (2022-02-21)
- fix: the webpack option inline-source-map to save css and source map in single file
- chore: update pug-loader to the latest version

## 1.4.2 (2022-02-19)
- fix: update pug-loader to fix collision with local variables passed in template function for compile method

## 1.4.1 (2022-02-19)
- fix: update pug-loader to fix path error in Windows when watching dependencies 

## 1.4.0 (2022-02-18)

### BREAKING CHANGE (low probability).
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
For mode details see [plugin options](https://github.com/webdiscus/pug-plugin#plugin-options).

### CHANGES
- feat: add resolving url in CSS and export resolved resource to output path 
- feat: add caching of already resolved resources by enhanced resolver
- feat: improved html and css extraction
- refactor: complete refactoring of all code
- fix: issue for the option `outputPath`
- fix: resolving issue by import styles directly from node_modules, e.g.: @import 'material-icons';

## 1.3.2 (2022-02-10)
- fix: issue in module extractCss by usage the data-url in css property, #3
- fix: update pug-loader to the latest version with fixed issues

## 1.3.1 (2022-02-10)
- test: add test case for @font-face src

## 1.3.0 (2022-02-07)
- feat: add extraction of source map for CSS in separate file
- fix: no extract source map for CSS in node <=14
- chore: replace console.log with process.stdout by output in terminal
- chore: update the pug-loader to new version
- docs: update readme: remove unsupported substitutions `[base]` `[path]` `[ext]` by the option filename 

## 1.2.5 (2022-01-31)
- feat: update the pug-loader to the latest version supported the `htmlWebpackPlugin.options` in pug template
- test: add test case for require fonts in pug template
- refactor: tests
- docs: update readme

## 1.2.4 (2022-01-28)
- fix: issue by output info with enabled verbose and filename as a function
- fix: issue by usage a query string in entry filename
- fix: issue when same asset file is defined webpack entry-point and required in pug
- refactor: exceptions
- chore: update npm packages
- docs: update readme

## 1.2.3 (2022-01-21)
- fix: issue with path in windows
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
- feat: add support for require of style source directly in pug
- feat: add ansi styling by console output
- refactor: code optimisation
- perf: improve performance

## 1.1.1 (2021-12-10)
- fix: update pug-loader: fixed path issues on Windows 

## 1.1.0 (2021-12-07)
- feat: add option `enabled` for enable/disable the plugin
- feat: add option `verbose` for show the compilation information
- feat: add option `sourcePath` as absolute path to sources
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
