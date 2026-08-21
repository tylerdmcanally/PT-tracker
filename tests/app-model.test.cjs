const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const storage=new Map();
const context={
 console,
 Date,
 Math,
 JSON,
 Number,
 String,
 Boolean,
 Array,
 Object,
 Map,
 Set,
 Intl,
 setTimeout,
 clearTimeout,
 setInterval,
 clearInterval,
 confirm:()=>true,
 alert:()=>{},
 crypto:{randomUUID:()=>`test-${Math.random()}`},
 localStorage:{
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key)
 },
 navigator:{},
 window:{}
};
context.window.window=context.window;
context.window.navigator=context.navigator;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'program-config.js'),'utf8'),context,{filename:'program-config.js'});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context,{filename:'app.js'});

const evaluate=source=>vm.runInContext(source,context);

assert.equal(evaluate('PROGRAM.name'),'AFT Foundation Block 1');
assert.equal(evaluate('PROGRAM.version'),'1.4.5');
assert.equal(evaluate('PROGRAM.effectiveDate'),'2026-08-21');
assert.equal(evaluate('PROGRAM.currentRunStage'),3);
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="gymConditioningCircuit").prescription.includes("Exactly 2 rounds")'),true);
assert.equal(evaluate('SESSIONS.day3.targetSessionRpe'),'7–8');
assert.equal(evaluate('SESSIONS.recovery.sessionType'),'recovery');
assert.equal(evaluate('SESSIONS.skillMicrodose.sessionType'),'skill_microdose');
assert.equal(evaluate('SESSIONS.skillMicrodose.templateVersion'),'1.0');
assert.equal(evaluate('SESSIONS.skillMicrodose.templateEffectiveDate'),'2026-08-06');
assert.equal(evaluate('SESSIONS.skillMicrodose.weeklySkillDoseGroupId'),'aft_pushup_plank_microdose');
assert.equal(evaluate('SESSIONS.skillMicrodose.exercises.some(exercise=>/air squat/i.test(exercise.name))'),false);
assert.equal(evaluate('sessionProgramMeta(SESSIONS.skillMicrodose).version'),'1.0');
assert.equal(evaluate('sessionProgramMeta(SESSIONS.skillMicrodose).runStage'),'');
assert.equal(evaluate('currentProgramMeta().version'),'1.4.5','the auxiliary template version remains independent of the primary program');
assert.equal(evaluate('SESSIONS.day1.exercises.find(exercise=>exercise.id==="runWalkIntervals").runStage'),3);
assert.equal(evaluate('SESSIONS.day4.exercises.find(exercise=>exercise.id==="primaryRun").runStage'),3);
assert.equal(evaluate('SESSIONS.day4.exercises.find(exercise=>exercise.id==="handReleasePushups").prescription'),'4 × 7');
assert.equal(evaluate('JSON.stringify(SESSIONS.day4.exercises.find(exercise=>exercise.id==="plank").prescribedTimes)'),'["0:35","0:35","0:35"]');
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").prescription'),'125 lb total for 2 × 8');
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").targetLoad'),125);
assert.equal(evaluate('defaultExerciseState(SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift")).load'),undefined,'the target load is not prefilled as a completed result');
const v145Prescriptions=JSON.parse(evaluate(`JSON.stringify({
 day1Deadlift:SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift').prescription,
 day1LegPress:SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress').prescription,
 day1Bench:SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress').prescription,
 day1Row:SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').prescription,
 day1Carry:SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry').prescription,
 day1Plank:SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank').prescription,
 day1Preacher:SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').prescription,
 day1Pressdown:SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription,
 day2Pushups:SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,
 day2Pull:SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').prescription,
 day2Press:SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress').prescription,
 day2Row:SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription,
 day2Lateral:SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise').prescription,
 day2Fly:SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').prescription,
 day3Rdl:SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift').prescription,
 day3Goblet:SESSIONS.day3.exercises.find(exercise=>exercise.id==='squatPattern').prescription,
 day3Incline:SESSIONS.day3.exercises.find(exercise=>exercise.id==='inclinePress').prescription,
 day3Row:SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').prescription,
 day3Split:SESSIONS.day3.exercises.find(exercise=>exercise.id==='singleLegStrength').prescription,
 day3SidePlank:SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank').prescription,
 day3Hammer:SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,
 day3OverheadTriceps:SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').prescription
})`));
assert.deepEqual(v145Prescriptions,{
 day1Deadlift:'155 lb total for 3 × 5',day1LegPress:'140 lb for 3 × 9',day1Bench:'35 lb per hand for 3 × 10',
 day1Row:'88 lb for 3 × 11',day1Carry:'45 lb per hand for 4 trips of approximately 30–40 yd',day1Plank:'3 × 45 sec',
 day1Preacher:'2 × 10–15; use 40 lb total on the same EZ-bar setup',day1Pressdown:'77 lb for 2 × 15 on the same machine/cable setup',
 day2Pushups:'5 × 8',day2Pull:'Approximately 154 lb displayed on the same seated machine for 3 × 8–10',day2Press:'25 lb per hand for 3 × 10',
 day2Row:'88 lb for 3 × 12 on the same machine/setup',day2Lateral:'2 × 15 on the same comparable cable setup/load',day2Fly:'66 lb total for 2 × 15 on the same pec-deck setup',
 day3Rdl:'125 lb total for 2 × 8',day3Goblet:'55 lb for 3 × 9',day3Incline:'30 lb per hand for 3 × 10',day3Row:'45 lb for 3 × 11 each side',
 day3Split:'Body weight for 2 × 10 each leg',day3SidePlank:'3 × 40 sec each side',day3Hammer:'20 lb per hand for 2 × 15',day3OverheadTriceps:'88 lb for 2 × 15 on the same rope/cable setup'
});
assert.equal(evaluate('SESSIONS.day3.exercises.some(exercise=>exercise.id==="handReleasePushups"||exercise.id==="plank")'),false,'the optional Day 3 skill bundle remains absent from v1.4.5');
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="gymConditioningCircuit").circuitVersion'),'foundation-1.4.5');
assert.equal(evaluate('CIRCUIT_TEMPLATES["foundation-1.4"].components.length'),6);
assert.equal(evaluate('CIRCUIT_TEMPLATES["foundation-1.4.5"].components.length'),6);
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4'].components.find(component=>component.id==='backwardSledDrag').planned.equipmentLabel`),undefined,'the historical v1.4 circuit plan remains unchanged');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='backwardSledDrag').planned.equipmentLabel`),'Torque Fitness TANK M4 · Level 3');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='forwardSledPush').planned.distanceLabel`),'Approximately 20 yd gym lane');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='forwardSledPush').planned.load`),undefined,'the M4 resistance level is never represented as pounds');
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").variations.includes("Cuffed-cable lateral raise")'),true);
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").name'),'Cable lateral raise');
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").defaultVariation'),'Cable lateral raise');
assert.equal(evaluate(`compactLoadResult(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),{load:'12.5',unit:'lb per side'})`),'12.5 lb/side');
assert.equal(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').targetLoad`),undefined,'the approximately 154-lb pulldown cue is not a universal machine target');
assert.equal(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').defaultVariation`),'Seated lat pulldown');
assert.equal(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').defaultVariation`),'Pec deck / machine fly');
assert.equal(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').targetLoad`),undefined,'the setup-specific machine-row load is not universalized');
assert.equal(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').targetLoad`),undefined,'the setup-specific pec-deck load is not universalized');
assert.match(evaluate(`SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').coachingNotes`),/different cable or pulley setup/);
assert.equal(evaluate(`SESSIONS.day3.exercises.some(exercise=>exercise.id==='tricepsPressdown'||exercise.id==='dumbbellCurl')`),false,'Day 3 replaces rather than adds to the legacy arm pair');
assert.equal(evaluate(`SESSIONS.day4.exercises.some(exercise=>['preacherCurl','hammerCurl','chestFly','overheadTricepsExtension'].includes(exercise.id))`),false,'Day 4 receives no hypertrophy accessories');
assert.equal(evaluate('ROTATION.length'),4,'no primary workout day is added');
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').targetRpe`),'5–6');
assert.equal(evaluate(`SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').targetRpe`),'5–6');
assert.match(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/6\.0–6\.2 mph/);
assert.match(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/reduce speed rather than forcing pace/);
assert.doesNotMatch(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/6\.2–6\.4 mph/,'Day 1 uses its post-strength speed guidance');
assert.match(evaluate(`SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/6\.2–6\.4 mph/,'Day 4 retains its fresher assessment guidance');
assert.match(evaluate(`SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/Do not chase overall average pace/);
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift').targetLoad`),155);
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress').targetLoad`),140);
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress').targetLoad`),35);
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').targetRpe`),'6–8');
assert.equal(evaluate(`JSON.stringify(SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank').prescribedTimes)`),'["0:45","0:45","0:45"]');
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').targetLoadVariation`),'EZ-bar preacher curl');
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').targetLoad`),40);
assert.equal(evaluate(`SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').targetLoad`),undefined,'the setup-specific 77-lb cable load is not universalized');
assert.equal(evaluate(`SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').targetLoad`),45);
assert.equal(evaluate(`SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').targetRpe`),'6–8');
assert.equal(evaluate(`SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoad`),20);
assert.equal(evaluate(`SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoadVariation`),'Dumbbell hammer curl');
assert.equal(evaluate(`SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').targetLoad`),undefined,'the setup-specific 88-lb cable cue is not universalized');
assert.equal(evaluate(`JSON.stringify(SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank').prescribedTimes)`),'["0:40","0:40","0:40"]');
assert.match(evaluate(`SESSIONS.day3.warmup`),/Approximately 10 progressive minutes/);
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(Object.fromEntries(SESSIONS.day3.exercises.filter(exercise=>exercise.id!=='gymConditioningCircuit').map(exercise=>[exercise.id,exercise.targetRpe||''])))`)),{
 romanianDeadlift:'6–8',squatPattern:'7–8',inclinePress:'7–8',oneArmRow:'6–8',singleLegStrength:'6–7',sidePlank:'6–8',hammerCurl:'7–9',overheadTricepsExtension:'7–9'
});
assert.equal(evaluate(`variationIdFor('Machine preacher curl')`),'machinePreacherCurl');
assert.equal(evaluate(`variationIdFor('Seated lat pulldown')`),'seatedLatPulldown');
assert.equal(evaluate(`variationIdFor('Modified standing lat pulldown')`),'modifiedStandingLatPulldown');
assert.equal(evaluate(`variationIdFor('Cable chest fly')`),'cableChestFly');
assert.equal(evaluate(`variationIdFor('Dumbbell hammer curl')`),'dumbbellHammerCurl');
assert.equal(evaluate(`variationIdFor('Rope overhead cable extension')`),'ropeOverheadCableExtension');
assert.equal(evaluate('programmedRunSeconds(runDefaults(2))'),1200,'Stage 2 must total 20 programmed minutes');
assert.equal(evaluate('JSON.stringify(getRunStage(3))'),'{"id":3,"label":"1:00 walk / 2:00 run × 7","runMinutes":"2","walkMinutes":"1","rounds":"7"}','the existing Stage 3 definition remains unchanged');
assert.equal(evaluate('programmedRunSeconds(runDefaults(3))'),1260,'Stage 3 must total 21 programmed minutes');
assert.equal(evaluate('currentProgramMeta().runStage'),3);

const currentDay3Row=`SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow')`;
const currentHammerCurl=`SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl')`;
const currentDay4Plank=`SESSIONS.day4.exercises.find(exercise=>exercise.id==='plank')`;
const currentDay1Deadlift=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift')`;
const currentDay1LegPress=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress')`;
const currentDay1Bench=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress')`;
const currentDay1Row=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow')`;
const currentDay1Plank=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank')`;
const currentDay1Preacher=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl')`;
const currentDay1Pressdown=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown')`;
const currentDay2Pushups=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups')`;
const currentDay2Pull=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull')`;
const currentDay2Press=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress')`;
const currentDay2Row=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow')`;
const currentDay2Lateral=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')`;
const currentDay2Fly=`SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly')`;
const currentDay3SidePlank=`SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank')`;
const currentDay3Triceps=`SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension')`;
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Deadlift},{type:'weighted',completed:true,variation:'Trap / hex bar',load:'55',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1LegPress},{type:'weighted',completed:true,variation:'Leg press',load:'140',sets:'3',reps:'9, 9, 9'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Bench},{type:'weighted',completed:true,variation:'Dumbbell bench press',load:'35',sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Row},{type:'weighted',completed:true,variation:'Seated cable row',load:'88',sets:'3',reps:'11, 11, 11'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Plank},{type:'timed',completed:true,sets:'3',times:'45, 45, 45'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Plank},{type:'timed',completed:true,sets:'3',times:'45, 40, 45'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Preacher},{type:'weighted',completed:true,variation:'EZ-bar preacher curl',load:'40',sets:'2',reps:'12, 12'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Preacher},{type:'weighted',completed:true,variation:'Machine preacher curl',load:'40',sets:'2',reps:'12, 12'})`),'modified','the EZ-bar load is not treated as comparable on another preacher-curl setup');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Pressdown},{type:'weighted',completed:true,load:'66',sets:'2',reps:'15, 15'})`),'met','a different cable-stack number is not judged against the setup-specific 77-lb cue');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pushups},{type:'body',completed:true,sets:'5',reps:'8, 8, 8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pushups},{type:'body',completed:true,sets:'5',reps:'8, 8, 8, 8, 7'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pull},{type:'weighted',completed:true,variation:'Seated lat pulldown',load:'154',sets:'3',reps:'8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'25',sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Row},{type:'weighted',completed:true,variation:'Machine row',load:'77',sets:'3',reps:'12, 12, 12'})`),'met','machine-row adherence does not universalize the displayed stack target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Lateral},{type:'weighted',completed:true,variation:'Cable lateral raise',load:'33',sets:'2',reps:'15, 15'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Fly},{type:'weighted',completed:true,variation:'Pec deck / machine fly',load:'55',sets:'2',reps:'15, 15'})`),'met','pec-deck adherence does not universalize the displayed stack target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Row},{type:'weighted',completed:true,variation:'One-arm dumbbell row',load:'45',sets:'3',reps:'11, 11, 11'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Row},{type:'weighted',completed:true,variation:'One-arm dumbbell row',load:'40',sets:'3',reps:'11, 11, 11'})`),'modified');
assert.equal(evaluate(`prescriptionAdherence(${currentHammerCurl},{type:'weighted',completed:true,variation:'Dumbbell hammer curl',load:'20',sets:'2',reps:'15, 15'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentHammerCurl},{type:'weighted',completed:true,variation:'Rope cable hammer curl',load:'20',sets:'2',reps:'15, 15'})`),'modified','rope cable work remains a substitution rather than a directly comparable dumbbell load');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3SidePlank},{type:'timed',completed:true,sets:'3',times:'40, 40, 40'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3SidePlank},{type:'timed',completed:true,sets:'3',times:'40, 35, 40'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Triceps},{type:'weighted',completed:true,variation:'Rope overhead cable extension',load:'77',sets:'2',reps:'15, 15'})`),'met','a different stack number is not judged against the setup-specific 88-lb cue');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Plank},{type:'timed',completed:true,sets:'3',times:'35, 35, 35'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Plank},{type:'timed',completed:true,sets:'3',times:'35, 35, 30'})`),'below_target');
const v144RunMarkdown=evaluate(`markdownExercise(SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun'),{
 exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',completed:true,runStage:'3',walkMinutes:'1',runMinutes:'2',rounds:'7',completedRounds:'7',runSpeed:'6.2',rpe:'5'
},{date:'2026-08-19',dayKey:'day4',programVersion:'1.4.4'})`);
assert.match(v144RunMarkdown,/target RPE 5–6/);
assert.match(v144RunMarkdown,/6\.2–6\.4 mph/);
assert.match(v144RunMarkdown,/Running speed: 6\.2 mph/,'the existing run-speed field carries the current guidance into coach exports');

assert.equal(evaluate(`prescriptionAdherence({type:'body',prescription:'5 × 6',sets:5},{type:'body',completed:true,sets:'5',reps:'6, 6, 6, 6, 4'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'8, 8, 6'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'2 × 12–15',sets:2},{type:'weighted',completed:true,sets:'2',reps:'10, 10'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'cardio',prescription:'25–30 minutes'},{type:'cardio',completed:true,minutes:'20'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 30, 25'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 20, 25'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3,optional:true},{type:'weighted',completed:false})`),'not_applicable');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'95 lb total for 2 × 8',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells']},{type:'weighted',completed:true,variation:'Dumbbells',load:'30',sets:'2',reps:'8, 8'})`),'modified','a substitution is recorded explicitly instead of being treated as the targeted load');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'80',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'70',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'modified');
assert.equal(evaluate(`prescribedEnteredLoad(145,'platesPerSide',45)`),50,'quick fill preserves per-side plate entry while reaching total prescribed load');
assert.equal(evaluate(`prescribedEnteredLoad(125,'plates',45)`),80,'quick fill preserves combined-plate entry while reaching total prescribed load');
assert.equal(evaluate(`prescribedEnteredLoad(30,'','')`),30,'non-bar exercises retain their direct prescribed load');
const aboveTargetLoad=JSON.parse(evaluate(`JSON.stringify(prescriptionAdherenceDetail(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'90',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'}))`));
assert.equal(aboveTargetLoad.value,'modified');
assert.ok(aboveTargetLoad.reasons.some(reason=>reason.code==='load_above_target'));
assert.equal(evaluate(`prescriptionAdherence({type:'carry',prescription:'Carry with good posture'},{type:'carry',completed:true,load:'45'})`),'not_assessable');
const day1Carry=`SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry')`;
const august9Carry=`{exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',load:'45',sets:'4',distance:'40',carrySeconds:'30',rpe:'6',completed:true}`;
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},${august9Carry})`),'met','4 prescribed trips at 30–40 yd are met by 4 trips at 40 yd');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},sets:'3'})`),'partial','fewer completed trips produce partial adherence');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},distance:'25'})`),'below_target','a completed per-trip distance below the prescribed range is below target');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},carrySeconds:'90'})`),'met','carry duration is ignored when the prescription has no duration target');
assert.equal(evaluate(`prescriptionAdherence({type:'carry',sets:4,prescription:'4 trips of approximately 30–40 yd'},{...${august9Carry},load:'5'})`),'met','carry load is ignored when the prescription has no load target');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},load:'5'})`),'modified','the explicit current carry load is assessable');
assert.equal(evaluate(`summary(${august9Carry},${day1Carry})`),'4 trips × 40 yd · approximately 30 sec/trip · 45 lb/hand · RPE 6');
assert.equal(evaluate(`compactResultSummary(${day1Carry},${august9Carry})`),'4 trips × 40 yd · approximately 30 sec/trip · 45 lb/hand · RPE 6');
const august9CarryMarkdown=evaluate(`markdownExercise(${day1Carry},${august9Carry},{id:'august-9-day-1',date:'2026-08-09',dayKey:'day1',programVersion:'1.4'})`);
assert.match(august9CarryMarkdown,/Prescription adherence: Met/);
assert.match(august9CarryMarkdown,/Completed result: 4 trips × 40 yd · approximately 30 sec\/trip · 45 lb\/hand · RPE 6/);
assert.doesNotMatch(august9CarryMarkdown,/4 sets · 40 yd/,'chat export does not describe carry trips as sets');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3},{type:'weighted',completed:true,reps:'',load:'50'})`),'partial');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3},{type:'weighted',completed:true,reps:'1',adherenceOverride:{value:'met',reason:'Coach-approved modified set'}})`),'met');

assert.equal(evaluate(`activeCoachOverlay('1.3','day2','lateralRaise','2026-08-03').status`),'resolved','the resolved directive remains visible in its historical date context');
assert.equal(evaluate(`activeCoachOverlay('1.4','day2','lateralRaise','2026-08-11').status`),'resolved','the v1.4 directive remains visible before its resolution date');
assert.equal(evaluate(`activeCoachOverlay('1.4','day2','lateralRaise','2026-08-12')`),null,'the resolved directive leaves workouts on and after August 12');
assert.equal(evaluate(`activeCoachOverlay('1.4.1','day2','lateralRaise','2026-08-12')`),null,'v1.4.1 has no active lateral-raise overlay');
assert.equal(evaluate(`activeCoachOverlay('1.4.2','day2','lateralRaise','2026-08-16')`),null,'v1.4.2 has no active lateral-raise overlay');
assert.equal(evaluate(`activeCoachOverlay('1.4.3','day2','lateralRaise','2026-08-18')`),null,'v1.4.3 has no active lateral-raise overlay');
assert.equal(evaluate(`activeCoachOverlay('1.4.4','day2','lateralRaise','2026-08-19')`),null,'v1.4.4 has no active lateral-raise overlay');
evaluate(`activeProgramContext={...currentProgramMeta(),version:'1.4'};activeSessionDefinition=SESSIONS.day2;activeWorkoutDate='2026-08-11'`);
const historicalOverlayCard=evaluate(`exerciseCard(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,defaultExerciseState(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')))`);
assert.match(historicalOverlayCard,/ACTIVE COACH NOTE/);
evaluate(`activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.day2;activeWorkoutDate='2026-08-12'`);
const currentLateralCard=evaluate(`exerciseCard(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,defaultExerciseState(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')))`);
assert.doesNotMatch(currentLateralCard,/ACTIVE COACH NOTE/);
assert.match(currentLateralCard,/2 × 15 on the same comparable cable setup\/load/);
assert.match(currentLateralCard,/value="Cable lateral raise" selected/);
assert.match(currentLateralCard,/<details class="exercise-extras"/,'notes and pain use progressive disclosure');
assert.match(currentLateralCard,/data-completion-label/,'the completion action remains at the end of the logging flow');
const legacyLateralCard=evaluate(`exerciseCard(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,{exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand'})`);
assert.match(legacyLateralCard,/value="Dumbbell lateral raise" selected/,'legacy lateral-raise records without a variation remain identified as dumbbell work');
assert.match(legacyLateralCard,/data-unit="lb per hand"/);

const rotation=evaluate(`nextWorkoutDay([
 {id:'primary',dayKey:'day1',sessionType:'primary',date:'2026-07-28',updatedAt:'2026-07-28T12:00:00Z'},
 {id:'recovery',dayKey:'recovery',sessionType:'recovery',date:'2026-07-29',updatedAt:'2026-07-29T12:00:00Z'}
])`);
assert.equal(rotation,'day2','recovery sessions must not advance the primary rotation');
assert.equal(evaluate('nextWorkoutDay([])'),'day1');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'aug-1',dayKey:'day1',sessionType:'primary',date:'2026-08-01',updatedAt:'2026-08-01T18:00:00Z'},
 {id:'aug-3',dayKey:'day2',sessionType:'primary',date:'2026-08-03',updatedAt:'2026-08-03T18:00:00Z'}
])`),'day3','the August 3 rotation state advances to Day 3');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'aug-5',dayKey:'day3',sessionType:'primary',date:'2026-08-05',updatedAt:'2026-08-05T19:00:00Z'}
])`),'day4','the corrected August 5 workout still advances to unchanged Day 4');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'primary',dayKey:'day3',sessionType:'primary',date:'2026-08-05',updatedAt:'2026-08-05T19:00:00Z'},
 {id:'microdose',dayKey:'skillMicrodose',sessionType:'skill_microdose',date:'2026-08-06',updatedAt:'2026-08-06T19:00:00Z'}
])`),'day4','a skill microdose must not advance the primary rotation');
assert.equal(evaluate('PROGRAM.currentRunStage'),3,'a skill microdose template never changes the coach-directed run stage');

const completeMicrodose=`{
 id:'microdose-1',date:'2026-08-06',dayKey:'skillMicrodose',sessionType:'skill_microdose',
 exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,sets:'3',reps:'4, 4, 4'},
  {exerciseId:'plank',type:'timed',completed:true,sets:'3',times:'20, 20, 20'}
 ]
}`;
assert.equal(evaluate(`weeklySkillDoseState('2026-08-06',{source:[${completeMicrodose}]}).status`),'full');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-06',{source:[{
 id:'blank-complete',date:'2026-08-06',dayKey:'skillMicrodose',sessionType:'skill_microdose',exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,reps:''},{exerciseId:'plank',type:'timed',completed:true,times:''}
 ]
}]}).status`),'partial','completion checks without logged results do not satisfy the full weekly dose');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-10',{source:[${completeMicrodose}]}).status`),'available','the weekly slot resets on Monday without carrying a missed session');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-06',{source:[{
 id:'day3-full',date:'2026-08-05',dayKey:'day3',sessionType:'primary',exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,reps:'4, 4, 4'},
  {exerciseId:'plank',type:'timed',completed:true,times:'20, 20'}
 ]
}]}).full.entry.dayKey`),'day3','the full Day 3 bundle satisfies the shared weekly dose');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-06',{source:[{
 id:'day3-partial',date:'2026-08-05',dayKey:'day3',sessionType:'primary',exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,reps:'4, 4, 4'},
  {exerciseId:'plank',type:'timed',completed:false,times:''}
 ]
}]}).status`),'partial','partial Day 3 practice warns without closing the weekly slot');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-12',{source:[{
 id:'v14-day3',date:'2026-08-12',dayKey:'day3',sessionType:'primary',programVersion:'1.4',exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,reps:'4, 4, 4'},
  {exerciseId:'plank',type:'timed',completed:true,times:'20, 20'}
 ]
}]}).status`),'available','v1.4 Day 3 cannot satisfy the standalone weekly microdose slot');
assert.equal(evaluate(`weeklySkillDoseState('2026-08-12',{source:[{
 id:'v141-day3',date:'2026-08-12',dayKey:'day3',sessionType:'primary',programVersion:'1.4.1',exercises:[
  {exerciseId:'handReleasePushups',type:'body',completed:true,reps:'4, 4, 4'},
  {exerciseId:'plank',type:'timed',completed:true,times:'20, 20'}
 ]
}]}).status`),'available','v1.4.1 remains in the standalone-microdose era');
assert.equal(evaluate(`programVersionAtLeast('1.4.1','1.4')`),true);
assert.equal(evaluate(`programVersionAtLeast('1.4.2','1.4')`),true);
assert.equal(evaluate(`programVersionAtLeast('1.4.3','1.4')`),true);
assert.equal(evaluate(`programVersionAtLeast('1.4.4','1.4')`),true);

const microPushups='SESSIONS.skillMicrodose.exercises.find(exercise=>exercise.id==="handReleasePushups")';
const microPlank='SESSIONS.skillMicrodose.exercises.find(exercise=>exercise.id==="plank")';
assert.equal(evaluate(`prescriptionAdherence(${microPushups},{type:'body',completed:true,sets:'3',reps:'4, 4, 4'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${microPushups},{type:'body',completed:true,sets:'3',reps:'4, 4, 3'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${microPushups},{type:'body',completed:true,sets:'3',reps:'4, 4'})`),'partial');
assert.equal(evaluate(`prescriptionAdherence(${microPushups},{type:'body',completed:false,sets:'3',reps:''})`),'not_applicable');
assert.equal(evaluate(`prescriptionAdherence(${microPlank},{type:'timed',completed:true,sets:'3',times:'20, 20, 20'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${microPlank},{type:'timed',completed:true,sets:'3',times:'20, 19, 20'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${microPlank},{type:'timed',completed:true,sets:'3',times:'20, 20'})`),'partial');
assert.equal(evaluate(`prescriptionAdherence(${microPlank},{type:'timed',completed:false,sets:'3',times:''})`),'not_applicable');

assert.equal(evaluate(`totalLoadValue({load:'35',loadMode:'platesPerSide',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'70',loadMode:'plates',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'115'})`),115,'a legacy load without a mode remains a total');

const august11PulldownRaw={
 id:'august-11-day-2',date:'2026-08-11',updatedAt:'2026-08-11T19:00:00.000Z',dayKey:'day2',
 dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.4',
 prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',exercises:[
  {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3,variations:['Lat pulldown'],defaultVariation:'Lat pulldown'}
 ]},
 exercises:[{exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',variationId:'latPulldown',load:'143',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Modified standing setup.'}]
};
const august18PulldownRaw={
 id:'august-18-day-2',date:'2026-08-18',updatedAt:'2026-08-18T19:00:00.000Z',dayKey:'day2',
 dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.4.3',
 prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',exercises:[
  {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3,variations:['Lat pulldown'],defaultVariation:'Lat pulldown'}
 ]},
 exercises:[{exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',variationId:'latPulldown',load:'143',sets:'3',reps:'10, 10, 10',rpe:'6',completed:true,notes:'Seated setup; clean repetitions.'}]
};
const correctedAugust11Pulldown=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(august11PulldownRaw)}))`));
const correctedAugust18Pulldown=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(august18PulldownRaw)}))`));
const standingPulldown=correctedAugust11Pulldown.exercises[0];
const seatedPulldown=correctedAugust18Pulldown.exercises[0];
assert.equal(standingPulldown.variation,'Modified standing lat pulldown');
assert.equal(standingPulldown.variationId,'modifiedStandingLatPulldown');
assert.equal(seatedPulldown.variation,'Seated lat pulldown');
assert.equal(seatedPulldown.variationId,'seatedLatPulldown');
assert.deepEqual(
 {load:standingPulldown.load,reps:standingPulldown.reps,rpe:standingPulldown.rpe,notes:standingPulldown.notes},
 {load:'143',reps:'10, 10, 10',rpe:'7',notes:'Modified standing setup.'},
 'the Aug 11 correction changes only variation metadata'
);
assert.deepEqual(
 {load:seatedPulldown.load,reps:seatedPulldown.reps,rpe:seatedPulldown.rpe,notes:seatedPulldown.notes},
 {load:'143',reps:'10, 10, 10',rpe:'6',notes:'Seated setup; clean repetitions.'},
 'the Aug 18 correction changes only variation metadata'
);
assert.deepEqual(correctedAugust11Pulldown.prescriptionSnapshot,august11PulldownRaw.prescriptionSnapshot,'the Aug 11 prescription snapshot remains untouched');
assert.deepEqual(correctedAugust18Pulldown.prescriptionSnapshot,august18PulldownRaw.prescriptionSnapshot,'the Aug 18 prescription snapshot remains untouched');
const correctedAugust18Twice=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(correctedAugust18Pulldown)}))`));
assert.equal(correctedAugust18Twice.exercises[0].historicalCorrections.filter(value=>value==='august18-day2-seated-pulldown-variation-v1').length,1,'the seated correction is idempotent');
const pulldownComparison=JSON.parse(evaluate(`JSON.stringify((()=>{
 entries=[normalizeEntry(${JSON.stringify(august11PulldownRaw)}),normalizeEntry(${JSON.stringify(august18PulldownRaw)})];
 const data=previousResultData(SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull'),'Seated lat pulldown');
 return {selectedDate:data.selected?.entry.date,standingComparable:data.candidates.find(item=>item.entry.date==='2026-08-11')?.comparable,seatedComparable:data.candidates.find(item=>item.entry.date==='2026-08-18')?.comparable};
})())`));
assert.deepEqual(pulldownComparison,{selectedDate:'2026-08-18',standingComparable:false,seatedComparable:true},'seated progression uses Aug 18 and excludes the Aug 11 standing result');
const standingPulldownReference=evaluate(`previousResultReference(SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull'),'Modified standing lat pulldown')`);
assert.match(standingPulldownReference,/Last on modified standing lat pulldown/,'the standing result remains independently visible in history');
const correctedSeatedMarkdown=evaluate(`markdownExercise(definitionForSavedEntry(${JSON.stringify(correctedAugust18Pulldown)}).exercises[0],${JSON.stringify(seatedPulldown)},${JSON.stringify(correctedAugust18Pulldown)})`);
assert.match(correctedSeatedMarkdown,/Completed result: Seated lat pulldown/,'coach exports include the corrected seated variation');
const unrelatedGenericPulldown=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({id:'generic-pulldown',date:'2026-08-10',dayKey:'day2',exercises:[{exerciseId:'verticalPull',variation:'Lat pulldown',variationId:'latPulldown'}]}))`));
assert.equal(unrelatedGenericPulldown.exercises[0].variation,'Lat pulldown','the correction does not relabel other historical dates');
storage.set('aftWorkoutEntries.v1',JSON.stringify([august11PulldownRaw,august18PulldownRaw]));
evaluate(`entries=[normalizeEntry(${JSON.stringify(august11PulldownRaw)}),normalizeEntry(${JSON.stringify(august18PulldownRaw)})]`);
assert.equal(evaluate('persistKnownHistoricalCorrections()'),true);
const storedPulldownCorrections=JSON.parse(storage.get('aftWorkoutEntries.v1'));
assert.equal(storedPulldownCorrections[0].exercises[0].variationId,'modifiedStandingLatPulldown');
assert.equal(storedPulldownCorrections[1].exercises[0].variationId,'seatedLatPulldown');
assert.equal(evaluate('persistKnownHistoricalCorrections()'),false,'persisted pulldown corrections are not rewritten');
storage.delete('aftWorkoutEntries.v1');

evaluate(`entries=[];august5Fixture=normalizeEntry({
 id:'august-5-day-3',date:'2026-08-05',updatedAt:'2026-08-05T19:00:00.000Z',dayKey:'day3',
 dayLabel:SESSIONS.day3.label,sessionType:'primary',programId:PROGRAM.id,programName:PROGRAM.name,
 programVersion:'1.3',programEffectiveDate:'2026-08-01',duration:'60',sessionRpe:'7',preSoreness:'1',readiness:'4',sleepQuality:'fair',painDuring:'0',
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',targetSessionRpe:'7–8',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'95 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{Barbell:45,'Smith machine':20}},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, 45-sec hard cardio, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.2'}
 ]},
 exercises:[
  {exerciseId:'romanianDeadlift',name:'Romanian deadlift',prescription:'95 lb total for 2 × 8',type:'weighted',variation:'Barbell',load:'70',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8',rpe:'6',completed:true},
  {exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.2',rounds:'2',carryLoad:'45',carrySeconds:'30',stepReps:'6',modality:'Bike',intervalSeconds:'45',restSeconds:'150',rpe:'7',completed:true}
 ]
})`);
const august5Fixture=JSON.parse(evaluate('JSON.stringify(august5Fixture)'));
const august5Circuit=august5Fixture.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
assert.deepEqual(august5Circuit.components.map(component=>component.id),['farmerCarry','lateralStepUps','hardCardio','backwardSledDrag','forwardSledPush','rest']);
assert.equal(august5Circuit.components.find(component=>component.id==='hardCardio').sharedResult.durationSeconds,'30');
assert.equal(august5Circuit.components.find(component=>component.id==='hardCardio').sharedResult.modality,'Bike','the selected historical modality is preserved');
assert.equal(august5Circuit.components.find(component=>component.id==='backwardSledDrag').sharedResult.distanceMode,'unknown');
assert.equal(august5Circuit.components.find(component=>component.id==='backwardSledDrag').sharedResult.loadMode,'unknown');
assert.equal(august5Circuit.components.find(component=>component.id==='forwardSledPush').sharedResult.direction,'forward_push');
assert.equal(august5Circuit.historicalCorrections.filter(value=>value==='august5-day3-sled-components-v1').length,1);
const august5Twice=JSON.parse(evaluate('JSON.stringify(normalizeEntry(august5Fixture))'));
assert.equal(august5Twice.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit').components.length,6,'historical correction is idempotent');
assert.equal(august5Twice.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit').historicalCorrections.length,1);
const preMigrationStored=structuredClone(august5Fixture);
const preMigrationCircuit=preMigrationStored.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit');
delete preMigrationCircuit.components;
delete preMigrationCircuit.historicalCorrections;
storage.set('aftWorkoutEntries.v1',JSON.stringify([preMigrationStored]));
evaluate('entries=[august5Fixture]');
assert.equal(evaluate('persistKnownHistoricalCorrections()'),true);
assert.ok(JSON.parse(storage.get('aftWorkoutEntries.v1'))[0].exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit').historicalCorrections.includes('august5-day3-sled-components-v1'));
storage.delete('aftWorkoutEntries.v1');
const august5CircuitAdherence=JSON.parse(evaluate(`JSON.stringify((()=>{const definition=definitionForSavedEntry(august5Fixture).exercises.find(exercise=>exercise.id==='gymConditioningCircuit');return prescriptionAdherenceDetail(definition,august5Fixture.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit'))})())`));
assert.equal(august5CircuitAdherence.value,'modified');
assert.ok(august5CircuitAdherence.reasons.some(reason=>reason.code==='duration_below_minimum'));
assert.equal(august5CircuitAdherence.reasons.filter(reason=>reason.code==='unplanned_component_added').length,2);
assert.equal(evaluate(`circuitComponentAdherence(CIRCUIT_TEMPLATES['foundation-1.2'].components.find(component=>component.id==='rest'),august5Fixture.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit').components.find(component=>component.id==='rest')).value`),'met','150 seconds matches 2:30');
assert.equal(evaluate(`prescriptionAdherence(definitionForSavedEntry(august5Fixture).exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),{type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'2',carryLoad:'45',carrySeconds:'30',stepReps:'6',modality:'Bike',intervalSeconds:'45',restSeconds:'150'})`),'met','the fully matched legacy circuit compatibility path remains assessable');
assert.equal(evaluate(`prescriptionAdherence(definitionForSavedEntry(august5Fixture).exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),{type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'3',carryLoad:'45',carrySeconds:'30',stepReps:'6',modality:'Bike',intervalSeconds:'45',restSeconds:'150'})`),'modified','exceeding the exact circuit round cap is a modification');
assert.equal(evaluate(`sledTotalDistance({distanceMode:'known',trips:'2',distancePerTrip:'20',distanceUnit:'yd'})`),40);
assert.equal(evaluate(`sledTotalSystemWeight({loadMode:'added_plus_sled',addedPlateWeight:'90',emptySledWeight:'70'})`),160);
const tankM4Markdown=evaluate(`markdownSledPerformance({direction:'backward_drag',trips:'1',distanceMode:'lane_unknown',distanceLabel:'Approximately 20 yd gym lane',loadMode:'unknown',equipmentLabel:'Torque Fitness TANK M4 · Level 3'})`);
assert.match(tankM4Markdown,/Distance: Approximately 20 yd gym lane \(length unknown\)/);
assert.match(tankM4Markdown,/Equipment: Torque Fitness TANK M4 · Level 3/);
assert.match(tankM4Markdown,/Load: Unknown \/ not recorded/,'Level 3 is exported as equipment resistance rather than pounds');
assert.doesNotMatch(tankM4Markdown,/Level 3 lb/);
const perRoundCircuit=JSON.parse(evaluate(`JSON.stringify(normalizeCircuitComponent({id:'backwardSledDrag',name:'Backward sled drag',type:'sled',resultMode:'per_round',roundResults:[
 {round:1,performed:true,direction:'backward_drag',distanceMode:'known',trips:'1',distancePerTrip:'20',distanceUnit:'yd',surface:'turf'},
 {round:2,performed:true,direction:'backward_drag',distanceMode:'lane_unknown',distanceLabel:'one gym lane',surface:'turf'}
]}))`));
assert.equal(perRoundCircuit.roundResults.length,2);
assert.equal(perRoundCircuit.roundResults[0].totalDistance,'20');

evaluate(`entries=[];activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.day3;activeWorkoutDate='2026-08-08'`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-06').scope`),'next_occurrence');
const circuitCard=evaluate(`exerciseCard(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),8,defaultExerciseState(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit')))`);
assert.ok(circuitCard.indexOf('Farmer carry')<circuitCard.indexOf('Backward sled drag'));
assert.ok(circuitCard.indexOf('Backward sled drag')<circuitCard.indexOf('Forward sled push'));
assert.match(circuitCard,/Performed as planned/,'the sled sequence is the v1.4 baseline rather than a one-time directive');
assert.match(circuitCard,/Torque Fitness TANK M4/);
assert.match(circuitCard,/Level 3/);
assert.match(circuitCard,/data-circuit-field="addedPlateWeight"/);
assert.match(circuitCard,/data-circuit-field="emptySledWeight"/);
assert.match(circuitCard,/data-circuit-field="distancePerTrip"/);
evaluate(`{
 legacyDay3Definition=definitionForSavedEntry(august5Fixture);
 legacyCircuitDefinition=legacyDay3Definition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit');
 activeProgramContext={...currentProgramMeta(),version:'1.3'};
 activeSessionDefinition=legacyDay3Definition;
 activeWorkoutDate='2026-08-06';
 legacyCircuitCard=exerciseCard(legacyCircuitDefinition,1,defaultExerciseState(legacyCircuitDefinition));
 const directive=activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-06');
 const components=directive.circuitDirective.components.map((component,index)=>normalizeCircuitComponent({
  ...component,planned:null,directivePlanned:component.planned,resultMode:'shared',
  sharedResult:{...component.planned,performed:true,modality:component.type==='cardio'?'Bike':undefined,rpe:component.type==='sled'?'6':undefined,loadMode:component.type==='sled'?'unknown':undefined}
 },index));
 directiveFixture=normalizeEntry({id:'next-day-3',date:'2026-08-12',dayKey:'day3',dayLabel:legacyDay3Definition.label,sessionType:'primary',programVersion:'1.3',
  prescriptionSnapshot:august5Fixture.prescriptionSnapshot,exercises:[{exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'2',rpe:'7',components,appliedCoachDirective:directive}]
 });
}`);
assert.match(evaluate('legacyCircuitCard'),/Performed as directed/,'historical v1.3 directive behavior remains available');
assert.equal(evaluate(`circuitDirectiveAdherenceDetail(legacyCircuitDefinition,directiveFixture.exercises[0]).value`),'met');
assert.equal(evaluate(`circuitAdherenceDetail(legacyCircuitDefinition,directiveFixture.exercises[0]).value`),'modified','baseline prescription and directive adherence remain separate');
evaluate(`entries=[directiveFixture]`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-12')`),null,'a saved completed occurrence consumes the directive');
assert.equal(evaluate('PROGRAM.version'),'1.4.5','consuming a historical directive does not change the current program version');
evaluate(`entries=[];activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.day3;activeWorkoutDate='2026-08-08'`);

const fakeCard={
 querySelector(selector){
  const values={
   '[data-field="runMinutes"]':'1',
   '[data-field="walkMinutes"]':'1',
   '[data-field="rounds"]':'2',
   '[data-field="continuousMinutes"]':''
  };
  return {value:values[selector]??''};
 }
};
context.fakeCard=fakeCard;
const plan=evaluate('buildRunTimerPlan(fakeCard)');
assert.equal(plan.length,4);
assert.equal(plan[0].kind,'walk','each interval round must begin with walking');
assert.equal(plan[1].kind,'run');
assert.equal(plan[2].round,2);

const pace=evaluate(`calculatedPaceDetails({
 totalTime:'24:00',distance:'1.86',programmedIntervalTime:'20:00'
})`);
assert.equal(pace.value,'12:54');
assert.equal(pace.basis,'totalElapsedTime','elapsed time must take priority over programmed time');
const fallbackPace=evaluate(`calculatedPaceDetails({
 totalTime:'',distance:'1.86',programmedIntervalTime:'20:00'
})`);
assert.equal(fallbackPace.value,'10:45');
assert.equal(fallbackPace.basis,'programmedIntervalTime');
assert.equal(evaluate(`compactResultSummary(SESSIONS.day4.exercises[0],{
 type:'run',distance:'1.86',totalTime:'',programmedIntervalTime:'20:00'
})`),'1.86 mi · 20:00 · 10:45/mi (interval-time basis)','Last Result labels programmed-time pace explicitly');
assert.equal(evaluate(`calculatedPaceDetails({totalTime:'20',distance:'1.55'}).value`),'12:54','plain run time means minutes');
assert.equal(evaluate(`calculatedPaceDetails({totalTime:'30',distance:'2'}).value`),'15:00');
assert.equal(evaluate(`parseRunDuration('20')`),1200);
assert.equal(evaluate(`parseTime('30')`),30,'plain timed-set values remain seconds');
assert.equal(evaluate(`formatCompletedTime('8',{type:'timed',prescription:'5–10 minutes'})`),'8:00','legacy whole-session mobility values use the minute-based prescription');
assert.equal(evaluate(`formatCompletedTime('8:00',{type:'timed',prescription:'5–10 minutes'})`),'8:00','properly formatted minute durations remain unchanged');
assert.equal(evaluate(`formatCompletedTime('8 min',{type:'timed',prescription:'5–10 minutes'})`),'8:00','explicit minute units remain minutes');
assert.equal(evaluate(`formatCompletedTime('30',{type:'timed',prescription:'3 × 35 sec'})`),'30 sec','front-plank values remain seconds');
assert.equal(evaluate(`formatCompletedTime('30',{type:'timed',prescription:'3 × 35 sec each side'})`),'30 sec','side-plank values remain seconds');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'5–10 minutes'},{type:'timed',completed:true,times:'8'})`),'met','legacy mobility duration is also assessed in the correct unit');
const exactStage2Run=`{
 type:'run',completed:true,runStage:'2',walkMinutes:'1',runMinutes:'1.5',rounds:'8',completedRounds:'8',
 programmedIntervalTime:'20:00',totalTime:'23:00',distance:'1.81',warmupMinutes:'5',rpe:'6'
}`;
assert.equal(evaluate(`prescriptionAdherence({type:'run',runStage:2,prescription:'Stage 2 — 1:00 walk / 1:30 run × 8'},${exactStage2Run})`),'met','exact structured Stage 2 work is assessable');
assert.equal(evaluate(`prescriptionAdherence({type:'run',runStage:2,prescription:'Stage 2 — 1:00 walk / 1:30 run × 8'},{...${exactStage2Run},totalTime:'29:00'})`),'met','extra elapsed time never changes structured interval adherence');
assert.equal(evaluate(`prescriptionAdherence({type:'run',runStage:2,prescription:'Stage 2 — 1:00 walk / 1:30 run × 8'},{...${exactStage2Run},completedRounds:'7'})`),'below_target');
assert.equal(evaluate(`paceDifferenceIsMaterial(parsePace('12:54'),parsePace('14:16'))`),true);
assert.equal(evaluate(`paceDifferenceIsMaterial(parsePace('12:54'),parsePace('13:00'))`),false);
const runLoggingMarkup=evaluate(`runFields('run',runDefaults(2))`);
assert.ok(runLoggingMarkup.indexOf('Set the interval plan')<runLoggingMarkup.indexOf('Run the workout'));
assert.ok(runLoggingMarkup.indexOf('Run the workout')<runLoggingMarkup.indexOf('Record the result'));
assert.match(runLoggingMarkup,/<details class="exercise-inline-details" >/,'unused advanced run fields stay collapsed');
const runProgress=evaluate(`runRecords([{
 id:'run-entry',date:'2026-07-31',updatedAt:'2026-07-31T12:00:00Z',dayKey:'day4',sessionType:'primary',
 exercises:[{exerciseId:'primaryRun',type:'run',completed:true,runStage:'1',distance:'1.86',totalTime:'24:00',runPain:'0'}]
}])`);
context.runProgress=runProgress;
const runWeek=evaluate(`weeklyRunMetrics(runProgress,'2026-07-27')`);
assert.equal(runWeek.distance,1.86);
assert.equal(runWeek.seconds,1440);
assert.equal(evaluate('painFreeRunCount(runProgress)'),1);
assert.equal(evaluate('bestPaceByStage(runProgress)[0].pace'),'12:54');

const weeks=evaluate(`weeklyMetrics([{
 date:'2026-07-29',
 exercises:[
  {exerciseId:'handReleasePushups',completed:true,reps:'6, 6, 6, 6, 6'},
  {exerciseId:'plank',completed:true,times:'0:25, 0:30'},
  {exerciseId:'sidePlank',completed:true,times:'0:40, 0:40'}
 ]
}])`);
assert.equal(weeks[0].week,'2026-07-27','weeks start on Monday');
assert.equal(weeks[0].pushups,30);
assert.equal(weeks[0].plankSeconds,55,'side-plank time must stay separate');

const oldEntry={
 id:'legacy',
 date:'2026-07-20',
 dayKey:'day2',
 dayLabel:'Old Day 2',
 painScore:'3',
 exercises:[
  {name:'Hand-release push-ups',prescription:'5 submaximal sets',type:'body',reps:'5, 5'},
  {name:'Lunge pattern',prescription:'3 × 8 each leg',type:'weighted',load:'20'}
 ]
};
context.oldEntry=oldEntry;
const oldDefinition=evaluate('definitionForSavedEntry(oldEntry)');
assert.equal(oldDefinition.exercises.length,2);
assert.equal(oldDefinition.exercises[1].id,'lungePattern');
assert.equal(oldDefinition.exercises[1].prescription,'3 × 8 each leg');

const historicalVariationDefinition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-01',dayKey:'day1',dayLabel:'Day 1 — Deadlift and Intervals',
 prescriptionSnapshot:{sessionKey:'day1',label:'Day 1 — Deadlift and Intervals',exercises:[
  {id:'squatOrLegPress',name:'Leg press',prescription:'Coach-old prescription',type:'weighted',unit:'lb',sets:3,variations:['Leg press'],defaultVariation:'Leg press',coachingNotes:'Coach-old note'}
 ]}
}))`));
assert.equal(historicalVariationDefinition.exercises[0].prescription,'Coach-old prescription','historical prescription remains frozen');
assert.equal(historicalVariationDefinition.exercises[0].coachingNotes,'Coach-old note','historical coaching notes remain frozen');
assert.ok(historicalVariationDefinition.exercises[0].variations.includes('Lying leg press'),'current logging-only variations are available in historical edits');

const historicalV142Day1=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-17',dayKey:'day1',dayLabel:'Day 1 — Deadlift and Intervals',programVersion:'1.4.2',
 prescriptionSnapshot:{sessionKey:'day1',sessionType:'primary',label:'Day 1 — Deadlift and Intervals',exercises:[
  {id:'deadlift',name:'Trap-bar deadlift',prescription:'145 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:145,targetLoadVariation:'Trap / hex bar',coachingNotes:'Historical v1.4.2 deadlift guidance'},
  {id:'plank',name:'Front plank',prescription:'3 × 35 sec',type:'timed',sets:3}
 ]}
}))`));
assert.equal(historicalV142Day1.exercises[0].prescription,'145 lb total for 3 × 5','v1.4.2 deadlift prescription remains frozen');
assert.equal(historicalV142Day1.exercises[0].targetLoad,145,'v1.4.2 deadlift target remains frozen');
assert.equal(historicalV142Day1.exercises[0].coachingNotes,'Historical v1.4.2 deadlift guidance','v1.4.2 coaching remains frozen');
assert.equal(historicalV142Day1.exercises[1].prescription,'3 × 35 sec','v1.4.2 plank prescription remains frozen');

const historicalV143Day2=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-18',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',programVersion:'1.4.3',
 prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',exercises:[
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 7',type:'body',sets:5},
  {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3,variations:['Lat pulldown'],defaultVariation:'Lat pulldown',coachingNotes:'Historical 143-lb same-setup cue'},
  {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press'},
  {id:'chestSupportedRow',name:'Machine row',prescription:'88 lb for 3 × 11',type:'weighted',unit:'lb',sets:3,targetLoad:88,targetLoadVariation:'Machine row'}
 ]}
}))`));
assert.equal(historicalV143Day2.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'5 × 7');
assert.equal(historicalV143Day2.exercises.find(exercise=>exercise.id==='verticalPull').prescription,'3 × 8–10');
assert.equal(historicalV143Day2.exercises.find(exercise=>exercise.id==='verticalPull').coachingNotes,'Historical 143-lb same-setup cue');
assert.equal(historicalV143Day2.exercises.find(exercise=>exercise.id==='overheadPress').prescription,'25 lb per hand for 3 × 9');
assert.equal(historicalV143Day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').targetLoad,88,'v1.4.3 machine-row adherence metadata remains frozen');

const august9V14Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-09',dayKey:'day1',dayLabel:'Day 1 — Deadlift and Intervals',programVersion:'1.4',
 prescriptionSnapshot:{sessionKey:'day1',sessionType:'primary',label:'Day 1 — Deadlift and Intervals',exercises:[
  {id:'deadlift',name:'Trap-bar deadlift',prescription:'145 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:145,targetLoadVariation:'Trap / hex bar'},
  {id:'squatOrLegPress',name:'Leg press',prescription:'3 × 8',type:'weighted',unit:'lb',sets:3},
  {id:'horizontalPress',name:'Horizontal press',prescription:'3 × 8–10',type:'weighted',unit:'lb per hand',sets:3},
  {id:'seatedRow',name:'Seated cable row',prescription:'3 × 10',type:'weighted',unit:'lb',sets:3},
  {id:'loadedCarry',name:'Farmer carry',prescription:'4 trips of approximately 30–40 yd',type:'carry',unit:'lb per hand',sets:4},
  {id:'plank',name:'Front plank',prescription:'3 × 35 sec',type:'timed',sets:3},
  {id:'runWalkIntervals',name:'Walk / run intervals',prescription:'Stage 3 — 1:00 walk / 2:00 run × 7',type:'interval',runStage:3},
  {id:'dumbbellCurl',name:'Dumbbell curls',prescription:'2 × 10–12',type:'weighted',unit:'lb per hand',sets:2,optional:true},
  {id:'tricepsPressdown',name:'Cable triceps pressdowns',prescription:'2 × 10–15',type:'weighted',unit:'lb total',sets:2,optional:true}
 ]}
}))`));
assert.deepEqual(
 Object.fromEntries(august9V14Definition.exercises.map(exercise=>[exercise.id,exercise.prescription])),
 {
  deadlift:'145 lb total for 3 × 5',squatOrLegPress:'3 × 8',horizontalPress:'3 × 8–10',seatedRow:'3 × 10',
  loadedCarry:'4 trips of approximately 30–40 yd',plank:'3 × 35 sec',runWalkIntervals:'Stage 3 — 1:00 walk / 2:00 run × 7',
  dumbbellCurl:'2 × 10–12',tricepsPressdown:'2 × 10–15'
 },
 'the August 9 v1.4 Day 1 prescription snapshot remains unchanged'
);
assert.equal(august9V14Definition.exercises.some(exercise=>exercise.id==='preacherCurl'),false,'the new preacher curl is not inserted into August 9 history');

const august11V14Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-11',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',programVersion:'1.4',
 prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',exercises:[
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 6',type:'body',sets:5},
  {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3},
  {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'25 lb per hand for 3 × 8–10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:25,targetLoadVariation:'Seated dumbbell press'},
  {id:'chestSupportedRow',name:'Machine row',prescription:'77 lb for 3 × 11',type:'weighted',unit:'lb',sets:3,targetLoad:77,targetLoadVariation:'Machine row'},
  {id:'lateralRaise',name:'Dumbbell lateral raises',prescription:'2 × 12–15',type:'weighted',unit:'lb per hand',sets:2,defaultVariation:'Machine lateral raise'},
  {id:'trunkStability',name:'Dead bug or Pallof press',prescription:'3 × 10 each side',type:'body',sets:3},
  {id:'easyCardio',name:'Easy cardio',prescription:'25–30 minutes',type:'cardio'}
 ]}
}))`));
assert.equal(august11V14Definition.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'5 × 6');
assert.equal(august11V14Definition.exercises.find(exercise=>exercise.id==='overheadPress').prescription,'25 lb per hand for 3 × 8–10');
assert.equal(august11V14Definition.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription,'77 lb for 3 × 11');
assert.equal(august11V14Definition.exercises.find(exercise=>exercise.id==='lateralRaise').name,'Dumbbell lateral raises');
assert.equal(august11V14Definition.exercises.some(exercise=>exercise.id==='chestFly'),false,'the new chest fly is not inserted into August 11 history');

const august15V141Day3Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-15',dayKey:'day3',dayLabel:'Day 3 — Lower Strength and Gym Conditioning',programVersion:'1.4.1',
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'115 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:115,targetLoadVariation:'Barbell'},
  {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 8',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat'},
  {id:'inclinePress',name:'Incline dumbbell press',prescription:'30 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Incline dumbbell press'},
  {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'40 lb for 3 × 11 each side',type:'weighted',unit:'lb',sets:3,targetLoad:40,targetLoadVariation:'One-arm dumbbell row'},
  {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 8 each leg',type:'weighted',unit:'lb total',sets:2},
  {id:'sidePlank',name:'Side plank',prescription:'3 × 35 sec each side',type:'timed',sets:3},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4'},
  {id:'hammerCurl',name:'Hammer curl',prescription:'2 × 10–15',type:'weighted',unit:'lb per hand',sets:2,targetRpe:'7–9',optional:true},
  {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'2 × 10–15',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',optional:true}
 ]}
}))`));
assert.equal(august15V141Day3Definition.exercises.find(exercise=>exercise.id==='oneArmRow').prescription,'40 lb for 3 × 11 each side');
assert.equal(august15V141Day3Definition.exercises.find(exercise=>exercise.id==='oneArmRow').targetLoad,40);
assert.equal(august15V141Day3Definition.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,'2 × 10–15');
assert.equal(august15V141Day3Definition.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoad,undefined,'the new 25-lb target is not inserted into v1.4.1 history');

const august20V144Fixture=`{
 id:'august20-day3',date:'2026-08-20',dayKey:'day3',dayLabel:'Day 3 — Lower Strength and Gym Conditioning',programVersion:'1.4.4',
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',warmup:'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive Romanian-deadlift warm-up sets.',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'115 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:115,targetLoadVariation:'Barbell'},
  {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 8',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat'},
  {id:'inclinePress',name:'Incline dumbbell press',prescription:'30 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Incline dumbbell press'},
  {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'45 lb for 3 × 10 each side',type:'weighted',unit:'lb',sets:3,targetLoad:45,targetLoadVariation:'One-arm dumbbell row'},
  {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 8 each leg',type:'weighted',unit:'lb total',sets:2},
  {id:'sidePlank',name:'Side plank',prescription:'3 × 35 sec each side',type:'timed',sets:3},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4'},
  {id:'hammerCurl',name:'Hammer curl',prescription:'25 lb per hand for 2 × 10–15',type:'weighted',unit:'lb per hand',sets:2,targetLoad:25,targetLoadVariation:'Dumbbell hammer curl',optional:true},
  {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'2 × 10–15',type:'weighted',unit:'lb total',sets:2,optional:true}
 ]},
 exercises:[{exerciseId:'hammerCurl',name:'Hammer curl',type:'weighted',variation:'Dumbbell hammer curl',load:'20',sets:'2',reps:'12, 12',rpe:'7',completed:true,notes:'Current valid working load.'}]
}`;
const august20V144Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${august20V144Fixture}))`));
const august20V144Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${august20V144Fixture}))`));
assert.equal(august20V144Definition.warmup,'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive Romanian-deadlift warm-up sets.');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='romanianDeadlift').prescription,'115 lb total for 2 × 8');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,'25 lb per hand for 2 × 10–15');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit').circuitVersion,'foundation-1.4');
assert.equal(august20V144Entry.exercises[0].load,'20','the raw August 20 hammer-curl load remains unchanged');
assert.equal(august20V144Entry.exercises[0].reps,'12, 12','the raw August 20 repetitions remain unchanged');

const august15V141Day4Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry({
 date:'2026-08-15',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',programVersion:'1.4.1',
 prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',exercises:[
  {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 3 — 1:00 walk / 2:00 run × 7',type:'run',runStage:3,coachingNotes:'Progress running duration, not speed. Keep the running pace relaxed and controlled.'},
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 7',type:'body',sets:4},
  {id:'plank',name:'Front plank',prescription:'Set 1: 35 sec · Set 2: 35 sec · Set 3: 30 sec',type:'timed',sets:3,prescribedTimes:['0:35','0:35','0:30']},
  {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
 ]}
}))`));
const august15V141Run=august15V141Day4Definition.exercises.find(exercise=>exercise.id==='primaryRun');
const august15V141Plank=august15V141Day4Definition.exercises.find(exercise=>exercise.id==='plank');
assert.equal(august15V141Run.targetRpe,undefined,'the new run RPE target is not inserted into v1.4.1 history');
assert.doesNotMatch(august15V141Run.coachingNotes,/6\.2/,'the new treadmill guidance is not inserted into v1.4.1 history');
assert.equal(august15V141Plank.prescription,'Set 1: 35 sec · Set 2: 35 sec · Set 3: 30 sec');
assert.deepEqual(august15V141Plank.prescribedTimes,['0:35','0:35','0:30']);

assert.equal(evaluate(`(()=>{
 const prior=entries;
 entries=[
  {exercises:[{exerciseId:'dumbbellCurl',completed:true},{exerciseId:'tricepsPressdown',completed:true}]},
  {exercises:[{exerciseId:'preacherCurl',completed:true},{exerciseId:'tricepsPressdown',completed:true}]},
  {exercises:[{exerciseId:'hammerCurl',completed:true},{exerciseId:'overheadTricepsExtension',completed:true}]},
  {exercises:[{exerciseId:'hammerCurl',completed:true},{exerciseId:'overheadTricepsExtension',completed:false}]}
 ];
 const count=armSupersetSessionCount();
 entries=prior;
 return count;
})()`),3,'arm-superset progress recognizes legacy and both v1.4.1 accessory pairings');

const snapshot=evaluate('snapshotSession(SESSIONS.day1)');
assert.equal(snapshot.exercises[0].id,'deadlift');
assert.equal(snapshot.exercises[0].prescription,'155 lb total for 3 × 5');

evaluate(`entries=[{
 id:'august-1-day-1',date:'2026-08-01',updatedAt:'2026-08-01T19:00:00.000Z',dayKey:'day1',
 dayLabel:'Day 1 — Deadlift and Intervals',sessionType:'primary',programVersion:'1.3',
 exercises:[
  {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',load:'45',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5',rpe:'7',completed:true},
  {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Lying leg press',load:'100',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true},
  {exerciseId:'horizontalPress',name:'Horizontal press',type:'weighted',unit:'lb per hand',variation:'Dumbbell bench press',load:'30',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true},
  {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',load:'77',sets:'3',reps:'10, 10, 10',rpe:'6',completed:true},
  {exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',load:'45',sets:'4',distance:'40',rpe:'6',completed:true},
  {exerciseId:'plank',name:'Front plank',type:'timed',sets:'3',times:'30, 30, 30',rpe:'7',completed:true},
  {exerciseId:'runWalkIntervals',name:'Walk / run intervals',type:'interval',runStage:'2',rounds:'8',completedRounds:'8',totalTime:'20',distance:'1.55',rpe:'7',completed:true},
  {exerciseId:'dumbbellCurl',name:'Dumbbell curls',type:'weighted',unit:'lb per hand',load:'25',sets:'2',reps:'12, 12',rpe:'7',completed:false},
  {exerciseId:'tricepsPressdown',name:'Cable triceps pressdowns',type:'weighted',unit:'lb total',load:'77',sets:'2',reps:'12, 12',rpe:'7',completed:true}
 ]
}]`);
const fixtureSummaries=JSON.parse(evaluate(`JSON.stringify(SESSIONS.day1.exercises.map(definition=>{
 const variations={deadlift:'Trap / hex bar',squatOrLegPress:'Lying leg press',horizontalPress:'Dumbbell bench press',seatedRow:'Seated cable row',loadedCarry:'Farmer carry'};
 const selected=previousResultData(definition,variations[definition.id]||'').selected;
 return [definition.id,selected?compactResultSummary(definition,selected.exercise):''];
}))`));
const summaryMap=Object.fromEntries(fixtureSummaries);
assert.equal(summaryMap.deadlift,'135 lb total · 3 × 5 · RPE 7');
assert.equal(summaryMap.squatOrLegPress,'100 lb · 3 × 8 · RPE 7');
assert.equal(summaryMap.horizontalPress,'30 lb/hand · 3 × 10 · RPE 7');
assert.equal(summaryMap.seatedRow,'77 lb · 3 × 10 · RPE 6');
assert.equal(summaryMap.loadedCarry,'4 trips × 40 yd · 45 lb/hand · RPE 6');
assert.equal(summaryMap.plank,'30 sec, 30 sec, 30 sec · RPE 7');
assert.match(summaryMap.runWalkIntervals,/1\.55 mi · 20:00 · 12:54\/mi/);
assert.equal(evaluate(`compactResultSummary({id:'dumbbellCurl',name:'Dumbbell curls',type:'weighted',unit:'lb per hand'},entries[0].exercises.find(exercise=>exercise.exerciseId==='dumbbellCurl'))`),'25 lb/hand · 2 × 12 · RPE 7','unchecked legacy curl results remain readable after the exercise is replaced');
assert.equal(summaryMap.tricepsPressdown,'77 lb total · 2 × 12 · RPE 7');
assert.equal(evaluate(`previousResultData(SESSIONS.day1.exercises[0],'Trap / hex bar',{excludeEntryId:'august-1-day-1'}).selected`),null,'editing excludes the workout itself');
const carryRoundTrip=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({
 id:'august-9-day-1',date:'2026-08-09',dayKey:'day1',dayLabel:SESSIONS.day1.label,sessionType:'primary',
 exercises:[${august9Carry}]
}))`));
assert.deepEqual(carryRoundTrip.exercises[0],{
 exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',load:'45',sets:'4',distance:'40',carrySeconds:'30',rpe:'6',completed:true
},'normalization preserves existing carry-history fields without rewriting raw values');
const carryBackup=JSON.parse(evaluate(`(()=>{
 const prior=entries;
 entries=[normalizeEntry({id:'august-9-day-1',date:'2026-08-09',dayKey:'day1',dayLabel:SESSIONS.day1.label,sessionType:'primary',exercises:[${august9Carry}]})];
 const backup=JSON.stringify(buildJsonBackup());
 entries=prior;
 return backup;
})()`));
assert.equal(carryBackup.version,11,'the carry patch does not require a storage-schema migration');
assert.deepEqual(carryBackup.entries[0].exercises[0],carryRoundTrip.exercises[0],'JSON backups preserve raw carry history');
assert.equal(evaluate(`previousResultData(SESSIONS.day1.exercises[0],'Trap / hex bar',{excludeEntryId:null,source:[
 {id:'older',date:'2026-08-01',updatedAt:'2026-08-01T10:00:00Z',exercises:[{exerciseId:'deadlift',type:'weighted',variation:'Trap / hex bar',load:'35'}]},
 {id:'newer',date:'2026-08-01',updatedAt:'2026-08-01T11:00:00Z',exercises:[{exerciseId:'deadlift',type:'weighted',variation:'Trap / hex bar',load:'45'}]}
]}).selected.exercise.load`),'45','updatedAt breaks same-date ties');
assert.equal(evaluate(`exerciseIdentity({exerciseId:'trapBarDeadlift'})`),'deadlift');
assert.equal(evaluate(`exerciseIdentity({exerciseId:'primaryRun'})`),'runWalkIntervals');
assert.equal(evaluate(`exerciseIdentity({name:'Loaded carry or hold'})`),'loadedCarry');
assert.equal(evaluate(`exerciseVariationId({variation:'Lying leg press'})`),'lyingLegPress');
assert.match(evaluate(`previousResultReference(SESSIONS.day1.exercises[1],'Upright leg press')`),/not directly comparable/);
const copiedLoad=JSON.parse(evaluate(`JSON.stringify(reusableLoadFields(entries[0].exercises[0]))`));
assert.deepEqual(copiedLoad,{load:'45',loadMode:'platesPerSide',barWeight:'45'});
const reviewIssues=JSON.parse(evaluate(`JSON.stringify(workoutReviewIssues({exercises:[
 {name:'Leg press',type:'weighted',sets:'3',reps:'8, 8',load:'100',completed:false},
 {name:'Dumbbell curls',type:'weighted',sets:'2',reps:'12, 12',load:'25',completed:false},
 {name:'Bench press',type:'weighted',sets:'3',reps:'',load:'95',completed:true},
 {name:'Front plank',type:'timed',sets:'3',times:'',rpe:'7',completed:true},
 {name:'Notes only',type:'weighted',sets:'3',notes:'Machine unavailable',completed:false}
]}))`));
assert.equal(reviewIssues.filter(issue=>issue.type==='completion').length,2);
assert.equal(reviewIssues.filter(issue=>issue.type==='reps').length,2,'partial and entirely missing reps are reviewed');
assert.equal(reviewIssues.filter(issue=>issue.type==='times').length,1,'entirely missing timed sets are reviewed');
assert.equal(evaluate(`hasData({type:'weighted',sets:'3',variation:'Dumbbell bench press',variationId:'dumbbellBenchPress'})`),false,'variation metadata alone is not a result');
assert.equal(evaluate(`hasMeaningfulResultData({exerciseId:'gymConditioningCircuit',type:'circuit',circuitVersion:'foundation-1.2'})`),false,'a blank circuit plan is not mistaken for performed work');
assert.equal(evaluate(`draftHasMeaningfulProgress({date:'2026-08-05',dayKey:'day4',exercises:[{type:'weighted',sets:'3',variation:'Dumbbells'}]})`),false,'an untouched workout shell is not recovered as an active draft');
assert.equal(evaluate(`draftHasMeaningfulProgress({date:'2026-08-05',dayKey:'day4',readiness:'4',exercises:[]})`),true,'pre-workout readiness preserves an in-progress draft');
assert.equal(evaluate(`draftHasMeaningfulProgress({date:'2026-08-05',dayKey:'day4',exercises:[{type:'weighted',load:'45'}]})`),true,'logged exercise data preserves an in-progress draft');
assert.equal(evaluate(`draftHasMeaningfulProgress({date:'2026-08-05',dayKey:'day4',exercises:[]},1000)`),true,'an active session timer preserves an in-progress draft');
storage.delete('aftSessionTimer.v1');
storage.set('aftWorkoutDraft.v1',JSON.stringify({savedAt:'2026-08-05T20:00:00.000Z',editingId:null,item:{date:'2026-08-05',dayKey:'day4',exercises:[{type:'weighted',sets:'3',variation:'Dumbbells'}]}}));
assert.equal(evaluate('loadDraft()'),null,'startup discards a stale untouched draft so newWorkout can assign today');
assert.equal(storage.has('aftWorkoutDraft.v1'),false,'the stale blank draft is removed from local storage');
storage.set('aftWorkoutDraft.v1',JSON.stringify({savedAt:'2026-08-05T20:00:00.000Z',editingId:null,item:{date:'2026-08-05',dayKey:'day4',readiness:'4',exercises:[]}}));
assert.equal(evaluate('loadDraft().item.date'),'2026-08-05','startup retains the original date for a genuinely in-progress draft');
storage.delete('aftWorkoutDraft.v1');

const elements={
 exportFrom:{value:'2026-07-01'},
 exportTo:{value:'2026-07-31'},
 markdownPreview:{value:''}
};
context.document={
 getElementById:id=>elements[id]||{value:'',classList:{add(){},remove(){},toggle(){}}}
};

elements.exportFrom.value='2026-08-07';
elements.exportTo.value='2026-08-07';
evaluate(`entries=[
 {
  id:'july-31-day-4',date:'2026-07-31',updatedAt:'2026-07-31T19:00:00.000Z',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',sessionType:'primary',programVersion:'1.2',
  prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',exercises:[
   {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
  ]},
  exercises:[{exerciseId:'mobility',name:'Mobility',type:'timed',times:'8',completed:true}]
 },
 {
  id:'august-3-hrpu',date:'2026-08-03',updatedAt:'2026-08-03T19:00:00.000Z',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.3',
  exercises:[{exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'6, 6, 6, 6, 4',completed:true}]
 },
 {
  id:'august-7-day-4',date:'2026-08-07',updatedAt:'2026-08-07T19:00:00.000Z',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',sessionType:'primary',programId:PROGRAM.id,programName:PROGRAM.name,
  programVersion:'1.3',programEffectiveDate:'2026-08-01',activeRunStage:2,duration:'45',sessionRpe:'6',painDuring:'1',painLocation:'left lateral knee',
  prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
   {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 2 — 1:00 walk / 1:30 run × 8',type:'run',runStage:2},
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 6',type:'body',sets:4},
   {id:'plank',name:'Front plank',prescription:'Set 1: 30 sec · Set 2: 30 sec · Set 3: 25 sec',type:'timed',sets:3,prescribedTimes:['0:30','0:30','0:25']},
   {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
  ]},
  exercises:[
   {exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',runStage:'2',walkMinutes:'1',runMinutes:'1.5',rounds:'8',completedRounds:'8',programmedIntervalTime:'20:00',totalTime:'23:00',distance:'1.81',warmupMinutes:'5',runPain:'1',rpe:'6',completed:true,exercisePain:{severity:1,laterality:'left',location:'lateral knee',causedExerciseToStop:false,note:'Mild tightness that improved while running.'}},
   {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'4',reps:'6, 6, 6, 6',completed:true},
   {exerciseId:'plank',name:'Front plank',type:'timed',sets:'3',times:'30, 30, 30',completed:true},
   {exerciseId:'mobility',name:'Mobility',type:'timed',times:'8',completed:true}
  ]
 }
].map(normalizeEntry)`);
assert.equal(evaluate(`definitionForSavedEntry(entries.find(entry=>entry.id==='august-7-day-4')).exercises.find(exercise=>exercise.id==='primaryRun').runStage`),2,'the historical August 7 prescription remains Stage 2');
assert.equal(evaluate(`weeklyMetricsForSelection(filtered(),entries)[0].pushups`),52,'a narrow export still uses the full Monday–Sunday practice total');
const august7Markdown=evaluate('buildMd()');
assert.match(august7Markdown,/\| Aug 3, 2026 \| 52 reps \| 1:30 \|/);
assert.match(august7Markdown,/Walk \/ run intervals[\s\S]*Prescription adherence: Met/);
assert.match(august7Markdown,/Total elapsed time: 23:00/);
assert.match(august7Markdown,/Exercise-specific pain: 1\/10 · Left · lateral knee · did not stop the exercise/);
assert.match(august7Markdown,/Exercise-pain note:[\s\S]*Mild tightness that improved while running\./);
assert.match(august7Markdown,/Run discomfort: 1\/10[\s\S]*Exercise RPE: 6\/10/);
assert.match(august7Markdown,/Previous comparable result:[\s\S]*Timed results: 8:00/,'legacy mobility is interpreted from its saved minute-based prescription');
assert.equal(evaluate(`(()=>{const entry=normalizeEntry(JSON.parse(JSON.stringify(entries.find(item=>item.id==='july-31-day-4'))));const definition=definitionForSavedEntry(entry).exercises[0];return compactResultSummary(definition,entry.exercises[0])})()`),'8:00','JSON round-trip preserves definition-aware legacy mobility display');

elements.exportFrom.value='2026-08-05';
elements.exportTo.value='2026-08-05';
evaluate('entries=[august5Fixture]');
const august5Markdown=evaluate('buildMd()');
assert.match(august5Markdown,/Romanian deadlift[\s\S]*Prescription adherence: Modified[\s\S]*Load above target: 115 lb completed vs 95 lb prescribed/);
assert.ok(august5Markdown.indexOf('**Farmer carry**')<august5Markdown.indexOf('**Backward sled drag**'));
assert.ok(august5Markdown.indexOf('**Backward sled drag**')<august5Markdown.indexOf('**Forward sled push**'));
assert.match(august5Markdown,/Direction: Backward drag/);
assert.match(august5Markdown,/Distance: Unknown \/ not recorded/);
assert.match(august5Markdown,/Load: Unknown \/ not recorded/);
assert.match(august5Markdown,/Backward sled drag was added outside the versioned prescription/);
assert.match(august5Markdown,/Forward sled push was added outside the versioned prescription/);
assert.match(august5Markdown,/Felt much better this week/);
const august5Csv=evaluate('buildCsv()');
assert.match(august5Csv,/"adherence_reasons"/);
assert.match(august5Csv,/"circuit_components_json"/);
assert.match(august5Csv,/"backwardSledDrag"/);
assert.match(august5Csv,/""loadMode"":""unknown""/);
assert.match(august5Csv,/"Load above target: 115 lb completed vs 95 lb prescribed"/);
elements.exportFrom.value='2026-08-12';
elements.exportTo.value='2026-08-12';
evaluate('entries=[directiveFixture]');
const directiveMarkdown=evaluate('buildMd()');
assert.match(directiveMarkdown,/Applied coach directive: Next Day 3 only/);
assert.match(directiveMarkdown,/Coach-directive adherence: Met/);
assert.match(directiveMarkdown,/Prescription adherence: Modified/);
const directiveCsv=evaluate('buildCsv()');
assert.match(directiveCsv,/"day3-sled-exposure-after-2026-08-05"/);
assert.match(directiveCsv,/"met"/);

elements.exportFrom.value='2026-07-01';
elements.exportTo.value='2026-08-03';
evaluate(`{
 const snapshot=snapshotSession(SESSIONS.day2);
 const savedPress=snapshot.exercises.find(exercise=>exercise.id==='overheadPress');
 savedPress.prescription='3 × 8–10';
 delete savedPress.targetLoad;
 delete savedPress.targetLoadVariation;
 const savedRow=snapshot.exercises.find(exercise=>exercise.id==='chestSupportedRow');
 savedRow.name='Chest-supported or machine row';
 savedRow.prescription='3 × 10–12';
 delete savedRow.targetLoad;
 delete savedRow.targetLoadVariation;
 const savedLateral=snapshot.exercises.find(exercise=>exercise.id==='lateralRaise');
 savedLateral.name='Dumbbell lateral raises';
 delete savedLateral.variations;
 delete savedLateral.defaultVariation;
 entries=[
  {
   id:'july-27-day-2',date:'2026-07-27',updatedAt:'2026-07-27T18:00:00.000Z',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.2',
   exercises:[
    {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'10, 8, 4, 5, 5',rpe:'8',completed:true},
    {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'25',sets:'3',reps:'8, 8, 8',rpe:'6',completed:true},
    {exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand',variation:'Machine lateral raise',load:'20',sets:'2',reps:'12, 12',rpe:'6',completed:true}
   ]
  },
  {
   id:'august-3-day-2',date:'2026-08-03',updatedAt:'2026-08-03T19:00:00.000Z',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',
   programId:PROGRAM.id,programName:PROGRAM.name,programVersion:'1.3',programEffectiveDate:'2026-08-01',duration:'65',sessionRpe:'7',preSoreness:'1',readiness:'2',sleepQuality:'poor',painDuring:'1',painLocation:'right medial elbow',
   notes:'Poor sleep and felt draggy/rundown.',prescriptionSnapshot:snapshot,
   exercises:[
    {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'6, 6, 6, 6, 4',rpe:'7',completed:true},
    {exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',load:'132',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Original pulldown note.'},
    {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'25',sets:'3',reps:'8, 8, 6',rpe:'8',completed:true},
    {exerciseId:'chestSupportedRow',name:'Chest-supported or machine row',type:'weighted',unit:'lb',variation:'Machine row',load:'77',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true},
    {exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand',load:'10',sets:'2',reps:'10, 10',rpe:'7',completed:true,exercisePain:{severity:1,location:'medial elbow',laterality:'right',note:'Minor twinge during dumbbell lateral raises.',causedExerciseToStop:false}},
    {exerciseId:'trunkStability',name:'Dead bug or Pallof press',type:'body',variation:'Dead bug',sets:'3',reps:'10, 10, 10',rpe:'6',completed:true},
    {exerciseId:'easyCardio',name:'Easy cardio',type:'cardio',modality:'Stationary bike',minutes:'20',distance:'5.5',outputUnit:'mi',rpe:'4',completed:true}
   ]
  },
  {
   id:'august-5-day-2',date:'2026-08-05',updatedAt:'2026-08-05T19:00:00.000Z',dayKey:'day2',dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.3',
   exercises:[{exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'30',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true}]
  }
 ];
}`);
const august3Adherence=JSON.parse(evaluate(`JSON.stringify((()=>{
 const entry=entries.find(item=>item.id==='august-3-day-2');
 const definition=definitionForSavedEntry(entry);
 return Object.fromEntries(definition.exercises.map((planned,index)=>[
  planned.id,prescriptionAdherence(planned,findSavedExercise(planned,entry.exercises,index))
 ]));
})())`));
assert.equal(august3Adherence.handReleasePushups,'below_target');
assert.equal(august3Adherence.verticalPull,'met');
assert.equal(august3Adherence.overheadPress,'below_target');
assert.equal(august3Adherence.chestSupportedRow,'met');
assert.equal(august3Adherence.lateralRaise,'below_target');
assert.equal(august3Adherence.trunkStability,'met');
assert.equal(august3Adherence.easyCardio,'below_target');
const august3Markdown=evaluate('buildMd()');
assert.match(august3Markdown,/## AFT-event practice volume/);
assert.match(august3Markdown,/Practice volume reflects accumulated training work and is not a benchmark or official AFT event result\./);
assert.match(august3Markdown,/sleep quality Poor/);
assert.match(august3Markdown,/Active coach note: Right medial-elbow discomfort occurred/);
assert.match(august3Markdown,/Exercise-specific pain: 1\/10 · Right · medial elbow · did not stop the exercise/);
assert.match(august3Markdown,/Exercise-pain note:[\s\S]*Minor twinge during dumbbell lateral raises\./);
const august3Section=august3Markdown.slice(august3Markdown.indexOf('### Aug 3, 2026'));
assert.equal((august3Section.match(/Previous comparable result:/g)||[]).length,2,'only push-ups and overhead press have a directly comparable prior result');
assert.match(august3Section,/Previous comparable result:[\s\S]*Date: Jul 27, 2026[\s\S]*Repetitions: 10, 8, 4, 5, 5[\s\S]*Total repetitions: 32/);
assert.match(august3Section,/Previous comparable result:[\s\S]*Load: 25 lb\/hand[\s\S]*Repetitions: 8, 8, 8[\s\S]*Exercise RPE: 6\/10/);
assert.doesNotMatch(august3Section,/Load: 30 lb\/hand/,'future workouts are never selected as previous results');
assert.doesNotMatch(august3Section,/Load: 20 lb\/hand/,'incompatible lateral-raise equipment is omitted');
const august3Json=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(august3Json.version,11);
assert.equal(august3Json.entries.find(entry=>entry.id==='august-3-day-2').sleepQuality,'poor');
assert.equal(august3Json.entries.find(entry=>entry.id==='august-3-day-2').exercises.find(exercise=>exercise.exerciseId==='lateralRaise').exercisePain.laterality,'right');
const august3Csv=evaluate('buildCsv()');
assert.match(august3Csv,/"sleep_quality"/);
assert.match(august3Csv,/"prescription_adherence"/);
assert.match(august3Csv,/"exercise_pain_severity"/);
assert.match(august3Csv,/"poor"/);
assert.match(august3Csv,/"medial elbow"/);
const august3RoundTrip=evaluate(`normalizeEntry(${JSON.stringify(JSON.parse(evaluate('JSON.stringify(entries.find(item=>item.id==="august-3-day-2"))')))})`);
assert.equal(august3RoundTrip.sleepQuality,'poor');
assert.equal(august3RoundTrip.exercises.find(exercise=>exercise.exerciseId==='lateralRaise').exercisePain.severity,1);
const overrideRoundTrip=evaluate(`normalizeEntry({id:'override',date:'2026-08-03',dayKey:'day2',exercises:[{exerciseId:'overheadPress',type:'weighted',adherenceOverride:{value:'met',reason:'Coach-approved modification'}}]})`);
assert.equal(overrideRoundTrip.exercises[0].adherenceOverride.reason,'Coach-approved modification');
const overrideBackup=JSON.parse(evaluate(`entries=[normalizeEntry({id:'override',date:'2026-08-03',dayKey:'day2',exercises:[{exerciseId:'overheadPress',type:'weighted',adherenceOverride:{value:'met',reason:'Coach-approved modification'}}]})];JSON.stringify(buildJsonBackup())`));
assert.equal(overrideBackup.entries[0].exercises[0].adherenceOverride.value,'met');

elements.exportFrom.value='2026-07-01';
elements.exportTo.value='2026-07-31';
evaluate(`entries=[{
 id:'saved',
 date:'2026-07-29',
 dayKey:'day4',
 dayLabel:'Day 4 — Run and Calisthenics',
 sessionType:'primary',
 programId:PROGRAM.id,
 programName:PROGRAM.name,
 programVersion:'1.2',
 programEffectiveDate:'2026-07-29',
 activeRunStage:1,
 duration:'30',
 sessionRpe:'6',
 preSoreness:'2',
 readiness:'4',
 painDuring:'0',
 painLocation:'',
 postSoreness:'',
 notes:'Good session.\\nEnergy stayed steady.',
 prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
  {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 1 — 1:00 walk / 1:00 run × 10',type:'run',runStage:1}
 ]},
 exercises:[
  {exerciseId:'primaryRun',name:'Walk / run intervals',prescription:'Stage 1',type:'run',runStage:'1',walkMinutes:'1',runMinutes:'1',rounds:'10',completedRounds:'10',programmedIntervalTime:'20:00',totalTime:'24:00',distance:'1.86',deviceReportedPace:'14:16',runPain:'0',completed:true,rpe:'5',notes:'Relaxed pace.\\nNo pain.'}
 ]
}]`);
const markdown=evaluate('buildMd()');
assert.match(markdown,/AFT Foundation Block 1 · version 1\.4\.5/);
assert.match(markdown,/Program: AFT Foundation Block 1 · version 1\.2/,'historical entry version must remain visible');
assert.match(markdown,/Planned:/);
assert.match(markdown,/Status: Completed/);
assert.match(markdown,/Programmed interval time: 20:00/);
assert.match(markdown,/Total elapsed time: 24:00/);
assert.match(markdown,/Calculated average pace: 12:54\/mi \(based on total elapsed time\)/);
assert.match(markdown,/Device-reported pace: 14:16\/mi/);
assert.doesNotMatch(markdown,/undefined\/10/,'missing legacy pain must stay out of the report');
assert.match(markdown,/Exercise notes:[\s\S]*Relaxed pace\.[\s\S]*No pain\./);
assert.match(markdown,/Post-session notes:[\s\S]*Good session\.[\s\S]*Energy stayed steady\./);
assert.ok(markdown.endsWith('Review this training block, compare the completed results with the prescribed targets, identify recovery or injury concerns, and provide the next coach-directed program update while keeping the November Army Fitness Test goal in mind.\n'));
const csv=evaluate('buildCsv()');
assert.match(csv,/"programmed_interval_time"/);
assert.match(csv,/"total_elapsed_time"/);
assert.match(csv,/"calculated_average_pace"/);
assert.match(csv,/"device_reported_pace"/);
assert.match(csv,/"variation_id"/);
assert.match(csv,/"20:00"/);
assert.match(csv,/"12:54"/);
assert.match(csv,/"14:16"/);
assert.match(csv,/"Relaxed pace\.\nNo pain\."/);
const jsonBackup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(jsonBackup.version,11);
assert.equal(jsonBackup.currentProgram.version,'1.4.5');
assert.equal(jsonBackup.currentProgram.runStage,3);
assert.equal(jsonBackup.entries[0].exercises[0].deviceReportedPace,'14:16');

const normalized=evaluate(`normalizeEntry({
 id:'old',date:'2026-07-01',dayKey:'day1',painScore:'4',
 exercises:[{name:'Trap-bar deadlift',type:'weighted',load:'100'}]
})`);
assert.equal(normalized.painScore,'4');
assert.equal(normalized.painDuring,'','legacy pain is not reinterpreted as new pain');
assert.equal(normalized.sleepQuality,'','legacy sessions have no inferred sleep quality');
assert.equal(normalized.exercises[0].exercisePain,undefined,'legacy exercises have no inferred pain object');
assert.equal(normalized.exercises[0].loadMode,undefined,'legacy weight mode must not be guessed');
assert.equal(evaluate(`calculatedPaceDetails({type:'run',distance:'',totalTime:''}).value`),'','older runs without new pace fields remain valid');

elements.exportFrom.value='2026-08-03';
elements.exportTo.value='2026-08-09';
evaluate(`entries=[normalizeEntry({
 id:'microdose-export',date:'2026-08-06',updatedAt:'2026-08-06T18:00:00.000Z',dayKey:'skillMicrodose',
 dayLabel:SESSIONS.skillMicrodose.label,sessionType:'skill_microdose',duration:'10',sessionRpe:'3',preSoreness:'1',readiness:'4',painDuring:'0',
 programId:'aft-skill-microdose',programName:'AFT Skill Microdose',programVersion:'1.0',programEffectiveDate:'2026-08-06',
 templateId:'aft-skill-microdose',templateName:'AFT Skill Microdose',templateVersion:'1.0',templateEffectiveDate:'2026-08-06',
 weeklySkillDoseGroupId:'aft_pushup_plank_microdose',weeklySkillDoseWeek:'2026-08-03',weeklyFrequencyOverride:true,
 weeklyFrequencyOverrideReason:'additional_coach_directed_skill_session',prescriptionSnapshot:snapshotSession(SESSIONS.skillMicrodose),
 exercises:[
  {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',completed:true,sets:'3',reps:'4, 4, 4',rpe:'3'},
  {exerciseId:'plank',name:'Front plank',type:'timed',completed:true,sets:'3',times:'20, 20, 20',rpe:'3'},
  {exerciseId:'mobility',name:'Optional gentle mobility',type:'timed',completed:false,times:''}
 ]
})]`);
const microdoseMetrics=evaluate('weeklyMetrics(entries)[0]');
assert.equal(microdoseMetrics.pushups,12,'microdose push-ups count as weekly practice volume');
assert.equal(microdoseMetrics.plankSeconds,60,'microdose front-plank time counts as weekly practice volume');
const microdoseMarkdown=evaluate('buildMd()');
assert.match(microdoseMarkdown,/\*\*Skill microdose sessions:\*\* 1/);
assert.match(microdoseMarkdown,/Session category: Skill microdose/);
assert.match(microdoseMarkdown,/Template: AFT Skill Microdose · version 1\.0/);
assert.match(microdoseMarkdown,/Does not advance the primary workout rotation/);
assert.match(microdoseMarkdown,/standard weekly frequency exceeded/);
assert.match(microdoseMarkdown,/Hand-release push-ups[\s\S]*Prescription adherence: Met/);
assert.match(microdoseMarkdown,/Front plank[\s\S]*Prescription adherence: Met/);
const microdoseCsv=evaluate('buildCsv()');
assert.match(microdoseCsv,/"session_type"/);
assert.match(microdoseCsv,/"template_version"/);
assert.match(microdoseCsv,/"weekly_frequency_override"/);
assert.match(microdoseCsv,/"skill_microdose"/);
assert.match(microdoseCsv,/"additional_coach_directed_skill_session"/);
const microdoseRoundTrip=evaluate('normalizeEntry(JSON.parse(JSON.stringify(entries[0])))');
assert.equal(microdoseRoundTrip.sessionType,'skill_microdose');
assert.equal(microdoseRoundTrip.templateVersion,'1.0');
assert.equal(microdoseRoundTrip.weeklyFrequencyOverride,true);

storage.set('aftWorkoutEntries.v1',JSON.stringify([{id:'before'}]));
evaluate(`entries=[{
 id:'after',date:'2026-07-30',dayKey:'day1',dayLabel:'Day 1',
 sessionType:'primary',exercises:[]
}]`);
assert.equal(evaluate(`persistEntries('Before test write')`),true);
const restorePoints=evaluate('loadSnapshots()');
assert.equal(restorePoints[0].reason,'Before test write');
assert.deepEqual(JSON.parse(restorePoints[0].raw),[{id:'before'}]);
assert.equal(JSON.parse(storage.get('aftWorkoutEntries.v1'))[0].id,'after');

const indexHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const serviceWorker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert.match(appSource,/Exercise notes<textarea[^>]+data-field="notes"/,'exercise notes must support detailed multiline comments');
assert.ok(indexHtml.indexOf('program-config.js?v=34')<indexHtml.indexOf('cloud-config.js?v=34'));
assert.ok(indexHtml.indexOf('cloud-config.js?v=34')<indexHtml.indexOf('cloud-sync.js?v=34'));
assert.ok(indexHtml.indexOf('cloud-sync.js?v=34')<indexHtml.indexOf('app.js?v=34'));
assert.match(serviceWorker,/aft-workout-tracker-v34/);
assert.match(serviceWorker,/program-config\.js\?v=34/);
assert.match(serviceWorker,/cloud-sync\.js\?v=34/);
assert.ok(indexHtml.indexOf('id="preWorkoutCard"')<indexHtml.indexOf('class="card session-timer-card"'));
assert.ok(indexHtml.indexOf('class="card session-timer-card"')<indexHtml.indexOf('id="exerciseList"'));
assert.match(appSource,/data-fill-prescribed/,'prescription quick-fill remains available for structured strength and timed work');
assert.match(appSource,/confirmDiscardCurrentWorkout/,'workout navigation protects unsaved drafts');
const htmlIds=[...indexHtml.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'HTML IDs must be unique');
const referencedIds=[...appSource.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
referencedIds.forEach(id=>assert.ok(htmlIds.includes(id),`app.js references missing #${id}`));
[
 'index.html','styles.css','program-config.js','cloud-config.js','cloud-sync.js','app.js','firestore.rules','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-512-maskable.png','icons/apple-touch-icon.png'
].forEach(asset=>assert.ok(fs.existsSync(path.join(root,asset)),`offline asset missing: ${asset}`));

console.log('AFT model tests passed');
