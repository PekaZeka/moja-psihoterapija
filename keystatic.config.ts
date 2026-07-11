import { config, collection, fields } from "@keystatic/core";

const blogSchema = {
  title: fields.slug({
    name: { label: "Naslov", description: "Naslov teksta" },
    slug: {
      label: "URL adresa (slug)",
      description: "Deo adrese stranice, npr. moj-novi-tekst (bez razmaka i kvačica)",
    },
  }),
  description: fields.text({
    label: "Kratak opis",
    description: "1-2 rečenice; prikazuje se na listi tekstova i u Google rezultatima",
    multiline: true,
    validation: { isRequired: true },
  }),
  pubDate: fields.date({
    label: "Datum objave",
    validation: { isRequired: true },
  }),
  author: fields.text({
    label: "Autor",
    defaultValue: "Miroslav Jovanović",
  }),
  tags: fields.array(fields.text({ label: "Tag" }), {
    label: "Tagovi",
    itemLabel: (props) => props.value || "tag",
  }),
  draft: fields.checkbox({
    label: "Nacrt (sačuvaj ali NE objavljuj na sajtu)",
    defaultValue: false,
  }),
  content: fields.markdoc({
    label: "Tekst",
    extension: "md",
  }),
};

export default config({
  storage: {
    kind: "github",
    repo: "PekaZeka/moja-psihoterapija",
  },
  ui: {
    brand: { name: "Moja psihoterapija" },
  },
  collections: {
    blogSr: collection({
      label: "Blog (srpski)",
      slugField: "title",
      path: "src/content/blog/sr/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        ...blogSchema,
        lang: fields.select({
          label: "Jezik",
          options: [{ label: "Srpski", value: "sr" }],
          defaultValue: "sr",
        }),
      },
    }),
    blogEn: collection({
      label: "Blog (engleski)",
      slugField: "title",
      path: "src/content/blog/en/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        ...blogSchema,
        lang: fields.select({
          label: "Jezik",
          options: [{ label: "Engleski", value: "en" }],
          defaultValue: "en",
        }),
      },
    }),
  },
});
