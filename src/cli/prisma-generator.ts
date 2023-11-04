/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
import { GeneratorOptions } from '@prisma/generator-helper';
import path from 'path';
import { DEFAULT_FILE_NAME } from './constants';
import { formatFileName, parseDMMFModels } from '../generator/helpers';
import { writeFileSafely } from '../utils/writeFileSafely';
import { generateCode } from '../generator/generateCode';

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

    await generateCode( options.dmmf );
};