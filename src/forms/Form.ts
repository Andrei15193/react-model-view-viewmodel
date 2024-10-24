import type { IPropertiesChangedEventHandler } from '../viewModels';
import type { IReadOnlyFormCollection } from './IReadOnlyFormCollection';
import type { ReadOnlyFormCollection } from './ReadOnlyFormCollection';
import { type IReadOnlyObservableCollection, type IObservableCollection, type ICollectionChangedEventHandler, type ICollectionReorderedEventHandler, ObservableCollection, ReadOnlyObservableCollection } from '../collections';
import { type IValidatable, type IObjectValidator, type WellKnownValidationTrigger, type ValidationTrigger, Validatable, ObjectValidator } from '../validation';
import { type IFormFieldConfig, FormField } from './FormField';
import { FormCollection } from './FormCollection';

/**
 * Represents a form for which both fields and sections can be configured. Form sections are forms themselves making this a tree structure
 * where fields represent leaves and sections are parent nodes.
 *
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
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
 * or have different validation rules while other can become locked and are no
 * longer editable.
 *
 * #### Form Structure and Change Propagation
 *
 * Forms have a hierarchical structure comprising of fields and sections which are
 * forms themselves. This allows for both simple and complex form definitions
 * through the same model.
 *
 * Any form contrains a collection of fields and a collection of sections, however
 * propagation has an additional level of sections collections. Any form is a parent
 * node while fields are leaves in the tree structure with propagation generally
 * going bottom-up.
 *
 * * {@linkcode Form} - root or parent node
 *   * {@linkcode FormField} - leaf nodes, any changes to a field are propagated to the parent node, a {@linkcode Form}.
 *   * {@linkcode FormCollection} - a collection of {@linkcode Form} instances, any change to a form collection is propagated to the parent node, a {@linkcode Form}.
 *
 * Any changes to a {@linkcode Form} is propagated to the {@linkcode FormCollection}
 * to which it was added. With this, extensions and validation can be added at any level,
 * from fields, to forms and form collections themselves.
 *
 * For simple cases, defining a form is done by extending a {@linkcode Form} and
 * adding fields using {@linkcode withFields}.
 *
 * In case of large forms it can be beneficial to group fields into sections,
 * which are just different {@linkcode Form} composing a larger one. This can be
 * done using {@linkcode withSections}.
 *
 * For more complex cases where there are collections of forms where items can
 * be added and removed, and each item has its own set of editable fields, a
 * {@linkcode FormCollection} must be used to allow for items to be added and
 * removed. To conrol the interface for mutating the collection consider
 * extending {@link ReadOnlyFormCollection} instead.
 *
 * To add your own form collections to a form use {@linkcode withSectionsCollection}
 * as this will perform the same operation as {@linkcode withSections} only that
 * you have control over the underlying form collection. Any changes to the
 * collection are reflected on the form as well.
 *
 * All fields and sections that are added with any of the mentioned methods are
 * available through the {@linkcode fields} and {@linkcode sections} properties.
 *
 * #### Validation
 *
 * Validation is one of the best examples for change propagation and is offered
 * out of the box. Whenever a field becomes invalid, the entire form becomes
 * invalid.
 *
 * This applies to form sections as well, whenever a section collection is
 * invalid, the form (parent node) becomes invalid, and finally, when a form
 * becomes invalid, the form collection it was added to also becomes invalid.
 *
 * With this, the propagation can be seen clearly as validity is determined
 * completely by the status of each component of the entire form, from all levels.
 * Any change in one of the nodes goes all the way up to the root node making it
 * very easy to check if the entire form is valid or not, and later on checking
 * which sections or fields are invalid.
 *
 * Multiple validators can be added and upon any change that is notified by the
 * target invokes them until the first validator returns an error message. E.g.:
 * if a field is required and has 2nd validator for checking the length of the
 * content, the 2nd validator will only be invoked when the 1st one passes, when
 * the field has an actual value.
 *
 * This allows for granular validation messages as well as reusing them across
 * {@linkcode IValidatable} objects.
 *
 * For more complex cases when the validity of one field is dependent on the
 * value of another field, such as the start date/end date pair, then validation
 * triggers can be configured so that when either field changes the validators
 * are invoked. This is similar in a way to how dependencies work on a ReactJS
 * hook.
 *
 * All form components have a `validation` property where configuraiton can be
 * made, check {@linkcode validation} for more information.
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
 * for validation results.
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
 *
 * @see {@linkcode FormField}
 * @see {@linkcode ReadOnlyFormCollection}
 * @see {@linkcode FormCollection}
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
     *
     * @guidance Inline Configuration
     *
     * In most cases, validation rules do not change across the life-cycle of an entity thus it can be done in the
     * constructor to ensure it always configured and always the same. The library does make a distinction between
     * form structure and configuration, see the remarks on {@linkcode Form} for more information about this.
     *
     * The following sample uses the classic start/end date pair example as it includes both individual field
     * validation as well as a dependency between two fields.
     *
     * ```ts
     * class DatePairForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.startDate = new FormField<Date | null>({
     *         name: 'startDate',
     *         initialValue: null,
     *         validators: [required]
     *       }),
     *       this.endDate = new FormField<Date | null>({
     *         name: 'endDate',
     *         initialValue: null,
     *         validators: [
     *           required,
     *           () => (
     *             // This validator only gets called if required passes
     *             this.startDate.value && this.startDate.value < this.endDate.value!
     *               ? 'End date must be after the start date'
     *               : undefined
     *           )
     *         ],
     *         // If the start date changes, the end date may become invalid
     *         validationTriggers: [
     *           this.startDate
     *         ]
     *       })
     *     )
     *   }
     *
     *   public readonly startDate: FormField<Date | null>;
     *   public readonly endDate: FormField<Date | null>;
     * }
     *
     * function required(formField: FormField<any>): string | undefined {
     *   if (
     *     formField.value === null
     *     || formField.value === undefined
     *     || formField.value === ''
     *   )
     *     return 'Required';
     *   else
     *     return;
     * }
     * ```
     * 
     * This covers most cases, however there are scenarios where fields have interdependencies. For this,
     * validation can only be configured after both have been initialized. For instance, if start date
     * should show a validation error when it is past the end date, this can only be done by configuring
     * validation after both fields have been initialized.
     *
     * @guidance Configuring Validation
     *
     * All for components have expose a `validation` property allowing for validation to be configured at that level,
     * for more info check {@linkcode ReadOnlyFormCollection.validation} and {@linkcode FormField.validation}.
     *
     * Consider a form having three amount fields, two representing the price of two individual items and the third
     * representing the total as a way to check the inputs.
     *
     * Validation can be configured in two ways, one is by providing the validators and validation triggers to the
     * field when being initialized. The other is to configure the validation after form initialization.
     *
     * The end result is the same, both approaches configure the {@link IObjectValidator} for the form component
     * which can later be changed, more validators can be added or even removed.
     *
     * ```ts
     * class PriceForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.item1Price = new FormField<number | null>({
     *         name: 'item1Price',
     *         initialValue: null
     *       }),
     *       this.item2Price = new FormField<number | null>({
     *         name: 'item2Price',
     *         initialValue: null
     *       }),
     *       this.total = new FormField<number | null>({
     *         name: 'total',
     *         initialValue: null
     *       })
     *     );
     *   }
     *
     *   public readonly item1Price: FormField<number | null>;
     *   public readonly item2Price: FormField<number | null>;
     *   public readonly total: FormField<number | null>;
     * }
     *
     * const form = new PriceForm();
     *
     * form.total
     *   .validation
     *   .add(total => (
     *      total.value !== (form.item1Price.value || 0) + (form.item2Price.value || 0)
     *        ? 'It does not add up'
     *        : null
     *   )
     *   .triggers
     *   .add(form.item1Price)
     *   .add(form.item2Price);
     * ```
     *
     * The validity of the `total` field is based on the individual prices of each item, whenever one of them
     * changes we need to recheck the validity of the `total` thus they act as triggers.
     *
     * A rule of thumb is to treat validation triggers the same as a ReactJS hook dependency, if they are part
     * of the validator then they should also be triggers.
     *
     * @guidance Collection Item Triggers
     *
     * While the example above showcases how to configure validation, the scenario does not cover for having any
     * number of items whose total must add up. For cases such as these a collection would be needed.
     *
     * Any changes to the collection where items are added or removed, or when part of the individual items
     * change a validation should be triggered. Other examples for this use case are checking uniqueness of fields,
     * such as a code, in a list of items.
     *
     * The following snippet shows the form using a collection of items that have individual amounts that need
     * to add up to the specified total. For simplicity, {@linkcode FormCollection} is used directly for the items
     * instead of defining a custom collection, for more information see {@linkcode withSectionsCollection}.
     *
     * ```ts
     * class OrderCheckingForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.total = new FormField<number | null>({
     *         name: 'total',
     *         initialValue: null
     *       })
     *     );
     *     this.withSectionsCollection(
     *       this.items = new FormCollection<OrderItem>()
     *     );
     *   }
     *
     *   public readonly total: FormField<number | null>;
     *
     *   public readonly items: FormCollection<OrderItem>;
     * }
     *
     * class OrderItem extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.amount = new FormField<number | null>({
     *         name: 'amount',
     *         initialValue: null
     *       })
     *     );
     *   }
     *
     *   public readonly amount: FormField<number | null, string>;
     * }
     *
     * const form = new OrderCheckingForm();
     *
     * form.total
     *   .validation
     *   .add(total => {
     *     const calcualted = form.items.reduce(
     *       (total, item) => total + (item.amount.value || 0),
     *       0
     *     );
     *
     *     if (total.value !== calcualted)
     *       return 'It does not add up';
     *     else
     *       return;
     *   })
     *   .triggers
     *   .add([form.items, item => item.amount]);
     * ```
     *
     * The {@linkcode WellKnownValidationTrigger} covers most, if not all, validation trigger scenarios,
     * each gets mapped to a concrete {@linkcode ValidationTrigger} and it should be a rare case where
     * a custom one should be implemented. Check the source code for samples on how to write your own
     * custom validation trigger.
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
     *
     * @guidance Defining a Form
     *
     * This method adds the provided fields to the form, a necessary step to watch the form fields for
     * changes as well as their validity. The {@linkcode isValid} and {@linkcode isInvalid} properties
     * are dependent on the fields.
     *
     * ```ts
     * class MyForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.name = new FormField({
     *         name: 'name',
     *         initialValue: ''
     *       })
     *     );
     *   }
     *
     *   public readonly name: FormField<string>;
     * }
     * ```
     *
     * @see {@linkcode withSections}
     * @see {@linkcode withSectionsCollection}
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
     *
     * @guidance Splitting a Form into Sections
     *
     * In some cases the form that is being edited is rather large and having all fields put together would
     * make the code hard to follow. It is natural to want to group fields together in such cases as it
     * provides a way to clearly group related fields together and even reuse parts of a form.
     *
     * Adding sections to a form is done similar to how fields are done, any form section is itself a form.
     *
     * ```ts
     * class MyForm extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withSections(
     *       this.first = new MyFirstSection(),
     *       this.second = new MySecondSection()
     *     );
     *   }
     *
     *   public readonly first: MyFirstSection;
     *
     *   public readonly second: MySecondSection;
     * }
     *
     * class MyFirstSection extends Form {
     *   // ...
     * }
     *
     * class MySecondSection extends Form {
     *   // ...
     * }
     * ```
     *
     * This will propagate any changes from the individual sections to the form itself making it easy
     * to check the validity of the entire form.
     *
     * @see {@linkcode withFields}
     * @see {@linkcode withSectionsCollection}
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
     * @guidance Collections of Editable Items
     *
     * One usecase for sections is to split the form up and group fields together to make it easier to understand
     * and maintain.
     *
     * The other usecase is for more complex forms where there are lists of items that themselves are editable, but
     * also the list itself, items can be added or removed. Things like a todo list, or tables with a number of fields.
     *
     * For full control on how items are added to the collection, extend from {@linkcode ReadOnlyFormCollection}, this
     * requires that methods for adding and removing items need to be defined, all standard mutating methods are available
     * as protected from the base class.
     *
     * ```ts
     * class ToDoList extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.name = new FormField({
     *         name: 'name',
     *         initialValue: ''
     *       })
     *     )
     *
     *     this.withSectionsCollection(
     *       this.items = new ToDoItemsCollection()
     *     );
     *   }
     *
     *   public readonly name: FormField<string>;
     *
     *   public readonly items: ToDoItemsCollection
     * }
     *
     * class ToDoItemsCollection extends ReadOnlyFormCollection<ToDoItem> {
     *   public add(): ToDoItem {
     *     const item = new ToDoItem();
     *     this.push(item);
     *
     *     return item;
     *   }
     *
     *   public remove(item: ToDoItem): void {
     *     const itemIndex = this.indexOf(item);
     *     if (itemIndex >= 0)
     *         this.splice(itemIndex, 1);
     *   }
     * }
     *
     * class ToDoItem extends Form {
     *   public constructor() {
     *     super();
     *
     *     this.withFields(
     *       this.description = new FormField({
     *         name: 'name',
     *         initialValue: ''
     *       })
     *     );
     *   }
     *
     *   public readonly description: FormField<string>;
     * }
     * ```
     *
     * @see {@linkcode withFields}
     * @see {@linkcode withSections}
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