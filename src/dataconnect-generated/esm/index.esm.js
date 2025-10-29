import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'serenitea',
  location: 'us-central1'
};

export const createNewMoodEntryRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewMoodEntry');
}
createNewMoodEntryRef.operationName = 'CreateNewMoodEntry';

export function createNewMoodEntry(dc) {
  return executeMutation(createNewMoodEntryRef(dc));
}

export const listAllActivitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllActivities');
}
listAllActivitiesRef.operationName = 'ListAllActivities';

export function listAllActivities(dc) {
  return executeQuery(listAllActivitiesRef(dc));
}

export const getPatientProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPatientProfile');
}
getPatientProfileRef.operationName = 'GetPatientProfile';

export function getPatientProfile(dc) {
  return executeQuery(getPatientProfileRef(dc));
}

export const updateTherapistConsultationFeeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTherapistConsultationFee', inputVars);
}
updateTherapistConsultationFeeRef.operationName = 'UpdateTherapistConsultationFee';

export function updateTherapistConsultationFee(dcOrVars, vars) {
  return executeMutation(updateTherapistConsultationFeeRef(dcOrVars, vars));
}

