<template>
  <div class="units">
    <div>
      <input
        type="radio"
        id="metric"
        :value="true"
        v-model="metric"
        @change="setUnits"
      />
      <label for="metric">Metric</label>
    </div>
    <div>
      <input
        type="radio"
        id="imperial"
        :value="false"
        v-model="metric"
        @change="setUnits"
      />
      <label for="imperial">Imperial</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'units2',
  data() {
    return {
      metric: true,
    };
  },
  created() {
    this.getCurrentUnits();
  },
  methods: {
    getCurrentUnits() {
      var localUnits = localStorage.getItem('bcd-metric');
      this.metric = JSON.parse(localUnits);
      if (this.metric == null) {
        this.metric = false;
      }
      this.$root.$emit('changeUnits', this.metric);
    },
    setUnits() {
      console.log(this.metric);
      this.$root.$emit('changeUnits', this.metric);
      localStorage.setItem('bcd-metric', this.metric);
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  padding: 0 4px;
}
@media (max-width: 680px) {
  .units {
    min-width: 77px;
    padding: 0 10px;
    label {
      font-size: 12px;
    }
  }
}
</style>
