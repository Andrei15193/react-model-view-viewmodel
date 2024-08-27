import type { IEventHandler } from '../../events';
import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IObjectValidator } from './IObjectValidator';
import type { WellKnownValidationTrigger, ValidationTrigger } from '../triggers';
import type { INotifyPropertiesChanged } from '../../viewModels';
import { type IObservableCollection, type IObservableSet, ObservableCollection, ObservableSet } from '../../collections';
import { resolveValidationTriggers } from '../triggers/resolveValidationTriggers';

export class ObjectValidator<TValidatable extends IValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> implements IObjectValidator<TValidatable, TValidationError> {
    private _isValidating: boolean;
    private readonly _validationTriggeredEventHandler: IEventHandler<unknown, unknown> & {
        _validate(): void;
    };

    public constructor(target: TValidatable) {
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

        this._validationTriggeredEventHandler = {
            _validate: this.validate.bind(this),

            handle() {
                this._validate();
            }
        };

        this.target.propertiesChanged.subscribe(this._validationTriggeredEventHandler);
        this.triggers = new ObservableSet<ValidationTrigger>();
        this.triggers.setChanged.subscribe({
            _validationTriggeredEventHandler: this._validationTriggeredEventHandler,

            handle(_, { addedItems: addedTriggers, removedItems: removedTriggers }) {
                removedTriggers.forEach(removedTrigger => {
                    removedTrigger.validationTriggered.unsubscribe(this._validationTriggeredEventHandler);
                });

                addedTriggers.forEach(addedTrigger => {
                    addedTrigger.validationTriggered.subscribe(this._validationTriggeredEventHandler);
                });
            }
        });

        try {
            this._isValidating = true;

            this.target.error = null;
        }
        finally {
            this._isValidating = false;
        }
    }

    public readonly target: TValidatable;

    public readonly validators: IObservableCollection<IValidator<TValidatable, TValidationError>>;
    public readonly triggers: IObservableSet<ValidationTrigger>;

    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>): this;
    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers: readonly (WellKnownValidationTrigger | ValidationTrigger)[]): this;

    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers?: readonly (WellKnownValidationTrigger | ValidationTrigger)[]): this {
        if (triggers !== null && triggers !== undefined)
            triggers.forEach(trigger => {
                const resolvedValidationTriggers = resolveValidationTriggers(trigger);
                resolvedValidationTriggers.forEach(this.triggers.add, this.triggers);
            });

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
        if (this._isValidating)
            return this.target.error;
        else try {
            this._isValidating = true;

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
        finally {
            this._isValidating = false;
        }
    }

    public reset(): this {
        this.triggers.clear();
        this.validators.splice(0);

        return this;
    }
}