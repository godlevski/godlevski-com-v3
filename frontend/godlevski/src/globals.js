export default {
  // process.env.NODE_ENV is inlined at build time (rsbuild define)
  development: process.env.NODE_ENV == 'development',
}