import type { IObservableCollection, IObservableSet } from '../../collections';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IValidationTrigger } from '../IValidationTrigger';
import type { IReadOnlyObjectValidator } from './IReadOnlyObjectValidator';
import type { IValidatable } from '../IValidatable';

export interface IObjectValidator<TValidatable extends IValidatable<TValidationError> & IValidationTrigger, TValidationError = string> extends IReadOnlyObjectValidator<TValidatable, TValidationError> {
    readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;

    readonly triggers: IObservableSet<IValidationTrigger>;

    add(validator: IValidator<TValidatable, TValidationError>): this;
    add(validator: IValidator<TValidatable, TValidationError>, triggers: readonly IValidationTrigger[]): this;
    add(validator: ValidatorCallback<TValidatable, TValidationError>): this;
    add(validator: ValidatorCallback<TValidatable, TValidationError>, triggers: readonly IValidationTrigger[]): this;

    validate(): TValidationError | null;

    reset(): this;
}