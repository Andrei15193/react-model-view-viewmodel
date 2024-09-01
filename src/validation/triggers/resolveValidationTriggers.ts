import { type WellKnownValidationTrigger, ValidationTrigger } from './ValidationTrigger';
import { CollectionChangedValidationTrigger } from './CollectionChangedValidationTrigger';
import { CollectionReorderedValidationTrigger } from './CollectionReorderedValidationTrigger';
import { SetChangedValidationTrigger } from './SetChangedValidationTrigger';
import { MapChangedValidationTrigger } from './MapChangedValidationTrigger';
import { ViewModelChangedValidationTrigger } from './ViewModelChangedValidationTrigger';
import { CollectionItemValidationTrigger } from './CollectionItemValidationTrigger';
import { SetItemValidationTrigger } from './SetItemValidationTrigger';

export function resolveValidationTriggers(validationTrigger: WellKnownValidationTrigger | ValidationTrigger): readonly ValidationTrigger[] {
    const validationTriggers = new Array<ValidationTrigger>();

    if (validationTrigger !== null && validationTrigger !== undefined) {
        if (Array.isArray(validationTrigger)) {
            const [collection, validationTriggerSelector] = validationTrigger;

            if (collection !== null && collection !== undefined && validationTrigger !== null && validationTrigger !== undefined) {
                if ('collectionChanged' in collection)
                    validationTriggers.push(new CollectionItemValidationTrigger({ collection, validationTriggerSelector }));
                if ('setChanged' in collection)
                    validationTriggers.push(new SetItemValidationTrigger({ set: collection, validationTriggerSelector }));
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