<template>
  <div class="mt-4 mb-2">
    <v-tooltip right>
      <template v-slot:activator="{on}">
        <v-btn class="zoom-buttons" v-on="on" fab dark x-small :color="color" @click="zoom(1)">
          <span style="font-size: 22px">+</span>
        </v-btn>
      </template>
      <span>Zoom In</span>
    </v-tooltip>
    <br />
    <v-tooltip right>
      <template v-slot:activator="{on}">
        <v-btn class="mt-2 zoom-buttons" v-on="on" fab dark x-small :color="color" @click="zoom(-1)">
          <span style="font-size: 22px">−</span>
        </v-btn>
      </template>
      <span>Zoom Out</span>
    </v-tooltip>
  </div>
</template>
<script>
import {easeOut} from 'ol/easing';

export default {
  props: {
    map: {type: Object, required: true},
    color: {type: String},
  },
  name: 'zoom-control',
  methods: {
    zoom(delta) {
      if (!this.map || !this.map.getView()) {
        return;
      }
      const view = this.map.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        const newZoom = view.getConstrainedZoom(currentZoom + delta);
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.animate({
          zoom: newZoom,
          duration: 250,
          easing: easeOut,
        });
      }
    },
  },
};
</script>
<style lang="css" scoped>
.zoom-buttons {
  z-index: 1;
}
</style>
