<template>
  <div class="nearuser">
    <div v-if="near[0]">
      <router-link :to="{path: '/station/' + near[0].id}">
        Your Nearest Station:
        <strong>{{ near[0].station.site_name }}</strong>
      </router-link>
    </div>
    <div v-else>No nearby stations found :(</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'nearuser',
  data() {
    return {
      near: [],
      coordinates: {
        lat: '',
        lon: '',
      },
    };
  },
  created() {
    this.getUserIP();
  },
  methods: {
    getIP() {
      var vm = this;
      axios
        .get('https://ipinfo.io/json')
        .then((response) => {
          vm.coordinates.lat = response.data.loc.split(',')[0];
          vm.coordinates.lon = response.data.loc.split(',')[1];
          vm.getStationsNear();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getUserIP() {
      var vm = this;
      axios
        .get('https://ipapi.co/json/')
        .then((response) => {
          vm.coordinates.lat = response.data.latitude;
          vm.coordinates.lon = response.data.longitude;
          vm.getStationsNear();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getStationsNear() {
      var vm = this;
      axios
        .get('https://backcountrydata.herokuapp.com/api/nearest/', {
          params: {
            lat: vm.coordinates.lat,
            lon: vm.coordinates.lon,
          },
        })
        .then((response) => {
          vm.near = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style lang="scss"></style>
