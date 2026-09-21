import type { SyncEnvelope } from './operationsBackend';
import type { SupabaseOperationsBackend } from './supabaseOperationsBackend';
import type { MigrationPlan } from '../utils/operationsMigration';

export type ReconciliationIssue = { collection:string; recordId:string; kind:'Local only'|'Cloud only'|'Content conflict'; localChecksum?:string; cloudChecksum?:string };
export type ReconciliationReport = { localRecords:number; cloudRecords:number; matched:number; localOnly:number; cloudOnly:number; contentConflicts:number; issues:ReconciliationIssue[]; clean:boolean; checkedAt:string };

function canonical(value:unknown):unknown {
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,canonical(item)]));
  return value;
}
export function payloadChecksum(value:unknown){const text=JSON.stringify(canonical(value));let hash=2166136261;for(let index=0;index<text.length;index+=1){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619);}return `fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`;}

export async function reconcileOperations(plan:MigrationPlan,backend:SupabaseOperationsBackend):Promise<ReconciliationReport>{
  const issues:ReconciliationIssue[]=[];let cloudRecords=0;let matched=0;
  for(const collection of plan.collections){
    const remote=await backend.pull<unknown>(collection.key);cloudRecords+=remote.length;
    const localById=new Map(collection.records.map(record=>[record.recordId,record]));
    const remoteById=new Map<string,SyncEnvelope<unknown>>(remote.map(record=>[record.recordId,record]));
    for(const local of collection.records){const cloud=remoteById.get(local.recordId);if(!cloud){issues.push({collection:collection.key,recordId:local.recordId,kind:'Local only'});continue;}const localChecksum=payloadChecksum(local.payload);const cloudChecksum=payloadChecksum(cloud.payload);if(localChecksum===cloudChecksum)matched+=1;else issues.push({collection:collection.key,recordId:local.recordId,kind:'Content conflict',localChecksum,cloudChecksum});}
    for(const cloud of remote)if(!localById.has(cloud.recordId))issues.push({collection:collection.key,recordId:cloud.recordId,kind:'Cloud only'});
  }
  const localOnly=issues.filter(issue=>issue.kind==='Local only').length;const cloudOnly=issues.filter(issue=>issue.kind==='Cloud only').length;const contentConflicts=issues.filter(issue=>issue.kind==='Content conflict').length;
  return{localRecords:plan.totalRecords,cloudRecords,matched,localOnly,cloudOnly,contentConflicts,issues,clean:issues.length===0&&matched===plan.totalRecords&&cloudRecords===plan.totalRecords,checkedAt:new Date().toISOString()};
}
