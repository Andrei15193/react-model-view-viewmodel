import { ViewModel } from '../src/view-model';

describe('view-model/ViewModel', (): void => {
    class MockViewModel extends ViewModel {
        readonly one: string;
        readonly two: string;

        public notifyPropertiesChanged(changedProperty: keyof this, ...otherChangedProperties: readonly (keyof this)[]): void {
            super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
        }
    }

    it('dispatching properties changed passes view model as subject and changed properties as args', (): void => {
        const viewModel = new MockViewModel();
        let invocationCount = 0;
        viewModel.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).toBe(viewModel);
                expect(changedProperties).toEqual(['one', 'two']);
            }
        })

        viewModel.notifyPropertiesChanged('one', 'two');

        expect(invocationCount).toBe(1);
    });
});