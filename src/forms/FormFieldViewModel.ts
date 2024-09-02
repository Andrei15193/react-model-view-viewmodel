import { Validatable, type IValidator, type ValidatorCallback, type IObjectValidator, ObjectValidator, type WellKnownValidationTrigger, type ValidationTrigger, resolveAllValidationTriggers } from '../validation';

export interface IFormFieldViewModelConfig<TValue, TValidationError = string> {
    readonly name: string;
    readonly value?: TValue;
    readonly initialValue: TValue;

    readonly validators?: readonly (IValidator<FormFieldViewModel<TValue, TValidationError>, TValidationError> | ValidatorCallback<FormFieldViewModel<TValue, TValidationError>, TValidationError>)[];
    readonly validationTriggers?: readonly (WellKnownValidationTrigger | ValidationTrigger)[];
}

export class FormFieldViewModel<TValue, TValidationError = string> extends Validatable<TValidationError> {
    private _name: string;
    private _value: TValue;
    private _initialValue: TValue;

    public constructor({ name, initialValue, value = initialValue, validators = [], validationTriggers: validationTriggers = [] }: IFormFieldViewModelConfig<TValue, TValidationError>) {
        super();

        this._name = name;
        this._value = value;
        this._initialValue = initialValue;

        this.validation = validators.reduce(
            (objectValidator, validator) => objectValidator.add(validator),
            new ObjectValidator<this, TValidationError>({
                target: this,
                shouldTargetTriggerValidation: (_, changedProperties) => {
                    return this.onShouldTriggerValidation(changedProperties);
                }
            })
        );

        resolveAllValidationTriggers(validationTriggers).forEach(this.validation.triggers.add, this.validation.triggers);
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        if (this._name !== value) {
            this._name = value;
            this.notifyPropertiesChanged('name');
        }
    }

    public get value(): TValue {
        return this._value;
    }

    public set value(value: TValue) {
        if (this._value !== value) {
            this._value = value;
            this.notifyPropertiesChanged('value');
        }
    }

    public get initialValue(): TValue {
        return this._value;
    }

    public set initialValue(value: TValue) {
        if (this._initialValue !== value) {
            this._initialValue = value;
            this.notifyPropertiesChanged('initialValue');
        }
    }

    public readonly validation: IObjectValidator<this, TValidationError>;

    public reset(): void {
        this.validation.reset();
    }

    protected onShouldTriggerValidation(changedProperties: readonly (keyof this)[]): boolean {
        return changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid');
    }
}