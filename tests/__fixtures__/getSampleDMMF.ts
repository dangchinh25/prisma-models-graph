import { DMMF } from '@prisma/generator-helper';
import { getDMMF, getSchema } from '@prisma/internals';
import path from 'path';


export const getSampleDMMF = async (): Promise<DMMF.Document> => {
    const samplePrismaSchema = await getSchema( path.join( __dirname, './sample.prisma' ) );

    return getDMMF( { datamodel: samplePrismaSchema } );
};
