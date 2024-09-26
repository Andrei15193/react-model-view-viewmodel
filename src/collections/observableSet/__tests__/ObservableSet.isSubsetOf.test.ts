import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.isSubsetOf', (): void => {
    it('checking when all items from current set are present in the provided collection returns true', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2],

            applyOperation: {
                applyObservableSetOperation: set => set.isSubsetOf(other),
                applySetOperation: set => isSubsetOf(set, other)
            },

            expectedResult: true
        });
    });

    it('checking when provided collection has fewer unique items than current set returns false', (): void => {
        const other = [1, 2, 1, 2];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSubsetOf(other),
                applySetOperation: set => isSubsetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking when one item from current set is not present in the provided collection returns false', (): void => {
        const other = [1, 2, 4];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSubsetOf(other),
                applySetOperation: set => isSubsetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking with empty provided collection returns false', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSubsetOf(other),
                applySetOperation: set => isSubsetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking with current empty set returns true', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.isSubsetOf(other),
                applySetOperation: set => isSubsetOf(set, other)
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
                    observableSet.isSubsetOf(other);
                    observableSet.isSubsetOf(new Set(other));
                    observableSet.isSubsetOf({
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

function isSubsetOf<TItem>(set: Set<TItem>, other: readonly TItem[]): boolean {
    return (
        Array.from(set).every(item => other.includes(item))
    );
}