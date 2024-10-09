import { Application, CommentDisplayPart, DeclarationReflection, IntersectionType, IntrinsicType, ReferenceType, Reflection, ReflectionKind, ReflectionSymbolId, SomeType, TupleType, TypeParameterReflection } from 'typedoc';
import fs, { type MakeDirectoryOptions, type WriteFileOptions } from 'fs';
import path from 'path';

void async function () {
    try {
        const application = await Application.bootstrap();

        const project = await application.convert();
        if (!project)
            throw 'Could not parse project';

        const declarationsById = new Map<number, DeclarationReflection>();
        const toVisit = project.children?.slice() || [];
        while (toVisit.length > 0) {
            const declaration = toVisit.shift()!;
            if (declaration.variant === 'declaration') {
                declarationsById.set(declaration.id, declaration);
                if (declaration.children && declaration.children.length > 0)
                    toVisit.push(...declaration.children);
            }
        }

        const outputDirectory = await mkdirAsync(path.join(__dirname, 'docs'), { recursive: true });
        await writeFileAsync(path.join(outputDirectory, 'index.md'), '### Test');

        if (project.children)
            await Promise.all(project.children.map(async declaration => {
                switch (declaration.kind) {
                    case ReflectionKind.Class:
                        await writeFileAsync(path.join(outputDirectory, `${declaration.name}.md`), writeClassDeclaration(declaration));
                        break;
                }
            }));

        function findDeclaration(target: Reflection | ReflectionSymbolId | string | undefined): DeclarationReflection {
            const declaration = declarationsById.get(
                (target as any)?.id
                || (target as any)?.getStableKey()
                || Number(target)
            );
            if (declaration === null || declaration === undefined)
                throw new Error(`Cannot find declaration with id '${target}'.`);

            return declaration;
        }

        function writeClassDeclaration(classDeclaration: DeclarationReflection): string {
            return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getName(classDeclaration)} class

${getSummary(classDeclaration)}

## ${classDeclaration.name} Class

\`\`\`ts
${getDeclaration(classDeclaration)}
\`\`\`
`.trim();
        }

        function getName(declaration: DeclarationReflection): string {
            if (declaration.typeParameters && declaration.typeParameters.length > 0)
                return `${declaration.name}\\<${declaration.typeParameters.map(typeParameter => typeParameter.name).join(', ')}\\>`;
            else
                return declaration.name;
        }

        function getDeclaration(declaration: DeclarationReflection): string {
            switch (declaration.kind) {
                case ReflectionKind.Class:
                    let classDeclaration = `class ${declaration.name}`;

                    if (declaration.flags.isAbstract)
                        classDeclaration = 'abstract ' + classDeclaration;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        classDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;
                    if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                        classDeclaration += `\n    extends ${declaration.extendedTypes.map(getTypeReferenceDeclaration).join(', ')}`;
                    if (declaration.implementedTypes && declaration.implementedTypes.length > 0)
                        classDeclaration += `\n    implements ${declaration.implementedTypes.map(getTypeReferenceDeclaration).join(', ')}`;

                    return classDeclaration;

                default:
                    throw new Error(`Unhandled '${declaration.kind}' declaration type.`);
            }
        }

        function getTypeParameterDeclaration(typeParameter: TypeParameterReflection): string {
            let declaration = typeParameter.name;

            if (typeParameter.type)
                declaration += ' extends ' + getTypeReferenceDeclaration(typeParameter.type);
            if (typeParameter.default)
                declaration += ' = ' + getTypeReferenceDeclaration(typeParameter.default);

            return declaration;
        }

        function getTypeReferenceDeclaration(typeReference: SomeType): string {
            switch (typeReference.type) {
                case 'reference':
                    return `${typeReference.name}${typeReference.typeArguments && typeReference.typeArguments.length > 0 ? `<${typeReference.typeArguments.map(getTypeReferenceDeclaration).join(', ')}>` : ''}`;

                case 'intersection':
                    return typeReference.types.map(getTypeReferenceDeclaration).join(' | ');

                case 'intrinsic':
                    return typeReference.name;

                case 'tuple':
                    return `[${typeReference.elements.map(getTypeReferenceDeclaration).join(', ')}]`;

                default:
                    throw new Error(`Unhandled '${typeReference.type}' generic type constraint.`);
            }
        }

        function getSummary(declaration: DeclarationReflection): string {
            if (declaration.comment && declaration.comment.summary)
                return getBlock(declaration.comment.summary);
            else
                return '';
        }

        function getBlock(comments: readonly CommentDisplayPart[]): string {
            return comments.reduce((result, comment) => result + getCommentMarkdown(comment), '');
        }

        function getCommentMarkdown(comment: CommentDisplayPart): string {
            switch (comment.kind) {
                case 'text':
                    return comment.text;

                case 'code':
                    return `\`${comment.text}\``;

                case 'inline-tag':
                    switch (comment.tag) {
                        case '@link':
                        case '@linkcode':
                            const targetDeclaration = findDeclaration(comment.target);
                            return `[${getName(targetDeclaration)}](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/${targetDeclaration.name})`;

                        default:
                            throw new Error(`Unhandled '${comment.tag}' inline-tag.`);
                    }

                default:
                    throw new Error(`Unhandled '${comment.kind}' comment kind.`);
            }
        }

        function mkdirAsync(path: string, options?: MakeDirectoryOptions & { recursive: true; }): Promise<string> {
            return new Promise<string>((resolve, reject) => fs.mkdir(path, options, error => {
                if (error)
                    reject(error);
                else
                    resolve(path);
            }));
        }

        function writeFileAsync(path: string, contents: string, options: WriteFileOptions = "utf-8"): Promise<void> {
            return new Promise<void>((resolve, reject) => fs.writeFile(path, contents, options, error => {
                if (error)
                    reject(error);
                else
                    resolve();
            }))
        }
    }
    catch (error) {
        console.error(error);
    }
}();