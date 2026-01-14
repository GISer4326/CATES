<template>
  <div>
    <side-bar></side-bar>
      <!-- <div>
          <MapView/>
      </div> -->
  </div>  
</template>

<script>
export default {
  name:'Home',
  components: {
    'side-bar':() => import('./sidebar/sidebar.vue'), 
  },
  mounted() {
    this.$Spin.hide();
  },
}
</script>

<style >

</style>