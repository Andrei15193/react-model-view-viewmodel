/**
 * Represents a read-only validatable object.
 */
export interface IReadOnlyValidatable<TValidationError = string> {
    /**
     * A flag indicating whether the object is valid.
     */
    readonly isValid: boolean;

    /**
     * A flag indicating whether the object is invalid.
     */
    readonly isInvalid: boolean;

    /**
     * Gets the error message when the object is invalid.
     */
    readonly error: TValidationError | null;
}