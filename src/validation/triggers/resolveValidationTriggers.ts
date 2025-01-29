import type { WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';
import { CollectionChangedValidationTrigger } from './CollectionChangedValidationTrigger';
import { CollectionItemValidationTrigger } from './CollectionItemValidationTrigger';
import { CollectionReorderedValidationTrigger } from './CollectionReorderedValidationTrigger';
import { MapChangedValidationTrigger } from './MapChangedValidationTrigger';
import { MapItemValidationTrigger } from './MapItemValidationTrigger';
import { SetChangedValidationTrigger } from './SetChangedValidationTrigger';
import { SetItemValidationTrigger } from './SetItemValidationTrigger';
import { ViewModelChangedValidationTrigger } from './ViewModelChangedValidationTrigger';

/**
 * Resolves the given well-known validation trigger to concrete ones.
 * @param validationTrigger The well-known validation trigger to interpret.
 * @returns Returns a set of concrete validation triggers that correspond to the given well-known one.
 */
export function resolveValidationTriggers(validationTrigger: WellKnownValidationTrigger | ValidationTrigger): readonly ValidationTrigger[] {
    const validationTriggers = new Array<ValidationTrigger>();

    if (validationTrigger !== null && validationTrigger !== undefined) {
        if (Array.isArray(validationTrigger)) {
            const [collection, validationTriggerSelector] = validationTrigger;

            if (collection !== null && collection !== undefined && validationTrigger !== null && validationTrigger !== undefined) {
                if ('collectionChanged' in collection)
                    validationTriggers.push(new CollectionItemValidationTrigger({
                        collection,
                        validationTriggerSelector
                    }));
                if ('setChanged' in collection)
                    validationTriggers.push(new SetItemValidationTrigger({
                        set: collection,
                        validationTriggerSelector
                    }));
                if ('mapChanged' in collection)
                    validationTriggers.push(new MapItemValidationTrigger({
                        map: collection,
                        validationTriggerSelector
                    }));
            }
        }
        else {
            let isSpecialized = false;

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
    }

    return validationTriggers;
}