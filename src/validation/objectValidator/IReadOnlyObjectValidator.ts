import type { IReadOnlyValidatable } from '../IReadOnlyValidatable';
import type { IReadOnlyObservableCollection, IReadOnlyObservableSet } from '../../collections';
import type { IValidator } from '../IValidator';
import type { IValidationTrigger } from '../IValidationTrigger';

export interface IReadOnlyObjectValidator<TValidatable extends IReadOnlyValidatable<TValidationError> & IValidationTrigger, TValidationError = string> {
    readonly target: TValidatable;

    readonly validators: IReadOnlyObservableCollection<IValidator<TValidatable, TValidationError>>;

    readonly triggers: IReadOnlyObservableSet<IValidationTrigger>;

    validate(): TValidationError | null;
}
