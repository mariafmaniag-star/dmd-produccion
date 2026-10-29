"use client";

import {useRef, useState} from "react";
import {Download, FileUp, Trash2} from "lucide-react";
import {hasSupabaseConfig,supabase} from "@/lib/supabase-browser";

export type Attachment={id:string;name:string;type:string;size:number;addedAt:string;path?:string};

const databaseName="dmd-production-files";
const storeName="attachments";

function database():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(databaseName,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(storeName);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
async function putFile(id:string,file:File){const db=await database();await new Promise<void>((resolve,reject)=>{const request=db.transaction(storeName,"readwrite").objectStore(storeName).put(file,id);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);});db.close();}
async function getFile(id:string){const db=await database();const file=await new Promise<File|undefined>((resolve,reject)=>{const request=db.transaction(storeName).objectStore(storeName).get(id);request.onsuccess=()=>resolve(request.result as File|undefined);request.onerror=()=>reject(request.error);});db.close();return file;}
async function removeFile(id:string){const db=await database();await new Promise<void>((resolve,reject)=>{const request=db.transaction(storeName,"readwrite").objectStore(storeName).delete(id);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);});db.close();}
const formatSize=(bytes:number)=>bytes<1024*1024?`${Math.max(1,Math.round(bytes/1024))} KB`:`${(bytes/(1024*1024)).toFixed(1)} MB`;
const bucket="production-documents";
const safeName=(name:string)=>name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-");

async function centralAttachment(id:string,file:File):Promise<Attachment>{
 if(!supabase)throw new Error("Sin conexión central");
 const {data:userData,error:userError}=await supabase.auth.getUser();
 if(userError||!userData.user)throw new Error("Sesión no válida");
 const path=`${userData.user.id}/${id}-${safeName(file.name)}`;
 const {error}=await supabase.storage.from(bucket).upload(path,file,{contentType:file.type||undefined,upsert:false});
 if(error)throw error;
 return {id,name:file.name,type:file.type||"Archivo",size:file.size,addedAt:new Date().toISOString().slice(0,10),path};
}
export async function saveAttachment(file:File):Promise<Attachment>{
 const id=crypto.randomUUID();
 if(hasSupabaseConfig)return centralAttachment(id,file);
 await putFile(id,file);
 return {id,name:file.name,type:file.type||"Archivo",size:file.size,addedAt:new Date().toISOString().slice(0,10)};
}

export function AttachmentPicker({attachments,onChange,label="Adjuntar archivos"}:{attachments:Attachment[];onChange:(items:Attachment[])=>void;label?:string}){
 const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const add=async(files:FileList|null)=>{
  if(!files?.length)return;
  setBusy(true);setMessage("");
  try{
   const newItems=await Promise.all(Array.from(files).map(saveAttachment));
   onChange([...attachments,...newItems]);
  }catch{setMessage("No pudimos guardar ese archivo. Revisa tu conexión e inténtalo de nuevo.");}
  finally{setBusy(false);if(input.current)input.current.value="";}
 };
 const download=async(item:Attachment)=>{try{if(item.path&&supabase){const {data,error}=await supabase.storage.from(bucket).createSignedUrl(item.path,60);if(error||!data?.signedUrl)throw error;const link=document.createElement("a");link.href=data.signedUrl;link.download=item.name;link.click();return;}const file=await getFile(item.id);if(!file){setMessage("El archivo original no está disponible en este navegador.");return;}const url=URL.createObjectURL(file);const link=document.createElement("a");link.href=url;link.download=item.name;link.click();URL.revokeObjectURL(url);}catch{setMessage("No pudimos abrir el archivo.");}};
 const remove=async(id:string)=>{const item=attachments.find(x=>x.id===id);try{if(item?.path&&supabase)await supabase.storage.from(bucket).remove([item.path]);else await removeFile(id);}finally{onChange(attachments.filter(item=>item.id!==id));}};
 return <div className="attachment-picker"><input ref={input} type="file" multiple hidden onChange={event=>add(event.target.files)}/><button type="button" className="secondary-button attach-button" disabled={busy} onClick={()=>input.current?.click()}><FileUp size={16}/>{busy?"Guardando archivo…":label}</button><small>{hasSupabaseConfig?"Se guardan de forma central y privada para el equipo de Producción.":"Se guardan en este navegador durante esta versión de revisión."}</small>{message&&<p className="attachment-message">{message}</p>}{attachments.length>0&&<div className="attachment-list">{attachments.map(item=><div key={item.id}><span><strong>{item.name}</strong><small>{item.type} · {formatSize(item.size)} · {item.addedAt}</small></span><button type="button" aria-label={`Descargar ${item.name}`} onClick={()=>download(item)}><Download size={15}/></button><button type="button" aria-label={`Eliminar ${item.name}`} onClick={()=>remove(item.id)}><Trash2 size={15}/></button></div>)}</div>}</div>;
}
