(function(){
 const SDK_VERSION='12.16.0';
 const SDK_BASE=`https://www.gstatic.com/firebasejs/${SDK_VERSION}`;
 let servicesPromise=null;

 function clone(value){
  return value==null?value:JSON.parse(JSON.stringify(value));
 }

 function timestamp(value,fallback='1970-01-01T00:00:00.000Z'){
  const date=new Date(value||fallback);
  return Number.isFinite(date.getTime())?date.toISOString():fallback;
 }

 function timestampMs(value){
  const parsed=new Date(value||0).getTime();
  return Number.isFinite(parsed)?parsed:0;
 }

 function normalizeState(value){
  const records={};
  if(value?.records&&typeof value.records==='object'){
   Object.entries(value.records).forEach(([entryId,record])=>{
    if(!entryId||!record||typeof record!=='object')return;
    records[entryId]={
     changedAt:timestamp(record.changedAt),
     deleted:Boolean(record.deleted)
    };
   });
  }
  return {
   version:1,
   records,
   userId:typeof value?.userId==='string'?value.userId:'',
   lastSyncAt:typeof value?.lastSyncAt==='string'?value.lastSyncAt:'',
   lastError:typeof value?.lastError==='string'?value.lastError:''
  };
 }

 function ensureStateForEntries(entries,state){
  const next=normalizeState(state);
  (entries||[]).forEach(entry=>{
   if(!entry?.id||next.records[entry.id])return;
   next.records[entry.id]={
    changedAt:timestamp(entry.updatedAt,entry.date?`${entry.date}T12:00:00.000Z`:undefined),
    deleted:false
   };
  });
  return next;
 }

 function recordLocalChanges(previousEntries,nextEntries,state,changedAt=new Date().toISOString()){
  const nextState=ensureStateForEntries(previousEntries,state);
  const previous=new Map((previousEntries||[]).filter(entry=>entry?.id).map(entry=>[entry.id,entry]));
  const current=new Map((nextEntries||[]).filter(entry=>entry?.id).map(entry=>[entry.id,entry]));
  const changedIds=[];
  current.forEach((entry,entryId)=>{
   const prior=previous.get(entryId);
   if(prior&&JSON.stringify(prior)===JSON.stringify(entry))return;
   nextState.records[entryId]={changedAt:timestamp(changedAt),deleted:false};
   changedIds.push(entryId);
  });
  previous.forEach((_entry,entryId)=>{
   if(current.has(entryId))return;
   nextState.records[entryId]={changedAt:timestamp(changedAt),deleted:true};
   changedIds.push(entryId);
  });
  nextState.lastError='';
  return {state:nextState,changedIds};
 }

 function normalizeRemoteRecord(value){
  if(!value||typeof value!=='object'||typeof value.entryId!=='string'||!value.entryId)return null;
  const deleted=Boolean(value.deleted);
  if(!deleted&&(!value.payload||typeof value.payload!=='object'))return null;
  return {
   entryId:value.entryId,
   changedAt:timestamp(value.changedAt),
   deleted,
   payload:deleted?null:clone(value.payload),
   schemaVersion:Number(value.schemaVersion)||1
  };
 }

 function sameCloudRecord(a,b){
  if(!a||!b)return false;
  return a.changedAt===b.changedAt&&a.deleted===b.deleted&&
   (a.deleted||JSON.stringify(a.payload)===JSON.stringify(b.payload));
 }

 function mergeWorkoutRecords(localEntries,remoteValues,state){
  const nextState=ensureStateForEntries(localEntries,state);
  const localById=new Map((localEntries||[]).filter(entry=>entry?.id).map(entry=>[entry.id,clone(entry)]));
  const remoteById=new Map();
  (remoteValues||[]).map(normalizeRemoteRecord).filter(Boolean).forEach(record=>{
   const prior=remoteById.get(record.entryId);
   if(!prior||timestampMs(record.changedAt)>timestampMs(prior.changedAt))remoteById.set(record.entryId,record);
  });
  const ids=new Set([...Object.keys(nextState.records),...localById.keys(),...remoteById.keys()]);
  const mergedEntries=[];
  const uploads=[];
  let pulledCount=0;
  let deletedCount=0;

  ids.forEach(entryId=>{
   const localVersion=nextState.records[entryId];
   const localPayload=localById.get(entryId)||null;
   const localRecord=localVersion&&(localVersion.deleted||localPayload)?{
    entryId,
    changedAt:localVersion.changedAt,
    deleted:Boolean(localVersion.deleted),
    payload:localVersion.deleted?null:localPayload,
    schemaVersion:1
   }:null;
   const remoteRecord=remoteById.get(entryId)||null;
   const remoteWins=remoteRecord&&(!localRecord||timestampMs(remoteRecord.changedAt)>timestampMs(localRecord.changedAt));
   const winner=remoteWins?remoteRecord:localRecord;
   if(!winner)return;

   nextState.records[entryId]={changedAt:winner.changedAt,deleted:winner.deleted};
   if(winner.deleted){
    if(remoteWins&&localPayload)deletedCount+=1;
   }else{
    mergedEntries.push(clone(winner.payload));
    if(remoteWins) pulledCount+=1;
   }
   if(!remoteWins&&(!remoteRecord||!sameCloudRecord(localRecord,remoteRecord)))uploads.push(clone(localRecord));
  });

  return {entries:mergedEntries,state:nextState,uploads,pulledCount,deletedCount};
 }

 function config(){
  return window.AFT_CLOUD_CONFIG||{};
 }

 function isConfigured(){
  const value=config();
  const firebase=value.firebase||{};
  return Boolean(value.enabled&&value.provider==='firebase'&&firebase.apiKey&&firebase.authDomain&&firebase.projectId&&firebase.appId);
 }

 async function services(){
  if(!isConfigured())throw new Error('Cloud backup is not configured');
  if(servicesPromise)return servicesPromise;
  servicesPromise=(async()=>{
   const [appModule,authModule,firestoreModule]=await Promise.all([
    import(`${SDK_BASE}/firebase-app.js`),
    import(`${SDK_BASE}/firebase-auth.js`),
    import(`${SDK_BASE}/firebase-firestore.js`)
   ]);
   const firebaseApp=appModule.getApps().length?appModule.getApp():appModule.initializeApp(config().firebase);
   const auth=authModule.getAuth(firebaseApp);
   try{await authModule.setPersistence(auth,authModule.browserLocalPersistence)}catch{}
   let db;
   try{
    db=firestoreModule.initializeFirestore(firebaseApp,{
     localCache:firestoreModule.persistentLocalCache({tabManager:firestoreModule.persistentMultipleTabManager()})
    });
   }catch{
    db=firestoreModule.getFirestore(firebaseApp);
   }
   return {auth,db,authModule,firestoreModule};
  })();
  try{return await servicesPromise}catch(error){servicesPromise=null;throw error}
 }

 async function initialize(onAuthChange){
  if(!isConfigured())return {configured:false};
  const service=await services();
  service.authModule.onAuthStateChanged(service.auth,user=>onAuthChange?.(user||null));
  return {configured:true};
 }

 async function signIn(){
  const service=await services();
  const provider=new service.authModule.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  try{
   return (await service.authModule.signInWithPopup(service.auth,provider)).user;
  }catch(error){
   if(!['auth/popup-blocked','auth/cancelled-popup-request','auth/operation-not-supported-in-this-environment'].includes(error?.code))throw error;
   await service.authModule.signInWithRedirect(service.auth,provider);
   return null;
  }
 }

 async function signOut(){
  const service=await services();
  await service.authModule.signOut(service.auth);
 }

 async function readRecords(user){
  if(!user?.uid)throw new Error('Sign in before syncing');
  const service=await services();
  const reference=service.firestoreModule.collection(service.db,'users',user.uid,'workouts');
  const snapshot=await service.firestoreModule.getDocs(reference);
  return snapshot.docs.map(item=>normalizeRemoteRecord(item.data())).filter(Boolean);
 }

 async function writeRecords(user,records){
  if(!user?.uid)throw new Error('Sign in before syncing');
  const clean=(records||[]).map(normalizeRemoteRecord).filter(Boolean);
  if(!clean.length)return 0;
  const service=await services();
  for(let index=0;index<clean.length;index+=400){
   const batch=service.firestoreModule.writeBatch(service.db);
   clean.slice(index,index+400).forEach(record=>{
    const reference=service.firestoreModule.doc(service.db,'users',user.uid,'workouts',encodeURIComponent(record.entryId));
    batch.set(reference,{...record,clientWrittenAt:new Date().toISOString()},{merge:false});
   });
   await batch.commit();
  }
  return clean.length;
 }

 window.AFTCloud=Object.freeze({
  isConfigured,
  initialize,
  signIn,
  signOut,
  readRecords,
  writeRecords,
  model:Object.freeze({normalizeState,ensureStateForEntries,recordLocalChanges,normalizeRemoteRecord,mergeWorkoutRecords})
 });
})();
