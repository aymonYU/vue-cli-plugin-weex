<template>
  <div >
    <text>hello </text>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component,Prop } from 'vue-property-decorator'

// vue的typscrpt版本,component必须使用装饰器来，装饰器必须和class紧贴
@Component
export default class App extends Vue {
}
</script>

<style>
</style>
