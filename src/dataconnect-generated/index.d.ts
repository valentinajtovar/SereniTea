import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Activity_Key {
  id: UUIDString;
  __typename?: 'Activity_Key';
}

export interface AssignedActivity_Key {
  id: UUIDString;
  __typename?: 'AssignedActivity_Key';
}

export interface CreateNewMoodEntryData {
  moodEntry_insert: MoodEntry_Key;
}

export interface ForumPost_Key {
  id: UUIDString;
  __typename?: 'ForumPost_Key';
}

export interface GetPatientProfileData {
  patientProfile?: {
    id: UUIDString;
    medicalHistory?: string | null;
    dob?: DateString | null;
  } & PatientProfile_Key;
}

export interface ListAllActivitiesData {
  activities: ({
    id: UUIDString;
    title: string;
    description: string;
  } & Activity_Key)[];
}

export interface MoodEntry_Key {
  id: UUIDString;
  __typename?: 'MoodEntry_Key';
}

export interface PatientProfile_Key {
  id: UUIDString;
  __typename?: 'PatientProfile_Key';
}

export interface TherapistProfile_Key {
  id: UUIDString;
  __typename?: 'TherapistProfile_Key';
}

export interface UpdateTherapistConsultationFeeData {
  therapistProfile_update?: TherapistProfile_Key | null;
}

export interface UpdateTherapistConsultationFeeVariables {
  newFee: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewMoodEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewMoodEntryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewMoodEntryData, undefined>;
  operationName: string;
}
export const createNewMoodEntryRef: CreateNewMoodEntryRef;

export function createNewMoodEntry(): MutationPromise<CreateNewMoodEntryData, undefined>;
export function createNewMoodEntry(dc: DataConnect): MutationPromise<CreateNewMoodEntryData, undefined>;

interface ListAllActivitiesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllActivitiesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllActivitiesData, undefined>;
  operationName: string;
}
export const listAllActivitiesRef: ListAllActivitiesRef;

export function listAllActivities(): QueryPromise<ListAllActivitiesData, undefined>;
export function listAllActivities(dc: DataConnect): QueryPromise<ListAllActivitiesData, undefined>;

interface GetPatientProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPatientProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPatientProfileData, undefined>;
  operationName: string;
}
export const getPatientProfileRef: GetPatientProfileRef;

export function getPatientProfile(): QueryPromise<GetPatientProfileData, undefined>;
export function getPatientProfile(dc: DataConnect): QueryPromise<GetPatientProfileData, undefined>;

interface UpdateTherapistConsultationFeeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTherapistConsultationFeeVariables): MutationRef<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTherapistConsultationFeeVariables): MutationRef<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
  operationName: string;
}
export const updateTherapistConsultationFeeRef: UpdateTherapistConsultationFeeRef;

export function updateTherapistConsultationFee(vars: UpdateTherapistConsultationFeeVariables): MutationPromise<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
export function updateTherapistConsultationFee(dc: DataConnect, vars: UpdateTherapistConsultationFeeVariables): MutationPromise<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;

