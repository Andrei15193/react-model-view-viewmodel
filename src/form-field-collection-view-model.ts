import type { IEventHandler } from './events';
import type { IObservableCollection, IReadOnlyObservableCollection } from './observable-collection';
import type { IValidatable } from './validation';
import { ViewModel } from './view-model';
import { FormFieldViewModel } from './form-field-view-model';
import { ObservableCollection } from './observable-collection';

/** Represents a collection of fields. Typically, this is a enough to represent a form, however for a complex user form multiple such collections can be used as sections that make up the entire form. */
export abstract class FormFieldCollectionViewModel extends ViewModel implements IValidatable {
    private _error: string | undefined;
    private readonly _fields: IObservableCollection<FormFieldViewModel<any>> = new ObservableCollection<FormFieldViewModel<any>>();
    private readonly _fieldChangedEventHandler: IEventHandler<readonly string[]>;

    /** Initializes a new instance of the FormFieldCollectionViewModel class. */
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
    public get fields(): IReadOnlyObservableCollection<FormFieldViewModel<any>> {
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
     * @param name The name of the field.
     * @param initialValue The initial value of the field.
     */
    protected addField<TValue>(name: string, initialValue: TValue): FormFieldViewModel<TValue> {
        return this.registerField(new FormFieldViewModel<TValue>(name, initialValue));
    }

    /** Registers the provided FormFieldViewModel and returns it.
     * @param field The field to register.
     */
    protected registerField<TValue>(field: FormFieldViewModel<TValue>): FormFieldViewModel<TValue> {
        field.propertiesChanged.subscribe(this._fieldChangedEventHandler);
        this._fields.push(field);
        this.notifyPropertiesChanged('isValid', 'isInvalid');

        return field;
    }

    /** Unregisters the provided FormFieldViewModel.
     * @param field The previously registered field.
     */
    protected unregisterField<TValue>(field: FormFieldViewModel<TValue>): void {
        const indexToRemove = this._fields.indexOf(field);
        if (indexToRemove >= 0) {
            const removedField = this._fields[indexToRemove];
            removedField.propertiesChanged.unsubscribe(this._fieldChangedEventHandler);
            this._fields.splice(indexToRemove, 1);
            this.notifyPropertiesChanged('isValid', 'isInvalid');
        }
    }
}