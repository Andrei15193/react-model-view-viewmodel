import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.concat', (): void => {
    it('concatenating without any arguments returns a new array containing the same items', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.concat(),

            expectedResult: [1, 2, 3]
        });
    });

    it('concatenating a flat array returns a new array with items concatenated at the end', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.concat(4, 5, 6),

            expectedResult: [1, 2, 3, 4, 5, 6]
        });
    });

    it('concatenating an array returns a new array with items concatenated at the end', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.concat([4, 5, 6]),

            expectedResult: [1, 2, 3, 4, 5, 6]
        });
    });

    it('concatenating mixed arguments returns a new array with all items concatenated at the end', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.concat(4, [5, 6], 7, [8]),

            expectedResult: [1, 2, 3, 4, 5, 6, 7, 8]
        });
    });

    it('calling concat while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.concat(4);
            })
            .not
            .toThrow();
    });
});