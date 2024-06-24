import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableSet.clear', (): void => {
    it('clearing items removes all items from the set', (): void => {
        testMutatingOperation<number>({
            setOperation: 'clear',
            initialState: [1, 2, 3],
            changedProperties: ['size'],

            applyOperation: set => set.clear(),

            expectedSet: [],
            expectedResult: undefined
        });
    });

    it('clearing items from an empty set has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: set => set.clear(),

            expectedResult: undefined
        });
    });

    it('clearing items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.clear();
            })
            .toThrow(new Error('Set has changed while being iterated.'))
    });
});