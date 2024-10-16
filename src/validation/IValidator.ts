import type { IReadOnlyValidatable } from './IReadOnlyValidatable';

/**
 * Represents a validator, generally a callback performing the validation is enough, however there are cases when
 * additional actions need to be performed, such as flags, when a validator is added.
 *
 * @template TValidatable The instance type that is being validated.
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IValidator<TValidatable extends IReadOnlyValidatable<TValidationError>, TValidationError = string> {
    /**
     * Optional, a method that gets called when the validator is configured for an object.
     * @param validatable The object which will be validated.
     */
    onAdd?(validatable: TValidatable): void;
    /**
     * Optional, a method that gets called when the validator is removed for an object.
     * @param validatable The object which will no longer be validated.
     */
    onRemove?(validatable: TValidatable): void;

    /**
     * The method validating a given object.
     * @param object The object to validate.
     * @returns Returns a validation error if there are any issues; otherwise `null` or `undefined`.
     */
    validate(object : TValidatable): TValidationError | null | undefined;
}

/**
 * Represents a callback which validates a given object.
 * @param object The object to validate.
 * @returns Returns a validation error if there are any issues; otherwise `null` or `undefined`.
 */
export type ValidatorCallback<TValidatable extends IReadOnlyValidatable<TValidationError>, TValidationError = string>
    = IValidator<TValidatable, TValidationError>['validate'];