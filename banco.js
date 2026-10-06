// Importa o módulo do MySQL
const mysql = require("mysql2");

// Importa o dotenv para ler o arquivo .env
require("dotenv").config();

// Cria a conexão com o banco
const banco = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Testa a conexão
banco.connect(function(erro) {

    if (erro) {
        console.log("Erro ao conectar com o banco de dados.");
        console.log(erro.message);
        return;
    }

    console.log("Banco de dados conectado!");
});

// Exporta a conexão
module.exports = banco;