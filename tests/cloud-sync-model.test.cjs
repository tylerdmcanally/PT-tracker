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

const syntheticStrength3V1514Snapshot={
 sessionKey:'strengthLowerSdc',sessionType:'primary',label:'Strength 3 — Lower / Full Body and SDC',
 focus:'Lower and full-body strength followed by the capped two-round SDC circuit and trunk work.',
 warmup:'Approximately 10 progressive minutes: easy cardio, dynamic hip and ankle preparation, then 2–4 Romanian-deadlift warm-up sets.',
 targetSessionRpe:'7–8',targetDuration:'Approximately 60–75 minutes',advancesPrimaryRotation:true,optional:false,
 exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'155 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:155,targetLoadVariation:'Barbell',targetRpe:'6–8',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{Barbell:45,'Smith machine':20},coachingNotes:'Hold 155 lb for confirmation. Use chalk if available, maintain clean hinge technique, and do not progress again until 155 lb has been completed cleanly within the target effort range. No grinders.'},
  {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat',targetRpe:'7–8',variations:['Goblet squat','Front squat','Hack squat','Leg press'],defaultVariation:'Goblet squat',barWeights:{'Front squat':45},coachingNotes:'Hold the goblet-squat load and repetitions while the Romanian deadlift progresses, and preserve leg quality for the conditioning circuit.'},
  {id:'inclinePress',name:'Incline dumbbell press',prescription:'35 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:35,targetLoadVariation:'Incline dumbbell press',targetRpe:'7–8',variations:['Incline dumbbell press','Incline chest-press machine'],defaultVariation:'Incline dumbbell press',coachingNotes:'Repeat 35 lb per hand until all three sets of 9 are completed cleanly. Do not increase load or add make-up repetitions. Use adequate rest and stop before grinding or technical failure.'},
  {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'50 lb for 3 × 9 each side',type:'weighted',unit:'lb',sets:3,targetLoad:50,targetLoadVariation:'One-arm dumbbell row',targetRpe:'6–8',variations:['One-arm dumbbell row','One-arm cable row'],defaultVariation:'One-arm dumbbell row',coachingNotes:'Progress repetitions at the confirmed 50 lb load. Keep both sides technically clean and do not increase load yet.'},
  {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 12 each leg with a 3-second descent and 1-second pause',type:'weighted',unit:'lb total',sets:2,targetRpe:'5–7',variations:['Body-weight split squat','Light dumbbell split squat','Forward step-up','Lateral step-up'],defaultVariation:'Body-weight split squat',coachingNotes:'Use body weight for two sets of 12 each leg with a deliberate 3-second descent and 1-second pause at the bottom of every repetition. This is a tempo and quality progression only; do not add external load or extra repetitions.'},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4.5',targetRpe:'7–8',defaults:{carryLoad:'45',carrySeconds:'30',stepReps:'6',intervalSeconds:'30',restSeconds:'150'},modalities:['Bike','Rower','Elliptical','Short safe sprint'],coachingNotes:'Keep exactly two rounds. Use the Torque Fitness TANK M4 at Level 3 on the same approximately 20-yard gym lane when available, and record that equipment label in the existing sled fields. Level 3 is a resistance setting, not a weight. Do not use total circuit time to auto-progress, add a third round, extend hard-cardio duration, or increase TANK resistance.'},
  {id:'plank',name:'Front plank',prescription:'3 × 50 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:50','0:50','0:50'],coachingNotes:'Maintain a clean position and stop a set rather than extending through lumbar compensation.'},
  {id:'sidePlank',name:'Side plank',prescription:'3 × 50 sec each side',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:50','0:50','0:50'],coachingNotes:'Maintain a clean position and stop a set rather than extending through lumbar or hip-position compensation.'},
  {id:'hammerCurl',name:'Hammer curl',prescription:'25 lb per hand for 2 × 15',type:'weighted',unit:'lb per hand',sets:2,targetLoad:25,targetLoadVariation:'Dumbbell hammer curl',targetRpe:'7–9',variations:['Dumbbell hammer curl','Rope cable hammer curl'],defaultVariation:'Dumbbell hammer curl',variationUnits:{'Dumbbell hammer curl':'lb per hand','Rope cable hammer curl':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Use 25 lb per hand for two controlled sets of 15. Progress repetitions at the confirmed working load and do not increase load yet.'},
  {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'110 lb displayed on the same confirmed rope/cable setup for 2 × 12',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',variations:['Rope overhead cable extension','Single-arm overhead cable extension','Other equivalent cable variation'],defaultVariation:'Rope overhead cable extension',variationUnits:{'Rope overhead cable extension':'lb total','Single-arm overhead cable extension':'lb per side','Other equivalent cable variation':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Use 110 lb displayed only on the same confirmed rope and cable setup for two sets of 12. Progress repetitions at this confirmed displayed load before another stack increase. Do not transfer the displayed value to another cable, pulley, attachment, or machine setup. Keep a pain-free shoulder position and controlled stretch.'}
 ]
};

const syntheticStrength3V1515Snapshot=JSON.parse(JSON.stringify(syntheticStrength3V1514Snapshot));
Object.assign(syntheticStrength3V1515Snapshot.exercises.find(exercise=>exercise.id==='inclinePress'),{
 prescription:'35 lb per hand for 3 × 10',
 coachingNotes:'Confirm all three technically clean sets of 10 at the current load before any later load increase. Use normal rest and stop before grinding or technical failure. Do not add make-up repetitions.'
});
Object.assign(syntheticStrength3V1515Snapshot.exercises.find(exercise=>exercise.id==='oneArmRow'),{
 prescription:'50 lb for 3 × 10 each side',
 coachingNotes:'Progress repetitions at the confirmed 50 lb load. Keep both sides technically clean and do not increase load yet.'
});
Object.assign(syntheticStrength3V1515Snapshot.exercises.find(exercise=>exercise.id==='plank'),{
 prescription:'3 × 55 sec',prescribedTimes:['0:55','0:55','0:55']
});
Object.assign(syntheticStrength3V1515Snapshot.exercises.find(exercise=>exercise.id==='overheadTricepsExtension'),{
 prescription:'Next smallest comparable increment above 110 lb displayed on the same confirmed rope/cable setup (approximately 121 lb displayed if it uses 11-lb increments) for 2 × 10–12',
 coachingNotes:'Use the next smallest increment above 110 lb only on the same confirmed rope, cable, pulley, and machine setup. Approximately 121 lb is setup-specific guidance, not a transferable load. Maintain a pain-free shoulder position and controlled stretch, and hold the new increment for confirmation before any later progression.'
});

const syntheticStrength3V1517Snapshot=JSON.parse(JSON.stringify(syntheticStrength3V1515Snapshot));

const syntheticStrength3V1518Snapshot=JSON.parse(JSON.stringify(syntheticStrength3V1517Snapshot));
Object.assign(syntheticStrength3V1518Snapshot.exercises.find(exercise=>exercise.id==='sidePlank'),{
 prescription:'3 × 55 sec each side',prescribedTimes:['0:55','0:55','0:55'],
 coachingNotes:'Maintain a clean hip and lumbar position and stop a set rather than extending through compensation.'
});
Object.assign(syntheticStrength3V1518Snapshot.exercises.find(exercise=>exercise.id==='hammerCurl'),{
 prescription:'Next smallest comparable dumbbell increment above 25 lb per hand (expected 30 lb per hand if available) for 2 × 10–12',targetLoad:30,
 coachingNotes:'Use the next smallest increment only for the same dumbbell variation, keep repetitions controlled, and hold the new load for confirmation. Do not transfer 30 lb per hand to the rope-cable variation.'
});

const syntheticStrength3Results=({inclineReps,rowReps,plankTimes,tricepsLoad,tricepsReps,sidePlankTimes='50, 50, 50',hammerLoad='25',hammerReps='15, 15'})=>[
 {exerciseId:'romanianDeadlift',name:'Romanian deadlift',type:'weighted',unit:'lb',variation:'Barbell',load:'155',sets:'2',reps:'8, 8',rpe:'7',completed:true,notes:'Invented hinge result.'},
 {exerciseId:'squatPattern',name:'Goblet squat',type:'weighted',unit:'lb',variation:'Goblet squat',load:'55',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Invented squat result.'},
 {exerciseId:'inclinePress',name:'Incline dumbbell press',type:'weighted',unit:'lb per hand',variation:'Incline dumbbell press',load:'35',sets:'3',reps:inclineReps,rpe:'7',completed:true,notes:'Invented incline-press result.'},
 {exerciseId:'oneArmRow',name:'One-arm dumbbell row',type:'weighted',unit:'lb',variation:'One-arm dumbbell row',load:'50',sets:'3',reps:rowReps,rpe:'7',completed:true,notes:'Invented one-arm-row result.'},
 {exerciseId:'singleLegStrength',name:'Split squat',type:'weighted',unit:'lb total',variation:'Body-weight split squat',sets:'2',reps:'12, 12',rpe:'6',completed:true,notes:'Invented tempo split-squat result.'},
 {exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.4.5',rounds:'2',rpe:'7',completed:true,notes:'Invented two-round SDC result.',components:[
  {id:'farmerCarry',exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',resultMode:'shared',sharedResult:{performed:true,load:'45',loadUnit:'lb per hand',durationSeconds:'30'}},
  {id:'lateralStepUps',exerciseId:'lateralStepUps',name:'Lateral step-ups',type:'reps',resultMode:'shared',sharedResult:{performed:true,repsPerSide:'6'}},
  {id:'hardCardio',exerciseId:'hardCardio',name:'Hard cardio',type:'cardio',resultMode:'shared',sharedResult:{performed:true,modality:'Bike',durationSeconds:'30'}},
  {id:'backwardSledDrag',exerciseId:'backwardSledDrag',name:'Backward sled drag',type:'sled',resultMode:'shared',sharedResult:{performed:true,trips:'1',distanceMode:'lane_unknown',distanceLabel:'Approximately 20 yd gym lane',equipmentLabel:'Torque Fitness TANK M4 · Level 3',direction:'backward_drag',loadMode:'unknown'}},
  {id:'forwardSledPush',exerciseId:'forwardSledPush',name:'Forward sled push',type:'sled',resultMode:'shared',sharedResult:{performed:true,trips:'1',distanceMode:'lane_unknown',distanceLabel:'Approximately 20 yd gym lane',equipmentLabel:'Torque Fitness TANK M4 · Level 3',direction:'forward_push',loadMode:'unknown'}},
  {id:'rest',exerciseId:'circuitRest',name:'Rest',type:'rest',resultMode:'shared',sharedResult:{performed:true,durationSeconds:'150'}}
 ]},
 {exerciseId:'plank',name:'Front plank',type:'timed',sets:'3',times:plankTimes,rpe:'7',completed:true,notes:'Invented front-plank result.'},
 {exerciseId:'sidePlank',name:'Side plank',type:'timed',sets:'3',times:sidePlankTimes,rpe:'7',completed:true,notes:'Invented side-plank result.'},
 {exerciseId:'hammerCurl',name:'Hammer curl',type:'weighted',unit:'lb per hand',variation:'Dumbbell hammer curl',load:hammerLoad,sets:'2',reps:hammerReps,rpe:'8',completed:true,notes:'Invented hammer-curl result.'},
 {exerciseId:'overheadTricepsExtension',name:'Overhead cable triceps extension',type:'weighted',unit:'lb total',variation:'Rope overhead cable extension',load:tricepsLoad,sets:'2',reps:tricepsReps,rpe:'8',completed:true,notes:'Invented same-setup triceps result.'}
];

const syntheticStrength1V1515Snapshot={
 sessionKey:'strengthUpperAft',sessionType:'primary',label:'Strength 1 — Upper Body and AFT Calisthenics',
 focus:'Upper-body strength and AFT calisthenics with optional arm accessories. No cardio or running follows this session.',
 warmup:'5–8 minutes of easy cardio, shoulder and upper-back movement preparation, then 1–2 easy push-up and pull ramp-up sets.',
 targetSessionRpe:'6–7',targetDuration:'Approximately 60–75 minutes',advancesPrimaryRotation:true,optional:false,
 exercises:[
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 12',type:'body',sets:5,targetRpe:'6–8',coachingNotes:'Keep all five sets equal, technically clean, and submaximal. Maintain strong whole-body bracing, stop before failure, and do not add a maximal set.'},
  {id:'verticalPull',name:'Lat pulldown',prescription:'Next smallest increment above 176 lb on the same seated machine (approximately 187 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'6–8',variations:['Seated lat pulldown','Modified standing lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Seated lat pulldown',coachingNotes:'Use the next smallest machine increment above 176 lb only on the same seated machine and setup. Approximately 187 lb is guidance for an 11-lb stack increment, not a universal target for a different cable or pulley setup. Cap every set at 10 repetitions.'},
  {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–8',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press',coachingNotes:'Hand-release push-ups remain the AFT-priority first movement. Confirm all three clean sets of 10 behind the new 5 × 12 hand-release push-up dose. Do not add make-up repetitions, grind, or train to failure. The prior eligibility gate for a later 30 lb-per-hand return has been met, but do not return to 30 lb per hand until the larger hand-release push-up dose is tolerated and a later coach-directed program version explicitly authorizes it.'},
  {id:'chestSupportedRow',name:'Machine row',prescription:'110 lb displayed on the same confirmed machine/setup for 3 × 10',type:'weighted',unit:'lb',sets:3,targetRpe:'7–8',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row',coachingNotes:'Use 110 lb displayed only on the same confirmed machine and setup for three clean sets of 10. Do not treat 110 lb as comparable on another row machine, and do not increase the displayed load yet.'},
  {id:'lateralRaise',name:'Cable lateral raise',prescription:'Next smallest comparable increment above 33 lb displayed per side on the same pain-free cable setup (approximately 44 lb if applicable) for 2 × 12–15',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–8',variations:['Cable lateral raise','Cuffed-cable lateral raise','Machine lateral raise','Dumbbell lateral raise'],defaultVariation:'Cable lateral raise',variationUnits:{'Cable lateral raise':'lb per side','Cuffed-cable lateral raise':'lb per side','Machine lateral raise':'lb total','Dumbbell lateral raise':'lb per hand'},coachingNotes:'Use the next smallest comparable increment above 33 lb displayed per side only on the same pain-free cable setup. Approximately 44 lb is setup-specific guidance, not a universal target. Maintain pain-free technique.'},
  {id:'chestFly',name:'Cable fly / pec deck',prescription:'Next smallest comparable increment above 77 lb displayed on the same pec-deck machine/setup (approximately 88 lb if applicable) for 2 × 10–12',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–9',variations:['Pec deck / machine fly','Cable chest fly'],defaultVariation:'Pec deck / machine fly',variationUnits:{'Cable chest fly':'lb per side','Pec deck / machine fly':'lb total'},coachingNotes:'Use the next smallest comparable increment above 77 lb displayed only on the same pec-deck machine and setup. Approximately 88 lb is setup-specific guidance. Keep the stretch and contraction controlled and stop with approximately 1–3 good repetitions in reserve.'},
  {id:'trunkStability',name:'Dead bug or Pallof press',prescription:'3 × 10 each side',type:'body',sets:3,variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug',coachingNotes:'Keep the movement slow and controlled. Use a full exhale and deliberate brace rather than increasing repetitions because the current variation feels easy.'},
  {id:'preacherCurl',name:'Preacher curl',prescription:'30 lb total on the same EZ-bar setup, or the next smallest comparable load below 40 lb if 30 lb is unavailable, for 2 × 10–15',type:'weighted',unit:'lb total',sets:2,targetLoad:30,targetLoadVariation:'EZ-bar preacher curl',targetRpe:'7–9',variations:['Machine preacher curl','EZ-bar preacher curl','Dumbbell preacher curl','Cable preacher curl'],defaultVariation:'EZ-bar preacher curl',variationUnits:{'Machine preacher curl':'lb total','EZ-bar preacher curl':'lb total','Dumbbell preacher curl':'lb per hand','Cable preacher curl':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Use 30 lb total on the same EZ-bar setup when available; otherwise use the next smallest comparable load below 40 lb. Other variations are not directly load-comparable. Use controlled full repetitions and return to 40 lb only after a future coach-directed progression.'},
  {id:'tricepsPressdown',name:'Cable triceps pressdown',prescription:'Next smallest comparable increment above 77 lb displayed on the same cable setup (approximately 88 lb displayed if it uses 11-lb increments) for 2 × 10–12',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',group:'armSuperset',optional:true,coachingNotes:'Use the next smallest increment above 77 lb only on the same comparable machine and cable setup. Approximately 88 lb is guidance for the same 11-lb increment stack, not a universal cable load. Progression remains coach-directed.'}
 ]
};

const syntheticStrength1V1516Snapshot=JSON.parse(JSON.stringify(syntheticStrength1V1515Snapshot));
Object.assign(syntheticStrength1V1516Snapshot.exercises.find(exercise=>exercise.id==='overheadPress'),{
 prescription:'30 lb per hand for 3 × 8',targetLoad:30,
 coachingNotes:'Hand-release push-ups remain the AFT-priority first movement. Use controlled, technically clean, submaximal repetitions. Do not add make-up repetitions, grind, or train to failure. Hold 30 lb per hand for confirmation before any later repetition or load progression.'
});
Object.assign(syntheticStrength1V1516Snapshot.exercises.find(exercise=>exercise.id==='chestSupportedRow'),{
 prescription:'Next smallest comparable increment above 110 lb displayed on the same confirmed machine/setup (approximately 121 lb displayed if it uses 11-lb increments) for 3 × 8–10',
 coachingNotes:'Use the next increment above 110 lb only on the same confirmed machine and setup. Approximately 121 lb is setup-specific guidance, not a transferable load. Hold the new increment for confirmation before any later progression.'
});

const syntheticStrength1V1517Snapshot=JSON.parse(JSON.stringify(syntheticStrength1V1516Snapshot));
Object.assign(syntheticStrength1V1517Snapshot.exercises.find(exercise=>exercise.id==='handReleasePushups'),{
 prescription:'Set 1: 15 continuous reps; Sets 2–5: 10 reps',
 prescribedReps:[15,10,10,10,10],
 targetRpe:'Set 1 ≤8; sets 2–5 6–7',
 coachingNotes:'Use controlled test-standard repetitions. Complete set 1 continuously without an in-set rest and stop at 15; stop the set rather than pausing to finish, grinding, or reaching technical failure. Rest 3 minutes after set 1, then rest 90–120 seconds between sets 2–5. Do not add a maximal set, extra repetitions, or a skill microdose. Future progression applies only to set 1 and remains coach-directed after a clean response at no more than RPE 8.'
});

const syntheticStrength1Results=({overheadLoad,overheadReps,rowLoad,rowReps,pushupReps='12, 12, 12, 12, 12',pushupRpe='7'})=>[
 {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:pushupReps,rpe:pushupRpe,completed:true,notes:'Invented clean push-up result.'},
 {exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Seated lat pulldown',variationId:'seatedLatPulldown',load:'187',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true,notes:'Invented same-machine pulldown result.'},
 {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',variationId:'seatedDumbbellPress',load:overheadLoad,sets:'3',reps:overheadReps,rpe:'7',completed:true,notes:'Invented overhead-press result.'},
 {exerciseId:'chestSupportedRow',name:'Machine row',type:'weighted',unit:'lb',variation:'Machine row',variationId:'machineRow',load:rowLoad,sets:'3',reps:rowReps,rpe:'7',completed:true,notes:'Invented same-machine row result.'},
 {exerciseId:'lateralRaise',name:'Cable lateral raise',type:'weighted',unit:'lb per side',variation:'Cable lateral raise',variationId:'cableLateralRaise',load:'44',sets:'2',reps:'12, 12',rpe:'7',completed:true,notes:'Invented same-setup lateral-raise result.'},
 {exerciseId:'chestFly',name:'Cable fly / pec deck',type:'weighted',unit:'lb total',variation:'Pec deck / machine fly',variationId:'pecDeckMachineFly',load:'88',sets:'2',reps:'10, 10',rpe:'8',completed:true,notes:'Invented same-machine fly result.'},
 {exerciseId:'trunkStability',name:'Dead bug or Pallof press',type:'body',variation:'Dead bug',variationId:'deadBug',sets:'3',reps:'10, 10, 10',rpe:'6',completed:true,notes:'Invented trunk-stability result.'},
 {exerciseId:'preacherCurl',name:'Preacher curl',type:'weighted',unit:'lb total',variation:'EZ-bar preacher curl',variationId:'ezBarPreacherCurl',load:'30',sets:'2',reps:'12, 12',rpe:'8',completed:true,notes:'Invented same-setup curl result.'},
 {exerciseId:'tricepsPressdown',name:'Cable triceps pressdown',type:'weighted',unit:'lb total',load:'88',sets:'2',reps:'10, 10',rpe:'8',completed:true,notes:'Invented same-cable pressdown result.'}
];

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
 const oct6V1516Strength2=JSON.parse(JSON.stringify(activeV1514Strength2));
 Object.assign(oct6V1516Strength2,{
  id:'synthetic-oct6-v1516-strength2',date:'2026-10-06',updatedAt:'2026-10-06T18:00:00.000Z',programVersion:'1.5.16',programEffectiveDate:'2026-10-05',
  notes:'Invented October 6 v1.5.16 Strength 2 cloud fixture.'
 });
 const uploads=model.mergeWorkoutRecords([activeV1514Strength2,oct6V1516Strength2],[],null).uploads;
 assert.deepEqual(uploads.find(upload=>upload.entryId===activeV1514Strength2.id).payload,activeV1514Strength2,'Firebase upload preserves the complete invented current v1.5.14 Strength 2 document');
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct6V1516Strength2.id).payload,oct6V1516Strength2,'Firebase upload preserves the complete invented October 6 v1.5.16 Strength 2 document');
 const remote=uploads.map(upload=>({...upload,changedAt:upload.entryId===activeV1514Strength2.id?'2026-09-30T19:00:00.000Z':'2026-10-06T19:00:00.000Z'}));
 const pulled=model.mergeWorkoutRecords([],remote,null).entries;
 assert.deepEqual(pulled.find(entry=>entry.id===activeV1514Strength2.id),activeV1514Strength2,'Firebase round trips preserve the complete v1.5.14 Strength 2 snapshot and every invented result');
 const oct6Historical=pulled.find(entry=>entry.id===oct6V1516Strength2.id);
 assert.deepEqual(oct6Historical,oct6V1516Strength2,'Firebase round trips preserve the immutable October 6 v1.5.16 Strength 2 snapshot and every invented result');
 const activeById=Object.fromEntries(oct6Historical.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.equal(activeById.deadlift.targetLoad,195);
 assert.equal(activeById.deadlift.targetLoadVariation,'Trap / hex bar');
 assert.equal(activeById.seatedRow.targetLoad,165);
 assert.equal(activeById.seatedRow.targetLoadVariation,'Seated cable row');
 assert.deepEqual(activeById.plank.prescribedTimes,['0:50','0:50','0:50']);
 assert.equal(oct6Historical.exercises.find(exercise=>exercise.exerciseId==='deadlift').load,'75','the invented October 6 plate-per-side result remains intact');
 assert.equal(oct6Historical.exercises.find(exercise=>exercise.exerciseId==='handReleasePushups').reps,'10, 10, 10, 10','the invented October 6 lower-volume push-up result remains intact');
 assert.equal(oct6Historical.activeRunStage,'');
}

{
 const oct1V1514Strength3=workout('synthetic-oct1-v1514-strength3','2026-10-01T18:00:00.000Z',{
  date:'2026-10-01',dayKey:'strengthLowerSdc',dayLabel:'Strength 3 — Lower / Full Body and SDC',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.14',programEffectiveDate:'2026-09-30',
  activeRunStage:'',targetSessionRpe:'7–8',duration:'71',sessionRpe:'7',painDuring:'0',notes:'Invented October 1 v1.5.14 Strength 3 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength3V1514Snapshot)),
  exercises:syntheticStrength3Results({inclineReps:'9, 9, 9',rowReps:'9, 9, 9',plankTimes:'50, 50, 50',tricepsLoad:'110',tricepsReps:'12, 12'})
 });
 const oct2V1515Strength3=workout('synthetic-oct2-v1515-strength3','2026-10-02T18:00:00.000Z',{
  date:'2026-10-02',dayKey:'strengthLowerSdc',dayLabel:'Strength 3 — Lower / Full Body and SDC',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.15',programEffectiveDate:'2026-10-02',
  activeRunStage:'',targetSessionRpe:'7–8',duration:'72',sessionRpe:'7',painDuring:'0',notes:'Invented October 2 v1.5.15 Strength 3 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength3V1515Snapshot)),
  exercises:syntheticStrength3Results({inclineReps:'10, 10, 10',rowReps:'10, 10, 10',plankTimes:'55, 55, 55',tricepsLoad:'121',tricepsReps:'10, 10'})
 });
 const uploads=model.mergeWorkoutRecords([oct1V1514Strength3,oct2V1515Strength3],[],null).uploads;
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct1V1514Strength3.id).payload,oct1V1514Strength3,'Firebase upload preserves the complete invented October 1 v1.5.14 Strength 3 document');
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct2V1515Strength3.id).payload,oct2V1515Strength3,'Firebase upload preserves the complete invented October 2 v1.5.15 Strength 3 document');
 const remote=uploads.map(upload=>({...upload,changedAt:upload.entryId===oct1V1514Strength3.id?'2026-10-01T19:00:00.000Z':'2026-10-02T19:00:00.000Z'}));
 const pulled=model.mergeWorkoutRecords([],remote,null).entries;
 const historical=pulled.find(entry=>entry.id===oct1V1514Strength3.id);
 const current=pulled.find(entry=>entry.id===oct2V1515Strength3.id);
 assert.deepEqual(historical,oct1V1514Strength3,'Firebase round trips preserve the immutable October 1 v1.5.14 Strength 3 snapshot and every invented result');
 assert.deepEqual(current,oct2V1515Strength3,'Firebase round trips preserve the complete October 2 v1.5.15 Strength 3 snapshot and every invented result');

 const historicalById=Object.fromEntries(historical.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const currentById=Object.fromEntries(current.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 assert.deepEqual(historical.prescriptionSnapshot.exercises.map(exercise=>exercise.id),[
  'romanianDeadlift','squatPattern','inclinePress','oneArmRow','singleLegStrength','gymConditioningCircuit','plank','sidePlank','hammerCurl','overheadTricepsExtension'
 ],'the historical fixture contains every Strength 3 and SDC exercise in stable order');
 assert.deepEqual(current.prescriptionSnapshot.exercises.map(exercise=>exercise.id),historical.prescriptionSnapshot.exercises.map(exercise=>exercise.id),'the current fixture preserves every Strength 3 and SDC stable exercise ID');

 assert.equal(historicalById.inclinePress.prescription,'35 lb per hand for 3 × 9');
 assert.equal(historicalById.oneArmRow.prescription,'50 lb for 3 × 9 each side');
 assert.deepEqual(historicalById.plank.prescribedTimes,['0:50','0:50','0:50']);
 assert.equal(historicalById.overheadTricepsExtension.prescription,'110 lb displayed on the same confirmed rope/cable setup for 2 × 12');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='inclinePress').reps,'9, 9, 9','invented October 1 incline-press results remain unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='oneArmRow').reps,'9, 9, 9','invented October 1 row results remain unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='plank').times,'50, 50, 50','invented October 1 plank results remain unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='overheadTricepsExtension').load,'110','invented October 1 same-setup triceps results remain unchanged');

 assert.equal(currentById.inclinePress.prescription,'35 lb per hand for 3 × 10');
 assert.equal(currentById.inclinePress.targetLoad,35);
 assert.equal(currentById.inclinePress.targetLoadVariation,'Incline dumbbell press');
 assert.equal(currentById.oneArmRow.prescription,'50 lb for 3 × 10 each side');
 assert.equal(currentById.oneArmRow.targetLoad,50);
 assert.equal(currentById.oneArmRow.targetLoadVariation,'One-arm dumbbell row');
 assert.deepEqual(currentById.plank.prescribedTimes,['0:55','0:55','0:55']);
 assert.match(currentById.overheadTricepsExtension.prescription,/next smallest comparable increment above 110 lb.*approximately 121 lb.*2 × 10–12/i);
 assert.equal(currentById.overheadTricepsExtension.targetLoad,undefined,'setup-specific cable guidance is not stored as a universal target load');
 assert.match(currentById.overheadTricepsExtension.coachingNotes,/same confirmed rope, cable, pulley, and machine setup.*not a transferable load.*hold the new increment for confirmation/i);
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='inclinePress').reps,'10, 10, 10');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='oneArmRow').reps,'10, 10, 10');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='plank').times,'55, 55, 55');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='overheadTricepsExtension').load,'121');

 for(const exerciseId of ['romanianDeadlift','squatPattern','singleLegStrength','gymConditioningCircuit','sidePlank','hammerCurl']){
  assert.deepEqual(currentById[exerciseId],historicalById[exerciseId],`${exerciseId} remains unchanged between the invented v1.5.14 and v1.5.15 snapshots`);
 }
 const historicalCircuit=historical.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
 const currentCircuit=current.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
 assert.deepEqual(currentCircuit,historicalCircuit,'the complete invented two-round SDC result remains unchanged');
 assert.equal(currentCircuit.rounds,'2');
 assert.equal(currentCircuit.components.length,6);
 assert.match(currentCircuit.components.find(component=>component.id==='backwardSledDrag').sharedResult.equipmentLabel,/TANK M4 · Level 3/);
 assert.equal(historical.activeRunStage,'');
 assert.equal(current.activeRunStage,'');
}

{
 const oct8V1517Strength3=workout('synthetic-oct8-v1517-strength3','2026-10-08T18:00:00.000Z',{
  date:'2026-10-08',dayKey:'strengthLowerSdc',dayLabel:'Strength 3 — Lower / Full Body and SDC',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.17',programEffectiveDate:'2026-10-07',
  activeRunStage:'',targetSessionRpe:'7–8',duration:'64',sessionRpe:'7',painDuring:'0',notes:'Invented October 8 v1.5.17 Strength 3 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength3V1517Snapshot)),
  exercises:syntheticStrength3Results({inclineReps:'10, 10, 10',rowReps:'10, 10, 10',plankTimes:'55, 55, 55',tricepsLoad:'121',tricepsReps:'10, 10'})
 });
 const oct9V1518Strength3=workout('synthetic-oct9-v1518-strength3','2026-10-09T18:00:00.000Z',{
  date:'2026-10-09',dayKey:'strengthLowerSdc',dayLabel:'Strength 3 — Lower / Full Body and SDC',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.18',programEffectiveDate:'2026-10-09',
  activeRunStage:'',targetSessionRpe:'7–8',duration:'69',sessionRpe:'8',painDuring:'0',notes:'Invented October 9 v1.5.18 Strength 3 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength3V1518Snapshot)),
  exercises:syntheticStrength3Results({inclineReps:'10, 10, 10',rowReps:'10, 10, 10',plankTimes:'55, 55, 55',tricepsLoad:'121',tricepsReps:'10, 10',sidePlankTimes:'55, 55, 55',hammerLoad:'30',hammerReps:'10, 10'})
 });
 const uploads=model.mergeWorkoutRecords([oct8V1517Strength3,oct9V1518Strength3],[],null).uploads;
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct8V1517Strength3.id).payload,oct8V1517Strength3,'Firebase upload preserves the complete invented October 8 v1.5.17 Strength 3 document');
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct9V1518Strength3.id).payload,oct9V1518Strength3,'Firebase upload preserves the complete invented October 9 v1.5.18 Strength 3 document');
 const remoteChangedAt={
  [oct8V1517Strength3.id]:'2026-10-08T19:00:00.000Z',
  [oct9V1518Strength3.id]:'2026-10-09T19:00:00.000Z'
 };
 const remote=uploads.map(upload=>({...upload,changedAt:remoteChangedAt[upload.entryId]}));
 const pulled=model.mergeWorkoutRecords([],remote,null).entries;
 const historical=pulled.find(entry=>entry.id===oct8V1517Strength3.id);
 const active=pulled.find(entry=>entry.id===oct9V1518Strength3.id);
 assert.deepEqual(historical,oct8V1517Strength3,'Firebase round trips preserve the immutable October 8 v1.5.17 Strength 3 snapshot and every invented result');
 assert.deepEqual(active,oct9V1518Strength3,'Firebase round trips preserve the complete October 9 v1.5.18 Strength 3 snapshot and every invented result');

 const historicalById=Object.fromEntries(historical.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const activeById=Object.fromEntries(active.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const exerciseOrder=['romanianDeadlift','squatPattern','inclinePress','oneArmRow','singleLegStrength','gymConditioningCircuit','plank','sidePlank','hammerCurl','overheadTricepsExtension'];
 assert.deepEqual(historical.prescriptionSnapshot.exercises.map(exercise=>exercise.id),exerciseOrder,'the October 8 fixture contains every Strength 3 and SDC exercise in stable order');
 assert.deepEqual(active.prescriptionSnapshot.exercises.map(exercise=>exercise.id),exerciseOrder,'the v1.5.18 fixture preserves every Strength 3 and SDC stable exercise ID and order');

 assert.equal(historicalById.sidePlank.prescription,'3 × 50 sec each side');
 assert.deepEqual(historicalById.sidePlank.prescribedTimes,['0:50','0:50','0:50']);
 assert.equal(historicalById.sidePlank.targetRpe,'6–8');
 assert.equal(historicalById.hammerCurl.prescription,'25 lb per hand for 2 × 15');
 assert.equal(historicalById.hammerCurl.targetLoad,25);
 assert.equal(historicalById.hammerCurl.targetLoadVariation,'Dumbbell hammer curl');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='sidePlank').times,'50, 50, 50','the invented October 8 side-plank result remains unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='hammerCurl').load,'25','the invented October 8 hammer-curl load remains unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='hammerCurl').reps,'15, 15','the invented October 8 hammer-curl repetitions remain unchanged');

 assert.equal(activeById.sidePlank.prescription,'3 × 55 sec each side');
 assert.deepEqual(activeById.sidePlank.prescribedTimes,['0:55','0:55','0:55']);
 assert.equal(activeById.sidePlank.targetRpe,'6–8');
 assert.match(activeById.sidePlank.coachingNotes,/clean hip and lumbar position.*stop a set.*compensation/i);
 assert.match(activeById.hammerCurl.prescription,/next smallest comparable dumbbell increment above 25 lb per hand.*30 lb per hand.*2 × 10–12/i);
 assert.equal(activeById.hammerCurl.targetLoad,30);
 assert.equal(activeById.hammerCurl.targetLoadVariation,'Dumbbell hammer curl');
 assert.deepEqual(activeById.hammerCurl.variations,['Dumbbell hammer curl','Rope cable hammer curl']);
 assert.deepEqual(activeById.hammerCurl.variationUnits,{'Dumbbell hammer curl':'lb per hand','Rope cable hammer curl':'lb total'});
 assert.equal(activeById.hammerCurl.defaultVariation,'Dumbbell hammer curl');
 assert.equal(activeById.hammerCurl.group,'armSuperset');
 assert.equal(activeById.hammerCurl.optional,true);
 assert.equal(activeById.hammerCurl.targetRpe,'7–9');
 assert.match(activeById.hammerCurl.coachingNotes,/same dumbbell variation.*controlled.*hold the new load for confirmation.*not transfer.*rope-cable variation/i);
 assert.equal(active.exercises.find(exercise=>exercise.exerciseId==='sidePlank').times,'55, 55, 55');
 assert.equal(active.exercises.find(exercise=>exercise.exerciseId==='hammerCurl').load,'30');
 assert.equal(active.exercises.find(exercise=>exercise.exerciseId==='hammerCurl').reps,'10, 10');

 for(const exerciseId of exerciseOrder.filter(exerciseId=>!['sidePlank','hammerCurl'].includes(exerciseId))){
  assert.deepEqual(activeById[exerciseId],historicalById[exerciseId],`${exerciseId} remains unchanged between the invented v1.5.17 and v1.5.18 Strength 3 snapshots`);
  assert.deepEqual(active.exercises.find(exercise=>exercise.exerciseId===exerciseId),historical.exercises.find(exercise=>exercise.exerciseId===exerciseId),`${exerciseId} keeps its complete invented result across the v1.5.17 and v1.5.18 Strength 3 fixtures`);
 }
 const historicalCircuit=historical.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
 const activeCircuit=active.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
 assert.deepEqual(activeCircuit,historicalCircuit,'the complete invented two-round SDC result remains unchanged in the v1.5.18 Firebase fixture');
 assert.equal(activeCircuit.rounds,'2');
 assert.deepEqual(activeCircuit.components.map(component=>component.id),['farmerCarry','lateralStepUps','hardCardio','backwardSledDrag','forwardSledPush','rest']);
 assert.match(activeCircuit.components.find(component=>component.id==='backwardSledDrag').sharedResult.equipmentLabel,/TANK M4 · Level 3/);
 assert.equal(historical.programVersion,'1.5.17');
 assert.equal(active.programVersion,'1.5.18');
 assert.equal(historical.activeRunStage,'');
 assert.equal(active.activeRunStage,'');
}

{
 const oct4V1515Strength1=workout('synthetic-oct4-v1515-strength1','2026-10-04T18:00:00.000Z',{
  date:'2026-10-04',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.15',programEffectiveDate:'2026-10-02',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'66',sessionRpe:'7',painDuring:'0',sleepQuality:'Good',notes:'Invented October 4 v1.5.15 Strength 1 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength1V1515Snapshot)),
  exercises:syntheticStrength1Results({overheadLoad:'25',overheadReps:'10, 10, 10',rowLoad:'110',rowReps:'10, 10, 10'})
 });
 const oct5V1516Strength1=workout('synthetic-oct5-v1516-strength1','2026-10-05T18:00:00.000Z',{
  date:'2026-10-05',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.16',programEffectiveDate:'2026-10-05',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'67',sessionRpe:'7',painDuring:'0',sleepQuality:'Good',notes:'Invented October 5 v1.5.16 Strength 1 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength1V1516Snapshot)),
  exercises:syntheticStrength1Results({overheadLoad:'30',overheadReps:'8, 8, 8',rowLoad:'121',rowReps:'8, 8, 8'})
 });
 const oct7V1517Strength1=workout('synthetic-oct7-v1517-strength1','2026-10-07T18:00:00.000Z',{
  date:'2026-10-07',dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.17',programEffectiveDate:'2026-10-07',
  activeRunStage:'',targetSessionRpe:'6–7',duration:'65',sessionRpe:'7',painDuring:'0',sleepQuality:'Good',notes:'Invented October 7 v1.5.17 Strength 1 cloud fixture.',
  prescriptionSnapshot:JSON.parse(JSON.stringify(syntheticStrength1V1517Snapshot)),
  exercises:syntheticStrength1Results({overheadLoad:'30',overheadReps:'8, 8, 8',rowLoad:'121',rowReps:'8, 8, 8',pushupReps:'15, 10, 10, 10, 10',pushupRpe:'8'})
 });
 const uploads=model.mergeWorkoutRecords([oct4V1515Strength1,oct5V1516Strength1,oct7V1517Strength1],[],null).uploads;
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct4V1515Strength1.id).payload,oct4V1515Strength1,'Firebase upload preserves the complete invented October 4 v1.5.15 Strength 1 document');
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct5V1516Strength1.id).payload,oct5V1516Strength1,'Firebase upload preserves the complete invented October 5 v1.5.16 Strength 1 document');
 assert.deepEqual(uploads.find(upload=>upload.entryId===oct7V1517Strength1.id).payload,oct7V1517Strength1,'Firebase upload preserves the complete invented October 7 v1.5.17 Strength 1 document');
 const remoteChangedAt={
  [oct4V1515Strength1.id]:'2026-10-04T19:00:00.000Z',
  [oct5V1516Strength1.id]:'2026-10-05T19:00:00.000Z',
  [oct7V1517Strength1.id]:'2026-10-07T19:00:00.000Z'
 };
 const remote=uploads.map(upload=>({...upload,changedAt:remoteChangedAt[upload.entryId]}));
 const pulled=model.mergeWorkoutRecords([],remote,null).entries;
 const historical=pulled.find(entry=>entry.id===oct4V1515Strength1.id);
 const current=pulled.find(entry=>entry.id===oct5V1516Strength1.id);
 const active=pulled.find(entry=>entry.id===oct7V1517Strength1.id);
 assert.deepEqual(historical,oct4V1515Strength1,'Firebase round trips preserve the immutable October 4 v1.5.15 Strength 1 snapshot and every invented result');
 assert.deepEqual(current,oct5V1516Strength1,'Firebase round trips preserve the complete current v1.5.16 Strength 1 snapshot and every invented result');
 assert.deepEqual(active,oct7V1517Strength1,'Firebase round trips preserve the complete active v1.5.17 Strength 1 snapshot, per-set repetition metadata, and every invented result');

 const historicalById=Object.fromEntries(historical.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const currentById=Object.fromEntries(current.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const activeById=Object.fromEntries(active.prescriptionSnapshot.exercises.map(exercise=>[exercise.id,exercise]));
 const exerciseOrder=['handReleasePushups','verticalPull','overheadPress','chestSupportedRow','lateralRaise','chestFly','trunkStability','preacherCurl','tricepsPressdown'];
 assert.deepEqual(historical.prescriptionSnapshot.exercises.map(exercise=>exercise.id),exerciseOrder,'the October 4 fixture contains the complete Strength 1 prescription in stable order');
 assert.deepEqual(current.prescriptionSnapshot.exercises.map(exercise=>exercise.id),exerciseOrder,'the current v1.5.16 fixture preserves every Strength 1 stable exercise ID and order');
 assert.deepEqual(active.prescriptionSnapshot.exercises.map(exercise=>exercise.id),exerciseOrder,'the active v1.5.17 fixture preserves every Strength 1 stable exercise ID and order');

 assert.equal(historicalById.overheadPress.prescription,'25 lb per hand for 3 × 10');
 assert.equal(historicalById.overheadPress.targetLoad,25);
 assert.equal(historicalById.overheadPress.targetLoadVariation,'Seated dumbbell press');
 assert.equal(historicalById.chestSupportedRow.prescription,'110 lb displayed on the same confirmed machine/setup for 3 × 10');
 assert.equal(historicalById.chestSupportedRow.targetLoad,undefined,'October 4 history retains setup-specific row guidance without a universal target load');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='overheadPress').load,'25','the invented October 4 overhead-press load remains unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='overheadPress').reps,'10, 10, 10','the invented October 4 overhead-press repetitions remain unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='chestSupportedRow').load,'110','the invented October 4 machine-row load remains unchanged');
 assert.equal(historical.exercises.find(exercise=>exercise.exerciseId==='chestSupportedRow').reps,'10, 10, 10','the invented October 4 machine-row repetitions remain unchanged');

 assert.equal(currentById.overheadPress.prescription,'30 lb per hand for 3 × 8');
 assert.equal(currentById.overheadPress.targetLoad,30);
 assert.equal(currentById.overheadPress.targetLoadVariation,'Seated dumbbell press');
 assert.match(currentById.overheadPress.coachingNotes,/AFT-priority first movement.*controlled, technically clean, submaximal.*no.*make-up repetitions.*grind.*failure.*hold 30 lb per hand for confirmation/i);
 assert.match(currentById.chestSupportedRow.prescription,/next smallest comparable increment above 110 lb.*approximately 121 lb.*3 × 8–10/i);
 assert.equal(currentById.chestSupportedRow.targetLoad,undefined,'the current setup-specific machine-row cue does not become a universal target load in cloud storage');
 assert.match(currentById.chestSupportedRow.coachingNotes,/same confirmed machine and setup.*not a transferable load.*hold the new increment for confirmation/i);
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='overheadPress').load,'30');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='overheadPress').reps,'8, 8, 8');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='chestSupportedRow').load,'121');
 assert.equal(current.exercises.find(exercise=>exercise.exerciseId==='chestSupportedRow').reps,'8, 8, 8');

 assert.equal(activeById.handReleasePushups.type,'body');
 assert.equal(activeById.handReleasePushups.sets,5);
 assert.equal(activeById.handReleasePushups.prescription,'Set 1: 15 continuous reps; Sets 2–5: 10 reps');
 assert.deepEqual(activeById.handReleasePushups.prescribedReps,[15,10,10,10,10]);
 assert.equal(activeById.handReleasePushups.targetRpe,'Set 1 ≤8; sets 2–5 6–7');
 assert.match(activeById.handReleasePushups.coachingNotes,/controlled test-standard repetitions.*without an in-set rest.*stop at 15.*rest 3 minutes.*90–120 seconds.*no.*maximal set.*extra repetitions.*skill microdose.*progression applies only to set 1.*coach-directed/i);
 const activePushups=active.exercises.find(exercise=>exercise.exerciseId==='handReleasePushups');
 assert.equal(activePushups.reps,'15, 10, 10, 10, 10');
 assert.equal(activePushups.rpe,'8');
 assert.equal(activePushups.prescribedReps,undefined,'per-set targets remain snapshot metadata and do not change the completed-result shape');
 assert.equal(currentById.handReleasePushups.prescribedReps,undefined,'v1.5.16 history is not backfilled with v1.5.17 per-set metadata');
 assert.equal(historicalById.handReleasePushups.prescribedReps,undefined,'October 4 v1.5.15 history is not backfilled with v1.5.17 per-set metadata');

 for(const exerciseId of exerciseOrder.filter(exerciseId=>!['overheadPress','chestSupportedRow'].includes(exerciseId))){
  assert.deepEqual(currentById[exerciseId],historicalById[exerciseId],`${exerciseId} remains unchanged between the invented v1.5.15 and v1.5.16 Strength 1 snapshots`);
  assert.deepEqual(current.exercises.find(exercise=>exercise.exerciseId===exerciseId),historical.exercises.find(exercise=>exercise.exerciseId===exerciseId),`${exerciseId} keeps its complete invented result across the paired Strength 1 fixtures`);
 }
 for(const exerciseId of exerciseOrder.filter(exerciseId=>exerciseId!=='handReleasePushups')){
  assert.deepEqual(activeById[exerciseId],currentById[exerciseId],`${exerciseId} remains unchanged between the invented v1.5.16 and v1.5.17 Strength 1 snapshots`);
  assert.deepEqual(active.exercises.find(exercise=>exercise.exerciseId===exerciseId),current.exercises.find(exercise=>exercise.exerciseId===exerciseId),`${exerciseId} keeps its complete invented result across the v1.5.16 and v1.5.17 Strength 1 fixtures`);
 }
 assert.equal(historical.programVersion,'1.5.15');
 assert.equal(current.programVersion,'1.5.16');
 assert.equal(active.programVersion,'1.5.17');
 assert.equal(historical.activeRunStage,'');
 assert.equal(current.activeRunStage,'');
 assert.equal(active.activeRunStage,'');
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
