import type { Compiler, Configuration } from 'webpack';
import path from 'path';
import { Application, CommentDisplayPart, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionKind, ReflectionSymbolId, SignatureReflection, SomeType, TypeParameterReflection } from 'typedoc';
import fs, { type MakeDirectoryOptions, type WriteFileOptions } from 'fs';

export default function (): Configuration {
    return {
        entry: './src/index.ts',
        mode: 'development',
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'lib'),
            clean: true,
            globalObject: 'this',
            library: {
                name: 'reactMVVM',
                type: 'umd'
            }
        },
        module: {
            rules: [
                {
                    use: 'ts-loader',
                    test: /\.tsx?$/,
                    exclude: /node_modules/
                }
            ]
        },
        externals: {
            react: {
                root: 'React',
                commonjs: 'react',
                commonjs2: 'react',
                amd: 'react'
            }
        },
        plugins: [
            new GenerateDocumentationPlugin()
        ]
    };
}

class GenerateDocumentationPlugin {
    private readonly _packageInfo: {
        readonly name: string;
        readonly version: string;
        readonly description: string;
        readonly homepage: string;

        readonly repository: {
            readonly url: string;
        }
    };
    private readonly _declarationsById: Map<number, DeclarationReflection>;
    private _documentationIndex: IDocumentationIndex = null!;

    public constructor() {
        this._packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')).toString());
        this._declarationsById = new Map<number, DeclarationReflection>();
    }

    public apply(compiler: Compiler): void {
        compiler.hooks.done.tapAsync('generate-documentation', async stats => {
            if (stats.hasErrors())
                console.error('Compilation has errors, did not generate documentation.');
            else {
                await this._initializeAsync();
                await this._generateDocumentationAsync();
            }
        })
    }

    private async _initializeAsync(): Promise<void> {
        const application = await Application.bootstrap();

        const project = await application.convert();
        if (!project)
            throw new Error('Could not parse project');

        this._declarationsById.clear();

        const toVisit = project.children?.slice() || [];
        while (toVisit.length > 0) {
            const declaration = toVisit.shift()!;
            if (declaration.variant === 'declaration')
                switch (declaration.kind) {
                    case ReflectionKind.TypeAlias:
                    case ReflectionKind.Interface:
                    case ReflectionKind.Class:
                    case ReflectionKind.Constructor:
                    case ReflectionKind.Property:
                    case ReflectionKind.Accessor:
                    case ReflectionKind.Method:
                    case ReflectionKind.Function:
                        this._declarationsById.set(declaration.id, declaration);
                        if (declaration.children && declaration.children.length > 0)
                            toVisit.push(...declaration.children);
                        break;

                    default:
                        console.warn(`Skipped '${declaration}' declaration.`);
                }
        }

        this._documentationIndex = new DocumentationIndex(this._declarationsById.values());
    }

    private async _generateDocumentationAsync(): Promise<void> {
        try {
            const outputDirectory = await this._createDirectoryAsync(path.join(__dirname, 'wiki'), { recursive: true });

            await this._writeFileAsync(path.join(__dirname, 'README.md'), this._getReadMe());
            await this._writeFileAsync(path.join(outputDirectory, 'Home.md'), this._getLandingPage());
            await this._writeFileAsync(path.join(outputDirectory, '_Sidebar.md'), this._getSidebar());
            await this._writeFileAsync(path.join(outputDirectory, '_Footer.md'), this._getFooter());

            await Promise.all(Array.from(this._declarationsById.values()).map(async declaration => {
                try {
                    const subDirectory1 = path.join(...declaration.sources!.at(0)!.fileName.split('/').slice(0, -1));
                    let subDirectory2: string;
                    let documentation: string | null = null;
                    switch (declaration.kind) {
                        case ReflectionKind.TypeAlias:
                            subDirectory2 = 'aliases';
                            documentation = this._getAliasDocumentation(declaration);
                            break;

                        case ReflectionKind.Interface:
                            subDirectory2 = 'interfaces';
                            documentation = this._getInterfaceDocumentation(declaration);
                            break;

                        case ReflectionKind.Class:
                            subDirectory2 = 'classes';
                            documentation = this._getClassDocumentation(declaration);
                            break;

                        case ReflectionKind.Constructor:
                            if (!declaration.flags.isInherited) {
                                subDirectory2 = 'constructors';
                                documentation = this._getConstructorDocumentation(declaration);
                            }
                            break;

                        case ReflectionKind.Property:
                        case ReflectionKind.Accessor:
                            if (!declaration.flags.isInherited) {
                                subDirectory2 = 'properties';
                                documentation = this._getPropertyDocumentation(declaration);
                            }
                            break;

                        case ReflectionKind.Method:
                            if (!declaration.flags.isInherited) {
                                subDirectory2 = 'methods';
                                documentation = this._getMethodDocumentation(declaration);
                            }
                            break;

                        case ReflectionKind.Function:
                            subDirectory2 = 'functions';
                            documentation = this._getFunctionDocumentation(declaration);
                            break;
                    }

                    if (documentation !== null) {
                        const directoryPath = path.join(outputDirectory, subDirectory1!, subDirectory2!);

                        await this._createDirectoryAsync(directoryPath, { recursive: true });
                        await this._writeFileAsync(path.join(directoryPath, `${this._getIdentifier(declaration)}.md`), documentation);
                    }
                }
                catch (error) {
                    throw new Error(`Could not generate documentation for '${declaration}' on '${declaration.parent}'.\n${error}.`);
                }
            }));
        }
        catch (error) {
            console.error(error);
        }
    }

    private _findDeclaration(target: Reflection | ReflectionSymbolId | string | undefined): DeclarationReflection {
        const declaration = this._declarationsById.get(
            (target as any)?.id
            || (target as any)?.getStableKey()
            || Number(target)
        );
        if (declaration === null || declaration === undefined)
            throw new Error(`Cannot find declaration with id (forgot to export it in root index.ts?) '${JSON.stringify(target)}'.`);

        return declaration;
    }

    private _getReadMe(): string {
        return (
            `${this._packageInfo.description}\n` +
            '\n' +
            [
                '[Guides and Tutorials - Getting Started](https://github.com/Andrei15193/react-model-view-viewmodel/discussions/7)',
                '[Project Discussions](https://github.com/Andrei15193/react-model-view-viewmodel/discussions)',
                '[Project Wiki](https://github.com/Andrei15193/react-model-view-viewmodel/wiki)',
                '[Releases](https://github.com/Andrei15193/react-model-view-viewmodel/releases)'
            ].join(' | ') + '\n' +
            '\n' +
            '**API**\n' +
            '\n' +
            this
                ._documentationIndex
                .namespaces
                .map(namespace => {
                    return `* **${namespace.name}**\n` + namespace
                        .declarations
                        .filter(declaration => declaration.promoted)
                        .map(declaration => `  * [${this._getSimpleName(declaration)}](${this._getProjectReferenceUrl(declaration)})`)
                        .join('\n');
                })
                .join('\n')
        );
    }

    private _getLandingPage(): string {
        return (
            `${this._packageInfo.description}\n` +
            '\n' +
            '### API\n\n' + this
                ._documentationIndex
                .namespaces
                .map(namespace => {
                    let listMarker = '*';

                    return `#### **${namespace.name}**\n` + namespace
                        .declarations
                        .map((declaration, declarationIndex, declarations) => {
                            if (declarationIndex > 0 && declarations[declarationIndex - 1].promoted !== declarations[declarationIndex].promoted)
                                listMarker = '-';

                            return `${listMarker} [${this._getSimpleName(declaration)}](${this._getProjectReferenceUrl(declaration)})`;
                        })
                        .join('\n');
                })
                .join('\n')
        );
    }

    private _getSidebar(): string {
        return (
            '**[Motivation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#motivation)**  \n'
            + '**[Overview](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#overview)**  \n'
            + '**[Guides and Tutorials - Getting Started](https://github.com/Andrei15193/react-model-view-viewmodel/discussions/7)**  \n'
            + '**[Releases](https://github.com/Andrei15193/react-model-view-viewmodel/releases)**\n'
            + '\n'
            + '**[API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api)**  \n'
            + this
                ._documentationIndex
                .namespaces
                .map(namespace => {
                    return `**${namespace.name}**  \n` + namespace
                        .declarations
                        .filter(declaration => declaration.promoted)
                        .map(declaration => `[${declaration.name}](${this._getProjectReferenceUrl(declaration)})`)
                        .join('  \n');
                })
                .join('\n\n')
        );
    }

    private _getFooter(): string {
        return [
            '[Guides and Tutorials - Getting Started](https://github.com/Andrei15193/react-model-view-viewmodel/discussions/7)',
            '[Motivation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#motivation)',
            '[Overview](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#overview)',
            '[API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api)',
            '[Releases](https://github.com/Andrei15193/react-model-view-viewmodel/releases)'
        ].join(' | ');
    }

    private _getAliasDocumentation(aliasDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${this._getFullName(aliasDeclaration)} alias

${this._getDeprecationNotice(aliasDeclaration)}

${this._getSummary(aliasDeclaration)}

\`\`\`ts
${this._getDeclaration(aliasDeclaration)}
\`\`\`

${this._getSourceReference(aliasDeclaration)}

${this._getGenericParameters(aliasDeclaration)}

${this._getDescription(aliasDeclaration)}

${this._getRemarks(aliasDeclaration)}

${this._getGuidance(aliasDeclaration)}

${this._getReferences(aliasDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getInterfaceDocumentation(interfaceDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${this._getFullName(interfaceDeclaration)} interface

${this._getDeprecationNotice(interfaceDeclaration)}

${this._getSummary(interfaceDeclaration)}

${this._getInheritaceAndImplementations(interfaceDeclaration)}

\`\`\`ts
${this._getDeclaration(interfaceDeclaration)}
\`\`\`

${this._getSourceReference(interfaceDeclaration)}

${this._getGenericParameters(interfaceDeclaration)}

${this._getDescription(interfaceDeclaration)}

${this._getRemarks(interfaceDeclaration)}

${this._getConstructorsList(interfaceDeclaration)}

${this._getPropertiesList(interfaceDeclaration)}

${this._getMethodsList(interfaceDeclaration)}

${this._getImplementations(interfaceDeclaration)}

${this._getGuidance(interfaceDeclaration)}

${this._getReferences(interfaceDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getClassDocumentation(classDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${this._getFullName(classDeclaration)} class

${this._getDeprecationNotice(classDeclaration)}

${this._getSummary(classDeclaration)}

${this._getInheritaceAndImplementations(classDeclaration)}

${classDeclaration.flags.isAbstract ? 'This is an abstract class.' : ''}

\`\`\`ts
${this._getDeclaration(classDeclaration)}
\`\`\`

${this._getSourceReference(classDeclaration)}

${this._getGenericParameters(classDeclaration)}

${this._getDescription(classDeclaration)}

${this._getRemarks(classDeclaration)}

${this._getConstructorsList(classDeclaration)}

${this._getPropertiesList(classDeclaration)}

${this._getMethodsList(classDeclaration)}

${this._getClassHierarchy(classDeclaration)}

${this._getGuidance(classDeclaration)}

${this._getReferences(classDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getConstructorDocumentation(constructorDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / [${this._getFullName(constructorDeclaration.parent as DeclarationReflection)}](${this._getProjectReferenceUrl(constructorDeclaration.parent as DeclarationReflection)}) / constructor

${constructorDeclaration.signatures && constructorDeclaration.signatures.length > 1 ? `This constructor has multiple overloads.\n\n----\n\n` : ''}

${(constructorDeclaration.signatures || []).map(this._getConstructorSignatureDocumentation, this).join('\n\n----\n\n')}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getConstructorSignatureDocumentation(constructorSignature: SignatureReflection): string {
        return `
${this._getDeprecationNotice(constructorSignature)}

${this._getSummary(constructorSignature)}

\`\`\`ts
${this._getDeclaration(constructorSignature)}
\`\`\`

${this._getSourceReference(constructorSignature)}

${this._getParameters(constructorSignature)}

${this._getDescription(constructorSignature)}

${this._getRemarks(constructorSignature)}

${this._getGuidance(constructorSignature)}

${this._getReferences(constructorSignature)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getPropertyDocumentation(propertyDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / [${this._getFullName(propertyDeclaration.parent as DeclarationReflection)}](${this._getProjectReferenceUrl(propertyDeclaration.parent as DeclarationReflection)}) / ${this._getSimpleName(propertyDeclaration)} property

${this._getDeprecationNotice(propertyDeclaration)}

${this._getSummary(propertyDeclaration)}

${propertyDeclaration.flags.isAbstract ? 'This is an abstract property.' : ''}

${this._getOverride(propertyDeclaration)}

${this._getPropertyType(propertyDeclaration)}

${propertyDeclaration.flags.isAbstract ? 'This is an abstract property.' : ''}

\`\`\`ts
${this._getDeclaration(propertyDeclaration)}
\`\`\`

${this._getSourceReference(propertyDeclaration)}

${this._getDescription(propertyDeclaration)}

${this._getRemarks(propertyDeclaration)}

${this._getGuidance(propertyDeclaration)}

${this._getReferences(propertyDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getMethodDocumentation(methodDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / [${this._getFullName(methodDeclaration.parent as DeclarationReflection)}](${this._getProjectReferenceUrl(methodDeclaration.parent as DeclarationReflection)}) / ${this._getSimpleName(methodDeclaration)} method

${this._getOverride(methodDeclaration)}

${methodDeclaration.signatures && methodDeclaration.signatures.length > 1 ? `This method has multiple overloads.\n\n----\n\n` : ''}

${(methodDeclaration.signatures || []).map(this._getMethodSignatureDocumentation, this).join('\n\n----\n\n')}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getMethodSignatureDocumentation(methodSignature: SignatureReflection): string {
        return `
${this._getDeprecationNotice(methodSignature)}

${this._getSummary(methodSignature)}

\`\`\`ts
${this._getDeclaration(methodSignature)}
\`\`\`

${this._getSourceReference(methodSignature)}

${this._getGenericParameters(methodSignature)}

${this._getParameters(methodSignature)}

${this._getReturn(methodSignature)}

${this._getDescription(methodSignature)}

${this._getRemarks(methodSignature)}

${this._getGuidance(methodSignature)}

${this._getReferences(methodSignature)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getFunctionDocumentation(functionDeclaration: DeclarationReflection): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${this._getFullName(functionDeclaration)} ${functionDeclaration.name.startsWith('use') ? 'hook' : 'function'}

${functionDeclaration.signatures && functionDeclaration.signatures.length > 1 ? `This ${functionDeclaration.name.startsWith('use') ? 'hook' : 'function'} has multiple overloads.\n\n----\n\n` : ''}

${(functionDeclaration.signatures || []).map(this._getFunctionSignatureDocumentation, this).join('\n\n----\n\n')}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getFunctionSignatureDocumentation(functionSignature: SignatureReflection): string {
        return `
${this._getDeprecationNotice(functionSignature)}

${this._getSummary(functionSignature)}

\`\`\`ts
${this._getDeclaration(functionSignature)}
\`\`\`

${this._getSourceReference(functionSignature)}

${this._getGenericParameters(functionSignature)}

${this._getParameters(functionSignature)}

${this._getReturn(functionSignature)}

${this._getDescription(functionSignature)}

${this._getRemarks(functionSignature)}

${this._getGuidance(functionSignature)}

${this._getReferences(functionSignature)}
`.replace(/\n{3,}/g, '\n\n').trim();
    }

    private _getIdentifier(declaration: DeclarationReflection): string {
        switch (declaration.kind) {
            case ReflectionKind.Constructor:
            case ReflectionKind.Property:
            case ReflectionKind.Accessor:
            case ReflectionKind.Method:
                if (declaration.flags.isInherited)
                    return declaration.inheritedFrom!.reflection!.parent!.name + '.' + declaration.name;
                else
                    return declaration.parent!.name + '.' + declaration.name;

            case ReflectionKind.Class:
            case ReflectionKind.Interface:
            case ReflectionKind.TypeParameter:
            case ReflectionKind.Function:
            case ReflectionKind.TypeAlias:
                return declaration.name;


            default:
                throw new Error(`Unhandled '${declaration}' declaration when trying to determine identifier.`);
        }
    }

    private _getFullName(declaration: DeclarationReflection): string {
        switch (declaration.kind) {
            case ReflectionKind.Constructor:
            case ReflectionKind.Property:
            case ReflectionKind.Accessor:
            case ReflectionKind.Method:
                return declaration.parent!.name + '.' + this._getSimpleName(declaration);

            case ReflectionKind.TypeAlias:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
            case ReflectionKind.Function:
                return this._getSimpleName(declaration);

            default:
                throw new Error(`Unhandled '${declaration}' declaration when trying to determine full name.`);
        }
    }

    private _getSimpleName(declaration: DeclarationReflection): string {
        if (declaration.typeParameters && declaration.typeParameters.length > 0)
            return `${declaration.name}\\<${declaration.typeParameters.map(typeParameter => typeParameter.name).join(', ')}\\>`;
        else
            return declaration.name;
    }

    private _getInheritaceAndImplementations(declaration: DeclarationReflection): string {
        try {
            let extensions = "";

            if (declaration.extendedTypes && declaration.extendedTypes.length > 0) {
                extensions += 'Extends ';
                extensions += declaration.extendedTypes.map(this._getReferenceLink, this).join(', ');
                extensions += '.';
            }

            if (declaration.implementedTypes && declaration.implementedTypes.length > 0) {
                if (extensions.length > 0)
                    extensions += '  \n';
                extensions += 'Implements ';
                extensions += declaration.implementedTypes.map(this._getReferenceLink, this).join(', ');
                extensions += '.';
            }

            return extensions;
        }
        catch (error) {
            throw new Error(`Could not generate inheritance and implementation information for ${declaration}.\n${error}`);
        }
    }

    private _getImplementations(declaration: DeclarationReflection): string {
        try {
            const implementations: ReferenceType[] = [];
            const toVisit = [declaration];
            do {
                const current = toVisit.shift()!;
                if (current.implementedBy && current.implementedBy.length > 0)
                    implementations.push(...current.implementedBy);

                if (current.extendedBy && current.extendedBy.length > 0)
                    toVisit.unshift(...current.extendedBy.map(extension => this._findDeclaration(extension.reflection)));
            } while (toVisit.length > 0);

            if (implementations.length > 0)
                return '### Implementations\n\n' +
                    implementations
                        .sort((left, right) => left.name.localeCompare(right.name, 'en-US'))
                        .map(implementation => `* ${this._getReferenceLink(implementation)}`)
                        .join('\n');
            else
                return '';
        }
        catch (error) {
            throw new Error(`Could not generate class hierarchy information for ${declaration}.\n${error}`);
        }
    }

    private _getClassHierarchy(declaration: DeclarationReflection): string {
        try {
            let root = declaration;
            while (root.extendedTypes && root.extendedTypes.length > 0)
                root = this._findDeclaration((root.extendedTypes[0]! as ReferenceType).reflection);

            let hirerachy = '### Inheritance Hierarchy\n\n';
            let level = 0;

            const toVisit: (DeclarationReflection | 'increment' | 'decrement')[] = [root];
            do {
                const current = toVisit.shift()!;

                switch (current) {
                    case 'increment':
                        level++;
                        break;

                    case 'decrement':
                        level--;
                        break;

                    default:
                        const prefix = '  '.repeat(level);
                        if (current === declaration)
                            hirerachy += `${prefix}* **${this._getSimpleName(current)}**\n`;
                        else
                            hirerachy += `${prefix}* [${this._getSimpleName(current)}](${this._getProjectReferenceUrl(current)})\n`;
                        if (current.extendedBy && current.extendedBy.length > 0) {
                            toVisit.unshift(
                                'increment',
                                ...current
                                    .extendedBy
                                    .map(derivative => this._findDeclaration(derivative.reflection)),
                                'decrement'
                            );
                        }
                        break;
                }
            } while (toVisit.length > 0)

            return hirerachy;
        }
        catch (error) {
            throw new Error(`Could not generate class hierarchy information for ${declaration}.\n${error}`);
        }
    }

    private _getOverride(declaration: DeclarationReflection): string {
        try {
            let override = '';

            if (declaration.parent?.kind !== ReflectionKind.Interface && declaration.overwrites) {
                let declarationName: string;
                switch (declaration.kind) {
                    case ReflectionKind.Property:
                    case ReflectionKind.Accessor:
                        declarationName = 'property';
                        break;

                    case ReflectionKind.Method:
                        declarationName = 'method';
                        break;

                    default:
                        throw new Error(`Unhandled '${declaration.kind}' overriden declaration.`);
                }

                override += `This ${declarationName} overrides [${this._getFullName(declaration.overwrites.reflection as DeclarationReflection)}](${this._getProjectReferenceUrl(declaration.overwrites)}).`;
            }

            return override;
        }
        catch (error) {
            throw new Error(`Could not generate override information for ${declaration}.\n${error}`);
        }
    }

    private _getPropertyType(declaration: DeclarationReflection): string {
        try {
            switch (declaration.kind) {
                case ReflectionKind.Property:
                    if (declaration.type)
                        return `Property type: ${this._getReferenceLink(declaration.type)}.`;
                    else
                        throw new Error(`Property '${declaration.name}' on ${declaration.parent?.name} has no type.`);

                case ReflectionKind.Accessor:
                    if (declaration.getSignature && declaration.getSignature.type)
                        return `Property type: ${this._getReferenceLink(declaration.getSignature.type)}.`;
                    else
                        throw new Error(`Property (accessor) '${declaration.name}' on ${declaration.parent?.name} has no type.`);

                default:
                    throw new Error(`Unhandled '${declaration.kind}' property type.`);
            }
        }
        catch (error) {
            throw new Error(`Could not generate property type information for ${declaration}.\n${error}`);
        }
    }

    private _getDeclaration(declaration: DeclarationReflection | SignatureReflection): string {
        switch (declaration.kind) {
            case ReflectionKind.TypeAlias:
                let aliasDeclaration = `type ${declaration.name}`;

                if (declaration.typeParameters && declaration.typeParameters.length > 0)
                    aliasDeclaration += `<${declaration.typeParameters.map(this._getTypeParameterDeclaration, this).join(', ')}>`;

                switch (declaration.type?.type) {
                    case 'union':
                        return aliasDeclaration
                            + '\n= '
                            + declaration
                                .type
                                .types
                                .map(type => {
                                    if (type.type === 'tuple')
                                        return `[\n    ${type.elements.map(this._getTypeReferenceDeclaration, this).join(',\n    ')}\n  ]`;
                                    else
                                        return this._getTypeReferenceDeclaration(type);
                                })
                                .join('\n| ')
                            + ';';

                    case 'reflection':
                        if (
                            declaration.type.declaration.kind === ReflectionKind.TypeLiteral
                            && declaration.type.declaration.signatures
                            && declaration.type.declaration.signatures.length === 1
                            && declaration.type.declaration.signatures.at(0)!.name === declaration.type.declaration.name
                        )
                            return aliasDeclaration + '\n  = ' + this._getTypeReferenceDeclaration(declaration.type!) + ';';
                        else
                            return aliasDeclaration + ' = ' + this._getTypeReferenceDeclaration(declaration.type!) + ';';

                    case 'indexedAccess':
                        return aliasDeclaration + '\n  = ' + this._getTypeReferenceDeclaration(declaration.type!) + ';';

                    default:
                        throw new Error(`Unhandled '${declaration.type?.type}' declaration type.`);
                }

            case ReflectionKind.Interface:
                let interfaceDeclaration = `interface ${declaration.name}`;

                if (declaration.typeParameters && declaration.typeParameters.length > 0)
                    interfaceDeclaration += `<${declaration.typeParameters.map(this._getTypeParameterDeclaration, this).join(', ')}>`;
                if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                    interfaceDeclaration += `\n    extends ${declaration.extendedTypes.map(this._getTypeReferenceDeclaration, this).join(', ')}`;

                return interfaceDeclaration;

            case ReflectionKind.Class:
                let classDeclaration = `class ${declaration.name}`;

                if (declaration.flags.isAbstract)
                    classDeclaration = 'abstract ' + classDeclaration;

                if (declaration.typeParameters && declaration.typeParameters.length > 0)
                    classDeclaration += `<${declaration.typeParameters.map(this._getTypeParameterDeclaration, this).join(', ')}>`;
                if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                    classDeclaration += `\n    extends ${declaration.extendedTypes.map(this._getTypeReferenceDeclaration, this).join(', ')}`;
                if (declaration.implementedTypes && declaration.implementedTypes.length > 0)
                    classDeclaration += `\n    implements ${declaration.implementedTypes.map(this._getTypeReferenceDeclaration, this).join(', ')}`;

                return classDeclaration;

            case ReflectionKind.ConstructorSignature:
                let constructorDeclaration = '';

                if (declaration.parent && declaration.parent.parent && declaration.parent.parent.kind !== ReflectionKind.Project) {
                    constructorDeclaration += [
                        declaration.parent.flags.isPrivate && 'private',
                        declaration.parent.flags.isProtected && 'protected',
                        declaration.parent.flags.isPublic && 'public',

                        declaration.parent.flags.isAbstract && 'abstract'
                    ]
                        .filter(flag => flag)
                        .join(' ');

                    if (constructorDeclaration.length > 0)
                        constructorDeclaration += ' ';
                }
                constructorDeclaration += 'constructor';

                const constructorParamters = (declaration as SignatureReflection)?.parameters || [];
                if (constructorParamters.length > 0) {
                    constructorDeclaration += '(\n  ';
                    constructorDeclaration += ((declaration as SignatureReflection)?.parameters || [])
                        .map(this._getParameterDeclaration, this)
                        .join(',\n  ');
                    constructorDeclaration += '\n)';
                }
                else
                    constructorDeclaration += '()';

                return constructorDeclaration;

            case ReflectionKind.Property:
                let propertyDeclaration: string = [
                    declaration.flags.isPrivate && 'private',
                    declaration.flags.isProtected && 'protected',
                    declaration.flags.isPublic && 'public',

                    declaration.flags.isAbstract && 'abstract',
                    declaration.flags.isStatic && 'static',

                    declaration.flags.isReadonly && 'readonly',
                    declaration.flags.isConst && 'const'
                ]
                    .filter(flag => flag)
                    .join(' ');

                propertyDeclaration += ` ${declaration.name}`;

                if (declaration.flags.isOptional)
                    propertyDeclaration += '?';

                if (declaration.type)
                    propertyDeclaration += ': ' + this._getTypeReferenceDeclaration(declaration.type);
                else
                    throw new Error(`Property '${declaration.name}' on '${declaration.parent?.name}' has no type.`);

                return propertyDeclaration;

            case ReflectionKind.Accessor:
                let signatures: string[] = [];

                if (declaration.getSignature) {
                    let getSignature = [
                        declaration.getSignature.flags.isPrivate && 'private',
                        declaration.getSignature.flags.isProtected && 'protected',
                        declaration.getSignature.flags.isPublic && 'public',

                        declaration.flags.isPrivate && 'private',
                        declaration.flags.isProtected && 'protected',
                        declaration.flags.isPublic && 'public'
                    ]
                        .filter(flag => flag)
                        .at(0) as string;

                    getSignature += [
                        declaration.flags.isAbstract && 'abstract',
                        declaration.flags.isStatic && 'static'
                    ]
                        .filter(flag => flag)
                        .join(' ');
                    getSignature += ' get ';
                    getSignature += declaration.name;
                    getSignature += '(): ';
                    if (declaration.getSignature.type)
                        getSignature += this._getTypeReferenceDeclaration(declaration.getSignature.type);
                    else
                        throw new Error(`Accessor '${declaration.name}' on '${declaration.parent?.name}' has no get type.`);

                    signatures.push(getSignature);
                }

                if (declaration.setSignature) {
                    let setSignature = [
                        declaration.setSignature.flags.isPrivate && 'private',
                        declaration.setSignature.flags.isProtected && 'protected',
                        declaration.setSignature.flags.isPublic && 'public',

                        declaration.flags.isPrivate && 'private',
                        declaration.flags.isProtected && 'protected',
                        declaration.flags.isPublic && 'public'
                    ]
                        .filter(flag => flag)
                        .at(0) as string;

                    setSignature += [
                        declaration.flags.isAbstract && 'abstract',
                        declaration.flags.isStatic && 'static'
                    ]
                        .filter(flag => flag)
                        .join(' ');
                    setSignature += ' set ';
                    setSignature += declaration.name;
                    setSignature += '(';
                    if (declaration.setSignature.parameters)
                        setSignature += declaration
                            .setSignature
                            .parameters
                            .map(parameter => `${parameter.name}: ${this._getTypeReferenceDeclaration(parameter.type!)}`);
                    else
                        throw new Error(`Accessor '${declaration.name}' on '${declaration.parent?.name}' has no set type.`);

                    setSignature += ')';

                    signatures.push(setSignature);
                }

                return signatures.join('\n');

            case ReflectionKind.CallSignature:
                let functionDeclaration = '';

                if (declaration.parent && declaration.parent.parent && declaration.parent.parent.kind !== ReflectionKind.Project) {
                    functionDeclaration += [
                        declaration.parent.flags.isPrivate && 'private',
                        declaration.parent.flags.isProtected && 'protected',
                        declaration.parent.flags.isPublic && 'public',

                        declaration.parent.flags.isAbstract && 'abstract'
                    ]
                        .filter(flag => flag)
                        .join(' ');

                    if (functionDeclaration.length > 0)
                        functionDeclaration += ' ';
                }
                else {
                    functionDeclaration += 'function ';
                }
                functionDeclaration += declaration.name;

                if (declaration.typeParameters && declaration.typeParameters.length > 0)
                    functionDeclaration += `<${declaration.typeParameters.map(this._getTypeParameterDeclaration, this).join(', ')}>`;

                const paramters = (declaration as SignatureReflection)?.parameters || [];
                if (paramters.length > 0) {
                    functionDeclaration += '(\n  ';
                    functionDeclaration += ((declaration as SignatureReflection)?.parameters || [])
                        .map(this._getParameterDeclaration, this)
                        .join(',\n  ');
                    functionDeclaration += '\n)';
                }
                else
                    functionDeclaration += '()';

                if (declaration.type)
                    functionDeclaration += ': ' + this._getTypeReferenceDeclaration(declaration.type);

                return functionDeclaration;

            default:
                throw new Error(`Unhandled '${declaration.kind}' declaration type.`);
        }
    }

    private _getTypeParameterDeclaration(typeParameter: TypeParameterReflection): string {
        let declaration = typeParameter.name;

        if (typeParameter.type)
            declaration += ' extends ' + this._getTypeReferenceDeclaration(typeParameter.type);
        if (typeParameter.default)
            declaration += ' = ' + this._getTypeReferenceDeclaration(typeParameter.default);

        return declaration;
    }

    private _getParameterDeclaration(parameter: ParameterReflection): string {
        let declaration = parameter.name;

        if (parameter.flags.isRest)
            declaration = '...' + declaration;

        if (parameter.flags.isOptional)
            declaration += '?';
        declaration += ': ';

        declaration += this._getTypeReferenceDeclaration(parameter.type!);

        if (parameter.defaultValue)
            declaration += ' = ' + parameter.defaultValue;

        return declaration;
    }

    private _getTypeReferenceDeclaration(typeReference: SomeType): string {
        switch (typeReference.type) {
            case 'reference':
                return `${typeReference.name}${typeReference.typeArguments && typeReference.typeArguments.length > 0 ? `<${typeReference.typeArguments.map(this._getTypeReferenceDeclaration, this).join(', ')}>` : ''}`;

            case 'reflection':
                switch (typeReference.declaration.kind) {
                    case ReflectionKind.TypeAlias:
                    case ReflectionKind.Class:
                    case ReflectionKind.Interface:
                        let typeReferenceDeclaration = typeReference.declaration.name;
                        if (typeReference.declaration.typeParameters && typeReference.declaration.typeParameters.length > 0) {
                            typeReferenceDeclaration += '<';
                            typeReferenceDeclaration += typeReference
                                .declaration
                                .typeParameters
                                .map(genericParameter => this._getTypeReferenceDeclaration(genericParameter.type!))
                                .join(', ');
                            typeReferenceDeclaration += '>';
                        }

                        return typeReferenceDeclaration;

                    case ReflectionKind.TypeLiteral:
                        if (typeReference.declaration.type)
                            return this._getTypeReferenceDeclaration(typeReference.declaration.type);
                        else if (typeReference.declaration.signatures) {
                            if (typeReference.declaration.signatures.length === 1 && typeReference.declaration.signatures.at(0)!.name === typeReference.declaration.name) {
                                const signature = typeReference.declaration.signatures.at(0)!
                                return `(${(signature.parameters || []).map(this._getParameterDeclaration, this).join(', ')}) => ${this._getTypeReferenceDeclaration(signature.type!)}`;
                            }
                            else {
                                let signaturesDeclarations = '{\n  ';
                                signaturesDeclarations += typeReference
                                    .declaration
                                    .signatures
                                    .map(signature => {
                                        if (signature.kind === ReflectionKind.ConstructorSignature)
                                            return `new (${(signature.parameters || []).map(this._getParameterDeclaration, this).join(', ')}): ${this._getTypeReferenceDeclaration(signature.type!)};`;
                                        else {
                                            const genericTypeDeclaration = signature.typeParameters?.map(this._getTypeParameterDeclaration, this).join(', ') || '';
                                            return `${signature.name}${genericTypeDeclaration.length > 0 ? '<' + genericTypeDeclaration + '>' : ''}(${(signature.parameters || []).map(this._getParameterDeclaration, this).join(', ')}): ${this._getTypeReferenceDeclaration(signature.type!)};`;
                                        }
                                    })
                                    .join('\n  ');
                                signaturesDeclarations += '\n}';

                                return signaturesDeclarations;
                            }
                        }
                        else
                            throw new Error(`Unhandled '${typeReference.declaration}' type literal reflection reference declaration.`);

                    case ReflectionKind.IndexSignature:
                        return typeReference.declaration.name;

                    default:
                        throw new Error(`Unhandled '${typeReference.declaration}' reflection reference declaration.`);
                }

            case 'intersection':
                return typeReference.types.map(this._getTypeReferenceDeclaration, this).join(' | ');

            case 'union':
                return typeReference.types.map(this._getTypeReferenceDeclaration, this).join(' | ');

            case 'intrinsic':
                return typeReference.name;

            case 'unknown':
                return 'unknown';

            case 'literal':
                if (typeReference.value === null)
                    return 'null';
                else if (typeReference.value === 'propertiesChanged')
                    return 'keyof this';
                else switch (typeof typeReference.value) {
                    case 'string':
                        return `"${typeReference.value}"`;

                    case 'number':
                    case 'bigint':
                    case 'boolean':
                        return typeReference.value.toString();

                    default:
                        throw new Error(`Unhandled '${typeof typeReference.value}' (${typeReference.value}) literal value.`);
                }

            case 'tuple':
                return `[${typeReference.elements.map(this._getTypeReferenceDeclaration, this).join(', ')}]`;

            case 'typeOperator':
                return `${typeReference.operator} ${this._getTypeReferenceDeclaration(typeReference.target)}`;

            case 'array':
                switch (typeReference.elementType.type) {
                    case 'reference':
                    case 'reflection':
                    case 'intrinsic':
                        return `${this._getTypeReferenceDeclaration(typeReference.elementType)}[]`;

                    case 'literal':
                        if (typeReference.elementType.value === 'propertiesChanged')
                            return '(keyof this)[]';
                        else
                            return `${this._getTypeReferenceDeclaration(typeReference.elementType)}[]`;

                    default:
                        return `(${this._getTypeReferenceDeclaration(typeReference.elementType)})[]`;
                }

            case 'predicate':
                if (typeReference.targetType)
                    return `${typeReference.name} is ${this._getTypeReferenceDeclaration(typeReference.targetType)}`;
                else
                    throw new Error('Unhandled predicate type declaration.');

            case 'indexedAccess':
                return this._getTypeReferenceDeclaration(typeReference.objectType) + `[${this._getTypeReferenceDeclaration(typeReference.indexType)}]`;

            default:
                throw new Error(`Unhandled '${typeReference.type}' type declaration.`);
        }
    }

    private _getReferenceUrl(typeReference: ReferenceType): string {
        switch (typeReference.package) {
            case this._packageInfo.name:
                return this._getProjectReferenceUrl(typeReference);

            case 'typescript':
                switch (typeReference.name) {
                    case 'Exclude':
                        return 'https://www.typescriptlang.org/docs/handbook/utility-types.html#excludeuniontype-excludedmembers';

                    case 'Iterable':
                        return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol';

                    case 'IterableIterator':
                        return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol';

                    case 'ArrayLike':
                        return 'https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects';

                    case 'Map':
                        return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map';

                    case 'Set':
                        return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set';

                    default:
                        throw new Error(`Could not determine URL for TypeScript reference '${typeReference.name}'.`);
                }

            case '@types/react':
                switch (typeReference.name) {
                    case 'PropsWithChildren':
                        return 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children';

                    case 'DependencyList':
                        return 'https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code';

                    case 'JSX.Element':
                        return 'https://react.dev/learn/writing-markup-with-jsx';

                    default:
                        throw new Error(`Could not determine URL for React reference '${typeReference.name}'.`);
                }

            default:
                throw new Error(`Could not determine URL for '${typeReference}' in package '${typeReference.package}'.`);
        }
    }

    private _getProjectReferenceUrl(typeReferenceOrDeclaration: ReferenceType | DeclarationReflection) {
        try {
            let declaration: DeclarationReflection | null = null;
            if (typeReferenceOrDeclaration.visit)
                typeReferenceOrDeclaration.visit({
                    declaration(foundDeclaration) {
                        declaration = foundDeclaration;
                    },
                    reference: () => {
                        if (!(typeReferenceOrDeclaration as ReferenceType).reflection)
                            declaration = this._findDeclaration((typeReferenceOrDeclaration as ReferenceType).symbolId);
                        else
                            declaration = this._findDeclaration((typeReferenceOrDeclaration as ReferenceType).reflection);
                    }
                });
            else
                declaration = typeReferenceOrDeclaration as DeclarationReflection;

            if (declaration !== null)
                return `${this._packageInfo.homepage}/${this._getIdentifier(declaration)}`;
        }
        catch (error) {
            throw new Error(`Could not get project reference url for '${typeReferenceOrDeclaration}').\n${error}`);
        }

        throw new Error(`Unhandled '${typeReferenceOrDeclaration}' reference type.`);
    }

    private _getReferenceLink(typeReference: SomeType): string {
        try {
            switch (typeReference.type) {
                case 'reference':
                    if (!typeReference.package) {
                        if (typeReference.reflection)
                            return `[${this._getSimpleName(typeReference.reflection as DeclarationReflection)}](${this._getProjectReferenceUrl(typeReference.reflection as DeclarationReflection)})`;

                        switch (typeReference.name) {
                            case 'ArrayLike.length':
                                return '[ArrayLike.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/length) ([ArrayLike](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects))';
                        }
                    }

                    let typeReferenceLink = typeReference.refersToTypeParameter
                        ? `_${typeReference.name}_`
                        : `[${typeReference.name}](${this._getReferenceUrl(typeReference)})`;

                    if (typeReference.typeArguments && typeReference.typeArguments.length > 0) {
                        typeReferenceLink += '\\<';
                        typeReferenceLink += typeReference.typeArguments.map(this._getReferenceLink, this).join(', ');
                        typeReferenceLink += '\\>';
                    }

                    return typeReferenceLink;

                case 'tuple':
                    return `\\[${typeReference.elements.map(this._getReferenceLink, this).join(', ')}\\]`;

                case 'intersection':
                    return typeReference.types.map(this._getReferenceLink, this).join(' & ');

                case 'union':
                    return typeReference.types.map(this._getReferenceLink, this).join(' | ');

                case 'typeOperator':
                    let operatorLink: string;
                    switch (typeReference.operator) {
                        case 'readonly':
                            operatorLink = '[`readonly`](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#readonly-and-const)';
                            break;

                        case 'keyof':
                            operatorLink = '[`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)';
                            break;

                        default:
                            throw new Error(`Unhandled '${typeReference.operator}' type operator link.`);
                    }

                    return `${operatorLink} ${this._getReferenceLink(typeReference.target)}`;

                case 'array':
                    switch (typeReference.elementType.type) {
                        case 'reference':
                        case 'reflection':
                        case 'intrinsic':
                            return `${this._getReferenceLink(typeReference.elementType)}[]`;

                        case 'literal':
                            if (typeReference.elementType.value === 'propertiesChanged')
                                return `(${this._getReferenceLink(typeReference.elementType)})[]`;
                            else
                                return `${this._getReferenceLink(typeReference.elementType)}[]`;

                        default:
                            return `(${this._getReferenceLink(typeReference.elementType)})[]`;
                    }

                case 'intrinsic':
                    switch (typeReference.name) {
                        case 'this':
                            return '[`this`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)';

                        case 'undefined':
                            return '[`undefined`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)';

                        case 'string':
                            return '[`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)';

                        case 'boolean':
                            return '[`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)';

                        case 'number':
                            return '[`number`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)';

                        case 'unknown':
                            return '[`unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)';

                        case 'any':
                            return '[`any`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)';

                        case 'void':
                            return '[`void`](https://www.typescriptlang.org/docs/handbook/2/functions.html#void)';

                        default:
                            throw new Error(`'Unhandled '${typeReference.name}' intrinsic type reference.'`);
                    }

                case 'unknown':
                    return '[`unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)';

                case 'literal':
                    switch (typeReference.value) {
                        case null:
                            return '[`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)';

                        case 'propertiesChanged':
                            return '[`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) [`this`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)';

                        default:
                            throw new Error(`Unhandled '${typeReference.value}' literal value.`);
                    }

                case 'predicate':
                    if (typeReference.targetType)
                        return `\`${typeReference.name}\` is ${this._getReferenceLink(typeReference.targetType)}`;
                    else
                        throw new Error('Unhandled predicate type reference.');

                case 'reflection':
                    const declaration = typeReference.declaration;
                    switch (declaration.kind) {
                        case ReflectionKind.TypeLiteral:
                            if (declaration.signatures)
                                return declaration
                                    .signatures
                                    .map(signature => {
                                        return '(' +
                                            (signature.parameters || [])
                                                .map(parameter => parameter.name +
                                                    (parameter.flags.isOptional ? '?: ' : ':') +
                                                    this._getReferenceLink(parameter.type!)
                                                )
                                                .join(', ') +
                                            ') => ' +
                                            this._getReferenceLink(signature.type!)
                                    })
                                    .join(' | ');
                            else
                                throw new Error(`Unhandled '${declaration}' type literal reflection reference.`)

                        default:
                            throw new Error(`Unhandled '${typeReference.declaration.kind}' reflection type reference.`);
                    }

                default:
                    throw new Error(`Unhandled '${typeReference.type}' type reference for '${typeReference}'.`);
            }
        }
        catch (error) {
            throw new Error(`Could not get a reference link for '${typeReference}'.\n${error}`)
        }
    }

    private _getDeprecationNotice(declaration: DeclarationReflection | SignatureReflection): string {
        if (declaration.isDeprecated()) {
            let declarationName: string;
            switch (declaration.kind) {
                case ReflectionKind.Class:
                    declarationName = 'class';
                    break;

                default:
                    throw new Error(`Unhandled '${declaration.kind}' deprecated declaration.`);
            }

            let deprecationNotice = '\n----\n\n';
            deprecationNotice += `**This ${declarationName} has been deprecated.**`;

            const deprecationDescription = this._getBlock(declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@deprecated')?.content);
            if (deprecationDescription.length > 0)
                deprecationNotice += '  \n' + deprecationDescription;

            deprecationNotice += '\n\n----\n';

            return deprecationNotice;
        }
        else
            return '';
    }

    private _getSummary(declaration: DeclarationReflection | SignatureReflection): string {
        try {
            if (
                'signatures' in declaration
                && declaration.signatures
                && declaration.signatures.length > 0
                && declaration.signatures.at(0)!.comment
                && declaration.signatures.at(0)!.comment!.summary)
                return this._getBlock(declaration.signatures.at(0)!.comment!.summary);
            else if (declaration.comment && declaration.comment.summary)
                return this._getBlock(declaration.comment.summary);
            else
                return '';
        }
        catch (error) {
            throw new Error(`Could not process '${declaration}' declaration summary.\n${error}`);
        }
    }

    private _getDescription(declaration: DeclarationReflection | SignatureReflection): string {
        try {
            const description = declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@description');
            if (description !== null && description !== undefined && description.content.length > 0)
                return '### Description\n\n' + this._getBlock(description.content);
            else
                return '';
        }
        catch (error) {
            throw new Error(`Could not process '${declaration}' declaration description.\n${error}`);
        }
    }

    private _getRemarks(declaration: DeclarationReflection | SignatureReflection): string {
        try {
            const remarks = declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@remarks');
            if (remarks !== null && remarks !== undefined && remarks.content.length > 0)
                return '### Remarks\n\n' + this._getBlock(remarks.content);
            else
                return '';
        }
        catch (error) {
            throw new Error(`Could not process '${declaration}' declaration description.\n${error}`);
        }
    }

    private _getGuidance(declaration: DeclarationReflection | SignatureReflection): string {
        const examples = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@guidance') || [];

        return examples
            .map(example => {
                const [title, ...content] = this._getBlock(example.content).split('\n');
                return `### Guidance: ${title.trim()}\n\n${content.join('\n').trim()}`;
            })
            .join('\n');
    }

    private _getGenericParameters(declaration: DeclarationReflection | SignatureReflection): string {
        if (declaration.typeParameters && declaration.typeParameters.length > 0) {
            return '### Generic Parameters\n\n' + declaration
                .typeParameters
                .map(
                    typeParameter => {
                        let genericParameter = `* **${typeParameter.name}**`;
                        let genericParameterDescription = this._getBlock(typeParameter.comment?.summary);

                        if (genericParameterDescription.length > 0)
                            genericParameter += ' - ' + genericParameterDescription;

                        genericParameter = genericParameter.replace(/(\r?\n\r?)*$/, '');

                        const genericParameterConstraints = [
                            typeParameter.type && `  Type constraints: ${this._getReferenceLink(typeParameter.type)}.`,
                            typeParameter.default && `  Default value: ${this._getReferenceLink(typeParameter.default)}.`
                        ]
                            .filter(description => description)
                            .join('  \n');
                        if (genericParameterConstraints.length > 0)
                            genericParameter += '\n\n' + genericParameterConstraints;

                        return genericParameter;
                    },
                ).join('\n\n');
        }
        else
            return '';
    }

    private _getParameters(declaration: SignatureReflection): string {
        if (declaration.parameters && declaration.parameters.length > 0) {
            return '### Parameters\n\n' + declaration
                .parameters
                .map(
                    parameterDeclaration => {
                        let parameter = `* **${parameterDeclaration.name}**${parameterDeclaration.flags.isRest ? ' ([rest](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/rest_parameters))' : ''}: ${this._getReferenceLink(parameterDeclaration.type!)}`;
                        let parameterDescription = this._getBlock(parameterDeclaration.comment?.summary);

                        if (parameterDescription.length > 0)
                            parameter += '  \n' + parameterDescription;

                        if (parameterDeclaration.defaultValue)
                            parameter += `\n\n  Default value: \`${parameterDeclaration.defaultValue}\`.`;

                        return parameter;
                    },
                ).join('\n\n');
        }
        else
            return '';
    }

    private _getReturn(declaration: SignatureReflection): string {
        if (declaration.type) {
            let returnDocumentation = `### Returns: ${this._getReferenceLink(declaration.type)}`;
            const returnDescription = this._getBlock(declaration.comment?.blockTags.find(blocKTag => blocKTag.tag === '@returns')?.content);
            if (returnDescription.length > 0)
                returnDocumentation += '\n\n' + returnDescription;
            else if (declaration.type.type === 'intrinsic' && declaration.type.name === 'void')
                return '';

            return returnDocumentation;
        }
        else
            return '';
    }

    private _getConstructorsList(declaration: DeclarationReflection): string {
        const constructors = declaration
            .children
            ?.filter(childDeclaration => childDeclaration.kind === ReflectionKind.Constructor && !childDeclaration.flags.isInherited && !childDeclaration.flags.isPrivate)
            .sort(this._sortCompareDeclarations.bind(this));

        if (constructors !== null && constructors !== undefined && constructors.length > 0) {
            return '### Constructors\n\n' + constructors
                .map(constructorDeclaration => {
                    const summary = this._getSummary(constructorDeclaration).split('\n')[0].trim();
                    return `* ${this._getFlagSummary(constructorDeclaration)}**[${constructorDeclaration.name}](${this._getProjectReferenceUrl(constructorDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                })
                .join('\n')
        }
        else
            return '';
    }

    private _getPropertiesList(declaration: DeclarationReflection): string {
        const properties = declaration
            .children
            ?.filter(childDeclaration => (childDeclaration.kind === ReflectionKind.Property || childDeclaration.kind === ReflectionKind.Accessor) && !childDeclaration.flags.isPrivate)
            .sort(this._sortCompareDeclarations.bind(this));

        if (properties !== null && properties !== undefined && properties.length > 0) {
            return '### Properties\n\n' + properties
                .map(propertyDeclaration => {
                    const summary = this._getSummary(propertyDeclaration).split('\n')[0].trim();
                    return `* ${this._getFlagSummary(propertyDeclaration)}**[${propertyDeclaration.name}](${this._getProjectReferenceUrl(propertyDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                })
                .join('\n')
        }
        else
            return '';
    }

    private _getMethodsList(declaration: DeclarationReflection): string {
        const methods = declaration
            .children
            ?.filter(childDeclaration => childDeclaration.kind === ReflectionKind.Method && !childDeclaration.flags.isInherited && !childDeclaration.flags.isPrivate)
            .sort(this._sortCompareDeclarations.bind(this));

        if (methods !== null && methods !== undefined && methods.length > 0) {
            return '### Methods\n\n' + methods
                .map(methodDeclaration => {
                    const summary = this._getSummary(methodDeclaration).split('\n')[0].trim();
                    return `* ${this._getFlagSummary(methodDeclaration)}**[${methodDeclaration.name}](${this._getProjectReferenceUrl(methodDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                })
                .join('\n')
        }
        else
            return '';
    }

    private _getFlagSummary(declaration: DeclarationReflection): string {
        let flagsSummary = [
            declaration.kind !== ReflectionKind.Constructor && declaration.parent?.kind !== ReflectionKind.Interface && declaration.overwrites && '`override`',
            declaration.flags.isInherited && '`inherited`',
            declaration.flags.isStatic && '`static`',
            declaration.flags.isAbstract && '`abstract`',
            declaration.flags.isPrivate && '`private`',
            declaration.flags.isProtected && '`protected`',
            declaration.flags.isReadonly && '`readonly`',
            declaration.flags.isOptional && '`optional`'
        ]
            .filter(value => !!value)
            .join(' ');

        if (flagsSummary.length > 0)
            flagsSummary += ' ';

        return flagsSummary;
    }

    private _sortCompareDeclarations(left: DeclarationReflection, right: DeclarationReflection): number {
        return (
            this._getInheritedSortOrder(left) - this._getInheritedSortOrder(right)
            || this._getStaticSortOrder(left) - this._getStaticSortOrder(right)
            || this._getAccessModifierSortOrder(left) - this._getAccessModifierSortOrder(right)
            || left.name.localeCompare(right.name, 'en-US')
        );
    }

    private _getInheritedSortOrder(declaration: DeclarationReflection): number {
        if (declaration.flags.isInherited)
            return 1;

        return 0;
    }

    private _getStaticSortOrder(declaration: DeclarationReflection): number {
        if (declaration.flags.isStatic)
            return 0;

        return 1;
    }

    private _getAccessModifierSortOrder(declaration: DeclarationReflection): number {
        if (declaration.flags.isPrivate)
            return 2;
        if (declaration.flags.isProtected)
            return 1;

        return 0;
    }

    private _getReferences(declaration: DeclarationReflection | SignatureReflection): string {
        const references = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@see') || [];
        if (references.length > 0)
            return '### See also\n\n' +
                references
                    .map(
                        reference => this._getBlock(reference.content)
                            .split(/^[ \t]*-[ \t]*/gm)
                            .filter(reference => reference)
                            .map(reference => '* ' + reference)
                            .join('')
                    )
                    .join('');
        else
            return '';
    }

    private _getBlock(comments: readonly CommentDisplayPart[] | null | undefined): string {
        if (comments === null || comments === undefined || comments.length === 0)
            return '';

        return comments
            .reduce((result, comment) => result + this._getCommentMarkdown(comment), '')
            .replace(/^----$/gm, '');
    }

    private _getCommentMarkdown(comment: CommentDisplayPart): string {
        try {
            switch (comment.kind) {
                case 'text':
                    return comment.text;

                case 'code':
                    return `\`${comment.text}\``;

                case 'inline-tag':
                    switch (comment.tag) {
                        case '@link':
                        case '@linkcode':
                            const getDisplayText = (text: string): string => (
                                comment.tag === '@linkcode'
                                    ? `\`${text.replace(/\\(.)/g, '$1')}\``
                                    : text
                            );

                            if (comment.target && 'qualifiedName' in (comment.target as any)) {
                                const declarationReference = (comment.target as ReflectionSymbolId).toDeclarationReference();
                                if (declarationReference.resolutionStart === 'global')
                                    switch (declarationReference.moduleSource) {
                                        case 'typescript':
                                            const typeScriptReference = declarationReference.symbolReference?.path?.map(componentPath => componentPath.path).join('.') || '';
                                            switch (typeScriptReference) {
                                                case 'String':
                                                    return `[${getDisplayText('String')}](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)`;
                                            }

                                        case '@types/react':
                                            switch (declarationReference.symbolReference?.path?.at(-1)!.path) {
                                                case 'useMemo':
                                                    return `[${getDisplayText('useMemo')}](https://react.dev/reference/react/useMemo)`;

                                                default:
                                                    throw new Error(`Unhandled '${comment.target}' React reference.`);
                                            }
                                    }
                            }

                            const reflectionTarget = comment.target as Reflection;
                            if (reflectionTarget.kind === ReflectionKind.TypeParameter)
                                return getDisplayText(reflectionTarget.name);

                            const targetDeclaration = this._findDeclaration(comment.target);
                            return `[${getDisplayText(this._getFullName(targetDeclaration))}](${this._getProjectReferenceUrl(targetDeclaration)})`;

                        default:
                            throw new Error(`Unhandled '${comment.tag}' inline-tag.`);
                    }

                default:
                    throw new Error(`Unhandled '${comment.kind}' comment kind.`);
            }
        }
        catch (error) {
            throw new Error(`Could not process '${comment}' comment\n${error}`);
        }
    }

    private _getSourceReference(declaration: DeclarationReflection | SignatureReflection): string {
        if (declaration.sources && declaration.sources.length > 0) {
            const repositoryUrlPath = `${this._packageInfo.repository.url.split('+').at(-1)!.split('.git')[0]}/tree/${this._packageInfo.version}/src`;

            if (declaration.sources.length === 1) {
                const [{ fileName, line }] = declaration.sources;
                return `Source reference: [\`src/${fileName}:${line}\`](${repositoryUrlPath}/${fileName}#L${line}).`;
            }
            else {
                return 'Source references:\n' + declaration
                    .sources
                    .map(({ fileName, line }) => `* [\`src/${fileName}:${line}\`](${repositoryUrlPath}/${fileName}#L${line})`)
                    .join('\n')
            }
        }
        else
            return '';
    }

    private _createDirectoryAsync(path: string, options?: MakeDirectoryOptions & { recursive: true; }): Promise<string> {
        return new Promise<string>((resolve, reject) => fs.mkdir(path, options, error => {
            if (error)
                reject(error);
            else
                resolve(path);
        }));
    }

    private _writeFileAsync(path: string, contents: string, options: WriteFileOptions = "utf-8"): Promise<void> {
        return new Promise<void>((resolve, reject) => fs.writeFile(path, contents, options, error => {
            if (error)
                reject(error);
            else
                resolve();
        }))
    }
}

class DocumentationIndex implements IDocumentationIndex {
    public constructor(declarations: Iterable<DeclarationReflection>) {
        const documentationIndex = DocumentationIndex.getDeclarationIndex(declarations);

        this.namespaces = documentationIndex
            .namespaces
            .map(namespace => ({
                name: DocumentationIndex.getNamespaceDisplayName(namespace.id),
                declarations: namespace
                    .modules
                    .reduce(
                        (declarations, module) => declarations.concat(module.declarations),
                        new Array<DeclarationReflection>()
                    )
                    .map(declaration => Object.assign({}, declaration, { promoted: DocumentationIndex.getDeclarationPromotionSortOrder(declaration) !== null }))
                    .sort((left, right) => {
                        const leftSortOrder = DocumentationIndex.getDeclarationPromotionSortOrder(left);
                        const rightSortOrder = DocumentationIndex.getDeclarationPromotionSortOrder(right);

                        if (leftSortOrder === null)
                            return rightSortOrder === null ? 0 : 1;
                        else if (rightSortOrder === null)
                            return -1;
                        else
                            return leftSortOrder - rightSortOrder;
                    })
            }));
    }

    public readonly namespaces: readonly INamespaceDocumentationIndex[];

    private static getDeclarationIndex(declarations: Iterable<DeclarationReflection>): IDeclarationIndex {
        return {
            namespaces: Array
                .from(declarations)
                .filter(declaration => {
                    switch (declaration.kind) {
                        case ReflectionKind.TypeAlias:
                        case ReflectionKind.Interface:
                        case ReflectionKind.Class:
                        case ReflectionKind.Function:
                            return true;

                        default:
                            return false;
                    }
                })
                .reduce(
                    (namespaces, declaration) => {
                        let namespaceId = declaration.sources?.at(0)?.fileName.split('/').slice(0, -1).join('/')!;
                        if (namespaceId === 'validation/objectValidator')
                            namespaceId = 'validation';

                        const moduleId = declaration.sources?.at(0)?.fileName!;
                        let namespace = namespaces.find(namespace => namespace.id === namespaceId);
                        if (!namespace) {
                            namespace = {
                                id: namespaceId,
                                modules: []
                            };
                            namespaces.push(namespace);
                        }

                        let module = namespace.modules.find(module => module.id === moduleId);
                        if (!module) {
                            module = {
                                id: moduleId,
                                declarations: []
                            };
                            namespace.modules.push(module);
                        }

                        module.declarations.push(declaration)

                        return namespaces;
                    },
                    new Array<INamespaceDeclarationIndex>()
                )
                .sort((left, right) => DocumentationIndex.getNamespaceSortOrder(left.id) - DocumentationIndex.getNamespaceSortOrder(right.id))
                .map(namespace => {
                    namespace
                        .modules
                        .sort((left, right) => DocumentationIndex.getModuleSortOrder(left) - DocumentationIndex.getModuleSortOrder(right))
                        .forEach(module => {
                            module.declarations.sort((left, right) => DocumentationIndex.getDeclarationSortOrder(left) - DocumentationIndex.getDeclarationSortOrder(right))
                        });

                    return namespace;
                })
        };
    }

    private static getNamespaceSortOrder(namespaceId: string): number {
        switch (namespaceId) {
            case 'events':
                return 1;

            case 'viewModels':
                return 2;

            case 'forms':
                return 3;

            case 'validation':
                return 4;
            case 'validation/triggers':
                return 6;

            case 'collections/observableCollections':
                return 7;
            case 'collections/observableMap':
                return 8;
            case 'collections/observableSet':
                return 9;

            case 'dependencies':
                return 10;

            case 'hooks':
                return 11;

            default:
                return 1000;
        }
    }

    private static getNamespaceDisplayName(namespaceId: string): string {
        switch (namespaceId) {
            case 'events':
                return 'Events';

            case 'viewModels':
                return 'ViewModels';

            case 'forms':
                return 'Forms';

            case 'validation':
                return 'Validation';
            case 'validation/triggers':
                return 'Validation / Triggers';

            case 'collections/observableCollections':
                return 'Observable Collection';
            case 'collections/observableMap':
                return 'Observable Map';
            case 'collections/observableSet':
                return 'Observable Set';

            case 'dependencies':
                return 'Dependency Handling';

            case 'hooks':
                return 'React Hooks';

            default:
                throw new Error(`Unhandled '${namespaceId}' namespace ID.`);
        }
    }

    private static getModuleSortOrder(module: IModuleDeclarationIndex): number {
        if (module.declarations.every(declaration => declaration.kind === ReflectionKind.TypeAlias))
            return 1;
        if (module.declarations.every(declaration => declaration.kind === ReflectionKind.Interface))
            return 2;
        if (module.declarations.every(declaration => declaration.kind === ReflectionKind.TypeAlias || declaration.kind === ReflectionKind.Interface))
            return 3;

        return 1000;
    }

    private static getDeclarationSortOrder(declaration: DeclarationReflection): number {
        switch (declaration.kind) {
            case ReflectionKind.Interface:
                return 1;

            case ReflectionKind.TypeAlias:
                return 2;

            case ReflectionKind.Class:
                return 3;

            case ReflectionKind.Function:
                return 4;

            default:
                return 1000;
        }
    }

    private static getDeclarationPromotionSortOrder(declaration: DeclarationReflection): number | null {
        switch (declaration.name) {
            case 'IEvent':
                return 1;
            case 'IEventHandler':
                return 2;
            case 'EventDispatcher':
                return 3;

            case 'INotifyPropertiesChanged':
                return 1;
            case 'ViewModel':
                return 2;

            case 'Form':
                return 1;
            case 'IFormFieldConfig':
                return 2;
            case 'FormField':
                return 3;
            case 'ReadOnlyFormCollection':
                return 4;
            case 'FormCollection':
                return 5;
            case 'IConfigurableFormCollection':
                return 6;
            case 'FormSetupCallback':
                return 7;

            case 'IValidator':
                return 1;
            case 'ValidatorCallback':
                return 2;
            case 'IObjectValidator':
                return 3;
            case 'IValidatable':
                return 4;

            case 'WellKnownValidationTrigger':
                return 1;
            case 'ValidationTrigger':
                return 2;

            case 'ReadOnlyObservableCollection':
                return 1;
            case 'ObservableCollection':
                return 2;
            case 'INotifyCollectionChanged':
                return 3;
            case 'CollectionChangeOperation':
                return 4;
            case 'INotifyCollectionReordered':
                return 5;
            case 'CollectionReorderOperation':
                return 6;

            case 'ReadOnlyObservableMap':
                return 1;
            case 'ObservableMap':
                return 2;
            case 'INotifyMapChanged':
                return 3;
            case 'MapChangeOperation':
                return 4;

            case 'ReadOnlyObservableSet':
                return 1;
            case 'ObservableSet':
                return 2;
            case 'INotifySetChanged':
                return 3;
            case 'SetChangeOperation':
                return 4;

            case 'IDependencyResolver':
                return 1;
            case 'IDependencyContainer':
                return 2;
            case 'DependencyContainer':
                return 3;
            case 'useDependency':
                return 4;
            case 'useViewModelDependency':
                return 5;
            case 'useDependencyResolver':
                return 6;

            case 'useViewModel':
                return 1;
            case 'useViewModelMemo':
                return 2;
            case 'useObservableCollection':
                return 3;
            case 'useObservableMap':
                return 4;
            case 'useObservableSet':
                return 5;

            default:
                return null;
        }
    }
}

interface IDocumentationIndex {
    readonly namespaces: readonly INamespaceDocumentationIndex[];
}

interface INamespaceDocumentationIndex {
    readonly name: string;
    readonly declarations: readonly (DeclarationReflection & { readonly promoted: boolean })[];
}

interface IDeclarationIndex {
    readonly namespaces: readonly INamespaceDeclarationIndex[];
}

interface INamespaceDeclarationIndex {
    readonly id: string;
    readonly modules: IModuleDeclarationIndex[];
}

interface IModuleDeclarationIndex {
    readonly id: string;
    readonly declarations: DeclarationReflection[];
}