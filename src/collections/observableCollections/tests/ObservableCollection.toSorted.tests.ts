import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObservableCollection.toSorted', (): void => {
    it('sorting an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.toSorted(),

            expectedResult: []
        });
    });

    it('sorting a collection returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number | undefined | null>({
            initialState: [1, undefined, 2, 3, -1, undefined, 3, 100, null, 22, 11, 200, -100],

            applyOperation: collection => collection.toSorted(),

            expectedResult: [-1, -100, 1, 100, 11, 2, 200, 22, 3, 3, null, undefined, undefined]
        });
    });

    it('sorting a collection with a compare callback returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number | undefined>({
            initialState: [1, undefined, 2, 3],

            applyOperation: {
                applyArrayOperation: collection => collection.toSorted((left, right) => left! - right!),
                applyCollectionOperation: collection => collection.toSorted((left, right) => left - right)
            },

            expectedResult: [1, 2, 3, undefined]
        });
    });

    it('mutating the collection while sorting items breaks the operation', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2]);
                observableCollection.toSorted(() => {
                    observableCollection.pop();
                    return 0;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('calling toSorted while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.toSorted();
            })
            .not
            .toThrow();
    });
});