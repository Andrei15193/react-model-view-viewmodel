import { ObservableCollection } from "../../src/observable-collection";
import { testBlankMutatingOperation, testMutatingOperation } from "./common";

describe('ObserableCollection.push', (): void => {
    it('pushing an item adds it to the collection', (): void => {
        testMutatingOperation<number>("push", collection => collection.push(1), []);
    });

    it('pushing an item to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>("push", collection => collection.push(4), [1, 2, 3]);
    });

    it('pushing items adds them to the collection', (): void => {
        testMutatingOperation<number>("push", collection => collection.push(1, 2, 3), []);
    });

    it('pushing items to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>("push", collection => collection.push(4, 5, 6), [1, 2, 3]);
    });

    it('not pushing any items to the collection has no effect', (): void => {
        testBlankMutatingOperation<number>(collection => collection.push(), [1, 2, 3]);
    });

    it('not pushing any items to non-empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>(collection => collection.push(), []);
    });

    it('pushing items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (let _ of observableCollection)
                    observableCollection.push(1);
            })
            .toThrow(new Error("Collection has changed while being iterated."))
    });

    it('not pushing items while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (let _ of observableCollection)
                    observableCollection.push();
            })
            .not
            .toThrow()
    });
});