<template>
  <div id="app">
    <div id="nav">
      <div class="nav-items">
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
    <hr />
    <router-view />
  </div>
</template>

<script>
import navbar from '@/components/header/navbar.vue';
import search from '@/components/header/search.vue';
import units from '@/components/header/units.vue';
import favorites from '@/components/header/favorites.vue';

export default {
  components: {
    navbar,
    search,
    units,
    favorites,
  },
};
</script>

<style lang="scss">
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol';
}
#nav {
  display: flex;
  justify-content: space-between;
  .nav-items {
    display: flex;
    .favorites {
      padding: 0 4px;
    }
  }
}
#app {
  padding: 8px;
}
a.home {
  color: #4c4c4c;
}
.container {
  padding: 4px;
}
h2,
h3 {
  padding: 0 8px;
  margin: 0;
}
.item {
  padding: 0 8px;
}
</style>
