import Alpine from 'alpinejs';
import SlideNavigation from '../plugins/slide_navigation';

Alpine.data('deneme', function () {
  return {
    sayi: 5
  };
});

Alpine.data('sn_00', function () {
  return {
    ...SlideNavigation,
    activeScene: this.$persist('scene_4'),
    scenes: {
      scene_0: {},
      scene_1: {
        parent: 'scene_0',
        condition() {
          return true;
        }
      },
      scene_2: { parent: 'scene_1' },
      scene_3: {
        parent: 'scene_1',
        condition() {
          return false;
        }
      },
      scene_4: { parent: 'scene_1' },
      scene_5: { parent: 'scene_0' }
    }
  };
});
