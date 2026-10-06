// =====================================================
// SCRIPT DO NÚCLEO DE TRIAGEM
// =====================================================


// =====================================================
// FUNÇÕES BÁSICAS
// =====================================================

// Atalho para pegar um elemento pelo ID
function pegar(id) {
    return document.getElementById(id);
}


// Pega vários elementos
function pegarTodos(seletor) {
    return Array.from(document.querySelectorAll(seletor));
}


// Cria um ID simples
function criarId() {
    return Date.now().toString() +
        Math.random().toString(36).substring(2, 7);
}


// Tira tudo que não for número
function somenteNumeros(texto) {
    return (texto || "").replace(/\D/g, "");
}


// Evita que textos colocados na tela sejam interpretados como HTML
function textoSeguro(texto) {
    if (texto == null) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


// Mostra uma mensagem na parte de baixo da tela
function mostrarMensagem(mensagem) {

    var caixa = pegar("recado");

    caixa.textContent = mensagem;
    caixa.classList.add("aparece");

    setTimeout(function () {
        caixa.classList.remove("aparece");
    }, 3000);
}


// =====================================================
// BANCO DE DADOS TEMPORÁRIO
// =====================================================
//
// Por enquanto os dados ficam no navegador.
//
// Depois vamos trocar esta parte pelo banco de dados
// do backend.
// =====================================================

var banco = {
    pacientes: [],
    atendimentos: [],
    profissionais: [],
    sistema: []
};


// Carrega os dados salvos no navegador
function carregarBanco() {

    var pacientes = localStorage.getItem("triagem_pacientes");
    var atendimentos = localStorage.getItem("triagem_atendimentos");
    var profissionais = localStorage.getItem("triagem_profissionais");
    var sistema = localStorage.getItem("triagem_sistema");


    if (pacientes) {
        banco.pacientes = JSON.parse(pacientes);
    }

    if (atendimentos) {
        banco.atendimentos = JSON.parse(atendimentos);
    }

    if (profissionais) {
        banco.profissionais = JSON.parse(profissionais);
    }

    if (sistema) {
        banco.sistema = JSON.parse(sistema);
    }
}


// Salva os dados no navegador
function salvarBanco() {

    localStorage.setItem(
        "triagem_pacientes",
        JSON.stringify(banco.pacientes)
    );

    localStorage.setItem(
        "triagem_atendimentos",
        JSON.stringify(banco.atendimentos)
    );

    localStorage.setItem(
        "triagem_profissionais",
        JSON.stringify(banco.profissionais)
    );

    localStorage.setItem(
        "triagem_sistema",
        JSON.stringify(banco.sistema)
    );
}


// =====================================================
// SENHA
// =====================================================
//
// Esta função é apenas para a demonstração do TCC.
// Em um sistema real a senha deve ser protegida no
// servidor com bcrypt ou Argon2.
// =====================================================

function protegerSenha(senha) {

    var numero = 0;

    for (var i = 0; i < senha.length; i++) {
        numero = ((numero << 5) - numero) + senha.charCodeAt(i);
        numero = numero & numero;
    }

    return String(Math.abs(numero));
}

// =====================================================
// CPF
// =====================================================

function validarCPF(cpf) {

    // Remove pontos, traço e outros caracteres
    cpf = somenteNumeros(cpf);

    // O CPF precisa ter exatamente 11 números
    if (cpf.length !== 11) {
        return false;
    }

    // Não verifica se o CPF é real.
    // Qualquer sequência de 11 números será aceita.
    return true;
}


// Formata CPF enquanto a pessoa digita
function formatarCPF(valor) {

    var cpf = somenteNumeros(valor);

    cpf = cpf.substring(0, 11);

    if (cpf.length > 9) {
        return cpf.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    }

    if (cpf.length > 6) {
        return cpf.replace(
            /(\d{3})(\d{3})(\d{1,3})/,
            "$1.$2.$3"
        );
    }

    if (cpf.length > 3) {
        return cpf.replace(
            /(\d{3})(\d{1,3})/,
            "$1.$2"
        );
    }

    return cpf;
}

// Mascara CPF para o técnico
function mascararCPF(cpf) {

    cpf = somenteNumeros(cpf);

    if (cpf.length !== 11) {
        return "•••";
    }

    return "•••." +
        cpf.substring(3, 6) +
        ".•••-••";
}


// Mascara RG para o técnico
function mascararRG(rg) {

    if (!rg) {
        return "—";
    }

    return "••••" + rg.substring(rg.length - 2);
}


// =====================================================
// DATA E HORÁRIO
// =====================================================

function mostrarData(data) {

    if (!data) {
        return "—";
    }

    return new Date(data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// Calcula idade
function calcularIdade(nascimento) {

    if (!nascimento) {
        return "—";
    }

    var dataNascimento = new Date(nascimento);
    var hoje = new Date();

    var idade = hoje.getFullYear() -
        dataNascimento.getFullYear();

    var mes = hoje.getMonth() -
        dataNascimento.getMonth();

    if (
        mes < 0 ||
        (mes === 0 &&
            hoje.getDate() < dataNascimento.getDate())
    ) {
        idade--;
    }

    return idade + " anos";
}


// Mostra há quanto tempo a pessoa está esperando
function calcularEspera(data) {

    var minutos = Math.floor(
        (Date.now() - data) / 60000
    );

    if (minutos < 60) {
        return minutos + " min";
    }

    var horas = Math.floor(minutos / 60);
    var resto = minutos % 60;

    return horas + "h" +
        String(resto).padStart(2, "0");
}


// =====================================================
// SESSÃO
// =====================================================

var sessao = null;

var tipoProfissional = "enfermeiro";

var atendimentoSelecionado = null;

var dorEscolhida = null;


// =====================================================
// TROCA DE TELAS
// =====================================================

function mostrarTela(nome) {

    var telas = document.querySelectorAll(".tela");

    telas.forEach(function (tela) {
        tela.classList.remove("ativa");
    });


    var tela = pegar("tela-" + nome);

    if (tela) {
        tela.classList.add("ativa");
    }


    // Cabeçalho aparece quando não estamos na tela inicial
    if (nome === "inicio") {
        pegar("topo").hidden = true;
    } else {
        pegar("topo").hidden = false;
    }


    window.scrollTo(0, 0);


    if (nome === "paciente-painel") {
        mostrarPainelPaciente();
    }

    if (nome === "prof-painel") {
        mostrarFila();
    }
}


// =====================================================
// BOTÕES DE NAVEGAÇÃO
// =====================================================

pegarTodos("[data-ir]").forEach(function (botao) {

    botao.addEventListener("click", function () {

        var destino = botao.dataset.ir;


        if (destino === "paciente") {

            mostrarTela("paciente-entrada");

        } else if (destino === "enfermeiro") {

            prepararLoginProfissional("enfermeiro");

        } else if (destino === "tecnico") {

            prepararLoginProfissional("tecnico");

        } else {

            mostrarTela(destino);
        }
    });
});


// Botão do manual
pegar("btnManual").addEventListener("click", function () {

    mostrarTela("manual");

});


// Logo do sistema
pegar("voltarInicio").addEventListener("click", function () {

    if (!sessao) {
        mostrarTela("inicio");
        return;
    }


    if (sessao.papel === "paciente") {
        mostrarTela("paciente-painel");
    } else {
        mostrarTela("prof-painel");
    }
});


// =====================================================
// SAIR
// =====================================================

pegar("btnSair").addEventListener("click", function () {

    sessao = null;
    atendimentoSelecionado = null;

    pegar("quemSou").textContent = "";

    mostrarTela("inicio");

    mostrarMensagem("Você saiu do sistema.");
});


// =====================================================
// TEMA
// =====================================================

pegar("btnTema").addEventListener("click", function () {

    var temaAtual =
        document.documentElement.getAttribute("data-theme");


    if (temaAtual === "dark") {

        document.documentElement
            .setAttribute("data-theme", "light");

    } else {

        document.documentElement
            .setAttribute("data-theme", "dark");
    }
});


// =====================================================
// ABAS
// =====================================================

pegarTodos(".abas").forEach(function (grupo) {

    grupo.addEventListener("click", function (evento) {

        var botao =
            evento.target.closest("button[data-painel]");


        if (!botao) {
            return;
        }


        var botoes =
            grupo.querySelectorAll("button");


        botoes.forEach(function (item) {

            item.setAttribute(
                "aria-selected",
                item === botao
            );
        });


        var paineis =
            grupo.parentElement.querySelectorAll(
                ":scope > .painel"
            );


        paineis.forEach(function (painel) {

            painel.classList.remove("ativo");

        });


        var painelSelecionado =
            pegar(botao.dataset.painel);


        if (painelSelecionado) {
            painelSelecionado.classList.add("ativo");
        }
    });
});


// =====================================================
// ESCALA DE DOR
// =====================================================

var carasDor = [
    "😀",
    "🙂",
    "😊",
    "😐",
    "😕",
    "😣",
    "😖",
    "😫",
    "😭",
    "😡"
];


function descreverDor(numero) {

    if (numero <= 2) {
        return "leve";
    }

    if (numero <= 4) {
        return "incômoda";
    }

    if (numero <= 6) {
        return "moderada";
    }

    if (numero <= 8) {
        return "forte";
    }

    return "insuportável";
}


function montarEscalaDor() {

    var area = pegar("escalaDor");

    area.innerHTML = "";


    for (var i = 0; i < 10; i++) {

        var botao = document.createElement("button");

        botao.type = "button";
        botao.className = "dor-item";
        botao.setAttribute(
            "aria-pressed",
            "false"
        );


        botao.innerHTML =
            "<span style='font-size:42px'>" +
            carasDor[i] +
            "</span>" +
            "<span>" +
            (i + 1) +
            "</span>";


        botao.addEventListener(
            "click",
            function () {

                var botoes =
                    document.querySelectorAll(
                        "#escalaDor .dor-item"
                    );


                botoes.forEach(function (item) {

                    item.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });


                this.setAttribute(
                    "aria-pressed",
                    "true"
                );


                dorEscolhida =
                    Array.from(botoes).indexOf(this) + 1;


                pegar("dorLegenda").textContent =
                    "Dor " +
                    dorEscolhida +
                    " de 10 — " +
                    descreverDor(dorEscolhida);
            }
        );


        area.appendChild(botao);
    }
}


// =====================================================
// CADASTRO DO PACIENTE
// =====================================================


// Formatação automática do CPF
["c-cpf", "le-cpf", "f-cpf", "ac-cpf"]
.forEach(function (idCampo) {

    var campo = pegar(idCampo);

    if (!campo) {
        return;
    }

    campo.addEventListener("input", function () {

        campo.value = formatarCPF(
            campo.value
        );
    });
});


// Cadastro
pegar("formCadastro").addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        var erro = pegar("c-erro");

        erro.textContent = "";


        // Verifica campos obrigatórios
        var campos = [
            ["c-nome", "o nome completo"],
            ["c-nasc", "a data de nascimento"],
            ["c-rg", "o RG"],
            ["c-tel", "o telefone"],
            ["c-alergia", "o campo de alergias"],
            ["c-em-nome", "o contato de emergência"],
            ["c-em-par", "o parentesco do contato"],
            ["c-em-tel", "o telefone do contato"]
        ];


        for (var i = 0; i < campos.length; i++) {

            var campo = pegar(campos[i][0]);

            if (!campo.value.trim()) {

                erro.textContent =
                    "Falta preencher " +
                    campos[i][1] +
                    ".";

                campo.focus();

                return;
            }
        }


        // Verifica CPF
        var cpf =
            somenteNumeros(
                pegar("c-cpf").value
            );


        if (!validarCPF(cpf)) {

            erro.textContent =
                "CPF inválido.";

            pegar("c-cpf").focus();

            return;
        }


        // Verifica senha
        var senha =
            pegar("c-senha").value;

        var repetirSenha =
            pegar("c-senha2").value;


        if (senha.length < 6) {

            erro.textContent =
                "A senha precisa ter pelo menos 6 caracteres.";

            return;
        }


        if (senha !== repetirSenha) {

            erro.textContent =
                "As duas senhas estão diferentes.";

            return;
        }


        // Verifica consentimento
        if (!pegar("c-consent").checked) {

            erro.textContent =
                "É necessário aceitar o consentimento.";

            return;
        }


        // Verifica se CPF já existe
        var jaExiste =
            banco.pacientes.some(
                function (paciente) {
                    return paciente.cpf === cpf;
                }
            );


        if (jaExiste) {

            erro.textContent =
                "Já existe um cadastro com este CPF.";

            return;
        }


        // Pega doenças marcadas
        var doencas = [];

        pegarTodos(
            "#c-doencas input:checked"
        ).forEach(function (checkbox) {

            doencas.push(checkbox.value);
        });


        // Cria o paciente
        var paciente = {

            id: criarId(),

            nome:
                pegar("c-nome").value.trim(),

            nomeSocial:
                pegar("c-social").value.trim(),

            nascimento:
                pegar("c-nasc").value,

            cpf: cpf,

            rg:
                pegar("c-rg").value.trim(),

            sus:
                pegar("c-sus").value.trim(),

            govbr:
                pegar("c-govbr").value.trim(),

            telefone:
                pegar("c-tel").value.trim(),

            sangue:
                pegar("c-sangue").value,

            endereco: {

                cep:
                    pegar("c-cep").value,

                rua:
                    pegar("c-rua").value,

                numero:
                    pegar("c-num").value,

                bairro:
                    pegar("c-bairro").value,

                cidade:
                    pegar("c-cidade").value,

                estado:
                    pegar("c-uf").value.toUpperCase()
            },

            alergias:
                pegar("c-alergia").value.trim(),

            doencas: doencas,

            outras:
                pegar("c-outras").value.trim(),

            medicamentos:
                pegar("c-medic").value.trim(),

            emergencia: {

                nome:
                    pegar("c-em-nome").value.trim(),

                parentesco:
                    pegar("c-em-par").value.trim(),

                telefone:
                    pegar("c-em-tel").value.trim()
            },

            senha:
                protegerSenha(senha),

            consentimento: {

                aceito: true,

                quando: Date.now(),

                versao: "1.0"
            },

            criadoEm: Date.now()
        };


        banco.pacientes.push(paciente);

        salvarBanco();


        sessao = {

            papel: "paciente",

            id: paciente.id,

            nome:
                paciente.nomeSocial ||
                paciente.nome
        };


        registrarAcao(
            "Criou o cadastro",
            paciente.id
        );


        mostrarMensagem(
            "Cadastro criado com sucesso!"
        );


        entrarPaciente();
    }
);


// =====================================================
// LOGIN DO PACIENTE
// =====================================================

pegar("btnEntrarPaciente")
.addEventListener(
    "click",
    function () {

        var erro = pegar("le-erro");

        erro.textContent = "";


        var cpf =
            somenteNumeros(
                pegar("le-cpf").value
            );


        var senha =
            pegar("le-senha").value;


        var paciente =
            banco.pacientes.find(
                function (item) {
                    return item.cpf === cpf;
                }
            );


        if (
            !paciente ||
            paciente.senha !== protegerSenha(senha)
        ) {

            erro.textContent =
                "CPF ou senha não conferem.";

            return;
        }


        sessao = {

            papel: "paciente",

            id: paciente.id,

            nome:
                paciente.nomeSocial ||
                paciente.nome
        };


        registrarAcao(
            "Entrou no sistema",
            paciente.id
        );


        entrarPaciente();
    }
);


// =====================================================
// ENTRAR NO PAINEL DO PACIENTE
// =====================================================

function entrarPaciente() {

    var paciente =
        encontrarPaciente(sessao.id);


    if (!paciente) {
        return;
    }


    pegar("quemSou").textContent =
        "Paciente · " +
        (paciente.nomeSocial ||
            paciente.nome);


    pegar("pac-saudacao").textContent =
        "Olá, " +
        (paciente.nomeSocial ||
            paciente.nome).split(" ")[0];


    mostrarTela("paciente-painel");
}


// =====================================================
// ENCONTRAR PACIENTE
// =====================================================

function encontrarPaciente(id) {

    return banco.pacientes.find(
        function (paciente) {
            return paciente.id === id;
        }
    );
}


// =====================================================
// ABRIR ATENDIMENTO
// =====================================================

pegar("formAtend").addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        var erro = pegar("a-erro");

        erro.textContent = "";


        var motivo =
            pegar("a-motivo").value.trim();

        var sintomas =
            pegar("a-sintomas").value.trim();


        if (!motivo || !sintomas) {

            erro.textContent =
                "Informe o motivo e os sintomas.";

            return;
        }


        if (!dorEscolhida) {

            erro.textContent =
                "Escolha uma carinha na escala de dor.";

            return;
        }


        // Cria uma senha de chamada
        var numero =
            banco.atendimentos.length + 1;

        var senha =
            "T" +
            String(numero).padStart(3, "0");


        // Cria o atendimento
        var atendimento = {

            id: criarId(),

            pacienteId:
                sessao.id,

            senhaChamada:
                senha,

            abertoEm:
                Date.now(),

            motivo:
                motivo,

            inicio:
                pegar("a-inicio").value.trim(),

            sintomas:
                sintomas,

            dor:
                dorEscolhida,

            risco:
                null,

            riscoConfirmado:
                false,

            status:
                "aguardando",

            acompanhante: {

                nome:
                    pegar("ac-nome").value,

                parentesco:
                    pegar("ac-par").value,

                rg:
                    pegar("ac-rg").value,

                cpf:
                    somenteNumeros(
                        pegar("ac-cpf").value
                    ),

                telefone:
                    pegar("ac-tel").value,

                endereco:
                    pegar("ac-end").value
            },

            sinais: {},

            anotacoes: "",

            eventos: [

                {
                    quando: Date.now(),

                    texto:
                        "Ficha aberta pelo paciente"
                }
            ]
        };


        banco.atendimentos.push(
            atendimento
        );

        salvarBanco();


        registrarAcao(
            "Abriu atendimento",
            senha
        );


        // Limpa formulário
        pegar("formAtend").reset();

        dorEscolhida = null;


        pegarTodos(
            "#escalaDor .dor-item"
        ).forEach(function (botao) {

            botao.setAttribute(
                "aria-pressed",
                "false"
            );
        });


        pegar("dorLegenda").textContent =
            "Nenhuma carinha selecionada";


        mostrarMensagem(
            "Ficha enviada! Sua senha é " +
            senha
        );


        mostrarPainelPaciente();
    }
);


// =====================================================
// MOSTRAR PAINEL DO PACIENTE
// =====================================================

function mostrarPainelPaciente() {

    if (
        !sessao ||
        sessao.papel !== "paciente"
    ) {
        return;
    }


    var paciente =
        encontrarPaciente(sessao.id);


    if (!paciente) {
        return;
    }


    // Pega os atendimentos deste paciente
    var meusAtendimentos =
        banco.atendimentos
            .filter(function (atendimento) {

                return atendimento.pacienteId ===
                    paciente.id;
            })
            .sort(function (a, b) {

                return b.abertoEm -
                    a.abertoEm;
            });


    // Procura atendimento que ainda está aberto
    var atendimentoAberto =
        meusAtendimentos.find(
            function (atendimento) {

                return atendimento.status !==
                    "finalizado";
            }
        );


    mostrarAtendimentoAberto(
        atendimentoAberto
    );


    mostrarDadosPaciente(
        paciente
    );


    mostrarHistoricoPaciente(
        meusAtendimentos
    );


    mostrarPrivacidade(
        paciente
    );
}


// =====================================================
// ATENDIMENTO ABERTO DO PACIENTE
// =====================================================

function mostrarAtendimentoAberto(
    atendimento
) {

    var area =
        pegar("atendAberto");


    if (!atendimento) {

        area.innerHTML = "";

        pegar("formAtend").style.display =
            "block";

        return;
    }


    pegar("formAtend").style.display =
        "none";


    var riscoTexto =
        "Aguardando classificação da enfermagem.";


    if (atendimento.risco) {

        riscoTexto =
            "Classificação: " +
            atendimento.risco;
    }


    area.innerHTML = `

        <div class="cartao">

            <h2>
                Você está na fila
            </h2>

            <p>
                Sua senha é:
                <b>${textoSeguro(
                    atendimento.senhaChamada
                )}</b>
            </p>

            <p>
                Tempo de espera:
                ${calcularEspera(
                    atendimento.abertoEm
                )}
            </p>

            <p>
                ${riscoTexto}
            </p>

            <p>
                Se você piorar enquanto espera,
                avise a equipe.
            </p>

        </div>
    `;
}


// =====================================================
// DADOS DO PACIENTE
// =====================================================

function mostrarDadosPaciente(paciente) {

    var endereco =
        paciente.endereco || {};


    var tabela =
        pegar("tabelaMeusDados");


    tabela.innerHTML = `

        <tbody>

            ${linhaTabela(
                "Nome",
                paciente.nome
            )}

            ${linhaTabela(
                "Nome social",
                paciente.nomeSocial || "—"
            )}

            ${linhaTabela(
                "Nascimento",
                paciente.nascimento +
                " (" +
                calcularIdade(
                    paciente.nascimento
                ) +
                ")"
            )}

            ${linhaTabela(
                "CPF",
                formatarCPF(paciente.cpf)
            )}

            ${linhaTabela(
                "RG",
                paciente.rg
            )}

            ${linhaTabela(
                "Cartão SUS",
                paciente.sus || "—"
            )}

            ${linhaTabela(
                "Telefone",
                paciente.telefone
            )}

            ${linhaTabela(
                "Tipo sanguíneo",
                paciente.sangue || "Não informado"
            )}

            ${linhaTabela(
                "Endereço",
                [
                    endereco.rua,
                    endereco.numero,
                    endereco.bairro,
                    endereco.cidade,
                    endereco.estado
                ]
                .filter(Boolean)
                .join(", ")
                || "—"
            )}

            ${linhaTabela(
                "Alergias",
                paciente.alergias
            )}

            ${linhaTabela(
                "Doenças",
                paciente.doencas &&
                paciente.doencas.length > 0
                    ? paciente.doencas.join(", ")
                    : "Nenhuma marcada"
            )}

            ${linhaTabela(
                "Outras doenças",
                paciente.outras || "—"
            )}

            ${linhaTabela(
                "Medicamentos",
                paciente.medicamentos || "—"
            )}

            ${linhaTabela(
                "Contato de emergência",
                paciente.emergencia
                    ? paciente.emergencia.nome +
                      " (" +
                      paciente.emergencia.parentesco +
                      ") - " +
                      paciente.emergencia.telefone
                    : "—"
            )}

        </tbody>
    `;
}


// Cria uma linha de tabela
function linhaTabela(nome, valor) {

    return `
        <tr>
            <th>${textoSeguro(nome)}</th>
            <td>${textoSeguro(valor)}</td>
        </tr>
    `;
}


// =====================================================
// HISTÓRICO DO PACIENTE
// =====================================================

function mostrarHistoricoPaciente(
    atendimentos
) {

    var area =
        pegar("histPaciente");


    if (atendimentos.length === 0) {

        area.innerHTML =
            '<div class="vazio">' +
            'Você ainda não possui atendimentos.' +
            '</div>';

        return;
    }


    var html = `

        <div class="rolagem">

            <table>

                <thead>

                    <tr>
                        <th>Data</th>
                        <th>Senha</th>
                        <th>Motivo</th>
                        <th>Dor</th>
                        <th>Risco</th>
                        <th>Situação</th>
                    </tr>

                </thead>

                <tbody>
    `;


    atendimentos.forEach(
        function (atendimento) {

            html += `

                <tr>

                    <td>
                        ${mostrarData(
                            atendimento.abertoEm
                        )}
                    </td>

                    <td>
                        ${textoSeguro(
                            atendimento.senhaChamada
                        )}
                    </td>

                    <td>
                        ${textoSeguro(
                            atendimento.motivo
                        )}
                    </td>

                    <td>
                        ${atendimento.dor}/10
                    </td>

                    <td>
                        ${
                            atendimento.risco ||
                            "Ainda não classificado"
                        }
                    </td>

                    <td>
                        ${textoSeguro(
                            atendimento.status
                        )}
                    </td>

                </tr>
            `;
        }
    );


    html += `
                </tbody>

            </table>

        </div>
    `;


    area.innerHTML = html;
}


// =====================================================
// PRIVACIDADE
// =====================================================

function mostrarPrivacidade(paciente) {

    var consentimento =
        paciente.consentimento;


    if (consentimento &&
        consentimento.aceito) {

        pegar("consentTexto").textContent =
            "Você aceitou o uso dos seus dados " +
            "em " +
            mostrarData(
                consentimento.quando
            ) +
            ". Versão do termo: " +
            consentimento.versao +
            ".";
    }
}


// =====================================================
// EXPORTAR DADOS
// =====================================================

pegar("btnExportar").addEventListener(
    "click",
    function () {

        if (!sessao) {
            return;
        }


        var paciente =
            encontrarPaciente(sessao.id);


        var atendimentos =
            banco.atendimentos.filter(
                function (atendimento) {

                    return atendimento.pacienteId ===
                        paciente.id;
                }
            );


        var dados = {

            paciente: paciente,

            atendimentos: atendimentos,

            geradoEm:
                new Date().toISOString()
        };


        var arquivo =
            JSON.stringify(
                dados,
                null,
                2
            );


        var blob =
            new Blob(
                [arquivo],
                {
                    type: "application/json"
                }
            );


        var url =
            URL.createObjectURL(blob);


        var link =
            document.createElement("a");


        link.href = url;

        link.download =
            "meus-dados-triagem.json";


        link.click();


        URL.revokeObjectURL(url);


        registrarAcao(
            "Exportou os próprios dados",
            ""
        );


        mostrarMensagem(
            "Seus dados foram exportados."
        );
    }
);


// =====================================================
// EXCLUIR DADOS DO PACIENTE
// =====================================================

pegar("btnExcluir").addEventListener(
    "click",
    function () {

        if (!sessao) {
            return;
        }


        var confirmar =
            confirm(
                "Isso vai excluir seu cadastro " +
                "e seus atendimentos. Deseja continuar?"
            );


        if (!confirmar) {
            return;
        }


        // Remove os atendimentos
        banco.atendimentos =
            banco.atendimentos.filter(
                function (atendimento) {

                    return atendimento.pacienteId !==
                        sessao.id;
                }
            );


        // Remove o paciente
        banco.pacientes =
            banco.pacientes.filter(
                function (paciente) {

                    return paciente.id !==
                        sessao.id;
                }
            );


        salvarBanco();


        sessao = null;


        mostrarMensagem(
            "Seus dados foram excluídos."
        );


        mostrarTela("inicio");
    }
);


// =====================================================
// LOGIN DO PROFISSIONAL
// =====================================================

function prepararLoginProfissional(
    tipo
) {

    tipoProfissional = tipo;


    if (tipo === "enfermeiro") {

        pegar("prof-titulo").textContent =
            "Área do enfermeiro";

        pegar("prof-sub").textContent =
            "Acesse a fila, veja os pacientes, " +
            "registre sinais vitais e classifique o risco.";

    } else {

        pegar("prof-titulo").textContent =
            "Área do técnico em enfermagem";

        pegar("prof-sub").textContent =
            "Registre os sinais vitais e acompanhe " +
            "a fila de triagem.";
    }


    pegar("f-erro").textContent = "";

    mostrarTela("prof-entrada");
}


// Entrar como profissional
pegar("btnEntrarProf").addEventListener(
    "click",
    function () {

        var erro =
            pegar("f-erro");

        erro.textContent = "";


        var nome =
            pegar("f-nome").value.trim();

        var cpf =
            somenteNumeros(
                pegar("f-cpf").value
            );

        var rg =
            pegar("f-rg").value.trim();

        var coren =
            pegar("f-coren").value.trim();

        var senha =
            pegar("f-senha").value;


        if (
            !nome ||
            !cpf ||
            !rg ||
            !coren ||
            !senha
        ) {

            erro.textContent =
                "Preencha todos os campos.";

            return;
        }


        if (!validarCPF(cpf)) {

            erro.textContent =
                "CPF inválido.";

            return;
        }


        if (senha.length < 6) {

            erro.textContent =
                "A senha precisa ter pelo menos 6 caracteres.";

            return;
        }


        var profissional =
            banco.profissionais.find(
                function (item) {

                    return item.cpf === cpf;
                }
            );


        // Se já existir, faz login
        if (profissional) {

            if (
                profissional.senha !==
                protegerSenha(senha)
            ) {

                erro.textContent =
                    "Senha incorreta.";

                return;
            }


            if (
                profissional.papel !==
                tipoProfissional
            ) {

                erro.textContent =
                    "Este usuário está cadastrado " +
                    "com outro perfil.";

                return;
            }


        } else {

            // Primeiro acesso:
            // cria o profissional

            profissional = {

                id: criarId(),

                nome: nome,

                cpf: cpf,

                rg: rg,

                coren: coren,

                papel:
                    tipoProfissional,

                senha:
                    protegerSenha(senha),

                criadoEm:
                    Date.now()
            };


            banco.profissionais.push(
                profissional
            );


            salvarBanco();
        }


        sessao = {

            papel:
                profissional.papel,

            id:
                profissional.id,

            nome:
                profissional.nome,

            coren:
                profissional.coren
        };


        pegar("quemSou").textContent =
            (
                profissional.papel ===
                "enfermeiro"
                    ? "Enf. "
                    : "Téc. "
            ) +
            profissional.nome +
            " · " +
            profissional.coren;


        registrarAcao(
            "Entrou no sistema",
            ""
        );


        mostrarTela("prof-painel");
    }
);


// =====================================================
// FILA DE TRIAGEM
// =====================================================

function mostrarFila() {

    if (
        !sessao ||
        sessao.papel === "paciente"
    ) {
        return;
    }


    var ehEnfermeiro =
        sessao.papel === "enfermeiro";


    if (ehEnfermeiro) {

        pegar("avisoPerfil").innerHTML =
            "Você pode ver a ficha completa, " +
            "confirmar o risco e finalizar o atendimento.";

    } else {

        pegar("avisoPerfil").innerHTML =
            "Perfil técnico: alguns dados do paciente " +
            "ficam mascarados. A classificação feita " +
            "pelo técnico precisa ser confirmada pelo enfermeiro.";
    }


    var mostrarFinalizados =
        pegar("verFinalizados").checked;


    var lista =
        banco.atendimentos.filter(
            function (atendimento) {

                if (mostrarFinalizados) {
                    return true;
                }

                return atendimento.status !==
                    "finalizado";
            }
        );


    // Ordena a fila
    lista.sort(function (a, b) {

        var prioridadeA =
            prioridadeRisco(a.risco);

        var prioridadeB =
            prioridadeRisco(b.risco);


        if (prioridadeA !== prioridadeB) {

            return prioridadeA -
                prioridadeB;
        }


        return a.abertoEm -
            b.abertoEm;
    });


    var aguardando =
        banco.atendimentos.filter(
            function (atendimento) {

                return atendimento.status !==
                    "finalizado";
            }
        ).length;


    var semClassificacao =
        banco.atendimentos.filter(
            function (atendimento) {

                return (
                    atendimento.status !==
                    "finalizado" &&
                    !atendimento.risco
                );
            }
        ).length;


    if (aguardando === 0) {

        pegar("resumoFila").textContent =
            "Ninguém está aguardando.";

    } else {

        pegar("resumoFila").textContent =
            aguardando +
            " pessoas aguardando · " +
            semClassificacao +
            " sem classificação";
    }


    var tabela =
        pegar("tabelaFila").querySelector(
            "tbody"
        );


    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="4" class="vazio">
                    Nenhuma ficha aberta.
                </td>
            </tr>
        `;

        return;
    }


    tabela.innerHTML = "";


    lista.forEach(function (atendimento) {

        var paciente =
            encontrarPaciente(
                atendimento.pacienteId
            );


        if (!paciente) {
            return;
        }


        var linha =
            document.createElement("tr");


        linha.className =
            "clicavel";


        if (
            atendimentoSelecionado ===
            atendimento.id
        ) {

            linha.classList.add(
                "selecionada"
            );
        }


        var risco =
            atendimento.risco ||
            "nenhum";


        var confirmacao = "";


        if (
            atendimento.risco &&
            !atendimento.riscoConfirmado
        ) {

            confirmacao =
                "<br><span class='etiqueta'>" +
                "a confirmar" +
                "</span>";
        }


        linha.innerHTML = `

            <td>

                <span class="bolinha ${risco}">
                </span>

                ${confirmacao}

            </td>


            <td>

                <b>
                    ${textoSeguro(
                        paciente.nomeSocial ||
                        paciente.nome
                    )}
                </b>

                <br>

                <span>
                    ${textoSeguro(
                        atendimento.senhaChamada
                    )}
                    ·
                    ${calcularIdade(
                        paciente.nascimento
                    )}
                </span>

            </td>


            <td>
                ${atendimento.dor}/10
            </td>


            <td>
                ${
                    atendimento.status ===
                    "finalizado"
                        ? "Finalizado"
                        : calcularEspera(
                            atendimento.abertoEm
                        )
                }
            </td>
        `;


        linha.addEventListener(
            "click",
            function () {

                abrirFicha(
                    atendimento.id
                );
            }
        );


        tabela.appendChild(linha);
    });
}


// Define a prioridade da fila
function prioridadeRisco(risco) {

    if (risco === "vermelho") {
        return 1;
    }

    if (risco === "laranja") {
        return 2;
    }

    if (risco === "amarelo") {
        return 3;
    }

    if (risco === "azul") {
        return 4;
    }

    if (risco === "verde") {
        return 5;
    }

    return 6;
}


// Atualiza fila quando checkbox muda
pegar("verFinalizados").addEventListener(
    "change",
    function () {

        mostrarFila();
    }
);


// =====================================================
// ABRIR FICHA DO PACIENTE
// =====================================================

function abrirFicha(idAtendimento) {

    var atendimento =
        banco.atendimentos.find(
            function (item) {

                return item.id ===
                    idAtendimento;
            }
        );


    if (!atendimento) {
        return;
    }


    var paciente =
        encontrarPaciente(
            atendimento.pacienteId
        );


    if (!paciente) {
        return;
    }


    atendimentoSelecionado =
        idAtendimento;


    var enfermeiro =
        sessao.papel === "enfermeiro";


    registrarAcao(
        "Abriu a ficha do paciente",
        atendimento.senhaChamada
    );


    var sinais =
        atendimento.sinais || {};

    var acompanhante =
        atendimento.acompanhante || {};


    var endereco =
        paciente.endereco || {};


    var cpfMostrar =
        enfermeiro
            ? formatarCPF(paciente.cpf)
            : mascararCPF(paciente.cpf);


    var rgMostrar =
        enfermeiro
            ? paciente.rg
            : mascararRG(paciente.rg);


    var ficha =
        pegar("fichaPaciente");


    ficha.innerHTML = `

        <div class="cartao">

            <h2>
                ${textoSeguro(
                    paciente.nomeSocial ||
                    paciente.nome
                )}
            </h2>


            <p>

                Senha:
                <b>
                    ${textoSeguro(
                        atendimento.senhaChamada
                    )}
                </b>

                ·

                ${calcularIdade(
                    paciente.nascimento
                )}

                ·

                Dor:
                <b>
                    ${atendimento.dor}/10
                </b>

            </p>


            ${
                paciente.alergias &&
                !/nenhuma/i.test(
                    paciente.alergias
                )
                    ? `
                        <div class="aviso alerta">

                            <b>Alergia:</b>

                            ${textoSeguro(
                                paciente.alergias
                            )}

                        </div>
                    `
                    : ""
            }


            <div class="rolagem">

                <table class="ficha">

                    <tbody>

                        ${linhaTabela(
                            "Motivo da vinda",
                            atendimento.motivo
                        )}

                        ${linhaTabela(
                            "Quando começou",
                            atendimento.inicio || "—"
                        )}

                        ${linhaTabela(
                            "Sintomas",
                            atendimento.sintomas
                        )}

                        ${linhaTabela(
                            "CPF",
                            cpfMostrar
                        )}

                        ${linhaTabela(
                            "RG",
                            rgMostrar
                        )}

                        ${
                            enfermeiro
                                ? linhaTabela(
                                    "Cartão SUS",
                                    paciente.sus || "—"
                                )
                                : ""
                        }

                        ${linhaTabela(
                            "Nascimento",
                            paciente.nascimento
                        )}

                        ${linhaTabela(
                            "Tipo sanguíneo",
                            paciente.sangue ||
                            "Não informado"
                        )}

                        ${linhaTabela(
                            "Doenças",
                            paciente.doencas &&
                            paciente.doencas.length
                                ? paciente.doencas.join(", ")
                                : "Nenhuma"
                        )}

                        ${linhaTabela(
                            "Medicamentos",
                            paciente.medicamentos ||
                            "—"
                        )}

                        ${linhaTabela(
                            "Telefone",
                            paciente.telefone ||
                            "—"
                        )}

                        ${
                            enfermeiro
                                ? linhaTabela(
                                    "Endereço",
                                    [
                                        endereco.rua,
                                        endereco.numero,
                                        endereco.bairro,
                                        endereco.cidade,
                                        endereco.estado
                                    ]
                                    .filter(Boolean)
                                    .join(", ")
                                )
                                : ""
                        }

                    </tbody>

                </table>

            </div>


            <h3>
                Acompanhante
            </h3>


            <div class="rolagem">

                <table class="ficha">

                    <tbody>

                        ${linhaTabela(
                            "Nome",
                            acompanhante.nome ||
                            "Nenhum"
                        )}

                        ${linhaTabela(
                            "Parentesco",
                            acompanhante.parentesco ||
                            "—"
                        )}

                        ${linhaTabela(
                            "RG",
                            enfermeiro
                                ? acompanhante.rg ||
                                  "—"
                                : mascararRG(
                                    acompanhante.rg
                                )
                        )}

                        ${linhaTabela(
                            "CPF",
                            enfermeiro
                                ? formatarCPF(
                                    acompanhante.cpf
                                )
                                : mascararCPF(
                                    acompanhante.cpf
                                )
                        )}

                        ${linhaTabela(
                            "Telefone",
                            acompanhante.telefone ||
                            "—"
                        )}

                    </tbody>

                </table>

            </div>

        </div>


        <div class="cartao">

            <h3>
                Sinais vitais e medidas
            </h3>


            <div class="grade">


                <div class="campo">

                    <label>
                        P.A.
                    </label>

                    <input
                        id="s-pa"
                        placeholder="120/80"
                        value="${textoSeguro(
                            sinais.pa || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        P.A.G.
                    </label>

                    <input
                        id="s-pag"
                        value="${textoSeguro(
                            sinais.pag || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Frequência cardíaca
                    </label>

                    <input
                        id="s-fc"
                        value="${textoSeguro(
                            sinais.fc || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Frequência respiratória
                    </label>

                    <input
                        id="s-fr"
                        value="${textoSeguro(
                            sinais.fr || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Temperatura
                    </label>

                    <input
                        id="s-temp"
                        value="${textoSeguro(
                            sinais.temp || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Saturação
                    </label>

                    <input
                        id="s-spo2"
                        value="${textoSeguro(
                            sinais.spo2 || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Glicemia
                    </label>

                    <input
                        id="s-glic"
                        value="${textoSeguro(
                            sinais.glicemia || ""
                        )}"
                    >

                </div>


                <div class="campo">

                    <label>
                        Peso
                    </label>

                    <input
                        id="s-peso"
                        value="${textoSeguro(
                            sinais.peso || ""
                        )}"
                    >

                </div>

            </div>


            <h3>
                Classificação de risco
            </h3>


            <div
                class="selbolinha"
                id="selRisco"
            >

                <button
                    type="button"
                    data-risco="verde"
                    aria-pressed="${
                        atendimento.risco ===
                        "verde"
                    }"
                >

                    <span class="bolinha verde">
                    </span>

                    Verde

                </button>


                <button
                    type="button"
                    data-risco="amarelo"
                    aria-pressed="${
                        atendimento.risco ===
                        "amarelo"
                    }"
                >

                    <span class="bolinha amarelo">
                    </span>

                    Amarelo

                </button>


                <button
                    type="button"
                    data-risco="vermelho"
                    aria-pressed="${
                        atendimento.risco ===
                        "vermelho"
                    }"
                >

                    <span class="bolinha vermelho">
                    </span>

                    Vermelho

                </button>

            </div>


            <p>

                ${
                    atendimento.risco
                        ? "Risco atual: " +
                          atendimento.risco
                        : "Ainda sem classificação."
                }

            </p>


            <div class="campo">

                <label>
                    Anotações da enfermagem
                </label>

                <textarea id="s-notas">${textoSeguro(
                    atendimento.anotacoes || ""
                )}</textarea>

            </div>


            <div class="linha-botoes">

                <button
                    class="btn"
                    id="btnSalvarFicha"
                >
                    Salvar ficha
                </button>


                ${
                    enfermeiro &&
                    atendimento.status !==
                    "finalizado"
                        ? `
                            <button
                                class="btn neutro"
                                id="btnFinalizar"
                            >
                                Finalizar atendimento
                            </button>
                        `
                        : ""
                }

            </div>

        </div>
    `;


    configurarRisco(
        atendimento
    );


    pegar("btnSalvarFicha")
        .addEventListener(
            "click",
            function () {

                salvarFicha(
                    atendimento.id
                );
            }
        );


    var botaoFinalizar =
        pegar("btnFinalizar");


    if (botaoFinalizar) {

        botaoFinalizar.addEventListener(
            "click",
            function () {

                finalizarAtendimento(
                    atendimento.id
                );
            }
        );
    }
}


// =====================================================
// ESCOLHER CLASSIFICAÇÃO DE RISCO
// =====================================================

var riscoEscolhido = null;


function configurarRisco(atendimento) {

    riscoEscolhido =
        atendimento.risco;


    pegarTodos(
        "#selRisco button"
    ).forEach(function (botao) {

        botao.addEventListener(
            "click",
            function () {

                riscoEscolhido =
                    botao.dataset.risco;


                pegarTodos(
                    "#selRisco button"
                ).forEach(
                    function (outro) {

                        outro.setAttribute(
                            "aria-pressed",
                            outro.dataset.risco ===
                            riscoEscolhido
                        );
                    }
                );
            }
        );
    });
}


// =====================================================
// SALVAR FICHA
// =====================================================

function salvarFicha(idAtendimento) {

    var atendimento =
        banco.atendimentos.find(
            function (item) {

                return item.id ===
                    idAtendimento;
            }
        );


    if (!atendimento) {
        return;
    }


    atendimento.sinais = {

        pa:
            pegar("s-pa").value.trim(),

        pag:
            pegar("s-pag").value.trim(),

        fc:
            pegar("s-fc").value.trim(),

        fr:
            pegar("s-fr").value.trim(),

        temp:
            pegar("s-temp").value.trim(),

        spo2:
            pegar("s-spo2").value.trim(),

        glicemia:
            pegar("s-glic").value.trim(),

        peso:
            pegar("s-peso").value.trim(),

        medidoPor:
            sessao.nome,

        medidoEm:
            Date.now()
    };


    atendimento.anotacoes =
        pegar("s-notas").value;


    atendimento.risco =
        riscoEscolhido;


    if (riscoEscolhido) {

        atendimento.riscoPor =
            sessao.nome;


        // O enfermeiro confirma.
        // O técnico deixa para confirmação.
        atendimento.riscoConfirmado =
            sessao.papel ===
            "enfermeiro";


        if (
            atendimento.status ===
            "aguardando"
        ) {

            atendimento.status =
                "em atendimento";
        }
    }


    atendimento.eventos.push({

        quando: Date.now(),

        texto:
            "Ficha atualizada por " +
            sessao.nome
    });


    salvarBanco();


    registrarAcao(
        "Atualizou sinais vitais e risco",
        atendimento.senhaChamada
    );


    mostrarMensagem(
        "Ficha salva com sucesso."
    );


    mostrarFila();
}


// =====================================================
// FINALIZAR ATENDIMENTO
// =====================================================

function finalizarAtendimento(
    idAtendimento
) {

    if (
        sessao.papel !==
        "enfermeiro"
    ) {

        mostrarMensagem(
            "Somente o enfermeiro pode finalizar."
        );

        return;
    }


    var atendimento =
        banco.atendimentos.find(
            function (item) {

                return item.id ===
                    idAtendimento;
            }
        );


    if (!atendimento) {
        return;
    }


    if (!atendimento.risco) {

        mostrarMensagem(
            "Classifique o risco antes de finalizar."
        );

        return;
    }


    atendimento.status =
        "finalizado";

    atendimento.riscoConfirmado =
        true;


    atendimento.eventos.push({

        quando: Date.now(),

        texto:
            "Atendimento finalizado por " +
            sessao.nome
    });


    salvarBanco();


    registrarAcao(
        "Finalizou o atendimento",
        atendimento.senhaChamada
    );


    atendimentoSelecionado = null;


    pegar("fichaPaciente").innerHTML =
        '<div class="cartao vazio">' +
        'Selecione um paciente na fila.' +
        '</div>';


    mostrarMensagem(
        "Atendimento finalizado."
    );


    mostrarFila();
}


// =====================================================
// AUDITORIA
// =====================================================

function registrarAcao(
    acao,
    alvo
) {

    banco.sistema.push({

        quando: Date.now(),

        quem:
            sessao
                ? sessao.nome
                : "Sistema",

        papel:
            sessao
                ? sessao.papel
                : "sistema",

        acao: acao,

        alvo:
            alvo || ""
    });


    // Guarda somente os últimos registros
    if (banco.sistema.length > 200) {

        banco.sistema =
            banco.sistema.slice(-200);
    }


    salvarBanco();
}


// =====================================================
// DADOS DE EXEMPLO
// =====================================================

pegar("btnDemo").addEventListener(
    "click",
    function () {

        criarDadosDeExemplo();
    }
);


function criarDadosDeExemplo() {

    var exemplos = [

        {

            nome:
                "Marina Alves de Souza",

            nascimento:
                "1958-03-12",

            cpf:
                "11144477735",

            rg:
                "12.345.678-9",

            telefone:
                "(16) 99888-1122",

            sangue:
                "O+",

            alergias:
                "Dipirona",

            doencas:
                ["Hipertensão", "Diabetes"],

            motivo:
                "Dor no peito e falta de ar",

            sintomas:
                "Aperto no peito e falta de ar.",

            dor:
                9
        },


        {

            nome:
                "Renan Batista Lima",

            nascimento:
                "1994-11-02",

            cpf:
                "52998224725",

            rg:
                "33.221.114-0",

            telefone:
                "(16) 99444-7788",

            sangue:
                "A+",

            alergias:
                "Nenhuma",

            doencas:
                ["Asma"],

            motivo:
                "Corte profundo na mão",

            sintomas:
                "Cortei a mão enquanto cozinhava.",

            dor:
                6
        },


        {

            nome:
                "Cecília Prado Nogueira",

            nomeSocial:
                "Ceci",

            nascimento:
                "2016-07-21",

            cpf:
                "15350946056",

            rg:
                "44.556.677-1",

            telefone:
                "(16) 99333-2211",

            sangue:
                "B+",

            alergias:
                "Penicilina",

            doencas:
                [],

            motivo:
                "Febre há dois dias",

            sintomas:
                "Febre de 38,5 graus.",

            dor:
                3
        }
    ];


    var criados = 0;


    exemplos.forEach(
        function (exemplo) {

            var existe =
                banco.pacientes.some(
                    function (paciente) {

                        return paciente.cpf ===
                            exemplo.cpf;
                    }
                );


            if (existe) {
                return;
            }


            var paciente = {

                id:
                    criarId(),

                nome:
                    exemplo.nome,

                nomeSocial:
                    exemplo.nomeSocial || "",

                nascimento:
                    exemplo.nascimento,

                cpf:
                    exemplo.cpf,

                rg:
                    exemplo.rg,

                sus:
                    "",

                govbr:
                    "",

                telefone:
                    exemplo.telefone,

                sangue:
                    exemplo.sangue,

                endereco: {

                    cep:
                        "13000-000",

                    rua:
                        "Rua das Acácias",

                    numero:
                        "120",

                    bairro:
                        "Centro",

                    cidade:
                        "Campinas",

                    estado:
                        "SP"
                },

                alergias:
                    exemplo.alergias,

                doencas:
                    exemplo.doencas,

                outras:
                    "",

                medicamentos:
                    "",

                emergencia: {

                    nome:
                        "Contato de emergência",

                    parentesco:
                        "Familiar",

                    telefone:
                        exemplo.telefone
                },

                senha:
                    protegerSenha(
                        "123456"
                    ),

                consentimento: {

                    aceito: true,

                    quando:
                        Date.now(),

                    versao:
                        "1.0"
                },

                criadoEm:
                    Date.now()
            };


            banco.pacientes.push(
                paciente
            );


            var atendimento = {

                id:
                    criarId(),

                pacienteId:
                    paciente.id,

                senhaChamada:
                    "T" +
                    String(
                        banco.atendimentos.length + 1
                    ).padStart(3, "0"),

                abertoEm:
                    Date.now() -
                    (criados * 15 * 60000),

                motivo:
                    exemplo.motivo,

                inicio:
                    "Hoje",

                sintomas:
                    exemplo.sintomas,

                dor:
                    exemplo.dor,

                risco:
                    null,

                riscoConfirmado:
                    false,

                status:
                    "aguardando",

                acompanhante: {

                    nome: "",

                    parentesco: "",

                    rg: "",

                    cpf: "",

                    telefone: "",

                    endereco: ""
                },

                sinais: {},

                anotacoes: "",

                eventos: [

                    {
                        quando:
                            Date.now(),

                        texto:
                            "Ficha criada como exemplo"
                    }
                ]
            };


            banco.atendimentos.push(
                atendimento
            );


            criados++;
        }
    );


    salvarBanco();


    if (criados > 0) {

        mostrarMensagem(
            criados +
            " pacientes de exemplo foram criados."
        );

    } else {

        mostrarMensagem(
            "Os pacientes de exemplo já existem."
        );
    }
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

// Carrega o banco salvo
carregarBanco();


// Monta a escala de dor
montarEscalaDor();


// Se o profissional estiver olhando a fila,
// atualiza automaticamente a cada minuto.
setInterval(
    function () {

        if (
            pegar("tela-prof-painel")
            .classList.contains("ativa")
        ) {

            mostrarFila();
        }

    },
    60000
);