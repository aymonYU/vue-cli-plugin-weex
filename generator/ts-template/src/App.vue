<template>
  <div class="app">
    <div>weex demo</div>
    <HelloWorld msg="Welcome to Your weex + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import HelloWorld from './components/HelloWorld.vue'

@Component({
  components: {
  HelloWorld,
  },
  })
export default class App extends Vue {
}
</script>

<style>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
