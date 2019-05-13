export enum GameMode {
    hard = 1,
    simple = 2,
}

export interface MoveHistory {
    player: boolean;
    stack: number;
    take: number;
}
