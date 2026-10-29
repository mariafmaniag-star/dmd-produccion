import { supabase } from "./supabase-browser";

type StoredAttachment={id:string;name:string;type:string;size:number;addedAt:string;path?:string};
export type CloudProject = { id:string; name:string; type:string; manager:string; budget:number; targetCost:number; planned:number; actual:number; ppc:number; delay:number; attachments:StoredAttachment[] };
export type CloudResource = { id:string; projectId:string; kind:string; name:string; planned:number; available:number; note:string; attachments:StoredAttachment[] };
export type CloudMaterial = { id:string; projectId:string; name:string; stock:number; minimum:number; unit:string; note:string; attachments:StoredAttachment[] };
export type CloudQuality = { id:string; projectId:string; kind:string; description:string; status:string; note:string; attachments:StoredAttachment[] };
export type CloudCaliddaService = { id:string; code:string; site:string; serviceType:string; receivedAt:string; stage:number; owner:string; budget:number; collection:string; notes:string; events:unknown[]; costs:unknown[]; documents:StoredAttachment[]; payments:unknown[] };

const numberValue=(value:unknown)=>Number(value||0);

export async function loadProductionData(){
  if(!supabase) return null;
  const [projects,resources,materials,quality,services] = await Promise.all([
    supabase.from("production_projects").select("*").order("created_at",{ascending:false}),
    supabase.from("production_resources").select("*").order("created_at",{ascending:false}),
    supabase.from("production_materials").select("*").order("created_at",{ascending:false}),
    supabase.from("production_quality_records").select("*").order("created_at",{ascending:false}),
    supabase.from("production_calidda_services").select("*").order("created_at",{ascending:false}),
  ]);
  const error=projects.error||resources.error||materials.error||quality.error||services.error;
  if(error) throw error;
  return {
    projects:(projects.data||[]).map(row=>({id:row.id,name:row.name,type:row.project_type,manager:row.manager||"",budget:numberValue(row.budget),targetCost:numberValue(row.target_cost),planned:numberValue(row.planned_progress),actual:numberValue(row.actual_progress),ppc:numberValue(row.ppc),delay:numberValue(row.delay_days),attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    resources:(resources.data||[]).map(row=>({id:row.id,projectId:row.project_id,kind:row.resource_type,name:row.name,planned:numberValue(row.planned_capacity),available:numberValue(row.available_capacity),note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    materials:(materials.data||[]).map(row=>({id:row.id,projectId:row.project_id,name:row.name,stock:numberValue(row.stock),minimum:numberValue(row.minimum_stock),unit:row.unit||"unidades",note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    quality:(quality.data||[]).map(row=>({id:row.id,projectId:row.project_id,kind:row.record_type,description:row.description,status:row.status,note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    services:(services.data||[]).map(row=>({id:row.id,code:row.code||"Sin OS",site:row.site||"Sin sede",serviceType:row.service_type||"Sin servicio",receivedAt:row.received_at||"",stage:numberValue(row.stage)||1,owner:row.owner||"Sin asignar",budget:numberValue(row.budget),collection:row.collection||"Pendiente de facturación",notes:row.notes||"",events:Array.isArray(row.events)?row.events:[],costs:Array.isArray(row.costs)?row.costs:[],documents:Array.isArray(row.documents)?row.documents:[],payments:Array.isArray(row.payments)?row.payments:[]})),
  };
}

export async function insertProject(project:CloudProject){
  if(!supabase) return;
  const {error}=await supabase.from("production_projects").insert({id:project.id,name:project.name,project_type:project.type,manager:project.manager||null,budget:project.budget,target_cost:project.targetCost,planned_progress:project.planned,actual_progress:project.actual,ppc:project.ppc,delay_days:project.delay,attachments:project.attachments});
  if(error) throw error;
}
export async function removeProject(id:string){ if(!supabase)return; const {error}=await supabase.from("production_projects").delete().eq("id",id); if(error)throw error; }
export async function updateProjectAttachments(id:string,attachments:StoredAttachment[]){if(!supabase)return;const {error}=await supabase.from("production_projects").update({attachments}).eq("id",id);if(error)throw error;}
export async function insertResource(row:CloudResource){if(!supabase)return;const {error}=await supabase.from("production_resources").insert({id:row.id,project_id:row.projectId,resource_type:row.kind,name:row.name,planned_capacity:row.planned,available_capacity:row.available,notes:row.note||null,attachments:row.attachments});if(error)throw error;}
export async function removeResource(id:string){if(!supabase)return;const {error}=await supabase.from("production_resources").delete().eq("id",id);if(error)throw error;}
export async function insertMaterial(row:CloudMaterial){if(!supabase)return;const {error}=await supabase.from("production_materials").insert({id:row.id,project_id:row.projectId,name:row.name,stock:row.stock,minimum_stock:row.minimum,unit:row.unit,notes:row.note||null,attachments:row.attachments});if(error)throw error;}
export async function removeMaterial(id:string){if(!supabase)return;const {error}=await supabase.from("production_materials").delete().eq("id",id);if(error)throw error;}
export async function insertQuality(row:CloudQuality){if(!supabase)return;const {error}=await supabase.from("production_quality_records").insert({id:row.id,project_id:row.projectId,record_type:row.kind,description:row.description,status:row.status,notes:row.note||null,attachments:row.attachments});if(error)throw error;}
export async function removeQuality(id:string){if(!supabase)return;const {error}=await supabase.from("production_quality_records").delete().eq("id",id);if(error)throw error;}
export async function insertCaliddaService(row:CloudCaliddaService){if(!supabase)return;const {error}=await supabase.from("production_calidda_services").insert({id:row.id,code:row.code,site:row.site,service_type:row.serviceType,received_at:row.receivedAt||null,stage:row.stage,owner:row.owner,budget:row.budget,collection:row.collection,notes:row.notes,events:row.events,costs:row.costs,documents:row.documents,payments:row.payments});if(error)throw error;}
export async function updateCaliddaService(id:string,patch:Partial<CloudCaliddaService>){if(!supabase)return;const values:Record<string,unknown>={};if(patch.code!==undefined)values.code=patch.code;if(patch.site!==undefined)values.site=patch.site;if(patch.serviceType!==undefined)values.service_type=patch.serviceType;if(patch.receivedAt!==undefined)values.received_at=patch.receivedAt;if(patch.stage!==undefined)values.stage=patch.stage;if(patch.owner!==undefined)values.owner=patch.owner;if(patch.budget!==undefined)values.budget=patch.budget;if(patch.collection!==undefined)values.collection=patch.collection;if(patch.notes!==undefined)values.notes=patch.notes;if(patch.events!==undefined)values.events=patch.events;if(patch.costs!==undefined)values.costs=patch.costs;if(patch.documents!==undefined)values.documents=patch.documents;if(patch.payments!==undefined)values.payments=patch.payments;const {error}=await supabase.from("production_calidda_services").update(values).eq("id",id);if(error)throw error;}
