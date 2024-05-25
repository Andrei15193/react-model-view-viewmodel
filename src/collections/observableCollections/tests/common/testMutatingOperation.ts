import type { CollectionChangeOperation } from '../../ICollectionChange';
import type { IObservableCollection } from '../../IObservableCollection';
import { ObservableCollection } from '../../ObservableCollection';
import { expectCollectionsToBeEqual } from './expectCollectionsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestMutatingOperationOptions<TItem> {
    readonly collectionOperation: CollectionChangeOperation;
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
 * The approach is that any operation that is applied on an observable collection can be replicated using
 * just the splice method through the collectionChanged event.
 */
export function testMutatingOperation<TItem>({ collectionOperation, initialState, changedProperties, expectedCollection: expectedState, expectedResult, applyOperation }: ITestMutatingOperationOptions<TItem>) {
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
        handle(subject, { operation, startIndex, addedItems, removedItems }) {
            collectionChangedRaiseCount++;

            expect(subject).toStrictEqual(observableCollection);
            expect(operation).toEqual(collectionOperation);

            const spliceArray = initialState.slice();
            const spliceRemovedItems = spliceArray.splice(startIndex, removedItems.length, ...addedItems);

            expectCollectionsToBeEqual(observableCollection, spliceArray);
            expect(spliceRemovedItems).toEqual(removedItems);
        }
    });
    observableCollection.collectionReordered.subscribe({
        handle() {
            collectionReorderedRaiseCount++;
        }
    });

    expectCollectionsToBeEqual(observableCollection, array);

    const arrayResult = typeof applyOperation === 'function' ? applyOperation(array) : applyOperation.applyArrayOperation(array);
    const observableCollectionResult = typeof applyOperation === 'function' ? applyOperation(observableCollection) : applyOperation.applyCollectionOperation(observableCollection);

    expectCollectionsToBeEqual(observableCollection, expectedState);
    expect(observableCollectionResult).toEqual(expectedResult === selfResult ? observableCollection : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(1);
    expect(collectionChangedRaiseCount).toBe(1);
    expect(collectionReorderedRaiseCount).toBe(0);
    expect(actualChangedProperties).toEqual(changedProperties);

    expectCollectionsToBeEqual(observableCollection, array);
    expect(observableCollectionResult).toEqual(expectedResult === selfResult ? observableCollection : arrayResult);
}