<template>
  <component v-if="currentComponent" :is="currentComponent" />
  <div v-else class="loading">Yükleniyor...</div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { socket } from "../../socket";

import VolleyballOverlay from "./VolleyballOverlay.vue";
import TennisOverlay from "./TennisOverlay.vue";

const route = useRoute();
const matchId = route.params.matchId;
const state = ref(null);

const currentComponent = computed(() => {
  if (!state.value?.sport) return null;
  return state.value.sport === "tennis" ? TennisOverlay : VolleyballOverlay;
});

function onState(s) {
  state.value = s;
}

onMounted(() => {
  socket.emit("joinMatch", { matchId });
  socket.on("state", onState);
});

onBeforeUnmount(() => {
  socket.off("state", onState);
});
</script>

<style scoped>
.loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: transparent;
  color: white;
  font-size: 22px;
}
</style>