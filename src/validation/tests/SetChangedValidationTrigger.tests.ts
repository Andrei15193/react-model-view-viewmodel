import { ObservableSet } from '../../collections';
import { SetChangedValidationTrigger } from '../triggers';

describe('SetChangedValidationTrigger', (): void => {
    it('validation is triggered when set changes', (): void => {
        let invocationCount = 0;
        const set = new ObservableSet<number>();
        const validationTrigger = new SetChangedValidationTrigger({
            set
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        set.add(1);

        expect(invocationCount).toBe(1);
    });

    it('validation is not triggered when set changes but check returns false', (): void => {
        let invocationCount = 0;
        const set = new ObservableSet<number>();
        const validationTrigger = new SetChangedValidationTrigger({
            set,
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

        set.add(1);

        expect(invocationCount).toBe(0);
    });

    it('validation is triggered when set changes and check returns true', (): void => {
        let invocationCount = 0;
        const set = new ObservableSet<number>();
        const validationTrigger = new SetChangedValidationTrigger({
            set,
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

        set.add(1);

        expect(invocationCount).toBe(1);
    });
});