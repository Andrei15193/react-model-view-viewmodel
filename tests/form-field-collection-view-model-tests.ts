import type { FormFieldViewModel } from '../src/form-field-view-model';
import { expect } from 'chai';
import { FormFieldCollectionViewModel } from '../src/form-field-collection-view-model';

describe('form-field-collection-view-model/FormFieldCollectionViewModel', (): void => {
    class MockFormFieldCollectionViewModel extends FormFieldCollectionViewModel {
        public addField<TValue>(name: string, initialValue: TValue): FormFieldViewModel<TValue> {
            return super.addField(name, initialValue);
        }

        public registerField<TValue>(field: FormFieldViewModel<TValue>): FormFieldViewModel<TValue> {
            return super.registerField(field);
        }

        public unregisterField<TValue>(field: FormFieldViewModel<TValue>): void {
            super.unregisterField(field);
        }
    }

    it('setting error notifies subscribers and updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['error', 'isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal('');
                expect(formFieldCollection.isValid).is.equal(false);
                expect(formFieldCollection.isInvalid).is.equal(true);
            }
        });

        formFieldCollection.error = '';

        expect(invocationCount).is.equal(1);
    });

    it('setting same error does not notify subscribers', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        formFieldCollection.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formFieldCollection.error = '';

        expect(invocationCount).is.equal(0);
    });

    it('setting error back to undefined notifies subscribers and updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        formFieldCollection.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['error', 'isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(true);
                expect(formFieldCollection.isInvalid).is.equal(false);
            }
        });

        formFieldCollection.error = undefined;

        expect(invocationCount).is.equal(1);
    });

    it('registering a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(true);
                expect(formFieldCollection.isInvalid).is.equal(false);
            }
        });

        formFieldCollection.addField('', '');

        expect(invocationCount).is.equal(1);
    });

    it('registering and invalidating a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(false);
                expect(formFieldCollection.isInvalid).is.equal(true);
            }
        });

        field.error = '';

        expect(invocationCount).is.equal(1);
    });

    it('registering and validating a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        field.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(true);
                expect(formFieldCollection.isInvalid).is.equal(false);
            }
        });

        field.error = undefined;

        expect(invocationCount).is.equal(1);
    });

    it('unregistering a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(true);
                expect(formFieldCollection.isInvalid).is.equal(false);
            }
        });

        formFieldCollection.unregisterField(field);

        expect(invocationCount).is.equal(1);
    });

    it('unregistering an invalid field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        field.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formFieldCollection);
                expect(changedProperties).is.deep.equal(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).is.equal(undefined);
                expect(formFieldCollection.isValid).is.equal(true);
                expect(formFieldCollection.isInvalid).is.equal(false);
            }
        });

        formFieldCollection.unregisterField(field);

        expect(invocationCount).is.equal(1);
    });

    it('registering a field makes it available through the fields property', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();

        const field1 = formFieldCollection.addField('', '');
        const field2 = formFieldCollection.addField('', '');
        const field3 = formFieldCollection.addField('', '');

        expect(formFieldCollection.fields.toArray()).is.deep.equal([field1, field2, field3]);
    });

    it('unregistering a field no longer makes it available through the fields property', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field1 = formFieldCollection.addField('', '');
        const field2 = formFieldCollection.addField('', '');
        const field3 = formFieldCollection.addField('', '');

        formFieldCollection.unregisterField(field2);

        expect(formFieldCollection.fields.toArray()).is.deep.equal([field1, field3]);
    });

    it('registering a field twice and unregistering it once makes it available through the fields property once', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        formFieldCollection.registerField(field);

        formFieldCollection.unregisterField(field);

        expect(formFieldCollection.fields.toArray()).is.deep.equal([field]);
    });
});