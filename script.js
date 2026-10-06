// ======================================================
// BARBEARIA BLACK - SCRIPT PRINCIPAL
// ======================================================

// ------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------

const SUPABASE_URL = "https://dtdkibatvmxgwvscwbeo.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_mOTfnwk-9tOMCbYjno7giA_T8GBoe4u";


// Verifica se o Supabase foi carregado
if (!window.supabase) {
    console.error("Supabase não foi carregado.");
    alert("Erro ao carregar o sistema. Recarregue a página.");
}

// Cria conexão com o Supabase
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// SERVIÇOS
// ======================================================

const SERVICES = [
    {
        id: "corte",
        name: "Corte",
        description: "Corte tradicional ou moderno",
        price: 30
    },
    {
        id: "barba",
        name: "Barba",
        description: "Barba completa e acabamento",
        price: 20
    },
    {
        id: "corte-barba",
        name: "Corte + Barba",
        description: "O combo completo",
        price: 45
    }
];


// ======================================================
// CONFIGURAÇÕES DE HORÁRIO
// ======================================================

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;
const INTERVAL = 30;


// ======================================================
// ESTADO DO AGENDAMENTO
// ======================================================

let state = {
    service: null,
    barber: "",
    date: "",
    time: ""
};


// ======================================================
// ELEMENTOS
// ======================================================

const serviceOptions = document.getElementById("serviceOptions");
const servicesGrid = document.getElementById("servicesGrid");

const barberInput = document.getElementById("barber");
const dateInput = document.getElementById("date");
const timesContainer = document.getElementById("times");

const bookingForm = document.getElementById("bookingForm");

const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

const summary = document.getElementById("summary");


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    renderServices();

    configurarData();

    configurarEventos();

    configurarAdmin();

});


// ======================================================
// RENDERIZAR SERVIÇOS
// ======================================================

function renderServices() {

    // ----------------------------------------------
    // CARDS DOS SERVIÇOS
    // ----------------------------------------------

    if (servicesGrid) {

        servicesGrid.innerHTML = SERVICES.map(function (service, index) {

            return `
                <div class="service-card">

                    <span class="number">
                        0${index + 1}
                    </span>

                    <h3>
                        ${service.name}
                    </h3>

                    <p>
                        ${service.description}
                    </p>

                    <div class="price">
                        R$ ${formatPrice(service.price)}
                    </div>

                </div>
            `;

        }).join("");

    }


    // ----------------------------------------------
    // OPÇÕES PARA O AGENDAMENTO
    // ----------------------------------------------

    if (serviceOptions) {

        serviceOptions.innerHTML = SERVICES.map(function (service) {

            return `
                <button
                    type="button"
                    class="option"
                    data-service="${service.id}"
                >

                    <div>
                        <b>${service.name}</b>

                        <small>
                            ${service.description}
                        </small>
                    </div>

                    <strong>
                        R$ ${formatPrice(service.price)}
                    </strong>

                </button>
            `;

        }).join("");


        // ------------------------------------------
        // EVENTO DE CLIQUE NOS SERVIÇOS
        // ------------------------------------------

        document.querySelectorAll("[data-service]").forEach(function (button) {

            button.addEventListener("click", function () {

                const serviceId = button.dataset.service;

                state.service = SERVICES.find(function (service) {
                    return service.id === serviceId;
                });


                // Remove seleção anterior
                document
                    .querySelectorAll("[data-service]")
                    .forEach(function (item) {
                        item.classList.remove("selected");
                    });


                // Seleciona o atual
                button.classList.add("selected");

            });

        });

    }

}


// ======================================================
// FORMATAR PREÇO
// ======================================================

function formatPrice(value) {

    return Number(value)
        .toFixed(2)
        .replace(".", ",");

}


// ======================================================
// CONFIGURAR DATA
// ======================================================

function configurarData() {

    if (!dateInput) return;


    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");


    const dataAtual =
        `${ano}-${mes}-${dia}`;


    dateInput.min = dataAtual;

    dateInput.value = dataAtual;

    state.date = dataAtual;

}


// ======================================================
// EVENTOS
// ======================================================

function configurarEventos() {


    // ----------------------------------------------
    // BARBEIRO
    // ----------------------------------------------

    if (barberInput) {

        barberInput.addEventListener(
            "change",
            function () {

                state.barber =
                    barberInput.value;

                state.time = "";

                renderTimes();

            }
        );

    }


    // ----------------------------------------------
    // DATA
    // ----------------------------------------------

    if (dateInput) {

        dateInput.addEventListener(
            "change",
            function () {

                state.date =
                    dateInput.value;

                state.time = "";

                renderTimes();

            }
        );

    }


    // ----------------------------------------------
    // BOTÕES PRÓXIMO
    // ----------------------------------------------

    document
        .querySelectorAll(".next-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const nextStep =
                        Number(button.dataset.next);

                    if (nextStep === 2) {

                        if (!state.service) {

                            alert(
                                "Escolha um serviço primeiro."
                            );

                            return;
                        }

                    }


                    if (nextStep === 3) {

                        if (!state.barber) {

                            alert(
                                "Escolha um barbeiro."
                            );

                            return;
                        }


                        if (!state.date) {

                            alert(
                                "Escolha uma data."
                            );

                            return;
                        }


                        if (!state.time) {

                            alert(
                                "Escolha um horário."
                            );

                            return;
                        }

                    }


                    goToStep(nextStep);

                }
            );

        });


    // ----------------------------------------------
    // BOTÕES VOLTAR
    // ----------------------------------------------

    document
        .querySelectorAll(".back-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const backStep =
                        Number(button.dataset.back);

                    goToStep(backStep);

                }
            );

        });


    // ----------------------------------------------
    // FORMULÁRIO
    // ----------------------------------------------

    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            confirmarAgendamento
        );

    }


    // ----------------------------------------------
    // FECHAR MODAL DE SUCESSO
    // ----------------------------------------------

    const closeSuccess =
        document.getElementById("closeSuccess");


    if (closeSuccess) {

        closeSuccess.addEventListener(
            "click",
            function () {

                document
                    .getElementById("successModal")
                    .classList.remove("show");

            }
        );

    }

}


// ======================================================
// TROCAR ETAPA
// ======================================================

function goToStep(stepNumber) {

    // Esconde todas as etapas

    document
        .querySelectorAll(".form-step")
        .forEach(function (step) {

            step.classList.remove("visible");

        });


    // Mostra a etapa desejada

    const target =
        document.getElementById(
            `step${stepNumber}`
        );


    if (target) {

        target.classList.add("visible");

    }


    // Atualiza indicador das etapas

    document
        .querySelectorAll(".step")
        .forEach(function (step) {

            const number =
                Number(step.dataset.step);

            step.classList.toggle(
                "active",
                number === stepNumber
            );

        });


    // Se entrou na etapa 2
    // carrega horários

    if (stepNumber === 2) {

        renderTimes();

    }


    // Se entrou na etapa 3
    // mostra resumo

    if (stepNumber === 3) {

        renderSummary();

    }

}


// ======================================================
// MOSTRAR RESUMO
// ======================================================

function renderSummary() {

    if (!summary) return;

    if (!state.service) return;


    const dataFormatada =
        formatDate(state.date);


    summary.innerHTML = `
        <strong>
            ${state.service.name}
        </strong>

        <span>
            R$ ${formatPrice(state.service.price)}
        </span>

        <br>

        <span class="gold">
            ${dataFormatada}
            às
            ${state.time}
        </span>

        ·

        ${state.barber}
    `;

}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatDate(date) {

    if (!date) return "";

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `
        ${parts[2]}/${parts[1]}/${parts[0]}
    `;

}


// ======================================================
// GERAR HORÁRIOS
// ======================================================

function generateTimes() {

    const times = [];


    for (
        let hour = OPEN_HOUR;
        hour < CLOSE_HOUR;
        hour++
    ) {

        for (
            let minute = 0;
            minute < 60;
            minute += INTERVAL
        ) {

            const time =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            times.push(time);

        }

    }


    return times;

}


// ======================================================
// BUSCAR HORÁRIOS OCUPADOS
// ======================================================

async function getUsedTimes() {

    if (!state.barber || !state.date) {
        return [];
    }


    const { data, error } =
        await db
            .from("agendamentos")
            .select("horario")
            .eq("data", state.date)
            .eq("barbeiro", state.barber);


    if (error) {

        console.error(
            "Erro ao buscar horários:",
            error
        );

        alert(
            "Não foi possível carregar os horários."
        );

        return [];

    }


    return (data || []).map(function (item) {

        return String(
            item.horario
        ).substring(0, 5);

    });

}


// ======================================================
// RENDERIZAR HORÁRIOS
// ======================================================

async function renderTimes() {

    if (!timesContainer) return;


    // Se ainda não escolheu barbeiro ou data

    if (!state.barber || !state.date) {

        timesContainer.innerHTML = `
            <p style="color:#777;font-size:13px">
                Selecione barbeiro e data
                para ver os horários.
            </p>
        `;

        return;

    }


    timesContainer.innerHTML = `
        <p style="color:#777;font-size:13px">
            Carregando horários...
        </p>
    `;


    const usedTimes =
        await getUsedTimes();


    timesContainer.innerHTML = "";


    const times =
        generateTimes();


    times.forEach(function (time) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className = "time";

        button.textContent = time;


        // Horário ocupado

        if (usedTimes.includes(time)) {

            button.disabled = true;

            button.classList.add(
                "disabled"
            );

        }

        // Horário disponível

        else {

            button.addEventListener(
                "click",
                function () {

                    state.time = time;


                    // Remove seleção anterior

                    document
                        .querySelectorAll(".time")
                        .forEach(function (item) {

                            item.classList.remove(
                                "selected"
                            );

                        });


                    // Seleciona o horário

                    button.classList.add(
                        "selected"
                    );

                }
            );

        }


        timesContainer.appendChild(button);

    });

}


// ======================================================
// CONFIRMAR AGENDAMENTO
// ======================================================

async function confirmarAgendamento(event) {

    event.preventDefault();


    const nome =
        nameInput.value.trim();

    const whatsapp =
        phoneInput.value.trim();


    // ----------------------------------------------
    // VALIDAÇÕES
    // ----------------------------------------------

    if (!state.service) {

        alert(
            "Escolha um serviço."
        );

        goToStep(1);

        return;

    }


    if (!state.barber) {

        alert(
            "Escolha um barbeiro."
        );

        goToStep(2);

        return;

    }


    if (!state.date) {

        alert(
            "Escolha uma data."
        );

        goToStep(2);

        return;

    }


    if (!state.time) {

        alert(
            "Escolha um horário."
        );

        goToStep(2);

        return;

    }


    if (!nome) {

        alert(
            "Digite seu nome."
        );

        return;

    }


    if (!whatsapp) {

        alert(
            "Digite seu WhatsApp."
        );

        return;

    }


    // ----------------------------------------------
    // VERIFICAR SE O HORÁRIO AINDA ESTÁ LIVRE
    // ----------------------------------------------

    const { data: existing, error: checkError } =
        await db
            .from("agendamentos")
            .select("id")
            .eq("data", state.date)
            .eq("horario", state.time)
            .eq("barbeiro", state.barber);


    if (checkError) {

        console.error(
            checkError
        );

        alert(
            "Erro ao verificar disponibilidade."
        );

        return;

    }


    if (existing && existing.length > 0) {

        alert(
            "Esse horário acabou de ser ocupado. Escolha outro."
        );

        await renderTimes();

        return;

    }


    // ----------------------------------------------
    // SALVAR NO SUPABASE
    // ----------------------------------------------

    const { error } =
        await db
            .from("agendamentos")
            .insert([
                {
                    nome: nome,
                    whatsapp: whatsapp,
                    servico: state.service.name,
                    preco: state.service.price,
                    barbeiro: state.barber,
                    data: state.date,
                    horario: state.time
                }
            ]);


    if (error) {

        console.error(
            "Erro ao salvar:",
            error
        );

        alert(
            "Não foi possível confirmar o agendamento."
        );

        return;

    }


    // ----------------------------------------------
    // MOSTRAR SUCESSO
    // ----------------------------------------------

    const successText =
        document.getElementById(
            "successText"
        );


    successText.innerHTML = `
        <strong>
            ${state.service.name}
        </strong>
        <br>

        ${formatDate(state.date)}
        às
        ${state.time}

        <br>

        ${state.barber}
        ·
        ${nome}
    `;


    document
        .getElementById("successModal")
        .classList.add("show");


    // Limpa formulário

    bookingForm.reset();


    // Reseta estado

    state = {
        service: null,
        barber: "",
        date: "",
        time: ""
    };


    // Remove seleção visual

    document
        .querySelectorAll("[data-service]")
        .forEach(function (item) {

            item.classList.remove(
                "selected"
            );

        });


    // Volta para primeira etapa

    goToStep(1);


    // Configura data novamente

    configurarData();

}


// ======================================================
// PAINEL ADMINISTRATIVO
// ======================================================

function configurarAdmin() {

    const openAdmin =
        document.getElementById(
            "openAdmin"
        );


    const closeAdmin =
        document.getElementById(
            "closeAdmin"
        );


    const adminModal =
        document.getElementById(
            "adminModal"
        );


    const adminDate =
        document.getElementById(
            "adminDate"
        );


    if (openAdmin) {

        openAdmin.addEventListener(
            "click",
            function () {

                adminModal.classList.add(
                    "show"
                );

                configurarDataAdmin();

                carregarAgenda();

            }
        );

    }


    if (closeAdmin) {

        closeAdmin.addEventListener(
            "click",
            function () {

                adminModal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (adminDate) {

        adminDate.addEventListener(
            "change",
            carregarAgenda
        );

    }


    const clearAll =
        document.getElementById(
            "clearAll"
        );


    if (clearAll) {

        clearAll.addEventListener(
            "click",
            limparAgendamentos
        );

    }

}


// ======================================================
// DATA DO ADMIN
// ======================================================

function configurarDataAdmin() {

    const adminDate =
        document.getElementById(
            "adminDate"
        );


    if (!adminDate) return;


    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");


    adminDate.value =
        `${ano}-${mes}-${dia}`;

}


// ======================================================
// CARREGAR AGENDA
// ======================================================

async function carregarAgenda() {

    const adminList =
        document.getElementById(
            "adminList"
        );


    const adminDate =
        document.getElementById(
            "adminDate"
        );


    if (!adminList || !adminDate) {
        return;
    }


    const data =
        adminDate.value;


    adminList.innerHTML = `
        <p style="color:#777">
            Carregando agenda...
        </p>
    `;


    const { data: agendamentos, error } =
        await db
            .from("agendamentos")
            .select("*")
            .eq("data", data)
            .order("horario", {
                ascending: true
            });


    if (error) {

        console.error(
            "Erro ao carregar agenda:",
            error
        );

        adminList.innerHTML = `
            <p style="color:#777">
                Erro ao carregar a agenda.
            </p>
        `;

        return;

    }


    if (
        !agendamentos ||
        agendamentos.length === 0
    ) {

        adminList.innerHTML = `
            <p style="color:#777">
                Nenhum agendamento nesta data.
            </p>
        `;

        return;

    }


    adminList.innerHTML =
        agendamentos.map(function (booking) {

            return `
                <div class="booking-item">

                    <strong>
                        ${String(
                            booking.horario
                        ).substring(0, 5)}
                        ·
                        ${booking.servico}
                    </strong>

                    <small>
                        ${booking.nome}
                        ·
                        ${booking.whatsapp}
                        ·
                        ${booking.barbeiro}
                    </small>

                    <button
                        type="button"
                        onclick="cancelBooking('${booking.id}')"
                    >
                        Cancelar
                    </button>

                </div>
            `;

        }).join("");

}


// ======================================================
// CANCELAR AGENDAMENTO
// ======================================================

window.cancelBooking =
    async function (id) {

        const confirmar =
            confirm(
                "Cancelar este agendamento?"
            );


        if (!confirmar) {
            return;
        }


        const { error } =
            await db
                .from("agendamentos")
                .delete()
                .eq("id", id);


        if (error) {

            console.error(
                error
            );

            alert(
                "Não foi possível cancelar o agendamento."
            );

            return;

        }


        alert(
            "Agendamento cancelado."
        );


        await carregarAgenda();

        await renderTimes();

    };


// ======================================================
// LIMPAR AGENDAMENTOS
// ======================================================

async function limparAgendamentos() {

    const confirmar =
        confirm(
            "Tem certeza que deseja apagar todos os agendamentos?"
        );


    if (!confirmar) {
        return;
    }


    const { error } =
        await db
            .from("agendamentos")
            .delete()
            .neq(
                "id",
                "00000000-0000-0000-0000-000000000000"
            );


    if (error) {

        console.error(
            error
        );

        alert(
            "Não foi possível limpar os agendamentos."
        );

        return;

    }


    alert(
        "Todos os agendamentos foram apagados."
    );


    await carregarAgenda();

    await renderTimes();

}
