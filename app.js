const KEY='aftWorkoutEntries.v1';
const RUN_STAGE_KEY='aftRunStage.v1';

const RUN_STAGES=[
 {id:1,label:'1:00 walk / 1:00 run × 10',runMinutes:'1',walkMinutes:'1',rounds:'10'},
 {id:2,label:'1:00 walk / 1:30 run × 8',runMinutes:'1.5',walkMinutes:'1',rounds:'8'},
 {id:3,label:'1:00 walk / 2:00 run × 7',runMinutes:'2',walkMinutes:'1',rounds:'7'},
 {id:4,label:'1:00 walk / 3:00 run × 6',runMinutes:'3',walkMinutes:'1',rounds:'6'},
 {id:5,label:'1:00 walk / 4:00 run × 5',runMinutes:'4',walkMinutes:'1',rounds:'5'},
 {id:6,label:'1:00 walk / 5:00 run × 5',runMinutes:'5',walkMinutes:'1',rounds:'5'},
 {id:7,label:'1:00 walk / 8:00 run × 3',runMinutes:'8',walkMinutes:'1',rounds:'3'},
 {id:8,label:'1:00 walk / 10:00 run × 3',runMinutes:'10',walkMinutes:'1',rounds:'3'},
 {id:9,label:'Continuous easy run — 20 minutes',continuousMinutes:'20'},
 {id:10,label:'Continuous easy run — 25 minutes',continuousMinutes:'25'},
 {id:11,label:'Continuous easy run — 30 minutes',continuousMinutes:'30'},
 {id:12,label:'Two-mile development phase',performance:true}
];

const PROGRESSION={
 weighted:'Build reps within the prescribed range first. When every set reaches the top with clean form, add the smallest available load and return to the low end.',
 body:'Add 1–2 quality reps across the session while keeping 1–2 reps in reserve. Stop the set when form changes.',
 timed:'Add about 5 seconds per set until the top of the range, then use a harder variation and reset the duration.',
 carry:'Build clean distance or hold time first, then add load.',
 interval:'Complete the current run stage twice at a controlled effort with no new or worsening pain before advancing.',
 run:'Follow the shared run stage. Build continuous time before chasing pace.',
 cardio:'Add 2–5 easy minutes before increasing resistance, incline, or pace.',
 circuit:'First complete every round cleanly. Then shorten recovery or add a small amount of load—change one variable at a time.'
};

const EXERCISE_GROUPS={
 armSuperset:{
  label:'Arm Superset — 2–3 rounds',
  instruction:'Perform curls and pressdowns back-to-back, then rest 60–90 seconds.'
 }
};

const days={
 day1:{label:'Day 1 — Deadlift + Intervals',focus:'Primary strength day plus progressive walk/run conditioning.',warmup:'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive deadlift warm-up sets.',ex:[
  ['Deadlift','3 × 5','weighted','lb',{id:'deadlift',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},progression:'Track each bar type separately. When 3 × 5 is clean around RPE 7 or lower, add 5–10 lb next time; otherwise repeat the load.'}],
  ['Squat or leg press','3 × 8–10','weighted','lb',{id:'squatOrLegPress',variations:['Goblet squat','Leg press'],defaultVariation:'Goblet squat'}],
  ['Horizontal press','3 × 8–10','weighted','lb per hand',{id:'horizontalPress',variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45}}],
  ['Seated row','3 × 10','weighted','lb',{id:'seatedRow',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'}],
  ['Loaded carry or hold','4 × 30–40 yd or 30–45 sec','carry','lb per hand',{id:'loadedCarry',variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry'}],
  ['Plank','3 × 30–60 sec','timed',null,{id:'plank'}],
  ['Run / walk intervals','Follow the current run progression stage','interval',null,{id:'runWalkIntervals'}],
  ['Dumbbell curls','2–3 sets × 10–12 reps','weighted','lb per hand',{id:'dumbbellCurl',group:'armSuperset',sets:{default:2,max:3},progression:'When every set reaches 12 clean reps at a controlled effort, add the smallest available dumbbell increase.'}],
  ['Cable triceps pressdowns','2–3 sets × 10–15 reps','weighted','lb total',{id:'tricepsPressdown',group:'armSuperset',sets:{default:2,max:3},progression:'When every set reaches 15 clean reps at a controlled effort, add the smallest available cable-stack increase.'}]
 ]},
 day2:{label:'Day 2 — Upper + Easy Cardio',focus:'Upper-body muscular endurance and low-impact aerobic development.',warmup:'5–8 minutes of easy cardio, shoulder and upper-back movement prep, then 1–2 easy push-up and pull ramp-up sets.',ex:[
  ['Hand-release push-ups','5 submaximal sets','body',null,{id:'handReleasePushups'}],
  ['Vertical pull','3 × 8–12','weighted','lb',{id:'verticalPull',variations:['Lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Lat pulldown'}],
  ['Overhead press','3 × 8–10','weighted','lb per hand',{id:'overheadPress',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'}],
  ['Chest-supported row','3 × 10','weighted','lb',{id:'chestSupportedRow',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Dumbbell row'}],
  ['Lunge pattern','3 × 8 each leg','weighted','lb total',{id:'lungePattern',variations:['Walking lunge','Reverse lunge','Stationary split squat'],defaultVariation:'Walking lunge'}],
  ['Dumbbell lateral raises','2–3 sets × 12–15 reps','weighted','lb per hand',{id:'lateralRaise',sets:{default:2,max:3},progression:'When every set reaches 15 clean reps without swinging, add the smallest available dumbbell increase.'}],
  ['Trunk stability','3 × 10 each side','body',null,{id:'trunkStability',variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug'}],
  ['Easy cardio','25–35 min conversational effort','cardio',null,{id:'easyCardio'}]
 ]},
 day3:{label:'Day 3 — Lower Strength + Gym Conditioning',focus:'Build lower-body strength, grip, lateral stability, and repeat-effort conditioning with standard commercial-gym equipment.',warmup:'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive squat warm-up sets.',ex:[
  ['Squat pattern','3 × 6–8','weighted','lb',{id:'squatPattern',variations:['Goblet squat','Front squat','Hack squat','Leg press'],defaultVariation:'Goblet squat',barWeights:{'Front squat':45}}],
  ['Romanian deadlift','3 × 8','weighted','lb',{id:'romanianDeadlift',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{'Barbell':45,'Smith machine':20}}],
  ['Incline press','3 × 8–10','weighted','lb per hand',{id:'inclinePress',variations:['Incline dumbbell press','Incline chest-press machine'],defaultVariation:'Incline dumbbell press'}],
  ['One-arm row','3 × 10 each side','weighted','lb',{id:'oneArmRow',variations:['One-arm dumbbell row','One-arm cable row'],defaultVariation:'One-arm dumbbell row'}],
  ['Single-leg strength','3 × 8 each leg','weighted','lb total',{id:'singleLegStrength',variations:['Split squat','Forward step-up','Lateral step-up'],defaultVariation:'Split squat'}],
  ['Side plank','3 × 20–45 sec each side','timed',null,{id:'sidePlank'}],
  ['Gym conditioning circuit','3 rounds: reverse lunges, carry or hold, lateral step-ups, 45–60 sec hard cardio, then 2–3 min rest','circuit',null,{id:'gymConditioningCircuit'}],
  ['Dumbbell curls','2–3 sets × 10–12 reps','weighted','lb per hand',{id:'dumbbellCurl',group:'armSuperset',sets:{default:2,max:3},progression:'When every set reaches 12 clean reps at a controlled effort, add the smallest available dumbbell increase.'}],
  ['Cable triceps pressdowns','2–3 sets × 10–15 reps','weighted','lb total',{id:'tricepsPressdown',group:'armSuperset',sets:{default:2,max:3},progression:'When every set reaches 15 clean reps at a controlled effort, add the smallest available cable-stack increase.'}]
 ]},
 day4:{label:'Day 4 — Run + Calisthenics',focus:'Build continuous running capacity, then finish with test-relevant calisthenics.',warmup:'5–10 minutes of brisk walking plus marches and leg swings. Then begin the primary run; walk/run stages always start with walking.',ex:[
  ['Primary run','Follow the current run/walk, continuous-run, or two-mile-development stage','run',null,{id:'primaryRun'}],
  ['Hand-release push-ups','4 easy-to-moderate sets','body',null,{id:'handReleasePushups'}],
  ['Air squats','2 × 15','body',null,{id:'airSquats'}],
  ['Plank','3 working sets','timed',null,{id:'plank'}],
  ['Mobility','5–10 min','timed',null,{id:'mobility'}]
 ]}
};

const EXERCISE_NAME_IDS={
 'Deadlift':'deadlift',
 'Trap-bar deadlift':'deadlift',
 'Squat or leg press':'squatOrLegPress',
 'Goblet squat or leg press':'squatOrLegPress',
 'Horizontal press':'horizontalPress',
 'Dumbbell bench press':'horizontalPress',
 'Seated row':'seatedRow',
 'Seated cable row':'seatedRow',
 'Loaded carry or hold':'loadedCarry',
 'Farmer carry':'loadedCarry',
 'Plank':'plank',
 'Run / walk intervals':'runWalkIntervals',
 'Dumbbell curls':'dumbbellCurl',
 'Cable triceps pressdowns':'tricepsPressdown',
 'Hand-release push-ups':'handReleasePushups',
 'Vertical pull':'verticalPull',
 'Lat pulldown or assisted pull-up':'verticalPull',
 'Overhead press':'overheadPress',
 'Dumbbell overhead press':'overheadPress',
 'Dumbbell lateral raises':'lateralRaise',
 'Chest-supported row':'chestSupportedRow',
 'Lunge pattern':'lungePattern',
 'Walking lunges':'lungePattern',
 'Trunk stability':'trunkStability',
 'Dead bug or Pallof press':'trunkStability',
 'Easy cardio':'easyCardio',
 'Squat pattern':'squatPattern',
 'Goblet squat, front squat, hack squat, or leg press':'squatPattern',
 'Romanian deadlift':'romanianDeadlift',
 'Incline press':'inclinePress',
 'Incline dumbbell press':'inclinePress',
 'One-arm row':'oneArmRow',
 'One-arm dumbbell row':'oneArmRow',
 'Single-leg strength':'singleLegStrength',
 'Split squat or step-up':'singleLegStrength',
 'Side plank':'sidePlank',
 'Gym conditioning circuit':'gymConditioningCircuit',
 'Primary run':'primaryRun',
 'Air squats':'airSquats',
 'Mobility':'mobility'
};

let entries=load(),editing=null,installPrompt=null,runStage=loadRunStage();
let runTimerState=null,runTimerTick=null,runTimerWakeLock=null,runTimerAudioContext=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const attr=s=>esc(s).replaceAll('\n',' ');

document.addEventListener('DOMContentLoaded',init);

function init(){
 Object.entries(days).forEach(([key,day])=>$('daySelect').insertAdjacentHTML('beforeend',`<option value="${key}">${esc(day.label)}</option>`));
 setExportDates();
 bind();
 newWorkout(false);
 renderHistory();
 renderProgress();
 updatePreview();
 registerServiceWorker();
}

function bind(){
 $('daySelect').onchange=()=>{editing=null;renderWorkout(null,{preserveSession:true})};
 document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>tab(button.dataset.tab));
 $('workoutForm').onsubmit=saveWorkout;
 $('newWorkoutButton').onclick=()=>newWorkout();
 $('reloadUpdateButton').onclick=()=>location.reload();
 $('deleteAllButton').onclick=deleteAll;
 $('runStageBackButton').onclick=()=>changeRunStage(-1);
 $('runStageRepeatButton').onclick=repeatRunStage;
 $('runStageAdvanceButton').onclick=()=>changeRunStage(1);
 $('copyMarkdownButton').onclick=copyMd;
 $('downloadMarkdownButton').onclick=()=>download(buildMd(),`aft-training-update-${today()}.md`,'text/markdown');
 $('downloadJsonButton').onclick=exportJson;
 $('downloadCsvButton').onclick=exportCsv;
 $('importJsonInput').onchange=importJson;
 $('exportFrom').onchange=updatePreview;
 $('exportTo').onchange=updatePreview;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('installButton').classList.remove('hidden')});
 $('installButton').onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installButton').classList.add('hidden')};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&runTimerState?.running)requestRunTimerWakeLock()});
}

function registerServiceWorker(){
 if(!('serviceWorker' in navigator))return;
 const hadController=Boolean(navigator.serviceWorker.controller);
 const showUpdate=()=>$('updateBanner').classList.remove('hidden');
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController)showUpdate()});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(registration=>{
  registration.update().catch(()=>{});
  window.addEventListener('pageshow',()=>registration.update().catch(()=>{}));
  if(registration.waiting&&hadController)showUpdate();
 }).catch(()=>{});
}

function tab(name){
 document.querySelectorAll('.tab').forEach(button=>button.classList.toggle('active',button.dataset.tab===name));
 document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.remove('active'));
 $(`${name}Tab`).classList.add('active');
 if(name==='history')renderHistory();
 if(name==='progress')renderProgress();
 if(name==='export')updatePreview();
 scrollTo({top:0,behavior:'smooth'});
}

function renderWorkout(saved=null,{preserveSession=false}={}){
 const key=saved?.dayKey||$('daySelect').value||'day1';
 const day=days[key];
 $('daySelect').value=key;
 const parts=day.label.split('—');
 $('workoutSummary').innerHTML=`<p class="eyebrow">${esc(parts[0].trim())}</p><h2>${esc(parts.slice(1).join('—').trim())}</h2><p>${esc(day.focus)}</p><p class="workout-warmup"><strong>Warm-up before Exercise 1:</strong> ${esc(day.warmup)}</p>`;
 renderRunProgress(key);
 clearRunTimer();
 $('exerciseList').innerHTML=renderExerciseList(day,key,saved);
 document.querySelectorAll('.exercise-complete').forEach(input=>input.onchange=()=>input.closest('.exercise-card').classList.toggle('completed',input.checked));
 bindSetControls();
 bindWeightedLoadControls();
 document.querySelectorAll('[data-field="runStage"]').forEach(selectInput=>selectInput.onchange=()=>{
  const card=selectInput.closest('.exercise-card');
  const stage=Number(selectInput.value);
  if(stage)applyRunStageDefaults(card,stage,key);
  prepareRunTimer(card,{clearCompletedRounds:true});
 });
 bindRunTimers();
 if(saved){
  $('sessionDate').value=saved.date;
  $('duration').value=saved.duration||'';
  $('sessionRpe').value=saved.sessionRpe||'';
  $('bodyWeight').value=saved.bodyWeight||'';
  $('painScore').value=saved.painScore??'';
  $('sessionNotes').value=saved.notes||'';
 }else{
  if(!$('sessionDate').value)$('sessionDate').value=today();
  if(!preserveSession){
   $('duration').value='';
   $('sessionRpe').value='';
   $('bodyWeight').value='';
   $('painScore').value='';
   $('sessionNotes').value='';
  }
 }
}

function renderExerciseList(day,key,saved){
 const savedExercises=Array.isArray(saved?.exercises)?saved.exercises:[];
 let html='',openGroup=null;
 day.ex.forEach((exercise,index)=>{
  const meta=exercise[4]||{},groupKey=meta.group||null;
  if(groupKey!==openGroup){
   if(openGroup)html+='</div></section>';
   openGroup=groupKey;
   if(groupKey){
    const group=EXERCISE_GROUPS[groupKey];
    html+=`<section class="exercise-group" aria-label="${attr(group.label)}">
     <div class="exercise-group-heading"><p class="eyebrow">OPTIONAL ACCESSORY</p><h2>${esc(group.label)}</h2><p>${esc(group.instruction)}</p></div>
     <div class="exercise-group-cards">`;
   }
  }
  const state=findSavedExercise(exercise,savedExercises)||defaultExerciseState(exercise,key);
  html+=exerciseCard(exercise,index,state);
 });
 if(openGroup)html+='</div></section>';
 return html;
}

function findSavedExercise(definition,savedExercises){
 const definitionId=exerciseDefinitionId(definition);
 return savedExercises.find(exercise=>exerciseIdentity(exercise)===definitionId)
  ||savedExercises.find(exercise=>exercise.name===definition[0])
  ||null;
}

function exerciseDefinitionId(definition){
 return definition[4]?.id||EXERCISE_NAME_IDS[definition[0]]||definition[0];
}

function exerciseIdentity(exercise){
 return exercise?.exerciseId||exercise?.templateId||EXERCISE_NAME_IDS[exercise?.name]||exercise?.name||'';
}

function defaultExerciseState(exercise,key){
 const type=exercise[2],meta=exercise[4]||{},state={};
 if(meta.defaultVariation)state.variation=meta.defaultVariation;
 if(type==='interval'||type==='run')Object.assign(state,runDefaults(runStage,key),{runStage:String(runStage)});
 return state;
}

function exerciseCard(exercise,index,state){
 const [name,prescription,type,unit,meta={}]=exercise;
 const variation=meta.variations?grid(select('variation','Variation / equipment',state.variation||meta.defaultVariation||'',meta.variations)):'';
 const guidance=meta.progression||PROGRESSION[type]||'Progress gradually while keeping technique consistent.';
 const setPlan=getSetPlan(prescription,meta);
 return `<section class="card exercise-card ${state.completed?'completed':''}" data-i="${index}" data-exercise-id="${attr(meta.id||name)}">
  <div class="exercise-heading">
   <div><p class="exercise-order">Exercise ${index+1}</p><h2>${esc(name)}</h2><p>${esc(prescription)}</p></div>
   <label class="check-label"><input class="exercise-complete" type="checkbox" ${state.completed?'checked':''}>Done</label>
  </div>
  ${variation}${fields(type,unit,state,setPlan,meta)}
  <label>Exercise notes<input data-field="notes" value="${attr(state.notes)}" placeholder="Technique, pain, substitutions..."></label>
  <details class="progression-help"><summary>Progression guidance</summary><p>${esc(guidance)}</p></details>
 </section>`;
}

function fields(type,unit,state,setPlan,meta={}){
 if(type==='weighted')return weightedFields(unit,state,setPlan,meta);
 if(type==='body')return grid(setCountSelect(state.sets,setPlan),num('rpe','Exercise RPE',state.rpe,1,10))+setRepLogger(state,setPlan,type);
 if(type==='timed')return setPlan
  ?grid(setCountSelect(state.sets,setPlan),text('times','Times by set',state.times,'0:45, 0:40, 0:35'),num('rpe','Exercise RPE',state.rpe,1,10))
  :grid(text('times','Duration',state.times,'8:00'),num('rpe','Exercise RPE',state.rpe,1,10));
 if(type==='carry')return grid(num('load',`Load (${unit})`,state.load),setCountSelect(state.sets,setPlan,'Trips / holds to log'),num('distance','Distance / trip (yd)',state.distance),num('carrySeconds','Hold duration (sec)',state.carrySeconds),num('rpe','Exercise RPE',state.rpe,1,10));
 if(type==='interval'||type==='run')return runFields(type,state);
 if(type==='cardio')return grid(select('modality','Modality',state.modality,['Incline walk','Bike','Elliptical','Rower','Other']),num('minutes','Minutes',state.minutes),num('distance','Distance / output',state.distance,0,null,.01),select('outputUnit','Distance / output unit',state.outputUnit,['mi','km','m','calories']),num('avgHr','Average HR',state.avgHr));
 if(type==='circuit')return grid(
  num('rounds','Rounds completed',state.rounds),
  num('lungeLoad','Reverse-lunge load (lb total)',state.lungeLoad),
  select('carryStyle','Carry / hold style',state.carryStyle,['Farmer carry','Heavy static hold','Suitcase carry']),
  num('carryLoad','Carry / hold load per hand (lb)',state.carryLoad),
  num('carrySeconds','Carry / hold duration (sec)',state.carrySeconds),
  num('stepHeight','Step-up height (in)',state.stepHeight),
  select('modality','Hard-cardio modality',state.modality,['Bike','Rower','Elliptical','Treadmill','Other']),
  num('intervalSeconds','Hard interval duration (sec)',state.intervalSeconds),
  text('totalTime','Total circuit time',state.totalTime,'12:30'),
  num('rpe','Circuit RPE',state.rpe,1,10)
 );
 return '';
}

function weightedFields(unit,state,setPlan,meta){
 const variation=state.variation||meta.defaultVariation||'';
 const barWeights=meta.barWeights||{};
 const usesBar=Object.prototype.hasOwnProperty.call(barWeights,variation);
 const savedMode=['plates','total'].includes(state.loadMode)?state.loadMode:'';
 const mode=usesBar?(savedMode||(state.load?'total':'plates')):'';
 const barWeight=usesBar
  ?(state.barWeight!==''&&state.barWeight!=null?state.barWeight:barWeights[variation])
  :'';
 const loadLabel=usesBar&&mode==='plates'?'Plate load (lb, both sides combined)':usesBar?'Total load (lb)':`Load (${unit})`;
 return `<div class="weighted-load" data-unit="${attr(unit)}" data-bar-weights="${attr(JSON.stringify(barWeights))}" data-active-bar-variation="${attr(usesBar?variation:'')}">
  <div class="form-grid">
   <label><span data-load-label>${esc(loadLabel)}</span><input data-field="load" type="number" value="${attr(state.load)}" min="0" step=".5" inputmode="decimal"></label>
   <label data-load-mode-wrap class="${usesBar?'':'hidden'}">Weight entered as
    <select data-field="loadMode">
     <option value="plates" ${mode==='plates'?'selected':''}>Plates only + bar</option>
     <option value="total" ${mode==='total'?'selected':''}>Total weight</option>
    </select>
   </label>
   <label data-bar-weight-wrap class="${usesBar&&mode==='plates'?'':'hidden'}">Bar / starting resistance (lb)
    <input data-field="barWeight" type="number" value="${attr(barWeight)}" min="0" step=".5" inputmode="decimal">
   </label>
   ${setCountSelect(state.sets,setPlan)}
   ${num('rpe','Exercise RPE',state.rpe,1,10)}
  </div>
  <div class="calculated-load ${usesBar?'':'hidden'}" data-calculated-load>
   <span>Total training load</span>
   <strong data-total-load>—</strong>
   <small data-load-breakdown>Plate load plus bar weight</small>
  </div>
 </div>${setRepLogger(state,setPlan,'weighted')}`;
}

function bindWeightedLoadControls(){
 document.querySelectorAll('.weighted-load').forEach(panel=>{
  const card=panel.closest('.exercise-card');
  const variation=card.querySelector('[data-field="variation"]');
  const refresh=variationChanged=>updateWeightedLoad(panel,variation?.value||'',variationChanged);
  panel.querySelector('[data-field="load"]').addEventListener('input',()=>refresh(false));
  panel.querySelector('[data-field="barWeight"]').addEventListener('input',()=>refresh(false));
  panel.querySelector('[data-field="loadMode"]').addEventListener('change',()=>refresh(false));
  variation?.addEventListener('change',()=>refresh(true));
  refresh(false);
 });
}

function updateWeightedLoad(panel,variation,variationChanged){
 let barWeights={};
 try{barWeights=JSON.parse(panel.dataset.barWeights||'{}')}catch{}
 const usesBar=Object.prototype.hasOwnProperty.call(barWeights,variation);
 const load=panel.querySelector('[data-field="load"]');
 const mode=panel.querySelector('[data-field="loadMode"]');
 const barWeight=panel.querySelector('[data-field="barWeight"]');
 const modeWrap=panel.querySelector('[data-load-mode-wrap]');
 const barWrap=panel.querySelector('[data-bar-weight-wrap]');
 const calculated=panel.querySelector('[data-calculated-load]');
 const label=panel.querySelector('[data-load-label]');
 if(!usesBar){
  mode.value='';
  barWeight.value='';
  modeWrap.classList.add('hidden');
  barWrap.classList.add('hidden');
  calculated.classList.add('hidden');
  label.textContent=`Load (${panel.dataset.unit})`;
  panel.dataset.activeBarVariation='';
  return;
 }
 const newlySelected=variationChanged&&panel.dataset.activeBarVariation!==variation;
 if(!['plates','total'].includes(mode.value)||newlySelected)mode.value='plates';
 if((newlySelected||barWeight.value==='')&&mode.value==='plates')barWeight.value=String(barWeights[variation]??'');
 modeWrap.classList.remove('hidden');
 barWrap.classList.toggle('hidden',mode.value!=='plates');
 calculated.classList.remove('hidden');
 label.textContent=mode.value==='plates'?'Plate load (lb, both sides combined)':'Total load (lb)';
 const entered=numberOrNull(load.value);
 const bar=numberOrNull(barWeight.value)||0;
 const total=entered==null?null:mode.value==='plates'?entered+bar:entered;
 panel.querySelector('[data-total-load]').textContent=total==null?'—':`${formatLoad(total)} lb`;
 panel.querySelector('[data-load-breakdown]').textContent=entered==null
  ?'Enter the combined plate weight; adjust the bar weight if needed.'
  :mode.value==='plates'?`${formatLoad(entered)} lb plates + ${formatLoad(bar)} lb bar`:'Entered as total weight';
 panel.dataset.activeBarVariation=variation;
}

function numberOrNull(value){
 if(value===''||value==null)return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
}

function formatLoad(value){
 return Number(value).toFixed(2).replace(/\.?0+$/,'');
}

function totalLoadValue(exercise){
 const entered=numberOrNull(exercise?.load);
 if(entered==null)return null;
 return exercise.loadMode==='plates'?entered+(numberOrNull(exercise.barWeight)||0):entered;
}

function getSetPlan(prescription,meta={}){
 if(meta.sets){
  const configured=typeof meta.sets==='number'?{default:meta.sets,max:meta.sets}:meta.sets;
  const configuredDefault=Number(configured.default||configured.min||configured.max);
  const configuredMax=Number(configured.max||configuredDefault);
  if(configuredDefault>0&&configuredMax>=configuredDefault)return {default:configuredDefault,max:configuredMax};
 }
 const range=String(prescription).match(/^\s*(\d+)\s*[–—-]\s*(\d+)\s+(?:[\w-]+\s+){0,3}sets?\b/i);
 if(range)return {default:Number(range[1]),max:Number(range[2])};
 const fixed=String(prescription).match(/^\s*(\d+)(?:\s*×|\s+(?:[\w-]+\s+){0,3}sets?\b)/i);
 if(fixed)return {default:Number(fixed[1]),max:Number(fixed[1])};
 return null;
}

function setCountSelect(value,plan,label='Number of sets'){
 if(!plan)return num('sets',label,value);
 const savedCount=Number(value)||0;
 const max=Math.max(plan.max,savedCount);
 const selected=Math.max(1,Math.min(max,savedCount||plan.default));
 return `<label>${label}<select class="set-count-select" data-field="sets">${Array.from({length:max},(_,index)=>{
  const count=index+1;
  return `<option value="${count}" ${count===selected?'selected':''}>${count}</option>`;
 }).join('')}</select></label>`;
}

function setRepLogger(state,plan,type){
 if(!plan)return grid(text('reps','Reps by set',state.reps,'5, 5, 5'));
 const values=parseSetValues(state.reps);
 const count=Math.max(1,Number(state.sets)||values.length||plan.default);
 return `<div class="set-log" data-rep-type="${type}">
  <p class="set-log-title">Reps completed</p>
  <div class="set-rep-grid">${setRepRows(count,values,type)}</div>
 </div>`;
}

function setRepRows(count,values,type){
 return Array.from({length:count},(_,index)=>repSelect(index,values[index]||'',type)).join('');
}

function repSelect(index,value,type){
 const choices=type==='body'
  ?[...Array.from({length:30},(_,i)=>i+1),35,40,45,50,60,75,100]
  :Array.from({length:20},(_,i)=>i+1);
 const normalized=String(value||'').trim();
 const custom=normalized&&!choices.some(choice=>String(choice)===normalized);
 return `<label>Set ${index+1} reps
  <select class="set-rep-select" data-rep-index="${index}">
   <option value="">—</option>
   ${choices.map(choice=>`<option value="${choice}" ${String(choice)===normalized?'selected':''}>${choice}</option>`).join('')}
   <option value="custom" ${custom?'selected':''}>Other…</option>
  </select>
  <input class="custom-reps ${custom?'':'hidden'}" data-custom-rep="${index}" type="number" min="0" step="1" inputmode="numeric" value="${custom?attr(normalized):''}" aria-label="Set ${index+1} custom reps" placeholder="Reps">
 </label>`;
}

function parseSetValues(value){
 return String(value||'').split(',').map(item=>item.trim()).filter((item,index,items)=>item||index<items.length-1);
}

function readRepValues(card){
 return [...card.querySelectorAll('.set-rep-select')].map(selectInput=>{
  if(selectInput.value!=='custom')return selectInput.value;
  return card.querySelector(`[data-custom-rep="${selectInput.dataset.repIndex}"]`)?.value.trim()||'';
 });
}

function bindSetControls(){
 document.querySelectorAll('.set-count-select').forEach(selectInput=>selectInput.onchange=()=>{
  const card=selectInput.closest('.exercise-card');
  const logger=card.querySelector('.set-log');
  if(!logger)return;
  const values=readRepValues(card);
  logger.querySelector('.set-rep-grid').innerHTML=setRepRows(Number(selectInput.value),values,logger.dataset.repType);
  bindCustomRepControls(logger);
 });
 bindCustomRepControls(document);
}

function bindCustomRepControls(root){
 root.querySelectorAll('.set-rep-select').forEach(selectInput=>selectInput.onchange=()=>{
  const customInput=selectInput.closest('label').querySelector('.custom-reps');
  customInput.classList.toggle('hidden',selectInput.value!=='custom');
  if(selectInput.value==='custom')customInput.focus();
 });
}

function runFields(type,state){
 const common=[
  runStageSelect(state.runStage),
  num('runMinutes','Run interval (min)',state.runMinutes,0,null,.25),
  num('walkMinutes','Walk / easy interval (min)',state.walkMinutes,0,null,.25),
  num('rounds','Planned run/walk rounds',state.rounds),
  num('completedRounds','Run/walk rounds completed',state.completedRounds),
  num('continuousMinutes','Continuous run (min)',state.continuousMinutes),
  num('distance','Total distance (mi)',state.distance,0,null,.01),
  text('totalTime','Total time',state.totalTime,'28:45'),
  num('rpe','Run effort (RPE)',state.rpe,1,10),
  num('runPain','Run discomfort (0–10)',state.runPain,0,10)
 ];
 if(type==='run')common.push(num('avgHr','Average HR',state.avgHr),num('maxHr','Max HR',state.maxHr));
 return grid(...common)+runTimerMarkup()+`<label>Run structure / splits<input data-field="structure" value="${attr(state.structure)}" placeholder="Use the stage target or enter a manual structure"></label>`;
}

function runTimerMarkup(){
 return `<section class="run-timer" data-phase="ready" aria-label="Run timer">
  <div class="run-timer-heading">
   <div><p class="eyebrow">RUN TIMER</p><h3 data-timer-current aria-live="polite">Ready</h3></div>
   <span class="run-timer-phase" data-timer-phase>READY</span>
  </div>
  <div class="run-timer-clock" data-timer-clock aria-label="Time remaining">0:00</div>
  <p class="run-timer-next" data-timer-next></p>
  <progress data-timer-progress value="0" max="1" aria-label="Interval segments completed"></progress>
  <p class="run-timer-segments muted" data-timer-segments></p>
  <div class="run-timer-actions">
   <button class="primary" data-timer-action="start" type="button">Start timer</button>
   <button class="secondary" data-timer-action="pause" type="button" disabled>Pause</button>
   <button class="secondary" data-timer-action="next" type="button" disabled>Next segment</button>
   <button class="secondary" data-timer-action="reset" type="button">Reset</button>
  </div>
 </section>`;
}

function bindRunTimers(){
 document.querySelectorAll('.run-timer').forEach(timer=>{
  const card=timer.closest('.exercise-card');
  timer.querySelector('[data-timer-action="start"]').onclick=()=>startRunTimer(card);
  timer.querySelector('[data-timer-action="pause"]').onclick=pauseRunTimer;
  timer.querySelector('[data-timer-action="next"]').onclick=()=>nextRunTimerSegment(true);
  timer.querySelector('[data-timer-action="reset"]').onclick=()=>prepareRunTimer(card,{clearCompletedRounds:true});
  ['runMinutes','walkMinutes','rounds','continuousMinutes'].forEach(field=>{
   card.querySelector(`[data-field="${field}"]`)?.addEventListener('change',()=>{
    const wasRunning=Boolean(runTimerState?.running);
    prepareRunTimer(card,{clearCompletedRounds:false});
    if(wasRunning)toast('Timer reset after the interval plan changed');
   });
  });
  prepareRunTimer(card);
 });
}

function buildRunTimerPlan(card){
 const value=field=>Number(card.querySelector(`[data-field="${field}"]`)?.value||0);
 const runSeconds=Math.round(value('runMinutes')*60);
 const walkSeconds=Math.round(value('walkMinutes')*60);
 const rounds=Math.max(0,Math.floor(value('rounds')));
 const continuousSeconds=Math.round(value('continuousMinutes')*60);
 const plan=[];
 if(runSeconds>0&&rounds>0){
  for(let round=1;round<=rounds;round++){
   if(walkSeconds>0)plan.push({kind:'walk',label:'Walk',round,seconds:walkSeconds});
   plan.push({kind:'run',label:'Run',round,seconds:runSeconds});
  }
 }else if(continuousSeconds>0){
  plan.push({kind:'run',label:'Continuous run',round:null,seconds:continuousSeconds});
 }
 return plan;
}

function prepareRunTimer(card,{clearCompletedRounds=false}={}){
 clearRunTimer();
 const plan=buildRunTimerPlan(card);
 runTimerState={
  card,
  plan,
  index:0,
  remainingMs:(plan[0]?.seconds||0)*1000,
  running:false,
  started:false,
  complete:false,
  completedSegments:0,
  deadline:0
 };
 if(clearCompletedRounds){
  const completedRounds=card.querySelector('[data-field="completedRounds"]');
  if(completedRounds)completedRounds.value='';
  const checkbox=card.querySelector('.exercise-complete');
  if(checkbox)checkbox.checked=false;
  card.classList.remove('completed');
 }
 updateRunTimer();
}

function startRunTimer(card){
 if(runTimerState?.card!==card||!runTimerState?.started)prepareRunTimer(card);
 const state=runTimerState;
 if(!state?.plan.length){
  toast('Enter a run duration and rounds before starting the timer');
  return;
 }
 if(state.complete||state.running)return;
 if(!state.started){
  const completedRounds=card.querySelector('[data-field="completedRounds"]');
  if(completedRounds)completedRounds.value='';
  state.started=true;
 }
 state.running=true;
 state.deadline=Date.now()+state.remainingMs;
 clearInterval(runTimerTick);
 runTimerTick=setInterval(tickRunTimer,250);
 requestRunTimerWakeLock();
 signalRunTimer();
 updateRunTimer();
}

function pauseRunTimer(){
 if(!runTimerState?.running)return;
 runTimerState.remainingMs=Math.max(0,runTimerState.deadline-Date.now());
 runTimerState.running=false;
 clearInterval(runTimerTick);
 runTimerTick=null;
 releaseRunTimerWakeLock();
 updateRunTimer();
}

function nextRunTimerSegment(manual=false){
 const state=runTimerState;
 if(!state?.started||state.complete)return;
 completeRunTimerSegment();
 if(!state.complete){
  state.remainingMs=state.plan[state.index].seconds*1000;
  if(state.running)state.deadline=Date.now()+state.remainingMs;
  signalRunTimer();
  updateRunTimer();
 }else if(manual){
  finishRunTimer();
 }
}

function tickRunTimer(){
 const state=runTimerState;
 if(!state?.running)return;
 let remaining=state.deadline-Date.now();
 if(remaining>0){
  state.remainingMs=remaining;
  updateRunTimer();
  return;
 }
 let overshoot=Math.abs(remaining);
 do{
  completeRunTimerSegment();
  if(state.complete){
   finishRunTimer();
   return;
  }
  const duration=state.plan[state.index].seconds*1000;
  if(overshoot<duration){
   state.remainingMs=duration-overshoot;
   state.deadline=Date.now()+state.remainingMs;
   signalRunTimer();
   updateRunTimer();
   return;
  }
  overshoot-=duration;
 }while(!state.complete);
 finishRunTimer();
}

function completeRunTimerSegment(){
 const state=runTimerState;
 if(!state||state.complete)return;
 const segment=state.plan[state.index];
 state.completedSegments=Math.min(state.plan.length,state.completedSegments+1);
 const next=state.plan[state.index+1];
 const completedRound=segment.round&&(!next||next.round!==segment.round);
 if(completedRound){
  const input=state.card.querySelector('[data-field="completedRounds"]');
  if(input)input.value=String(segment.round);
 }
 if(state.index>=state.plan.length-1){
  state.complete=true;
  state.remainingMs=0;
 }else state.index+=1;
}

function finishRunTimer(){
 const state=runTimerState;
 if(!state)return;
 state.complete=true;
 state.running=false;
 state.remainingMs=0;
 state.completedSegments=state.plan.length;
 clearInterval(runTimerTick);
 runTimerTick=null;
 releaseRunTimerWakeLock();
 const checkbox=state.card.querySelector('.exercise-complete');
 if(checkbox)checkbox.checked=true;
 state.card.classList.add('completed');
 const totalTime=state.card.querySelector('[data-field="totalTime"]');
 if(totalTime&&!totalTime.value)totalTime.value=formatTimerSeconds(state.plan.reduce((sum,segment)=>sum+segment.seconds,0));
 signalRunTimer(true);
 updateRunTimer();
 toast('Run timer complete · workout marked done');
}

function clearRunTimer(){
 clearInterval(runTimerTick);
 runTimerTick=null;
 if(runTimerState)runTimerState.running=false;
 runTimerState=null;
 releaseRunTimerWakeLock();
}

function updateRunTimer(){
 const state=runTimerState;
 const timer=state?.card?.querySelector('.run-timer');
 if(!state||!timer)return;
 const segment=state.plan[state.index];
 const phase=state.complete?'complete':state.running?segment?.kind:state.started?'paused':'ready';
 timer.dataset.phase=phase||'ready';
 timer.querySelector('[data-timer-phase]').textContent=state.complete?'COMPLETE':state.running?`${segment.label.toUpperCase()} NOW`:state.started?'PAUSED':'READY';
 timer.querySelector('[data-timer-current]').textContent=state.complete
  ?'Workout complete'
  :segment?`${segment.label}${segment.round?` · Round ${segment.round} of ${runTimerRoundCount(state.plan)}`:''}`:'Enter an interval plan';
 timer.querySelector('[data-timer-clock]').textContent=formatTimerSeconds(Math.ceil(state.remainingMs/1000));
 const next=state.plan[state.index+1];
 timer.querySelector('[data-timer-next]').textContent=state.complete
  ?'All planned segments completed'
  :next?`Next: ${next.label}${next.round?` · Round ${next.round}`:''}`:`Planned time: ${formatTimerSeconds(state.plan.reduce((sum,item)=>sum+item.seconds,0))}`;
 const progress=timer.querySelector('[data-timer-progress]');
 const roundCount=runTimerRoundCount(state.plan);
 const completedRounds=runTimerCompletedRoundCount(state);
 progress.max=Math.max(1,roundCount||state.plan.length);
 progress.value=state.complete?(roundCount||state.plan.length):(roundCount?completedRounds:state.completedSegments);
 timer.querySelector('[data-timer-segments]').textContent=state.plan.length
  ?roundCount
   ?`${completedRounds} of ${roundCount} rounds complete · ${state.completedSegments} of ${state.plan.length} segments`
   :`${state.completedSegments} of ${state.plan.length} segments complete`
  :'Set the interval duration and rounds above.';
 const start=timer.querySelector('[data-timer-action="start"]');
 start.textContent=state.started&&!state.complete?'Resume timer':'Start timer';
 start.disabled=state.running||state.complete||!state.plan.length;
 timer.querySelector('[data-timer-action="pause"]').disabled=!state.running;
 timer.querySelector('[data-timer-action="next"]').disabled=!state.started||state.complete;
}

function runTimerRoundCount(plan){
 return plan.reduce((max,segment)=>Math.max(max,segment.round||0),0);
}

function runTimerCompletedRoundCount(state){
 return state.plan.slice(0,state.completedSegments).reduce((count,segment,index)=>{
  const next=state.plan[index+1];
  return count+(segment.round&&(!next||next.round!==segment.round)?1:0);
 },0);
}

function formatTimerSeconds(seconds){
 const safe=Math.max(0,Math.ceil(Number(seconds)||0));
 const hours=Math.floor(safe/3600);
 const minutes=Math.floor((safe%3600)/60);
 const remainder=String(safe%60).padStart(2,'0');
 return hours?`${hours}:${String(minutes).padStart(2,'0')}:${remainder}`:`${minutes}:${remainder}`;
}

async function requestRunTimerWakeLock(){
 if(!('wakeLock' in navigator)||runTimerWakeLock)return;
 try{runTimerWakeLock=await navigator.wakeLock.request('screen')}catch{}
}

async function releaseRunTimerWakeLock(){
 if(!runTimerWakeLock)return;
 try{await runTimerWakeLock.release()}catch{}
 runTimerWakeLock=null;
}

function signalRunTimer(finished=false){
 try{navigator.vibrate?.(finished?[180,80,180]:120)}catch{}
 try{
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return;
  if(!runTimerAudioContext)runTimerAudioContext=new AudioContextClass();
  if(runTimerAudioContext.state==='suspended')runTimerAudioContext.resume();
  const tones=finished?[660,880]:[880];
  tones.forEach((frequency,index)=>{
   const oscillator=runTimerAudioContext.createOscillator();
   const gain=runTimerAudioContext.createGain();
   const start=runTimerAudioContext.currentTime+index*.18;
   oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.exponentialRampToValueAtTime(.18,start+.01);
   gain.gain.exponentialRampToValueAtTime(.0001,start+.14);
   oscillator.connect(gain).connect(runTimerAudioContext.destination);
   oscillator.start(start);
   oscillator.stop(start+.15);
  });
 }catch{}
}

const grid=(...items)=>`<div class="form-grid">${items.join('')}</div>`;

function num(field,label,value='',min=0,max=null,step=1){
 return `<label>${label}<input data-field="${field}" type="number" value="${attr(value)}" ${min!==null?`min="${min}"`:''} ${max!==null?`max="${max}"`:''} step="${step}" inputmode="decimal"></label>`;
}

function text(field,label,value='',placeholder=''){
 return `<label>${label}<input data-field="${field}" value="${attr(value)}" placeholder="${attr(placeholder)}"></label>`;
}

function select(field,label,value='',options=[]){
 return `<label>${label}<select data-field="${field}"><option value="">Choose</option>${options.map(option=>`<option ${String(value)===String(option)?'selected':''}>${esc(option)}</option>`).join('')}</select></label>`;
}

function runStageSelect(value=''){
 const manual=!RUN_STAGES.some(stage=>String(stage.id)===String(value));
 return `<label>Stage attempted
  <select data-field="runStage">
   <option value="manual" ${manual?'selected':''}>Manual / unstructured</option>
   ${RUN_STAGES.map(stage=>`<option value="${stage.id}" ${String(stage.id)===String(value)?'selected':''}>${stage.id} — ${esc(stage.label)}</option>`).join('')}
  </select>
 </label>`;
}

function renderRunProgress(key){
 const card=$('runProgressCard');
 const hasRun=days[key].ex.some(exercise=>['interval','run'].includes(exercise[2]));
 card.classList.toggle('hidden',!hasRun);
 if(!hasRun)return;
 const stage=getRunStage(runStage);
 const target=runTarget(stage.id,key);
 $('runStageBadge').textContent=stage.id===12?'STAGE 12 OF 12 · PERFORMANCE PHASE':`STAGE ${stage.id} OF ${RUN_STAGES.length}`;
 $('runStageTitle').textContent=stage.label;
 $('runStageTarget').textContent=`Today: ${target}`;
 if(stage.id===12){
  $('runStageStatus').textContent='The continuous-running base is complete. Keep Day 4 easy and use controlled Day 1 repeats while two-mile pace develops.';
 }else{
  const completions=runStageCompletionCount(stage.id);
  $('runStageStatus').textContent=completions>=2
   ?'Two stage completions are logged. Advance when recovery, discomfort, and form still feel good.'
   :`${completions} of 2 stage completions logged. A saved run marked Done counts here.`;
 }
 $('runStageBackButton').disabled=stage.id===1;
 $('runStageAdvanceButton').disabled=stage.id===12;
 $('runStageAdvanceButton').textContent=stage.id===11?'Enter two-mile phase':'Advance stage';
}

function changeRunStage(direction){
 const next=Math.max(1,Math.min(RUN_STAGES.length,runStage+direction));
 if(next===runStage)return;
 runStage=next;
 persistRunStage();
 const key=$('daySelect').value;
 renderRunProgress(key);
 applyRunStageToVisibleCards(key);
 renderProgress();
 updatePreview();
 toast(runStage===12?'Two-mile development phase selected':`Run stage ${runStage} selected`);
}

function repeatRunStage(){
 const key=$('daySelect').value;
 applyRunStageToVisibleCards(key);
 toast(`Run stage ${runStage} reset for today`);
}

function applyRunStageToVisibleCards(key){
 document.querySelectorAll('[data-field="runStage"]').forEach(selectInput=>{
  selectInput.value=String(runStage);
  const card=selectInput.closest('.exercise-card');
  applyRunStageDefaults(card,runStage,key);
  prepareRunTimer(card,{clearCompletedRounds:true});
 });
}

function applyRunStageDefaults(card,stageId,key){
 const defaults=runDefaults(stageId,key);
 ['runMinutes','walkMinutes','rounds','continuousMinutes','structure'].forEach(field=>{
  const input=card.querySelector(`[data-field="${field}"]`);
  if(input)input.value=defaults[field]||'';
 });
}

function getRunStage(stageId){
 return RUN_STAGES.find(stage=>stage.id===Number(stageId))||RUN_STAGES[0];
}

function runTarget(stageId,key){
 const stage=getRunStage(stageId);
 if(stage.id!==12)return stage.label;
 return key==='day1'
  ?'6 × 2 minutes controlled strong with 2 minutes easy walk-jog recovery'
  :'25–35 minutes easy continuous running; record pace and splits without racing';
}

function runDefaults(stageId,key){
 const stage=getRunStage(stageId);
 if(stage.id===12){
  return key==='day1'
   ?{runMinutes:'2',walkMinutes:'2',rounds:'6',structure:runTarget(12,key)}
   :{continuousMinutes:'30',structure:runTarget(12,key)};
 }
 return {
  runMinutes:stage.runMinutes||'',
  walkMinutes:stage.walkMinutes||'',
  rounds:stage.rounds||'',
  continuousMinutes:stage.continuousMinutes||'',
  structure:stage.label
 };
}

function saveWorkout(event){
 event.preventDefault();
 const key=$('daySelect').value,day=days[key];
 const exercises=[...document.querySelectorAll('.exercise-card')].map((card,index)=>{
  const definition=day.ex[index];
  const exercise={exerciseId:exerciseDefinitionId(definition),name:definition[0],prescription:definition[1],type:definition[2],completed:card.querySelector('.exercise-complete').checked};
  card.querySelectorAll('[data-field]').forEach(input=>exercise[input.dataset.field]=input.value.trim());
  if(card.querySelector('.set-rep-grid')){
   const reps=readRepValues(card);
   while(reps.at(-1)==='')reps.pop();
   exercise.reps=reps.join(', ');
  }
  if(exercise.type==='weighted'){
   const total=totalLoadValue(exercise);
   exercise.totalLoad=total==null?'':String(total);
  }
  if(['interval','run'].includes(exercise.type)&&Number(exercise.runStage))exercise.runTarget=runTarget(Number(exercise.runStage),key);
  return exercise;
 });
 const item={
  id:editing||id(),
  date:$('sessionDate').value||today(),
  dayKey:key,
  dayLabel:day.label,
  duration:$('duration').value,
  sessionRpe:$('sessionRpe').value,
  bodyWeight:$('bodyWeight').value,
  painScore:$('painScore').value,
  notes:$('sessionNotes').value.trim(),
  exercises,
  updatedAt:new Date().toISOString()
 };
 const index=entries.findIndex(entry=>entry.id===item.id);
 const wasEditing=index>=0;
 index>=0?entries[index]=item:entries.push(item);
 entries.sort(compareEntries);
 persist();
 editing=null;
 const runExercise=exercises.find(exercise=>exercise.completed&&['interval','run'].includes(exercise.type)&&Number(exercise.runStage));
 let suffix='';
 if(runExercise&&Number(runExercise.runStage)===runStage&&runStage<12){
  const completions=runStageCompletionCount(runStage);
  suffix=completions>=2?' · run stage ready to advance':` · ${completions}/2 run-stage completions`;
 }
 newWorkout(false);
 renderHistory();
 renderProgress();
 updatePreview();
 toast(`${wasEditing?'Workout updated':'Workout saved'}${suffix} · next workout ready`);
}

function newWorkout(notify=true){
 editing=null;
 $('daySelect').value=nextWorkoutDay();
 $('sessionDate').value=today();
 renderWorkout();
 tab('workout');
 if(notify)toast('New workout ready');
}

function nextWorkoutDay(){
 const recent=mostRecentEntry();
 if(!recent||!days[recent.dayKey])return 'day1';
 const rotation=Object.keys(days);
 return rotation[(rotation.indexOf(recent.dayKey)+1)%rotation.length];
}

function mostRecentEntry(){
 return entries.slice().sort(compareEntries)[0]||null;
}

function compareEntries(a,b){
 return String(b.date||'').localeCompare(String(a.date||''))
  ||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
}

function renderHistory(){
 const container=$('historyList');
 if(!entries.length){container.innerHTML='<div class="empty-state">No workouts saved yet.</div>';return}
 container.innerHTML=entries.map(entry=>{
  const done=entry.exercises.filter(exercise=>exercise.completed).map(exercise=>`<li><strong>${esc(exercise.name)}:</strong> ${esc(summary(exercise))}</li>`).join('');
  return `<article class="history-item">
   <div class="history-top">
    <div><h3>${esc(entry.dayLabel)}</h3><p>${dateFmt(entry.date)}${entry.duration?` · ${esc(entry.duration)} min`:''}${entry.sessionRpe?` · RPE ${esc(entry.sessionRpe)}`:''}</p></div>
    <div class="history-actions"><button class="secondary" onclick="editEntry('${entry.id}')">Edit</button><button class="danger" onclick="deleteEntry('${entry.id}')">Delete</button></div>
   </div>
   ${done?`<ul class="history-exercises">${done}</ul>`:'<p>No completed exercises marked.</p>'}
   ${entry.notes?`<p><strong>Notes:</strong> ${esc(entry.notes)}</p>`:''}
  </article>`;
 }).join('');
}

window.editEntry=entryId=>{
 const entry=entries.find(item=>item.id===entryId);
 if(!entry)return;
 editing=entryId;
 renderWorkout(entry);
 tab('workout');
 toast('Editing saved workout');
};

window.deleteEntry=entryId=>{
 if(!confirm('Delete this workout?'))return;
 entries=entries.filter(entry=>entry.id!==entryId);
 persist();
 renderHistory();
 renderProgress();
 renderRunProgress($('daySelect').value);
 updatePreview();
 toast('Workout deleted');
};

function deleteAll(){
 if(!entries.length||!confirm('Delete every saved workout? Export a backup first if needed.'))return;
 entries=[];
 persist();
 renderHistory();
 renderProgress();
 renderRunProgress($('daySelect').value);
 updatePreview();
 toast('All workouts deleted');
}

function renderProgress(){
 const minutes=entries.reduce((total,entry)=>total+Number(entry.duration||0),0);
 const rpes=entries.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const averageRpe=rpes.length?(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1):'—';
 const weight=entries.find(entry=>Number(entry.bodyWeight))?.bodyWeight||'—';
 const stage=getRunStage(runStage);
 const stageProgress=stage.id===12?'Base complete':`${Math.min(runStageCompletionCount(stage.id),2)}/2`;
 const primaryCards=[
  ['Sessions',entries.length],
  ['Training time',minutes?`${minutes} min`:'—'],
  ['Best hex-bar deadlift',bestDeadlift(['Trap / hex bar'])],
  ['Best straight-bar deadlift',bestDeadlift(['Conventional barbell','Sumo barbell'])],
  ['Best push-up set',bestRep('Hand-release push-ups')],
  ['Longest plank',bestTime('Plank')],
  ['Longest logged run',bestNum(['Primary run','Run / walk intervals'],'distance',' mi')],
  ['Latest weight',weight==='—'?'—':`${weight} lb`],
  ['Avg. session RPE',averageRpe],
  ['Current run stage',stage.id===12?'Two-mile phase':`Stage ${stage.id}`],
  ['Run-stage completions',stageProgress]
 ];
 const armSessions=armSupersetSessionCount();
 const accessoryCards=[
  ['Highest dumbbell-curl weight',bestExerciseLoad('dumbbellCurl')],
  ['Highest triceps-pressdown weight',bestExerciseLoad('tricepsPressdown')],
  ['Highest lateral-raise weight',bestExerciseLoad('lateralRaise')],
  ['Arm-superset sessions',armSessions?String(armSessions):'—']
 ].filter(([,value])=>value!=='—');
 const cards=[...primaryCards,...accessoryCards];
 $('progressCards').innerHTML=cards.map(([label,value])=>`<article class="metric"><div class="label">${esc(label)}</div><div class="value">${esc(value||'—')}</div></article>`).join('');
 const recent=entries.slice(0,8);
 $('recentProgress').innerHTML=recent.length?recent.map(entry=>`<p><strong>${dateFmt(entry.date)}</strong> — ${esc(entry.dayLabel)}${entry.sessionRpe?`, RPE ${esc(entry.sessionRpe)}`:''}${entry.painScore!==''&&entry.painScore!=null?`, pain ${esc(entry.painScore)}/10`:''}</p>`).join(''):'<div class="empty-state">Progress will appear after the first saved workout.</div>';
}

function runStageCompletionCount(stageId){
 return entries.filter(entry=>{
  return entry.exercises.some(exercise=>exercise.completed&&Number(exercise.runStage)===Number(stageId)&&['interval','run'].includes(exercise.type));
 }).length;
}

function bestDeadlift(variations){
 const values=entries.flatMap(entry=>entry.exercises)
  .filter(exercise=>['Deadlift','Trap-bar deadlift'].includes(exercise.name)&&variations.includes(exercise.variation))
  .map(totalLoadValue)
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${Math.max(...values)} lb`:'—';
}

function bestExerciseLoad(exerciseId){
 const values=entries.flatMap(entry=>entry.exercises)
  .filter(exercise=>exerciseIdentity(exercise)===exerciseId)
  .map(exercise=>Number(exercise.load))
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${Math.max(...values)} lb`:'—';
}

function armSupersetSessionCount(){
 return entries.filter(entry=>{
  const completedIds=new Set(entry.exercises.filter(exercise=>exercise.completed).map(exerciseIdentity));
  return completedIds.has('dumbbellCurl')&&completedIds.has('tricepsPressdown');
 }).length;
}

function bestNum(names,field,suffix){
 const accepted=Array.isArray(names)?names:[names];
 const values=entries.flatMap(entry=>entry.exercises)
  .filter(exercise=>accepted.includes(exercise.name))
  .map(exercise=>exercise[field])
  .filter(value=>value!==''&&value!=null)
  .map(Number)
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${Math.max(...values)}${suffix}`:'—';
}

function bestRep(name){
 const values=entries.flatMap(entry=>entry.exercises).filter(exercise=>exercise.name===name&&exercise.reps).flatMap(exercise=>String(exercise.reps).split(',').map(Number)).filter(Number.isFinite);
 return values.length?Math.max(...values):'—';
}

function bestTime(name){
 const values=entries.flatMap(entry=>entry.exercises).filter(exercise=>exercise.name===name&&exercise.times).flatMap(exercise=>String(exercise.times).split(',').map(value=>parseTime(value.trim()))).filter(value=>value>0);
 return values.length?fmtSec(Math.max(...values)):'—';
}

function summary(exercise){
 const parts=[];
 if(exercise.variation)parts.push(exercise.variation);
 if(exercise.runStage&&exercise.runStage!=='manual')parts.push(Number(exercise.runStage)===12?'two-mile phase':`run stage ${exercise.runStage}`);
 if(exercise.load){
  const total=totalLoadValue(exercise);
  if(exercise.type==='weighted'&&exercise.loadMode==='plates'){
   parts.push(`${formatLoad(total)} lb total (${formatLoad(exercise.load)} lb plates + ${formatLoad(numberOrNull(exercise.barWeight)||0)} lb bar)`);
  }else if(exercise.type==='weighted'&&exercise.loadMode==='total'){
   parts.push(`${formatLoad(total)} lb total`);
  }else parts.push(`${exercise.load}${exercise.type==='carry'?' lb/hand':' lb'}`);
 }
 if(exercise.sets)parts.push(`${exercise.sets} sets`);
 if(exercise.reps)parts.push(`reps ${exercise.reps}`);
 if(exercise.times)parts.push(`times ${exercise.times}`);
 if(exercise.runMinutes||exercise.walkMinutes)parts.push(`${exercise.walkMinutes||0} min walk / ${exercise.runMinutes||0} min run`);
 if(exercise.continuousMinutes)parts.push(`${exercise.continuousMinutes} min continuous`);
 if(exercise.completedRounds)parts.push(`${exercise.completedRounds}${exercise.rounds?`/${exercise.rounds}`:''} rounds completed`);
 else if(exercise.rounds)parts.push(`${exercise.rounds} rounds planned`);
 if(exercise.distance){
  const unit=['run','interval'].includes(exercise.type)?'mi':exercise.type==='carry'?'yd':exercise.outputUnit||'';
  parts.push(`${exercise.distance}${unit?` ${unit}`:''}`);
 }
 if(exercise.minutes)parts.push(`${exercise.minutes} min`);
 if(exercise.lungeLoad)parts.push(`lunges ${exercise.lungeLoad} lb total`);
 if(exercise.carryStyle)parts.push(exercise.carryStyle);
 if(exercise.carryLoad)parts.push(`carry/hold ${exercise.carryLoad} lb/hand`);
 if(exercise.carrySeconds)parts.push(`${exercise.carrySeconds} sec carry/hold`);
 if(exercise.stepHeight)parts.push(`${exercise.stepHeight}-in step`);
 if(exercise.modality)parts.push(exercise.modality);
 if(exercise.intervalSeconds)parts.push(`${exercise.intervalSeconds} sec hard interval`);
 if(exercise.avgHr)parts.push(`avg HR ${exercise.avgHr}`);
 if(exercise.maxHr)parts.push(`max HR ${exercise.maxHr}`);
 if(exercise.runPain!==''&&exercise.runPain!=null)parts.push(`run discomfort ${exercise.runPain}/10`);
 if(exercise.sledLoad)parts.push(`legacy sled ${exercise.sledLoad} lb`);
 if(exercise.totalTime)parts.push(`time ${exercise.totalTime}`);
 if(exercise.structure)parts.push(exercise.structure);
 if(exercise.rpe)parts.push(`RPE ${exercise.rpe}`);
 return parts.join(' · ')||(exercise.completed?'completed':exercise.prescription);
}

function filtered(){
 const from=$('exportFrom').value,through=$('exportTo').value;
 return entries.filter(entry=>(!from||entry.date>=from)&&(!through||entry.date<=through)).sort((a,b)=>a.date.localeCompare(b.date));
}

function buildMd(){
 const selected=filtered(),from=$('exportFrom').value,through=$('exportTo').value;
 const minutes=selected.reduce((total,entry)=>total+Number(entry.duration||0),0);
 const rpes=selected.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const averageRpe=rpes.length?(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1):'not recorded';
 const stage=getRunStage(runStage);
 let output=`# AFT Training Update\n\n**Period:** ${from?dateFmt(from):'Beginning'} through ${through?dateFmt(through):'Latest'}  \n**Completed sessions:** ${selected.length}  \n**Logged training time:** ${minutes?`${minutes} minutes`:'not recorded'}  \n**Average session RPE:** ${averageRpe}  \n**Current run progression:** ${stage.id===12?'Two-mile development phase':`Stage ${stage.id} — ${stage.label}`}\n\n`;
 if(!selected.length)return output+'No workouts were logged during this period.\n';
 output+='## Sessions\n\n';
 selected.forEach(entry=>{
  output+=`### ${dateFmt(entry.date)} — ${entry.dayLabel}\n`;
  const metadata=[];
  if(entry.duration)metadata.push(`${entry.duration} min`);
  if(entry.sessionRpe)metadata.push(`RPE ${entry.sessionRpe}/10`);
  if(entry.bodyWeight)metadata.push(`${entry.bodyWeight} lb`);
  if(entry.painScore!=='')metadata.push(`pain ${entry.painScore}/10`);
  if(metadata.length)output+=metadata.join(' · ')+'\n\n';
  entry.exercises.filter(exercise=>exercise.completed||hasData(exercise)).forEach(exercise=>output+=`- **${exercise.name}:** ${summary(exercise)}\n`);
  if(entry.notes)output+=`\nNotes: ${entry.notes}\n`;
  output+='\n';
 });
 return output+'## Coaching request\n\nReview this training block, identify the main strength and conditioning trends, and update my next four-day training block while keeping the November Army fitness goal in mind.\n';
}

function updatePreview(){$('markdownPreview').value=buildMd()}

async function copyMd(){
 const textValue=buildMd();
 $('markdownPreview').value=textValue;
 try{await navigator.clipboard.writeText(textValue)}catch{$('markdownPreview').select();document.execCommand('copy')}
 toast('Chat update copied');
}

function exportJson(){
 download(JSON.stringify({app:'AFT Workout Tracker',version:5,exportedAt:new Date().toISOString(),runStage,entries},null,2),`aft-workout-backup-${today()}.json`,'application/json');
}

function exportCsv(){
 const rows=[['date','day','duration_minutes','session_rpe','body_weight_lb','pain_score','exercise_id','exercise','variation','entered_load','load_entry_mode','bar_weight','total_load','run_stage','run_rpe','run_discomfort','run_walk_rounds_planned','run_walk_rounds_completed','completed','details','exercise_notes','session_notes']];
 entries.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(entry=>entry.exercises.forEach(exercise=>rows.push([entry.date,entry.dayLabel,entry.duration,entry.sessionRpe,entry.bodyWeight,entry.painScore,exerciseIdentity(exercise),exercise.name,exercise.variation||'',exercise.load||'',exercise.loadMode||'',exercise.barWeight||'',totalLoadValue(exercise)??'',exercise.runStage||'',['run','interval'].includes(exercise.type)?exercise.rpe||'':'',['run','interval'].includes(exercise.type)?exercise.runPain||'':'',['run','interval'].includes(exercise.type)?exercise.rounds||'':'',['run','interval'].includes(exercise.type)?exercise.completedRounds||'':'',exercise.completed?'yes':'no',summary(exercise),exercise.notes||'',entry.notes||''])));
 download(rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n'),`aft-workouts-${today()}.csv`,'text/csv');
}

async function importJson(event){
 const file=event.target.files?.[0];
 if(!file)return;
 try{
  const parsed=JSON.parse(await file.text()),incoming=Array.isArray(parsed)?parsed:parsed.entries;
  if(!Array.isArray(incoming))throw 0;
  const clean=incoming.map(normalizeEntry);
  if(clean.some(entry=>!entry))throw 0;
  if(!confirm(`Import ${clean.length} workouts? Matching IDs will be replaced.`))return;
  const merged=new Map(entries.map(entry=>[entry.id,entry]));
  clean.forEach(entry=>merged.set(entry.id,entry));
  entries=[...merged.values()].sort(compareEntries);
  if(!Array.isArray(parsed)&&RUN_STAGES.some(stage=>stage.id===Number(parsed.runStage))){
   runStage=Number(parsed.runStage);
   persistRunStage();
  }
  persist();
  renderRunProgress($('daySelect').value);
  renderHistory();
  renderProgress();
  updatePreview();
  toast('Backup imported');
 }catch{
  alert('That file is not a valid AFT Workout Tracker backup.');
 }finally{
  event.target.value='';
 }
}

function download(content,name,type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;
 anchor.download=name;
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function normalizeExercise(exercise){
 if(!exercise||typeof exercise!=='object')return null;
 const normalized={...exercise};
 if(normalized.name==='Trap-bar deadlift'&&!normalized.variation)normalized.variation='Trap / hex bar';
 return normalized;
}

function normalizeEntry(entry){
 if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id||typeof entry.date!=='string'||!entry.date||!days[entry.dayKey])return null;
 return {
  ...entry,
  dayLabel:typeof entry.dayLabel==='string'&&entry.dayLabel?entry.dayLabel:days[entry.dayKey].label,
  duration:entry.duration??'',
  sessionRpe:entry.sessionRpe??'',
  bodyWeight:entry.bodyWeight??'',
  painScore:entry.painScore??'',
  notes:entry.notes??'',
  updatedAt:typeof entry.updatedAt==='string'&&entry.updatedAt?entry.updatedAt:`${entry.date}T12:00:00.000Z`,
  exercises:Array.isArray(entry.exercises)?entry.exercises.map(normalizeExercise).filter(Boolean):[]
 };
}

function load(){
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(parsed)?parsed.map(normalizeEntry).filter(Boolean).sort(compareEntries):[];
 }catch{return[]}
}

function loadRunStage(){
 try{
  const value=Number(localStorage.getItem(RUN_STAGE_KEY)||1);
  return RUN_STAGES.some(stage=>stage.id===value)?value:1;
 }catch{return 1}
}

function persist(){localStorage.setItem(KEY,JSON.stringify(entries))}
function persistRunStage(){localStorage.setItem(RUN_STAGE_KEY,String(runStage))}

function hasData(exercise){
 if(['run','interval'].includes(exercise.type)&&!exercise.completed){
  return ['completedRounds','distance','totalTime','avgHr','maxHr','rpe','runPain','notes'].some(field=>exercise[field]);
 }
 const ignored=['exerciseId','templateId','name','prescription','type','completed','variation','loadMode','barWeight','totalLoad','runStage','runTarget'];
 if(['weighted','body','timed','carry'].includes(exercise.type))ignored.push('sets');
 return Object.entries(exercise).some(([key,value])=>!ignored.includes(key)&&value);
}

function setExportDates(){
 const end=new Date(),start=new Date(end);
 start.setDate(end.getDate()-30);
 $('exportFrom').value=iso(start);
 $('exportTo').value=today();
}

function today(){return iso(new Date())}
function iso(date){
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,'0');
 const day=String(date.getDate()).padStart(2,'0');
 return `${year}-${month}-${day}`;
}
function dateFmt(value){return new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
function parseTime(value){const parts=value.split(':').map(Number);return parts.length===2?parts[0]*60+parts[1]:Number(value)}
function fmtSec(seconds){return `${Math.floor(seconds/60)}:${Math.round(seconds%60).toString().padStart(2,'0')}`}
function id(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}

let toastTimer;
function toast(message){
 const element=$('toast');
 element.textContent=message;
 element.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>element.classList.remove('show'),2200);
}
