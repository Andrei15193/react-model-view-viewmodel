import type { IPropertiesChangedEventHandler } from '../viewModels';
import type { IReadOnlyFormSectionCollection } from './IReadOnlyFormSectionCollection';
import { type IReadOnlyObservableCollection, type IObservableCollection, type ICollectionChangedEventHandler, type ICollectionReorderedEventHandler, ObservableCollection, ReadOnlyObservableCollection } from '../collections';
import { type IObjectValidator, Validatable, ObjectValidator } from '../validation';
import { FormFieldViewModel } from './FormFieldViewModel';
import { FormSectionCollection } from './FormSectionCollection';

export class FormViewModel<TValidationError = string> extends Validatable<TValidationError> {
    private readonly _fields: AggregateObservableCollection<FormFieldViewModel<unknown, TValidationError>>;
    private readonly _sections: AggregateObservableCollection<FormViewModel<TValidationError>, IReadOnlyFormSectionCollection<FormViewModel<TValidationError>, TValidationError>>;

    public constructor() {
        super();

        this.validation = new ObjectValidator<this, TValidationError>({
            target: this,
            shouldTargetTriggerValidation: (_, changedProperties) => {
                return this.onShouldTriggerValidation(changedProperties);
            }
        });
        this.fields = this._fields = new AggregateObservableCollection<FormFieldViewModel<unknown, TValidationError>>();
        this.sections = this._sections = new AggregateObservableCollection<FormViewModel<TValidationError>, IReadOnlyFormSectionCollection<FormViewModel<TValidationError>, TValidationError>>();

        const fieldChangedEventHandler: IPropertiesChangedEventHandler<FormFieldViewModel<unknown, TValidationError>> = {
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

        const sectionChangedEventHandler: IPropertiesChangedEventHandler<FormViewModel<TValidationError>> = {
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

    public readonly validation: IObjectValidator<this, TValidationError>;

    public readonly fields: IReadOnlyObservableCollection<FormFieldViewModel<unknown, TValidationError>>;

    public readonly sections: IReadOnlyObservableCollection<FormViewModel<TValidationError>>;

    public get isValid(): boolean {
        return (
            super.isValid
            && this.fields.every(field => field.isValid)
            && this.sections.every(section => section.isValid)
        );
    }

    public get isInvalid(): boolean {
        return (
            super.isInvalid
            || this.fields.some(field => field.isInvalid)
            || this.sections.some(section => section.isInvalid)
        );
    }

    public reset(): void {
        this._sections.aggregatedCollections.forEach(sectionsCollection => {
            sectionsCollection.clearItemSetups();
        })
        this.fields.forEach(field => field.reset());
        this.validation.reset();
    }

    protected withFields<TField extends FormFieldViewModel<unknown, TValidationError> = FormFieldViewModel<unknown, TValidationError>>(...fields: readonly TField[]): IObservableCollection<TField> {
        const fieldsCollection = new ObservableCollection<TField>(fields);
        this._fields.aggregatedCollections.push(fieldsCollection);

        return fieldsCollection;
    }

    protected withSections<TSection extends FormViewModel<TValidationError> = FormViewModel<TValidationError>>(...sections: readonly TSection[]): FormSectionCollection<TSection, TValidationError> {
        return this.withSectionsCollection(new FormSectionCollection<TSection, TValidationError>(sections));
    }

    protected withSectionsCollection<TSectionCollection extends IReadOnlyFormSectionCollection<TSection, TValidationError>, TSection extends FormViewModel<TValidationError> = FormViewModel<TValidationError>>(sectionsCollection: TSectionCollection): TSectionCollection {
        this._sections.aggregatedCollections.push(sectionsCollection);

        return sectionsCollection;
    }

    protected onFieldChanged(field: FormFieldViewModel<unknown, TValidationError>, changedProperties: readonly (keyof FormFieldViewModel<unknown, TValidationError>)[]) {
        if (changedProperties.some(changedProperty => changedProperty === "isValid" || changedProperty === "isInvalid"))
            this.notifyPropertiesChanged("isValid", "isInvalid");
    }

    protected onSectionChanged(field: FormViewModel<TValidationError>, changedProperties: readonly (keyof FormViewModel<TValidationError>)[]) {
        if (changedProperties.some(changedProperty => changedProperty === "isValid" || changedProperty === "isInvalid"))
            this.notifyPropertiesChanged("isValid", "isInvalid");
    }

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