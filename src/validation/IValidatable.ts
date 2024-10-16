import type { IReadOnlyValidatable } from './IReadOnlyValidatable';

/**
 * Represents a validatable object.
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IValidatable<TValidationError = string> extends IReadOnlyValidatable<TValidationError> {
    /**
     * Gets or sets the error message when the object is invalid.
     */
    error: TValidationError | null;
}