import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObservableCollection.toReversed', (): void => {
    it('reversing an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.slice().reverse(),
                applyCollectionOperation: collection => collection.toReversed()
            },

            expectedResult: []
        });
    });

    it('reversing a collection returns an array containing the same items in reverse order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.slice().reverse(),
                applyCollectionOperation: collection => collection.toReversed()
            },

            expectedResult: [3, 2, 1]
        });
    });

    it('calling toReversed while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.toReversed();
            })
            .not
            .toThrow();
    });
});