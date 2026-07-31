const PROGRAM=window.AFT_PROGRAM_CONFIG;
const RUN_STAGES=PROGRAM.runStages;
const SESSIONS=PROGRAM.sessions;
const ROTATION=PROGRAM.rotation;

const KEY='aftWorkoutEntries.v1';
const DRAFT_KEY='aftWorkoutDraft.v1';
const SNAPSHOT_KEY='aftWorkoutSnapshots.v1';
const TIMER_KEY='aftSessionTimer.v1';
const BACKUP_META_KEY='aftBackupMeta.v1';
const DATA_VERSION_KEY='aftDataVersion.v1';
const DATA_VERSION=7;
const MAX_SNAPSHOTS=5;

const EXERCISE_NAME_IDS={
 'Deadlift':'deadlift','Trap-bar deadlift':'deadlift',
 'Squat or leg press':'squatOrLegPress','Goblet squat or leg press':'squatOrLegPress','Leg press':'squatOrLegPress',
 'Horizontal press':'horizontalPress','Dumbbell bench press':'horizontalPress',
 'Seated row':'seatedRow','Seated cable row':'seatedRow',
 'Loaded carry or hold':'loadedCarry','Farmer carry':'loadedCarry',
 'Plank':'plank','Front plank':'plank',
 'Run / walk intervals':'runWalkIntervals','Walk / run intervals':'runWalkIntervals',
 'Dumbbell curls':'dumbbellCurl','Cable triceps pressdowns':'tricepsPressdown',
 'Hand-release push-ups':'handReleasePushups',
 'Vertical pull':'verticalPull','Lat pulldown or assisted pull-up':'verticalPull','Lat pulldown':'verticalPull',
 'Overhead press':'overheadPress','Dumbbell overhead press':'overheadPress','Seated dumbbell overhead press':'overheadPress',
 'Dumbbell lateral raises':'lateralRaise',
 'Chest-supported row':'chestSupportedRow','Chest-supported or machine row':'chestSupportedRow',
 'Lunge pattern':'lungePattern','Walking lunges':'lungePattern',
 'Trunk stability':'trunkStability','Dead bug or Pallof press':'trunkStability',
 'Easy cardio':'easyCardio',
 'Squat pattern':'squatPattern','Goblet squat, front squat, hack squat, or leg press':'squatPattern','Goblet squat':'squatPattern',
 'Romanian deadlift':'romanianDeadlift',
 'Incline press':'inclinePress','Incline dumbbell press':'inclinePress',
 'One-arm row':'oneArmRow','One-arm dumbbell row':'oneArmRow',
 'Single-leg strength':'singleLegStrength','Split squat or step-up':'singleLegStrength','Split squat':'singleLegStrength',
 'Side plank':'sidePlank','Gym conditioning circuit':'gymConditioningCircuit',
 'Primary run':'primaryRun','Mobility':'mobility',
 'Easy stationary bike or walk':'recoveryCardio','Gentle mobility':'recoveryMobility'
};

let entries=[];
let editing=null;
let activeSessionDefinition=null;
let activeProgramContext=null;
let activeSavedExercises=[];
let installPrompt=null;
let runTimerState=null;
let runTimerTick=null;
let runTimerWakeLock=null;
let runTimerAudioContext=null;
let sessionTimerState={elapsedMs:0,running:false,startedAt:null};
let sessionTimerTick=null;
let draftTimer=null;
let suppressDraft=false;

const $=id=>document.getElementById(id);
const clone=value=>JSON.parse(JSON.stringify(value));
const esc=value=>String(value??'').replace(/[&<>"']/g,character=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[character]));
const attr=value=>esc(value).replaceAll('\n',' ');

if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);

function init(){
 ensureMigrationSnapshot();
 entries=loadEntries();
 populateSessionSelect();
 setExportDates();
 bind();
 const draft=loadDraft();
 if(draft?.item){
  editing=draft.editingId&&entries.some(entry=>entry.id===draft.editingId)?draft.editingId:null;
  renderWorkout(draft.item);
  restoreSessionTimer();
  toast(`Recovered autosaved workout from ${timeFmt(draft.savedAt)}`);
 }else{
  newWorkout(false);
 }
 renderHistory();
 renderProgress();
 updatePreview();
 renderStorageStatus();
 registerServiceWorker();
}

function populateSessionSelect(){
 $('daySelect').innerHTML='';
 [...ROTATION,'recovery'].forEach(key=>{
  const session=SESSIONS[key];
  const suffix=session.optional?' — Optional':'';
  $('daySelect').insertAdjacentHTML('beforeend',`<option value="${key}">${esc(session.label+suffix)}</option>`);
 });
}

function bind(){
 $('daySelect').onchange=()=>{
  editing=null;
  renderWorkout(null,{preserveSession:true});
  scheduleDraft();
 };
 document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>tab(button.dataset.tab));
 $('workoutForm').onsubmit=saveWorkout;
 $('workoutForm').oninput=event=>{
  if(event.target.id==='painDuring')updatePainVisibility();
  scheduleDraft();
 };
 $('workoutForm').onchange=()=>scheduleDraft();
 $('sessionDate').onchange=()=>scheduleDraft();
 $('newWorkoutButton').onclick=()=>newWorkout();
 $('reloadUpdateButton').onclick=()=>{
  saveDraftNow();
  location.reload();
 };
 $('deleteAllButton').onclick=deleteAll;
 $('copyMarkdownButton').onclick=copyMd;
 $('downloadMarkdownButton').onclick=()=>download(buildMd(),`aft-training-update-${today()}.md`,'text/markdown');
 $('downloadJsonButton').onclick=exportJson;
 $('downloadCsvButton').onclick=exportCsv;
 $('importJsonInput').onchange=importJson;
 $('exportFrom').onchange=updatePreview;
 $('exportTo').onchange=updatePreview;
 $('restoreSnapshotButton').onclick=restoreLatestSnapshot;
 $('protectStorageButton').onclick=requestStorageProtection;
 $('startSessionTimerButton').onclick=startSessionTimer;
 $('pauseSessionTimerButton').onclick=pauseSessionTimer;
 $('finishSessionTimerButton').onclick=finishAndSaveSession;
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  $('installButton').classList.remove('hidden');
 });
 $('installButton').onclick=async()=>{
  if(!installPrompt)return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt=null;
  $('installButton').classList.add('hidden');
 };
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&runTimerState?.running)requestRunTimerWakeLock();
  if(document.visibilityState==='hidden'){
   saveDraftNow();
   persistSessionTimer();
  }
 });
 window.addEventListener('pagehide',()=>{
  saveDraftNow();
  persistSessionTimer();
 });
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
 if(name==='export'){
  updatePreview();
  renderStorageStatus();
 }
 scrollTo({top:0,behavior:'smooth'});
}

function currentProgramMeta(){
 return {
  id:PROGRAM.id,
  name:PROGRAM.name,
  version:PROGRAM.version,
  effectiveDate:PROGRAM.effectiveDate,
  runStage:PROGRAM.currentRunStage
 };
}

function currentSessionDefinition(key){
 return clone(SESSIONS[key]||SESSIONS.day1);
}

function snapshotSession(definition){
 return {
  sessionKey:definition.key,
  sessionType:definition.sessionType,
  label:definition.label,
  focus:definition.focus,
  warmup:definition.warmup,
  targetSessionRpe:definition.targetSessionRpe,
  optional:Boolean(definition.optional),
  exercises:clone(definition.exercises)
 };
}

function definitionForSavedEntry(entry){
 const snapshot=entry?.prescriptionSnapshot;
 if(snapshot&&Array.isArray(snapshot.exercises)){
  return {
   key:snapshot.sessionKey||entry.dayKey,
   sessionType:snapshot.sessionType||entry.sessionType||'primary',
   label:snapshot.label||entry.dayLabel,
   focus:snapshot.focus||'Saved prescription',
   warmup:snapshot.warmup||'',
   targetSessionRpe:snapshot.targetSessionRpe||entry.targetSessionRpe||'',
   optional:Boolean(snapshot.optional),
   exercises:clone(snapshot.exercises)
  };
 }
 const current=SESSIONS[entry.dayKey];
 const savedExercises=Array.isArray(entry.exercises)?entry.exercises:[];
 const exercises=savedExercises.map((saved,index)=>{
  const savedId=exerciseIdentity(saved);
  const matched=current?.exercises?.find(exercise=>exercise.id===savedId)
   ||current?.exercises?.find(exercise=>exercise.name===saved.name);
  const template=matched||(!savedId?current?.exercises?.[index]:null)||{};
  return {
   ...clone(template),
   id:savedId||template.id||`legacy-${index}`,
   name:saved.name||template.name||`Exercise ${index+1}`,
   prescription:saved.prescription||template.prescription||'Legacy saved prescription',
   type:saved.type||template.type||'body',
   unit:saved.unit||template.unit,
   ...(saved.variation&&!template.variations?{variations:[saved.variation],defaultVariation:saved.variation}:{})
  };
 });
 return {
  key:entry.dayKey,
  sessionType:entry.sessionType||'primary',
  label:entry.dayLabel||current?.label||'Saved workout',
  focus:'Historical workout using its saved exercise list.',
  warmup:'',
  targetSessionRpe:entry.targetSessionRpe||'',
  optional:entry.sessionType==='recovery',
  exercises
 };
}

function renderWorkout(saved=null,{preserveSession=false}={}){
 suppressDraft=true;
 const key=saved?.dayKey||$('daySelect').value||'day1';
 activeSessionDefinition=saved?definitionForSavedEntry(saved):currentSessionDefinition(key);
 activeProgramContext=saved?{
  id:saved.programId||'',
  name:saved.programName||'',
  version:saved.programVersion||'',
  effectiveDate:saved.programEffectiveDate||'',
  runStage:saved.activeRunStage??saved.prescriptionSnapshot?.exercises?.find(exercise=>['interval','run'].includes(exercise.type))?.runStage??''
 }:currentProgramMeta();
 activeSavedExercises=Array.isArray(saved?.exercises)?clone(saved.exercises):[];
 $('daySelect').value=key;
 const session=activeSessionDefinition;
 const parts=session.label.split('—');
 const programLine=saved
  ?(saved.programName&&saved.programVersion?`${saved.programName} · v${saved.programVersion}`:'Legacy saved workout')
  :`${PROGRAM.name} · v${PROGRAM.version} · effective ${dateFmt(PROGRAM.effectiveDate)}`;
 $('workoutSummary').innerHTML=`
  <p class="eyebrow">${esc(parts[0].trim())}${session.optional?' · OPTIONAL':''}</p>
  <h2>${esc(parts.slice(1).join('—').trim()||session.label)}</h2>
  <p>${esc(session.focus)}</p>
  <p class="program-line">${esc(programLine)}${session.targetSessionRpe?` · target session RPE ${esc(session.targetSessionRpe)}`:''}</p>
  ${session.warmup?`<p class="workout-warmup"><strong>Warm-up before Exercise 1:</strong> ${esc(session.warmup)}</p>`:''}`;
 renderRunProgress(key);
 clearRunTimer();
 $('exerciseList').innerHTML=renderExerciseList(session,saved);
 bindExerciseControls();
 if(saved){
  $('sessionDate').value=saved.date;
  $('duration').value=saved.duration||'';
  $('sessionRpe').value=saved.sessionRpe||'';
  $('bodyWeight').value=saved.bodyWeight||'';
  $('preSoreness').value=saved.preSoreness??'';
  $('readiness').value=saved.readiness??'';
  $('painDuring').value=saved.painDuring??'';
  $('painLocation').value=saved.painLocation||'';
  $('postSoreness').value=saved.postSoreness??'';
  $('legacyPainScore').value=saved.painScore??'';
  $('sessionNotes').value=saved.notes||saved.postSessionNotes||'';
 }else{
  if(!$('sessionDate').value)$('sessionDate').value=today();
  if(!preserveSession)clearSessionFields();
 }
 const recovery=session.sessionType==='recovery';
 $('postSorenessWrap').classList.toggle('hidden',!recovery);
 const hasLegacyPain=saved?.painScore!==''&&saved?.painScore!=null&&(saved?.painDuring==null||saved?.painDuring==='');
 $('legacyPainWrap').classList.toggle('hidden',!hasLegacyPain);
 updatePainVisibility();
 updateSessionTimer();
 suppressDraft=false;
}

function clearSessionFields(){
 ['duration','sessionRpe','bodyWeight','preSoreness','readiness','painDuring','painLocation','postSoreness','legacyPainScore','sessionNotes']
  .forEach(id=>$(id).value='');
}

function updatePainVisibility(){
 const hasPain=Number($('painDuring').value)>0;
 $('painLocationWrap').classList.toggle('hidden',!hasPain);
}

function renderExerciseList(session,saved){
 const savedExercises=Array.isArray(saved?.exercises)?saved.exercises:[];
 let html='',openGroup=null,visibleIndex=0;
 session.exercises.forEach((definition,index)=>{
  const groupKey=definition.group||null;
  if(groupKey!==openGroup){
   if(openGroup)html+='</div></section>';
   openGroup=groupKey;
   if(groupKey){
    const group=PROGRAM.groups[groupKey]||{};
    html+=`<section class="exercise-group" aria-label="${attr(group.label||groupKey)}">
     <div class="exercise-group-heading">
      <p class="eyebrow">${esc(group.eyebrow||'TRAINING BLOCK')}</p>
      <h2>${esc(group.label||groupKey)}</h2>
      <p>${esc(group.instruction||'')}</p>
     </div><div class="exercise-group-cards">`;
   }
  }
  const state=findSavedExercise(definition,savedExercises,index)||defaultExerciseState(definition);
  html+=exerciseCard(definition,visibleIndex,state,{showPrevious:!saved});
  visibleIndex+=1;
 });
 if(openGroup)html+='</div></section>';
 return html;
}

function findSavedExercise(definition,savedExercises,index){
 const byId=savedExercises.find(exercise=>exerciseIdentity(exercise)===definition.id);
 if(byId)return byId;
 const byName=savedExercises.find(exercise=>exercise.name===definition.name);
 if(byName)return byName;
 const positional=savedExercises[index];
 return positional&&!exerciseIdentity(positional)?positional:null;
}

function exerciseIdentity(exercise){
 return exercise?.exerciseId||exercise?.templateId||exercise?.id||EXERCISE_NAME_IDS[exercise?.name]||exercise?.name||'';
}

function defaultExerciseState(definition){
 const state={};
 if(definition.defaultVariation)state.variation=definition.defaultVariation;
 if(definition.prescribedLoad!=null)state.load=String(definition.prescribedLoad);
 if(definition.defaults)Object.assign(state,clone(definition.defaults));
 if(definition.type==='interval'||definition.type==='run'){
  const stageId=definition.runStage||PROGRAM.currentRunStage;
  Object.assign(state,runDefaults(stageId),{runStage:String(stageId)});
 }
 return state;
}

function exerciseCard(definition,index,state,{showPrevious=false}={}){
 const setPlan=getSetPlan(definition);
 const variation=definition.variations
  ?grid(select('variation','Variation / equipment',state.variation||definition.defaultVariation||'',definition.variations))
  :'';
 const previous=showPrevious?previousResult(definition,state.variation||definition.defaultVariation):null;
 return `<section class="card exercise-card ${state.completed?'completed':''}" data-i="${index}" data-exercise-id="${attr(definition.id)}">
  <div class="exercise-heading">
   <div>
    <p class="exercise-order">Exercise ${index+1}</p>
    <h2>${esc(definition.name)}</h2>
    <p>${esc(definition.prescription)}</p>
   </div>
   <label class="check-label"><input class="exercise-complete" type="checkbox" ${state.completed?'checked':''}>Done</label>
  </div>
  ${definition.targetRpe?`<p class="target-rpe">Target RPE ${esc(definition.targetRpe)}</p>`:''}
  ${definition.coachingNotes?`<p class="coaching-note">${esc(definition.coachingNotes)}</p>`:''}
  ${previous?`<div class="previous-result"><strong>Last session:</strong> ${esc(previous)}</div>`:''}
  ${variation}${fields(definition,state,setPlan)}
  <label>Exercise notes<textarea data-field="notes" rows="3" placeholder="Technique, pain, substitutions...">${esc(state.notes)}</textarea></label>
 </section>`;
}

function fields(definition,state,setPlan){
 const {type,unit}=definition;
 if(type==='weighted')return weightedFields(definition,state,setPlan);
 if(type==='body')return grid(setCountSelect(state.sets,setPlan),num('rpe','Exercise RPE',state.rpe,1,10))+setRepLogger(state,setPlan,type);
 if(type==='timed')return setPlan
  ?grid(setCountSelect(state.sets,setPlan),num('rpe','Exercise RPE',state.rpe,1,10))+timedSetLogger(state,setPlan,definition)
  :grid(text('times','Duration',state.times,'8:00'),num('rpe','Exercise RPE',state.rpe,1,10));
 if(type==='carry')return grid(
  num('load',`Load (${unit})`,state.load),setCountSelect(state.sets,setPlan,'Trips / holds'),
  num('distance','Distance / trip (yd)',state.distance),num('carrySeconds','Hold duration (sec)',state.carrySeconds),
  num('rpe','Exercise RPE',state.rpe,1,10)
 );
 if(type==='interval'||type==='run')return runFields(type,state);
 if(type==='cardio')return grid(
  select('modality','Modality',state.modality,definition.modalities||['Incline walk','Bike','Elliptical','Rower','Other']),
  num('minutes','Minutes',state.minutes),num('distance','Distance / output',state.distance,0,null,.01),
  select('outputUnit','Distance / output unit',state.outputUnit,['mi','km','m','calories']),
  num('avgHr','Average HR',state.avgHr),num('rpe','Exercise RPE',state.rpe,1,10)
 );
 if(type==='circuit')return grid(
  select('rounds','Rounds completed',state.rounds||'2',circuitRoundOptions(state.rounds)),
  num('carryLoad','Farmer-carry load per hand (lb)',state.carryLoad),
  num('carrySeconds','Farmer-carry duration (sec)',state.carrySeconds),
  num('stepReps','Lateral step-ups each side',state.stepReps),
  select('modality','Hard-cardio modality',state.modality,['Bike','Rower','Elliptical']),
  num('intervalSeconds','Hard interval duration (sec)',state.intervalSeconds),
  num('restSeconds','Rest between rounds (sec)',state.restSeconds),
  text('totalTime','Total circuit time',state.totalTime,'8:30'),
  num('rpe','Circuit RPE',state.rpe,1,10)
 );
 return '';
}

function circuitRoundOptions(savedRounds){
 const options=['0','1','2'];
 const saved=String(savedRounds||'');
 if(saved&&!options.includes(saved))options.push({value:saved,label:`${saved} (legacy saved value)`});
 return options;
}

function weightedFields(definition,state,setPlan){
 const variation=state.variation||definition.defaultVariation||'';
 const barWeights=definition.barWeights||{};
 const perSideVariations=definition.perSideVariations||[];
 const usesBar=Object.prototype.hasOwnProperty.call(barWeights,variation);
 const perSide=usesBar&&perSideVariations.includes(variation);
 const validMode=['platesPerSide','plates','total'].includes(state.loadMode);
 const mode=usesBar
  ?(validMode?state.loadMode:(state.load!==''&&state.load!=null?'total':perSide?'platesPerSide':'plates'))
  :'';
 const barWeight=usesBar
  ?(state.barWeight!==''&&state.barWeight!=null?state.barWeight:(mode==='total'?'':barWeights[variation]))
  :'';
 const presetOptions=definition.barWeightOptions||[];
 const matchesPreset=presetOptions.some(value=>Number(value)===Number(barWeight));
 const preset=matchesPreset?String(barWeight):'custom';
 const loadLabel=mode==='platesPerSide'?'Plate weight per side (lb)':mode==='plates'?'Plate load, both sides combined (lb)':usesBar?'Total load (lb)':`Load (${definition.unit})`;
 return `<div class="weighted-load" data-unit="${attr(definition.unit)}"
   data-bar-weights="${attr(JSON.stringify(barWeights))}"
   data-per-side-variations="${attr(JSON.stringify(perSideVariations))}"
   data-bar-options="${attr(JSON.stringify(presetOptions))}"
   data-active-bar-variation="${attr(usesBar?variation:'')}">
  <div class="form-grid">
   <label><span data-load-label>${esc(loadLabel)}</span><input data-field="load" type="number" value="${attr(state.load)}" min="0" step=".5" inputmode="decimal"></label>
   <label data-load-mode-wrap class="${usesBar?'':'hidden'}">Weight entered as
    <select data-field="loadMode">
     <option value="platesPerSide" ${mode==='platesPerSide'?'selected':''}>Plates per side + bar</option>
     <option value="plates" ${mode==='plates'?'selected':''}>Combined plates + bar</option>
     <option value="total" ${mode==='total'?'selected':''}>Total weight</option>
    </select>
   </label>
   <label data-bar-preset-wrap class="${usesBar&&mode!=='total'&&presetOptions.length?'':'hidden'}">Bar weight
    <select data-bar-preset>
     ${presetOptions.map(value=>`<option value="${value}" ${preset===String(value)?'selected':''}>${value} lb</option>`).join('')}
     <option value="custom" ${preset==='custom'?'selected':''}>Custom</option>
    </select>
   </label>
   <label data-bar-weight-wrap class="${usesBar&&mode!=='total'&&(!presetOptions.length||preset==='custom')?'':'hidden'}">Custom bar / starting resistance (lb)
    <input data-field="barWeight" type="number" value="${attr(barWeight)}" min="0" step=".5" inputmode="decimal">
   </label>
   ${setCountSelect(state.sets,setPlan)}
   ${num('rpe','Exercise RPE',state.rpe,1,10)}
  </div>
  <div class="calculated-load ${usesBar?'':'hidden'}" data-calculated-load>
   <span>Total training load</span>
   <strong data-total-load>—</strong>
   <small data-load-breakdown></small>
  </div>
 </div>${setRepLogger(state,setPlan,'weighted')}`;
}

function bindExerciseControls(){
 document.querySelectorAll('.exercise-complete').forEach(input=>input.onchange=()=>{
  input.closest('.exercise-card').classList.toggle('completed',input.checked);
  scheduleDraft();
 });
 bindSetControls();
 bindWeightedLoadControls();
 document.querySelectorAll('[data-field="runStage"]').forEach(selectInput=>selectInput.onchange=()=>{
 const card=selectInput.closest('.exercise-card');
 const stage=Number(selectInput.value);
 if(stage)applyRunStageDefaults(card,stage);
  prepareRunTimer(card,{clearCompletedRounds:true});
  updateRunCalculations(card);
  scheduleDraft();
 });
 bindRunTimers();
 bindRunCalculations();
}

function bindWeightedLoadControls(){
 document.querySelectorAll('.weighted-load').forEach(panel=>{
  const card=panel.closest('.exercise-card');
  const variation=card.querySelector('[data-field="variation"]');
  const refresh=variationChanged=>updateWeightedLoad(panel,variation?.value||'',variationChanged);
  panel.querySelector('[data-field="load"]').addEventListener('input',()=>refresh(false));
  panel.querySelector('[data-field="barWeight"]').addEventListener('input',()=>refresh(false));
  panel.querySelector('[data-field="loadMode"]').addEventListener('change',()=>refresh(false));
  panel.querySelector('[data-bar-preset]').addEventListener('change',event=>{
   const barInput=panel.querySelector('[data-field="barWeight"]');
   if(event.target.value!=='custom')barInput.value=event.target.value;
   refresh(false);
  });
  variation?.addEventListener('change',()=>refresh(true));
  refresh(false);
 });
}

function updateWeightedLoad(panel,variation,variationChanged){
 let barWeights={},perSideVariations=[],barOptions=[];
 try{barWeights=JSON.parse(panel.dataset.barWeights||'{}')}catch{}
 try{perSideVariations=JSON.parse(panel.dataset.perSideVariations||'[]')}catch{}
 try{barOptions=JSON.parse(panel.dataset.barOptions||'[]')}catch{}
 const usesBar=Object.prototype.hasOwnProperty.call(barWeights,variation);
 const perSide=perSideVariations.includes(variation);
 const load=panel.querySelector('[data-field="load"]');
 const mode=panel.querySelector('[data-field="loadMode"]');
 const barWeight=panel.querySelector('[data-field="barWeight"]');
 const preset=panel.querySelector('[data-bar-preset]');
 const modeWrap=panel.querySelector('[data-load-mode-wrap]');
 const presetWrap=panel.querySelector('[data-bar-preset-wrap]');
 const barWrap=panel.querySelector('[data-bar-weight-wrap]');
 const calculated=panel.querySelector('[data-calculated-load]');
 const label=panel.querySelector('[data-load-label]');
 if(!usesBar){
  mode.value='';
  barWeight.value='';
  modeWrap.classList.add('hidden');
  presetWrap.classList.add('hidden');
  barWrap.classList.add('hidden');
  calculated.classList.add('hidden');
  label.textContent=`Load (${panel.dataset.unit})`;
  panel.dataset.activeBarVariation='';
  return;
 }
 const newlySelected=variationChanged&&panel.dataset.activeBarVariation!==variation;
 if(!['platesPerSide','plates','total'].includes(mode.value)||newlySelected)mode.value=perSide?'platesPerSide':'plates';
 const enteredAsTotal=mode.value==='total';
 if(!enteredAsTotal&&(newlySelected||barWeight.value===''))barWeight.value=String(barWeights[variation]??'');
 if(newlySelected&&barOptions.length){
  preset.value=barOptions.some(value=>Number(value)===Number(barWeight.value))?barWeight.value:'custom';
 }
 const hasPresets=barOptions.length>0;
 modeWrap.classList.remove('hidden');
 presetWrap.classList.toggle('hidden',enteredAsTotal||!hasPresets);
 barWrap.classList.toggle('hidden',enteredAsTotal||(hasPresets&&preset.value!=='custom'));
 calculated.classList.remove('hidden');
 label.textContent=mode.value==='platesPerSide'
  ?'Plate weight per side (lb)'
  :mode.value==='plates'?'Plate load, both sides combined (lb)':'Total load (lb)';
 const entered=numberOrNull(load.value);
 const bar=numberOrNull(barWeight.value)||0;
 const total=entered==null?null:mode.value==='platesPerSide'?bar+(entered*2):mode.value==='plates'?bar+entered:entered;
 panel.querySelector('[data-total-load]').textContent=total==null?'—':`${formatLoad(total)} lb`;
 panel.querySelector('[data-load-breakdown]').textContent=entered==null
  ?(mode.value==='platesPerSide'?'Enter the plate weight on one side.':'Enter the training load.')
  :mode.value==='platesPerSide'
   ?`${formatLoad(bar)} lb bar + ${formatLoad(entered)} lb × 2 sides`
   :mode.value==='plates'
    ?`${formatLoad(entered)} lb combined plates + ${formatLoad(bar)} lb bar`
    :'Entered as total weight';
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
 if(exercise.loadMode==='platesPerSide')return entered*2+(numberOrNull(exercise.barWeight)||0);
 if(exercise.loadMode==='plates')return entered+(numberOrNull(exercise.barWeight)||0);
 return entered;
}

function getSetPlan(definition){
 const configured=definition.sets;
 if(configured){
  const values=typeof configured==='number'?{default:configured,max:configured}:configured;
  const configuredDefault=Number(values.default||values.min||values.max);
  const configuredMax=Number(values.max||configuredDefault);
  if(configuredDefault>0&&configuredMax>=configuredDefault)return {default:configuredDefault,max:configuredMax};
 }
 const range=String(definition.prescription).match(/^\s*(\d+)\s*[–—-]\s*(\d+)\s+(?:[\w-]+\s+){0,3}sets?\b/i);
 if(range)return {default:Number(range[1]),max:Number(range[2])};
 const fixed=String(definition.prescription).match(/^\s*(\d+)(?:\s*×|\s+(?:[\w-]+\s+){0,3}sets?\b)/i);
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

function timedSetLogger(state,plan,definition){
 const values=parseSetValues(state.times);
 const count=Math.max(1,Number(state.sets)||values.length||plan.default);
 const targets=Array.isArray(definition.prescribedTimes)?definition.prescribedTimes:[];
 return `<div class="time-log" data-time-targets="${attr(JSON.stringify(targets))}">
  <p class="set-log-title">Times completed</p>
  <div class="set-time-grid">${setTimeRows(count,values,targets)}</div>
 </div>`;
}

function setTimeRows(count,values,targets){
 return Array.from({length:count},(_,index)=>{
  const target=targets[index]||'';
  return `<label>Set ${index+1} time${target?` <span class="set-target">Target ${esc(target)}</span>`:''}
   <input data-time-index="${index}" value="${attr(values[index]||'')}" placeholder="${attr(target||'0:30')}" inputmode="numeric">
  </label>`;
 }).join('');
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

function readTimeValues(card){
 return [...card.querySelectorAll('[data-time-index]')].map(input=>input.value.trim());
}

function bindSetControls(){
 document.querySelectorAll('.set-count-select').forEach(selectInput=>selectInput.onchange=()=>{
  const card=selectInput.closest('.exercise-card');
  const repLogger=card.querySelector('.set-log');
  if(repLogger){
   const values=readRepValues(card);
   repLogger.querySelector('.set-rep-grid').innerHTML=setRepRows(Number(selectInput.value),values,repLogger.dataset.repType);
   bindCustomRepControls(repLogger);
  }
  const timeLogger=card.querySelector('.time-log');
  if(timeLogger){
   let targets=[];
   try{targets=JSON.parse(timeLogger.dataset.timeTargets||'[]')}catch{}
   timeLogger.querySelector('.set-time-grid').innerHTML=setTimeRows(Number(selectInput.value),readTimeValues(card),targets);
  }
  scheduleDraft();
 });
 bindCustomRepControls(document);
}

function bindCustomRepControls(root){
 root.querySelectorAll('.set-rep-select').forEach(selectInput=>selectInput.onchange=()=>{
  const customInput=selectInput.closest('label').querySelector('.custom-reps');
  customInput.classList.toggle('hidden',selectInput.value!=='custom');
  if(selectInput.value==='custom')customInput.focus();
  scheduleDraft();
 });
}

function runFields(type,state){
 const common=[
  runStageSelect(state.runStage),
  num('walkMinutes','Walk / easy interval (min)',state.walkMinutes,0,null,.25),
  num('runMinutes','Run interval (min)',state.runMinutes,0,null,.25),
  num('rounds','Planned walk/run rounds',state.rounds),
  num('completedRounds','Walk/run rounds completed',state.completedRounds),
  num('continuousMinutes','Continuous run (min)',state.continuousMinutes),
  `<label>Programmed interval time<input data-field="programmedIntervalTime" value="${attr(state.programmedIntervalTime)}" readonly aria-readonly="true"></label>`,
  text('totalTime','Total elapsed time',state.totalTime,'24:00'),
  num('distance','Total distance (mi)',state.distance,0,null,.01),
  text('deviceReportedPace','Device-reported average pace',state.deviceReportedPace,'14:16'),
  num('rpe','Run effort (RPE)',state.rpe,1,10),
  num('runPain','Run discomfort (0–10)',state.runPain,0,10),
  num('warmupMinutes','Warm-up duration (min)',state.warmupMinutes,0,null,.25),
  num('cooldownMinutes','Cooldown duration (min)',state.cooldownMinutes,0,null,.25),
  num('walkSpeed','Walking speed (mph)',state.walkSpeed,0,null,.1),
  num('runSpeed','Running speed (mph)',state.runSpeed,0,null,.1),
  select('runEnvironment','Run setting',state.runEnvironment,['Indoor treadmill','Outdoor']),
  `<label data-incline-wrap class="${state.runEnvironment==='Indoor treadmill'?'':'hidden'}">Treadmill incline (%)<input data-field="treadmillIncline" type="number" value="${attr(state.treadmillIncline)}" min="0" step=".1" inputmode="decimal"></label>`,
  num('avgHr','Average HR',state.avgHr),
  num('maxHr','Maximum HR',state.maxHr)
 ];
 return grid(...common)+`<p class="run-plan-summary" data-run-plan-summary></p><section class="pace-calculation" aria-live="polite">
  <div><span>Calculated average pace</span><strong data-calculated-pace>—</strong></div>
  <small data-pace-basis>Enter elapsed time and distance to calculate pace.</small>
  <input data-field="calculatedPace" type="hidden" value="${attr(state.calculatedPace)}">
  <input data-field="paceBasis" type="hidden" value="${attr(state.paceBasis)}">
  <p class="pace-warning hidden" data-pace-warning>Device-reported pace differs from pace calculated from total time and distance. Both values will be saved.</p>
 </section>`+runTimerMarkup()+`<label>Run/walk structure or splits<input data-field="structure" value="${attr(state.structure)}" placeholder="Use the prescribed stage or record a manual structure"></label>`;
}

function runStageSelect(value){
 return select('runStage','Stage completed',value||String(PROGRAM.currentRunStage),[
  ...RUN_STAGES.map(stage=>({value:String(stage.id),label:`Stage ${stage.id} — ${stage.label}`})),
  {value:'manual',label:'Manual / modified session'}
 ]);
}

function bindRunCalculations(){
 document.querySelectorAll('.exercise-card').forEach(card=>{
  if(!card.querySelector('.pace-calculation'))return;
  ['walkMinutes','runMinutes','rounds','continuousMinutes','totalTime','distance','deviceReportedPace'].forEach(field=>{
   card.querySelector(`[data-field="${field}"]`)?.addEventListener('input',()=>{
    updateRunCalculations(card);
    scheduleDraft();
   });
  });
  card.querySelector('[data-field="runEnvironment"]')?.addEventListener('change',()=>{
   updateRunCalculations(card);
   scheduleDraft();
  });
  updateRunCalculations(card);
 });
}

function updateRunCalculations(card){
 const value=field=>card.querySelector(`[data-field="${field}"]`)?.value||'';
 const exercise={
  walkMinutes:value('walkMinutes'),
  runMinutes:value('runMinutes'),
  rounds:value('rounds'),
  continuousMinutes:value('continuousMinutes'),
  totalTime:value('totalTime'),
  distance:value('distance'),
  deviceReportedPace:value('deviceReportedPace')
 };
 const programmedSeconds=programmedRunSeconds(exercise);
 const programmedInput=card.querySelector('[data-field="programmedIntervalTime"]');
 if(programmedInput)programmedInput.value=programmedSeconds?formatTimerSeconds(programmedSeconds):'';
 const plannedRounds=Math.max(0,Math.floor(Number(exercise.rounds)||0));
 const walkTotal=(Number(exercise.walkMinutes)||0)*plannedRounds;
 const runTotal=(Number(exercise.runMinutes)||0)*plannedRounds;
 const planSummary=card.querySelector('[data-run-plan-summary]');
 if(planSummary){
  planSummary.textContent=plannedRounds&&runTotal
   ?`${formatMinutes(walkTotal)} walking · ${formatMinutes(runTotal)} running · ${formatTimerSeconds(programmedSeconds)} programmed`
   :programmedSeconds?`${formatTimerSeconds(programmedSeconds)} programmed`:'Enter the interval structure to calculate programmed time.';
 }
 exercise.programmedIntervalTime=programmedInput?.value||'';
 const pace=calculatedPaceDetails(exercise);
 const calculatedInput=card.querySelector('[data-field="calculatedPace"]');
 const basisInput=card.querySelector('[data-field="paceBasis"]');
 if(calculatedInput)calculatedInput.value=pace.value;
 if(basisInput)basisInput.value=pace.basis;
 card.querySelector('[data-calculated-pace]').textContent=pace.value?`${pace.value}/mi`:'—';
 card.querySelector('[data-pace-basis]').textContent=pace.basis==='totalElapsedTime'
  ?'Calculated from total elapsed time and distance.'
  :pace.basis==='programmedIntervalTime'
   ?'Total elapsed time is blank; calculated from programmed interval time and distance.'
   :'Enter elapsed time and distance to calculate pace.';
 const deviceSeconds=parsePace(exercise.deviceReportedPace);
 const calculatedSeconds=parsePace(pace.value);
 const differs=paceDifferenceIsMaterial(calculatedSeconds,deviceSeconds);
 const warning=card.querySelector('[data-pace-warning]');
 warning.classList.toggle('hidden',!differs);
 if(differs){
  warning.textContent=pace.basis==='totalElapsedTime'
   ?'Device-reported pace differs from pace calculated from total time and distance. Both values will be saved.'
   :'Device-reported pace differs from pace calculated from programmed interval time and distance. Both values will be saved.';
 }
 const environment=value('runEnvironment');
 card.querySelector('[data-incline-wrap]')?.classList.toggle('hidden',environment!=='Indoor treadmill');
}

function programmedRunSeconds(exercise){
 const runSeconds=Math.round((Number(exercise?.runMinutes)||0)*60);
 const walkSeconds=Math.round((Number(exercise?.walkMinutes)||0)*60);
 const rounds=Math.max(0,Math.floor(Number(exercise?.rounds)||0));
 if(runSeconds>0&&rounds>0)return (runSeconds+walkSeconds)*rounds;
 return Math.round((Number(exercise?.continuousMinutes)||0)*60);
}

function formatMinutes(value){
 return `${Number(value).toFixed(2).replace(/\.?0+$/,'')} min`;
}

function calculatedPaceDetails(exercise){
 const distance=Number(exercise?.distance)||0;
 if(distance<=0)return {value:'',basis:''};
 const elapsedSeconds=parseTime(exercise?.totalTime||'');
 const programmedSeconds=parseTime(exercise?.programmedIntervalTime||'')||programmedRunSeconds(exercise);
 const seconds=elapsedSeconds>0?elapsedSeconds:programmedSeconds;
 if(seconds<=0)return {value:'',basis:''};
 return {
  value:formatPace(seconds/distance),
  basis:elapsedSeconds>0?'totalElapsedTime':'programmedIntervalTime'
 };
}

function formatPace(secondsPerMile){
 if(!Number.isFinite(secondsPerMile)||secondsPerMile<=0)return '';
 return fmtSec(Math.round(secondsPerMile));
}

function parsePace(value){
 const cleaned=String(value||'').toLowerCase().replace(/\s*(?:\/\s*mi|per\s*mile)\s*$/,'').trim();
 return parseTime(cleaned);
}

function paceDifferenceIsMaterial(calculatedSeconds,deviceSeconds){
 return calculatedSeconds>0&&deviceSeconds>0&&Math.abs(calculatedSeconds-deviceSeconds)>15;
}

function runTimerMarkup(){
 return `<section class="run-timer" data-phase="ready" aria-label="Walk and run interval timer">
  <div class="run-timer-heading">
   <div><p class="eyebrow">WALK / RUN TIMER</p><h3 data-timer-current aria-live="polite">Ready</h3></div>
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
  card,plan,index:0,remainingMs:(plan[0]?.seconds||0)*1000,
  running:false,started:false,complete:false,completedSegments:0,deadline:0
 };
 if(clearCompletedRounds){
  const completedRounds=card.querySelector('[data-field="completedRounds"]');
  if(completedRounds)completedRounds.value='';
  const checkbox=card.querySelector('.exercise-complete');
  if(checkbox)checkbox.checked=false;
  card.classList.remove('completed');
 }
 updateRunTimer();
 scheduleDraft();
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
 saveDraftNow();
}

function pauseRunTimer(){
 if(!runTimerState?.running)return;
 runTimerState.remainingMs=Math.max(0,runTimerState.deadline-Date.now());
 runTimerState.running=false;
 clearInterval(runTimerTick);
 runTimerTick=null;
 releaseRunTimerWakeLock();
 updateRunTimer();
 saveDraftNow();
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
 saveDraftNow();
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
 }else{
  state.index+=1;
 }
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
 const programmedTime=state.card.querySelector('[data-field="programmedIntervalTime"]');
 if(programmedTime)programmedTime.value=formatTimerSeconds(state.plan.reduce((sum,segment)=>sum+segment.seconds,0));
 updateRunCalculations(state.card);
 signalRunTimer(true);
 updateRunTimer();
 saveDraftNow();
 toast('Walk/run timer complete · exercise marked done');
}

function clearRunTimer(){
 clearInterval(runTimerTick);
 runTimerTick=null;
 if(runTimerState?.running)releaseRunTimerWakeLock();
 runTimerState=null;
}

function updateRunTimer(){
 const state=runTimerState;
 const timer=state?.card?.querySelector('.run-timer');
 if(!timer)return;
 const current=state.plan[state.index];
 const clock=timer.querySelector('[data-timer-clock]');
 const title=timer.querySelector('[data-timer-current]');
 const phase=timer.querySelector('[data-timer-phase]');
 const next=timer.querySelector('[data-timer-next]');
 const progress=timer.querySelector('[data-timer-progress]');
 const segments=timer.querySelector('[data-timer-segments]');
 const start=timer.querySelector('[data-timer-action="start"]');
 const pause=timer.querySelector('[data-timer-action="pause"]');
 const advance=timer.querySelector('[data-timer-action="next"]');
 const phaseName=state.complete?'complete':state.running?current?.kind||'run':state.started?'paused':'ready';
 timer.dataset.phase=phaseName;
 phase.textContent=phaseName.toUpperCase();
 title.textContent=state.complete?'Session complete':current?(current.round?`${current.label} · round ${current.round}`:current.label):'Enter a run plan';
 clock.textContent=formatTimerMilliseconds(state.remainingMs);
 const nextSegment=state.plan[state.index+1];
 next.textContent=state.complete?'All planned segments completed.':nextSegment?`Next: ${nextSegment.label}${nextSegment.round?` · round ${nextSegment.round}`:''}`:'';
 progress.max=Math.max(1,state.plan.length);
 progress.value=state.completedSegments;
 const completedRounds=state.card.querySelector('[data-field="completedRounds"]')?.value||0;
 const plannedRounds=state.card.querySelector('[data-field="rounds"]')?.value||0;
 segments.textContent=plannedRounds
  ?`${completedRounds}/${plannedRounds} rounds · ${state.completedSegments}/${state.plan.length} segments`
  :`${state.completedSegments}/${state.plan.length} segments`;
 start.textContent=state.started?'Resume':'Start timer';
 start.disabled=state.running||state.complete||!state.plan.length;
 pause.disabled=!state.running;
 advance.disabled=!state.started||state.complete;
}

function formatTimerMilliseconds(milliseconds){
 return formatTimerSeconds(Math.ceil(Math.max(0,milliseconds)/1000));
}

function formatTimerSeconds(seconds){
 const minutes=Math.floor(seconds/60);
 return `${minutes}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
}

function signalRunTimer(finished=false){
 if(navigator.vibrate)navigator.vibrate(finished?[200,100,200]:120);
 try{
  runTimerAudioContext=runTimerAudioContext||new (window.AudioContext||window.webkitAudioContext)();
  const oscillator=runTimerAudioContext.createOscillator();
  const gain=runTimerAudioContext.createGain();
  oscillator.frequency.value=finished?880:660;
  gain.gain.setValueAtTime(.08,runTimerAudioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,runTimerAudioContext.currentTime+.18);
  oscillator.connect(gain).connect(runTimerAudioContext.destination);
  oscillator.start();
  oscillator.stop(runTimerAudioContext.currentTime+.18);
 }catch{}
}

async function requestRunTimerWakeLock(){
 try{
  if('wakeLock' in navigator&&!runTimerWakeLock)runTimerWakeLock=await navigator.wakeLock.request('screen');
 }catch{}
}

function releaseRunTimerWakeLock(){
 if(!runTimerWakeLock)return;
 runTimerWakeLock.release().catch(()=>{});
 runTimerWakeLock=null;
}

function applyRunStageDefaults(card,stageId){
 const defaults=runDefaults(stageId);
 Object.entries(defaults).forEach(([field,value])=>{
  const input=card.querySelector(`[data-field="${field}"]`);
  if(input)input.value=value;
 });
}

function runDefaults(stageId){
 const stage=getRunStage(stageId);
 if(stage.performance)return {
  runMinutes:'',walkMinutes:'',rounds:'',continuousMinutes:'',structure:stage.label
 };
 return {
  runMinutes:stage.runMinutes||'',
  walkMinutes:stage.walkMinutes||'',
  rounds:stage.rounds||'',
  continuousMinutes:stage.continuousMinutes||'',
  structure:stage.label
 };
}

function getRunStage(stageId){
 return RUN_STAGES.find(stage=>stage.id===Number(stageId))||RUN_STAGES[0];
}

function renderRunProgress(key){
 const hasRun=(SESSIONS[key]?.exercises||[]).some(exercise=>['interval','run'].includes(exercise.type));
 $('runProgressCard').classList.toggle('hidden',!hasRun);
 if(!hasRun)return;
 const stage=getRunStage(PROGRAM.currentRunStage);
 const completions=runStageCompletionCount(stage.id);
 $('runStageBadge').textContent=`COACH-PRESCRIBED STAGE ${stage.id}`;
 $('runStageTitle').textContent=stage.label;
 $('runStageTarget').textContent='The timer starts with the walk segment. Log the stage actually completed inside the run exercise.';
 $('runStageStatus').textContent=`Coach-directed stage · ${completions} completed session${completions===1?'':'s'} logged at this stage. Stage changes come from the next coach update.`;
}

function startSessionTimer(){
 if(sessionTimerState.running)return;
 sessionTimerState={
  elapsedMs:Number(sessionTimerState.elapsedMs)||0,
  running:true,
  startedAt:Date.now()
 };
 startSessionTimerTick();
 persistSessionTimer();
 saveDraftNow();
 updateSessionTimer();
}

function pauseSessionTimer(){
 if(!sessionTimerState.running)return;
 sessionTimerState.elapsedMs=sessionTimerElapsed();
 sessionTimerState.running=false;
 sessionTimerState.startedAt=null;
 stopSessionTimerTick();
 persistSessionTimer();
 saveDraftNow();
 updateSessionTimer();
}

function finishAndSaveSession(){
 if(sessionTimerState.running)pauseSessionTimer();
 const elapsed=sessionTimerElapsed();
 if(elapsed>0&&!$('duration').value)$('duration').value=String(Math.max(1,Math.round(elapsed/60000)));
 $('workoutForm').requestSubmit();
}

function sessionTimerElapsed(){
 return (Number(sessionTimerState.elapsedMs)||0)+(sessionTimerState.running&&sessionTimerState.startedAt?Date.now()-sessionTimerState.startedAt:0);
}

function startSessionTimerTick(){
 stopSessionTimerTick();
 sessionTimerTick=setInterval(()=>{
  updateSessionTimer();
  if(Math.floor(sessionTimerElapsed()/1000)%15===0)persistSessionTimer();
 },1000);
}

function stopSessionTimerTick(){
 clearInterval(sessionTimerTick);
 sessionTimerTick=null;
}

function updateSessionTimer(){
 if(!$('sessionTimerClock'))return;
 const elapsed=sessionTimerElapsed();
 $('sessionTimerClock').textContent=formatElapsed(elapsed);
 $('sessionTimerStatus').textContent=sessionTimerState.running
  ?'Timer running. Pausing or reloading will preserve the elapsed time.'
  :elapsed>0?'Paused. Resume when ready, or finish and save.':'Not started. Manual duration entry is always available.';
 $('startSessionTimerButton').textContent=elapsed>0?'Resume session':'Start session';
 $('startSessionTimerButton').disabled=sessionTimerState.running;
 $('pauseSessionTimerButton').disabled=!sessionTimerState.running;
 $('finishSessionTimerButton').disabled=elapsed<=0;
}

function formatElapsed(milliseconds){
 const total=Math.floor(Math.max(0,milliseconds)/1000);
 const hours=Math.floor(total/3600);
 const minutes=Math.floor((total%3600)/60);
 const seconds=total%60;
 return hours?`${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`:`${minutes}:${String(seconds).padStart(2,'0')}`;
}

function persistSessionTimer(){
 try{
  const state={...sessionTimerState};
  if(state.running){
   state.elapsedMs=sessionTimerElapsed();
   state.startedAt=Date.now();
  }
  localStorage.setItem(TIMER_KEY,JSON.stringify(state));
 }catch{}
}

function restoreSessionTimer(){
 try{
  const parsed=JSON.parse(localStorage.getItem(TIMER_KEY)||'null');
  if(!parsed||typeof parsed!=='object')return resetSessionTimer(false);
  sessionTimerState={
   elapsedMs:Number(parsed.elapsedMs)||0,
   running:Boolean(parsed.running),
   startedAt:parsed.running?Number(parsed.startedAt)||Date.now():null
  };
  if(sessionTimerState.running)startSessionTimerTick();
  updateSessionTimer();
 }catch{
  resetSessionTimer(false);
 }
}

function resetSessionTimer(remove=true){
 stopSessionTimerTick();
 sessionTimerState={elapsedMs:0,running:false,startedAt:null};
 if(remove){
  try{localStorage.removeItem(TIMER_KEY)}catch{}
 }
 updateSessionTimer();
}

function collectWorkoutItem({draft=false}={}){
 const definitions=activeSessionDefinition?.exercises||[];
 const cards=[...document.querySelectorAll('.exercise-card')];
 const exercises=cards.map((card,index)=>{
  const definition=definitions[index]||{};
  if(['interval','run'].includes(definition.type))updateRunCalculations(card);
  const prior=findSavedExercise(definition,activeSavedExercises,index)||{};
  const exercise={
   ...prior,
   exerciseId:definition.id||card.dataset.exerciseId,
   name:definition.name||`Exercise ${index+1}`,
   prescription:definition.prescription||'',
   type:definition.type||'body',
   unit:definition.unit||'',
   targetRpe:definition.targetRpe||'',
   completed:card.querySelector('.exercise-complete').checked
  };
  card.querySelectorAll('[data-field]').forEach(input=>{
   exercise[input.dataset.field]=String(input.value??'').trim();
  });
  if(card.querySelector('.set-rep-grid')){
   const reps=readRepValues(card);
   while(reps.at(-1)==='')reps.pop();
   exercise.reps=reps.join(', ');
  }
  if(card.querySelector('.set-time-grid')){
   const times=readTimeValues(card);
   while(times.at(-1)==='')times.pop();
   exercise.times=times.join(', ');
  }
  if(['interval','run'].includes(exercise.type)&&exercise.runEnvironment!=='Indoor treadmill')exercise.treadmillIncline='';
  if(exercise.type==='weighted'){
   const total=totalLoadValue(exercise);
   exercise.totalLoad=total==null?'':String(total);
  }
  if(['interval','run'].includes(exercise.type)&&Number(exercise.runStage)){
   exercise.runTarget=getRunStage(exercise.runStage).label;
  }
  return exercise;
 });
 const program=activeProgramContext||currentProgramMeta();
 return {
  id:editing||(draft?'':id()),
  date:$('sessionDate').value||today(),
  dayKey:activeSessionDefinition.key,
  dayLabel:activeSessionDefinition.label,
  sessionType:activeSessionDefinition.sessionType||'primary',
  targetSessionRpe:activeSessionDefinition.targetSessionRpe||'',
  programId:program.id,
  programName:program.name,
  programVersion:program.version,
  programEffectiveDate:program.effectiveDate,
  activeRunStage:program.runStage??'',
  prescriptionSnapshot:snapshotSession(activeSessionDefinition),
  duration:$('duration').value,
  sessionRpe:$('sessionRpe').value,
  bodyWeight:$('bodyWeight').value,
  preSoreness:$('preSoreness').value,
  readiness:$('readiness').value,
  painDuring:$('painDuring').value,
  painLocation:$('painLocation').value.trim(),
  postSoreness:activeSessionDefinition.sessionType==='recovery'?$('postSoreness').value:'',
  ...(editing&&$('legacyPainScore').value!==''?{painScore:$('legacyPainScore').value}:{}),
  notes:$('sessionNotes').value.trim(),
  exercises,
  updatedAt:new Date().toISOString()
 };
}

function saveWorkout(event){
 event.preventDefault();
 pauseRunTimer();
 const item=collectWorkoutItem();
 const index=entries.findIndex(entry=>entry.id===item.id);
 const wasEditing=index>=0;
 index>=0?entries[index]=item:entries.push(item);
 entries.sort(compareEntries);
 if(!persistEntries(wasEditing?'Before workout update':'Before workout save')){
  toast('Could not save. Export a backup and check device storage.');
  return;
 }
 editing=null;
 clearDraft();
 resetSessionTimer();
 newWorkout(false);
 renderHistory();
 renderProgress();
 updatePreview();
 renderStorageStatus();
 toast(`${wasEditing?'Workout updated':'Workout saved'} · next workout ready`);
}

function newWorkout(notify=true){
 editing=null;
 clearDraft();
 resetSessionTimer();
 $('daySelect').value=nextWorkoutDay();
 $('sessionDate').value=today();
 renderWorkout();
 tab('workout');
 if(notify)toast('New workout ready');
}

function nextWorkoutDay(source=entries){
 const recent=source.filter(isPrimaryEntry).slice().sort(compareEntries)[0];
 if(!recent||!ROTATION.includes(recent.dayKey))return ROTATION[0];
 return ROTATION[(ROTATION.indexOf(recent.dayKey)+1)%ROTATION.length];
}

function isPrimaryEntry(entry){
 return entry?.sessionType!=='recovery'&&ROTATION.includes(entry?.dayKey);
}

function compareEntries(a,b){
 return String(b.date||'').localeCompare(String(a.date||''))
  ||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
}

function previousResult(definition,variation){
 const candidates=entries.slice().sort(compareEntries).flatMap(entry=>
  (entry.exercises||[])
   .filter(exercise=>exerciseIdentity(exercise)===definition.id&&(exercise.completed||hasData(exercise)))
   .map(exercise=>({entry,exercise}))
 );
 if(!candidates.length)return '';
 const selected=candidates.find(item=>!variation||item.exercise.variation===variation)||candidates[0];
 const parts=[];
 const exercise=selected.exercise;
 if(exercise.variation&&exercise.variation!==variation)parts.push(exercise.variation);
 const total=totalLoadValue(exercise);
 if(total!=null)parts.push(`${formatLoad(total)} lb total`);
 if(exercise.sets)parts.push(`${exercise.sets} sets`);
 if(exercise.reps)parts.push(`reps ${exercise.reps}`);
 if(exercise.times)parts.push(`times ${exercise.times}`);
 if(exercise.completedRounds)parts.push(`${exercise.completedRounds}/${exercise.rounds||'?'} rounds`);
 if(exercise.totalTime)parts.push(`${exercise.totalTime} elapsed`);
 if(exercise.minutes)parts.push(`${exercise.minutes} min`);
 if(exercise.distance)parts.push(`${exercise.distance}${['run','interval'].includes(exercise.type)?' mi':''}`);
 if(['run','interval'].includes(exercise.type)){
  const pace=calculatedPaceDetails(exercise);
  if(pace.value)parts.push(`${pace.value}/mi calculated`);
  if(exercise.deviceReportedPace)parts.push(`${exercise.deviceReportedPace}/mi device`);
 }
 if(exercise.rpe)parts.push(`RPE ${exercise.rpe}`);
 return `${dateFmt(selected.entry.date)} · ${parts.join(' · ')||'completed'}`;
}

function renderHistory(){
 const container=$('historyList');
 if(!entries.length){
  container.innerHTML='<div class="empty-state">No workouts saved yet.</div>';
  return;
 }
 container.innerHTML=entries.map(entry=>{
  const done=(entry.exercises||[]).filter(exercise=>exercise.completed||hasData(exercise)).map(exercise=>`<li><strong>${esc(exercise.name)}:</strong> ${esc(summary(exercise))}${exercise.notes?`<span class="history-exercise-note"><strong>Exercise notes:</strong> ${esc(exercise.notes).replaceAll('\n','<br>')}</span>`:''}</li>`).join('');
  const program=entry.programVersion
   ?`${entry.programName||'AFT program'} · v${entry.programVersion}`
   :'Legacy workout';
  const sessionDetails=[];
  if(entry.preSoreness!=='')sessionDetails.push(`pre-soreness ${entry.preSoreness}/10`);
  if(entry.readiness)sessionDetails.push(`readiness ${readinessLabel(entry.readiness)}`);
  if(entry.painDuring!=='')sessionDetails.push(`pain ${entry.painDuring}/10${entry.painLocation?` — ${entry.painLocation}`:''}`);
  else if(entry.painScore!==''&&entry.painScore!=null)sessionDetails.push(`legacy pain/discomfort ${entry.painScore}/10`);
  if(entry.postSoreness!=='')sessionDetails.push(`post-soreness ${entry.postSoreness}/10`);
  return `<article class="history-item ${entry.sessionType==='recovery'?'recovery-history':''}">
   <div class="history-top">
    <div>
     <p class="eyebrow">${entry.sessionType==='recovery'?'OPTIONAL RECOVERY':'PRIMARY WORKOUT'}</p>
     <h3>${esc(entry.dayLabel)}</h3>
     <p>${dateFmt(entry.date)}${entry.duration?` · ${esc(entry.duration)} min`:''}${entry.sessionRpe?` · RPE ${esc(entry.sessionRpe)}`:''}</p>
     <p class="program-badge">${esc(program)}</p>
    </div>
    <div class="history-actions"><button class="secondary" data-history-action="edit" data-entry-id="${attr(entry.id)}">Edit</button><button class="danger" data-history-action="delete" data-entry-id="${attr(entry.id)}">Delete</button></div>
   </div>
   ${sessionDetails.length?`<p>${esc(sessionDetails.join(' · '))}</p>`:''}
   ${done?`<ul class="history-exercises">${done}</ul>`:'<p>No completed exercises marked.</p>'}
   ${entry.notes?`<p><strong>Post-session notes:</strong> ${esc(entry.notes).replaceAll('\n','<br>')}</p>`:''}
  </article>`;
 }).join('');
 container.querySelectorAll('[data-history-action="edit"]').forEach(button=>button.onclick=()=>editEntry(button.dataset.entryId));
 container.querySelectorAll('[data-history-action="delete"]').forEach(button=>button.onclick=()=>deleteEntry(button.dataset.entryId));
}

function editEntry(entryId){
 const entry=entries.find(item=>item.id===entryId);
 if(!entry)return;
 editing=entryId;
 clearDraft();
 resetSessionTimer();
 renderWorkout(entry);
 tab('workout');
 toast('Editing saved workout and its original prescription');
}

function deleteEntry(entryId){
 if(!confirm('Delete this workout? A local restore point will be kept.'))return;
 entries=entries.filter(entry=>entry.id!==entryId);
 persistEntries('Before deleting one workout');
 renderHistory();
 renderProgress();
 renderRunProgress($('daySelect').value);
 updatePreview();
 renderStorageStatus();
 toast('Workout deleted · local restore point available');
}

function deleteAll(){
 if(!entries.length||!confirm('Delete every saved workout? A local restore point will be kept, but a downloaded backup is safer.'))return;
 entries=[];
 persistEntries('Before deleting all workouts');
 renderHistory();
 renderProgress();
 renderRunProgress($('daySelect').value);
 updatePreview();
 renderStorageStatus();
 toast('All workouts deleted · local restore point available');
}

function renderProgress(){
 const primaryEntries=entries.filter(isPrimaryEntry);
 const recoveryEntries=entries.filter(entry=>entry.sessionType==='recovery');
 const currentProgramEntries=primaryEntries.filter(entry=>entry.programId===PROGRAM.id&&String(entry.programVersion)===String(PROGRAM.version));
 const minutes=entries.reduce((total,entry)=>total+Number(entry.duration||0),0);
 const allRpes=entries.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const allAverageRpe=allRpes.length?(allRpes.reduce((a,b)=>a+b,0)/allRpes.length).toFixed(1):'—';
 const currentRpes=currentProgramEntries.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const averageRpe=currentRpes.length?(currentRpes.reduce((a,b)=>a+b,0)/currentRpes.length).toFixed(1):'—';
 const weight=entries.find(entry=>Number(entry.bodyWeight))?.bodyWeight||'—';
 const stage=getRunStage(PROGRAM.currentRunStage);
 const weeks=weeklyMetrics(entries);
 const currentWeek=weeks.find(week=>week.week===weekStart(today()))||{pushups:0,plankSeconds:0};
 const runs=runRecords(entries);
 const recentRun=runs[0]||null;
 const currentRunWeek=weeklyRunMetrics(runs,weekStart(today()));
 const runMetricCards=[
  ['Most recent run/walk distance',recentRun?.exercise.distance?`${formatDistance(recentRun.exercise.distance)} mi`:'—'],
  ['Most recent calculated pace',recentRun?formatRunPaceMetric(recentRun.exercise):'—'],
  ['Longest run/walk distance',longestRunDistance(runs)],
  ['This week running distance',currentRunWeek.distance?`${formatDistance(currentRunWeek.distance)} mi`:'—'],
  ['This week running time',currentRunWeek.seconds?`${Math.round(currentRunWeek.seconds/60)} min`:'—'],
  ['Pain-free running sessions',painFreeRunCount(runs)||'—']
 ];
 if(recentRun?.exercise.deviceReportedPace)runMetricCards.splice(2,0,['Most recent device pace',`${recentRun.exercise.deviceReportedPace}/mi`]);
 runMetricCards.push(...bestPaceByStage(runs).map(item=>[`Stage ${item.stage} best calculated pace`,`${item.pace}/mi`]));
 const cards=[
  ['All sessions',entries.length],
  ['Primary workouts',primaryEntries.length],
  ['Recovery sessions',recoveryEntries.length||'—'],
  ['Training time',minutes?`${minutes} min`:'—'],
  ['Current-version workouts',currentProgramEntries.length],
  ['Avg. current-version RPE',averageRpe],
  ['Current coach-directed run stage',`Stage ${stage.id}`],
  ...runMetricCards,
  ['This week push-ups',currentWeek.pushups||'—'],
  ['This week front plank',currentWeek.plankSeconds?fmtSec(currentWeek.plankSeconds):'—'],
  ['Best push-up set',bestRep('handReleasePushups')],
  ['Longest continuous front plank',bestTime('plank')],
  ['Best hex-bar deadlift',bestDeadlift(['Trap / hex bar'])],
  ['Best straight-bar deadlift',bestDeadlift(['Conventional barbell','Sumo barbell'])],
  ['Latest weight',weight==='—'?'—':`${weight} lb`],
  ['Avg. session RPE',allAverageRpe],
  ['Current-stage completions',runStageCompletionCount(stage.id)||'—'],
  ['Highest dumbbell-curl weight',bestExerciseLoad('dumbbellCurl')],
  ['Highest pressdown weight',bestExerciseLoad('tricepsPressdown')],
  ['Highest lateral-raise weight',bestExerciseLoad('lateralRaise')],
  ['Arm-superset sessions',armSupersetSessionCount()||'—']
 ];
 $('progressCards').innerHTML=cards.map(([label,value])=>`<article class="metric"><div class="label">${esc(label)}</div><div class="value">${esc(value||'—')}</div></article>`).join('');
 $('weeklyTestProgress').innerHTML=weeks.length
  ?`<div class="weekly-table"><div class="weekly-row weekly-head"><span>Week of</span><span>Push-ups</span><span>Front plank</span></div>${weeks.slice(0,10).map(week=>`<div class="weekly-row"><strong>${dateFmt(week.week)}</strong><span>${week.pushups||'—'} reps</span><span>${week.plankSeconds?fmtSec(week.plankSeconds):'—'}</span></div>`).join('')}</div>`
  :'<div class="empty-state">Weekly push-up and front-plank totals will appear after completed sets are logged.</div>';
 const recent=entries.slice(0,8);
 $('recentProgress').innerHTML=recent.length?recent.map(entry=>{
  const pain=entry.painDuring!==''&&entry.painDuring!=null
   ?`, pain ${esc(entry.painDuring)}/10`
   :entry.painScore!==''&&entry.painScore!=null?`, legacy pain ${esc(entry.painScore)}/10`:'';
  return `<p><strong>${dateFmt(entry.date)}</strong> — ${esc(entry.dayLabel)}${entry.sessionRpe?`, RPE ${esc(entry.sessionRpe)}`:''}${pain}</p>`;
 }).join(''):'<div class="empty-state">Progress will appear after the first saved workout.</div>';
}

function weeklyMetrics(source){
 const groups=new Map();
 source.forEach(entry=>{
  const key=weekStart(entry.date);
  if(!groups.has(key))groups.set(key,{week:key,pushups:0,plankSeconds:0});
  const group=groups.get(key);
  (entry.exercises||[]).filter(exercise=>exercise.completed).forEach(exercise=>{
   const identity=exerciseIdentity(exercise);
   if(identity==='handReleasePushups'){
    group.pushups+=parseSetValues(exercise.reps).reduce((sum,value)=>sum+(Number(value)||0),0);
   }
   if(identity==='plank'){
    group.plankSeconds+=String(exercise.times||'').split(',').reduce((sum,value)=>sum+Math.max(0,parseTime(value.trim())||0),0);
   }
  });
 });
 return [...groups.values()].filter(group=>group.pushups||group.plankSeconds).sort((a,b)=>b.week.localeCompare(a.week));
}

function weekStart(value){
 const date=new Date(`${value}T12:00:00`);
 const day=(date.getDay()+6)%7;
 date.setDate(date.getDate()-day);
 return iso(date);
}

function runStageCompletionCount(stageId){
 return entries.filter(entry=>(entry.exercises||[]).some(exercise=>
  exercise.completed&&Number(exercise.runStage)===Number(stageId)&&['interval','run'].includes(exercise.type)
 )).length;
}

function runRecords(source){
 return source.slice().sort(compareEntries).flatMap(entry=>(entry.exercises||[])
  .filter(exercise=>['interval','run'].includes(exercise.type)&&(exercise.completed||hasData(exercise)))
  .map(exercise=>({entry,exercise}))
 );
}

function runDurationSeconds(exercise){
 return parseTime(exercise?.totalTime||'')
  ||parseTime(exercise?.programmedIntervalTime||'')
  ||programmedRunSeconds(exercise);
}

function weeklyRunMetrics(runs,week){
 return runs.filter(item=>item.entry.date>=week&&item.entry.date<=weekEnd(week)&&item.exercise.completed)
  .reduce((totals,item)=>({
   distance:totals.distance+(Number(item.exercise.distance)||0),
   seconds:totals.seconds+runDurationSeconds(item.exercise)
  }),{distance:0,seconds:0});
}

function weekEnd(week){
 const date=new Date(`${week}T12:00:00`);
 date.setDate(date.getDate()+6);
 return iso(date);
}

function longestRunDistance(runs){
 const values=runs.map(item=>Number(item.exercise.distance)).filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${formatDistance(Math.max(...values))} mi`:'—';
}

function formatDistance(value){
 return Number(value).toFixed(2).replace(/\.?0+$/,'');
}

function formatRunPaceMetric(exercise){
 const pace=calculatedPaceDetails(exercise);
 return pace.value?`${pace.value}/mi${pace.basis==='programmedIntervalTime'?' (interval-time basis)':''}`:'—';
}

function painFreeRunCount(runs){
 return runs.filter(item=>item.exercise.completed&&item.exercise.runPain!==''&&item.exercise.runPain!=null&&Number(item.exercise.runPain)===0).length;
}

function bestPaceByStage(runs){
 const stages=new Map();
 runs.forEach(({exercise})=>{
  const stage=Number(exercise.runStage);
  const pace=calculatedPaceDetails(exercise);
  const seconds=parsePace(pace.value);
  if(!stage||!seconds)return;
  if(!stages.has(stage)||seconds<stages.get(stage))stages.set(stage,seconds);
 });
 return [...stages.entries()].sort((a,b)=>a[0]-b[0]).map(([stage,seconds])=>({stage,pace:formatPace(seconds)}));
}

function bestDeadlift(variations){
 const values=entries.flatMap(entry=>entry.exercises||[])
  .filter(exercise=>exerciseIdentity(exercise)==='deadlift'&&variations.includes(exercise.variation))
  .map(totalLoadValue).filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${formatLoad(Math.max(...values))} lb`:'—';
}

function bestExerciseLoad(exerciseId){
 const values=entries.flatMap(entry=>entry.exercises||[])
  .filter(exercise=>exerciseIdentity(exercise)===exerciseId)
  .map(exercise=>Number(exercise.load))
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${formatLoad(Math.max(...values))} lb`:'—';
}

function armSupersetSessionCount(){
 return entries.filter(entry=>{
  const completed=new Set((entry.exercises||[]).filter(exercise=>exercise.completed).map(exerciseIdentity));
  return completed.has('dumbbellCurl')&&completed.has('tricepsPressdown');
 }).length;
}

function bestNum(ids,field,suffix){
 const accepted=Array.isArray(ids)?ids:[ids];
 const values=entries.flatMap(entry=>entry.exercises||[])
  .filter(exercise=>accepted.includes(exerciseIdentity(exercise)))
  .map(exercise=>Number(exercise[field]))
  .filter(value=>Number.isFinite(value)&&value>0);
 return values.length?`${Math.max(...values)}${suffix}`:'—';
}

function bestRep(exerciseId){
 const values=entries.flatMap(entry=>entry.exercises||[])
  .filter(exercise=>exerciseIdentity(exercise)===exerciseId&&exercise.reps)
  .flatMap(exercise=>String(exercise.reps).split(',').map(Number))
  .filter(Number.isFinite);
 return values.length?Math.max(...values):'—';
}

function bestTime(exerciseId){
 const values=entries.flatMap(entry=>entry.exercises||[])
  .filter(exercise=>exerciseIdentity(exercise)===exerciseId&&exercise.times)
  .flatMap(exercise=>String(exercise.times).split(',').map(value=>parseTime(value.trim())))
  .filter(value=>value>0);
 return values.length?fmtSec(Math.max(...values)):'—';
}

function summary(exercise){
 const parts=[];
 const pace=['run','interval'].includes(exercise.type)?calculatedPaceDetails(exercise):{value:'',basis:''};
 if(exercise.variation)parts.push(exercise.variation);
 if(exercise.runStage&&exercise.runStage!=='manual')parts.push(`run stage ${exercise.runStage}`);
 if(exercise.load){
  const total=totalLoadValue(exercise);
  if(exercise.type==='weighted'&&exercise.loadMode==='platesPerSide'){
   parts.push(`${formatLoad(total)} lb total (${formatLoad(exercise.barWeight||0)} lb bar + ${formatLoad(exercise.load)} lb/side × 2)`);
  }else if(exercise.type==='weighted'&&exercise.loadMode==='plates'){
   parts.push(`${formatLoad(total)} lb total (${formatLoad(exercise.load)} lb combined plates + ${formatLoad(exercise.barWeight||0)} lb bar)`);
  }else if(exercise.type==='weighted'&&exercise.loadMode==='total'){
   parts.push(`${formatLoad(total)} lb total`);
  }else{
   parts.push(`${exercise.load}${exercise.unit?` ${exercise.unit}`:' lb'}`);
  }
 }
 if(exercise.sets)parts.push(`${exercise.sets} sets`);
 if(exercise.reps)parts.push(`reps ${exercise.reps}`);
 if(exercise.times)parts.push(`times ${exercise.times}`);
 if(exercise.runMinutes||exercise.walkMinutes)parts.push(`${exercise.walkMinutes||0} min walk / ${exercise.runMinutes||0} min run`);
 if(exercise.continuousMinutes)parts.push(`${exercise.continuousMinutes} min continuous`);
 if(exercise.programmedIntervalTime)parts.push(`programmed ${exercise.programmedIntervalTime}`);
 if(exercise.totalTime)parts.push(`elapsed ${exercise.totalTime}`);
 if(exercise.completedRounds)parts.push(`${exercise.completedRounds}${exercise.rounds?`/${exercise.rounds}`:''} rounds completed`);
 else if(exercise.rounds&&['run','interval'].includes(exercise.type))parts.push(`${exercise.rounds} rounds planned`);
 if(exercise.type==='circuit'&&exercise.rounds)parts.push(`${exercise.rounds} rounds completed`);
 if(exercise.distance){
  const unit=['run','interval'].includes(exercise.type)?'mi':exercise.type==='carry'?'yd':exercise.outputUnit||'';
  parts.push(`${exercise.distance}${unit?` ${unit}`:''}`);
 }
 if(pace.value)parts.push(`calculated pace ${pace.value}/mi${pace.basis==='programmedIntervalTime'?' (interval-time basis)':''}`);
 if(exercise.deviceReportedPace)parts.push(`device pace ${exercise.deviceReportedPace}/mi`);
 if(exercise.warmupMinutes)parts.push(`${exercise.warmupMinutes} min warm-up`);
 if(exercise.cooldownMinutes)parts.push(`${exercise.cooldownMinutes} min cooldown`);
 if(exercise.walkSpeed)parts.push(`walk ${exercise.walkSpeed} mph`);
 if(exercise.runSpeed)parts.push(`run ${exercise.runSpeed} mph`);
 if(exercise.runEnvironment)parts.push(exercise.runEnvironment);
 if(exercise.treadmillIncline)parts.push(`${exercise.treadmillIncline}% incline`);
 if(exercise.minutes)parts.push(`${exercise.minutes} min`);
 if(exercise.carryLoad)parts.push(`carry ${exercise.carryLoad} lb/hand`);
 if(exercise.carrySeconds)parts.push(`${exercise.carrySeconds} sec carry`);
 if(exercise.stepReps)parts.push(`${exercise.stepReps} step-ups/side`);
 if(exercise.restSeconds)parts.push(`${exercise.restSeconds} sec rest`);
 if(exercise.modality)parts.push(exercise.modality);
 if(exercise.intervalSeconds)parts.push(`${exercise.intervalSeconds} sec hard interval`);
 if(exercise.avgHr)parts.push(`avg HR ${exercise.avgHr}`);
 if(exercise.maxHr)parts.push(`max HR ${exercise.maxHr}`);
 if(exercise.runPain!==''&&exercise.runPain!=null)parts.push(`run discomfort ${exercise.runPain}/10`);
 if(exercise.sledLoad)parts.push(`legacy sled ${exercise.sledLoad} lb`);
 if(exercise.structure)parts.push(exercise.structure);
 if(exercise.rpe)parts.push(`RPE ${exercise.rpe}`);
 return parts.join(' · ')||(exercise.completed?'completed':exercise.prescription);
}

function filtered(){
 const from=$('exportFrom').value,through=$('exportTo').value;
 return entries.filter(entry=>(!from||entry.date>=from)&&(!through||entry.date<=through)).sort((a,b)=>a.date.localeCompare(b.date));
}

function buildMd(){
 const selected=filtered();
 const from=$('exportFrom').value,through=$('exportTo').value;
 const primary=selected.filter(isPrimaryEntry);
 const recovery=selected.filter(entry=>entry.sessionType==='recovery');
 const minutes=selected.reduce((total,entry)=>total+Number(entry.duration||0),0);
 const rpes=selected.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const averageRpe=rpes.length?(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1):'not recorded';
 const stage=getRunStage(PROGRAM.currentRunStage);
 const weeks=weeklyMetrics(selected);
 let output=`# AFT Training Update\n\n`;
 output+=`**Program:** ${PROGRAM.name} · version ${PROGRAM.version}  \n`;
 output+=`**Program effective date:** ${dateFmt(PROGRAM.effectiveDate)}  \n`;
 output+=`**Period:** ${from?dateFmt(from):'Beginning'} through ${through?dateFmt(through):'Latest'}  \n`;
 output+=`**Primary sessions:** ${primary.length}  \n`;
 output+=`**Recovery sessions:** ${recovery.length}  \n`;
 output+=`**Logged training time:** ${minutes?`${minutes} minutes`:'not recorded'}  \n`;
 output+=`**Average session RPE:** ${averageRpe}  \n`;
 output+=`**Current coach-directed run stage:** Stage ${stage.id} — ${stage.label}\n\n`;
 if(weeks.length){
  output+='## Weekly test-event volume\n\n| Week of | Hand-release push-ups | Front-plank time |\n|---|---:|---:|\n';
  weeks.slice().reverse().forEach(week=>{
   output+=`| ${dateFmt(week.week)} | ${week.pushups} reps | ${fmtSec(week.plankSeconds)} |\n`;
  });
  output+='\n';
 }
 if(!selected.length){
  output+='No workouts were logged during this period.\n\n';
 }else{
  output+='## Sessions\n\n';
  selected.forEach(entry=>{
   output+=`### ${dateFmt(entry.date)} — ${entry.dayLabel}\n\n`;
   output+=`Program: ${entry.programName||'Legacy program'}${entry.programVersion?` · version ${entry.programVersion}`:''}  \n`;
   const metadata=[];
   if(entry.duration)metadata.push(`${entry.duration} min`);
   if(entry.targetSessionRpe)metadata.push(`target session RPE ${entry.targetSessionRpe}`);
   if(entry.sessionRpe)metadata.push(`session RPE ${entry.sessionRpe}/10`);
   if(entry.activeRunStage)metadata.push(`active run stage ${entry.activeRunStage}`);
   if(entry.bodyWeight)metadata.push(`${entry.bodyWeight} lb body weight`);
   if(entry.preSoreness!=='')metadata.push(`pre-session soreness ${entry.preSoreness}/10`);
   if(entry.readiness)metadata.push(`readiness ${readinessLabel(entry.readiness)}`);
   if(entry.painDuring!=='')metadata.push(`pain during session ${entry.painDuring}/10${entry.painLocation?` (${entry.painLocation})`:''}`);
   else if(entry.painScore!==''&&entry.painScore!=null)metadata.push(`legacy pain/discomfort ${entry.painScore}/10`);
   if(entry.postSoreness!=='')metadata.push(`post-session soreness ${entry.postSoreness}/10`);
   if(metadata.length)output+=metadata.join(' · ')+'\n\n';
   const definition=definitionForSavedEntry(entry);
   definition.exercises.forEach((planned,index)=>{
    const completed=findSavedExercise(planned,entry.exercises||[],index);
    output+=markdownExercise(planned,completed);
   });
   if(entry.notes)output+=`\n${markdownTextBlock('Post-session notes',entry.notes)}`;
   output+='\n';
  });
 }
 return output+'## Coaching request\n\nReview this training block, compare the completed results with the prescribed targets, identify recovery or injury concerns, and provide the next coach-directed program update while keeping the November Army Fitness Test goal in mind.\n';
}

function markdownExercise(planned,completed){
 const target=planned.targetRpe?` · target RPE ${planned.targetRpe}`:'';
 const coaching=planned.coachingNotes?` · ${planned.coachingNotes}`:'';
 let output=`- **${planned.name}**\n`;
 output+=`  - Planned: ${planned.prescription}${target}${coaching}\n`;
 output+=`  - Status: ${completed?.completed?'Completed':'Not marked complete'}\n`;
 if(completed&&['interval','run'].includes(completed.type)){
  output+=markdownRunResult(completed);
 }else{
  output+=`  - Completed result: ${completed&&(completed.completed||hasData(completed))?summary(completed):'No result recorded'}\n`;
 }
 if(completed?.notes)output+=markdownTextBlock('Exercise notes',completed.notes,'  ');
 return output;
}

function markdownRunResult(exercise){
 const programmedSeconds=programmedRunSeconds(exercise);
 const programmed=exercise.programmedIntervalTime||(programmedSeconds?formatTimerSeconds(programmedSeconds):'');
 const pace=calculatedPaceDetails({...exercise,programmedIntervalTime:programmed});
 const completedRounds=exercise.completedRounds
  ?`${exercise.completedRounds}${exercise.rounds?`/${exercise.rounds}`:''} rounds`
  :'Not recorded';
 const stage=exercise.runStage&&exercise.runStage!=='manual'?`Stage ${exercise.runStage}`:'Manual / modified session';
 let output='';
 output+=`  - Stage completed: ${stage}\n`;
 output+=`  - Completed rounds: ${completedRounds}\n`;
 output+=`  - Programmed interval time: ${programmed||'Not recorded'}\n`;
 output+=`  - Total elapsed time: ${exercise.totalTime||'Not recorded'}\n`;
 output+=`  - Distance: ${exercise.distance?`${exercise.distance} miles`:'Not recorded'}\n`;
 const paceBasis=pace.basis==='totalElapsedTime'
  ?'based on total elapsed time'
  :pace.basis==='programmedIntervalTime'?'based on programmed interval time':'';
 output+=`  - Calculated average pace: ${pace.value?`${pace.value}/mi${paceBasis?` (${paceBasis})`:''}`:'Not available'}\n`;
 output+=`  - Device-reported pace: ${exercise.deviceReportedPace?`${exercise.deviceReportedPace}/mi`:'Not recorded'}\n`;
 output+=`  - Run/walk structure: ${exercise.structure||exercise.runTarget||'Not recorded'}\n`;
 output+=`  - Run discomfort: ${exercise.runPain!==''&&exercise.runPain!=null?`${exercise.runPain}/10`:'Not recorded'}\n`;
 output+=`  - Exercise RPE: ${exercise.rpe?`${exercise.rpe}/10`:'Not recorded'}\n`;
 if(exercise.warmupMinutes)output+=`  - Warm-up duration: ${exercise.warmupMinutes} minutes\n`;
 if(exercise.cooldownMinutes)output+=`  - Cooldown duration: ${exercise.cooldownMinutes} minutes\n`;
 if(exercise.walkSpeed)output+=`  - Walking speed: ${exercise.walkSpeed} mph\n`;
 if(exercise.runSpeed)output+=`  - Running speed: ${exercise.runSpeed} mph\n`;
 if(exercise.runEnvironment)output+=`  - Run setting: ${exercise.runEnvironment}\n`;
 if(exercise.treadmillIncline)output+=`  - Treadmill incline: ${exercise.treadmillIncline}%\n`;
 if(exercise.avgHr)output+=`  - Average heart rate: ${exercise.avgHr} bpm\n`;
 if(exercise.maxHr)output+=`  - Maximum heart rate: ${exercise.maxHr} bpm\n`;
 return output;
}

function markdownTextBlock(label,value,indent=''){
 const lines=String(value||'').replace(/\r/g,'').split('\n');
 return `${indent}- ${label}:\n${lines.map(line=>`${indent}  > ${line||' '}`).join('\n')}\n`;
}

function updatePreview(){
 $('markdownPreview').value=buildMd();
}

async function copyMd(){
 const textValue=buildMd();
 $('markdownPreview').value=textValue;
 try{
  await navigator.clipboard.writeText(textValue);
 }catch{
  $('markdownPreview').select();
  document.execCommand('copy');
 }
 toast('Chat update copied');
}

function buildJsonBackup(){
 return {
  app:'AFT Workout Tracker',
  version:DATA_VERSION,
  exportedAt:new Date().toISOString(),
  currentProgram:currentProgramMeta(),
  entries
 };
}

function exportJson(){
 const payload=buildJsonBackup();
 download(JSON.stringify(payload,null,2),`aft-workout-backup-${today()}.json`,'application/json');
 try{
  localStorage.setItem(BACKUP_META_KEY,JSON.stringify({at:new Date().toISOString(),entryCount:entries.length}));
 }catch{}
 renderStorageStatus();
 toast('JSON backup downloaded');
}

function buildCsv(){
 const headers=[
  'date','session_type','day','program_id','program_name','program_version','program_effective_date','active_run_stage',
  'target_session_rpe','duration_minutes','session_rpe','body_weight_lb','pre_session_soreness',
  'pre_session_readiness','pain_during_session','pain_location','legacy_pain_discomfort',
  'post_session_soreness','exercise_id','exercise','planned_prescription','target_exercise_rpe',
  'variation','entered_load','load_entry_mode','plate_weight_per_side','bar_weight','total_load',
  'sets','reps_by_set','times_by_set','run_stage','run_walk_structure','walk_interval_minutes','run_interval_minutes',
  'programmed_interval_time','total_elapsed_time','distance_miles','calculated_average_pace','pace_calculation_basis',
  'device_reported_pace','warmup_minutes','cooldown_minutes','walking_speed_mph','running_speed_mph',
  'run_environment','treadmill_incline_percent','average_hr','maximum_hr','run_rpe','run_discomfort','rounds_planned','rounds_completed',
  'completed','completed_result','exercise_notes','session_notes'
 ];
 const rows=[headers];
 entries.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(entry=>{
  (entry.exercises||[]).forEach(exercise=>{
   const isRun=['run','interval'].includes(exercise.type);
   const pace=isRun?calculatedPaceDetails(exercise):{value:'',basis:''};
   rows.push([
    entry.date,entry.sessionType||'primary',entry.dayLabel,entry.programId||'',entry.programName||'',
    entry.programVersion||'',entry.programEffectiveDate||'',entry.activeRunStage??'',entry.targetSessionRpe||'',entry.duration,
    entry.sessionRpe,entry.bodyWeight,entry.preSoreness,entry.readiness,entry.painDuring,entry.painLocation,
    entry.painScore,entry.postSoreness,exerciseIdentity(exercise),exercise.name,exercise.prescription,
    exercise.targetRpe||'',exercise.variation||'',exercise.load||'',exercise.loadMode||'',
    exercise.loadMode==='platesPerSide'?exercise.load||'':'',exercise.barWeight||'',totalLoadValue(exercise)??'',
    exercise.sets||'',exercise.reps||'',exercise.times||'',exercise.runStage||'',isRun?exercise.structure||exercise.runTarget||'':'',
    isRun?exercise.walkMinutes||'':'',isRun?exercise.runMinutes||'':'',isRun?exercise.programmedIntervalTime||'':'',
    isRun?exercise.totalTime||'':'',isRun?exercise.distance||'':'',pace.value,pace.basis,
    isRun?exercise.deviceReportedPace||'':'',isRun?exercise.warmupMinutes||'':'',isRun?exercise.cooldownMinutes||'':'',
    isRun?exercise.walkSpeed||'':'',isRun?exercise.runSpeed||'':'',isRun?exercise.runEnvironment||'':'',
    isRun?exercise.treadmillIncline||'':'',isRun?exercise.avgHr||'':'',isRun?exercise.maxHr||'':'',
    isRun?exercise.rpe||'':'',isRun?exercise.runPain||'':'',exercise.rounds||'',exercise.completedRounds||'',
    exercise.completed?'yes':'no',summary(exercise),exercise.notes||'',entry.notes||''
   ]);
  });
 });
 return rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
}

function exportCsv(){
 download(buildCsv(),`aft-workouts-${today()}.csv`,'text/csv');
}

async function importJson(event){
 const file=event.target.files?.[0];
 if(!file)return;
 try{
  const parsed=JSON.parse(await file.text());
  const incoming=Array.isArray(parsed)?parsed:parsed.entries;
  if(!Array.isArray(incoming))throw new Error('missing entries');
  const clean=incoming.map(normalizeEntry);
  if(clean.some(entry=>!entry))throw new Error('invalid entry');
  if(!confirm(`Import ${clean.length} workouts? Matching IDs will be replaced. A restore point will be kept first.`))return;
  createSnapshot('Before JSON import');
  const merged=new Map(entries.map(entry=>[entry.id,entry]));
  clean.forEach(entry=>merged.set(entry.id,entry));
  entries=[...merged.values()].sort(compareEntries);
  if(!persistEntries('Before writing imported workouts',{snapshot:false}))throw new Error('storage failed');
  renderHistory();
  renderProgress();
  renderRunProgress($('daySelect').value);
  updatePreview();
  renderStorageStatus();
  toast('Backup imported');
 }catch{
  alert('That file is not a valid AFT Workout Tracker backup.');
 }finally{
  event.target.value='';
 }
}

function normalizeExercise(exercise){
 if(!exercise||typeof exercise!=='object')return null;
 const normalized={...exercise};
 if(normalized.name==='Trap-bar deadlift'&&!normalized.variation)normalized.variation='Trap / hex bar';
 return normalized;
}

function normalizeEntry(entry){
 if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id||typeof entry.date!=='string'||!entry.date||!SESSIONS[entry.dayKey])return null;
 const current=SESSIONS[entry.dayKey];
 return {
  ...entry,
  dayLabel:typeof entry.dayLabel==='string'&&entry.dayLabel?entry.dayLabel:current.label,
  sessionType:entry.sessionType||current.sessionType||'primary',
  duration:entry.duration??'',
  sessionRpe:entry.sessionRpe??'',
  bodyWeight:entry.bodyWeight??'',
  painScore:entry.painScore??'',
  preSoreness:entry.preSoreness??'',
  readiness:entry.readiness??'',
  painDuring:entry.painDuring??'',
  painLocation:entry.painLocation??'',
  postSoreness:entry.postSoreness??'',
  notes:entry.notes??entry.postSessionNotes??'',
  updatedAt:typeof entry.updatedAt==='string'&&entry.updatedAt?entry.updatedAt:`${entry.date}T12:00:00.000Z`,
  exercises:Array.isArray(entry.exercises)?entry.exercises.map(normalizeExercise).filter(Boolean):[]
 };
}

function loadEntries(){
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(parsed)?parsed.map(normalizeEntry).filter(Boolean).sort(compareEntries):[];
 }catch{
  return [];
 }
}

function persistEntries(reason,{snapshot=true}={}){
 try{
  if(snapshot)createSnapshot(reason);
  localStorage.setItem(KEY,JSON.stringify(entries));
  return true;
 }catch(error){
  console.error('Unable to save workout data',error);
  return false;
 }
}

function createSnapshot(reason,raw=localStorage.getItem(KEY)){
 if(raw==null)return;
 try{
  const snapshots=loadSnapshots();
  snapshots.unshift({id:id(),createdAt:new Date().toISOString(),reason,raw});
  localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshots.slice(0,MAX_SNAPSHOTS)));
 }catch(error){
  console.warn('Unable to create local restore point',error);
 }
}

function loadSnapshots(){
 try{
  const parsed=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'[]');
  return Array.isArray(parsed)?parsed.filter(snapshot=>snapshot&&typeof snapshot.raw==='string'):[];
 }catch{
  return [];
 }
}

function ensureMigrationSnapshot(){
 try{
  const currentVersion=Number(localStorage.getItem(DATA_VERSION_KEY)||0);
  const raw=localStorage.getItem(KEY);
  if(currentVersion!==DATA_VERSION&&raw){
   createSnapshot(`Before app data migration to version ${DATA_VERSION}`,raw);
  }
  localStorage.setItem(DATA_VERSION_KEY,String(DATA_VERSION));
 }catch{}
}

function restoreLatestSnapshot(){
 const snapshot=loadSnapshots()[0];
 if(!snapshot){
  toast('No local restore point is available');
  return;
 }
 if(!confirm(`Restore workout data from ${dateTimeFmt(snapshot.createdAt)} (${snapshot.reason})? Your current data will also be saved as a restore point.`))return;
 try{
  createSnapshot('Before restoring previous data');
  localStorage.setItem(KEY,snapshot.raw);
  entries=loadEntries();
  editing=null;
  clearDraft();
  resetSessionTimer();
  newWorkout(false);
  renderHistory();
  renderProgress();
  updatePreview();
  renderStorageStatus();
  toast('Previous workout data restored');
 }catch{
  alert('The local restore point could not be restored.');
 }
}

function scheduleDraft(){
 if(suppressDraft)return;
 clearTimeout(draftTimer);
 draftTimer=setTimeout(saveDraftNow,350);
}

function saveDraftNow(){
 if(suppressDraft||!activeSessionDefinition||!$('workoutForm'))return;
 clearTimeout(draftTimer);
 try{
  localStorage.setItem(DRAFT_KEY,JSON.stringify({
   savedAt:new Date().toISOString(),
   editingId:editing,
   item:collectWorkoutItem({draft:true})
  }));
  persistSessionTimer();
 }catch{}
}

function loadDraft(){
 try{
  const parsed=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');
  return parsed?.item&&SESSIONS[parsed.item.dayKey]?parsed:null;
 }catch{
  return null;
 }
}

function clearDraft(){
 clearTimeout(draftTimer);
 try{localStorage.removeItem(DRAFT_KEY)}catch{}
}

async function requestStorageProtection(){
 if(!navigator.storage?.persist){
  $('storageStatus').textContent='This browser does not offer a persistent-storage control. Local autosave, restore points, and downloads still work.';
  return;
 }
 try{
  const already=await navigator.storage.persisted();
  const granted=already||await navigator.storage.persist();
  $('storageStatus').textContent=granted
   ?'Device storage protection is active. The browser should be less likely to evict this app’s data.'
   :'The browser did not grant protected storage. Keep periodic downloaded JSON backups.';
 }catch{
  $('storageStatus').textContent='Storage protection status could not be checked. Keep periodic downloaded JSON backups.';
 }
}

async function renderStorageStatus(){
 const snapshots=loadSnapshots();
 $('restoreSnapshotButton').disabled=!snapshots.length;
 const latest=snapshots[0];
 $('restoreSnapshotButton').textContent=latest?`Restore previous data (${snapshots.length})`:'Restore previous data';
 let storageText='Local autosave and rolling restore points are active.';
 try{
  if(navigator.storage?.persisted&&await navigator.storage.persisted()){
   storageText='Protected device storage is active. Local autosave and rolling restore points are also active.';
  }
 }catch{}
 $('storageStatus').textContent=storageText+(latest?` Latest restore point: ${dateTimeFmt(latest.createdAt)}.`:'');
 let meta=null;
 try{meta=JSON.parse(localStorage.getItem(BACKUP_META_KEY)||'null')}catch{}
 if(meta?.at){
  $('backupStatus').textContent=`Last downloaded JSON backup: ${dateTimeFmt(meta.at)} · ${meta.entryCount??0} workouts.`;
 }else{
  $('backupStatus').textContent='No downloaded JSON backup has been recorded on this device.';
 }
 const reminder=backupReminder(meta);
 $('backupReminder').classList.toggle('hidden',!reminder);
 $('backupReminder').textContent=reminder;
}

function backupReminder(meta){
 if(!entries.length)return '';
 if(!meta?.at)return entries.length>=3?'Backup reminder: download a JSON copy now that you have several saved workouts.':'';
 const age=Date.now()-new Date(meta.at).getTime();
 const added=entries.length-Number(meta.entryCount||0);
 return age>7*24*60*60*1000||added>=4
  ?'Backup reminder: your downloaded JSON copy is over a week old or several workouts behind.'
  :'';
}

function hasData(exercise){
 if(!exercise)return false;
 if(['run','interval'].includes(exercise.type)&&!exercise.completed){
  return ['completedRounds','distance','totalTime','deviceReportedPace','warmupMinutes','cooldownMinutes','walkSpeed','runSpeed','runEnvironment','treadmillIncline','avgHr','maxHr','rpe','runPain','notes'].some(field=>exercise[field]);
 }
 const ignored=[
  'exerciseId','templateId','id','name','prescription','type','unit','targetRpe','completed','variation',
  'loadMode','barWeight','totalLoad','runStage','runTarget','structure','rounds','carryLoad','carrySeconds',
  'stepReps','intervalSeconds','restSeconds','programmedIntervalTime','calculatedPace','paceBasis'
 ];
 if(['weighted','body','timed','carry'].includes(exercise.type))ignored.push('sets');
 return Object.entries(exercise).some(([key,value])=>!ignored.includes(key)&&value!==''&&value!=null);
}

function readinessLabel(value){
 return ({1:'1 — Very poor',2:'2 — Below average',3:'3 — Normal',4:'4 — Good',5:'5 — Excellent'})[Number(value)]||String(value||'not recorded');
}

function setExportDates(){
 const end=new Date(),start=new Date(end);
 start.setDate(end.getDate()-30);
 $('exportFrom').value=iso(start);
 $('exportTo').value=today();
}

function download(content,name,type){
 const blob=new Blob([content],{type});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download=name;
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function grid(...items){
 return `<div class="form-grid">${items.join('')}</div>`;
}

function num(field,label,value,min=0,max=null,step=.5){
 return `<label>${label}<input data-field="${field}" type="number" value="${attr(value)}" ${min!=null?`min="${min}"`:''} ${max!=null?`max="${max}"`:''} step="${step}" inputmode="decimal"></label>`;
}

function text(field,label,value,placeholder=''){
 return `<label>${label}<input data-field="${field}" value="${attr(value)}" placeholder="${attr(placeholder)}"></label>`;
}

function select(field,label,value,options){
 const normalized=options.map(option=>typeof option==='object'?option:{value:String(option),label:String(option)});
 return `<label>${label}<select data-field="${field}"><option value="">Select…</option>${normalized.map(option=>`<option value="${attr(option.value)}" ${String(option.value)===String(value??'')?'selected':''}>${esc(option.label)}</option>`).join('')}</select></label>`;
}

function today(){
 return iso(new Date());
}

function iso(date){
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,'0');
 const day=String(date.getDate()).padStart(2,'0');
 return `${year}-${month}-${day}`;
}

function dateFmt(value){
 return new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}

function dateTimeFmt(value){
 const date=new Date(value);
 return Number.isNaN(date.getTime())?'Unknown time':date.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}

function timeFmt(value){
 const date=new Date(value);
 return Number.isNaN(date.getTime())?'an earlier session':date.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
}

function parseTime(value){
 if(!value)return 0;
 const parts=String(value).split(':').map(Number);
 if(parts.some(part=>!Number.isFinite(part)))return 0;
 return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts.length===2?parts[0]*60+parts[1]:Number(value);
}

function fmtSec(seconds){
 const rounded=Math.round(seconds);
 return `${Math.floor(rounded/60)}:${String(rounded%60).padStart(2,'0')}`;
}

function id(){
 return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let toastTimer;
function toast(message){
 const element=$('toast');
 element.textContent=message;
 element.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>element.classList.remove('show'),2400);
}
