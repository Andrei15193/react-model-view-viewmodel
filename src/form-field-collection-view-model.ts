import type { IPropertiesChangedEventHandler } from './events';
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
    private readonly _fields: IObservableCollection<TFormFieldViewModel>;

    /** Initializes a new instance of the {@link FormFieldCollectionViewModel} class. */
    public constructor() {
        super();

        const fieldChangedEventHandler: IPropertiesChangedEventHandler<TFormFieldViewModel> = {
            handle: this.onFieldChanged.bind(this)
        }
        this._fields = new ObservableCollection<TFormFieldViewModel>();
        this._fields.collectionChanged.subscribe({
            handle(_, { addedItems: addedFields, removedItems: removedFields }) {
                addedFields.forEach(addedField => addedField.propertiesChanged.subscribe(fieldChangedEventHandler));
                removedFields.forEach(removedField => removedField.propertiesChanged.unsubscribe(fieldChangedEventHandler));
            }
        })
    }

    /** A collection containing the registered fields. */
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
    public get error(): string | null | undefined {
        return this._error;
    }

    /** An error message (or translation key) providing information as to why the field is invalid. */
    public set error(value: string | undefined) {
        if (this._error !== value) {
            this._error = value;
            this.notifyPropertiesChanged('error', 'isValid', 'isInvalid');
        }
    }

    /**
     * Registers the provided fields.
     * @param fields The fields to register.
     */
    protected registerFields(...fields: readonly (TFormFieldViewModel | readonly TFormFieldViewModel[])[]): void {
        const previousFieldCount = this._fields.length;

        const currentFieldCount = this._fields.push(...fields.reduce<TFormFieldViewModel[]>(
            (reuslt, fieldsOrArrays) => {
                if (Array.isArray(fieldsOrArrays))
                    reuslt.push(...fieldsOrArrays)
                else
                    reuslt.push(fieldsOrArrays as TFormFieldViewModel);
                return reuslt
            },
            []
        ));

        if (previousFieldCount !== currentFieldCount)
            this.notifyPropertiesChanged('isValid', 'isInvalid');
    }

    /**
     * Unregisters the provided fields.
     * @param fields The previously registered fields.
     */
    protected unregisterFields(...fields: readonly (TFormFieldViewModel | readonly TFormFieldViewModel[])[]): void {
        let hasUnregisteredFields = false;

        const removeField = (field: TFormFieldViewModel) => {
            const indexToRemove = this._fields.indexOf(field);
            if (indexToRemove >= 0) {
                this._fields.splice(indexToRemove, 1);

                hasUnregisteredFields = true;
            }
        }

        fields.forEach(fieldsOrArrays => {
            if (Array.isArray(fieldsOrArrays))
                fieldsOrArrays.forEach(removeField)
            else
                removeField(fieldsOrArrays as TFormFieldViewModel);
        });

        if (hasUnregisteredFields)
            this.notifyPropertiesChanged('isValid', 'isInvalid');
    }

    /**
     * Called when one of the registered fields notifies about changed properties.
     * @param field the field that has changed.
     * @param changedProperties the properties that have changed.
     */
    protected onFieldChanged(field: TFormFieldViewModel, changedProperties: readonly (keyof TFormFieldViewModel)[]): void {
        if (changedProperties.indexOf('isValid') >= 0 || changedProperties.indexOf('isInvalid') >= 0)
            this.notifyPropertiesChanged('isValid', 'isInvalid');
    }
}

/**
 * A helper class for creating forms, can be extended or reused to implement a similar feature to {@link FormFieldCollectionViewModel.create}.
 * @template TFormFieldViewModel The type of fields the form collection contains, defaults to {@link FormFieldViewModel}.
 * @template TFormFields the set of fields to register on the form.
 */
export class DynamicFormFieldCollectionViewModel<TFormFieldViewModel extends IFormFieldViewModel<any>, TFormFields extends FormFieldSet<TFormFieldViewModel>> extends FormFieldCollectionViewModel<TFormFieldViewModel> {
    /**
     * Initializes a new instance of the {@link DynamicFormFieldCollectionViewModel} class.
     * @param fields The form fields.
     */
    public constructor(fields: TFormFields) {
        super();

        const formFields: TFormFieldViewModel[] = [];
        Object.getOwnPropertyNames(fields).forEach(
            fieldPropertyName => {
                const formField = fields[fieldPropertyName];
                formFields.push(formField);
                Object.defineProperty(
                    this,
                    fieldPropertyName,
                    {
                        configurable: false,
                        enumerable: true,
                        writable: false,
                        value: formField
                    }
                );
            }
        );
        this.registerFields(...formFields);
    }
}