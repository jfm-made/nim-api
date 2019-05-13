import test from 'ava';
import config from 'config'
import NimGame from '../src/nimGame';

test('Start situation is loaded', t => {
    const startSituation = [1,3,5,7];

    const game = new NimGame(1, startSituation);
    const status = game.getStatus();

    t.is(status.stacks.join(), startSituation.join());
});

test('Start situation balance is correct', t => {
    const game0 = new NimGame(1, [1,3,5,7]);
    const game1 = new NimGame(1, [1,3,5,6]);

    t.true(game0.isBalanced());
    t.false(game1.isBalanced());
});

test('Computer can balance 1000 situation', t => {
    for (let i = 0; i<10000; i++) {
        const randomArray = [0,0,0,0].map(() => Math.round(Math.random() * 10));
        let game = new NimGame(1, randomArray);
        game.makeBalanced();
        // console.log(`Testing situation [${randomArray.join(', ')}] -> [${game.getStatus().stacks.join(', ')}]`);
        t.true(game.isBalanced());
    }
});

test('Play a game till its over', t => {
    const game = new NimGame(1, [1, 3, 5, 7, 9, 11, 13 , 15, 17]);

    while (!game.isGameOver()) {
        if (game.isPlayersChoice) {
            const max = Array.from(game.stacks).sort().pop();

            if (!max || max === 0) {
                return t.fail('Game should be over but isn\'t');
            }

            const maxIndex = game.stacks.indexOf(max);
            game.playerMove(maxIndex, 1);
        } else {
            game.computerMove();
        }
    }

    t.pass();
});
