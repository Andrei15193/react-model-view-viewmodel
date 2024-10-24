import type { ValidationTriggerSet } from './ValidationTriggerSelector';
import { type WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';
import { resolveValidationTriggers } from './resolveValidationTriggers';

/**
 * Resolves the given well-known validation triggers to concrete ones.
 * @param validationTriggers The well-known validation triggers to interpret. 
 * @returns Returns a set of concrete validation triggers that correspond to the given well-known ones.
 */
export function resolveAllValidationTriggers(validationTriggers: ValidationTriggerSet): readonly ValidationTrigger[] {
    if (validationTriggers === null || validationTriggers === undefined)
        return [];
    else if (isArray<WellKnownValidationTrigger | ValidationTrigger>(validationTriggers))
        if (validationTriggers.length === 0)
            return []
        else
            return validationTriggers.reduce(
                (resolvedValidationTriggers, validationTrigger) => {
                    resolvedValidationTriggers.push(...resolveValidationTriggers(validationTrigger));
                    return resolvedValidationTriggers;
                },
                new Array<ValidationTrigger>()
            );
    else
        return resolveValidationTriggers(validationTriggers);
}

function isArray<T>(maybeArray: any): maybeArray is readonly T[] {
    return Array.isArray(maybeArray);
}