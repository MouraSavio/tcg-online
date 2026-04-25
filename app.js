const socket = io();

let myRole = null;
let serverMatchState = null;
let selectedDeck = null;
let errorToastTimeout = null;
let chatMessagesState = [];
let manualBoardZoom = 1;
const MIN_BOARD_ZOOM = 0.6;
const MAX_BOARD_ZOOM = 1.6;
const ZOOM_STEP = 0.1;
const remoteSelections = {
  p1: null,
  p2: null
};

let currentPA1 = 0;
let currentPA2 = 0;
let currentMythicHP1 = 500;
let currentMythicHP2 = 500;

const DEFAULT_PROFILE_AVATAR = "assets/avatars/defaults/avatar-default.png";

const SELECTABLE_AVATARS = [
  "assets/avatars/selectable/avatar-01.png",
  "assets/avatars/selectable/avatar-02.png",
  "assets/avatars/selectable/avatar-03.png",
  "assets/avatars/selectable/avatar-04.png",
  "assets/avatars/selectable/avatar-05.png",
  "assets/avatars/selectable/avatar-06.png",
  "assets/avatars/selectable/avatar-07.png"
];
let selectedProfileAvatar = DEFAULT_PROFILE_AVATAR;
const syncedProfiles = {
  p1: {
    name: "Jogador 1",
    avatar: DEFAULT_PROFILE_AVATAR
  },
  p2: {
    name: "Jogador 2",
    avatar: DEFAULT_PROFILE_AVATAR
  }
};

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
  },
  vento: {
    displayName: "Deck de Vento",
    mythic: "daerikal-imperador-vento",
    creatures: [
      "aguia-ventos",
      "aguia-ventos",
      "general-harpia-layra",
      "general-harpia-layra",
      "general-harpia-nayra",
      "general-harpia-nayra",
      "general-harpia-zaya",
      "general-harpia-zaya",
      "harpia-ventos",
      "harpia-ventos",
      "rainha-harpia-tissaya",
      "hipogrifo",
      "hipogrifo-tempestade",
      "pequeno-grifo",
      "tifao"
    ],
    spells: [
      "bencao-milagrosa",
      "compra-graciosa",
      "furacao-harpia",
      "lupa-milagrosa",
      "pesquisa-arcana",
      "pocao-mana",
      "pote-ambicao",
      "pote-gula",
      "quebra-feitico",
      "reino-ventos-sagrados",
      "renascimento-sagrado",
      "retorno-fluxo-arcano",
      "sede-poder",
      "vinculo-harpia",
      "vinculo-harpia"
    ],
    traps: [
      "aprisionamento-eterno",
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
  
  espadachim: {
    displayName: "Deck Espadachim",
    mythic: "terrakhor-soberano",
    creatures: [
      "akuma-ronin",
      "aspirante-kojiro",
      "aspirante-musashi",
      "daizen-kenshin",
      "discipulo-espadachim",
      "discipulo-espadachim",
      "discipula-espadachim",
      "discipula-espadachim",
      "espadachim-mestra",
      "espadachim-mestre",
      "killbee-espadachim",
      "killbee-espadachim",
      "kojiro-mestre-espada",
      "mestra-killbee",
      "musashi-mestre-nitoryu"
    ],
    spells: [
      "arte-forja",
      "bushido",
      "caminho-espada",
      "caminho-espada",
      "dojo-espadachim",
      "ferrao-dourado",
      "kamaitachi",
      "katana-afiada",
      "katana-afiada",
      "kesa-giri",
      "kesa-giri",
      "onryo",
      "seiryu",
      "terra-sagrada",
      "pocao-mana"
    ],
    traps: [
      "caminho-renegado",
      "chuva-mil-laminas",
      "confronto-equilibrado",
      "contragolpe",
      "corte-x",
      "defesa-impenetravel",
      "julgamento-divino",
      "ofensiva-quebrada",
      "reversao-espelho",
      "vinganca-onryo"
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
function getDeckBoxImage(deckKey) {
  const deckBoxMap = {
    fogo: "deckbox-fogo.png",
    agua: "deckbox-agua.png",
    ferragon: "deckbox-terra.png",
    "cassino-goblin": "deckbox-terra.png",
    vento: "deckbox-vento.png",
    espadachim: "deckbox-espadachim.png"
  };

  const fileName = deckBoxMap[deckKey];

  if (!fileName) return "";

  return `decks/deck-${deckKey}/deck-box/${fileName}`;
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
    rotated: !!card.rotated,
    markers: Number(card.markers || 0)
  };
}

function hydrateServerCards(cards, ownerRole) {
  return (cards || []).map((card) => hydrateServerCard(card, ownerRole)).filter(Boolean);
}
function scheduleBoardAutoScale() {
  applyBoardAutoScale();
}

function applyBoardAutoScale() {
  const scaleShell = document.getElementById("boardScaleShell");
  const boardLayout = document.querySelector(".board-main-layout");

  if (!scaleShell || !boardLayout) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  scaleShell.style.transform = "none";
  scaleShell.style.width = "";
  scaleShell.style.height = "";

  const naturalWidth = boardLayout.scrollWidth;
  const naturalHeight = boardLayout.scrollHeight;

  let autoScale = 1;

  if (viewportWidth < 1400) {
    const widthScale = (viewportWidth - 24) / naturalWidth;
    const heightScale = (viewportHeight - 24) / naturalHeight;
    autoScale = Math.min(widthScale, heightScale, 1);
  }

  const finalScale = autoScale * manualBoardZoom;

  scaleShell.style.transform = `scale(${finalScale})`;
  scaleShell.style.transformOrigin = "top left";
  scaleShell.style.width = `${naturalWidth * finalScale}px`;
  scaleShell.style.height = `${naturalHeight * finalScale}px`;

  updateZoomLabel();
}

function zoomInBoard() {
  manualBoardZoom = Math.min(MAX_BOARD_ZOOM, +(manualBoardZoom + ZOOM_STEP).toFixed(2));
  localStorage.setItem("zoom", manualBoardZoom);
  applyBoardAutoScale();
}

function zoomOutBoard() {
  manualBoardZoom = Math.max(MIN_BOARD_ZOOM, +(manualBoardZoom - ZOOM_STEP).toFixed(2));
  localStorage.setItem("zoom", manualBoardZoom);
  applyBoardAutoScale();
}

function resetBoardZoom() {
  manualBoardZoom = 1;
  localStorage.setItem("zoom", manualBoardZoom);
  applyBoardAutoScale();
}

function updateZoomLabel() {
  const label = document.getElementById("boardZoomLabel");
  if (!label) return;
  label.textContent = `${Math.round(manualBoardZoom * 100)}%`;
}
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  closeContextMenu();
  scheduleBoardAutoScale();
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

  Object.entries(DECKS).forEach(([deckKey, deckData]) => {
    const card = document.createElement("div");
    card.className = "deck-select-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "deck-select-image-wrap";

    const img = document.createElement("img");
    img.className = "deck-select-image";
    img.src = getDeckBoxImage(deckKey);
    img.alt = deckData.displayName;
    img.draggable = false;

    img.onerror = () => {
      imageWrap.innerHTML = "";
      const fallback = document.createElement("div");
      fallback.className = "deck-select-image-fallback";
      fallback.textContent = deckData.displayName;
      imageWrap.appendChild(fallback);
    };

    imageWrap.appendChild(img);

    const title = document.createElement("h3");
    title.className = "deck-select-title";
    title.textContent = deckData.displayName;

    const actions = document.createElement("div");
    actions.className = "deck-select-actions";

    const selectBtn = document.createElement("button");
    selectBtn.className = "deck-action-btn deck-action-btn-primary";
    selectBtn.textContent = "Selecionar";
    selectBtn.onclick = () => selectDeck(deckKey);

    const viewBtn = document.createElement("button");
    viewBtn.className = "deck-action-btn deck-action-btn-secondary";
    viewBtn.textContent = "Visualizar Cartas";
    viewBtn.onclick = () => openDeckPreview(deckKey);

    actions.appendChild(selectBtn);
    actions.appendChild(viewBtn);

    card.appendChild(imageWrap);
    card.appendChild(title);
    card.appendChild(actions);

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

  if (myRole && serverMatchState.players[myRole]?.hand) {
  state.players[myRole].hand = hydrateServerCards(
    serverMatchState.players[myRole].hand,
    myRole
  );
}

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

    updateHudPerspective();
  updateChatPerspectiveProfile();
}
function updateHudPerspective() {
  const topRole = getTopVisualRole();
  const bottomRole = getBottomVisualRole();

  const topIsP1 = topRole === "p1";
  const bottomIsP1 = bottomRole === "p1";

  // títulos
  const topHpTitle = document.querySelector(".player-hud-top .hud-block:first-child .hud-title");
  const topPaTitle = document.querySelector(".player-hud-top .hud-block:last-child .hud-title");
  const bottomHpTitle = document.querySelector(".player-hud-bottom .hud-block:first-child .hud-title");
  const bottomPaTitle = document.querySelector(".player-hud-bottom .hud-block:last-child .hud-title");

  if (topHpTitle) topHpTitle.textContent = `HP Fera Mítica ${topRole.toUpperCase()}`;
  if (topPaTitle) topPaTitle.textContent = `PA Jogador ${topRole === "p1" ? "1" : "2"}`;
  if (bottomHpTitle) bottomHpTitle.textContent = `HP Fera Mítica ${bottomRole.toUpperCase()}`;
  if (bottomPaTitle) bottomPaTitle.textContent = `PA Jogador ${bottomRole === "p1" ? "1" : "2"}`;

  // valores de HP
  const topHpEl = document.getElementById("mythicHp2");
  const bottomHpEl = document.getElementById("mythicHp1");

  if (topHpEl) topHpEl.textContent = topIsP1 ? currentMythicHP1 : currentMythicHP2;
  if (bottomHpEl) bottomHpEl.textContent = bottomIsP1 ? currentMythicHP1 : currentMythicHP2;

  // valores de PA
  const topPaEl = document.getElementById("paValue2");
  const bottomPaEl = document.getElementById("paValue1");

  if (topPaEl) topPaEl.textContent = topIsP1 ? currentPA1 : currentPA2;
  if (bottomPaEl) bottomPaEl.textContent = bottomIsP1 ? currentPA1 : currentPA2;

  // inputs de ganho padrão
  const topGainInput = document.getElementById("turnGain2");
  const bottomGainInput = document.getElementById("turnGain1");

  if (topGainInput) topGainInput.dataset.targetRole = topRole;
  if (bottomGainInput) bottomGainInput.dataset.targetRole = bottomRole;

  // remapear botões do painel de cima
  const topHud = document.querySelector(".player-hud-top");
  if (topHud) {
    const hpButtons = topHud.querySelectorAll(".hp-controls button");
    const paButtons = topHud.querySelectorAll(".pa-controls button");

    if (hpButtons[0]) hpButtons[0].onclick = () => changeMythicHP(topRole === "p1" ? 1 : 2, "subtract", "hpChange2");
    if (hpButtons[1]) hpButtons[1].onclick = () => changeMythicHP(topRole === "p1" ? 1 : 2, "add", "hpChange2");

    if (paButtons[0]) paButtons[0].onclick = () => changePA(topRole === "p1" ? 1 : 2, -1);
    if (paButtons[1]) paButtons[1].onclick = () => changePA(topRole === "p1" ? 1 : 2, 1);
    if (paButtons[2]) paButtons[2].onclick = () => applyTurnGain(topRole === "p1" ? 1 : 2, "turnGain2");
  }

  // remapear botões do painel de baixo
  const bottomHud = document.querySelector(".player-hud-bottom");
  if (bottomHud) {
    const hpButtons = bottomHud.querySelectorAll(".hp-controls button");
    const paButtons = bottomHud.querySelectorAll(".pa-controls button");

    if (hpButtons[0]) hpButtons[0].onclick = () => changeMythicHP(bottomRole === "p1" ? 1 : 2, "subtract", "hpChange1");
    if (hpButtons[1]) hpButtons[1].onclick = () => changeMythicHP(bottomRole === "p1" ? 1 : 2, "add", "hpChange1");

    if (paButtons[0]) paButtons[0].onclick = () => changePA(bottomRole === "p1" ? 1 : 2, -1);
    if (paButtons[1]) paButtons[1].onclick = () => changePA(bottomRole === "p1" ? 1 : 2, 1);
    if (paButtons[2]) paButtons[2].onclick = () => applyTurnGain(bottomRole === "p1" ? 1 : 2, "turnGain1");
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

  loadProfileIntoModal();
}

function closeProfile() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.style.display = "none";
}

function closeProfileOnOverlay(event) {
  if (event.target.id === "profileModal") closeProfile();
}
function getSavedProfile() {
  const raw = localStorage.getItem("tcgProfile");

  if (!raw) {
    return {
      name: "",
      avatar: DEFAULT_PROFILE_AVATAR
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const avatar = parsed.avatar || DEFAULT_PROFILE_AVATAR;

    return {
      name: parsed.name || "",
      avatar
    };
  } catch (error) {
    return {
      name: "",
      avatar: DEFAULT_PROFILE_AVATAR
    };
  }
}

function renderProfileAvatarOptions() {
  const grid = document.getElementById("profileAvatarGrid");
  if (!grid) return;

  grid.innerHTML = "";

  SELECTABLE_AVATARS.forEach((avatarPath) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "profile-avatar-option" + (selectedProfileAvatar === avatarPath ? " selected" : "");

    const img = document.createElement("img");
    img.src = avatarPath;
    img.alt = "Avatar";

    option.appendChild(img);

    option.addEventListener("click", () => {
      selectedProfileAvatar = avatarPath;
      updateProfileAvatarPreview();
      renderProfileAvatarOptions();
    });

    grid.appendChild(option);
  });
}

function updateProfileAvatarPreview() {
  const preview = document.getElementById("profileAvatarPreview");
  if (!preview) return;
  preview.src = selectedProfileAvatar || DEFAULT_PROFILE_AVATAR;
}

function loadProfileIntoModal() {
  const savedProfile = getSavedProfile();

  const input = document.getElementById("profileNameInput");
  if (input) input.value = savedProfile.name || "";

  const savedAvatar = savedProfile.avatar || "";

  if (
    savedAvatar &&
    (savedAvatar === DEFAULT_PROFILE_AVATAR || SELECTABLE_AVATARS.includes(savedAvatar))
  ) {
    selectedProfileAvatar = savedAvatar;
  } else {
    selectedProfileAvatar = DEFAULT_PROFILE_AVATAR;
  }

  updateProfileAvatarPreview();
  renderProfileAvatarOptions();
}

function saveProfile() {
  const input = document.getElementById("profileNameInput");
  if (!input) return;

  const profile = {
    name: input.value.trim(),
    avatar: selectedProfileAvatar || DEFAULT_PROFILE_AVATAR
  };

  localStorage.setItem("tcgProfile", JSON.stringify(profile));
  updateProfileAvatarPreview();
  emitMyProfile();
  updateChatPerspectiveProfile();
  closeProfile();
}

function emitMyProfile() {
  const profile = getSavedProfile();

  socket.emit("setProfile", {
    roomId,
    name: profile.name || "",
    avatar: profile.avatar || DEFAULT_PROFILE_AVATAR
  });
}

function getDisplayProfileName(profileName, fallback) {
  const clean = (profileName || "").trim();
  return clean || fallback;
}

function updateChatPerspectiveProfile() {
  const opponentRole = getTopVisualRole();
  const myCurrentRole = getBottomVisualRole();

  const opponentProfile = syncedProfiles[opponentRole] || {};
  const myProfile = syncedProfiles[myCurrentRole] || {};

  const opponentNameEl = document.getElementById("chatOpponentName");
  const opponentAvatarEl = document.getElementById("chatOpponentAvatar");
  const myNameEl = document.getElementById("chatMyName");
  const myAvatarEl = document.getElementById("chatMyAvatar");

  if (opponentNameEl) {
    opponentNameEl.textContent = getDisplayProfileName(
      opponentProfile.name,
      opponentRole === "p1" ? "Jogador 1" : "Jogador 2"
    );
  }

  if (opponentAvatarEl) {
    opponentAvatarEl.src = opponentProfile.avatar || DEFAULT_PROFILE_AVATAR;
  }

  if (myNameEl) {
    myNameEl.textContent = getDisplayProfileName(
      myProfile.name,
      myCurrentRole === "p1" ? "Jogador 1" : "Jogador 2"
    );
  }

  if (myAvatarEl) {
    myAvatarEl.src = myProfile.avatar || DEFAULT_PROFILE_AVATAR;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getChatDisplayNameByRole(role) {
  const profile = syncedProfiles[role] || {};
  return getDisplayProfileName(
    profile.name,
    role === "p1" ? "Jogador 1" : "Jogador 2"
  );
}

function getChatAvatarByRole(role) {
  const profile = syncedProfiles[role] || {};
  return profile.avatar || DEFAULT_PROFILE_AVATAR;
}

function renderChatMessages() {
  const chatBox = document.getElementById("chatMessages");
  if (!chatBox) return;

  if (!chatMessagesState.length) {
    chatBox.innerHTML = '<div class="chat-empty-message">Chat da partida</div>';
    return;
  }

  chatBox.innerHTML = chatMessagesState
    .map((message) => {
      const isMine = message.senderRole === myRole;
      const bubbleClass = isMine ? "chat-message mine" : "chat-message other";
      const senderName = escapeHtml(getChatDisplayNameByRole(message.senderRole));
      const avatar = escapeHtml(getChatAvatarByRole(message.senderRole));
      const text = escapeHtml(message.text);

      return `
        <div class="${bubbleClass}">
          <img class="chat-message-avatar" src="${avatar}" alt="${senderName}">
          <div class="chat-message-content">
            <div class="chat-message-sender">${senderName}</div>
            <div class="chat-message-text">${text}</div>
          </div>
        </div>
      `;
    })
    .join("");

  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendChatMessage(message) {
  if (!message || !message.senderRole || !message.text) return;
  chatMessagesState.push(message);

  if (chatMessagesState.length > 100) {
    chatMessagesState = chatMessagesState.slice(-100);
  }

  renderChatMessages();
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  socket.emit("sendChatMessage", {
    roomId,
    text
  });

  input.value = "";
}

function bindChatEvents() {
  const input = document.getElementById("chatInput");
  const button = document.getElementById("chatSendButton");

  if (button && !button.dataset.chatBound) {
    button.addEventListener("click", sendChatMessage);
    button.dataset.chatBound = "true";
  }

  if (input && !input.dataset.chatBound) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendChatMessage();
      }
    });

    input.dataset.chatBound = "true";
  }
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
  updateHudPerspective();
}

function changeMythicHP(targetPlayer, operation, inputId = null) {
  let input = null;

  if (inputId) {
    input = document.getElementById(inputId);
  } else {
    input = document.getElementById(targetPlayer === 1 ? "hpChange1" : "hpChange2");
  }

  if (!input) return;

  let value = parseInt(input.value, 10);
  if (isNaN(value) || value < 0) value = 0;

  socket.emit("changeMythicHP", {
    roomId,
    targetPlayer: targetPlayer === 1 ? "p1" : "p2",
    operation,
    amount: value
  });
}

function updatePADisplay() {
  updateHudPerspective();
}

function changePA(player, amount) {
  socket.emit("changePA", {
    roomId,
    targetPlayer: player === 1 ? "p1" : "p2",
    amount
  });
}

function applyTurnGain(player, inputId = null) {
  const gainInput = inputId
    ? document.getElementById(inputId)
    : document.getElementById(player === 1 ? "turnGain1" : "turnGain2");

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
function serializeAnimationCard(card) {
  if (!card) return null;

  return {
    id: card.id,
    name: card.name,
    image: card.image || "",
    type: card.type,
    owner: card.owner || card.originalOwner || null,
    originalOwner: card.originalOwner || card.owner || null,
    faceDown: !!card.faceDown,
    rotated: !!card.rotated
  };
}

function isPileZoneForAnimation(zoneKey) {
  const uiZone = serverZoneToUiZone(zoneKey);
  return ["deckPile", "trapDeckPile", "discardPile"].includes(uiZone);
}

function getAnimationHost() {
  return document.body;
}

function getZoneElementForAnimation(playerKey, zoneKey) {
  const uiZone = serverZoneToUiZone(zoneKey);

  if (uiZone === "hand") {
    return document.getElementById(getHandElementIdForVisualRole(playerKey));
  }

  return document.getElementById(`zone-${playerKey}-${uiZone}`);
}

function getCardElementForAnimation(cardId) {
  if (!cardId) return null;
  return document.getElementById(`card-${cardId}`);
}

function getAnimationRect(playerKey, zoneKey, cardId) {
  const uiZone = serverZoneToUiZone(zoneKey);

  if (uiZone === "hand") {
    const cardEl = getCardElementForAnimation(cardId);
    if (cardEl) return cardEl.getBoundingClientRect();

    const handEl = document.getElementById(getHandElementIdForVisualRole(playerKey));
    return handEl ? handEl.getBoundingClientRect() : null;
  }

  if (!isPileZoneForAnimation(uiZone)) {
    const cardEl = getCardElementForAnimation(cardId);
    if (cardEl) return cardEl.getBoundingClientRect();
  }

  const zoneEl = document.getElementById(`zone-${playerKey}-${uiZone}`);
  return zoneEl ? zoneEl.getBoundingClientRect() : null;
}

function shouldHideAnimationCard(card, ownerRole, destinationZone) {
  const uiZone = serverZoneToUiZone(destinationZone);
  if (!card) return true;
  if (card.faceDown) return true;
  if (uiZone === "hand" && ownerRole && ownerRole !== myRole) return true;
  return false;
}

function buildAnimationCardElement(card, hidden) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.position = "fixed";
  el.style.left = "0px";
  el.style.top = "0px";
  el.style.margin = "0";
  el.style.zIndex = "6000";
  el.style.pointerEvents = "none";
  el.style.boxShadow = "0 12px 30px rgba(0,0,0,0.45)";

  if (card?.rotated) {
    el.classList.add("rotated");
  }

  if (hidden) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.textContent = "TCG";
    el.appendChild(back);
    return el;
  }

  if (card?.image) {
    const img = document.createElement("img");
    img.className = "card-image";
    img.src = card.image;
    img.alt = card.name || "Carta";
    img.draggable = false;

    img.onerror = () => {
      if (img.parentNode === el) {
        img.replaceWith(createPlaceholder(card.name || "Carta"));
      }
    };

    el.appendChild(img);
    return el;
  }

  el.appendChild(createPlaceholder(card?.name || "Carta"));
  return el;
}

function animateCardTravel(payload) {
  if (!payload) return;

  const boardScreen = document.getElementById("boardScreen");
  if (!boardScreen || !boardScreen.classList.contains("active")) return;

  const {
    card,
    fromPlayer,
    fromZone,
    toPlayer,
    toZone
  } = payload;

  const sourceRect = getAnimationRect(fromPlayer, fromZone, card?.id);
  const targetRect = getAnimationRect(toPlayer, toZone, card?.id);

  if (!sourceRect || !targetRect) return;

  const ownerRole = card?.originalOwner || card?.owner || toPlayer;
  const hidden = shouldHideAnimationCard(card, ownerRole, toZone);

  const sourceCardEl =
    !isPileZoneForAnimation(fromZone) && serverZoneToUiZone(fromZone) !== "hand"
      ? getCardElementForAnimation(card?.id)
      : getCardElementForAnimation(card?.id);

  let ghost = null;

  if (sourceCardEl && sourceCardEl.classList.contains("card")) {
    ghost = sourceCardEl.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "6000";
    ghost.style.margin = "0";
  } else {
    ghost = buildAnimationCardElement(card, hidden);
  }

  const width = sourceCardEl && sourceCardEl.classList.contains("card") ? sourceRect.width : 115;
  const height = sourceCardEl && sourceCardEl.classList.contains("card") ? sourceRect.height : 161;

  ghost.style.width = `${width}px`;
  ghost.style.height = `${height}px`;

  const startLeft = sourceRect.left + sourceRect.width / 2 - width / 2;
  const startTop = sourceRect.top + sourceRect.height / 2 - height / 2;
  const endLeft = targetRect.left + targetRect.width / 2 - width / 2;
  const endTop = targetRect.top + targetRect.height / 2 - height / 2;

  ghost.style.left = `${startLeft}px`;
  ghost.style.top = `${startTop}px`;
  ghost.style.opacity = "0.98";
  ghost.style.transform = "scale(1)";

  getAnimationHost().appendChild(ghost);

  requestAnimationFrame(() => {
    ghost.style.transition =
      "left 360ms ease, top 360ms ease, transform 360ms ease, opacity 360ms ease";
    ghost.style.left = `${endLeft}px`;
    ghost.style.top = `${endTop}px`;
    ghost.style.transform = "scale(0.92)";
    ghost.style.opacity = "0.2";
  });

  setTimeout(() => {
    ghost.remove();
  }, 420);
}

function animateEffectByCardId(cardId) {
  const cardEl = document.getElementById(`card-${cardId}`);
  if (!cardEl) return;

  cardEl.classList.remove("effect-activated");
  void cardEl.offsetWidth;
  cardEl.classList.add("effect-activated");

  setTimeout(() => {
    cardEl.classList.remove("effect-activated");
  }, 650);
}

function animateAttackFromPayload(payload) {
  if (!payload) return;

  const sourceEl = getCardElementForAnimation(payload.cardId);
  const targetEl = getZoneElementForAnimation(payload.targetPlayer, payload.targetZone);

  if (!sourceEl || !targetEl) return;

  animateAttackArrow(sourceEl, targetEl);
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
  scheduleBoardAutoScale();
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
    zoneEl.className = containerKey === "mythic" ? "zone mythic-zone" : "zone";
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

  const opponentRole = getOpponentRole(myRole);
  if (opponentRole && remoteSelections[opponentRole] === card.id) {
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

  cardEl.draggable = canDrag;

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
  if (Number(card.markers || 0) > 0) {
    const markerBadge = document.createElement("div");
    markerBadge.className = "marker-badge";
    markerBadge.textContent = card.markers;
    cardEl.appendChild(markerBadge);
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

menu.appendChild(menuButton("Enviar topo ao descarte", () => {
  const pileType =
    containerKey === "deckPile" ? "mainDeck" : "trapDeck";

  socket.emit("sendTopToDiscard", {
    roomId,
    pileType
  });
}));

menu.appendChild(menuButton("Visualizar", () => openPileViewer(playerKey, containerKey)));

menu.appendChild(menuButton("Embaralhar", () => shufflePile(playerKey, containerKey)));
    }
  }

  if (state.openMenu.type === "card") {
    const { cardId, playerKey, containerKey, x, y } = state.openMenu;

    // 1. efeito
if (canUseEffect(cardId, playerKey, containerKey)) {
  menu.appendChild(menuButton("Efeito", () => triggerCardEffect(cardId)));
}

// 2. atacar
if (!PILE_CONTAINERS.includes(containerKey) && containerKey !== "hand") {
  menu.appendChild(menuButton("Atacar", () => startAttack(cardId, playerKey, containerKey)));
}

// 3. virar / girar
menu.appendChild(
  menuButton("Virar / Revelar", () => toggleFaceDown(cardId, playerKey, containerKey))
);

menu.appendChild(
  menuButton("Girar", () => toggleRotation(cardId, playerKey, containerKey))
);
if (!PILE_CONTAINERS.includes(containerKey) && containerKey !== "hand") {
  menu.appendChild(
    menuButton("Adicionar marcador", () => changeCardMarkers(cardId, playerKey, containerKey, 1))
  );

  menu.appendChild(
    menuButton("Remover marcador", () => changeCardMarkers(cardId, playerKey, containerKey, -1))
  );
}
// resto
menu.appendChild(
  menuButton("Adicionar à mão", () =>
    moveCard(cardId, playerKey, containerKey, myRole, "hand")
  )
);

menu.appendChild(
  menuButton("Voltar ao deck", () =>
    returnCardToOwnerDeck(cardId, playerKey, containerKey)
  )
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
  scheduleBoardAutoScale();
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

function shufflePile(playerKey, containerKey) {
  if (playerKey !== myRole) return;

  const pileType =
    containerKey === "deckPile" ? "mainDeck" : "trapDeck";

  socket.emit("shuffleDeck", {
    roomId,
    pileType
  });
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
function animatePileShuffle(playerKey, zoneKey) {
  const uiZone = serverZoneToUiZone(zoneKey);
  const pileZone = document.getElementById(`zone-${playerKey}-${uiZone}`);
  if (!pileZone) return;

  const pileEl = pileZone.querySelector(".pile");
  if (!pileEl) return;

  pileEl.classList.remove("shuffling");
  void pileEl.offsetWidth;
  pileEl.classList.add("shuffling");

  setTimeout(() => {
    pileEl.classList.remove("shuffling");
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

function changeCardMarkers(cardId, playerKey, containerKey, delta) {
  if (playerKey !== myRole) {
    alert("Você não pode alterar marcadores do lado do oponente.");
    return;
  }

  socket.emit("changeCardMarkers", {
    roomId,
    playerKey,
    zoneKey: uiZoneToServerZone(containerKey),
    cardId,
    delta
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
  const location = findCardLocation(cardId);

  if (!location) return;
  if (location.playerKey !== myRole) return;

  socket.emit("triggerEffectVisual", {
    roomId,
    playerKey: location.playerKey,
    zoneKey: uiZoneToServerZone(location.containerKey),
    cardId
  });
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

  socket.emit("declareAttackVisual", {
    roomId,
    fromPlayer: state.attackMode.playerKey,
    fromZone: uiZoneToServerZone(state.attackMode.containerKey),
    cardId: state.attackMode.cardId,
    targetPlayer: targetPlayerKey,
    targetZone: uiZoneToServerZone(targetContainerKey)
  });

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
  if (!element) return;

  const isPersistentHand = containerKey === "hand";

  if (isPersistentHand && element.dataset.dropBound === "true") {
    element.dataset.player = playerKey;
    element.dataset.container = containerKey;
    return;
  }

  element.dataset.player = playerKey;
  element.dataset.container = containerKey;

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
      const targetPlayer = element.dataset.player;
      const targetContainer = element.dataset.container;

      if (data.playerKey !== myRole) {
        return;
      }

      moveCard(
        data.cardId,
        data.playerKey,
        data.containerKey,
        targetPlayer,
        targetContainer
      );
    } catch (error) {
      console.error(error);
    }
  });

  if (isPersistentHand) {
    element.dataset.dropBound = "true";
  }
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
  emitMyProfile();

  socket.emit("requestChatHistory", { roomId });
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

socket.on("playersProfileUpdated", (profiles) => {
  if (!profiles) return;

  syncedProfiles.p1 = {
    name: profiles.p1?.name || "Jogador 1",
    avatar: profiles.p1?.avatar || DEFAULT_PROFILE_AVATAR
  };

  syncedProfiles.p2 = {
    name: profiles.p2?.name || "Jogador 2",
    avatar: profiles.p2?.avatar || DEFAULT_PROFILE_AVATAR
  };

  updateChatPerspectiveProfile();
  renderChatMessages();
});

socket.on("testActionReceived", (data) => {
  console.log("Ação recebida do outro jogador:", data.message);
});

socket.on("chatHistory", (messages) => {
  chatMessagesState = Array.isArray(messages) ? messages.slice(-100) : [];
  renderChatMessages();
});

socket.on("chatMessage", (message) => {
  appendChatMessage(message);
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

socket.on("handUpdated", () => {
  // fluxo desativado: a mão agora vem dentro de matchStateUpdated
});

socket.on("actionError", (data) => {
  showErrorToast(data.message || "Ocorreu um erro.");
});

socket.on("selectedCardChanged", ({ role, cardId }) => {
  remoteSelections[role] = cardId || null;
  renderBoard();
});
socket.on("visualAction", (payload) => {
  animateCardTravel(payload);
});

socket.on("effectAnimation", ({ cardId }) => {
  animateEffectByCardId(cardId);
});

socket.on("attackAnimation", (payload) => {
  animateAttackFromPayload(payload);
});

socket.on("pileShuffled", ({ playerKey, pileType }) => {
  animatePileShuffle(playerKey, pileType);
});

/* DOM EVENTS */

document.addEventListener("click", (event) => {
  const menu = document.getElementById("contextMenu");
  if (menu && !menu.contains(event.target)) {
    closeContextMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const savedZoom = localStorage.getItem("zoom");
  if (savedZoom) manualBoardZoom = parseFloat(savedZoom);
  renderDeckButtons();
  updatePerspectiveLabels();
  scheduleBoardAutoScale();
  loadProfileIntoModal();
  updateChatPerspectiveProfile();
  bindChatEvents();

  const hpInput1 = document.getElementById("hpChange1");
  const hpInput2 = document.getElementById("hpChange2");

  if (hpInput1) {
  hpInput1.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const bottomRole = getBottomVisualRole();
      changeMythicHP(bottomRole === "p1" ? 1 : 2, "subtract", "hpChange1");
    }
  });
}

if (hpInput2) {
  hpInput2.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const topRole = getTopVisualRole();
      changeMythicHP(topRole === "p1" ? 1 : 2, "subtract", "hpChange2");
    }
  });
}
});

window.addEventListener("resize", scheduleBoardAutoScale);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", scheduleBoardAutoScale);
}
window.goToDeck = goToDeck;
window.goHome = goHome;
window.openRules = openRules;
window.closeRules = closeRules;
window.closeRulesOnOverlay = closeRulesOnOverlay;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.closeProfileOnOverlay = closeProfileOnOverlay;
window.startGame = startGame;
window.zoomInBoard = zoomInBoard;
window.zoomOutBoard = zoomOutBoard;
window.resetBoardZoom = resetBoardZoom;
window.openFullPreviewFromSelection = openFullPreviewFromSelection;
window.closePileViewer = closePileViewer;
window.rollDice = rollDice;
window.flipCoin = flipCoin;
window.changeMythicHP = changeMythicHP;
window.changePA = changePA;
window.applyTurnGain = applyTurnGain;
window.shuffleHand = shuffleHand;
window.saveProfile = saveProfile;
window.closeCardPreviewOnOverlay = closeCardPreviewOnOverlay;
window.closeDeckPreview = closeDeckPreview;
window.closeDeckPreviewOnOverlay = closeDeckPreviewOnOverlay;