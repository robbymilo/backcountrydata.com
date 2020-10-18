<template>
  <div>
    <tableDetail :station-list="stationMaster"></tableDetail>
  </div>
</template>

<script>
import stations from "@/assets/stations.json";
import tableDetail from "@/components/list/table-detail.vue";

export default {
  name: "List",
  components: {
    tableDetail,
  },
  data() {
    return {
      stationMaster: [],
    };
  },
  created() {
    this.getStationsURL();
    this.$root.$on("removeStation", (station) => {
      this.removeStation(station);
    });
    this.$root.$on("reorderStations", (newStations) => {
      this.stationMaster = newStations;
      this.$router.push({ path: `${this.stationMaster.join(",")}` });
    });
  },
  methods: {
    getStationsURL() {
      var vm = this;
      var stationsURL = vm.$route.params.id;

      if (stationsURL) {
        var parsedStations = vm.$route.params.id.split(",");
        parsedStations.forEach(function (id) {
          if (id in stations) {
            vm.stationMaster.push(id);
          }
        });
      } else {
        vm.$router.push({ name: "home" });
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
  },
};
</script>

<style>
.float-right {
  float: right;
}
</style>
