<template>
  <div class="admin-page" v-if="state">
    <header class="topbar">
      <div>
        <h1>BSL Tenis Admin Paneli</h1>
        <p class="subtitle">Maç yönetimi ve skor kontrolü</p>
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
          <span>Status</span>
          <strong>{{ state.match.status }}</strong>
        </div>
        <div class="stat-pill">
          <span>Tiebreak</span>
          <strong>{{ state.match.isTiebreak ? "AKTİF" : "YOK" }}</strong>
        </div>
      </div>
    </header>

    <div class="layout">
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
            <div><b>Group / Semi:</b> BO3 — 2 set alan kazanır.</div>
            <div><b>Final:</b> BO5 — 3 set alan kazanır.</div>
            <div>
              Skor <b>1-1</b> veya finalde <b>2-2</b> olursa son set yerine
              <b>7 sayılık match tiebreak</b> oynanır.
            </div>
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

              <div class="action-row two">
                <button class="btn teamA" @click="setServer('A')">Servis A</button>
                <button class="btn dark" @click="updateTeam('A', { abbr: teamA.slice(0, 3).toUpperCase() })">
                  Kısa Ad Üret
                </button>
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

              <div class="action-row two">
                <button class="btn teamB" @click="setServer('B')">Servis B</button>
                <button class="btn dark" @click="updateTeam('B', { abbr: teamB.slice(0, 3).toUpperCase() })">
                  Kısa Ad Üret
                </button>
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
              placeholder="Salon adı"
            />
          </div>

          <div class="action-row two">
            <button class="btn secondary" @click="togglePregame(true)">Pregame Aç</button>
            <button class="btn danger" @click="togglePregame(false)">Pregame Kapat</button>
          </div>
        </section>
      </div>

      <div class="right-column">
        <section class="panel score-panel">
          <div class="panel-head">
            <h2>Skor Kontrolü</h2>
          </div>

          <div class="scoreboard-preview">
            <div class="score-team score-a">
              <span class="team-name">{{ state.teams.A.name }}</span>
              <strong>{{ state.match.currentSetScore.A }}</strong>
              <small>Set: {{ state.teams.A.setsWon }}</small>
            </div>

            <div class="score-meta">
              <span>Set {{ state.match.currentSet }}</span>
              <span>Servis: {{ state.match.server || "-" }}</span>
              <span v-if="state.match.isTiebreak" class="tiebreak-badge">TIEBREAK</span>
            </div>

            <div class="score-team score-b">
              <span class="team-name">{{ state.teams.B.name }}</span>
              <strong>{{ state.match.currentSetScore.B }}</strong>
              <small>Set: {{ state.teams.B.setsWon }}</small>
            </div>
          </div>

          <div class="control-grid">
            <div class="control-card">
              <h3>Takım A</h3>

              <div class="btn-stack">
                <div class="action-row two">
                  <button class="btn teamA" @click="point('A', +1)">+1</button>
                  <button class="btn dark" @click="point('A', -1)">-1</button>
                </div>

                <div class="action-row two">
                  <button class="btn teamA" @click="setServer('A')">Servis A</button>
                  <button class="btn soft" disabled>
                    Set: {{ state.teams.A.setsWon }}
                  </button>
                </div>
              </div>
            </div>

            <div class="control-card">
              <h3>Takım B</h3>

              <div class="btn-stack">
                <div class="action-row two">
                  <button class="btn teamB" @click="point('B', +1)">+1</button>
                  <button class="btn dark" @click="point('B', -1)">-1</button>
                </div>

                <div class="action-row two">
                  <button class="btn teamB" @click="setServer('B')">Servis B</button>
                  <button class="btn soft" disabled>
                    Set: {{ state.teams.B.setsWon }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-subtitle">Set / Maç Aksiyonları</div>

          <div class="action-row">
            <button class="btn warning" @click="finishSet()">
              Seti Bitir
            </button>
          </div>

          <div class="action-row two">
            <button class="btn warning" @click="resetSet()">Aktif Seti Sıfırla</button>
            <button class="btn secondary" @click="hideCard()">Kartı Kapat</button>
          </div>

          <div class="action-row two">
            <button class="btn secondary" @click="showCard('result')">Result Göster</button>
            <button class="btn secondary" @click="showCard('none')">Hide Card</button>
          </div>

          <div class="action-row two">
            <button class="btn secondary" @click="newMatch(true)">New Match (keep teams)</button>
            <button class="btn danger" @click="newMatch(false)">New Match (reset teams)</button>
          </div>

          <div class="status-box">
            Durum: <b>{{ state.match.status }}</b>
            —
            Servis: <b>{{ state.match.server }}</b>
            —
            Tiebreak:
            <b>{{ state.match.isTiebreak ? "AKTİF" : "KAPALI" }}</b>
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
      </div>
    </div>
  </div>

  <div v-else class="loading">
    Yükleniyor...
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
.admin-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f7fb;
  min-height: 100vh;
  color: #111827;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0b1220;
  color: white;
  font-size: 22px;
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
  min-width: 110px;
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
  grid-template-columns: 1.05fr 0.95fr;
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
  border-left: 5px solid #3aa655;
}

.team-b {
  border-left: 5px solid #3066e3;
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
  min-width: 90px;
}

.tiebreak-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 900;
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

.btn.teamA {
  background: #3aa655;
  color: #fff;
}

.btn.teamB {
  background: #3066e3;
  color: #fff;
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