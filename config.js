const CONFIG = {

    // ==========================================
    // IDENTIDADE DA BARBEARIA
    // ==========================================

   nome: "Barber Black",

    logo: "logo.png",
    slogan: "Seu estilo, sua identidade",

whatsapp: "(87) 98888-7777",

endereco: "Av. Central, 250 - Centro",

cores: {
    fundo: "#0b0b0b",
    card: "#151515",
    card2: "#1d1d1d",
    texto: "#f6f6f6",
    textoSecundario: "#a5a5a5",
dourado: "#d8a84e",
    douradoClaro: "#f0c66a",
    linha: "#292929",
    servicoNome: "#ffffff"
},
    
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
    fechamento: 19,
    intervalo: 30,

    diasFuncionamento: [
       1, // Segunda
        2, // Terça
        3, // Quarta
        4, // Quinta
        5, // Sexta
        6  // Sábado
    ]
}

};
