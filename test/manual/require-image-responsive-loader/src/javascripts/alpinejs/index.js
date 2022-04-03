import 'alpine-magic-helpers';
import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import collapse from '@alpinejs/collapse';

import './store';

window.Alpine = Alpine;
window.Alpine.plugin(persist);
window.Alpine.plugin(collapse);
window.Alpine.start();
