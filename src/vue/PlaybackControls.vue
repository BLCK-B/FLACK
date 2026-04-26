<template>
  <div class="container">
    <div class="playbar" @mousedown="onSeekClick">
      <div class="progress-bg">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"/>
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
        <div/>
        <button>
          <SkipBackIcon class="icon" @click="playPrevious" />
        </button>
        <button v-if="!store.isPlaying" @click="playEvent">
          <PlayIcon class="icon" />
        </button>
        <button v-else @click="playEvent">
          <PauseIcon class="icon" />
        </button>
        <button>
          <SkipNextIcon class="icon" @click="playNext" />
        </button>
        <div/>
        <button>
          <ShuffleIcon class="icon bigger" @click="playNewQueue()" />
        </button>
      </div>
      <div class="right-controls">
        <span class="time">
          {{ `${formatTime(currentTime)} / ${formatTime(duration)}` }}
        </span>
        <span class="speaker" @click="toggleMute">
          <SpeakerVolume v-if="volume > 0"/>
          <SpeakerSilent v-else/>
        </span>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            :style="{ backgroundSize: (volume * 100) + '% 100%' }"
            @input="onVolumeChange"
            @wheel.prevent="onWheelChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useStore} from "./store";
import {
  pause,
  unpause,
  volume,
  setVolume,
  toggleMute,
  duration,
  currentTime,
  seek,
  play,
  currentSong,
  onEnded
} from "./player";
import PlayIcon from "@/icons/playIcon.svg";
import PauseIcon from "@/icons/pauseIcon.svg";
import SkipBackIcon from "@/icons/skipBackIcon.svg";
import SkipNextIcon from "@/icons/skipNextIcon.svg";
import ShuffleIcon from "@/icons/shuffleIcon.svg";
import SpeakerVolume from "@/icons/speakerVolume.svg";
import SpeakerSilent from "@/icons/speakerSilent.svg";
import {computed, onMounted} from "vue";

const store = useStore();

onMounted(() => {
  onEnded(() => {
    playNext();
  });
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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

const onWheelChange = (event: WheelEvent) => {
  const direction = event.deltaY < 0 ? 0.05 : -0.05;
  let newVolume = volume.value + direction;
  newVolume = Math.min(Math.max(newVolume, 0), 1);
  setVolume(newVolume);
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

const playNewQueue = () => {
  store.shuffleQueue();
  store.setSelectedSong(store.queue[0]);
  play(store.queue[0]);
  store.setIsPlaying(true);
};

const playNext = () => {
  if (!currentSong.value || store.queue.length === 0) return;

  const currentIndex = store.queue.findIndex(s => s === currentSong.value);

  if (currentIndex + 1 >= store.queue.length) {
    playNewQueue();
    return;
  }
  const nextSong = store.queue[currentIndex + 1];
  store.setSelectedSong(nextSong);
  play(nextSong);
  store.setIsPlaying(true);
};

const playPrevious = () => {
  if (!currentSong.value || store.queue.length === 0) return;

  const currentIndex = store.queue.findIndex(s => s === currentSong.value);

  if (currentIndex - 1 < 0) {
    playNewQueue();
    return;
  }
  const previousSong = store.queue[currentIndex - 1];
  store.setSelectedSong(previousSong);
  play(previousSong);
  store.setIsPlaying(true);
};
</script>

<style scoped>
p {
  margin: 0;
}

.container {
  background-color: #1D1D1D;
  display: flex;
}

.playbar {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0;
  cursor: pointer;
}

.control-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.5rem 1rem;
}

.thumbnail {
  height: 4rem;
  width: 4rem;
}

.song-info {
  display: flex;
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

.right-controls {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 5px;
}

.right-controls input {
  width: 150px;
}

.progress-bg {
  width: 100%;
  height: 8px;
  background: #444;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  width: 0;
}

.middle-controls {
  display: flex;
  gap: 0.5rem;
  justify-self: center;
}

.middle-controls button {
  background: transparent;
  color: white;
  border: none;
}

button {
  cursor: pointer;
}

.bigger {
  transform: scale(1.4);
  transform-origin: center;
}

.right-controls input[type="range"] {
  appearance: none;
  cursor: pointer;
  width: 125px;
  background-image: linear-gradient(white, white);
  background-repeat: no-repeat;
  background-color: #444;
  border-radius: 4px;
  height: 10px;
}

.right-controls input[type="range"]::-webkit-slider-runnable-track {
  background: transparent;
}

.right-controls input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 0;
  width: 0;
}

.right-controls input[type="range"]::-moz-range-thumb {
  border: none;
  height: 0;
  width: 0;
}

.speaker {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 0;
}

.time {
  margin-right: 30px;
}
</style>