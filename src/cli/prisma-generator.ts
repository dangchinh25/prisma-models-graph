import { GeneratorOptions } from '@prisma/generator-helper';
import { generateCode } from '../generator/generateCode';
import { parseDMMFModels } from '../generator/helpers';

export const generate = async ( options: GeneratorOptions ): Promise<void> => {
    const modelsGraph = parseDMMFModels( options.dmmf.datamodel.models );

    await Promise.all( [ generateCode( modelsGraph ) ] );
};