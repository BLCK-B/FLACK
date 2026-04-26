<template>
  <main>
    <div class="container">
      <SongList class="song-list"/>
    </div>
    <PlaybackControls class="playback-controls" />
  </main>
</template>

<script setup lang="ts">
import PlaybackControls from "./PlaybackControls.vue";
import SongList from "./SongList.vue";
</script>

<style scoped>
main {
  min-height: 100vh;
  background: black;
  color: white;
  user-select: none;
  overflow: hidden;
}

*,
html {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.container {
  height: 88vh;
  flex-direction: column;
  overflow-y: scroll;
}

.playback-controls {
  height: 12vh;
  overflow: hidden;
}

.song-list {

}
</style>