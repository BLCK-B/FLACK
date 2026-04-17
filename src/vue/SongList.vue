<template>
  <div class="grid">
    <div v-for="song in songs" :key="song.name + song.artists" class="card" :class="{ selected: store.selectedSong?.name === song.name }" @click="setSong(song)">
      <img :src="song.thumbnailUrl" alt="cover" class="thumbnail"/>
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

const rpc = Electroview.defineRPC<RPC>({
  maxRequestTime: 10000,
  handlers: {
    requests: {},
    messages: {},
  },
});

const electrobun = new Electrobun.Electroview({rpc});

const store = useStore();

const songs = ref<Song[]>([]);

onMounted(async () => {
  songs.value = await electrobun.rpc!.request.GETsongs({});
})

const setSong = (song: Song) => {
  store.setSelectedSong(song);
}
</script>

<style scoped>
.songinfo p {
  margin: 0.25rem 0;
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
</style>