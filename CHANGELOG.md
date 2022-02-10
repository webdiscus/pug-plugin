# Change log

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
