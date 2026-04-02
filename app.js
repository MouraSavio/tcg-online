const socket = io();

let myRole = null;
let serverMatchState = null;
let selectedDeck = null;
let errorToastTimeout = null;

const remoteSelections = {
  p1: null,
  p2: null
};

let currentPA1 = 0;
let currentPA2 = 0;
let currentMythicHP1 = 500;
let currentMythicHP2 = 500;

const roomId = window.location.search.replace("?room=", "") || "default";

const PHASES = [
  { code: "IT", label: "IT" },
  { code: "FC", label: "FC" },
  { code: "F1", label: "F1" },
  { code: "FB", label: "FB" },
  { code: "F2", label: "F2" },
  { code: "FT", label: "FT" }
];

const FIELD_LAYOUT = [
  ["mythic", "creature1", "creature2", "creature3", "field", "trapDeckPile"],
  ["discardPile", "magic1", "magic2", "magic3", "magic4", "deckPile"]
];

const ZONE_LABELS = {
  mythic: "Fera",
  creature1: "Criatura",
  creature2: "Criatura",
  creature3: "Criatura",
  field: "Campo",
  magic1: "Magia",
  magic2: "Magia",
  magic3: "Magia",
  magic4: "Magia",
  deckPile: "Deck",
  trapDeckPile: "Deck Armadilha",
  discardPile: "Descarte",
  hand: "Mão"
};

const PILE_CONTAINERS = ["deckPile", "trapDeckPile", "discardPile"];

const ZONE_CHOICE_TARGETS = [
  { playerKey: "self", zone: "mythic" },
  { playerKey: "self", zone: "creature1" },
  { playerKey: "self", zone: "creature2" },
  { playerKey: "self", zone: "creature3" },
  { playerKey: "self", zone: "field" },
  { playerKey: "self", zone: "magic1" },
  { playerKey: "self", zone: "magic2" },
  { playerKey: "self", zone: "magic3" },
  { playerKey: "self", zone: "magic4" },
  { playerKey: "self", zone: "discardPile" },
  { playerKey: "self", zone: "deckPile" },
  { playerKey: "self", zone: "trapDeckPile" },
  { playerKey: "opponent", zone: "mythic" },
  { playerKey: "opponent", zone: "creature1" },
  { playerKey: "opponent", zone: "creature2" },
  { playerKey: "opponent", zone: "creature3" },
  { playerKey: "opponent", zone: "field" },
  { playerKey: "opponent", zone: "magic1" },
  { playerKey: "opponent", zone: "magic2" },
  { playerKey: "opponent", zone: "magic3" },
  { playerKey: "opponent", zone: "magic4" },
  { playerKey: "opponent", zone: "discardPile" },
  { playerKey: "opponent", zone: "deckPile" },
  { playerKey: "opponent", zone: "trapDeckPile" }
];

const DECKS = {
  fogo: {
    displayName: "Deck de Fogo",
    mythic: "ignil-imperador-chamas",
    creatures: [
      "espirito-fogo",
      "espirito-fogo",
      "salamandra-ardente",
      "salamandra-ardente",
      "thorn-andarilho",
      "thorn-andarilho",
      "fenix-centelha",
      "fenix-ascendente",
      "fenix-primordial",
      "thorn-avatar-fenix",
      "wyvern-fogo",
      "pequeno-kongar",
      "kongar-destruidor",
      "kongar-devastador"
    ],
    spells: [
      "baforada-ignea",
      "ciclo-do-renascimento",
      "combustao-ignea",
      "compra-graciosa",
      "espada-fenix-sagrada",
      "fornalha-ignea",
      "lupa-milagrosa",
      "pesquisa-arcana",
      "pocao-mana",
      "pote-ambicao",
      "pote-gula",
      "quebra-feitico",
      "reino-chamas-igneas",
      "renascimento-sagrado",
      "ruyi-jingu-bang",
      "sede-poder"
    ],
    traps: [
      "renascimento-primordial",
      "buraco-armadilha",
      "chamado-cova",
      "contragolpe",
      "julgamento-divino",
      "ofensiva-quebrada",
      "peso-dobrado",
      "reversao-espelho",
      "selamento-feitico",
      "selamento-trapaca"
    ]
  },

  agua: {
    displayName: "Deck de Água",
    mythic: "thalassor-mare-eterna",
    creatures: [
      "coruja-veu-onirica",
      "coruja-veu-onirica",
      "eidralis-baleia-onirica",
      "flufy-grande-raposa-onirica",
      "flufy-grande-raposa-onirica",
      "flufy-raposa-onirica",
      "flufy-raposa-onirica",
      "kon-guarda-onirica",
      "kon-sentinela-onirica",
      "kon-urso-onirica",
      "primple-cavaleiro",
      "primple-cavaleiro",
      "primple-mago",
      "primple-mago",
      "primple-sonhador",
      "primple-sonhador",
      "primple-rei-sonhar"
    ],
    spells: [
      "ascensao-rei",
      "decreto-real-primple",
      "encorajamento-primple",
      "lupa-milagrosa",
      "oceano-primordial",
      "pesquisa-arcana",
      "pocao-mana",
      "pote-gula",
      "quebra-feitico",
      "rajada-primple",
      "reino-sonhos-encantados",
      "renascimento-sagrado",
      "sede-poder"
    ],
    traps: [
      "buraco-armadilha",
      "chamado-cova",
      "contragolpe",
      "julgamento-divino",
      "ascensao-onirica",
      "prisao-sonhos",
      "reversao-espelho",
      "selamento-feitico",
      "selamento-trapaca",
      "ofensiva-quebrada"
    ]
  },

  ferragon: {
    displayName: "Deck Ferragon",
    mythic: "terrakhor-soberano",
    creatures: [
      "draco-rex-duas-cabeças",
      "draco-rex-duas-cabeças",
      "e1-ferralite",
      "e2-ferradon",
      "e3-ferragron",
      "hipnodon",
      "hipnodon",
      "rex",
      "rex",
      "rex-ataque",
      "rex-defesa",
      "rinagron",
      "rinagron",
      "rinodon",
      "rinodon"
    ],
    spells: [
      "armadura-nucleo-aço",
      "bencao-milagrosa",
      "compra-graciosa",
      "evolucao-forcada",
      "lupa-milagrosa",
      "pesquisa-arcana",
      "pisoteio-mortal",
      "pocao-mana",
      "pote-ambicao",
      "pote-gula",
      "quebra-feitico",
      "renascimento-sagrado",
      "retorno-fluxo-arcano",
      "sede-poder",
      "terra-sagrada"
    ],
    traps: [
      "aprisionamento-eterno",
      "chamado-cova",
      "contragolpe",
      "defesa-impenetravel",
      "encerramento-forcado",
      "julgamento-divino",
      "ofensiva-quebrada",
      "rajada-mortal",
      "reversao-espelho",
      "união-evolucao"
    ]
  },

  "cassino-goblin": {
    displayName: "Deck Cassino Goblin",
    mythic: "terrakhor-soberano",
    creatures: [
      "brutong-ogro-cassino",
      "duende-cassino",
      "duende-cassino",
      "durgan-contador-cassino",
      "fada-fortuna-cassino",
      "goblin-cassino",
      "goblin-cassino",
      "rato-cassino",
      "rato-cassino",
      "taigar-cobrador-cassino",
      "velkrin-magnata-cassino",
      "vurkal-rei-cassino"
    ],
    spells: [
      "claw-win",
      "grande-cassino-goblin",
      "jackpot-machine",
      "jackpot-royal-flush",
      "jackpot-triple-six",
      "maquina-caca-niquel-goblin",
      "mesa-fortuna",
      "pocao-mana",
      "pote-gula",
      "quebra-feitico",
      "retorno-fluxo-arcano",
      "roleta-azar",
      "roleta-fortuna",
      "sede-poder",
      "terra-sagrada",
      "pote-ambicao",
      "renascimento-sagrado",
      "compra-graciosa"
    ],
    traps: [
      "casa-sempre-ganha",
      "cobranca-tigre",
      "deu-zebra",
      "expulsao-ogro",
      "julgamento-divino",
      "servindo-casa",
      "trapaca-dados",
      "trapaca-duendes",
      "trapaca-moeda",
      "ultimas-consequencias"
    ]
  }
};

const state = {
  currentPhase: "IT",
  selectedCardId: null,
  attackMode: null,
  openMenu: null,
  pileViewer: null,
  privatePiles: {
    p1: {
      deckPile: [],
      trapDeckPile: []
    },
    p2: {
      deckPile: [],
      trapDeckPile: []
    }
  },
  players: {
    p1: createEmptyPlayer(),
    p2: createEmptyPlayer()
  }
};

function createEmptyPlayer() {
  return {
    hand: [],
    deckPile: [],
    trapDeckPile: [],
    discardPile: [],
    mythic: [],
    creature1: [],
    creature2: [],
    creature3: [],
    field: [],
    magic1: [],
    magic2: [],
    magic3: [],
    magic4: []
  };
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makePath(deckKey, folder, cardName) {
  return `decks/deck-${deckKey}/${folder}/${cardName}.png`;
}

function getOpponentRole(role) {
  return role === "p1" ? "p2" : "p1";
}

function uiZoneToServerZone(zoneKey) {
  if (zoneKey === "deckPile") return "mainDeck";
  if (zoneKey === "trapDeckPile") return "trapDeck";
  return zoneKey;
}

function serverZoneToUiZone(zoneKey) {
  if (zoneKey === "mainDeck") return "deckPile";
  if (zoneKey === "trapDeck") return "trapDeckPile";
  return zoneKey;
}

function isDeckLikeZone(zoneKey) {
  return zoneKey === "deckPile" || zoneKey === "trapDeckPile";
}

function getDisplayPlayerKey(targetPlayerKey) {
  if (targetPlayerKey === "self") return myRole;
  if (targetPlayerKey === "opponent") return getOpponentRole(myRole);
  return targetPlayerKey;
}

function getTopVisualRole() {
  if (!myRole) return "p2";
  return getOpponentRole(myRole);
}

function getBottomVisualRole() {
  if (!myRole) return "p1";
  return myRole;
}

function getHandElementIdForVisualRole(playerKey) {
  return playerKey === getTopVisualRole() ? "p2-hand" : "p1-hand";
}

function getFieldElementIdForVisualRole(playerKey) {
  return playerKey === getTopVisualRole() ? "p2-field" : "p1-field";
}

function hydrateServerCard(card, ownerRole) {
  if (!card) return null;

  let folder = "";

  if (card.type === "creature") folder = "criaturas";
  else if (card.type === "spell") folder = "magias";
  else if (card.type === "trap") folder = "armadilhas";
  else if (card.type === "mythic") folder = "fera-mitica";

  return {
    id: card.id,
    name: card.name,
    image: folder ? makePath(card.deckKey, folder, card.name) : "",
    type: card.type,
    owner: ownerRole,
    originalOwner: card.ownerRole || ownerRole,
    faceDown: !!card.faceDown,
    rotated: !!card.rotated
  };
}

function hydrateServerCards(cards, ownerRole) {
  return (cards || []).map((card) => hydrateServerCard(card, ownerRole)).filter(Boolean);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  closeContextMenu();
}

function goToDeck() {
  renderDeckButtons();
  showScreen("deckScreen");
}

function goHome() {
  clearAttackArrow();
  closeContextMenu();
  closePileViewer();
  closeCardPreview();
  closeDeckPreview();
  showScreen("homeScreen");
}

function getDeckIcon(deckKey) {
  const icons = {
    fogo: "🔥",
    agua: "💧",
    ferragon: "⚙️",
    goblin: "🎰",
    vento: "🌪️"
  };

  return icons[deckKey] || "🃏";
}

function renderDeckButtons() {
  const container = document.getElementById("deckButtons");
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  container.style.gap = "14px";

  Object.entries(DECKS).forEach(([deckKey, deckData]) => {
    const card = document.createElement("div");
    card.style.background = "#1e1e1e";
    card.style.border = "1px solid #444";
    card.style.borderRadius = "12px";
    card.style.padding = "12px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";

    const title = document.createElement("h3");
    title.textContent = deckData.displayName;
    title.style.marginBottom = "10px";

    const selectBtn = document.createElement("button");
    selectBtn.textContent = "Selecionar";
    selectBtn.style.marginRight = "6px";
    selectBtn.onclick = () => selectDeck(deckKey);

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "Ver Lista";
    viewBtn.onclick = () => openDeckPreview(deckKey);

    card.appendChild(title);
    card.appendChild(selectBtn);
    card.appendChild(viewBtn);

    container.appendChild(card);
  });
}

function getDeckPreviewImage(deckKey, cardName, type) {
  let folder = "";

  if (type === "mythic") folder = "fera-mitica";
  else if (type === "creature") folder = "criaturas";
  else if (type === "spell") folder = "magias";
  else if (type === "trap") folder = "armadilhas";

  return makePath(deckKey, folder, cardName);
}

function buildDeckPreviewCardData(deckKey, cardName, type) {
  return {
    id: `preview-${deckKey}-${type}-${cardName}`,
    name: cardName,
    image: getDeckPreviewImage(deckKey, cardName, type),
    type,
    owner: "preview",
    originalOwner: "preview",
    faceDown: false,
    rotated: false
  };
}

function buildDeckPreviewSection(title, cards, deckKey, type) {
  const section = document.createElement("div");
  section.className = "deck-preview-section";

  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "deck-preview-grid";

  cards.forEach((cardName) => {
    const cardData = buildDeckPreviewCardData(deckKey, cardName, type);

    const cardEl = document.createElement("div");
    cardEl.className = "deck-preview-card";
    cardEl.style.cursor = "pointer";
    cardEl.tabIndex = 0;

    const thumb = document.createElement("div");
    thumb.className = "deck-preview-thumb";

    const img = document.createElement("img");
    img.src = cardData.image;
    img.alt = cardName;
    img.draggable = false;

    img.onerror = () => {
      thumb.innerHTML = "";
      thumb.appendChild(createPlaceholder(cardName));
    };

    thumb.appendChild(img);

    const name = document.createElement("div");
    name.className = "deck-preview-name";
    name.textContent = formatCardName(cardName);

  const openPreview = () => openCardPreview(cardData, false);

    cardEl.addEventListener("click", openPreview);
    cardEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview();
      }
    });

    cardEl.appendChild(thumb);
    cardEl.appendChild(name);
    grid.appendChild(cardEl);
  });

  section.appendChild(grid);
  return section;
}

function openDeckPreview(deckKey) {
  const deck = DECKS[deckKey];
  if (!deck) {
    alert("Deck não encontrado.");
    return;
  }

  const modal = document.getElementById("deckPreviewModal");
  const title = document.getElementById("deckPreviewTitle");
  const body = document.getElementById("deckPreviewBody");

  if (!modal || !title || !body) {
    alert("Modal de preview do deck não encontrado.");
    return;
  }

  title.textContent = deck.displayName;
  body.innerHTML = "";

  body.appendChild(
    buildDeckPreviewSection("Fera Mítica", [deck.mythic], deckKey, "mythic")
  );

  body.appendChild(
    buildDeckPreviewSection("Criaturas", deck.creatures || [], deckKey, "creature")
  );

  body.appendChild(
    buildDeckPreviewSection("Magias", deck.spells || [], deckKey, "spell")
  );

  body.appendChild(
    buildDeckPreviewSection("Armadilhas", deck.traps || [], deckKey, "trap")
  );

  modal.style.display = "block";
}

function closeDeckPreview() {
  const modal = document.getElementById("deckPreviewModal");
  if (modal) modal.style.display = "none";
}

function closeDeckPreviewOnOverlay(event) {
  if (event.target.id === "deckPreviewModal") {
    closeDeckPreview();
  }
}

function selectDeck(deck) {
  selectedDeck = deck;

  const label = document.getElementById("selectedDeckLabel");
  if (!label) return;

  const deckData = DECKS[deck];

  if (deckData) {
    label.textContent = "Selecionado: " + deckData.displayName;
  } else {
    label.textContent = "Deck não configurado";
  }

  socket.emit("selectDeck", { roomId, deck });
}

function sendTestAction() {
  socket.emit("testAction", {
    roomId,
    message: `Teste enviado por ${myRole || "jogador"}`
  });

  console.log("Você enviou uma ação de teste.");
}

function startGame() {
  if (!selectedDeck) {
    alert("Escolha um deck primeiro!");
    return;
  }

  socket.emit("playerReady", { roomId });
  console.log("Você marcou como pronto.");
}

function startSynchronizedGame(decks, matchState) {
  const myDeck = decks[myRole];

  if (!myDeck) {
    alert("Seu deck não foi encontrado para iniciar a partida.");
    return;
  }

  selectedDeck = myDeck;
  serverMatchState = matchState || null;

  state.players.p1 = createEmptyPlayer();
  state.players.p2 = createEmptyPlayer();
  state.privatePiles.p1.deckPile = [];
  state.privatePiles.p1.trapDeckPile = [];
  state.privatePiles.p2.deckPile = [];
  state.privatePiles.p2.trapDeckPile = [];
  state.selectedCardId = null;
  state.attackMode = null;
  state.currentPhase = "IT";
  state.pileViewer = null;
  remoteSelections.p1 = null;
  remoteSelections.p2 = null;

  closeContextMenu();
  closeCardPreview();
  clearAttackArrow();

  applyServerStateToUI();
  renderBoard();
  showScreen("boardScreen");
}

function applyServerStateToUI() {
  if (!serverMatchState) return;

  state.currentPhase = serverMatchState.currentPhase || "IT";

  if (state.currentPhase !== "FB") {
    state.attackMode = null;
    clearAttackArrow();
  }

  currentMythicHP1 = serverMatchState.players.p1.hp;
  currentMythicHP2 = serverMatchState.players.p2.hp;
  currentPA1 = serverMatchState.players.p1.pa;
  currentPA2 = serverMatchState.players.p2.pa;

  updateMythicHPDisplay();
  updatePADisplay();

  syncDeckPileCount("p1", serverMatchState.players.p1.mainDeckCount);
  syncDeckPileCount("p2", serverMatchState.players.p2.mainDeckCount);

  syncTrapDeckPileCount("p1", serverMatchState.players.p1.trapDeckCount);
  syncTrapDeckPileCount("p2", serverMatchState.players.p2.trapDeckCount);

  state.players.p1.mythic = hydrateServerCards(serverMatchState.players.p1.mythic, "p1");
  state.players.p1.creature1 = hydrateServerCards(serverMatchState.players.p1.creature1, "p1");
  state.players.p1.creature2 = hydrateServerCards(serverMatchState.players.p1.creature2, "p1");
  state.players.p1.creature3 = hydrateServerCards(serverMatchState.players.p1.creature3, "p1");
  state.players.p1.field = hydrateServerCards(serverMatchState.players.p1.field, "p1");
  state.players.p1.magic1 = hydrateServerCards(serverMatchState.players.p1.magic1, "p1");
  state.players.p1.magic2 = hydrateServerCards(serverMatchState.players.p1.magic2, "p1");
  state.players.p1.magic3 = hydrateServerCards(serverMatchState.players.p1.magic3, "p1");
  state.players.p1.magic4 = hydrateServerCards(serverMatchState.players.p1.magic4, "p1");
  state.players.p1.discardPile = hydrateServerCards(serverMatchState.players.p1.discardPile, "p1");

  state.players.p2.mythic = hydrateServerCards(serverMatchState.players.p2.mythic, "p2");
  state.players.p2.creature1 = hydrateServerCards(serverMatchState.players.p2.creature1, "p2");
  state.players.p2.creature2 = hydrateServerCards(serverMatchState.players.p2.creature2, "p2");
  state.players.p2.creature3 = hydrateServerCards(serverMatchState.players.p2.creature3, "p2");
  state.players.p2.field = hydrateServerCards(serverMatchState.players.p2.field, "p2");
  state.players.p2.magic1 = hydrateServerCards(serverMatchState.players.p2.magic1, "p2");
  state.players.p2.magic2 = hydrateServerCards(serverMatchState.players.p2.magic2, "p2");
  state.players.p2.magic3 = hydrateServerCards(serverMatchState.players.p2.magic3, "p2");
  state.players.p2.magic4 = hydrateServerCards(serverMatchState.players.p2.magic4, "p2");
  state.players.p2.discardPile = hydrateServerCards(serverMatchState.players.p2.discardPile, "p2");

  syncOpponentHandVisual();
  refreshOpenPrivatePileIfNeeded();
  renderBoard();
}

function makePlaceholderPileCards(count, type, owner) {
  const cards = [];

  for (let i = 0; i < count; i++) {
    cards.push({
      id: `${owner}-${type}-${i}`,
      name: `${type}-${i}`,
      image: "",
      type,
      owner,
      originalOwner: owner,
      faceDown: true,
      rotated: false
    });
  }

  return cards;
}

function syncDeckPileCount(playerKey, count) {
  state.players[playerKey].deckPile = makePlaceholderPileCards(count, "deck", playerKey);
}

function syncTrapDeckPileCount(playerKey, count) {
  state.players[playerKey].trapDeckPile = makePlaceholderPileCards(count, "trapDeck", playerKey);
}

function makeOpponentHandCards(count, ownerRole) {
  const cards = [];

  for (let i = 0; i < count; i++) {
    cards.push({
      id: `${ownerRole}-hidden-hand-${i}`,
      name: "Carta Oculta",
      image: "",
      type: "hidden",
      owner: ownerRole,
      originalOwner: ownerRole,
      faceDown: true,
      rotated: false
    });
  }

  return cards;
}

function syncOpponentHandVisual() {
  if (!myRole || !serverMatchState) return;

  const opponentRole = getOpponentRole(myRole);
  const opponentHandCount = serverMatchState.players[opponentRole].handCount || 0;
  state.players[opponentRole].hand = makeOpponentHandCards(opponentHandCount, opponentRole);
}

function updatePerspectiveLabels() {
  const handWraps = document.querySelectorAll(".hand-wrap");
  if (handWraps.length < 2) return;

  const topRole = getTopVisualRole();
  const bottomRole = getBottomVisualRole();

  const topTitle = handWraps[0].querySelector(".hand-header span");
  const topButton = handWraps[0].querySelector(".hand-header button");

  const bottomTitle = handWraps[1].querySelector(".hand-header span");
  const bottomButton = handWraps[1].querySelector(".hand-header button");

  if (topTitle) topTitle.textContent = "Mão do Oponente";
  if (bottomTitle) bottomTitle.textContent = "Sua Mão";

  if (topButton) {
    topButton.onclick = () => shuffleHand(topRole);
  }

  if (bottomButton) {
    bottomButton.onclick = () => shuffleHand(bottomRole);
  }
}

function openRules() {
  const modal = document.getElementById("rulesModal");
  if (modal) modal.style.display = "block";
}

function closeRules() {
  const modal = document.getElementById("rulesModal");
  if (modal) modal.style.display = "none";
}

function closeRulesOnOverlay(event) {
  if (event.target.id === "rulesModal") closeRules();
}

function openProfile() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.style.display = "block";

  const savedName = localStorage.getItem("tcgProfileName") || "";
  const input = document.getElementById("profileNameInput");
  if (input) input.value = savedName;
}

function closeProfile() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.style.display = "none";
}

function closeProfileOnOverlay(event) {
  if (event.target.id === "profileModal") closeProfile();
}

function saveProfile() {
  const input = document.getElementById("profileNameInput");
  if (!input) return;

  const value = input.value.trim();
  localStorage.setItem("tcgProfileName", value);
  closeProfile();
}

function closeCardPreview() {
  const modal = document.getElementById("cardPreviewModal");
  if (modal) modal.style.display = "none";
}

function closeCardPreviewOnOverlay(event) {
  const previewArea = document.getElementById("previewCardArea");
  if (!previewArea) return;

  if (!previewArea.contains(event.target)) {
    closeCardPreview();
  }
}

function updateMythicHPDisplay() {
  const el1 = document.getElementById("mythicHp1");
  const el2 = document.getElementById("mythicHp2");

  if (el1) el1.textContent = currentMythicHP1;
  if (el2) el2.textContent = currentMythicHP2;
}

function changeMythicHP(player, operation) {
  const input = document.getElementById(player === 1 ? "hpChange1" : "hpChange2");
  if (!input) return;

  let value = parseInt(input.value, 10);
  if (isNaN(value) || value < 0) value = 0;

  socket.emit("changeMythicHP", {
    roomId,
    targetPlayer: player === 1 ? "p1" : "p2",
    operation,
    amount: value
  });
}

function updatePADisplay() {
  const el1 = document.getElementById("paValue1");
  const el2 = document.getElementById("paValue2");

  if (el1) el1.textContent = currentPA1;
  if (el2) el2.textContent = currentPA2;
}

function changePA(player, amount) {
  socket.emit("changePA", {
    roomId,
    targetPlayer: player === 1 ? "p1" : "p2",
    amount
  });
}

function applyTurnGain(player) {
  const gainInput = document.getElementById(player === 1 ? "turnGain1" : "turnGain2");
  if (!gainInput) return;

  let gain = parseInt(gainInput.value, 10);
  if (isNaN(gain) || gain < 0) gain = 0;

  socket.emit("changePA", {
    roomId,
    targetPlayer: player === 1 ? "p1" : "p2",
    amount: gain
  });
}

function animateResultBox(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.classList.remove("animating");
  void el.offsetWidth;
  el.classList.add("animating");
}

function rollDice() {
  socket.emit("rollDice", { roomId });
}

function flipCoin() {
  socket.emit("flipCoin", { roomId });
}

function renderBoard() {
  updatePerspectiveLabels();
  renderPhaseButtons();

  const topRole = getTopVisualRole();
  const bottomRole = getBottomVisualRole();

  renderFieldInElement(getFieldElementIdForVisualRole(topRole), topRole);
  renderFieldInElement(getFieldElementIdForVisualRole(bottomRole), bottomRole);

  renderHandInElement(getHandElementIdForVisualRole(topRole), topRole);
  renderHandInElement(getHandElementIdForVisualRole(bottomRole), bottomRole);

  renderBattleStatus();
  renderSidePreview();
  renderPileViewerIfOpen();
}

function renderPhaseButtons() {
  const container = document.getElementById("phaseButtons");
  if (!container) return;

  container.innerHTML = "";

  const currentTurn = serverMatchState?.currentTurn || "p1";
  const isMyTurn = myRole === currentTurn;

  PHASES.forEach((phase) => {
    const btn = document.createElement("button");
    btn.className = "phase-btn" + (state.currentPhase === phase.code ? " active" : "");
    btn.textContent = phase.label;

    if (!isMyTurn) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }

    btn.onclick = () => setPhase(phase.code);
    container.appendChild(btn);
  });
}

function setPhase(code) {
  if (!roomId) return;

  socket.emit("advancePhase", {
    roomId,
    targetPhase: code
  });
}

function renderBattleStatus() {
  const status = document.getElementById("battleStatus");
  if (!status) return;

  status.textContent = state.attackMode ? "Selecione a zona alvo do ataque." : "";
}

function renderFieldInElement(fieldElementId, playerKey) {
  const fieldEl = document.getElementById(fieldElementId);
  if (!fieldEl) return;

  fieldEl.innerHTML = "";

  FIELD_LAYOUT.flat().forEach((containerKey) => {
    const zoneEl = document.createElement("div");
    zoneEl.className = "zone";
    zoneEl.id = `zone-${playerKey}-${containerKey}`;
    zoneEl.dataset.player = playerKey;
    zoneEl.dataset.container = containerKey;

    const label = document.createElement("div");
    label.className = "zone-label";
    label.textContent = ZONE_LABELS[containerKey];
    zoneEl.appendChild(label);

    setupDropTarget(zoneEl, playerKey, containerKey);

    if (PILE_CONTAINERS.includes(containerKey)) {
      renderPile(zoneEl, playerKey, containerKey);
    } else {
      renderVisibleZone(zoneEl, playerKey, containerKey);

      zoneEl.addEventListener("click", () => {
        if (state.attackMode) resolveAttack(playerKey, containerKey);
      });
    }

    fieldEl.appendChild(zoneEl);
  });
}

function renderPile(zoneEl, playerKey, containerKey) {
  const pile = state.players[playerKey][containerKey];

  const pileEl = document.createElement("div");
  pileEl.className = "pile";
  pileEl.onclick = (event) => {
    event.stopPropagation();
    openPileMenu(event.clientX, event.clientY, playerKey, containerKey);
  };

  const title = document.createElement("div");
  title.className = "pile-title";
  title.textContent = ZONE_LABELS[containerKey];

  const count = document.createElement("div");
  count.className = "pile-count";
  count.textContent = pile.length;

  pileEl.appendChild(title);
  pileEl.appendChild(count);
  zoneEl.appendChild(pileEl);
}

function renderVisibleZone(zoneEl, playerKey, containerKey) {
  const cards = state.players[playerKey][containerKey];
  if (!cards.length) return;

  const topCard = cards[cards.length - 1];
  const cardEl = createCardElement(topCard, playerKey, containerKey);
  zoneEl.appendChild(cardEl);

  if (cards.length > 1) {
    const countBadge = document.createElement("div");
    countBadge.className = "card-stack-count";
    countBadge.textContent = cards.length;
    zoneEl.appendChild(countBadge);
  }
}

function renderHandInElement(handElementId, playerKey) {
  const handEl = document.getElementById(handElementId);
  if (!handEl) return;

  handEl.innerHTML = "";
  handEl.dataset.player = playerKey;
  handEl.dataset.container = "hand";

  setupDropTarget(handEl, playerKey, "hand");

  const cards = state.players[playerKey].hand;
  cards.forEach((card) => {
    handEl.appendChild(createCardElement(card, playerKey, "hand"));
  });
}

function createCardElement(card, playerKey, containerKey, options = {}) {
  const hidden = options.forceFaceUp ? false : isCardHidden(card, playerKey, containerKey);

  const cardEl = document.createElement("div");
  cardEl.className = "card";

  if (state.selectedCardId === card.id) {
    cardEl.classList.add("selected");
  }

  if (remoteSelections[playerKey] === card.id && playerKey !== myRole) {
    cardEl.classList.add("selected");
  }

  if (card.rotated) {
    cardEl.classList.add("rotated");
  }

  cardEl.id = `card-${card.id}`;

  const canDrag =
    options.canDragOverride !== undefined
      ? options.canDragOverride
      : playerKey === myRole;

  cardEl.draggable = canDrag && !hidden;

  cardEl.dataset.cardId = card.id;
  cardEl.dataset.player = playerKey;
  cardEl.dataset.container = containerKey;

  cardEl.addEventListener("dragstart", (event) => {
    event.stopPropagation();
    closeContextMenu();

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        cardId: card.id,
        playerKey,
        containerKey
      })
    );
  });

  cardEl.addEventListener("click", (event) => {
    event.stopPropagation();

    if (state.attackMode && containerKey !== "hand") {
      resolveAttack(playerKey, containerKey);
      return;
    }

    selectCard(card.id);
  });

  cardEl.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openCardMenu(event.clientX, event.clientY, card.id, playerKey, containerKey);
  });

  if (hidden) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.textContent = "TCG";
    cardEl.appendChild(back);
  } else {
    const img = document.createElement("img");
    img.className = "card-image";
    img.src = card.image;
    img.alt = card.name;
    img.draggable = false;

    img.onerror = () => {
      img.replaceWith(createPlaceholder(card.name));
    };

    cardEl.appendChild(img);
  }

  return cardEl;
}

function createPlaceholder(name) {
  const placeholder = document.createElement("div");
  placeholder.className = "card-placeholder";
  placeholder.textContent = formatCardName(name);
  return placeholder;
}

function formatCardName(name) {
  return name.replaceAll("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function isCardHidden(card, playerKey, containerKey) {
  if (card.faceDown) return true;
  if (containerKey === "hand" && playerKey !== myRole) return true;
  return false;
}

function selectCard(cardId) {
  state.selectedCardId = state.selectedCardId === cardId ? null : cardId;

  socket.emit("selectCardSync", {
    roomId,
    cardId: state.selectedCardId
  });

  renderBoard();
}

function getSelectedCardRef() {
  if (!state.selectedCardId) return null;

  for (const playerKey of ["p1", "p2"]) {
    const player = state.players[playerKey];

    for (const containerKey of Object.keys(player)) {
      const found = player[containerKey].find((card) => card.id === state.selectedCardId);
      if (found) {
        return { card: found, playerKey, containerKey };
      }
    }

    for (const privateZoneKey of ["deckPile", "trapDeckPile"]) {
      const privateFound = (state.privatePiles[playerKey]?.[privateZoneKey] || []).find(
        (card) => card.id === state.selectedCardId
      );

      if (privateFound) {
        return { card: privateFound, playerKey, containerKey: privateZoneKey };
      }
    }
  }

  return null;
}

function renderSidePreview() {
  const area = document.getElementById("sidePreviewCard");
  if (!area) return;

  area.innerHTML = "";

  const ref = getSelectedCardRef();

  if (!ref) {
    area.innerHTML = '<div class="side-preview-empty">Clique em uma carta</div>';
    return;
  }

  const forceFaceUp = ref.playerKey === myRole && isDeckLikeZone(ref.containerKey);
  const hidden = forceFaceUp ? false : isCardHidden(ref.card, ref.playerKey, ref.containerKey);

  const previewCard = document.createElement("div");
  previewCard.className = "card";
  previewCard.style.width = "100%";
  previewCard.style.height = "100%";
  previewCard.style.borderColor = "#4da3ff";

  if (hidden) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.textContent = "TCG";
    previewCard.appendChild(back);
  } else {
    const img = document.createElement("img");
    img.className = "card-image";
    img.src = ref.card.image;
    img.alt = ref.card.name;

    img.onerror = () => {
      img.replaceWith(createPlaceholder(ref.card.name));
    };

    previewCard.appendChild(img);
  }

  area.appendChild(previewCard);
}

function openFullPreviewFromSelection() {
  const ref = getSelectedCardRef();
  if (!ref) return;

  const forceFaceUp = ref.playerKey === myRole && isDeckLikeZone(ref.containerKey);
  const hidden = forceFaceUp ? false : isCardHidden(ref.card, ref.playerKey, ref.containerKey);
  openCardPreview(ref.card, hidden);
}

function openCardPreview(card, hidden) {
  const area = document.getElementById("previewCardArea");
  if (!area) return;

  area.innerHTML = "";

  const previewCard = document.createElement("div");
  previewCard.className = "card";
  previewCard.style.width = "100%";
  previewCard.style.height = "100%";
  previewCard.style.borderColor = "#ffd166";

  if (hidden) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.textContent = "TCG";
    previewCard.appendChild(back);
  } else {
    const img = document.createElement("img");
    img.className = "card-image";
    img.src = card.image;
    img.alt = card.name;
    img.draggable = false;

    img.onerror = () => {
      img.replaceWith(createPlaceholder(card.name));
    };

    previewCard.appendChild(img);
  }

  area.appendChild(previewCard);

  const modal = document.getElementById("cardPreviewModal");
  if (modal) modal.style.display = "block";
}

function openCardMenu(x, y, cardId, playerKey, containerKey) {
  state.openMenu = { type: "card", x, y, cardId, playerKey, containerKey };
  renderContextMenu();
}

function openPileMenu(x, y, playerKey, containerKey) {
  state.openMenu = { type: "pile", x, y, playerKey, containerKey };
  renderContextMenu();
}

function openZoneChoiceMenu(x, y, cardId, playerKey, containerKey) {
  state.openMenu = { type: "zoneChoice", x, y, cardId, playerKey, containerKey };
  renderContextMenu();
}

function renderContextMenu() {
  const menu = document.getElementById("contextMenu");
  if (!menu) return;

  menu.innerHTML = "";

  if (!state.openMenu) {
    menu.style.display = "none";
    return;
  }

  if (state.openMenu.type === "pile") {
    const { playerKey, containerKey } = state.openMenu;
    const isMine = playerKey === myRole;

    if (containerKey === "discardPile") {
      menu.appendChild(menuButton("Visualizar", () => openPileViewer(playerKey, containerKey)));
    } else if (isMine) {
      menu.appendChild(menuButton("Puxar", () => drawFromPile(playerKey, containerKey)));
      menu.appendChild(menuButton("Visualizar", () => openPileViewer(playerKey, containerKey)));
      menu.appendChild(menuButton("Embaralhar", () => shufflePile(playerKey, containerKey)));
    }
  }

  if (state.openMenu.type === "card") {
    const { cardId, playerKey, containerKey, x, y } = state.openMenu;

    menu.appendChild(
      menuButton("Virar / Revelar", () => toggleFaceDown(cardId, playerKey, containerKey))
    );
    menu.appendChild(
      menuButton("Girar", () => toggleRotation(cardId, playerKey, containerKey))
    );
    menu.appendChild(
      menuButton("Adicionar à mão", () => moveCard(cardId, playerKey, containerKey, myRole, "hand"))
    );
    menu.appendChild(
      menuButton("Voltar ao deck", () => returnCardToOwnerDeck(cardId, playerKey, containerKey))
    );
    menu.appendChild(
      menuButton("Enviar ao descarte", () =>
        moveCard(cardId, playerKey, containerKey, myRole, "discardPile")
      )
    );
    menu.appendChild(
      menuButton("Colocar em zona...", () =>
        openZoneChoiceMenu(x + 210, y, cardId, playerKey, containerKey)
      )
    );

    if (canUseEffect(cardId, playerKey, containerKey)) {
      menu.appendChild(menuButton("Efeito", () => triggerCardEffect(cardId)));
    }

    if (!PILE_CONTAINERS.includes(containerKey) && containerKey !== "hand") {
      menu.appendChild(menuButton("Atacar", () => startAttack(cardId, playerKey, containerKey)));
    }
  }

  if (state.openMenu.type === "zoneChoice") {
    const { cardId, playerKey, containerKey } = state.openMenu;

    ZONE_CHOICE_TARGETS.forEach((targetInfo) => {
      const resolvedPlayer = getDisplayPlayerKey(targetInfo.playerKey);
      const labelPlayer = resolvedPlayer === myRole ? "Seu" : "Oponente";

      menu.appendChild(
        menuButton(`${labelPlayer} → ${ZONE_LABELS[targetInfo.zone]}`, () => {
          moveCard(cardId, playerKey, containerKey, resolvedPlayer, targetInfo.zone);
        })
      );
    });
  }

  menu.style.display = "block";

  const padding = 12;
  const menuRect = menu.getBoundingClientRect();

  let left = state.openMenu.x;
  let top = state.openMenu.y;

  if (left + menuRect.width > window.innerWidth - padding) {
    left = window.innerWidth - menuRect.width - padding;
  }

  if (top + menuRect.height > window.innerHeight - padding) {
    top = window.innerHeight - menuRect.height - padding;
  }

  if (left < padding) left = padding;
  if (top < padding) top = padding;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function menuButton(text, action) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = () => {
    action();

    if (state.openMenu?.type !== "zoneChoice") {
      closeContextMenu();
    }
  };
  return btn;
}

function closeContextMenu() {
  state.openMenu = null;

  const menu = document.getElementById("contextMenu");
  if (menu) menu.style.display = "none";
}

function drawFromPile(playerKey, containerKey) {
  if (playerKey !== myRole) {
    alert("Você só pode puxar do seu próprio deck.");
    return;
  }

  if (containerKey === "deckPile") {
    socket.emit("drawCard", {
      roomId,
      pileType: "mainDeck"
    });
    return;
  }

  if (containerKey === "trapDeckPile") {
    socket.emit("drawCard", {
      roomId,
      pileType: "trapDeck"
    });
  }
}

function openPileViewer(playerKey, containerKey) {
  if (playerKey !== myRole && containerKey !== "discardPile") {
    return;
  }

  state.pileViewer = {
    playerKey,
    containerKey,
    loading: isDeckLikeZone(containerKey) && playerKey === myRole
  };

  renderPileViewerIfOpen();

  if (playerKey === myRole && isDeckLikeZone(containerKey)) {
    socket.emit("requestPrivatePileView", {
      roomId,
      pileType: uiZoneToServerZone(containerKey)
    });
  }
}

function getCardsForPileViewer(playerKey, containerKey) {
  if (playerKey === myRole && isDeckLikeZone(containerKey)) {
    return state.privatePiles[playerKey][containerKey] || [];
  }

  return state.players[playerKey][containerKey] || [];
}

function renderPileViewerIfOpen() {
  const panel = document.getElementById("pileViewerPanel");
  const title = document.getElementById("pileViewerTitle");
  const grid = document.getElementById("pileViewerCards");

  if (!panel || !title || !grid) return;

  if (!state.pileViewer) {
    panel.classList.add("hidden");
    grid.innerHTML = "";
    return;
  }

  const { playerKey, containerKey, loading } = state.pileViewer;
  const pile = getCardsForPileViewer(playerKey, containerKey);

  title.textContent = `${ZONE_LABELS[containerKey]} - ${
    playerKey === "p1" ? "Jogador 1" : "Jogador 2"
  }`;
  grid.innerHTML = "";

  if (loading && playerKey === myRole && isDeckLikeZone(containerKey) && pile.length === 0) {
    grid.innerHTML = '<div class="side-preview-empty">Carregando pilha...</div>';
    panel.classList.remove("hidden");
    return;
  }

  if (pile.length === 0) {
    grid.innerHTML = '<div class="side-preview-empty">Nenhuma carta para mostrar</div>';
    panel.classList.remove("hidden");
    return;
  }

  pile.forEach((card) => {
    const forceFaceUp = playerKey === myRole && isDeckLikeZone(containerKey);
    const canDragOverride = playerKey === myRole;

    grid.appendChild(
      createCardElement(card, playerKey, containerKey, {
        forceFaceUp,
        canDragOverride
      })
    );
  });

  panel.classList.remove("hidden");
}

function closePileViewer() {
  state.pileViewer = null;
  renderPileViewerIfOpen();
}

function refreshOpenPrivatePileIfNeeded() {
  if (!state.pileViewer) return;
  if (state.pileViewer.playerKey !== myRole) return;
  if (!isDeckLikeZone(state.pileViewer.containerKey)) return;

  socket.emit("requestPrivatePileView", {
    roomId,
    pileType: uiZoneToServerZone(state.pileViewer.containerKey)
  });
}

function shufflePile() {
  alert("Embaralhar pilhas manualmente ainda não está sincronizado.");
}

function shuffleHand(playerKey) {
  if (playerKey !== myRole) return;

  state.players[playerKey].hand = shuffle(state.players[playerKey].hand);

  const handElementId = getHandElementIdForVisualRole(playerKey);
  const hand = document.getElementById(handElementId);
  if (hand) animateShuffle(hand);

  renderBoard();
}

function animateShuffle(element) {
  element.classList.remove("shuffling");
  void element.offsetWidth;
  element.classList.add("shuffling");

  setTimeout(() => {
    element.classList.remove("shuffling");
  }, 450);
}

function findCardInContainer(playerKey, containerKey, cardId) {
  if (playerKey === myRole && isDeckLikeZone(containerKey)) {
    const privatePile = state.privatePiles[playerKey]?.[containerKey];
    if (privatePile) {
      const privateFound = privatePile.find((card) => card.id === cardId);
      if (privateFound) return privateFound;
    }
  }

  const container = state.players[playerKey]?.[containerKey];
  if (!container) return null;
  return container.find((card) => card.id === cardId) || null;
}

function findCardLocation(cardId, preferredPlayerKey = null, preferredContainerKey = null) {
  if (preferredPlayerKey && preferredContainerKey) {
    const directFound = findCardInContainer(preferredPlayerKey, preferredContainerKey, cardId);
    if (directFound) {
      return {
        playerKey: preferredPlayerKey,
        containerKey: preferredContainerKey,
        card: directFound
      };
    }
  }

  for (const playerKey of ["p1", "p2"]) {
    const player = state.players[playerKey];

    for (const zoneKey of Object.keys(player)) {
      const found = (player[zoneKey] || []).find((c) => c.id === cardId);
      if (found) {
        return {
          playerKey,
          containerKey: zoneKey,
          card: found
        };
      }
    }

    for (const privateZoneKey of ["deckPile", "trapDeckPile"]) {
      const privateFound = (state.privatePiles[playerKey]?.[privateZoneKey] || []).find(
        (c) => c.id === cardId
      );

      if (privateFound) {
        return {
          playerKey,
          containerKey: privateZoneKey,
          card: privateFound
        };
      }
    }
  }

  return null;
}

function moveCard(cardId, fromPlayerKey, fromContainerKey, toPlayerKey, toContainerKey) {
  if (fromPlayerKey !== myRole) {
    alert("Você não pode puxar cartas do lado do oponente.");
    return;
  }

  const realLocation = findCardLocation(cardId, fromPlayerKey, fromContainerKey);

  if (!realLocation) {
    console.warn("Carta não encontrada no estado local.");
    return;
  }

  if (realLocation.playerKey !== myRole) {
    alert("Você não pode puxar cartas do lado do oponente.");
    return;
  }

  if (realLocation.playerKey === toPlayerKey && realLocation.containerKey === toContainerKey) {
    return;
  }

  if (isDeckLikeZone(realLocation.containerKey) && realLocation.playerKey === myRole) {
    state.privatePiles[myRole][realLocation.containerKey] =
      (state.privatePiles[myRole][realLocation.containerKey] || []).filter(
        (card) => card.id !== cardId
      );
  }

  socket.emit("moveCardSandbox", {
    roomId,
    fromPlayer: realLocation.playerKey,
    fromZone: uiZoneToServerZone(realLocation.containerKey),
    toPlayer: toPlayerKey,
    toZone: uiZoneToServerZone(toContainerKey),
    cardId
  });

  renderPileViewerIfOpen();
}

function returnCardToOwnerDeck(cardId, playerKey, containerKey) {
  const card = findCardInContainer(playerKey, containerKey, cardId);
  if (!card) return;

  const targetDeck = card.type === "trap" ? "trapDeckPile" : "deckPile";
  moveCard(cardId, playerKey, containerKey, myRole, targetDeck);
}

function toggleFaceDown(cardId, playerKey, containerKey) {
  if (playerKey !== myRole) {
    alert("Você não pode alterar cartas do lado do oponente.");
    return;
  }

  const card = findCardInContainer(playerKey, containerKey, cardId);
  if (!card) return;

  socket.emit("setCardFaceDown", {
    roomId,
    playerKey,
    zoneKey: uiZoneToServerZone(containerKey),
    cardId,
    faceDown: !card.faceDown
  });
}

function toggleRotation(cardId, playerKey, containerKey) {
  if (playerKey !== myRole) {
    alert("Você não pode alterar cartas do lado do oponente.");
    return;
  }

  const card = findCardInContainer(playerKey, containerKey, cardId);
  if (!card) return;

  socket.emit("setCardRotation", {
    roomId,
    playerKey,
    zoneKey: uiZoneToServerZone(containerKey),
    cardId,
    rotated: !card.rotated
  });
}

function canUseEffect(cardId, playerKey, containerKey) {
  const allowedZones = [
    "mythic",
    "creature1",
    "creature2",
    "creature3",
    "field",
    "magic1",
    "magic2",
    "magic3",
    "magic4"
  ];

  if (!allowedZones.includes(containerKey)) return false;

  const card = findCardInContainer(playerKey, containerKey, cardId);
  if (!card) return false;

  return !card.faceDown;
}

function triggerCardEffect(cardId) {
  const cardEl = document.getElementById(`card-${cardId}`);
  if (!cardEl) return;

  cardEl.classList.remove("effect-activated");
  void cardEl.offsetWidth;
  cardEl.classList.add("effect-activated");

  setTimeout(() => {
    cardEl.classList.remove("effect-activated");
  }, 650);
}

function startAttack(cardId, playerKey, containerKey) {
  if (state.currentPhase !== "FB") {
    alert("Ataque só pode ser usado na fase FB.");
    return;
  }

  state.attackMode = { cardId, playerKey, containerKey };
  renderBoard();
}

function resolveAttack(targetPlayerKey, targetContainerKey) {
  if (!state.attackMode) return;

  const sourceCardEl = document.getElementById(`card-${state.attackMode.cardId}`);
  const targetZoneEl = document.getElementById(`zone-${targetPlayerKey}-${targetContainerKey}`);

  if (!sourceCardEl || !targetZoneEl) {
    state.attackMode = null;
    renderBoard();
    return;
  }

  animateAttackArrow(sourceCardEl, targetZoneEl);
  state.attackMode = null;
  renderBoard();
}

function animateAttackArrow(sourceEl, targetEl) {
  clearAttackArrow();

  const svg = document.getElementById("attackLayer");
  if (!svg) return;

  const source = sourceEl.getBoundingClientRect();
  const target = targetEl.getBoundingClientRect();

  const x1 = source.left + source.width / 2;
  const y1 = source.top + source.height / 2;
  const x2 = target.left + target.width / 2;
  const y2 = target.top + target.height / 2;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowHead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");

  const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowPath.setAttribute("d", "M0,0 L0,6 L9,3 z");
  arrowPath.setAttribute("fill", "#ff2d2d");

  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x1);
  line.setAttribute("y2", y1);
  line.setAttribute("stroke", "#ff2d2d");
  line.setAttribute("stroke-width", "6");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("marker-end", "url(#arrowHead)");
  svg.appendChild(line);

  const duration = 250;
  const start = performance.now();

  function step(time) {
    const progress = Math.min((time - start) / duration, 1);
    const currentX = x1 + (x2 - x1) * progress;
    const currentY = y1 + (y2 - y1) * progress;

    line.setAttribute("x2", currentX);
    line.setAttribute("y2", currentY);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      setTimeout(clearAttackArrow, 700);
    }
  }

  requestAnimationFrame(step);
}

function clearAttackArrow() {
  const svg = document.getElementById("attackLayer");
  if (svg) svg.innerHTML = "";
}

function setupDropTarget(element, playerKey, containerKey) {
  element.addEventListener("dragover", (event) => {
    event.preventDefault();
    element.classList.add("drop-hover");
  });

  element.addEventListener("dragleave", () => {
    element.classList.remove("drop-hover");
  });

  element.addEventListener("drop", (event) => {
    event.preventDefault();
    element.classList.remove("drop-hover");

    try {
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (data.playerKey !== myRole) {
        return;
      }

      moveCard(data.cardId, data.playerKey, data.containerKey, playerKey, containerKey);
    } catch (error) {
      console.error(error);
    }
  });
}

function showErrorToast(message) {
  let toast = document.getElementById("errorToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "errorToast";
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "10000";
    toast.style.background = "rgba(20,20,20,0.95)";
    toast.style.color = "#fff";
    toast.style.border = "1px solid #666";
    toast.style.borderRadius = "10px";
    toast.style.padding = "12px 18px";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.45)";
    toast.style.maxWidth = "420px";
    toast.style.textAlign = "center";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  if (errorToastTimeout) {
    clearTimeout(errorToastTimeout);
  }

  errorToastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

/* SOCKET EVENTS */

socket.on("connect", () => {
  console.log("Conectado ao servidor:", socket.id);
});

socket.on("roomFull", () => {
  alert("Sala cheia. Esta sala já tem 2 jogadores.");
});

socket.emit("joinRoom", roomId);

socket.on("playerRole", (role) => {
  myRole = role;
  console.log("Seu papel:", role);
  updatePerspectiveLabels();
});

socket.on("readyStatus", (ready) => {
  console.log("Status de pronto:", ready);
});

socket.on("startMatch", (data) => {
  console.log("Partida iniciando com decks:", data.decks);
  console.log("Estado inicial da partida:", data.matchState);

  serverMatchState = data.matchState;
  startSynchronizedGame(data.decks, data.matchState);
});

socket.on("playersInRoom", (players) => {
  console.log("Jogadores na sala:", players);
});

socket.on("deckSelectionsUpdated", (deckSelections) => {
  console.log("Decks escolhidos:", deckSelections);
});

socket.on("testActionReceived", (data) => {
  console.log("Ação recebida do outro jogador:", data.message);
});

socket.on("matchStateUpdated", (matchState) => {
  console.log("Estado público atualizado:", matchState);
  serverMatchState = matchState;
  applyServerStateToUI();
});

socket.on("privatePileViewData", ({ playerKey, pileType, cards }) => {
  if (!playerKey || playerKey !== myRole) return;

  const uiPile = serverZoneToUiZone(pileType);
  if (!isDeckLikeZone(uiPile)) return;

  state.privatePiles[playerKey][uiPile] = (cards || [])
    .map((card) => hydrateServerCard(card, playerKey))
    .filter(Boolean);

  if (
    state.pileViewer &&
    state.pileViewer.playerKey === playerKey &&
    state.pileViewer.containerKey === uiPile
  ) {
    state.pileViewer.loading = false;
  }

  renderPileViewerIfOpen();
});

socket.on("diceRolled", ({ value }) => {
  animateResultBox("diceResult");

  setTimeout(() => {
    const el = document.getElementById("diceResult");
    if (el) el.textContent = "Dado: " + value;
  }, 180);
});

socket.on("coinFlipped", ({ value }) => {
  animateResultBox("coinResult");

  setTimeout(() => {
    const el = document.getElementById("coinResult");
    if (el) el.textContent = "Moeda: " + value;
  }, 180);
});

socket.on("handUpdated", (data) => {
  console.log("Sua mão atualizada:", data.hand);

  if (!myRole) return;
  if (data.role !== myRole) return;

  const localPlayer = state.players[myRole];
  if (!localPlayer) return;

  localPlayer.hand = (data.hand || [])
    .map((card) => hydrateServerCard(card, myRole))
    .filter(Boolean);

  renderBoard();
});

socket.on("actionError", (data) => {
  showErrorToast(data.message || "Ocorreu um erro.");
});

socket.on("selectedCardChanged", ({ role, cardId }) => {
  remoteSelections[role] = cardId || null;
  renderBoard();
});

/* DOM EVENTS */

document.addEventListener("click", (event) => {
  const menu = document.getElementById("contextMenu");
  if (menu && !menu.contains(event.target)) {
    closeContextMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderDeckButtons();
  updatePerspectiveLabels();

  const hpInput1 = document.getElementById("hpChange1");
  const hpInput2 = document.getElementById("hpChange2");

  if (hpInput1) {
    hpInput1.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        changeMythicHP(1, "subtract");
      }
    });
  }

  if (hpInput2) {
    hpInput2.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        changeMythicHP(2, "subtract");
      }
    });
  }
});