import { getSupabaseClient } from './supabaseClient';

export type ConnectionDiagnostic = {
  ok: boolean;
  message: string;
};

export async function checkSupabaseConnection(): Promise<ConnectionDiagnostic> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, message: 'Project URL and publishable key are not configured.' };
  try {
    const { error } = await client.from('staff_profiles').select('user_id').limit(1);
    if (error) return { ok: false, message: `Project responded, but the PTown schema check failed: ${error.message}` };
    return { ok: true, message: 'Development project responded and the PTown staff schema is available.' };
  } catch {
    return { ok: false, message: 'The development project could not be reached. Check the URL, key, and network.' };
  }
}
