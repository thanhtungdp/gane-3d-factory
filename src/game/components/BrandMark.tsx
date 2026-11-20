import { useState } from "react";
import type { BrandProfile } from "@/shared/types";
import { inkOn, monogramOf, primaryColor } from "../engine/brand";

export interface BrandMarkProps {
  brand: BrandProfile;
  size?: number;
  className?: string;
}

/** Logo thật nếu có; lỗi hoặc thiếu logo thì monogram từ tên thương hiệu. */
export function BrandMark({ brand, size = 36, className = "" }: BrandMarkProps) {
  const [failed, setFailed] = useState(false);
  const url = brand.logo?.url;
  const color = primaryColor(brand);
  const box = { width: size, height: size };

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={`Logo ${brand.name}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-lg bg-white/5 object-contain p-1 ${className}`}
        style={box}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`Logo ${brand.name}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold tracking-tight ${className}`}
      style={{ ...box, backgroundColor: color, color: inkOn(color), fontSize: Math.max(11, size * 0.4) }}
    >
      {monogramOf(brand.name)}
    </span>
  );
}
