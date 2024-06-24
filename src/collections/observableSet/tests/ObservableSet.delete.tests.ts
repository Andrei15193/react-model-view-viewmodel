import { ObservableSet } from '../ObservableSet';
import { selfResult, testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableSet.delete', (): void => {
    it('deleting an item removes it from the set', (): void => {
        testMutatingOperation<number>({
            setOperation: 'delete',
            initialState: [1, 2, 3],
            changedProperties: ['size'],

            applyOperation: set => set.delete(1),

            expectedSet: [2, 3],
            expectedResult: true
        });
    });

    it('deleting an item from an empty set has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: set => set.delete(2),

            expectedResult: false
        });
    });

    it('deleting a non-existing item from a set has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: set => set.delete(4),

            expectedResult: false
        });
    });

    it('deleting items while iterating breaks iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.delete(1);
            })
            .toThrow(new Error('Set has changed while being iterated.'))
    });

    it('deleting non-existing item while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.delete(4);
            })
            .not
            .toThrow()
    });
});