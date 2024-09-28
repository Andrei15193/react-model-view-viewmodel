import { type WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';
import { resolveValidationTriggers } from './resolveValidationTriggers';

/**
 * Resolves the given well-known validation triggers to concrete ones.
 * @param validationTriggers The well-known validation triggers to interpret. 
 * @returns Returns a set of concrete validation triggers that correspond to the given well-known ones.
 */
export function resolveAllValidationTriggers(validationTriggers: readonly (WellKnownValidationTrigger | ValidationTrigger)[]): readonly ValidationTrigger[] {
    if (validationTriggers === null || validationTriggers === undefined || validationTriggers.length === 0)
        return [];
    else
        return validationTriggers.reduce(
            (resolvedValidationTriggers, validationTrigger) => {
                resolvedValidationTriggers.push(...resolveValidationTriggers(validationTrigger));
                return resolvedValidationTriggers;
            },
            new Array<ValidationTrigger>()
        );
}