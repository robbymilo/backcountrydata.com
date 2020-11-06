<template>
  <div class="map-wrap">
    {{ clickCoordinate }}
    <vl-map data-projection="EPSG:4326" @click="clickCoordinate = $event.coordinate" style="height: 90vh">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

      <div v-for="station in stationList" :key="station">
        <vl-interaction-select>
          <vl-feature>
            <vl-geom-point @click="console.log('test')" :coordinates="[getMeta(station).longitude,getMeta(station).latitude]" ></vl-geom-point>
          </vl-feature>
        </vl-interaction-select>
      </div>


    </vl-map>

  </div>
</template>

<script>
import stations from "@/assets/stations.json";
import { functions } from "@/mixins/functions";

export default {
  name: "map-detail",
  props: {
    stationList: Array
  },
  data () {
    return {
        zoom: 5,
        center: [-115,43],
        rotation: 0,
        clickCoordinate: '',
    }
  },
  methods: {
    getMeta(key) {
      if (key in stations) {
        return stations[key];
      }
    },
  }
}
</script>

<style lang="scss">
.map-wrap {
  padding: 0 1rem;
  height: 100%;

  @media (min-width: 1300px) {
    width: 50vw;
    max-width: 50vw;
  }
}
</style>