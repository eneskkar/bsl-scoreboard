function createTennisSportState() {
  return {
    meta: {
      stage: "group", // group | semi | final
      format: "bo3",  // bo3 | bo5
      setsToWin: 2,
      maxSets: 3
    },
    teams: {
      A: {
        name: "TEAM A",
        abbr: "",
        logoUrl: "",
        panelBg: "",
        setsWon: 0
      },
      B: {
        name: "TEAM B",
        abbr: "",
        logoUrl: "",
        panelBg: "",
        setsWon: 0
      }
    },
    match: {
      currentSet: 1,
      server: "A",
      status: "live",
      history: [], // { setNo, A, B, winner, isTiebreak }
      isTiebreak: false,
      currentSetScore: {
        A: 0,
        B: 0
      }
    },
    alerts: {},
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

  return state;
}

function shouldStartMatchTiebreak(state) {
  const setsToWin = state?.meta?.setsToWin ?? 2;
  const aSets = state?.teams?.A?.setsWon ?? 0;
  const bSets = state?.teams?.B?.setsWon ?? 0;

  if (setsToWin === 2) {
    return aSets === 1 && bSets === 1;
  }

  if (setsToWin === 3) {
    return aSets === 2 && bSets === 2;
  }

  return false;
}

function isTiebreakOver(scoreA, scoreB) {
  const maxP = Math.max(scoreA, scoreB);
  const diff = Math.abs(scoreA - scoreB);

  return maxP >= 10 && diff >= 2;
}

function isRegularSetOver(scoreA, scoreB) {
  const maxP = Math.max(scoreA, scoreB);
  const diff = Math.abs(scoreA - scoreB);

  return maxP >= 6 && diff >= 2;
}

function finalizeCurrentSet(state) {
  const scoreA = state.match.currentSetScore.A ?? 0;
  const scoreB = state.match.currentSetScore.B ?? 0;
  const setNo = state.match.currentSet;

  if (scoreA === scoreB) return state;

  const winner = scoreA > scoreB ? "A" : "B";
  state.teams[winner].setsWon += 1;

  state.match.history.push({
    setNo,
    A: scoreA,
    B: scoreB,
    winner,
    isTiebreak: !!state.match.isTiebreak
  });

  if (
    state.teams.A.setsWon >= state.meta.setsToWin ||
    state.teams.B.setsWon >= state.meta.setsToWin
  ) {
    state.match.status = "finished";
    state.ui.showCard = "result";
    return state;
  }

  state.match.currentSet += 1;
  state.match.currentSetScore = { A: 0, B: 0 };

  state.match.isTiebreak = shouldStartMatchTiebreak(state);

  return state;
}


function addPoint(state, team) {
  if (!state || state.match?.status !== "live") return state;
  if (!["A", "B"].includes(team)) return state;

  const current = state.match.currentSetScore?.[team] ?? 0;
  state.match.currentSetScore[team] = current + 1;

  // Sayıyı alan takım servis alsın
  state.match.server = team;

  const a = state.match.currentSetScore.A ?? 0;
  const b = state.match.currentSetScore.B ?? 0;

  if (state.match.isTiebreak) {
    if (isTiebreakOver(a, b)) {
      finalizeCurrentSet(state);
    }
    return state;
  }

  if (isRegularSetOver(a, b)) {
    finalizeCurrentSet(state);
  }

  return state;
}

function removePoint(state, team) {
  if (!state || state.match?.status !== "live") return state;
  if (!["A", "B"].includes(team)) return state;

  const current = state.match.currentSetScore?.[team] ?? 0;
  state.match.currentSetScore[team] = Math.max(0, current - 1);

  return state;
}

function setServer(state, team) {
  if (!["A", "B"].includes(team)) return state;
  state.match.server = team;
  return state;
}

function resetCurrentSet(state) {
  if (!state) return state;

  state.match.currentSetScore = { A: 0, B: 0 };
  return state;
}

function forceFinishSet(state) {
  if (!state || state.match?.status !== "live") return state;
  return finalizeCurrentSet(state);
}

function resetMatch(state, keepTeams = true) {
  const next = createTennisSportState();

  if (keepTeams) {
    next.teams.A.name = state.teams.A.name;
    next.teams.B.name = state.teams.B.name;
    next.teams.A.abbr = state.teams.A.abbr || "";
    next.teams.B.abbr = state.teams.B.abbr || "";
    next.teams.A.logoUrl = state.teams.A.logoUrl || "";
    next.teams.B.logoUrl = state.teams.B.logoUrl || "";
    next.teams.A.panelBg = state.teams.A.panelBg || "";
    next.teams.B.panelBg = state.teams.B.panelBg || "";
  }

  applyStage(next, state.meta.stage || "group");

  return next;
}

module.exports = {
  createTennisSportState,
  applyStage,
  addPoint,
  removePoint,
  setServer,
  resetCurrentSet,
  forceFinishSet,
  resetMatch
};