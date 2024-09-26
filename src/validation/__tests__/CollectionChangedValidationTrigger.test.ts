import { ObservableCollection } from '../../collections';
import { CollectionChangedValidationTrigger } from '../triggers';

describe('CollectionChangedValidationTrigger', (): void => {
    it('validation is triggered when collection changes', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>();
        const validationTrigger = new CollectionChangedValidationTrigger({
            collection
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        collection.push(1, 2, 3);

        expect(invocationCount).toBe(1);
    });

    it('validation is not triggered when collection changes but check returns false', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>();
        const validationTrigger = new CollectionChangedValidationTrigger({
            collection,
            shouldTriggerValidation() {
                return false;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        collection.push(1, 2, 3);

        expect(invocationCount).toBe(0);
    });

    it('validation is triggered when collection changes and check returns true', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>();
        const validationTrigger = new CollectionChangedValidationTrigger({
            collection,
            shouldTriggerValidation() {
                return true;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        collection.push(1, 2, 3);

        expect(invocationCount).toBe(1);
    });
});