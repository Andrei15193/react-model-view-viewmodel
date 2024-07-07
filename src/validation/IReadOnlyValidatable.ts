export interface IReadOnlyValidatable<TValidationError = string> {
    readonly isValid: boolean;

    readonly isInvalid: boolean;

    readonly error: TValidationError | null;
}