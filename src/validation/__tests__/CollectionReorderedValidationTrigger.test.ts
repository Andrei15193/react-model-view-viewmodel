import { ObservableCollection } from '../../collections';
import { CollectionReorderedValidationTrigger } from '../triggers';

describe('CollectionReorderedValidationTrigger', (): void => {
    it('validation is triggered when collection changes', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>([1, 2, 3]);
        const validationTrigger = new CollectionReorderedValidationTrigger({
            collection
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        collection.reverse();

        expect(invocationCount).toBe(1);
    });

    it('validation is not triggered when collection changes but check returns false', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>([1, 2, 3]);
        const validationTrigger = new CollectionReorderedValidationTrigger({
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

        collection.reverse();

        expect(invocationCount).toBe(0);
    });

    it('validation is triggered when collection changes and check returns true', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<number>([1, 2, 3]);
        const validationTrigger = new CollectionReorderedValidationTrigger({
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

        collection.reverse();

        expect(invocationCount).toBe(1);
    });
});