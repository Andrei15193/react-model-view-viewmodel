import { Validatable, type IValidator, type ValidatorCallback, type IObjectValidator, ObjectValidator, type WellKnownValidationTrigger, type ValidationTrigger, resolveAllValidationTriggers } from '../validation';

/**
 * Represents the configuration of a field, this can be extended for custom fields to easily add more features.
 * @template TValue The value of the field.
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
 */
export interface IFormFieldConfig<TValue, TValidationError = string> {
    /**
     * Provides the name of the field.
     */
    readonly name: string;
    /**
     * Provides the value of the field.
     * @default - {@linkcode initialValue}
     */
    readonly value?: TValue;
    /**
     * Provides the initial value of the field.
     */
    readonly initialValue: TValue;

    /**
     * Provides the validators of the field, these can be later reconfigured.
     */
    readonly validators?: readonly (IValidator<FormField<TValue, TValidationError>, TValidationError> | ValidatorCallback<FormField<TValue, TValidationError>, TValidationError>)[];
    /**
     * Provides the validation triggers of the field, these can be later reconfigured.
     */
    readonly validationTriggers?: readonly (WellKnownValidationTrigger | ValidationTrigger)[];
}

/**
 * Represents a form field containing the minimum set of information required to describe a field in a form.
 * @template TValue The type of values the field contains.
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
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
 * @guidance Adding Features to a Field
 *
 * One of the common features that a field may use is to track whether it was touched, i.e. if the input it is
 * bound to ever came into focus. This is not something provided implicity by the base implementation, however
 * adding this is easy.
 *
 * ```ts
 * class ExtendedFormField<TValue> extends FormField<TValue> {
 *   private _isTouched: boolean = false;
 *
 *   public get isTouched(): boolean {
 *     return this._isTouched;
 *   }
 *
 *   public set isTouched(value: boolean) {
 *     if (this._isTouched !== value) {
 *         this._isTouched = value;
 *         this.notifyPropertiesChanged('isTouched');
 *     }
 *   }
 * }
 * ```
 *
 * Form fields follow a config-style approach when being initialized, this allows to pass property values
 * through the constructor instead of having to set each after the instance is created. Additionally,
 * required and optional properties can be clearly specified.
 *
 * Following on the example, an `isTouched` initial value can be provided by extending the base config
 * and requesting it in the constructor.
 *
 * ```ts
 * interface IExtendedFieldConfig<TValue> extends IFormFieldConfig<TValue> {
 *   readonly isTouched?: boolean;
 * }
 *
 * class ExtendedFormField<TValue> extends FormField<TValue> {
 *   public constructor({ isTouched = false, ...baseConfig }: IExtendedFieldConfig<TValue>) {
 *     super(baseConfig);
 *
 *     this._isTouched = isTouched;
 *   }
 *
 *   // ...
 * }
 * ```
 *
 * Changes to the field may trigger validation, by default only changes to the {@linkcode value} does this,
 * to change the behavior see {@linkcode onShouldTriggerValidation}.
 *
 * @see {@linkcode Form}
 * @see {@linkcode IFormFieldConfig}
 */
export class FormField<TValue, TValidationError = string> extends Validatable<TValidationError> {
    private _name: string;
    private _value: TValue;
    private _initialValue: TValue;

    /**
     * Initializes a new instance of the {@linkcode FormField} class.
     * @param config The initial configuration of the field (name, value, validators etc.).
     */
    public constructor(config: IFormFieldConfig<TValue, TValidationError>) {
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

        this.validation = new ObjectValidator<this, TValidationError>({
            target: this,
            shouldTargetTriggerValidation: (_, changedProperties) => {
                return this.onShouldTriggerValidation(changedProperties);
            }
        })
        this.validation.add.apply(this.validation, validators);

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
     * Resets the field. Only the validation configuration is reset, the field retains its current value.
     */
    public reset(): void {
        this.validation.reset();
    }

    /**
     * Invoked when the current instance's properties change, this is a plugin method to help reduce
     * validations when changes do not have an effect on validation.
     *
     * @remarks
     *
     * By default, only changes to {@linkcode value} triggers validation. Changes to any other properties,
     * such as {@linkcode error}, {@linkcode isValid} and {@linkcode isInvalid} as well as any other
     * properties that get added to a field do not trigger validation.
     */
    protected onShouldTriggerValidation(changedProperties: readonly (keyof this)[]): boolean {
        return changedProperties.some(changedProperty => changedProperty === 'value');
    }
}