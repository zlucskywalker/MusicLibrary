const mongoose = require("mongoose");

const dbUser = process.env.DB_USER;

const dbPassword = process.env.DB_PASS;

const connect = () => {
  mongoose.connect(
    "mongodb+srv://lucasjunior1905_db_user:IA9EpIPW4Al9DRQi@cluster0.f6no2sd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );

  const connection = mongoose.connection;

  connection.on("error", () =>
    console.log("Erro ao conectar no banco de dados")
  );

  connection.once("open", () =>
    console.log("Conexão com o banco de dados realizada com sucesso")
  );
};
module.exports = mongoose;
