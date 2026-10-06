# Banco de Dados - Núcleo de Triagem

Este banco de dados foi criado para o projeto acadêmico
"Núcleo de Triagem".

O banco é utilizado para guardar informações dos pacientes,
profissionais e atendimentos realizados pelo sistema.

## Estrutura do banco

O banco possui as seguintes tabelas:

### pacientes

Guarda os dados pessoais e informações de saúde dos pacientes.

Alguns dados armazenados:

- Nome
- Nome social
- Data de nascimento
- CPF
- RG
- Cartão SUS
- Telefone
- Tipo sanguíneo
- Endereço
- Alergias
- Doenças
- Medicamentos
- Contato de emergência
- Senha

### profissionais

Guarda os dados dos profissionais que utilizam o sistema.

Podem ser cadastrados:

- Enfermeiros
- Técnicos de enfermagem

São armazenados dados como:

- Nome
- CPF
- RG
- COREN
- Perfil
- Senha

### atendimentos

Guarda os atendimentos realizados pelos pacientes.

São registrados:

- Paciente
- Profissional
- Motivo do atendimento
- Sintomas
- Nível de dor
- Classificação de risco
- Status do atendimento
- Dados do acompanhante
- Observações

### sinais_vitais

Guarda os sinais vitais registrados durante o atendimento.

Exemplos:

- Pressão arterial
- Temperatura
- Frequência cardíaca
- Saturação
- Frequência respiratória

### auditoria

Guarda um registro das ações realizadas no sistema.

São registrados:

- Usuário
- Tipo de usuário
- Ação realizada
- Descrição
- Data e hora

## Como criar o banco

1. Abra o MySQL.
2. Abra o arquivo `banco.sql`.
3. Execute o código SQL.
4. O banco `nucleo_triagem` será criado.
5. As tabelas serão criadas automaticamente.

O arquivo `banco.sql` também possui um profissional de teste
para facilitar os testes iniciais do sistema.

## Nome do banco

```text
nucleo_triagem