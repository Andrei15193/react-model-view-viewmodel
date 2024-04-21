import type { CollectionOperation } from "../../../src/events";
import { type IObservableCollection, ObservableCollection } from "../../../src/observable-collection";
import { expectCollectionsToBeEqual } from "./expectCollectionsToBeEqual";

export interface ITestMutatingOperationOptions<TItem> {
    readonly collectionOperation: CollectionOperation;
    readonly initialState: readonly TItem[];
    readonly changedProperties: readonly ("length" | number)[];

    applyOperation(collection: TItem[] | IObservableCollection<TItem>): unknown;
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
export function testMutatingOperation<TItem>({ collectionOperation, initialState, changedProperties, applyOperation }: ITestMutatingOperationOptions<TItem>) {
    let collectionChangedRaiseCount = 0;
    let propertiesChangedRaiseCount = 0;
    let actualChangedProperties: readonly (keyof ObservableCollection<TItem>)[] = [];

    const array = initialState.slice();
    const observableCollection = new ObservableCollection<TItem>(...initialState);
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
    observableCollection.propertiesChanged.subscribe({
        handle(subject, changedProperties) {
            propertiesChangedRaiseCount++;

            expect(subject).toStrictEqual(observableCollection);
            actualChangedProperties = changedProperties;
        }
    });

    expectCollectionsToBeEqual(observableCollection, array);

    const arrayResult = applyOperation(array);
    const observableCollectionResult = applyOperation(observableCollection);

    expect(collectionChangedRaiseCount).toBe(1);
    expect(propertiesChangedRaiseCount).toBe(1);
    expect(actualChangedProperties).toEqual(changedProperties);

    expectCollectionsToBeEqual(observableCollection, array);
    expect(observableCollectionResult).toBe(arrayResult);
}