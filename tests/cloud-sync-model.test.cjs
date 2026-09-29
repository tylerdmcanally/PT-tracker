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
 const sep27V1512Strength1=workout('synthetic-sep27-v1512-strength1','2026-09-27T18:00:00.000Z',{
  date:'2026-09-27',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.12',programEffectiveDate:'2026-09-23',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'63',sessionRpe:'7',painDuring:'0',notes:'Invented September 27 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'strengthUpperAft',sessionType:'primary',label:'Strength 1 — Upper Body and AFT Calisthenics',targetSessionRpe:'6–7',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 11',type:'body',sets:5,targetRpe:'6–8'},
   {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 8–10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–8',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'},
   {id:'chestSupportedRow',name:'Machine row',prescription:'110 lb displayed on the same confirmed machine/setup for 3 × 9',type:'weighted',unit:'lb',sets:3,targetRpe:'7–8',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row'}
  ]},
  exercises:[
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'11, 11, 11, 11, 11',rpe:'7',completed:true,notes:'Invented historical push-up result.'},
   {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',variationId:'seatedDumbbellPress',load:'25',sets:'3',reps:'9, 9, 9',rpe:'7',completed:true,notes:'Invented historical press result.'},
   {exerciseId:'chestSupportedRow',name:'Machine row',type:'weighted',unit:'lb',variation:'Machine row',variationId:'machineRow',load:'110',sets:'3',reps:'9, 9, 9',rpe:'7',completed:true,notes:'Invented historical row result.'}
  ]
 });
 const upload=model.mergeWorkoutRecords([sep27V1512Strength1],[],null).uploads[0];
 assert.deepEqual(upload.payload,sep27V1512Strength1,'Firebase upload preserves the complete invented September 27 v1.5.12 Strength 1 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-27T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],sep27V1512Strength1,'Firebase round trips preserve the immutable September 27 v1.5.12 snapshot and invented results');
 const historicalById=Object.fromEntries(pulled.entries[0].prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.equal(historicalById.handReleasePushups.prescription,'5 × 11');
 assert.equal(historicalById.overheadPress.prescription,'25 lb per hand for 3 × 8–10');
 assert.equal(historicalById.chestSupportedRow.prescription,'110 lb displayed on the same confirmed machine/setup for 3 × 9');
 assert.equal(historicalById.chestSupportedRow.targetLoad,undefined,'cloud persistence does not retrofit a universal machine-row target into history');
 assert.equal(pulled.entries[0].activeRunStage,'');
}

{
 const activeStrength1=workout('synthetic-v1513-strength1','2026-09-28T12:00:00.000Z',{
  date:'2026-09-28',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.13',programEffectiveDate:'2026-09-28',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'65',sessionRpe:'7',painDuring:'0',notes:'Invented current Strength 1 cloud fixture.',
  prescriptionSnapshot:{sessionKey:'strengthUpperAft',sessionType:'primary',label:'Strength 1 — Upper Body and AFT Calisthenics',targetSessionRpe:'6–7',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 12',type:'body',sets:5,targetRpe:'6–8'},
   {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–8',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'},
   {id:'chestSupportedRow',name:'Machine row',prescription:'110 lb displayed on the same confirmed machine/setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetRpe:'7–8',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row'}
  ]},
  exercises:[
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'12, 12, 12, 12, 12',rpe:'7',completed:true,notes:'Invented current push-up result.'},
   {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',variationId:'seatedDumbbellPress',load:'25',sets:'3',reps:'10, 10, 10',rpe:'8',completed:true,notes:'Invented current press result.'},
   {exerciseId:'chestSupportedRow',name:'Machine row',type:'weighted',unit:'lb',variation:'Machine row',variationId:'machineRow',load:'110',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Invented current row result.'}
  ]
 });
 const upload=model.mergeWorkoutRecords([activeStrength1],[],null).uploads[0];
 assert.deepEqual(upload.payload,activeStrength1,'Firebase upload preserves the complete invented current v1.5.13 Strength 1 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-28T13:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],activeStrength1,'Firebase round trips preserve the v1.5.13 Strength 1 snapshot and invented results');
 const activeById=Object.fromEntries(pulled.entries[0].prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.equal(activeById.handReleasePushups.prescription,'5 × 12');
 assert.equal(activeById.overheadPress.prescription,'25 lb per hand for 3 × 10');
 assert.equal(activeById.chestSupportedRow.prescription,'110 lb displayed on the same confirmed machine/setup for 3 × 10');
 assert.equal(activeById.chestSupportedRow.targetLoad,undefined,'the current setup-specific row cue does not become a universal load target in cloud storage');
 assert.equal(pulled.entries[0].activeRunStage,'');
}

{
 const sep29V1513Strength2=workout('synthetic-sep29-v1513-strength2','2026-09-29T18:00:00.000Z',{
  date:'2026-09-29',dayKey:'strengthHeavyCarry',dayLabel:'Strength 2 — Heavy Strength and Carries',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.13',programEffectiveDate:'2026-09-28',
  activeRunStage:'',targetSessionRpe:'6–8',duration:'66',sessionRpe:'7',painDuring:'0',notes:'Invented September 29 Strength 2 cloud fixture.',
  prescriptionSnapshot:{
   sessionKey:'strengthHeavyCarry',sessionType:'primary',label:'Strength 2 — Heavy Strength and Carries',
   focus:'Heavy strength and loaded carries without a post-lift run or arm accessories.',
   warmup:'5–8 minutes of easy cardio, dynamic hip and ankle preparation, then 2–4 progressive deadlift warm-up sets.',
   targetSessionRpe:'6–8',targetDuration:'Approximately 60–70 minutes',advancesPrimaryRotation:true,optional:false,
   exercises:[
    {id:'deadlift',name:'Trap-bar deadlift',prescription:'185 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:185,targetLoadVariation:'Trap / hex bar',targetRpe:'6–8',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},perSideVariations:['Trap / hex bar'],barWeightOptions:[45,55,60],coachingNotes:'Use the trap/hex bar when available. Hold 185 lb for a full-volume confirmation, maintain technically clean repetitions, do not pursue grinders, and do not make another load jump next cycle. Record the actual bar weight and plate weight per side; use another listed variation when equipment requires it. Future progression remains coach-directed and performance-based.'},
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 10',type:'body',sets:4,targetRpe:'5–7',coachingNotes:'Use four equal, technically clean, submaximal sets of 10 and stop before failure. This remains the lower-volume second weekly hand-release push-up exposure.'},
    {id:'squatOrLegPress',name:'Leg press',prescription:'160 lb on the same confirmed leg-press machine/setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:160,targetLoadVariation:'Leg press',variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press',targetRpe:'7',coachingNotes:'Complete all three sets cleanly at approximately RPE 7 on the same confirmed leg-press machine and setup, and do not increase the load again yet. Do not treat the displayed value as comparable on another leg-press variation or setup.'},
    {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'7–8',variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45},coachingNotes:'Use controlled repetitions and finish with approximately 2–3 technically good repetitions remaining.'},
    {id:'seatedRow',name:'Seated cable row',prescription:'154 lb displayed on the same cable setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:154,targetLoadVariation:'Seated cable row',targetRpe:'6–8',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row',coachingNotes:'Hold 154 lb displayed for confirmation only on the same seated cable-row setup. Do not treat the displayed stack value as directly comparable on another cable, pulley, or machine setup.'},
    {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:4,targetRpe:'6–8',variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry',coachingNotes:'Aim for approximately 40 yd per trip. Keep the current load and do not progress it while Strength 3 includes the SDC circuit.'},
    {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45'],coachingNotes:'Maintain clean front-plank technique throughout each set.'}
   ]
  },
  exercises:[
   {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',variationId:'trapBar',load:'70',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5',rpe:'7',completed:true,notes:'Invented historical deadlift result.'},
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'4',reps:'10, 10, 10, 10',rpe:'6',completed:true,notes:'Invented historical push-up result.'},
   {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Leg press',variationId:'unspecifiedLegPress',load:'160',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Invented historical leg-press result.'},
   {exerciseId:'horizontalPress',name:'Dumbbell bench press',type:'weighted',unit:'lb per hand',variation:'Dumbbell bench press',variationId:'dumbbellBenchPress',load:'40',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true,notes:'Invented historical bench result.'},
   {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',variationId:'seatedCableRow',load:'154',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Invented historical row result.'},
   {exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',variationId:'farmerCarry',load:'45',sets:'4',distance:'40',rpe:'7',completed:true,notes:'Invented historical carry result.'},
   {exerciseId:'plank',name:'Front plank',type:'timed',sets:'3',times:'45, 45, 45',rpe:'7',completed:true,notes:'Invented historical plank result.'}
  ]
 });
 const upload=model.mergeWorkoutRecords([sep29V1513Strength2],[],null).uploads[0];
 assert.deepEqual(upload.payload,sep29V1513Strength2,'Firebase upload preserves the complete invented September 29 v1.5.13 Strength 2 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-29T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],sep29V1513Strength2,'Firebase round trips preserve the immutable September 29 v1.5.13 snapshot and every invented result');
 const historicalById=Object.fromEntries(pulled.entries[0].prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.equal(historicalById.deadlift.targetLoad,185,'cloud persistence does not retrofit the new deadlift load into September 29 history');
 assert.equal(historicalById.seatedRow.targetLoad,154,'cloud persistence does not retrofit the new seated-row load into September 29 history');
 assert.deepEqual(historicalById.plank.prescribedTimes,['0:45','0:45','0:45'],'cloud persistence does not retrofit the new plank duration into September 29 history');
 assert.equal(pulled.entries[0].exercises.find(exercise=>exercise.exerciseId==='deadlift').load,'70','the invented historical plate-per-side result remains intact');
 assert.equal(pulled.entries[0].activeRunStage,'');
}

{
 const activeV1514Strength2=workout('synthetic-v1514-strength2','2026-09-30T18:00:00.000Z',{
  date:'2026-09-30',dayKey:'strengthHeavyCarry',dayLabel:'Strength 2 — Heavy Strength and Carries',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.14',programEffectiveDate:'2026-09-30',
  activeRunStage:'',targetSessionRpe:'6–8',duration:'68',sessionRpe:'7',painDuring:'0',notes:'Invented current v1.5.14 Strength 2 cloud fixture.',
  prescriptionSnapshot:{
   sessionKey:'strengthHeavyCarry',sessionType:'primary',label:'Strength 2 — Heavy Strength and Carries',
   focus:'Heavy strength and loaded carries without a post-lift run or arm accessories.',
   warmup:'5–8 minutes of easy cardio, dynamic hip and ankle preparation, then 2–4 progressive deadlift warm-up sets.',
   targetSessionRpe:'6–8',targetDuration:'Approximately 60–70 minutes',advancesPrimaryRotation:true,optional:false,
   exercises:[
    {id:'deadlift',name:'Trap-bar deadlift',prescription:'195 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:195,targetLoadVariation:'Trap / hex bar',targetRpe:'6–8',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},perSideVariations:['Trap / hex bar'],barWeightOptions:[45,55,60],coachingNotes:'Use the trap/hex bar when available. Hold 195 lb for confirmation before any later coach-directed increase. Keep every repetition technically clean and do not grind. Record the actual bar weight and plate weight per side; use another listed variation when equipment requires it. Future progression remains coach-directed and performance-based.'},
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 10',type:'body',sets:4,targetRpe:'5–7',coachingNotes:'Use four equal, technically clean, submaximal sets of 10 and stop before failure. This remains the lower-volume second weekly hand-release push-up exposure.'},
    {id:'squatOrLegPress',name:'Leg press',prescription:'160 lb on the same confirmed leg-press machine/setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:160,targetLoadVariation:'Leg press',variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press',targetRpe:'7',coachingNotes:'Complete all three sets cleanly at approximately RPE 7 on the same confirmed leg-press machine and setup, and do not increase the load again yet. Do not treat the displayed value as comparable on another leg-press variation or setup.'},
    {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'7–8',variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45},coachingNotes:'Use controlled repetitions and finish with approximately 2–3 technically good repetitions remaining.'},
    {id:'seatedRow',name:'Seated cable row',prescription:'Next smallest comparable increment above 154 lb displayed on the same cable setup (approximately 165 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetLoad:165,targetLoadVariation:'Seated cable row',targetRpe:'6–8',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row',coachingNotes:'Use the next smallest increment above 154 lb only on the same confirmed seated cable-row setup. Approximately 165 lb is setup-specific guidance, not a universal target for another cable, pulley, or machine. Hold the new increment for confirmation before any later progression.'},
    {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:4,targetRpe:'6–8',variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry',coachingNotes:'Aim for approximately 40 yd per trip. Keep the current load and do not progress it while Strength 3 includes the SDC circuit.'},
    {id:'plank',name:'Front plank',prescription:'3 × 50 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:50','0:50','0:50'],coachingNotes:'Maintain a clean position throughout and stop a set rather than extending through lumbar compensation.'}
   ]
  },
  exercises:[
   {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',variationId:'trapBar',load:'75',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5',rpe:'7',completed:true,notes:'Invented current deadlift result.'},
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'4',reps:'10, 10, 10, 10',rpe:'6',completed:true,notes:'Invented current push-up result.'},
   {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Leg press',variationId:'unspecifiedLegPress',load:'160',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Invented current leg-press result.'},
   {exerciseId:'horizontalPress',name:'Dumbbell bench press',type:'weighted',unit:'lb per hand',variation:'Dumbbell bench press',variationId:'dumbbellBenchPress',load:'40',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true,notes:'Invented current bench result.'},
   {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',variationId:'seatedCableRow',load:'165',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true,notes:'Invented current row result.'},
   {exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',variationId:'farmerCarry',load:'45',sets:'4',distance:'40',rpe:'7',completed:true,notes:'Invented current carry result.'},
   {exerciseId:'plank',name:'Front plank',type:'timed',sets:'3',times:'50, 50, 50',rpe:'7',completed:true,notes:'Invented current plank result.'}
  ]
 });
 const upload=model.mergeWorkoutRecords([activeV1514Strength2],[],null).uploads[0];
 assert.deepEqual(upload.payload,activeV1514Strength2,'Firebase upload preserves the complete invented current v1.5.14 Strength 2 document');
 const pulled=model.mergeWorkoutRecords([], [{...upload,changedAt:'2026-09-30T19:00:00.000Z'}], null);
 assert.deepEqual(pulled.entries[0],activeV1514Strength2,'Firebase round trips preserve the complete v1.5.14 Strength 2 snapshot and every invented result');
 const activeById=Object.fromEntries(pulled.entries[0].prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.equal(activeById.deadlift.targetLoad,195);
 assert.equal(activeById.deadlift.targetLoadVariation,'Trap / hex bar');
 assert.equal(activeById.seatedRow.targetLoad,165);
 assert.equal(activeById.seatedRow.targetLoadVariation,'Seated cable row');
 assert.deepEqual(activeById.plank.prescribedTimes,['0:50','0:50','0:50']);
 assert.equal(pulled.entries[0].exercises.find(exercise=>exercise.exerciseId==='deadlift').load,'75','the invented current plate-per-side result remains intact');
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
