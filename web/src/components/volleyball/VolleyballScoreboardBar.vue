<template>
  <div class="corner">

    <!-- Row: Team A -->
    <div class="row a">
  <div class="logo" v-if="teams?.A?.logoUrl">
    <img :src="teams.A.logoUrl" alt="A" />
  </div>
  <div class="abbr">{{ teams?.A?.abbr || teams?.A?.name || "TEAM A" }}</div>
  <div class="score">{{ teams?.A?.points ?? 0 }}</div>
  <div class="serve" v-if="match?.serve === 'A'">●</div>

  <div
    v-if="alerts?.matchPoint === 'A'"
    class="point-badge match"
  >
    MATCH POINT
  </div>
  <div
    v-else-if="alerts?.setPoint === 'A'"
    class="point-badge"
  >
    SET POINT
  </div>
</div>

    <!-- Row: Team B -->
<div class="row b">
  <div class="logo" v-if="teams?.B?.logoUrl">
    <img :src="teams.B.logoUrl" alt="B" />
  </div>
  <div class="abbr">{{ teams?.B?.abbr || teams?.B?.name || "TEAM B" }}</div>
  <div class="score">{{ teams?.B?.points ?? 0 }}</div>
  <div class="serve" v-if="match?.serve === 'B'">●</div>

  <div
    v-if="alerts?.matchPoint === 'B'"
    class="point-badge match"
  >
    MATCH POINT
  </div>
  <div
    v-else-if="alerts?.setPoint === 'B'"
    class="point-badge"
  >
    SET POINT
  </div>
</div>

    <!-- Set info -->
    <div class="setline">
      <span class="sets">{{ teams?.A?.setsWon ?? 0 }}</span>
      <span class="dash">-</span>
      <span class="sets">{{ teams?.B?.setsWon ?? 0 }}</span>

      <span class="sep">|</span>

      <span class="meta">SET {{ match?.currentSet ?? 1 }}</span>
      
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  meta: Object,
  match: Object,
  teams: Object,
  alerts: Object,
  target: Number
});

const A = computed(() => props.teams?.A ?? {});
const B = computed(() => props.teams?.B ?? {});
const serve = computed(() => props.match?.serve ?? "A");
</script>

<style scoped>
.corner{
  position: absolute;
  top: 40px;
  left: 40px;
  width: 420px;
  user-select: none;
  font-family: var(--bsl-font);
}

.bsl{
  width: 90px;
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.bsl img{
  max-height: 40px;
  max-width: 90px;
  object-fit: contain;
  filter: drop-shadow(0 8px 18px rgba(0,0,0,0.35));
}

.row{
  position: relative;
  overflow: visible;
  display: grid;
  grid-template-columns: 48px 1fr 72px 22px;
  align-items: center;
  gap: 14px;

  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(0,0,0,0.70);
  outline: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 14px 34px rgba(0,0,0,0.35);

  margin-bottom: 10px;
}

.row.a{ border-left: 8px solid rgba(255,215,0,0.95); }
.row.b{ border-left: 8px solid rgba(0,140,255,0.95); }

.logo{
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  outline: 1px solid rgba(255,255,255,0.10);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.abbr{
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score{
  font-weight: 950;
  font-size: 40px;
  text-align: right;
  color: rgba(255,255,255,0.98);
}

.serve{
  font-size: 22px;
  color: var(--bsl-accent);
  text-shadow: var(--bsl-glow);
}

.setline{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(0,0,0,0.58);
  outline: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.86);
}

.sets{
  font-weight: 900;
  font-size: 24px;
  color: var(--bsl-accent);
  text-shadow: var(--bsl-glow);
}

.dash{
  opacity: .7;
  font-weight: 800;
  font-size: 20px;
}

.sep{
  opacity: .45;
  font-size: 18px;
}

.meta{
  font-size: 16px;
  letter-spacing: 1px;
  opacity: .9;
}
.point-badge{
  position: absolute;
  top: 50%;
  left: calc(100% - 18px);
  transform: translateY(-50%);
  transform-origin: left center;

  min-width: 150px;
  height: 40px;
  padding: 0 18px 0 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 0 14px 14px 0;
  background: linear-gradient(90deg, #19d7ff 0%, #00a8ef 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.6px;
  line-height: 1;
  white-space: nowrap;

  box-shadow: 0 8px 18px rgba(0,0,0,0.22);
  animation: pointBadgeExpand 0.28s ease-out;
  z-index: 20;
}

.point-badge.match{
  min-width: 170px;
  background: linear-gradient(90deg, #ffb21c 0%, #ff6d00 100%);
}

@keyframes pointBadgeExpand {
  from {
    opacity: 0;
    transform: translateY(-50%) scaleX(0.15);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scaleX(1);
  }
}
</style>
