function createVolleyballSportState() {
  return {
    meta: {
      stage: "group",       // group | semi | final
      format: "bo3",        // bo3 | bo5
      setsToWin: 2,
      maxSets: 3
    },
    teams: {
      A: {
        timeouts: 2,
        setsWon: 0,
        points: 0
      },
      B: {
        timeouts: 2,
        setsWon: 0,
        points: 0
      }
    },
    match: {
      currentSet: 1,
      serve: "A",
      status: "live",       // live | finished
      history: [],
      break: {
        active: false,
        team: null,
        startedAt: null,
        durationSec: 30
      }
    },
    alerts: {
      setPoint: null,
      matchPoint: null
    },
    lineups: {
      A: [],
      B: []
    },
    ui: {
      showCard: null,
      showPregame: false,
      venueName: "",
      mvpName: "",
      mvpTeam: "A",
      customTitle: "",
      customSubtitle: ""
    }
  };
}

function deriveFormat(stage) {
  if (stage === "final") {
    return { format: "bo5", setsToWin: 3, maxSets: 5 };
  }

  return { format: "bo3", setsToWin: 2, maxSets: 3 };
}

function applyStage(state, stage) {
  state.meta.stage = stage;

  const fmt = deriveFormat(stage);
  state.meta.format = fmt.format;
  state.meta.setsToWin = fmt.setsToWin;
  state.meta.maxSets = fmt.maxSets;

  state.teams.A.timeouts = state.teams.A.timeouts ?? 2;
  state.teams.B.timeouts = state.teams.B.timeouts ?? 2;

  return state;
}

function setTargetPoints(state) {
  const stage = state?.meta?.stage;
  const setNo = state?.match?.currentSet ?? 1;

  if (stage === "group" || stage === "semi") {
    return setNo === 3 ? 15 : 25;
  }

  if (stage === "final") {
    return setNo === 5 ? 15 : 25;
  }

  return 25;
}

function isSetOver(state, pointsA, pointsB) {
  const target = setTargetPoints(state);
  const maxP = Math.max(pointsA, pointsB);
  const diff = Math.abs(pointsA - pointsB);

  return maxP >= target && diff >= 2;
}

function computePointAlerts(state) {
  state.alerts = { setPoint: null, matchPoint: null };

  if (!state?.teams?.A || !state?.teams?.B) return state;
  if (state?.match?.status !== "live") return state;

  const A = state.teams.A.points ?? 0;
  const B = state.teams.B.points ?? 0;

  const aWinsSetIfScores = isSetOver(state, A + 1, B);
  const bWinsSetIfScores = isSetOver(state, A, B + 1);

  let setPointTeam = null;
  if (aWinsSetIfScores && !bWinsSetIfScores) setPointTeam = "A";
  if (bWinsSetIfScores && !aWinsSetIfScores) setPointTeam = "B";

  state.alerts.setPoint = setPointTeam;

  if (setPointTeam) {
    const setsToWin = state.meta.setsToWin;
    const setsWon = state.teams[setPointTeam].setsWon ?? 0;

    if (setsWon === setsToWin - 1) {
      state.alerts.matchPoint = setPointTeam;
    }
  }

  return state;
}

function finalizeSet(state) {
  const A = state.teams.A.points ?? 0;
  const B = state.teams.B.points ?? 0;
  const setNo = state.match.currentSet;

  const winner = A > B ? "A" : "B";
  state.teams[winner].setsWon += 1;

  state.match.history.push({
    setNo,
    A,
    B,
    winner
  });

  state.teams.A.points = 0;
  state.teams.B.points = 0;

  if (
    state.teams.A.setsWon >= state.meta.setsToWin ||
    state.teams.B.setsWon >= state.meta.setsToWin
  ) {
    state.match.status = "finished";
    state.ui.showCard = "result";
    return state;
  }

  state.match.currentSet += 1;

  if (state.match.currentSet > state.meta.maxSets) {
    state.match.status = "finished";
    state.ui.showCard = "result";
  }

  return state;
}

function updateScore(state) {
  if (state.match.status !== "live") return state;

  const A = state.teams.A.points ?? 0;
  const B = state.teams.B.points ?? 0;

  if (isSetOver(state, A, B)) {
    finalizeSet(state);
  }

  return state;
}

function resetMatch(state, keepTeams = true) {
  const next = createVolleyballSportState();

  if (keepTeams) {
    next.teams.A.name = state.teams.A.name;
    next.teams.B.name = state.teams.B.name;
    next.teams.A.abbr = state.teams.A.abbr || "";
    next.teams.B.abbr = state.teams.B.abbr || "";
    next.teams.A.logoUrl = state.teams.A.logoUrl;
    next.teams.B.logoUrl = state.teams.B.logoUrl;
    next.teams.A.panelBg = state.teams.A.panelBg || "";
    next.teams.B.panelBg = state.teams.B.panelBg || "";
  }

  applyStage(next, state.meta.stage || "group");

  return next;
}

module.exports = {
  createVolleyballSportState,
  applyStage,
  setTargetPoints,
  computePointAlerts,
  updateScore,
  resetMatch
};