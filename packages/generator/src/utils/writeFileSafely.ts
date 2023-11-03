/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises } from 'fs';
import path from 'path';
import { formatFile } from './formatFile';

const { writeFile, mkdir } = promises;

export const writeFileSafely = async (
    writeLocation: string,
    content: any
): Promise<void> => {
    try {
        await mkdir( path.dirname( writeLocation ), { recursive: true } );

        const formattedFile = await formatFile( content );

        await writeFile( writeLocation, formattedFile );
    } catch ( error ) {
        console.error( 'Error: unable to write files for Prisma Models Graph Generator' );
        throw error;
    }
};
