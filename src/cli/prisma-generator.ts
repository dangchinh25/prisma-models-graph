/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
import { GeneratorOptions } from '@prisma/generator-helper';
import path from 'path';
import { DEFAULT_FILE_NAME } from './constants';
import { formatFileName, parseDMMFModels } from '../helpers';
import { writeFileSafely } from '../utils/writeFileSafely';
import { Project, StructureKind } from 'ts-morph';

export const generate = async ( options: GeneratorOptions ): Promise<void> => {
    const modelsGraph = parseDMMFModels( options.dmmf.datamodel.models );

    let writeFileName = DEFAULT_FILE_NAME;
    const { fileName } = options.generator.config;

    if ( fileName ) {
        // This is to handle generator config can be an array of string
        writeFileName = typeof fileName === 'string' ? formatFileName( fileName ) : formatFileName( fileName[ 0 ] );
    }

    const writeLocation1 = path.join(
        options.generator.output?.value!,
        writeFileName
    );

    await writeFileSafely( writeLocation1, JSON.stringify( modelsGraph )  );

    const project = new Project( { compilerOptions: { declaration: true } } );

    project.createSourceFile( 'node_modules/@generated/models-graph/test.ts', {
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

    const indexFile = project.createSourceFile( 'node_modules/@generated/models-graph/index.ts', undefined, { overwrite: true } );

    indexFile.addExportDeclaration( { moduleSpecifier: './test' } );

    await project.emit();
};