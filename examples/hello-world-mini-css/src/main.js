// Very BAD praxis, very dirty way!
// Styles should not be imported in JS.
// Use Webpack entry to compile scss into a bundle and set this bundle of styles in HTML head.

import 'Styles/main.scss';
import 'Styles/faq.css';

import { app } from 'App/app';

window.addEventListener('load', function (event) {
  console.log('Start app!');
  app();
});
