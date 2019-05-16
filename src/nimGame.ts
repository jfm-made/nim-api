import { GameMode, MoveHistory } from './types';

export default class NimGame {

    /**
     * Checks the given array for validity. Redundant because of the config check but helpful if used elsewhere
     * @param startSituation
     */
    private static isStackValid(startSituation: number[]): boolean {
        if (!startSituation || startSituation.length === 0) {
            return false;
        }

        for (const stackNumber of startSituation) {
            // You never know. It's still JavaScript we are talking about
            if (typeof stackNumber !== 'number' || stackNumber < 0) {
                return false;
            }
        }

        return true;
    }

    // If this is used in a bigger project we need getters and setters
    public readonly difficulty: GameMode;
    public isPlayersChoice: boolean = false;

    public stacks: number[];
    public lastMove: MoveHistory | false = false;

    /**
     * Starts a game of NIM
     * @param difficulty: GameMode - 1 = hard, 2 = simple
     * @param startSituation: Array<number> - Start stack situation example: [1,3,5,7]
     */
    constructor(difficulty: GameMode, startSituation: number[]) {
        if (!NimGame.isStackValid(startSituation)) {
            throw new TypeError('Start configuration is invalid');
        }

        this.difficulty = difficulty;
        this.stacks = startSituation;
        this.lastMove = false;
        this.chooseFirstPlayer();
    }

    /**
     * Returns an object containing all game parameters including a formatted game state to display on console
     */
    public getStatus() {
        return {
            stacks: Array.from(this.stacks),
            readable: this.stacks
                .map((value, index) => `${index}:${value} \t ${Array(value + 1).join('|')}`)
                .join('\n'),
            playersChoice: this.isPlayersChoice,
            lastMove: this.lastMove,
            gameMode: this.difficulty === 1 ? 'hard' : 'simple',
            isGameOver: this.isGameOver(),
        };
    }

    /**
     * Uses XOR with all stacks to check if an even number of each available binary number exists
     * A balanced state means that the player who set it is in a winning position
     * @return boolean - true if game is balanced
     */
    public isBalanced(): boolean {
        return this.stacks.reduce((a, b) => a ^ b) === 0;
    }

    /**
     * If the sum of all stacks is zero the game is done
     * @return boolean - true if game is over
     */
    public isGameOver(): boolean {
        return this.stacks && this.stacks.reduce((a, b) => a + b) === 0;
    }

    /**
     * This method tries to balance the state of the game to build up a winning position.
     * It uses a a bitwise way to calculate a balanced state by picking the largest stack first and subtracting
     * the XOR difference and check its balanced afterwards. If that does not work it picks the next smaller one. If
     * the state was already balanced or a balancing was not possible (proven impossible) it returns false.
     * @return boolean - false if not possible to balance game stacks or if it is already balanced
     */
    public makeBalanced(): boolean {
        if (!this.stacks || this.stacks.length === 0) {
            throw new TypeError('No Game existing');
        }

        // In this case it can't be rebalanced
        if (this.isBalanced()) {
            return false;
        }

        const xorDifference = this.stacks.reduce((a, b) => a ^ b);
        const sorted: number[] = Array.from(this.stacks).sort();

        for (const max of sorted) {
            const modifiedGame: number[] = Array.from(this.stacks);
            const index: number = modifiedGame.indexOf(max);
            const take = Math.abs(modifiedGame[index] - (xorDifference ^ modifiedGame[index]));

            modifiedGame[index] -= take;

            if (modifiedGame.reduce((a, b) => a ^ b) === 0) { // isBalanced
                this.stacks = Array.from(modifiedGame);
                this.lastMove = {
                    player: false,
                    stack: index,
                    take,
                };

                return true;
            }
        }

        return false;
    }

    /**
     * Allows the player to remove a given amount (take) from the stack at a given index (stackIndex)
     * Also triggers that the computers turn is next.
     * @param stackIndex: number - the stack number starting with 0 on top
     * @param take: number - positive number which will be subtracted from the stack value
     */
    public playerMove(stackIndex: number, take: number): void {
        if (!this.isPlayersChoice) {
            throw new TypeError('Its the computers turn. Wait for it.');
        }

        if (!this.stacks[stackIndex] || take > this.stacks[stackIndex]) {
            throw new TypeError('This move is not allowed');
        }

        this.stacks[stackIndex] -= take;
        this.lastMove = {
            player: true,
            stack: stackIndex,
            take,
        };
        this.isPlayersChoice = false;
    }

    /**
     * Let the computer player make a move
     * If the game state is already balanced the computer will remove a random object
     * Otherwise it will balance the game to get in a winning position
     * Depending on the game mode (hard, simple) the computer can mistake sometimes on simple mode
     * in that case it will remove a random object instead of balancing the state
     */
    public computerMove(): void {
        if (this.isPlayersChoice) {
            throw new TypeError('Its the players turn. Computer says no.');
        }

        if (this.isBalanced() || this.isComputerMistaking()) {
            this.cluelessMove();
        } else {
            if (!this.makeBalanced()) {
                this.cluelessMove();
            }
        }

        this.isPlayersChoice = true;
    }

    /**
     * Pics a random stack and removes 1 object
     * Used by the computer player if the stack is already balanced
     */
    private cluelessMove(): void {
        const sum = this.stacks.reduce((a, b) => a + b);

        if (sum === 0) {
            throw new TypeError('Game is over. No move possible');
        }

        // Might be a bit strange but we must make sure that something happened
        do {
            const randomIndex = Math.round(Math.random() * this.stacks.length);
            if (this.stacks[randomIndex] > 0) {
                this.stacks[randomIndex] -= 1;
                this.lastMove = {
                    player: false,
                    stack: randomIndex,
                    take: 1,
                };
            }
        } while (sum === this.stacks.reduce((a, b) => a + b));
    }

    /**
     * Sets the isPlayersChoice boolean by a specific possibility
     * depending on the selected game mode aka. difficulty
     */
    private chooseFirstPlayer() {
        switch (this.difficulty) {
            case GameMode.simple: // Possibility of 75% that the player starts in a good situation
                this.isPlayersChoice = this.isBalanced() ? Math.random() >= 0.75 : Math.random() > 0.25;
                break;
            case GameMode.hard: // Possibility of 30% that the player starts in a good situation
                this.isPlayersChoice = this.isBalanced() ? Math.random() >= 0.3 : Math.random() > 0.7;
                break;
        }
    }

    /**
     * In simple mode the computer is performing a random move in 70% of the cases
     * @return boolean: true if the computer is about to mistake
     */
    private isComputerMistaking(): boolean {
        switch (this.difficulty) {
            case GameMode.simple: // Possibility of 70% that the computer mistakes
                return Math.random() >= 0.30;
            case GameMode.hard: // Computer is always right
                return false;
        }
    }
}
