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
 const sep18V159=workout('synthetic-sep18-v159-strength1','2026-09-18T18:00:00.000Z',{
  date:'2026-09-18',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.9',programEffectiveDate:'2026-09-17',
  activeRunStage:4,targetSessionRpe:'6–7',duration:'64',sessionRpe:'7',painDuring:'0',notes:'Invented September 18 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'strengthUpperAft',sessionType:'primary',label:'Strength 1 — Upper Body and AFT Calisthenics',targetSessionRpe:'6–7',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'30 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–9',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'}
  ]},
  exercises:[{exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'30',sets:'3',reps:'9, 9, 9',rpe:'8',completed:true,notes:'Invented historical press result.'}]
 });
 const upload=model.mergeWorkoutRecords([sep18V159],[],null).uploads[0];
 assert.deepEqual(upload.payload,sep18V159,'Firebase upload preserves the complete invented September 18 v1.5.9 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-18T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],sep18V159,'Firebase round trips preserve the invented v1.5.9 snapshot and results');
}

{
 const retiredRun=workout('synthetic-sep20-v1510-run1','2026-09-20T12:00:00.000Z',{
  date:'2026-09-20',dayKey:'runStageA',dayLabel:'Run 1 — Easy Aerobic Stage 4',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.10',programEffectiveDate:'2026-09-19',
  activeRunStage:4,targetSessionRpe:'4–5',duration:'27',sessionRpe:'4',painDuring:'0',notes:'Invented retired-session result.',
  prescriptionSnapshot:{sessionKey:'runStageA',sessionType:'primary',label:'Run 1 — Easy Aerobic Stage 4',targetSessionRpe:'4–5',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'runWalkIntervals',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'interval',runStage:4,targetRpe:'4–5'}
  ]},
  exercises:[{exerciseId:'runWalkIntervals',name:'Walk / run intervals',type:'interval',runStage:'4',walkMinutes:'1',runMinutes:'2.5',rounds:'6',completedRounds:'6',programmedIntervalTime:'21:00',totalTime:'24:00',rpe:'4',completed:true,notes:'Invented historical run result.'}]
 });
 const upload=model.mergeWorkoutRecords([retiredRun],[],null).uploads[0];
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-20T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],retiredRun,'Firebase round trips preserve the retired September 20 v1.5.10 Run 1 document');
 assert.equal(pulled.entries[0].activeRunStage,4,'historical AFT run-stage metadata remains intact');
 assert.equal(pulled.entries[0].exercises[0].programmedIntervalTime,'21:00');
 assert.equal(pulled.entries[0].exercises[0].totalTime,'24:00','cloud persistence does not conflate programmed and elapsed run time');
}

{
 const activeStrength=workout('synthetic-v1511-strength1','2026-09-21T12:00:00.000Z',{
  date:'2026-09-21',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.11',programEffectiveDate:'2026-09-21',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'62',sessionRpe:'7',painDuring:'0',notes:'Invented current strength result.',
  prescriptionSnapshot:{sessionKey:'strengthUpperAft',sessionType:'primary',label:'Strength 1 — Upper Body and AFT Calisthenics',targetSessionRpe:'6–7',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 11',type:'body',sets:5,targetRpe:'6–8'},
   {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 8–10',type:'weighted',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–8'}
  ]},
  exercises:[{exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'11, 11, 11, 11, 11',rpe:'7',completed:true,notes:'Invented current strength result.'}]
 });
 const upload=model.mergeWorkoutRecords([activeStrength],[],null).uploads[0];
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-21T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],activeStrength,'Firebase round trips preserve a v1.5.11 strength document without an active AFT run stage');
 assert.equal(pulled.entries[0].activeRunStage,'');
}

{
 const sep22V1511=workout('synthetic-sep22-v1511-strength2','2026-09-22T18:00:00.000Z',{
  date:'2026-09-22',dayKey:'strengthHeavyCarry',dayLabel:'Strength 2 — Heavy Strength and Carries',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.11',programEffectiveDate:'2026-09-21',
  activeRunStage:'',targetSessionRpe:'6–8',duration:'67',sessionRpe:'7',painDuring:'0',notes:'Invented September 22 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'strengthHeavyCarry',sessionType:'primary',label:'Strength 2 — Heavy Strength and Carries',targetSessionRpe:'6–8',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'deadlift',name:'Trap-bar deadlift',prescription:'175 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:175,targetLoadVariation:'Trap / hex bar',targetRpe:'6–8',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar'},
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 9',type:'body',sets:4,targetRpe:'5–7'},
   {id:'squatOrLegPress',name:'Leg press',prescription:'Next smallest comparable increment above 140 lb on the same machine/setup for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'7',variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press'},
   {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'7–8'},
   {id:'seatedRow',name:'Seated cable row',prescription:'132 lb displayed on the same cable setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetRpe:'6–8',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'},
   {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:4,targetRpe:'6–8'},
   {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']}
  ]},
  exercises:[
   {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',variationId:'trapBar',load:'70',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5',rpe:'7',completed:true},
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'4',reps:'9, 9, 9, 9',rpe:'6',completed:true},
   {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Leg press',variationId:'unspecifiedLegPress',load:'160',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true},
   {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',variationId:'seatedCableRow',load:'154',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true}
  ]
 });
 const upload=model.mergeWorkoutRecords([sep22V1511],[],null).uploads[0];
 assert.deepEqual(upload.payload,sep22V1511,'Firebase upload preserves the complete invented September 22 v1.5.11 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-22T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],sep22V1511,'Firebase round trips preserve the immutable September 22 v1.5.11 snapshot and invented results');
 assert.equal(pulled.entries[0].prescriptionSnapshot.exercises.find(exercise=>exercise.id==='squatOrLegPress').targetLoad,undefined,'cloud persistence does not retrofit the active leg-press target into history');
 assert.equal(pulled.entries[0].prescriptionSnapshot.exercises.find(exercise=>exercise.id==='seatedRow').targetLoad,undefined,'cloud persistence does not retrofit the active row target into history');
}

{
 const activeStrength2=workout('synthetic-v1512-strength2','2026-09-23T12:00:00.000Z',{
  date:'2026-09-23',dayKey:'strengthHeavyCarry',dayLabel:'Strength 2 — Heavy Strength and Carries',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.12',programEffectiveDate:'2026-09-23',
  activeRunStage:'',targetSessionRpe:'6–8',duration:'64',sessionRpe:'7',painDuring:'0',notes:'Invented current Strength 2 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'strengthHeavyCarry',sessionType:'primary',label:'Strength 2 — Heavy Strength and Carries',targetSessionRpe:'6–8',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'deadlift',name:'Trap-bar deadlift',prescription:'185 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:185,targetLoadVariation:'Trap / hex bar',targetRpe:'6–8',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar'},
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 10',type:'body',sets:4,targetRpe:'5–7'},
   {id:'squatOrLegPress',name:'Leg press',prescription:'160 lb on the same confirmed leg-press machine/setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:160,targetLoadVariation:'Leg press',targetRpe:'7',variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press'},
   {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'7–8'},
   {id:'seatedRow',name:'Seated cable row',prescription:'154 lb displayed on the same cable setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:154,targetLoadVariation:'Seated cable row',targetRpe:'6–8',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'},
   {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:4,targetRpe:'6–8'},
   {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']}
  ]},
  exercises:[
   {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',variationId:'trapBar',load:'70',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5',rpe:'7',completed:true},
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'4',reps:'10, 10, 10, 10',rpe:'6',completed:true},
   {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Leg press',variationId:'unspecifiedLegPress',load:'160',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true},
   {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',variationId:'seatedCableRow',load:'154',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true}
  ]
 });
 const upload=model.mergeWorkoutRecords([activeStrength2],[],null).uploads[0];
 assert.deepEqual(upload.payload,activeStrength2,'Firebase upload preserves the complete invented current v1.5.12 Strength 2 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-23T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],activeStrength2,'Firebase round trips preserve the v1.5.12 Strength 2 snapshot and invented results');
 assert.equal(pulled.entries[0].activeRunStage,'');
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
