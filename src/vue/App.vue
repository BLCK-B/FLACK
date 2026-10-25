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
  height: 100vh;
  display: grid;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.playback-controls {
  height: 5.5rem;
  overflow: hidden;
}
</style>