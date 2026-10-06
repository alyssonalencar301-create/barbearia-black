// ======================================================
// CONFIGURAÇÃO DO SUPABASE
// ======================================================

const SUPABASE_URL = "https://dtdkibatvmxgwvscwbeo.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_mOTfnwk-9tOMCbYjno7giA_T8GBoe4u";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// CONFIGURAÇÕES DA BARBEARIA
// ======================================================

const servicos = {
    "Corte": 30,
    "Barba": 20,
    "Corte + Barba": 45
};

const barbeiros = ["João", "Pedro"];

const inicio = 8;
const fim = 19;
const intervalo = 30;


// ======================================================
// ELEMENTOS DA PÁGINA
// ======================================================

const form = document.getElementById("bookingForm");
const dataInput = document.getElementById("data");
const barbeiroSelect = document.getElementById("barbeiro");
const horarioSelect = document.getElementById("horario");
const servicoSelect = document.getElementById("servico");


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    configurarDataMinima();
    carregarHorarios();
    configurarFormulario();
    configurarAdmin();
});


// ======================================================
// DATA MÍNIMA
// ======================================================

function configurarDataMinima() {
    if (!dataInput) return;

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    dataInput.min = `${ano}-${mes}-${dia}`;
}


// ======================================================
// GERAR HORÁRIOS
// ======================================================

function gerarHorarios() {
    const horarios = [];

    for (let hora = inicio; hora < fim; hora++) {
        horarios.push(`${String(hora).padStart(2, "0")}:00`);
        horarios.push(`${String(hora).padStart(2, "0")}:30`);
    }

    return horarios;
}


// ======================================================
// CARREGAR HORÁRIOS DISPONÍVEIS
// ======================================================

async function carregarHorarios() {

    if (!horarioSelect) return;

    horarioSelect.innerHTML =
        '<option value="">Selecione um horário</option>';

    if (!dataInput || !dataInput.value) {
        return;
    }

    if (!barbeiroSelect || !barbeiroSelect.value) {
        return;
    }

    const data = dataInput.value;
    const barbeiro = barbeiroSelect.value;

    try {

        const { data: agendamentos, error } = await db
            .from("agendamentos")
            .select("horario")
            .eq("data", data)
            .eq("barbeiro", barbeiro);

        if (error) {
            console.error("Erro ao buscar horários:", error);
            mostrarErro("Não foi possível carregar os horários.");
            return;
        }

        const ocupados = (agendamentos || []).map(function (item) {
            return item.horario.substring(0, 5);
        });

        const horarios = gerarHorarios();

        horarios.forEach(function (horario) {

            const option = document.createElement("option");

            option.value = horario;
            option.textContent = horario;

            if (ocupados.includes(horario)) {
                option.disabled = true;
                option.textContent = `${horario} - Indisponível`;
            }

            horarioSelect.appendChild(option);
        });

    } catch (erro) {

        console.error("Erro inesperado:", erro);
        mostrarErro("Ocorreu um erro ao carregar os horários.");

    }
}


// ======================================================
// ATUALIZAR HORÁRIOS QUANDO DATA OU BARBEIRO MUDAR
// ======================================================

if (dataInput) {
    dataInput.addEventListener("change", carregarHorarios);
}

if (barbeiroSelect) {
    barbeiroSelect.addEventListener("change", carregarHorarios);
}


// ======================================================
// FORMULÁRIO DE AGENDAMENTO
// ======================================================

function configurarFormulario() {

    if (!form) return;

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nomeElement = document.getElementById("nome");
        const whatsappElement = document.getElementById("whatsapp");

        const nome = nomeElement ? nomeElement.value.trim() : "";
        const whatsapp = whatsappElement
            ? whatsappElement.value.trim()
            : "";

        const servico = servicoSelect
            ? servicoSelect.value
            : "";

        const barbeiro = barbeiroSelect
            ? barbeiroSelect.value
            : "";

        const data = dataInput
            ? dataInput.value
            : "";

        const horario = horarioSelect
            ? horarioSelect.value
            : "";


        // ------------------------------------------------
        // VALIDAÇÃO
        // ------------------------------------------------

        if (!nome) {
            alert("Digite seu nome.");
            return;
        }

        if (!whatsapp) {
            alert("Digite seu WhatsApp.");
            return;
        }

        if (!servico) {
            alert("Selecione um serviço.");
            return;
        }

        if (!barbeiro) {
            alert("Selecione um barbeiro.");
            return;
        }

        if (!data) {
            alert("Selecione uma data.");
            return;
        }

        if (!horario) {
            alert("Selecione um horário.");
            return;
        }


        // ------------------------------------------------
        // PREÇO
        // ------------------------------------------------

        const preco = servicos[servico];

        if (!preco) {
            alert("Serviço inválido.");
            return;
        }


        // ------------------------------------------------
        // VERIFICAR SE O HORÁRIO AINDA ESTÁ DISPONÍVEL
        // ------------------------------------------------

        try {

            const { data: existente, error: erroBusca } = await db
                .from("agendamentos")
                .select("id")
                .eq("data", data)
                .eq("horario", horario)
                .eq("barbeiro", barbeiro)
                .limit(1);

            if (erroBusca) {
                console.error(erroBusca);
                alert("Não foi possível verificar o horário.");
                return;
            }

            if (existente && existente.length > 0) {

                alert(
                    "Esse horário acabou de ser reservado. Escolha outro."
                );

                await carregarHorarios();

                return;
            }


            // ------------------------------------------------
            // SALVAR AGENDAMENTO
            // ------------------------------------------------

            const { error: erroInsercao } = await db
                .from("agendamentos")
                .insert([
                    {
                        nome: nome,
                        whatsapp: whatsapp,
                        servico: servico,
                        preco: preco,
                        barbeiro: barbeiro,
                        data: data,
                        horario: horario
                    }
                ]);


            if (erroInsercao) {

                console.error(
                    "Erro ao salvar agendamento:",
                    erroInsercao
                );

                alert(
                    "Não foi possível realizar o agendamento."
                );

                return;
            }


            // ------------------------------------------------
            // SUCESSO
            // ------------------------------------------------

            mostrarSucesso(
                nome,
                servico,
                barbeiro,
                data,
                horario
            );

            form.reset();

            if (horarioSelect) {
                horarioSelect.innerHTML =
                    '<option value="">Selecione um horário</option>';
            }

        } catch (erro) {

            console.error(erro);

            alert(
                "Ocorreu um erro inesperado. Tente novamente."
            );
        }
    });
}


// ======================================================
// MENSAGEM DE SUCESSO
// ======================================================

function mostrarSucesso(
    nome,
    servico,
    barbeiro,
    data,
    horario
) {

    const mensagem = `
Agendamento realizado com sucesso!

Cliente: ${nome}
Serviço: ${servico}
Barbeiro: ${barbeiro}
Data: ${formatarData(data)}
Horário: ${horario}
`;

    alert(mensagem);
}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ======================================================
// MENSAGEM DE ERRO
// ======================================================

function mostrarErro(mensagem) {
    console.error(mensagem);
}


// ======================================================
// PAINEL ADMINISTRATIVO
// ======================================================

function configurarAdmin() {

    const botaoAdmin = document.getElementById("adminBtn");

    if (!botaoAdmin) return;

    botaoAdmin.addEventListener("click", function () {
        carregarAgenda();
    });
}


// ======================================================
// CARREGAR AGENDA
// ======================================================

async function carregarAgenda() {

    try {

        const { data: agendamentos, error } = await db
            .from("agendamentos")
            .select("*")
            .order("data", { ascending: true })
            .order("horario", { ascending: true });

        if (error) {

            console.error(
                "Erro ao carregar agenda:",
                error
            );

            alert("Não foi possível carregar a agenda.");

            return;
        }


        if (!agendamentos || agendamentos.length === 0) {

            alert("Nenhum agendamento encontrado.");

            return;
        }


        let mensagem = "AGENDA DA BARBEARIA\n\n";

        agendamentos.forEach(function (agendamento, index) {

            mensagem +=
                `${index + 1}. ${agendamento.nome}\n` +
                `Serviço: ${agendamento.servico}\n` +
                `Barbeiro: ${agendamento.barbeiro}\n` +
                `Data: ${formatarData(agendamento.data)}\n` +
                `Horário: ${String(agendamento.horario).substring(0, 5)}\n` +
                `WhatsApp: ${agendamento.whatsapp}\n\n`;

        });

        alert(mensagem);

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar a agenda.");
    }
}


// ======================================================
// CANCELAR AGENDAMENTO
// ======================================================

async function cancelarAgendamento(id) {

    if (!id) return;

    const confirmar = confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) return;

    try {

        const { error } = await db
            .from("agendamentos")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "Erro ao cancelar:",
                error
            );

            alert(
                "Não foi possível cancelar o agendamento."
            );

            return;
        }

        alert("Agendamento cancelado com sucesso.");

        await carregarHorarios();

    } catch (erro) {

        console.error(erro);

        alert("Erro inesperado ao cancelar.");
    }
}
