import type { MigrationPlan } from '../utils/operationsMigration';
import type { SupabaseOperationsBackend } from './supabaseOperationsBackend';

type RpcClient = { rpc(name:string,args:Record<string,unknown>):PromiseLike<{data:unknown;error:{message:string}|null}> };
type BatchResult = { result_collection:string; result_record_key:string; accepted:boolean };

export type MigrationExecutionReport = { attempted:number; accepted:number; conflicts:Array<{collection:string;recordId:string}>; missingAfterUpload:Array<{collection:string;recordId:string}>; reconciled:boolean };

export async function executeOperationsMigration(client:RpcClient,backend:SupabaseOperationsBackend,plan:MigrationPlan):Promise<MigrationExecutionReport>{
  if(!plan.ready)throw new Error('Migration plan contains blocking validation issues.');
  const source=plan.collections.flatMap(collection=>collection.records.map(record=>({collection:collection.key,recordId:record.recordId,payload:record.payload,sourceUpdatedAt:record.updatedAt})));
  const results:BatchResult[]=[];
  for(let index=0;index<source.length;index+=100){const{data,error}=await client.rpc('migrate_operations_batch',{p_records:source.slice(index,index+100)});if(error)throw new Error(error.message||'Migration batch failed.');if(!Array.isArray(data))throw new Error('Migration response was invalid.');results.push(...data as BatchResult[]);}
  const conflicts=results.filter(item=>!item.accepted).map(item=>({collection:item.result_collection,recordId:item.result_record_key}));
  const missingAfterUpload:Array<{collection:string;recordId:string}>=[];
  for(const collection of plan.collections){if(!collection.records.length)continue;const remote=await backend.pull<unknown>(collection.key);const remoteIds=new Set(remote.map(item=>item.recordId));for(const record of collection.records)if(!remoteIds.has(record.recordId))missingAfterUpload.push({collection:collection.key,recordId:record.recordId});}
  const accepted=results.filter(item=>item.accepted).length;
  return{attempted:source.length,accepted,conflicts,missingAfterUpload,reconciled:accepted===source.length&&conflicts.length===0&&missingAfterUpload.length===0};
}
