<template>
  <div class="status" v-if="error">
    The USDA API is currently experiencing difficulties
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "status",
  data() {
    return {
      error: false,
    };
  },
  created() {
    this.getData();
  },
  watch: {
    "$route.params.id"() {
      this.getData();
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get("/api/status/")
        .then((response) => {
          console.log(response);
          if (!response.status === 200) {
            vm.error = true;
          }
        })
        .catch((error) => {
          console.log(error);
          vm.error = true;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.status {
  background: red;
  color: white;
  margin: 0.5rem 0;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
}
</style>
