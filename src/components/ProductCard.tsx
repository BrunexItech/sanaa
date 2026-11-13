import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatKES, type Product } from "@/lib/data";

export function ProductCard({
  product,
  artisanName,
}: {
  product: Product;
  artisanName?: string;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand-deep">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.compareAt && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream">
            Save {Math.round(100 - (product.price / product.compareAt) * 100)}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-forest">
          {product.category}
        </span>
        <h3 className="font-display text-base font-medium leading-snug text-charcoal">
          {product.name}
        </h3>
        {artisanName && (
          <p className="text-xs text-ink-muted">by {artisanName}</p>
        )}
        <div className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          <Star size={13} className="fill-gold text-gold" />
          <span>{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-charcoal">
            {formatKES(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-ink-muted line-through">
              {formatKES(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
