import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.toReversed', (): void => {
    it('reversing an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.toReversed(),

            expectedResult: []
        });
    });

    it('reversing a collection returns an array containing the same items in reverse order', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.toReversed(),

            expectedResult: [3, 2, 1]
        });
    });

    it('calling toReversed while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.toReversed();
            })
            .not
            .toThrow();
    });
});