import type { IPropertiesChangedEventHandler } from '../../../../viewModels';
import type { ICollectionChangedEventHandler } from '../../ICollectionChangedEventHandler';
import type { ICollectionReorderedEventHandler } from '../../ICollectionReorderedEventHandler';
import type { IObservableCollection } from '../../IObservableCollection';
import { ObservableCollection } from '../../ObservableCollection';
import { expectCollectionsToBeEqual } from './expectCollectionsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestBlankMutatingOperationOptions<TItem> {
    readonly initialState: readonly TItem[];

    readonly applyOperation: ((collection: TItem[] | IObservableCollection<TItem>) => unknown) | {
        applyArrayOperation(array: TItem[]): unknown;
        applyCollectionOperation(colleciton: IObservableCollection<TItem>): unknown;
    };

    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both an array and an observable collection constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking that the operation had
 * no effect and no events were raised.
 */
export function testBlankMutatingOperation<TItem>({ initialState, applyOperation, expectedResult }: ITestBlankMutatingOperationOptions<TItem>) {
    let propertiesChangedRaiseCount = 0;
    const propertiesChangedEventHandler: IPropertiesChangedEventHandler<ObservableCollection<TItem>> = {
        handle() {
            propertiesChangedRaiseCount++;
        }
    };
    let collectionChangedRaiseCount = 0;
    const collectionChangedEventHandler: ICollectionChangedEventHandler<ObservableCollection<TItem>, TItem> = {
        handle() {
            collectionChangedRaiseCount++;
        }
    };
    let collectionReorderedRaiseCount = 0;
    const collectionReorderedEventHandler: ICollectionReorderedEventHandler<ObservableCollection<TItem>, TItem> = {
        handle() {
            collectionReorderedRaiseCount++;
        }
    };

    const arrayBeforeOperation = initialState.slice();
    const observableCollectionBeforeOperation = new ObservableCollection<TItem>(...initialState);
    observableCollectionBeforeOperation.propertiesChanged.subscribe(propertiesChangedEventHandler);
    observableCollectionBeforeOperation.collectionChanged.subscribe(collectionChangedEventHandler);
    observableCollectionBeforeOperation.collectionReordered.subscribe(collectionReorderedEventHandler);

    const arrayAfterOperation = initialState.slice();
    const observableCollectionAfterOperation = new ObservableCollection<TItem>(...initialState);
    observableCollectionAfterOperation.propertiesChanged.subscribe(propertiesChangedEventHandler);
    observableCollectionAfterOperation.collectionChanged.subscribe(collectionChangedEventHandler);
    observableCollectionAfterOperation.collectionReordered.subscribe(collectionReorderedEventHandler);

    expectCollectionsToBeEqual(observableCollectionBeforeOperation, arrayBeforeOperation);
    expectCollectionsToBeEqual(observableCollectionAfterOperation, arrayAfterOperation);

    const arrayResult = typeof applyOperation === 'function' ? applyOperation(arrayAfterOperation) : applyOperation.applyArrayOperation(arrayAfterOperation);
    const observableCollectionResult = typeof applyOperation === 'function' ? applyOperation(observableCollectionAfterOperation) : applyOperation.applyCollectionOperation(observableCollectionAfterOperation);

    expectCollectionsToBeEqual(observableCollectionAfterOperation, initialState);
    expect(observableCollectionResult).toEqual(expectedResult === selfResult ? observableCollectionAfterOperation : expectedResult);

    expect(collectionChangedRaiseCount).toBe(0);
    expect(propertiesChangedRaiseCount).toBe(0);

    expectCollectionsToBeEqual(observableCollectionAfterOperation, arrayAfterOperation);
    expect(observableCollectionResult).toEqual(expectedResult === selfResult ? observableCollectionAfterOperation : arrayResult);

    expect(arrayAfterOperation).toEqual(arrayBeforeOperation);
    expect(observableCollectionAfterOperation).toEqual(observableCollectionBeforeOperation);
}