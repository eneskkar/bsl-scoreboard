<template>
  <div class="admin-page" v-if="state">
    <header class="topbar">
      <div>
        <h1>BSL Admin Panel</h1>
        <p class="subtitle">Maç yönetimi ve canlı skor kontrolü</p>
      </div>

      <div class="topbar-stats">
        <div class="stat-pill">
          <span>Stage</span>
          <strong>{{ state.meta.stage?.toUpperCase() }}</strong>
        </div>
        <div class="stat-pill">
          <span>Format</span>
          <strong>{{ state.meta.format?.toUpperCase() }}</strong>
        </div>
        <div class="stat-pill">
          <span>Set</span>
          <strong>{{ state.match.currentSet }}</strong>
        </div>
        <div class="stat-pill">
          <span>Serve</span>
          <strong>{{ state.match.serve || "-" }}</strong>
        </div>
        <div class="stat-pill">
          <span>Status</span>
          <strong>{{ state.match.status }}</strong>
        </div>
      </div>
    </header>

    <div class="layout">
      <!-- SOL TARAF -->
      <div class="left-column">
        <section class="panel">
          <div class="panel-head">
            <h2>Maç Ayarları</h2>
          </div>

          <div class="field">
            <label>Match Stage</label>
            <select v-model="stage" @change="setStage(stage)">
              <option value="group">Group</option>
              <option value="semi">Semi</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div class="info-box">
            Şu an: <b>{{ state.meta.format.toUpperCase() }}</b> —
            setsToWin: <b>{{ state.meta.setsToWin }}</b> —
            currentSet: <b>{{ state.match.currentSet }}</b>
            <br />
            5. set olursa hedef <b>15</b>, diğer setler <b>25</b> (+2 fark).
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>Takım Bilgileri</h2>
          </div>

          <div class="team-grid">
            <div class="team-card team-a">
              <h3>Takım A</h3>

              <div class="field">
                <label>Takım Adı</label>
                <input
                  v-model="teamA"
                  @change="updateTeam('A', { name: teamA })"
                  placeholder="Takım A"
                />
              </div>

              <div class="field">
                <label>Logo</label>
                <input type="file" accept="image/*" @change="onPickLogo($event, 'A')" />
              </div>

              <div class="lineup-section">
                <div class="mini-head">
                  <span>Kadro</span>
                  <button class="btn soft" @click="addPlayer('A')">Oyuncu Ekle</button>
                </div>

                <div v-for="(p, index) in lineupA" :key="index" class="player-row">
                  <input v-model="p.number" placeholder="No" class="number-input" />
                  <input v-model="p.name" placeholder="Oyuncu Adı" />
                  <button class="btn icon danger" @click="removePlayer('A', index)">X</button>
                </div>

                <div class="action-row two">
                  <button class="btn secondary" @click="saveLineup('A')">Kaydet</button>
                  <button class="btn teamA" @click="showLineup('A')">Takım A Listele</button>
                </div>
              </div>
            </div>

            <div class="team-card team-b">
              <h3>Takım B</h3>

              <div class="field">
                <label>Takım Adı</label>
                <input
                  v-model="teamB"
                  @change="updateTeam('B', { name: teamB })"
                  placeholder="Takım B"
                />
              </div>

              <div class="field">
                <label>Logo</label>
                <input type="file" accept="image/*" @change="onPickLogo($event, 'B')" />
              </div>

              <div class="lineup-section">
                <div class="mini-head">
                  <span>Kadro</span>
                  <button class="btn soft" @click="addPlayer('B')">Oyuncu Ekle</button>
                </div>

                <div v-for="(p, index) in lineupB" :key="index" class="player-row">
                  <input v-model="p.number" placeholder="No" class="number-input" />
                  <input v-model="p.name" placeholder="Oyuncu Adı" />
                  <button class="btn icon danger" @click="removePlayer('B', index)">X</button>
                </div>

                <div class="action-row two">
                  <button class="btn secondary" @click="saveLineup('B')">Kaydet</button>
                  <button class="btn teamB" @click="showLineup('B')">Takım B Listele</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>Pregame Ekranı</h2>
          </div>

          <div class="field">
            <label>Salon Adı</label>
            <input
              :value="state?.ui?.venueName || ''"
              @input="updateVenue($event.target.value)"
              placeholder=""
            />
          </div>

          <div class="action-row two">
            <button class="btn secondary" @click="togglePregame(true)">Pregame Aç</button>
            <button class="btn danger" @click="togglePregame(false)">Pregame Kapat</button>
          </div>
        </section>
      </div>

      <!-- SAĞ TARAF -->
      <div class="right-column">
        <section class="panel score-panel">
          <div class="panel-head">
            <h2>Canlı Skor Kontrolü</h2>
          </div>

          <div class="scoreboard-preview">
            <div class="score-team score-a">
              <span class="team-name">{{ state.teams.A.name }}</span>
              <strong>{{ state.teams.A.points }}</strong>
              <small>Set: {{ state.teams.A.setsWon }}</small>
            </div>

            <div class="score-meta">
              <span>Set {{ state.match.currentSet }}</span>
              <span>Serve: {{ state.match.serve || "-" }}</span>
            </div>

            <div class="score-team score-b">
              <span class="team-name">{{ state.teams.B.name }}</span>
              <strong>{{ state.teams.B.points }}</strong>
              <small>Set: {{ state.teams.B.setsWon }}</small>
            </div>
          </div>

          <div class="control-grid">
            <div class="control-card">
              <h3>Takım A</h3>
              <div class="btn-stack">
                <div class="action-row two">
                  <button class="btn teamA" @click="score('A', +1)">+1 Puan</button>
                  <button class="btn dark" @click="score('A', -1)">-1 Puan</button>
                </div>
                <div class="action-row two">
                  <button class="btn teamA" @click="sets('A', +1)">Set +</button>
                  <button class="btn dark" @click="sets('A', -1)">Set -</button>
                </div>
                <div class="action-row two">
                  <button class="btn teamA" @click="serve('A')">Servis A</button>
                  <button class="btn dark" @click="timeout('A', -1)">TO -</button>
                </div>
              </div>
            </div>

            <div class="control-card">
              <h3>Takım B</h3>
              <div class="btn-stack">
                <div class="action-row two">
                  <button class="btn teamB" @click="score('B', +1)">+1 Puan</button>
                  <button class="btn dark" @click="score('B', -1)">-1 Puan</button>
                </div>
                <div class="action-row two">
                  <button class="btn teamB" @click="sets('B', +1)">Set +</button>
                  <button class="btn dark" @click="sets('B', -1)">Set -</button>
                </div>
                <div class="action-row two">
                  <button class="btn teamB" @click="serve('B')">Servis B</button>
                  <button class="btn dark" @click="timeout('B', -1)">TO -</button>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-subtitle">Genel Maç Aksiyonları</div>

          <div class="action-row">
            <button class="btn warning" @click="resetSet()">Reset Current Set Points</button>
          </div>

          <div class="action-row two">
            <button class="btn warning" @click="newMatch(true)">New Match (keep teams)</button>
            <button class="btn danger" @click="newMatch(false)">New Match (reset teams)</button>
          </div>

          <div class="action-row two">
            <button class="btn secondary" @click="hideCard">Hide Card</button>
            <button class="btn secondary" @click="showCard('result')">Show Result</button>
          </div>

          <div class="action-row two">
            <button class="btn teamA" @click="startBreak('A')">Breaktime (A)</button>
            <button class="btn teamB" @click="startBreak('B')">Breaktime (B)</button>
          </div>

          <div class="action-row">
            <button class="btn end" @click="endBreak()">Breaktime Bitir</button>
          </div>

          <div class="status-box">
            Durum: <b>{{ state.match.status }}</b> —
            Serve: <b>{{ state.match.serve }}</b> —
            Timeouts: A <b>{{ state.teams.A.timeouts }}</b> / B
            <b>{{ state.teams.B.timeouts }}</b>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>Hızlı Linkler</h2>
          </div>

          <div class="quick-links">
            <a :href="`/overlay/${matchId}`" target="_blank">Overlay</a>
            <a :href="`/admin/${matchId}`" target="_blank">Admin</a>
          </div>
        </section>

        <section class="panel danger-panel">
          <div class="panel-head">
            <h2>Kritik Aksiyon</h2>
          </div>

          <button class="btn danger big" @click="hideCard">Kartı Kapat</button>
        </section>
      </div>
    </div>
  </div>
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
const lineupA = ref([]);
const lineupB = ref([]);

function addPlayer(team) {
  const target = team === "A" ? lineupA : lineupB;
  target.value.push({ number: "", name: "" });
}

function removePlayer(team, index) {
  const target = team === "A" ? lineupA : lineupB;
  target.value.splice(index, 1);
}

function saveLineup(team) {
  const players = team === "A" ? lineupA.value : lineupB.value;
  socket.emit("admin:updateLineup", { matchId, team, players });
}

function showLineup(team) {
  socket.emit("admin:showLineup", { matchId, team });
}

function hideCard() {
  socket.emit("admin:hideCard", { matchId });
}

function startBreak(team) {
  socket.emit("admin:break", { matchId, active: true, team, durationSec: 30 });
}

function endBreak() {
  socket.emit("admin:break", { matchId, active: false, team: null });
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

const onState = (s) => {
  state.value = s;
  stage.value = s.meta.stage;
  teamA.value = s.teams.A.name;
  teamB.value = s.teams.B.name;
  lineupA.value = s.lineups?.A || [];
  lineupB.value = s.lineups?.B || [];
};

onMounted(() => {
  socket.emit("joinMatch", { matchId });
  socket.on("state", onState);
});

onBeforeUnmount(() => {
  socket.off("state", onState);
});

function setStage(v) {
  socket.emit("admin:setStage", { matchId, stage: v });
}

function updateTeam(team, patch) {
  socket.emit("admin:update", {
    matchId,
    patch: { teams: { [team]: patch } }
  });
}

function score(team, delta) {
  socket.emit("admin:score", { matchId, team, delta });
}

function sets(team, delta) {
  socket.emit("admin:sets", { matchId, team, delta });
}

function serve(team) {
  socket.emit("admin:serve", { matchId, team });
}

function timeout(team, delta) {
  socket.emit("admin:timeout", { matchId, team, delta });
}

function resetSet() {
  socket.emit("admin:resetSet", { matchId });
}

function newMatch(keepTeams) {
  socket.emit("admin:newMatch", { matchId, keepTeams });
}

function showCard(card) {
  socket.emit("admin:showCard", { matchId, card });
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
.admin-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f7fb;
  min-height: 100vh;
  color: #111827;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.topbar h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 900;
}

.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.topbar-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-pill {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px 14px;
  min-width: 100px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
}

.stat-pill span {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-pill strong {
  font-size: 14px;
  font-weight: 800;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  align-items: start;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.panel-subtitle {
  margin: 20px 0 10px;
  font-size: 13px;
  font-weight: 800;
  color: #6b7280;
}

.field {
  margin-bottom: 14px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #4b5563;
}

input,
select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #d8dee8;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: 0.15s ease;
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.12);
}

.info-box,
.status-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.team-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.team-card {
  border-radius: 18px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
}

.team-card h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 900;
}

.team-a {
  border-left: 5px solid #f3c544;
}

.team-b {
  border-left: 5px solid #3066e3;
}

.lineup-section {
  margin-top: 12px;
}

.mini-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mini-head span {
  font-size: 13px;
  font-weight: 800;
}

.player-row {
  display: grid;
  grid-template-columns: 84px 1fr 42px;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.number-input {
  text-align: center;
}

.score-panel {
  position: sticky;
  top: 20px;
}

.scoreboard-preview {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.score-team {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.score-team strong {
  display: block;
  font-size: 34px;
  line-height: 1;
  margin: 8px 0;
  font-weight: 900;
}

.team-name {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #374151;
}

.score-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  text-align: center;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.control-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  background: #f8fafc;
}

.control-card h3 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 900;
}

.btn-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 10px;
}

.action-row.two {
  grid-template-columns: 1fr 1fr;
}

.btn {
  height: 42px;
  border: none;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.btn.big {
  height: 48px;
  font-size: 15px;
}

.btn.secondary {
  background: #eef2f7;
  color: #111827;
}

.btn.soft {
  background: #f3f4f6;
  color: #111827;
}

.btn.dark {
  background: #334155;
  color: #fff;
}

.btn.warning {
  background: #d97706;
  color: #fff;
}

.btn.danger {
  background: #c62828;
  color: #fff;
}

.btn.end {
  background: #f97316;
  color: #fff;
}

.btn.teamA {
  background: #f3c544;
  color: #111827;
}

.btn.teamB {
  background: #3066e3;
  color: #fff;
}

.btn.icon {
  padding: 0;
}

.quick-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  background: #eef2f7;
  color: #111827;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 800;
}

.danger-panel {
  border: 1px solid rgba(198, 40, 40, 0.2);
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .score-panel {
    position: static;
  }

  .team-grid,
  .control-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-page {
    padding: 14px;
  }

  .action-row.two {
    grid-template-columns: 1fr;
  }

  .scoreboard-preview {
    grid-template-columns: 1fr;
  }
}
</style>