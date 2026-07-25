const KEY='aftWorkoutEntries.v1';
const RUN_STAGE_KEY='aftRunStage.v1';

const RUN_STAGES=[
 {id:1,label:'1:00 run / 1:00 walk × 10',runMinutes:'1',walkMinutes:'1',rounds:'10'},
 {id:2,label:'1:30 run / 1:00 walk × 8',runMinutes:'1.5',walkMinutes:'1',rounds:'8'},
 {id:3,label:'2:00 run / 1:00 walk × 7',runMinutes:'2',walkMinutes:'1',rounds:'7'},
 {id:4,label:'3:00 run / 1:00 walk × 6',runMinutes:'3',walkMinutes:'1',rounds:'6'},
 {id:5,label:'4:00 run / 1:00 walk × 5',runMinutes:'4',walkMinutes:'1',rounds:'5'},
 {id:6,label:'5:00 run / 1:00 walk × 5',runMinutes:'5',walkMinutes:'1',rounds:'5'},
 {id:7,label:'8:00 run / 1:00 walk × 3',runMinutes:'8',walkMinutes:'1',rounds:'3'},
 {id:8,label:'10:00 run / 1:00 walk × 3',runMinutes:'10',walkMinutes:'1',rounds:'3'},
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

const days={
 day1:{label:'Day 1 — Deadlift + Intervals',focus:'Primary strength day plus progressive run/walk conditioning.',ex:[
  ['Deadlift','3 × 5','weighted','lb',{variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',progression:'Track each bar type separately. When 3 × 5 is clean around RPE 7 or lower, add 5–10 lb next time; otherwise repeat the load.'}],
  ['Squat or leg press','3 × 8–10','weighted','lb',{variations:['Goblet squat','Leg press'],defaultVariation:'Goblet squat'}],
  ['Horizontal press','3 × 8–10','weighted','lb per hand',{variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press'}],
  ['Seated row','3 × 10','weighted','lb',{variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'}],
  ['Loaded carry or hold','4 × 30–40 yd or 30–45 sec','carry','lb per hand',{variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry'}],
  ['Plank','3 × 30–60 sec','timed'],
  ['Run / walk intervals','Follow the current run progression stage','interval']
 ]},
 day2:{label:'Day 2 — Upper + Easy Cardio',focus:'Upper-body muscular endurance and low-impact aerobic development.',ex:[
  ['Hand-release push-ups','5 submaximal sets','body'],
  ['Vertical pull','3 × 8–12','weighted','lb',{variations:['Lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Lat pulldown'}],
  ['Overhead press','3 × 8–10','weighted','lb per hand',{variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'}],
  ['Chest-supported row','3 × 10','weighted','lb',{variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Dumbbell row'}],
  ['Lunge pattern','3 × 8 each leg','weighted','lb total',{variations:['Walking lunge','Reverse lunge','Stationary split squat'],defaultVariation:'Walking lunge'}],
  ['Trunk stability','3 × 10 each side','body',{variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug'}],
  ['Easy cardio','25–35 min conversational effort','cardio']
 ]},
 day3:{label:'Day 3 — Lower Strength + Gym Conditioning',focus:'Build lower-body strength, grip, lateral stability, and repeat-effort conditioning with standard commercial-gym equipment.',ex:[
  ['Squat pattern','3 × 6–8','weighted','lb',{variations:['Goblet squat','Front squat','Hack squat','Leg press'],defaultVariation:'Goblet squat'}],
  ['Romanian deadlift','3 × 8','weighted','lb',{variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell'}],
  ['Incline press','3 × 8–10','weighted','lb per hand',{variations:['Incline dumbbell press','Incline chest-press machine'],defaultVariation:'Incline dumbbell press'}],
  ['One-arm row','3 × 10 each side','weighted','lb',{variations:['One-arm dumbbell row','One-arm cable row'],defaultVariation:'One-arm dumbbell row'}],
  ['Single-leg strength','3 × 8 each leg','weighted','lb total',{variations:['Split squat','Forward step-up','Lateral step-up'],defaultVariation:'Split squat'}],
  ['Side plank','3 × 20–45 sec each side','timed'],
  ['Gym conditioning circuit','3 rounds: reverse lunges, carry or hold, lateral step-ups, 45–60 sec hard cardio, then 2–3 min rest','circuit']
 ]},
 day4:{label:'Day 4 — Run + Calisthenics',focus:'Build continuous running capacity, then finish with test-relevant calisthenics.',ex:[
  ['Primary run','Follow the current run/walk, continuous-run, or two-mile-development stage','run'],
  ['Hand-release push-ups','4 easy-to-moderate sets','body'],
  ['Plank','3 working sets','timed'],
  ['Air squats','2 × 15','body'],
  ['Mobility','5–10 min','timed']
 ]}
};

let entries=load(),editing=null,installPrompt=null,runStage=loadRunStage();
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const attr=s=>esc(s).replaceAll('\n',' ');

document.addEventListener('DOMContentLoaded',init);

function init(){
 Object.entries(days).forEach(([key,day])=>$('daySelect').insertAdjacentHTML('beforeend',`<option value="${key}">${esc(day.label)}</option>`));
 $('sessionDate').value=today();
 setExportDates();
 bind();
 renderWorkout();
 renderHistory();
 renderProgress();
 updatePreview();
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}

function bind(){
 $('daySelect').onchange=()=>{editing=null;renderWorkout()};
 document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>tab(button.dataset.tab));
 $('workoutForm').onsubmit=saveWorkout;
 $('clearFormButton').onclick=clearForm;
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

function renderWorkout(saved=null){
 const key=saved?.dayKey||$('daySelect').value||'day1';
 const day=days[key];
 $('daySelect').value=key;
 const parts=day.label.split('—');
 $('workoutSummary').innerHTML=`<p class="eyebrow">${esc(parts[0].trim())}</p><h2>${esc(parts.slice(1).join('—').trim())}</h2><p>${esc(day.focus)}</p>`;
 renderRunProgress(key);
 $('exerciseList').innerHTML=day.ex.map((exercise,index)=>{
  const state=saved?.exercises?.[index]||defaultExerciseState(exercise,key);
  return exerciseCard(exercise,index,state);
 }).join('');
 document.querySelectorAll('.exercise-complete').forEach(input=>input.onchange=()=>input.closest('.exercise-card').classList.toggle('completed',input.checked));
 bindSetControls();
 document.querySelectorAll('[data-field="runStage"]').forEach(selectInput=>selectInput.onchange=()=>{
  const stage=Number(selectInput.value);
  if(stage)applyRunStageDefaults(selectInput.closest('.exercise-card'),stage,key);
 });
 $('sessionDate').value=saved?.date||$('sessionDate').value||today();
 $('duration').value=saved?.duration||'';
 $('sessionRpe').value=saved?.sessionRpe||'';
 $('bodyWeight').value=saved?.bodyWeight||'';
 $('painScore').value=saved?.painScore??'';
 $('sessionNotes').value=saved?.notes||'';
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
 return `<section class="card exercise-card ${state.completed?'completed':''}" data-i="${index}">
  <div class="exercise-heading">
   <div><h2>${esc(name)}</h2><p>${esc(prescription)}</p></div>
   <label class="check-label"><input class="exercise-complete" type="checkbox" ${state.completed?'checked':''}>Done</label>
  </div>
  ${variation}${fields(type,unit,state,setPlan)}
  <label>Exercise notes<input data-field="notes" value="${attr(state.notes)}" placeholder="Technique, pain, substitutions..."></label>
  <details class="progression-help"><summary>Progression guidance</summary><p>${esc(guidance)}</p></details>
 </section>`;
}

function fields(type,unit,state,setPlan){
 if(type==='weighted')return grid(num('load',`Load (${unit})`,state.load),setCountSelect(state.sets,setPlan),num('rpe','Exercise RPE',state.rpe,1,10))+setRepLogger(state,setPlan,type);
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
  num('rounds','Rounds',state.rounds),
  num('continuousMinutes','Continuous run (min)',state.continuousMinutes),
  num('distance','Total distance (mi)',state.distance,0,null,.01),
  text('totalTime','Total time',state.totalTime,'28:45')
 ];
 if(type==='run')common.push(num('avgHr','Average HR',state.avgHr),num('maxHr','Max HR',state.maxHr));
 return grid(...common)+`<label>Run structure / splits<input data-field="structure" value="${attr(state.structure)}" placeholder="Use the stage target or enter a manual structure"></label>`;
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
  const successes=runStageSuccessCount(stage.id);
  $('runStageStatus').textContent=successes>=2
   ?'Two controlled completions are logged. Advance when recovery and form still feel good.'
   :`${successes} of 2 controlled completions logged. Repeat this stage before advancing.`;
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
  applyRunStageDefaults(selectInput.closest('.exercise-card'),runStage,key);
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
  const exercise={name:definition[0],prescription:definition[1],type:definition[2],completed:card.querySelector('.exercise-complete').checked};
  card.querySelectorAll('[data-field]').forEach(input=>exercise[input.dataset.field]=input.value.trim());
  if(card.querySelector('.set-rep-grid')){
   const reps=readRepValues(card);
   while(reps.at(-1)==='')reps.pop();
   exercise.reps=reps.join(', ');
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
 index>=0?entries[index]=item:entries.push(item);
 entries.sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt));
 persist();
 editing=null;
 renderWorkout();
 renderHistory();
 renderProgress();
 updatePreview();
 const runExercise=exercises.find(exercise=>exercise.completed&&['interval','run'].includes(exercise.type)&&Number(exercise.runStage));
 if(runExercise&&Number(runExercise.runStage)===runStage&&runStage<12){
  const successes=runStageSuccessCount(runStage);
  const suffix=successes>=2?'run stage ready to advance':`${successes}/2 controlled run completions`;
  toast(`${index>=0?'Workout updated':'Workout saved'} · ${suffix}`);
 }else toast(index>=0?'Workout updated':'Workout saved');
}

function clearForm(){
 editing=null;
 $('sessionDate').value=today();
 renderWorkout();
 toast('Form cleared');
}

function renderHistory(){
 const container=$('historyList');
 if(!entries.length){container.innerHTML='<div class="empty-state">No workouts saved yet.</div>';return}
 container.innerHTML=entries.map(entry=>{
  const done=entry.exercises.filter(exercise=>exercise.completed).slice(0,4).map(exercise=>`<li><strong>${esc(exercise.name)}:</strong> ${esc(summary(exercise))}</li>`).join('');
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
 const stageProgress=stage.id===12?'Base complete':`${Math.min(runStageSuccessCount(stage.id),2)}/2`;
 const cards=[
  ['Sessions',entries.length],
  ['Training time',minutes?`${minutes} min`:'—'],
  ['Latest weight',weight==='—'?'—':`${weight} lb`],
  ['Avg. session RPE',averageRpe],
  ['Current run stage',stage.id===12?'Two-mile phase':`Stage ${stage.id}`],
  ['Run-stage progress',stageProgress],
  ['Best hex-bar deadlift',bestDeadlift(['Trap / hex bar'])],
  ['Best straight-bar deadlift',bestDeadlift(['Conventional barbell','Sumo barbell'])],
  ['Longest logged run',bestNum(['Primary run','Run / walk intervals'],'distance',' mi')],
  ['Best push-up set',bestRep('Hand-release push-ups')],
  ['Longest plank',bestTime('Plank')]
 ];
 $('progressCards').innerHTML=cards.map(([label,value])=>`<article class="metric"><div class="label">${esc(label)}</div><div class="value">${esc(value||'—')}</div></article>`).join('');
 const recent=entries.slice(0,8);
 $('recentProgress').innerHTML=recent.length?recent.map(entry=>`<p><strong>${dateFmt(entry.date)}</strong> — ${esc(entry.dayLabel)}${entry.sessionRpe?`, RPE ${esc(entry.sessionRpe)}`:''}${entry.painScore!==''&&entry.painScore!=null?`, pain ${esc(entry.painScore)}/10`:''}</p>`).join(''):'<div class="empty-state">Progress will appear after the first saved workout.</div>';
}

function runStageSuccessCount(stageId){
 return entries.filter(entry=>{
  if(entry.sessionRpe===''||entry.painScore==='')return false;
  const rpe=Number(entry.sessionRpe),pain=Number(entry.painScore);
  if(!Number.isFinite(rpe)||!Number.isFinite(pain)||rpe>6||pain>2)return false;
  return entry.exercises.some(exercise=>exercise.completed&&Number(exercise.runStage)===Number(stageId)&&['interval','run'].includes(exercise.type));
 }).length;
}

function bestDeadlift(variations){
 const values=entries.flatMap(entry=>entry.exercises)
  .filter(exercise=>['Deadlift','Trap-bar deadlift'].includes(exercise.name)&&variations.includes(exercise.variation))
  .map(exercise=>exercise.load)
  .filter(value=>value!==''&&value!=null)
  .map(Number)
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${Math.max(...values)} lb`:'—';
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
 if(exercise.load)parts.push(`${exercise.load}${exercise.type==='carry'?' lb/hand':' lb'}`);
 if(exercise.sets)parts.push(`${exercise.sets} sets`);
 if(exercise.reps)parts.push(`reps ${exercise.reps}`);
 if(exercise.times)parts.push(`times ${exercise.times}`);
 if(exercise.runMinutes||exercise.walkMinutes)parts.push(`${exercise.runMinutes||0} min run / ${exercise.walkMinutes||0} min walk`);
 if(exercise.continuousMinutes)parts.push(`${exercise.continuousMinutes} min continuous`);
 if(exercise.rounds)parts.push(`${exercise.rounds} rounds`);
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
 download(JSON.stringify({app:'AFT Workout Tracker',version:2,exportedAt:new Date().toISOString(),runStage,entries},null,2),`aft-workout-backup-${today()}.json`,'application/json');
}

function exportCsv(){
 const rows=[['date','day','duration_minutes','session_rpe','body_weight_lb','pain_score','exercise','variation','run_stage','completed','details','exercise_notes','session_notes']];
 entries.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(entry=>entry.exercises.forEach(exercise=>rows.push([entry.date,entry.dayLabel,entry.duration,entry.sessionRpe,entry.bodyWeight,entry.painScore,exercise.name,exercise.variation||'',exercise.runStage||'',exercise.completed?'yes':'no',summary(exercise),exercise.notes||'',entry.notes||''])));
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
  entries=[...merged.values()].sort((a,b)=>b.date.localeCompare(a.date));
  if(!Array.isArray(parsed)&&RUN_STAGES.some(stage=>stage.id===Number(parsed.runStage))){
   runStage=Number(parsed.runStage);
   persistRunStage();
  }
  persist();
  renderWorkout();
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
  return Array.isArray(parsed)?parsed.map(normalizeEntry).filter(Boolean):[];
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
  return ['distance','totalTime','avgHr','maxHr','notes'].some(field=>exercise[field]);
 }
 const ignored=['name','prescription','type','completed','variation','runStage','runTarget'];
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
function iso(date){return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10)}
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
