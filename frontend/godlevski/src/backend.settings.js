export default process && process.env?.NODE_ENV == 'development' 
?

{
  // server links
  serverBase: '/2000',

  //google

  // email verification
  emailVerificationPath: '/email/verify',
  emailCodeVerificationPath: '/email/verify/code',
  emailHookPath: '/email/verified/',
  emailHookUpdateRateMs: 10000,

  // inquiry
  inquiryPath: '/inquiry',
  // folio indexes (slides)
  slidesPath: '/slides',
  // tags index
  tagsIndexPath: '/tagsIndex',
  // intro index
  introDataPath: '/introData',
  // slide image base
  slideImageBase: '/files/slides/'
}

:

{
  // server links
  serverBase: '/2000',

  //google

  // email verification
  emailVerificationPath: '/email/verify',
  emailCodeVerificationPath: '/email/verify/code',
  emailHookPath: '/email/verified/',
  emailHookUpdateRateMs: 10000,

  // inquiry
  inquiryPath: '/inquiry',
  // folio indexes (slides)
  slidesPath: '/slides',
  // tags index
  tagsIndexPath: '/tagsIndex',
  // intro index
  introDataPath: '/introData',
  // slide image base
  slideImageBase: '/files/slides/'

}