<template>
  <div class="pregame">
    <div class="board">
      <!-- Sol taraf -->
      <div class="side left">
        <div class="team-name">
          {{ teams?.A?.name || "TAKIM A" }}
        </div>

        <div class="logo-wrap">
          <img
            v-if="teams?.A?.logoUrl"
            :src="teams.A.logoUrl"
            alt="Takım A"
            class="team-logo"
          />
          <div v-else class="logo-placeholder">LOGO</div>
        </div>
      </div>

      <!-- Sağ taraf -->
      <div class="side right">
        <div class="team-name">
          {{ teams?.B?.name || "TAKIM B" }}
        </div>

        <div class="logo-wrap">
          <img
            v-if="teams?.B?.logoUrl"
            :src="teams.B.logoUrl"
            alt="Takım B"
            class="team-logo"
          />
          <div v-else class="logo-placeholder">LOGO</div>
        </div>
      </div>

      <!-- Orta üst BSL logo -->
      <div class="center-logo">
        <img
          v-if="bslLogoUrl"
          :src="bslLogoUrl"
          alt="BSL Logo"
          class="bsl-logo"
        />
        <div v-else class="logo-placeholder small">BSL</div>
      </div>
    </div>

    <!-- Alt salon adı -->
    <div class="venue-bar">
      {{ venue}}
    </div>
  </div>
</template>

<script setup>
defineProps({
  teams: {
    type: Object,
    default: () => ({
      A: { name: "TAKIM A", logoUrl: "" },
      B: { name: "TAKIM B", logoUrl: "" }
    })
  },
  venue: {
    type: String,
    default: ""
  },
  bslLogoUrl: {
    type: String,
    default: "/bsl-logo.png"
  }
})
</script>

<style scoped>
.pregame {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  z-index: 9998;
  background: transparent;
}

.board {
  position: relative;
  width: 1080px;
  height: 520px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 10px solid #f1f1f1;
  border-left: 10px solid #f1f1f1;
  border-right: 10px solid #f1f1f1;
  overflow: visible;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
}

.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 54px 28px 28px;
  position: relative;
}

.left {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.08)),
    linear-gradient(135deg, #185cc6 0%, #0c3c8f 100%);
}

.right {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.08)),
    linear-gradient(135deg, #f3aa13 0%, #d78600 100%);
}

.team-name {
  color: white;
  text-align: center;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 42px;
  line-height: 1.15;
  max-width: 88%;
  margin-bottom: 42px;
  word-break: break-word;
}

.logo-wrap {
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 18px;
  box-sizing: border-box;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
}

.team-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background: transparent;
}

.center-logo {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 120px;
  background: white;
  box-shadow: 0 8px 18px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  z-index: 10;
}

.bsl-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.venue-bar {
  width: 1080px;
  background: linear-gradient(180deg, #f4f4f4 0%, #dddddd 100%);
  color: #111;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  padding: 16px 22px;
  border-left: 10px solid #f1f1f1;
  border-right: 10px solid #f1f1f1;
  border-bottom: 10px solid #f1f1f1;
  box-sizing: border-box;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  text-transform: uppercase;
}

.logo-placeholder {
  color: rgba(255,255,255,0.85);
  font-weight: 800;
  font-size: 28px;
}

.logo-placeholder.small {
  color: #222;
  font-size: 26px;
}
</style>