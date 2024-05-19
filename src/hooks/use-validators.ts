import type { INotifyPropertiesChanged } from '../viewModels';
import type { IValidatable, IValidationConfig, ValidatorCallback } from '../validation';
import { registerValidators } from '../validation';
import { useEffect } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Registers and applies the provided validators. The validatable and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validatable The object that will be validated by the provided validators.
 * @param validators The callback validators that handle validation.
*/
export function useValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validatable: TValidatableViewModel, validators: readonly ValidatorCallback<TValidatableViewModel>[]): void;

/** Registers and applies the provided validators. The validation config and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validationConfig The config for setting up validation.
 * @param validators The callback validators that handle validation.
*/
export function useValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validationConfig: IValidationConfig<TValidatableViewModel>, validators: readonly ValidatorCallback<TValidatableViewModel>[]): void;

/** Registers and applies the provided validators. The validatable (or validation config) and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validatableOrConfig The object that will be validated by the provided validators or the config for setting up validation.
 * @param validators The callback validators that handle validation.
*/
export function useValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validatableOrConfig: TValidatableViewModel | IValidationConfig<TValidatableViewModel>, validators: readonly ValidatorCallback<TValidatableViewModel>[]): void {
    useEffect(
        (): EffectResult => registerValidators(validatableOrConfig as any, validators),
        [validatableOrConfig, ...validators]
    );
}