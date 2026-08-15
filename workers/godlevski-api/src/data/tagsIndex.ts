import { TagsIndexResponse } from '@godlevski/schemas/controllers/tagsIndex';

// ported verbatim from v2.1 server/routers/tagsIndexRouter.js — hardcoded
// there too; moves to D1 if/when it needs editing from an admin
export const tagsIndex: TagsIndexResponse['data'] = {
  "full stack": [
    "typescript",
    "react",
    "react native",
    "node",
    "node: express",
    "custom packages",
    "CI/CD",

    "AWS: lambda /events",
    "GCP: big query",
    "GPT: chatbots /integrations",
    "firebase",
    "Postgres db",
    "Mongo db",
    "git",
    "docker",
    "javascript (es3/es6)",
    "php /magento",
    "HTML /XSLT /SVG",
    "CSS /Styled Components /SCSS"
  ],
  "deployments": [
    "web",
    "mobile app",
    "security panel"
  ],
  "web design /ui": [
    "Info design",
    "UI design",
  ],
  "identity": [
    "brand",
    "logo",
    "business cards",
    "letterhead",
    "elements",
    "style",
    "shopping bags"
  ],

  "marketing": [
    "data collection automations",
    "presentation",
    "print: mailers",
    "client registering/tracking system",
    "web malier"
  ],
};
