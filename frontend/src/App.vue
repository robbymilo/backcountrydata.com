<template>
  <div id="app" class="m-3">
    <status></status>
    <div id="nav" class="nav">
      <div class="nav-items d-flex">
        <router-link class="home" to="/">
          <font-awesome-icon icon="home"></font-awesome-icon>
        </router-link>
        <span>
          <favorites class="favorites"></favorites>
        </span>
      </div>
      <search></search>
      <units></units>
    </div>
    <router-view />
    <footer class="py-1">
      <a
        rel="noreferrer noopener"
        target="_blank"
        href="https://github.com/robbymilo/backcountrydata.com"
        >Contribute</a
      >
      |
      <a
        rel="noreferrer noopener"
        target="_blank"
        href="https://github.com/robbymilo/backcountrydata.com/issues/new/choose"
        >Request feature / Report bug
      </a>
    </footer>
  </div>
</template>

<script>
import search from "@/components/header/search.vue";
import units from "@/components/header/units.vue";
import favorites from "@/components/header/favorites.vue";
import status from "@/components/status.vue";

export default {
  components: {
    search,
    units,
    favorites,
    status,
  },
};
</script>

<style lang="scss">
.nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.station-data {
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  margin-top: 1rem;
  margin-bottom: 1rem;

  .station {
    display: inline-block;
    max-width: 250px;
    vertical-align: top;
    padding: 8px;
    border-right: 0.5px solid grey;
    overflow: hidden;
  }

  h3 {
    padding-top: 0.5rem;
    padding-left: 0.5rem;
  }
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-space-between {
  justify-content: space-between;
}

.justify-content-end {
  justify-content: flex-end;
}

.wrap {
  @media (min-width: 1300px) {
    display: flex;
  }
}
</style>
