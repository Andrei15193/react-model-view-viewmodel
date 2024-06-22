import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObserableSet.isSupersetOf', (): void => {
    it('checking when all items from provided collection are present in the current set returns true', (): void => {
        const other = [1, 2];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSupersetOf(other),
                applySetOperation: set => isSupersetOf(set, other)
            },

            expectedResult: true
        });
    });

    it('checking when current set has fewer unique items than provided collection returns false', (): void => {
        const other = [1, 2, 3, 1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2],

            applyOperation: {
                applyObservableSetOperation: set => set.isSupersetOf(other),
                applySetOperation: set => isSupersetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking when one item from the provided collection is not present in the current set returns false', (): void => {
        const other = [1, 2, 4];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSupersetOf(other),
                applySetOperation: set => isSupersetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking with empty provided collection returns true', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.isSupersetOf(other),
                applySetOperation: set => isSupersetOf(set, other)
            },

            expectedResult: true
        });
    });

    it('checking with current empty set returns false', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.isSupersetOf(other),
                applySetOperation: set => isSupersetOf(set, other)
            },

            expectedResult: false
        });
    });

    it('checking sets while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.isSupersetOf(other);
                    observableSet.isSupersetOf(new Set(other));
                    observableSet.isSupersetOf({
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

function isSupersetOf<TItem>(set: Set<TItem>, other: readonly TItem[]): boolean {
    return (
        Array.from(other).every(item => set.has(item))
    );
}