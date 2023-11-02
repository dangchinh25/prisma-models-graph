/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

export const writeFileSafely = (
    writeLocation: string,
    content: any
): void => {
    fs.mkdirSync( path.dirname( writeLocation ), { recursive: true } );

    fs.writeFileSync( writeLocation, content );
};
