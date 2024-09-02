import type { IConfigurableFormSectionCollection, FormSectionSetupCallback } from "./IConfigurableFormSectionCollection";
import type { FormViewModel } from "./FormViewModel";
import { ObservableCollection } from "../collections";

export class FormSectionCollection<TSection extends FormViewModel<TValidationError>, TValidationError = string> extends ObservableCollection<TSection> implements IConfigurableFormSectionCollection<TSection, TValidationError> {
    private readonly _setupCallbacks: FormSectionSetupCallback<TSection, TValidationError>[];

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

    public withItemSetup(setupCallback: FormSectionSetupCallback<TSection, TValidationError>): this {
        if (typeof setupCallback === 'function') {
            this._setupCallbacks.push(setupCallback);
            this.forEach(section => {
                setupCallback(section);
            });
        }

        return this;
    }

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
