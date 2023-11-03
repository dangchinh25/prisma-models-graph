/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { formatFile } from './formatFile';

export const writeFileSafely = async (
    writeLocation: string,
    content: any
): Promise<void> => {
    fs.mkdirSync( path.dirname( writeLocation ), { recursive: true } );

    const formattedFile = await formatFile( content );

    console.log( formattedFile );

    fs.writeFileSync( writeLocation, formattedFile );

    fs.writeFileSync( writeLocation, content );
};
