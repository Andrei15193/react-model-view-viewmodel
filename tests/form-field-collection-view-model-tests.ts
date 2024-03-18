import { FormFieldViewModel } from '../src/form-field-view-model';
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
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['error', 'isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe('');
                expect(formFieldCollection.isValid).toBe(false);
                expect(formFieldCollection.isInvalid).toBe(true);
            }
        });

        formFieldCollection.error = '';

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting error back to undefined notifies subscribers and updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        formFieldCollection.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['error', 'isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(true);
                expect(formFieldCollection.isInvalid).toBe(false);
            }
        });

        formFieldCollection.error = undefined;

        expect(invocationCount).toBe(1);
    });

    it('registering a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(true);
                expect(formFieldCollection.isInvalid).toBe(false);
            }
        });

        formFieldCollection.addField('', '');

        expect(invocationCount).toBe(1);
    });

    it('registering and invalidating a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(false);
                expect(formFieldCollection.isInvalid).toBe(true);
            }
        });

        field.error = '';

        expect(invocationCount).toBe(1);
    });

    it('registering and validating a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        field.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(true);
                expect(formFieldCollection.isInvalid).toBe(false);
            }
        });

        field.error = undefined;

        expect(invocationCount).toBe(1);
    });

    it('unregistering a field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(true);
                expect(formFieldCollection.isInvalid).toBe(false);
            }
        });

        formFieldCollection.unregisterField(field);

        expect(invocationCount).toBe(1);
    });

    it('unregistering an invalid field updates related flags', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        field.error = '';
        let invocationCount = 0;
        formFieldCollection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toStrictEqual(formFieldCollection);
                expect(changedProperties).toEqual(['isValid', 'isInvalid']);
                expect(formFieldCollection.error).toBe(undefined);
                expect(formFieldCollection.isValid).toBe(true);
                expect(formFieldCollection.isInvalid).toBe(false);
            }
        });

        formFieldCollection.unregisterField(field);

        expect(invocationCount).toBe(1);
    });

    it('registering a field makes it available through the fields property', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();

        const field1 = formFieldCollection.addField('', '');
        const field2 = formFieldCollection.addField('', '');
        const field3 = formFieldCollection.addField('', '');

        expect(formFieldCollection.fields.toArray()).toEqual([field1, field2, field3]);
    });

    it('unregistering a field no longer makes it available through the fields property', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field1 = formFieldCollection.addField('', '');
        const field2 = formFieldCollection.addField('', '');
        const field3 = formFieldCollection.addField('', '');

        formFieldCollection.unregisterField(field2);

        expect(formFieldCollection.fields.toArray()).toEqual([field1, field3]);
    });

    it('registering a field twice and unregistering it once makes it available through the fields property once', (): void => {
        const formFieldCollection = new MockFormFieldCollectionViewModel();
        const field = formFieldCollection.addField('', '');
        formFieldCollection.registerField(field);

        formFieldCollection.unregisterField(field);

        expect(formFieldCollection.fields.toArray()).toEqual([field]);
    });

    it('creating a dynamic form registers all fields', (): void => {
        const formFieldCollection = FormFieldCollectionViewModel.create({
            field1: new FormFieldViewModel('field1', null),
            field2: new FormFieldViewModel('field2', null)
        });

        expect(formFieldCollection.fields.toArray()).toContain(formFieldCollection.field1);
        expect(formFieldCollection.fields.toArray()).toContain(formFieldCollection.field2);
        expect(formFieldCollection.fields.toArray().length).toBe(2);
    });
});