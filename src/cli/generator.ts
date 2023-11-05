import { GeneratorManifest, generatorHandler } from '@prisma/generator-helper';
import { generate } from './prisma-generator';
import { logger } from '@prisma/internals';
import { GENERATOR_NAME, DEFAULT_OUTPUT_FOLDER } from './constants';

const { version } = require( '../../package.json' );

generatorHandler( {
    onManifest (): GeneratorManifest {
        logger.info( `${ GENERATOR_NAME }:Registered` );

        return {
            version,
            defaultOutput: DEFAULT_OUTPUT_FOLDER,
            prettyName: GENERATOR_NAME
        };
    },
    onGenerate: generate
} );
