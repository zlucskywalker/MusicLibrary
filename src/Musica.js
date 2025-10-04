const mongoose = require("mongoose");

const MusicaSchema = new mongoose.Schema({
  // Nome da Música
  nomeMusica: {
    type: String,
    required: true,
    trim: true,
  },
  // Nome do Artista Original (Ex: Gabriela Rocha, Davi Sacer)
  nomeArtista: {
    type: String,
    required: true,
    trim: true,
  },
  // Link do Youtube
  linkYoutube: {
    type: String,
    required: true,
    trim: true,
  },
  // Referência ao Cantor/Vocalista que irá cantar
  // O 'ref: Cantor' liga este campo ao modelo Cantor que criamos
  cantorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cantor",
    required: true,
  },
  dataAdicao: {
    type: Date,
    default: Date.now,
  },
});

const Musica = mongoose.model("Musica", MusicaSchema);
module.exports = Musica;
