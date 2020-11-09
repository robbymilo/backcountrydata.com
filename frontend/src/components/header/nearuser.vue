<template>
  <div class="nearuser">
    <div v-if="near[0]">
      <router-link :to="{ path: '/station/' + near[0].id }">
        Your Nearest Station:
        <strong>{{ near[0].station.site_name }}</strong>
      </router-link>
    </div>
    <div v-else>No nearby stations found :(</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "nearuser",
  data() {
    return {
      near: [],
      coordinates: {
        lat: "",
        lon: "",
      },
    };
  },
  created() {
    this.getUserLocation();
  },
  methods: {
    getUserLocation() {
      var vm = this;

      function success(position) {
        vm.coordinates.lat = position.coords.latitude;
        vm.coordinates.lon = position.coords.longitude;
        vm.getStationsNear();
      }

      function error() {
        console.log('geo error')
      }

      navigator.geolocation.getCurrentPosition(success, error);

    },
    getStationsNear() {
      var vm = this;
      axios
        .get('/api/nearest/', {
          params: {
            lat: vm.coordinates.lat,
            lon: vm.coordinates.lon,
          },
        })
        .then((response) => {
          vm.near = response.data;
          vm.forward();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    forward() {
      let stations = [];
      this.near.forEach(station => {
        stations.push(station.id);
      })
      this.$router.push({ path: `/list/${stations.join(",")}` })
    }
  },
};
</script>

