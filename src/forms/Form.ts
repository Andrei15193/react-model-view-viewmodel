import type { IPropertiesChangedEventHandler } from '../viewModels';
import type { IReadOnlyFormSectionCollection } from './IReadOnlyFormSectionCollection';
import { type IReadOnlyObservableCollection, type IObservableCollection, type ICollectionChangedEventHandler, type ICollectionReorderedEventHandler, ObservableCollection, ReadOnlyObservableCollection } from '../collections';
import { type IObjectValidator, Validatable, ObjectValidator } from '../validation';
import { FormField } from './FormField';
import { FormSectionCollection } from './FormSectionCollection';

/**
 * Represents a form for which both fields and sections can be configured. Form sections are forms themselves making this a tree structure
 * where fields represent leaves and sections are parent nodes.
 *
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 *
 * ----
 *
 * @description
 * Any change within the tree can be propagated to the root as, for instance, the validity of a node is determined by its own valid state
 * plus the valid states of its descendants. If a field is invalid, the entire form is invalid, if a section is invalid, the entire form
 * is invalid.
 *
 * More flags and properties can be added to forms through inheritance, the model provides the bare minimum that would be required for any
 * application. For instance, an `isTouched` flag can be added to fields, however this does not need to be propagated to the root. On the
 * other hand, a `hasChanged` feature can be added on fields, but this should propagate to the root in order to know if the form itself has
 * changes.
 *
 * The design is mean to be extensible with the idea that each application would make its own customizations through inheritance (e.g.:
 * declaring a `MyAppForm` and a `MyAppFormModel`). While it can be a bit redundant if no extra features are added,
 * but it prepares the code in case any flag will be added in the future, the effort is small and covers for any scenario in the future.
 *
 * The validation error defaults to `string`, however this can be anything, enums, numbers, specific strings and so on. This is to enable
 * type-safety at the validation level and not force a particular approach. In most cases, a `string` will do, but if there is need for
 * something else, the option is available as well.
 *
 * ----
 *
 * @example
 *
 * In this example we will define a form for our application, we do this by simply extending the base form view model and then adding
 * our fields. We will be using the default validation result which is a string.
 *
 * ```tsx
 * export class MyForm extends Form {
 *   public constructor() {
 *     super();
 *
 *     this.withFields(
 *       this.name = new FormField<string>({
 *         name: 'name',
 *         initialValue: '',
 *         validators: [field => field.value === '' ? 'Required' : null]
 *       }),
 *       this.description = new FormField<string>({
 *         name: 'description',
 *         initialValue: ''
 *       })
 *     );
 *   }
 *
 *   public readonly name: FormField<string>;
 *
 *   public readonly description: FormField<string>;
 * }
 *
 * // We can use one of the hooks to create an instance in a component.
 * function MyFormComponent(): JSX.Element {
 *   const myForm = useViewModel(MyForm);
 *
 *   return (
 *     <>
 *       <input value={myForm.name.value} onChange={event => myForm.name.value = event.target.value} />
 *       <input value={myForm.description.value} onChange={event => myForm.description.value = event.target.value} />
 *     </>
 *   )
 * }
 *
 * // Or, define an input component for handling the binding of individual fields.
 * function MyInputComponent({ field }: { readonly field: Form<string> }): JSX.Element {
 *   // React to field property changes
 *   useViewModel(field);
 *
 *   return (
 *     <input value={field.value} onChange={event => field.value = event.target.value} />
 *   )
 * }
 * ```
 *
 * Depending on the application, there can be a wide range of field components each providing
 * different features depending on the value type of a field, text inputs for `string`s, number
 * inputs for `number`s, date pickers for `Date`s and so on. Even complex objects can be handled
 * with custom input components.
 *
 * The binding allows us to select the part of the field value that is relevant, while keeping
 * all other aspects are hidden, but useful in validation or interaction with other fields.
 *
 * ----
 *
 * @example
 *
 * In this example we will define a custom field that tracks whether its value changed from the initial one. This is a minimal implementation
 * and can further be extended by adding a custom comparer so we would be able to accurately compare complex types.
 *
 * ```ts
 * // Define an app-specific form, override some of the methods to restrict
 * // what type of fields can be added and which notifications propagate.
 * export class MyAppForm extends Form<number> {
 *   // Restrict all fields to be app-specific ones.
 *   public readonly fields: IReadOnlyObservableCollection<MyAppFormField<unknown>>;
 *
 *   protected withFields(...fields: readonly MyAppFormField<any>[]): IObservableCollection<MyAppFormField<any>> {
 *     return super.withFields.apply(this, arguments);
 *   }
 *
 *   // Restrict all sections to be app-specific ones.
 *   public readonly sections: IReadOnlyObservableCollection<MyAppForm>;
 *
 *   protected withSections(...sections: readonly MyAppForm[]): FormSectionCollection<MyAppForm, number> {
 *     return super.withSections.apply(this, arguments);
 *   }
 *
 *   protected withSectionsCollection(sectionsCollection: IReadOnlyFormSectionCollection<MyAppForm, number>): IReadOnlyFormSectionCollection<MyAppForm, number> {
 *     return super.withSectionsCollection.apply(this, arguments);
 *   }
 *
 *   // Any field or section that has changes propapages to the root.
 *   public get hasChanges(): boolean {
 *     return (
 *       this.fields.some(field => field.hasChanged)
 *       || this.sections.some(section => section.hasChanges)
 *     );
 *   }
 *
 *   // This gets called whenever a field's property has changed,
 *   // we can use this to propagate the notifications.
 *   protected onFieldChanged(
 *     field: MyAppFormField<unknown>,
 *     changedProperties: readonly (keyof MyAppFormField<unknown>)[]
 *   ) {
 *     super.onFieldChanged.apply(this, arguments);
 *
 *     // Small difference here between fields and sections,
 *     // a field `hasChanged` while a section `hasChanges`.
 *     if (changedProperties.some(changedProperty => changedProperty === 'hasChanged'))
 *       this.notifyPropertiesChanged('hasChanges');
 *   }
 *
 *   // This gets called whenever a section's property has changed,
 *   // we can use this to propagate the notifications.
 *   protected onSectionChanged(
 *     section: MyAppForm,
 *     changedProperties: readonly (keyof MyAppForm)[]
 *   ) {
 *     super.onSectionChanged.apply(this, arguments);
 *
 *     if (changedProperties.some(changedProperty => changedProperty === 'hasChanges'))
 *       this.notifyPropertiesChanged('hasChanges');
 *   }
 *
 *   // This gets called whenever the current instance changes and determines whether a validation
 *   // should occur. In our case, the `hasChanges` flag does not impact validation thus we can
 *   // skip validation whenever this flag changes.
 *   // The `error`, `isValid` and `isInvalid` fields come from the base implementation.
 *   protected onShouldTriggerValidation(changedProperties: readonly (keyof MyAppForm)[]): boolean {
 *     return changedProperties.some(changedProperty => (
 *       changedProperty !== 'error'
 *       && changedProperty !== 'isValid'
 *       && changedProperty !== 'isInvalid'
 *       && changedProperty !== 'hasChanges'
 *     ));
 *   }
 * }
 *
 * // Define an app-specific field, we will use numbers for validation error.
 * // This will help us as well since we will not have to specify it every time
 * // and maintains consistency throughout the codebase.
 * class MyAppFormField<TValue> extends FormField<TValue, number> {
 *   public get hasChanged(): boolean {
 *     return this.value !== this.initialValue;
 *   }
 *
 *   public get value(): TValue {
 *     return super.value;
 *   }
 *
 *   public set value(value: TValue) {
 *     super.value = value;
 *     this.notifyPropertiesChanged('hasChanged');
 *   }
 * }
 * ```
 */
export class Form<TValidationError = string> extends Validatable<TValidationError> {
    private readonly _fields: AggregateObservableCollection<FormField<unknown, TValidationError>>;
    private readonly _sections: AggregateObservableCollection<Form<TValidationError>, IReadOnlyFormSectionCollection<Form<TValidationError>, TValidationError>>;

    /**
     * Initializes a new instance of the {@link Form} class.
     */
    public constructor() {
        super();

        this.validation = new ObjectValidator<this, TValidationError>({
            target: this,
            shouldTargetTriggerValidation: (_, changedProperties) => {
                return this.onShouldTriggerValidation(changedProperties);
            }
        });
        this.fields = this._fields = new AggregateObservableCollection<FormField<unknown, TValidationError>>();
        this.sections = this._sections = new AggregateObservableCollection<Form<TValidationError>, IReadOnlyFormSectionCollection<Form<TValidationError>, TValidationError>>();

        const fieldChangedEventHandler: IPropertiesChangedEventHandler<FormField<unknown, TValidationError>> = {
            handle: this.onFieldChanged.bind(this)
        };
        this.fields.collectionChanged.subscribe({
            handle(_, { addedItems: addedFields, removedItems: removedFields }) {
                removedFields.forEach(removedField => {
                    removedField.propertiesChanged.unsubscribe(fieldChangedEventHandler);
                    removedField.reset();
                });
                addedFields.forEach(addedField => {
                    addedField.propertiesChanged.subscribe(fieldChangedEventHandler);
                });
            }
        });

        const sectionChangedEventHandler: IPropertiesChangedEventHandler<Form<TValidationError>> = {
            handle: this.onSectionChanged.bind(this)
        };
        this.sections.collectionChanged.subscribe({
            handle(_, { addedItems: addedSections, removedItems: removedSections }) {
                removedSections.forEach(removedSection => {
                    removedSection.propertiesChanged.unsubscribe(sectionChangedEventHandler);
                    removedSection.reset();
                });
                addedSections.forEach(addedSection => {
                    addedSection.propertiesChanged.subscribe(sectionChangedEventHandler);
                });
            }
        });
    }

    /**
     * Gets the validation configuration for the form. Fields have their own individual validation config as well.
     */
    public readonly validation: IObjectValidator<this, TValidationError>;

    /**
     * Gets the fields defined within the form instance.
     */
    public readonly fields: IReadOnlyObservableCollection<FormField<unknown, TValidationError>>;

    /**
     * Gets the sections defined within the form instance.
     */
    public readonly sections: IReadOnlyObservableCollection<Form<TValidationError>>;

    /**
     * Indicates whether the form is valid.
     *
     * A form is only valid when all contained fields and sections are valid.
     */
    public get isValid(): boolean {
        return (
            super.isValid
            && this.fields.every(field => field.isValid)
            && this.sections.every(section => section.isValid)
        );
    }

    /**
     * Indicates whether the form is invalid.
     *
     * A form is invalid when at least one contained field or section is invalid.
     */
    public get isInvalid(): boolean {
        return (
            super.isInvalid
            || this.fields.some(field => field.isInvalid)
            || this.sections.some(section => section.isInvalid)
        );
    }

    /**
     * Resets the form, contained fields and sections to their initial configuration.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    public reset(): void {
        this._sections.aggregatedCollections.forEach(sectionsCollection => {
            sectionsCollection.clearItemSetups();
        });
        this.fields.forEach(field => field.reset());
        this.validation.reset();
    }

    /**
     * Adds the provided fields to the form, returns an observable collection containing them.
     *
     * Any changes made to the returned collection is reflected in the form as well, added fields are
     * added, removed fields are removed, sorting or moving fields around are moved in the form as well.
     * @param fields The fields to add to the form.
     * @returns Returns a collection containing the provided fields. The form reacts to changes made in
     * the returned collection always keeping in sync.
     */
    protected withFields(...fields: readonly FormField<any, TValidationError>[]): IObservableCollection<FormField<any, TValidationError>> {
        const fieldsCollection = new ObservableCollection<FormField<unknown, TValidationError>>(fields);
        this._fields.aggregatedCollections.push(fieldsCollection);

        return fieldsCollection;
    }

    /**
     * Adds the provided sections to the form, returns an observable collection containing them.
     *
     * Any changes made to the returned collection is reflected in the form as well, added sections are
     * added, removed sections are removed, sorting or moving sections around are moved in the form as well.
     * @param sections The sections to add to the form.
     * @returns Returns a collection containing the provided sections. The form reacts to changes made in
     * the returned collection always keeping in sync.
     */
    protected withSections(...sections: readonly Form<TValidationError>[]): FormSectionCollection<Form<TValidationError>, TValidationError> {
        const sectionsCollection = new FormSectionCollection<Form<TValidationError>, TValidationError>(sections);
        this.withSectionsCollection(sectionsCollection);

        return sectionsCollection;
    }

    /**
     * Adds the provided sections collection to the form, this is similar to the {@linkcode withSections} method,
     * the difference being that a custom collection can be added for better handling the addition and removal
     * of sections as well as keeping a clean interface.
     *
     * Any changes made to the returned collection is reflected in the form as well, added sections are
     * added, removed sections are removed, sorting or moving sections around are moved in the form as well.
     *
     * @param sectionsCollection The sections collection to add.
     * @returns Returns the provided sections collection.
     *
     * ----
     *
     * @example
     * In this example we will define a custom sections collection for our form. We have a todo list where
     * each item is editable.
     *
     * ```ts
     * class ToDoList extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.name = new FormField<string>({ name: 'name', initialValue: '' })
     *     );
     *     this.withSectionsCollection(
     *       this.items = new ToDoListItemsCollection()
     *     );
     *   }
     *
     *   public readonly name: FormField<string>;
     *
     *   public readonly items: ToDoListItemsCollection;
     * }
     *
     * class ToDoListItemsCollection extends ReadOnlyFormSectionCollection<ToDoItemForm> {
     *   public add(): ToDoItemForm {
     *     const toDoItem = new ToDoItemForm();
     *     this.push(toDoItem);
     *
     *     return toDoItem;
     *   }
     *
     *   public remove(toDoItem: ToDoItemForm): void {
     *     const toDoItemIndex = this.indexOf(toDoItem);
     *     if (toDoItemIndex >= 0)
     *       this.splice(toDoItemIndex, 1);
     *   }
     *
     * }
     *
     * class ToDoItemForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.description = new FormField<string>({ name: 'description', initialValue: '' })
     *     );
     *   }
     *
     *   public readonly description: FormField<string>;
     * }
     * ```
     *
     * This helps us keep our interface clean and find methods where we would expect them.
     *
     * ```ts
     * const toDoList = new ToDoList();
     *
     * const toDoItem = toDoList.items.add();
     * toDoItem.description.value = 'This is nice';
     *
     * toDoList.items.remove(toDoItem);
     * ```
     */
    protected withSectionsCollection(sectionsCollection: IReadOnlyFormSectionCollection<Form<TValidationError>, TValidationError>): IReadOnlyFormSectionCollection<Form<TValidationError>, TValidationError> {
        this._sections.aggregatedCollections.push(sectionsCollection);

        return sectionsCollection;
    }

    /**
     * Invoked when a field's properies change, this is a plugin method through which notification propagation can be made with ease.
     */
    protected onFieldChanged(field: FormField<unknown, TValidationError>, changedProperties: readonly (keyof FormField<unknown, TValidationError>)[]) {
        if (changedProperties.some(changedProperty => changedProperty === 'isValid' || changedProperty === 'isInvalid'))
            this.notifyPropertiesChanged('isValid', 'isInvalid');
    }

    /**
     * Invoked when a section's properies change, this is a plugin method through which notification propagation can be made with ease.
     */
    protected onSectionChanged(section: Form<TValidationError>, changedProperties: readonly (keyof Form<TValidationError>)[]) {
        if (changedProperties.some(changedProperty => changedProperty === 'isValid' || changedProperty === 'isInvalid'))
            this.notifyPropertiesChanged('isValid', 'isInvalid');
    }

    /**
     * Invoked when the current instance's properties change, this is a plugin method to help reduce validations when changes do not
     * have an effect on validation.
     */
    protected onShouldTriggerValidation(changedProperties: readonly (keyof this)[]): boolean {
        return changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid');
    }
}

class AggregateObservableCollection<TItem, TAggregateCollection extends IReadOnlyObservableCollection<TItem> = IReadOnlyObservableCollection<TItem>> extends ReadOnlyObservableCollection<TItem> {
    public constructor() {
        super();

        this.aggregatedCollections = new ObservableCollection<TAggregateCollection>();

        const collectionChangedEventHandler: ICollectionChangedEventHandler<IReadOnlyObservableCollection<TItem>, TItem> = {
            handle: (collection, { startIndex, addedItems, removedItems }) => {
                for (let offset = 0, index = 0; index < this.aggregatedCollections.length; index++)
                    if (collection === this.aggregatedCollections[index]) {
                        this.splice(startIndex + offset, removedItems.length, ...addedItems);
                        offset += this.aggregatedCollections[index].length - (addedItems.length - removedItems.length);
                    }
                    else
                        offset += this.aggregatedCollections[index].length;
            }
        };

        const collectionReorderedEventHandler: ICollectionReorderedEventHandler<IReadOnlyObservableCollection<TItem>, TItem> = {
            handle: (collection) => {
                for (let offset = 0, index = 0; index < this.aggregatedCollections.length; offset += this.aggregatedCollections[index].length, index++)
                    if (collection === this.aggregatedCollections[index])
                        this.splice(offset, collection.length, ...collection.toArray());
            }
        };

        this.aggregatedCollections.collectionChanged.subscribe({
            handle: (_, { startIndex, addedItems: addedCollections, removedItems: removedCollections }) => {
                removedCollections.forEach(removedCollection => {
                    removedCollection.collectionReordered.unsubscribe(collectionReorderedEventHandler);
                    removedCollection.collectionChanged.unsubscribe(collectionChangedEventHandler);
                });

                addedCollections.forEach(addedCollection => {
                    addedCollection.collectionChanged.subscribe(collectionChangedEventHandler);
                    addedCollection.collectionReordered.subscribe(collectionReorderedEventHandler);
                });

                let offset = 0, index = 0;
                while (index < startIndex && index < this.aggregatedCollections.length) {
                    offset += this.aggregatedCollections[index].length;
                    index++;
                }

                this.splice(
                    offset,
                    removedCollections.reduce((removedItemsCount, removedCollection) => removedItemsCount + removedCollection.length, 0),
                    ...addedCollections.reduce(
                        (addedItems, addedCollection) => {
                            addedItems.push(...addedCollection);
                            return addedItems;
                        },
                        new Array<TItem>()
                    )
                );
            }
        });
    }

    public readonly aggregatedCollections: IObservableCollection<TAggregateCollection>;
}