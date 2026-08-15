
export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
    category: string;
}

export const products: Product[] = [
    {
        id: 1,
        title: "Wireless Noise Cancelling Headphones",
        price: 12000,
        description: "Experience world-class noise cancellation and premium sound quality.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Electronics"
    },
    {
        id: 2,
        title: "Smart Watch Series 7",
        price: 15000,
        description: "Stay connected, active, and healthy with the latest smart watch technology.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D",
        category: "Electronics"
    },
    {
        id: 3,
        title: "Ergonomic Office Chair",
        price: 8500,
        description: "Comfortable and supportive chair designed for long hours of work.",
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2ZmaWNlJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D",
        category: "Furniture"
    },
    {
        id: 4,
        title: "Modern Coffee Table",
        price: 5500,
        description: "Sleek and stylish coffee table to enhance your living room decor.",
        image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29mZmVlJTIwdGFibGV8ZW58MHx8MHx8fDA%3D",
        category: "Furniture"
    },
    {
        id: 5,
        title: "Professional Camera Lens",
        price: 45000,
        description: "Capture stunning photos with this high-quality camera lens.",
        image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhJTIwbGVuc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Photography"
    },
    {
        id: 6,
        title: "Running Shoes",
        price: 3500,
        description: "High-performance running shoes for your daily jog.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D",
        category: "Fashion"
    }
];
