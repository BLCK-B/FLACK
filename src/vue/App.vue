<template>
  <main>
    <div class="container">
      <SongList class="song-list"/>
    </div>
    <PlaybackControls class="playback-controls" />
    <SettingsModal v-if="store.isSettingsOpen" />
  </main>
</template>

<script setup lang="ts">
import PlaybackControls from "./PlaybackControls.vue";
import SongList from "./SongList.vue";
import SettingsModal from "@/SettingsModal.vue";
import {useStore} from "./store";

const store = useStore();
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
</style>