import type { IPropertiesChangedEventHandler } from '../viewModels';
import type { IReadOnlyFormCollection } from './IReadOnlyFormCollection';
import { type IReadOnlyObservableCollection, type IObservableCollection, type ICollectionChangedEventHandler, type ICollectionReorderedEventHandler, ObservableCollection, ReadOnlyObservableCollection } from '../collections';
import { type IValidatable, type IObjectValidator, Validatable, ObjectValidator } from '../validation';
import { FormField } from './FormField';
import { FormCollection } from './FormCollection';

/**
 * Represents a form for which both fields and sections can be configured. Form sections are forms themselves making this a tree structure
 * where fields represent leaves and sections are parent nodes.
 *
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
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
 * @remarks
 *
 * The library makes a distinction between form definition and form configuration.
 *
 * **Form definition** relates to the structure of the form, what fields and what
 * type of value they handle along side any sections or collections of editable
 * items the form can handle.
 *
 * Large forms can be broken down into sections to group relevant fields together,
 * in essence, it is still one form, however the object model allows for an easier
 * navigation and understanding of the form structure.
 *
 * **Form configuration** relates to form validation and field locking. In more
 * complex scenarios, an edit form may have different validation rules depending
 * on the underlying entity state.
 *
 * For instnace, when placing orders in an online shop, the respective order
 * goes through a number of states and some fields are editable dependent on that.
 *
 * The configuration does not change the state, the form still looks more or less
 * the same, but the way fields behave is different. Some fields become required
 * or have different validaiton rules while other can become locked and are no
 * longer editable.
 *
 * ----
 *
 * @guidance Define a Form
 *
 * To define a form with all related fields we need to extend from the base class
 * and then declare the fields it contains and add them to the form.
 *
 * We can do this in one expression, we assign each individual field to properties
 * to easily access them later on.
 *
 * ```ts
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
 * ```
 *
 * All forms are view models as well, we can create an instance and watch it
 * for changes using the {@linkcode useViewModel} hook.
 *
 * ```tsx
 * function MyFormComponent(): JSX.Element {
 *   const myForm = useViewModel(MyForm);
 *
 *   return (
 *     <>
 *       <input
 *         value={myForm.name.value}
 *         onChange={event => myForm.name.value = event.target.value} />
 *       <input
 *         value={myForm.description.value}
 *         onChange={event => myForm.description.value = event.target.value} />
 *     </>
 *   )
 * }
 * ```
 *
 * Ideally, input binding is done through a specific component that handles a
 * specific type of input (text, numbers dates etc.) with appropriate memoization.
 *
 * For more information about input binding see {@linkcode FormField}.
 *
 * ----
 *
 * @guidance Field Changes Proparagation
 *
 * One of the big features of this library is extensibility, especially when it
 * comes to forms.
 *
 * It is very easy to extend a {@linkcode FormField}, however that is not always
 * enough. Some extensions apply to the form as a whole, changes at the field
 * level propagate to the form that contains them.
 *
 * One such example is adding a _has changes_ feature which can be used as a
 * navigation guard on edit pages. If there are no changes, then there is no need
 * to prompt the user.
 *
 * Whether a form has changed is determined at the field level, if there is at
 * least one field that changed then we can say that the form indeed has changes.
 *
 * First, we will define a custom {@linkcode FormField} to define this flag.
 *
 * ```ts
 * class MyCustomFormField<TValue> extends FormField<TValue> {
 *   public get value(): TValue {
 *     return super.value;
 *   }
 *
 *   public set value(value: TValue) {
 *     super.value = value;
 *     this.notifyPropertiesChanged('hasChanged');
 *   }
 *
 *   public get hasChanged(): boolean {
 *     return this.initialValue !== this.value;
 *   }
 * }
 * ```
 *
 * We can further improve on the code above, even extend the field config to
 * ask for an equality comparer in case we are dealing with complex types, but
 * for this example it will do.
 *
 * We need to define a custom form as well which will take into account the
 * newly defined flag on our custom field. Whenever we are notified that
 * `hasChanged` may have changed (no pun intended), we will propagate this
 * on the form itself.
 *
 * ```ts
 * class MyCustomForm extends Form {
 *   public readonly fields: IReadOnlyObservableCollection<MyCustomFormField<unknown>>;
 *
 *   protected withFields(
 *     ...fields: readonly MyCustomFormField<any>[]
 *   ): IObservableCollection<MyCustomFormField<any>> {
 *     return super.withFields.apply(this, arguments);
 *   }
 *
 *   public get hasChanges(): boolean {
 *     return this.fields.some(field => field.hasChanged);
 *   }
 *
 *   protected onFieldChanged(
 *     field: MyCustomFormField<unknown>,
 *     changedProperties: readonly (keyof MyCustomFormField<unknown>)[]
 *   ): void {
 *     if (changedProperties.includes('hasChanged'))
 *       this.notifyPropertiesChanged('hasChanges');
 *   }
 * }
 * ```
 *
 * This example only covers field extension propagation, forms can contain
 * sub-forms, or sections, which they too can propagate changes. For more
 * information about this check {@linkcode sections}.
 *
 * Sections are part of complex forms and more than enough applications will
 * not even need to cover for this, however keep in mind that the library
 * provides easy extension throughout the form definition including complex
 * scenarios like lists or tables of editable items.
 *
 * ----
 *
 * @guidance Specific Validation Errors
 *
 * Generally, when validating a field or perform validation on any type of
 * {@linkcode IValidatable} object the general way to represent an error
 * is through a `string`.
 *
 * Validation errors can be represented in several ways such as `number`s
 * or error codes, `enum`s or even [literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
 * which are more or less predefined strings.
 *
 * Some offer more freedom as to how errors are represented, while others are
 * more restrictive on one hand, but on the other provide type checking and
 * intellisense support.
 *
 * By default, validation errors are represented using `string`s, however this
 * can be changed through the {@linkcode TValidationError} generic parameter.
 * The snippet below illustrates using a [literal type](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
 * for validaiton results.
 *
 * ```ts
 * type ValidationError = 'Required' | 'GreaterThanZero';
 *
 * class AppForm extends Form<ValidationError> {
 * }
 * ```
 *
 * This is all, additionally an `AppFormField` can be defined as well to bind
 * the generic parameter at the field level as well.
 *
 * Defining a specific form is similar as in the first example, inherit from
 * the newly defined `AppForm` class and define the fields.
 *
 * ```ts
 * class SpecificAppForm extends AppForm {
 *   constructor() {
 *     super();
 *
 *     this.withFields(
 *       this.description = new FormField<string, ValidationError>({
 *         name: 'description',
 *         initialValue: ''
 *       }),
 *       this.count = new FormField<number, ValidationError>({
 *         name: 'count',
 *         initialValue: 0
 *       })
 *     )
 *   }
 *
 *   public readonly description: FormField<string, ValidationError>;
 *
 *   public readonly count: FormField<number, ValidationError>;
 * }
 * ```
 *
 * Finally, we get to configuring the form and adding validators. We can do
 * this when we instantiate the fields as well. Each validator is bound to
 * the specific `ValidationResult` type. Attempting to return something else
 * would result in a compilation error.
 *
 * ```ts
 * const form = new SpecificAppForm();
 *
 * form.description
 *   .validation
 *   .add(field => !field.value ? 'Required' : null);
 *
 * form.count
 *   .validation
 *   .add(field => field.value <= 0 ? 'GreaterThanZero' : null);
 * ```
 */
export class Form<TValidationError = string> extends Validatable<TValidationError> {
    private readonly _fields: AggregateObservableCollection<FormField<unknown, TValidationError>>;
    private readonly _sections: AggregateObservableCollection<Form<TValidationError>, IReadOnlyFormCollection<Form<TValidationError>, TValidationError>>;

    /**
     * Initializes a new instance of the {@linkcode Form} class.
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
        this.sections = this._sections = new AggregateObservableCollection<Form<TValidationError>, IReadOnlyFormCollection<Form<TValidationError>, TValidationError>>();
        this.sectionsCollections = this._sections.aggregatedCollections;

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
                });
                addedSections.forEach(addedSection => {
                    addedSection.propertiesChanged.subscribe(sectionChangedEventHandler);
                });
            }
        });

        const sectionsCollectionsChangedEventHandler: IPropertiesChangedEventHandler<IReadOnlyFormCollection<Form<TValidationError>, TValidationError>> = {
            handle: this.onSectionsCollectionChanged.bind(this)
        };
        this._sections.aggregatedCollections.collectionChanged.subscribe({
            handle(_, { addedItems: addedSectionsConllections, removedItems: removedSectionsCollections }) {
                removedSectionsCollections.forEach(removedSectionsCollection => {
                    removedSectionsCollection.propertiesChanged.unsubscribe(sectionsCollectionsChangedEventHandler);
                    removedSectionsCollection.reset();
                });
                addedSectionsConllections.forEach(addedSectionsCollection => {
                    addedSectionsCollection.propertiesChanged.subscribe(sectionsCollectionsChangedEventHandler);
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
     * Gets the sections collections defined within the form instance.
     */
    public readonly sectionsCollections: IReadOnlyObservableCollection<IReadOnlyFormCollection<Form<TValidationError>, TValidationError>>;

    /**
     * Indicates whether the form is valid.
     *
     * A form is only valid when all contained fields and sections are valid.
     */
    public get isValid(): boolean {
        return (
            super.isValid
            && this.fields.every(field => field.isValid)
            && this.sectionsCollections.every(sectionsCollection => sectionsCollection.isValid)
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
            || this.sectionsCollections.some(sectionsCollection => sectionsCollection.isInvalid)
        );
    }

    /**
     * Resets the form, contained fields and sections to their initial configuration.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    public reset(): void {
        this.sectionsCollections.forEach(sectionsCollection => {
            sectionsCollection.reset();
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
    protected withSections(...sections: readonly Form<TValidationError>[]): FormCollection<Form<TValidationError>, TValidationError> {
        const sectionsCollection = new FormCollection<Form<TValidationError>, TValidationError>(sections);
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
     * @guidance
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
     * class ToDoListItemsCollection extends ReadOnlyFormCollection<ToDoItemForm> {
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
    protected withSectionsCollection(sectionsCollection: IReadOnlyFormCollection<Form<TValidationError>, TValidationError>): IReadOnlyFormCollection<Form<TValidationError>, TValidationError> {
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
    }

    /**
     * Invoked when a section's properies change, this is a plugin method through which notification propagation can be made with ease.
     */
    protected onSectionsCollectionChanged(sectionsCollection: IReadOnlyFormCollection<Form<TValidationError>, TValidationError>, changedProperties: readonly (keyof IReadOnlyFormCollection<Form<TValidationError>, TValidationError>)[]) {
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