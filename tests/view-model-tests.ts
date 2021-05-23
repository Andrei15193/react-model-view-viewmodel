import { expect } from 'chai';
import { ViewModel } from '../src/view-model';

describe('view-model/ViewModel', (): void => {
    class MockViewModel extends ViewModel {
        readonly one: string;
        readonly two: string;

        public notifyPropertiesChanged(changedProperty: string, ...otherChangedProperties: readonly string[]): void {
            super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
        }
    }

    it('dispatching properties changed passes view model as subject and changed properties as args', (): void => {
        const viewModel = new MockViewModel();
        let invocationCount = 0;
        viewModel.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(viewModel);
                expect(changedProperties).is.deep.equal(['one', 'two']);
            }
        })

        viewModel.notifyPropertiesChanged('one', 'two');

        expect(invocationCount).is.equal(1);
    });
});