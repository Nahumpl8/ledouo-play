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
            description: "Espresso, leche a elegir, jarabe de caramelo salado y cold foam de vainilla.",
            features: ["Salty Sweet", "Cold Foam", "Bestseller"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 70, mediano: 75, grande: 80 },
                cold: { mediano: 75, grande: 80 }
            },
            isDefault: true
        },
        {
            name: "Pistachio Latte",
            description: "Espresso, leche a elegir, jarabe de pistache artesanal y cold foam de vainilla.",
            features: ["Nutty", "Gourmet", "Sweet"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 70, mediano: 75, grande: 80 },
                cold: { mediano: 75, grande: 80 }
            }
        },
        {
            name: "Vainilla Latte",
            description: "Espresso, leche a elegir, jarabe de vainilla y cold foam de vainilla.",
            features: ["Classic", "Sweet", "Cold Foam"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 70, mediano: 75, grande: 80 },
                cold: { mediano: 75, grande: 80 }
            }
        },
        {
            name: "Biscoff Latte",
            description: "Espresso, leche a elegir y la deliciosa cold foam de galleta Lotus Biscoff.",
            features: ["Cookie Flavor", "Trend", "Creamy"],
            temperature: ["cold"],
            singleSize: false,
            prices: {
                cold: { mediano: 80, grande: 85 }
            }
        },
        {
            name: "Banana Latte",
            description: "Espresso, leche, plátano natural, vainilla y cold foam de plátano.",
            features: ["Fruity", "Exotic", "Signature"],
            temperature: ["cold"],
            singleSize: false,
            prices: {
                cold: { mediano: 85, grande: 90 }
            }
        },
        {
            name: "Americano",
            description: "Espresso diluido en agua caliente, conservando el perfil del grano.",
            features: ["Classic", "Zero Sugar", "Strong"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 50, mediano: 55, grande: 60 },
                cold: { mediano: 55, grande: 60 }
            }
        },
        {
            name: "Cappuccino",
            description: "Espresso con leche vaporizada y capa de espuma densa.",
            features: ["Classic", "Foamy", "Hot"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 60, mediano: 70, grande: 75 },
                cold: { mediano: 70, grande: 75 }
            }
        },
        {
            name: "Latte",
            description: "Espresso con leche vaporizada suave y cremosa.",
            features: ["Classic", "Smooth", "Creamy"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 60, mediano: 70, grande: 75 },
                cold: { mediano: 70, grande: 75 }
            }
        },
        {
            name: "Flat White",
            description: "Doble espresso con una fina capa de leche micro-espumada.",
            features: ["Intense", "Silky", "Less Milk"],
            temperature: ["hot", "cold"],
            singleSize: true,
            price: 60
        },
        {
            name: "Macchiato",
            description: "Espresso marcado con un toque de leche espumada.",
            features: ["Strong", "Elegant", "Small"],
            temperature: ["hot", "cold"],
            singleSize: true,
            price: 55
        },
        {
            name: "Espresso Doble",
            description: "Dos shots de espresso puro y concentrado.",
            features: ["Intense", "Pure", "Quick"],
            temperature: ["hot"],
            singleSize: true,
            price: 40
        },
        {
            name: "Cold Brew",
            description: "Café de extracción lenta en frío, suave y refrescante.",
            features: ["Smooth", "Low Acidity", "Refreshing"],
            temperature: ["cold"],
            singleSize: false,
            prices: {
                cold: { mediano: 65, grande: 70 }
            }
        },
        {
            name: "Mocha",
            description: "Espresso con chocolate y leche vaporizada.",
            features: ["Chocolate", "Sweet", "Rich"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 60, mediano: 70, grande: 75 },
                cold: { mediano: 70, grande: 75 }
            }
        },
        {
            name: "Dirty Chai",
            description: "Nuestro Chai Latte especiado con un shot de espresso.",
            features: ["Spiced", "Energy", "Aromatic"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 65, mediano: 75, grande: 80 },
                cold: { mediano: 75, grande: 80 }
            }
        }
    ],
    matcha: [
        {
            name: "Strawberry Cheesecake",
            description: "Matcha ceremonial Shizouka, leche, puré de fresa y cold foam de queso.",
            features: ["Dessert Drink", "Sweet", "Heavy"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { mediano: 95, grande: 105 },
                cold: { mediano: 95, grande: 105 }
            },
            isDefault: true
        },
        {
            name: "Matcha Latte",
            description: "Matcha ceremonial grado Shizouka, leche a elegir y miel de agave orgánica.",
            features: ["Organic", "Antioxidant", "Classic"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 80, mediano: 90, grande: 100 },
                cold: { mediano: 90, grande: 100 }
            }
        },
        {
            name: "Lavender Matcha",
            description: "Matcha ceremonial Shizouka con un toque floral de jarabe de lavanda.",
            features: ["Floral", "Relaxing", "Aromatic"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 85, mediano: 95, grande: 105 },
                cold: { mediano: 95, grande: 105 }
            }
        },
        {
            name: "Vainilla Matcha",
            description: "Matcha ceremonial Shizouka, leche a elegir, jarabe de vainilla y cold foam de vainilla.",
            features: ["Sweet", "Smooth", "Cold Foam"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 85, mediano: 95, grande: 105 },
                cold: { mediano: 95, grande: 105 }
            }
        },
        {
            name: "Banana Matcha",
            description: "Matcha ceremonial, puré de banana natural y cold foam de plátano.",
            features: ["Fruity", "Creamy", "Potassium"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { mediano: 95, grande: 105 },
                cold: { mediano: 95, grande: 105 }
            }
        },
        {
            name: "Yuzu Lemonade",
            description: "Matcha ceremonial, agua natural, puré de Yuzu japonés y rodajas de limón.",
            features: ["Citrus", "Refreshing", "Iced"],
            temperature: ["cold"],
            singleSize: false,
            prices: {
                cold: { mediano: 95, grande: 105 }
            }
        }
    ],
    tea: [
        {
            name: "Bananuts Shake",
            description: "Leche, yogurt griego, plátano, crema de cacahuate s/a y cacao nibs (20oz).",
            features: ["Protein", "Thick", "Meal Replacement"],
            temperature: null,
            singleSize: true,
            price: 90,
            isDefault: true
        },
        {
            name: "Espresso Gain",
            description: "Leche, espresso, avena, cacao, canela y miel maple.",
            features: ["Energy", "Pre-Workout", "Oats"],
            temperature: null,
            singleSize: true,
            price: 95
        },
        {
            name: "Tisana Guasave",
            description: "Mezcla refrescante de Litchi, pétalos de rosa y menta.",
            features: ["No Caffeine", "Floral", "Light"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { mediano: 65, grande: 70 },
                cold: { mediano: 65, grande: 70 }
            }
        },
        {
            name: "Chai Latte",
            description: "Té negro con mezcla de especias orientales y leche.",
            features: ["Spiced", "Warm", "Classic"],
            temperature: ["hot", "cold"],
            singleSize: false,
            prices: {
                hot: { chico: 65, mediano: 70, grande: 75 },
                cold: { mediano: 70, grande: 75 }
            }
        },
        {
            name: "Cacao Orgánico",
            description: "Cacao orgánico, leche a elección y endulzante de agave.",
            features: ["Chocolate", "Healthy", "Hot"],
            temperature: ["hot"],
            singleSize: false,
            prices: {
                hot: { chico: 70, mediano: 75, grande: 80 }
            }
        }
    ],
    bread: [
        {
            name: "Croissant Almendras",
            price: 48,
            description: "Croissant relleno y cubierto con crema de almendras tostadas.",
            features: ["Sweet", "Crunchy", "French"],
            temperature: null,
            singleSize: true,
            isDefault: true
        },
        {
            name: "Pain au Chocolat",
            price: 48,
            description: "Masa hojaldrada clásica con barras de chocolate semi-amargo.",
            features: ["Chocolate", "Classic", "Buttery"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Rol de Canela",
            price: 65,
            description: "Rollo suave especiado con canela y glaseado.",
            features: ["Spiced", "Soft", "Comfort"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Baklava Frutos Rojos",
            price: 65,
            description: "Pasta filo con miel, nueces y frutos rojos.",
            features: ["Sticky", "Nuts", "Gourmet"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Doughnut Nutella",
            price: 65,
            description: "Dona de especialidad rellena de Nutella.",
            features: ["Indulgent", "Chocolate", "Soft"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Cookie Red Velvet",
            price: 50,
            description: "Galleta suave estilo NYC sabor Red Velvet.",
            features: ["Sweet", "Soft Baked", "Cocoa"],
            temperature: null,
            singleSize: true
        }
    ],
    toast: [
        {
            name: "Serrano Brie Toast",
            price: 210,
            description: "Masa madre, queso Brie, jamón serrano, higo, moras y miel.",
            features: ["Gourmet", "Salty Sweet", "Premium"],
            temperature: null,
            singleSize: true,
            isDefault: true
        },
        {
            name: "Avocado Toast",
            price: 135,
            description: "Masa madre, aguacate, jitomate deshidratado, queso feta y reducción balsámica.",
            features: ["Vegetarian", "Fresh", "Healthy"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Burrata Saladet",
            price: 170,
            description: "Masa madre, burrata fresca, jitomates rostizados, arúgula y pesto.",
            features: ["Italian", "Creamy", "Fresh"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Banana Toast",
            price: 130,
            description: "Masa madre, crema de cacahuate, plátano, cacao nibs y miel.",
            features: ["Energy", "Protein", "Sweet"],
            temperature: null,
            singleSize: true
        }
    ],
    sandwich: [
        {
            name: "Bacon Cheddar Spicy",
            price: 190,
            description: "Masa madre, tocino crujiente, queso cheddar y sriracha casera.",
            features: ["Spicy", "Savory", "Hot"],
            temperature: null,
            singleSize: true,
            isDefault: true
        },
        {
            name: "Carnes Frías",
            price: 220,
            description: "Masa madre, mezcla de carnes frías selectas, queso manchego y chimichurri.",
            features: ["Meat Lover", "Herbal", "Filling"],
            temperature: null,
            singleSize: true
        },
        {
            name: "Grilled Cheese",
            price: 160,
            description: "Masa madre, mezcla de 4 quesos fundidos, mantequilla y especias.",
            features: ["Cheesy", "Comfort Food", "Vegetarian"],
            temperature: null,
            singleSize: true
        }
    ]
};