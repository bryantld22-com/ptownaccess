import Constants from 'expo-constants';

export type RuntimeMode = 'preview' | 'production';
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
export const runtime = {
  mode: extra.runtimeMode === 'production' ? 'production' as const : 'preview' as const,
  apiUrl: typeof extra.apiUrl === 'string' ? extra.apiUrl : '',
  authIssuer: typeof extra.authIssuer === 'string' ? extra.authIssuer : '',
  syncEnabled: extra.syncEnabled === true,
  supabaseUrl: typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl : '',
  supabasePublishableKey: typeof extra.supabasePublishableKey === 'string' ? extra.supabasePublishableKey : '',
};
export const supabaseConfigured = Boolean(runtime.supabaseUrl.startsWith('https://') && runtime.supabasePublishableKey);
export const productionChecks = [
  { key:'api', label:'Secure API endpoint', ready:Boolean(runtime.apiUrl&&runtime.apiUrl.startsWith('https://')) },
  { key:'auth', label:'Staff authentication issuer', ready:Boolean(runtime.authIssuer&&runtime.authIssuer.startsWith('https://')) },
  { key:'sync', label:'Cloud synchronization enabled', ready:runtime.syncEnabled },
  { key:'mode', label:'Production runtime mode', ready:runtime.mode==='production' },
  { key:'supabase', label:'Supabase project connection', ready:supabaseConfigured },
];
