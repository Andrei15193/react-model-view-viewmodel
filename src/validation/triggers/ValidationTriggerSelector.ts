import type { IObjectValidator } from '../objectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';
import { Form } from '../../forms';

/**
 * Represents a callback selector for individual items when configuring collection-based triggers.
 * @param object The item in the collection for whom to select the triggers.
 * @returns Returns the validation triggers for the given object.
 *
 * @see {@linkcode WellKnownValidationTrigger}
 */
export type ValidationTriggerSelector<T> = (object: T) => ValidationTriggerSet;

/**
 * Represents a single validation trigger or a range of validation triggers that should be
 * configured for an individual target.
 * 
 * @see {@linkcode Form.validation}
 * @see {@linkcode IObjectValidator}
 * @see {@linkcode WellKnownValidationTrigger}
 */
export type ValidationTriggerSet
    = WellKnownValidationTrigger
    | ValidationTrigger
    | readonly (WellKnownValidationTrigger | ValidationTrigger)[];