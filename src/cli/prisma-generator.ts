/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeneratorOptions } from '@prisma/generator-helper';
import { generateCode } from '../generator/generateCode';
import { parseDMMFModels } from '../generator/helpers';
import path from 'path';
import { DEFAULT_JSON_FILE_NAME } from './constants';
import { writeFileSafely } from '../utils';

export const generate = async ( options: GeneratorOptions ): Promise<void> => {
    const modelsGraph = parseDMMFModels( options.dmmf.datamodel.models );

    const { exportJSON } = options.generator.config;

    if ( exportJSON === 'true' ) {
        const jsonWriteLocation = path.join(
            options.generator.output?.value!,
            DEFAULT_JSON_FILE_NAME
        );

        await writeFileSafely( jsonWriteLocation, JSON.stringify( modelsGraph ) );
    }

    await generateCode( modelsGraph );
};