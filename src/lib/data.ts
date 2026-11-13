import { img } from "./images";

export type Artisan = {
  id: string;
  name: string;
  craft: string;
  county: string;
  cooperative: string;
  bio: string;
  years: number;
  members: number;
  photo: string;
  cover: string;
};

export type Product = {
  id: string;
  name: string;
  artisanId: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  gallery: string[];
  description: string;
  story: string;
  materials: string[];
  dimensions: string;
  madeToOrderDays: number;
};

export const artisans: Artisan[] = [
  {
    id: "wanjiru-beadworks",
    name: "Nasirian Wanjiru",
    craft: "Maasai Beadwork",
    county: "Kajiado County",
    cooperative: "Enkang Beadwork Collective",
    bio: "Nasirian learned beadwork from her mother at age seven. Today she leads a collective of 24 women producing ceremonial and contemporary beaded pieces, blending age-old Maasai motifs with modern silhouettes for global collectors.",
    years: 19,
    members: 24,
    photo: img.artisanBeadwoman,
    cover: img.heroCommunity,
  },
  {
    id: "akamba-cooperative",
    name: "Musyoka Mwangangi",
    craft: "Akamba Wood Carving",
    county: "Mombasa / Machakos",
    cooperative: "Akamba Handicraft Cooperative",
    bio: "A third-generation woodcarver, Musyoka trained under the original Akamba Handicraft Co-operative founded in the 1960s. His workshop hand-carves ebony and mahogany pieces using techniques passed down over seventy years.",
    years: 27,
    members: 140,
    photo: img.artisanWoodcarver,
    cover: img.productMasks04,
  },
  {
    id: "kisii-soapstone",
    name: "Zippora Moraa",
    craft: "Kisii Soapstone Carving",
    county: "Tabaka, Kisii County",
    cooperative: "Tabaka Soapstone Guild",
    bio: "Zippora carves soapstone quarried directly from the hills of Tabaka — the only deposit of its kind in East Africa. Her guild trains young apprentices to keep the centuries-old craft alive.",
    years: 15,
    members: 38,
    photo: img.artisanSoapstone,
    cover: img.productSoapstoneShop,
  },
  {
    id: "ushanga-weavers",
    name: "Grace Naserian",
    craft: "Sisal Basket Weaving",
    county: "Machakos County",
    cooperative: "Ushanga Kenya Partner Group",
    bio: "Grace coordinates a network of rural women who hand-strip and dye sisal fibre before weaving it into kiondo bags and baskets — a practice recognised under the government-backed Ushanga Kenya initiative.",
    years: 22,
    members: 56,
    photo: img.artisanBasketWeavers,
    cover: img.productKiondo,
  },
  {
    id: "jua-kali-textiles",
    name: "Hassan Omondi",
    craft: "Shuka & Textile Craft",
    county: "Nairobi (Jua Kali sector)",
    cooperative: "Jua Kali Artisans Alliance",
    bio: "Hassan's workshop sits within Nairobi's Jua Kali sector, where informal artisans produce textiles, leatherwork and metal craft. He now exports hand-loomed shuka cloth to boutiques in Europe.",
    years: 12,
    members: 95,
    photo: img.stallColorful,
    cover: img.craftMarketWide,
  },
];

export const products: Product[] = [
  {
    id: "maasai-beaded-collar",
    name: "Eunoto Beaded Collar Necklace",
    artisanId: "wanjiru-beadworks",
    category: "Jewellery",
    price: 8200,
    compareAt: 10500,
    rating: 4.9,
    reviews: 132,
    stock: 6,
    image: img.productNecklace,
    gallery: [img.productNecklace, img.artisanBeadwoman, img.heroCommunity],
    description:
      "A statement ceremonial collar hand-beaded on sisal-reinforced leather, featuring traditional Maasai geometric patterning in cobalt, saffron and vermillion glass beads.",
    story:
      "Inspired by the Eunoto coming-of-age ceremony, each collar takes approximately 30 hours to complete. The pattern sequence is unique to the Enkang Collective and has been worn at cultural festivals across East Africa.",
    materials: ["Czech glass beads", "Tanned leather backing", "Brass clasp"],
    dimensions: "32cm diameter, 14cm depth",
    madeToOrderDays: 9,
  },
  {
    id: "akamba-ebony-elephant",
    name: "Hand-Carved Ebony Elephant Pair",
    artisanId: "akamba-cooperative",
    category: "Wood Carving",
    price: 12400,
    rating: 4.8,
    reviews: 86,
    stock: 11,
    image: img.productMasks04,
    gallery: [img.productMasks04, img.productMasks02, img.artisanWoodcarver],
    description:
      "A matched pair of ebony elephants, carved and hand-polished using traditional Akamba tools — each grain finished to a mirror-smooth lustre with natural beeswax.",
    story:
      "The Akamba Handicraft Cooperative has carved wildlife figures since the 1960s. This pair follows the original Mombasa workshop's signature trunk-raised silhouette, said to symbolise good fortune.",
    materials: ["Sustainably sourced ebony", "Natural beeswax finish"],
    dimensions: "18cm x 9cm (large), 11cm x 6cm (small)",
    madeToOrderDays: 14,
  },
  {
    id: "kisii-soapstone-bowl-set",
    name: "Tabaka Soapstone Bowl Trio",
    artisanId: "kisii-soapstone",
    category: "Soapstone",
    price: 6700,
    rating: 4.7,
    reviews: 54,
    stock: 18,
    image: img.productSoapstoneShop,
    gallery: [img.productSoapstoneShop, img.artisanSoapstone],
    description:
      "Three nesting bowls carved from soapstone quarried in Tabaka Hills, hand-painted with natural pigments in a spiral motif unique to Kisii carvers.",
    story:
      "Soapstone from Tabaka is found nowhere else in East Africa. Zippora's guild apprentices young carvers to keep this geology-bound craft alive for the next generation.",
    materials: ["Tabaka soapstone", "Natural mineral pigment"],
    dimensions: "Largest bowl 16cm, smallest 9cm",
    madeToOrderDays: 7,
  },
  {
    id: "kiondo-sisal-bag",
    name: "Heritage Kiondo Sisal Bag",
    artisanId: "ushanga-weavers",
    category: "Baskets & Bags",
    price: 5400,
    compareAt: 6200,
    rating: 4.9,
    reviews: 211,
    stock: 24,
    image: img.productKiondo,
    gallery: [img.productKiondo, img.artisanBasketWeavers, img.productBasketSingle],
    description:
      "A hand-stripped and hand-dyed sisal kiondo with leather trim and shoulder strap — woven using the traditional coiled technique recognised by the Ushanga Kenya initiative.",
    story:
      "Each kiondo takes a rural weaving circle around 18 hours to complete, from stripping raw sisal leaves to the final leather binding. Patterns are passed down through families in Machakos County.",
    materials: ["Hand-stripped sisal fibre", "Vegetable-tanned leather", "Natural dye"],
    dimensions: "34cm wide x 28cm tall",
    madeToOrderDays: 10,
  },
  {
    id: "shuka-heritage-throw",
    name: "Hand-Loomed Shuka Heritage Throw",
    artisanId: "jua-kali-textiles",
    category: "Textiles",
    price: 4100,
    rating: 4.6,
    reviews: 73,
    stock: 30,
    image: img.productShuka,
    gallery: [img.productShuka, img.stallColorful],
    description:
      "A classic red-and-blue checked shuka cloth, hand-loomed on traditional frame looms in Nairobi's Jua Kali sector — equally at home as a throw, wrap or wall hanging.",
    story:
      "Shuka cloth is central to Maasai dress, but the Jua Kali Artisans Alliance has modernised its production to meet both local demand and new export markets in Europe.",
    materials: ["Cotton-acrylic blend yarn", "Natural fast dyes"],
    dimensions: "150cm x 180cm",
    madeToOrderDays: 5,
  },
  {
    id: "soapstone-chess-set",
    name: "Kisii Soapstone Chess Set",
    artisanId: "kisii-soapstone",
    category: "Soapstone",
    price: 15800,
    rating: 4.8,
    reviews: 29,
    stock: 7,
    image: img.artisanSoapstone,
    gallery: [img.artisanSoapstone, img.productSoapstoneShop],
    description:
      "A full 32-piece chess set, each figure hand-carved in contrasting natural and black-dyed soapstone, presented on a polished hardwood board.",
    story:
      "Commissioned pieces like this chess set support three apprentice carvers for every completed order under the Tabaka Soapstone Guild's training programme.",
    materials: ["Tabaka soapstone", "Mahogany board"],
    dimensions: "Board 40cm x 40cm, king piece 7cm",
    madeToOrderDays: 21,
  },
  {
    id: "beaded-bracelet-set",
    name: "Amara Beaded Bracelet Set of 5",
    artisanId: "wanjiru-beadworks",
    category: "Jewellery",
    price: 2600,
    rating: 4.7,
    reviews: 164,
    stock: 42,
    image: img.artisanBeadwoman,
    gallery: [img.artisanBeadwoman, img.productNecklace],
    description:
      "A stacking set of five slim beaded bracelets in earth-tone glass beads on waxed cotton cord, designed for everyday wear.",
    story:
      "A contemporary line developed by the Enkang Collective specifically for export markets, translating ceremonial beadwork patterns into wearable daily pieces.",
    materials: ["Glass beads", "Waxed cotton cord"],
    dimensions: "One size, adjustable 14-20cm",
    madeToOrderDays: 4,
  },
  {
    id: "market-basket-single",
    name: "Nakuru Market Sisal Basket",
    artisanId: "ushanga-weavers",
    category: "Baskets & Bags",
    price: 3900,
    rating: 4.5,
    reviews: 47,
    stock: 20,
    image: img.productBasketSingle,
    gallery: [img.productBasketSingle, img.artisanBasketWeavers],
    description:
      "A sturdy open-weave sisal market basket with reinforced base and twin handles — practical, durable, and finished with a contrast dyed rim.",
    story:
      "Woven in the same cooperative circles that produce ceremonial kiondo bags, this everyday basket style supports steady year-round income for weavers.",
    materials: ["Sisal fibre", "Sisal cord handles"],
    dimensions: "30cm diameter x 22cm tall",
    madeToOrderDays: 6,
  },
];

export const categories = [
  { name: "Jewellery", image: img.productNecklace },
  { name: "Wood Carving", image: img.productMasks04 },
  { name: "Soapstone", image: img.productSoapstoneShop },
  { name: "Baskets & Bags", image: img.productKiondo },
  { name: "Textiles", image: img.productShuka },
];

export const impactStats = [
  { label: "Registered artisans", value: "2,480+" },
  { label: "Counties represented", value: "31" },
  { label: "Avg. income uplift", value: "+42%" },
  { label: "Orders fulfilled", value: "18,900+" },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getArtisan(id: string) {
  return artisans.find((a) => a.id === id);
}

export function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
