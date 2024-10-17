import type { INotifyCollectionChanged, ICollectionChangedEventHandler, INotifyCollectionReordered, ICollectionReorderedEventHandler } from '../collections';
import { useEffect, useState } from 'react';

/**
 * Watches an observable collection for changes. The collection is the only hook dependency.
 * @template TObservableCollection The observable collection type.
 * @template TItem The type of items the collection contains.
 * @param observableCollection The collection to watch.
 * @returns Returns the provided observable collection.
 */
export function useObservableCollection<TObservableCollection extends INotifyCollectionChanged<TItem> | INotifyCollectionReordered<TItem> | null | undefined, TItem>(observableCollection: TObservableCollection): TObservableCollection {
    const [_, setState] = useState<unknown>(null);

    useEffect(
        () => {
            const collectionChangedEventHandler: ICollectionChangedEventHandler<INotifyCollectionChanged<TItem>, TItem> & ICollectionReorderedEventHandler<INotifyCollectionReordered<TItem>, TItem> = {
                handle() {
                    setState({});
                }
            }

            if (observableCollection !== null && observableCollection !== undefined) {
                if ('collectionChanged' in observableCollection)
                    observableCollection.collectionChanged.subscribe(collectionChangedEventHandler);
                if ('collectionReordered' in observableCollection)
                    observableCollection.collectionReordered.subscribe(collectionChangedEventHandler);
            }

            return () => {
                if (observableCollection !== null && observableCollection !== undefined) {
                    if ('collectionReordered' in observableCollection)
                        observableCollection.collectionReordered.unsubscribe(collectionChangedEventHandler);
                    if ('collectionChanged' in observableCollection)
                        observableCollection.collectionChanged.unsubscribe(collectionChangedEventHandler);
                }
            }
        },
        [observableCollection]
    );

    return observableCollection;
}