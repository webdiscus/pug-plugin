import { app } from './app/app';

window.addEventListener('load', function (event) {
  console.log('>> App is started!');
  app();
});

console.log('>> App is loaded.');
