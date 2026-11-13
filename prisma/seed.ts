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
      cooperative: "Sekenani Women's Beading Collective",
      bio: "Naserian leads 32 women based at the Sekenani Gate studio, producing ceremonial and contemporary Maasai beadwork for visitors passing through to the Mara and for the Ushanga online catalogue.",
      years: 21,
      members: 32,
      photo: "/images/artisan-bead-woman.jpg",
      cover: "/images/hero-community.jpg",
    },
  });

  const grace = await prisma.artisan.create({
    data: {
      name: "Grace Nemayian",
      craft: "Maasai Beadwork & Leatherwork",
      county: "Narok County",
      cooperative: "Sekenani Women's Beading Collective",
      bio: "Grace specialises in bead-on-leather pieces — belts, bag straps and bracelets — combining tanned hide with traditional Maasai colour sequences.",
      years: 14,
      members: 32,
      photo: "/images/artisan-portrait-woman.jpg",
      cover: "/images/craft-market-wide.jpg",
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
      gallery: ["/images/product-necklace.jpg", "/images/product-bracelets.jpg"],
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
      name: "Sekenani Beaded Leather Belt",
      slug: "sekenani-beaded-belt",
      category: "Belts",
      priceCents: 540000,
      image: "/images/product-belt.jpg",
      gallery: ["/images/product-belt.jpg"],
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
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("Seeded Ushanga catalog:", products.length, "products,", 2, "artisans.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
