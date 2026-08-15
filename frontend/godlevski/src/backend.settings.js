// environment-dependent bases come from PUBLIC_* env vars
// (.env.development / .env.production + .local overrides, injected by rsbuild);
// route paths are api contract — constants, not environment.
const {
  PUBLIC_SERVER_BASE,
  PUBLIC_SLIDE_IMAGE_BASE,
  PUBLIC_EMAIL_HOOK_UPDATE_RATE_MS,
} = process.env;

export default {
  // server links
  serverBase: PUBLIC_SERVER_BASE || '/api',

  //google

  // email verification
  emailVerificationPath: '/email/verify',
  emailCodeVerificationPath: '/email/verify/code',
  emailHookPath: '/email/verified/',
  emailHookUpdateRateMs: Number(PUBLIC_EMAIL_HOOK_UPDATE_RATE_MS) || 10000,

  // inquiry
  inquiryPath: '/inquiry',
  // folio indexes (slides)
  slidesPath: '/slides',
  // tags index
  tagsIndexPath: '/tags-index',
  // intro index
  introDataPath: '/intro-data',
  // slide image base
  slideImageBase: PUBLIC_SLIDE_IMAGE_BASE || '/files/slides/',
}
