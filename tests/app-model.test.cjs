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

const snapshot=evaluate('snapshotSession(SESSIONS.day1)');
assert.equal(snapshot.exercises[0].id,'deadlift');
assert.equal(snapshot.exercises[0].prescription,'3 × 5');

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
assert.match(csv,/"20:00"/);
assert.match(csv,/"12:54"/);
assert.match(csv,/"14:16"/);
assert.match(csv,/"Relaxed pace\.\nNo pain\."/);
const jsonBackup=JSON.parse(evaluate('JSON.stringify(buildJsonBackup())'));
assert.equal(jsonBackup.version,7);
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
assert.ok(indexHtml.indexOf('program-config.js?v=16')<indexHtml.indexOf('app.js?v=16'));
assert.match(serviceWorker,/aft-workout-tracker-v16/);
assert.match(serviceWorker,/program-config\.js\?v=16/);
const htmlIds=[...indexHtml.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'HTML IDs must be unique');
const referencedIds=[...appSource.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
referencedIds.forEach(id=>assert.ok(htmlIds.includes(id),`app.js references missing #${id}`));
[
 'index.html','styles.css','program-config.js','app.js','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-512-maskable.png','icons/apple-touch-icon.png'
].forEach(asset=>assert.ok(fs.existsSync(path.join(root,asset)),`offline asset missing: ${asset}`));

console.log('AFT model tests passed');
