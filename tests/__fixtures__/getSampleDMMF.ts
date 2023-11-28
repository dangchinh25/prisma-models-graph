import { DMMF } from '@prisma/generator-helper';
import { getDMMF, getSchema } from '@prisma/internals';
import path from 'path';

export const getSampleDMMF = async (): Promise<DMMF.Document> => {
    const samplePrismaSchema = await getSampleSchema();

    return getDMMF( { datamodel: samplePrismaSchema } );
};

export const getSampleSchema = async (): Promise<string> => {
    return await getSchema( path.join( __dirname, './sample.prisma' ) );
};