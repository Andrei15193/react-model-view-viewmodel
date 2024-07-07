import type { INotifyPropertiesChanged } from '../../viewModels';
import type { IValidatable } from '../IValidatable';
import type { IValidationTrigger } from '../IValidationTrigger';
import { type INotifyCollectionChanged, type ICollectionChange, type INotifyCollectionReordered, type ICollectionReorder, type INotifySetChanged, type ISetChange, type INotifyMapChanged, type IMapChange, ObservableCollection, ObservableSet, ObservableMap } from '../../collections';
import { ObjectValidator } from '../objectValidator/ObjectValidator';
import { FakeValidatable, FakeViewModelValidationTrigger } from './common';

describe('ObjectValidator', (): void => {
    it('adding a validator validates the target', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateViewModelTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(() => {
            invocationCount++;
            return 'test error';
        });

        expect(checkInvocationCount).toBe(0);
        expect(invocationCount).toBe(1);
        expect(validatable.error).toBe('test error');
    });

    it('changing the target triggers a validaiton', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateViewModelTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(() => {
            invocationCount++;
            return 'test error';
        });
        validatable.triggerValidation();

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('using multiple validators executes them until first invalid one', (): void => {
        const validatorCalls: string[] = [];
        const validatable = new FakeValidatable();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.validators.push(
            {
                validate() {
                    validatorCalls.push('validator 1');
                    return null;
                }
            },
            {
                validate() {
                    validatorCalls.push('validator 2');
                    return undefined;
                }
            },
            {
                validate() {
                    validatorCalls.push('validator 3');
                    return "";
                }
            },
            {
                validate() {
                    validatorCalls.push('validator 4');
                    return null;
                }
            }
        );

        expect(validatorCalls).toEqual(['validator 1', 'validator 2', 'validator 3']);
    });

    it('adding a view model trigger validates target when it changes', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();
        const viewModelValidationTrigger = new FakeViewModelValidationTrigger();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateViewModelTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(
            () => {
                invocationCount++;
                return 'test error';
            },
            [viewModelValidationTrigger]
        );
        viewModelValidationTrigger.triggerValidation();

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable collection trigger validates target when it changes', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();
        const observableCollectionValidationTrigger = new ObservableCollection<number>();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateCollectionChangedTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        };
        objectValidator.add(
            () => {
                invocationCount++;
                return 'test error';
            },
            [observableCollectionValidationTrigger]
        );
        observableCollectionValidationTrigger.push(1);

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable collection trigger validates target when it reorders', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();
        const observableCollectionValidationTrigger = new ObservableCollection<number>([1, 2]);

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateCollectionReorderedTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(
            () => {
                invocationCount++;
                return 'test error';
            },
            [observableCollectionValidationTrigger]
        );
        observableCollectionValidationTrigger.reverse();

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable set trigger validates target when it changes', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();
        const observableSetValidationTrigger = new ObservableSet<number>();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateSetChangedTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(
            () => {
                invocationCount++;
                return 'test error';
            },
            [observableSetValidationTrigger]
        );
        observableSetValidationTrigger.add(1);

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable map trigger validates target when it changes', (): void => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const validatable = new FakeValidatable();
        const observableMapValidationTrigger = new ObservableMap<number, string>();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.shouldValidateMapChangedTriggerCallback = () => {
            checkInvocationCount++;
            return true;
        }
        objectValidator.add(
            () => {
                invocationCount++;
                return 'test error';
            },
            [observableMapValidationTrigger]
        );
        observableMapValidationTrigger.set(1, 'a');

        expect(checkInvocationCount).toBe(1);
        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding a validator calls its onAdd hook', (): void => {
        let hookInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.add({
            onAdd(target) {
                expect(target).toBe(validatable);
                hookInvocationCount++;
            },
            validate() {
                return null;
            }
        });

        expect(hookInvocationCount).toBe(1);
    });

    it('removing a validator calls its onRemove hook', (): void => {
        let hookInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new TestObjectValidator(validatable);
        objectValidator.add({
            onRemove(target) {
                expect(target).toBe(validatable);
                hookInvocationCount++;
            },
            validate() {
                return null;
            }
        });
        objectValidator.reset();

        expect(hookInvocationCount).toBe(1);
    });
})

class TestObjectValidator<TValidatable extends IValidatable<TValidationError> & IValidationTrigger, TValidationError = string> extends ObjectValidator<TValidatable, TValidationError> {
    public shouldValidateViewModelTriggerCallback?: typeof this.shouldValidateViewModelTrigger;
    public shouldValidateCollectionChangedTriggerCallback?: typeof this.shouldValidateCollectionChangedTrigger;
    public shouldValidateCollectionReorderedTriggerCallback?: typeof this.shouldValidateCollectionReorderedTrigger;
    public shouldValidateSetChangedTriggerCallback?: typeof this.shouldValidateSetChangedTrigger;
    public shouldValidateMapChangedTriggerCallback?: typeof this.shouldValidateMapChangedTrigger;

    protected shouldValidateViewModelTrigger(changedViewModel: INotifyPropertiesChanged, changedProperties: readonly PropertyKey[]): boolean {
        return (
            super.shouldValidateViewModelTrigger(changedViewModel, changedProperties)
            && (!this.shouldValidateViewModelTriggerCallback || this.shouldValidateViewModelTriggerCallback(changedViewModel, changedProperties))
        );
    }

    protected shouldValidateCollectionChangedTrigger(changedCollection: INotifyCollectionChanged<unknown>, collectionChange: ICollectionChange<unknown>): boolean {
        return (
            super.shouldValidateCollectionChangedTrigger(changedCollection, collectionChange)
            && (!this.shouldValidateCollectionChangedTriggerCallback || this.shouldValidateCollectionChangedTriggerCallback(changedCollection, collectionChange))
        );
    }

    protected shouldValidateCollectionReorderedTrigger(changedCollection: INotifyCollectionReordered<unknown>, collectionReorder: ICollectionReorder<unknown>): boolean {
        return (
            super.shouldValidateCollectionReorderedTrigger(changedCollection, collectionReorder)
            && (!this.shouldValidateCollectionReorderedTriggerCallback || this.shouldValidateCollectionReorderedTriggerCallback(changedCollection, collectionReorder))
        );
    }

    protected shouldValidateSetChangedTrigger(changedSet: INotifySetChanged<unknown>, setChange: ISetChange<unknown>): boolean {
        return (
            super.shouldValidateSetChangedTrigger(changedSet, setChange)
            && (!this.shouldValidateSetChangedTriggerCallback || this.shouldValidateSetChangedTriggerCallback(changedSet, setChange))
        );
    }

    protected shouldValidateMapChangedTrigger(changedMap: INotifyMapChanged<unknown, unknown>, mapChange: IMapChange<unknown, unknown>): boolean {
        return (
            super.shouldValidateMapChangedTrigger(changedMap, mapChange)
            && (!this.shouldValidateMapChangedTriggerCallback || this.shouldValidateMapChangedTriggerCallback(changedMap, mapChange))
        );
    }
}