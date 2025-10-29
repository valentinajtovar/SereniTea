# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllActivities*](#listallactivities)
  - [*GetPatientProfile*](#getpatientprofile)
- [**Mutations**](#mutations)
  - [*CreateNewMoodEntry*](#createnewmoodentry)
  - [*UpdateTherapistConsultationFee*](#updatetherapistconsultationfee)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllActivities
You can execute the `ListAllActivities` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllActivities(): QueryPromise<ListAllActivitiesData, undefined>;

interface ListAllActivitiesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllActivitiesData, undefined>;
}
export const listAllActivitiesRef: ListAllActivitiesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllActivities(dc: DataConnect): QueryPromise<ListAllActivitiesData, undefined>;

interface ListAllActivitiesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllActivitiesData, undefined>;
}
export const listAllActivitiesRef: ListAllActivitiesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllActivitiesRef:
```typescript
const name = listAllActivitiesRef.operationName;
console.log(name);
```

### Variables
The `ListAllActivities` query has no variables.
### Return Type
Recall that executing the `ListAllActivities` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllActivitiesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllActivitiesData {
  activities: ({
    id: UUIDString;
    title: string;
    description: string;
  } & Activity_Key)[];
}
```
### Using `ListAllActivities`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllActivities } from '@dataconnect/generated';


// Call the `listAllActivities()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllActivities();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllActivities(dataConnect);

console.log(data.activities);

// Or, you can use the `Promise` API.
listAllActivities().then((response) => {
  const data = response.data;
  console.log(data.activities);
});
```

### Using `ListAllActivities`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllActivitiesRef } from '@dataconnect/generated';


// Call the `listAllActivitiesRef()` function to get a reference to the query.
const ref = listAllActivitiesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllActivitiesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.activities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.activities);
});
```

## GetPatientProfile
You can execute the `GetPatientProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPatientProfile(): QueryPromise<GetPatientProfileData, undefined>;

interface GetPatientProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPatientProfileData, undefined>;
}
export const getPatientProfileRef: GetPatientProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPatientProfile(dc: DataConnect): QueryPromise<GetPatientProfileData, undefined>;

interface GetPatientProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetPatientProfileData, undefined>;
}
export const getPatientProfileRef: GetPatientProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPatientProfileRef:
```typescript
const name = getPatientProfileRef.operationName;
console.log(name);
```

### Variables
The `GetPatientProfile` query has no variables.
### Return Type
Recall that executing the `GetPatientProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPatientProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPatientProfileData {
  patientProfile?: {
    id: UUIDString;
    medicalHistory?: string | null;
    dob?: DateString | null;
  } & PatientProfile_Key;
}
```
### Using `GetPatientProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPatientProfile } from '@dataconnect/generated';


// Call the `getPatientProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPatientProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPatientProfile(dataConnect);

console.log(data.patientProfile);

// Or, you can use the `Promise` API.
getPatientProfile().then((response) => {
  const data = response.data;
  console.log(data.patientProfile);
});
```

### Using `GetPatientProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPatientProfileRef } from '@dataconnect/generated';


// Call the `getPatientProfileRef()` function to get a reference to the query.
const ref = getPatientProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPatientProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientProfile);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientProfile);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewMoodEntry
You can execute the `CreateNewMoodEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewMoodEntry(): MutationPromise<CreateNewMoodEntryData, undefined>;

interface CreateNewMoodEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewMoodEntryData, undefined>;
}
export const createNewMoodEntryRef: CreateNewMoodEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewMoodEntry(dc: DataConnect): MutationPromise<CreateNewMoodEntryData, undefined>;

interface CreateNewMoodEntryRef {
  ...
  (dc: DataConnect): MutationRef<CreateNewMoodEntryData, undefined>;
}
export const createNewMoodEntryRef: CreateNewMoodEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewMoodEntryRef:
```typescript
const name = createNewMoodEntryRef.operationName;
console.log(name);
```

### Variables
The `CreateNewMoodEntry` mutation has no variables.
### Return Type
Recall that executing the `CreateNewMoodEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewMoodEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewMoodEntryData {
  moodEntry_insert: MoodEntry_Key;
}
```
### Using `CreateNewMoodEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewMoodEntry } from '@dataconnect/generated';


// Call the `createNewMoodEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewMoodEntry();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewMoodEntry(dataConnect);

console.log(data.moodEntry_insert);

// Or, you can use the `Promise` API.
createNewMoodEntry().then((response) => {
  const data = response.data;
  console.log(data.moodEntry_insert);
});
```

### Using `CreateNewMoodEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewMoodEntryRef } from '@dataconnect/generated';


// Call the `createNewMoodEntryRef()` function to get a reference to the mutation.
const ref = createNewMoodEntryRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewMoodEntryRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.moodEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.moodEntry_insert);
});
```

## UpdateTherapistConsultationFee
You can execute the `UpdateTherapistConsultationFee` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTherapistConsultationFee(vars: UpdateTherapistConsultationFeeVariables): MutationPromise<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;

interface UpdateTherapistConsultationFeeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTherapistConsultationFeeVariables): MutationRef<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
}
export const updateTherapistConsultationFeeRef: UpdateTherapistConsultationFeeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTherapistConsultationFee(dc: DataConnect, vars: UpdateTherapistConsultationFeeVariables): MutationPromise<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;

interface UpdateTherapistConsultationFeeRef {
  ...
  (dc: DataConnect, vars: UpdateTherapistConsultationFeeVariables): MutationRef<UpdateTherapistConsultationFeeData, UpdateTherapistConsultationFeeVariables>;
}
export const updateTherapistConsultationFeeRef: UpdateTherapistConsultationFeeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTherapistConsultationFeeRef:
```typescript
const name = updateTherapistConsultationFeeRef.operationName;
console.log(name);
```

### Variables
The `UpdateTherapistConsultationFee` mutation requires an argument of type `UpdateTherapistConsultationFeeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTherapistConsultationFeeVariables {
  newFee: number;
}
```
### Return Type
Recall that executing the `UpdateTherapistConsultationFee` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTherapistConsultationFeeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTherapistConsultationFeeData {
  therapistProfile_update?: TherapistProfile_Key | null;
}
```
### Using `UpdateTherapistConsultationFee`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTherapistConsultationFee, UpdateTherapistConsultationFeeVariables } from '@dataconnect/generated';

// The `UpdateTherapistConsultationFee` mutation requires an argument of type `UpdateTherapistConsultationFeeVariables`:
const updateTherapistConsultationFeeVars: UpdateTherapistConsultationFeeVariables = {
  newFee: ..., 
};

// Call the `updateTherapistConsultationFee()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTherapistConsultationFee(updateTherapistConsultationFeeVars);
// Variables can be defined inline as well.
const { data } = await updateTherapistConsultationFee({ newFee: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTherapistConsultationFee(dataConnect, updateTherapistConsultationFeeVars);

console.log(data.therapistProfile_update);

// Or, you can use the `Promise` API.
updateTherapistConsultationFee(updateTherapistConsultationFeeVars).then((response) => {
  const data = response.data;
  console.log(data.therapistProfile_update);
});
```

### Using `UpdateTherapistConsultationFee`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTherapistConsultationFeeRef, UpdateTherapistConsultationFeeVariables } from '@dataconnect/generated';

// The `UpdateTherapistConsultationFee` mutation requires an argument of type `UpdateTherapistConsultationFeeVariables`:
const updateTherapistConsultationFeeVars: UpdateTherapistConsultationFeeVariables = {
  newFee: ..., 
};

// Call the `updateTherapistConsultationFeeRef()` function to get a reference to the mutation.
const ref = updateTherapistConsultationFeeRef(updateTherapistConsultationFeeVars);
// Variables can be defined inline as well.
const ref = updateTherapistConsultationFeeRef({ newFee: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTherapistConsultationFeeRef(dataConnect, updateTherapistConsultationFeeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.therapistProfile_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.therapistProfile_update);
});
```

