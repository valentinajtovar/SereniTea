const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'serenitea',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewMoodEntryRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewMoodEntry');
}
createNewMoodEntryRef.operationName = 'CreateNewMoodEntry';
exports.createNewMoodEntryRef = createNewMoodEntryRef;

exports.createNewMoodEntry = function createNewMoodEntry(dc) {
  return executeMutation(createNewMoodEntryRef(dc));
};

const listAllActivitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllActivities');
}
listAllActivitiesRef.operationName = 'ListAllActivities';
exports.listAllActivitiesRef = listAllActivitiesRef;

exports.listAllActivities = function listAllActivities(dc) {
  return executeQuery(listAllActivitiesRef(dc));
};

const getPatientProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPatientProfile');
}
getPatientProfileRef.operationName = 'GetPatientProfile';
exports.getPatientProfileRef = getPatientProfileRef;

exports.getPatientProfile = function getPatientProfile(dc) {
  return executeQuery(getPatientProfileRef(dc));
};

const updateTherapistConsultationFeeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTherapistConsultationFee', inputVars);
}
updateTherapistConsultationFeeRef.operationName = 'UpdateTherapistConsultationFee';
exports.updateTherapistConsultationFeeRef = updateTherapistConsultationFeeRef;

exports.updateTherapistConsultationFee = function updateTherapistConsultationFee(dcOrVars, vars) {
  return executeMutation(updateTherapistConsultationFeeRef(dcOrVars, vars));
};
