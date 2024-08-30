import type { IEventHandler } from '../../events';
import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IObjectValidator } from './IObjectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';
import type { INotifyPropertiesChanged } from '../../viewModels';
import { type IObservableCollection, type IObservableSet, ObservableCollection, ObservableSet } from '../../collections';
import { ViewModelChangedValidationTrigger, resolveValidationTriggers } from '../triggers';

export interface IObjectValidatorConfig<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> {
    readonly target: TValidatable;

    shouldTargetTriggerValidation?(target: TValidatable, changedProperties: readonly (keyof TValidatable)[]): boolean;
}

export class ObjectValidator<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> implements IObjectValidator<TValidatable, TValidationError> {
    private static defaultShouldTargetTriggerValidation<TValidationError = string>(target: IValidatable<TValidationError>, changedProperties: readonly (keyof IValidatable<TValidationError>)[]): boolean {
        return changedProperties.some(changedProperty => {
            return changedProperty !== 'error'
                && changedProperty !== 'isValid'
                && changedProperty !== 'isInvalid'
        });
    }

    public constructor({ target, shouldTargetTriggerValidation = ObjectValidator.defaultShouldTargetTriggerValidation<TValidationError> }: IObjectValidatorConfig<TValidatable, TValidationError>) {
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

    public readonly target: TValidatable;

    public readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;
    public readonly triggers: IObservableSet<WellKnownValidationTrigger | ValidationTrigger>;

    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>): this;
    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers: readonly (WellKnownValidationTrigger | ValidationTrigger)[]): this;

    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers?: readonly (WellKnownValidationTrigger | ValidationTrigger)[]): this {
        if (triggers !== null && triggers !== undefined)
            triggers.forEach(this.triggers.add, this.triggers);

        if (validator !== null && validator !== undefined)
            switch (typeof validator) {
                case 'function':
                    this.validators.push({ validate: validator });
                    break;

                case 'object':
                    this.validators.push(validator);
                    break;
            }

        return this;
    }

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

    public reset(): this {
        this.triggers.clear();
        this.validators.splice(0);

        return this;
    }
}