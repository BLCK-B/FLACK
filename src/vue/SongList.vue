<template>
  <div class="grid">
    <div v-for="song in store.queue" :key="song.name + song.artists" class="card" :class="{ selected: firstSelect === song, playing: currentSong === song }" @click="selectSong(song)">
      <img :src="song.thumbnailUrl" alt="cover" class="thumbnail" loading="lazy" decoding="async"/>
      <div class="songinfo">
        <p> {{ song.name }} </p>
        <p class="smaller"> {{ song.artists.join(", ") }} </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Electrobun, {Electroview} from "electrobun/view";
import {RPC} from "../bun";
import {onMounted, ref} from "vue";
import {Song} from "../types/musicTypes";
import {useStore} from "./store";
import {play, currentSong} from "./player";

const rpc = Electroview.defineRPC<RPC>({
  maxRequestTime: 10000,
  handlers: {
    requests: {},
    messages: {},
  },
});

const electrobun = new Electrobun.Electroview({rpc});

const store = useStore();

const firstSelect = ref<Song>();

onMounted(async () => {
  store.queue = await electrobun.rpc!.request.GETsongs({});
  if (!store.selectedSong) {
    store.selectedSong = store.queue[0];
  }
})

const selectSong = (song: Song) => {
  if (firstSelect.value !== song) {
    firstSelect.value = song;
    return;
  }
  store.setSelectedSong(song);
  play(song);
  store.setIsPlaying(true);
}
</script>

<style scoped>
.songinfo {
  text-align: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.songinfo p {
  margin: 0.25rem 0;
  //white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.card {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
}

.thumbnail {
  height: 7rem;
  width: 7rem;
  border-radius: 4px;
}

.songinfo {
  text-align: center;
}

.smaller {
  font-size: 13px;
}

.selected {
  background-color: rgba(255, 255, 255, 0.15);
}

.playing {
  background-color: rgba(255, 255, 255, 0.25);
}
</style>