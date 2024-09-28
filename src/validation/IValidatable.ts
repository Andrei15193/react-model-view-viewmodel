import type { IReadOnlyValidatable } from './IReadOnlyValidatable';

/**
 * Represents a validatable object.
 */
export interface IValidatable<TValidationError = string> extends IReadOnlyValidatable<TValidationError> {
    /**
     * Gets or sets the error message when the object is invalid.
     */
    error: TValidationError | null;
}