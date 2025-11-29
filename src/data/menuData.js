import React from 'react';
import { Coffee, Leaf, Wheat, Croissant, Sandwich, CupSoda } from 'lucide-react';


// --- CATEGORÍAS (Solo datos, sin iconos aquí) ---
export const CATEGORIES = [
    { id: 'coffee', label: 'Coffee Bar', color: '#6f4e37', darkColor: '#3E2723' },
    { id: 'matcha', label: 'Matcha Bar', color: '#8ab060', darkColor: '#2E4028' },
    { id: 'bread', label: 'Bakery', color: '#e6c288', darkColor: '#5D4037' },
    { id: 'toast', label: 'Toasts', color: '#d4a373', darkColor: '#8D6E63' },
    { id: 'sandwich', label: 'Sandwiches', color: '#bc6c25', darkColor: '#4E342E' },
    { id: 'tea', label: 'Tea & Smoothies', color: '#A569BD', darkColor: '#4A235A' },
];

// --- DATOS DEL PRODUCTO ---
export const PRODUCTS_DATA = {
    coffee: [
        {
            name: "Salted Caramel Macchiato",
            price: "$75",
            description: "Espresso, leche a elegir, jarabe de caramelo salado y cold foam de vainilla.",
            features: ["Salty Sweet", "Cold Foam", "Bestseller"],
            isDefault: true
        },
        {
            name: "Pistachio Latte",
            price: "$75",
            description: "Espresso, leche a elegir, jarabe de pistache artesanal y cold foam de vainilla.",
            features: ["Nutty", "Gourmet", "Sweet"]
        },
        {
            name: "Biscoff Latte",
            price: "$85",
            description: "Espresso, leche a elegir y la deliciosa cold foam de galleta Lotus Biscoff.",
            features: ["Cookie Flavor", "Trend", "Creamy"]
        },
        {
            name: "Banana Latte",
            price: "$90",
            description: "Espresso, leche, plátano natural, vainilla y cold foam de plátano.",
            features: ["Fruity", "Exotic", "Signature"]
        },
        {
            name: "Americano",
            price: "$55",
            description: "Espresso diluido en agua caliente, conservando el perfil del grano.",
            features: ["Classic", "Zero Sugar", "Strong"]
        },
        {
            name: "Cappuccino",
            price: "$70",
            description: "Espresso con leche vaporizada y capa de espuma densa.",
            features: ["Classic", "Foamy", "Hot"]
        },
        {
            name: "Flat White",
            price: "$60",
            description: "Doble espresso con una fina capa de leche micro-espumada.",
            features: ["Intense", "Silky", "Less Milk"]
        },
        {
            name: "Dirty Chai",
            price: "$75",
            description: "Nuestro Chai Latte especiado con un shot de espresso.",
            features: ["Spiced", "Energy", "Aromatic"]
        }
    ],
    matcha: [
        {
            name: "Strawberry Cheesecake",
            price: "$105",
            description: "Matcha ceremonial Shizouka, leche, puré de fresa y cold foam de queso.",
            features: ["Dessert Drink", "Sweet", "Heavy"],
            isDefault: true
        },
        {
            name: "Matcha Latte",
            price: "$90",
            description: "Matcha ceremonial grado Shizouka, leche a elegir y miel de agave orgánica.",
            features: ["Organic", "Antioxidant", "Classic"]
        },
        {
            name: "Lavender Matcha",
            price: "$95",
            description: "Matcha ceremonial Shizouka con un toque floral de jarabe de lavanda.",
            features: ["Floral", "Relaxing", "Aromatic"]
        },
        {
            name: "Banana Matcha",
            price: "$105",
            description: "Matcha ceremonial, puré de banana natural y cold foam de plátano.",
            features: ["Fruity", "Creamy", "Potassium"]
        },
        {
            name: "Yuzu Lemonade",
            price: "$105",
            description: "Matcha ceremonial, agua natural, puré de Yuzu japonés y rodajas de limón.",
            features: ["Citrus", "Refreshing", "Iced"]
        }
    ],
    tea: [
        {
            name: "Bananuts Shake",
            price: "$90",
            description: "Leche, yogurt griego, plátano, crema de cacahuate s/a y cacao nibs (20oz).",
            features: ["Protein", "Thick", "Meal Replacement"],
            isDefault: true
        },
        {
            name: "Espresso Gain",
            price: "$95",
            description: "Leche, espresso, avena, cacao, canela y miel maple.",
            features: ["Energy", "Pre-Workout", "Oats"]
        },
        {
            name: "Tisana Guasave",
            price: "$65",
            description: "Mezcla refrescante de Litchi, pétalos de rosa y menta.",
            features: ["No Caffeine", "Floral", "Light"]
        },
        {
            name: "Chai Latte",
            price: "$70",
            description: "Té negro con mezcla de especias orientales y leche.",
            features: ["Spiced", "Warm", "Classic"]
        },
        {
            name: "Cacao Orgánico",
            price: "$75",
            description: "Cacao orgánico, leche a elección y endulzante de agave.",
            features: ["Chocolate", "Healthy", "Hot"]
        }
    ],
    bread: [
        {
            name: "Croissant Almendras",
            price: "$48",
            description: "Croissant relleno y cubierto con crema de almendras tostadas.",
            features: ["Sweet", "Crunchy", "French"],
            isDefault: true
        },
        {
            name: "Pain au Chocolat",
            price: "$48",
            description: "Masa hojaldrada clásica con barras de chocolate semi-amargo.",
            features: ["Chocolate", "Classic", "Buttery"]
        },
        {
            name: "Rol de Canela",
            price: "$65",
            description: "Rollo suave especiado con canela y glaseado.",
            features: ["Spiced", "Soft", "Comfort"]
        },
        {
            name: "Baklava Frutos Rojos",
            price: "$65",
            description: "Pasta filo con miel, nueces y frutos rojos.",
            features: ["Sticky", "Nuts", "Gourmet"]
        },
        {
            name: "Doughnut Nutella",
            price: "$65",
            description: "Dona de especialidad rellena de Nutella.",
            features: ["Indulgent", "Chocolate", "Soft"]
        },
        {
            name: "Cookie Red Velvet",
            price: "$50",
            description: "Galleta suave estilo NYC sabor Red Velvet.",
            features: ["Sweet", "Soft Baked", "Cocoa"]
        }
    ],
    toast: [
        {
            name: "Serrano Brie Toast",
            price: "$210",
            description: "Masa madre, queso Brie, jamón serrano, higo, moras y miel.",
            features: ["Gourmet", "Salty Sweet", "Premium"],
            isDefault: true
        },
        {
            name: "Avocado Toast",
            price: "$135",
            description: "Masa madre, aguacate, jitomate deshidratado, queso feta y reducción balsámica.",
            features: ["Vegetarian", "Fresh", "Healthy"]
        },
        {
            name: "Burrata Saladet",
            price: "$170",
            description: "Masa madre, burrata fresca, jitomates rostizados, arúgula y pesto.",
            features: ["Italian", "Creamy", "Fresh"]
        },
        {
            name: "Banana Toast",
            price: "$130",
            description: "Masa madre, crema de cacahuate, plátano, cacao nibs y miel.",
            features: ["Energy", "Protein", "Sweet"]
        }
    ],
    sandwich: [
        {
            name: "Bacon Cheddar Spicy",
            price: "$190",
            description: "Masa madre, tocino crujiente, queso cheddar y sriracha casera.",
            features: ["Spicy", "Savory", "Hot"],
            isDefault: true
        },
        {
            name: "Carnes Frías",
            price: "$220",
            description: "Masa madre, mezcla de carnes frías selectas, queso manchego y chimichurri.",
            features: ["Meat Lover", "Herbal", "Filling"]
        },
        {
            name: "Grilled Cheese",
            price: "$160",
            description: "Masa madre, mezcla de 4 quesos fundidos, mantequilla y especias.",
            features: ["Cheesy", "Comfort Food", "Vegetarian"]
        }
    ]
};