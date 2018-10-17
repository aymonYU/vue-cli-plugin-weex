<template>
  <div class="hello">
    <text class="text">{{ msg }}</text>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component,Prop } from 'vue-property-decorator'

@Component({

})
export default class HelloWorld extends Vue {
  // Prop写法当成typescript的参数传入
  @Prop(String) msg!: string
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
