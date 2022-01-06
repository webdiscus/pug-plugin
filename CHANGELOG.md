# Change log

## 1.2.0 (2022-01-11)
- added support `webpack serve`
- added support require of style source directly in pug, e.g.:
  ```pug
  link(rel='stylesheet' href=require('~Styles/main.scss'))
  ```
- added ansi styling by console output
- improve performance
- code optimisation

## 1.1.1 (2021-12-10)
- update pug-loader: fixed path issues on Windows 

## 1.1.0 (2021-12-07)
In this release was follow features tested, described and activated:
- add option `enabled` for enable/disable the plugin
- add option `verbose` for show the compilation information
- add option `sourcePath` as absolute path to sources
- add option `outputPath` as output directory for assets
- add option `filename` as file name of output file, can be a template string or function 
- add option `modules` for processing different types of entries separately
- add module `extractCss` to fast extract CSS and source map from webpack entry without `mini-css-extract-plugin`
- add tests for code coverage more than 90%
- update readme

## 1.0.0 (2021-12-03)
First release
- handles pug templates from webpack entry
- zero config
