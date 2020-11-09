<template>
  <div class="home">
    <vue-headful
      title="Backcountry Data"
      description="Follow and visualize the snowpack, weather, and forecast of your favorite backcountry locations in the western US."
    />
    <div class="wrap">
      <tableDetail :station-list="stationMaster"></tableDetail>
    </div>
    <div v-if="stationMaster.length">
      <div v-if="stationMaster.length > 0">
        <a target="_blank" :href="'/list/' + stationMaster">Share</a>
      </div>
    </div>
    <div v-if="!stationMaster.length">
      No favorite SNOTEL sites :( Try searching!
      <nearuser></nearuser>
    </div>
  </div>
</template>

<script>
import search from "@/components/header/search.vue";
import nearuser from "@/components/header/nearuser.vue";
import tableDetail from "@/components/list/table-detail.vue";
import mapDetail from "@/components/map-detail.vue";

export default {
  name: "Home",
  components: {
    search,
    nearuser,
    tableDetail,
    mapDetail,
  },
  data() {
    return {
      stationMaster: [],
    };
  },
  created() {
    this.getFavoriteStations();
    this.$root.$on("removeStation", (station) => {
      this.removeStation(station);
    });
    this.$root.$on("reorderStations", (newStations) => {
      this.stationMaster = newStations;
      this.reorderFavorites();
    });
  },
  methods: {
    getFavoriteStations() {
      var vm = this;
      var currentFavs = JSON.parse(localStorage.getItem("bcd-favorites"));
      if (!currentFavs) {
        vm.stationMaster = null;
      } else {
        vm.stationMaster = currentFavs;
      }
    },
    removeStation(station) {
      var vm = this;

      if (vm.stationMaster.includes(station)) {
        var index = vm.stationMaster.indexOf(station);
        if (index > -1) {
          vm.stationMaster.splice(index, 1);
        }
        vm.$router.push({ path: `${vm.stationMaster.join(",")}` });
      }
    },
    reorderFavorites() {
      localStorage.setItem("bcd-favorites", JSON.stringify(this.stationMaster));
    },
  },
};
</script>
