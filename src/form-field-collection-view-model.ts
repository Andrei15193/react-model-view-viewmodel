import type { IEventHandler } from './events';
import type { IObservableCollection, IReadOnlyObservableCollection } from './observable-collection';
import type { IValidatable } from './validation';
import { ViewModel } from './view-model';
import { type IFormFieldViewModel, FormFieldViewModel } from './form-field-view-model';
import { ObservableCollection } from './observable-collection';

/** A set of form fields that can be used in generic parameter constraints.
 * @template TFormFieldViewModel the type of fields the form contains.
 */
export type FormFieldSet<TFormFieldViewModel extends IFormFieldViewModel<any>> = { readonly [key: string]: TFormFieldViewModel; };

/** Represents a collection of fields. Typically, this is a enough to represent a form, however for a complex user form multiple such collections can be used as sections that make up the entire form.
 * @template TFormFieldViewModel The type of fields the form collection contains, defaults to {@link FormFieldViewModel}.
 */
export abstract class FormFieldCollectionViewModel<TFormFieldViewModel extends IFormFieldViewModel<any> = FormFieldViewModel<any>> extends ViewModel implements IValidatable {
    /**
     * Initializes a new form with the given fields.
     * @template TFormFieldViewModel The type of field the form contains, defaults to {@link FormFieldViewModel}.
     * @template TFormFields The set of fields present on the form.
     * @param fields The form fields.
     * @returns Returns a new instance of the {@link FormFieldCollectionViewModel<TFormFieldViewModel>} class having the provided fields.
     */
    public static create<TFormFieldViewModel extends IFormFieldViewModel<any>, TFormFields extends FormFieldSet<TFormFieldViewModel>>(fields: TFormFields): FormFieldCollectionViewModel<TFormFieldViewModel> & TFormFields {
        return new DynamicFormFieldCollectionViewModel<TFormFieldViewModel, TFormFields>(fields) as FormFieldCollectionViewModel<TFormFieldViewModel> & TFormFields;
    }

    private _error: string | undefined;
    private readonly _fields: IObservableCollection<TFormFieldViewModel> = new ObservableCollection<TFormFieldViewModel>();
    private readonly _fieldChangedEventHandler: IEventHandler<readonly string[]>;

    /** Initializes a new instance of the {@link FormFieldCollectionViewModel} class. */
    public constructor() {
        super();
        this._fieldChangedEventHandler = {
            handle: (_, changedProperties) => {
                if (changedProperties.indexOf('isValid') >= 0 || changedProperties.indexOf('isInvalid') >= 0)
                    this.notifyPropertiesChanged('isValid', 'isInvalid');
            }
        }
    }

    /** A collection of registered fields. */
    public get fields(): IReadOnlyObservableCollection<TFormFieldViewModel> {
        return this._fields;
    }

    /** A flag indicating whether the field is valid. Generally, when there is no associated error message and all registered fields are valid. */
    public get isValid(): boolean {
        return this._error === undefined && this.fields.every(field => field.isValid);
    }

    /** A flag indicating whether the field is invalid. Generally, when there is an associated error message or at least one registered field is invalid. */
    public get isInvalid(): boolean {
        return this._error !== undefined || this.fields.some(field => field.isInvalid);
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

    /** Registers a new FormFieldViewModel having the provided initial value and returns it.
     * @deprecated In future versions this method will be removed. It was introduced mostly for utility purposes, however there are beter ways of adding fields, see {@link create}.
     * @param name The name of the field.
     * @param initialValue The initial value of the field.
     */
    protected addField<TValue>(name: string, initialValue: TValue): TFormFieldViewModel {
        return this.registerField(new FormFieldViewModel<TValue>(name, initialValue) as any as TFormFieldViewModel);
    }

    /** Registers the provided field and returns it.
     * @param field The field to register.
     * @returns Returns the provided field that has been registered.
     */
    protected registerField(field: TFormFieldViewModel): TFormFieldViewModel {
        field.propertiesChanged.subscribe(this._fieldChangedEventHandler);
        this._fields.push(field);
        this.notifyPropertiesChanged('isValid', 'isInvalid');

        return field;
    }

    /** Unregisters the provided field.
     * @param field The previously registered field.
     */
    protected unregisterField(field: TFormFieldViewModel): void {
        const indexToRemove = this._fields.indexOf(field);
        if (indexToRemove >= 0) {
            const removedField = this._fields[indexToRemove];
            removedField.propertiesChanged.unsubscribe(this._fieldChangedEventHandler);
            this._fields.splice(indexToRemove, 1);
            this.notifyPropertiesChanged('isValid', 'isInvalid');
        }
    }
}

/** A helper class for creating forms, can be extended or reused to implement a similar feature to {@link FormFieldCollectionViewModel.create}.
 * @template TFormFieldViewModel The type of fields the form collection contains, defaults to {@link FormFieldViewModel}.
 * @template TFormFields the set of fields to register on the form.
 */
export class DynamicFormFieldCollectionViewModel<TFormFieldViewModel extends IFormFieldViewModel<any>, TFormFields extends FormFieldSet<TFormFieldViewModel>> extends FormFieldCollectionViewModel<TFormFieldViewModel> {
    /** Initializes a new instance of the {@link DynamicFormFieldCollectionViewModel} class.
     * @param fields The form fields.
     */
    public constructor(fields: TFormFields) {
        super();

        Object.getOwnPropertyNames(fields).forEach(
            fieldPropertyName => {
                Object.defineProperty(
                    this,
                    fieldPropertyName,
                    {
                        configurable: false,
                        enumerable: true,
                        writable: false,
                        value: this.registerField(fields[fieldPropertyName])
                    }
                );
            }
        );
    }
}