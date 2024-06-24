import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.isDisjointFrom', (): void => {
    it('checking when item from current set is present in the provided collection returns false', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [3, 4, 5],

            applyOperation: {
                applyObservableSetOperation: set => set.isDisjointFrom(other),
                applySetOperation: set => isDisjointFrom(set, other)
            },

            expectedResult: false
        });
    });

    it('checking when no item from current set is not present in the provided collection returns true', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [4, 5, 6],

            applyOperation: {
                applyObservableSetOperation: set => set.isDisjointFrom(other),
                applySetOperation: set => isDisjointFrom(set, other)
            },

            expectedResult: true
        });
    });

    it('checking with empty provided collection returns true', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isDisjointFrom(other),
                applySetOperation: set => isDisjointFrom(set, other)
            },

            expectedResult: true
        });
    });

    it('checking with current empty set returns true', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.isDisjointFrom(other),
                applySetOperation: set => isDisjointFrom(set, other)
            },

            expectedResult: true
        });
    });

    it('checking sets while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.isDisjointFrom(other);
                    observableSet.isDisjointFrom(new Set(other));
                    observableSet.isDisjointFrom({
                        size: other.length,
                        keys() {
                            return other[Symbol.iterator]();
                        },
                        has: other.includes.bind(other)
                    });
                }
            })
            .not
            .toThrow()
    });
});

function isDisjointFrom<TItem>(set: Set<TItem>, other: readonly TItem[]): boolean {
    return (
        Array.from(set).every(item => !other.includes(item))
        && other.every(item => !set.has(item))
    );
}