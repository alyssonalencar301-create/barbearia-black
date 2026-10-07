const CONFIG = {

    // ==========================================
    // IDENTIDADE DA BARBEARIA
    // ==========================================

   nome: "Barbearia Bruno",

whatsapp: "(87) 98888-7777",

endereco: "Av. Central, 250 - Centro",

cores: {
    fundo: "#101820",
    card: "#1c2630",
    card2: "#263746",
    texto: "#ffffff",
    textoSecundario: "#b8c2cc",
    dourado: "#3fa9f5",
    douradoClaro: "#75c7ff",
    linha: "#334455"
}
    
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
