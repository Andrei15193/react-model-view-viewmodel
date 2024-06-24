import { ObservableSet } from '../ObservableSet';
import { selfResult, testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableSet.add', (): void => {
    it('adding an item adds it to the set', (): void => {
        testMutatingOperation<number>({
            setOperation: 'add',
            initialState: [],
            changedProperties: ['size'],

            applyOperation: set => set.add(1),

            expectedSet: [1],
            expectedResult: selfResult
        });
    });

    it('adding an item to non-empty set adds them to the set', (): void => {
        testMutatingOperation<number>({
            setOperation: 'add',
            initialState: [1, 2, 3],
            changedProperties: ['size'],

            applyOperation: set => set.add(4),

            expectedSet: [1, 2, 3, 4],
            expectedResult: selfResult
        });
    });

    it('adding an existing item does not add it to the set', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: set => set.add(2),

            expectedResult: selfResult
        });
    });

    it('adding items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.add(4);
            })
            .toThrow(new Error('Set has changed while being iterated.'))
    });

    it('adding existing item while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.add(1);
            })
            .not
            .toThrow()
    });
});