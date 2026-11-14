import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CREDITS = [
  { title: "Maasai Community Gathering, Ngorongoro Conservation Area", license: "CC BY-SA 4.0" },
  { title: "Self made craft work sold at Nairobi city market", license: "CC BY 4.0" },
  { title: "MamaLai (Maasai Market stall)", license: "CC BY-SA 4.0" },
  { title: "The Maasai Market Vendors", license: "CC BY-SA 4.0" },
  { title: "Wood carver at Akamba Handicraft, Mombasa", license: "CC BY-SA 4.0" },
  { title: "Person hand-carving soapstone trinket box, Tabaka Hills", license: "CC BY-SA 4.0" },
  { title: "Women weaving Sisal Baskets", license: "CC BY-SA 4.0" },
  { title: "Masai woman making beaded bracelet", license: "CC BY-SA 4.0" },
  { title: "Faces of Kenya – Back of Woman", license: "CC BY-SA 4.0" },
  { title: "Traditional Maasai Jewelry, Triangle Curio Market, Nairobi", license: "CC BY-SA 4.0" },
  { title: "Kiondo (sisal bag)", license: "CC BY-SA 4.0" },
  { title: "African masks in Nairobi", license: "CC BY-SA 4.0" },
  { title: "Sisal basket", license: "CC BY-SA 4.0" },
  { title: "Soapstone Carvings Shop, Kisii", license: "CC BY-SA 3.0" },
  { title: "Maasai beadwork", license: "CC BY-SA 4.0" },
  { title: "Old Maasai woman making a beaded leather belt on a bowed stick frame", license: "CC BY-SA 4.0" },
  { title: "Enkarewa (a beaded necklace worn by Maasai women)", license: "CC0" },
  { title: "Beads and Pride", license: "CC BY-SA 4.0" },
  { title: "Soapstone artistic carvings", license: "CC BY-SA 4.0" },
  { title: "An Masia Earring", license: "CC BY-SA 4.0" },
  { title: "In the making of beads (20)", license: "CC BY 4.0" },
];

export default function CreditsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-3xl font-semibold text-charcoal">Image credits</h1>
          <p className="mt-2 text-sm text-ink-muted">
            All photography used in this prototype is sourced from Wikimedia
            Commons under Creative Commons licences.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm">
            {CREDITS.map((c) => (
              <li key={c.title} className="flex items-center justify-between border-b border-sand-deep pb-3">
                <span className="text-charcoal-soft">{c.title}</span>
                <span className="text-xs font-medium text-ink-muted">{c.license}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
