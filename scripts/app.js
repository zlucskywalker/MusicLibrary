const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Necessário para a conexão e rotas
require("dotenv").config();

// Importa os modelos de dados que você criou
const Cantor = require("./Cantor");
const Musica = require("./Musica");

const app = express();

// Configurações do servidor
app.use(cors());
app.use(express.json()); // Middleware para ler JSON nas requisições POST/PUT

const port = process.env.PORT || 3000;

// =======================================================
// CONEXÃO COM O MONGODB
// =======================================================

// Certifique-se de que a variável de ambiente DB_URI esteja configurada no seu arquivo .env
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/MusicLibraryDB";

mongoose
  .connect(DB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB!"))
  .catch((err) => {
    console.error("❌ Erro de conexão ao MongoDB:", err.message);
    // Não é ideal travar o servidor, mas é bom para debug
  });

// =======================================================
// ROTAS DA API (CRUD)
// =======================================================

// Rota de teste
app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca Musical está rodando!" });
});

// --- ROTAS DE CANTORES ---

// 1. [R] READ ALL: Listar todos os cantores (Usado para popular os <select>)
app.get("/cantores", async (req, res) => {
  try {
    const cantores = await Cantor.find().select("nome");
    res.json(cantores);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar lista de cantores." });
  }
});

// 2. [C] CREATE: Adicionar novo cantor (Opcional, mas útil para gerenciar a lista)
app.post("/cantores", async (req, res) => {
  try {
    const novoCantor = new Cantor(req.body);
    const cantorSalvo = await novoCantor.save();
    res.status(201).json(cantorSalvo);
  } catch (err) {
    res
      .status(400)
      .json({
        erro: "Cantor já existe ou nome inválido.",
        detalhes: err.message,
      });
  }
});

// --- ROTAS DE MÚSICAS ---

// 3. [R] READ ALL: Listar todas as músicas (Usado pela ListagemMusicas)
app.get("/musicas", async (req, res) => {
  try {
    // Usa .populate para trazer o nome do cantor referenciado
    const musicas = await Musica.find().populate("cantorId", "nome");
    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar músicas." });
  }
});

// 4. [C] CREATE: Adicionar Música (Usado pelo formulário do frontend)
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

// 5. [R] READ BY SINGER: Listar músicas por cantor (Usado pelo Filtro 'Por Cantores')
app.get("/musicas/cantor/:cantorId", async (req, res) => {
  try {
    const musicas = await Musica.find({
      cantorId: req.params.cantorId,
    }).populate("cantorId", "nome"); // Traz o nome do cantor
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
