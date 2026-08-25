window.AFT_PROGRAM_CONFIG={
 id:'aft-foundation-block-1',
 name:'AFT Foundation Block 1',
 version:'1.4.8',
 effectiveDate:'2026-08-26',
 currentRunStage:4,
 rotation:['day1','day2','day3','day4'],
 runStages:[
  {id:1,label:'1:00 walk / 1:00 run × 10',runMinutes:'1',walkMinutes:'1',rounds:'10'},
  {id:2,label:'1:00 walk / 1:30 run × 8',runMinutes:'1.5',walkMinutes:'1',rounds:'8'},
  {id:3,label:'1:00 walk / 2:00 run × 7',runMinutes:'2',walkMinutes:'1',rounds:'7'},
  {id:4,label:'1:00 walk / 2:30 run × 6',runMinutes:'2.5',walkMinutes:'1',rounds:'6'},
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
   instruction:'Perform the paired curl and triceps exercise back-to-back, then rest 60–90 seconds.'
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
  },
  'foundation-1.4':{
   plannedRounds:2,
   components:[
    {id:'farmerCarry',order:1,exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',prescription:'45 lb per hand for approximately 30 seconds',planned:{load:'45',loadUnit:'lb per hand',durationSeconds:'30',durationApproximate:true}},
    {id:'lateralStepUps',order:2,exerciseId:'lateralStepUps',name:'Lateral step-ups',type:'reps',prescription:'6 repetitions per side',planned:{repsPerSide:'6'}},
    {id:'hardCardio',order:3,exerciseId:'hardCardio',name:'Hard cardio',type:'cardio',prescription:'Approximately 30 seconds hard',planned:{durationSeconds:'30',durationApproximate:true},modalities:['Bike','Rower','Elliptical','Short safe sprint']},
    {id:'backwardSledDrag',order:4,exerciseId:'backwardSledDrag',name:'Backward sled drag',type:'sled',prescription:'One controlled gym-lane trip · record distance, load, duration, surface, and RPE when known',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'One gym lane',direction:'backward_drag'}},
    {id:'forwardSledPush',order:5,exerciseId:'forwardSledPush',name:'Forward sled push',type:'sled',prescription:'One controlled gym-lane trip · record distance, load, duration, surface, and RPE when known',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'One gym lane',direction:'forward_push'}},
    {id:'rest',order:6,exerciseId:'circuitRest',name:'Rest',type:'rest',prescription:'2 minutes 30 seconds',planned:{durationSeconds:'150'}}
   ]
  },
  'foundation-1.4.5':{
   plannedRounds:2,
   components:[
    {id:'farmerCarry',order:1,exerciseId:'loadedCarry',name:'Farmer carry',type:'carry',prescription:'45 lb per hand for approximately 30 seconds',planned:{load:'45',loadUnit:'lb per hand',durationSeconds:'30',durationApproximate:true}},
    {id:'lateralStepUps',order:2,exerciseId:'lateralStepUps',name:'Lateral step-ups',type:'reps',prescription:'6 repetitions per side',planned:{repsPerSide:'6'}},
    {id:'hardCardio',order:3,exerciseId:'hardCardio',name:'Hard cardio',type:'cardio',prescription:'Approximately 30 seconds hard',planned:{durationSeconds:'30',durationApproximate:true},modalities:['Bike','Rower','Elliptical','Short safe sprint']},
    {id:'backwardSledDrag',order:4,exerciseId:'backwardSledDrag',name:'Backward sled drag',type:'sled',prescription:'One controlled trip on the Torque Fitness TANK M4 at Level 3 over the approximately 20-yard gym lane',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'Approximately 20 yd gym lane',equipmentLabel:'Torque Fitness TANK M4 · Level 3',direction:'backward_drag'}},
    {id:'forwardSledPush',order:5,exerciseId:'forwardSledPush',name:'Forward sled push',type:'sled',prescription:'One controlled trip on the Torque Fitness TANK M4 at Level 3 over the approximately 20-yard gym lane',planned:{trips:'1',distanceMode:'lane_unknown',distanceLabel:'Approximately 20 yd gym lane',equipmentLabel:'Torque Fitness TANK M4 · Level 3',direction:'forward_push'}},
    {id:'rest',order:6,exerciseId:'circuitRest',name:'Rest',type:'rest',prescription:'2 minutes 30 seconds',planned:{durationSeconds:'150'}}
   ]
  }
 },
 coachNoteOverlays:[
  {
   id:'day2-lateral-raise-right-elbow-2026-08-03',programVersion:'1.3',workoutDayId:'day2',exerciseId:'lateralRaise',
   effectiveDate:'2026-08-03',status:'resolved',resolvedDate:'2026-08-12',
   text:'Right medial-elbow discomfort occurred with the dumbbell variation. Use a pain-free machine or cuffed-cable variation, or omit this exercise. Stop if discomfort increases.',
   reason:'Right medial-elbow twinge rated 1/10 during the August 3 workout.'
  },
  {
   id:'day2-lateral-raise-right-elbow-v1.4',programVersion:'1.4',workoutDayId:'day2',exerciseId:'lateralRaise',
   effectiveDate:'2026-08-08',status:'resolved',resolvedDate:'2026-08-12',
   text:'Right medial-elbow discomfort occurred with the dumbbell variation. Use a pain-free machine or cuffed-cable variation, or omit this exercise. Stop if discomfort increases.',
   reason:'The temporary pain-free lateral-raise substitution directive remains active in Foundation Block 1 v1.4.'
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
    {id:'deadlift',name:'Trap-bar deadlift',prescription:'165 lb total for 3 × 5',type:'weighted',unit:'lb',sets:3,targetLoad:165,targetLoadVariation:'Trap / hex bar',targetRpe:'6–8',variations:['Trap / hex bar','Conventional barbell','Sumo barbell','Dumbbells'],defaultVariation:'Trap / hex bar',barWeights:{'Trap / hex bar':45,'Conventional barbell':45,'Sumo barbell':45},perSideVariations:['Trap / hex bar'],barWeightOptions:[45,55,60],coachingNotes:'Use the trap/hex bar when available. Maintain technically clean repetitions and do not pursue grinders. Record the actual bar weight and plate weight per side; use another listed variation when equipment requires it. Future progression remains coach-directed and performance-based.'},
    {id:'squatOrLegPress',name:'Leg press',prescription:'140 lb for 3 × 10',type:'weighted',unit:'lb',sets:3,targetLoad:140,targetLoadVariation:'Leg press',variations:['Leg press','Lying leg press','Upright leg press','Plate-loaded leg press','Selectorized leg press','Other leg press'],defaultVariation:'Leg press',targetRpe:'7',coachingNotes:'Use 140 lb only on the same leg-press machine and setup as the August 23 exposure. Log other equipment as a substitution and keep all three sets controlled at approximately RPE 7.'},
    {id:'horizontalPress',name:'Dumbbell bench press',prescription:'40 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:40,targetLoadVariation:'Dumbbell bench press',targetRpe:'7–8',variations:['Dumbbell bench press','Chest-press machine','Barbell bench press'],defaultVariation:'Dumbbell bench press',barWeights:{'Barbell bench press':45},coachingNotes:'Use controlled repetitions and finish with approximately 2–3 technically good repetitions remaining.'},
    {id:'seatedRow',name:'Seated cable row',prescription:'Next smallest increment above 88 lb on the same cable setup (approximately 99 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'6–8',variations:['Seated cable row','Chest-supported machine row'],defaultVariation:'Seated cable row',coachingNotes:'Use the next smallest increment above 88 lb only on the same seated cable-row setup. Approximately 99 lb is guidance for an 11-lb stack increment, not a universal target for another cable or pulley setup.'},
    {id:'loadedCarry',name:'Farmer carry',prescription:'45 lb per hand for 4 trips of approximately 30–40 yd',type:'carry',unit:'lb per hand',sets:4,targetRpe:'6–8',variations:['Farmer carry','Heavy static hold','Suitcase carry'],defaultVariation:'Farmer carry',coachingNotes:'Aim for approximately 40 yd per trip within the prescribed range. Keep the current load and do not progress it while the Day 3 sled work is in the program.'},
    {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45'],coachingNotes:'Maintain clean front-plank technique throughout each set.'},
    {id:'runWalkIntervals',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'interval',runStage:4,targetRpe:'5–6',coachingNotes:'This run follows the primary strength work and is not a pace test. On a treadmill, start the running segments around 6.0–6.1 mph. If RPE is already above 6 by the early-middle rounds, reduce speed rather than forcing pace. Do not chase total distance or overall average pace; the purpose is extending continuous-running tolerance after lifting. Finish each 2:30 running segment with reserve and record actual walk and run speeds in the existing run details.'},
    {id:'preacherCurl',name:'Preacher curl',prescription:'2 × 10–15; use 40 lb total on the same EZ-bar setup',type:'weighted',unit:'lb total',sets:2,targetLoad:40,targetLoadVariation:'EZ-bar preacher curl',targetRpe:'7–9',variations:['Machine preacher curl','EZ-bar preacher curl','Dumbbell preacher curl','Cable preacher curl'],defaultVariation:'EZ-bar preacher curl',variationUnits:{'Machine preacher curl':'lb total','EZ-bar preacher curl':'lb total','Dumbbell preacher curl':'lb per hand','Cable preacher curl':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Keep 40 lb total only when using the same EZ-bar setup. Other variations are not directly load-comparable. Use controlled full repetitions and do not make a coach-directed load increase without a comparable RPE or effort signal.'},
    {id:'tricepsPressdown',name:'Cable triceps pressdown',prescription:'77 lb for 2 × 15 on the same machine/cable setup',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',group:'armSuperset',optional:true,coachingNotes:'Use 77 lb only on the same machine and cable setup as the August 17 exposure. The displayed stack value is not a universal load target. Once both sets of 15 are completed in the target RPE range, the coach may consider a future load progression; progression is never automatic.'}
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
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'5 × 9',type:'body',sets:5,targetRpe:'6–8',coachingNotes:'Keep all five sets equal, technically clean, and submaximal. Maintain strong whole-body bracing, stop before failure, and do not turn this into a maximal-set test.'},
    {id:'verticalPull',name:'Lat pulldown',prescription:'Next smallest increment above 154 lb on the same seated machine (approximately 165 lb displayed if it uses 11-lb increments) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'6–8',variations:['Seated lat pulldown','Modified standing lat pulldown','Assisted pull-up','Band-assisted pull-up'],defaultVariation:'Seated lat pulldown',coachingNotes:'Use the next smallest machine increment above 154 lb only on the same seated machine and setup. Approximately 165 lb is guidance for an 11-lb stack increment, not a universal target for a different cable or pulley setup.'},
    {id:'overheadPress',name:'Seated dumbbell overhead press',prescription:'30 lb per hand for 3 × 8',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Seated dumbbell press',targetRpe:'7–9',variations:['Seated dumbbell press','Standing dumbbell press','Machine shoulder press'],defaultVariation:'Seated dumbbell press',coachingNotes:'Use controlled repetitions and keep the working sets within the target effort range.'},
    {id:'chestSupportedRow',name:'Machine row',prescription:'Next smallest increment above 88 lb on the same machine (approximately 99 lb displayed if applicable) for 3 × 8–10',type:'weighted',unit:'lb',sets:3,targetRpe:'7–8',variations:['Dumbbell row','Machine row','T-bar row'],defaultVariation:'Machine row',coachingNotes:'Use the next smallest increment above 88 lb only on the same machine and setup. Approximately 99 lb is setup-specific guidance rather than a universal machine-row load.'},
    {id:'lateralRaise',name:'Cable lateral raise',prescription:'33 lb displayed per side on the same comparable cable setup for 2 × 18',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–8',variations:['Cable lateral raise','Cuffed-cable lateral raise','Machine lateral raise','Dumbbell lateral raise'],defaultVariation:'Cable lateral raise',variationUnits:{'Cable lateral raise':'lb per side','Cuffed-cable lateral raise':'lb per side','Machine lateral raise':'lb total','Dumbbell lateral raise':'lb per hand'},coachingNotes:'Use rep progression on the same pain-free cable setup and load from August 25. The displayed 33 lb per side is not a universal load target. Maintain pain-free technique.'},
    {id:'chestFly',name:'Cable fly / pec deck',prescription:'Next smallest increment above 66 lb on the same pec-deck setup (approximately 77 lb displayed if applicable) for 2 × 12',type:'weighted',unit:'lb per side',sets:2,targetRpe:'7–9',variations:['Pec deck / machine fly','Cable chest fly'],defaultVariation:'Pec deck / machine fly',variationUnits:{'Cable chest fly':'lb per side','Pec deck / machine fly':'lb total'},coachingNotes:'Use the next smallest increment above 66 lb only on the same pec-deck machine and setup. Approximately 77 lb is setup-specific guidance. Keep the stretch and contraction controlled and stop with approximately 1–3 good repetitions in reserve.'},
    {id:'trunkStability',name:'Dead bug or Pallof press',prescription:'3 × 10 each side',type:'body',sets:3,variations:['Dead bug','Pallof press'],defaultVariation:'Dead bug',coachingNotes:'Keep the movement slow and controlled. Use a full exhale and deliberate brace rather than increasing repetitions because the current variation feels easy.'},
    {id:'easyCardio',name:'Easy cardio',prescription:'25–30 minutes',type:'cardio',modalities:['Bike','Elliptical','Rower','Incline walk','Other'],targetRpe:'4–5',coachingNotes:'Use conversational effort throughout.'}
   ]
  },
  day3:{
   key:'day3',
   sessionType:'primary',
   label:'Day 3 — Lower Strength and Gym Conditioning',
   focus:'Reduced lower-body volume and a capped two-round conditioning circuit.',
   targetSessionRpe:'7–8',
   warmup:'Approximately 10 progressive minutes: easy cardio, dynamic hip and ankle prep, then 2–4 Romanian-deadlift warm-up sets.',
   exercises:[
    {id:'romanianDeadlift',name:'Romanian deadlift',prescription:'125 lb total for 2 × 8',type:'weighted',unit:'lb',sets:2,targetLoad:125,targetLoadVariation:'Barbell',targetRpe:'6–8',variations:['Barbell','Dumbbells','Smith machine'],defaultVariation:'Barbell',barWeights:{'Barbell':45,'Smith machine':20},coachingNotes:'Use technically clean repetitions; this progression follows two 115 lb exposures completed at RPE 6.'},
    {id:'squatPattern',name:'Goblet squat',prescription:'55 lb for 3 × 9',type:'weighted',unit:'lb',sets:3,targetLoad:55,targetLoadVariation:'Goblet squat',targetRpe:'7–8',variations:['Goblet squat','Front squat','Hack squat','Leg press'],defaultVariation:'Goblet squat',barWeights:{'Front squat':45},coachingNotes:'Keep the goblet-squat load fixed at 55 lb while progressing repetitions.'},
    {id:'inclinePress',name:'Incline dumbbell press',prescription:'30 lb per hand for 3 × 10',type:'weighted',unit:'lb per hand',sets:3,targetLoad:30,targetLoadVariation:'Incline dumbbell press',targetRpe:'7–8',variations:['Incline dumbbell press','Incline chest-press machine'],defaultVariation:'Incline dumbbell press',coachingNotes:'Keep 30 lb per hand and complete three technically clean sets of 10 before any future load change.'},
    {id:'oneArmRow',name:'One-arm dumbbell row',prescription:'45 lb for 3 × 11 each side',type:'weighted',unit:'lb',sets:3,targetLoad:45,targetLoadVariation:'One-arm dumbbell row',targetRpe:'6–8',variations:['One-arm dumbbell row','One-arm cable row'],defaultVariation:'One-arm dumbbell row'},
    {id:'singleLegStrength',name:'Split squat',prescription:'Body weight for 2 × 10 each leg',type:'weighted',unit:'lb total',sets:2,targetRpe:'6–7',variations:['Body-weight split squat','Light dumbbell split squat','Forward step-up','Lateral step-up'],defaultVariation:'Body-weight split squat',coachingNotes:'Use body weight and controlled repetitions for both sets.'},
    {id:'sidePlank',name:'Side plank',prescription:'3 × 40 sec each side',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:40','0:40','0:40']},
    {id:'gymConditioningCircuit',name:'Gym conditioning circuit',prescription:'Exactly 2 rounds: 30-sec farmer carry, 6 lateral step-ups each side, approximately 30-sec hard cardio, one backward sled drag, one forward sled push, then 2:30 rest',type:'circuit',circuitVersion:'foundation-1.4.5',targetRpe:'7–8',defaults:{carryLoad:'45',carrySeconds:'30',stepReps:'6',intervalSeconds:'30',restSeconds:'150'},modalities:['Bike','Rower','Elliptical','Short safe sprint'],coachingNotes:'Keep exactly two rounds. Use the Torque Fitness TANK M4 at Level 3 on the same approximately 20-yard gym lane when available, and record that equipment label in the existing sled fields. Level 3 is a resistance setting, not a weight. Do not automatically increase sled resistance, hard-cardio duration, or round count.'},
    {id:'hammerCurl',name:'Hammer curl',prescription:'20 lb per hand for 2 × 15',type:'weighted',unit:'lb per hand',sets:2,targetLoad:20,targetLoadVariation:'Dumbbell hammer curl',targetRpe:'7–9',variations:['Dumbbell hammer curl','Rope cable hammer curl'],defaultVariation:'Dumbbell hammer curl',variationUnits:{'Dumbbell hammer curl':'lb per hand','Rope cable hammer curl':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Treat 20 lb per hand as the current valid working load; this is not a failed 25-lb progression.'},
    {id:'overheadTricepsExtension',name:'Overhead cable triceps extension',prescription:'88 lb for 2 × 15 on the same rope/cable setup',type:'weighted',unit:'lb total',sets:2,targetRpe:'7–9',variations:['Rope overhead cable extension','Single-arm overhead cable extension','Other equivalent cable variation'],defaultVariation:'Rope overhead cable extension',variationUnits:{'Rope overhead cable extension':'lb total','Single-arm overhead cable extension':'lb per side','Other equivalent cable variation':'lb total'},group:'armSuperset',optional:true,coachingNotes:'Use the same rope and cable setup as the August 20 exposure. Keep a pain-free shoulder position and controlled stretch. The displayed 88-lb stack value is setup-specific rather than a universal load target.'}
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
    {id:'primaryRun',name:'Walk / run intervals',prescription:'Stage 4 — 1:00 walk / 2:30 run × 6',type:'run',runStage:4,targetRpe:'5–6',coachingNotes:'On a treadmill, use approximately 6.2–6.4 mph while prioritizing completion of each 2:30 running segment with reserve. Do not increase speed simply because the prior Stage 3 session was completed at 6.4 mph; duration progression takes priority over speed progression. Record actual walk and run speeds in the existing run details.'},
    {id:'handReleasePushups',name:'Hand-release push-ups',prescription:'4 × 8',type:'body',sets:4,targetRpe:'5–7',coachingNotes:'Use four equal, technically clean sets and stop before failure.'},
    {id:'plank',name:'Front plank',prescription:'3 × 45 sec',type:'timed',sets:3,targetRpe:'6–8',prescribedTimes:['0:45','0:45','0:45']},
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
