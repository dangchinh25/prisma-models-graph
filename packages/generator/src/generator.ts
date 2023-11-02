/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
    generatorHandler, GeneratorManifest, GeneratorOptions
} from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import path from 'path';
import { GENERATOR_NAME } from './constants';
import { genEnum } from './helpers/genEnum';
import { writeFileSafely } from './utils/writeFileSafely';

const { version } = require( '../package.json' );

generatorHandler( {
    onManifest (): GeneratorManifest {
        logger.info( `${ GENERATOR_NAME }:Registered` );

        return {
            version,
            defaultOutput: '../generated',
            prettyName: GENERATOR_NAME
        };
    },
    onGenerate: async ( options: GeneratorOptions ): Promise<void> => {
        options.dmmf.datamodel.enums.forEach( async ( enumInfo ) => {
            const tsEnum = genEnum( enumInfo );

            const writeLocation = path.join(
                options.generator.output?.value!,
                `${ enumInfo.name }.ts`
            );

            await writeFileSafely( writeLocation, tsEnum );
        } );

        options.dmmf.datamodel.models.forEach( model => {
            console.log( model );
        } );

        const writeLocation = path.join(
            options.generator.output?.value!,
            `ModelsGraph.ts`
        );

        await writeFileSafely( writeLocation, '123' );
    }
} );
