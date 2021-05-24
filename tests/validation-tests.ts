import type { IValidatable } from '../src/validation';
import { expect } from 'chai';
import { ViewModel } from '../src/view-model';
import { registerValidators, registerCollectionValidators } from '../src/validation';
import { observableCollection } from '../src/observable-collection';

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

        const unsubscribeCallback = registerValidators(validatable, [() => 'error']);

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies only functions', (): void => {
        const validatable = new MockValidatableViewModel();

        const unsubscribeCallback = registerValidators(validatable, [false, undefined, () => 'error']);

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies them when validatable changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators(validatable, [() => isValid ? undefined : 'error']);
        expect(validatable.error).is.undefined;

        isValid = false;
        validatable.notifyPropertiesChanged('value');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering validators no longer applies them when validatable changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators(validatable, [() => isValid ? undefined : 'error']);
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
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger] }, [() => isValid ? undefined : 'error']);

        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering triggers no longer validate when property changes', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger] }, [() => isValid ? undefined : 'error']);

        unsubscribeCallback();
        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable.error).is.undefined;
    });

    it('registered validators are not triggered when watched property does not change', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, watchedProperties: ['watched-property'] }, [() => isValid ? undefined : 'error']);

        isValid = false;
        validatable.notifyPropertiesChanged('not-watched-property');

        expect(validatable.error).is.undefined;
        unsubscribeCallback();
    });

    it('registered validators are not triggered when watched property does not change on trigger', (): void => {
        let isValid = true;
        const validatable = new MockValidatableViewModel();
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerValidators({ target: validatable, triggers: [trigger], watchedProperties: ['watched-property'] }, [() => isValid ? undefined : 'error']);

        isValid = false;
        trigger.notifyPropertiesChanged('not-watched-property');

        expect(validatable.error).is.undefined;
        unsubscribeCallback();
    });

    it('registered validator gets called with validatable argument', (): void => {
        const validatable = new MockValidatableViewModel();

        const unsubscribeCallback = registerValidators(validatable, [(actualValidatable) => expect(actualValidatable).is.equal(actualValidatable)]);
        validatable.notifyPropertiesChanged('value');
        unsubscribeCallback();
    });
});

describe('validation/registerCollectionValidators', (): void => {
    class MockValidatableViewModel extends ViewModel implements IValidatable {
        readonly isValid: boolean = true;
        readonly isInvalid: boolean = false;
        error: string | undefined = undefined;

        public notifyPropertiesChanged(changedProperty: string, ...otherChangedProperties: readonly string[]): void {
            super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
        }
    }

    it('registering validators applies them initially', (): void => {
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });

        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => 'error']);

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies only functions', (): void => {
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });

        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [false, undefined, () => 'error']);

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('registering validators applies them to each item when one validatable changes', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);
        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;

        isValid = false;
        validatable1.notifyPropertiesChanged('value');

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering validators no longer applies them when a validatable changes', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);
        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;

        isValid = false;
        unsubscribeCallback();
        validatable2.notifyPropertiesChanged('value');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
    });

    it('registered validators are triggered when trigger property has changed', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerCollectionValidators(collection, item => ({ target: item.validatable, triggers: [trigger] }), [() => isValid ? undefined : 'error']);

        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('unregistering triggers no longer validate when property changes', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerCollectionValidators(collection, item => ({ target: item.validatable, triggers: [trigger] }), [() => isValid ? undefined : 'error']);

        unsubscribeCallback();
        isValid = false;
        trigger.notifyPropertiesChanged('property');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
    });

    it('registered validators are not triggered when watched property does not change', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => ({ target: item.validatable, watchedProperties: ['watched-property'] }), [() => isValid ? undefined : 'error']);

        isValid = false;
        validatable1.notifyPropertiesChanged('not-watched-property');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
        unsubscribeCallback();
    });

    it('registered validators are not triggered when watched property does not change on trigger', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const trigger = new MockValidatableViewModel();
        const unsubscribeCallback = registerCollectionValidators(collection, item => ({ target: item.validatable, triggers: [trigger], watchedProperties: ['watched-property'] }), [() => isValid ? undefined : 'error']);

        isValid = false;
        trigger.notifyPropertiesChanged('not-watched-property');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
        unsubscribeCallback();
    });

    it('registered validator gets called with validatable, item and collection argument', (): void => {
        const validatable1 = new MockValidatableViewModel();
        const item1 = { validatable: validatable1 };
        const validatable2 = new MockValidatableViewModel();
        const item2 = { validatable: validatable2 };
        const validatables = [validatable1, validatable2];
        const items = [item1, item2];
        const collection = observableCollection(item1, item2);

        let index = 0;
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [validate]);
        expect(index).is.equal(2);
        index = 0;
        validatable1.notifyPropertiesChanged('value');
        expect(index).is.equal(2);
        unsubscribeCallback();

        function validate(actualValidatable, actualItem, actualCollection): string | undefined {
            expect(actualValidatable).is.equal(validatables[index]);
            expect(actualItem).is.equal(items[index]);
            expect(actualCollection).is.equal(collection);
            index++;
            return undefined;
        }
    });

    it('adding an item triggers validation', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);

        isValid = false;
        collection.push({ validatable: validatable2 });

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('changing an added item triggers validation', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);
        collection.push({ validatable: validatable2 });

        isValid = false;
        validatable2.notifyPropertiesChanged('value');

        expect(validatable1.error).is.equal('error');
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('removing an item does triggers validation', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);

        isValid = false;
        collection.splice(0, 1);

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.equal('error');
        unsubscribeCallback();
    });

    it('changing a removed item does not trigger validation', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 }, { validatable: validatable2 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);
        collection.splice(1, 1);

        isValid = false;
        validatable2.notifyPropertiesChanged('value');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
        unsubscribeCallback();
    });

    it('changing an added item after unsubscribing validators does not trigger validation', (): void => {
        let isValid = true;
        const validatable1 = new MockValidatableViewModel();
        const validatable2 = new MockValidatableViewModel();
        const collection = observableCollection({ validatable: validatable1 });
        const unsubscribeCallback = registerCollectionValidators(collection, item => item.validatable, [() => isValid ? undefined : 'error']);
        collection.push({ validatable: validatable2 });

        isValid = false;
        unsubscribeCallback();
        validatable2.notifyPropertiesChanged('value');

        expect(validatable1.error).is.undefined;
        expect(validatable2.error).is.undefined;
    });
});