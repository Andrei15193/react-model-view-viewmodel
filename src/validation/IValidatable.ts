import type { IReadOnlyValidatable } from './IReadOnlyValidatable';

export interface IValidatable<TValidationError = string> extends IReadOnlyValidatable<TValidationError> {
    error: TValidationError | null;
}