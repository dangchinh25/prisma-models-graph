/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
    generatorHandler, GeneratorManifest, GeneratorOptions
} from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import path from 'path';
import { GENERATOR_NAME } from './constants';
import { parseDMMFModels } from './helpers';
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
        const jsonModelsGraph = parseDMMFModels( options.dmmf.datamodel.models );

        const writeLocation = path.join(
            options.generator.output?.value!,
            `ModelsGraph.json`
        );

        writeFileSafely( writeLocation, JSON.stringify( jsonModelsGraph )  );
    }
} );
