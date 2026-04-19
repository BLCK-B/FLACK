<template>
  <div class="container">
    <div class="playbar" @mousedown="onSeekClick">
      <div class="progress-bg">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>
    <div class="control-row">
      <div v-if="store.selectedSong" class="song-info">
        <img :src="store.selectedSong.thumbnailUrl" alt="cover" class="thumbnail"/>
        <div class="song-info-text">
          <p> {{ store.selectedSong.name }} </p>
          <p class="smaller"> {{ store.selectedSong.artists.join(", ") }} </p>
        </div>
      </div>
      <div class="middle-controls">
        <button> <</button>
        <button v-if="!store.isPlaying" @click="playEvent">Play</button>
        <button v-else @click="playEvent">Stop</button>
        <button> ></button>
      </div>
      <div class="right-controls">
        <span class="speaker" @click="toggleMute">
          🔊
        </span>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useStore} from "./store";
import {pause, unpause, volume, setVolume, toggleMute, duration, currentTime, seek, isSeeking} from "./player";
import {computed} from "vue";

const store = useStore();

const playEvent = () => {
  store.setIsPlaying(!store.isPlaying);
  if (!store.isPlaying) {
    pause();
  } else {
    unpause();
  }
};

const onVolumeChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  setVolume(value);
};

const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

const onSeekClick = (event: MouseEvent) => {
  const bar = event.currentTarget as HTMLElement;
  const rect = bar.getBoundingClientRect();

  const percent = (event.clientX - rect.left) / rect.width;
  const time = percent * (duration.value || 0);

  seek(time);
};
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
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  cursor: pointer;
}

.control-row {
  display: flex;
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

.middle-controls {
  height: 100%;
}

.right-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1rem;
}

.right-controls input {
  width: 150px;
}

.progress-bg {
  width: 100%;
  height: 6px;
  background: #444;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  width: 0%;
}
</style>