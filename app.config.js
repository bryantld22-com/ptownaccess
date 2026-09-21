const base = require('./app.json').expo;

module.exports = ({ config }) => ({
  ...config,
  ...base,
  extra: {
    ...(base.extra || {}),
    runtimeMode: process.env.EXPO_PUBLIC_RUNTIME_MODE || 'preview',
    apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
    authIssuer: process.env.EXPO_PUBLIC_AUTH_ISSUER || '',
    syncEnabled: process.env.EXPO_PUBLIC_SYNC_ENABLED === 'true',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  },
});
