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
assert.equal(evaluate('programmedRunSeconds(runDefaults(2))'),1200,'Stage 2 must total 20 programmed minutes');
assert.equal(evaluate('currentProgramMeta().runStage'),2);

const rotation=evaluate(`nextWorkoutDay([
 {id:'primary',dayKey:'day1',sessionType:'primary',date:'2026-07-28',updatedAt:'2026-07-28T12:00:00Z'},
 {id:'recovery',dayKey:'recovery',sessionType:'recovery',date:'2026-07-29',updatedAt:'2026-07-29T12:00:00Z'}
])`);
assert.equal(rotation,'day2','recovery sessions must not advance the primary rotation');
assert.equal(evaluate('nextWorkoutDay([])'),'day1');

assert.equal(evaluate(`totalLoadValue({load:'35',loadMode:'platesPerSide',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'70',loadMode:'plates',barWeight:'45'})`),115);
assert.equal(evaluate(`totalLoadValue({load:'115'})`),115,'a legacy load without a mode remains a total');

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

const elements={
 exportFrom:{value:'2026-07-01'},
 exportTo:{value:'2026-07-31'},
 markdownPreview:{value:''}
};
context.document={
 getElementById:id=>elements[id]||{value:'',classList:{add(){},remove(){},toggle(){}}}
};
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
assert.equal(jsonBackup.version,8);
assert.equal(jsonBackup.currentProgram.version,'1.3');
assert.equal(jsonBackup.currentProgram.runStage,2);
assert.equal(jsonBackup.entries[0].exercises[0].deviceReportedPace,'14:16');

const normalized=evaluate(`normalizeEntry({
 id:'old',date:'2026-07-01',dayKey:'day1',painScore:'4',
 exercises:[{name:'Trap-bar deadlift',type:'weighted',load:'100'}]
})`);
assert.equal(normalized.painScore,'4');
assert.equal(normalized.painDuring,'','legacy pain is not reinterpreted as new pain');
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
assert.ok(indexHtml.indexOf('program-config.js?v=20')<indexHtml.indexOf('app.js?v=20'));
assert.match(serviceWorker,/aft-workout-tracker-v20/);
assert.match(serviceWorker,/program-config\.js\?v=20/);
const htmlIds=[...indexHtml.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'HTML IDs must be unique');
const referencedIds=[...appSource.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
referencedIds.forEach(id=>assert.ok(htmlIds.includes(id),`app.js references missing #${id}`));
[
 'index.html','styles.css','program-config.js','app.js','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-512-maskable.png','icons/apple-touch-icon.png'
].forEach(asset=>assert.ok(fs.existsSync(path.join(root,asset)),`offline asset missing: ${asset}`));

console.log('AFT model tests passed');
