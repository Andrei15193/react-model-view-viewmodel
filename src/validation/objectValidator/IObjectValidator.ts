import type { IObservableCollection, IObservableSet } from '../../collections';
import type { INotifyPropertiesChanged } from '../../viewModels';
import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IReadOnlyObjectValidator } from './IReadOnlyObjectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';

/**
 * Represents an object validator.
 */
export interface IObjectValidator<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> extends IReadOnlyObjectValidator<TValidatable, TValidationError> {
    /**
     * Gets the validators that have been configured.
     */
    readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;
    /**
     * Gets the validation triggers that have been configured.
     */
    readonly triggers: IValidationTriggersSet;

    /**
     * Configures the given validator and configures the provided triggers.
     * @param validator The validators to add.
     * @param triggers The triggers for which a validation should occur.
     * @returns Returns the current object validator.
     */
    add<TKey = unknown, TItem = unknown>(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers?: readonly (WellKnownValidationTrigger<TKey, TItem> | ValidationTrigger)[]): this;

    /**
     * Resets the validator configuraiton, removes all triggers and validators and sets the error on the target to `null`.
     */
    reset(): this;
}

/**
 * Represents a validation trigger set. Triggers are only added once to avoid double validation.
 */
export interface IValidationTriggersSet extends IObservableSet<WellKnownValidationTrigger | ValidationTrigger> {
    /**
     * Ensures the given trigger is in the set.
     * @param trigger The validation trigger to add.
     * @returns Returns the current validation trigger set.
     */
    add<TKey = unknown, TItem = unknown>(trigger: WellKnownValidationTrigger<TKey, TItem> | ValidationTrigger): this;
}