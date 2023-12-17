// to import Pug template as template function use the url param `pug-compile`
import componentTmpl from './component.pug?pug-compile';

// render template function into HTML
const html = componentTmpl({
  // pass variables into template
  name: 'MyComponent'
});

export default html;
