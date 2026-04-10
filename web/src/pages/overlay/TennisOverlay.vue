<template>
  <div class="overlay-root" v-if="state">
    <PregameScreen
      v-if="state?.ui?.showPregame"
      :teams="state.teams"
      :venue="state?.ui?.venueName"
      :bslLogoUrl="state?.meta?.bslLogoUrl || '/bsl-logo.png'"
    />

    <!-- NORMAL SCOREBOARD -->
    <Transition name="fadeUp">
        <div
  v-if="!isResultOpen && !state?.ui?.showPregame"
  class="tennis-scoreboard"
>
  <div class="score-shell">
    <div class="top-status">
      {{ footerLabel }}
    </div>

    <!-- TEAM A -->
    <div class="strip-row" :class="{ serving: state.match.server === 'A' }">
        <div class="team-strip">

  <div class="sb-team-logo-wrap" v-if="state.teams.A.logoUrl">
    <img :src="state.teams.A.logoUrl" :alt="state.teams.A.name" class="sb-team-logo" />
  </div>

  <span class="team-strip-name">{{ state.teams.A.name || "TEAM A" }}</span>
</div>

  <div class="score-strip-right">
    <span class="serve-indicator score-side" v-if="state.match.server === 'A'">●</span>

    <div class="live-score-box">
      {{ state.match.currentSetScore?.A ?? 0 }}
    </div>

    <div class="set-history-strip">
      <div
        v-for="h in state.match.history"
        :key="`A-${h.setNo}`"
        class="set-mini-box"
        :class="{ tb: h.isTiebreak }"
      >
        <span class="mini-label">{{ h.isTiebreak ? "TB" : h.setNo }}</span>
        <span class="mini-score">{{ h.A }}</span>
      </div>
    </div>
  </div>
</div>
    <!-- TEAM B -->
    <div class="strip-row" :class="{ serving: state.match.server === 'B' }">
    <div class="team-strip">
  <div class="sb-team-logo-wrap" v-if="state.teams.B.logoUrl">
    <img :src="state.teams.B.logoUrl" :alt="state.teams.B.name" class="sb-team-logo" />
  </div>

  <span class="team-strip-name">{{ state.teams.B.name || "TEAM B" }}</span>
</div>

  <div class="score-strip-right">
      <span class="serve-indicator score-side" v-if="state.match.server === 'B'">●</span>

    <div class="live-score-box">
      {{ state.match.currentSetScore?.B ?? 0 }}
    </div>

    <div class="set-history-strip">
      <div
        v-for="h in state.match.history"
        :key="`B-${h.setNo}`"
        class="set-mini-box"
        :class="{ tb: h.isTiebreak }"
      >
        <span class="mini-label">{{ h.isTiebreak ? "TB" : h.setNo }}</span>
        <span class="mini-score">{{ h.B }}</span>
      </div>
    </div>
  </div>
</div>

    <div class="bottom-format">
      {{ state.meta.format?.toUpperCase() }}
    </div>
  </div>
</div>
    </Transition>

    <!-- RESULT CARD -->
    <Transition name="resultSlide">
      <div v-if="isResultOpen" class="result-board">
        <!-- SOL TAKIM -->
        <div
          class="team-panel team-panel-left"
          :class="{ winnerPanel: winnerTeam === 'A' }"
          :style="teamPanelStyle('A')"
        >
          <div class="team-top-line"></div>

          <div class="team-title">
            {{ state?.teams?.A?.name }}
          </div>

          <div class="team-logo-wrap" v-if="state?.teams?.A?.logoUrl">
            <img :src="state.teams.A.logoUrl" :alt="state.teams.A.name" class="team-logo" />
          </div>
        </div>

        <!-- ORTA -->
        <div class="center-panel">
          <div class="center-logo-wrap">
            <img src="/bsl-logo.png" alt="BSL Logo" class="center-logo" />
          </div>

          <div class="result-mini-title">MATCH RESULT</div>

          <div class="main-score">
            <span>{{ state?.teams?.A?.setsWon }}</span>
            <span class="dash">-</span>
            <span>{{ state?.teams?.B?.setsWon }}</span>
          </div>

          <div class="set-boxes" v-if="state?.match?.history?.length">
            <div
              v-for="h in state.match.history"
              :key="h.setNo"
              class="set-box"
            >
              <div class="set-box-label">
                {{ h.isTiebreak ? `TB ${h.setNo}` : `SET ${h.setNo}` }}
              </div>
              <div class="set-box-score">{{ h.A }} - {{ h.B }}</div>
            </div>
          </div>
        </div>

        <!-- SAĞ TAKIM -->
        <div
          class="team-panel team-panel-right"
          :class="{ winnerPanel: winnerTeam === 'B' }"
          :style="teamPanelStyle('B')"
        >
          <div class="team-top-line"></div>

          <div class="team-title">
            {{ state?.teams?.B?.name }}
          </div>

          <div class="team-logo-wrap" v-if="state?.teams?.B?.logoUrl">
            <img :src="state.teams.B.logoUrl" :alt="state.teams.B.name" class="team-logo" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import { socket } from "../../socket";
import PregameScreen from "../../components/shared/PregameScreen.vue";

const state = ref(null);
const route = useRoute();
const matchId = route.params.matchId;

const onState = (s) => {
  state.value = s;
};

onMounted(() => {
  socket.emit("joinMatch", { matchId });
  socket.on("state", onState);
});

onBeforeUnmount(() => {
  socket.off("state", onState);
});

const isResultOpen = computed(() => state.value?.ui?.showCard === "result");

const winnerTeam = computed(() => {
  const a = state.value?.teams?.A?.setsWon ?? 0;
  const b = state.value?.teams?.B?.setsWon ?? 0;
  if (a > b) return "A";
  if (b > a) return "B";
  return null;
});

const teamPanelStyle = (teamKey) => {
  const defaultColors = {
    A: "linear-gradient(180deg, #1f9d55 0%, #14532d 100%)",
    B: "linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)"
  };

  return {
    background: state.value?.teams?.[teamKey]?.panelBg || defaultColors[teamKey]
  };

};
const footerLabel = computed(() => {
  if (!state.value) return "";

  return state.value.match.isTiebreak
    ? "TIEBREAK"
    : `SET ${state.value.match.currentSet}`;
});
</script>

<style scoped>
.overlay-root {
  position: fixed;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

/* SCOREBOARD */
.tennis-scoreboard {
  position: absolute;
  left: 34px;
  bottom: 34px;
  pointer-events: none;
}

.score-shell {
  position: relative;
  width: 560px;
  background: #0b1f33;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(0,0,0,0.35);
}

.top-status {
  position: absolute;
  top: -22px;
  left: 0;
  height: 22px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #00bcd4;
  color: #052033;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.sb-team-logo-wrap {
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sb-team-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: white;
  border-radius: 6px;
  padding: 2px;
  box-sizing: border-box;
}

.strip-row {
  display: grid;
  grid-template-columns: 1fr auto;
  min-height: 44px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.strip-row:last-of-type {
  border-bottom: none;
}


.serve-indicator {
  color: #ffd600;
  font-size: 12px;
  line-height: 1;
}

.serve-indicator.score-side {
  margin-right: 8px;
}



.team-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  min-width: 0;
  height: 100%;
}

.team-strip-name {
  color: white;
  font-size: 16px;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
  display: flex;
  align-items: center;
  height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-strip-right {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
}

.live-score-box {
  width: 52px;
  min-width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #00bcd4;
  color: #052033;
  font-size: 24px;
  font-weight: 900;
}

.set-history-strip {
  display: flex;
  align-items: stretch;
  flex-direction: row;
  flex-wrap: nowrap;
}

.set-mini-box {
  width: 42px;
  min-width: 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #122c45;
  border-left: 1px solid rgba(255,255,255,0.08);
  color: white;
  line-height: 1;
}

.set-mini-box.tb {
  background: #1f3f2f;
  color: #9fff9f;
}

.mini-label {
  font-size: 8px;
  font-weight: 900;
  opacity: 0.7;
  margin-bottom: 3px;
}

.mini-score {
  font-size: 18px;
  font-weight: 900;
}

.bottom-format {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  background: #091a2b;
  color: rgba(255,255,255,0.6);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.6px;
}

/* RESULT */
.result-board {
  position: absolute;
  left: 50%;
  top: 11%;
  transform: translateX(-50%);
  width: min(1280px, calc(100vw - 120px));
  height: 540px;
  display: grid;
  grid-template-columns: 1fr 260px 1fr;
  box-shadow: 0 28px 70px rgba(0,0,0,0.35);
}

.team-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 38px 28px 28px;
  color: white;
  overflow: hidden;
}

.team-panel-left {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.team-panel-right {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.team-top-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 12px;
  background: #f3d400;
}

.team-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 30%),
    radial-gradient(circle at 80% 60%, rgba(255,255,255,0.05), transparent 28%);
  pointer-events: none;
  opacity: 0.8;
}

.winnerPanel {
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,0.08),
    0 0 34px rgba(0,229,255,0.12);
}

.winnerPanel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0,229,255,0.16), transparent 60%);
  pointer-events: none;
}

.team-title {
  position: relative;
  z-index: 2;
  text-align: center;
  font-size: 34px;
  line-height: 1.12;
  font-weight: 950;
  text-transform: uppercase;
  max-width: 90%;
  margin-top: 18px;
}

.team-logo-wrap {
  position: relative;
  z-index: 2;
  margin-top: 44px;
  width: 270px;
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 18px;
  box-sizing: border-box;
  box-shadow: 0 14px 34px rgba(0,0,0,0.18);
}

.team-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  
}

.main-score-box {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 38px;
  font-weight: 950;

  background: rgba(255,255,255,0.06);
  border-left: 1px solid rgba(255,255,255,0.08);
}

.center-panel {
  background: linear-gradient(180deg, #efefef 0%, #dcdcdc 100%);
  color: #232323;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px 18px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.16);
  z-index: 3;
}

.center-logo-wrap {
  width: 150px;
  height: 150px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.result-mini-title {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(0,0,0,0.72);
  margin-bottom: 18px;
}

.main-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  font-size: 86px;
  line-height: 1;
  font-weight: 950;
  color: #111827;
  margin-bottom: 28px;
}

.dash {
  color: #111827;
}

.set-boxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.set-box {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 14px;
  padding: 10px 12px;
  text-align: center;
}

.set-box-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.3px;
  color: rgba(0,0,0,0.58);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.set-box-score {
  font-size: 20px;
  font-weight: 900;
  color: #222;
}

/* ANIMATIONS */
.fadeUp-enter-active,
.fadeUp-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.fadeUp-enter-from,
.fadeUp-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.resultSlide-enter-active,
.resultSlide-leave-active {
  transition: transform 420ms ease, opacity 420ms ease;
  will-change: transform, opacity;
}

.resultSlide-enter-from {
  transform: translateX(calc(-50% + 180px));
  opacity: 0;
}

.resultSlide-enter-to {
  transform: translateX(-50%);
  opacity: 1;
}

.resultSlide-leave-from {
  transform: translateX(-50%);
  opacity: 1;
}

.resultSlide-leave-to {
  transform: translateX(calc(-50% + 180px));
  opacity: 0;
}

</style>