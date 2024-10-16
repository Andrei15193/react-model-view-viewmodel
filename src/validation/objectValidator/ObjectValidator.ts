import type { IEventHandler } from '../../events';
import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IObjectValidator, IValidationTriggersSet } from './IObjectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';
import type { INotifyPropertiesChanged } from '../../viewModels';
import { type IObservableCollection, ObservableCollection, ObservableSet } from '../../collections';
import { ViewModelChangedValidationTrigger, resolveValidationTriggers } from '../triggers';

/**
 * Represents the object validator configuration.
 * @template TValidatable The instance type that is being validated.
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IObjectValidatorConfig<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> {
    readonly target: TValidatable;

    shouldTargetTriggerValidation?(target: TValidatable, changedProperties: readonly (keyof TValidatable)[]): boolean;
}

/**
 * Represents a base implementation for an object validator.
 * @template TValidatable The instance type that is being validated.
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export class ObjectValidator<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> implements IObjectValidator<TValidatable, TValidationError> {
    private static _defaultShouldTargetTriggerValidation<TValidationError = string>(target: IValidatable<TValidationError>, changedProperties: readonly (keyof IValidatable<TValidationError>)[]): boolean {
        return changedProperties.some(changedProperty => {
            return changedProperty !== 'error'
                && changedProperty !== 'isValid'
                && changedProperty !== 'isInvalid'
        });
    }

    /**
     * Initializes a new instance of the {@linkcode ObjectValidator} class.
     * @param config The configuration to initialize the object validator with.
     */
    public constructor(config: IObjectValidatorConfig<TValidatable, TValidationError>) {
        const { target, shouldTargetTriggerValidation = ObjectValidator._defaultShouldTargetTriggerValidation<TValidationError> } = config;
        this.target = target;

        this.validators = new ObservableCollection<IValidator<TValidatable, TValidationError>>();
        this.validators.collectionChanged.subscribe({
            _target: this.target,
            _validate: this.validate.bind(this),

            handle(_, { addedItems: addedValidators, removedItems: removedValidators }) {
                removedValidators.forEach(removedValidator => removedValidator.onRemove && removedValidator.onRemove(this._target));
                addedValidators.forEach(addedValidator => addedValidator.onAdd && addedValidator.onAdd(this._target));

                this._validate();
            }
        });

        const validationTriggeredEventHandler: IEventHandler<unknown, unknown> = {
            handle: () => {
                this.validate();
            }
        };

        const targetValidationTrigger = new ViewModelChangedValidationTrigger({
            viewModel: target,
            shouldTriggerValidation: shouldTargetTriggerValidation
        });
        targetValidationTrigger.validationTriggered.subscribe(validationTriggeredEventHandler);

        const resolvedValidationTriggersBySource = new Map<WellKnownValidationTrigger | ValidationTrigger, readonly ValidationTrigger[]>();
        this.triggers = new ObservableSet<ValidationTrigger>();
        this.triggers.setChanged.subscribe({
            handle(_, { addedItems: addedTriggers, removedItems: removedTriggers }) {
                removedTriggers.forEach(removedTrigger => {
                    resolvedValidationTriggersBySource
                        .get(removedTrigger)
                        ?.forEach(resolvedValidationTrigger => {
                            resolvedValidationTrigger.validationTriggered.unsubscribe(validationTriggeredEventHandler);
                        });
                    resolvedValidationTriggersBySource.delete(removedTrigger);
                });

                addedTriggers.forEach(addedTrigger => {
                    const resolvedValidationTriggers = resolveValidationTriggers(addedTrigger);
                    resolvedValidationTriggers.forEach(resolvedValidationTrigger => {
                        resolvedValidationTrigger.validationTriggered.subscribe(validationTriggeredEventHandler);
                    });
                    resolvedValidationTriggersBySource.set(addedTrigger, resolvedValidationTriggers);
                });
            }
        });

        this.target.error = null;
    }

    /**
     * Gets the object that is being validated.
     */
    public readonly target: TValidatable;

    /**
     * Gets the validators that have been configured.
     */
    public readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;
    /**
     * Gets the validation triggers that have been configured.
     */
    public readonly triggers: IValidationTriggersSet;

    /**
     * Configures the given validators and validates the target afterwards.
     * @param validators The validators to add.
     * @returns Returns the current object validator.
     */
    public add(...validators: readonly (IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>)[]): this {
        if (validators !== null && validators !== undefined && Array.isArray(validators))
            this.validators.push(...validators.map(validator => {
                if (typeof validator === 'function')
                    return {
                        validate: validator
                    };
                else
                    return validator;
            }));

        return this;
    }

    /**
     * Validates the target using the currently configured validators. Validation does get triggered when the
     * target changes or when a trigger notifies that a validation should occur.
     * 
     * Only use this method for specific cases where a validation need to be manually triggered, usually this
     * should not be the case.
     */
    public validate(): TValidationError | null {
        let error: TValidationError | null = null;
        let index: number = 0;

        while (index < this.validators.length && error === null) {
            const validationResult = this.validators[index].validate(this.target);
            if (validationResult !== null && validationResult !== undefined)
                error = validationResult;
            else
                index++;
        }

        this.target.error = error;
        return error;
    }

    /**
     * Resets the validator configuraiton, removes all triggers and validators and sets the error on the target to `null`.
     */
    public reset(): this {
        this.triggers.clear();
        this.validators.splice(0);

        return this;
    }
}