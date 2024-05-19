import type { IPropertiesChangedEventHandler } from '../../../../viewModels';
import type { ICollectionChangedEventHandler } from '../../ICollectionChangedEventHandler';
import type { IObservableCollection } from '../../IObservableCollection';
import { ObservableCollection } from '../../ObservableCollection';
import { expectCollectionsToBeEqual } from './expectCollectionsToBeEqual';

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
    let collectionChangedRaiseCount = 0;
    const collectionChangedEventHandler: ICollectionChangedEventHandler<ObservableCollection<TItem>, TItem> = {
        handle() {
            collectionChangedRaiseCount++;
        }
    }
    let propertiesChangedRaiseCount = 0;
    const propertiesChangedEventHandler: IPropertiesChangedEventHandler<ObservableCollection<TItem>> = {
        handle() {
            propertiesChangedRaiseCount++;
        }
    }

    const arrayBeforeOperation = initialState.slice();
    const observableCollectionBeforeOperation = new ObservableCollection<TItem>(...initialState);
    observableCollectionBeforeOperation.collectionChanged.subscribe(collectionChangedEventHandler);
    observableCollectionBeforeOperation.propertiesChanged.subscribe(propertiesChangedEventHandler);

    const arrayAfterOperation = initialState.slice();
    const observableCollectionAfterOperation = new ObservableCollection<TItem>(...initialState);
    observableCollectionAfterOperation.collectionChanged.subscribe(collectionChangedEventHandler);
    observableCollectionAfterOperation.propertiesChanged.subscribe(propertiesChangedEventHandler);

    expectCollectionsToBeEqual(observableCollectionBeforeOperation, arrayBeforeOperation);
    expectCollectionsToBeEqual(observableCollectionAfterOperation, arrayAfterOperation);

    const arrayResult = typeof applyOperation === 'function' ? applyOperation(arrayAfterOperation) : applyOperation.applyArrayOperation(arrayAfterOperation);
    const observableCollectionResult = typeof applyOperation === 'function' ? applyOperation(observableCollectionAfterOperation) : applyOperation.applyCollectionOperation(observableCollectionAfterOperation);

    expectCollectionsToBeEqual(observableCollectionAfterOperation, initialState);
    expect(observableCollectionResult).toEqual(expectedResult);

    expect(collectionChangedRaiseCount).toBe(0);
    expect(propertiesChangedRaiseCount).toBe(0);

    expectCollectionsToBeEqual(observableCollectionAfterOperation, arrayAfterOperation);
    expect(observableCollectionResult).toEqual(arrayResult);

    expect(arrayAfterOperation).toEqual(arrayBeforeOperation);
    expect(observableCollectionAfterOperation).toEqual(observableCollectionBeforeOperation);
}