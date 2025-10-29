import { CreateNewMoodEntryData, ListAllActivitiesData, GetPatientProfileData, UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewMoodEntry(options?: useDataConnectMutationOptions<CreateNewMoodEntryData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewMoodEntryData, undefined>;
export function useCreateNewMoodEntry(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewMoodEntryData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewMoodEntryData, undefined>;

export function useListAllActivities(options?: useDataConnectQueryOptions<ListAllActivitiesData>): UseDataConnectQueryResult<ListAllActivitiesData, undefined>;
export function useListAllActivities(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllActivitiesData>): UseDataConnectQueryResult<ListAllActivitiesData, undefined>;

export function useGetPatientProfile(options?: useDataConnectQueryOptions<GetPatientProfileData>): UseDataConnectQueryResult<GetPatientProfileData, undefined>;
export function useGetPatientProfile(dc: DataConnect, options?: useDataConnectQueryOptions<GetPatientProfileData>): UseDataConnectQueryResult<GetPatientProfileData, undefined>;

export function useUpdateTherapistConsultationFee(options?: useDataConnectMutationOptions<UpdateTherapistConsultationFeeData, FirebaseError, UpdateTherapistConsultationFeeVariables>): UseDataConnectMutationResult<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
export function useUpdateTherapistConsultationFee(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTherapistConsultationFeeData, FirebaseError, UpdateTherapistConsultationFeeVariables>): UseDataConnectMutationResult<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
