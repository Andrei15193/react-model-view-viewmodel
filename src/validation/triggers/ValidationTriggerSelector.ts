import type { WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';

export type ValidationTriggerSelector<T> = (object: T) => readonly (WellKnownValidationTrigger | ValidationTrigger)[];