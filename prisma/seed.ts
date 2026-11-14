import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.orderEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customDesign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.artisan.deleteMany();

  const naserian = await prisma.artisan.create({
    data: {
      name: "Naserian Ole Sankale",
      craft: "Maasai Beadwork",
      county: "Narok County",
      cooperative: "Siana Ushanga Cooperative",
      bio: "Naserian leads 32 women based at the Sekenani Gate studio, producing ceremonial and contemporary Maasai beadwork for visitors passing through to the Mara and for the Ushanga online catalogue.",
      years: 21,
      members: 32,
      photo: "/images/artisan-bead-woman.jpg",
      cover: "/images/hero-community.jpg",
      phone: "0712 345 601",
    },
  });

  const grace = await prisma.artisan.create({
    data: {
      name: "Grace Nemayian",
      craft: "Maasai Beadwork & Leatherwork",
      county: "Narok County",
      cooperative: "Siana Ushanga Cooperative",
      bio: "Grace specialises in bead-on-leather pieces — belts, bag straps and bracelets — combining tanned hide with traditional Maasai colour sequences.",
      years: 14,
      members: 32,
      photo: "/images/artisan-portrait-woman.jpg",
      cover: "/images/craft-market-wide.jpg",
      phone: "0712 345 602",
    },
  });

  const musyoka = await prisma.artisan.create({
    data: {
      name: "Musyoka Mwangangi",
      craft: "Wood & Soapstone Carving",
      county: "Kisii / Machakos County",
      cooperative: "Akamba Carvers Guild",
      bio: "Musyoka's guild carves wood and Tabaka soapstone alongside the Sekenani beadwork studio, giving the Centre a fuller craft range for visitors and the global catalogue.",
      years: 27,
      members: 18,
      photo: "/images/artisan-woodcarver.jpg",
      cover: "/images/stall-colorful.jpg",
      phone: "0712 345 603",
    },
  });

  const products = [
    {
      name: "Eunoto Beaded Collar Necklace",
      slug: "eunoto-beaded-collar",
      category: "Necklaces",
      priceCents: 820000,
      compareAtCents: 1050000,
      image: "/images/product-necklace.jpg",
      gallery: ["/images/product-necklace.jpg"],
      description:
        "A statement ceremonial collar hand-beaded on sisal-reinforced leather, featuring traditional Maasai geometric patterning in cobalt, saffron and vermillion glass beads.",
      story:
        "Inspired by the Eunoto coming-of-age ceremony, each collar takes approximately 30 hours to complete at the Sekenani studio.",
      materials: ["Czech glass beads", "Tanned leather backing", "Brass clasp"],
      dimensions: "32cm diameter, 14cm depth",
      madeToOrderDays: 9,
      artisanId: naserian.id,
    },
    {
      name: "Layered Strand Beaded Necklace",
      slug: "layered-strand-necklace",
      category: "Necklaces",
      priceCents: 450000,
      image: "/images/product-necklace-layered.jpg",
      gallery: ["/images/product-necklace-layered.jpg"],
      description:
        "Multiple strands of hand-rolled glass beads in a warm multicolour sequence, finished with a sliding brass clasp for adjustable length.",
      story:
        "A lighter, layered take on the ceremonial collar — designed for everyday wear while still carrying the full colour vocabulary of Maasai beadwork.",
      materials: ["Glass beads", "Brass findings", "Cotton thread core"],
      dimensions: "45cm, adjustable",
      madeToOrderDays: 6,
      artisanId: naserian.id,
    },
    {
      name: "Amara Beaded Bracelet Set of 5",
      slug: "amara-bracelet-set",
      category: "Bracelets",
      priceCents: 260000,
      image: "/images/product-bracelets.jpg",
      gallery: ["/images/product-bracelets.jpg"],
      description:
        "A stacking set of five slim beaded bracelets in earth-tone glass beads on waxed cotton cord, designed for everyday wear.",
      story:
        "Developed by the Sekenani Collective specifically for visitors who want a lighter, everyday piece straight from the gate studio.",
      materials: ["Glass beads", "Waxed cotton cord"],
      dimensions: "One size, adjustable 14-20cm",
      madeToOrderDays: 4,
      artisanId: naserian.id,
    },
    {
      name: "Sekenani Wide Beaded Cuff",
      slug: "sekenani-wide-cuff",
      category: "Bracelets",
      priceCents: 320000,
      image: "/images/product-cuffs.jpg",
      gallery: ["/images/product-cuffs.jpg"],
      description:
        "A rigid wide-band cuff bracelet, densely beaded in a layered colour border with a solid sisal-reinforced core.",
      story:
        "A structured statement piece worn at ceremonies and now adapted for the global marketplace in durable everyday colourways.",
      materials: ["Glass beads", "Sisal core", "Leather lining"],
      dimensions: "6cm width, one size",
      madeToOrderDays: 5,
      artisanId: grace.id,
    },
    {
      name: "Sekenani Beaded Leather Belt",
      slug: "sekenani-beaded-belt",
      category: "Belts",
      priceCents: 540000,
      image: "/images/product-belt-real.jpg",
      gallery: ["/images/product-belt-real.jpg"],
      description:
        "Full-grain leather belt hand-wrapped in a continuous beaded chevron pattern, finished with a brass buckle.",
      story:
        "Grace's signature piece, combining leatherwork and beadwork techniques passed down through three generations of her family.",
      materials: ["Tanned leather", "Glass beads", "Brass buckle"],
      dimensions: "Available in S / M / L waist sizes",
      madeToOrderDays: 7,
      artisanId: grace.id,
    },
    {
      name: "Mara Sunset Beaded Earrings",
      slug: "mara-sunset-earrings",
      category: "Earrings",
      priceCents: 180000,
      image: "/images/product-earrings.jpg",
      gallery: ["/images/product-earrings.jpg"],
      description:
        "Drop earrings in a warm sunset colourway — amber, rust and bone-white beads threaded on fine wire.",
      story:
        "A fast-moving favourite among walk-in visitors at the Sekenani studio, light enough for daily wear.",
      materials: ["Glass beads", "Nickel-free wire"],
      dimensions: "6cm drop length",
      madeToOrderDays: 3,
      artisanId: naserian.id,
    },
    {
      name: "Heritage Kiondo Sisal Bag",
      slug: "heritage-kiondo-bag",
      category: "Baskets & Bags",
      storefront: "SANAA" as const,
      priceCents: 540000,
      compareAtCents: 620000,
      image: "/images/product-kiondo.jpg",
      gallery: ["/images/product-kiondo.jpg"],
      description:
        "A hand-stripped and hand-dyed sisal kiondo with leather trim and shoulder strap, woven using the traditional coiled technique.",
      story:
        "Each kiondo takes a weaving circle around 18 hours to complete, from stripping raw sisal leaves to the final leather binding.",
      materials: ["Hand-stripped sisal fibre", "Vegetable-tanned leather"],
      dimensions: "34cm wide x 28cm tall",
      madeToOrderDays: 10,
      artisanId: grace.id,
    },
    {
      name: "Market Sisal Basket",
      slug: "market-sisal-basket",
      category: "Baskets & Bags",
      storefront: "SANAA" as const,
      priceCents: 390000,
      image: "/images/product-basket-single.jpg",
      gallery: ["/images/product-basket-single.jpg"],
      description:
        "A sturdy open-weave sisal market basket with reinforced base and twin handles, finished with a contrast dyed rim.",
      story:
        "Woven in the same cooperative circles that produce the kiondo bags, built for everyday durability.",
      materials: ["Sisal fibre", "Sisal cord handles"],
      dimensions: "30cm diameter x 22cm tall",
      madeToOrderDays: 6,
      artisanId: grace.id,
    },
    {
      name: "Akamba Carved Wall Mask Set",
      slug: "akamba-wall-mask-set",
      category: "Wood Carvings",
      storefront: "SANAA" as const,
      priceCents: 980000,
      image: "/images/product-masks-04.jpg",
      gallery: ["/images/product-masks-04.jpg"],
      description:
        "A curated set of hand-carved ebony and mahogany wall masks finished with brass inlay and natural beeswax polish.",
      story:
        "Carved using techniques the Akamba Guild has practised since the 1960s, each mask takes a dedicated carver several days to finish.",
      materials: ["Sustainably sourced hardwood", "Brass inlay", "Beeswax finish"],
      dimensions: "18-30cm, varies by piece",
      madeToOrderDays: 14,
      artisanId: musyoka.id,
    },
    {
      name: "Tabaka Soapstone Curio Collection",
      slug: "tabaka-soapstone-curios",
      category: "Soapstone",
      storefront: "SANAA" as const,
      priceCents: 670000,
      image: "/images/product-curios.jpg",
      gallery: ["/images/product-curios.jpg"],
      description:
        "A display collection of hand-carved soapstone figures and painted dishes, quarried and carved in Tabaka Hills.",
      story:
        "Soapstone from Tabaka is found nowhere else in East Africa — this collection supports apprentice carvers training under the guild.",
      materials: ["Tabaka soapstone", "Natural mineral pigment"],
      dimensions: "Varies by piece, 8-20cm",
      madeToOrderDays: 12,
      artisanId: musyoka.id,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("Seeded Ushanga catalog:", products.length, "products,", 3, "artisans.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
