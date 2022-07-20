import { Button, Tooltip } from 'bootstrap';
import merge from 'webpack-merge';

console.log('>> main.js');
console.log('- [bootstrap] Button.NAME: ', Button.NAME);
console.log('- [popperjs/core] Tooltip.eventName: ', Tooltip.eventName('mouseover'));
console.log('- [webpack-merge]: ', merge({}, { description: 'merge objects' }));