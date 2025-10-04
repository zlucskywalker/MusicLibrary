const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Importa os modelos de dados
const Cantor = require("./Cantor");
const Musica = require("./Musica");

const app = express();

// =======================================================
// CORREÇÃO DO CORS (Permite requisições do GitHub Pages)
// =======================================================

// Sua URL do Frontend no GitHub Pages:
const allowedOrigins = [
    'https://zlucskywalker.github.io', 
    'http://localhost:3000' // Mantido para testes locais
];

const corsOptions = {
    origin: function (origin, callback) {
        // Verifica se a origem está na lista de permitidas
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions)); // APLICA o CORS corrigido
app.use(express.json()); // Middleware para ler JSON nas requisições POST/PUT
// =======================================================

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

// 1. [R] READ ALL: Listar todos os cantores (Usado para popular os <select>)
app.get("/cantores", async (req, res) => {
    try {
        // Usa o .select("nome") para buscar apenas o campo 'nome'
        const cantores = await Cantor.find().select("nome");
        res.json(cantores);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar lista de cantores." });
    }
});

// 2. [C] CREATE: Adicionar novo cantor
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

