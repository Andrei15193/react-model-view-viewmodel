import type { IPropertiesChangedEventHandler, INotifyPropertiesChanged } from '../../viewModels';
import { ValidationTrigger } from './ValidationTrigger';

export interface IViewModelChangedValidationTriggerConfig<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged> {
    readonly viewModel: TViewModel;

    shouldTriggerValidation?(viewModel: TViewModel, changedProperties: readonly (keyof TViewModel)[]): boolean;
}

export class ViewModelChangedValidationTrigger<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged> extends ValidationTrigger<TViewModel> {
    private readonly _viewModelChangedEventHandler: IPropertiesChangedEventHandler<TViewModel> & {
        _notifyValidationTriggered(): void;
    };

    public constructor({ viewModel, shouldTriggerValidation }: IViewModelChangedValidationTriggerConfig<TViewModel>) {
        super(viewModel);

        this._viewModelChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(viewModel, changedProperties) {
                if (!shouldTriggerValidation || shouldTriggerValidation(viewModel, changedProperties))
                    this._notifyValidationTriggered();
            }
        }
    }

    public subscribeToTarget(): void {
        this.trigger.propertiesChanged.subscribe(this._viewModelChangedEventHandler);
    }

    public unsubscribeFromTarget(): void {
        this.trigger.propertiesChanged.unsubscribe(this._viewModelChangedEventHandler);
    }
}