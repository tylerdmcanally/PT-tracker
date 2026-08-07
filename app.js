const PROGRAM=window.AFT_PROGRAM_CONFIG;
const RUN_STAGES=PROGRAM.runStages;
const SESSIONS=PROGRAM.sessions;
const ROTATION=PROGRAM.rotation;
const CIRCUIT_TEMPLATES=PROGRAM.circuitTemplates||{};

const KEY='aftWorkoutEntries.v1';
const DRAFT_KEY='aftWorkoutDraft.v1';
const SNAPSHOT_KEY='aftWorkoutSnapshots.v1';
const TIMER_KEY='aftSessionTimer.v1';
const BACKUP_META_KEY='aftBackupMeta.v1';
const DATA_VERSION_KEY='aftDataVersion.v1';
const DATA_VERSION=11;
const MAX_SNAPSHOTS=5;
const WEEKLY_SKILL_DOSE_GROUP_ID='aft_pushup_plank_microdose';

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
 'Dumbbell lateral raises':'lateralRaise','Lateral raises':'lateralRaise',
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
 'Lateral step-ups':'lateralStepUps','Hard cardio':'hardCardio','Rest':'circuitRest',
 'Backward sled drag':'backwardSledDrag','Forward sled push':'forwardSledPush',
 'Primary run':'primaryRun','Mobility':'mobility',
 'Easy stationary bike or walk':'recoveryCardio','Gentle mobility':'recoveryMobility'
};

const EXERCISE_ID_ALIASES={
 trapBarDeadlift:'deadlift',legPress:'squatOrLegPress',seatedCableRow:'seatedRow',farmerCarry:'loadedCarry',
 frontPlank:'plank',cableTricepsPressdown:'tricepsPressdown',primaryRun:'runWalkIntervals'
};

const VARIATION_ID_BY_LABEL={
 'Trap / hex bar':'trapBar','Conventional barbell':'conventionalBarbell','Sumo barbell':'sumoBarbell','Dumbbells':'dumbbells',
 'Leg press':'unspecifiedLegPress','Lying leg press':'lyingLegPress','Upright leg press':'uprightLegPress',
 'Plate-loaded leg press':'plateLoadedLegPress','Selectorized leg press':'selectorizedLegPress','Other leg press':'otherLegPress',
 'Dumbbell bench press':'dumbbellBenchPress','Barbell bench press':'barbellBenchPress','Chest-press machine':'machineChestPress',
 'Lat pulldown':'latPulldown','Assisted pull-up':'assistedPullup','Band-assisted pull-up':'assistedPullup',
 'Seated cable row':'seatedCableRow','Chest-supported machine row':'machineRow','Chest-supported dumbbell row':'chestSupportedDumbbellRow',
 'Dumbbell row':'chestSupportedDumbbellRow','Machine row':'machineRow','T-bar row':'tBarRow',
 'Farmer carry':'farmerCarry','Heavy static hold':'heavyStaticHold','Suitcase carry':'suitcaseCarry',
 'Dumbbell lateral raise':'dumbbellLateralRaise','Machine lateral raise':'machineLateralRaise',
 'Cable lateral raise':'cableLateralRaise','Cuffed-cable lateral raise':'cuffedCableLateralRaise'
};

let entries=[];
let editing=null;
let activeSessionDefinition=null;
let activeProgramContext=null;
let activeSavedExercises=[];
let activeWorkoutDate='';
let activeWeeklyOverride=false;
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
 persistKnownHistoricalCorrections();
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
 const options=keys=>keys.map(key=>{
  const session=SESSIONS[key];
  const suffix=session.optional&&!/^optional\b/i.test(session.label)?' — Optional':'';
  return `<option value="${attr(key)}">${esc(session.label+suffix)}</option>`;
 }).join('');
 $('daySelect').innerHTML=`<optgroup label="Primary rotation">${options(ROTATION)}</optgroup><optgroup label="Optional sessions">${options(['recovery','skillMicrodose'])}</optgroup>`;
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
  updateMicrodoseCaution();
  refreshAdherenceForEvent(event.target);
  refreshExerciseExtraForEvent(event.target);
  scheduleDraft();
 };
 $('workoutForm').onchange=event=>{
  updateMicrodoseCaution();
  refreshAdherenceForEvent(event.target);
  refreshExerciseExtraForEvent(event.target);
  scheduleDraft();
 };
 $('sessionDate').onchange=()=>{
  activeWorkoutDate=$('sessionDate').value||today();
  if(!editing)activeWeeklyOverride=false;
  refreshWeeklySkillDoseUi();
  scheduleDraft();
 };
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
 $('nextExerciseButton').onclick=scrollToNextExercise;
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

function sessionProgramMeta(definition){
 if(!definition?.templateId)return currentProgramMeta();
 return {
  id:definition.templateId,
  name:definition.templateName||definition.label,
  version:definition.templateVersion||'',
  effectiveDate:definition.templateEffectiveDate||'',
  runStage:''
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
  targetDuration:definition.targetDuration,
  coachInstructions:definition.coachInstructions,
  advancesPrimaryRotation:definition.advancesPrimaryRotation!==false,
  templateId:definition.templateId,
  templateName:definition.templateName,
  templateVersion:definition.templateVersion,
  templateEffectiveDate:definition.templateEffectiveDate,
  weeklySkillDoseGroupId:definition.weeklySkillDoseGroupId,
  frequency:definition.frequency,
  optional:Boolean(definition.optional),
  exercises:clone(definition.exercises)
 };
}

function definitionForSavedEntry(entry){
 const snapshot=entry?.prescriptionSnapshot;
 if(snapshot&&Array.isArray(snapshot.exercises)){
  const current=SESSIONS[snapshot.sessionKey||entry.dayKey];
  const exercises=snapshot.exercises.map(saved=>{
   const savedId=exerciseIdentity(saved);
   const currentDefinition=current?.exercises?.find(exercise=>canonicalExerciseId(exercise.id)===savedId)
    ||current?.exercises?.find(exercise=>exercise.name===saved.name);
   return mergeCurrentLoggingOptions(saved,currentDefinition);
  });
  return {
   key:snapshot.sessionKey||entry.dayKey,
   sessionType:snapshot.sessionType||entry.sessionType||'primary',
   label:snapshot.label||entry.dayLabel,
   focus:snapshot.focus||'Saved prescription',
   warmup:snapshot.warmup||'',
   targetSessionRpe:snapshot.targetSessionRpe||entry.targetSessionRpe||'',
   targetDuration:snapshot.targetDuration||'',
   coachInstructions:snapshot.coachInstructions||'',
   advancesPrimaryRotation:snapshot.advancesPrimaryRotation!==false,
   templateId:snapshot.templateId||entry.templateId||'',
   templateName:snapshot.templateName||entry.templateName||'',
   templateVersion:snapshot.templateVersion||entry.templateVersion||'',
   templateEffectiveDate:snapshot.templateEffectiveDate||entry.templateEffectiveDate||'',
   weeklySkillDoseGroupId:snapshot.weeklySkillDoseGroupId||entry.weeklySkillDoseGroupId||'',
   frequency:snapshot.frequency||'',
   optional:Boolean(snapshot.optional),
   exercises
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
  optional:['recovery','skill_microdose'].includes(entry.sessionType),
  advancesPrimaryRotation:entry.sessionType==='primary',
  templateId:entry.templateId||'',
  templateName:entry.templateName||'',
  templateVersion:entry.templateVersion||'',
  templateEffectiveDate:entry.templateEffectiveDate||'',
  weeklySkillDoseGroupId:entry.weeklySkillDoseGroupId||'',
  exercises
 };
}

function mergeCurrentLoggingOptions(saved,current){
 const merged=clone(saved);
 if(!current||!Array.isArray(current.variations))return merged;
 const savedVariations=Array.isArray(saved.variations)?saved.variations:[];
 merged.variations=[...new Set([...savedVariations,...current.variations])];
 if(!merged.defaultVariation&&current.defaultVariation)merged.defaultVariation=current.defaultVariation;
 if(current.barWeights||saved.barWeights)merged.barWeights={...(current.barWeights||{}),...(saved.barWeights||{})};
 if(Array.isArray(current.perSideVariations)||Array.isArray(saved.perSideVariations)){
  merged.perSideVariations=[...new Set([
   ...(Array.isArray(saved.perSideVariations)?saved.perSideVariations:[]),
   ...(Array.isArray(current.perSideVariations)?current.perSideVariations:[])
  ])];
 }
 if(Array.isArray(current.barWeightOptions)||Array.isArray(saved.barWeightOptions)){
  merged.barWeightOptions=[...new Set([
   ...(Array.isArray(saved.barWeightOptions)?saved.barWeightOptions:[]),
   ...(Array.isArray(current.barWeightOptions)?current.barWeightOptions:[])
  ])];
 }
 if(current.variationUnits||saved.variationUnits){
  merged.variationUnits={...(current.variationUnits||{}),...(saved.variationUnits||{})};
 }
 return merged;
}

function renderWorkout(saved=null,{preserveSession=false}={}){
 suppressDraft=true;
 const key=saved?.dayKey||$('daySelect').value||'day1';
 activeSessionDefinition=saved?definitionForSavedEntry(saved):currentSessionDefinition(key);
 activeWeeklyOverride=Boolean(saved?.weeklyFrequencyOverride);
 activeProgramContext=saved?{
  id:saved.programId||'',
  name:saved.programName||'',
  version:saved.programVersion||'',
  effectiveDate:saved.programEffectiveDate||'',
  runStage:saved.activeRunStage??saved.prescriptionSnapshot?.exercises?.find(exercise=>['interval','run'].includes(exercise.type))?.runStage??''
 }:sessionProgramMeta(activeSessionDefinition);
 activeSavedExercises=Array.isArray(saved?.exercises)?clone(saved.exercises):[];
 activeWorkoutDate=saved?.date||$('sessionDate').value||today();
 $('daySelect').value=key;
 const session=activeSessionDefinition;
 const parts=session.label.split('—');
 const isTemplate=session.sessionType==='skill_microdose';
 const summaryEyebrow=isTemplate?'OPTIONAL SESSION':`${parts[0].trim()}${session.optional?' · OPTIONAL':''}`;
 const contextName=saved?.templateName||session.templateName||activeProgramContext.name;
 const contextVersion=saved?.templateVersion||session.templateVersion||activeProgramContext.version;
 const contextEffective=saved?.templateEffectiveDate||session.templateEffectiveDate||activeProgramContext.effectiveDate;
 const programLine=saved
  ?(contextName&&contextVersion?`${contextName} · v${contextVersion}`:'Legacy saved workout')
  :`${contextName} · v${contextVersion}${contextEffective?` · effective ${dateFmt(contextEffective)}`:''}`;
 $('workoutSummary').innerHTML=`
  <p class="eyebrow">${esc(summaryEyebrow)}</p>
  <h2>${esc(parts.slice(1).join('—').trim()||session.label)}</h2>
  <p>${esc(session.focus)}</p>
  <p class="program-line">${isTemplate?'Auxiliary template: ':'Program: '}${esc(programLine)}${session.targetSessionRpe?` · target session RPE ${esc(session.targetSessionRpe)}`:''}${session.targetDuration?` · ${esc(session.targetDuration)}`:''}</p>
  ${isTemplate?'<p class="rotation-note">Does not advance the primary workout rotation or running stage.</p>':''}
  ${session.coachInstructions?`<aside class="microdose-instructions"><strong>Coach instructions</strong><p>${esc(session.coachInstructions)}</p></aside>`:''}
  <div data-weekly-skill-status></div>
  <div id="microdoseCaution" class="microdose-caution hidden" role="status"></div>
  ${session.warmup?`<p class="workout-warmup"><strong>${isTemplate?'Getting started':'Warm-up before Exercise 1'}:</strong> ${esc(session.warmup)}</p>`:''}`;
 renderRunProgress(key);
 clearRunTimer();
 $('exerciseList').innerHTML=renderExerciseList(session,saved);
 bindExerciseControls();
 updateWorkoutFlow();
 if(saved){
  $('sessionDate').value=saved.date;
  $('duration').value=saved.duration||'';
  $('sessionRpe').value=saved.sessionRpe||'';
  $('bodyWeight').value=saved.bodyWeight||'';
  $('preSoreness').value=saved.preSoreness??'';
  $('readiness').value=saved.readiness??'';
  $('sleepQuality').value=saved.sleepQuality??'';
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
 refreshWeeklySkillDoseUi();
 updateMicrodoseCaution();
 updateSessionTimer();
 suppressDraft=false;
}

function clearSessionFields(){
 ['duration','sessionRpe','bodyWeight','preSoreness','readiness','sleepQuality','painDuring','painLocation','postSoreness','legacyPainScore','sessionNotes']
  .forEach(id=>$(id).value='');
}

function updatePainVisibility(){
 const hasPain=Number($('painDuring').value)>0;
 $('painLocationWrap').classList.toggle('hidden',!hasPain);
}

function isSkillMicrodoseEntry(entry){
 return entry?.sessionType==='skill_microdose'||entry?.dayKey==='skillMicrodose';
}

function sessionCategoryLabel(entry){
 if(isSkillMicrodoseEntry(entry))return 'Skill microdose';
 if(entry?.sessionType==='recovery')return 'Recovery session';
 return 'Primary workout';
}

function resultSessionSource(entry,exercise){
 if(isSkillMicrodoseEntry(entry))return 'Skill microdose';
 if(entry?.sessionType==='recovery')return 'Recovery session';
 const identity=exerciseIdentity(exercise);
 if(entry?.dayKey==='day3'&&['handReleasePushups','plank'].includes(identity))return 'Day 3 optional practice';
 return 'Primary workout';
}

function skillDoseExerciseResult(entry,exerciseId){
 const exercise=(entry?.exercises||[]).find(item=>exerciseIdentity(item)===exerciseId);
 const performance=exerciseId==='handReleasePushups'
  ?parseSetValues(exercise?.reps).some(value=>String(value).trim()!=='')
  :parseSetValues(exercise?.times).some(value=>String(value).trim()!=='');
 return {completed:Boolean(exercise?.completed&&performance),performed:Boolean(exercise&&(exercise.completed||performance))};
}

function weeklySkillDoseEntryStatus(entry){
 const legacyDay3=entry?.dayKey==='day3'
  &&String(entry?.programVersion||'')!=='1.4'
  &&(!entry.weeklySkillDoseGroupId||entry.weeklySkillDoseGroupId===WEEKLY_SKILL_DOSE_GROUP_ID);
 const relevant=isSkillMicrodoseEntry(entry)||legacyDay3;
 if(!relevant)return null;
 const pushups=skillDoseExerciseResult(entry,'handReleasePushups');
 const plank=skillDoseExerciseResult(entry,'plank');
 if(pushups.completed&&plank.completed)return 'full';
 if(pushups.performed||plank.performed)return 'partial';
 return null;
}

function weeklySkillDoseState(value,{source=entries,excludeEntryId=''}={}){
 const week=weekStart(value||today());
 const inWeek=source.filter(entry=>
  (!excludeEntryId||entry.id!==excludeEntryId)
  &&entry.date>=week&&entry.date<=weekEnd(week)
 ).map(entry=>({entry,status:weeklySkillDoseEntryStatus(entry)})).filter(item=>item.status);
 const full=inWeek.find(item=>item.status==='full');
 const partial=inWeek.filter(item=>item.status==='partial');
 return {week,status:full?'full':partial.length?'partial':'available',full,partial};
}

function weeklySkillDoseMessage(state){
 if(state.status==='available')return {
  tone:'available',title:'Available this week',body:`No complete push-up and plank skill dose is logged for the week of ${dateFmt(state.week)}.`
 };
 if(state.status==='full'&&state.full&&state.full.entry.dayKey==='day3')return {
  tone:'complete',title:'Weekly skill dose already completed during Day 3',body:'The complete optional Day 3 push-up and plank bundle already satisfied this week’s dose.'
 };
 if(state.status==='full')return {
  tone:'complete',title:'Weekly microdose completed',body:`A complete skill microdose is already logged for ${dateFmt(state.full.entry.date)}.`
 };
 return {
  tone:'partial',title:'Some optional skill work already performed',body:'Part of this week’s push-up and plank practice is already logged. Skip this session or use the explicit coach-directed override; the prescription will not be rewritten.'
 };
}

function refreshWeeklySkillDoseUi(){
 if(!activeSessionDefinition)return;
 const date=$('sessionDate').value||activeWorkoutDate||today();
 const state=weeklySkillDoseState(date,{excludeEntryId:editing||''});
 const status=$('workoutSummary').querySelector('[data-weekly-skill-status]');
 const isMicrodose=activeSessionDefinition.sessionType==='skill_microdose';
 if(status){
  if(isMicrodose){
   const message=weeklySkillDoseMessage(state);
   const editingCopy=editing?'Editing this saved session. Saving updates it without creating a duplicate.':'';
   const locked=!editing&&!activeWeeklyOverride&&state.status!=='available';
   status.innerHTML=`<aside class="weekly-skill-status weekly-skill-${attr(message.tone)}">
    <strong>${esc(editing?'Saved weekly microdose':message.title)}</strong>
    <p>${esc(editingCopy||message.body)}</p>
    ${locked?'<button class="secondary" type="button" data-weekly-skill-override>Start additional skill session</button>':''}
    ${activeWeeklyOverride?'<p class="weekly-override-active">Additional-session override acknowledged. This save will record that standard weekly frequency was exceeded.</p>':''}
   </aside>`;
   status.querySelector('[data-weekly-skill-override]')?.addEventListener('click',startAdditionalSkillSession);
  }else status.innerHTML='';
 }
 const locked=isMicrodose&&!editing&&!activeWeeklyOverride&&state.status!=='available';
 $('workoutForm').classList.toggle('microdose-locked',locked);
 refreshDay3WeeklySkillGroup(state);
}

function startAdditionalSkillSession(){
 const acknowledged=confirm('The normal weekly push-up and plank skill dose has already been partly or fully completed. Start an additional coach-directed skill session and record that the standard weekly frequency was exceeded?');
 if(!acknowledged)return;
 activeWeeklyOverride=true;
 refreshWeeklySkillDoseUi();
 scheduleDraft();
 toast('Additional skill session unlocked · weekly override will be recorded');
}

function refreshDay3WeeklySkillGroup(state){
 const group=document.querySelector('.exercise-group[data-group-key="testSkillPractice"]');
 if(!group)return;
 const suppress=activeSessionDefinition?.key==='day3'&&!editing&&state.status==='full';
 const status=group.querySelector('[data-weekly-group-status]');
 if(status)status.innerHTML=suppress
  ?'<aside class="weekly-group-satisfied"><strong>Weekly skill dose already completed</strong><p>Omit this optional push-up and plank work for this rotation.</p></aside>'
  :'';
 group.classList.toggle('weekly-skill-satisfied',suppress);
 group.querySelectorAll('.exercise-card').forEach(card=>{
  card.dataset.weeklyDisabled=suppress?'true':'';
  card.querySelectorAll('input, select, textarea, button').forEach(control=>{
   if(suppress){
    if(!control.disabled)control.dataset.weeklyDisabled='true';
    control.disabled=true;
   }else if(control.dataset.weeklyDisabled==='true'){
    control.disabled=false;
    delete control.dataset.weeklyDisabled;
   }
  });
 });
 updateWorkoutFlow();
}

function updateMicrodoseCaution(){
 const caution=document.getElementById('microdoseCaution');
 if(!caution)return;
 const isMicrodose=activeSessionDefinition?.sessionType==='skill_microdose';
 const reasons=[];
 if(Number($('preSoreness').value)>2)reasons.push('soreness is above 2/10');
 if($('readiness').value&&Number($('readiness').value)<=2)reasons.push('readiness is below normal');
 if(Number($('painDuring').value)>0)reasons.push('pain has been recorded');
 const show=isMicrodose&&reasons.length;
 caution.classList.toggle('hidden',!show);
 caution.textContent=show?`Caution: ${reasons.join(', ')}. This is optional technique practice; consider skipping it if normal movement is affected. This is not a diagnosis.`:'';
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
    html+=`<section class="exercise-group" data-group-key="${attr(groupKey)}" aria-label="${attr(group.label||groupKey)}">
     <div class="exercise-group-heading">
      <p class="eyebrow">${esc(group.eyebrow||'TRAINING BLOCK')}</p>
      <h2>${esc(group.label||groupKey)}</h2>
      <p>${esc(group.instruction||'')}</p>
      ${group.weeklySkillDoseGroupId?'<div data-weekly-group-status></div>':''}
     </div><div class="exercise-group-cards">`;
   }
  }
  const state=findSavedExercise(definition,savedExercises,index)||defaultExerciseState(definition);
  html+=exerciseCard(definition,visibleIndex,state,{showPrevious:true});
  visibleIndex+=1;
 });
 if(openGroup)html+='</div></section>';
 return html;
}

function workoutFlowState(){
 const definitions=activeSessionDefinition?.exercises||[];
 const cards=[...document.querySelectorAll('.exercise-card')];
 const items=definitions.map((definition,index)=>({
  definition,
  card:cards[index],
  completed:Boolean(cards[index]?.querySelector('.exercise-complete')?.checked),
  optional:isOptionalExercise(definition),
  weeklyDisabled:cards[index]?.dataset.weeklyDisabled==='true'
 }));
 const activeItems=items.filter(item=>!item.weeklyDisabled);
 const required=activeItems.filter(item=>!item.optional);
 const optional=activeItems.filter(item=>item.optional);
 return {
  required,
  optional,
  completedRequired:required.filter(item=>item.completed).length,
  completedOptional:optional.filter(item=>item.completed).length,
  next:activeItems.find(item=>!item.optional&&!item.completed)||activeItems.find(item=>!item.completed)||null
 };
}

function updateWorkoutFlow(){
 const flow=workoutFlowState();
 const total=flow.required.length;
 const complete=flow.completedRequired;
 const allRequired=total>0&&complete===total;
 $('workoutFlowTitle').textContent=allRequired?'Required work complete':`${complete} of ${total} required complete`;
 $('workoutFlowProgress').max=Math.max(1,total);
 $('workoutFlowProgress').value=complete;
 $('workoutFlowNext').textContent=flow.next
  ?`Up next: ${flow.next.definition.name} · ${flow.next.definition.prescription}`
  :(total?'Everything on this workout is marked done.':'No exercises in this session.');
 $('workoutFlowOptional').textContent=flow.optional.length
  ?`${flow.completedOptional} of ${flow.optional.length} optional exercises complete`
  :'Complete each card in order, then finish the session details.';
 $('nextExerciseButton').disabled=!flow.next?.card;
 $('nextExerciseButton').textContent=flow.next?.card?'Go to next':'All done';
 document.querySelectorAll('.exercise-card').forEach((card,index)=>{
  const completed=Boolean(card.querySelector('.exercise-complete')?.checked);
  const status=card.querySelector('[data-exercise-status]');
  if(status){
   status.textContent=completed?'Done':'To do';
   status.classList.toggle('is-complete',completed);
  }
  const completionLabel=card.querySelector('[data-completion-label]');
  if(completionLabel)completionLabel.textContent=completed?'Completed':'Mark done';
 });
}

function scrollToNextExercise(){
 const next=workoutFlowState().next?.card;
 if(!next)return;
 next.scrollIntoView({behavior:'smooth',block:'start'});
}

function findSavedExercise(definition,savedExercises,index){
 const definitionId=canonicalExerciseId(definition.id);
 const byId=savedExercises.find(exercise=>exerciseIdentity(exercise)===definitionId);
 if(byId)return byId;
 const byName=savedExercises.find(exercise=>exercise.name===definition.name);
 if(byName)return byName;
 const positional=savedExercises[index];
 return positional&&!exerciseIdentity(positional)?positional:null;
}

function canonicalExerciseId(value){
 const id=String(value||'');
 return EXERCISE_ID_ALIASES[id]||id;
}

function exerciseIdentity(exercise){
 const raw=exercise?.exerciseId||exercise?.templateId||exercise?.id||EXERCISE_NAME_IDS[exercise?.name]||exercise?.name||'';
 return canonicalExerciseId(raw);
}

function exerciseVariationLabel(exercise){
 if(exercise?.variation)return exercise.variation;
 if(exercise?.name==='Trap-bar deadlift')return 'Trap / hex bar';
 if(exerciseIdentity(exercise)==='lateralRaise')return 'Dumbbell lateral raise';
 return '';
}

function variationIdFor(value){
 const label=String(value||'').trim();
 if(!label)return '';
 return VARIATION_ID_BY_LABEL[label]||label.toLowerCase().replace(/[^a-z0-9]+(.)/g,(_,next)=>next.toUpperCase()).replace(/[^a-z0-9]/g,'');
}

function exerciseVariationId(exercise){
 return exercise?.variationId||variationIdFor(exerciseVariationLabel(exercise));
}

function coachDirectiveConsumed(directiveId){
 return entries.some(entry=>(entry.exercises||[]).some(exercise=>
  exercise.completed&&exercise.appliedCoachDirective?.id===directiveId
 ));
}

function activeCoachOverlay(programVersion,workoutDayId,exerciseId,date=''){
 return (PROGRAM.coachNoteOverlays||[]).find(overlay=>
  overlay.status==='active'
  &&String(overlay.programVersion)===String(programVersion||'')
  &&overlay.workoutDayId===workoutDayId
  &&canonicalExerciseId(overlay.exerciseId)===canonicalExerciseId(exerciseId)
  &&(!date||!overlay.effectiveDate||overlay.effectiveDate<=date)
  &&(overlay.scope!=='next_occurrence'||!coachDirectiveConsumed(overlay.id))
 )||null;
}

function applicableCoachOverlay(definition,state={}){
 if(state?.appliedCoachDirective?.id)return state.appliedCoachDirective;
 return activeCoachOverlay(
  activeProgramContext?.version||PROGRAM.version,
  activeSessionDefinition?.key,
  definition.id,
  activeWorkoutDate
 );
}

function coachOverlayMarkup(definition,state={}){
 const overlay=applicableCoachOverlay(definition,state);
 if(!overlay)return '';
 return `<aside class="coach-overlay" data-coach-overlay="${attr(overlay.id)}">
  <p class="eyebrow">${overlay.scope==='next_occurrence'?'NEXT-OCCURRENCE COACH DIRECTIVE':'ACTIVE COACH NOTE'}</p>
  <p>${esc(overlay.text)}</p>
  ${overlay.circuitDirective?.overallTargetRpe?`<p class="coach-overlay-target">Circuit target RPE ${esc(overlay.circuitDirective.overallTargetRpe)}</p>`:''}
 </aside>`;
}

const ADHERENCE_LABELS={
 met:'Met',below_target:'Below target',modified:'Modified',partial:'Partial',not_assessable:'Not assessable',not_applicable:'Not applicable'
};

const ADHERENCE_REASON_LABELS={
 load_above_target:'Load above target',load_below_target:'Load below target',reps_below_minimum:'Repetitions below minimum',
 sets_below_target:'Sets below target',duration_below_minimum:'Duration below target',duration_above_target:'Duration above target',
 unplanned_component_added:'Unplanned component added',exercise_substituted:'Exercise substituted',coach_directed_change:'Coach-directed change',
 component_not_recorded:'Component not recorded',other:'Other modification'
};

function adherenceReason(code,details={}){
 return {code,...details};
}

function normalizeAdherenceReasons(value){
 const reasons=Array.isArray(value)?value:value?[value]:[];
 return reasons.map(reason=>{
  if(typeof reason==='string')return adherenceReason('other',{message:reason});
  if(!reason||typeof reason!=='object')return null;
  return {code:reason.code||'other',...reason};
 }).filter(Boolean);
}

function formatAdherenceReason(reason){
 if(!reason)return '';
 if(reason.message)return reason.message;
 if(reason.code==='load_above_target'||reason.code==='load_below_target'){
  return `${ADHERENCE_REASON_LABELS[reason.code]}: ${formatLoad(reason.actual)} lb completed vs ${formatLoad(reason.expected)} lb prescribed`;
 }
 if(reason.code==='reps_below_minimum')return `${reason.componentName?`${reason.componentName}: `:''}${reason.actual} reps vs ${reason.expected} minimum`;
 if(reason.code==='sets_below_target')return `${reason.actual} sets recorded vs ${reason.expected} prescribed`;
 if(reason.code==='duration_below_minimum'||reason.code==='duration_above_target'){
  return `${reason.componentName?`${reason.componentName}: `:''}${reason.actual} sec completed vs ${reason.expected} sec prescribed`;
 }
 if(reason.code==='unplanned_component_added')return `${reason.componentName||'Circuit component'} was added outside the versioned prescription`;
 if(reason.code==='exercise_substituted')return `${reason.actual||'A different exercise variation'} was used instead of ${reason.expected||'the targeted variation'}`;
 if(reason.code==='coach_directed_change')return reason.componentName?`${reason.componentName}: coach-directed change from the versioned prescription`:'Coach-directed change from the versioned prescription';
 if(reason.code==='component_not_recorded')return `${reason.componentName||'Circuit component'} was not recorded`;
 return ADHERENCE_REASON_LABELS[reason.code]||ADHERENCE_REASON_LABELS.other;
}

function adherenceTarget(definition){
 if(definition?.adherenceTarget)return clone(definition.adherenceTarget);
 const prescription=String(definition?.prescription||'');
 if(definition?.type==='cardio'){
  const duration=prescription.match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*(?:min|minutes?)/i)
   ||prescription.match(/(\d+(?:\.\d+)?)\s*(?:min|minutes?)/i);
  return duration?{kind:'cardio',minMinutes:Number(duration[1])}:null;
 }
 if(definition?.type==='timed'){
  if(Array.isArray(definition.prescribedTimes)&&definition.prescribedTimes.length){
   return {kind:'timed',sets:definition.prescribedTimes.length,minSecondsBySet:definition.prescribedTimes.map(parseTime)};
  }
  const sets=prescription.match(/(\d+)\s*×\s*(\d+(?:\.\d+)?)(?:\s*[–—-]\s*(\d+(?:\.\d+)?))?\s*(?:sec|seconds?)/i);
  if(sets)return {kind:'timed',sets:Number(sets[1]),minSeconds:Number(sets[2])};
  const duration=prescription.match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*(?:min|minutes?)/i)
   ||prescription.match(/(\d+(?:\.\d+)?)\s*(?:min|minutes?)/i);
  return duration?{kind:'duration',minSeconds:Number(duration[1])*60}:null;
 }
 if(['weighted','body'].includes(definition?.type)){
  const range=prescription.match(/(\d+)\s*×\s*(\d+)\s*[–—-]\s*(\d+)/);
  if(range)return {kind:'reps',sets:Number(range[1]),minReps:Number(range[2])};
  const fixed=prescription.match(/(\d+)\s*×\s*(\d+)/);
  if(fixed)return {kind:'reps',sets:Number(fixed[1]),minReps:Number(fixed[2])};
 }
 return null;
}

function isOptionalExercise(definition){
 return Boolean(definition?.optional||PROGRAM.groups?.[definition?.group]?.optional);
}

function runAdherenceDetail(definition,result){
 const prescribedStage=numberOrNull(definition?.runStage);
 const actualStage=numberOrNull(result?.runStage);
 const stage=prescribedStage==null?null:getRunStage(prescribedStage);
 const prescribedWalk=numberOrNull(stage?.walkMinutes);
 const prescribedRun=numberOrNull(stage?.runMinutes);
 const prescribedRounds=numberOrNull(stage?.rounds);
 const actualWalk=numberOrNull(result?.walkMinutes);
 const actualRun=numberOrNull(result?.runMinutes);
 const actualRounds=numberOrNull(result?.rounds);
 const completedRounds=numberOrNull(result?.completedRounds);
 const missing=[];
 if(prescribedStage==null)missing.push('Prescribed run stage');
 if(actualStage==null)missing.push('Completed run stage');
 if(prescribedWalk==null)missing.push('Prescribed walk duration');
 if(actualWalk==null)missing.push('Completed walk duration');
 if(prescribedRun==null)missing.push('Prescribed run duration');
 if(actualRun==null)missing.push('Completed run duration');
 if(prescribedRounds==null)missing.push('Prescribed rounds');
 if(actualRounds==null)missing.push('Completed interval plan');
 if(completedRounds==null)missing.push('Completed rounds');
 if(missing.length)return {
  value:'not_assessable',
  reasons:missing.map(componentName=>adherenceReason('component_not_recorded',{componentName}))
 };
 const reasons=[];
 let modified=false,below=false;
 if(actualStage!==prescribedStage){
  reasons.push(adherenceReason('other',{message:`Stage ${formatLoad(actualStage)} completed vs Stage ${formatLoad(prescribedStage)} prescribed`}));
  modified=true;
 }
 if(Math.abs(actualWalk-prescribedWalk)>.001){
  reasons.push(adherenceReason('other',{message:`${formatRunDurationValue(actualWalk)} walk intervals completed vs ${formatRunDurationValue(prescribedWalk)} prescribed`}));
  modified=true;
 }
 if(Math.abs(actualRun-prescribedRun)>.001){
  reasons.push(adherenceReason('other',{message:`${formatRunDurationValue(actualRun)} run intervals completed vs ${formatRunDurationValue(prescribedRun)} prescribed`}));
  modified=true;
 }
 if(actualRounds!==prescribedRounds){
  reasons.push(adherenceReason('other',{message:`${formatLoad(actualRounds)} rounds in the completed interval plan vs ${formatLoad(prescribedRounds)} prescribed`}));
  modified=true;
 }
 if(completedRounds<prescribedRounds){
  reasons.push(adherenceReason('other',{message:`${formatLoad(completedRounds)} rounds completed vs ${formatLoad(prescribedRounds)} prescribed`}));
  below=true;
 }else if(completedRounds>prescribedRounds){
  reasons.push(adherenceReason('other',{message:`${formatLoad(completedRounds)} rounds completed vs ${formatLoad(prescribedRounds)} prescribed`}));
  modified=true;
 }
 if(modified)return {value:'modified',reasons};
 if(below)return {value:'below_target',reasons};
 return {value:'met',reasons:[]};
}

function prescriptionAdherenceDetail(definition,result){
 const override=result?.adherenceOverride?.value;
 if(Object.prototype.hasOwnProperty.call(ADHERENCE_LABELS,override)){
  const reasons=normalizeAdherenceReasons(result.adherenceOverride.reasons||result.adherenceOverride.reason);
  return {value:override,reasons};
 }
 const hasResult=Boolean(result&&(result.completed||hasMeaningfulResultData(result)));
 if(definition?.adherenceNotApplicable)return {value:'not_applicable',reasons:[]};
 if(definition?.skippedSessionNotApplicable&&!hasResult)return {value:'not_applicable',reasons:[]};
 if(isOptionalExercise(definition)&&!hasResult)return {value:'not_applicable',reasons:[]};
 if(!hasResult)return {value:'not_assessable',reasons:[]};
 if(definition?.type==='circuit')return circuitAdherenceDetail(definition,result);
 if(['interval','run'].includes(definition?.type))return runAdherenceDetail(definition,result);
 const target=adherenceTarget(definition);
 if(!target)return {value:'not_assessable',reasons:[]};
 if(target.kind==='reps'){
  const reasons=[];
  const reps=parseSetValues(result.reps).filter(value=>value!=='').map(Number);
  if(reps.some(value=>!Number.isFinite(value)))return {value:'not_assessable',reasons:[]};
  if(reps.length<target.sets)reasons.push(adherenceReason('sets_below_target',{actual:reps.length,expected:target.sets}));
  const lowest=reps.length?Math.min(...reps):0;
  if(reps.some(value=>value<target.minReps))reasons.push(adherenceReason('reps_below_minimum',{actual:lowest,expected:target.minReps}));
  if(definition.targetLoad!=null){
   const targetVariation=variationIdFor(definition.targetLoadVariation||'');
   const resultVariation=exerciseVariationId(result);
   if(targetVariation&&resultVariation&&targetVariation!==resultVariation){
    reasons.push(adherenceReason('exercise_substituted',{expected:definition.targetLoadVariation,actual:exerciseVariationLabel(result)}));
   }else{
    const total=totalLoadValue(result);
    if(total==null)reasons.push(adherenceReason('component_not_recorded',{componentName:'Load'}));
    else{
     const expected=Number(definition.targetLoad);
     const tolerance=Number(definition.loadTolerance??.5);
     if(total>expected+tolerance)reasons.push(adherenceReason('load_above_target',{actual:total,expected}));
     if(total<expected-tolerance)reasons.push(adherenceReason('load_below_target',{actual:total,expected}));
    }
   }
  }
  if(reasons.some(reason=>['load_above_target','load_below_target','exercise_substituted'].includes(reason.code)))return {value:'modified',reasons};
  if(reasons.some(reason=>reason.code==='reps_below_minimum'))return {value:'below_target',reasons};
  if(reasons.length)return {value:'partial',reasons};
  return {value:'met',reasons:[]};
 }
 if(target.kind==='timed'){
  const times=parseSetValues(result.times).filter(value=>value!=='').map(parseTime);
  if(times.length<target.sets)return {value:'partial',reasons:[adherenceReason('sets_below_target',{actual:times.length,expected:target.sets})]};
  const below=times.findIndex((value,index)=>value<(target.minSecondsBySet?.[index]??target.minSeconds));
  if(below>=0)return {value:'below_target',reasons:[adherenceReason('duration_below_minimum',{actual:times[below],expected:target.minSecondsBySet?.[below]??target.minSeconds})]};
  return {value:'met',reasons:[]};
 }
 if(target.kind==='cardio'){
  if(result.minutes===''||result.minutes==null)return {value:'partial',reasons:[adherenceReason('component_not_recorded',{componentName:'Duration'})]};
  return Number(result.minutes)>=target.minMinutes
   ?{value:'met',reasons:[]}
   :{value:'below_target',reasons:[adherenceReason('duration_below_minimum',{actual:Number(result.minutes)*60,expected:target.minMinutes*60})]};
 }
 if(target.kind==='duration'){
  const seconds=timedResultSeconds(definition,result.times);
  if(!seconds)return {value:'partial',reasons:[adherenceReason('component_not_recorded',{componentName:'Duration'})]};
  return seconds>=target.minSeconds
   ?{value:'met',reasons:[]}
   :{value:'below_target',reasons:[adherenceReason('duration_below_minimum',{actual:seconds,expected:target.minSeconds})]};
 }
 return {value:'not_assessable',reasons:[]};
}

function prescriptionAdherence(definition,result){
 return prescriptionAdherenceDetail(definition,result).value;
}

function adherenceResultMarkup(definition,state){
 const hasResult=Boolean(state&&(state.completed||hasMeaningfulResultData(state)));
 const detail=prescriptionAdherenceDetail(definition,state);
 const title=detail.reasons.map(formatAdherenceReason).join('; ');
 return `<span class="adherence-result adherence-${attr(detail.value)} ${hasResult?'':'hidden'}" data-adherence-result title="${attr(title)}">
  <span>Prescription</span><strong>${esc(ADHERENCE_LABELS[detail.value])}</strong>
 </span>`;
}

function adherenceDetailMarkup(definition,state){
 const hasResult=Boolean(state&&(state.completed||hasMeaningfulResultData(state)));
 const detail=prescriptionAdherenceDetail(definition,state);
 if(!hasResult||!detail.reasons.length)return '<details class="adherence-detail hidden" data-adherence-detail></details>';
 return `<details class="adherence-detail" data-adherence-detail>
  <summary>Why this result is ${esc(ADHERENCE_LABELS[detail.value].toLowerCase())}</summary>
  <ul>${detail.reasons.map(reason=>`<li>${esc(formatAdherenceReason(reason))}</li>`).join('')}</ul>
 </details>`;
}

function exercisePainFields(state){
 const pain=state?.exercisePain||{};
 return `<section class="exercise-pain" aria-label="Exercise-specific pain">
  <p class="exercise-extra-title">Pain during this exercise</p>
  <div class="form-grid">
   <label>Severity (0–10)<input data-pain-field="severity" type="number" min="0" max="10" step="1" inputmode="numeric" value="${attr(pain.severity)}"></label>
   <label>Laterality<select data-pain-field="laterality">
    <option value="">Not recorded</option>
    ${['left','right','bilateral','central'].map(value=>`<option value="${value}" ${pain.laterality===value?'selected':''}>${esc(value[0].toUpperCase()+value.slice(1))}</option>`).join('')}
   </select></label>
   <label>Location<input data-pain-field="location" value="${attr(pain.location)}" placeholder="e.g. medial elbow"></label>
   <label>Stopped the exercise?<select data-pain-field="causedExerciseToStop">
    <option value="">Not recorded</option><option value="false" ${pain.causedExerciseToStop===false?'selected':''}>No</option><option value="true" ${pain.causedExerciseToStop===true?'selected':''}>Yes</option>
   </select></label>
  </div>
  <label>Pain note<textarea data-pain-field="note" rows="2" placeholder="What did it feel like and when?">${esc(pain.note)}</textarea></label>
 </section>`;
}

function hasExercisePainData(pain){
 if(!pain||typeof pain!=='object')return false;
 return Object.entries(pain).some(([field,value])=>
  field==='causedExerciseToStop'?typeof value==='boolean':value!==''&&value!=null
 );
}

function defaultExerciseState(definition){
 const state={};
 if(definition.defaultVariation)state.variation=definition.defaultVariation;
 if(definition.prescribedLoad!=null)state.load=String(definition.prescribedLoad);
 if(definition.defaults&&definition.type!=='circuit')Object.assign(state,clone(definition.defaults));
 if(definition.type==='interval'||definition.type==='run'){
  const stageId=definition.runStage||PROGRAM.currentRunStage;
  Object.assign(state,runDefaults(stageId),{runStage:String(stageId)});
 }
 return state;
}

function exerciseExtraSummary(state){
 const details=[];
 if(String(state?.notes||'').trim())details.push('Notes added');
 const pain=state?.exercisePain||{};
 if(hasExercisePainData(pain))details.push(pain.severity!==''&&pain.severity!=null?`Pain ${pain.severity}/10`:'Pain added');
 return details.join(' · ')||'Optional';
}

function exerciseCard(definition,index,state,{showPrevious=false}={}){
 const setPlan=getSetPlan(definition);
 const currentVariation=state.variation||exerciseVariationLabel(state)||definition.defaultVariation||'';
 const renderState=definition.variations?{...state,variation:currentVariation}:state;
 const variation=definition.variations
  ?grid(select('variation','Variation / equipment',currentVariation,definition.variations))
  :'';
 const previous=showPrevious?previousResultReference(definition,currentVariation):'';
 const optional=isOptionalExercise(definition);
 const hasExtras=Boolean(String(state.notes||'').trim()||hasExercisePainData(state.exercisePain));
 const directive=definition.type==='circuit'?applicableCoachOverlay(definition,renderState):null;
 return `<section class="card exercise-card ${state.completed?'completed':''}" data-i="${index}" data-exercise-id="${attr(definition.id)}" data-optional="${optional}">
  <div class="exercise-heading">
   <div>
    <p class="exercise-order">Exercise ${index+1}${optional?' · Optional':''}</p>
    <h2>${esc(definition.name)}</h2>
    <p>${esc(definition.prescription)}</p>
   </div>
   <span class="exercise-status" data-exercise-status>${state.completed?'Done':'To do'}</span>
  </div>
  ${definition.targetRpe?`<p class="target-rpe">Target RPE ${esc(definition.targetRpe)}</p>`:''}
  ${definition.coachingNotes?`<p class="coaching-note">${esc(definition.coachingNotes)}</p>`:''}
  ${coachOverlayMarkup(definition,renderState)}
  <div data-result-reference>${previous}</div>
  <p class="today-result-label">Today's result</p>
  ${variation}${fields(definition,renderState,setPlan,directive)}
  ${adherenceDetailMarkup(definition,renderState)}
  <details class="exercise-extras" ${hasExtras?'open':''}>
   <summary><span>Notes &amp; pain</span><span data-exercise-extra-status>${esc(exerciseExtraSummary(renderState))}</span></summary>
   <div class="exercise-extras-body">
    <label>Exercise notes<textarea data-field="notes" rows="3" placeholder="Technique, pain, substitutions...">${esc(state.notes)}</textarea></label>
    ${exercisePainFields(renderState)}
   </div>
  </details>
  <div class="exercise-card-footer">
   ${adherenceResultMarkup(definition,renderState)}
   <label class="check-label"><input class="exercise-complete" type="checkbox" ${state.completed?'checked':''}><span data-completion-label>${state.completed?'Completed':'Mark done'}</span></label>
  </div>
 </section>`;
}

function fields(definition,state,setPlan,directive=null){
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
 if(type==='circuit')return circuitFields(definition,state,directive);
 return '';
}

function circuitTemplate(definition){
 return clone(CIRCUIT_TEMPLATES[definition?.circuitVersion]||{plannedRounds:2,components:[]});
}

function normalizeCircuitPerformance(performance){
 if(!performance||typeof performance!=='object')return {};
 const normalized={...performance,performed:Boolean(performance.performed)};
 const trips=numberOrNull(normalized.trips);
 const distance=numberOrNull(normalized.distancePerTrip);
 if(normalized.distanceMode==='known'&&trips!=null&&distance!=null)normalized.totalDistance=String(trips*distance);
 return normalized;
}

function normalizeCircuitComponent(component,index=0){
 if(!component||typeof component!=='object')return null;
 const normalized={
  ...component,
  id:String(component.id||component.exerciseId||`component-${index+1}`),
  order:Number(component.order)||index+1,
  exerciseId:String(component.exerciseId||component.id||`component-${index+1}`),
  resultMode:component.resultMode==='per_round'?'per_round':'shared',
  planned:component.planned&&typeof component.planned==='object'?{...component.planned}:null,
  directivePlanned:component.directivePlanned&&typeof component.directivePlanned==='object'?{...component.directivePlanned}:null,
  sharedResult:normalizeCircuitPerformance(component.sharedResult),
  roundResults:Array.isArray(component.roundResults)
   ?component.roundResults.map((result,roundIndex)=>({round:Number(result?.round)||roundIndex+1,...normalizeCircuitPerformance(result)}))
   :[]
 };
 return normalized;
}

function circuitComponentPerformance(component){
 if(!component)return [];
 if(component.resultMode==='per_round')return (component.roundResults||[]).map(result=>normalizeCircuitPerformance(result));
 return [normalizeCircuitPerformance(component.sharedResult)];
}

function hasCircuitPerformance(performance){
 if(!performance||typeof performance!=='object')return false;
 if(performance.performed)return true;
 return Object.entries(performance).some(([field,value])=>
  !['performed','round','direction','durationApproximate'].includes(field)&&value!==''&&value!=null&&value!==false
 );
}

function hasCircuitComponentResult(component){
 return circuitComponentPerformance(component).some(hasCircuitPerformance);
}

function legacyCircuitComponents(definition,result={}){
 const template=circuitTemplate(definition);
 return template.components.map((planned,index)=>{
  const performance={};
  if(planned.id==='farmerCarry')Object.assign(performance,{load:result.carryLoad||'',durationSeconds:result.carrySeconds||'',durationApproximate:true});
  if(planned.id==='lateralStepUps')performance.repsPerSide=result.stepReps||'';
  if(planned.id==='hardCardio')Object.assign(performance,{modality:result.modality||'',durationSeconds:result.intervalSeconds||''});
  if(planned.id==='rest')performance.durationSeconds=result.restSeconds||'';
  performance.performed=Object.entries(performance).some(([field,value])=>field!=='durationApproximate'&&value!==''&&value!=null)
   ||Boolean(result.completed&&['farmerCarry','lateralStepUps','hardCardio','rest'].includes(planned.id));
  return normalizeCircuitComponent({
   id:planned.id,order:planned.order||index+1,exerciseId:planned.exerciseId,name:planned.name,type:planned.type,
   prescription:planned.prescription,planned:clone(planned.planned||{}),resultMode:'shared',sharedResult:performance
  },index);
 });
}

function circuitResultComponents(definition,result={}){
 const components=Array.isArray(result.components)&&result.components.length
  ?result.components.map(normalizeCircuitComponent).filter(Boolean)
  :legacyCircuitComponents(definition,result);
 return components.sort((a,b)=>a.order-b.order);
}

function circuitComponentsForRender(definition,state,directive){
 const template=circuitTemplate(definition);
 const baselineById=new Map(template.components.map(component=>[component.id,component]));
 const directiveComponents=directive?.circuitDirective?.components||[];
 const displayPlan=directiveComponents.length?directiveComponents:template.components;
 const saved=circuitResultComponents(definition,state);
 const savedById=new Map(saved.filter(hasCircuitComponentResult).map(component=>[component.id,component]));
 const rendered=displayPlan.map((component,index)=>{
  const prior=savedById.get(component.id);
  savedById.delete(component.id);
  const baseline=baselineById.get(component.id);
  return normalizeCircuitComponent({
   ...component,
   ...(prior||{}),
   id:component.id,
   order:component.order||index+1,
   exerciseId:component.exerciseId,
   name:component.name,
   type:component.type,
   prescription:component.prescription,
   planned:baseline?clone(baseline.planned||{}):prior?.planned||null,
   directivePlanned:directiveComponents.length?clone(component.planned||{}):prior?.directivePlanned||null
  },index);
 });
 savedById.forEach(component=>rendered.push(normalizeCircuitComponent(component,rendered.length)));
 return rendered.sort((a,b)=>a.order-b.order);
}

function circuitInput(field,label,value,{type='number',min=0,max=null,step='.5',placeholder='',className=''}={}){
 return `<label class="${attr(className)}">${label}<input data-circuit-field="${attr(field)}" type="${attr(type)}" value="${attr(value)}" ${type==='number'&&min!=null?`min="${min}"`:''} ${type==='number'&&max!=null?`max="${max}"`:''} ${type==='number'?`step="${step}" inputmode="decimal"`:''} placeholder="${attr(placeholder)}"></label>`;
}

function circuitSelect(field,label,value,options,{className=''}={}){
 const normalized=options.map(option=>typeof option==='object'?option:{value:String(option),label:String(option)});
 return `<label class="${attr(className)}">${label}<select data-circuit-field="${attr(field)}"><option value="">Select…</option>${normalized.map(option=>
  `<option value="${attr(option.value)}" ${String(option.value)===String(value??'')?'selected':''}>${esc(option.label)}</option>`
 ).join('')}</select></label>`;
}

function circuitCheckbox(field,label,checked){
 return `<label class="circuit-checkbox"><input data-circuit-field="${attr(field)}" type="checkbox" ${checked?'checked':''}><span>${esc(label)}</span></label>`;
}

function circuitPerformanceFields(component,performance={}){
 const type=component.type;
 const commonNotes=type==='sled'?circuitInput('notes','Component notes',performance.notes,{type:'text',min:null,placeholder:'Technique, setup, or anything unusual'}):'';
 if(type==='carry')return grid(
  circuitInput('load','Load per hand (lb)',performance.load),
  circuitInput('durationSeconds','Duration (sec)',performance.durationSeconds,{step:'1'}),
  circuitCheckbox('durationApproximate','Approximate duration',Boolean(performance.durationApproximate)),
  circuitInput('rpe','Component RPE',performance.rpe,{min:1,max:10,step:'1'})
 );
 if(type==='reps')return grid(
  circuitInput('repsPerSide','Repetitions per side',performance.repsPerSide,{step:'1'}),
  circuitInput('rpe','Component RPE',performance.rpe,{min:1,max:10,step:'1'})
 );
 if(type==='cardio')return grid(
  circuitSelect('modality','Modality',performance.modality,component.modalities||['Bike','Rower','Elliptical','Short safe sprint']),
  circuitInput('durationSeconds','Hard interval (sec)',performance.durationSeconds,{step:'1'}),
  circuitCheckbox('durationApproximate','Approximate duration',Boolean(performance.durationApproximate)),
  circuitInput('rpe','Component RPE',performance.rpe,{min:1,max:10,step:'1'})
 );
 if(type==='rest')return grid(
  circuitInput('durationSeconds','Rest duration (sec)',performance.durationSeconds,{step:'1'})
 );
 if(type==='sled'){
  const loadMode=performance.loadMode||'';
  const distanceMode=performance.distanceMode||'';
  const direction=performance.direction||component.directivePlanned?.direction||component.planned?.direction||'';
  return `<input data-circuit-field="direction" type="hidden" value="${attr(direction)}">${grid(
   circuitInput('trips','Trips',performance.trips,{step:'1'}),
   circuitSelect('distanceMode','Distance recorded as',distanceMode,[
    {value:'known',label:'Known distance per trip'},{value:'lane_unknown',label:'Gym lane · length unknown'},{value:'unknown',label:'Unknown distance'}
   ]),
   circuitInput('distancePerTrip','Distance per trip',performance.distancePerTrip,{className:distanceMode==='known'?'':'hidden'}),
   circuitSelect('distanceUnit','Distance unit',performance.distanceUnit,['yd','m'],{className:distanceMode==='known'?'':'hidden'}),
   circuitInput('distanceLabel','Lane / distance label',performance.distanceLabel,{type:'text',min:null,placeholder:'One gym lane',className:distanceMode==='lane_unknown'?'':'hidden'}),
   circuitSelect('loadMode','Weight recorded as',loadMode,[
    {value:'added_only',label:'Added plates only · sled weight unknown'},
    {value:'added_plus_sled',label:'Added plates + known sled weight'},
    {value:'total',label:'Known total system weight'},
    {value:'unknown',label:'Weight unknown'}
   ]),
   circuitInput('addedPlateWeight','Added plate weight (lb)',performance.addedPlateWeight,{className:['added_only','added_plus_sled'].includes(loadMode)?'':'hidden'}),
   circuitInput('emptySledWeight','Empty sled weight (lb)',performance.emptySledWeight,{className:loadMode==='added_plus_sled'?'':'hidden'}),
   circuitInput('totalSystemWeight','Total system weight (lb)',performance.totalSystemWeight,{className:loadMode==='total'?'':'hidden'}),
   circuitInput('durationSeconds','Duration (sec)',performance.durationSeconds,{step:'1'}),
   circuitInput('equipmentLabel','Sled / equipment label',performance.equipmentLabel,{type:'text',min:null,placeholder:'Same sled as Aug 5'}),
   circuitInput('surface','Surface',performance.surface,{type:'text',min:null,placeholder:'Turf, rubber floor, etc.'}),
   circuitInput('rpe','Component RPE',performance.rpe,{min:1,max:10,step:'1'})
  )}<p class="calculated-sled" data-sled-calculation><span data-sled-total-distance>Total distance: —</span><span data-sled-total-load>Total system weight: —</span></p>${commonNotes}`;
 }
 return commonNotes;
}

function effectiveComponentPlan(component){
 return component.directivePlanned||component.planned||null;
}

function circuitPerformanceSummary(component,performance={}){
 if(!hasCircuitPerformance(performance))return 'Not logged';
 const parts=[];
 if(component.type==='carry'){
  if(performance.load)parts.push(`${performance.load} lb/hand`);
  if(performance.durationSeconds)parts.push(`${performance.durationApproximate?'~':''}${performance.durationSeconds} sec`);
 }else if(component.type==='reps'){
  if(performance.repsPerSide)parts.push(`${performance.repsPerSide}/side`);
 }else if(['cardio','rest'].includes(component.type)){
  if(performance.modality)parts.push(performance.modality);
  if(performance.durationSeconds)parts.push(`${performance.durationApproximate?'~':''}${performance.durationSeconds} sec`);
 }else if(component.type==='sled'){
  if(performance.trips)parts.push(`${performance.trips} trip${Number(performance.trips)===1?'':'s'}`);
  if(performance.distanceMode==='known'&&performance.distancePerTrip){
   parts.push(`${performance.distancePerTrip} ${performance.distanceUnit||''}/trip`.trim());
   const totalDistance=sledTotalDistance(performance);
   if(totalDistance!=null&&Number(performance.trips)>1)parts.push(`${formatLoad(totalDistance)} ${performance.distanceUnit||''} total`.trim());
  }
  else if(performance.distanceMode==='lane_unknown')parts.push(performance.distanceLabel||'gym lane');
  else parts.push('distance unknown');
  if(performance.loadMode==='added_only'&&performance.addedPlateWeight)parts.push(`${performance.addedPlateWeight} lb added · total unknown`);
  else if(performance.loadMode==='added_plus_sled')parts.push(`${sledTotalSystemWeight(performance)??'unknown'} lb total`);
  else if(performance.loadMode==='total'&&performance.totalSystemWeight)parts.push(`${performance.totalSystemWeight} lb total`);
  else parts.push('weight unknown');
  if(performance.durationSeconds)parts.push(`${performance.durationSeconds} sec`);
  if(performance.equipmentLabel)parts.push(performance.equipmentLabel);
  if(performance.surface)parts.push(performance.surface);
 }
 if(performance.rpe)parts.push(`RPE ${performance.rpe}`);
 return parts.join(' · ')||'Performed · details not recorded';
}

function circuitComponentSummary(component){
 const performances=circuitComponentPerformance(component).filter(hasCircuitPerformance);
 if(!performances.length)return 'Not logged';
 if(component.resultMode==='per_round')return performances.map(performance=>`R${performance.round}: ${circuitPerformanceSummary(component,performance)}`).join(' · ');
 return circuitPerformanceSummary(component,performances[0]);
}

function componentAdherenceValue(detail){
 return ADHERENCE_LABELS[detail?.value]||ADHERENCE_LABELS.not_assessable;
}

function circuitComponentMarkup(component,rounds){
 const shared=normalizeCircuitPerformance(component.sharedResult);
 const roundResults=Array.from({length:Math.max(1,Number(rounds)||2)},(_,index)=>{
  const prior=(component.roundResults||[]).find(result=>Number(result.round)===index+1)||{round:index+1};
  return {round:index+1,...normalizeCircuitPerformance(prior)};
 });
 const plan=effectiveComponentPlan(component);
 const effectivePlan=effectiveComponentPlan(component);
 const adherence=hasCircuitComponentResult(component)
  ?circuitComponentAdherence(effectivePlan?{...component,planned:effectivePlan}:null,component)
  :{value:'not_assessable',reasons:[]};
 return `<details class="circuit-component" data-component-id="${attr(component.id)}" data-component-config="${attr(JSON.stringify({
  id:component.id,order:component.order,exerciseId:component.exerciseId,name:component.name,type:component.type,prescription:component.prescription,
  modalities:component.modalities||[],planned:component.planned,directivePlanned:component.directivePlanned
 }))}">
  <summary>
   <span class="circuit-component-order">${component.order}</span>
   <span><strong>${esc(component.name)}</strong><small>${esc(component.prescription||'Record the completed component')}</small></span>
   <span class="circuit-component-status" data-component-status>${esc(circuitComponentSummary(component))}</span>
  </summary>
  <div class="circuit-component-body">
   <div class="circuit-component-controls">
    <label class="check-label" data-component-performed-wrap><input data-component-performed type="checkbox" ${circuitComponentPerformance(component).some(performance=>performance.performed)?'checked':''}><span>Performed</span></label>
    <label>Result applies to<select data-component-mode><option value="shared" ${component.resultMode!=='per_round'?'selected':''}>Both rounds</option><option value="per_round" ${component.resultMode==='per_round'?'selected':''}>Different by round</option></select></label>
   </div>
   <div data-component-shared class="${component.resultMode==='per_round'?'hidden':''}">${circuitPerformanceFields(component,shared)}</div>
   <div data-component-rounds class="circuit-round-results ${component.resultMode==='per_round'?'':'hidden'}">
    ${roundResults.map(result=>`<fieldset data-component-round="${result.round}"><legend>Round ${result.round}</legend>${circuitCheckbox('performed','Performed this round',Boolean(result.performed))}${circuitPerformanceFields(component,result)}</fieldset>`).join('')}
   </div>
   ${plan?.targetRpe?`<p class="muted circuit-component-target">Target component RPE ${esc(plan.targetRpe)}</p>`:''}
   <p class="circuit-component-adherence adherence-${attr(adherence.value)}" data-component-adherence>${esc(componentAdherenceValue(adherence))}</p>
  </div>
 </details>`;
}

function circuitFields(definition,state,directive){
 const template=circuitTemplate(definition);
 const applied=directive?.circuitDirective?directive:null;
 const rounds=state.rounds||applied?.circuitDirective?.plannedRounds||template.plannedRounds||2;
 const components=circuitComponentsForRender(definition,state,applied);
 const directiveSnapshot=applied?{
  id:applied.id,scope:applied.scope||'next_occurrence',effectiveDate:applied.effectiveDate||'',text:applied.text||'',reason:applied.reason||'',
  circuitDirective:clone(applied.circuitDirective)
 }:null;
 return `<section class="circuit-logger" data-circuit-version="${attr(definition.circuitVersion||'')}" data-planned-rounds="${attr(applied?.circuitDirective?.plannedRounds||template.plannedRounds||2)}" ${directiveSnapshot?`data-circuit-directive="${attr(JSON.stringify(directiveSnapshot))}"`:''}>
  <div class="circuit-overall">
   ${grid(
    select('rounds','Rounds completed',state.rounds,circuitRoundOptions(state.rounds)),
    text('totalTime','Total circuit time',state.totalTime,'8:30'),
    num('rpe','Overall circuit RPE',state.rpe,1,10,1)
   )}
   <button class="secondary subtle" type="button" data-fill-circuit-plan>${applied?'Performed as directed':'Performed as planned'}</button>
   <p class="muted">This applies the known targets to both rounds. Sled weight, timing, surface, and RPE remain blank until you record them.</p>
  </div>
  <div class="circuit-component-list">
   ${components.map(component=>circuitComponentMarkup(component,rounds)).join('')}
  </div>
  ${applied?'<div class="directive-adherence" data-directive-adherence>Directive result: not assessed yet</div>':''}
 </section>`;
}

function sledTotalSystemWeight(performance){
 if(performance?.loadMode==='total')return numberOrNull(performance.totalSystemWeight);
 if(performance?.loadMode!=='added_plus_sled')return null;
 const added=numberOrNull(performance.addedPlateWeight);
 const sled=numberOrNull(performance.emptySledWeight);
 return added==null||sled==null?null:added+sled;
}

function sledTotalDistance(performance){
 if(performance?.distanceMode!=='known')return null;
 const trips=numberOrNull(performance.trips);
 const perTrip=numberOrNull(performance.distancePerTrip);
 return trips==null||perTrip==null?null:trips*perTrip;
}

function plannedValueMatches(actual,expected,tolerance=0){
 if(actual===''||actual==null)return false;
 return Math.abs(Number(actual)-Number(expected))<=tolerance;
}

function circuitPerformanceAdherence(plannedComponent,component,performance){
 if(!hasCircuitPerformance(performance))return {value:'partial',reasons:[adherenceReason('component_not_recorded',{componentName:component.name})]};
 if(!plannedComponent)return {value:'modified',reasons:[adherenceReason('unplanned_component_added',{componentName:component.name})]};
 const planned=plannedComponent.planned||plannedComponent;
 const reasons=[];
 let partial=false,below=false,modified=false;
 const name=component.name;
 if(planned.load!==''&&planned.load!=null){
  if(performance.load===''||performance.load==null)partial=true;
  else if(!plannedValueMatches(performance.load,planned.load,.5)){
   const code=Number(performance.load)>Number(planned.load)?'load_above_target':'load_below_target';
   reasons.push(adherenceReason(code,{componentName:name,actual:Number(performance.load),expected:Number(planned.load)}));
   modified=true;
  }
 }
 if(planned.repsPerSide!==''&&planned.repsPerSide!=null){
  if(performance.repsPerSide===''||performance.repsPerSide==null)partial=true;
  else if(Number(performance.repsPerSide)<Number(planned.repsPerSide)){
   reasons.push(adherenceReason('reps_below_minimum',{componentName:name,actual:Number(performance.repsPerSide),expected:Number(planned.repsPerSide)}));
   below=true;
  }
 }
 if(planned.durationSeconds!==''&&planned.durationSeconds!=null){
  if(performance.durationSeconds===''||performance.durationSeconds==null)partial=true;
  else{
   const tolerance=planned.durationApproximate?5:2;
   const actual=Number(performance.durationSeconds),expected=Number(planned.durationSeconds);
   if(actual<expected-tolerance){
    reasons.push(adherenceReason('duration_below_minimum',{componentName:name,actual,expected}));
    below=true;
   }else if(actual>expected+tolerance){
    reasons.push(adherenceReason('duration_above_target',{componentName:name,actual,expected}));
    modified=true;
   }
  }
 }
 if(planned.trips!==''&&planned.trips!=null){
  if(performance.trips===''||performance.trips==null)partial=true;
  else if(Number(performance.trips)<Number(planned.trips)){
   reasons.push(adherenceReason('reps_below_minimum',{componentName:name,actual:Number(performance.trips),expected:Number(planned.trips)}));
   below=true;
  }
 }
 if(planned.targetRpe){
  if(performance.rpe===''||performance.rpe==null)partial=true;
  else{
   const range=String(planned.targetRpe).match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)/);
   if(range&&(Number(performance.rpe)<Number(range[1])||Number(performance.rpe)>Number(range[2]))){
    reasons.push(adherenceReason('other',{componentName:name,message:`${name}: RPE ${performance.rpe} was outside the ${planned.targetRpe} directive target`}));
    modified=true;
   }
  }
 }
 if(partial)reasons.push(adherenceReason('component_not_recorded',{componentName:name}));
 if(modified)return {value:'modified',reasons};
 if(below)return {value:'below_target',reasons};
 if(partial)return {value:'partial',reasons};
 return {value:'met',reasons:[]};
}

function combineComponentAdherence(details,{coachDirected=false}={}){
 const reasons=details.flatMap(detail=>detail.reasons||[]);
 if(coachDirected)reasons.push(adherenceReason('coach_directed_change'));
 const unique=[];
 const seen=new Set();
 reasons.forEach(reason=>{
  const key=JSON.stringify([reason.code,reason.componentName,reason.round,reason.actual,reason.expected,reason.message]);
  if(!seen.has(key)){seen.add(key);unique.push(reason)}
 });
 if(coachDirected||details.some(detail=>detail.value==='modified'))return {value:'modified',reasons:unique};
 if(details.some(detail=>detail.value==='below_target'))return {value:'below_target',reasons:unique};
 if(details.some(detail=>detail.value==='partial'))return {value:'partial',reasons:unique};
 if(details.length&&details.every(detail=>detail.value==='met'))return {value:'met',reasons:[]};
 return {value:'not_assessable',reasons:unique};
}

function circuitComponentAdherence(plannedComponent,component){
 const performances=circuitComponentPerformance(component);
 const details=performances.map(performance=>circuitPerformanceAdherence(plannedComponent,component,performance));
 return combineComponentAdherence(details);
}

function circuitRoundAdherence(result,plannedRounds){
 if(plannedRounds==null)return {value:'not_assessable',reasons:[]};
 const actual=numberOrNull(result?.rounds);
 if(actual==null)return {value:'partial',reasons:[adherenceReason('component_not_recorded',{componentName:'Completed circuit rounds'})]};
 if(actual<Number(plannedRounds))return {value:'below_target',reasons:[adherenceReason('other',{message:`${formatLoad(actual)} rounds completed vs exactly ${formatLoad(plannedRounds)} prescribed`})]};
 if(actual>Number(plannedRounds))return {value:'modified',reasons:[adherenceReason('other',{message:`${formatLoad(actual)} rounds completed vs exactly ${formatLoad(plannedRounds)} prescribed`})]};
 return {value:'met',reasons:[]};
}

function circuitAdherenceAgainstComponents(definition,result,plannedComponents,{coachDirected=false,plannedRounds=null}={}){
 const actual=circuitResultComponents(definition,result);
 const actualById=new Map(actual.map(component=>[component.id,component]));
 const details=[];
 plannedComponents.forEach(planned=>{
  const component=actualById.get(planned.id)||normalizeCircuitComponent({...planned,planned:planned.planned,sharedResult:{}},details.length);
  actualById.delete(planned.id);
  details.push(circuitComponentAdherence(planned,component));
 });
 actualById.forEach(component=>{
  if(hasCircuitComponentResult(component))details.push(circuitComponentAdherence(null,component));
 });
 if(plannedRounds!=null)details.push(circuitRoundAdherence(result,plannedRounds));
 return combineComponentAdherence(details,{coachDirected});
}

function circuitAdherenceDetail(definition,result){
 const template=circuitTemplate(definition);
 if(!template.components.length)return {value:'not_assessable',reasons:[]};
 return circuitAdherenceAgainstComponents(definition,result,template.components,{coachDirected:Boolean(result?.appliedCoachDirective?.id),plannedRounds:template.plannedRounds});
}

function circuitDirectiveAdherenceDetail(definition,result){
 const directive=result?.appliedCoachDirective?.circuitDirective;
 if(!directive?.components?.length)return {value:'not_assessable',reasons:[]};
 return circuitAdherenceAgainstComponents(definition,result,directive.components,{plannedRounds:directive.plannedRounds});
}

function circuitRoundOptions(savedRounds){
 const options=['0','1','2'];
 const saved=String(savedRounds||'');
 if(saved&&!options.includes(saved))options.push({value:saved,label:`${saved} (legacy saved value)`});
 return options;
}

function weightedFields(definition,state,setPlan){
 const variation=state.variation||definition.defaultVariation||'';
 const variationUnits=definition.variationUnits||{};
 const activeUnit=variationUnits[variation]||definition.unit;
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
 const loadLabel=mode==='platesPerSide'?'Plate weight per side (lb)':mode==='plates'?'Plate load, both sides combined (lb)':usesBar?'Total load (lb)':`Load (${activeUnit})`;
 return `<div class="weighted-load" data-unit="${attr(activeUnit)}"
   data-bar-weights="${attr(JSON.stringify(barWeights))}"
   data-per-side-variations="${attr(JSON.stringify(perSideVariations))}"
   data-bar-options="${attr(JSON.stringify(presetOptions))}"
   data-variation-units="${attr(JSON.stringify(variationUnits))}"
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
  updateWorkoutFlow();
  scheduleDraft();
 });
 bindSetControls();
 bindWeightedLoadControls();
 bindCircuitControls();
 bindPreviousResultControls();
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

function readCircuitPerformance(container){
 const performance={};
 container?.querySelectorAll('[data-circuit-field]').forEach(input=>{
  const field=input.dataset.circuitField;
  if(input.type==='checkbox'){
   performance[field]=input.checked;
   return;
  }
  const value=String(input.value??'').trim();
  if(value!=='')performance[field]=value;
 });
 return normalizeCircuitPerformance(performance);
}

function readCircuitComponents(card,definition){
 const logger=card.querySelector('.circuit-logger');
 if(!logger)return circuitResultComponents(definition,{});
 const rounds=Math.max(1,Number(card.querySelector('[data-field="rounds"]')?.value)||Number(logger.dataset.plannedRounds)||2);
 return [...logger.querySelectorAll('.circuit-component')].map((article,index)=>{
  let config={};
  try{config=JSON.parse(article.dataset.componentConfig||'{}')}catch{}
  const resultMode=article.querySelector('[data-component-mode]')?.value==='per_round'?'per_round':'shared';
  const sharedResult=readCircuitPerformance(article.querySelector('[data-component-shared]'));
  sharedResult.performed=Boolean(article.querySelector('[data-component-performed]')?.checked);
  const roundResults=[...article.querySelectorAll('[data-component-round]')]
   .filter(fieldset=>Number(fieldset.dataset.componentRound)<=rounds)
   .map(fieldset=>({round:Number(fieldset.dataset.componentRound),...readCircuitPerformance(fieldset)}));
  return normalizeCircuitComponent({...config,index,resultMode,sharedResult,roundResults},index);
 }).filter(Boolean);
}

function readCircuitDirective(card){
 const raw=card.querySelector('.circuit-logger')?.dataset.circuitDirective;
 if(!raw)return null;
 try{return JSON.parse(raw)}catch{return null}
}

function updateCircuitSledVisibility(container){
 const loadMode=container.querySelector('[data-circuit-field="loadMode"]')?.value||'';
 const distanceMode=container.querySelector('[data-circuit-field="distanceMode"]')?.value||'';
 const toggle=(field,show)=>container.querySelector(`[data-circuit-field="${field}"]`)?.closest('label')?.classList.toggle('hidden',!show);
 toggle('distancePerTrip',distanceMode==='known');
 toggle('distanceUnit',distanceMode==='known');
 toggle('distanceLabel',distanceMode==='lane_unknown');
 toggle('addedPlateWeight',['added_only','added_plus_sled'].includes(loadMode));
 toggle('emptySledWeight',loadMode==='added_plus_sled');
 toggle('totalSystemWeight',loadMode==='total');
 const performance=readCircuitPerformance(container);
 const totalDistance=sledTotalDistance(performance);
 const totalLoad=sledTotalSystemWeight(performance);
 const distanceDisplay=container.querySelector('[data-sled-total-distance]');
 const loadDisplay=container.querySelector('[data-sled-total-load]');
 if(distanceDisplay)distanceDisplay.textContent=totalDistance==null?'Total distance: —':`Total distance: ${formatLoad(totalDistance)} ${performance.distanceUnit||''}`.trim();
 if(loadDisplay){
  loadDisplay.textContent=performance.loadMode==='added_only'
   ?'Total system weight: unknown'
   :totalLoad==null?'Total system weight: —':`Total system weight: ${formatLoad(totalLoad)} lb`;
 }
}

function copyCircuitPerformance(source,target){
 source.querySelectorAll('[data-circuit-field]').forEach(input=>{
  const match=target.querySelector(`[data-circuit-field="${input.dataset.circuitField}"]`);
  if(!match)return;
  if(input.type==='checkbox')match.checked=input.checked;
  else match.value=input.value;
 });
 updateCircuitSledVisibility(target);
}

function updateCircuitRoundVisibility(logger){
 const card=logger.closest('.exercise-card');
 const rounds=Math.max(1,Number(card.querySelector('[data-field="rounds"]')?.value)||Number(logger.dataset.plannedRounds)||2);
 logger.querySelectorAll('[data-component-round]').forEach(fieldset=>{
  fieldset.classList.toggle('hidden',Number(fieldset.dataset.componentRound)>rounds);
 });
}

function fillCircuitPlan(logger){
 const card=logger.closest('.exercise-card');
 const rounds=String(logger.dataset.plannedRounds||'2');
 const roundSelect=card.querySelector('[data-field="rounds"]');
 if(roundSelect)roundSelect.value=rounds;
 logger.querySelectorAll('.circuit-component').forEach(article=>{
  let config={};
  try{config=JSON.parse(article.dataset.componentConfig||'{}')}catch{}
  const planned=config.directivePlanned||config.planned||{};
  const mode=article.querySelector('[data-component-mode]');
  if(mode)mode.value='shared';
  article.querySelector('[data-component-shared]')?.classList.remove('hidden');
  article.querySelector('[data-component-rounds]')?.classList.add('hidden');
  article.querySelector('[data-component-performed-wrap]')?.classList.remove('hidden');
  const performed=article.querySelector('[data-component-performed]');
  if(performed)performed.checked=true;
  const shared=article.querySelector('[data-component-shared]');
  Object.entries(planned).forEach(([field,value])=>{
   const input=shared?.querySelector(`[data-circuit-field="${field}"]`);
   if(!input||['targetRpe','loadUnit','direction'].includes(field))return;
   if(input.type==='checkbox')input.checked=Boolean(value);
   else input.value=String(value??'');
  });
  updateCircuitSledVisibility(shared);
 });
 updateCircuitRoundVisibility(logger);
 updateCardAdherence(card);
 scheduleDraft();
 toast('Known circuit targets applied to both rounds. Add the actual effort and sled details.');
}

function bindCircuitControls(){
 document.querySelectorAll('.circuit-logger').forEach(logger=>{
  const card=logger.closest('.exercise-card');
  logger.querySelector('[data-fill-circuit-plan]')?.addEventListener('click',()=>fillCircuitPlan(logger));
  logger.querySelectorAll('.circuit-component').forEach(article=>{
   const mode=article.querySelector('[data-component-mode]');
   const shared=article.querySelector('[data-component-shared]');
   const rounds=article.querySelector('[data-component-rounds]');
   const performedWrap=article.querySelector('[data-component-performed-wrap]');
   mode?.addEventListener('change',()=>{
    const perRound=mode.value==='per_round';
    shared.classList.toggle('hidden',perRound);
    rounds.classList.toggle('hidden',!perRound);
    performedWrap?.classList.toggle('hidden',perRound);
    if(perRound){
     const performed=article.querySelector('[data-component-performed]')?.checked;
     article.querySelectorAll('[data-component-round]').forEach(fieldset=>{
      if(!hasCircuitPerformance(readCircuitPerformance(fieldset)))copyCircuitPerformance(shared,fieldset);
      const roundPerformed=fieldset.querySelector('[data-circuit-field="performed"]');
      if(roundPerformed)roundPerformed.checked=performed;
     });
    }
    updateCardAdherence(card);
    scheduleDraft();
   });
   article.querySelectorAll('[data-component-shared],[data-component-round]').forEach(updateCircuitSledVisibility);
   article.querySelectorAll('[data-component-shared],[data-component-round]').forEach(container=>{
    container.querySelectorAll('[data-circuit-field]').forEach(input=>{
     input.addEventListener('input',()=>updateCircuitSledVisibility(container));
     input.addEventListener('change',()=>updateCircuitSledVisibility(container));
    });
   });
  });
  card.querySelector('[data-field="rounds"]')?.addEventListener('change',()=>updateCircuitRoundVisibility(logger));
  updateCircuitRoundVisibility(logger);
  updateCardAdherence(card);
 });
}

function bindPreviousResultControls(){
 document.querySelectorAll('.exercise-card').forEach((card,index)=>{
  const definition=activeSessionDefinition?.exercises?.[index];
  const reference=card.querySelector('[data-result-reference]');
  if(!definition||!reference)return;
  const currentVariation=()=>card.querySelector('[data-field="variation"]')?.value||definition.defaultVariation||'';
  const render=()=>{reference.innerHTML=previousResultReference(definition,currentVariation())};
  card.querySelector('[data-field="variation"]')?.addEventListener('change',render);
  reference.onclick=event=>{
   if(!event.target.closest('[data-use-last-load]'))return;
   const previous=previousResultData(definition,currentVariation()).selected;
   if(!previous?.comparable)return;
   applyPreviousLoad(card,definition,previous.exercise,currentVariation());
  };
 });
}

function applyPreviousLoad(card,definition,exercise,variation){
 const fields=reusableLoadFields(exercise);
 const load=card.querySelector('[data-field="load"]');
 if(!load||fields.load==='')return;
 load.value=fields.load;
 if(definition.type==='weighted'){
  const panel=card.querySelector('.weighted-load');
  const mode=panel?.querySelector('[data-field="loadMode"]');
  const barWeight=panel?.querySelector('[data-field="barWeight"]');
  if(mode)mode.value=fields.loadMode||'total';
  if(barWeight)barWeight.value=fields.barWeight||'';
  const preset=panel?.querySelector('[data-bar-preset]');
  if(preset&&fields.barWeight){
   preset.value=[...preset.options].some(option=>option.value===fields.barWeight)?fields.barWeight:'custom';
  }
  if(panel)updateWeightedLoad(panel,variation,false);
 }
 updateCardAdherence(card);
 scheduleDraft();
 toast('Last load applied. Sets, reps, RPE, and notes were left blank.');
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
 let barWeights={},perSideVariations=[],barOptions=[],variationUnits={};
 try{barWeights=JSON.parse(panel.dataset.barWeights||'{}')}catch{}
 try{perSideVariations=JSON.parse(panel.dataset.perSideVariations||'[]')}catch{}
 try{barOptions=JSON.parse(panel.dataset.barOptions||'[]')}catch{}
 try{variationUnits=JSON.parse(panel.dataset.variationUnits||'{}')}catch{}
 panel.dataset.unit=variationUnits[variation]||panel.dataset.unit;
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
 const number=Number(value);
 return Number.isFinite(number)?number.toFixed(2).replace(/\.?0+$/,''):String(value??'—');
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
 const hasAdvanced=['deviceReportedPace','warmupMinutes','cooldownMinutes','walkSpeed','runSpeed','runEnvironment','treadmillIncline','avgHr','maxHr']
  .some(field=>state[field]!==''&&state[field]!=null)
  ||(String(state.runStage)==='manual'&&String(state.structure||'').trim()!=='');
 return `<section class="run-log-section">
  <div class="logging-section-heading"><span>1</span><div><strong>Set the interval plan</strong><small>The coach-prescribed stage is prefilled.</small></div></div>
  ${grid(
   runStageSelect(state.runStage),
   num('walkMinutes','Walk / easy interval (min)',state.walkMinutes,0,null,.25),
   num('runMinutes','Run interval (min)',state.runMinutes,0,null,.25),
   num('rounds','Planned walk/run rounds',state.rounds),
   num('continuousMinutes','Continuous run (min)',state.continuousMinutes)
  )}
  <input data-field="programmedIntervalTime" type="hidden" value="${attr(state.programmedIntervalTime)}">
  <p class="run-plan-summary" data-run-plan-summary></p>
 </section>
 <section class="run-log-section">
  <div class="logging-section-heading"><span>2</span><div><strong>Run the workout</strong><small>The timer begins with the walk segment.</small></div></div>
  ${runTimerMarkup()}
 </section>
 <section class="run-log-section">
  <div class="logging-section-heading"><span>3</span><div><strong>Record the result</strong><small>Rounds, time, distance, effort, and discomfort.</small></div></div>
  ${grid(
   num('completedRounds','Walk/run rounds completed',state.completedRounds),
   text('totalTime','Total elapsed time',state.totalTime,'24:00'),
   num('distance','Total distance (mi)',state.distance,0,null,.01),
   num('rpe','Run effort (RPE)',state.rpe,1,10),
   num('runPain','Run discomfort (0–10)',state.runPain,0,10)
  )}
 </section>
 <section class="pace-calculation" aria-live="polite">
  <div><span>Calculated average pace</span><strong data-calculated-pace>—</strong></div>
  <small data-pace-basis>Enter elapsed time and distance to calculate pace.</small>
  <input data-field="calculatedPace" type="hidden" value="${attr(state.calculatedPace)}">
  <input data-field="paceBasis" type="hidden" value="${attr(state.paceBasis)}">
  <p class="pace-warning hidden" data-pace-warning>Device-reported pace differs from pace calculated from total time and distance. Both values will be saved.</p>
 </section>
 <details class="exercise-inline-details" ${hasAdvanced?'open':''}>
  <summary><span>More run details</span><span>${hasAdvanced?'Data added':'Device, speeds &amp; splits'}</span></summary>
  <div class="exercise-inline-details-body">
   ${grid(
    select('runEnvironment','Run setting',state.runEnvironment,['Indoor treadmill','Outdoor']),
    `<label data-incline-wrap class="${state.runEnvironment==='Indoor treadmill'?'':'hidden'}">Treadmill incline (%)<input data-field="treadmillIncline" type="number" value="${attr(state.treadmillIncline)}" min="0" step=".1" inputmode="decimal"></label>`,
    text('deviceReportedPace','Device-reported average pace',state.deviceReportedPace,'14:16'),
    num('warmupMinutes','Warm-up duration (min)',state.warmupMinutes,0,null,.25),
    num('cooldownMinutes','Cooldown duration (min)',state.cooldownMinutes,0,null,.25),
    num('walkSpeed','Walking speed (mph)',state.walkSpeed,0,null,.1),
    num('runSpeed','Running speed (mph)',state.runSpeed,0,null,.1),
    num('avgHr','Average HR',state.avgHr),
    num('maxHr','Maximum HR',state.maxHr)
   )}
   <label>Run/walk structure or splits<input data-field="structure" value="${attr(state.structure)}" placeholder="Use the prescribed stage or record a manual structure"></label>
  </div>
 </details>`;
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
 const elapsedSeconds=parseRunDuration(exercise?.totalTime||'');
 const programmedSeconds=parseRunDuration(exercise?.programmedIntervalTime||'')||programmedRunSeconds(exercise);
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
 return parseRunDuration(cleaned);
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

function collectExerciseCard(card,definition,index,prior={}){
 if(['interval','run'].includes(definition.type))updateRunCalculations(card);
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
 const pain={};
 card.querySelectorAll('[data-pain-field]').forEach(input=>{
  const field=input.dataset.painField;
  const value=String(input.value??'').trim();
  if(value==='')return;
  pain[field]=field==='severity'?Number(value):field==='causedExerciseToStop'?value==='true':value;
 });
 if(Object.keys(pain).length)exercise.exercisePain=pain;
 else delete exercise.exercisePain;
 if(exercise.variation)exercise.variationId=variationIdFor(exercise.variation);
 else if(definition.variations)exercise.variationId='';
 exercise.unit=definition.variationUnits?.[exercise.variation]||definition.unit||exercise.unit||'';
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
 if(exercise.type==='circuit'){
  exercise.circuitVersion=definition.circuitVersion||exercise.circuitVersion||'';
  exercise.components=readCircuitComponents(card,definition);
  const directive=readCircuitDirective(card);
  if(directive)exercise.appliedCoachDirective=directive;
  else delete exercise.appliedCoachDirective;
 }
 return exercise;
}

function refreshAdherenceForEvent(target){
 const card=target?.closest?.('.exercise-card');
 if(card)updateCardAdherence(card);
}

function refreshExerciseExtraForEvent(target){
 const card=target?.closest?.('.exercise-card');
 if(!card)return;
 const notes=String(card.querySelector('[data-field="notes"]')?.value||'').trim();
 const painFields=[...card.querySelectorAll('[data-pain-field]')];
 const hasPain=painFields.some(input=>String(input.value||'').trim()!=='');
 const severity=String(card.querySelector('[data-pain-field="severity"]')?.value||'').trim();
 const summary=card.querySelector('[data-exercise-extra-status]');
 const details=[];
 if(notes)details.push('Notes added');
 if(hasPain)details.push(severity?`Pain ${severity}/10`:'Pain added');
 if(summary)summary.textContent=details.join(' · ')||'Optional';
 card.querySelector('.exercise-extras')?.classList.toggle('has-data',Boolean(details.length));
}

function updateCardAdherence(card){
 const cards=[...document.querySelectorAll('.exercise-card')];
 const index=cards.indexOf(card);
 const definition=activeSessionDefinition?.exercises?.[index];
 const display=card.querySelector('[data-adherence-result]');
 if(index<0||!definition||!display)return;
 const prior=findSavedExercise(definition,activeSavedExercises,index)||{};
 const result=collectExerciseCard(card,definition,index,prior);
 const detail=prescriptionAdherenceDetail(definition,result);
 const hasResult=result.completed||hasMeaningfulResultData(result);
 display.className=`adherence-result adherence-${detail.value}${hasResult?'':' hidden'}`;
 display.querySelector('strong').textContent=ADHERENCE_LABELS[detail.value];
 display.title=detail.reasons.map(formatAdherenceReason).join('; ');
 const reasonPanel=card.querySelector('[data-adherence-detail]');
 if(reasonPanel){
  reasonPanel.classList.toggle('hidden',!hasResult||!detail.reasons.length);
  if(hasResult&&detail.reasons.length){
   reasonPanel.innerHTML=`<summary>Why this result is ${esc(ADHERENCE_LABELS[detail.value].toLowerCase())}</summary><ul>${detail.reasons.map(reason=>`<li>${esc(formatAdherenceReason(reason))}</li>`).join('')}</ul>`;
  }else reasonPanel.innerHTML='';
 }
 if(definition.type==='circuit')updateCircuitAdherenceUi(card,definition,result);
}

function updateCircuitAdherenceUi(card,definition,result){
 const actual=circuitResultComponents(definition,result);
 const actualById=new Map(actual.map(component=>[component.id,component]));
 const directiveComponents=result.appliedCoachDirective?.circuitDirective?.components||[];
 const baseline=circuitTemplate(definition).components;
 const effective=directiveComponents.length?directiveComponents:baseline;
 const plannedById=new Map(effective.map(component=>[component.id,component]));
 card.querySelectorAll('.circuit-component').forEach(article=>{
  const component=actualById.get(article.dataset.componentId);
  const planned=plannedById.get(article.dataset.componentId)||null;
  const detail=component&&hasCircuitComponentResult(component)?circuitComponentAdherence(planned,component):{value:'not_assessable',reasons:[]};
  const status=article.querySelector('[data-component-status]');
  if(status&&component)status.textContent=circuitComponentSummary(component);
  const adherence=article.querySelector('[data-component-adherence]');
  if(adherence){
   adherence.className=`circuit-component-adherence adherence-${detail.value}`;
   adherence.textContent=componentAdherenceValue(detail);
   adherence.title=detail.reasons.map(formatAdherenceReason).join('; ');
  }
 });
 const directiveDisplay=card.querySelector('[data-directive-adherence]');
 if(directiveDisplay){
  const directiveDetail=circuitDirectiveAdherenceDetail(definition,result);
  directiveDisplay.className=`directive-adherence adherence-${directiveDetail.value}`;
  directiveDisplay.textContent=`Coach directive: ${ADHERENCE_LABELS[directiveDetail.value]}`;
  directiveDisplay.title=directiveDetail.reasons.map(formatAdherenceReason).join('; ');
 }
}

function collectWorkoutItem({draft=false}={}){
 const definitions=activeSessionDefinition?.exercises||[];
 const cards=[...document.querySelectorAll('.exercise-card')];
 const exercises=cards.map((card,index)=>{
  const definition=definitions[index]||{};
  const prior=findSavedExercise(definition,activeSavedExercises,index)||{};
  return collectExerciseCard(card,definition,index,prior);
 });
 const program=activeProgramContext||currentProgramMeta();
 const sessionDate=$('sessionDate').value||today();
 const skillMicrodose=activeSessionDefinition.sessionType==='skill_microdose';
 return {
  id:editing||(draft?'':id()),
  date:sessionDate,
  dayKey:activeSessionDefinition.key,
  dayLabel:activeSessionDefinition.label,
  sessionType:activeSessionDefinition.sessionType||'primary',
  targetSessionRpe:activeSessionDefinition.targetSessionRpe||'',
  programId:program.id,
  programName:program.name,
  programVersion:program.version,
  programEffectiveDate:program.effectiveDate,
  templateId:activeSessionDefinition.templateId||'',
  templateName:activeSessionDefinition.templateName||'',
  templateVersion:activeSessionDefinition.templateVersion||'',
  templateEffectiveDate:activeSessionDefinition.templateEffectiveDate||'',
  advancesPrimaryRotation:activeSessionDefinition.advancesPrimaryRotation!==false,
  weeklySkillDoseGroupId:activeSessionDefinition.weeklySkillDoseGroupId||'',
  weeklySkillDoseWeek:activeSessionDefinition.weeklySkillDoseGroupId?weekStart(sessionDate):'',
  weeklyFrequencyOverride:skillMicrodose&&activeWeeklyOverride,
  weeklyFrequencyOverrideReason:skillMicrodose&&activeWeeklyOverride?'additional_coach_directed_skill_session':'',
  activeRunStage:program.runStage??'',
  prescriptionSnapshot:snapshotSession(activeSessionDefinition),
  duration:$('duration').value,
  sessionRpe:$('sessionRpe').value,
  bodyWeight:$('bodyWeight').value,
  preSoreness:$('preSoreness').value,
  readiness:$('readiness').value,
  sleepQuality:$('sleepQuality').value,
  painDuring:$('painDuring').value,
  painLocation:$('painLocation').value.trim(),
  postSoreness:activeSessionDefinition.sessionType==='recovery'?$('postSoreness').value:'',
  ...(editing&&$('legacyPainScore').value!==''?{painScore:$('legacyPainScore').value}:{}),
  notes:$('sessionNotes').value.trim(),
  exercises,
  updatedAt:new Date().toISOString()
 };
}

async function saveWorkout(event){
 event.preventDefault();
 pauseRunTimer();
 if(activeSessionDefinition?.sessionType==='skill_microdose'&&!editing&&!activeWeeklyOverride){
  const weeklyState=weeklySkillDoseState($('sessionDate').value||today());
  if(weeklyState.status!=='available'){
   refreshWeeklySkillDoseUi();
   toast('This week’s normal skill dose is already partly or fully used');
   return;
  }
 }
 const item=collectWorkoutItem();
 let issues=workoutReviewIssues(item);
 while(issues.length){
  const decision=await showSaveReview(issues);
  if(decision==='return'){
   returnToReviewIssue(issues[0]);
   return;
  }
  if(decision==='mark'){
   markReviewExercisesCompleted(item,issues);
   issues=workoutReviewIssues(item);
   continue;
  }
  if(decision!=='save')return;
  break;
 }
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

function workoutReviewIssues(item){
 const issues=[];
 (item.exercises||[]).forEach((exercise,index)=>{
  const hasResult=hasMeaningfulResultData(exercise);
  if(hasResult&&!exercise.completed){
   issues.push({type:'completion',index,name:exercise.name,message:`${exercise.name}: result data is entered, but Done is unchecked.`});
  }
  const setCount=Math.max(0,Number(exercise.sets)||0);
  const reps=parseSetValues(exercise.reps).filter(value=>value!=='');
  if(setCount&&hasResult&&['weighted','body'].includes(exercise.type)&&reps.length!==setCount){
   issues.push({type:'reps',index,name:exercise.name,message:`${exercise.name}: ${reps.length} rep ${reps.length===1?'entry':'entries'} for ${setCount} selected sets.`});
  }
  const times=parseSetValues(exercise.times).filter(value=>value!=='');
  if(setCount&&hasResult&&exercise.type==='timed'&&times.length!==setCount){
   issues.push({type:'times',index,name:exercise.name,message:`${exercise.name}: ${times.length} time ${times.length===1?'entry':'entries'} for ${setCount} selected sets.`});
  }
 });
 return issues;
}

function showSaveReview(issues){
 const dialog=$('saveReviewDialog');
 if(!dialog?.showModal){
  const message=issues.map(issue=>`• ${issue.message}`).join('\n');
  return Promise.resolve(confirm(`Review these entries before saving:\n\n${message}\n\nSave anyway?`)?'save':'return');
 }
 $('saveReviewIssues').innerHTML=issues.map(issue=>`<li>${esc(issue.message)}</li>`).join('');
 $('markReviewCompletedButton').classList.toggle('hidden',!issues.some(issue=>issue.type==='completion'));
 dialog.returnValue='';
 return new Promise(resolve=>{
  dialog.addEventListener('close',()=>resolve(dialog.returnValue||'return'),{once:true});
  dialog.showModal();
 });
}

function markReviewExercisesCompleted(item,issues){
 const indices=[...new Set(issues.filter(issue=>issue.type==='completion').map(issue=>issue.index))];
 indices.forEach(index=>{
  if(item.exercises[index])item.exercises[index].completed=true;
  const card=document.querySelector(`.exercise-card[data-i="${index}"]`);
  const checkbox=card?.querySelector('.exercise-complete');
  if(checkbox)checkbox.checked=true;
  card?.classList.add('completed');
 });
 scheduleDraft();
}

function returnToReviewIssue(issue){
 const card=document.querySelector(`.exercise-card[data-i="${issue.index}"]`);
 card?.scrollIntoView({behavior:'smooth',block:'center'});
 const target=issue.type==='completion'
  ?card?.querySelector('.exercise-complete')
  :issue.type==='times'?card?.querySelector('.set-time-grid input'):card?.querySelector('.set-rep-grid select, .set-rep-grid input');
 setTimeout(()=>target?.focus(),250);
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
 return (!entry?.sessionType||entry.sessionType==='primary')&&ROTATION.includes(entry?.dayKey);
}

function compareEntries(a,b){
 return String(b.date||'').localeCompare(String(a.date||''))
  ||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
}

function previousResultData(definition,variation,{source=entries,excludeEntryId=editing,limit=3}={}){
 const definitionId=canonicalExerciseId(definition.id);
 const candidates=source.slice().sort(compareEntries).flatMap(entry=>{
  if(excludeEntryId&&entry.id===excludeEntryId)return [];
  return (entry.exercises||[])
   .filter(exercise=>exerciseIdentity(exercise)===definitionId&&hasMeaningfulResultData(exercise))
   .map(exercise=>({entry,exercise,comparable:isComparableResult(definition,variation,exercise)}));
 });
 const selected=candidates.find(item=>item.comparable)||candidates[0]||null;
 const recent=selected?[selected,...candidates.filter(item=>item!==selected)].slice(0,limit):[];
 return {selected,recent,candidates};
}

function isComparableResult(definition,variation,exercise){
 if(['interval','run'].includes(definition.type)){
  const currentStage=Number(definition.runStage||PROGRAM.currentRunStage);
  return Boolean(currentStage)&&Number(exercise.runStage)===currentStage;
 }
 if(definition.variations){
  const currentVariationId=variationIdFor(variation);
  return Boolean(currentVariationId)&&exerciseVariationId(exercise)===currentVariationId;
 }
 return true;
}

function previousResultReference(definition,variation){
 const data=previousResultData(definition,variation);
 if(!data.selected)return `<p class="previous-result previous-empty"><strong>Previous:</strong> none logged</p>`;
 const {entry,exercise,comparable}=data.selected;
 const variationLabel=exerciseVariationLabel(exercise);
 const isRun=['interval','run'].includes(definition.type);
 const label=isRun&&exercise.runStage
  ?`Last Stage ${exercise.runStage}`
  :variationLabel&&comparable?`Last on ${variationLabel.toLowerCase()}`:'Last result';
 const fallback=variationLabel&&!comparable
  ?`<p class="comparison-warning">Most recent ${esc(definition.name.toLowerCase())} was ${esc(variationLabel)}. Its load is not directly comparable.</p>`
  :!comparable&&isRun?`<p class="comparison-warning">Most recent run used Stage ${esc(exercise.runStage||'unknown')}. Pace is not directly comparable with today's stage.</p>`:'';
 const canReuseLoad=comparable&&['weighted','carry'].includes(definition.type)&&exercise.load!==''&&exercise.load!=null;
 const recent=data.recent.map(item=>`<li>${esc(shortDateFmt(item.entry.date))} · ${esc(resultSessionSource(item.entry,item.exercise))} · ${esc(resultContext(item.exercise))}${resultContext(item.exercise)?' · ':''}${esc(compactResultSummary(definition,item.exercise))}${item.comparable?'':' · not directly comparable'}</li>`).join('');
 return `<details class="previous-result">
  <summary>
   <span class="previous-result-heading"><strong>${esc(label)}</strong><small>${esc(shortDateFmt(entry.date))} · ${esc(resultSessionSource(entry,exercise))}</small></span>
   <span class="previous-result-summary">${esc(compactResultSummary(definition,exercise))}</span>
  </summary>
  <div class="previous-result-body">
   ${fallback}
   ${canReuseLoad?'<button class="secondary subtle use-last-load" type="button" data-use-last-load>Use last load</button>':''}
   <details class="recent-results"><summary>Recent results</summary><ul>${recent}</ul></details>
  </div>
 </details>`;
}

function resultContext(exercise){
 if(['interval','run'].includes(exercise.type)&&exercise.runStage)return `Stage ${exercise.runStage}`;
 return exerciseVariationLabel(exercise);
}

function compactResultSummary(definition,exercise){
 const parts=[];
 if(['interval','run'].includes(exercise.type)){
  if(exercise.distance)parts.push(`${exercise.distance} mi`);
  const duration=runDurationSeconds(exercise);
  if(duration)parts.push(fmtSec(duration));
  const pace=calculatedPaceDetails(exercise);
  if(pace.value)parts.push(`${pace.value}/mi${pace.basis==='programmedIntervalTime'?' (interval-time basis)':''}`);
  if(exercise.completedRounds)parts.push(`${exercise.completedRounds}/${exercise.rounds||'?'} rounds`);
 }else if(exercise.type==='timed'&&exercise.times){
  parts.push(parseSetValues(exercise.times).filter(Boolean).map(value=>formatCompletedTime(value,definition)).join(', '));
 }else{
  const load=compactLoadResult(definition,exercise);
  if(load)parts.push(load);
  if(exercise.type==='carry'&&exercise.distance){
   parts.push(`${Number(exercise.sets)||'?'} × ${exercise.distance} yd`);
  }else{
   const sets=compactSetsAndReps(exercise);
   if(sets)parts.push(sets);
  }
  if(exercise.minutes)parts.push(`${exercise.minutes} min`);
 }
 if(exercise.rpe)parts.push(`RPE ${exercise.rpe}`);
 return parts.join(' · ')||'Result logged';
}

function compactLoadResult(definition,exercise){
 const load=numberOrNull(exercise.load);
 if(load==null)return '';
 const usesBar=['platesPerSide','plates','total'].includes(exercise.loadMode)||exercise.barWeight!==''&&exercise.barWeight!=null;
 if(usesBar)return `${formatLoad(totalLoadValue(exercise))} lb total`;
 const unit=exercise.unit||definition.unit||'lb';
 if(/per hand/i.test(unit))return `${formatLoad(load)} lb/hand`;
 if(/per side/i.test(unit))return `${formatLoad(load)} lb/side`;
 if(/total/i.test(unit))return `${formatLoad(load)} lb total`;
 return `${formatLoad(load)} lb`;
}

function compactSetsAndReps(exercise){
 const reps=parseSetValues(exercise.reps).filter(Boolean);
 const sets=Number(exercise.sets)||reps.length;
 if(reps.length&&reps.every(value=>value===reps[0])&&sets===reps.length)return `${sets} × ${reps[0]}`;
 if(reps.length)return `${sets||reps.length} sets · reps ${reps.join(', ')}`;
 return sets?`${sets} sets`:'';
}

function timedDefinitionUsesMinutes(definition){
 return definition?.type==='timed'&&/\b(?:min|minutes?)\b/i.test(String(definition?.prescription||''));
}

function timedResultSeconds(definition,value){
 const cleaned=String(value??'').trim();
 if(!cleaned)return 0;
 const explicit=cleaned.match(/^(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m)$/i);
 if(explicit)return Number(explicit[1])*(/^m/i.test(explicit[2])?60:1);
 if(/^\d+(?:\.\d+)?$/.test(cleaned)&&timedDefinitionUsesMinutes(definition))return Number(cleaned)*60;
 return parseTime(cleaned);
}

function formatCompletedTime(value,definition=null){
 const seconds=timedResultSeconds(definition,value);
 if(!seconds)return value;
 return seconds<60?`${seconds} sec`:fmtSec(seconds);
}

function reusableLoadFields(exercise){
 const fields={load:String(exercise?.load??'')};
 if(['platesPerSide','plates','total'].includes(exercise?.loadMode))fields.loadMode=exercise.loadMode;
 if(exercise?.barWeight!==''&&exercise?.barWeight!=null)fields.barWeight=String(exercise.barWeight);
 return fields;
}

function shortDateFmt(value){
 return new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}

function renderHistory(){
 const container=$('historyList');
 if(!entries.length){
  container.innerHTML='<div class="empty-state">No workouts saved yet.</div>';
  return;
 }
 container.innerHTML=entries.map(entry=>{
  const definition=definitionForSavedEntry(entry);
  const done=(entry.exercises||[]).filter(exercise=>exercise.completed||hasData(exercise)).map(exercise=>{
   const planned=definition.exercises.find(item=>canonicalExerciseId(item.id)===exerciseIdentity(exercise))
    ||definition.exercises.find(item=>item.name===exercise.name);
   const adherence=planned?prescriptionAdherenceDetail(planned,exercise):{value:'not_assessable',reasons:[]};
   const reasons=adherence.reasons.length
    ?`<span class="history-adherence-reasons">${adherence.reasons.map(formatAdherenceReason).map(esc).join(' · ')}</span>`:'';
   return `<li><strong>${esc(exercise.name)}:</strong> ${esc(summary(exercise,planned))}<span class="history-adherence adherence-${attr(adherence.value)}">Prescription: ${esc(ADHERENCE_LABELS[adherence.value])}</span>${reasons}${exercise.notes?`<span class="history-exercise-note"><strong>Exercise notes:</strong> ${esc(exercise.notes).replaceAll('\n','<br>')}</span>`:''}</li>`;
  }).join('');
  const contextName=entry.templateName||entry.programName;
  const contextVersion=entry.templateVersion||entry.programVersion;
  const program=contextVersion
   ?`${contextName||'AFT program'} · v${contextVersion}`
   :'Legacy workout';
  const sessionDetails=[];
  if(entry.preSoreness!=='')sessionDetails.push(`pre-soreness ${entry.preSoreness}/10`);
  if(entry.readiness)sessionDetails.push(`readiness ${readinessLabel(entry.readiness)}`);
  if(entry.sleepQuality)sessionDetails.push(`sleep ${sleepQualityLabel(entry.sleepQuality)}`);
  if(entry.painDuring!=='')sessionDetails.push(`pain ${entry.painDuring}/10${entry.painLocation?` — ${entry.painLocation}`:''}`);
  else if(entry.painScore!==''&&entry.painScore!=null)sessionDetails.push(`legacy pain/discomfort ${entry.painScore}/10`);
  if(entry.postSoreness!=='')sessionDetails.push(`post-soreness ${entry.postSoreness}/10`);
  const category=sessionCategoryLabel(entry);
  const categoryClass=isSkillMicrodoseEntry(entry)?'skill-history':entry.sessionType==='recovery'?'recovery-history':'';
  return `<article class="history-item ${categoryClass}">
   <div class="history-top">
    <div>
     <p class="eyebrow">${esc(category.toUpperCase())}</p>
     <h3>${esc(entry.dayLabel)}</h3>
     <p>${dateFmt(entry.date)}${entry.duration?` · ${esc(entry.duration)} min`:''}${entry.sessionRpe?` · RPE ${esc(entry.sessionRpe)}`:''}</p>
     <p class="program-badge">${esc(program)}</p>
     ${entry.weeklyFrequencyOverride?'<p class="frequency-override-badge">Additional weekly session · coach-directed override</p>':''}
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
 refreshWeeklySkillDoseUi();
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
 refreshWeeklySkillDoseUi();
 updatePreview();
 renderStorageStatus();
 toast('All workouts deleted · local restore point available');
}

function renderProgress(){
 const primaryEntries=entries.filter(isPrimaryEntry);
 const recoveryEntries=entries.filter(entry=>entry.sessionType==='recovery');
 const skillMicrodoseEntries=entries.filter(isSkillMicrodoseEntry);
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
  ['Skill microdose sessions',skillMicrodoseEntries.length||'—'],
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
  return `<p><strong>${dateFmt(entry.date)}</strong> — ${esc(entry.dayLabel)} <span class="session-source">${esc(sessionCategoryLabel(entry))}</span>${entry.sessionRpe?`, RPE ${esc(entry.sessionRpe)}`:''}${pain}</p>`;
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

function weeklyMetricsForSelection(selected,source=entries){
 const representedWeeks=new Set(selected.map(entry=>weekStart(entry.date)));
 return weeklyMetrics(source).filter(group=>representedWeeks.has(group.week));
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
 return parseRunDuration(exercise?.totalTime||'')
  ||parseRunDuration(exercise?.programmedIntervalTime||'')
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

function summary(exercise,definition=null){
 if(exercise?.type==='circuit')return circuitSummary(exercise);
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
 if(exercise.times)parts.push(`times ${parseSetValues(exercise.times).filter(Boolean).map(value=>formatCompletedTime(value,definition||exercise)).join(', ')}`);
 if(exercise.runMinutes||exercise.walkMinutes)parts.push(`${exercise.walkMinutes||0} min walk / ${exercise.runMinutes||0} min run`);
 if(exercise.continuousMinutes)parts.push(`${exercise.continuousMinutes} min continuous`);
 if(exercise.programmedIntervalTime)parts.push(`programmed ${['run','interval'].includes(exercise.type)?formatRunDurationValue(exercise.programmedIntervalTime):exercise.programmedIntervalTime}`);
 if(exercise.totalTime)parts.push(`elapsed ${['run','interval'].includes(exercise.type)?formatRunDurationValue(exercise.totalTime):exercise.totalTime}`);
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
 const pain=exercise.exercisePain;
 if(hasExercisePainData(pain)){
  const painParts=[];
  if(pain.severity!==''&&pain.severity!=null)painParts.push(`${pain.severity}/10`);
  if(pain.laterality)painParts.push(pain.laterality);
  if(pain.location)painParts.push(pain.location);
  if(pain.causedExerciseToStop===true)painParts.push('stopped exercise');
  parts.push(`exercise pain ${painParts.join(' ')||'recorded'}`);
 }
 return parts.join(' · ')||(exercise.completed?'completed':exercise.prescription);
}

function circuitDefinitionForResult(exercise){
 return Object.values(SESSIONS).flatMap(session=>session.exercises||[]).find(definition=>
  definition.type==='circuit'&&canonicalExerciseId(definition.id)===exerciseIdentity(exercise)
 )||{...exercise,circuitVersion:exercise.circuitVersion};
}

function circuitSummary(exercise){
 const definition=circuitDefinitionForResult(exercise);
 const components=circuitResultComponents(definition,exercise).filter(hasCircuitComponentResult);
 const parts=[];
 if(exercise.rounds)parts.push(`${exercise.rounds} rounds completed`);
 components.forEach(component=>parts.push(`${component.order}. ${component.name}: ${circuitComponentSummary(component)}`));
 if(exercise.totalTime)parts.push(`elapsed ${exercise.totalTime}`);
 if(exercise.rpe)parts.push(`overall RPE ${exercise.rpe}`);
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
 const skillMicrodoses=selected.filter(isSkillMicrodoseEntry);
 const minutes=selected.reduce((total,entry)=>total+Number(entry.duration||0),0);
 const rpes=selected.map(entry=>Number(entry.sessionRpe)).filter(Boolean);
 const averageRpe=rpes.length?(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1):'not recorded';
 const stage=getRunStage(PROGRAM.currentRunStage);
 const weeks=weeklyMetricsForSelection(selected,entries);
 let output=`# AFT Training Update\n\n`;
 output+=`**Program:** ${PROGRAM.name} · version ${PROGRAM.version}  \n`;
 output+=`**Program effective date:** ${dateFmt(PROGRAM.effectiveDate)}  \n`;
 output+=`**Period:** ${from?dateFmt(from):'Beginning'} through ${through?dateFmt(through):'Latest'}  \n`;
 output+=`**Primary sessions:** ${primary.length}  \n`;
 output+=`**Recovery sessions:** ${recovery.length}  \n`;
 output+=`**Skill microdose sessions:** ${skillMicrodoses.length}  \n`;
 output+=`**Logged training time:** ${minutes?`${minutes} minutes`:'not recorded'}  \n`;
 output+=`**Average session RPE:** ${averageRpe}  \n`;
 output+=`**Current coach-directed run stage:** Stage ${stage.id} — ${stage.label}\n\n`;
 if(weeks.length){
  output+='## AFT-event practice volume\n\nPractice volume reflects accumulated training work and is not a benchmark or official AFT event result.\n\n| Week of | Hand-release push-ups | Front-plank time |\n|---|---:|---:|\n';
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
   const definition=definitionForSavedEntry(entry);
   output+=`### ${dateFmt(entry.date)} — ${entry.dayLabel}\n\n`;
   if(isSkillMicrodoseEntry(entry)){
    output+=`Session category: Skill microdose  \n`;
    output+=`Template: ${entry.templateName||entry.programName||'AFT Skill Microdose'}${entry.templateVersion||entry.programVersion?` · version ${entry.templateVersion||entry.programVersion}`:''}  \n`;
    output+=`Does not advance the primary workout rotation  \n`;
    if(entry.weeklyFrequencyOverride)output+=`Weekly frequency: Additional coach-directed session; standard weekly frequency exceeded  \n`;
   }else{
    output+=`Session category: ${sessionCategoryLabel(entry)}  \n`;
    output+=`Program: ${entry.programName||'Legacy program'}${entry.programVersion?` · version ${entry.programVersion}`:''}  \n`;
   }
   const metadata=[];
   if(entry.duration)metadata.push(`${entry.duration} min`);
   if(definition.targetDuration)metadata.push(`target duration ${definition.targetDuration.toLowerCase()}`);
   if(entry.targetSessionRpe)metadata.push(`target session RPE ${entry.targetSessionRpe}`);
   if(entry.sessionRpe)metadata.push(`session RPE ${entry.sessionRpe}/10`);
   if(entry.activeRunStage)metadata.push(`active run stage ${entry.activeRunStage}`);
   if(entry.bodyWeight)metadata.push(`${entry.bodyWeight} lb body weight`);
   if(entry.preSoreness!=='')metadata.push(`pre-session soreness ${entry.preSoreness}/10`);
   if(entry.readiness)metadata.push(`readiness ${readinessLabel(entry.readiness)}`);
   if(entry.sleepQuality)metadata.push(`sleep quality ${sleepQualityLabel(entry.sleepQuality)}`);
   if(entry.painDuring!=='')metadata.push(`pain during session ${entry.painDuring}/10${entry.painLocation?` (${entry.painLocation})`:''}`);
   else if(entry.painScore!==''&&entry.painScore!=null)metadata.push(`legacy pain/discomfort ${entry.painScore}/10`);
   if(entry.postSoreness!=='')metadata.push(`post-session soreness ${entry.postSoreness}/10`);
   if(metadata.length)output+=metadata.join(' · ')+'\n\n';
   if(definition.coachInstructions)output+=`Coach instructions: ${definition.coachInstructions}\n\n`;
   definition.exercises.forEach((planned,index)=>{
    const completed=findSavedExercise(planned,entry.exercises||[],index);
    output+=markdownExercise(planned,completed,entry);
   });
   if(entry.notes)output+=`\n${markdownTextBlock('Post-session notes',entry.notes)}`;
   output+='\n';
  });
 }
 return output+'## Coaching request\n\nReview this training block, compare the completed results with the prescribed targets, identify recovery or injury concerns, and provide the next coach-directed program update while keeping the November Army Fitness Test goal in mind.\n';
}

function markdownExercise(planned,completed,entry){
 const target=planned.targetRpe?` · target RPE ${planned.targetRpe}`:'';
 const coaching=planned.coachingNotes?` · ${planned.coachingNotes}`:'';
 const overlay=activeCoachOverlay(entry?.programVersion,entry?.dayKey,planned.id,entry?.date);
 const adherence=prescriptionAdherenceDetail(planned,completed);
 let output=`- **${planned.name}**\n`;
 output+=`  - Planned: ${planned.prescription}${target}${coaching}\n`;
 if(overlay){
  output+=`  - Active coach note: ${overlay.text}\n`;
  if(overlay.reason)output+=`  - Coach-note reason: ${overlay.reason}\n`;
 }
 output+=`  - Status: ${completed?.completed?'Completed':'Not marked complete'}\n`;
 output+=`  - Prescription adherence: ${ADHERENCE_LABELS[adherence.value]}\n`;
 if(adherence.reasons.length)output+=`  - Adherence details: ${adherence.reasons.map(formatAdherenceReason).join('; ')}\n`;
 if(completed&&['interval','run'].includes(completed.type)){
  output+=markdownRunResult(completed);
 }else if(completed?.type==='circuit'){
  output+=markdownCircuitResult(planned,completed);
 }else{
  output+=`  - Completed result: ${completed&&(completed.completed||hasData(completed))?summary(completed,planned):'No result recorded'}\n`;
 }
 if(completed?.appliedCoachDirective?.id)output+=markdownAppliedCircuitDirective(planned,completed);
 if(hasExercisePainData(completed?.exercisePain))output+=markdownExercisePain(completed.exercisePain);
 if(completed?.completed){
  const previous=previousComparableForExport(entry,planned,completed);
  if(previous)output+=markdownPreviousComparable(planned,previous);
 }
 if(completed?.notes)output+=markdownTextBlock('Exercise notes',completed.notes,'  ');
 return output;
}

function markdownCircuitResult(definition,result){
 const components=circuitResultComponents(definition,result).filter(hasCircuitComponentResult);
 const baselineById=new Map(circuitTemplate(definition).components.map(component=>[component.id,component]));
 let output='  - Completed circuit:\n';
 output+=`    - Rounds completed: ${result.rounds||'Not recorded'}\n`;
 output+=`    - Total circuit time: ${result.totalTime||'Not recorded'}\n`;
 output+=`    - Overall circuit RPE: ${result.rpe?`${result.rpe}/10`:'Not recorded'}\n`;
 output+='    - Ordered components:\n';
 if(!components.length)return output+'      - No component results recorded\n';
 components.forEach(component=>{
  const baseline=baselineById.get(component.id)||null;
  const detail=circuitComponentAdherence(baseline,component);
  output+=`      ${component.order}. **${component.name}**\n`;
  output+=`         - Versioned prescription: ${baseline?.prescription||'Not part of the versioned circuit'}\n`;
  output+=`         - Result format: ${component.resultMode==='per_round'?'Recorded separately by round':'Shared across both rounds'}\n`;
  const performances=circuitComponentPerformance(component).filter(hasCircuitPerformance);
  if(!performances.length){
   output+='         - Result: Not recorded\n';
  }else{
   performances.forEach(performance=>{
    const prefix=component.resultMode==='per_round'?`Round ${performance.round}`:'Result';
    output+=`         - ${prefix}: ${circuitPerformanceSummary(component,performance)}\n`;
    if(component.type==='sled')output+=markdownSledPerformance(performance,'           ');
   });
  }
  output+=`         - Component prescription adherence: ${ADHERENCE_LABELS[detail.value]}\n`;
  if(detail.reasons.length)output+=`         - Adherence details: ${detail.reasons.map(formatAdherenceReason).join('; ')}\n`;
 });
 return output;
}

function markdownSledPerformance(performance,indent=''){
 const distance=performance.distanceMode==='known'&&performance.distancePerTrip
  ?`${performance.distancePerTrip} ${performance.distanceUnit||'unit'} per trip`
  :performance.distanceMode==='lane_unknown'?`${performance.distanceLabel||'Gym lane'} (length unknown)`:'Unknown / not recorded';
 let load='Unknown / not recorded';
 if(performance.loadMode==='added_only')load=performance.addedPlateWeight?`${performance.addedPlateWeight} lb added; empty sled and total system weight unknown`:'Added-plate mode selected; weight not recorded';
 if(performance.loadMode==='added_plus_sled')load=sledTotalSystemWeight(performance)!=null
  ?`${performance.addedPlateWeight} lb added + ${performance.emptySledWeight} lb sled = ${sledTotalSystemWeight(performance)} lb total`
  :'Added plates + sled mode selected; complete weights not recorded';
 if(performance.loadMode==='total')load=performance.totalSystemWeight?`${performance.totalSystemWeight} lb total system weight`:'Total-weight mode selected; weight not recorded';
 let output='';
 output+=`${indent}- Direction: ${formatSledDirection(performance.direction)}\n`;
 output+=`${indent}- Trips: ${performance.trips||'Unknown / not recorded'}\n`;
 output+=`${indent}- Distance: ${distance}\n`;
 output+=`${indent}- Load: ${load}\n`;
 output+=`${indent}- Duration: ${performance.durationSeconds?`${performance.durationSeconds} sec`:'Unknown / not recorded'}\n`;
 output+=`${indent}- Equipment: ${performance.equipmentLabel||'Not recorded'}\n`;
 output+=`${indent}- Surface: ${performance.surface||'Not recorded'}\n`;
 output+=`${indent}- Component RPE: ${performance.rpe?`${performance.rpe}/10`:'Not recorded'}\n`;
 if(performance.notes)output+=`${indent}- Component notes: ${performance.notes}\n`;
 return output;
}

function formatSledDirection(direction){
 return ({backward_drag:'Backward drag',forward_push:'Forward push'})[direction]||direction||'Not recorded';
}

function markdownAppliedCircuitDirective(definition,result){
 const directive=result.appliedCoachDirective;
 const detail=circuitDirectiveAdherenceDetail(definition,result);
 let output=`  - Applied coach directive: ${directive.text||directive.id}\n`;
 if(directive.reason)output+=`  - Coach-directive reason: ${directive.reason}\n`;
 output+=`  - Coach-directive adherence: ${ADHERENCE_LABELS[detail.value]}\n`;
 if(detail.reasons.length)output+=`  - Coach-directive adherence details: ${detail.reasons.map(formatAdherenceReason).join('; ')}\n`;
 return output;
}

function previousComparableForExport(entry,planned,completed){
 if(!entry||!completed)return null;
 const priorEntries=entries.filter(candidate=>candidate.id!==entry.id&&compareEntries(candidate,entry)>0);
 const selected=previousResultData(planned,exerciseVariationLabel(completed),{
  source:priorEntries,excludeEntryId:entry.id,limit:1
 }).selected;
 return selected?.comparable?selected:null;
}

function markdownPreviousComparable(planned,item){
 const exercise=item.exercise;
 const isRun=['run','interval'].includes(exercise.type);
 const variation=exerciseVariationLabel(exercise);
 const load=compactLoadResult(planned,exercise);
 const reps=parseSetValues(exercise.reps).filter(Boolean);
 const times=parseSetValues(exercise.times).filter(Boolean);
 let output='  - Previous comparable result:\n';
 output+=`    - Date: ${dateFmt(item.entry.date)}\n`;
 output+=`    - Session source: ${resultSessionSource(item.entry,exercise)}\n`;
 if(variation)output+=`    - Variation: ${variation}\n`;
 if(load)output+=`    - Load: ${load}\n`;
 if(exercise.sets)output+=`    - Sets: ${exercise.sets}\n`;
 if(reps.length){
  output+=`    - Repetitions: ${reps.join(', ')}\n`;
  output+=`    - Total repetitions: ${reps.reduce((sum,value)=>sum+(Number(value)||0),0)}\n`;
 }
 if(times.length)output+=`    - Timed results: ${times.map(value=>formatCompletedTime(value,planned)).join(', ')}\n`;
 if(exercise.minutes)output+=`    - Duration: ${exercise.minutes} minutes\n`;
 if(isRun){
  if(exercise.completedRounds)output+=`    - Completed rounds: ${exercise.completedRounds}${exercise.rounds?`/${exercise.rounds}`:''}\n`;
  if(exercise.programmedIntervalTime)output+=`    - Programmed interval time: ${formatRunDurationValue(exercise.programmedIntervalTime)}\n`;
  if(exercise.totalTime)output+=`    - Total elapsed time: ${formatRunDurationValue(exercise.totalTime)}\n`;
  if(exercise.distance)output+=`    - Distance: ${exercise.distance} miles\n`;
  const pace=calculatedPaceDetails(exercise);
  if(pace.value)output+=`    - Calculated pace: ${pace.value}/mi${pace.basis==='programmedIntervalTime'?' (interval-time basis)':''}\n`;
 }else if(exercise.distance){
  output+=`    - Distance / output: ${exercise.distance}${exercise.outputUnit?` ${exercise.outputUnit}`:''}\n`;
 }
 if(exercise.rpe)output+=`    - Exercise RPE: ${exercise.rpe}/10\n`;
 return output;
}

function markdownExercisePain(pain){
 const parts=[];
 if(pain.severity!==''&&pain.severity!=null)parts.push(`${pain.severity}/10`);
 if(pain.laterality)parts.push(pain.laterality[0].toUpperCase()+pain.laterality.slice(1));
 if(pain.location)parts.push(pain.location);
 if(pain.causedExerciseToStop===true)parts.push('stopped the exercise');
 else if(pain.causedExerciseToStop===false)parts.push('did not stop the exercise');
 let output=`  - Exercise-specific pain: ${parts.join(' · ')||'Recorded'}\n`;
 if(pain.note)output+=markdownTextBlock('Exercise-pain note',pain.note,'  ');
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
 output+=`  - Total elapsed time: ${exercise.totalTime?formatRunDurationValue(exercise.totalTime):'Not recorded'}\n`;
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
  'date','session_type','day','program_id','program_name','program_version','program_effective_date',
  'template_id','template_name','template_version','template_effective_date','weekly_skill_dose_group_id','weekly_skill_dose_week',
  'weekly_frequency_override','weekly_frequency_override_reason','active_run_stage',
  'target_session_rpe','duration_minutes','session_rpe','body_weight_lb','pre_session_soreness',
  'pre_session_readiness','sleep_quality','pain_during_session','pain_location','legacy_pain_discomfort',
  'post_session_soreness','exercise_id','exercise','planned_prescription','target_exercise_rpe',
  'variation','variation_id','entered_load','load_entry_mode','plate_weight_per_side','bar_weight','total_load',
  'sets','reps_by_set','times_by_set','run_stage','run_walk_structure','walk_interval_minutes','run_interval_minutes',
  'programmed_interval_time','total_elapsed_time','distance_miles','calculated_average_pace','pace_calculation_basis',
  'device_reported_pace','warmup_minutes','cooldown_minutes','walking_speed_mph','running_speed_mph',
  'run_environment','treadmill_incline_percent','average_hr','maximum_hr','run_rpe','run_discomfort','rounds_planned','rounds_completed',
  'completed','prescription_adherence','adherence_reasons','adherence_override','adherence_override_reason',
  'applied_coach_directive_id','coach_directive_adherence','coach_directive_adherence_reasons',
  'circuit_component_summary','circuit_components_json',
  'exercise_pain_severity','exercise_pain_location','exercise_pain_laterality','exercise_pain_note','exercise_pain_stopped_exercise',
  'completed_result','exercise_notes','session_notes'
 ];
 const rows=[headers];
 entries.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(entry=>{
  const definition=definitionForSavedEntry(entry);
  (entry.exercises||[]).forEach(exercise=>{
   const isRun=['run','interval'].includes(exercise.type);
   const pace=isRun?calculatedPaceDetails(exercise):{value:'',basis:''};
   const planned=definition.exercises.find(item=>canonicalExerciseId(item.id)===exerciseIdentity(exercise))
    ||definition.exercises.find(item=>item.name===exercise.name)||{};
   const adherence=prescriptionAdherenceDetail(planned,exercise);
   const directiveAdherence=exercise.appliedCoachDirective?.id?circuitDirectiveAdherenceDetail(planned,exercise):{value:'',reasons:[]};
   const plannedRounds=exercise.type==='circuit'
    ?exercise.appliedCoachDirective?.circuitDirective?.plannedRounds||circuitTemplate(planned).plannedRounds||''
    :exercise.rounds||'';
   const completedRounds=exercise.type==='circuit'?exercise.rounds||'':exercise.completedRounds||'';
   const pain=exercise.exercisePain||{};
   rows.push([
    entry.date,entry.sessionType||'primary',entry.dayLabel,entry.programId||'',entry.programName||'',
    entry.programVersion||'',entry.programEffectiveDate||'',entry.templateId||'',entry.templateName||'',entry.templateVersion||'',
    entry.templateEffectiveDate||'',entry.weeklySkillDoseGroupId||'',entry.weeklySkillDoseWeek||'',entry.weeklyFrequencyOverride?'yes':'no',
    entry.weeklyFrequencyOverrideReason||'',entry.activeRunStage??'',entry.targetSessionRpe||'',entry.duration,
    entry.sessionRpe,entry.bodyWeight,entry.preSoreness,entry.readiness,entry.sleepQuality,entry.painDuring,entry.painLocation,
    entry.painScore,entry.postSoreness,exerciseIdentity(exercise),exercise.name,planned.prescription||exercise.prescription,
    exercise.targetRpe||'',exercise.variation||'',exerciseVariationId(exercise),exercise.load||'',exercise.loadMode||'',
    exercise.loadMode==='platesPerSide'?exercise.load||'':'',exercise.barWeight||'',totalLoadValue(exercise)??'',
    exercise.sets||'',exercise.reps||'',exercise.times||'',exercise.runStage||'',isRun?exercise.structure||exercise.runTarget||'':'',
    isRun?exercise.walkMinutes||'':'',isRun?exercise.runMinutes||'':'',isRun?formatRunDurationValue(exercise.programmedIntervalTime):'',
    isRun?formatRunDurationValue(exercise.totalTime):'',isRun?exercise.distance||'':'',pace.value,pace.basis,
    isRun?exercise.deviceReportedPace||'':'',isRun?exercise.warmupMinutes||'':'',isRun?exercise.cooldownMinutes||'':'',
    isRun?exercise.walkSpeed||'':'',isRun?exercise.runSpeed||'':'',isRun?exercise.runEnvironment||'':'',
    isRun?exercise.treadmillIncline||'':'',isRun?exercise.avgHr||'':'',isRun?exercise.maxHr||'':'',
    isRun?exercise.rpe||'':'',isRun?exercise.runPain||'':'',plannedRounds,completedRounds,
    exercise.completed?'yes':'no',adherence.value,adherence.reasons.map(formatAdherenceReason).join('; '),exercise.adherenceOverride?.value||'',exercise.adherenceOverride?.reason||'',
    exercise.appliedCoachDirective?.id||'',directiveAdherence.value||'',directiveAdherence.reasons.map(formatAdherenceReason).join('; '),
    exercise.type==='circuit'?circuitSummary(exercise):'',exercise.type==='circuit'?JSON.stringify(exercise.components||[]):'',
    pain.severity??'',pain.location||'',pain.laterality||'',pain.note||'',pain.causedExerciseToStop==null?'':pain.causedExerciseToStop?'yes':'no',
    summary(exercise,planned),exercise.notes||'',entry.notes||''
   ]);
  });
 });
 if(rows.some(row=>row.length!==headers.length))throw new Error('CSV export row shape mismatch');
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
  refreshWeeklySkillDoseUi();
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
 if(exercise.exercisePain&&typeof exercise.exercisePain==='object')normalized.exercisePain={...exercise.exercisePain};
 else delete normalized.exercisePain;
 if(Array.isArray(exercise.components))normalized.components=exercise.components.map(normalizeCircuitComponent).filter(Boolean);
 else delete normalized.components;
 if(exercise.appliedCoachDirective&&typeof exercise.appliedCoachDirective==='object')normalized.appliedCoachDirective=clone(exercise.appliedCoachDirective);
 else delete normalized.appliedCoachDirective;
 if(exercise.adherenceOverride&&typeof exercise.adherenceOverride==='object'){
  normalized.adherenceOverride={...exercise.adherenceOverride};
  if(Array.isArray(exercise.adherenceOverride.reasons))normalized.adherenceOverride.reasons=normalizeAdherenceReasons(exercise.adherenceOverride.reasons);
 }
 return normalized;
}

const AUGUST5_CIRCUIT_CORRECTION='august5-day3-sled-components-v1';

function applyKnownHistoricalCorrections(entry){
 if(entry.date!=='2026-08-05'||entry.dayKey!=='day3'||String(entry.programVersion)!=='1.3')return entry;
 const circuit=(entry.exercises||[]).find(exercise=>exerciseIdentity(exercise)==='gymConditioningCircuit');
 if(!circuit)return entry;
 const savedDefinition=definitionForSavedEntry(entry);
 const definition=savedDefinition.exercises.find(exercise=>exercise.id==='gymConditioningCircuit')
  ||SESSIONS.day3.exercises.find(exercise=>exercise.id==='gymConditioningCircuit');
 const components=circuitResultComponents(definition,circuit);
 const byId=new Map(components.map(component=>[component.id,component]));
 const cardio=byId.get('hardCardio');
 if(cardio){
  cardio.order=3;
  cardio.sharedResult={...cardio.sharedResult,performed:true,durationSeconds:'30',durationApproximate:true,modality:cardio.sharedResult?.modality||circuit.modality||''};
 }
 const rest=byId.get('rest');
 if(rest)rest.order=6;
 const sledDefinitions=[
  {id:'backwardSledDrag',order:4,exerciseId:'backwardSledDrag',name:'Backward sled drag',direction:'backward_drag'},
  {id:'forwardSledPush',order:5,exerciseId:'forwardSledPush',name:'Forward sled push',direction:'forward_push'}
 ];
 sledDefinitions.forEach(sled=>{
  const existing=byId.get(sled.id);
  if(existing){
   existing.order=sled.order;
   existing.exerciseId=sled.exerciseId;
   existing.name=sled.name;
   existing.type='sled';
   existing.sharedResult={...existing.sharedResult,performed:true,direction:sled.direction,
    distanceMode:existing.sharedResult?.distanceMode||'unknown',loadMode:existing.sharedResult?.loadMode||'unknown'};
   return;
  }
  const component=normalizeCircuitComponent({
   ...sled,type:'sled',prescription:'Added during the August 5 circuit · measurements not recorded',planned:null,resultMode:'shared',
   sharedResult:{performed:true,direction:sled.direction,distanceMode:'unknown',loadMode:'unknown'}
  },sled.order-1);
  components.push(component);
  byId.set(sled.id,component);
 });
 circuit.components=components.sort((a,b)=>a.order-b.order);
 circuit.rounds='2';
 circuit.intervalSeconds='30';
 const correctionNote='Felt much better this week. Used approximately 30 seconds of hard cardio, then a backward sled drag and forward sled push.';
 if(!String(circuit.notes||'').includes('backward sled drag'))circuit.notes=[circuit.notes,correctionNote].filter(Boolean).join('\n');
 const applied=Array.isArray(circuit.historicalCorrections)?circuit.historicalCorrections:[];
 circuit.historicalCorrections=[...new Set([...applied,AUGUST5_CIRCUIT_CORRECTION])];
 return entry;
}

function normalizeEntry(entry){
 if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id||typeof entry.date!=='string'||!entry.date||!SESSIONS[entry.dayKey])return null;
 const current=SESSIONS[entry.dayKey];
 const normalized={
  ...entry,
  dayLabel:typeof entry.dayLabel==='string'&&entry.dayLabel?entry.dayLabel:current.label,
  sessionType:entry.sessionType||current.sessionType||'primary',
  duration:entry.duration??'',
  sessionRpe:entry.sessionRpe??'',
  bodyWeight:entry.bodyWeight??'',
  painScore:entry.painScore??'',
  preSoreness:entry.preSoreness??'',
  readiness:entry.readiness??'',
  sleepQuality:entry.sleepQuality??'',
  painDuring:entry.painDuring??'',
  painLocation:entry.painLocation??'',
  postSoreness:entry.postSoreness??'',
  notes:entry.notes??entry.postSessionNotes??'',
  updatedAt:typeof entry.updatedAt==='string'&&entry.updatedAt?entry.updatedAt:`${entry.date}T12:00:00.000Z`,
  exercises:Array.isArray(entry.exercises)?entry.exercises.map(normalizeExercise).filter(Boolean):[]
 };
 return applyKnownHistoricalCorrections(normalized);
}

function loadEntries(){
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(parsed)?parsed.map(normalizeEntry).filter(Boolean).sort(compareEntries):[];
 }catch{
  return [];
 }
}

function persistKnownHistoricalCorrections(){
 const corrected=entries.filter(entry=>(entry.exercises||[]).some(exercise=>
  Array.isArray(exercise.historicalCorrections)&&exercise.historicalCorrections.includes(AUGUST5_CIRCUIT_CORRECTION)
 ));
 if(!corrected.length)return false;
 try{
  const stored=JSON.parse(localStorage.getItem(KEY)||'[]');
  const storedById=new Map((Array.isArray(stored)?stored:[]).map(entry=>[entry.id,entry]));
  const needsWrite=corrected.some(entry=>{
   const original=storedById.get(entry.id);
   return !(original?.exercises||[]).some(exercise=>
    Array.isArray(exercise.historicalCorrections)&&exercise.historicalCorrections.includes(AUGUST5_CIRCUIT_CORRECTION)
   );
  });
  if(!needsWrite)return false;
  localStorage.setItem(KEY,JSON.stringify(entries));
  return true;
 }catch(error){
  console.warn('Unable to persist the historical circuit correction',error);
  return false;
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
  persistKnownHistoricalCorrections();
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
 if(exercise.type==='circuit'){
  return Boolean(exercise.completed||exercise.notes||exercise.totalTime||exercise.rpe||
   circuitResultComponents(circuitDefinitionForResult(exercise),exercise).some(hasCircuitComponentResult));
 }
 if(['run','interval'].includes(exercise.type)&&!exercise.completed){
  return ['completedRounds','distance','totalTime','deviceReportedPace','warmupMinutes','cooldownMinutes','walkSpeed','runSpeed','runEnvironment','treadmillIncline','avgHr','maxHr','rpe','runPain','notes'].some(field=>exercise[field]);
 }
 const ignored=[
  'exerciseId','templateId','id','name','prescription','type','unit','targetRpe','completed','variation','variationId',
  'loadMode','barWeight','totalLoad','runStage','runTarget','structure','rounds','carryLoad','carrySeconds',
  'stepReps','intervalSeconds','restSeconds','programmedIntervalTime','calculatedPace','paceBasis'
 ];
 if(['weighted','body','timed','carry'].includes(exercise.type))ignored.push('sets');
 return Object.entries(exercise).some(([key,value])=>!ignored.includes(key)&&value!==''&&value!=null);
}

function hasMeaningfulResultData(exercise){
 if(!exercise)return false;
 if(hasExercisePainData(exercise.exercisePain))return true;
 if(exercise.type==='circuit'){
  return ['totalTime','modality','rpe','carryLoad','carrySeconds','stepReps','intervalSeconds','restSeconds'].some(field=>exercise[field]!==''&&exercise[field]!=null)
   ||circuitResultComponents(circuitDefinitionForResult(exercise),exercise).some(hasCircuitComponentResult);
 }
 const fieldsByType={
  weighted:['load','reps','rpe'],body:['reps','rpe'],timed:['times','rpe'],
  carry:['load','distance','carrySeconds','rpe'],cardio:['minutes','distance','modality','avgHr','rpe'],
  interval:['completedRounds','totalTime','distance','deviceReportedPace','warmupMinutes','cooldownMinutes','walkSpeed','runSpeed','runEnvironment','treadmillIncline','avgHr','maxHr','rpe','runPain'],
  run:['completedRounds','totalTime','distance','deviceReportedPace','warmupMinutes','cooldownMinutes','walkSpeed','runSpeed','runEnvironment','treadmillIncline','avgHr','maxHr','rpe','runPain']
 };
 const fields=fieldsByType[exercise.type]||['load','reps','times','minutes','distance','totalTime','rpe'];
 return fields.some(field=>exercise[field]!==''&&exercise[field]!=null);
}

function readinessLabel(value){
 return ({1:'1 — Very poor',2:'2 — Below average',3:'3 — Normal',4:'4 — Good',5:'5 — Excellent'})[Number(value)]||String(value||'not recorded');
}

function sleepQualityLabel(value){
 return ({very_poor:'Very poor',poor:'Poor',fair:'Fair',good:'Good',very_good:'Very good'})[value]||String(value||'Not recorded');
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

function parseRunDuration(value){
 const cleaned=String(value??'').trim();
 if(!cleaned)return 0;
 if(/^\d+(?:\.\d+)?$/.test(cleaned))return Number(cleaned)*60;
 return parseTime(cleaned);
}

function formatRunDurationValue(value){
 const seconds=parseRunDuration(value);
 return seconds?fmtSec(seconds):String(value||'');
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
