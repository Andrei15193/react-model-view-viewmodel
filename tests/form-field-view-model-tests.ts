import { EventDispatcher } from '../src/events';
import { FormFieldViewModel } from '../src/form-field-view-model';

describe('form-field-view-model/FormFieldViewModel', (): void => {
    it('creating form field with name and initial value initializes value with initial value and other fields with default values', (): void => {
        const initialValue = {};
        const formField = new FormFieldViewModel('name', initialValue);

        expect(formField.name).toBe('name');
        expect(formField.initialValue).toBe(initialValue);
        expect(formField.value).toBe(initialValue);
        expect(formField.isTouched).toBe(false);
        expect(formField.isFocused).toBe(false);
        expect(formField.isValid).toBe(true);
        expect(formField.isInvalid).toBe(false);
        expect(formField.error).toBe(undefined);
    });

    it('creating form field from config initializes value with initial value and other fields with default values', (): void => {
        const initialValue = {};
        const formField = new FormFieldViewModel({
            name: 'name',
            initialValue
        });

        expect(formField.name).toBe('name');
        expect(formField.initialValue).toBe(initialValue);
        expect(formField.value).toBe(initialValue);
        expect(formField.isTouched).toBe(false);
        expect(formField.isFocused).toBe(false);
        expect(formField.isValid).toBe(true);
        expect(formField.isInvalid).toBe(false);
        expect(formField.error).toBe(undefined);
    });

    it('creating form field from config with validators registers and applies them', (): void => {
        const initialValue = {};
        const formField = new FormFieldViewModel({
            name: 'name',
            initialValue,
            validators: [() => 'test-error']
        });

        expect(formField.name).toBe('name');
        expect(formField.initialValue).toBe(initialValue);
        expect(formField.value).toBe(initialValue);
        expect(formField.isTouched).toBe(false);
        expect(formField.isFocused).toBe(false);
        expect(formField.isValid).toBe(false);
        expect(formField.isInvalid).toBe(true);
        expect(formField.error).toBe('test-error');
    });

    it('creating form field from config with validators and validation config registers and applies them', (): void => {
        let error: string | undefined = undefined;
        const validationTrigger = new EventDispatcher<unknown, readonly PropertyKey[]>();

        const initialValue = {};
        const formField = new FormFieldViewModel({
            name: 'name',
            initialValue,
            validationConfig: {
                triggers: [{ propertiesChanged: validationTrigger }]
            },
            validators: [() => error]
        });
        expect(formField.error).toBe(undefined);

        error = 'test-error';
        validationTrigger.dispatch({}, []);

        expect(formField.error).toBe('test-error');
    });

    it('setting name notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['name']);
            }
        });

        formField.name = 'new-name';

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting initial value notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['initialValue']);
            }
        });

        formField.initialValue = 'new-value';

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting value notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'initial-value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['value']);
            }
        });

        formField.value = 'new-value';

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting isTouched notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['isTouched']);
            }
        });

        formField.isTouched = true;

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting isFocused notifies subscribers', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['isFocused']);
            }
        });

        formField.isFocused = true;

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting error notifies subscribers and updates related flags', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['error', 'isValid', 'isInvalid']);
                expect(formField.error).toBe('');
                expect(formField.isValid).toBe(false);
                expect(formField.isInvalid).toBe(true);
            }
        });

        formField.error = '';

        expect(invocationCount).toBe(1);
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

        expect(invocationCount).toBe(0);
    });

    it('setting error back to undefined notifies subscribers and updates related flags', (): void => {
        const formField = new FormFieldViewModel('name', 'value');
        formField.error = '';
        let invocationCount = 0;
        formField.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(formField);
                expect(changedProperties).toEqual(['error', 'isValid', 'isInvalid']);
                expect(formField.error).toBe(undefined);
                expect(formField.isValid).toBe(true);
                expect(formField.isInvalid).toBe(false);
            }
        });

        formField.error = undefined;

        expect(invocationCount).toBe(1);
    });
});