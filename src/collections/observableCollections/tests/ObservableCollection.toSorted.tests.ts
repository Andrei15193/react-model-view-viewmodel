import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.toSorted', (): void => {
    it('sorting an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.toSorted(),

            expectedResult: []
        });
    });

    it('sorting a collection returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, undefined, 2, 3, -1, undefined, 3, 100, null, 22, 11, 200, -100],

            applyOperation: collection => collection.toSorted(),

            expectedResult: [-1, -100, 1, 100, 11, 2, 200, 22, 3, 3, null, undefined, undefined]
        });
    });

    it('sorting a collection with a compare callback returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, undefined, 2, 3],

            applyOperation: collection => collection.toSorted((left, right) => left - right),

            expectedResult: [1, 2, 3, undefined]
        });
    });

    it('calling toSorted while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.toSorted();
            })
            .not
            .toThrow();
    });
});