import { ObservableCollection } from '../../collections';
import { CollectionChangedValidationTrigger, CollectionReorderedValidationTrigger } from '../../validation/triggers';
import { FormField } from '../FormField';

describe('FormField', (): void => {
    it('creating a field initializes it with provided values and fallbacks', (): void => {
        const initialValue = {};
        const field = new FormField<unknown>({
            name: 'name',
            initialValue
        });

        expect(field.name).toBe('name');
        expect(field.error).toBeNull();
        expect(field.isValid).toBe(true);
        expect(field.isInvalid).toBe(false);
        expect(field.value).toStrictEqual(initialValue);
        expect(field.initialValue).toStrictEqual(initialValue);
    });

    it('creating a field with value initializes it', (): void => {
        const value = {};
        const initialValue = {};
        const field = new FormField<unknown>({
            name: 'name',
            value,
            initialValue
        });

        expect(field.name).toBe('name');
        expect(field.error).toBeNull();
        expect(field.isValid).toBe(true);
        expect(field.isInvalid).toBe(false);
        expect(field.value).toStrictEqual(value);
        expect(field.initialValue).toStrictEqual(initialValue);
    });

    it('creating a field with validators initializes it', (): void => {
        const field = new FormField<unknown>({
            name: 'name',
            initialValue: null,
            validators: [() => 'error']
        });

        expect(field.name).toBe('name');
        expect(field.error).toBe('error');
        expect(field.isValid).toBe(false);
        expect(field.isInvalid).toBe(true);
        expect(field.value).toBeNull();
        expect(field.initialValue).toBeNull();
        expect(field.validation.validators.length).toBe(1);
        expect(field.validation.triggers.size).toBe(0);
    });

    it('creating a field with validation triggers initializes it', (): void => {
        const validationTrigger = new ObservableCollection<unknown>();
        const field = new FormField<unknown>({
            name: 'name',
            initialValue: null,
            validators: [() => 'error'],
            validationTriggers: [validationTrigger]
        });

        expect(field.name).toBe('name');
        expect(field.error).toBe('error');
        expect(field.isValid).toBe(false);
        expect(field.isInvalid).toBe(true);
        expect(field.value).toBeNull();
        expect(field.initialValue).toBeNull();
        expect(field.validation.validators.length).toBe(1);
        expect(field.validation.triggers.size).toBe(2);
        expect(Array.from(field.validation.triggers).some(trigger => trigger instanceof CollectionChangedValidationTrigger)).toBeTruthy();
        expect(Array.from(field.validation.triggers).some(trigger => trigger instanceof CollectionReorderedValidationTrigger)).toBeTruthy();
    });

    it('changing a trigger revalidates the field', (): void => {
        let error = 'error 1';
        const validationTrigger = new ObservableCollection<unknown>();
        const field = new FormField<unknown>({
            name: 'name',
            initialValue: null,
            validators: [() => error],
            validationTriggers: [validationTrigger]
        });

        error = 'error 2';
        validationTrigger.push({});

        expect(field.error).toBe('error 2');
        expect(field.isValid).toBe(false);
        expect(field.isInvalid).toBe(true);
    });

    it('resetting validation on a field resets the error message', (): void => {
        const field = new FormField<unknown>({
            name: 'name',
            initialValue: null,
            validators: [() => 'error'],
            validationTriggers: [new ObservableCollection<unknown>()]
        });

        field.validation.reset();

        expect(field.error).toBeNull();
        expect(field.isValid).toBe(true);
        expect(field.isInvalid).toBe(false);
        expect(field.validation.validators.length).toBe(0);
        expect(field.validation.triggers.size).toBe(0);
    });

    it('resetting a field resets validation', (): void => {
        const field = new FormField<unknown>({
            name: 'name',
            initialValue: null,
            validators: [() => 'error'],
            validationTriggers: [new ObservableCollection<unknown>()]
        });

        field.reset();

        expect(field.error).toBeNull();
        expect(field.isValid).toBe(true);
        expect(field.isInvalid).toBe(false);
        expect(field.validation.validators.length).toBe(0);
        expect(field.validation.triggers.size).toBe(0);
    });
});