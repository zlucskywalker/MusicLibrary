const mongoose = require("mongoose");

const CantorSchema = new mongoose.Schema({
  // Nome do cantor/vocalista que está na sua lista <select>
  nome: {
    type: String,
    required: true,
    unique: true, // Garante que não teremos nomes duplicados
    trim: true,
  },
  // Você pode adicionar mais informações sobre o vocalista aqui
});

const Cantor = mongoose.model("Cantor", CantorSchema);
module.exports = Cantor;
