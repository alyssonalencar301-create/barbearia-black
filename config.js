const CONFIG = {

    // ==========================================
    // IDENTIDADE DA BARBEARIA
    // ==========================================

    nome: "Barber Black",

    whatsapp: "(87) 99999-0000",

    endereco: "Rua Principal, 100 - Centro",


    // ==========================================
    // BARBEIROS
    // ==========================================

    barbeiros: [
        "João",
        "Pedro",
        "Bruno"
    ],


    // ==========================================
    // SERVIÇOS
    // ==========================================

   servicos: [
    {
        id: "corte",
        nome: "Corte",
        descricao: "Corte tradicional ou moderno",
        preco: 25
    },

    {
        id: "barba",
        nome: "Barba",
        descricao: "Barba completa e acabamento",
        preco: 20
    },

    {
        id: "corte-barba",
        nome: "Corte + Barba",
        descricao: "Combo corte e barba",
        preco: 45
    },
       {
        id: "corte-barba-sobrancelha",
        nome: "Corte + Barba + Sobrancelha",
        descricao: "O combo completo",
        preco: 65
    }
],
        // ==========================================
    // HORÁRIO DE FUNCIONAMENTO
    // ==========================================

    horario: {
        abertura: 8,
        fechamento: 18,
        intervalo: 30
    }

};
