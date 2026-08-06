window.AFT_PROGRAM_CONFIG={
 id:'aft-foundation-block-1',
 name:'AFT Foundation Block 1',
 version:'1.3',
 effectiveDate:'2026-08-01',
 currentRunStage:2,
 rotation:['day1','day2','day3','day4'],
 runStages:[
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
 ],
 groups:{
  testSkillPractice:{
   optional:true,
   weeklySkillDoseGroupId:'aft_pushup_plank_microdose',
   frequency:'once_per_monday_sunday_week',
   eyebrow:'OPTIONAL LOW-FATIGUE WORK',
   label:'Test Skill Practice',
   instruction:'These sets should remain easy and technically clean. They are not maximal attempts.'
  },
  armSuperset:{
   optional:true,
   eyebrow:'OPTIONAL ACCESSORY',
   label:'Arm Superset',
   instruction:'Perform curls and pressdowns back-to-back, then rest 60–90 seconds.'
  }
 },
 circuitTemplates:{
  'foundation-1.2':{
   plannedRounds:2,
   components:[
    {id:'farmerCarry',order:1,exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',prescription:'45 lb per hand for approximately 30 seconds',planned:{load:'45',loadUnit:'lb per hand',durationSeconds:'30',durationApproximate:true}},
    {id:'lateralStepUps',order:2,exerciseId:'lateralStepUps',name:'Lateral step-ups',type:'reps',prescription:'6 repetitions per side',planned:{repsPerSide:'6'}},
    {id:'hardCardio',order:3,exerciseId:'hardCardio',name:'Hard cardio',type:'cardio',prescription:'45 seconds hard',planned:{durationSeconds:'45'},modalities:['Bike','Rower','Elliptical','Short safe sprint']},
    {id:'rest',order:4,exerciseId:'circuitRest',name:'Rest',type:'rest',prescription:'2 minutes 30 seconds',planned:{durationSeconds:'150'}}
   ]
  }
 },
 coachNoteOverlays:[
  {
   id:'day2-lateral-raise-right-elbow-2026-08-03',programVersion:'1.3',workoutDayId:'day2',exerciseId:'lateralRaise',
   effectiveDate:'2026-08-03',status:'active',
   text:'Right medial-elbow discomfort occurred with the dumbbell variation. Use a pain-free machine or cuffed-cable variation, or omit this exercise. Stop if discomfort increases.',
   reason:'Right medial-elbow twinge rated 1/10 during the August 3 workout.'
  },
  {
   id:'day3-sled-exposure-after-2026-08-05',programVersion:'1.3',workoutDayId:'day3',exerciseId:'gymConditioningCircuit',
   effectiveDate:'2026-08-06',status:'active',scope:'next_occurrence',
   text:'Next Day 3 only: keep exactly two rounds, use approximately 30 seconds of hard cardio, then complete one controlled backward sled drag and one controlled forward sled push per round. Use the same approximate sled setup as August 5 when identifiable; do not race or intentionally increase the load.',
   reason:'The August 5 sled-enhanced circuit was tolerated at session and circuit RPE 7 with no pain. The next exposure is for measurement, not progression.',
   circuitDirective:{
    plannedRounds:2,overallTargetRpe:'7–8',
    components:[
     {id:'farmerCarry',order:1,exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',prescription:'45 lb per hand for approximately 30 seconds',planned:{load:'45',loadUnit:'lb per hand',durationSeconds:'30',durationApproximate:true}},
     {id:'lateralStepUps',order:2,exerciseId:'lateralStepUps',name:'Lateral step-ups',type:'reps',prescription:'6 repetitions per side',planned:{repsPerSide:'6'}},
     {id:'hardCardio',order:3,exerciseId:'hardCardio',name:'Hard cardio',type:'cardio',prescription:'Approximately 30 seconds hard',planned:{durationSeconds:'30',durationApproximate:true},modalities:['Bike','Rower','Elliptical','Short safe sprint']},
     {id:'backwardSledDrag',order:4,exerciseId:'backwardSledDrag',name:'Backward sled drag',type:'sled',prescription:'One controlled gym-lane trip · target component RPE 6–7',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'One gym lane',targetRpe:'6–7',direction:'backward_drag'}},
     {id:'forwardSledPush',order:5,exerciseId:'forwardSledPush',name:'Forward sled push',type:'sled',prescription:'One controlled gym-lane trip · target component RPE 6–7',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'One gym lane',targetRpe:'6–7',direction:'forward_push'}},
     {id:'rest',order:6,exerciseId:'circuitRest',name:'Rest',type:'rest',prescription:'2 minutes 30 seconds',planned:{durationSeconds:'150'}}
    ]
   }
  }
 ],
 sessions:{
  day1:{
   key:'day1',
   sessionType:'primary',
   label:'Day 1 — Deadlift and Intervals',
   focus:'Primary strength work followed by the current coach-prescribed walk/run stage.',
   targetSessionRpe:'6–8',
   warmup:'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive deadlift warm-up sets.',
   exercises:[
    {id:'deadlift',name:'Trap-bar deadlift',prescription:'3 × 5',type:'weighted',unit:'lb',sets:3,variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},perSideVariations:['Trap / hex bar'],barWeightOptions:[45,55,60],coachingNotes:'Use the trap/hex bar when available. Record the actual bar weight and plate weight per side; use another listed variation when equipment requires it.'},
    {id:'squatOrLegPress',name:'Leg press',prescription:'3 × 8',type:'weighted',unit:'lb',sets:3,variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press',targetRpe:'7',coachingNotes:'Keep all three sets controlled at approximately RPE 7.'},
    {id:'horizontalPress',name:'Horizontal press',prescription:'3 × 8–10',type:'weighted',unit:'lb per hand',sets:3,variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45}},
    {id:'seatedRow',name:'Seated cable row',prescription:'3 × 10',type:'weighted',unit:'lb',sets:3,variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row'},
    {id:'loadedCarry',name:'Farmer carry',prescription:'4 trips of approximately 30–40 yd',type:'carry',unit:'lb per hand',sets:4,variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry'},
    {id:'plank',name:'Front plank',prescription:'3 × 25–30 sec',type:'timed',sets:3},
    {id:'runWalkIntervals',name:'Walk / run intervals',prescription:'Stage 2 — 1:00 walk / 1:30 run × 8',type:'interval',runStage:2,coachingNotes:'Begin each round with the one-minute walk. Keep the running pace relaxed and similar to Stage 1. The goal is to extend continuous running time, not increase speed.'},
    {id:'dumbbellCurl',name:'Dumbbell curls',prescription:'2 × 10–12',type:'weighted',unit:'lb per hand',sets:2,group:'armSuperset',optional:true},
    {id:'tricepsPressdown',name:'Cable triceps pressdowns',prescription:'2 × 10–15',type:'weighted',unit:'lb total',sets:2,group:'armSuperset',optional:true}
   ]
  },
  day2:{
   key:'day2',
   sessionType:'primary',
   label:'Day 2 — Upper Body and Easy Cardio',
   focus:'Repeatable upper-body work followed by low-intensity aerobic training.',
   targetSessionRpe:'6–7',
   warmup:'5–8 minutes of easy cardio, shoulder and upper-back movement prep, then 1–2 easy push-up and pull ramp-up sets.',
   exercises:[
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 6',type:'body',sets:5,coachingNotes:'Use equal, repeatable sets. Do not take the early sets to failure.'},
    {id:'verticalPull',name:'Lat pulldown',prescription:'3 × 8–10',type:'weighted',unit:'lb',sets:3,variations:['Lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Lat pulldown'},
    {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'3 × 8–10',type:'weighted',unit:'lb per hand',sets:3,variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press'},
    {id:'chestSupportedRow',name:'Chest-supported or machine row',prescription:'3 × 10–12',type:'weighted',unit:'lb',sets:3,variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row'},
    {id:'lateralRaise',name:'Dumbbell lateral raises',prescription:'2 × 12–15',type:'weighted',unit:'lb per hand',sets:2,variations:['Dumbbell lateral raise','Machine lateral raise','Cable lateral raise','Cuffed-cable lateral raise'],defaultVariation:'Machine lateral raise',variationUnits:{'Dumbbell lateral raise':'lb per hand','Machine lateral raise':'lb total','Cable lateral raise':'lb per side','Cuffed-cable lateral raise':'lb per side'}},
    {id:'trunkStability',name:'Dead bug or Pallof press',prescription:'3 × 10 each side',type:'body',sets:3,variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug'},
    {id:'easyCardio',name:'Easy cardio',prescription:'25–30 minutes',type:'cardio',modalities:['Bike','Elliptical','Rower','Incline walk','Other'],targetRpe:'4–5',coachingNotes:'Use conversational effort throughout.'}
   ]
  },
  day3:{
   key:'day3',
   sessionType:'primary',
   weeklySkillDoseGroupId:'aft_pushup_plank_microdose',
   label:'Day 3 — Lower Strength and Gym Conditioning',
   focus:'Reduced lower-body volume and a capped two-round conditioning circuit.',
   targetSessionRpe:'7–8',
   warmup:'5–8 minutes of easy cardio, dynamic hip and ankle prep, then 2–4 progressive goblet-squat warm-up sets.',
   exercises:[
    {id:'squatPattern',name:'Goblet squat',prescription:'3 × 8',type:'weighted',unit:'lb',sets:3,variations:['Goblet squat','Front squat','Hack squat','Leg press'],defaultVariation:'Goblet squat',barWeights:{'Front squat':45}},
    {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'95 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:95,targetLoadVariation:'Barbell',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{'Barbell':45,'Smith machine':20}},
    {id:'inclinePress',name:'Incline dumbbell press',prescription:'3 × 8–10',type:'weighted',unit:'lb per hand',sets:3,variations:['Incline dumbbell press','Incline chest-press machine'],defaultVariation:'Incline dumbbell press'},
    {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'3 × 10 each side',type:'weighted',unit:'lb',sets:3,variations:['One-arm dumbbell row','One-arm cable row'],defaultVariation:'One-arm dumbbell row'},
    {id:'singleLegStrength',name:'Split squat',prescription:'2 × 8 each leg using body weight or a light load',type:'weighted',unit:'lb total',sets:2,variations:['Body-weight split squat','Light dumbbell split squat','Forward step-up','Lateral step-up'],defaultVariation:'Body-weight split squat',coachingNotes:'Keep the load light and the repetitions controlled.'},
    {id:'sidePlank',name:'Side plank',prescription:'3 × 25 sec each side',type:'timed',sets:3},
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'3 × 4',type:'body',sets:3,group:'testSkillPractice',optional:true},
    {id:'plank',name:'Front plank',prescription:'2 × 20–25 sec',type:'timed',sets:2,group:'testSkillPractice',optional:true},
    {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, 45-sec hard cardio, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.2',defaults:{carryLoad:'45',carrySeconds:'30',stepReps:'6',intervalSeconds:'45',restSeconds:'150'},modalities:['Bike','Rower','Elliptical','Short safe sprint'],coachingNotes:'Current block limit: two rounds. Do not extend the hard interval beyond 45 seconds.'},
    {id:'dumbbellCurl',name:'Dumbbell curls',prescription:'2 × 10–12',type:'weighted',unit:'lb per hand',sets:2,group:'armSuperset',optional:true},
    {id:'tricepsPressdown',name:'Cable triceps pressdowns',prescription:'2 × 10–15',type:'weighted',unit:'lb total',sets:2,group:'armSuperset',optional:true}
   ]
  },
  day4:{
   key:'day4',
   sessionType:'primary',
   label:'Day 4 — Run and Calisthenics',
   focus:'Complete the current coach-prescribed walk/run stage, then controlled test-relevant calisthenics.',
   targetSessionRpe:'6–7',
   warmup:'5–10 minutes of brisk walking plus marches and leg swings. The interval timer then begins with its walk segment.',
   exercises:[
    {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 2 — 1:00 walk / 1:30 run × 8',type:'run',runStage:2,coachingNotes:'Begin each round with the one-minute walk. Keep the running pace relaxed and similar to Stage 1. The goal is to extend continuous running time, not increase speed.'},
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 6',type:'body',sets:4,coachingNotes:'Use four equal, technically clean sets. Stop before failure.'},
    {id:'plank',name:'Front plank',prescription:'Set 1: 30 sec · Set 2: 30 sec · Set 3: 25 sec',type:'timed',sets:3,prescribedTimes:['0:30','0:30','0:25']},
    {id:'mobility',name:'Mobility',prescription:'5–10 minutes',type:'timed'}
   ]
  },
  recovery:{
   key:'recovery',
   sessionType:'recovery',
   optional:true,
   label:'Recovery Session',
   focus:'Optional low-intensity recovery work that does not advance the four-day rotation.',
   targetSessionRpe:'2–3',
   warmup:'Begin at a very easy pace and stay within a comfortable range of motion.',
   exercises:[
    {id:'recoveryCardio',name:'Easy stationary bike or walk',prescription:'20–30 minutes',type:'cardio',modalities:['Stationary bike','Walk'],targetRpe:'2–3'},
    {id:'recoveryMobility',name:'Gentle mobility',prescription:'Optional · 5–10 minutes',type:'timed',optional:true}
   ]
  },
  skillMicrodose:{
   key:'skillMicrodose',
   sessionType:'skill_microdose',
   optional:true,
   advancesPrimaryRotation:false,
   templateId:'aft-skill-microdose',
   templateName:'AFT Skill Microdose',
   templateVersion:'1.0',
   templateEffectiveDate:'2026-08-06',
   weeklySkillDoseGroupId:'aft_pushup_plank_microdose',
   frequency:'once_per_monday_sunday_week',
   label:'Optional AFT Skill Microdose',
   focus:'Low-fatigue hand-release push-up and front-plank technique practice that does not advance the primary rotation.',
   targetDuration:'Approximately 10–15 minutes',
   targetSessionRpe:'3–4',
   warmup:'No separate warm-up is required. Begin with comfortable movement and keep every repetition technically clean.',
   coachInstructions:'This is low-fatigue technique practice, not a hard workout. Keep the session at RPE 3–4, stop each push-up set with several good repetitions remaining, and end plank sets before severe shaking or form breakdown. Skip the session if pain is present or soreness is affecting normal movement.',
   exercises:[
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'3 × 4',type:'body',sets:3,skippedSessionNotApplicable:true,coachingNotes:'Rest 60–90 seconds. Use technically clean, repeatable repetitions; stop well before failure with approximately 3–4 repetitions in reserve. Do not intentionally exceed the prescription.'},
    {id:'plank',name:'Front plank',prescription:'3 × 20 sec',type:'timed',sets:3,skippedSessionNotApplicable:true,coachingNotes:'Rest 60–90 seconds. Use controlled bracing and stop before severe shaking or form breakdown. Do not intentionally exceed the prescription.'},
    {id:'mobility',name:'Optional gentle mobility',prescription:'Up to 5 minutes · gentle only',type:'timed',optional:true,adherenceNotApplicable:true,coachingNotes:'There is no required mobility prescription.'}
   ]
  }
 }
};
