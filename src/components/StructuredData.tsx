import { SITE_URL, PROFILE, PROJECTS } from "@/lib/site";

/**
 * Schema.org JSON-LD. This is what Google rich results AND generative engines
 * (ChatGPT, Gemini, Perplexity) parse to extract structured facts about who
 * Trupti is and what she's built — far more reliably than scraping the DOM.
 *
 * Graph: Person <-mainEntity- ProfilePage, WebSite, and an ItemList of projects.
 */
export default function StructuredData() {
  const personId = `${SITE_URL}/#person`;

  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: PROFILE.name,
      givenName: PROFILE.firstName,
      familyName: PROFILE.lastName,
      url: SITE_URL,
      email: `mailto:${PROFILE.email}`,
      jobTitle: PROFILE.jobTitle,
      description: PROFILE.description,
      image: `${SITE_URL}/icon-192.png`,
      worksFor: { "@type": "Organization", name: PROFILE.employer },
      alumniOf: { "@type": "CollegeOrUniversity", name: PROFILE.alumniOf },
      address: {
        "@type": "PostalAddress",
        addressLocality: PROFILE.locality,
        addressCountry: PROFILE.country,
      },
      knowsAbout: [...PROFILE.expertise],
      sameAs: [PROFILE.github, PROFILE.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: `${PROFILE.name} — Portfolio`,
      description: PROFILE.description,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: `${PROFILE.name} — ${PROFILE.jobTitle}`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#projects`,
      name: `Selected projects by ${PROFILE.name}`,
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: p.name,
          description: p.description,
          codeRepository: p.url,
          url: p.url,
          author: { "@id": personId },
          dateCreated: p.date,
          keywords: p.keywords.join(", "),
          programmingLanguage: "Python, TypeScript",
        },
      })),
    },
  ];

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
