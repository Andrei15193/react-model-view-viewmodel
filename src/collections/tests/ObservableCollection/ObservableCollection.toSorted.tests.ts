import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.toSorted', (): void => {
    it('sorting an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.slice().sort(),
                applyCollectionOperation: collection => collection.toSorted()
            }
        });
    });

    it('sorting a collection returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, undefined, 2, 3, -1, undefined, 3, 100, null, 22, 11, 200, -100],

            applyOperation: {
                applyArrayOperation: array => array.slice().sort(),
                applyCollectionOperation: collection => collection.toSorted()
            }
        });
    });

    it('sorting a collection with a compare callback returns an array containing the same items in sort order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, undefined, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.slice().sort((left, right) => left - right),
                applyCollectionOperation: collection => collection.toSorted((left, right) => left - right)
            }
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