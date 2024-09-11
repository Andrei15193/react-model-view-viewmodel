import { ReadOnlyObservableCollection } from '../collections';
import type { FormViewModel } from './FormViewModel';
import type { IConfigurableFormSectionCollection, FormSectionSetupCallback } from './IConfigurableFormSectionCollection';

/**
 * Represents a configurable read-only observable collection of form sections. Callbacks can be configured for setting
 * up individual form sections for cases where validation and other aspects are based on the state of an entity or the
 * form itself.
 *
 * @template TSection the concrete type of the form section.
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export class ReadOnlyFormSectionCollection<TSection extends FormViewModel<TValidationError>, TValidationError = string> extends ReadOnlyObservableCollection<TSection> implements IConfigurableFormSectionCollection<TSection, TValidationError> {
    private readonly _setupCallbacks: FormSectionSetupCallback<TSection, TValidationError>[];
    /**
     * Initializes a new instance of the {@link FormSectionCollection} class.
     * @param sections The sections to initialize the collection with.
     */
    public constructor(sections?: Iterable<TSection>) {
        super(sections);

        this._setupCallbacks = [];
        this.collectionChanged.subscribe({
            setupCallbacks: this._setupCallbacks,
            handle(_, { addedItems: addedSections }) {
                addedSections.forEach(addedSection => {
                    this.setupCallbacks.forEach(setupCallback => {
                        setupCallback(addedSection);
                    });
                });
            }
        });
        this._setupSections();
    }

    /**
     * Configures the provided `setupCallback` and applies it on all existing form sections within the collection
     * and to any form section that is added.
     * @param setupCallback The callback performing the setup.
     */
    public withItemSetup(setupCallback: FormSectionSetupCallback<TSection, TValidationError>): this {
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
    public withoutItemSetup(setupCallback: FormSectionSetupCallback<TSection, TValidationError>): this {
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
        this._setupCallbacks.splice(0, this._setupCallbacks.length);
        this.forEach(section => section.reset());
    }

    private _setupSections(): void {
        this.forEach(section => {
            this._setupCallbacks.forEach(setupCallback => setupCallback(section));
        });
    }
}