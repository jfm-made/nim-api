import debug from 'debug';
import express from 'express';
import {PathParams} from 'express-serve-static-core';
import fs from 'fs';
import marked from 'marked';

const logger = debug('nim:app');

export default class App {
    public expressApp: express.Application;
    private readonly port: number;
    private readonly apiRoot: PathParams;

    constructor(port: number, apiRoot: PathParams, routers: express.Router[]) {
        this.expressApp = express();
        this.port = port;
        this.apiRoot = apiRoot;
        this.setupBasicMiddlewares();
        this.loadRouters(routers);
        this.initFallbackRoute();
    }

    public startListening() {
        this.expressApp.listen(this.port, () => {
            logger(`NIM listening on :${this.port}${this.apiRoot}`);
        });
    }

    /**
     * Loads routers in given order.
     * (If the app gets more complex it might be necessary to define a prefix or indexes per router)
     * @param routers
     */
    private loadRouters(routers: express.Router[]) {
        for (const router of routers) {
            this.expressApp.use(this.apiRoot, router);
        }
    }

    private setupBasicMiddlewares() {
        this.expressApp.use(express.json());
    }

    private initFallbackRoute() {
        this.expressApp.get('*', (req, res) => {
            const file = fs.readFileSync(__dirname + '/../README.md', 'utf8');

            return res.send(marked(file.toString()));
        });
    }
}
