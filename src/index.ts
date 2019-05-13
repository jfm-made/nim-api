import config from 'config';
import { PathParams } from 'express-serve-static-core';
import './checkConfig';

import App from './app';
import GameRouterController from './gameRouterController';

const API_PORT: number = parseInt(config.get('port'), 10);
const API_ROOT: PathParams = config.get('apiRoot');
const startSituation: number[] = Array.from(config.get('startSituation'));

const grc = new GameRouterController(startSituation);

const app = new App(API_PORT, API_ROOT, [grc.getRouter()]);

app.startListening();
