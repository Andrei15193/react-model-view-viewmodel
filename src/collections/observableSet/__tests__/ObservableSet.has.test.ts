import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.has', (): void => {
    it('checking if item is part of empty set returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: set => set.has(1),

            expectedResult: false
        });
    });

    it('checking if existing item is part of set returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: set => set.has(2),

            expectedResult: true
        });
    });

    it('checking if non-existing item is part of set returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: set => set.has(4),

            expectedResult: false
        });
    });

    it('checking item existence while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                let valueToCheck = 2;
                for (const _ of observableSet) {
                    observableSet.has(valueToCheck);
                    valueToCheck++;
                }
            })
            .not
            .toThrow()
    });
});