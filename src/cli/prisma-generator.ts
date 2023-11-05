import { GeneratorOptions } from '@prisma/generator-helper';
import { generateCode } from '../generator/generateCode';

export const generate = async ( options: GeneratorOptions ): Promise<void> => {
    await generateCode( options.dmmf );
};