import type { INotifyPropertiesChanged } from './events';
import type { IReadOnlyValidatable, IValidatable } from './validation';
import { ViewModel } from './view-model';

/** Represents a form field interface exposing mixture of read-only and read-write properties in order to provide the minimum required set of properties that must be read-write while all other properties can only be read.
 * @template TValue The type of values the field contains.
 */
export interface IFormFieldViewModel<TValue> extends INotifyPropertiesChanged, IReadOnlyValidatable {
    /** The name of the field. */
    readonly name: string;

    /** The initial value of the field. Useful in scenarios where the input should be highlighted if the field has changed. */
    readonly initialValue: TValue;

    /** The current value of the field. */
    value: TValue;

    /** A flag indicating whether the field has been touched. Useful for cases when the error message should be displayed only if the field has been touched. */
    isTouched: boolean;

    /** A flag indicating whether the field is focused. */
    isFocused: boolean;
}

/** Represents a base form field, in most scenarios this should be enough to cover all necessary form requirements.
 * @template TValue The type of values the field contains.
 */
export class FormFieldViewModel<TValue> extends ViewModel implements IFormFieldViewModel<TValue>, IValidatable {
    private _name: string;
    private _value: TValue;
    private _initialValue: TValue;
    private _isTouched: boolean;
    private _isFocused: boolean;
    private _error: string | undefined;

    /** Initializes a new instance of the FormFieldViewModel class.
     * @param name The name of the field.
     * @param initalValue The initial value of the field.
     */
    public constructor(name: string, initalValue: TValue) {
        super();
        this._name = name;
        this._value = initalValue;
        this._initialValue = initalValue;
        this._isTouched = false;
        this._isFocused = false;
        this._error = undefined;
    }

    /** The name of the field. */
    public get name(): string {
        return this._name;
    }

    /** The name of the field. */
    public set name(value: string) {
        if (this._name !== value) {
            this._name = value;
            this.notifyPropertiesChanged('name');
        }
    }

    /** The initial value of the field. Useful in scenarios where the input should be highlighted if the field has changed. */
    public get initialValue(): TValue {
        return this._initialValue;
    }

    /** The initial value of the field. Useful in scenarios where the input should be highlighted if the field has changed. */
    public set initialValue(value: TValue) {
        if (this._initialValue !== value) {
            this._initialValue = value;
            this.notifyPropertiesChanged('initialValue');
        }
    }

    /** The current value of the field. */
    public get value(): TValue {
        return this._value;
    }

    /** The current value of the field. */
    public set value(value: TValue) {
        if (this._value !== value) {
            this._value = value;
            this.notifyPropertiesChanged('value');
        }
    }

    /** A flag indicating whether the field has been touched. Useful for cases when the error message should be displayed only if the field has been touched. */
    public get isTouched(): boolean {
        return this._isTouched;
    }

    /** A flag indicating whether the field has been touched. Useful for cases when the error message should be displayed only if the field has been touched. */
    public set isTouched(value: boolean) {
        if (this._isTouched !== value) {
            this._isTouched = value;
            this.notifyPropertiesChanged('isTouched');
        }
    }

    /** A flag indicating whether the field is focused. */
    public get isFocused(): boolean {
        return this._isFocused;
    }

    /** A flag indicating whether the field is focused. */
    public set isFocused(value: boolean) {
        if (this._isFocused !== value) {
            this._isFocused = value;
            this.notifyPropertiesChanged('isFocused');
        }
    }

    /** A flag indicating whether the field is valid. Generally, when there is no associated error message. */
    public get isValid(): boolean {
        return this._error === undefined;
    }

    /** A flag indicating whether the field is invalid. Generally, when there is an associated error message. */
    public get isInvalid(): boolean {
        return this._error !== undefined;
    }

    /** An error message (or translation key) providing information as to why the field is invalid. */
    public get error(): string | undefined {
        return this._error;
    }

    /** An error message (or translation key) providing information as to why the field is invalid. */
    public set error(value: string | undefined) {
        if (this._error !== value) {
            this._error = value;
            this.notifyPropertiesChanged('error', 'isValid', 'isInvalid');
        }
    }
}