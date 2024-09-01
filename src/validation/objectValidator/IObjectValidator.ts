import type { IObservableCollection, IObservableSet } from '../../collections';
import type { INotifyPropertiesChanged } from '../../viewModels';
import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IReadOnlyObjectValidator } from './IReadOnlyObjectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';


export interface IObjectValidator<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> extends IReadOnlyObjectValidator<TValidatable, TValidationError> {
    readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;
    readonly triggers: IObservableSet<WellKnownValidationTrigger | ValidationTrigger>;

    add<TItem = unknown>(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers?: readonly (WellKnownValidationTrigger<TItem> | ValidationTrigger)[]): this;

    validate(): TValidationError | null;

    reset(): this;
}
