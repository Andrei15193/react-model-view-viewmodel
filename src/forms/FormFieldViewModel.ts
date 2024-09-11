import { Validatable, type IValidator, type ValidatorCallback, type IObjectValidator, ObjectValidator, type WellKnownValidationTrigger, type ValidationTrigger, resolveAllValidationTriggers } from '../validation';

/**
 * Represents the configuration of a field, this can be extended for custom fields to easily add more features.
 */
export interface IFormFieldViewModelConfig<TValue, TValidationError = string> {
    readonly name: string;
    readonly value?: TValue;
    readonly initialValue: TValue;

    readonly validators?: readonly (IValidator<FormFieldViewModel<TValue, TValidationError>, TValidationError> | ValidatorCallback<FormFieldViewModel<TValue, TValidationError>, TValidationError>)[];
    readonly validationTriggers?: readonly (WellKnownValidationTrigger | ValidationTrigger)[];
}

/**
 * Represents a form field containing the minimum set of information required to describe a field in a form.
 *
 * @template TValue the value of the field.
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 *
 * ----
 *
 * @description
 * The form fields are designed to have the absolute minimum a form would require and at the same time be easily
 * extensible. It is highly encouraged that applications define their own forms and fields even if there are no
 * extra features, just to make it easy to add them later on.
 * 
 * The initialization follows a config-style approach where an object that contains all the values is provided to
 * the field constructor. This allows for a simple syntax where properties are initialized in a similar way to
 * object initializers.
 * 
 * On top of this, extending the field with this approach is easy. Extend the base config interface with extra
 * properties that are need, pass the same object to the base constructor and extract the newly added ones
 * afterwards.
 * 
 * ----
 *
 * @example
 *
 * One of the common features that a field may use is to track whether it was touched, i.e. if the input it is
 * bound to ever came into focus.
 * 
 * This is not something provided implicity by the base implementation, however we can provide our own.
 * 
 * First, we will extend the config interface and provide the `isTouched` flag, in case we want to initialize
 * fields as already touched, the default will be `false`.
 *
 * ```ts
 * interface IMyFieldConfig<TValue> extends IFormFieldViewModelConfig<TValue> {
 *   readonly isTouched?: boolean;
 * }
 * ```
 * 
 * Next, we will define our field.
 * 
 * ```ts
 * class MyFormFieldViewModel<TValue> extends FormFieldViewModel<TValue> {
 *   // Define a backing field as we will be using getters and setters
 *   private _isTouched: boolean;
 * 
 *   public constructor(config: IMyFieldConfig<TValue>) {
 *     super(config);
 *     
 *     const { isTouched = false } = config;
 * 
 *     this._isTouched = isTouched;
 *   }
 * 
 *   public get isTouched(): boolean {
 *     return this._isTouched;
 *   }
 * 
 *   public set isTouched(value: boolean) {
 *     // If the value indeed changes, we will update and notify about this
 *     if (this._isTouched !== value) {
 *       this._isTouched = value;
 *       this.notifyPropertiesChanged('isTouched');
 *     }
 *   }
 *   
 *   // This gets called whenever the current instance changes and determines whether a validation
 *   // should occur. In our case, the `isTouched` flag does not impact validation thus we can
 *   // skip validation whenever this flag changes.
 *   // The `error`, `isValid` and `isInvalid` fields come from the base implementation.
 *   protected onShouldTriggerValidation(changedProperties: readonly (keyof MyFormFieldViewModel<TValue>)[]): boolean {
 *     return changedProperties.some(changedProperty => (
 *       changedProperty !== 'error'
 *       && changedProperty !== 'isValid'
 *       && changedProperty !== 'isInvalid'
 *       && changedProperty !== 'isTouched'
 *     ));
 *   }
 * }
 * ```
 * 
 * With that, we have added `isTouched` feature to our fields, we can extend this further and add more
 * features, however this is application specific and only what is needed should be implemented.
 * 
 * The library provides the basic form model that can easily be extended allowing for users to define
 * the missing parts with ease while still benefiting from the full form model structure.
 */
export class FormFieldViewModel<TValue, TValidationError = string> extends Validatable<TValidationError> {
    private _name: string;
    private _value: TValue;
    private _initialValue: TValue;

    /**
     * Initializes a new instance of the {@link FormFieldViewModel} class.
     * @param config The initial configuration of the field (name, value, validators etc.).
     */
    public constructor(config: IFormFieldViewModelConfig<TValue, TValidationError>) {
        super();

        const {
            name,
            initialValue,
            value = initialValue,
            validators = [],
            validationTriggers: validationTriggers = []
        } = config;

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

    /**
     * Gets the name of the field.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Sets the name of the field.
     */
    public set name(value: string) {
        if (this._name !== value) {
            this._name = value;
            this.notifyPropertiesChanged('name');
        }
    }

    /**
     * Gets the value of the field.
     */
    public get value(): TValue {
        return this._value;
    }

    /**
     * Sets the value of the field.
     */
    public set value(value: TValue) {
        if (this._value !== value) {
            this._value = value;
            this.notifyPropertiesChanged('value');
        }
    }

    /**
     * Gets the initial value of the field.
     */
    public get initialValue(): TValue {
        return this._value;
    }

    /**
     * Sets the initial value of the field.
     */
    public set initialValue(value: TValue) {
        if (this._initialValue !== value) {
            this._initialValue = value;
            this.notifyPropertiesChanged('initialValue');
        }
    }

    /**
     * Gets the validation configuration for the current field.
     */
    public readonly validation: IObjectValidator<this, TValidationError>;

    /**
     * Resets the field. Only the validation configuration is reset,
     * the field retains its current value.
     */
    public reset(): void {
        this.validation.reset();
    }

    /**
     * Invoked when the current instance's properties change, this is a plugin method to help reduce validations when changes do not
     * have an effect on validation.
     */
    protected onShouldTriggerValidation(changedProperties: readonly (keyof this)[]): boolean {
        return changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid');
    }
}