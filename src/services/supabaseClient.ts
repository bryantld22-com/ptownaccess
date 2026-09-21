import 'react-native-url-polyfill/auto';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { runtime, supabaseConfigured } from '../config/environment';

const webStorage = {
  getItem: async (key:string) => typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
  setItem: async (key:string,value:string) => { if(typeof localStorage !== 'undefined') localStorage.setItem(key,value); },
  removeItem: async (key:string) => { if(typeof localStorage !== 'undefined') localStorage.removeItem(key); },
};
const nativeStorage = {
  getItem: (key:string) => SecureStore.getItemAsync(key),
  setItem: (key:string,value:string) => SecureStore.setItemAsync(key,value),
  removeItem: (key:string) => SecureStore.deleteItemAsync(key),
};

let client:SupabaseClient|null=null;
export function getSupabaseClient(){
  if(!supabaseConfigured) return null;
  if(!client) client=createClient(runtime.supabaseUrl,runtime.supabasePublishableKey,{auth:{storage:Platform.OS==='web'?webStorage:nativeStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:Platform.OS==='web',lock:processLock}});
  return client;
}
