import type { IReadOnlyValidatable } from './IReadOnlyValidatable';

export interface IValidator<TValidatable extends IReadOnlyValidatable<TValidationError>, TValidationError = string> {
    onAdd?(validatable: TValidatable): void;
    onRemove?(validatable: TValidatable): void;

    readonly validate: ValidatorCallback<TValidatable, TValidationError>;
}

export type ValidatorCallback<TValidatable extends IReadOnlyValidatable<TValidationError>, TValidationError = string> = (object: TValidatable) => TValidationError | null | undefined;