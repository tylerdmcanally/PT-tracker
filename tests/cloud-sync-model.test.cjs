const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const context={
 console,
 Date,
 JSON,
 Number,
 String,
 Boolean,
 Array,
 Object,
 Map,
 Set,
 Promise,
 encodeURIComponent,
 window:{AFT_CLOUD_CONFIG:{enabled:false}}
};
context.window.window=context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'cloud-sync.js'),'utf8'),context,{filename:'cloud-sync.js'});

const model=context.window.AFTCloud.model;
// Workout records in this file are synthetic persistence fixtures, never private user exports.
const workout=(id,updatedAt,extra={})=>({
 id,
 date:'2026-08-17',
 dayKey:'day1',
 updatedAt,
 prescriptionSnapshot:{label:'Day 1',exercises:[{id:'deadlift',prescription:'145 lb total for 3 × 5'}]},
 ...extra
});

{
 const state=model.normalizeState({userId:'account-a',records:{}});
 assert.equal(state.userId,'account-a','sync state remains bound to the original account');
}

{
 const local=[workout('local-only','2026-08-17T10:00:00.000Z')];
 const result=model.mergeWorkoutRecords(local,[],null);
 assert.equal(result.entries.length,1);
 assert.equal(result.uploads.length,1,'an existing device workout is uploaded on first sync');
 assert.deepEqual(result.uploads[0].payload.prescriptionSnapshot,local[0].prescriptionSnapshot,'historical prescription snapshots remain intact');
}

{
 const alternative=workout('illness-recovery','2026-09-10T18:00:00.000Z',{
  date:'2026-09-10',
  dayKey:'day1IllnessRecovery',
  dayLabel:'Day 1 — Illness Recovery',
  rotationDayKey:'day1',
  sessionType:'primary',
  advancesPrimaryRotation:true,
  coachDirectedAlternative:true,
  programVersion:'1.5.5',
  programEffectiveDate:'2026-09-10',
  prescriptionSnapshot:{
   sessionKey:'day1IllnessRecovery',sessionType:'primary',rotationDayKey:'day1',coachDirectedAlternative:true,
   label:'Day 1 — Illness Recovery',exercises:[{id:'illnessReturnCheck',prescription:'10 minutes easy stationary bike or walk'}]
  }
 });
 const upload=model.mergeWorkoutRecords([alternative],[],null).uploads[0];
 assert.deepEqual(upload.payload,alternative,'Firebase upload queues the complete alternative workout document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-10T19:00:00.000Z'}], null);
 assert.equal(pulled.entries[0].dayKey,'day1IllnessRecovery');
 assert.equal(pulled.entries[0].rotationDayKey,'day1');
 assert.equal(pulled.entries[0].prescriptionSnapshot.rotationDayKey,'day1','Firebase round trips preserve immutable rotation mapping');
 assert.equal(pulled.entries[0].prescriptionSnapshot.exercises[0].id,'illnessReturnCheck');
}

{
 const sep13=workout('synthetic-sep13-v156-day2','2026-09-13T18:00:00.000Z',{
  date:'2026-09-13',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.6',programEffectiveDate:'2026-09-11',
  activeRunStage:4,targetSessionRpe:'6–7',duration:'74',sessionRpe:'6',painDuring:'0',notes:'Synthetic September 13 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',targetSessionRpe:'6–7',advancesPrimaryRotation:true,exercises:[
   {id:'handReleasePushups',prescription:'5 × 10',type:'body',sets:5,targetRpe:'6–8'},
   {id:'verticalPull',prescription:'Next smallest increment above 165 lb on the same seated machine (approximately 176 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',sets:3,targetRpe:'6–8',defaultVariation:'Seated lat pulldown'},
   {id:'overheadPress',prescription:'30 lb per hand for 3 × 9',type:'weighted',sets:3,targetLoad:30,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–9'},
   {id:'chestSupportedRow',prescription:'Next smallest increment above 99 lb on the same machine (approximately 110 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',sets:3,targetRpe:'7–8',defaultVariation:'Machine row'},
   {id:'lateralRaise',prescription:'33 lb displayed per side on the same comparable cable setup for 2 × 20',type:'weighted',sets:2,targetRpe:'7–8',defaultVariation:'Cable lateral raise'},
   {id:'chestFly',prescription:'77 lb displayed on the same pec-deck machine/setup for 2 × 15',type:'weighted',sets:2,targetRpe:'7–9',defaultVariation:'Pec deck / machine fly'},
   {id:'trunkStability',prescription:'3 × 10 each side',type:'body',sets:3,defaultVariation:'Dead bug'},
   {id:'easyCardio',prescription:'25–30 minutes',type:'cardio',targetRpe:'4–5'}
  ]},
  exercises:[
   {exerciseId:'handReleasePushups',type:'body',sets:'5',reps:'10, 10, 10, 10, 10',rpe:'6',completed:true,notes:'Synthetic clean-set result.'},
   {exerciseId:'verticalPull',type:'weighted',variation:'Seated lat pulldown',variationId:'seatedLatPulldown',load:'176',sets:'3',reps:'10, 10, 12',rpe:'8',completed:true},
   {exerciseId:'overheadPress',type:'weighted',variation:'Seated dumbbell press',load:'30',sets:'3',reps:'9, 9, 7',rpe:'9',completed:true,exercisePain:{severity:0,note:'Synthetic no-pain result.',causedExerciseToStop:false}},
   {exerciseId:'chestSupportedRow',type:'weighted',variation:'Machine row',variationId:'machineRow',load:'110',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true},
   {exerciseId:'lateralRaise',type:'weighted',variation:'Cable lateral raise',variationId:'cableLateralRaise',load:'33',sets:'2',reps:'20, 20',rpe:'8',completed:true},
   {exerciseId:'chestFly',type:'weighted',variation:'Pec deck / machine fly',variationId:'pecDeckMachineFly',load:'77',sets:'2',reps:'15, 15',rpe:'8',completed:true},
   {exerciseId:'trunkStability',type:'body',variation:'Dead bug',sets:'3',reps:'10, 10, 10',rpe:'5',completed:true},
   {exerciseId:'easyCardio',type:'cardio',modality:'Bike',minutes:'30',rpe:'4',completed:true}
  ]
 });
 const upload=model.mergeWorkoutRecords([sep13],[],null).uploads[0];
 assert.deepEqual(upload.payload,sep13,'Firebase upload queues the complete synthetic September 13 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-13T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],sep13,'Firebase round trips preserve the immutable v1.5.6 snapshot and every result field');
}

{
 const legacyV157=workout('synthetic-v157-legacy-day3','2000-01-01T12:00:00.000Z',{
  date:'2000-01-01',dayKey:'day3',dayLabel:'Day 3 — Lower Strength and Gym Conditioning',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.7',programEffectiveDate:'2026-09-14',
  activeRunStage:4,targetSessionRpe:'7–8',duration:'63',sessionRpe:'7',painDuring:'0',notes:'Invented compatibility result.',
  prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',targetSessionRpe:'7–8',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'145 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:145,targetLoadVariation:'Barbell',targetRpe:'6–8'},
   {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds',type:'circuit',circuitVersion:'foundation-1.4.5',targetRpe:'7–8'},
   {id:'sidePlank',name:'Side plank',prescription:'3 × 45 sec each side',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']}
  ]},
  exercises:[
   {exerciseId:'romanianDeadlift',name:'Romanian deadlift',type:'weighted',variation:'Barbell',variationId:'barbell',load:'50',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8',rpe:'7',completed:true,notes:'Invented clean-repetition result.'},
   {exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.4.5',rounds:'2',rpe:'7',completed:true,notes:'Invented two-round result.'},
   {exerciseId:'sidePlank',name:'Side plank',type:'timed',sets:'3',times:'45, 45, 45',rpe:'7',completed:true}
  ]
 });
 const upload=model.mergeWorkoutRecords([legacyV157],[],null).uploads[0];
 assert.deepEqual(upload.payload,legacyV157,'Firebase upload preserves the complete invented v1.5.7 legacy document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2000-01-01T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],legacyV157,'Firebase round trips preserve the invented v1.5.7 snapshot and results');
}

{
 const active=workout('synthetic-active-run','2000-03-01T12:00:00.000Z',{
  date:'2000-03-01',dayKey:'runStageB',dayLabel:'Run 2 — Controlled Stage 4 and Mobility',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.9',programEffectiveDate:'2026-09-17',
  activeRunStage:4,targetSessionRpe:'5–6',duration:'34',sessionRpe:'5',painDuring:'0',notes:'Invented active-session result.',
  prescriptionSnapshot:{sessionKey:'runStageB',sessionType:'primary',label:'Run 2 — Controlled Stage 4 and Mobility',targetSessionRpe:'5–6',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'run',runStage:4,targetRpe:'5–6'},
   {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
  ]},
  exercises:[{exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',runStage:'4',walkMinutes:'1',runMinutes:'2.5',rounds:'6',completedRounds:'6',programmedIntervalTime:'21:00',totalTime:'23:00',rpe:'5',completed:true,notes:'Invented controlled run result.'}]
 });
 const upload=model.mergeWorkoutRecords([active],[],null).uploads[0];
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2000-03-01T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],active,'Firebase round trips preserve a completed v1.5.9 session as a full document');
 assert.equal(pulled.entries[0].exercises[0].programmedIntervalTime,'21:00');
 assert.equal(pulled.entries[0].exercises[0].totalTime,'23:00','cloud persistence does not conflate programmed and elapsed run time');
}

{
 const legacyDays=['day1','day2','day3','day4'].map((dayKey,index)=>workout(`synthetic-legacy-${dayKey}`,`2000-02-0${index+1}T12:00:00.000Z`,{
  date:`2000-02-0${index+1}`,dayKey,dayLabel:`Synthetic ${dayKey}`,sessionType:'primary',advancesPrimaryRotation:true,programVersion:'1.5.7',
  prescriptionSnapshot:{sessionKey:dayKey,sessionType:'primary',label:`Synthetic ${dayKey}`,advancesPrimaryRotation:true,exercises:[{id:`exercise-${index+1}`,prescription:'Invented prescription'}]},
  exercises:[{exerciseId:`exercise-${index+1}`,completed:true,notes:'Invented legacy result.'}]
 }));
 const uploads=model.mergeWorkoutRecords(legacyDays,[],null).uploads;
 const remote=uploads.map((upload,index)=>({...upload,changedAt:`2000-02-0${index+1}T13:00:00.000Z`}));
 const pulled=model.mergeWorkoutRecords([],remote,null).entries;
 assert.equal(JSON.stringify(pulled.map(entry=>entry.dayKey).sort()),JSON.stringify(['day1','day2','day3','day4']),'Firebase retains representative legacy Day 1–Day 4 keys');
 legacyDays.forEach(entry=>assert.deepEqual(pulled.find(candidate=>candidate.id===entry.id),entry,'Firebase preserves each representative legacy workout document'));
}

{
 const local=[workout('shared','2026-08-17T10:00:00.000Z',{notes:'device'})];
 const state=model.ensureStateForEntries(local,null);
 const remote=[{
  entryId:'shared',changedAt:'2026-08-17T12:00:00.000Z',deleted:false,
  payload:workout('shared','2026-08-17T11:00:00.000Z',{notes:'newer cloud copy'})
 }];
 const result=model.mergeWorkoutRecords(local,remote,state);
 assert.equal(result.entries[0].notes,'newer cloud copy');
 assert.equal(result.uploads.length,0);
 assert.equal(result.pulledCount,1);
}

{
 const prior=[workout('updated','2026-08-17T10:00:00.000Z',{notes:'old'})];
 const current=[workout('updated','2026-08-17T11:00:00.000Z',{notes:'new device copy'})];
 const changed=model.recordLocalChanges(prior,current,null,'2026-08-17T12:00:00.000Z');
 const remote=[{entryId:'updated',changedAt:'2026-08-17T10:30:00.000Z',deleted:false,payload:prior[0]}];
 const result=model.mergeWorkoutRecords(current,remote,changed.state);
 assert.equal(result.entries[0].notes,'new device copy');
 assert.equal(result.uploads.length,1,'a newer local edit is queued for upload');
}

{
 const deleted=model.recordLocalChanges(
  [workout('deleted-local','2026-08-17T10:00:00.000Z')],
  [],
  null,
  '2026-08-17T12:00:00.000Z'
 );
 const remote=[{
  entryId:'deleted-local',changedAt:'2026-08-17T11:00:00.000Z',deleted:false,
  payload:workout('deleted-local','2026-08-17T10:00:00.000Z')
 }];
 const result=model.mergeWorkoutRecords([],remote,deleted.state);
 assert.equal(result.entries.length,0,'a newer local deletion cannot be resurrected by an older cloud copy');
 assert.equal(result.uploads[0].deleted,true,'the deletion is uploaded as a tombstone');
}

{
 const local=[workout('deleted-remote','2026-08-17T10:00:00.000Z')];
 const state=model.ensureStateForEntries(local,null);
 const remote=[{entryId:'deleted-remote',changedAt:'2026-08-17T12:00:00.000Z',deleted:true,payload:null}];
 const result=model.mergeWorkoutRecords(local,remote,state);
 assert.equal(result.entries.length,0,'a newer cloud tombstone removes the device copy');
 assert.equal(result.deletedCount,1);
}

{
 const prior=[workout('keep','2026-08-17T10:00:00.000Z'),workout('remove','2026-08-17T10:00:00.000Z')];
 const changed=model.recordLocalChanges(prior,[prior[0]],null,'2026-08-17T12:00:00.000Z');
 assert.equal(JSON.stringify(changed.changedIds),JSON.stringify(['remove']));
 assert.equal(changed.state.records.remove.deleted,true);
 assert.equal(changed.state.records.keep.deleted,false);
}

{
 const local=[workout('valid-local','2026-08-17T10:00:00.000Z')];
 const invalidRemote=[{entryId:'broken',changedAt:'2026-08-17T12:00:00.000Z',deleted:false,payload:null}];
 const result=model.mergeWorkoutRecords(local,invalidRemote,null);
 assert.equal(result.entries.length,1,'malformed cloud records do not displace valid local history');
 assert.equal(result.entries[0].id,'valid-local');
}

console.log('Cloud sync model tests passed.');
