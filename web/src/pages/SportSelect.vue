<template>
  <div class="sport-select-page">
    <div class="sport-select-card">
      <img src="/bsl-logo.png" alt="BSL" class="logo" />

      <h1>Maç Türü Seç</h1>
      <p>Yeni maç oluşturmak için branş seç.</p>

      <div class="actions">
        <button class="sport-btn volleyball" @click="createMatch('volleyball')">
          Voleybol
        </button>

        <button class="sport-btn tennis" @click="createMatch('tennis')">
          Tenis
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { socket } from "../socket";

const router = useRouter();

function createMatch(sport) {
  const matchId = `${sport}-${Date.now()}`;

  socket.emit("admin:createMatch", { matchId, sport });

  const onState = () => {
    socket.off("state", onState);
    router.push(`/admin/${matchId}`);
  };

  socket.on("state", onState);
}
</script>

<style scoped>
.sport-select-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0b1220;
  padding: 24px;
}

.sport-select-card {
  width: 100%;
  max-width: 520px;
  background: #121a2b;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  color: #fff;
}

.logo {
  width: 90px;
  margin-bottom: 18px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.sport-btn {
  border: 0;
  border-radius: 14px;
  padding: 18px 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  color: white;
}

.volleyball {
  background: linear-gradient(135deg, #1f5fbf 0%, #0b2a5a 100%);
}

.tennis {
  background: linear-gradient(135deg, #1f9d55 0%, #14532d 100%);
}
</style>