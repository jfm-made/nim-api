import debug from 'debug';
import express from 'express';
import NimGame from './nimGame';
import { GameMode } from './types';

const logger = debug('nim:game-router');

export default class GameRouterController {

    private static sendNoGameFound(res: express.Response) {
        return res.status(404).send({
            error: 'Not found',
            message: 'No active game found',
        });
    }

    private instance: NimGame | null = null;
    private readonly router: express.Router = express.Router();
    private readonly startSituation: number[];

    constructor(startSituation: number[]) {
        this.startSituation = startSituation;

        this.router.get('/status', this.getStatus.bind(this));
        this.router.get('/start', this.startGame.bind(this));
        this.router.post('/', this.postPlayerMove.bind(this));
        this.router.delete('/', this.deleteInstance.bind(this));
    }

    public getRouter() {
        return this.router;
    }

    private getStatus(req: express.Request, res: express.Response) {
        logger('Status requested');

        if (this.instance === null) {
            return GameRouterController.sendNoGameFound(res);
        }

        res.send(this.instance.getStatus());
    }

    /**
     * Starts a new nim game no matter if one is already existing
     * If query param 'simple' is set to 'true' the game mode is simple. Default game mode is hard
     */
    private startGame(req: express.Request, res: express.Response) {
        let gameMode = GameMode.hard;
        if (req.query && req.query.simple && req.query.simple === 'true') {
            gameMode = GameMode.simple;
        }

        logger(`Starting new game with mode: ${gameMode === 1 ? 'hard' : 'simple'}`);

        try {
            this.instance = new NimGame(gameMode, Array.from(this.startSituation));
        } catch (error) {
            return res.status(500).send({
                error: 'Internal server error',
                message: error.toString(),
            });
        }

        if (!this.instance.isPlayersChoice) {
            this.instance.computerMove();
        }

        return res.send(this.instance.getStatus());
    }
    /**
     * This method handles the actual player input
     * @param req - body: { row: number, take: number }
     * @param res
     */
    private postPlayerMove(req: express.Request, res: express.Response) {
        if (!req || !req.body || typeof req.body.row !== 'number' || typeof req.body.take !== 'number') {
            return res.status(400).send({
                error: 'Bad request',
                message: 'Body must contain the attributes row and take.',
            });
        }

        if (this.instance === null) {
            return res.status(404).send('No game found');
        }

        if (this.instance.isGameOver()) {
            return res.send({
                error: 'Game Over',
                message: `${this.instance.getStatus().playersChoice ? 'Computer' : 'You'} won`,
            });
        }

        logger(`Player takes ${req.body.take} objects from stack ${req.body.row}`);

        try {
            this.instance.playerMove(req.body.row, req.body.take);
            const statusBefore = this.instance.getStatus();

            if (this.instance.isGameOver()) {
                return res.send({
                    message: 'Game over. Player wins',
                    statusBefore,
                    statusAfter: null,
                });
            }

            this.instance.computerMove();

            if (this.instance.lastMove !== false) {
                logger(`Computer takes ${this.instance.lastMove.take} `
                    + `objects from stack ${this.instance.lastMove.stack}`);
            }

            return res.send({
                message: `Computer also moved${this.instance.isGameOver() ? '. Game Over. Computer wins' : ''}`,
                statusBefore,
                statusNow: this.instance.getStatus(),
            });
        } catch (error) {
            return res.status(400).send({
                message: 'Unable to perform move',
                error: error.toString(),
                status: this.instance.getStatus(),
            });
        }
    }

    /**
     * Deletes the current instance
     * @param req
     * @param res
     */
    private deleteInstance(req: express.Request, res: express.Response) {
        if (this.instance !== null) {
            logger('User deleted the game');

            this.instance = null;
            return res.send({ message: 'Game deleted' });
        }

        return GameRouterController.sendNoGameFound(res);
    }
}