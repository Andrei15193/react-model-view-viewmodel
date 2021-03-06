import { expect } from 'chai';
import { FormFieldViewModel } from '../src/form-field-view-model';

describe('form-field-view-model/FormFieldViewModel', (): void => {
    it('creating form field initializes value with initial value and other fields with default values', (): void => {
        const initilValue = {};
        const formField = new FormFieldViewModel('name', initilValue);

        expect(formField.name).is.equal('name');
        expect(formField.initialValue).is.equal(initilValue);
        expect(formField.value).is.equal(initilValue);
        expect(formField.isTouched).is.equal(false);
        expect(formField.isFocused).is.equal(false);
        expect(formField.isValid).is.equal(true);
        expect(formField.isInvalid).is.equal(false);
        expect(formField.error).is.equal(undefined);
    });

    it('setting name notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['name']);
            }
        });

        formField.name = 'new-name';

        expect(invocationCount).is.equal(1);
    });

    it('setting same name does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.name = 'name';

        expect(invocationCount).is.equal(0);
    });

    it('setting initial value notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['initialValue']);
            }
        });

        formField.initialValue = 'new-value';

        expect(invocationCount).is.equal(1);
    });

    it('setting same initial value does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.initialValue = 'value';

        expect(invocationCount).is.equal(0);
    });

    it('setting value notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['value']);
            }
        });

        formField.value = 'new-value';

        expect(invocationCount).is.equal(1);
    });

    it('setting same value does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.value = 'value';

        expect(invocationCount).is.equal(0);
    });

    it('setting isTouched notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['isTouched']);
            }
        });

        formField.isTouched = true;

        expect(invocationCount).is.equal(1);
    });

    it('setting same isTouched does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.isTouched = false;

        expect(invocationCount).is.equal(0);
    });

    it('setting isFocused notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['isFocused']);
            }
        });

        formField.isFocused = true;

        expect(invocationCount).is.equal(1);
    });

    it('setting same isFocused does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.isFocused = false;

        expect(invocationCount).is.equal(0);
    });

    it('setting error notifies subscribers and updates related flags', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['error', 'isValid', 'isInvalid']);
                expect(formField.error).is.equal('');
                expect(formField.isValid).is.equal(false);
                expect(formField.isInvalid).is.equal(true);
            }
        });

        formField.error = '';

        expect(invocationCount).is.equal(1);
    });

    it('setting same error does not notify subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        formField.error = '';
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle() {
                invocationCount++;
            }
        });

        formField.error = '';

        expect(invocationCount).is.equal(0);
    });

    it('setting error back to undefined notifies subscribers and updates related flags', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        formField.error = '';
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(formField);
                expect(changedProperties).is.deep.equal(['error', 'isValid', 'isInvalid']);
                expect(formField.error).is.equal(undefined);
                expect(formField.isValid).is.equal(true);
                expect(formField.isInvalid).is.equal(false);
            }
        });

        formField.error = undefined;

        expect(invocationCount).is.equal(1);
    });
});