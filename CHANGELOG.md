# Change log

## 1.5.0 (2022-03-06)
- update pug-loader to v1.8.0 containing the resolving and watching improvements
- update npm packages

## 1.4.3 (2022-02-21)
- fix for the webpack option inline-source-map to save css and source map in single file
- update pug-loader to the latest version

## 1.4.2 (2022-02-19)
- update pug-loader to fix collision with local variables passed in template function for compile method

## 1.4.1 (2022-02-19)
- update pug-loader to fix path error in Windows when watching dependencies 

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
- added resolving url in CSS and export resolved resource to output path 
- added caching of already resolved resources by enhanced resolver
- improved html and css extraction
- complete refactoring of all code
- fixed issue for the option `outputPath`
- fixed resolving issue by import styles directly from node_modules, e.g.: @import 'material-icons';
- fixed some invisible issues

## 1.3.2 (2022-02-10)
- fix issue in module extractCss by usage the data-url in css property, #3
- update pug-loader to the latest version with fixed issues

## 1.3.1 (2022-02-10)
- added test case for @font-face src

## 1.3.0 (2022-02-07)
- added extraction of source map for CSS in separate file
- fix not extracted source map for CSS in node <=14
- replace console.log with process.stdout by output in terminal
- update the pug-loader to new version
- update readme: remove unsupported substitutions `[base]` `[path]` `[ext]` by the option filename 

## 1.2.5 (2022-01-31)
- update the pug-loader to the latest version supported the `htmlWebpackPlugin.options` in pug template
- added test case for require fonts in pug template
- refactoring of tests
- update readme

## 1.2.4 (2022-01-28)
- fix issue by output info with enabled verbose and filename as a function
- fix issue by usage a query string in entry filename
- fix issue when same asset file is defined webpack entry-point and required in pug
- refactoring exceptions
- update npm packages
- update readme

## 1.2.3 (2022-01-21)
- fix issue with path in windows
- update npm packages

## 1.2.2 (2022-01-20)
- fix webpack bug in windows generating wrong backslash in url
- update the `pug-loader` package

## 1.2.1 (2022-01-14)
- fix throw an exception if `output.publicPath` is `undefined` or `auto`
- fix real source path of required CSS file
- fix extract styles and images via require with method `html`

## 1.2.0 (2022-01-11)
- added support for `webpack serve`
- added support for require of style source directly in pug
- added ansi styling by console output
- improve performance
- code optimisation

## 1.1.1 (2021-12-10)
- update pug-loader: fixed path issues on Windows 

## 1.1.0 (2021-12-07)
In this release was follow features tested, described and activated:
- added option `enabled` for enable/disable the plugin
- added option `verbose` for show the compilation information
- added option `sourcePath` as absolute path to sources
- added option `outputPath` as output directory for assets
- added option `filename` as file name of output file, can be a template string or function 
- added option `modules` for processing different types of entries separately
- added module `extractCss` to fast extract CSS and source map from webpack entry without `mini-css-extract-plugin`
- added tests for code coverage more than 90%
- update readme

## 1.0.0 (2021-12-03)
First release
- handles pug templates from webpack entry
- zero config
