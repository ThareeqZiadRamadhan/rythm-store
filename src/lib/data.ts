export type Product = {
  id: number;
  slug: string;
  name: string;
  category: "Running" | "Lifestyle" | "Training";
  gender: "Pria" | "Wanita" | "Unisex";
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  color: string;
  colorName: string;
  tag?: string;
  description: string;
  features: string[];
};

const images = {
  green:
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1400&q=90",
  pastel:
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1400&q=90",
  white:
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1400&q=90",
  brown:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=90",
  red: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=90",
  grey: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=90",
  brown2: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=1400&q=90",
  brown3: "https://images.unsplash.com/photo-1549298916-acc8271f8b8d?auto=format&fit=crop&w=1400&q=90",
  brown4: "https://images.unsplash.com/photo-1549298916-c6c5f85fa167?auto=format&fit=crop&w=1400&q=90",
  white2: "https://images.unsplash.com/photo-1597949992171-689c5673b936?auto=format&fit=crop&w=1400&q=90",
};
const own = (photo: string, slug: string) => [
  photo,
  `/shoes/${slug}-studio.jpg`,
  `/shoes/${slug}-detail.jpg`,
];

export const products: Product[] = [
  {
    id: 1,
    slug: "nova-runner-02",
    name: "Nova Trainer 02",
    category: "Training",
    gender: "Unisex",
    price: 1499000,
    oldPrice: 1799000,
    image: images.green,
    gallery: [images.green, "/shoes/nova-runner-02-front.png", "/shoes/nova-runner-02-rear.png"],
    color: "#dfff47",
    colorName: "Volt Green / Black",
    tag: "Best seller",
    description:
      "A versatile training shoe for HIIT, gym classes and plyometrics. A light, breathable mesh upper sits on a wide base that keeps you stable on every landing.",
    features: ["Breathable mesh upper", "Responsive cushioning", "Wide, stable base"],
  },
  {
    id: 2,
    slug: "sunday-pastel",
    name: "Sunday Pastel",
    category: "Lifestyle",
    gender: "Wanita",
    price: 1299000,
    image: images.pastel,
    gallery: [images.pastel, "/shoes/sunday-pastel-front.png", "/shoes/sunday-pastel-rear.png"],
    color: "#e8d9ff",
    colorName: "Lilac / Sky / Rose",
    tag: "New",
    description:
      "A layered retro silhouette in soft pastels: lilac, sky blue, yellow and rose. Comfortable all day and easy to make the center of any outfit.",
    features: ["Layered pastel panels", "Chunky platform midsole", "Serrated rubber cupsole"],
  },
  {
    id: 3,
    slug: "court-classic-90",
    name: "Court Classic 90",
    category: "Lifestyle",
    gender: "Unisex",
    price: 1099000,
    image: images.white,
    gallery: [images.white, images.white2, "/shoes/court-classic-90-front.png"],
    color: "#e7edf1",
    colorName: "Cloud White",
    description:
      "A minimalist court shoe that works with every outfit rotation. Clean, classic and relevant every season.",
    features: ["Premium synthetic leather upper", "Padded collar", "Durable rubber outsole"],
  },
  {
    id: 4,
    slug: "terra-street",
    name: "Terra Street",
    category: "Lifestyle",
    gender: "Pria",
    price: 1599000,
    image: images.brown,
    gallery: [images.brown, images.brown2, images.brown3, images.brown4],
    color: "#b9803d",
    colorName: "Wheat Brown / Sail",
    tag: "Limited",
    description:
      "A workwear-inspired low-top with a heavy wheat canvas upper and dark brown leather accents. Built for daily wear on city streets.",
    features: ["Heavy-duty canvas upper", "Dark brown leather accents", "Heel pull tab"],
  },
  {
    id: 5,
    slug: "velocity-red",
    name: "Velocity Red",
    category: "Running",
    gender: "Unisex",
    price: 1399000,
    image: images.red,
    gallery: [images.red, "/shoes/velocity-red-front.png", "/shoes/velocity-red-rear.png"],
    color: "#d12b1f",
    colorName: "Crimson / Orange",
    tag: "New",
    description:
      "A flexible running shoe for a more natural stride. A light knit upper hugs your foot while the flexible sole moves with you on daily runs.",
    features: ["Lightweight knit upper", "Flex-groove outsole", "Sock-like fit"],
  },
  {
    id: 6,
    slug: "aero-bone",
    name: "Aero Bone",
    category: "Training",
    gender: "Unisex",
    price: 1699000,
    image: images.grey,
    gallery: [images.grey],
    color: "#d8d4c8",
    colorName: "Bone / Black",
    description:
      "Stability for strength training without giving up flexibility. One pair for your whole gym session.",
    features: ["Stable heel counter", "Flex grooves", "Reinforced toe cap"],
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);