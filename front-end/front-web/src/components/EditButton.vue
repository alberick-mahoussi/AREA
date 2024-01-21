<template>
  <button
    type="button"
    class="change-button"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut"
    @click="changeItem"
  >
    <img class="image" :src="modifiedImage" :alt="modifiedImageAlt">
  </button>
</template>

<script>
export default {
  name: 'EditButton',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      modifiedImage: require('@/assets/modifier.png'),
      modifiedImageAlt: 'Change ' + this.type
    }
  },
  methods: {
    changeItem () {
      this.$emit('edit' + this.type)
    },
    onMouseOver () {
      this.modifiedImage = require('@/assets/modifier.png')
    },
    onMouseOut () {
      this.modifiedImage = require('@/assets/modifier.png')
    }
  }
}
</script>

<style scoped>
.change-button {
  background-color: white;
  border: none;
  cursor: pointer;
}
.image {
  width: 20px;
  height: 20px;
}
</style>
