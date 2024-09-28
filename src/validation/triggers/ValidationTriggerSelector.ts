import type { WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';

/**
 * Represents a callback selector for individual items when configuring collection-based triggers.
 * @param object The item in the collection for whom to select the triggers.
 * @returns Returns the validation triggers for the given object.
 */
export type ValidationTriggerSelector<T> = (object: T) => readonly (WellKnownValidationTrigger | ValidationTrigger)[];