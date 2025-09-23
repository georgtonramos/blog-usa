// src/components/BreadcrumbSchema.tsx
import Script from 'next/script';

type BreadcrumbItem = {
  position: number;
  name: string;
  item: string;
};

type Props = {
  items: BreadcrumbItem[];
};

const SITE_URL = "https://blog.naturaleatinghub.online";

export default function BreadcrumbSchema({ items }: Props) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "item": `${SITE_URL}${item.item}`
    }))
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  );
}