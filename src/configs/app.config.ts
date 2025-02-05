export default () => ({
  env: process.env.NODE_ENV ?? 'dev',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX,
});
