import type { IValidatable } from '../IValidatable';
import { ViewModel } from '../../viewModels';
import { ObservableCollection, ObservableSet, ObservableMap } from '../../collections';
import { ObjectValidator } from '../objectValidator/ObjectValidator';

describe('ObjectValidator', () => {
    it('adding a validator validates the target', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator.add(() => {
            invocationCount++;
            return 'test error';
        });

        expect(invocationCount).toBe(1);
        expect(validatable.error).toBe('test error');
    });

    it('changing the target triggers a validation', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator.add(() => {
            invocationCount++;
            return 'test error';
        });
        validatable.notifyPropertiesChanged();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('changing the target triggers the validation one more time when changed target properties are ignored', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({
            target: validatable,
            shouldTargetTriggerValidation() {
                return true;
            }
        });
        objectValidator.add(() => {
            invocationCount++;
            return 'test error';
        });
        validatable.notifyPropertiesChanged();

        expect(invocationCount).toBe(3);
        expect(validatable.error).toBe('test error');
    });

    it('using multiple validators executes them until first invalid one', () => {
        const validatorCalls: string[] = [];
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
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
                    return '';
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

    it('adding a view model trigger validates target when it changes', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const viewModelValidationTrigger = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add(viewModelValidationTrigger);
        viewModelValidationTrigger.notifyPropertiesChanged();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable collection trigger validates target when it changes', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const observableCollectionValidationTrigger = new ObservableCollection<number>();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add(observableCollectionValidationTrigger);
        observableCollectionValidationTrigger.push(1);

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable collection trigger validates target when it reorders', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const observableCollectionValidationTrigger = new ObservableCollection<number>([1, 2]);

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add(observableCollectionValidationTrigger);
        observableCollectionValidationTrigger.reverse();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable set trigger validates target when it changes', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const observableSetValidationTrigger = new ObservableSet<number>();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add(observableSetValidationTrigger);
        observableSetValidationTrigger.add(1);

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an observable map trigger validates target when it changes', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const observableMapValidationTrigger = new ObservableMap<number, string>();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add(observableMapValidationTrigger);
        observableMapValidationTrigger.set(1, 'a');

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding an item trigger validates target when an item changes', () => {
        let invocationCount = 0;
        const item = new FakeValidatable();
        const validatable = new FakeValidatable();
        const observableCollection = new ObservableCollection<FakeValidatable>([item]);

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add([observableCollection, item => [item]]);

        item.notifyPropertiesChanged();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding a set item trigger validates target when an item changes', () => {
        let invocationCount = 0;
        const item = new FakeValidatable();
        const validatable = new FakeValidatable();
        const observableSet = new ObservableSet<FakeValidatable>([item]);

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add([observableSet, item => [item]]);

        item.notifyPropertiesChanged();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding a map item trigger validates target when an item changes', () => {
        let invocationCount = 0;
        const item = new FakeValidatable();
        const validatable = new FakeValidatable();
        const observableMap = new ObservableMap<number, FakeValidatable>([[1, item]]);

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error';
            })
            .triggers
            .add([observableMap, item => [item]]);

        item.notifyPropertiesChanged();

        expect(invocationCount).toBe(2);
        expect(validatable.error).toBe('test error');
    });

    it('adding validation triggers multiple times only registers them once', () => {
        const validatable = new FakeValidatable();
        const viewModelValidationTrigger = new FakeValidatable();
        const observableCollectionValidationTrigger = new ObservableCollection<number>();
        const observableSetValidationTrigger = new ObservableSet<number>();
        const observableMapValidationTrigger = new ObservableMap<number, string>();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(
                () => 'test error 1',
                () => 'test error 2',
            )
            .triggers
            .add(viewModelValidationTrigger)
            .add(observableCollectionValidationTrigger)
            .add(observableSetValidationTrigger)
            .add(observableMapValidationTrigger)
            .add(viewModelValidationTrigger)
            .add(observableCollectionValidationTrigger)
            .add(observableSetValidationTrigger)
            .add(observableMapValidationTrigger);

        expect(objectValidator.triggers.size).toBe(4);
        expect(objectValidator.triggers).toContain(viewModelValidationTrigger);
        expect(objectValidator.triggers).toContain(observableCollectionValidationTrigger);
        expect(objectValidator.triggers).toContain(observableSetValidationTrigger);
        expect(objectValidator.triggers).toContain(observableMapValidationTrigger);
    });

    it('removing validation triggers no longer trigger validation', () => {
        let invocationCount = 0;
        const validatable = new FakeValidatable();
        const viewModelValidationTrigger = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
        objectValidator
            .add(() => {
                invocationCount++;
                return 'test error 1';
            })
            .triggers
            .add(viewModelValidationTrigger);

        objectValidator.triggers.clear();
        viewModelValidationTrigger.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('adding a validator calls its onAdd hook', () => {
        let hookInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
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

    it('removing a validator calls its onRemove hook', () => {
        let hookInvocationCount = 0;
        const validatable = new FakeValidatable();

        const objectValidator = new ObjectValidator({ target: validatable });
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
});

export class FakeValidatable extends ViewModel implements IValidatable {
    private _error: string | null = null;

    public get error(): string | null {
        return this._error;
    }

    public set error(value: string | null) {
        if (this._error !== value) {
            this._error = value;
            super.notifyPropertiesChanged('error');
        }
    }

    public get isValid(): boolean {
        return this.error === null || this.error === undefined;
    }

    public get isInvalid(): boolean {
        return this.error !== null && this.error !== undefined;
    }

    public notifyPropertiesChanged() {
        super.notifyPropertiesChanged('notifyPropertiesChanged');
    }
}