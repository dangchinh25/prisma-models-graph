import { DMMF } from '@prisma/generator-helper';
import path from 'path';
import {
    CompilerOptions, ModuleKind, Project, ScriptTarget, StructureKind
} from 'ts-morph';

const baseCompilerOptions: CompilerOptions = {
    target: ScriptTarget.ES2022,
    module: ModuleKind.CommonJS,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
    declaration: true
};

const baseDirPath = 'node_modules/@generated/models-graph';

export const generateCode = async (
    dmmf: DMMF.Document
): Promise<void> => {
    const project = new Project( { compilerOptions: { ...baseCompilerOptions } } );

    project.createSourceFile( path.resolve( baseDirPath, 'test.ts' ), {
        statements: [
            {
                kind: StructureKind.Enum,
                name: 'MyEnum',
                members: [
                    { name: 'mem1', value: 1 },
                    { name: 'mem2', value: 2 }
                ],
                isExported: true
            }
        ]
    }, { overwrite: true } );

    const indexFile = project.createSourceFile( path.resolve( baseDirPath, 'index.ts' ), undefined, { overwrite: true } );

    indexFile.addExportDeclaration( { moduleSpecifier: './test' } );

    await project.emit();
};