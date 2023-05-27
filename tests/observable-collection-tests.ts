import { expect } from 'chai';
import { ObservableCollection } from '../src/observable-collection';

describe('observable-collection/observableCollection', (): void => {
    it('creating an observable collection with no initial items is empty', (): void => {
        const collection = new ObservableCollection();

        expect(collection.toArray()).is.deep.equal([]);
    });

    it('creating an observable collection with initial items initializes it with them', (): void => {
        const collection = new ObservableCollection(1, 2, 3);

        expect(collection.toArray()).is.deep.equal([1, 2, 3]);
    });

    it('pusing an item notifies observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(item).is.equal(1);
                expect(index).is.equal(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([1]);
                expect(collectionChange.removedItems).is.deep.equal([]);
            }
        });

        collection.push(1);

        expect(collection.toArray()).is.deep.equal([1]);
        expect(raisedEvents).is.deep.equal(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('pushing an item offsets the addedItems to added index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(item).is.equal(4);
                expect(index).is.equal(3);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                let iterations = 0;
                collectionChange.addedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).is.equal(4);
                    expect(index).is.equal(3);
                });
                expect(iterations).is.equal(1);
                expect(collectionChange.addedItems).is.deep.equal(new Array(3).concat(4));
                expect(collectionChange.removedItems).is.deep.equal([]);
            }
        });

        collection.push(4);

        expect(collection.toArray()).is.deep.equal([1, 2, 3, 4]);
        expect(raisedEvents).is.deep.equal(['itemAdded', 'collectionChanged']);
    });

    it('popping an item from empty collection does not notify observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const poppedValue = collection.pop();

        expect(collection.toArray()).is.deep.equal([]);
        expect(poppedValue).is.undefined;
        expect(raisedEvents).is.deep.equal([]);
    });

    it('popping an item from non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(item).is.equal(1);
                expect(index).is.equal(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                expect(collectionChange.removedItems).is.deep.equal([1]);
            }
        });

        const poppedValue = collection.pop();

        expect(collection.toArray()).is.deep.equal([]);
        expect(poppedValue).is.equal(1);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('popping an item offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(item).is.equal(3);
                expect(index).is.equal(2);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                let iterations = 0;
                expect(collectionChange.addedItems).is.deep.equal([]);
                collectionChange.removedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).is.equal(3);
                    expect(index).is.equal(2);
                });
                expect(iterations).is.equal(1);
                expect(collectionChange.removedItems).is.deep.equal(new Array(2).concat(3));
            }
        });

        collection.pop();

        expect(collection.toArray()).is.deep.equal([1, 2]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('unshifting an item notifies observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(item).is.equal(1);
                expect(index).is.equal(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([1]);
                expect(collectionChange.removedItems).is.deep.equal([]);
            }
        });

        collection.unshift(1);

        expect(collection.toArray()).is.deep.equal([1]);
        expect(raisedEvents).is.deep.equal(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('unshifting an item offsets the addedItems to added index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(item).is.equal(4);
                expect(index).is.equal(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                let iterations = 0;
                collectionChange.addedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).is.equal(4);
                    expect(index).is.equal(0);
                });
                expect(iterations).is.equal(1);
                expect(collectionChange.addedItems).is.deep.equal([4]);
                expect(collectionChange.removedItems).is.deep.equal([]);
            }
        });

        collection.unshift(4);

        expect(collection.toArray()).is.deep.equal([4, 1, 2, 3]);
        expect(raisedEvents).is.deep.equal(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('shifting an item from empty collection does not notify observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const shiftedValue = collection.shift();

        expect(collection.toArray()).is.deep.equal([]);
        expect(shiftedValue).is.undefined;
        expect(raisedEvents).is.deep.equal([]);
    });

    it('shifting an item from non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(item).is.equal(1);
                expect(index).is.equal(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                expect(collectionChange.removedItems).is.deep.equal([1]);
            }
        });

        const shiftedValue = collection.shift();

        expect(collection.toArray()).is.deep.equal([]);
        expect(shiftedValue).is.equal(1);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('shifting an item offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(item).is.equal(1);
                expect(index).is.equal(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                let iterations = 0;
                collectionChange.removedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).is.equal(1);
                    expect(index).is.equal(0);
                });
                expect(iterations).is.equal(1);
                expect(collectionChange.removedItems).is.deep.equal([1]);
            }
        });

        collection.shift();

        expect(collection.toArray()).is.deep.equal([2, 3]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('getting an item works the same way as an indexer', (): void => {
        const collection = new ObservableCollection(1, 2, 3);

        for (let index = 0; index < 3; index++)
            expect(collection.get(index)).is.equal(collection[index]);
    });

    it('getting an item at a negative index throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.get(-1);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).is.instanceOf(RangeError);
    });

    it('getting an item beyond the length of the collection throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.get(collection.length);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).is.instanceOf(RangeError);
    });

    it('setting an item works the same was as an indexer', (): void => {
        const collection = new ObservableCollection(10, 20, 30);

        for (let index = 0; index < 3; index++) {
            collection.set(index, index);
            expect(collection.get(index)).is.equal(collection[index]);
            expect(collection.length).is.equal(3);
        }
    });

    it('setting an item at a negative index throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection();

        try {
            collection.set(-1, 0);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).is.instanceOf(RangeError);
    });

    it('setting an item beyond the length of the collection throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.set(3, 0);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).is.instanceOf(RangeError);
    });

    it('setting an item notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(item).is.equal(4);
                expect(index).is.equal(1);
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(item).is.equal(2);
                expect(index).is.equal(1);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, { addedItems, removedItems }) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                addedItems.forEach((item, index) => {
                    expect(item).is.equal(4);
                    expect(index).is.equal(1);
                });
                expect(addedItems).is.deep.equal(new Array(1).concat(4));
                removedItems.forEach((item, index) => {
                    expect(item).is.equal(2);
                    expect(index).is.equal(1);
                });
                expect(removedItems).is.deep.equal(new Array(1).concat(2));
            }
        });

        collection.set(1, 4);

        expect(collection.toArray()).is.deep.equal([1, 4, 3]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemAdded', 'collectionChanged']);
    });

    it('splicing an empty observable collection does not notify observers', (): void => {
        const collection = new ObservableCollection();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const removedItems = collection.splice(0);

        expect(collection.toArray()).is.deep.equal([]);
        expect(removedItems).is.deep.equal([]);
        expect(raisedEvents).is.deep.equal([]);
    });

    it('splicing a non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(0);
                expect(item).is.equal(eventHandlerInvokationCount + 1);
                expect(index).is.equal(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                expect(collectionChange.removedItems).is.deep.equal([1, 2, 3]);
            }
        });

        const removedItems = collection.splice(0, 10);

        expect(collection.toArray()).is.deep.equal([]);
        expect(removedItems).is.deep.equal([1, 2, 3]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('splicing a non-empty collection offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3, 4);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 1;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(2);
                expect(item).is.equal(eventHandlerInvokationCount + 1);
                expect(index).is.equal(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                let iterations = 0;
                collectionChange.removedItems.forEach((item, index) => {
                    if (iterations === 0) {
                        expect(item).is.equal(2);
                        expect(index).is.equal(1);
                    }
                    else if (iterations === 1) {
                        expect(item).is.equal(3);
                        expect(index).is.equal(2);
                    }
                    iterations++;
                });
                expect(iterations).is.equal(2);
                expect(collectionChange.removedItems).is.deep.equal(new Array(1).concat([2, 3]));
            }
        });

        const removedItems = collection.splice(1, 2);

        expect(collection.toArray()).is.deep.equal([1, 4]);
        expect(removedItems).is.deep.equal([2, 3]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('clearing an empty observable collection does not notify observers', (): void => {
        const collection = new ObservableCollection();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const removedItems = collection.clear();

        expect(collection.toArray()).is.deep.equal([]);
        expect(removedItems).is.deep.equal([]);
        expect(raisedEvents).is.deep.equal([]);
    });

    it('clearing a non-empty observable collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(0);
                expect(item).is.equal(eventHandlerInvokationCount + 1);
                expect(index).is.equal(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([]);
                expect(collectionChange.removedItems).is.deep.equal([1, 2, 3]);
            }
        });

        const removedItems = collection.clear();

        expect(collection.toArray()).is.deep.equal([]);
        expect(removedItems).is.deep.equal([1, 2, 3]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('resetting an observable collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).is.equal(collection);
                expect(changedProperties).is.deep.equal(['length']);
            }
        });
        let itemAddedEventHandlerInvokationCount = 0;
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(4);
                expect(item).is.equal(itemAddedEventHandlerInvokationCount + 4);
                expect(index).is.equal(itemAddedEventHandlerInvokationCount);
                itemAddedEventHandlerInvokationCount++;
            }
        });
        let itemRemovedEventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(4);
                expect(item).is.equal(itemRemovedEventHandlerInvokationCount + 1);
                expect(index).is.equal(itemRemovedEventHandlerInvokationCount);
                itemRemovedEventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([4, 5, 6, 7]);
                expect(collectionChange.removedItems).is.deep.equal([1, 2, 3]);
            }
        });

        collection.reset(4, 5, 6, 7);

        expect(collection.toArray()).is.deep.equal([4, 5, 6, 7]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemRemoved', 'itemRemoved', 'itemAdded', 'itemAdded', 'itemAdded', 'itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('resetting an observable collection with same number of items does not notify length changed', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(_, changedProperties) {
                if (changedProperties.includes('length'))
                    raisedEvents.push('propertiesChanged');
            }
        });
        let itemAddedEventHandlerInvokationCount = 0;
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(3);
                expect(item).is.equal(itemAddedEventHandlerInvokationCount + 4);
                expect(index).is.equal(itemAddedEventHandlerInvokationCount);
                itemAddedEventHandlerInvokationCount++;
            }
        });
        let itemRemovedEventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(3);
                expect(item).is.equal(itemRemovedEventHandlerInvokationCount + 1);
                expect(index).is.equal(itemRemovedEventHandlerInvokationCount);
                itemRemovedEventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).is.equal(collection);
                expect(collectionChange.addedItems).is.deep.equal([4, 5, 6]);
                expect(collectionChange.removedItems).is.deep.equal([1, 2, 3]);
            }
        });

        collection.reset(4, 5, 6);

        expect(collection.toArray()).is.deep.equal([4, 5, 6]);
        expect(raisedEvents).is.deep.equal(['itemRemoved', 'itemRemoved', 'itemRemoved', 'itemAdded', 'itemAdded', 'itemAdded', 'collectionChanged']);
    });

    it('removing an item that was previously added has the removal callback called', (): void => {
        const collection = new ObservableCollection(1, 2, 3, 4, 5);
        const raisedEvents: string[] = [];
        collection.itemAdded.subscribe({
            handle(subject, { item, index, addItemRemovalCallback }) {
                raisedEvents.push('itemAdded');
                expect(subject).is.equal(collection);
                expect(collection.length).is.equal(6);
                expect(item).is.equal(7);
                expect(index).is.equal(2);
                addItemRemovalCallback((item, index) => {
                    raisedEvents.push('itemAdded.removalCallback');
                    expect(item).is.equal(7);
                    expect(index).is.equal(0);
                    expect(collection.length).is.equal(3);
                });
            }
        });

        collection.splice(2, 0, 7);
        collection.splice(0, 2);
        expect(collection.toArray()).is.deep.equal([7, 3, 4, 5]);
        expect(raisedEvents).is.deep.equal(['itemAdded']);

        collection.shift();
        expect(collection.toArray()).is.deep.equal([3, 4, 5]);
        expect(raisedEvents).is.deep.equal(['itemAdded', 'itemAdded.removalCallback']);
    });
});