// Firebase's web configuration identifies the project; it is not an admin key or
// a secret. Firestore Security Rules remain the security boundary for workout data.
//
// Set `enabled` false only when cloud sign-in and synchronization should be disabled.
window.AFT_CLOUD_CONFIG=Object.freeze({
 enabled:true,
 provider:'firebase',
 firebase:{
  apiKey:'AIzaSyC4E2HAUxFNCMf9ocInFI1Tyxtm8ToTd8A',
  authDomain:'fitness-tracker-16dfb.firebaseapp.com',
  projectId:'fitness-tracker-16dfb',
  appId:'1:353220973721:web:12044748bb1e6f99cc1408'
 }
});
