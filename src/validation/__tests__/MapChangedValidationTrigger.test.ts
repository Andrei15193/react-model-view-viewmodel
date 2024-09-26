import { ObservableMap } from '../../collections';
import { MapChangedValidationTrigger } from '../triggers';

describe('MapChangedValidationTrigger', (): void => {
    it('validation is triggered when map changes', (): void => {
        let invocationCount = 0;
        const map = new ObservableMap<number, string>();
        const validationTrigger = new MapChangedValidationTrigger({
            map
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        map.set(1, 'A');

        expect(invocationCount).toBe(1);
    });

    it('validation is not triggered when map changes but check returns false', (): void => {
        let invocationCount = 0;
        const map = new ObservableMap<number, string>();
        const validationTrigger = new MapChangedValidationTrigger({
            map,
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

        map.set(1, 'A');

        expect(invocationCount).toBe(0);
    });

    it('validation is triggered when map changes and check returns true', (): void => {
        let invocationCount = 0;
        const map = new ObservableMap<number, string>();
        const validationTrigger = new MapChangedValidationTrigger({
            map,
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

        map.set(1, 'A');

        expect(invocationCount).toBe(1);
    });
});