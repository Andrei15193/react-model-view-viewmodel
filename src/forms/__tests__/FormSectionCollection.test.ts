import { FormSectionCollection } from '../FormSectionCollection';
import { Form } from '../Form';

describe('FormSectionCollection', (): void => {
    it('adding sections when initializing collections adds them to the collection', (): void => {
        const section1 = new Form();
        const section2 = new Form();

        const formSectionCollection = new FormSectionCollection([section1, section2]);

        expect(formSectionCollection.length).toBe(2);
        expect(formSectionCollection.toArray()).toEqual([section1, section2]);
    });

    it('adding sections to section collections adds them to the collection', (): void => {
        const section1 = new Form();
        const section2 = new Form();

        const formSectionCollection = new FormSectionCollection();
        formSectionCollection.push(section1, section2);

        expect(formSectionCollection.length).toBe(2);
        expect(formSectionCollection.toArray()).toEqual([section1, section2]);
    });

    it('initializing two section collections adds all to the collection', (): void => {
        const formSectionCollection = new FormSectionCollection();
        const section1 = new Form();
        const section2 = new Form();

        formSectionCollection.push(section1);
        formSectionCollection.push(section2);

        expect(formSectionCollection.length).toBe(2);
        expect(formSectionCollection.toArray()).toEqual([section1, section2]);
    });

    it('removing a form section resets it', () => {
        let resetInvocationCount = 0;
        const section = new Form();
        const formSectionCollection = new FormSectionCollection([section]);
        section.reset = () => {
            resetInvocationCount++;
        };

        expect(resetInvocationCount).toBe(0);

        formSectionCollection.splice(0);
        expect(resetInvocationCount).toBe(1);
    });

    it('invalidating a section makes the entire form invalid', (): void => {
        const section = new Form();
        const formSectionCollection = new FormSectionCollection([section]);

        section.error = 'invalid';

        expect(formSectionCollection.isValid).toBeFalsy();
        expect(formSectionCollection.isInvalid).toBeTruthy();
    });

    it('invalidating a section propagates property change notifications', (): void => {
        let invocationCount = 0;
        const section = new Form();
        const formSectionCollection = new FormSectionCollection([section]);
        formSectionCollection.propertiesChanged.subscribe({
            handle(_, changedProperties) {
                invocationCount++;
                expect(changedProperties.length).toBe(2);
                expect(changedProperties).toContain('isValid');
                expect(changedProperties).toContain('isInvalid');
            }
        })

        section.error = 'invalid';

        expect(invocationCount).toBe(1);
    });

    it('configuring a form section collection initializes each added section', () => {
        let invocationCount = 0;
        const formSectionCollection = new FormSectionCollection();
        const formSection = new Form();
        formSectionCollection.withItemSetup(
            section => {
                invocationCount++;
                expect(section).toStrictEqual(formSection);
            }
        );

        formSectionCollection.push(formSection);

        expect(invocationCount).toBe(1);
    });

    it('removing a configuration callback reconfigures the section', () => {
        let setup1InvocationCount = 0;
        let setup2InvocationCount = 0;
        let resetInvocationCount = 0;
        const formSectionCollection = new FormSectionCollection();
        const formSection = new Form();
        formSection.reset = () => {
            resetInvocationCount++;
        }

        const setup1 = (section: Form) => {
            setup1InvocationCount++;
            expect(section).toStrictEqual(formSection);
        };
        const setup2 = (section: Form) => {
            setup2InvocationCount++;
            expect(section).toStrictEqual(formSection);
        };
        formSectionCollection.withItemSetup(setup1);
        formSectionCollection.withItemSetup(setup2);

        formSectionCollection.push(formSection);

        formSectionCollection.withoutItemSetup(setup2);

        expect(setup1InvocationCount).toBe(2);
        expect(resetInvocationCount).toBe(1);
        expect(setup2InvocationCount).toBe(1);
    });

    it('clearing configuration callbacks resets the section', () => {
        let resetInvocationCount = 0;
        const formSectionCollection = new FormSectionCollection();
        const formSection = new Form();
        formSection.reset = () => {
            resetInvocationCount++;
        }
        formSectionCollection.withItemSetup(() => { });

        formSectionCollection.push(formSection);
        formSectionCollection.clearItemSetups();

        expect(resetInvocationCount).toBe(1);
    });

    it('resetting a collection resets all contained sections configurations', () => {
        let sectionResetInvocationCount = 0;
        let sectionSetupInvocationCount = 0;

        const section = new Form();
        section.reset = () => {
            sectionResetInvocationCount++;
        }
        const formSectionCollection = new FormSectionCollection([section]);
        formSectionCollection.withItemSetup(
            () => { sectionSetupInvocationCount++; }
        );

        expect(sectionResetInvocationCount).toBe(0);
        expect(sectionSetupInvocationCount).toBe(1);

        formSectionCollection.reset();
        formSectionCollection.push(new Form());

        expect(sectionResetInvocationCount).toBe(1);
        expect(sectionSetupInvocationCount).toBe(1);
    });
});