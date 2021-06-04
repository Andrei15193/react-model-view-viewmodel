import type { ICollectionChange, IEventHandler } from '../events';
import type { IReadOnlyObservableCollection } from '../observable-collection';
import { useEffect, useState } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Watches the collection for changes, requesting a render when it does. The collection is the only hook dependency.
 * @template TItem - The type of items the collection contains.
 * @param observableCollection - The collection to watch.
 */
export function watchCollection<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>): void {
    const [_, setState] = useState<readonly TItem[] | undefined>(undefined);

    useEffect(
        (): EffectResult => {
            if (observableCollection) {
                let previousItems: readonly TItem[] = [...observableCollection];

                const collectionChangedEventHandler: IEventHandler<ICollectionChange<TItem>> = {
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

function hasChanges<TItem>(previous: readonly TItem[], next: readonly TItem[]): boolean {
    return previous.length !== next.length || previous.some((item, index) => item !== next[index]);
}