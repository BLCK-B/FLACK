<template>
  <div class="container">
    <div class="playbar"/>
    <div v-if="store.selectedSong" class="song-info">
      <img :src="store.selectedSong.thumbnailUrl" alt="cover" class="thumbnail"/>
      <div class="song-info-text">
        <p> {{ store.selectedSong.name }} </p>
        <p class="smaller"> {{ store.selectedSong.artists.join(", ") }} </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useStore} from "./store";

const store = useStore();
</script>

<style scoped>
p {
  margin: 0;
}

.container {
  background-color: black;
  display: flex;
}

.playbar {
  background-color: gray;
  height: 5px;
}

.thumbnail {
  height: 4rem;
  width: 4rem;
}

.song-info {
  display: flex;
  padding: 0.5rem;
  gap: 1rem;
}

.song-info-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.smaller {
  font-size: 13px;
}
</style>