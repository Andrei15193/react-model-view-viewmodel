import type { IValidatable } from '../IValidatable';
import type { IValidator, ValidatorCallback } from '../IValidator';
import type { IObjectValidator } from './IObjectValidator';
import { type INotifyPropertiesChanged } from '../../viewModels';
import { type IObservableCollection, type INotifyCollectionChanged, type ICollectionChange, type INotifyCollectionReordered, type ICollectionReorder, type INotifySetChanged, type IObservableSet, type ISetChange, type INotifyMapChanged, type IMapChange, ObservableCollection, ObservableSet } from '../../collections';
import { type IValidationTrigger, type IValidationTriggerEventHandlers, subscribeToValidationTrigger, unsubscribeFromValidationTrigger } from '../IValidationTrigger';

export class ObjectValidator<TValidatable extends IValidatable<TValidationError> & IValidationTrigger, TValidationError = string> implements IObjectValidator<TValidatable, TValidationError> {
    private _isValidating: boolean;
    private readonly _triggerChangedEventHandlers: IValidationTriggerEventHandlers;

    public constructor(target: TValidatable) {
        this.target = target;
        this._triggerChangedEventHandlers = {
            propertiesChanged: {
                handle: (validationTrigger, changedProperties) => {
                    if (this.shouldValidateViewModelTrigger(validationTrigger, changedProperties))
                        this.validate();
                }
            },

            collectionChanged: {
                handle: (validationTrigger, collectionChange) => {
                    if (this.shouldValidateCollectionChangedTrigger(validationTrigger, collectionChange))
                        this.validate();
                }
            },

            collectionReordered: {
                handle: (validationTrigger, collectionReorder) => {
                    if (this.shouldValidateCollectionReorderedTrigger(validationTrigger, collectionReorder))
                        this.validate();
                }
            },

            setChanged: {
                handle: (validationTrigger, setChanged) => {
                    if (this.shouldValidateSetChangedTrigger(validationTrigger, setChanged))
                        this.validate();
                }
            },

            mapChanged: {
                handle: (validationTrigger, mapChanged) => {
                    if (this.shouldValidateMapChangedTrigger(validationTrigger, mapChanged))
                        this.validate();
                }
            }
        };

        subscribeToValidationTrigger(this.target, this._triggerChangedEventHandlers);

        this.validators = new ObservableCollection<IValidator<TValidatable, TValidationError>>();
        this.validators.collectionChanged.subscribe({
            handle: (_, { addedItems: addedValidators, removedItems: removedValidators }) => {
                removedValidators.forEach(removedValidator => removedValidator.onRemove && removedValidator.onRemove(this.target));
                addedValidators.forEach(addedValidator => addedValidator.onAdd && addedValidator.onAdd(this.target));

                this.validate();
            }
        });

        this.triggers = new ObservableSet<INotifyPropertiesChanged>();
        this.triggers.setChanged.subscribe({
            handle: (_, { addedItems: addedTriggers, removedItems: removedTriggers }) => {
                removedTriggers.forEach(removedTrigger => {
                    unsubscribeFromValidationTrigger(removedTrigger, this._triggerChangedEventHandlers);
                });

                addedTriggers.forEach(addedTrigger => {
                    subscribeToValidationTrigger(addedTrigger, this._triggerChangedEventHandlers);
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

    public readonly triggers: IObservableSet<IValidationTrigger>;

    public add(validator: IValidator<TValidatable, TValidationError>): this;
    public add(validator: IValidator<TValidatable, TValidationError>, triggers: readonly IValidationTrigger[]): this;
    public add(validator: ValidatorCallback<TValidatable, TValidationError>): this;
    public add(validator: ValidatorCallback<TValidatable, TValidationError>, triggers: readonly IValidationTrigger[]): this;

    public add(validator: IValidator<TValidatable, TValidationError> | ValidatorCallback<TValidatable, TValidationError>, triggers?: readonly IValidationTrigger[]): this {
        if (triggers !== null && triggers !== undefined)
            triggers.forEach(trigger => this.triggers.add(trigger));

        if (typeof validator === 'function')
            this.validators.push({ validate: validator });
        else
            this.validators.push(validator);

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

        try {
            this._isValidating = true;

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

    protected shouldValidateViewModelTrigger(changedViewModel: INotifyPropertiesChanged, changedProperties: readonly PropertyKey[]): boolean {
        return (!this._isValidating || this.target !== changedViewModel);
    }

    protected shouldValidateCollectionChangedTrigger(changedCollection: INotifyCollectionChanged<unknown>, collectionChange: ICollectionChange<unknown>): boolean {
        return true;
    }

    protected shouldValidateCollectionReorderedTrigger(changedCollection: INotifyCollectionReordered<unknown>, collectionReorder: ICollectionReorder<unknown>): boolean {
        return true;
    }

    protected shouldValidateSetChangedTrigger(changedSet: INotifySetChanged<unknown>, setChange: ISetChange<unknown>): boolean {
        return true;
    }

    protected shouldValidateMapChangedTrigger(changedMap: INotifyMapChanged<unknown, unknown>, mapChange: IMapChange<unknown, unknown>): boolean {
        return true;
    }
}
