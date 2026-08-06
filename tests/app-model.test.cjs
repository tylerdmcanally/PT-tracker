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
assert.equal(evaluate('PROGRAM.version'),'1.3');
assert.equal(evaluate('PROGRAM.effectiveDate'),'2026-08-01');
assert.equal(evaluate('PROGRAM.currentRunStage'),2);
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="gymConditioningCircuit").prescription.includes("Exactly 2 rounds")'),true);
assert.equal(evaluate('SESSIONS.day3.targetSessionRpe'),'7–8');
assert.equal(evaluate('SESSIONS.recovery.sessionType'),'recovery');
assert.equal(evaluate('SESSIONS.day1.exercises.find(exercise=>exercise.id==="runWalkIntervals").runStage'),2);
assert.equal(evaluate('SESSIONS.day4.exercises.find(exercise=>exercise.id==="primaryRun").runStage'),2);
assert.equal(evaluate('SESSIONS.day4.exercises.find(exercise=>exercise.id==="handReleasePushups").prescription'),'4 × 6');
assert.equal(evaluate('JSON.stringify(SESSIONS.day4.exercises.find(exercise=>exercise.id==="plank").prescribedTimes)'),'["0:30","0:30","0:25"]');
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").prescription'),'95 lb total for 2 × 8');
assert.equal(evaluate('SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift").targetLoad'),95);
assert.equal(evaluate('defaultExerciseState(SESSIONS.day3.exercises.find(exercise=>exercise.id==="romanianDeadlift")).load'),undefined,'the target load is not prefilled as a completed result');
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").variations.includes("Cuffed-cable lateral raise")'),true);
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").name'),'Dumbbell lateral raises','the versioned exercise name remains unchanged');
assert.equal(evaluate('SESSIONS.day2.exercises.find(exercise=>exercise.id==="lateralRaise").defaultVariation'),'Machine lateral raise');
assert.equal(evaluate(`compactLoadResult(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),{load:'12.5',unit:'lb per side'})`),'12.5 lb/side');
assert.equal(evaluate('programmedRunSeconds(runDefaults(2))'),1200,'Stage 2 must total 20 programmed minutes');
assert.equal(evaluate('currentProgramMeta().runStage'),2);

assert.equal(evaluate(`prescriptionAdherence({type:'body',prescription:'5 × 6',sets:5},{type:'body',completed:true,sets:'5',reps:'6, 6, 6, 6, 4'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'10, 10, 10'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8–10',sets:3},{type:'weighted',completed:true,sets:'3',reps:'8, 8, 6'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'2 × 12–15',sets:2},{type:'weighted',completed:true,sets:'2',reps:'10, 10'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'cardio',prescription:'25–30 minutes'},{type:'cardio',completed:true,minutes:'20'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 30, 25'})`),'met');
assert.equal(evaluate(`prescriptionAdherence({type:'timed',prescription:'3 × 25–30 sec',sets:3},{type:'timed',completed:true,times:'25, 20, 25'})`),'below_target');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3,optional:true},{type:'weighted',completed:false})`),'not_applicable');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'95 lb total for 2 × 8',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells']},{type:'weighted',completed:true,variation:'Dumbbells',load:'30',sets:'2',reps:'8, 8'})`),'modified','a substitution is recorded explicitly instead of being treated as the targeted load');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'50',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'met');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'40',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'})`),'modified');
const aboveTargetLoad=JSON.parse(evaluate(`JSON.stringify(prescriptionAdherenceDetail(SESSIONS.day3.exercises.find(exercise=>exercise.id==='romanianDeadlift'),{type:'weighted',completed:true,variation:'Barbell',load:'70',loadMode:'plates',barWeight:'45',sets:'2',reps:'8, 8'}))`));
assert.equal(aboveTargetLoad.value,'modified');
assert.ok(aboveTargetLoad.reasons.some(reason=>reason.code==='load_above_target'));
assert.equal(evaluate(`prescriptionAdherence({type:'carry',prescription:'Carry with good posture'},{type:'carry',completed:true,load:'45'})`),'not_assessable');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3},{type:'weighted',completed:true,reps:'',load:'50'})`),'partial');
assert.equal(evaluate(`prescriptionAdherence({type:'weighted',prescription:'3 × 8',sets:3},{type:'weighted',completed:true,reps:'1',adherenceOverride:{value:'met',reason:'Coach-approved modified set'}})`),'met');

assert.equal(evaluate(`activeCoachOverlay('1.3','day2','lateralRaise','2026-08-03').status`),'active');
evaluate(`activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.day2;activeWorkoutDate='2026-08-03'`);
const overlayCard=evaluate(`exerciseCard(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,defaultExerciseState(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise')))`);
assert.match(overlayCard,/ACTIVE COACH NOTE/);
assert.match(overlayCard,/2 × 12–15/,'overlay does not replace the original prescription');
assert.match(overlayCard,/<details class="exercise-extras"/,'notes and pain use progressive disclosure');
assert.match(overlayCard,/data-completion-label/,'the completion action remains at the end of the logging flow');
const legacyLateralCard=evaluate(`exerciseCard(SESSIONS.day2.exercises.find(exercise=>exercise.id==='lateralRaise'),0,{exerciseId:'lateralRaise',name:'Dumbbell lateral raises',type:'weighted',unit:'lb per hand'})`);
assert.match(legacyLateralCard,/value="Dumbbell lateral raise" selected/,'legacy lateral-raise records without a variation remain identified as dumbbell work');
assert.match(legacyLateralCard,/data-unit="lb per hand"/);
evaluate(`PROGRAM.coachNoteOverlays[0].status='resolved'`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day2','lateralRaise','2026-08-03')`),null,'resolved overlays leave future cards');
evaluate(`PROGRAM.coachNoteOverlays[0].status='active'`);

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

assert.equal(evaluate(`totalLoadValue({load:'35',loadMode:'platesPerSide',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'70',loadMode:'plates',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'115'})`),115,'a legacy load without a mode remains a total');

evaluate(`entries=[];august5Fixture=normalizeEntry({
 id:'august-5-day-3',date:'2026-08-05',updatedAt:'2026-08-05T19:00:00.000Z',dayKey:'day3',
 dayLabel:SESSIONS.day3.label,sessionType:'primary',programId:PROGRAM.id,programName:PROGRAM.name,
 programVersion:'1.3',programEffectiveDate:'2026-08-01',duration:'60',sessionRpe:'7',preSoreness:'1',readiness:'4',sleepQuality:'fair',painDuring:'0',
 prescriptionSnapshot:snapshotSession(SESSIONS.day3),
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
const august5CircuitAdherence=JSON.parse(evaluate(`JSON.stringify(prescriptionAdherenceDetail(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),august5Fixture.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit')))`));
assert.equal(august5CircuitAdherence.value,'modified');
assert.ok(august5CircuitAdherence.reasons.some(reason=>reason.code==='duration_below_minimum'));
assert.equal(august5CircuitAdherence.reasons.filter(reason=>reason.code==='unplanned_component_added').length,2);
assert.equal(evaluate(`circuitComponentAdherence(CIRCUIT_TEMPLATES['foundation-1.2'].components.find(component=>component.id==='rest'),august5Fixture.exercises.find(exercise=>exercise.exerciseId==='gymConditioningCircuit').components.find(component=>component.id==='rest')).value`),'met','150 seconds matches 2:30');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),{type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'2',carryLoad:'45',carrySeconds:'30',stepReps:'6',modality:'Bike',intervalSeconds:'45',restSeconds:'150'})`),'met','the fully matched legacy circuit compatibility path remains assessable');
assert.equal(evaluate(`prescriptionAdherence(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),{type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'3',carryLoad:'45',carrySeconds:'30',stepReps:'6',modality:'Bike',intervalSeconds:'45',restSeconds:'150'})`),'modified','exceeding the exact circuit round cap is a modification');
assert.equal(evaluate(`sledTotalDistance({distanceMode:'known',trips:'2',distancePerTrip:'20',distanceUnit:'yd'})`),40);
assert.equal(evaluate(`sledTotalSystemWeight({loadMode:'added_plus_sled',addedPlateWeight:'90',emptySledWeight:'70'})`),160);
const perRoundCircuit=JSON.parse(evaluate(`JSON.stringify(normalizeCircuitComponent({id:'backwardSledDrag',name:'Backward sled drag',type:'sled',resultMode:'per_round',roundResults:[
 {round:1,performed:true,direction:'backward_drag',distanceMode:'known',trips:'1',distancePerTrip:'20',distanceUnit:'yd',surface:'turf'},
 {round:2,performed:true,direction:'backward_drag',distanceMode:'lane_unknown',distanceLabel:'one gym lane',surface:'turf'}
]}))`));
assert.equal(perRoundCircuit.roundResults.length,2);
assert.equal(perRoundCircuit.roundResults[0].totalDistance,'20');

evaluate(`entries=[];activeProgramContext=currentProgramMeta();activeSessionDefinition=SESSIONS.day3;activeWorkoutDate='2026-08-06'`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-06').scope`),'next_occurrence');
const circuitCard=evaluate(`exerciseCard(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),8,defaultExerciseState(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit')))`);
assert.ok(circuitCard.indexOf('Farmer carry')<circuitCard.indexOf('Backward sled drag'));
assert.ok(circuitCard.indexOf('Backward sled drag')<circuitCard.indexOf('Forward sled push'));
assert.match(circuitCard,/Performed as directed/);
assert.match(circuitCard,/data-circuit-field="addedPlateWeight"/);
assert.match(circuitCard,/data-circuit-field="emptySledWeight"/);
assert.match(circuitCard,/data-circuit-field="distancePerTrip"/);
evaluate(`{
 const directive=activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-06');
 const components=directive.circuitDirective.components.map((component,index)=>normalizeCircuitComponent({
  ...component,planned:null,directivePlanned:component.planned,resultMode:'shared',
  sharedResult:{...component.planned,performed:true,modality:component.type==='cardio'?'Bike':undefined,rpe:component.type==='sled'?'6':undefined,loadMode:component.type==='sled'?'unknown':undefined}
 },index));
 directiveFixture=normalizeEntry({id:'next-day-3',date:'2026-08-12',dayKey:'day3',dayLabel:SESSIONS.day3.label,sessionType:'primary',programVersion:'1.3',
  prescriptionSnapshot:snapshotSession(SESSIONS.day3),exercises:[{exerciseId:'gymConditioningCircuit',name:'Gym conditioning circuit',type:'circuit',circuitVersion:'foundation-1.2',completed:true,rounds:'2',rpe:'7',components,appliedCoachDirective:directive}]
 });
}`);
assert.equal(evaluate(`circuitDirectiveAdherenceDetail(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),directiveFixture.exercises[0]).value`),'met');
assert.equal(evaluate(`circuitAdherenceDetail(SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit'),directiveFixture.exercises[0]).value`),'modified','baseline prescription and directive adherence remain separate');
evaluate(`entries=[directiveFixture]`);
assert.equal(evaluate(`activeCoachOverlay('1.3','day3','gymConditioningCircuit','2026-08-12')`),null,'a saved completed occurrence consumes the directive');
assert.equal(evaluate('PROGRAM.version'),'1.3','consuming the directive does not create a new program version');
evaluate('entries=[]');

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

const snapshot=evaluate('snapshotSession(SESSIONS.day1)');
assert.equal(snapshot.exercises[0].id,'deadlift');
assert.equal(snapshot.exercises[0].prescription,'3 × 5');

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
assert.equal(summaryMap.loadedCarry,'45 lb/hand · 4 × 40 yd · RPE 6');
assert.equal(summaryMap.plank,'30 sec, 30 sec, 30 sec · RPE 7');
assert.match(summaryMap.runWalkIntervals,/1\.55 mi · 20:00 · 12:54\/mi/);
assert.equal(summaryMap.dumbbellCurl,'25 lb/hand · 2 × 12 · RPE 7','unchecked legacy results remain discoverable');
assert.equal(summaryMap.tricepsPressdown,'77 lb total · 2 × 12 · RPE 7');
assert.equal(evaluate(`previousResultData(SESSIONS.day1.exercises[0],'Trap / hex bar',{excludeEntryId:'august-1-day-1'}).selected`),null,'editing excludes the workout itself');
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

const elements={
 exportFrom:{value:'2026-07-01'},
 exportTo:{value:'2026-07-31'},
 markdownPreview:{value:''}
};
context.document={
 getElementById:id=>elements[id]||{value:'',classList:{add(){},remove(){},toggle(){}}}
};

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
assert.equal(august3Json.version,10);
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
assert.match(markdown,/AFT Foundation Block 1 · version 1\.3/);
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
assert.equal(jsonBackup.version,10);
assert.equal(jsonBackup.currentProgram.version,'1.3');
assert.equal(jsonBackup.currentProgram.runStage,2);
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
assert.ok(indexHtml.indexOf('program-config.js?v=23')<indexHtml.indexOf('app.js?v=23'));
assert.match(serviceWorker,/aft-workout-tracker-v23/);
assert.match(serviceWorker,/program-config\.js\?v=23/);
const htmlIds=[...indexHtml.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'HTML IDs must be unique');
const referencedIds=[...appSource.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
referencedIds.forEach(id=>assert.ok(htmlIds.includes(id),`app.js references missing #${id}`));
[
 'index.html','styles.css','program-config.js','app.js','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-512-maskable.png','icons/apple-touch-icon.png'
].forEach(asset=>assert.ok(fs.existsSync(path.join(root,asset)),`offline asset missing: ${asset}`));

console.log('AFT model tests passed');
