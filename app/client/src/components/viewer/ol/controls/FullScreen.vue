<template>
  <div>
    <v-tooltip right>
      <template v-slot:activator="{on}">
        <v-btn class="zoom-buttons" v-on="on" fab dark x-small :color="color" @click="toggleFullScreen">
          <v-icon medium>{{ isFullscreen ? 'fas fa-compress' : 'fas fa-expand' }}</v-icon>
        </v-btn>
      </template>
      <span>Toggle Fullscreen</span>
    </v-tooltip>
  </div>
</template>
<script>
import screenfull from 'screenfull';

export default {
  name: 'full-screen',
  data: () => ({
    isFullscreen: false,
  }),
  props: {
    color: {type: String},
  },
  methods: {
    /**
     * Switch to/from fullscreen mode.
     * Must be triggered by mouse event
     */
    toggleFullScreen() {
      if (screenfull.isEnabled) {
        screenfull.toggle();
      }
    },
  },

  mounted() {
    screenfull.on('change', () => {
      this.isFullscreen = screenfull.isFullscreen;
    });
  },
};
</script>
<style lang="css" scoped>
.zoom-buttons {
  z-index: 1;
}
</style>
