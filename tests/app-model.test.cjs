const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');

// Workout-like records in this file are synthetic compatibility fixtures.
// Never paste real user exports, Health snapshots, or private coaching records here.

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
assert.equal(evaluate('PROGRAM.version'),'1.5.10');
assert.equal(evaluate('PROGRAM.effectiveDate'),'2026-09-19');
assert.equal(evaluate('PROGRAM.currentRunStage'),4);
const activeRotation=['strengthUpperAft','runStageA','strengthHeavyCarry','aerobicBase','strengthLowerSdc','runStageB'];
assert.deepEqual(JSON.parse(evaluate('JSON.stringify(ROTATION)')),activeRotation,'the active rotation uses the six coach-directed session containers in order');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(ROTATION.map(key=>SESSIONS[key].key))`)),activeRotation);
assert.equal(evaluate(`ROTATION.every(key=>SESSIONS[key].sessionType==='primary'&&SESSIONS[key].advancesPrimaryRotation===true&&SESSIONS[key].optional===false)`),true,'every active rotation container is explicitly primary, advancing, and nonoptional');
assert.equal(evaluate(`['day1','day2','day3','day4','day1IllnessRecovery'].some(key=>key in SESSIONS)`),false,'retired session keys are absent from active definitions');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(Object.keys(LEGACY_SESSIONS))`)),['day1','day2','day3','day4'],'the verified v1.5.7 Day 1–Day 4 definitions remain available only for history compatibility');

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.strengthUpperAft.exercises.map(exercise=>exercise.id))`)),[
 'handReleasePushups','verticalPull','overheadPress','chestSupportedRow','lateralRaise','chestFly','trunkStability','preacherCurl','tricepsPressdown'
]);
assert.equal(evaluate(`SESSIONS.strengthUpperAft.targetDuration`),'Approximately 60–75 minutes');
assert.equal(evaluate(`SESSIONS.strengthUpperAft.targetSessionRpe`),'6–7');
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.some(exercise=>['cardio','interval','run'].includes(exercise.type))`),false,'Strength 1 has no cardio or run');
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription`),'5 × 11');
assert.match(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='verticalPull').coachingNotes`),/same seated machine and setup.*187 lb.*Cap every set at 10 repetitions/);
const activeStrength1Press=`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='overheadPress')`;
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.findIndex(exercise=>exercise.id==='overheadPress')`),2,'the press remains third after HRPU and pulldowns');
assert.equal(evaluate(`${activeStrength1Press}.prescription`),'25 lb per hand for 3 × 8–10');
assert.equal(evaluate(`${activeStrength1Press}.unit`),'lb per hand');
assert.equal(evaluate(`${activeStrength1Press}.sets`),3);
assert.equal(evaluate(`${activeStrength1Press}.targetLoad`),25);
assert.equal(evaluate(`${activeStrength1Press}.targetLoadVariation`),'Seated dumbbell press');
assert.equal(evaluate(`${activeStrength1Press}.targetRpe`),'7–8');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(${activeStrength1Press}.variations)`)),['Seated dumbbell press','Standing dumbbell press','Machine shoulder press']);
assert.equal(evaluate(`${activeStrength1Press}.defaultVariation`),'Seated dumbbell press');
assert.match(evaluate(`${activeStrength1Press}.coachingNotes`),/controlled, technically clean, submaximal repetitions.*Cap each set at 10/);
assert.match(evaluate(`${activeStrength1Press}.coachingNotes`),/Do not add make-up repetitions or train to failure/);
assert.match(evaluate(`${activeStrength1Press}.coachingNotes`),/Do not return to 30 lb per hand until all three sets of 10 are completed cleanly at no more than RPE 8.*later coach-directed program version/);
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription`),'110 lb displayed on the same confirmed machine/setup for 3 × 9');
assert.match(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='lateralRaise').coachingNotes`),/same pain-free cable setup.*setup-specific/);
assert.match(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='chestFly').coachingNotes`),/same pec-deck machine and setup.*setup-specific/);
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='trunkStability').prescription`),'3 × 10 each side');
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='preacherCurl').prescription`),evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').prescription`));
assert.equal(evaluate(`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription`),evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription`));

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.runStageA.exercises.map(exercise=>exercise.id))`)),['runWalkIntervals']);
assert.equal(evaluate(`SESSIONS.runStageA.targetSessionRpe`),'4–5');
assert.equal(evaluate(`SESSIONS.runStageA.exercises[0].runStage`),4);
assert.equal(evaluate(`SESSIONS.runStageA.exercises[0].targetRpe`),'4–5');
assert.match(evaluate(`SESSIONS.runStageA.exercises[0].coachingNotes`),/full-sentence talk test.*5\.4–5\.5 mph or slower.*Do not chase distance or calculated pace.*Reduce running speed first rather than exceed RPE 5/);
assert.match(evaluate(`SESSIONS.runStageA.exercises[0].coachingNotes`),/more than the programmed 1:00 walk.*safety modification.*does not satisfy a future progression gate/);
assert.match(evaluate(`SESSIONS.runStageA.exercises[0].coachingNotes`),/dedicated running shoes.*pain exceeds 1\/10.*following morning.*24 hours/);

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.strengthHeavyCarry.exercises.map(exercise=>exercise.id))`)),[
 'deadlift','handReleasePushups','squatOrLegPress','horizontalPress','seatedRow','loadedCarry','plank'
]);
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.targetDuration`),'Approximately 60–70 minutes');
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='deadlift').targetLoad`),175);
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription`),'4 × 9');
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='horizontalPress').targetLoad`),40);
assert.match(evaluate(`SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='seatedRow').coachingNotes`),/Hold 132 lb displayed for confirmation.*another cable, pulley, or machine setup/);
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='loadedCarry').prescription`),'45 lb per hand for 4 trips of approximately 40 yd');
assert.equal(evaluate(`JSON.stringify(SESSIONS.strengthHeavyCarry.exercises.find(exercise=>exercise.id==='plank').prescribedTimes)`),'["0:45","0:45","0:45"]');
assert.equal(evaluate(`SESSIONS.strengthHeavyCarry.exercises.some(exercise=>['runWalkIntervals','primaryRun','preacherCurl','tricepsPressdown'].includes(exercise.id))`),false,'Strength 2 has no post-lift run or arm accessories');

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.aerobicBase.exercises.map(exercise=>exercise.id))`)),['easyCardio','mobility']);
assert.equal(evaluate(`SESSIONS.aerobicBase.targetDuration`),'Approximately 25–40 minutes including optional mobility');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.aerobicBase.exercises[0].modalities)`)),['Bike','Elliptical','Rower','Incline walk','Other']);
assert.equal(evaluate(`SESSIONS.aerobicBase.exercises[0].targetRpe`),'4–5');
assert.match(evaluate(`SESSIONS.aerobicBase.exercises[0].coachingNotes`),/steady, conversational low-impact aerobic work.*do not add make-up volume.*does not automatically convert to Run 3/);
assert.equal(evaluate(`SESSIONS.aerobicBase.exercises[1].optional`),true);
assert.equal(evaluate(`SESSIONS.aerobicBase.exercises[1].targetRpe`),'1–2');

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.strengthLowerSdc.exercises.map(exercise=>exercise.id))`)),[
 'romanianDeadlift','squatPattern','inclinePress','oneArmRow','singleLegStrength','gymConditioningCircuit','plank','sidePlank','hammerCurl','overheadTricepsExtension'
]);
const activeStrength3='SESSIONS.strengthLowerSdc.exercises';
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='romanianDeadlift').prescription`),'155 lb total for 2 × 8');
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='romanianDeadlift').targetLoad`),155);
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='romanianDeadlift').coachingNotes`),/Hold 155 lb for confirmation.*No grinders/);
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='squatPattern').prescription`),'55 lb for 3 × 10');
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='inclinePress').prescription`),'35 lb per hand for 3 × 9');
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='inclinePress').coachingNotes`),/Do not increase load or add make-up repetitions.*stop before grinding or technical failure/);
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='oneArmRow').prescription`),'50 lb for 3 × 9 each side');
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='singleLegStrength').defaultVariation`),'Body-weight split squat');
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='singleLegStrength').prescription`),/Body weight for 2 × 12 each leg.*3-second descent.*1-second pause/);
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='singleLegStrength').coachingNotes`),/do not add external load or extra repetitions/);
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='gymConditioningCircuit').circuitVersion`),'foundation-1.4.5');
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='gymConditioningCircuit').coachingNotes`),/exactly two rounds.*TANK M4 at Level 3.*resistance setting, not a weight.*Do not use total circuit time to auto-progress/i);
assert.equal(evaluate(`JSON.stringify(${activeStrength3}.find(exercise=>exercise.id==='plank').prescribedTimes)`),'["0:50","0:50","0:50"]');
assert.equal(evaluate(`JSON.stringify(${activeStrength3}.find(exercise=>exercise.id==='sidePlank').prescribedTimes)`),'["0:50","0:50","0:50"]');
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='hammerCurl').prescription`),'25 lb per hand for 2 × 15');
assert.equal(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='overheadTricepsExtension').prescription`),'110 lb displayed on the same confirmed rope/cable setup for 2 × 12');
assert.match(evaluate(`${activeStrength3}.find(exercise=>exercise.id==='overheadTricepsExtension').coachingNotes`),/same confirmed rope and cable setup.*Do not transfer the displayed value/);

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(SESSIONS.runStageB.exercises.map(exercise=>exercise.id))`)),['primaryRun','mobility']);
assert.equal(evaluate(`SESSIONS.runStageB.targetSessionRpe`),'5–6');
assert.equal(evaluate(`SESSIONS.runStageB.exercises[0].runStage`),4);
assert.match(evaluate(`SESSIONS.runStageB.exercises[0].coachingNotes`),/5\.7–5\.8 mph.*5\.9–6\.0 mph only if RPE remains at or below 5.*5\.5 mph or lower if RPE exceeds 6.*Duration and reserve take priority over pace/);
assert.match(evaluate(`SESSIONS.runStageB.exercises[0].coachingNotes`),/dedicated running shoes.*pain exceeds 1\/10.*following morning.*24 hours/);
assert.equal(evaluate(`exerciseIdentity(SESSIONS.runStageB.exercises[0])`),'runWalkIntervals','the raw primaryRun ID retains the established canonical history alias');
assert.equal(evaluate(`SESSIONS.runStageB.exercises.some(exercise=>['handReleasePushups','plank'].includes(exercise.id))`),false);

assert.equal(evaluate(`['preacherCurl','tricepsPressdown','hammerCurl','overheadTricepsExtension'].every(id=>Object.values(SESSIONS).flatMap(session=>session.exercises||[]).find(exercise=>exercise.id===id)?.optional===true)`),true,'all four arm accessories remain optional');
assert.equal(evaluate(`['preacherCurl','tricepsPressdown','hammerCurl','overheadTricepsExtension'].every(id=>Object.values(SESSIONS).flatMap(session=>session.exercises||[]).find(exercise=>exercise.id===id)?.group==='armSuperset')`),true,'all four arm accessories retain the shared group');
assert.match(evaluate(`SESSIONS.recovery.focus`),/active primary rotation/);
assert.doesNotMatch(evaluate(`SESSIONS.recovery.focus`),/four-day rotation/);
assert.equal(evaluate('LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==="gymConditioningCircuit").prescription.includes("Exactly 2 rounds")'),true);
assert.equal(evaluate('LEGACY_SESSIONS.day3.targetSessionRpe'),'7–8');
assert.equal(evaluate('SESSIONS.recovery.sessionType'),'recovery');
assert.equal(evaluate("SESSIONS.recovery.exercises.find(exercise=>exercise.id==='recoveryCardio').prescription"),'15–20 minutes');
assert.equal(evaluate("SESSIONS.recovery.exercises.find(exercise=>exercise.id==='recoveryCardio').targetRpe"),'2–3');
assert.equal(evaluate('SESSIONS.skillMicrodose.sessionType'),'skill_microdose');
assert.equal(evaluate('SESSIONS.skillMicrodose.templateVersion'),'1.0');
assert.equal(evaluate('SESSIONS.skillMicrodose.templateEffectiveDate'),'2026-08-06');
assert.equal(evaluate('SESSIONS.skillMicrodose.weeklySkillDoseGroupId'),'aft_pushup_plank_microdose');
assert.equal(evaluate('SESSIONS.skillMicrodose.exercises.some(exercise=>/air squat/i.test(exercise.name))'),false);
assert.equal(evaluate('sessionProgramMeta(SESSIONS.skillMicrodose).version'),'1.0');
assert.equal(evaluate('sessionProgramMeta(SESSIONS.skillMicrodose).runStage'),'');
assert.equal(evaluate('currentProgramMeta().version'),'1.5.10','the auxiliary template version remains independent of the primary program');
assert.equal(evaluate('LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==="runWalkIntervals").runStage'),4);
assert.equal(evaluate('LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==="primaryRun").runStage'),4);
assert.equal(evaluate('LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==="handReleasePushups").prescription'),'4 × 9');
assert.equal(evaluate('LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==="handReleasePushups").targetRpe'),'5–7');
assert.equal(evaluate('JSON.stringify(LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==="plank").prescribedTimes)'),'["0:50","0:50","0:50"]');
assert.equal(evaluate('LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==="plank").targetRpe'),'6–8');
assert.equal(evaluate('LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").prescription'),'145 lb total for 2 × 8');
assert.equal(evaluate('LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").targetLoad'),145);
assert.equal(evaluate('defaultExerciseState(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift")).load'),undefined,'the target load is not prefilled as a completed result');
const activePrescriptions=JSON.parse(evaluate(`JSON.stringify({
 day1Deadlift:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift').prescription,
 day1LegPress:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress').prescription,
 day1Bench:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress').prescription,
 day1Row:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').prescription,
 day1Carry:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry').prescription,
 day1Plank:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank').prescription,
 day1Preacher:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').prescription,
 day1Pressdown:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription,
 day1Run:LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').prescription,
 day2Pushups:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,
 day2Pull:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').prescription,
 day2Press:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress').prescription,
 day2Row:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription,
 day2Lateral:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise').prescription,
 day2Fly:LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').prescription,
 day3Rdl:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift').prescription,
 day3Goblet:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='squatPattern').prescription,
 day3Incline:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='inclinePress').prescription,
 day3Row:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').prescription,
 day3Split:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='singleLegStrength').prescription,
 day3SidePlank:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank').prescription,
 day3Hammer:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,
 day3OverheadTriceps:LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').prescription,
 day4Run:LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').prescription,
 day4Pushups:LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,
 day4Plank:LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='plank').prescription,
 day4Mobility:LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='mobility').prescription
})`));
assert.deepEqual(activePrescriptions,{
 day1Deadlift:'175 lb total for 3 × 5',day1LegPress:'Next smallest comparable increment above 140 lb on the same machine/setup for 3 × 8–10',day1Bench:'40 lb per hand for 3 × 8',
 day1Row:'132 lb displayed on the same cable setup for 3 × 10',day1Carry:'45 lb per hand for 4 trips of approximately 40 yd',day1Plank:'3 × 45 sec',
 day1Preacher:'30 lb total on the same EZ-bar setup, or the next smallest comparable load below 40 lb if 30 lb is unavailable, for 2 × 10–15',day1Pressdown:'Next smallest comparable increment above 77 lb displayed on the same cable setup (approximately 88 lb displayed if it uses 11-lb increments) for 2 × 10–12',day1Run:'Stage 4 — 1:00 walk / 2:30 run × 6',
 day2Pushups:'5 × 11',day2Pull:'Next smallest increment above 176 lb on the same seated machine (approximately 187 lb displayed if it uses 11-lb increments) for 3 × 8–10',day2Press:'30 lb per hand for 3 × 9',
 day2Row:'110 lb displayed on the same confirmed machine/setup for 3 × 9',day2Lateral:'Next smallest comparable increment above 33 lb displayed per side on the same pain-free cable setup (approximately 44 lb if applicable) for 2 × 12–15',day2Fly:'Next smallest comparable increment above 77 lb displayed on the same pec-deck machine/setup (approximately 88 lb if applicable) for 2 × 10–12',
 day3Rdl:'145 lb total for 2 × 8',day3Goblet:'55 lb for 3 × 10',day3Incline:'35 lb per hand for 3 × 9',day3Row:'50 lb for 3 × 8–10 each side',
 day3Split:'Body weight for 2 × 12 each leg',day3SidePlank:'3 × 45 sec each side',day3Hammer:'25 lb per hand for 2 × 12',day3OverheadTriceps:'Next smallest comparable increment above 99 lb on the same rope/cable setup (approximately 110 lb displayed if applicable) for 2 × 10–12',
 day4Run:'Stage 4 — 1:00 walk / 2:30 run × 6',day4Pushups:'4 × 9',day4Plank:'3 × 50 sec',day4Mobility:'5–10 minutes'
});
const standardDay1Hash=crypto.createHash('sha256').update(evaluate('JSON.stringify(LEGACY_SESSIONS.day1)')).digest('hex');
assert.equal(standardDay1Hash,'3646e124ddad8251b8340e47025a99cb05233b10328ee69ae9722414f5035aa2','standard Day 1 remains byte-for-byte identical to the verified v1.5.5 definition');
const legacyDay2Hash=crypto.createHash('sha256').update(evaluate('JSON.stringify(LEGACY_SESSIONS.day2)')).digest('hex');
assert.equal(legacyDay2Hash,'d1e6a9fa1814b39a6c48fd02229632be06e6b0f71b0bf072c9009263b184a3fe','legacy Day 2 remains byte-for-byte identical to the verified v1.5.7 definition');
const unchangedSessionHashes=Object.fromEntries(['day1','day3','day4'].map(key=>[
 key,crypto.createHash('sha256').update(evaluate(`JSON.stringify(LEGACY_SESSIONS.${key})`)).digest('hex')
]));
assert.deepEqual(unchangedSessionHashes,{
 day1:'3646e124ddad8251b8340e47025a99cb05233b10328ee69ae9722414f5035aa2',
 day3:'feb9a04b66bc44ce42ffd7a12e630461e8dc9031f5de940da603c16511cc8748',
 day4:'4f2dd93ce919638e84639e65dd78ca4beeb296d3ec7317fb7bea23afc1522b5a'
},'legacy Day 1, Day 3, and Day 4 remain byte-for-byte identical to the verified v1.5.7 baseline');
assert.equal(evaluate('ROTATION.includes("day1IllnessRecovery")'),false,'the retired alternative is never a fifth rotation day');
assert.equal(evaluate('SESSIONS.day1IllnessRecovery'),undefined,'the illness-recovery alternative has no active session definition');
assert.equal(evaluate('LEGACY_SESSIONS.day3.exercises.some(exercise=>exercise.id==="handReleasePushups"||exercise.id==="plank")'),false,'the optional Day 3 skill bundle remains absent from v1.5.7');
assert.equal(evaluate('LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==="gymConditioningCircuit").circuitVersion'),'foundation-1.4.5');
assert.equal(evaluate('CIRCUIT_TEMPLATES["foundation-1.4"].components.length'),6);
assert.equal(evaluate('CIRCUIT_TEMPLATES["foundation-1.4.5"].components.length'),6);
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4'].components.find(component=>component.id==='backwardSledDrag').planned.equipmentLabel`),undefined,'the historical v1.4 circuit plan remains unchanged');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='backwardSledDrag').planned.equipmentLabel`),'Torque Fitness TANK M4 · Level 3');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='forwardSledPush').planned.distanceLabel`),'Approximately 20 yd gym lane');
assert.equal(evaluate(`CIRCUIT_TEMPLATES['foundation-1.4.5'].components.find(component=>component.id==='forwardSledPush').planned.load`),undefined,'the M4 resistance level is never represented as pounds');
assert.equal(evaluate('LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").variations.includes("Cuffed-cable lateral raise")'),true);
assert.equal(evaluate('LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").name'),'Cable lateral raise');
assert.equal(evaluate('LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").defaultVariation'),'Cable lateral raise');
assert.equal(evaluate(`compactLoadResult(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),{load:'12.5',unit:'lb per side'})`),'12.5 lb/side');
assert.equal(evaluate('LEGACY_SESSIONS.day2.targetSessionRpe'),'6–7');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(LEGACY_SESSIONS.day2.exercises.map(exercise=>exercise.id))`)),['handReleasePushups','verticalPull','overheadPress','chestSupportedRow','lateralRaise','chestFly','trunkStability','easyCardio'],'Day 2 stable exercise IDs and order remain unchanged');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(Object.fromEntries(LEGACY_SESSIONS.day2.exercises.map(exercise=>[exercise.id,exercise.targetRpe||''])))`)),{
 handReleasePushups:'6–8',verticalPull:'6–8',overheadPress:'7–9',chestSupportedRow:'7–8',lateralRaise:'7–8',chestFly:'7–9',trunkStability:'',easyCardio:'4–5'
},'Day 2 target RPEs remain exactly coach-directed');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups').targetRpe`),'6–8');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').targetLoad`),undefined,'the approximately 187-lb pulldown cue is not a universal machine target');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').defaultVariation`),'Seated lat pulldown');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').defaultVariation`),'Pec deck / machine fly');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').targetLoad`),undefined,'the setup-specific machine-row load is not universalized');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').targetLoad`),undefined,'the setup-specific pec-deck load is not universalized');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise').targetLoad`),undefined,'the setup-specific lateral-raise load is not universalized');
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress').targetLoad`),30);
assert.equal(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress').targetRpe`),'7–9');
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups').coachingNotes`),/all five sets equal.*stop before failure.*do not turn any set into a maximal test/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull').coachingNotes`),/same seated machine and setup.*187 lb.*different cable or pulley setup.*Cap every set at 10 repetitions/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress').coachingNotes`),/Hold the current 30 lb-per-hand load until all three sets of 9 are completed cleanly.*Do not increase the load, add make-up repetitions, or turn the target into a failure test/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow').coachingNotes`),/110 lb displayed only on the same confirmed machine and setup.*not treat 110 lb as comparable on another machine/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise').coachingNotes`),/above 33 lb displayed per side only on the same pain-free cable setup.*44 lb is setup-specific.*Maintain pain-free technique/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly').coachingNotes`),/above 77 lb displayed only on the same pec-deck machine and setup.*88 lb is setup-specific.*1–3 good repetitions in reserve/);
assert.match(evaluate(`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='easyCardio').coachingNotes`),/Hold the 25–30 minute duration.*illness symptoms remain absent.*Do not increase duration or add make-up work/);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.some(exercise=>exercise.id==='tricepsPressdown'||exercise.id==='dumbbellCurl')`),false,'Day 3 replaces rather than adds to the legacy arm pair');
assert.equal(evaluate(`LEGACY_SESSIONS.day4.exercises.some(exercise=>['preacherCurl','hammerCurl','chestFly','overheadTricepsExtension'].includes(exercise.id))`),false,'Day 4 receives no hypertrophy accessories');
assert.equal(evaluate('ROTATION.length'),6,'the active program contains exactly six primary sessions');
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').targetRpe`),'5–6');
assert.equal(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').targetRpe`),'5–6');
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/5\.5–5\.6 mph/);
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/5\.7–5\.8 mph only if RPE remains at or below 6/);
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/first three rounds/);
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/[Rr]educe speed rather than forcing pace/);
assert.doesNotMatch(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='runWalkIntervals').coachingNotes`),/6\.0–6\.1 mph/,'Day 1 no longer uses the superseded pace guidance');
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/5\.7–5\.8 mph/,'Day 4 starts at the recalibrated fresh-session range');
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/5\.9–6\.0 mph only if RPE is at or below 5 through round 3/,'Day 4 faster running remains conditional on controlled effort');
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/Reduce toward 5\.5 mph if RPE exceeds 6/);
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/two pain-free Stage 4 completions.*including one fresh Day 4 without a late forced slowdown/);
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes`),/duration progression takes priority over speed progression/);
assert.match(evaluate(`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='plank').coachingNotes`),/stop a set rather than extending through lumbar compensation/);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift').targetLoad`),175);
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift').coachingNotes`),/Hold 175 lb for confirmation.*do not pursue grinders or another load jump next cycle/);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress').targetLoad`),undefined,'the setup-specific next leg-press increment is not universalized');
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress').coachingNotes`),/same comparable leg-press machine and setup/);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress').targetLoad`),40);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').targetLoad`),undefined,'the setup-specific 132-lb seated-row cue is not universalized across cable setups');
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').targetRpe`),'6–8');
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow').coachingNotes`),/Hold 132 lb displayed for confirmation.*another cable, pulley, or machine setup/);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry').targetRpe`),'6–8');
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank').targetRpe`),'6–8');
assert.equal(evaluate(`JSON.stringify(LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank').prescribedTimes)`),'["0:45","0:45","0:45"]');
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').targetLoadVariation`),'EZ-bar preacher curl');
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').targetLoad`),30);
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl').coachingNotes`),/next smallest comparable load below 40 lb.*return to 40 lb only after a future coach-directed progression/);
assert.equal(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').targetLoad`),undefined,'the setup-specific next pressdown increment is not universalized');
assert.match(evaluate(`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription`),/above 77 lb.*approximately 88 lb.*2 × 10–12/);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').targetLoad`),50);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow').targetRpe`),'6–8');
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='squatPattern').targetLoad`),55);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='inclinePress').targetLoad`),35);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='singleLegStrength').targetRpe`),'5–7');
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoad`),25);
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoadVariation`),'Dumbbell hammer curl');
assert.equal(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').targetLoad`),undefined,'the setup-specific next cable-stack increment is not universalized');
assert.match(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').prescription`),/above 99 lb.*approximately 110 lb.*2 × 10–12/);
assert.match(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift').coachingNotes`),/grip loss alter hinge technique.*do not progress again without a successful confirmation/);
assert.match(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='squatPattern').coachingNotes`),/pre-circuit leg fatigue/);
assert.match(evaluate(`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='singleLegStrength').coachingNotes`),/Do not add load before the conditioning circuit/);
assert.equal(evaluate(`JSON.stringify(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank').prescribedTimes)`),'["0:45","0:45","0:45"]');
assert.match(evaluate(`LEGACY_SESSIONS.day3.warmup`),/Approximately 10 progressive minutes/);
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(Object.fromEntries(LEGACY_SESSIONS.day3.exercises.filter(exercise=>exercise.id!=='gymConditioningCircuit').map(exercise=>[exercise.id,exercise.targetRpe||''])))`)),{
 romanianDeadlift:'6–8',squatPattern:'7–8',inclinePress:'7–8',oneArmRow:'6–8',singleLegStrength:'5–7',sidePlank:'6–8',hammerCurl:'7–9',overheadTricepsExtension:'7–9'
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
assert.equal(evaluate('JSON.stringify(getRunStage(4))'),'{"id":4,"label":"1:00 walk / 2:30 run × 6","runMinutes":"2.5","walkMinutes":"1","rounds":"6"}','Stage 4 uses the coach-directed 2:30 run segments');
assert.equal(evaluate('programmedRunSeconds(runDefaults(4))'),1260,'Stage 4 must total 21 programmed minutes');
assert.equal(evaluate('Number(runDefaults(4).walkMinutes)*Number(runDefaults(4).rounds)*60'),360,'Stage 4 includes six minutes of walking');
assert.equal(evaluate('Number(runDefaults(4).runMinutes)*Number(runDefaults(4).rounds)*60'),900,'Stage 4 includes fifteen minutes of running');
assert.equal(evaluate('currentProgramMeta().runStage'),4);

const currentDay3Row=`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='oneArmRow')`;
const currentHammerCurl=`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='hammerCurl')`;
const currentDay4Pushups=`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='handReleasePushups')`;
const currentDay4Plank=`LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='plank')`;
const currentDay1Deadlift=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='deadlift')`;
const currentDay1LegPress=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='squatOrLegPress')`;
const currentDay1Bench=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='horizontalPress')`;
const currentDay1Row=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='seatedRow')`;
const currentDay1Carry=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry')`;
const currentDay1Plank=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='plank')`;
const currentDay1Preacher=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='preacherCurl')`;
const currentDay1Pressdown=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='tricepsPressdown')`;
const currentActiveStrength1Press=`SESSIONS.strengthUpperAft.exercises.find(exercise=>exercise.id==='overheadPress')`;
const currentDay2Pushups=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='handReleasePushups')`;
const currentDay2Pull=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull')`;
const currentDay2Press=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='overheadPress')`;
const currentDay2Row=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestSupportedRow')`;
const currentDay2Lateral=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')`;
const currentDay2Fly=`LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='chestFly')`;
const currentDay3SidePlank=`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='sidePlank')`;
const currentDay3Triceps=`LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='overheadTricepsExtension')`;
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Deadlift},{type:'weighted',completed:true,variation:'Trap / hex bar',load:'65',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Deadlift},{type:'weighted',completed:true,variation:'Trap / hex bar',load:'60',loadMode:'platesPerSide',barWeight:'45',sets:'3',reps:'5, 5, 5'})`),'modified');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1LegPress},{type:'weighted',completed:true,variation:'Leg press',load:'150',sets:'3',reps:'8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1LegPress},{type:'weighted',completed:true,variation:'Leg press',load:'140',sets:'3',reps:'8, 8, 8'})`),'met','the setup-specific next leg-press increment is not treated as a universal load target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Bench},{type:'weighted',completed:true,variation:'Dumbbell bench press',load:'40',sets:'3',reps:'8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Row},{type:'weighted',completed:true,variation:'Seated cable row',load:'132',sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Row},{type:'weighted',completed:true,variation:'Seated cable row',load:'99',sets:'3',reps:'10, 10, 10'})`),'met','the setup-specific seated-row stack cue is not treated as a universal load target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Carry},{type:'carry',completed:true,variation:'Farmer carry',load:'45',sets:'4',distance:'40'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Plank},{type:'timed',completed:true,sets:'3',times:'45, 45, 45'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Plank},{type:'timed',completed:true,sets:'3',times:'45, 40, 45'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Preacher},{type:'weighted',completed:true,variation:'EZ-bar preacher curl',load:'30',sets:'2',reps:'10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Preacher},{type:'weighted',completed:true,variation:'Machine preacher curl',load:'30',sets:'2',reps:'10, 10'})`),'modified','the EZ-bar load is not treated as comparable on another preacher-curl setup');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Pressdown},{type:'weighted',completed:true,load:'88',sets:'2',reps:'10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay1Pressdown},{type:'weighted',completed:true,load:'77',sets:'2',reps:'10, 10'})`),'met','a different cable-stack number is not judged against the setup-specific next-increment cue');
assert.equal(evaluate(`prescriptionAdherence(${currentActiveStrength1Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'25',sets:'3',reps:'8, 9, 10'})`),'met','all three sets within the active 8–10 range meet the v1.5.10 press target');
assert.equal(evaluate(`prescriptionAdherence(${currentActiveStrength1Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'25',sets:'3',reps:'8, 7, 10'})`),'below_target','any set below 8 is below the active press target');
const heavierActivePress=JSON.parse(evaluate(`JSON.stringify(prescriptionAdherenceDetail(${currentActiveStrength1Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'30',sets:'3',reps:'8, 8, 8'}))`));
assert.equal(heavierActivePress.value,'modified','a completed 30-lb press result is not silently treated as the new 25-lb target');
assert.ok(heavierActivePress.reasons.some(reason=>reason.code==='load_above_target'));
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pushups},{type:'body',completed:true,sets:'5',reps:'11, 11, 11, 11, 11'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pushups},{type:'body',completed:true,sets:'5',reps:'11, 11, 11, 11, 10'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pull},{type:'weighted',completed:true,variation:'Seated lat pulldown',load:'187',sets:'3',reps:'8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Pull},{type:'weighted',completed:true,variation:'Seated lat pulldown',load:'176',sets:'3',reps:'8, 8, 8'})`),'met','pulldown adherence does not universalize the displayed stack target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'30',sets:'3',reps:'9, 9, 9'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Press},{type:'weighted',completed:true,variation:'Seated dumbbell press',load:'30',sets:'3',reps:'8, 8, 8'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Row},{type:'weighted',completed:true,variation:'Machine row',load:'110',sets:'3',reps:'9, 9, 9'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Row},{type:'weighted',completed:true,variation:'Machine row',load:'99',sets:'3',reps:'9, 9, 9'})`),'met','machine-row adherence does not universalize the displayed stack target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Lateral},{type:'weighted',completed:true,variation:'Cable lateral raise',load:'44',sets:'2',reps:'12, 12'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Lateral},{type:'weighted',completed:true,variation:'Cable lateral raise',load:'33',sets:'2',reps:'12, 12'})`),'met','lateral-raise adherence does not universalize the setup-specific next-increment cue');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Fly},{type:'weighted',completed:true,variation:'Pec deck / machine fly',load:'88',sets:'2',reps:'10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay2Fly},{type:'weighted',completed:true,variation:'Pec deck / machine fly',load:'77',sets:'2',reps:'10, 10'})`),'met','pec-deck adherence does not universalize the displayed stack target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Row},{type:'weighted',completed:true,variation:'One-arm dumbbell row',load:'50',sets:'3',reps:'8, 8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Row},{type:'weighted',completed:true,variation:'One-arm dumbbell row',load:'45',sets:'3',reps:'8, 8, 8'})`),'modified');
assert.equal(evaluate(`prescriptionAdherence(${currentHammerCurl},{type:'weighted',completed:true,variation:'Dumbbell hammer curl',load:'25',sets:'2',reps:'12, 12'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentHammerCurl},{type:'weighted',completed:true,variation:'Rope cable hammer curl',load:'25',sets:'2',reps:'12, 12'})`),'modified','rope cable work remains a substitution rather than a directly comparable dumbbell load');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3SidePlank},{type:'timed',completed:true,sets:'3',times:'45, 45, 45'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3SidePlank},{type:'timed',completed:true,sets:'3',times:'45, 40, 45'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Triceps},{type:'weighted',completed:true,variation:'Rope overhead cable extension',load:'110',sets:'2',reps:'10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay3Triceps},{type:'weighted',completed:true,variation:'Rope overhead cable extension',load:'99',sets:'2',reps:'10, 10'})`),'met','a different stack number is not judged against the setup-specific next-increment cue');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Pushups},{type:'body',completed:true,sets:'4',reps:'9, 9, 9, 9'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Pushups},{type:'body',completed:true,sets:'4',reps:'9, 9, 9, 8'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Plank},{type:'timed',completed:true,sets:'3',times:'50, 50, 50'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(${currentDay4Plank},{type:'timed',completed:true,sets:'3',times:'45, 45, 45'})`),'below_target');
const v146RunMarkdown=evaluate(`markdownExercise(LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun'),{
 exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',completed:true,runStage:'4',walkMinutes:'1',runMinutes:'2.5',rounds:'6',completedRounds:'6',runSpeed:'6.2',rpe:'5'
},{date:'2026-08-23',dayKey:'day4',programVersion:'1.4.6'})`);
assert.match(v146RunMarkdown,/target RPE 5–6/);
assert.match(v146RunMarkdown,/5\.7–5\.8 mph/);
assert.match(v146RunMarkdown,/Programmed interval time: 21:00/);
assert.match(v146RunMarkdown,/Running speed: 6\.2 mph/,'the existing run-speed field carries the current guidance into coach exports');

assert.equal(evaluate(`prescriptionAdherence({type:'body',prescription:'5 × 6',sets:5},{type:'body',completed:true,sets:'5',reps:'6, 6, 6, 6, 4'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'8, 8, 6'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'2 × 12–15',sets:2},{type:'weighted',completed:true,sets:'2',reps:'10, 10'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'cardio',prescription:'25–30 minutes'},{type:'cardio',completed:true,minutes:'20'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 30, 25'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 20, 25'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3,optional:true},{type:'weighted',completed:false})`),'not_applicable');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'95 lb total for 2 × 8',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells']},{type:'weighted',completed:true,variation:'Dumbbells',load:'30',sets:'2',reps:'8, 8'})`),'modified','a substitution is recorded explicitly instead of being treated as the targeted load');
assert.equal(evaluate(`prescriptionAdherence(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'100',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'90',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'modified');
assert.equal(evaluate(`prescribedEnteredLoad(175,'platesPerSide',45)`),65,'quick fill preserves per-side plate entry while reaching the active trap-bar target');
assert.equal(evaluate(`prescribedEnteredLoad(145,'plates',45)`),100,'quick fill preserves combined-plate entry while reaching total prescribed load');
assert.equal(evaluate(`prescribedEnteredLoad(30,'','')`),30,'non-bar exercises retain their direct prescribed load');
const aboveTargetLoad=JSON.parse(evaluate(`JSON.stringify(prescriptionAdherenceDetail(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'110',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'}))`));
assert.equal(aboveTargetLoad.value,'modified');
assert.ok(aboveTargetLoad.reasons.some(reason=>reason.code==='load_above_target'));
assert.equal(evaluate(`prescriptionAdherence({type:'carry',prescription:'Carry with good posture'},{type:'carry',completed:true,load:'45'})`),'not_assessable');
const day1Carry=`LEGACY_SESSIONS.day1.exercises.find(exercise=>exercise.id==='loadedCarry')`;
const august9Carry=`{exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',load:'45',sets:'4',distance:'40',carrySeconds:'30',rpe:'6',completed:true}`;
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},${august9Carry})`),'met','4 prescribed trips at approximately 40 yd are met by 4 trips at 40 yd');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},sets:'3'})`),'partial','fewer completed trips produce partial adherence');
assert.equal(evaluate(`prescriptionAdherence(${day1Carry},{...${august9Carry},distance:'25'})`),'below_target','a completed per-trip distance below the approximate target is below target');
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
evaluate(`activeProgramContext={...currentProgramMeta(),version:'1.4'};activeSessionDefinition=LEGACY_SESSIONS.day2;activeWorkoutDate='2026-08-11'`);
const historicalOverlayCard=evaluate(`exerciseCard(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,defaultExerciseState(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')))`);
assert.match(historicalOverlayCard,/ACTIVE COACH NOTE/);
evaluate(`activeProgramContext=currentProgramMeta();activeSessionDefinition=LEGACY_SESSIONS.day2;activeWorkoutDate='2026-08-12'`);
const currentLateralCard=evaluate(`exerciseCard(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,defaultExerciseState(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')))`);
assert.doesNotMatch(currentLateralCard,/ACTIVE COACH NOTE/);
assert.match(currentLateralCard,/above 33 lb displayed per side on the same pain-free cable setup.*44 lb.*2 × 12–15/);
assert.match(currentLateralCard,/value="Cable lateral raise" selected/);
assert.match(currentLateralCard,/<details class="exercise-extras"/,'notes and pain use progressive disclosure');
assert.match(currentLateralCard,/data-completion-label/,'the completion action remains at the end of the logging flow');
const legacyLateralCard=evaluate(`exerciseCard(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,{exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand'})`);
assert.match(legacyLateralCard,/value="Dumbbell lateral raise" selected/,'legacy lateral-raise records without a variation remain identified as dumbbell work');
assert.match(legacyLateralCard,/data-unit="lb per hand"/);

const rotation=evaluate(`nextWorkoutDay([
 {id:'legacy-primary',dayKey:'day1',sessionType:'primary'},
 {id:'recovery',dayKey:'recovery',sessionType:'recovery'}
])`);
assert.equal(rotation,'strengthUpperAft','a recent legacy primary session enters the new rotation at its first container');
assert.equal(evaluate('nextWorkoutDay([])'),'strengthUpperAft');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'first',dayKey:'strengthUpperAft',sessionType:'primary',advancesPrimaryRotation:true}
])`),'runStageA','an active primary session advances within the six-session rotation');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'last',dayKey:'runStageB',sessionType:'primary',advancesPrimaryRotation:true}
])`),'strengthUpperAft','saving Run 2 wraps to the first active session');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'primary',dayKey:'runStageB',sessionType:'primary',advancesPrimaryRotation:true},
 {id:'microdose',dayKey:'skillMicrodose',sessionType:'skill_microdose',advancesPrimaryRotation:false}
])`),'strengthUpperAft','a skill microdose must not advance the primary rotation');
assert.equal(evaluate(`nextWorkoutDay([
 {id:'alternative',dayKey:'day1IllnessRecovery',rotationDayKey:'day1',sessionType:'primary',advancesPrimaryRotation:true,date:'2026-09-10',updatedAt:'2026-09-10T18:00:00Z'}
])`),'strengthUpperAft','a retired primary alternative remains primary history but cannot map into the new active rotation');
assert.equal(evaluate(`isPrimaryEntry({dayKey:'day1IllnessRecovery',rotationDayKey:'day1',sessionType:'primary',advancesPrimaryRotation:true})`),true,'the alternative counts as a primary workout');
assert.equal(evaluate(`isPrimaryEntry({dayKey:'day3',sessionType:'primary',advancesPrimaryRotation:true})`),true,'legacy Day 1–Day 4 keys remain primary independently of active rotation membership');
assert.equal(evaluate(`isPrimaryEntry({dayKey:'day1',sessionType:'primary',advancesPrimaryRotation:false})`),false,'an explicit non-advancing auxiliary session cannot affect rotation even with a standard day key');
assert.equal(evaluate(`nextWorkoutDay([{dayKey:'day1',sessionType:'primary',advancesPrimaryRotation:false}])`),'strengthUpperAft','non-advancing sessions are ignored by automatic defaults');
assert.equal(evaluate('PROGRAM.currentRunStage'),4,'a skill microdose template never changes the coach-directed run stage');

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
 exercises:[{exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',variationId:'latPulldown',load:'137',sets:'3',reps:'8, 9, 8',rpe:'7',completed:true,notes:'Synthetic standing setup fixture.'}]
};
const august18PulldownRaw={
 id:'august-18-day-2',date:'2026-08-18',updatedAt:'2026-08-18T19:00:00.000Z',dayKey:'day2',
 dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',programVersion:'1.4.3',
 prescriptionSnapshot:{sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',exercises:[
  {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3,variations:['Lat pulldown'],defaultVariation:'Lat pulldown'}
 ]},
 exercises:[{exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',variationId:'latPulldown',load:'149',sets:'3',reps:'9, 8, 9',rpe:'6',completed:true,notes:'Synthetic seated setup fixture.'}]
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
 {load:'137',reps:'8, 9, 8',rpe:'7',notes:'Synthetic standing setup fixture.'},
 'the Aug 11 correction changes only variation metadata'
);
assert.deepEqual(
 {load:seatedPulldown.load,reps:seatedPulldown.reps,rpe:seatedPulldown.rpe,notes:seatedPulldown.notes},
 {load:'149',reps:'9, 8, 9',rpe:'6',notes:'Synthetic seated setup fixture.'},
 'the Aug 18 correction changes only variation metadata'
);
assert.deepEqual(correctedAugust11Pulldown.prescriptionSnapshot,august11PulldownRaw.prescriptionSnapshot,'the Aug 11 prescription snapshot remains untouched');
assert.deepEqual(correctedAugust18Pulldown.prescriptionSnapshot,august18PulldownRaw.prescriptionSnapshot,'the Aug 18 prescription snapshot remains untouched');
const correctedAugust18Twice=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(correctedAugust18Pulldown)}))`));
assert.equal(correctedAugust18Twice.exercises[0].historicalCorrections.filter(value=>value==='august18-day2-seated-pulldown-variation-v1').length,1,'the seated correction is idempotent');
const pulldownComparison=JSON.parse(evaluate(`JSON.stringify((()=>{
 entries=[normalizeEntry(${JSON.stringify(august11PulldownRaw)}),normalizeEntry(${JSON.stringify(august18PulldownRaw)})];
 const data=previousResultData(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull'),'Seated lat pulldown');
 return {selectedDate:data.selected?.entry.date,standingComparable:data.candidates.find(item=>item.entry.date==='2026-08-11')?.comparable,seatedComparable:data.candidates.find(item=>item.entry.date==='2026-08-18')?.comparable};
})())`));
assert.deepEqual(pulldownComparison,{selectedDate:'2026-08-18',standingComparable:false,seatedComparable:true},'seated progression uses Aug 18 and excludes the Aug 11 standing result');
const standingPulldownReference=evaluate(`previousResultReference(LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull'),'Modified standing lat pulldown')`);
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
 dayLabel:LEGACY_SESSIONS.day3.label,sessionType:'primary',programId:PROGRAM.id,programName:PROGRAM.name,
 programVersion:'1.3',programEffectiveDate:'2026-08-01',duration:'57',sessionRpe:'8',preSoreness:'2',readiness:'3',sleepQuality:'good',painDuring:'0',
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',targetSessionRpe:'7–8',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'95 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{Barbell:45,'Smith machine':20}},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, 45-sec hard cardio, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.2'}
 ]},
 exercises:[
  {exerciseId:'romanianDeadlift',name:'Romanian deadlift',prescription:'95 lb total for 2 × 8',type:'weighted',variation:'Barbell',load:'60',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8',rpe:'7',completed:true},
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

evaluate(`entries=[];activeProgramContext=currentProgramMeta();activeSessionDefinition=LEGACY_SESSIONS.day3;activeWorkoutDate='2026-08-08'`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-06').scope`),'next_occurrence');
const circuitCard=evaluate(`exerciseCard(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),8,defaultExerciseState(LEGACY_SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit')))`);
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
assert.equal(evaluate('PROGRAM.version'),'1.5.10','consuming a historical directive does not change the current program version');
evaluate(`entries=[];activeProgramContext=currentProgramMeta();activeSessionDefinition=LEGACY_SESSIONS.day3;activeWorkoutDate='2026-08-08'`);

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

const stage4Defaults=JSON.parse(evaluate('JSON.stringify(runDefaults(4))'));
const stage4Card={
 querySelector(selector){
  const field=selector.match(/data-field="([^"]+)"/)?.[1];
  return {value:stage4Defaults[field]??''};
 }
};
context.stage4Card=stage4Card;
const stage4Plan=evaluate('buildRunTimerPlan(stage4Card)');
assert.equal(stage4Plan.length,12,'Stage 4 has six walk/run pairs');
assert.equal(stage4Plan[0].kind,'walk','Stage 4 begins with walking');
assert.equal(stage4Plan[0].seconds,60);
assert.equal(stage4Plan[1].kind,'run');
assert.equal(stage4Plan[1].seconds,150);
assert.equal(stage4Plan.reduce((sum,segment)=>sum+segment.seconds,0),1260);

const timerMarkup=evaluate('runTimerMarkup()');
assert.match(timerMarkup,/data-timer-alert[^>]+role="alert"[^>]+aria-live="assertive"/,'interval changes have an assertive visual announcement');
assert.doesNotMatch(timerMarkup,/data-timer-current[^>]+aria-live/,'the phase heading does not duplicate the dedicated live alert');
assert.match(timerMarkup,/Voice \+ tones/,'the default interval cue combines speech with stronger tones');
assert.match(timerMarkup,/data-timer-action="test-cue"/,'runners can test alert volume before starting');
const cueProfiles=JSON.parse(evaluate(`JSON.stringify({
 walk:runTimerCueProfile('walk'),
 run:runTimerCueProfile('run'),
 complete:runTimerCueProfile('complete')
})`));
assert.equal(cueProfiles.walk.visual,'WALK · RECOVER');
assert.equal(cueProfiles.run.visual,'RUN NOW');
assert.equal(cueProfiles.complete.visual,'INTERVALS COMPLETE');
assert.deepEqual(cueProfiles.walk.vibration,[280,100,280]);
assert.deepEqual(cueProfiles.run.vibration,[160,70,160,70,280]);
assert.notDeepEqual(cueProfiles.walk.tones.map(tone=>tone.frequency),cueProfiles.run.tones.map(tone=>tone.frequency),'walk and run use audibly distinct tone patterns');
assert.ok(cueProfiles.run.tones.length>1,'the run cue is no longer a single soft chirp');
assert.equal(evaluate('runTimerCueMode()'),'voice','voice plus tones is the device-local default');
evaluate(`saveRunTimerCueMode('tones')`);
assert.equal(storage.get('aftRunTimerCue.v1'),'tones');
assert.equal(evaluate('runTimerCueMode()'),'tones');
storage.delete('aftRunTimerCue.v1');

const cueCalls={contexts:0,resumed:0,started:0,vibrated:[],spoken:[]};
let cueModeValue='visual';
const cueAlertAttributes={};
context.fakeCueTimer={
 querySelector(selector){
  if(selector==='[data-timer-cue-mode]')return {value:cueModeValue};
  if(selector==='[data-timer-alert]')return {
   textContent:'',dataset:{},offsetWidth:0,
   classList:{add(){},remove(){}},
   setAttribute(name,value){cueAlertAttributes[name]=value},
   removeAttribute(name){delete cueAlertAttributes[name]}
  };
  return null;
 }
};
context.navigator.vibrate=pattern=>cueCalls.vibrated.push([...pattern]);
context.window.SpeechSynthesisUtterance=function(text){this.text=text};
context.window.speechSynthesis={cancel(){},speak:utterance=>cueCalls.spoken.push(utterance.text)};
context.window.AudioContext=class{
 constructor(){this.state='interrupted';this.currentTime=1;this.destination={};cueCalls.contexts++}
 resume(){this.state='running';cueCalls.resumed++;return {then:callback=>{callback();return {catch(){}}}}}
 createOscillator(){return {frequency:{setValueAtTime(){}},connect:node=>node,start:()=>cueCalls.started++,stop(){}}}
 createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect:node=>node}}
};
const originalSetTimeout=context.setTimeout;
const originalClearTimeout=context.clearTimeout;
context.setTimeout=callback=>{callback();return 1};
context.clearTimeout=()=>{};
evaluate(`runTimerAudioContext=null;signalRunTimer('run',fakeCueTimer)`);
assert.deepEqual(cueCalls,{contexts:0,resumed:0,started:0,vibrated:[],spoken:[]},'visual-only mode does not invoke audio, vibration, or speech');
cueModeValue='tones';
evaluate(`signalRunTimer('run',fakeCueTimer)`);
assert.equal(cueCalls.contexts,1);
assert.equal(cueCalls.resumed,1,'an interrupted audio context resumes before tones are scheduled');
assert.equal(cueCalls.started,3);
assert.deepEqual(cueCalls.vibrated,[cueProfiles.run.vibration]);
assert.deepEqual(cueCalls.spoken,[],'tones mode does not invoke speech synthesis');
cueModeValue='voice';
evaluate(`signalRunTimer('run',fakeCueTimer)`);
assert.equal(cueCalls.started,6);
assert.deepEqual(cueCalls.spoken,['Run']);
assert.equal(cueAlertAttributes['aria-hidden'],'true','the visual live region is muted while the spoken cue is active');
context.setTimeout=originalSetTimeout;
context.clearTimeout=originalClearTimeout;
delete context.navigator.vibrate;
delete context.window.AudioContext;
delete context.window.SpeechSynthesisUtterance;
delete context.window.speechSynthesis;
delete context.fakeCueTimer;
evaluate('runTimerAudioContext=null');

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
assert.equal(evaluate(`compactResultSummary(LEGACY_SESSIONS.day4.exercises[0],{
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
 exercises:[{exerciseId:'hammerCurl',name:'Hammer curl',type:'weighted',variation:'Dumbbell hammer curl',load:'17',sets:'2',reps:'9, 11',rpe:'8',completed:true,notes:'Synthetic compatibility result.'}]
}`;
const august20V144Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${august20V144Fixture}))`));
const august20V144Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${august20V144Fixture}))`));
assert.equal(august20V144Definition.warmup,'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive Romanian-deadlift warm-up sets.');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='romanianDeadlift').prescription,'115 lb total for 2 × 8');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,'25 lb per hand for 2 × 10–15');
assert.equal(august20V144Definition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit').circuitVersion,'foundation-1.4');
assert.equal(august20V144Entry.exercises[0].load,'17','the synthetic historical load remains unchanged');
assert.equal(august20V144Entry.exercises[0].reps,'9, 11','the synthetic historical repetitions remain unchanged');

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

const august22V145Fixture=`{
 id:'august22-day4',date:'2026-08-22',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',programVersion:'1.4.5',programEffectiveDate:'2026-08-21',
 prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
  {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 3 — 1:00 walk / 2:00 run × 7',type:'run',runStage:3,targetRpe:'5–6',coachingNotes:'On a treadmill, start the running segments around 6.2 mph and use 6.2–6.4 mph as the acceptable working range.'},
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 7',type:'body',sets:4,coachingNotes:'Use four equal, technically clean sets. Stop before failure.'},
  {id:'plank',name:'Front plank',prescription:'3 × 35 sec',type:'timed',sets:3,prescribedTimes:['0:35','0:35','0:35']},
  {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
 ]},
 exercises:[
  {exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',completed:true,runStage:'3',walkMinutes:'1',runMinutes:'2',rounds:'7',completedRounds:'7',programmedIntervalTime:'21:00',totalTime:'22:34',distance:'1.77',runSpeed:'6.0',runPain:'0',rpe:'5',notes:'Synthetic compatibility result.'},
  {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',completed:true,sets:'4',reps:'7, 7, 7, 7',rpe:'5'},
  {exerciseId:'plank',name:'Front plank',type:'timed',completed:true,sets:'3',times:'40, 40, 40',rpe:'6'}
 ]
}`;
const august22V145Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${august22V145Fixture}))`));
const august22V145Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${august22V145Fixture}))`));
assert.equal(august22V145Definition.exercises.find(exercise=>exercise.id==='primaryRun').prescription,'Stage 3 — 1:00 walk / 2:00 run × 7');
assert.equal(august22V145Definition.exercises.find(exercise=>exercise.id==='primaryRun').runStage,3);
assert.equal(august22V145Definition.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'4 × 7');
assert.deepEqual(august22V145Definition.exercises.find(exercise=>exercise.id==='plank').prescribedTimes,['0:35','0:35','0:35']);
assert.equal(august22V145Entry.exercises.find(exercise=>exercise.exerciseId==='primaryRun').runMinutes,'2','the raw Stage 3 interval duration remains unchanged');
assert.equal(august22V145Entry.exercises.find(exercise=>exercise.exerciseId==='primaryRun').distance,'1.77');
assert.equal(evaluate(`prescriptionAdherence(definitionForSavedEntry(${august22V145Fixture}).exercises.find(exercise=>exercise.id==='primaryRun'),normalizeEntry(${august22V145Fixture}).exercises.find(exercise=>exercise.exerciseId==='primaryRun'))`),'met');
assert.equal(evaluate(`(()=>{const prior=entries;entries=[normalizeEntry(${august22V145Fixture})];const selected=previousResultData(LEGACY_SESSIONS.day4.exercises.find(exercise=>exercise.id==='primaryRun'),'').selected;entries=prior;return selected?.comparable})()`),false,'the prior Stage 3 run is not directly comparable with active Stage 4');

const august23V146Fixture=`{
 "id":"august-23-v146-day1","date":"2026-08-23","dayKey":"day1","dayLabel":"Day 1 — Deadlift and Intervals","sessionType":"primary","programVersion":"1.4.6","activeRunStage":4,
 "prescriptionSnapshot":{"sessionKey":"day1","sessionType":"primary","label":"Day 1 — Deadlift and Intervals","targetSessionRpe":"6–8","exercises":[
  {"id":"deadlift","name":"Trap-bar deadlift","prescription":"155 lb total for 3 × 5","type":"weighted","unit":"lb","sets":3,"targetLoad":155,"targetLoadVariation":"Trap / hex bar","targetRpe":"6–8"},
  {"id":"squatOrLegPress","name":"Leg press","prescription":"140 lb for 3 × 9","type":"weighted","unit":"lb","sets":3,"targetLoad":140,"targetLoadVariation":"Leg press","targetRpe":"7"},
  {"id":"horizontalPress","name":"Dumbbell bench press","prescription":"35 lb per hand for 3 × 10","type":"weighted","unit":"lb per hand","sets":3,"targetLoad":35,"targetLoadVariation":"Dumbbell bench press","targetRpe":"7–8"},
  {"id":"seatedRow","name":"Seated cable row","prescription":"88 lb for 3 × 11","type":"weighted","unit":"lb","sets":3,"targetLoad":88,"targetLoadVariation":"Seated cable row","targetRpe":"6–8"},
  {"id":"loadedCarry","name":"Farmer carry","prescription":"45 lb per hand for 4 trips of approximately 30–40 yd","type":"carry","unit":"lb per hand","sets":4},
  {"id":"plank","name":"Front plank","prescription":"3 × 45 sec","type":"timed","sets":3,"targetRpe":"6–7","prescribedTimes":["0:45","0:45","0:45"]},
  {"id":"runWalkIntervals","name":"Walk / run intervals","prescription":"Stage 4 — 1:00 walk / 2:30 run × 6","type":"interval","runStage":4,"targetRpe":"5–6"},
  {"id":"preacherCurl","name":"Preacher curl","prescription":"2 × 10–15; use 40 lb total on the same EZ-bar setup","type":"weighted","unit":"lb total","sets":2,"targetLoad":40,"targetLoadVariation":"EZ-bar preacher curl","targetRpe":"7–9","optional":true},
  {"id":"tricepsPressdown","name":"Cable triceps pressdown","prescription":"77 lb for 2 × 15 on the same machine/cable setup","type":"weighted","unit":"lb total","sets":2,"targetRpe":"7–9","optional":true}
 ]},
 "exercises":[
  {"exerciseId":"deadlift","name":"Trap-bar deadlift","type":"weighted","variation":"Trap / hex bar","load":"50","loadMode":"platesPerSide","barWeight":"45","sets":"3","reps":"5, 5, 5","rpe":"7","completed":true},
  {"exerciseId":"squatOrLegPress","name":"Leg press","type":"weighted","variation":"Leg press","load":"135","sets":"3","reps":"9, 9, 9","rpe":"7","completed":true},
  {"exerciseId":"horizontalPress","name":"Dumbbell bench press","type":"weighted","variation":"Dumbbell bench press","load":"32","sets":"3","reps":"10, 10, 10","rpe":"8","completed":true},
  {"exerciseId":"seatedRow","name":"Seated cable row","type":"weighted","variation":"Seated cable row","load":"83","sets":"3","reps":"11, 11, 11","rpe":"6","completed":true},
  {"exerciseId":"loadedCarry","name":"Farmer carry","type":"carry","variation":"Farmer carry","load":"42","sets":"4","distance":"35","rpe":"7","completed":true},
  {"exerciseId":"plank","name":"Front plank","type":"timed","sets":"3","times":"45, 45, 45","rpe":"6","completed":true},
  {"exerciseId":"runWalkIntervals","name":"Walk / run intervals","type":"interval","runStage":"4","walkMinutes":"1","runMinutes":"2.5","rounds":"6","completedRounds":"6","programmedIntervalTime":"21:00","totalTime":"22:05","distance":"1.75","runSpeed":"5.9","avgHr":"136","rpe":"5","completed":true}
 ]
}`;
const august23V146Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${august23V146Fixture}))`));
const august23V146Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${august23V146Fixture}))`));
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='deadlift').prescription,'155 lb total for 3 × 5');
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='deadlift').targetLoad,155);
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='squatOrLegPress').prescription,'140 lb for 3 × 9');
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='horizontalPress').targetLoad,35);
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='seatedRow').targetLoad,88,'the historical row target remains frozen even though the current program treats the new stack cue as setup-specific');
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='plank').targetRpe,'6–7');
assert.equal(august23V146Definition.exercises.find(exercise=>exercise.id==='runWalkIntervals').runStage,4);
assert.equal(august23V146Entry.exercises.find(exercise=>exercise.exerciseId==='runWalkIntervals').totalTime,'22:05');
assert.equal(august23V146Entry.exercises.find(exercise=>exercise.exerciseId==='runWalkIntervals').avgHr,'136');
assert.equal(evaluate(`prescriptionAdherence(definitionForSavedEntry(${august23V146Fixture}).exercises.find(exercise=>exercise.id==='runWalkIntervals'),normalizeEntry(${august23V146Fixture}).exercises.find(exercise=>exercise.exerciseId==='runWalkIntervals'))`),'met');

const august25V147Fixture=`{
 "id":"august-25-v147-day2","date":"2026-08-25","dayKey":"day2","dayLabel":"Day 2 — Upper Body and Easy Cardio","sessionType":"primary","programVersion":"1.4.7","activeRunStage":4,
 "prescriptionSnapshot":{"sessionKey":"day2","sessionType":"primary","label":"Day 2 — Upper Body and Easy Cardio","targetSessionRpe":"6–7","exercises":[
  {"id":"handReleasePushups","name":"Hand-release push-ups","prescription":"5 × 8","type":"body","sets":5,"targetRpe":"6–7"},
  {"id":"verticalPull","name":"Lat pulldown","prescription":"Approximately 154 lb displayed on the same seated machine for 3 × 8–10","type":"weighted","unit":"lb","sets":3,"targetRpe":"6–8","defaultVariation":"Seated lat pulldown"},
  {"id":"overheadPress","name":"Seated dumbbell overhead press","prescription":"25 lb per hand for 3 × 10","type":"weighted","unit":"lb per hand","sets":3,"targetLoad":25,"targetLoadVariation":"Seated dumbbell press","targetRpe":"7–8"},
  {"id":"chestSupportedRow","name":"Machine row","prescription":"88 lb for 3 × 12 on the same machine/setup","type":"weighted","unit":"lb","sets":3,"targetRpe":"7–8","defaultVariation":"Machine row"},
  {"id":"lateralRaise","name":"Cable lateral raise","prescription":"2 × 15 on the same comparable cable setup/load","type":"weighted","unit":"lb per side","sets":2,"targetRpe":"7–8","defaultVariation":"Cable lateral raise"},
  {"id":"chestFly","name":"Cable fly / pec deck","prescription":"66 lb total for 2 × 15 on the same pec-deck setup","type":"weighted","unit":"lb per side","sets":2,"targetRpe":"7–9","defaultVariation":"Pec deck / machine fly"},
  {"id":"trunkStability","name":"Dead bug or Pallof press","prescription":"3 × 10 each side","type":"body","sets":3,"defaultVariation":"Dead bug"},
  {"id":"easyCardio","name":"Easy cardio","prescription":"25–30 minutes","type":"cardio","targetRpe":"4–5"}
 ]},
 "exercises":[
  {"exerciseId":"handReleasePushups","name":"Hand-release push-ups","type":"body","sets":"5","reps":"7, 7, 7, 7, 7","rpe":"6","completed":true},
  {"exerciseId":"verticalPull","name":"Lat pulldown","type":"weighted","variation":"Seated lat pulldown","load":"150","sets":"3","reps":"9, 9, 9","rpe":"7","completed":true},
  {"exerciseId":"overheadPress","name":"Seated dumbbell overhead press","type":"weighted","variation":"Seated dumbbell press","load":"22","sets":"3","reps":"9, 9, 9","rpe":"8","completed":true},
  {"exerciseId":"chestSupportedRow","name":"Machine row","type":"weighted","variation":"Machine row","load":"84","sets":"3","reps":"11, 11, 11","rpe":"8","completed":true},
  {"exerciseId":"lateralRaise","name":"Cable lateral raise","type":"weighted","variation":"Cable lateral raise","unit":"lb per side","load":"30","sets":"2","reps":"14, 14","rpe":"6","completed":true},
  {"exerciseId":"chestFly","name":"Cable fly / pec deck","type":"weighted","variation":"Pec deck / machine fly","unit":"lb total","load":"60","sets":"2","reps":"14, 14","rpe":"7","completed":true},
  {"exerciseId":"easyCardio","name":"Easy cardio","type":"cardio","modality":"Bike","minutes":"19","distance":"1.10","avgHr":"120","rpe":"5","completed":true}
 ]
}`;
const august25V147Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${august25V147Fixture}))`));
const august25V147Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${august25V147Fixture}))`));
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'5 × 8');
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='verticalPull').prescription,'Approximately 154 lb displayed on the same seated machine for 3 × 8–10');
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='overheadPress').targetLoad,25);
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription,'88 lb for 3 × 12 on the same machine/setup');
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='lateralRaise').prescription,'2 × 15 on the same comparable cable setup/load');
assert.equal(august25V147Definition.exercises.find(exercise=>exercise.id==='chestFly').prescription,'66 lb total for 2 × 15 on the same pec-deck setup');
assert.equal(august25V147Entry.duration,'','the omitted historical session duration remains blank');
assert.equal(august25V147Entry.sessionRpe,'','the omitted historical session RPE remains blank');
assert.equal(august25V147Entry.exercises.find(exercise=>exercise.exerciseId==='easyCardio').minutes,'19');
assert.equal(august25V147Entry.exercises.find(exercise=>exercise.exerciseId==='easyCardio').avgHr,'120');
assert.equal(evaluate(`prescriptionAdherence(definitionForSavedEntry(${august25V147Fixture}).exercises.find(exercise=>exercise.id==='easyCardio'),normalizeEntry(${august25V147Fixture}).exercises.find(exercise=>exercise.exerciseId==='easyCardio'))`),'below_target','the shortened cardio is preserved without changing the standard prescription');

const syntheticV148Day3Fixture=`{
 id:'synthetic-v148-day3',date:'2026-08-26',dayKey:'day3',dayLabel:'Day 3 — Lower Strength and Gym Conditioning',sessionType:'primary',programVersion:'1.4.8',programEffectiveDate:'2026-08-26',
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',targetSessionRpe:'7–8',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'125 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:125,targetLoadVariation:'Barbell'},
  {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 9',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat'},
  {id:'inclinePress',name:'Incline dumbbell press',prescription:'30 lb per hand for 3 × 10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Incline dumbbell press'},
  {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'45 lb for 3 × 11 each side',type:'weighted',unit:'lb',sets:3,targetLoad:45,targetLoadVariation:'One-arm dumbbell row'},
  {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 10 each leg',type:'weighted',unit:'lb total',sets:2},
  {id:'sidePlank',name:'Side plank',prescription:'3 × 40 sec each side',type:'timed',sets:3,prescribedTimes:['0:40','0:40','0:40']},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4.5'},
  {id:'hammerCurl',name:'Hammer curl',prescription:'20 lb per hand for 2 × 15',type:'weighted',unit:'lb per hand',sets:2,targetLoad:20,targetLoadVariation:'Dumbbell hammer curl',optional:true},
  {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'88 lb for 2 × 15 on the same rope/cable setup',type:'weighted',unit:'lb total',sets:2,optional:true}
 ]},exercises:[]
}`;
const syntheticV148Day3Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${syntheticV148Day3Fixture}))`));
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='romanianDeadlift').targetLoad,125,'the v1.4.8 RDL snapshot remains frozen');
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='inclinePress').prescription,'30 lb per hand for 3 × 10');
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='sidePlank').prescription,'3 × 40 sec each side');
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='hammerCurl').targetLoad,20);
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').prescription,'88 lb for 2 × 15 on the same rope/cable setup');
assert.equal(syntheticV148Day3Definition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit').circuitVersion,'foundation-1.4.5','the unchanged circuit version remains attached to the historical snapshot');

const syntheticV150Day1Fixture=`{
 id:'synthetic-v150-day1',date:'2026-08-30',dayKey:'day1',dayLabel:'Day 1 — Deadlift and Intervals',sessionType:'primary',programVersion:'1.5.0',programEffectiveDate:'2026-08-29',activeRunStage:4,
 prescriptionSnapshot:{sessionKey:'day1',sessionType:'primary',label:'Day 1 — Deadlift and Intervals',targetSessionRpe:'6–8',exercises:[
  {id:'deadlift',name:'Trap-bar deadlift',prescription:'165 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:165,targetLoadVariation:'Trap / hex bar'},
  {id:'squatOrLegPress',name:'Leg press',prescription:'140 lb for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:140,targetLoadVariation:'Leg press'},
  {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press'},
  {id:'seatedRow',name:'Seated cable row',prescription:'Next smallest increment above 88 lb on the same cable setup (approximately 99 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3},
  {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:4},
  {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,prescribedTimes:['0:45','0:45','0:45']},
  {id:'runWalkIntervals',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'interval',runStage:4},
  {id:'preacherCurl',name:'Preacher curl',prescription:'2 × 10–15; use 40 lb total on the same EZ-bar setup',type:'weighted',unit:'lb total',sets:2,targetLoad:40,targetLoadVariation:'EZ-bar preacher curl',optional:true},
  {id:'tricepsPressdown',name:'Cable triceps pressdown',prescription:'77 lb for 2 × 15 on the same machine/cable setup',type:'weighted',unit:'lb total',sets:2,optional:true}
 ]},exercises:[]
}`;
const syntheticV150Day1Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${syntheticV150Day1Fixture}))`));
assert.equal(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='deadlift').targetLoad,165,'the v1.5.0 trap-bar target remains frozen');
assert.equal(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='squatOrLegPress').prescription,'140 lb for 3 × 10');
assert.match(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='seatedRow').prescription,/above 88 lb.*approximately 99 lb.*3 × 8–10/);
assert.equal(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='preacherCurl').targetLoad,40);
assert.equal(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='tricepsPressdown').prescription,'77 lb for 2 × 15 on the same machine/cable setup');
assert.equal(syntheticV150Day1Definition.exercises.find(exercise=>exercise.id==='runWalkIntervals').runStage,4,'the historical v1.5.0 workout retains Stage 4');

const syntheticSep3V151Day3Fixture=`{
 id:'synthetic-sep3-v151-day3',date:'2026-09-03',dayKey:'day3',dayLabel:'Day 3 — Lower Strength and Gym Conditioning',sessionType:'primary',
 programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.1',programEffectiveDate:'2026-08-31',activeRunStage:4,
 prescriptionSnapshot:{sessionKey:'day3',sessionType:'primary',label:'Day 3 — Lower Strength and Gym Conditioning',targetSessionRpe:'7–8',exercises:[
  {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'135 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:135,targetLoadVariation:'Barbell',targetRpe:'6–8'},
  {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat',targetRpe:'7–8'},
  {id:'inclinePress',name:'Incline dumbbell press',prescription:'35 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:35,targetLoadVariation:'Incline dumbbell press',targetRpe:'7–8'},
  {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'45 lb for 3 × 12 each side',type:'weighted',unit:'lb',sets:3,targetLoad:45,targetLoadVariation:'One-arm dumbbell row',targetRpe:'6–8'},
  {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 12 each leg',type:'weighted',unit:'lb total',sets:2,targetRpe:'5–7'},
  {id:'sidePlank',name:'Side plank',prescription:'3 × 45 sec each side',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']},
  {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4.5'},
  {id:'hammerCurl',name:'Hammer curl',prescription:'25 lb per hand for 2 × 10',type:'weighted',unit:'lb per hand',sets:2,targetLoad:25,targetLoadVariation:'Dumbbell hammer curl',targetRpe:'7–9',optional:true},
  {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'Next smallest comparable increment above 88 lb on the same rope/cable setup (approximately 99 lb displayed if applicable) for 2 × 10–12',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',optional:true}
 ]},exercises:[]
}`;
const syntheticSep3V151Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${syntheticSep3V151Day3Fixture}))`));
const syntheticSep3V151Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${syntheticSep3V151Day3Fixture}))`));
assert.equal(syntheticSep3V151Entry.programVersion,'1.5.1','the September 3 workout keeps its saved public-app version');
assert.equal(syntheticSep3V151Entry.programEffectiveDate,'2026-08-31');
assert.equal(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='romanianDeadlift').targetLoad,135,'the September 3 RDL target remains frozen at v1.5.1');
assert.equal(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='inclinePress').prescription,'35 lb per hand for 3 × 8');
assert.equal(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='oneArmRow').targetLoad,45);
assert.equal(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='hammerCurl').prescription,'25 lb per hand for 2 × 10');
assert.match(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='overheadTricepsExtension').prescription,/above 88 lb.*approximately 99 lb/);
assert.equal(syntheticSep3V151Definition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit').circuitVersion,'foundation-1.4.5');

const syntheticSep5V153Day4Fixture=`{
 id:'synthetic-sep5-v153-day4',date:'2026-09-05',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',sessionType:'primary',
 programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.3',programEffectiveDate:'2026-09-04',activeRunStage:4,
 prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
  {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'run',runStage:4,targetRpe:'5–6',coachingNotes:'On a treadmill, start the running segments around 6.1–6.2 mph. Move toward 6.3–6.4 mph only if RPE remains at or below 6 and the stride remains relaxed and normal. Prioritize completion with reserve; duration progression takes priority over speed progression or calculated pace. Record actual walk and run speeds in the existing run details.'},
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 9',type:'body',sets:4,targetRpe:'5–7'},
  {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']},
  {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
 ]},exercises:[]
}`;
const syntheticSep5V153Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${syntheticSep5V153Day4Fixture}))`));
const syntheticSep5V153Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${syntheticSep5V153Day4Fixture}))`));
assert.equal(syntheticSep5V153Entry.programVersion,'1.5.3','the September 5 workout keeps its saved public-app version');
assert.equal(syntheticSep5V153Entry.programEffectiveDate,'2026-09-04');
assert.equal(syntheticSep5V153Definition.exercises.find(exercise=>exercise.id==='plank').prescription,'3 × 45 sec','the September 5 plank target remains frozen at v1.5.3');
assert.deepEqual(syntheticSep5V153Definition.exercises.find(exercise=>exercise.id==='plank').prescribedTimes,['0:45','0:45','0:45']);
assert.match(syntheticSep5V153Definition.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes,/6\.1–6\.2 mph/,'the September 5 run retains its saved pace guidance');
assert.doesNotMatch(syntheticSep5V153Definition.exercises.find(exercise=>exercise.id==='primaryRun').coachingNotes,/5\.7–5\.8 mph/);

const syntheticV154Day4Fixture=`{
 id:'synthetic-v154-day4',date:'2026-09-06',dayKey:'day4',dayLabel:'Day 4 — Run and Calisthenics',sessionType:'primary',
 programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.4',programEffectiveDate:'2026-09-06',activeRunStage:4,
 prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
  {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'run',runStage:4,targetRpe:'5–6'},
  {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 9',type:'body',sets:4,targetRpe:'5–7'},
  {id:'plank',name:'Front plank',prescription:'3 × 50 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:50','0:50','0:50']},
  {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
 ]},exercises:[]
}`;
const syntheticV154Day4Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${syntheticV154Day4Fixture}))`));
const syntheticV154Day4Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${syntheticV154Day4Fixture}))`));
assert.equal(syntheticV154Day4Entry.programVersion,'1.5.4','an existing v1.5.4 workout keeps its saved public-app version');
assert.equal(syntheticV154Day4Entry.programEffectiveDate,'2026-09-06');
assert.equal(syntheticV154Day4Entry.rotationDayKey,undefined,'normalization does not rewrite historical standard entries with a new mapping field');
assert.equal(syntheticV154Day4Definition.exercises.find(exercise=>exercise.id==='plank').prescription,'3 × 50 sec','the v1.5.4 snapshot remains frozen');
assert.deepEqual(syntheticV154Day4Definition.exercises.find(exercise=>exercise.id==='plank').prescribedTimes,['0:50','0:50','0:50']);

const syntheticSep10V155AlternativeFixture={
 id:'synthetic-sep10-v155-alternative',date:'2026-09-10',updatedAt:'2026-09-10T18:00:00.000Z',
 dayKey:'day1IllnessRecovery',dayLabel:'Day 1 — Illness Recovery',rotationDayKey:'day1',sessionType:'primary',
 advancesPrimaryRotation:true,coachDirectedAlternative:true,programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',
 programVersion:'1.5.5',programEffectiveDate:'2026-09-10',activeRunStage:4,targetSessionRpe:'5–6',duration:'42',sessionRpe:'5',
 painDuring:'0',painLocation:'',notes:'Synthetic historical compatibility fixture.',
 prescriptionSnapshot:{
  sessionKey:'day1IllnessRecovery',sessionType:'primary',rotationDayKey:'day1',coachDirectedAlternative:true,
  label:'Day 1 — Illness Recovery',focus:'Coach-directed reduced-volume Day 1 alternative for a controlled return to training.',
  targetDuration:'No more than approximately 45 minutes',targetSessionRpe:'5–6',advancesPrimaryRotation:true,
  coachInstructions:'Stop for symptom recurrence, disproportionate effort, unusual fatigue, breathlessness, chest discomfort, dizziness, palpitations, or exertional headache. Do not add the omitted run or accessory work.',
  optional:false,exercises:[
   {id:'illnessReturnCheck',name:'Return-to-exercise check',prescription:'10 minutes easy stationary bike or walk',type:'cardio',modalities:['Stationary bike','Walk'],targetRpe:'2–3',coachingNotes:'Continue only if breathing, heart-rate response, energy, and symptoms feel normal. Stop rather than push through an abnormal response.'},
   {id:'deadlift',name:'Trap-bar deadlift',prescription:'175 lb total for 2 × 5',type:'weighted',unit:'lb',sets:2,targetLoad:175,targetLoadVariation:'Trap / hex bar',targetRpe:'≤6',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},perSideVariations:['Trap / hex bar'],barWeightOptions:[45,55,60]},
   {id:'squatOrLegPress',name:'Leg press',prescription:'140 lb on the same comparable machine/setup for 2 × 8',type:'weighted',unit:'lb',sets:2,variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press',targetRpe:'≤6'},
   {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 2 × 8',type:'weighted',unit:'lb per hand',sets:2,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'≤6',variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45}},
   {id:'seatedRow',name:'Seated cable row',prescription:'132 lb displayed on the same cable setup for 2 × 10',type:'weighted',unit:'lb',sets:2,targetRpe:'≤6',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'},
   {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 2 trips of approximately 40 yd',type:'carry',unit:'lb per hand',sets:2,targetRpe:'≤6',variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry'},
   {id:'plank',name:'Front plank',prescription:'2 × 45 sec',type:'timed',sets:2,targetRpe:'≤6',prescribedTimes:['0:45','0:45']}
  ]
 },
 exercises:[
  {exerciseId:'illnessReturnCheck',name:'Return-to-exercise check',type:'cardio',modality:'Walk',minutes:'10',rpe:'2',completed:true},
  {exerciseId:'deadlift',name:'Trap-bar deadlift',type:'weighted',unit:'lb',variation:'Trap / hex bar',variationId:'trapBar',load:'65',loadMode:'platesPerSide',barWeight:'45',sets:'2',reps:'5, 5',rpe:'6',completed:true},
  {exerciseId:'squatOrLegPress',name:'Leg press',type:'weighted',unit:'lb',variation:'Leg press',variationId:'unspecifiedLegPress',load:'140',sets:'2',reps:'8, 8',rpe:'6',completed:true},
  {exerciseId:'horizontalPress',name:'Dumbbell bench press',type:'weighted',unit:'lb per hand',variation:'Dumbbell bench press',variationId:'dumbbellBenchPress',load:'40',sets:'2',reps:'8, 8',rpe:'6',completed:true},
  {exerciseId:'seatedRow',name:'Seated cable row',type:'weighted',unit:'lb',variation:'Seated cable row',variationId:'seatedCableRow',load:'132',sets:'2',reps:'10, 10',rpe:'6',completed:true},
  {exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',variationId:'farmerCarry',load:'45',sets:'2',distance:'40',rpe:'6',completed:true},
  {exerciseId:'plank',name:'Front plank',type:'timed',sets:'2',times:'45, 45',rpe:'6',completed:true}
 ]
};
const syntheticSep10V155Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(syntheticSep10V155AlternativeFixture)}))`));
const syntheticSep10V155Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${JSON.stringify(syntheticSep10V155AlternativeFixture)}))`));
assert.equal(syntheticSep10V155Entry.dayKey,'day1IllnessRecovery');
assert.equal(syntheticSep10V155Entry.rotationDayKey,'day1');
assert.equal(syntheticSep10V155Entry.sessionType,'primary');
assert.equal(syntheticSep10V155Entry.advancesPrimaryRotation,true);
assert.equal(syntheticSep10V155Entry.programVersion,'1.5.5');
assert.deepEqual(syntheticSep10V155Entry.prescriptionSnapshot,syntheticSep10V155AlternativeFixture.prescriptionSnapshot,'normalization never mutates the retired session snapshot');
assert.deepEqual(syntheticSep10V155Entry.exercises,syntheticSep10V155AlternativeFixture.exercises,'normalization preserves every historical result');
assert.equal(syntheticSep10V155Definition.label,'Day 1 — Illness Recovery');
assert.deepEqual(syntheticSep10V155Definition.exercises.map(exercise=>exercise.id),['illnessReturnCheck','deadlift','squatOrLegPress','horizontalPress','seatedRow','loadedCarry','plank'],'the retired workout loads entirely from its immutable snapshot');
assert.equal(syntheticSep10V155Definition.exercises.find(exercise=>exercise.id==='deadlift').prescription,'175 lb total for 2 × 5');
const editedSyntheticSep10=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({...${JSON.stringify(syntheticSep10V155AlternativeFixture)},notes:'Synthetic edited note.'}))`));
assert.equal(editedSyntheticSep10.notes,'Synthetic edited note.','a snapshot-backed retired entry remains editable');
assert.deepEqual(editedSyntheticSep10.prescriptionSnapshot,syntheticSep10V155AlternativeFixture.prescriptionSnapshot,'editing cannot replace the retired prescription with standard Day 1');
assert.deepEqual(editedSyntheticSep10.exercises,syntheticSep10V155AlternativeFixture.exercises,'editing unrelated fields preserves historical results');

const syntheticSep13V156Day2Fixture={
 id:'synthetic-sep13-v156-day2',date:'2026-09-13',updatedAt:'2026-09-13T18:00:00.000Z',dayKey:'day2',
 dayLabel:'Day 2 — Upper Body and Easy Cardio',sessionType:'primary',advancesPrimaryRotation:true,
 programId:'aft-foundation-block-1',programName:'AFT Foundation Block 1',programVersion:'1.5.6',programEffectiveDate:'2026-09-11',
 activeRunStage:4,targetSessionRpe:'6–7',duration:'74',sessionRpe:'6',painDuring:'0',painLocation:'',
 notes:'Synthetic September 13 history fixture.',
 prescriptionSnapshot:{
  sessionKey:'day2',sessionType:'primary',label:'Day 2 — Upper Body and Easy Cardio',
  focus:'Repeatable upper-body work followed by low-intensity aerobic training.',
  warmup:'5–8 minutes of easy cardio, shoulder and upper-back movement prep, then 1–2 easy push-up and pull ramp-up sets.',
  targetSessionRpe:'6–7',advancesPrimaryRotation:true,optional:false,exercises:[
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 10',type:'body',sets:5,targetRpe:'6–8',coachingNotes:'Keep all five sets equal, technically clean, and submaximal. Maintain strong whole-body bracing, stop before failure, and do not turn this into a maximal-set test.'},
   {id:'verticalPull',name:'Lat pulldown',prescription:'Next smallest increment above 165 lb on the same seated machine (approximately 176 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'6–8',variations:['Seated lat pulldown','Modified standing lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Seated lat pulldown',coachingNotes:'Use the next smallest machine increment above 165 lb only on the same seated machine and setup. Approximately 176 lb is guidance for an 11-lb stack increment, not a universal target for a different cable or pulley setup.'},
   {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'30 lb per hand for 3 × 9',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–9',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press',coachingNotes:'Progress repetitions at the current 30 lb-per-hand load. Use controlled repetitions and keep the working sets within the target effort range.'},
   {id:'chestSupportedRow',name:'Machine row',prescription:'Next smallest increment above 99 lb on the same machine (approximately 110 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'7–8',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row',coachingNotes:'Use the next smallest increment above 99 lb only on the same machine and setup. Approximately 110 lb is setup-specific guidance rather than a universal machine-row load.'},
   {id:'lateralRaise',name:'Cable lateral raise',prescription:'33 lb displayed per side on the same comparable cable setup for 2 × 20',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–8',variations:['Cable lateral raise','Cuffed-cable lateral raise','Machine lateral raise','Dumbbell lateral raise'],defaultVariation:'Cable lateral raise',variationUnits:{'Cable lateral raise':'lb per side','Cuffed-cable lateral raise':'lb per side','Machine lateral raise':'lb total','Dumbbell lateral raise':'lb per hand'},coachingNotes:'Use rep progression on the same comparable pain-free cable setup and load. The displayed 33 lb per side is not a universal load target. Maintain pain-free technique.'},
   {id:'chestFly',name:'Cable fly / pec deck',prescription:'77 lb displayed on the same pec-deck machine/setup for 2 × 15',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–9',variations:['Pec deck / machine fly','Cable chest fly'],defaultVariation:'Pec deck / machine fly',variationUnits:{'Cable chest fly':'lb per side','Pec deck / machine fly':'lb total'},coachingNotes:'Use 77 lb displayed only on the same pec-deck machine and setup. Keep the stretch and contraction controlled, stop with approximately 1–3 good repetitions in reserve, and progress repetitions before any future load increase.'},
   {id:'trunkStability',name:'Dead bug or Pallof press',prescription:'3 × 10 each side',type:'body',sets:3,variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug',coachingNotes:'Keep the movement slow and controlled. Use a full exhale and deliberate brace rather than increasing repetitions because the current variation feels easy.'},
   {id:'easyCardio',name:'Easy cardio',prescription:'25–30 minutes',type:'cardio',modalities:['Bike','Elliptical','Rower','Incline walk','Other'],targetRpe:'4–5',coachingNotes:'Use conversational effort throughout. Complete at least 25 minutes on the next Day 2 before any future duration change; do not add make-up work for the prior shortened session.'}
  ]
 },
 exercises:[
  {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'10, 10, 10, 10, 10',rpe:'6',completed:true,notes:'Synthetic clean-set result.'},
  {exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Seated lat pulldown',variationId:'seatedLatPulldown',load:'176',sets:'3',reps:'10, 10, 12',rpe:'8',completed:true},
  {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'30',sets:'3',reps:'9, 9, 7',rpe:'9',completed:true,exercisePain:{severity:0,location:'',laterality:'',note:'Synthetic no-pain result.',causedExerciseToStop:false}},
  {exerciseId:'chestSupportedRow',name:'Machine row',type:'weighted',unit:'lb',variation:'Machine row',variationId:'machineRow',load:'110',sets:'3',reps:'8, 8, 8',rpe:'7',completed:true},
  {exerciseId:'lateralRaise',name:'Cable lateral raise',type:'weighted',unit:'lb per side',variation:'Cable lateral raise',variationId:'cableLateralRaise',load:'33',sets:'2',reps:'20, 20',rpe:'8',completed:true},
  {exerciseId:'chestFly',name:'Cable fly / pec deck',type:'weighted',unit:'lb total',variation:'Pec deck / machine fly',variationId:'pecDeckMachineFly',load:'77',sets:'2',reps:'15, 15',rpe:'8',completed:true},
  {exerciseId:'trunkStability',name:'Dead bug or Pallof press',type:'body',variation:'Dead bug',sets:'3',reps:'10, 10, 10',rpe:'5',completed:true},
  {exerciseId:'easyCardio',name:'Easy cardio',type:'cardio',modality:'Bike',minutes:'30',rpe:'4',completed:true}
 ]
};
const syntheticSep13V156Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(syntheticSep13V156Day2Fixture)}))`));
const syntheticSep13V156Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${JSON.stringify(syntheticSep13V156Day2Fixture)}))`));
assert.equal(syntheticSep13V156Entry.programVersion,'1.5.6');
assert.equal(syntheticSep13V156Entry.programEffectiveDate,'2026-09-11');
assert.deepEqual(syntheticSep13V156Entry.prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'normalization never replaces the September 13 v1.5.6 snapshot');
assert.deepEqual(syntheticSep13V156Entry.exercises,syntheticSep13V156Day2Fixture.exercises,'normalization preserves all September 13 results, RPE, pain, and notes');
assert.equal(syntheticSep13V156Definition.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'5 × 10');
assert.match(syntheticSep13V156Definition.exercises.find(exercise=>exercise.id==='verticalPull').prescription,/above 165 lb.*176 lb/);
assert.match(syntheticSep13V156Definition.exercises.find(exercise=>exercise.id==='chestSupportedRow').prescription,/above 99 lb.*110 lb/);
assert.equal(syntheticSep13V156Definition.exercises.find(exercise=>exercise.id==='lateralRaise').prescription,'33 lb displayed per side on the same comparable cable setup for 2 × 20');
assert.equal(syntheticSep13V156Definition.exercises.find(exercise=>exercise.id==='chestFly').prescription,'77 lb displayed on the same pec-deck machine/setup for 2 × 15');
const importedSep13V156Entry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(JSON.parse(${JSON.stringify(JSON.stringify(syntheticSep13V156Day2Fixture))})))`));
assert.deepEqual(importedSep13V156Entry.prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'JSON import normalization preserves the complete September 13 snapshot');
assert.deepEqual(importedSep13V156Entry.exercises,syntheticSep13V156Day2Fixture.exercises,'JSON import normalization preserves the complete September 13 results');
const editedSyntheticSep13=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({...${JSON.stringify(syntheticSep13V156Day2Fixture)},notes:'Synthetic edited September 13 note.'}))`));
assert.equal(editedSyntheticSep13.notes,'Synthetic edited September 13 note.','the September 13 entry remains editable');
assert.deepEqual(editedSyntheticSep13.prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'editing cannot replace the September 13 snapshot with v1.5.7');
const sep13PulldownComparability=JSON.parse(evaluate(`JSON.stringify((()=>{
 const prior=entries;
 entries=[normalizeEntry(${JSON.stringify(syntheticSep13V156Day2Fixture)})];
 const definition=LEGACY_SESSIONS.day2.exercises.find(exercise=>exercise.id==='verticalPull');
 const seated=previousResultData(definition,'Seated lat pulldown');
 const standing=previousResultData(definition,'Modified standing lat pulldown');
 entries=prior;
 return {seatedDate:seated.selected?.entry.date,seatedComparable:seated.selected?.comparable,standingComparable:standing.candidates[0]?.comparable};
})())`));
assert.deepEqual(sep13PulldownComparability,{seatedDate:'2026-09-13',seatedComparable:true,standingComparable:false},'stable exercise and variation IDs preserve same-setup pulldown comparability across the version change');

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

const snapshot=evaluate('snapshotSession(LEGACY_SESSIONS.day1)');
assert.equal(snapshot.exercises[0].id,'deadlift');
assert.equal(snapshot.exercises[0].prescription,'175 lb total for 3 × 5');

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
const fixtureSummaries=JSON.parse(evaluate(`JSON.stringify(LEGACY_SESSIONS.day1.exercises.map(definition=>{
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
assert.equal(evaluate(`previousResultData(LEGACY_SESSIONS.day1.exercises[0],'Trap / hex bar',{excludeEntryId:'august-1-day-1'}).selected`),null,'editing excludes the workout itself');
const carryRoundTrip=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({
 id:'august-9-day-1',date:'2026-08-09',dayKey:'day1',dayLabel:LEGACY_SESSIONS.day1.label,sessionType:'primary',
 exercises:[${august9Carry}]
}))`));
assert.deepEqual(carryRoundTrip.exercises[0],{
 exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',unit:'lb per hand',variation:'Farmer carry',load:'45',sets:'4',distance:'40',carrySeconds:'30',rpe:'6',completed:true
},'normalization preserves existing carry-history fields without rewriting raw values');
const carryBackup=JSON.parse(evaluate(`(()=>{
 const prior=entries;
 entries=[normalizeEntry({id:'august-9-day-1',date:'2026-08-09',dayKey:'day1',dayLabel:LEGACY_SESSIONS.day1.label,sessionType:'primary',exercises:[${august9Carry}]})];
 const backup=JSON.stringify(buildJsonBackup());
 entries=prior;
 return backup;
})()`));
assert.equal(carryBackup.version,11,'the carry patch does not require a storage-schema migration');
assert.deepEqual(carryBackup.entries[0].exercises[0],carryRoundTrip.exercises[0],'JSON backups preserve raw carry history');
assert.equal(evaluate(`previousResultData(LEGACY_SESSIONS.day1.exercises[0],'Trap / hex bar',{excludeEntryId:null,source:[
 {id:'older',date:'2026-08-01',updatedAt:'2026-08-01T10:00:00Z',exercises:[{exerciseId:'deadlift',type:'weighted',variation:'Trap / hex bar',load:'35'}]},
 {id:'newer',date:'2026-08-01',updatedAt:'2026-08-01T11:00:00Z',exercises:[{exerciseId:'deadlift',type:'weighted',variation:'Trap / hex bar',load:'45'}]}
]}).selected.exercise.load`),'45','updatedAt breaks same-date ties');
assert.equal(evaluate(`exerciseIdentity({exerciseId:'trapBarDeadlift'})`),'deadlift');
assert.equal(evaluate(`exerciseIdentity({exerciseId:'primaryRun'})`),'runWalkIntervals');
assert.equal(evaluate(`exerciseIdentity({name:'Loaded carry or hold'})`),'loadedCarry');
assert.equal(evaluate(`exerciseVariationId({variation:'Lying leg press'})`),'lyingLegPress');
assert.match(evaluate(`previousResultReference(LEGACY_SESSIONS.day1.exercises[1],'Upright leg press')`),/not directly comparable/);
const alternativeSharedResults=JSON.parse(evaluate(`JSON.stringify((()=>{
 const source=[{id:'standard-day1',date:'2026-09-06',dayKey:'day1',sessionType:'primary',exercises:[
  {exerciseId:'deadlift',type:'weighted',variation:'Trap / hex bar',load:'65',loadMode:'platesPerSide',barWeight:'45'},
  {exerciseId:'squatOrLegPress',type:'weighted',variation:'Leg press',load:'140'},
  {exerciseId:'horizontalPress',type:'weighted',variation:'Dumbbell bench press',load:'40'},
  {exerciseId:'seatedRow',type:'weighted',variation:'Seated cable row',load:'132'},
  {exerciseId:'loadedCarry',type:'carry',variation:'Farmer carry',load:'45',distance:'40'},
  {exerciseId:'plank',type:'timed',times:'45, 45'}
 ]}];
 return ${JSON.stringify(syntheticSep10V155Definition.exercises)}.filter(definition=>definition.id!=='illnessReturnCheck').map(definition=>{
  const selected=previousResultData(definition,definition.defaultVariation||'',{source,excludeEntryId:null}).selected;
  return {id:definition.id,found:selected?.exercise.exerciseId||'',comparable:Boolean(selected?.comparable)};
 });
})())`));
assert.deepEqual(alternativeSharedResults,[
 {id:'deadlift',found:'deadlift',comparable:true},
 {id:'squatOrLegPress',found:'squatOrLegPress',comparable:true},
 {id:'horizontalPress',found:'horizontalPress',comparable:true},
 {id:'seatedRow',found:'seatedRow',comparable:true},
 {id:'loadedCarry',found:'loadedCarry',comparable:true},
 {id:'plank',found:'plank',comparable:true}
],'all six shared movements reuse standard Day 1 result identities and comparability');
assert.equal(evaluate(`exerciseIdentity({name:'Return-to-exercise check'})`),'illnessReturnCheck','the return check has a distinct identity');
assert.notEqual(evaluate(`exerciseIdentity({name:'Return-to-exercise check'})`),evaluate(`exerciseIdentity({name:'Easy stationary bike or walk'})`),'the return check is not conflated with recovery cardio');
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
 markdownPreview:{value:''},
 daySelect:{value:'',innerHTML:''}
};
context.document={
 getElementById:id=>elements[id]||{value:'',classList:{add(){},remove(){},toggle(){}}},
 querySelectorAll:()=>[]
};

evaluate('populateSessionSelect()');
const sessionSelectorHtml=elements.daySelect.innerHTML;
const primarySelectorGroup=sessionSelectorHtml.match(/<optgroup label="Primary rotation">([\s\S]*?)<\/optgroup>/)?.[1]||'';
activeRotation.forEach(key=>assert.match(primarySelectorGroup,new RegExp(`<option value="${key}">`),`${key} is selectable in the primary rotation`));
assert.equal((primarySelectorGroup.match(/<option /g)||[]).length,6,'the primary selector contains exactly six active sessions');
assert.doesNotMatch(primarySelectorGroup,/value="day[1-4]"/,'legacy Day 1–Day 4 keys are retired from active selection');
assert.doesNotMatch(sessionSelectorHtml,/day1IllnessRecovery|Day 1 — Illness Recovery/,'the retired alternative has no selector option');
assert.doesNotMatch(sessionSelectorHtml,/Coach-directed alternatives/,'an empty coach-directed alternatives group is omitted');

elements.sessionDate={value:'2026-09-19'};
evaluate(`activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.strengthUpperAft;activeSavedExercises=[];editing=null`);
const newV1510Workout=JSON.parse(evaluate('JSON.stringify(collectWorkoutItem())'));
assert.equal(newV1510Workout.dayKey,'strengthUpperAft');
assert.equal(newV1510Workout.programVersion,'1.5.10','new primary workouts capture the synchronized program version');
assert.equal(newV1510Workout.programEffectiveDate,'2026-09-19','new primary workouts capture the synchronized effective date');
assert.equal(newV1510Workout.prescriptionSnapshot.sessionKey,'strengthUpperAft');
assert.equal(newV1510Workout.prescriptionSnapshot.exercises.find(exercise=>exercise.id==='handReleasePushups').prescription,'5 × 11');
assert.match(newV1510Workout.prescriptionSnapshot.exercises.find(exercise=>exercise.id==='verticalPull').prescription,/above 176 lb.*187 lb/);
const newV1510PressSnapshot=newV1510Workout.prescriptionSnapshot.exercises.find(exercise=>exercise.id==='overheadPress');
assert.equal(newV1510PressSnapshot.prescription,'25 lb per hand for 3 × 8–10');
assert.equal(newV1510PressSnapshot.sets,3);
assert.equal(newV1510PressSnapshot.targetLoad,25);
assert.equal(newV1510PressSnapshot.targetLoadVariation,'Seated dumbbell press');
assert.equal(newV1510PressSnapshot.targetRpe,'7–8');
assert.equal(newV1510Workout.prescriptionSnapshot.exercises.find(exercise=>exercise.id==='trunkStability').prescription,'3 × 10 each side');

const syntheticSep18V159Strength1Fixture=JSON.parse(evaluate(`JSON.stringify((()=>{
 const prescriptionSnapshot=snapshotSession(SESSIONS.strengthUpperAft);
 const historicalPress=prescriptionSnapshot.exercises.find(exercise=>exercise.id==='overheadPress');
 Object.assign(historicalPress,{
  prescription:'30 lb per hand for 3 × 9',targetLoad:30,targetRpe:'7–9',
  coachingNotes:'Hold the current 30 lb-per-hand load until all three sets of 9 are completed cleanly. Do not increase the load, add make-up repetitions, or turn the target into a failure test.'
 });
 return {
  id:'synthetic-sep18-v159-strength1',date:'2026-09-18',updatedAt:'2026-09-18T18:00:00.000Z',
  dayKey:'strengthUpperAft',dayLabel:'Strength 1 — Upper Body and AFT Calisthenics',sessionType:'primary',advancesPrimaryRotation:true,
  programId:PROGRAM.id,programName:PROGRAM.name,programVersion:'1.5.9',programEffectiveDate:'2026-09-17',activeRunStage:4,
  targetSessionRpe:'6–7',duration:'64',sessionRpe:'7',painDuring:'0',notes:'Invented snapshot-compatibility fixture.',
  prescriptionSnapshot,
  exercises:[{
   exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',
   variation:'Seated dumbbell press',load:'30',sets:'3',reps:'9, 9, 9',rpe:'8',completed:true,
   notes:'Invented historical press result.'
  }]
 };
})())`));
const normalizedSep18V159=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(syntheticSep18V159Strength1Fixture)}))`));
assert.deepEqual(normalizedSep18V159.prescriptionSnapshot,syntheticSep18V159Strength1Fixture.prescriptionSnapshot,'normalization preserves the complete invented September 18 v1.5.9 snapshot');
assert.deepEqual(normalizedSep18V159.exercises,syntheticSep18V159Strength1Fixture.exercises,'normalization preserves every invented September 18 result');
const sep18V159Definition=JSON.parse(evaluate(`JSON.stringify(definitionForSavedEntry(${JSON.stringify(normalizedSep18V159)}))`));
const sep18V159PressDefinition=sep18V159Definition.exercises.find(exercise=>exercise.id==='overheadPress');
assert.equal(sep18V159PressDefinition.prescription,'30 lb per hand for 3 × 9');
assert.equal(sep18V159PressDefinition.targetLoad,30);
assert.equal(sep18V159PressDefinition.targetRpe,'7–9');
assert.equal(evaluate(`prescriptionAdherence(${JSON.stringify(sep18V159PressDefinition)},${JSON.stringify(normalizedSep18V159.exercises[0])})`),'met','the historical result is assessed against its saved v1.5.9 target');
const editedSep18V159=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({...${JSON.stringify(normalizedSep18V159)},notes:'Invented edited history note.'}))`));
assert.deepEqual(editedSep18V159.prescriptionSnapshot,syntheticSep18V159Strength1Fixture.prescriptionSnapshot,'editing never replaces the v1.5.9 snapshot with active targets');
assert.deepEqual(editedSep18V159.exercises,syntheticSep18V159Strength1Fixture.exercises,'editing preserves the historical results');
const importedSep18V159=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(JSON.parse(${JSON.stringify(JSON.stringify(syntheticSep18V159Strength1Fixture))})))`));
assert.deepEqual(importedSep18V159.prescriptionSnapshot,syntheticSep18V159Strength1Fixture.prescriptionSnapshot,'JSON import preserves the v1.5.9 snapshot');
assert.deepEqual(importedSep18V159.exercises,syntheticSep18V159Strength1Fixture.exercises,'JSON import preserves the v1.5.9 results');
elements.exportFrom.value='2026-09-18';
elements.exportTo.value='2026-09-18';
evaluate(`entries=[normalizeEntry(${JSON.stringify(syntheticSep18V159Strength1Fixture)})]`);
const sep18V159Markdown=evaluate('buildMd()');
assert.match(sep18V159Markdown,/\*\*Program:\*\* AFT Foundation Block 1 · version 1\.5\.10/,'the export header uses the current v1.5.10 program');
assert.match(sep18V159Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.9/,'the September 18 session retains its saved public-app version');
assert.match(sep18V159Markdown,/Seated dumbbell overhead press[\s\S]*Planned: 30 lb per hand for 3 × 9/,'the September 18 press target remains frozen');
const sep18V159Backup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.deepEqual(sep18V159Backup.entries[0].prescriptionSnapshot,syntheticSep18V159Strength1Fixture.prescriptionSnapshot,'JSON backup preserves the complete v1.5.9 snapshot');
assert.deepEqual(sep18V159Backup.entries[0].exercises,syntheticSep18V159Strength1Fixture.exercises,'JSON backup preserves every v1.5.9 result');
assert.equal(evaluate(`persistEntries('Before synthetic September 18 persistence test')`),true);
const reloadedSep18V159=JSON.parse(evaluate('JSON.stringify(loadEntries()[0])'));
assert.deepEqual(reloadedSep18V159.prescriptionSnapshot,syntheticSep18V159Strength1Fixture.prescriptionSnapshot,'local persistence preserves the v1.5.9 snapshot');
assert.deepEqual(reloadedSep18V159.exercises,syntheticSep18V159Strength1Fixture.exercises,'local persistence preserves every v1.5.9 result');

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
  programVersion:'1.3',programEffectiveDate:'2026-08-01',activeRunStage:2,duration:'45',sessionRpe:'6',painDuring:'2',painLocation:'synthetic test shoulder',
  prescriptionSnapshot:{sessionKey:'day4',sessionType:'primary',label:'Day 4 — Run and Calisthenics',targetSessionRpe:'6–7',exercises:[
   {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 2 — 1:00 walk / 1:30 run × 8',type:'run',runStage:2},
   {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 6',type:'body',sets:4},
   {id:'plank',name:'Front plank',prescription:'Set 1: 30 sec · Set 2: 30 sec · Set 3: 25 sec',type:'timed',sets:3,prescribedTimes:['0:30','0:30','0:25']},
   {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
  ]},
  exercises:[
   {exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',runStage:'2',walkMinutes:'1',runMinutes:'1.5',rounds:'8',completedRounds:'8',programmedIntervalTime:'20:00',totalTime:'23:00',distance:'1.81',warmupMinutes:'5',runPain:'2',rpe:'6',completed:true,exercisePain:{severity:2,laterality:'bilateral',location:'synthetic test shoulder',causedExerciseToStop:false,note:'Synthetic fixture exercise-pain note.'}},
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
assert.match(august7Markdown,/Exercise-specific pain: 2\/10 · Bilateral · synthetic test shoulder · did not stop the exercise/);
assert.match(august7Markdown,/Exercise-pain note:[\s\S]*Synthetic fixture exercise-pain note\./);
assert.match(august7Markdown,/Run discomfort: 2\/10[\s\S]*Exercise RPE: 6\/10/);
assert.match(august7Markdown,/Previous comparable result:[\s\S]*Timed results: 8:00/,'legacy mobility is interpreted from its saved minute-based prescription');
assert.equal(evaluate(`(()=>{const entry=normalizeEntry(JSON.parse(JSON.stringify(entries.find(item=>item.id==='july-31-day-4'))));const definition=definitionForSavedEntry(entry).exercises[0];return compactResultSummary(definition,entry.exercises[0])})()`),'8:00','JSON round-trip preserves definition-aware legacy mobility display');

elements.exportFrom.value='2026-08-05';
elements.exportTo.value='2026-08-05';
evaluate('entries=[august5Fixture]');
const august5Markdown=evaluate('buildMd()');
assert.match(august5Markdown,/Romanian deadlift[\s\S]*Prescription adherence: Modified[\s\S]*Load above target: 105 lb completed vs 95 lb prescribed/);
assert.ok(august5Markdown.indexOf('**Farmer carry**')<august5Markdown.indexOf('**Backward sled drag**'));
assert.ok(august5Markdown.indexOf('**Backward sled drag**')<august5Markdown.indexOf('**Forward sled push**'));
assert.match(august5Markdown,/Direction: Backward drag/);
assert.match(august5Markdown,/Distance: Unknown \/ not recorded/);
assert.match(august5Markdown,/Load: Unknown \/ not recorded/);
assert.match(august5Markdown,/Backward sled drag was added outside the versioned prescription/);
assert.match(august5Markdown,/Forward sled push was added outside the versioned prescription/);
assert.match(august5Markdown,/Historical circuit used approximately 30 seconds of hard cardio/);
const august5Csv=evaluate('buildCsv()');
assert.match(august5Csv,/"adherence_reasons"/);
assert.match(august5Csv,/"circuit_components_json"/);
assert.match(august5Csv,/"backwardSledDrag"/);
assert.match(august5Csv,/""loadMode"":""unknown""/);
assert.match(august5Csv,/"Load above target: 105 lb completed vs 95 lb prescribed"/);
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
 const snapshot=snapshotSession(LEGACY_SESSIONS.day2);
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
   programId:PROGRAM.id,programName:PROGRAM.name,programVersion:'1.3',programEffectiveDate:'2026-08-01',duration:'65',sessionRpe:'7',preSoreness:'1',readiness:'2',sleepQuality:'fair',painDuring:'2',painLocation:'synthetic test shoulder',
   notes:'Synthetic fixture recovery note.',prescriptionSnapshot:snapshot,
   exercises:[
    {exerciseId:'handReleasePushups',name:'Hand-release push-ups',type:'body',sets:'5',reps:'6, 6, 6, 6, 4',rpe:'7',completed:true},
    {exerciseId:'verticalPull',name:'Lat pulldown',type:'weighted',unit:'lb',variation:'Lat pulldown',load:'132',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true,notes:'Original pulldown note.'},
    {exerciseId:'overheadPress',name:'Seated dumbbell overhead press',type:'weighted',unit:'lb per hand',variation:'Seated dumbbell press',load:'25',sets:'3',reps:'8, 8, 6',rpe:'8',completed:true},
    {exerciseId:'chestSupportedRow',name:'Chest-supported or machine row',type:'weighted',unit:'lb',variation:'Machine row',load:'77',sets:'3',reps:'10, 10, 10',rpe:'7',completed:true},
    {exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand',load:'10',sets:'2',reps:'10, 10',rpe:'7',completed:true,exercisePain:{severity:2,location:'synthetic test shoulder',laterality:'bilateral',note:'Synthetic fixture exercise-pain note.',causedExerciseToStop:false}},
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
assert.match(august3Markdown,/sleep quality Fair/);
assert.match(august3Markdown,/Active coach note: Use a pain-free machine or cuffed-cable variation/);
assert.match(august3Markdown,/Exercise-specific pain: 2\/10 · Bilateral · synthetic test shoulder · did not stop the exercise/);
assert.match(august3Markdown,/Exercise-pain note:[\s\S]*Synthetic fixture exercise-pain note\./);
const august3Section=august3Markdown.slice(august3Markdown.indexOf('### Aug 3, 2026'));
assert.equal((august3Section.match(/Previous comparable result:/g)||[]).length,2,'only push-ups and overhead press have a directly comparable prior result');
assert.match(august3Section,/Previous comparable result:[\s\S]*Date: Jul 27, 2026[\s\S]*Repetitions: 10, 8, 4, 5, 5[\s\S]*Total repetitions: 32/);
assert.match(august3Section,/Previous comparable result:[\s\S]*Load: 25 lb\/hand[\s\S]*Repetitions: 8, 8, 8[\s\S]*Exercise RPE: 6\/10/);
assert.doesNotMatch(august3Section,/Load: 30 lb\/hand/,'future workouts are never selected as previous results');
assert.doesNotMatch(august3Section,/Load: 20 lb\/hand/,'incompatible lateral-raise equipment is omitted');
const august3Json=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(august3Json.version,11);
assert.equal(august3Json.entries.find(entry=>entry.id==='august-3-day-2').sleepQuality,'fair');
assert.equal(august3Json.entries.find(entry=>entry.id==='august-3-day-2').exercises.find(exercise=>exercise.exerciseId==='lateralRaise').exercisePain.laterality,'bilateral');
const august3Csv=evaluate('buildCsv()');
assert.match(august3Csv,/"sleep_quality"/);
assert.match(august3Csv,/"prescription_adherence"/);
assert.match(august3Csv,/"exercise_pain_severity"/);
assert.match(august3Csv,/"fair"/);
assert.match(august3Csv,/"synthetic test shoulder"/);
const august3RoundTrip=evaluate(`normalizeEntry(${JSON.stringify(JSON.parse(evaluate('JSON.stringify(entries.find(item=>item.id==="august-3-day-2"))')))})`);
assert.equal(august3RoundTrip.sleepQuality,'fair');
assert.equal(august3RoundTrip.exercises.find(exercise=>exercise.exerciseId==='lateralRaise').exercisePain.severity,2);
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
assert.match(markdown,/AFT Foundation Block 1 · version 1\.5\.10/);
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
assert.equal(jsonBackup.currentProgram.version,'1.5.10');
assert.equal(jsonBackup.currentProgram.runStage,4);
assert.equal(jsonBackup.entries[0].exercises[0].deviceReportedPace,'14:16');

elements.exportFrom.value='2026-09-03';
elements.exportTo.value='2026-09-03';
evaluate(`entries=[normalizeEntry(${syntheticSep3V151Day3Fixture})]`);
const sep3Markdown=evaluate('buildMd()');
assert.match(sep3Markdown,/\*\*Program:\*\* AFT Foundation Block 1 · version 1\.5\.10/,'the export header uses the current public-app version');
assert.match(sep3Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.1/,'the September 3 session retains its immutable saved version');
assert.match(sep3Markdown,/Romanian deadlift[\s\S]*Planned: 135 lb total for 2 × 8/,'the September 3 export uses its saved prescription snapshot');
assert.doesNotMatch(sep3Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.2/,'the unapplied v1.5.2 app version is never synthesized');

elements.exportFrom.value='2026-09-05';
elements.exportTo.value='2026-09-05';
evaluate(`entries=[normalizeEntry(${syntheticSep5V153Day4Fixture})]`);
const sep5Markdown=evaluate('buildMd()');
assert.match(sep5Markdown,/\*\*Program:\*\* AFT Foundation Block 1 · version 1\.5\.10/,'the export header uses the current v1.5.10 program');
assert.match(sep5Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.3/,'the September 5 session retains its immutable saved version');
assert.match(sep5Markdown,/Front plank[\s\S]*Planned: 3 × 45 sec/,'the September 5 export uses its saved plank prescription');
assert.doesNotMatch(sep5Markdown,/Front plank[\s\S]*Planned: 3 × 50 sec/,'the active plank target does not rewrite September 5 history');

const alternativeExportFixture=JSON.parse(JSON.stringify(syntheticSep10V155AlternativeFixture));
elements.exportFrom.value='2026-09-10';
elements.exportTo.value='2026-09-10';
evaluate(`entries=[normalizeEntry(${JSON.stringify(alternativeExportFixture)})]`);
const alternativeMarkdown=evaluate('buildMd()');
assert.match(alternativeMarkdown,/\*\*Primary sessions:\*\* 1/,'the alternative counts as a primary workout in coach export totals');
assert.match(alternativeMarkdown,/Day 1 — Illness Recovery/);
assert.match(alternativeMarkdown,/Session category: Primary workout/);
assert.match(alternativeMarkdown,/Rotation equivalent: Day 1 — Deadlift and Intervals/);
assert.match(alternativeMarkdown,/Coach instructions: Stop for symptom recurrence/);
assert.doesNotMatch(alternativeMarkdown,/Session category: Recovery session/);
const alternativeJson=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(alternativeJson.version,11,'the additive rotation mapping does not require a schema migration');
assert.equal(alternativeJson.entries[0].dayKey,'day1IllnessRecovery');
assert.equal(alternativeJson.entries[0].rotationDayKey,'day1');
assert.equal(alternativeJson.entries[0].sessionType,'primary');
assert.equal(alternativeJson.entries[0].advancesPrimaryRotation,true);
assert.equal(alternativeJson.entries[0].prescriptionSnapshot.rotationDayKey,'day1');
assert.deepEqual(alternativeJson.entries[0].prescriptionSnapshot,syntheticSep10V155AlternativeFixture.prescriptionSnapshot,'JSON export preserves the complete retired prescription snapshot');
assert.deepEqual(alternativeJson.entries[0].exercises,syntheticSep10V155AlternativeFixture.exercises,'JSON export preserves all retired-session results');
const alternativeCsv=evaluate('buildCsv()');
assert.match(alternativeCsv,/"session_key","day","rotation_day_key","advances_primary_rotation","coach_directed_alternative"/);
assert.match(alternativeCsv,/"primary","day1IllnessRecovery","Day 1 — Illness Recovery","day1","yes","yes"/,'CSV preserves the session and rotation mapping');
assert.equal(evaluate('nextWorkoutDay(entries)'),'strengthUpperAft','retired primary history defaults to the first active session at the rotation boundary');
assert.equal(evaluate(`persistEntries('Before alternative persistence test')`),true);
const locallyPersistedAlternative=JSON.parse(storage.get('aftWorkoutEntries.v1'))[0];
assert.equal(locallyPersistedAlternative.dayKey,'day1IllnessRecovery');
assert.equal(locallyPersistedAlternative.rotationDayKey,'day1');
assert.equal(locallyPersistedAlternative.prescriptionSnapshot.rotationDayKey,'day1','local persistence keeps the immutable mapping snapshot');
assert.deepEqual(locallyPersistedAlternative.prescriptionSnapshot,syntheticSep10V155AlternativeFixture.prescriptionSnapshot,'local persistence keeps the complete retired prescription');
assert.deepEqual(locallyPersistedAlternative.exercises,syntheticSep10V155AlternativeFixture.exercises,'local persistence keeps every historical result');
const reloadedHistoricalAlternative=JSON.parse(evaluate('JSON.stringify(loadEntries()[0])'));
assert.equal(reloadedHistoricalAlternative.dayKey,'day1IllnessRecovery','local reload accepts a snapshot-backed retired session key');
assert.deepEqual(reloadedHistoricalAlternative.prescriptionSnapshot,syntheticSep10V155AlternativeFixture.prescriptionSnapshot);
assert.deepEqual(reloadedHistoricalAlternative.exercises,syntheticSep10V155AlternativeFixture.exercises);
const recoveredHistoricalMapping=JSON.parse(evaluate(`JSON.stringify((()=>{const raw=${JSON.stringify(syntheticSep10V155AlternativeFixture)};delete raw.rotationDayKey;delete raw.advancesPrimaryRotation;return normalizeEntry(raw)})())`));
assert.equal(recoveredHistoricalMapping.rotationDayKey,'day1','import normalization can recover the mapping from the immutable snapshot without an active definition');
assert.equal(recoveredHistoricalMapping.advancesPrimaryRotation,true);

elements.exportFrom.value='2026-09-13';
elements.exportTo.value='2026-09-13';
evaluate(`entries=[normalizeEntry(${JSON.stringify(syntheticSep13V156Day2Fixture)})]`);
const sep13Markdown=evaluate('buildMd()');
assert.match(sep13Markdown,/\*\*Program:\*\* AFT Foundation Block 1 · version 1\.5\.10/,'the export header uses the current v1.5.10 program');
assert.match(sep13Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.6/,'the September 13 session retains its saved public-app version');
assert.match(sep13Markdown,/Hand-release push-ups[\s\S]*Planned: 5 × 10/,'the September 13 push-up target remains frozen');
assert.match(sep13Markdown,/Lat pulldown[\s\S]*Planned: Next smallest increment above 165 lb[\s\S]*approximately 176 lb/,'the September 13 pulldown target remains frozen');
assert.match(sep13Markdown,/Seated dumbbell overhead press[\s\S]*Planned: 30 lb per hand for 3 × 9/,'the September 13 OHP target remains frozen');
assert.match(sep13Markdown,/Machine row[\s\S]*Planned: Next smallest increment above 99 lb[\s\S]*approximately 110 lb/,'the September 13 row target remains frozen');
assert.match(sep13Markdown,/Cable lateral raise[\s\S]*Planned: 33 lb displayed per side[\s\S]*2 × 20/,'the September 13 lateral-raise target remains frozen');
assert.match(sep13Markdown,/Cable fly \/ pec deck[\s\S]*Planned: 77 lb displayed[\s\S]*2 × 15/,'the September 13 pec-deck target remains frozen');
assert.doesNotMatch(sep13Markdown,/Program: AFT Foundation Block 1 · version 1\.5\.2/,'v1.5.2 is never synthesized into public history');
const sep13Json=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(sep13Json.version,11,'the v1.5.9 session-layout update keeps data schema 11');
assert.deepEqual(sep13Json.entries[0].prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'JSON export preserves the complete September 13 snapshot');
assert.deepEqual(sep13Json.entries[0].exercises,syntheticSep13V156Day2Fixture.exercises,'JSON export preserves every September 13 result');
const sep13Csv=evaluate('buildCsv()');
assert.match(sep13Csv,/"1\.5\.6"/,'CSV retains the historical program version');
assert.match(sep13Csv,/"5 × 10"/,'CSV uses the historical push-up prescription');
assert.match(sep13Csv,/"176"/,'CSV retains the historical seated-pulldown result');
assert.equal(evaluate('nextWorkoutDay(entries)'),'strengthUpperAft','legacy Day 2 history remains primary while the active boundary defaults to Strength 1');
assert.equal(evaluate(`persistEntries('Before September 13 persistence test')`),true);
const locallyPersistedSep13=JSON.parse(storage.get('aftWorkoutEntries.v1'))[0];
assert.deepEqual(locallyPersistedSep13.prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'local persistence keeps the complete September 13 snapshot');
assert.deepEqual(locallyPersistedSep13.exercises,syntheticSep13V156Day2Fixture.exercises,'local persistence keeps every September 13 result');
const reloadedSep13=JSON.parse(evaluate('JSON.stringify(loadEntries()[0])'));
assert.equal(reloadedSep13.programVersion,'1.5.6');
assert.deepEqual(reloadedSep13.prescriptionSnapshot,syntheticSep13V156Day2Fixture.prescriptionSnapshot,'local reload keeps the immutable v1.5.6 snapshot');
assert.deepEqual(reloadedSep13.exercises,syntheticSep13V156Day2Fixture.exercises,'local reload keeps RPE, pain, notes, and all other results');

const syntheticV157LegacyDay3Fixture=JSON.parse(evaluate(`JSON.stringify({
 id:'synthetic-v157-legacy-day3',date:'2000-01-01',updatedAt:'2000-01-01T12:00:00.000Z',
 dayKey:'day3',dayLabel:LEGACY_SESSIONS.day3.label,sessionType:'primary',advancesPrimaryRotation:true,
 programId:PROGRAM.id,programName:PROGRAM.name,programVersion:'1.5.7',programEffectiveDate:'2026-09-14',activeRunStage:4,
 targetSessionRpe:LEGACY_SESSIONS.day3.targetSessionRpe,duration:'63',sessionRpe:'7',painDuring:'0',notes:'Invented compatibility result.',
 prescriptionSnapshot:snapshotSession(LEGACY_SESSIONS.day3),
 exercises:[
  {exerciseId:'romanianDeadlift',name:'Romanian deadlift',type:'weighted',variation:'Barbell',variationId:'barbell',load:'50',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8',rpe:'7',completed:true,notes:'Invented clean-repetition result.'},
  {exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.4.5',rounds:'2',rpe:'7',completed:true,notes:'Invented two-round result.'},
  {exerciseId:'sidePlank',name:'Side plank',type:'timed',sets:'3',times:'45, 45, 45',rpe:'7',completed:true}
 ]
})`));
const normalizedV157Legacy=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(${JSON.stringify(syntheticV157LegacyDay3Fixture)}))`));
assert.equal(normalizedV157Legacy.dayKey,'day3');
assert.equal(normalizedV157Legacy.programVersion,'1.5.7');
assert.equal(evaluate(`isPrimaryEntry(${JSON.stringify(normalizedV157Legacy)})`),true,'a v1.5.7 legacy Day 3 record remains primary after the active rotation changes');
assert.deepEqual(normalizedV157Legacy.prescriptionSnapshot,syntheticV157LegacyDay3Fixture.prescriptionSnapshot,'normalization preserves the invented v1.5.7 legacy snapshot');
assert.deepEqual(normalizedV157Legacy.exercises,syntheticV157LegacyDay3Fixture.exercises,'normalization preserves every invented legacy result');
const importedV157Legacy=JSON.parse(evaluate(`JSON.stringify(normalizeEntry(JSON.parse(${JSON.stringify(JSON.stringify(syntheticV157LegacyDay3Fixture))})))`));
assert.deepEqual(importedV157Legacy.prescriptionSnapshot,syntheticV157LegacyDay3Fixture.prescriptionSnapshot,'JSON import normalization preserves the invented v1.5.7 snapshot');
assert.deepEqual(importedV157Legacy.exercises,syntheticV157LegacyDay3Fixture.exercises,'JSON import normalization preserves the invented v1.5.7 results');
evaluate(`entries=[normalizeEntry(${JSON.stringify(syntheticV157LegacyDay3Fixture)})]`);
const v157LegacyBackup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.deepEqual(v157LegacyBackup.entries[0].prescriptionSnapshot,syntheticV157LegacyDay3Fixture.prescriptionSnapshot,'JSON backup preserves the invented v1.5.7 legacy snapshot');
assert.deepEqual(v157LegacyBackup.entries[0].exercises,syntheticV157LegacyDay3Fixture.exercises,'JSON backup preserves the invented v1.5.7 legacy results');
assert.equal(evaluate(`persistEntries('Before synthetic v1.5.7 legacy persistence test')`),true);
const reloadedV157Legacy=JSON.parse(evaluate('JSON.stringify(loadEntries()[0])'));
assert.deepEqual(reloadedV157Legacy.prescriptionSnapshot,syntheticV157LegacyDay3Fixture.prescriptionSnapshot,'local persistence preserves the invented v1.5.7 legacy snapshot');
assert.deepEqual(reloadedV157Legacy.exercises,syntheticV157LegacyDay3Fixture.exercises,'local persistence preserves the invented v1.5.7 legacy results');

const representativeLegacyEntries=JSON.parse(evaluate(`JSON.stringify(['day1','day2','day3','day4'].map((dayKey,index)=>normalizeEntry({
 id:'synthetic-legacy-'+dayKey,date:'2000-02-0'+(index+1),dayKey,dayLabel:LEGACY_SESSIONS[dayKey].label,
 sessionType:'primary',advancesPrimaryRotation:true,programVersion:'1.5.7',prescriptionSnapshot:snapshotSession(LEGACY_SESSIONS[dayKey]),
 exercises:[{exerciseId:LEGACY_SESSIONS[dayKey].exercises[0].id,name:LEGACY_SESSIONS[dayKey].exercises[0].name,type:LEGACY_SESSIONS[dayKey].exercises[0].type,completed:true,notes:'Invented legacy result.'}]
})))`));
assert.deepEqual(representativeLegacyEntries.map(entry=>entry.dayKey),['day1','day2','day3','day4']);
assert.equal(evaluate(`(${JSON.stringify(representativeLegacyEntries)}).every(isPrimaryEntry)`),true,'representative legacy Day 1–Day 4 records remain primary');
assert.equal(evaluate(`(${JSON.stringify(representativeLegacyEntries)}).every(entry=>definitionForSavedEntry(entry).key===entry.dayKey)`),true,'representative legacy Day 1–Day 4 snapshots remain editable');
const editedRepresentativeLegacy=JSON.parse(evaluate(`JSON.stringify((${JSON.stringify(representativeLegacyEntries)}).map(entry=>normalizeEntry({...entry,notes:'Invented edited legacy note.'})))`));
assert.equal(editedRepresentativeLegacy.every(entry=>entry.notes==='Invented edited legacy note.'),true);
assert.equal(editedRepresentativeLegacy.every((entry,index)=>JSON.stringify(entry.prescriptionSnapshot)===JSON.stringify(representativeLegacyEntries[index].prescriptionSnapshot)),true,'editing representative legacy entries never replaces their snapshots');
evaluate(`entries=(${JSON.stringify(representativeLegacyEntries)}).map(normalizeEntry)`);
const representativeLegacyBackup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
const importedRepresentativeLegacy=JSON.parse(evaluate(`JSON.stringify(${JSON.stringify(representativeLegacyBackup.entries)}.map(entry=>normalizeEntry(JSON.parse(JSON.stringify(entry)))))`));
assert.deepEqual(importedRepresentativeLegacy,representativeLegacyEntries,'representative legacy Day 1–Day 4 entries round-trip through JSON export and import normalization');
assert.equal(evaluate(`persistEntries('Before representative legacy persistence test')`),true);
assert.deepEqual(JSON.parse(evaluate('JSON.stringify(loadEntries())')),representativeLegacyEntries.slice().reverse(),'representative legacy Day 1–Day 4 entries round-trip through local persistence');
elements.exportFrom.value='2000-02-01';
elements.exportTo.value='2000-02-04';
assert.match(evaluate('buildMd()'),/\*\*Primary sessions:\*\* 4/,'legacy primary entries remain included in coach-export totals');

const syntheticActiveEntry=JSON.parse(evaluate(`JSON.stringify(normalizeEntry({
 id:'synthetic-active-run',date:'2000-03-01',dayKey:'runStageB',dayLabel:SESSIONS.runStageB.label,sessionType:'primary',advancesPrimaryRotation:true,
 programId:PROGRAM.id,programName:PROGRAM.name,programVersion:PROGRAM.version,programEffectiveDate:PROGRAM.effectiveDate,activeRunStage:4,
 targetSessionRpe:SESSIONS.runStageB.targetSessionRpe,duration:'34',sessionRpe:'5',painDuring:'0',notes:'Invented active-session result.',
 prescriptionSnapshot:snapshotSession(SESSIONS.runStageB),
 exercises:[{exerciseId:'primaryRun',name:'Walk / run intervals',type:'run',runStage:'4',walkMinutes:'1',runMinutes:'2.5',rounds:'6',completedRounds:'6',programmedIntervalTime:'21:00',totalTime:'23:00',rpe:'5',completed:true,notes:'Invented controlled run result.'}]
}))`));
assert.equal(syntheticActiveEntry.programVersion,'1.5.10');
assert.equal(syntheticActiveEntry.prescriptionSnapshot.sessionKey,'runStageB');
assert.equal(syntheticActiveEntry.exercises[0].programmedIntervalTime,'21:00');
assert.equal(syntheticActiveEntry.exercises[0].totalTime,'23:00','programmed interval time remains distinct from total elapsed time');
evaluate(`entries=[normalizeEntry(${JSON.stringify(syntheticActiveEntry)})]`);
const activeBackup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.deepEqual(activeBackup.entries[0],syntheticActiveEntry,'new-session completed records round-trip through JSON export');
assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(normalizeEntry(JSON.parse(${JSON.stringify(JSON.stringify(syntheticActiveEntry))})))`)),syntheticActiveEntry,'new-session completed records round-trip through JSON import normalization');
assert.equal(evaluate(`persistEntries('Before synthetic active-session persistence test')`),true);
assert.deepEqual(JSON.parse(evaluate('JSON.stringify(loadEntries()[0])')),syntheticActiveEntry,'new-session completed records round-trip through local persistence');
elements.exportFrom.value='2000-03-01';
elements.exportTo.value='2000-03-01';
const activeMarkdown=evaluate('buildMd()');
assert.match(activeMarkdown,/Run 2 — Controlled Stage 4 and Mobility/);
assert.match(activeMarkdown,/Programmed interval time: 21:00/);
assert.match(activeMarkdown,/Total elapsed time: 23:00/);
assert.match(evaluate('buildCsv()'),/"runStageB"/,'CSV remains coach-readable for a new session key');
assert.equal(fs.readFileSync(path.join(root,'program-config.js'),'utf8').includes("version:'1.5.8'"),false,'public v1.5.8 is not synthesized as a runtime definition');

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
const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
assert.match(appSource,/Exercise notes<textarea[^>]+data-field="notes"/,'exercise notes must support detailed multiline comments');
assert.doesNotMatch(styles,/\.sticky-actions\{position:sticky;bottom:calc\(7px/,'mobile workout actions must remain in page flow');
assert.ok(indexHtml.indexOf('program-config.js?v=54')<indexHtml.indexOf('cloud-config.js?v=54'));
assert.ok(indexHtml.indexOf('cloud-config.js?v=54')<indexHtml.indexOf('cloud-sync.js?v=54'));
assert.ok(indexHtml.indexOf('cloud-sync.js?v=54')<indexHtml.indexOf('app.js?v=54'));
assert.match(serviceWorker,/aft-workout-tracker-v54/);
assert.match(serviceWorker,/program-config\.js\?v=54/);
assert.match(serviceWorker,/cloud-sync\.js\?v=54/);
assert.match(indexHtml,/id="sessionRpe"[^>]+step="0\.5"[^>]+inputmode="decimal"/,'session RPE accepts half-point values');
assert.match(appSource,/addEventListener\('invalid',revealInvalidWorkoutControl,true\)/,'invalid workout values must produce visible feedback');
assert.equal((appSource.match(/Component RPE',performance\.rpe,\{min:1,max:10,step:'\.5'\}/g)||[]).length,4,'all circuit component RPE inputs accept half-point values');
assert.match(styles,/\.save-review-dialog\{[^}]*max-height:calc\(100dvh - 28px\)[^}]*overflow:hidden/,'save review remains within the mobile viewport');
assert.match(styles,/\.save-review-issues\{[^}]*overflow:auto/,'long Day 3 review lists scroll without hiding save actions');
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
