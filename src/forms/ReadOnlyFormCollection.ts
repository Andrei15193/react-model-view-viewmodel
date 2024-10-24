import type { IPropertiesChangedEventHandler } from '../viewModels';
import type { Form } from './Form';
import type { FormSetupCallback } from './IConfigurableFormCollection';
import type { IReadOnlyFormCollection } from './IReadOnlyFormCollection';
import { ObjectValidator, type IObjectValidator, type IValidatable } from '../validation';
import { ReadOnlyObservableCollection } from '../collections';

/**
 * Represents a configurable read-only observable collection of form sections. Callbacks can be configured for setting
 * up individual form sections for cases where validation and other aspects are based on the state of an entity or the
 * form itself.
 *
 * @template TForm The concrete type of the form section.
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
 */
export class ReadOnlyFormCollection<TForm extends Form<TValidationError>, TValidationError = string> extends ReadOnlyObservableCollection<TForm> implements IReadOnlyFormCollection<TForm, TValidationError>, IValidatable<TValidationError> {
    private _error: TValidationError | null;
    private readonly _setupCallbacks: FormSetupCallback<TForm, TValidationError>[];

    /**
     * Initializes a new instance of the {@linkcode ReadOnlyFormCollection} class.
     * @param sections The sections to initialize the collection with.
     */
    public constructor(sections?: Iterable<TForm>) {
        super(sections);

        this._setupCallbacks = [];
        this.validation = new ObjectValidator<this, TValidationError>({
            target: this,
            shouldTargetTriggerValidation: (_, changedProperties) => {
                return this.onShouldTriggerValidation(changedProperties);
            }
        });

        const sectionChangedEventHandler: IPropertiesChangedEventHandler<Form<TValidationError>> = {
            handle: this.onSectionChanged.bind(this)
        };
        this.forEach(section => {
            section.propertiesChanged.subscribe(sectionChangedEventHandler);
        });
        this.collectionChanged.subscribe({
            handle: (_, { addedItems: addedSections, removedItems: removedSections }) => {
                removedSections.forEach(removedSection => {
                    removedSection.propertiesChanged.unsubscribe(sectionChangedEventHandler);
                    removedSection.reset();
                });

                addedSections.forEach(addedSection => {
                    addedSection.propertiesChanged.subscribe(sectionChangedEventHandler);
                    this._setupCallbacks.forEach(setupCallback => {
                        setupCallback(addedSection);
                    });
                });

                this.notifyPropertiesChanged('isValid', 'isInvalid');
            }
        });
        this._setupSections();
    }

    /**
     * Gets the validation configuration for the form. Fields have their own individual validation config as well.
     * 
     * @see {@linkcode Form.validation}
     */
    readonly validation: IObjectValidator<this, TValidationError>;

    /**
     * A flag indicating whether the section collection is valid.
     *
     * A section collection is valid only when itself is valid and all contained sections are valid.
     */
    public get isValid(): boolean {
        return this._error === null && this.every(section => section.isValid);
    }

    /**
     * A flag indicating whether the section collection is invalid.
     *
     * A section collection is invalid when itself is invalid or any contained sections is invalid.
     */
    public get isInvalid(): boolean {
        return this._error !== null || this.some(section => section.isInvalid);
    }

    /**
     * Gets or sets the error message when the section collection is invalid.
     */
    public get error(): TValidationError | null {
        return this._error;
    }

    /**
     * Gets or sets the error message when the section collection is invalid.
     */
    public set error(value: TValidationError | false | null | undefined) {
        const normalizedError = (value === false || value === null || value === undefined) ? null : value;

        if (this._error !== normalizedError) {
            this._error = normalizedError;
            this.notifyPropertiesChanged('error', 'isValid', 'isInvalid');
        }
    }

    /**
     * Configures the provided `setupCallback` and applies it on all existing form sections within the collection
     * and to any form section that is added.
     * @param setupCallback The callback performing the setup.
     */
    public withItemSetup(setupCallback: FormSetupCallback<TForm, TValidationError>): this {
        if (typeof setupCallback === 'function') {
            this._setupCallbacks.push(setupCallback);
            this.forEach(section => {
                setupCallback(section);
            });
        }

        return this;
    }

    /**
     * Removes the provided `setupCallback` and no longer applies it to form sections that are added, all existing
     * form sections are reset and re-configured using the remaining setup callbacks.
     * @param setupCallback The callback performing the setup.
     */
    public withoutItemSetup(setupCallback: FormSetupCallback<TForm, TValidationError>): this {
        if (typeof setupCallback === 'function') {
            const setupCallbackIndex = this._setupCallbacks.indexOf(setupCallback);
            if (setupCallbackIndex > 0) {
                this._setupCallbacks.splice(setupCallbackIndex, 1);
                this.forEach(section => section.reset());
                this._setupSections();
            }
        }

        return this;
    }

    /**
     * Clears all setup callbacks and resets all existing form sections.
     */
    public clearItemSetups(): void {
        this._setupCallbacks.splice(0, Number.POSITIVE_INFINITY);
        this.forEach(section => section.reset());
    }

    /**
     * Resets the form, contained fields and sections to their initial configuration.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    public reset(): void {
        this._setupCallbacks.splice(0, Number.POSITIVE_INFINITY);
        this.forEach(section => section.reset());
        this.validation.reset();
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

    private _setupSections(): void {
        this.forEach(section => {
            this._setupCallbacks.forEach(setupCallback => setupCallback(section));
        });
    }
}