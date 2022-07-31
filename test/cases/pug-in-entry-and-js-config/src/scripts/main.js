// test loader method `compile` via webpack multiple use config
// note: default method in pug-plugin is `render`
const buttonTmpl = require('Views/partials/button.pug');

const main = (event) => {
  console.log('>> main');
  const rootNode = document.getElementById('root');
  rootNode.innerHTML = buttonTmpl({ text: 'click me', className: 'outline' });
};

addEventListener('DOMContentLoaded', main);