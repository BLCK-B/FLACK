<template>
  <div class="bg">
    <div class="card">
      <div class="directory-input">
        <label>Directories <span> - for reload, app needs to be restarted</span></label>

        <div class="controls">
          <button type="button" @click="pickDirectory">
            Select folder
          </button>
        </div>

        <div class="directories-list">
          <div v-for="(dir, index) in store.dirPaths" :key="index" class="directory-chip">
            {{ dir }}
            <button type="button" @click="removeDirectory(index)" class="remove-btn">X</button>
          </div>
        </div>

        <button class="close" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import Electrobun, {Electroview} from "electrobun/view";
import {RPC} from "../bun";
import {useStore} from "./store";

const store = useStore();

const rpc = Electroview.defineRPC<RPC>({
  maxRequestTime: 10000,
  handlers: {
    requests: {},
    messages: {},
  },
});

const electrobun = new Electrobun.Electroview({rpc});

const close = () => {
  store.setIsSettingsOpen(false);
};

const saveDirectories = () => {
  localStorage.setItem("music-paths", JSON.stringify(store.dirPaths));
};

onMounted(() => {
  const stored = localStorage.getItem("music-paths");
  if (!stored) return;
  store.setDirPaths(JSON.parse(stored));
});

const pickDirectory = async () => {
  const chosenPaths = await electrobun.rpc!.request("openDirectoryDialog", {});
  if (!chosenPaths?.length) return;

  for (const path of chosenPaths) {
    if (!store.dirPaths.includes(path)) {
      store.dirPaths.push(path);
    }
  }
  saveDirectories();
};

const removeDirectory = (index: number) => {
  store.dirPaths.splice(index, 1);
  saveDirectories();
};
</script>

<style scoped>
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1.5px);
}

.card {
  position: relative;
  background-color: #1D1D1D;
  width: 30rem;
  height: 15rem;
  border-radius: 4px;
  padding: 1rem;
  pointer-events: auto;
}

.directory-input {
  margin-bottom: 16px;
}

.directory-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.directories-list {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.directory-chip {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  color: #aaa;
  padding: 0 0 0 4px;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.path-input {
  flex: 1;
  min-width: 150px;
  padding: 4px 8px;
  font-size: 0.9em;
  border: 1px solid #444;
  border-radius: 4px;
  background: #111;
  color: white;
}

button {
  padding: 4px 12px;
  margin: 0.5rem 0;
  border: none;
  border-radius: 4px;
  background-color: mediumseagreen;
  color: black;
  font-size: 0.9em;
  cursor: pointer;
}

.close {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: darkgrey;
}

.directory-input label span {
  font-weight: normal;
}
</style>