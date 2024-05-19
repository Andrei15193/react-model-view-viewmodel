import type { ICollectionChangedEventHandler } from '../collections/observableCollections/ICollectionChangedEventHandler';
import type { IReadOnlyObservableCollection } from '../collections/observableCollections/IReadOnlyObservableCollection';
import { useEffect, useState } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Watches an obserable collection for changes, requesting a render when it does. The collection is the only hook dependency.
 * @template TItem The type of items the collection contains.
 * @param observableCollection The collection to watch.
 */
export function useObservableCollection<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>): void {
    const [_, setState] = useState<readonly TItem[] | undefined>(undefined);

    useEffect(
        (): EffectResult => {
            if (observableCollection) {
                let previousItems: readonly TItem[] = [...observableCollection];

                const collectionChangedEventHandler: ICollectionChangedEventHandler<IReadOnlyObservableCollection<TItem>, TItem> = {
                    handle(): void {
                        if (hasChanges(previousItems, observableCollection)) {
                            previousItems = [...observableCollection];
                            setState(previousItems);
                        }
                    }
                };

                observableCollection.collectionChanged.subscribe(collectionChangedEventHandler);
                return () => {
                    observableCollection.collectionChanged.unsubscribe(collectionChangedEventHandler);
                    setState(undefined);
                };
            }
        },
        [observableCollection]
    );
}

function hasChanges<TItem>(previous: readonly TItem[], next: IReadOnlyObservableCollection<TItem>): boolean {
    return previous.length !== next.length || previous.some((item, index) => item !== next.at(index));
}

/** Watches the collection for changes, requesting a render when it does. The collection is the only hook dependency.
 * @deprecated In future versions this hook will be removed, switch to {@link useObservableCollection}.
 * @template TItem The type of items the collection contains.
 * @param observableCollection The collection to watch.
 */
export function watchCollection<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>): void {
    useObservableCollection(observableCollection);
}