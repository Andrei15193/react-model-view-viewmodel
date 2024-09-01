import { type WellKnownValidationTrigger, ValidationTrigger } from "./ValidationTrigger";
import { resolveValidationTriggers } from "./resolveValidationTriggers";

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