const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Importa os modelos de dados
const Cantor = require("../src/Cantor.js");
const Musica = require("../src/Musica.js");

const app = express();

// URL do github pages
const allowedOrigins = [
  "https://zlucskywalker.github.io",
  "http://localhost:3000", //  para testes locais
];

const corsOptions = {
  origin: function (origin, callback) {
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 3000;

// =======================================================
// CONEXÃO COM O MONGODB
// =======================================================

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/MusicLibraryDB";

mongoose
  .connect(DB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB!"))
  .catch((err) => {
    console.error("❌ Erro de conexão ao MongoDB:", err.message);
  });

// =======================================================
// ROTAS DA API (CRUD)
// =======================================================

// Rota de teste
app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca Musical está rodando!" });
});

// --- ROTAS DE CANTORES ---

// 1. Listar todos os cantores
app.get("/cantores", async (req, res) => {
  try {
    // Usa o .select("nome") para buscar apenas o campo 'nome'
    const cantores = await Cantor.find().select("nome");
    res.json(cantores);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar lista de cantores." });
  }
});

// 2. CREATE: Adicionar novo cantor
app.post("/cantores", async (req, res) => {
  try {
    const novoCantor = new Cantor(req.body);
    const cantorSalvo = await novoCantor.save();
    res.status(201).json(cantorSalvo);
  } catch (err) {
    res.status(400).json({
      erro: "Cantor já existe ou nome inválido.",
      detalhes: err.message,
    });
  }
});

// --- ROTAS DE MÚSICAS ---

// 3. Listar todas as músicas (Usado pela ListagemMusicas) - ORDENAÇÃO AQUI
app.get("/musicas", async (req, res) => {
  try {
    // Adiciona .sort({ nomeMusica: 1 }) para ordenar A-Z
    const musicas = await Musica.find()
      .populate("cantorId", "nome")
      .sort({ nomeMusica: 1 }); // <--- CORRIGIDO: ORDENAÇÃO ALFABÉTICA

    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar músicas." });
  }
});

// 4. CREATE: Adicionar Música (Usado pelo formulário do frontend)
app.post("/musicas", async (req, res) => {
  try {
    const novaMusica = new Musica(req.body);
    const musicaSalva = await novaMusica.save();
    res.status(201).json(musicaSalva);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Dados da música inválidos.", detalhes: err.message });
  }
});

// 5. Listar músicas por cantor (Usado pelo Filtro 'Por Cantores') - ORDENAÇÃO AQUI
app.get("/musicas/cantor/:cantorId", async (req, res) => {
  try {
    // Adiciona .sort({ nomeMusica: 1 }) para ordenar A-Z
    const musicas = await Musica.find({
      cantorId: req.params.cantorId,
    })
      .populate("cantorId", "nome")
      .sort({ nomeMusica: 1 }); // <--- CORRIGIDO: ORDENAÇÃO ALFABÉTICA

    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar músicas do cantor." });
  }
});

// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
