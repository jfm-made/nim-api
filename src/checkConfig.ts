/**
 * This is a dirty attempt to check if all config values were set and are kind of valid
 * Some type checks need to be done because the config file is external and therefore not checked by typescript
 * Yes! I am willing to use console.log here
 */

import config from 'config';

try {
    const port: number = config.get('port');
    const apiRoot: string = config.get('apiRoot');
    const startSituation: number[] = config.get('startSituation');

    if (typeof port !== 'number' || port < 0 || port > 65535) {
        // tslint:disable-next-line:no-console
        console.log('Configured port is invalid or out of a valid range');
        process.exit(0);
    }

    if (startSituation.length === 0) {
        // tslint:disable-next-line:no-console
        console.log('Configured startSituation must not be empty');
        process.exit(0);
    }

    for (const stackNumber of startSituation) {
        /*
        You never know! Even if TS is in the room, there is always an elephant too.
        Config is loaded from external file
         */
        if (typeof stackNumber !== 'number' || stackNumber < 0) {
            // tslint:disable-next-line:no-console
            console.log('Configured startSituation contains invalid values');
            process.exit(0);
        }
    }

    if (startSituation.reduce((a, b) => a + b) === 0) {
        // tslint:disable-next-line:no-console
        console.log('Configured startSituation must not contain only zeros');
        process.exit(0);
    }
} catch (error) {
    // tslint:disable-next-line:no-console
    console.log('Please check the configuration. Attributes might be missing');
    process.exit(0);
}
