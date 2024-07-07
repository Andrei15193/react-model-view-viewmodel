import type { INotifyPropertiesChanged, IPropertiesChangedEventHandler } from '../viewModels';
import type { INotifyCollectionChanged, INotifyCollectionReordered, INotifySetChanged, INotifyMapChanged, ICollectionChangedEventHandler, ICollectionReorderedEventHandler, ISetChangedEventHandler, IMapChangedEventHandler } from '../collections';

export type IValidationTrigger = INotifyPropertiesChanged | INotifyCollectionChanged<unknown> | INotifyCollectionReordered<unknown> | INotifySetChanged<unknown> | INotifyMapChanged<unknown, unknown>;

export interface IValidationTriggerEventHandlers<TKey = unknown, TItem = unknown> {
    readonly propertiesChanged?: IPropertiesChangedEventHandler<INotifyPropertiesChanged>;

    readonly collectionChanged?: ICollectionChangedEventHandler<INotifyCollectionChanged<TItem>, TItem>;
    readonly collectionReordered?: ICollectionReorderedEventHandler<INotifyCollectionReordered<TItem>, TItem>;

    readonly setChanged?: ISetChangedEventHandler<INotifySetChanged<TItem>, TItem>;
    readonly mapChanged?: IMapChangedEventHandler<INotifyMapChanged<TItem, TKey>, TKey, TItem>;
}

export function subscribeToValidationTrigger<TKey = unknown, TItem = unknown>(validationTrigger: IValidationTrigger, eventHandlers: IValidationTriggerEventHandlers<TKey, TItem>): void {
    let isSpecialized = false;

    if (!!eventHandlers.collectionChanged && 'collectionChanged' in validationTrigger) {
        isSpecialized = true;
        validationTrigger.collectionChanged.subscribe(eventHandlers.collectionChanged);
    }
    if (!!eventHandlers.collectionReordered && 'collectionReordered' in validationTrigger) {
        isSpecialized = true;
        validationTrigger.collectionReordered.subscribe(eventHandlers.collectionReordered);
    }

    if (!!eventHandlers.setChanged && 'setChanged' in validationTrigger) {
        isSpecialized = true;
        validationTrigger.setChanged.subscribe(eventHandlers.setChanged);
    }

    if (!!eventHandlers.mapChanged && 'mapChanged' in validationTrigger) {
        isSpecialized = true;
        validationTrigger.mapChanged.subscribe(eventHandlers.mapChanged);
    }

    if (!isSpecialized && !!eventHandlers.propertiesChanged && 'propertiesChanged' in validationTrigger)
        validationTrigger.propertiesChanged.subscribe(eventHandlers.propertiesChanged)
}

export function unsubscribeFromValidationTrigger<TKey = unknown, TItem = unknown>(validationTrigger: IValidationTrigger, eventHandlers: IValidationTriggerEventHandlers<TKey, TItem>): void {
    if ('propertiesChanged' in validationTrigger && !!eventHandlers.propertiesChanged)
        validationTrigger.propertiesChanged.unsubscribe(eventHandlers.propertiesChanged)

    if ('collectionChanged' in validationTrigger && !!eventHandlers.collectionChanged)
        validationTrigger.collectionChanged.unsubscribe(eventHandlers.collectionChanged);
    if ('collectionReordered' in validationTrigger && !!eventHandlers.collectionReordered)
        validationTrigger.collectionReordered.unsubscribe(eventHandlers.collectionReordered);

    if ('setChanged' in validationTrigger && !!eventHandlers.setChanged)
        validationTrigger.setChanged.unsubscribe(eventHandlers.setChanged);

    if ('mapChanged' in validationTrigger && !!eventHandlers.mapChanged)
        validationTrigger.mapChanged.unsubscribe(eventHandlers.mapChanged);
}