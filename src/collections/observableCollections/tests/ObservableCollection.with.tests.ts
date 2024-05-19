import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.with', (): void => {
    it('generating a collection using with returns array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => {
                    const copy = array.slice();
                    copy[2] = 10;

                    return copy;
                },
                applyCollectionOperation: collection => collection.with(2, 10)
            },

            expectedResult: [1, 2, 10]
        });
    });

    it('generating a collection using with returns array when using negative index', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => {
                    const copy = array.slice();
                    copy[1] = 10;

                    return copy;
                },
                applyCollectionOperation: collection => collection.with(-2, 10)
            },

            expectedResult: [1, 10, 3]
        });
    });

    it('trying to generate a collection using with and index is out of bounds throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);
                observableCollection.with(3, 10);
            })
            .toThrow(new RangeError('The provided index \'3\' is outside the bounds of the collection.'));
    });

    it('trying to generate a collection using with and negative index is out of bounds throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);
                observableCollection.with(-4, 10);
            })
            .toThrow(new RangeError('The provided index \'-4\' is outside the bounds of the collection.'));
    });

    it('calling with while iterating will not break iterators', (): void => {
        expect(
            () => {
                let index = 0;
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection) {
                    observableCollection.with(index, 10);
                    index++;
                }
            })
            .not
            .toThrow();
    });
});