<template>
  <div class="grid">
    <div v-for="song in store.queue" :key="String(song.name + song.artists)" class="card" :class="{ selected: firstSelect === song, playing: currentSong === song }" @click="selectSong(song)">
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
import {onMounted, ref, watch} from "vue";
import {Song} from "../types/musicTypes";
import {useStore} from "./store";
import {play, currentSong, restoreCurrentTime} from "./player";
import {areQueuesEqual, getSongKey} from "./songUtils";

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

const loadQueue = async () => {
  const stored = localStorage.getItem("music-paths");
  if (!stored) return;
  store.setDirPaths(JSON.parse(stored));

  const rawQueue = localStorage.getItem("queue");
  const queue = rawQueue ? JSON.parse(rawQueue) : null;
  const fetchedQueue = await electrobun.rpc!.request.GETsongs({dirPaths: store.dirPaths});

  if (queue) {
    if (!areQueuesEqual(queue, fetchedQueue)) {
      store.setQueue(fetchedQueue);
      store.shuffleQueue();
    }
    else {
      store.setQueue(queue);
      const rawSelected = localStorage.getItem("selected-song");
      const selectedSong = rawSelected ? JSON.parse(rawSelected) : null;
      if (selectedSong) {
        selectSong(selectedSong);
        selectSong(selectedSong);
        restoreCurrentTime();
      }
    }
  } else {
    store.setQueue(fetchedQueue);
  }

  if (!store.selectedSong) {
    selectSong(store.queue[0]);
    selectSong(store.queue[0]);
  }
  store.setIsPlaying(false);
};

watch(
    () => store.isSettingsOpen,
    (newValue) => {
      if (!newValue) {
        loadQueue();
      }
    }
);

onMounted(async () => {
  await loadQueue();
})

const selectSong = (song: Song) => {
  if (!firstSelect.value) {
    firstSelect.value = song;
    return;
  }
  if (getSongKey(firstSelect.value) !== getSongKey(song)) {
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
  white-space: nowrap;
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

.empty-note {
  position: absolute;
  width: 30rem;
  top: 2rem;
  left: 2rem;
}
</style>