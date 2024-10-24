import { ObservableCollection } from '../../collections';
import { ViewModel } from '../../viewModels';
import { CollectionItemValidationTrigger } from '../triggers/CollectionItemValidationTrigger';

describe('CollectionItemValidationTrigger', (): void => {
    it('validation is triggered when collection item changes', (): void => {
        let invocationCount = 0;
        const item = new TestItem();
        const collection = new ObservableCollection<TestItem>([item]);
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return viewModel;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered when an item is added to the collection', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<TestItem>();
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        const item = new TestItem();
        collection.push(item);

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered once when the collection contains the same item multiple times and it changes', (): void => {
        let invocationCount = 0;
        const item = new TestItem();
        const collection = new ObservableCollection<TestItem>([item, item, item]);
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered each time the same item is added to the collection and triggered once when it changes ', (): void => {
        let invocationCount = 0;
        const collection = new ObservableCollection<TestItem>();
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        const item = new TestItem();
        collection.push(item);
        expect(invocationCount).toBe(1);

        collection.push(item, item);
        expect(invocationCount).toBe(2);

        item.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(3);
    });

    it('validation is no longer triggered when a removed item changes', () => {
        let invocationCount = 0;
        const item1 = new TestItem();
        const item2 = new TestItem();
        const collection = new ObservableCollection<TestItem>([item1, item2]);
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        const [removedItem] = collection.splice(0, 1);
        expect(removedItem).toStrictEqual(item1);
        expect(invocationCount).toBe(1);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(1);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(2);
    });

    it('validation is still triggered when the same item was added multiple times, removed, but at least one instance is still contained by the collection', () => {
        let invocationCount = 0;
        const item1 = new TestItem();
        const item2 = new TestItem();
        const collection = new ObservableCollection<TestItem>([item1, item2]);
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        collection.push(item1, item1);
        expect(invocationCount).toBe(1);

        const [removedItem1] = collection.splice(0, 1);
        expect(removedItem1).toStrictEqual(item1);
        expect(invocationCount).toBe(2);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(3);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(4);
        
        const [removedItem2] = collection.splice(1, 1);
        expect(removedItem2).toStrictEqual(item1);
        expect(invocationCount).toBe(5);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(6);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(7);
        
        const [removedItem3] = collection.splice(1, 1);
        expect(removedItem3).toStrictEqual(item1);
        expect(invocationCount).toBe(8);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(8);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(9);

        const [removedItem4] = collection.splice(0);
        expect(removedItem4).toStrictEqual(item2);
        expect(invocationCount).toBe(10);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(10);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(10);
    });

    it('validation is not triggered when check returns false', () => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const item = new TestItem();
        const collection = new ObservableCollection<TestItem>([item]);
        const validationTrigger = new CollectionItemValidationTrigger({
            collection,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            },
            shouldTriggerValidation(actualItem) {
                checkInvocationCount++;
                expect(actualItem).toStrictEqual(item);
                return false;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(0);
        expect(checkInvocationCount).toBe(1);
    });
});

class TestItem {
    public viewModel = new FakeViewModel();
}

class FakeViewModel extends ViewModel {
    public notifyPropertiesChanged(): void {
        super.notifyPropertiesChanged('propertiesChanged');
    }
}