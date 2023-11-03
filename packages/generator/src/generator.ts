/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
    generatorHandler, GeneratorManifest, GeneratorOptions
} from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import path from 'path';
import {
    DEFAULT_FILE_NAME, DEFAULT_OUTPUT_FOLDER, GENERATOR_NAME
} from './constants';
import { formatFileName, parseDMMFModels } from './helpers';
import { writeFileSafely } from './utils/writeFileSafely';

const { version } = require( '../package.json' );

generatorHandler( {
    onManifest (): GeneratorManifest {
        logger.info( `${ GENERATOR_NAME }:Registered` );

        return {
            version,
            defaultOutput: DEFAULT_OUTPUT_FOLDER,
            prettyName: GENERATOR_NAME
        };
    },
    onGenerate: async ( options: GeneratorOptions ): Promise<void> => {
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

        const writeLocation2 = path.join(
            `./node_modules/${ options.generator.name }`,
            writeFileName
        );

        writeFileSafely( writeLocation1, JSON.stringify( modelsGraph )  );
        writeFileSafely( writeLocation2, JSON.stringify( modelsGraph )  );
    }
} );
