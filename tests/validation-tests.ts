import type { IValidatable } from '../src/validation';
import { expect } from 'chai';
import { ViewModel } from '../src/view-model';
import { registerValidators } from '../src/validation';

describe('validation/registerValidators', (): void => {
    class MockValidatableViewModel extends ViewModel implements IValidatable {
        readonly isValid: boolean = true;
        readonly isInvalid: boolean = false;
        error: string | undefined = undefined;

        public notifyPropertiesChanged(changedProperty: string, ...otherChangedProperties: readonly string[]): void {
            super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
        }
    }

    it('registering validators applies them initially', (): void => {
        const validatable = new MockValidatableViewModel();

        const unsubscribeCallback = registerValidators(validatable, () => 'error');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies only functions', (): void => {
        const validatable = new MockValidatableViewModel();

        const unsubscribeCallback = registerValidators(validatable, false, undefined, () => 'error');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies them when validatable changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators(validatable, () => isValid ? undefined : 'error');
        expect(validatable.error).is.undefined;

        isValid = false;
        validatable.notifyPropertiesChanged('value');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering validators no longer applies them when validatable changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators(validatable, () => isValid ? undefined : 'error');
        expect(validatable.error).is.undefined;

        isValid = false;
        unsubscribeCallback();
        validatable.notifyPropertiesChanged('value');

        expect(validatable.error).is.undefined;
    });

    it('registered validators are triggered when trigger property has changed', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger] }, () => isValid ? undefined : 'error');

        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering triggers no longer validate when property changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger] }, () => isValid ? undefined : 'error');

        unsubscribeCallback();
        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable.error).is.undefined;
    });

    it('registered validators are not triggered when watched property does not change', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, watchedProperties: ['watched-property'] }, () => isValid ? undefined : 'error');

        isValid = false;
        validatable.notifyPropertiesChanged('not-watched-property');

        expect(validatable.error).is.undefined;
        unsubscribeCallback();
    });

    it('registered validators are not triggered when watched property does not change on trigger', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger], watchedProperties: ['watched-property'] }, () => isValid ? undefined : 'error');

        isValid = false;
        trigger.notifyPropertiesChanged('not-watched-property');

        expect(validatable.error).is.undefined;
        unsubscribeCallback();
    });
});