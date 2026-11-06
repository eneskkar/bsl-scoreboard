<template>
  <main v-if="state" class="admin-page">
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon" aria-hidden="true">◉</div>
        <div>
          <h1>BSL Tennis Admin Paneli</h1>
          <p class="subtitle">Maç yönetimi ve skor kontrolü</p>
        </div>
      </div>
      <div class="topbar-stats">
        <div class="stat-pill"><span>Stage</span><strong>{{ state.meta.stage?.toUpperCase() }}</strong></div>
        <div class="stat-pill"><span>Format</span><strong>{{ state.meta.format?.toUpperCase() }}</strong></div>
        <div class="stat-pill"><span>Set</span><strong>{{ state.match.currentSet }}</strong></div>
        <div class="stat-pill"><span>Status</span><strong class="status-value" :class="state.match.status">{{ state.match.status }}</strong></div>
        <div class="stat-pill"><span>Tiebreak</span><strong>{{ state.match.isTiebreak ? 'AKTİF' : 'YOK' }}</strong></div>
      </div>
    </header>

    <div class="layout">
      <div class="left-column">
        <section class="panel">
          <div class="panel-head"><h2><span class="section-icon">⚙</span> Maç Ayarları</h2></div>
          <div class="field">
            <label for="match-stage">Match Stage</label>
            <select id="match-stage" v-model="stage" @change="setStage(stage)">
              <option value="group">Group</option>
              <option value="semi">Semi</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div class="info-box">
            <div><b>Group / Semi:</b> BO3 — 2 set alan kazanır.</div>
            <div><b>Final:</b> BO5 — 3 set alan kazanır.</div>
            <div>Skor <b>1-1</b> veya finalde <b>2-2</b> olursa son set yerine <b>match tiebreak</b> oynanır.</div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2><span class="section-icon">♧</span> Takım Bilgileri</h2></div>
          <div class="team-grid">
            <div class="team-card team-a">
              <div class="team-heading">
                <h3>Takım A</h3>
                <span v-if="state.match.server === 'A'" class="serving-badge">● Servis</span>
              </div>
              <div class="field">
                <label for="team-a-name">Takım Adı</label>
                <input id="team-a-name" v-model="teamA" @change="updateTeam('A', { name: teamA })" placeholder="Takım A" />
              </div>
              <div class="field">
                <label for="team-a-logo">Logo</label>
                <input id="team-a-logo" class="file-input" type="file" accept="image/*" @change="onPickLogo($event, 'A')" />
              </div>
              <div class="team-actions">
                <button class="btn outline-a" :class="{ 'selected-server': state.match.server === 'A' }" @click="setServer('A')">{{ state.match.server === 'A' ? '✓ Servis A' : 'Servis A' }}</button>
                <button class="btn navy" @click="updateTeam('A', { abbr: teamA.slice(0, 3).toUpperCase() })">Kısa Ad Üret</button>
              </div>
            </div>
            <div class="team-card team-b">
              <div class="team-heading">
                <h3>Takım B</h3>
                <span v-if="state.match.server === 'B'" class="serving-badge badge-b">● Servis</span>
              </div>
              <div class="field">
                <label for="team-b-name">Takım Adı</label>
                <input id="team-b-name" v-model="teamB" @change="updateTeam('B', { name: teamB })" placeholder="Takım B" />
              </div>
              <div class="field">
                <label for="team-b-logo">Logo</label>
                <input id="team-b-logo" class="file-input" type="file" accept="image/*" @change="onPickLogo($event, 'B')" />
              </div>
              <div class="team-actions">
                <button class="btn outline-b" :class="{ 'selected-server': state.match.server === 'B' }" @click="setServer('B')">{{ state.match.server === 'B' ? '✓ Servis B' : 'Servis B' }}</button>
                <button class="btn navy" @click="updateTeam('B', { abbr: teamB.slice(0, 3).toUpperCase() })">Kısa Ad Üret</button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2><span class="section-icon">▣</span> Pregame Ekranı</h2></div>
          <div class="field">
            <label for="venue-name">Salon Adı</label>
            <input id="venue-name" :value="state?.ui?.venueName || ''" @change="updateVenue($event.target.value)" placeholder="Salon adı" />
          </div>
          <div class="action-row two">
            <button class="btn blue-soft" @click="togglePregame(true)">▶ Pregame Aç</button>
            <button class="btn danger" @click="togglePregame(false)">■ Pregame Kapat</button>
          </div>
        </section>
      </div>

      <div class="right-column">
        <section class="panel score-panel">
          <div class="panel-head"><h2><span class="section-icon">▤</span> Skor Kontrolü</h2></div>
          <div class="scoreboard-preview">
            <div class="score-team score-a">
              <span class="team-name">{{ state.teams.A.name || 'Takım A' }}</span>
              <strong>{{ state.match.currentSetScore.A }}</strong>
              <small>Set: <b>{{ state.teams.A.setsWon }}</b></small>
            </div>
            <div class="score-meta">
              <strong>Set {{ state.match.currentSet }}</strong>
              <span>Servis: <b>{{ state.teams[state.match.server]?.name || '-' }}</b></span>
              <span v-if="state.match.isTiebreak" class="tiebreak-badge">TIEBREAK</span>
            </div>
            <div class="score-team score-b">
              <span class="team-name">{{ state.teams.B.name || 'Takım B' }}</span>
              <strong>{{ state.match.currentSetScore.B }}</strong>
              <small>Set: <b>{{ state.teams.B.setsWon }}</b></small>
            </div>
          </div>
          <div class="point-controls">
            <button class="btn teamA" @click="point('A', 1)">+1 {{ state.teams.A.name || 'Takım A' }}</button>
            <button class="btn dark" @click="point('A', -1)">-1 {{ state.teams.A.name || 'Takım A' }}</button>
            <button class="btn teamB" @click="point('B', 1)">+1 {{ state.teams.B.name || 'Takım B' }}</button>
            <button class="btn dark" @click="point('B', -1)">-1 {{ state.teams.B.name || 'Takım B' }}</button>
          </div>
        </section>

        <section class="panel match-actions-panel">
          <div class="panel-head"><h2><span class="section-icon">▱</span> Set / Maç Aksiyonları</h2></div>
          <div class="action-row"><button class="btn warning" @click="finishSet()">⚑ Seti Bitir</button></div>
          <div class="action-row two">
            <button class="btn warning-outline" @click="resetSet()">↻ Aktif Seti Sıfırla</button>
            <button class="btn secondary" @click="showCard('result')">Result Göster</button>
          </div>
          <div class="action-row two">
            <button class="btn secondary" @click="hideCard()">Kartı Kapat / Hide Card</button>
            <button class="btn secondary" @click="newMatch(true)">＋ New Match (keep teams)</button>
          </div>
          <div class="action-row"><button class="btn danger-outline" @click="newMatch(false)">New Match (reset teams)</button></div>
          <div class="status-box">Durum: <b>{{ state.match.status }}</b> — Servis: <b>{{ state.teams[state.match.server]?.name || '-' }}</b> — Tiebreak: <b>{{ state.match.isTiebreak ? 'AKTİF' : 'KAPALI' }}</b></div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2><span class="section-icon">↗</span> Hızlı Linkler</h2></div>
          <div class="quick-links">
            <a :href="`/overlay/${matchId}`" target="_blank" rel="noopener noreferrer">▣ Overlay</a>
            <a :href="`/admin/${matchId}`" target="_blank" rel="noopener noreferrer">◈ Admin</a>
          </div>
        </section>
      </div>
    </div>
  </main>
  <div v-else class="loading">Yükleniyor...</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { socket } from "../../socket";

const route = useRoute();
const matchId = route.params.matchId;

const state = ref(null);
const stage = ref("group");
const teamA = ref("TEAM A");
const teamB = ref("TEAM B");

const onState = (s) => {
  state.value = s;
  stage.value = s.meta.stage;
  teamA.value = s.teams.A.name;
  teamB.value = s.teams.B.name;
};

onMounted(() => {
  socket.emit("joinMatch", { matchId });
  socket.on("state", onState);
});

onBeforeUnmount(() => {
  socket.off("state", onState);
});

function setStage(value) {
  socket.emit("admin:tennis:setStage", { matchId, stage: value });
}

function updateTeam(team, patch) {
  socket.emit("admin:update", {
    matchId,
    patch: { teams: { [team]: patch } }
  });
}

function point(team, delta) {
  socket.emit("admin:tennis:point", { matchId, team, delta });
}

function setServer(team) {
  socket.emit("admin:tennis:server", { matchId, team });
}

function resetSet() {
  socket.emit("admin:tennis:resetSet", { matchId });
}

function finishSet() {
  socket.emit("admin:tennis:finishSet", { matchId });
}

function newMatch(keepTeams) {
  socket.emit("admin:newMatch", { matchId, keepTeams });
}

function showCard(card) {
  socket.emit("admin:showCard", { matchId, card });
}

function hideCard() {
  socket.emit("admin:hideCard", { matchId });
}

function togglePregame(value) {
  socket.emit("admin:update", {
    matchId,
    patch: {
      ui: {
        showPregame: value
      }
    }
  });
}

function updateVenue(value) {
  socket.emit("admin:update", {
    matchId,
    patch: {
      ui: {
        venueName: value
      }
    }
  });
}

async function onPickLogo(e, team) {
  const file = e.target.files?.[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`/api/upload/team-logo?matchId=${matchId}&team=${team}`, {
    method: "POST",
    body: fd
  });

  if (!res.ok) {
    const txt = await res.text();
    alert("Upload hata: " + txt);
    return;
  }

  e.target.value = "";
}
</script>

<style scoped>
.admin-page { box-sizing: border-box; max-width: 1600px; min-height: 100vh; margin: 0 auto; padding: 24px 30px 44px; background: #f2f5fa; color: #111c36; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.admin-page *, .admin-page *::before, .admin-page *::after { box-sizing: border-box; }
.loading { min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: white; font-size: 22px; }
.topbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 18px; margin-bottom: 24px; }
.brand { display: flex; align-items: center; gap: 18px; }
.brand-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #1494ff, #0553ce); color: white; display: grid; place-items: center; border-radius: 14px; font-size: 34px; box-shadow: 0 7px 16px #0968db29; }
h1 { font-size: 28px; font-weight: 850; letter-spacing: -.6px; margin: 0; }
.subtitle { color: #66738c; font-size: 14px; margin: 4px 0 0; }
.topbar-stats { display: flex; flex-wrap: wrap; gap: 10px; }
.stat-pill { background: #fff; border: 1px solid #e6ebf3; min-width: 108px; border-radius: 14px; padding: 10px 15px; box-shadow: 0 4px 12px #15253f0d; }
.stat-pill span { display: block; color: #6c7992; font-size: 11px; margin-bottom: 3px; }
.stat-pill strong { display: block; font-size: 14px; font-weight: 850; }
.status-value.live { color: #219653; }
.status-value.finished { color: #c43e36; }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr); gap: 20px; align-items: start; }
.left-column, .right-column { display: flex; min-width: 0; flex-direction: column; gap: 18px; }
.panel { min-width: 0; padding: 24px; border: 1px solid #e2e9f3; border-radius: 19px; background: #fff; box-shadow: 0 7px 17px #13253e0d, 0 1px 3px #13253e08; }
.panel-head { margin-bottom: 21px; }
.panel-head h2 { display: flex; align-items: center; gap: 11px; margin: 0; font-size: 19px; font-weight: 850; letter-spacing: -.3px; }
.section-icon { display: inline-flex; justify-content: center; align-items: center; color: #0775f5; font-size: 24px; width: 27px; line-height: 1; }
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 7px; font-size: 12px; font-weight: 750; color: #253551; }
input, select { width: 100%; height: 44px; padding: 0 13px; border: 1px solid #cbd5e4; border-radius: 11px; outline: none; background: #fff; font: inherit; font-size: 14px; color: #15223b; transition: border-color .15s, box-shadow .15s; }
input:focus, select:focus { border-color: #278af5; box-shadow: 0 0 0 3px #2685fa20; }
.file-input { padding: 8px; font-size: 12px; line-height: 25px; overflow: hidden; }
.file-input::file-selector-button { border: 1px solid #cbd5e4; background: #f4f7fb; border-radius: 6px; padding: 4px 8px; margin-right: 8px; font: inherit; cursor: pointer; }
.info-box { background: #f4f7fc; padding: 14px 16px; border-radius: 13px; color: #34445f; line-height: 1.55; font-size: 12px; }
.team-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.team-card { padding: 17px 15px 15px; border: 1px solid #dce5f1; border-radius: 16px; background: #fafcfe; }
.team-a { border-left: 4px solid #29b34c; background: linear-gradient(180deg, #f1fbf3, #fafcfe 40%); }
.team-b { border-left: 4px solid #246ff2; background: linear-gradient(180deg, #f0f6ff, #fafcfe 40%); }
.team-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 5px; margin-bottom: 18px; }
.team-heading h3 { margin: 0; font-weight: 850; font-size: 15px; }
.serving-badge { font-size: 11px; white-space: nowrap; font-weight: 800; background: #d9f8df; color: #168e35; padding: 5px 8px; border-radius: 100px; }
.badge-b { background: #dceaff; color: #1b63d6; }
.team-actions { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 7px; }
.btn { border: 0; border-radius: 11px; padding: 12px 10px; color: #10223d; font: inherit; font-size: 13px; font-weight: 790; cursor: pointer; line-height: 1.3; min-height: 44px; transition: transform .15s, filter .15s, box-shadow .15s; overflow-wrap: anywhere; }
.btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(.98); box-shadow: 0 4px 12px #16284419; }
.btn:focus-visible, .quick-links a:focus-visible { outline: 3px solid #83b9ff; outline-offset: 2px; }
.navy { background: #174b82; color: #fff; }
.outline-a { background: #e4f8e8; color: #16853c; border: 1px solid #69ca84; }
.outline-b { background: #e8f1ff; color: #185cd0; border: 1px solid #8eb9ff; }
.selected-server { box-shadow: inset 0 0 0 1px currentColor; }
.action-row { display: grid; gap: 10px; margin-top: 10px; grid-template-columns: 1fr; }
.action-row.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.blue-soft { color: #064ba0; background: #dcecff; }
.danger { background: #d3272e; color: white; }
.scoreboard-preview { display: grid; grid-template-columns: minmax(0, 1fr) minmax(98px, .48fr) minmax(0, 1fr); gap: 14px; align-items: center; margin: 25px 0 26px; }
.score-team { text-align: center; border-radius: 14px; padding: 18px 10px; min-width: 0; }
.score-a { background: #eaf9f0; border-left: 5px solid #20b449; }
.score-b { background: #eaf3ff; border-left: 5px solid #196bf1; }
.team-name { display: block; font-size: 16px; font-weight: 850; overflow-wrap: anywhere; }
.score-team strong { display: block; font-weight: 900; font-size: 46px; line-height: 1.1; margin: 12px 0 8px; font-variant-numeric: tabular-nums; }
.score-team small { font-size: 13px; }
.score-meta { display: flex; flex-direction: column; gap: 7px; align-items: center; text-align: center; min-width: 0; font-size: 12px; color: #475671; overflow-wrap: anywhere; }
.score-meta > strong { font-size: 15px; color: #354862; }
.tiebreak-badge { background: #ffe1dd; color: #bf3330; border-radius: 100px; padding: 5px 9px; font-weight: 850; font-size: 10px; }
.point-controls { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }
.point-controls .btn { font-size: 13px; min-height: 51px; }
.teamA { color: white; background: linear-gradient(180deg, #35bd55, #24a648); }
.teamB { color: white; background: linear-gradient(180deg, #2274f5, #0f59db); }
.dark { color: #fff; background: #33435c; }
.warning { color: #fff; background: linear-gradient(180deg, #ff9200, #ed7900); }
.warning-outline { color: #d56b09; background: #fff7ef; border: 1px solid #ff941f; }
.secondary { background: #ebf0f7; color: #172540; }
.danger-outline { background: #fff0f0; color: #c8222b; border: 1px solid #faadb0; }
.status-box { margin-top: 16px; font-size: 12px; color: #5c6a80; line-height: 1.5; padding: 10px 12px; border-radius: 11px; background: #f6f8fc; }
.quick-links { display: flex; gap: 10px; flex-wrap: wrap; }
.quick-links a { display: inline-flex; align-items: center; justify-content: center; border: 1px solid #bcd5fa; border-radius: 11px; padding: 11px 18px; background: #e9f2ff; color: #1253a9; text-decoration: none; font-weight: 800; font-size: 14px; }
@media (max-width: 1150px) { .layout { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .admin-page { padding: 14px; } .topbar h1 { font-size: 23px; } .team-grid { grid-template-columns: 1fr; } .scoreboard-preview { gap: 8px; grid-template-columns: minmax(0, 1fr) 85px minmax(0, 1fr); } .score-team { padding: 14px 6px; } .score-team strong { font-size: 36px; } .team-name { font-size: 13px; } .point-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 420px) { .panel { padding: 16px; } .stat-pill { min-width: 85px; } .scoreboard-preview { grid-template-columns: 1fr 1fr; } .score-meta { grid-column: 1 / -1; grid-row: 2; } .score-a { grid-column: 1; grid-row: 1; } .score-b { grid-column: 2; grid-row: 1; } .action-row.two { grid-template-columns: 1fr; } }
</style>
