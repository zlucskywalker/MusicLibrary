const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Importa os dois modelos
const Cantor = require("./src/Cantor");
const Musica = require("./src/Musica");

const app = express();
const PORT = process.env.PORT || 3000;

// Substitua esta string pela sua URI de conexão do MongoDB
const DB_URI =
  "mongodb+srv://lucasjunior1905_db_user:IA9EpIPW4Al9DRQi@cluster0.f6no2sd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// --- Configuração ---
mongoose
  .connect(DB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB!"))
  .catch((err) => console.error("❌ Erro de conexão ao MongoDB:", err));

app.use(express.json());
app.use(cors());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API da Biblioteca Musical está rodando.");
});

// =======================================================
// ROTAS DE MÚSICAS
// =======================================================

// 1. [R] READ ALL: Listar todas as músicas
app.get("/musicas", async (req, res) => {
  try {
    // O .populate('cantorId', 'nome') busca o nome do cantor referenciado
    const musicas = await Musica.find().populate("cantorId", "nome");
    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar músicas." });
  }
});

// 2. [C] CREATE: Adicionar Música (endpoint que seu formulário usará)
app.post("/musicas", async (req, res) => {
  try {
    // req.body deve ter: { nomeMusica, nomeArtista, linkYoutube, cantorId }
    const novaMusica = new Musica(req.body);
    const musicaSalva = await novaMusica.save();
    res.status(201).json(musicaSalva);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Dados da música inválidos.", detalhes: err.message });
  }
});

// 3. [R] READ BY SINGER: Listar músicas por cantor (Para a seção "Por Cantores")
app.get("/musicas/cantor/:cantorId", async (req, res) => {
  try {
    const musicas = await Musica.find({
      cantorId: req.params.cantorId,
    }).populate("cantorId", "nome");
    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar músicas do cantor." });
  }
});

// =======================================================
// ROTAS DE CANTORES (Para gerenciar a lista do <select>)
// =======================================================

// 4. [R] READ ALL: Listar todos os cantores
app.get("/cantores", async (req, res) => {
  try {
    const cantores = await Cantor.find().select("nome"); // Busca apenas o nome
    res.json(cantores); // Retorna: [{_id: '...', nome: 'Ana'}, ...]
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar lista de cantores." });
  }
});

// 5. [C] CREATE: Adicionar novo cantor (Opcional: para gerenciar a lista)
app.post("/cantores", async (req, res) => {
  try {
    // req.body deve ter: { nome: 'Novo Cantor' }
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

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`🌍 Servidor rodando em http://localhost:${PORT}`);
});
