import type { IReadOnlyObservableCollection, IReadOnlyObservableSet } from '../../collections';
import type { INotifyPropertiesChanged } from '../../viewModels';
import type { IReadOnlyValidatable } from '../IReadOnlyValidatable';
import type { IValidator } from '../IValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';

/**
 * Represents a read-only object validator.
 */
export interface IReadOnlyObjectValidator<TValidatable extends IReadOnlyValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> {
    /**
     * Gets the object that is being validated.
     */
    readonly target: TValidatable;

    /**
     * Gets the validators that have been configured.
     */
    readonly validators: IReadOnlyObservableCollection<IValidator<TValidatable, TValidationError>>;
    /**
     * Gets the validation triggers that have been configured.
     */
    readonly triggers: IReadOnlyObservableSet<WellKnownValidationTrigger | ValidationTrigger>;

    /**
     * Validates the target using the currently configured validators. Validation does get triggered when the
     * target changes or when a trigger notifies that a validation should occur.
     * 
     * Only use this method for specific cases where a validation need to be manually triggered, usually this
     * should not be the case.
     */
    validate(): TValidationError | null;
}
