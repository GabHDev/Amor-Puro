// Importa o Express
const express = require("express");

// Importa o CORS
const cors = require("cors");

// Importa o banco de dados
const banco = require("./banco");

// Cria o servidor
const app = express();

// Permite que o site converse com o servidor
app.use(cors());

// Permite receber dados em JSON
app.use(express.json());


// =========================================
// TESTE DO SERVIDOR
// =========================================

app.get("/", function(req, res) {
    res.send("Servidor do Núcleo de Triagem funcionando!");
});


// =========================================
// LISTAR PACIENTES
// =========================================

app.get("/pacientes", function(req, res) {

    const sql = "SELECT * FROM pacientes";

    banco.query(sql, function(erro, resultado) {

        if (erro) {
            res.status(500).json({
                erro: "Erro ao buscar pacientes"
            });

            return;
        }

        res.json(resultado);
    });
});


// =========================================
// CADASTRAR PACIENTE
// =========================================

app.post("/pacientes", function(req, res) {

    const dados = req.body;

    const sql = `
        INSERT INTO pacientes
        (
            nome,
            nome_social,
            nascimento,
            cpf,
            rg,
            sus,
            govbr,
            telefone,
            tipo_sanguineo,
            cep,
            rua,
            numero,
            bairro,
            cidade,
            uf,
            alergias,
            doencas,
            outras_informacoes,
            medicamentos,
            emergencia_nome,
            emergencia_parentesco,
            emergencia_telefone,
            senha,
            consentimento
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dados.nome,
        dados.nome_social,
        dados.nascimento,
        dados.cpf,
        dados.rg,
        dados.sus,
        dados.govbr,
        dados.telefone,
        dados.tipo_sanguineo,
        dados.cep,
        dados.rua,
        dados.numero,
        dados.bairro,
        dados.cidade,
        dados.uf,
        dados.alergias,
        dados.doencas,
        dados.outras_informacoes,
        dados.medicamentos,
        dados.emergencia_nome,
        dados.emergencia_parentesco,
        dados.emergencia_telefone,
        dados.senha,
        dados.consentimento
    ];

    banco.query(sql, valores, function(erro, resultado) {

        if (erro) {
            console.log(erro);

            res.status(500).json({
                erro: "Não foi possível cadastrar o paciente"
            });

            return;
        }

        res.json({
            mensagem: "Paciente cadastrado com sucesso!",
            id: resultado.insertId
        });
    });
});


// =========================================
// BUSCAR PACIENTE PELO CPF
// =========================================

app.get("/pacientes/cpf/:cpf", function(req, res) {

    const cpf = req.params.cpf;

    const sql = "SELECT * FROM pacientes WHERE cpf = ?";

    banco.query(sql, [cpf], function(erro, resultado) {

        if (erro) {
            res.status(500).json({
                erro: "Erro ao buscar paciente"
            });

            return;
        }

        if (resultado.length == 0) {
            res.status(404).json({
                erro: "Paciente não encontrado"
            });

            return;
        }

        res.json(resultado[0]);
    });
});


// =========================================
// LISTAR PROFISSIONAIS
// =========================================

app.get("/profissionais", function(req, res) {

    const sql = "SELECT * FROM profissionais";

    banco.query(sql, function(erro, resultado) {

        if (erro) {
            res.status(500).json({
                erro: "Erro ao buscar profissionais"
            });

            return;
        }

        res.json(resultado);
    });
});


// =========================================
// LISTAR ATENDIMENTOS
// =========================================

app.get("/atendimentos", function(req, res) {

    const sql = "SELECT * FROM atendimentos";

    banco.query(sql, function(erro, resultado) {

        if (erro) {
            res.status(500).json({
                erro: "Erro ao buscar atendimentos"
            });

            return;
        }

        res.json(resultado);
    });
});


// =========================================
// CADASTRAR ATENDIMENTO
// =========================================

app.post("/atendimentos", function(req, res) {

    const dados = req.body;

    const sql = `
        INSERT INTO atendimentos
        (
            paciente_id,
            profissional_id,
            senha_atendimento,
            motivo,
            sintomas,
            dor,
            risco,
            risco_confirmado,
            status,
            acompanhante_nome,
            acompanhante_parentesco,
            acompanhante_rg,
            acompanhante_cpf,
            acompanhante_telefone,
            acompanhante_endereco,
            observacoes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dados.paciente_id,
        dados.profissional_id,
        dados.senha_atendimento,
        dados.motivo,
        dados.sintomas,
        dados.dor,
        dados.risco,
        dados.risco_confirmado,
        dados.status,
        dados.acompanhante_nome,
        dados.acompanhante_parentesco,
        dados.acompanhante_rg,
        dados.acompanhante_cpf,
        dados.acompanhante_telefone,
        dados.acompanhante_endereco,
        dados.observacoes
    ];

    banco.query(sql, valores, function(erro, resultado) {

        if (erro) {
            console.log(erro);

            res.status(500).json({
                erro: "Erro ao cadastrar atendimento"
            });

            return;
        }

        res.json({
            mensagem: "Atendimento cadastrado com sucesso!",
            id: resultado.insertId
        });
    });
});


// =========================================
// INICIA O SERVIDOR
// =========================================

const porta = process.env.PORT || 3000;

app.listen(porta, function() {
    console.log("Servidor funcionando na porta " + porta);
});