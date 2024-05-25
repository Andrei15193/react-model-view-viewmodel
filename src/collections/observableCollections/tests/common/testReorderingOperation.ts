import type { CollectionReorderOperation } from '../../ICollectionReorder';
import type { IObservableCollection } from '../../IObservableCollection';
import { ObservableCollection } from '../../ObservableCollection';
import { expectCollectionsToBeEqual } from './expectCollectionsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestReorderingOperationOptions<TItem> {
    readonly collectionOperation: CollectionReorderOperation;
    readonly initialState: readonly TItem[];
    readonly changedProperties: readonly ('length' | number)[];

    readonly applyOperation: ((collection: TItem[] | IObservableCollection<TItem>) => unknown) | {
        applyArrayOperation(array: TItem[]): unknown;
        applyCollectionOperation(colleciton: IObservableCollection<TItem>): unknown;
    }

    readonly expectedCollection: readonly TItem[];
    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both an array and an observable collection constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking the result of the operation.
 *
 * An observable collection provides all relevant methods that are exposed by a native Array thus the
 * two need to behave the same.
 *
 * The approach is that any operation that is applied on an observable collection can be replicated iterating
 * the event arguments and setting the items.
 */
export function testReorderingOperation<TItem>({ collectionOperation, initialState, changedProperties, expectedCollection: expectedCollection, applyOperation, expectedResult }: ITestReorderingOperationOptions<TItem>) {
    let propertiesChangedRaiseCount = 0;
    let collectionChangedRaiseCount = 0;
    let collectionReorderedRaiseCount = 0;
    let actualChangedProperties: readonly (keyof ObservableCollection<TItem>)[] = [];

    const array = initialState.slice();
    const observableCollection = new ObservableCollection<TItem>(...initialState);
    observableCollection.propertiesChanged.subscribe({
        handle(subject, changedProperties) {
            propertiesChangedRaiseCount++;

            expect(subject).toStrictEqual(observableCollection);
            actualChangedProperties = changedProperties;
        }
    });
    observableCollection.collectionChanged.subscribe({
        handle() {
            collectionChangedRaiseCount++;
        }
    });
    observableCollection.collectionReordered.subscribe({
        handle(subject, { operation, movedItems }) {
            collectionReorderedRaiseCount++;

            expect(subject).toStrictEqual(observableCollection);
            expect(operation).toEqual(collectionOperation);

            const copyArray = initialState.slice();
            movedItems.forEach(({ currentIndex, currentItem }) => {
                copyArray[currentIndex] = currentItem;
            });

            expectCollectionsToBeEqual(observableCollection, copyArray);
        }
    });

    expectCollectionsToBeEqual(observableCollection, array);

    const arrayResult = typeof applyOperation === 'function' ? applyOperation(array) : applyOperation.applyArrayOperation(array);
    const observableCollectionResult = typeof applyOperation === 'function' ? applyOperation(observableCollection) : applyOperation.applyCollectionOperation(observableCollection);

    expectCollectionsToBeEqual(observableCollection, expectedCollection);
    expect(observableCollectionResult).toEqual(expectedResult === selfResult ? observableCollection : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(1);
    expect(collectionChangedRaiseCount).toBe(0);
    expect(collectionReorderedRaiseCount).toBe(1);
    expect(actualChangedProperties).toEqual(changedProperties);

    expectCollectionsToBeEqual(observableCollection, array);
    expect(arrayResult).toEqual(expectedResult === selfResult ? array : expectedResult);
}