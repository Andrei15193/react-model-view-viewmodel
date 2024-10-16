import type { IPropertiesChangedEventHandler, INotifyPropertiesChanged } from '../../viewModels';
import { ValidationTrigger } from './ValidationTrigger';

/**
 * Represents the view model validation trigger configuration.
 * @template TViewModel The view model type that may trigger validations.
 */
export interface IViewModelChangedValidationTriggerConfig<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged> {
    /**
     * The view model that may trigger a validation.
     */
    readonly viewModel: TViewModel;

    /**
     * Optional, a guard method which controls when a validaiton should be triggered.
     * @param viewModel The view model that has changed.
     * @param changedProperties The properties that have changed on the view model.
     */
    shouldTriggerValidation?(viewModel: TViewModel, changedProperties: readonly (keyof TViewModel)[]): boolean;
}

/**
 * Represents a view model validation trigger, whenever the view model changes a validation should occur.
 * @template TViewModel The view model type that may trigger validations.
 */
export class ViewModelChangedValidationTrigger<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged> extends ValidationTrigger<TViewModel> {
    private readonly _viewModelChangedEventHandler: IPropertiesChangedEventHandler<TViewModel> & {
        _notifyValidationTriggered(): void;
    };

    /**
     * Initializes a new instance of the {@linkcode ViewModelChangedValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: IViewModelChangedValidationTriggerConfig<TViewModel>) {
        const { viewModel, shouldTriggerValidation } = config;
        super(viewModel);

        this._viewModelChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(viewModel, changedProperties) {
                if (!shouldTriggerValidation || shouldTriggerValidation(viewModel, changedProperties))
                    this._notifyValidationTriggered();
            }
        }
    }

    /**
     * Subscribes to view model changes.
     */
    protected subscribeToTarget(): void {
        this.trigger.propertiesChanged.subscribe(this._viewModelChangedEventHandler);
    }

    /**
     * Unsubscribes from view model changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.propertiesChanged.unsubscribe(this._viewModelChangedEventHandler);
    }
}