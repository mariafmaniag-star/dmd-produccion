import { supabase } from "./supabase-browser";

type StoredAttachment={id:string;name:string;type:string;size:number;addedAt:string;path?:string};
export type CloudProject = { id:string; name:string; type:string; manager:string; budget:number; targetCost:number; planned:number; actual:number; ppc:number; delay:number; attachments:StoredAttachment[] };
export type CloudResource = { id:string; projectId:string; kind:string; name:string; planned:number; available:number; note:string; attachments:StoredAttachment[] };
export type CloudMaterial = { id:string; projectId:string; name:string; stock:number; minimum:number; unit:string; note:string; attachments:StoredAttachment[] };
export type CloudQuality = { id:string; projectId:string; kind:string; description:string; status:string; note:string; attachments:StoredAttachment[] };

const numberValue=(value:unknown)=>Number(value||0);

export async function loadProductionData(){
  if(!supabase) return null;
  const [projects,resources,materials,quality] = await Promise.all([
    supabase.from("production_projects").select("*").order("created_at",{ascending:false}),
    supabase.from("production_resources").select("*").order("created_at",{ascending:false}),
    supabase.from("production_materials").select("*").order("created_at",{ascending:false}),
    supabase.from("production_quality_records").select("*").order("created_at",{ascending:false}),
  ]);
  const error=projects.error||resources.error||materials.error||quality.error;
  if(error) throw error;
  return {
    projects:(projects.data||[]).map(row=>({id:row.id,name:row.name,type:row.project_type,manager:row.manager||"",budget:numberValue(row.budget),targetCost:numberValue(row.target_cost),planned:numberValue(row.planned_progress),actual:numberValue(row.actual_progress),ppc:numberValue(row.ppc),delay:numberValue(row.delay_days),attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    resources:(resources.data||[]).map(row=>({id:row.id,projectId:row.project_id,kind:row.resource_type,name:row.name,planned:numberValue(row.planned_capacity),available:numberValue(row.available_capacity),note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    materials:(materials.data||[]).map(row=>({id:row.id,projectId:row.project_id,name:row.name,stock:numberValue(row.stock),minimum:numberValue(row.minimum_stock),unit:row.unit||"unidades",note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
    quality:(quality.data||[]).map(row=>({id:row.id,projectId:row.project_id,kind:row.record_type,description:row.description,status:row.status,note:row.notes||"",attachments:Array.isArray(row.attachments)?row.attachments:[]})),
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
