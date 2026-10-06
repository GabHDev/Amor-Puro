-- Cria o banco de dados
CREATE DATABASE IF NOT EXISTS nucleo_triagem;

-- Seleciona o banco
USE nucleo_triagem;


-- =========================================
-- TABELA DE PACIENTES
-- =========================================

CREATE TABLE pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_social VARCHAR(100),
    nascimento DATE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20),
    sus VARCHAR(20),
    govbr VARCHAR(100),
    telefone VARCHAR(20),
    tipo_sanguineo VARCHAR(5),

    cep VARCHAR(10),
    rua VARCHAR(150),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),

    alergias TEXT,
    doencas TEXT,
    outras_informacoes TEXT,
    medicamentos TEXT,

    emergencia_nome VARCHAR(100),
    emergencia_parentesco VARCHAR(50),
    emergencia_telefone VARCHAR(20),

    senha VARCHAR(255) NOT NULL,

    consentimento BOOLEAN DEFAULT FALSE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- TABELA DE PROFISSIONAIS
-- =========================================

CREATE TABLE profissionais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20),
    coren VARCHAR(30),
    perfil VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,

    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- TABELA DE ATENDIMENTOS
-- =========================================

CREATE TABLE atendimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    paciente_id INT NOT NULL,
    profissional_id INT,

    senha_atendimento VARCHAR(20),
    motivo VARCHAR(255),
    data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,

    sintomas TEXT,
    dor INT,

    risco VARCHAR(50),
    risco_confirmado BOOLEAN DEFAULT FALSE,

    status VARCHAR(30) DEFAULT 'aberto',

    acompanhante_nome VARCHAR(100),
    acompanhante_parentesco VARCHAR(50),
    acompanhante_rg VARCHAR(20),
    acompanhante_cpf VARCHAR(14),
    acompanhante_telefone VARCHAR(20),
    acompanhante_endereco VARCHAR(255),

    observacoes TEXT,

    FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id),

    FOREIGN KEY (profissional_id)
        REFERENCES profissionais(id)
);


-- =========================================
-- TABELA DE SINAIS VITAIS
-- =========================================

CREATE TABLE sinais_vitais (
    id INT AUTO_INCREMENT PRIMARY KEY,

    atendimento_id INT NOT NULL,

    pressao VARCHAR(20),
    temperatura DECIMAL(4,1),
    frequencia_cardiaca INT,
    saturacao INT,
    frequencia_respiratoria INT,

    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (atendimento_id)
        REFERENCES atendimentos(id)
);


-- =========================================
-- TABELA DE AUDITORIA
-- =========================================

CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT,
    tipo_usuario VARCHAR(30),

    acao VARCHAR(100),
    descricao TEXT,

    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- DADOS DE EXEMPLO
-- =========================================

INSERT INTO profissionais
(nome, cpf, rg, coren, perfil, senha)
VALUES
(
    'Profissional de Teste',
    '111.111.111-11',
    '11.111.111-1',
    '123456',
    'enfermeiro',
    '123456'
);


-- Mensagem para conferir se deu certo
SELECT 'Banco de dados criado com sucesso!' AS mensagem;