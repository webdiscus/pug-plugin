const SETTINGS = {
  init() {
    this.$nextTick(() => {
      const $wrapper = this.$root.querySelector('.w-sn__wrapper');
      const $activeScene = $wrapper.querySelector(
        `[x-data][data-scene="${this.activeScene}"] .w-sn__item`
      );

      $wrapper.style.height = `${$activeScene.offsetHeight}px`;
    });
  },
  nextScene(nextScene) {
    if (this.scenes[nextScene].condition) {
      if (this.scenes[nextScene].condition()) {
        this.activeScene = nextScene;

        this.$nextTick(() => {
          let $wrapper = this.$root.parentElement;
          let $nextScene = $wrapper.querySelector(
            `[x-data][data-scene="${nextScene}"] .w-sn__item`
          );

          $wrapper.style.height = `${$nextScene.offsetHeight}px`;
        });
      }
    } else {
      this.activeScene = nextScene;

      this.$nextTick(() => {
        let $wrapper = this.$root.parentElement;
        let $nextScene = $wrapper.querySelector(
          `[x-data][data-scene="${nextScene}"]  .w-sn__item`
        );

        $wrapper.style.height = `${$nextScene.offsetHeight}px`;
      });
    }
  },
  prevScene() {
    let parent = this.scenes[this.$root.dataset.scene].parent;

    this.activeScene = parent;

    this.$nextTick(() => {
      let $wrapper = this.$root.parentElement;
      let $parent = $wrapper.querySelector(
        `[x-data][data-scene="${parent}"] .w-sn__item`
      );

      $wrapper.style.height = `${$parent.offsetHeight}px`;
    });
  },
  sceneClasses() {
    return {
      'w-sn__item--active': this.$root.dataset.scene === this.activeScene,
      'w-sn__item--parent':
        this.scenes[this.activeScene].parent === this.$root.dataset.scene
    };
  },
  exists() {
    if (this.scenes[this.$root.dataset.scene].condition) {
      return this.scenes[this.$root.dataset.scene].condition();
    }
    return true;
  },
  activateScene() {}
};

export default SETTINGS;
