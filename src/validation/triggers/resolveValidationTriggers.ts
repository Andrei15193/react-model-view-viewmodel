import type { WellKnownValidationTrigger, ValidationTrigger } from "./ValidationTrigger";
import { CollectionChangedValidationTrigger } from "./CollectionChangedValidationTrigger";
import { CollectionReorderedValidationTrigger } from "./CollectionReorderedValidationTrigger";
import { SetChangedValidationTrigger } from "./SetChangedValidationTrigger";
import { MapChangedValidationTrigger } from "./MapChangedValidationTrigger";
import { ViewModelChangedValidationTrigger } from "./ViewModelChangedValidationTrigger";

export function resolveValidationTriggers(validationTrigger: WellKnownValidationTrigger | ValidationTrigger): readonly ValidationTrigger[] {
    let isSpecialized = false;
    const validationTriggers = new Array<ValidationTrigger>();

    if (validationTrigger !== null && validationTrigger !== undefined) {
        if ('collectionChanged' in validationTrigger) {
            isSpecialized = true;
            validationTriggers.push(new CollectionChangedValidationTrigger({ collection: validationTrigger }));
        }
        if ('collectionReordered' in validationTrigger) {
            isSpecialized = true;
            validationTriggers.push(new CollectionReorderedValidationTrigger({ collection: validationTrigger }));
        }

        if ('setChanged' in validationTrigger) {
            isSpecialized = true;
            validationTriggers.push(new SetChangedValidationTrigger({ set: validationTrigger }));
        }

        if ('mapChanged' in validationTrigger) {
            isSpecialized = true;
            validationTriggers.push(new MapChangedValidationTrigger({ map: validationTrigger }));
        }

        if (!isSpecialized)
            if ('propertiesChanged' in validationTrigger)
                validationTriggers.push(new ViewModelChangedValidationTrigger({ viewModel: validationTrigger }));
            else if (typeof validationTrigger === 'object')
                validationTriggers.push(validationTrigger as ValidationTrigger);
    }

    return validationTriggers;
}