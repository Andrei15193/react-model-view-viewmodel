import { FormCollection } from '../FormCollection';
import { Form } from '../Form';

describe('FormCollection', (): void => {
    it('adding sections when initializing collections adds them to the collection', (): void => {
        const section1 = new Form();
        const section2 = new Form();

        const formCollection = new FormCollection([section1, section2]);

        expect(formCollection.length).toBe(2);
        expect(formCollection.toArray()).toEqual([section1, section2]);
    });

    it('adding sections to section collections adds them to the collection', (): void => {
        const section1 = new Form();
        const section2 = new Form();

        const formCollection = new FormCollection();
        formCollection.push(section1, section2);

        expect(formCollection.length).toBe(2);
        expect(formCollection.toArray()).toEqual([section1, section2]);
    });

    it('initializing two section collections adds all to the collection', (): void => {
        const formCollection = new FormCollection();
        const section1 = new Form();
        const section2 = new Form();

        formCollection.push(section1);
        formCollection.push(section2);

        expect(formCollection.length).toBe(2);
        expect(formCollection.toArray()).toEqual([section1, section2]);
    });

    it('removing a form section resets it', () => {
        let resetInvocationCount = 0;
        const section = new Form();
        const formCollection = new FormCollection([section]);
        section.reset = () => {
            resetInvocationCount++;
        };

        expect(resetInvocationCount).toBe(0);

        formCollection.splice(0);
        expect(resetInvocationCount).toBe(1);
    });

    it('invalidating a section makes the entire form invalid', (): void => {
        const section = new Form();
        const formCollection = new FormCollection([section]);

        section.error = 'invalid';

        expect(formCollection.isValid).toBeFalsy();
        expect(formCollection.isInvalid).toBeTruthy();
    });

    it('invalidating a section propagates property change notifications', (): void => {
        let invocationCount = 0;
        const section = new Form();
        const formCollection = new FormCollection([section]);
        formCollection.propertiesChanged.subscribe({
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
        const formCollection = new FormCollection();
        const formSection = new Form();
        formCollection.withItemSetup(
            section => {
                invocationCount++;
                expect(section).toStrictEqual(formSection);
            }
        );

        formCollection.push(formSection);

        expect(invocationCount).toBe(1);
    });

    it('removing a configuration callback reconfigures the section', () => {
        let setup1InvocationCount = 0;
        let setup2InvocationCount = 0;
        let resetInvocationCount = 0;
        const formCollection = new FormCollection();
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
        formCollection.withItemSetup(setup1);
        formCollection.withItemSetup(setup2);

        formCollection.push(formSection);

        formCollection.withoutItemSetup(setup2);

        expect(setup1InvocationCount).toBe(2);
        expect(resetInvocationCount).toBe(1);
        expect(setup2InvocationCount).toBe(1);
    });

    it('clearing configuration callbacks resets the section', () => {
        let resetInvocationCount = 0;
        const formCollection = new FormCollection();
        const formSection = new Form();
        formSection.reset = () => {
            resetInvocationCount++;
        }
        formCollection.withItemSetup(() => { });

        formCollection.push(formSection);
        formCollection.clearItemSetups();

        expect(resetInvocationCount).toBe(1);
    });

    it('resetting a collection resets all contained sections configurations', () => {
        let sectionResetInvocationCount = 0;
        let sectionSetupInvocationCount = 0;

        const section = new Form();
        section.reset = () => {
            sectionResetInvocationCount++;
        }
        const formCollection = new FormCollection([section]);
        formCollection.withItemSetup(
            () => { sectionSetupInvocationCount++; }
        );

        expect(sectionResetInvocationCount).toBe(0);
        expect(sectionSetupInvocationCount).toBe(1);

        formCollection.reset();
        formCollection.push(new Form());

        expect(sectionResetInvocationCount).toBe(1);
        expect(sectionSetupInvocationCount).toBe(1);
    });
});