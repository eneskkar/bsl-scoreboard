<template>
  <div class="root" v-if="state">
    <PregameScreen
   v-if="state?.ui?.showPregame"
  :teams="state.teams"
  :venue="state?.ui?.venueName"
  :bslLogoUrl="state?.meta?.bslLogoUrl || '/bsl-logo.png'"
/>

<ScoreboardBar
  v-else-if="!isLineupOpen && !isResultOpen"
  :meta="state.meta"
  :match="state.match"
  :teams="state.teams"
  :target="target"
  />
  <div class="breakBarWrap" v-if="bottomBanner">
  <Transition name="slideBreak">
    <div class="breakBar" v-if="bottomBanner">
      <div class="breakMain">{{ bottomBanner }}</div>
    </div>
  </Transition>
</div>
<Transition name="lineupSlide">
  <div v-if="isLineupOpen" class="lineupStage">
    <div class="broadcastLineupCard" :class="lineupSideClass">
      <div class="broadcastTopBar"></div>

      <!-- lineupA: solda takım, sağda liste -->
      <template v-if="lineupTeamKey === 'A'">
        <div class="teamPane" :style="teamPaneStyle">
          <div class="panePattern"></div>

          <div class="teamPaneInner">
            <div class="teamPaneName">{{ lineupTeamName }}</div>

            <div class="teamPaneLogo" v-if="lineupTeamLogo">
              <img :src="lineupTeamLogo" alt="logo" />
            </div>
          </div>
        </div>

        <div class="listPane" :style="listPaneStyle">
          <div class="playersTable">
            <div class="playersHeader">
              <div class="colNo">NO</div>
              <div class="colName">OYUNCULAR</div>
            </div>

            <div
              v-for="(p, i) in lineupPlayers"
              :key="i"
              class="playerLine"
            >
              <div class="colNo">{{ p.number || "" }}</div>
              <div class="colName">{{ p.name }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- lineupB: solda liste, sağda takım -->
      <template v-else>
        <div class="listPane" :style="listPaneStyle">
          <div class="playersTable">
            <div class="playersHeader">
              <div class="colNo">NO</div>
              <div class="colName">OYUNCULAR</div>
            </div>

            <div
              v-for="(p, i) in lineupPlayers"
              :key="i"
              class="playerLine"
            >
              <div class="colNo">{{ p.number || "" }}</div>
              <div class="colName">{{ p.name }}</div>
            </div>
          </div>
        </div>

        <div class="teamPane" :style="teamPaneStyle">
          <div class="panePattern"></div>

          <div class="teamPaneInner">
            <div class="teamPaneName">{{ lineupTeamName }}</div>

            <div class="teamPaneLogo" v-if="lineupTeamLogo">
              <img :src="lineupTeamLogo" alt="logo" />
            </div>
          </div>
        </div>
      </template>

      <div class="lineupFooter" v-if="lineupCoach">
        <span class="footerLabel">COACH:</span>
        <span class="footerValue">{{ lineupCoach }}</span>
      </div>
    </div>
  </div>
</Transition>
    <!-- <div class="sponsor">
    <div class="sponsorInner">
        <span class="tag">SPONSOR</span>
        <span class="name">BSL Partner • Sponsor Adı Buraya</span>
        <span class="dot">•</span>
        <span class="name">Sponsor 2 • Sponsor Adı</span>
        <span class="dot">•</span>
        <span class="name">Sponsor 3 • Sponsor Adı</span>
    </div>
    </div> -->
    <!-- Match Result Card -->
<Transition name="resultSlide">
  <div v-if="isResultOpen" class="resultBoard">
    <!-- SOL TAKIM -->
    <div
      class="teamPanel teamPanelLeft"
      :class="{ winnerPanel: winnerTeam === 'A' }"
      :style="teamPanelStyle('A')"
    >
      <div class="teamTopLine"></div>

      <div class="teamName">
        {{ state?.teams?.A?.name }}
      </div>

      <div class="teamLogoWrap" v-if="state?.teams?.A?.logoUrl">
        <img :src="state.teams.A.logoUrl" :alt="state.teams.A.name" class="teamLogo" />
      </div>
    </div>

    <!-- ORTA SONUÇ -->
    <div class="centerPanel">
  <div class="centerLogoWrap">
    <img src="/bsl-logo.png" alt="BSL Logo" class="centerLogo" />
  </div>

  <div class="resultMiniTitle">MATCH RESULT</div>

  <div class="mainScore">
    <span>{{ state?.teams?.A?.setsWon }}</span>
    <span class="dash">-</span>
    <span>{{ state?.teams?.B?.setsWon }}</span>
  </div>

  <div class="setBoxes" v-if="state?.match?.history?.length">
    <div
      v-for="h in state.match.history"
      :key="h.setNo"
      class="setBox"
    >
      <div class="setBoxLabel">SET {{ h.setNo }}</div>
      <div class="setBoxScore">{{ h.A }} - {{ h.B }}</div>
    </div>
  </div>
</div>

    <!-- SAĞ TAKIM -->
    <div
      class="teamPanel teamPanelRight"
      :class="{ winnerPanel: winnerTeam === 'B' }"
      :style="teamPanelStyle('B')"
    >
      <div class="teamTopLine"></div>

      <div class="teamName">
        {{ state?.teams?.B?.name }}
      </div>

      <div class="teamLogoWrap" v-if="state?.teams?.B?.logoUrl">
        <img :src="state.teams.B.logoUrl" :alt="state.teams.B.name" class="teamLogo" />
      </div>
    </div>
  </div>
</Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import { socket } from "../socket";
import ScoreboardBar from "../components/volleyball/VolleyballScoreboardBar.vue";
import PregameScreen from "../components/shared/PregameScreen.vue";

const state = ref(null);
const route = useRoute();
const matchId = route.params.matchId;
const target = ref(25);
const bottomBanner = computed(() => {
  const s = state.value;
  if (!s) return "";

  // Öncelik: Breaktime
  if (s.match?.break?.active) return "BREAKTIME";

  // Sonra Match/Set point
  if (s.alerts?.matchPoint) return "MATCH POINT";
  if (s.alerts?.setPoint) return "SET POINT";

  return "";
});

function computeTarget(s) {
  const setNo = s?.match?.currentSet || 1;
  return setNo === 5 ? 15 : 25;
}

onMounted(() => {
  const onState = (s) => {
    state.value = s;
    target.value = computeTarget(s);
  };

  socket.emit("joinMatch", { matchId });
  socket.on("state", onState);
});

onBeforeUnmount(() => {
  socket.off("state");
});
const isLineupOpen = computed(() =>
  state.value?.ui?.showCard === "lineupA" || state.value?.ui?.showCard === "lineupB"
);
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
  A: "linear-gradient(180deg, #1f5fbf 0%, #0b2a5a 100%)",
  B: "linear-gradient(180deg, #f3aa13 0%, #d78600 100%)"
};

  const bg = state.value?.teams?.[teamKey]?.panelBg || defaultColors[teamKey];

  return {
    background: bg
  };
};

const listPaneStyle = computed(() => {
  const t = lineupTeamKey.value;

  const baseGradients = {
    A: "linear-gradient(180deg, #163f7a 0%, #071a36 100%)",
    B: "linear-gradient(180deg, #e6a100 0%, #c57a00 100%)"
  };

  return {
    background: state.value?.teams?.[t]?.listBg || baseGradients[t]
  };
});

const lineupTeamKey = computed(() =>
  state.value?.ui?.showCard === "lineupA" ? "A" :
  state.value?.ui?.showCard === "lineupB" ? "B" : null
);

const lineupSideClass = computed(() =>
  lineupTeamKey.value === "A" ? "is-left-team" : "is-right-team"
);

const teamPaneStyle = computed(() => {
  const t = lineupTeamKey.value;
  const defaultColors = {
    A: "linear-gradient(180deg, #0f4c97 0%, #082b57 100%)",
    B: "linear-gradient(180deg, #f3aa13 0%, #d78600 100%)"
  };

  return {
    background: state.value?.teams?.[t]?.panelBg || defaultColors[t]
  };
});

const lineupTeamName = computed(() => {
  const t = lineupTeamKey.value;
  if (!t) return "";
  return state.value?.teams?.[t]?.name || `TEAM ${t}`;
});

const lineupTeamLogo = computed(() => {
  const t = lineupTeamKey.value;
  if (!t) return "";
  return state.value?.teams?.[t]?.logoUrl || "";
});

const lineupPlayers = computed(() => {
  const t = lineupTeamKey.value;
  if (!t) return [];
  return state.value?.lineups?.[t] || [];
});

// opsiyonel: sonra admin’den eklersin
const lineupCoach = computed(() => {
  const t = lineupTeamKey.value;
  if (!t) return "";
  return state.value?.teams?.[t]?.coach || "";
});
</script>

<style scoped>
.root{
  width: 100vw;
  height: 100vh;
  background: transparent;
}

.sponsor{
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(1520px, calc(100vw - 80px));
  background: linear-gradient(90deg, rgba(0,229,255,0.16), rgba(124,77,255,0.14));
  border-radius: 999px;
  padding: 10px 14px;
  outline: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 34px rgba(0,0,0,0.28);
}

.sponsorInner{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--bsl-text);
  font-weight: 700;
  letter-spacing: .2px;
}

.tag{
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--bsl-muted);
  letter-spacing: 1.2px;
}

.name{ font-size: 13px; }
.dot{ opacity: .6; }
.bottomBanner{
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(0,0,0,0.70);
  outline: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.95);
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Slide-in/out transition */
.slideBreak-enter-active,
.slideBreak-leave-active{
  transition: transform 320ms ease, opacity 320ms ease;
  will-change: transform, opacity;
}

.slideBreak-enter-from{
  transform: translateX(-120%);
  opacity: 0;
}

.slideBreak-enter-to{
  transform: translateX(0);
  opacity: 1;
}

.slideBreak-leave-from{
  transform: translateX(0);
  opacity: 1;
}

.slideBreak-leave-to{
  transform: translateX(120%);
  opacity: 0;
}

.breakMain{
  font-size: 34px;
  font-weight: 950;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 4px 18px rgba(0,0,0,0.6);
}
.breakBarWrap{
  position: absolute;
  left: 50%;
  bottom: 64px;          /* burası ALT */
  transform: translateX(-50%);
  width: min(1400px, calc(100vw - 120px));
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.resultBoard{
  position: absolute;
  left: 50%;
  top: 11%;
  transform: translateX(-50%);
  width: min(1280px, calc(100vw - 120px));
  height: 540px;
  display: grid;
  grid-template-columns: 1fr 260px 1fr;
  border-radius: 0;
  overflow: visible;
  box-shadow: 0 28px 70px rgba(0,0,0,0.35);
}

/* Yan takım panelleri */
.teamPanel{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 38px 28px 28px;
  color: white;
  overflow: hidden;
}

.teamPanelLeft{
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.teamPanelRight{
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* üst çizgi */
.teamTopLine{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 12px;
  background: #f3d400;
}

/* hafif desen efekti */
.teamPanel::after{
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 30%),
    radial-gradient(circle at 80% 60%, rgba(255,255,255,0.05), transparent 28%);
  pointer-events: none;
  opacity: 0.8;
}

/* kazanan parlama */
.winnerPanel{
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,0.08),
    0 0 34px rgba(0,229,255,0.12);
}

.winnerPanel::before{
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0,229,255,0.16), transparent 60%);
  pointer-events: none;
}

/* takım adı */
.teamName{
  position: relative;
  z-index: 2;
  text-align: center;
  font-size: 34px;
  line-height: 1.12;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  max-width: 90%;
  margin-top: 18px;
}

/* logo */
.teamLogoWrap{
  position: relative;
  z-index: 2;
  margin-top: 44px;
  width: 270px;
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teamLogo{
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 14px 34px rgba(0,0,0,0.30));
}

/* orta panel */
.centerPanel{
  background: linear-gradient(180deg, #efefef 0%, #dcdcdc 100%);
  color: #232323;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px 18px;
  box-shadow:
    0 10px 24px rgba(0,0,0,0.16);
  z-index: 3;
}

.resultMiniTitle{
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(0,0,0,0.72);
  margin-bottom: 18px;
}

.mainScore{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  font-size: 86px;
  line-height: 1;
  font-weight: 950;
  color: var(--bsl-text);
  margin-bottom: 28px;
  text-shadow: 0 4px 18px rgba(0,0,0,0.72);
}

.dash{
  color: var(--bsl-text);
  text-shadow: 0 4px 18px rgba(0,0,0,0.72);
}

/* set kutuları */
.setBoxes{
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.setBox{
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 14px;
  padding: 10px 12px;
  text-align: center;
}

.setBoxLabel{
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.3px;
  color: rgba(0,0,0,0.58);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.setBoxScore{
  font-size: 20px;
  font-weight: 900;
  color: #222;
}

/* giriş animasyonu */
.resultSlide-enter-active,
.resultSlide-leave-active{
  transition: transform 420ms ease, opacity 420ms ease;
  will-change: transform, opacity;
}

.resultSlide-enter-from{
  transform: translateX(calc(-50% + 180px));
  opacity: 0;
}

.resultSlide-enter-to{
  transform: translateX(-50%);
  opacity: 1;
}

.resultSlide-leave-from{
  transform: translateX(-50%);
  opacity: 1;
}

.resultSlide-leave-to{
  transform: translateX(calc(-50% + 180px));
  opacity: 0;
}
.centerLogoWrap{
  width: 150px;
  height: 150px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.centerLogo{
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.lineupStage{
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.broadcastLineupCard{
  position: relative;
  width: min(1380px, calc(100vw - 120px));
  height: 620px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  background: #111;
  box-shadow: 0 24px 70px rgba(0,0,0,0.38);
}

.broadcastTopBar{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 12px;
  background: #f2d000;
  z-index: 5;
}

.teamPane{
  position: relative;
  overflow: hidden;
}

.teamPaneInner{
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 46px 36px 70px;
  color: white;
}

.teamPaneName{
  font-size: 30px;
  line-height: 1.12;
  font-weight: 950;
  text-transform: uppercase;
  text-align: center;
  max-width: 80%;
  margin-bottom: 34px;
}

.teamPaneLogo{
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teamPaneLogo img{
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 30px rgba(0,0,0,0.28));
}

.panePattern{
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image:
    radial-gradient(circle at 20% 10%, rgba(255,255,255,0.20), transparent 20%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.14), transparent 18%);
}

.listPane{
  background:
    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 40%),
    linear-gradient(180deg, #123b72 0%, #06152b 100%);
  padding: 92px 40px 74px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-left: 1px solid rgba(255,255,255,0.08);
}

.playersTable{
  width: 100%;
}

.playersHeader{
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.14);
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.70);
}

.playerLine{
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
  align-items: center;
  min-height: 44px;
  font-size: 20px;
  line-height: 1.2;
  color: rgba(255,255,255,0.96);
}

.colNo{
  font-weight: 900;
  text-align: right;
  color: rgba(255,255,255,0.92);
  padding-right: 6px;
}
.colName{
  font-weight: 800;
  color: rgba(255,255,255,0.96);
}

.lineupFooter{
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  min-height: 48px;
  background: linear-gradient(180deg, #ececec 0%, #d6d6d6 100%);
  color: #171717;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  z-index: 4;
}

.footerLabel{
  opacity: 0.8;
  font-weight: 900;
}

.footerValue{
  font-weight: 950;
}

/* hangi tarafta takım paneli varsa ona göre akış */
.broadcastLineupCard.is-left-team{
  grid-template-columns: 520px 1fr;
}

.broadcastLineupCard.is-right-team{
  grid-template-columns: 1fr 520px;
}

/* animasyon */
.lineupSlide-enter-active,
.lineupSlide-leave-active{
  transition: transform 360ms ease, opacity 360ms ease;
  will-change: transform, opacity;
}

.lineupSlide-enter-from{
  transform: translateX(120%);
  opacity: 0;
}

.lineupSlide-enter-to{
  transform: translateX(0);
  opacity: 1;
}

.lineupSlide-leave-from{
  transform: translateX(0);
  opacity: 1;
}

.lineupSlide-leave-to{
  transform: translateX(120%);
  opacity: 0;
}
.overlay-root {
  position: fixed;
  inset: 0;
  background: transparent;
}
</style>