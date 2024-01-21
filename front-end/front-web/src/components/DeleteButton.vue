<template>
  <button
    type="button"
    class="button-delete"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut"
    @click="deleteWidget"
  >
    <img class="bin" :src="deleteImage" :alt="deleteImageAlt">
  </button>
</template>

<script>
export default {
  name: 'DeleteButton',
  data () {
    return {
      deleteImage: require('@/assets/bin.png'),
      deleteImageAlt: 'Delete'
    }
  },
  methods: {
    deleteWidget () {
      this.$emit('delete')
    },
    onMouseOver () {
      this.deleteImage = require('@/assets/delete.png')
      this.deleteImageAlt = 'Delete'
    },
    onMouseOut () {
      this.deleteImage = require('@/assets/bin.png')
      this.deleteImageAlt = 'Bin'
    }
  }
}
</script>

<style scoped>
.bin {
  height: 30px;
}
.button-delete {
  border: none;
  background: none;
  cursor: pointer;
}
</style>
