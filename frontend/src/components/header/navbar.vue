<template>
  <nav>
    <input
      type="radio"
      id="metric"
      value="metric"
      v-model="units"
      @change="setMetric"
    />
    <label for="metric">Metric</label>
    <input
      type="radio"
      id="imperial"
      value="imperial"
      v-model="units"
      @change="setImperial"
    />
    <label for="imperial">Imperial</label>
  </nav>
</template>

<script>
export default {
  name: "navbar",

  data() {
    return {
      units: "",
    };
  },
  created() {
    this.defaultUnits();
  },
  methods: {
    defaultUnits() {
      var localUnits = localStorage.getItem("bcd-units");
      if (localUnits) {
        this.units = localUnits;
      } else {
        this.units = "metric";
      }
    },
    setMetric() {
      this.units = "metric";
      localStorage.setItem("bcd-units", this.units);
    },
    setImperial() {
      this.units = "imperial";
      localStorage.setItem("bcd-units", this.units);
    },
  },
};
</script>
