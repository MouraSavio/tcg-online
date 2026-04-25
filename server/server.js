const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

const PHASE_ORDER = ["IT", "FC", "F1", "FB", "F2", "FT"];

const BOARD_ZONES = [
  "hand",
  "discardPile",
  "mythic",
  "creature1",
  "creature2",
  "creature3",
  "field",
  "magic1",
  "magic2",
  "magic3",
  "magic4",
  "mainDeck",
  "trapDeck"
];

const SERVER_DECKS = {
  fogo: {
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
    mythic: "terrakhor-soberano",

    creatures: [
      "draco-rex-duas-cabeças","draco-rex-duas-cabeças",
      "e1-ferralite","e2-ferradon","e3-ferragron",
      "hipnodon","hipnodon",
      "rex","rex",
      "rex-ataque","rex-defesa",
      "rinagron","rinagron",
      "rinodon","rinodon"
    ],

    spells: [
      "armadura-nucleo-aço","bencao-milagrosa","compra-graciosa",
      "evolucao-forcada","lupa-milagrosa","pesquisa-arcana",
      "pisoteio-mortal","pocao-mana","pote-ambicao","pote-gula",
      "quebra-feitico","renascimento-sagrado","retorno-fluxo-arcano",
      "sede-poder","terra-sagrada"
    ],

    traps: [
      "aprisionamento-eterno","chamado-cova","contragolpe",
      "defesa-impenetravel","encerramento-forcado",
      "julgamento-divino","ofensiva-quebrada",
      "rajada-mortal","reversao-espelho","união-evolucao"
    ]
  },

  "cassino-goblin": {
    mythic: "terrakhor-soberano",

    creatures: [
      "brutong-ogro-cassino",
      "duende-cassino","duende-cassino",
      "durgan-contador-cassino",
      "fada-fortuna-cassino",
      "goblin-cassino","goblin-cassino",
      "rato-cassino","rato-cassino",
      "taigar-cobrador-cassino",
      "velkrin-magnata-cassino",
      "vurkal-rei-cassino"
    ],

    spells: [
      "claw-win","grande-cassino-goblin","jackpot-machine",
      "jackpot-royal-flush","jackpot-triple-six",
      "maquina-caca-niquel-goblin","mesa-fortuna",
      "pocao-mana","pote-gula","quebra-feitico",
      "retorno-fluxo-arcano","roleta-azar","roleta-fortuna",
      "sede-poder","terra-sagrada","pote-ambicao",
      "renascimento-sagrado","compra-graciosa"
    ],

    traps: [
      "casa-sempre-ganha","cobranca-tigre","deu-zebra",
      "expulsao-ogro","julgamento-divino","servindo-casa",
      "trapaca-dados","trapaca-duendes","trapaca-moeda",
      "ultimas-consequencias"
    ]
  },
  
  vento: {
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

app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function serverUid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeServerCard(name, type, deckKey, ownerRole) {
  return {
    id: serverUid(),
    name,
    type,
    deckKey,
    ownerRole,
    faceDown: false,
    rotated: false,
    markers: 0
  };
}

function serializeCards(cards) {
  return (cards || []).map((card) => ({
    id: card.id,
    name: card.name,
    type: card.type,
    deckKey: card.deckKey,
    ownerRole: card.ownerRole,
    faceDown: !!card.faceDown,
    rotated: !!card.rotated,
    markers: Number(card.markers || 0)
  }));
}
function serializeCard(card) {
  if (!card) return null;

  return {
    id: card.id,
    name: card.name,
    type: card.type,
    deckKey: card.deckKey,
    ownerRole: card.ownerRole,
    faceDown: !!card.faceDown,
    rotated: !!card.rotated,
    markers: Number(card.markers || 0)
  };
}
function buildMythicCard(deckKey, ownerRole) {
  const deck = SERVER_DECKS[deckKey];
  if (!deck) return null;

  return makeServerCard(deck.mythic, "mythic", deckKey, ownerRole);
}

function createPlayerZones(deckKey) {
  return {
    deckKey,
    mainDeck: [],
    hand: [],
    trapDeck: [],
    discardPile: [],
    mythic: [],
    creature1: [],
    creature2: [],
    creature3: [],
    field: [],
    magic1: [],
    magic2: [],
    magic3: [],
    magic4: [],
    hp: 500,
    pa: 0
  };
}

function createMatchState(room) {
  const p1DeckKey = room.deckSelections.p1;
  const p2DeckKey = room.deckSelections.p2;

  return {
    started: true,
    currentTurn: "p1",
    currentPhase: "IT",
    players: {
      p1: createPlayerZones(p1DeckKey),
      p2: createPlayerZones(p2DeckKey)
    }
  };
}

function buildDeckState(deckKey, ownerRole) {
  const deck = SERVER_DECKS[deckKey];

  if (!deck) {
    return {
      mainDeck: [],
      trapDeck: []
    };
  }

  const mainDeck = [
    ...deck.creatures.map((name) => makeServerCard(name, "creature", deckKey, ownerRole)),
    ...deck.spells.map((name) => makeServerCard(name, "spell", deckKey, ownerRole))
  ];

  const trapDeck = deck.traps.map((name) =>
    makeServerCard(name, "trap", deckKey, ownerRole)
  );

  return {
    mainDeck: shuffle(mainDeck),
    trapDeck: shuffle(trapDeck)
  };
}

function getPublicMatchState(matchState) {
  if (!matchState) return null;

  return {
    started: matchState.started,
    currentTurn: matchState.currentTurn,
    currentPhase: matchState.currentPhase,
    players: {
      p1: {
        deckKey: matchState.players.p1.deckKey,
        mainDeckCount: matchState.players.p1.mainDeck.length,
        handCount: matchState.players.p1.hand.length,
        trapDeckCount: matchState.players.p1.trapDeck.length,
        discardCount: matchState.players.p1.discardPile.length,
        discardPile: serializeCards(matchState.players.p1.discardPile),
        mythic: serializeCards(matchState.players.p1.mythic),
        creature1: serializeCards(matchState.players.p1.creature1),
        creature2: serializeCards(matchState.players.p1.creature2),
        creature3: serializeCards(matchState.players.p1.creature3),
        field: serializeCards(matchState.players.p1.field),
        magic1: serializeCards(matchState.players.p1.magic1),
        magic2: serializeCards(matchState.players.p1.magic2),
        magic3: serializeCards(matchState.players.p1.magic3),
        magic4: serializeCards(matchState.players.p1.magic4),
        hp: matchState.players.p1.hp,
        pa: matchState.players.p1.pa
      },
      p2: {
        deckKey: matchState.players.p2.deckKey,
        mainDeckCount: matchState.players.p2.mainDeck.length,
        handCount: matchState.players.p2.hand.length,
        trapDeckCount: matchState.players.p2.trapDeck.length,
        discardCount: matchState.players.p2.discardPile.length,
        discardPile: serializeCards(matchState.players.p2.discardPile),
        mythic: serializeCards(matchState.players.p2.mythic),
        creature1: serializeCards(matchState.players.p2.creature1),
        creature2: serializeCards(matchState.players.p2.creature2),
        creature3: serializeCards(matchState.players.p2.creature3),
        field: serializeCards(matchState.players.p2.field),
        magic1: serializeCards(matchState.players.p2.magic1),
        magic2: serializeCards(matchState.players.p2.magic2),
        magic3: serializeCards(matchState.players.p2.magic3),
        magic4: serializeCards(matchState.players.p2.magic4),
        hp: matchState.players.p2.hp,
        pa: matchState.players.p2.pa
      }
    }
  };
}
function getMatchStateForRole(matchState, role) {
  const publicState = getPublicMatchState(matchState);
  if (!publicState || !role || !publicState.players[role]) return publicState;

  publicState.players[role].hand = serializeCards(
    matchState.players[role].hand || []
  );

  return publicState;
}
function canAdvanceToPhase(currentPhase, targetPhase) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const targetIndex = PHASE_ORDER.indexOf(targetPhase);

  if (currentIndex === -1 || targetIndex === -1) return false;
  return targetIndex > currentIndex;
}

function getOpponentRole(role) {
  return role === "p1" ? "p2" : "p1";
}

function getRoomAndPlayer(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.players.find((p) => p.socketId === socketId);
  if (!player) return null;

  return { room, player };
}

function getZoneArray(playerState, zoneName) {
  if (!playerState) return null;
  if (!BOARD_ZONES.includes(zoneName)) return null;
  return playerState[zoneName] || null;
}

function removeCardFromZone(zone, cardId) {
  const index = zone.findIndex((card) => card.id === cardId);
  if (index === -1) return null;
  return zone.splice(index, 1)[0];
}

function findCardAcrossPlayerZones(playerState, cardId) {
  if (!playerState) return null;

  for (const zoneName of BOARD_ZONES) {
    const zone = getZoneArray(playerState, zoneName);
    if (!zone) continue;

    const index = zone.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return {
        zoneName,
        zone,
        index,
        card: zone[index]
      };
    }
  }

  return null;
}

function emitPrivatePileView(socket, playerRole, playerState, pileType) {
  if (!socket || !playerState) return;
  if (pileType !== "mainDeck" && pileType !== "trapDeck") return;

  socket.emit("privatePileViewData", {
    playerKey: playerRole,
    pileType,
    cards: serializeCards(playerState[pileType] || [])
  });
}

function emitRoomState(roomId, room) {
  const p1Socket = room.players.find((p) => p.role === "p1")?.socketId;
  const p2Socket = room.players.find((p) => p.role === "p2")?.socketId;

  if (p1Socket) {
    io.to(p1Socket).emit(
      "matchStateUpdated",
      getMatchStateForRole(room.matchState, "p1")
    );
  }

  if (p2Socket) {
    io.to(p2Socket).emit(
      "matchStateUpdated",
      getMatchStateForRole(room.matchState, "p2")
    );
  }
}

function emitRoomProfiles(roomId, room) {
  const p1 = room.players.find((p) => p.role === "p1");
  const p2 = room.players.find((p) => p.role === "p2");

  io.to(roomId).emit("playersProfileUpdated", {
    p1: {
      name: p1?.name || "",
      avatar: p1?.avatar || ""
    },
    p2: {
      name: p2?.name || "",
      avatar: p2?.avatar || ""
    }
  });
}

function startRoomMatch(roomId, room) {
  room.matchState = createMatchState(room);

  const p1Decks = buildDeckState(room.deckSelections.p1, "p1");
  const p2Decks = buildDeckState(room.deckSelections.p2, "p2");

  room.matchState.players.p1.mainDeck = p1Decks.mainDeck;
  room.matchState.players.p1.trapDeck = p1Decks.trapDeck;
  room.matchState.players.p2.mainDeck = p2Decks.mainDeck;
  room.matchState.players.p2.trapDeck = p2Decks.trapDeck;

  const p1Mythic = buildMythicCard(room.deckSelections.p1, "p1");
  if (p1Mythic) room.matchState.players.p1.mythic.push(p1Mythic);

  const p2Mythic = buildMythicCard(room.deckSelections.p2, "p2");
  if (p2Mythic) room.matchState.players.p2.mythic.push(p2Mythic);

  if (room.matchState.players.p1.mainDeck.length > 0) {
    room.matchState.players.p1.hand.push(room.matchState.players.p1.mainDeck.pop());
  }
  if (room.matchState.players.p2.mainDeck.length > 0) {
    room.matchState.players.p2.hand.push(room.matchState.players.p2.mainDeck.pop());
  }

  io.to(roomId).emit("startMatch", {
    decks: room.deckSelections,
    matchState: getPublicMatchState(room.matchState)
  });
}

io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  socket.on("joinRoom", (roomId) => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
    players: [],
    deckSelections: {},
    ready: {},
    matchState: null,
    chatMessages: []
  };
}

    const room = rooms[roomId];

    if (room.players.length >= 2) {
      socket.emit("roomFull");
      console.log(`Sala ${roomId} cheia. Jogador ${socket.id} recusado.`);
      return;
    }

    if (!room.players.find((player) => player.socketId === socket.id)) {
      const role = room.players.length === 0 ? "p1" : "p2";

      room.players.push({
        socketId: socket.id,
        role,
         name: "",
         avatar: ""
      });

      socket.join(roomId);
      socket.emit("playerRole", role);

      console.log(`Jogador ${socket.id} entrou na sala ${roomId} como ${role}`);
    }

    io.to(roomId).emit("playersInRoom", room.players);
    emitRoomProfiles(roomId, room);
  });

  socket.on("testAction", ({ roomId, message }) => {
    console.log(`Ação de teste na sala ${roomId}: ${message}`);

    socket.to(roomId).emit("testActionReceived", {
      from: socket.id,
      message
    });
  });

  socket.on("selectDeck", ({ roomId, deck }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    room.deckSelections[player.role] = deck;

    console.log(`Sala ${roomId}: ${player.role} escolheu o deck ${deck}`);
    io.to(roomId).emit("deckSelectionsUpdated", room.deckSelections);
  });

    socket.on("setProfile", ({ roomId, name, avatar }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    player.name = typeof name === "string" ? name.trim().slice(0, 20) : "";
    player.avatar = typeof avatar === "string" ? avatar.trim() : "";

    emitRoomProfiles(roomId, room);
  });

    socket.on("requestChatHistory", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    socket.emit("chatHistory", room.chatMessages || []);
  });

  socket.on("sendChatMessage", ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    const cleanText =
      typeof text === "string" ? text.trim().replace(/\s+/g, " ").slice(0, 180) : "";

    if (!cleanText) return;

    const message = {
      id: serverUid(),
      senderRole: player.role,
      text: cleanText,
      createdAt: Date.now()
    };

    room.chatMessages.push(message);

    if (room.chatMessages.length > 100) {
      room.chatMessages = room.chatMessages.slice(-100);
    }

    io.to(roomId).emit("chatMessage", message);
  });

  socket.on("playerReady", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    room.ready[player.role] = true;
    if (room.deckSelections.p1 && room.deckSelections.p2) {
      room.ready.p1 = true;
      room.ready.p2 = true;
    } else {
      room.ready[player.role] = true;
    }

    console.log(`Sala ${roomId}: ${player.role} está pronto`);
    io.to(roomId).emit("readyStatus", room.ready);

    if (room.ready.p1 && room.ready.p2) {
      startRoomMatch(roomId, room);
    }
  });

  socket.on("surrenderMatch", ({ roomId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;
    const { player } = result;

    const winner = getOpponentRole(player.role);
    io.to(roomId).emit("matchEnded", {
      winner,
      loser: player.role,
      reason: "surrender"
    });
  });

  socket.on("requestRematch", ({ roomId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;
    const { room } = result;

    if (!room.deckSelections.p1 || !room.deckSelections.p2) return;
    startRoomMatch(roomId, room);
  });

  socket.on("returnToDeckSelection", ({ roomId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;
    const { room } = result;

    room.ready = {};
    room.matchState = null;

    io.to(roomId).emit("goToDeckSelection");
    io.to(roomId).emit("readyStatus", room.ready);
  });

  socket.on("requestPrivatePileView", ({ roomId, pileType }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;

    if (pileType !== "mainDeck" && pileType !== "trapDeck") {
      socket.emit("actionError", {
        message: "Tipo de pilha privada inválido."
      });
      return;
    }

    const playerState = room.matchState.players[player.role];
    if (!playerState) return;

    emitPrivatePileView(socket, player.role, playerState, pileType);
  });

  socket.on("drawCard", ({ roomId, pileType }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;

    const playerState = room.matchState.players[player.role];
    if (!playerState) return;

    if (pileType === "trapDeck") {
      if (playerState.trapDeck.length === 0) {
        socket.emit("actionError", {
          message: "Seu deck de armadilha está vazio."
        });
        return;
      }

      const drawnTrap = playerState.trapDeck.pop();
playerState.hand.push(drawnTrap);

io.to(roomId).emit("visualAction", {
  kind: "draw",
  card: serializeCard(drawnTrap),
  fromPlayer: player.role,
  fromZone: "trapDeck",
  toPlayer: player.role,
  toZone: "hand"
});

console.log(`Sala ${roomId}: ${player.role} puxou 1 carta do deck de armadilha`);
emitRoomState(roomId, room);
emitPrivatePileView(socket, player.role, playerState, "trapDeck");
return;
    }

    if (playerState.mainDeck.length === 0) {
      socket.emit("actionError", {
        message: "Seu deck principal está vazio."
      });
      return;
    }

    const drawnCard = playerState.mainDeck.pop();
playerState.hand.push(drawnCard);

io.to(roomId).emit("visualAction", {
  kind: "draw",
  card: serializeCard(drawnCard),
  fromPlayer: player.role,
  fromZone: "mainDeck",
  toPlayer: player.role,
  toZone: "hand"
});

console.log(`Sala ${roomId}: ${player.role} comprou 1 carta`);
emitRoomState(roomId, room);
emitPrivatePileView(socket, player.role, playerState, "mainDeck");
  });

  socket.on("moveCardSandbox", ({ roomId, fromPlayer, fromZone, toPlayer, toZone, cardId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;

    if (!["p1", "p2"].includes(fromPlayer) || !["p1", "p2"].includes(toPlayer)) {
      socket.emit("actionError", { message: "Jogador de origem/destino inválido." });
      return;
    }

    const fromPlayerState = room.matchState.players[fromPlayer];
    const toPlayerState = room.matchState.players[toPlayer];

    const toArray = getZoneArray(toPlayerState, toZone);

    if (!toArray) {
      socket.emit("actionError", { message: "Zona de destino inválida." });
      return;
    }

    if (fromPlayer !== player.role) {
      socket.emit("actionError", { message: "Você não pode pegar cartas do lado do oponente." });
      return;
    }

    let card = null;
    let actualFromZone = fromZone;

    const declaredFromArray = getZoneArray(fromPlayerState, fromZone);

    if (declaredFromArray) {
      card = removeCardFromZone(declaredFromArray, cardId);
    }

    if (!card) {
      const foundAnywhere = findCardAcrossPlayerZones(fromPlayerState, cardId);

      if (!foundAnywhere) {
        socket.emit("actionError", { message: "Carta não encontrada na zona de origem." });
        return;
      }

      actualFromZone = foundAnywhere.zoneName;
      card = removeCardFromZone(foundAnywhere.zone, cardId);
    }

    if (!card) {
      socket.emit("actionError", { message: "Carta não encontrada na zona de origem." });
      return;
    }

    // regra: toda carta que vai para descarte fica face up e desvirada
if (toZone === "discardPile") {
  card.faceDown = false;
  card.rotated = false;
}

toArray.push(card);

io.to(roomId).emit("visualAction", {
  kind: "move",
  card: serializeCard(card),
  fromPlayer,
  fromZone: actualFromZone,
  toPlayer,
  toZone
});

console.log(
  `Sala ${roomId}: ${player.role} moveu carta ${cardId} de ${fromPlayer}.${actualFromZone} para ${toPlayer}.${toZone}`
);

emitRoomState(roomId, room);

    if (fromPlayer === player.role && (actualFromZone === "mainDeck" || actualFromZone === "trapDeck")) {
      emitPrivatePileView(socket, player.role, fromPlayerState, actualFromZone);
    }

    if (toPlayer === player.role && (toZone === "mainDeck" || toZone === "trapDeck")) {
      emitPrivatePileView(socket, player.role, toPlayerState, toZone);
    }
  });

  socket.on("setCardFaceDown", ({ roomId, playerKey, zoneKey, cardId, faceDown }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;
    if (playerKey !== player.role) return;

    const zone = getZoneArray(room.matchState.players[playerKey], zoneKey);
    if (!zone) return;

    const card = zone.find((c) => c.id === cardId);
    if (!card) return;

    card.faceDown = !!faceDown;
    emitRoomState(roomId, room);
  });
  socket.on("shuffleDeck", ({ roomId, pileType }) => {
  const result = getRoomAndPlayer(roomId, socket.id);
  if (!result) return;

  const { room, player } = result;
  if (!room.matchState) return;

  const playerState = room.matchState.players[player.role];
  if (!playerState) return;

  if (pileType !== "mainDeck" && pileType !== "trapDeck") return;

  playerState[pileType] = shuffle(playerState[pileType]);

  console.log(`Sala ${roomId}: ${player.role} embaralhou ${pileType}`);

  emitRoomState(roomId, room);
  emitPrivatePileView(socket, player.role, playerState, pileType);

  setTimeout(() => {
    io.to(roomId).emit("pileShuffled", {
      playerKey: player.role,
      pileType
    });
  }, 40);
});

  socket.on("setCardRotation", ({ roomId, playerKey, zoneKey, cardId, rotated }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;
    if (playerKey !== player.role) return;

    const zone = getZoneArray(room.matchState.players[playerKey], zoneKey);
    if (!zone) return;

    const card = zone.find((c) => c.id === cardId);
    if (!card) return;

    card.rotated = !!rotated;
    emitRoomState(roomId, room);
  });
  socket.on("changeCardMarkers", ({ roomId, playerKey, zoneKey, cardId, delta }) => {
  const result = getRoomAndPlayer(roomId, socket.id);
  if (!result) return;

  const { room, player } = result;
  if (!room.matchState) return;
  if (playerKey !== player.role) return;

  const zone = getZoneArray(room.matchState.players[playerKey], zoneKey);
  if (!zone) return;

  const card = zone.find((c) => c.id === cardId);
  if (!card) return;

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

  if (!allowedZones.includes(zoneKey)) return;

  const amount = Number(delta);
  if (!Number.isFinite(amount)) return;

  const current = Number(card.markers || 0);
  card.markers = Math.max(0, Math.min(10, current + amount));

  emitRoomState(roomId, room);
});
  socket.on("triggerEffectVisual", ({ roomId, playerKey, zoneKey, cardId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;
    if (playerKey !== player.role) return;

    const zone = getZoneArray(room.matchState.players[playerKey], zoneKey);
    if (!zone) return;

    const card = zone.find((c) => c.id === cardId);
    if (!card) return;
    if (card.faceDown) return;

    io.to(roomId).emit("effectAnimation", {
      playerKey,
      zoneKey,
      cardId
    });
  });
    socket.on(
    "declareAttackVisual",
    ({ roomId, fromPlayer, fromZone, cardId, targetPlayer, targetZone }) => {
      const result = getRoomAndPlayer(roomId, socket.id);
      if (!result) return;

      const { room, player } = result;
      if (!room.matchState) return;
      if (fromPlayer !== player.role) return;

      const sourceZone = getZoneArray(room.matchState.players[fromPlayer], fromZone);
      if (!sourceZone) return;

      const card = sourceZone.find((c) => c.id === cardId);
      if (!card) return;

      const destinationZone = getZoneArray(room.matchState.players[targetPlayer], targetZone);
      if (!destinationZone && targetZone !== "hand") return;

      io.to(roomId).emit("attackAnimation", {
        fromPlayer,
        fromZone,
        cardId,
        targetPlayer,
        targetZone
      });
    }
  );
  socket.on("selectCardSync", ({ roomId, cardId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { player } = result;

    io.to(roomId).emit("selectedCardChanged", {
      role: player.role,
      cardId
    });
  });
  socket.on("sendTopToDiscard", ({ roomId, pileType }) => {
  const result = getRoomAndPlayer(roomId, socket.id);
  if (!result) return;

  const { room, player } = result;
  if (!room.matchState) return;

  const playerState = room.matchState.players[player.role];
  if (!playerState) return;

  if (pileType !== "mainDeck" && pileType !== "trapDeck") return;

  const pile = playerState[pileType];

  if (!pile.length) {
    socket.emit("actionError", { message: "Pilha vazia." });
    return;
  }

  const card = pile.pop();

  // sempre face up no descarte
  card.faceDown = false;
  card.rotated = false;

  playerState.discardPile.push(card);

  io.to(roomId).emit("visualAction", {
    kind: "move",
    card: serializeCard(card),
    fromPlayer: player.role,
    fromZone: pileType,
    toPlayer: player.role,
    toZone: "discardPile"
  });

  emitRoomState(roomId, room);
  emitPrivatePileView(socket, player.role, playerState, pileType);
});

  socket.on("advancePhase", ({ roomId, targetPhase }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room, player } = result;
    if (!room.matchState) return;

    const matchState = room.matchState;

    if (matchState.currentTurn !== player.role) {
      socket.emit("actionError", {
        message: "Não é o seu turno."
      });
      return;
    }

    if (!canAdvanceToPhase(matchState.currentPhase, targetPhase)) {
      socket.emit("actionError", {
        message: "Você não pode voltar ou repetir uma fase anterior."
      });
      return;
    }

    if (targetPhase === "FT") {
      matchState.currentPhase = "IT";
      matchState.currentTurn = getOpponentRole(player.role);

      console.log(`Sala ${roomId}: turno passou para ${matchState.currentTurn}`);
    } else {
      matchState.currentPhase = targetPhase;
      console.log(`Sala ${roomId}: ${player.role} avançou para a fase ${targetPhase}`);
    }

    io.to(roomId).emit("matchStateUpdated", getPublicMatchState(matchState));
  });

  socket.on("changeMythicHP", ({ roomId, targetPlayer, operation, amount }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room } = result;
    if (!room.matchState) return;

    if (!room.matchState.players[targetPlayer]) {
      socket.emit("actionError", {
        message: "Jogador alvo inválido."
      });
      return;
    }

    const value = Number(amount);

    if (!Number.isFinite(value) || value < 0) {
      socket.emit("actionError", {
        message: "Valor de HP inválido."
      });
      return;
    }

    const playerState = room.matchState.players[targetPlayer];

    if (operation === "subtract") {
      playerState.hp = Math.max(0, Math.min(500, playerState.hp - value));
    } else if (operation === "add") {
      playerState.hp = Math.max(0, Math.min(500, playerState.hp + value));
    } else {
      socket.emit("actionError", {
        message: "Operação de HP inválida."
      });
      return;
    }

    console.log(`Sala ${roomId}: HP de ${targetPlayer} agora é ${playerState.hp}`);
    io.to(roomId).emit("matchStateUpdated", getPublicMatchState(room.matchState));
  });

  socket.on("changePA", ({ roomId, targetPlayer, amount }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const { room } = result;
    if (!room.matchState) return;

    if (!room.matchState.players[targetPlayer]) {
      socket.emit("actionError", {
        message: "Jogador alvo inválido."
      });
      return;
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) {
      socket.emit("actionError", {
        message: "Valor de PA inválido."
      });
      return;
    }

    const playerState = room.matchState.players[targetPlayer];
    playerState.pa = Math.max(0, Math.min(12, playerState.pa + value));

    console.log(`Sala ${roomId}: PA de ${targetPlayer} agora é ${playerState.pa}`);
    io.to(roomId).emit("matchStateUpdated", getPublicMatchState(room.matchState));
  });

  socket.on("rollDice", ({ roomId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;

    io.to(roomId).emit("diceRolled", {
      value: diceValue
    });
  });

  socket.on("flipCoin", ({ roomId }) => {
    const result = getRoomAndPlayer(roomId, socket.id);
    if (!result) return;

    const coinValue = Math.random() < 0.5 ? "Cara" : "Coroa";

    io.to(roomId).emit("coinFlipped", {
      value: coinValue
    });
  });

  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      room.players = room.players.filter((player) => player.socketId !== socket.id);

      if (room.deckSelections) {
        if (room.deckSelections.p1 && !room.players.find((p) => p.role === "p1")) {
          delete room.deckSelections.p1;
        }

        if (room.deckSelections.p2 && !room.players.find((p) => p.role === "p2")) {
          delete room.deckSelections.p2;
        }
      }

      if (room.ready) {
        if (!room.players.find((p) => p.role === "p1")) {
          delete room.ready.p1;
        }

        if (!room.players.find((p) => p.role === "p2")) {
          delete room.ready.p2;
        }
      }

      if (room.matchState) {
        if (!room.players.find((p) => p.role === "p1")) {
          room.matchState = null;
        }

        if (!room.players.find((p) => p.role === "p2")) {
          room.matchState = null;
        }
      }

      io.to(roomId).emit("playersInRoom", room.players);
      io.to(roomId).emit("deckSelectionsUpdated", room.deckSelections);
      io.to(roomId).emit("readyStatus", room.ready);
      emitRoomProfiles(roomId, room);

      if (room.players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});