import type { Form } from './Form';

/** Represents a callback used to configure an individual form section within a collection. */
export type FormSetupCallback<TSection extends Form<TValidationError>, TValidationError = string> = (section: TSection) => void;

/**
 * Represents collection of form sections that can be configured. This is useful for cases like having a list of editable items
 * and neeeding to add validaiton for each based on the state of an entity or the form itself.
 *
 * @template TSection the concrete type of the form section.
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IConfigurableFormCollection<TSection extends Form<TValidationError>, TValidationError = string> {
    /**
     * Configures the provided `setupCallback` and applies it on all existing form sections within the collection
     * and to any form section that is added.
     * @param setupCallback The callback performing the setup.
     */
    withItemSetup(setupCallback: FormSetupCallback<TSection, TValidationError>): this;

    /**
     * Removes the provided `setupCallback` and no longer applies it to form sections that are added, all existing
     * form sections are reset and re-configured using the remaining setup callbacks.
     * @param setupCallback The callback performing the setup.
     */
    withoutItemSetup(setupCallback: FormSetupCallback<TSection, TValidationError>): this;

    /**
     * Clears all setup callbacks and resets all existing form sections.
     */
    clearItemSetups(): void;
}