import type { IReadOnlyObservableCollection, IReadOnlyObservableSet } from "../../collections";
import type { INotifyPropertiesChanged } from "../../viewModels";
import type { IReadOnlyValidatable } from "../IReadOnlyValidatable";
import type { IValidator } from "../IValidator";
import type { ValidationTrigger } from "../triggers";


export interface IReadOnlyObjectValidator<TValidatable extends IReadOnlyValidatable<TValidationError> & INotifyPropertiesChanged, TValidationError = string> {
    readonly target: TValidatable;

    readonly validators: IReadOnlyObservableCollection<IValidator<TValidatable, TValidationError>>;
    readonly triggers: IReadOnlyObservableSet<ValidationTrigger>;

    validate(): TValidationError | null;
}
