const SUPABASE_URL = "https://dtdkibatvmxgwvscwbeo.supabase.co";

const SUPABASE_KEY = "sb_publishable_mOTfnwk-9tOMCbYjno7giA_T8GBoe4u";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
    
    
);

// NOME DA BARBEARIA NA ABA DO NAVEGADOR
document.title = "Agenda — " + CONFIG.nome;
document.getElementById("nomeBarbeariaAdminFooter").textContent =
    CONFIG.nome;
document.getElementById("logoBarbeariaAdmin").src =
    CONFIG.logo;

// CORES DA BARBEARIA

document.documentElement.style.setProperty("--bg", CONFIG.cores.fundo);
document.documentElement.style.setProperty("--card", CONFIG.cores.card);
document.documentElement.style.setProperty("--card2", CONFIG.cores.card2);
document.documentElement.style.setProperty("--text", CONFIG.cores.texto);
document.documentElement.style.setProperty("--muted", CONFIG.cores.textoSecundario);
document.documentElement.style.setProperty("--gold", CONFIG.cores.dourado);
document.documentElement.style.setProperty("--gold2", CONFIG.cores.douradoClaro);
document.documentElement.style.setProperty("--line", CONFIG.cores.linha);
document.documentElement.style.setProperty("--servicoNome", CONFIG.cores.servicoNome);


// ==========================================
// ELEMENTOS
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const adminPanel = document.getElementById("adminPanel");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");

const adminDate = document.getElementById("adminDate");
const adminList = document.getElementById("adminList");
const adminBarber = document.getElementById("adminBarber");

const agendaResumo =
    document.getElementById("agendaResumo");

const logoutAdmin = document.getElementById("logoutAdmin");
const clearAll = document.getElementById("clearAll");


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("nomeBarbeariaAdmin").textContent =
    CONFIG.nome.toUpperCase();
    CONFIG.barbeiros.forEach(function (barbeiro) {

    const option = document.createElement("option");

    option.value = barbeiro;
    option.textContent = barbeiro;

    adminBarber.appendChild(option);

});

   const {
    data: { session }
} = await db.auth.getSession();


if (session && sessionStorage.getItem("adminLogado") === "true") {

    mostrarPainel();

} else {

    await db.auth.signOut();

    mostrarLogin();

}


    loginForm.addEventListener(
        "submit",
        fazerLogin
    );


    logoutAdmin.addEventListener(
        "click",
        sairDaAgenda
    );


    adminDate.addEventListener(
        "change",
        carregarAgenda
    );
adminBarber.addEventListener(
    "change",
    carregarAgenda
);

    clearAll.addEventListener(
        "click",
        excluirTodos
    );

});


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    loginScreen.classList.add("show");

    adminPanel.style.display = "none";

}


// ==========================================
// MOSTRAR PAINEL
// ==========================================

async function mostrarPainel() {

    loginScreen.classList.remove("show");

    adminPanel.style.display = "block";


    definirDataHoje();

    await carregarAgenda();

}


// ==========================================
// LOGIN
// ==========================================

async function fazerLogin(event) {

    event.preventDefault();


    const email = adminEmail.value.trim();
    const senha = adminPassword.value;


    loginMessage.style.display = "none";


    if (!email || !senha) {

        mostrarMensagemLogin(
            "Preencha o e-mail e a senha."
        );

        return;
    }


    const {
        data,
        error
    } = await db.auth.signInWithPassword({
        email: email,
        password: senha
    });


    if (error) {

        console.error(error);

        mostrarMensagemLogin(
            "E-mail ou senha incorretos."
        );

        return;
    }


    if (!data.session) {

        mostrarMensagemLogin(
            "Não foi possível iniciar a sessão."
        );

        return;
    }


    adminEmail.value = "";
    adminPassword.value = "";

sessionStorage.setItem("adminLogado", "true");

mostrarPainel();

}


// ==========================================
// MENSAGEM DE LOGIN
// ==========================================

function mostrarMensagemLogin(mensagem) {

    loginMessage.textContent = mensagem;

    loginMessage.style.display = "block";

}


// ==========================================
// DATA DE HOJE
// ==========================================

function definirDataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");


    adminDate.value =
        `${ano}-${mes}-${dia}`;

}

function atualizarResumo(agendamentos) {

    agendaResumo.innerHTML = "";

    const total = agendamentos.length;

    const cardTotal = document.createElement("div");

    cardTotal.className = "resumo-item";

    cardTotal.innerHTML = `
        <strong>${total}</strong>
        <span>Agendamentos</span>
    `;

    agendaResumo.appendChild(cardTotal);


    CONFIG.barbeiros.forEach(function (barbeiro) {

        const quantidade =
            agendamentos.filter(function (agendamento) {

                return agendamento.barbeiro === barbeiro;

            }).length;


        const card =
            document.createElement("div");

        card.className = "resumo-item";

        card.innerHTML = `
            <strong>${quantidade}</strong>
            <span>${escaparHTML(barbeiro)}</span>
        `;

        agendaResumo.appendChild(card);

    });

}
// ==========================================
// CARREGAR AGENDA
// ==========================================

async function carregarAgenda() {

    const dataSelecionada =
        adminDate.value;


    if (!dataSelecionada) {

        adminList.innerHTML = `
            <p style="color:#a5a5a5;">
                Escolha uma data.
            </p>
        `;

        return;
    }


    adminList.innerHTML = `
        <p style="color:#a5a5a5;">
            Carregando agendamentos...
        </p>
    `;


    const barbeiroSelecionado = adminBarber.value;

let consulta = db
    .from("agendamentos")
    .select("*")
    .eq("data", dataSelecionada);

if (barbeiroSelecionado) {
    consulta = consulta.eq("barbeiro", barbeiroSelecionado);
}

const {
    data,
    error
} = await consulta
    .order("horario", {
        ascending: true
    });


    if (error) {

        console.error(error);

        adminList.innerHTML = `
            <p style="color:#f28a8a;">
                Erro ao carregar a agenda.
            </p>
        `;

        return;
    }

atualizarResumo(data || []);
    
    if (!data || data.length === 0) {

        adminList.innerHTML = `
            <div class="booking-item">

                <strong>
                    Agenda livre
                </strong>

                <small>
                    Não existem agendamentos para esta data.
                </small>

            </div>
        `;

        return;
    }


    adminList.innerHTML = "";


    data.forEach(agendamento => {

        const item =
            document.createElement("div");

        item.className =
            "booking-item";


        item.innerHTML = `

            <strong>
                ${escaparHTML(agendamento.horario)}
                —
                ${escaparHTML(agendamento.nome)}
            </strong>

            <small>
                Serviço:
                ${escaparHTML(agendamento.servico)}
            </small>

            <br>

            <small>
                Barbeiro:
                ${escaparHTML(agendamento.barbeiro)}
            </small>

            <br>

            <small>
                WhatsApp:
                ${escaparHTML(agendamento.whatsapp)}
            </small>

            <br>

            <small>
                Valor:
                R$ ${Number(agendamento.preco)
                    .toFixed(2)
                    .replace(".", ",")}
            </small>

            <br>

            <button
                type="button"
                class="cancel-admin"
                data-id="${agendamento.id}"
            >
                Cancelar agendamento
            </button>
        `;


        adminList.appendChild(item);

    });


    document
        .querySelectorAll(".cancel-admin")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;

                    await cancelarAgendamento(id);

                }
            );

        });

}


// ==========================================
// CANCELAR AGENDAMENTO
// ==========================================

async function cancelarAgendamento(id) {

    const confirmar = confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) {
        return;
    }

    const { error } = await db
        .from("agendamentos")
        .delete()
        .eq("id", id);

    if (error) {

        console.error("ERRO AO CANCELAR:", error);

        alert(
            "Não foi possível cancelar o agendamento.\n\n" +
            error.message
        );

        return;
    }

    alert(
        "Agendamento cancelado com sucesso."
    );

    await carregarAgenda();
}


// ==========================================
// EXCLUIR TODOS
// ==========================================

async function excluirTodos() {

    const confirmar = confirm(
        "ATENÇÃO!\n\n" +
        "Isso excluirá TODOS os agendamentos.\n\n" +
        "Deseja realmente continuar?"
    );

    if (!confirmar) {
        return;
    }

    const segundaConfirmacao = confirm(
        "Tem certeza absoluta?\n\n" +
        "Todos os agendamentos serão excluídos."
    );

    if (!segundaConfirmacao) {
        return;
    }

    const { error } = await db.rpc(
        "excluir_todos_agendamentos"
    );

    if (error) {

        console.error(
            "ERRO AO EXCLUIR TODOS:",
            error
        );

        alert(
            "Não foi possível excluir os agendamentos.\n\n" +
            error.message
        );

        return;
    }

    alert(
        "Todos os agendamentos foram excluídos."
    );

    await carregarAgenda();
}
// ==========================================
// LOGOUT
// ==========================================

async function sairDaAgenda() {

    await db.auth.signOut();
sessionStorage.removeItem("adminLogado");
    mostrarLogin();

}


// ==========================================
// PROTEÇÃO CONTRA HTML INJETADO
// ==========================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
