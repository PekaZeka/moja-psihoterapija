import { SITE } from "./constants";

export function localBusinessSchema(lang: "sr" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.nameCyrillic,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}/images/og-image.jpg`,
    logo: `${SITE.url}/images/logo.jpeg`,
    description:
      lang === "sr"
        ? "Psihoterapija - centar za lični, porodični i profesionalni razvoj u Beogradu. Sistemska porodična psihoterapija, individualna terapija, online i uživo."
        : "Psychotherapy center for personal, family, and professional development in Belgrade. Systemic family therapy, individual therapy, online and in-person.",
    address: {
      "@type": "PostalAddress",
      addressLocality: lang === "sr" ? SITE.address.city : SITE.address.cityEn,
      addressRegion: SITE.address.area,
      addressCountry: lang === "sr" ? SITE.address.country : SITE.address.countryEn,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 44.8015,
      longitude: 20.4728,
    },
    priceRange: `${SITE.pricing.min}-${SITE.pricing.max} ${SITE.pricing.currency}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs: [SITE.instagram],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 44.8015, longitude: 20.4728 },
      geoRadius: "50000",
    },
    serviceType: lang === "sr" ? "Psihoterapija" : "Psychotherapy",
    availableLanguage: ["sr", "en"],
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.therapist.name,
    jobTitle: SITE.therapist.title,
    worksFor: { "@id": `${SITE.url}/#organization` },
    url: `${SITE.url}/sr/vas-terapeut/`,
    knowsAbout: [
      "Systemic psychotherapy",
      "Family therapy",
      "Couple therapy",
      "Anxiety treatment",
      "Depression therapy",
      "Self-confidence building",
    ],
  };
}

export function serviceSchema(name: string, description: string, slug: string, lang: "sr" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@id": `${SITE.url}/#organization` },
    url: `${SITE.url}/${lang}/${lang === "sr" ? "oblasti-rada" : "areas-of-work"}/${slug}/`,
    areaServed: {
      "@type": "Country",
      name: lang === "sr" ? "Srbija" : "Serbia",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/${lang}/${lang === "sr" ? "kontakt" : "contact"}/`,
      servicePhone: SITE.phone,
    },
  };
}

export function articleSchema(
  title: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified?: string,
  image?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || `${SITE.url}/images/og-image.jpg`,
    author: personSchema(),
    publisher: {
      "@id": `${SITE.url}/#organization`,
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
