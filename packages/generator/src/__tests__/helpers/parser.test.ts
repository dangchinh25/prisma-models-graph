import { DMMF } from '@prisma/generator-helper';
import { parseDMMFModels } from '../../helpers';
import { getSampleDMMF } from '../__fixtures__/getSampleDMMF';

describe( 'parseDMMFModels', () => {
    let sampleDMMFModels: DMMF.Model[];

    beforeAll( async () => {
        const sampleDMMF = await getSampleDMMF();
        sampleDMMFModels = sampleDMMF.datamodel.models;
    } );

    it( 'parses DMMF model correctly', () => {
        const parsedModels = parseDMMFModels( sampleDMMFModels );

        expect( Object.keys( parsedModels ) )
            .toHaveLength( 5 );
    } );

} );