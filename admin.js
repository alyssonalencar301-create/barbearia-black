const SUPABASE_URL = "https://dtdkibatvmxgwvscwbeo.supabase.co";

const SUPABASE_KEY = "sb_publishable_mOTfnwk-9tOMCbYjno7giA_T8GBoe4u";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const adminDate = document.getElementById("adminDate");
const adminList = document.getElementById("adminList");
const logoutAdmin = document.getElementById("logoutAdmin");
const clearAll = document.getElementById("clearAll");


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // Verifica se o proprietário está logado
    const {
        data: { session }
    } = await db.auth.getSession();

    if (!session) {
        window.location.href = "index.html";
        return;
    }


    // Define a data de hoje
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    adminDate.value = `${ano}-${mes}-${dia}`;


    // Carrega a agenda
    await carregarAgenda();


    // Quando mudar a data
    adminDate.addEventListener("change", carregarAgenda);


    // Logout
    logoutAdmin.addEventListener("click", sairDaAgenda);


    // Excluir todos
    clearAll.addEventListener("click", excluirTodos);
});


// ==========================================
// CARREGAR AGENDA
// ==========================================

async function carregarAgenda() {

    const dataSelecionada = adminDate.value;

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


    const {
        data,
        error
    } = await db
        .from("agendamentos")
        .select("*")
        .eq("data", dataSelecionada)
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


    // Nenhum agendamento
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


    // Renderiza os agendamentos
    adminList.innerHTML = "";


    data.forEach(agendamento => {

        const item = document.createElement("div");

        item.className = "booking-item";


        item.innerHTML = `
            <strong>
                ${escaparHTML(agendamento.horario)}
                — ${escaparHTML(agendamento.nome)}
            </strong>

            <small>
                Serviço: ${escaparHTML(agendamento.servico)}
            </small>

            <br>

            <small>
                Barbeiro: ${escaparHTML(agendamento.barbeiro)}
            </small>

            <br>

            <small>
                WhatsApp: ${escaparHTML(agendamento.whatsapp)}
            </small>

            <br>

            <small>
                Valor: R$ ${Number(agendamento.preco).toFixed(2).replace(".", ",")}
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


    // Eventos dos botões cancelar
    document
        .querySelectorAll(".cancel-admin")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const id = button.dataset.id;

                await cancelarAgendamento(id);

            });

        });

}


// ==========================================
// CANCELAR UM AGENDAMENTO
// ==========================================

async function cancelarAgendamento(id) {

    const confirmar = confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );


    if (!confirmar) {
        return;
    }


    const {
        error
    } = await db
        .from("agendamentos")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível cancelar o agendamento."
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
        "Isso excluirá TODOS os agendamentos da barbearia.\n\n" +
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


    const {
        error
    } = await db
        .from("agendamentos")
        .delete()
        .neq("id", 0);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível excluir os agendamentos."
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

    window.location.href = "index.html";

}


// ==========================================
// SEGURANÇA — ESCAPAR HTML
// ==========================================

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
