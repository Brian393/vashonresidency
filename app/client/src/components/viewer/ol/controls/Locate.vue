<template>
  <div class="mt-4">
    <v-tooltip right>
      <template v-slot:activator="{on}">
        <v-btn class="locate-button" v-on="on" fab dark x-small :color="color" @click="handleZoomToMe()">
          <v-icon medium>fas fa-location-arrow</v-icon>
        </v-btn>
      </template>
      <span>Locate Me</span>
    </v-tooltip>
    <confirm-location ref="confirm" :color="color"></confirm-location>
  </div>
</template>
<script>
import {circular} from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import ConfirmDialog from '../../../core/ConfirmDialog.vue';

// import the app-wide EventBus
import {EventBus} from '../../../../EventBus';

export default {
  props: {
    map: {type: Object, required: true},
    color: {type: String},
  },
  components: {
    'confirm-location': ConfirmDialog,
  },
  data() {
    return {
      userLocSource: null,
    };
  },
  name: 'locate',
  methods: {
    /**
     * Zoom to my location. Utilizes a function getLocateArgs
     * that is curried with an object containing map, source, and handler
     * passed through from the scope of this object into the event handler
     * scope, whose "this" scope is the event and the clicked button.
     *
     */
    handleZoomToMe(resolution) {
      if (!this.userLocSource) {
        this.createUserLocationLayer();
      }
      // Trigger the modal requesting zoom-to-location.
      if (!this.$cookies.get('locationRequested')) {
        this.$refs.confirm
          .open('Zoom to my location?', '', 'Share my location', 'Cancel', {
            color: this.color,
          })
          .then(confirm => {
            if (confirm) {
              this.handleGetUserLocation(this.userLocSource, this.map);
              this.$cookies.set('locationRequested', true, '7d');
            }
          });
      }
      if (this.$cookies.get('locationRequested')) {
        this.handleGetUserLocation(this.userLocSource, this.map, resolution);
      }
    },
    handleGetUserLocation(source, map, resolution) {
      const watchId = navigator.geolocation.watchPosition(
        pos => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          const accuracy = circular(coords, pos.coords.accuracy);
          source.clear(true);
          source.addFeatures([
            new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
            new Feature(new Point(fromLonLat(coords))),
          ]);
          if (!source.isEmpty()) {
            map.getView().fit(source.getExtent(), {
              maxZoom: 6.1,
              minResolution: resolution || 0,
            });
            navigator.geolocation.clearWatch(watchId);
          }
          source.clear(true);
        },
        error => {
          alert(`ERROR: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
        }
      );
    },
    /*
     * Creates a new layer for the user's location that will be used for getting
     * the user's location.
     *
     * @param {Object} map: this vueJS map object
     * @return {VectorSource}: The created user layer VectorSource
     */
    createUserLocationLayer() {
      const source = new VectorSource();
      const layer = new VectorLayer({
        source,
      });
      this.map.addLayer(layer);
      this.userLocSource = source;
    },
  },
  mounted() {
    EventBus.$on('zoomToLocation', this.handleZoomToMe);
  },
};
</script>
<style lang="css" scoped>
.locate-button {
  z-index: 1;
}
</style>
