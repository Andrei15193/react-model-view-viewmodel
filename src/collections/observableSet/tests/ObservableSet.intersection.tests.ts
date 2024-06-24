import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.intersection', (): void => {
    it('getting the intersection between disjoint set and collection returns empty set', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [4, 5, 6],

            applyOperation: {
                applyObservableSetOperation: set => set.intersection(other),
                applySetOperation: set => intersection(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the intersection between set and collection having same items returns set containing same items', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.intersection(other),
                applySetOperation: set => intersection(set, other)
            },

            expectedResult: new Set<number>([1, 2, 3])
        });
    });

    it('getting the intersection between set and collection having some common items returns items contained by both', (): void => {
        const other = [3, 4, 5, 6];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4],

            applyOperation: {
                applyObservableSetOperation: set => set.intersection(other),
                applySetOperation: set => intersection(set, other)
            },

            expectedResult: new Set([3, 4])
        });
    });

    it('getting the intersection between set and empty collection returns empty set', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.intersection(other),
                applySetOperation: set => intersection(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the intersection between empty set and collection returns empty set', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.intersection(other),
                applySetOperation: set => intersection(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the intersection between sets while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.intersection(other);
                    observableSet.intersection(new Set(other));
                    observableSet.intersection({
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

function intersection<TItem>(set: Set<TItem>, other: readonly TItem[]): Set<TItem> {
    return new Set<TItem>(Array.from(set.keys()).filter(item => other.includes(item)));
}