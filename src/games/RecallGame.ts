import { RootState, questionSet } from "../ducks/root";

export interface RecallGame {
  type: "recall";
  order: "next" | "random" | "same";
  questionIndex: number;
  setIndexesLeft: number[];
  inOrderCount: number;
  inOrderDone: number;
}
export const initialRecallGame: RecallGame = {
  questionIndex: 0,
  type: "recall",
  order: "random",
  setIndexesLeft: [],
  inOrderCount: 2,
  inOrderDone: 0,
};
export function refreshRecallGame(game: RecallGame, set: string[]): RecallGame {
  const indexesLeft = set.slice(1).map((id, i) => i);
  const randomIndex = Math.floor(Math.random() * indexesLeft.length);
  const randomElem = indexesLeft.splice(randomIndex, 1)[0];
  return {
    type: "recall",
    order: game.order,
    inOrderCount: game.inOrderCount,
    setIndexesLeft: indexesLeft,
    inOrderDone: 0,
    questionIndex: randomElem,
  };
}
export function nextRecallGame(game: RecallGame, state: RootState): RecallGame {
  if (game.order === "same") return game;
  const set = questionSet(state);
  const bounded = (index: number) =>
    Math.max(0, Math.min(set.length - 1, index));
  const { inOrderCount, inOrderDone, questionIndex: previous } = game;
  if (inOrderDone < inOrderCount - 1) {
    const newIndex = game.order === "random" ? previous + 1 : previous;
    return {
      ...game,
      inOrderDone: inOrderDone + 1,
      questionIndex: bounded(newIndex),
    };
  }
  if (game.order === "next")
    return { ...game, inOrderDone: 0, questionIndex: bounded(previous + 1) };
  const setIndexesLeft =
    game.setIndexesLeft && game.setIndexesLeft.length
      ? game.setIndexesLeft
      : set.slice(1).map((id, i) => i);
  const random = Math.floor(Math.random() * setIndexesLeft.length);
  const newSetIndexesLeft = setIndexesLeft.slice();
  const randomId = newSetIndexesLeft.splice(random, 1)[0];
  return {
    ...game,
    setIndexesLeft: newSetIndexesLeft,
    inOrderDone: 0,
    questionIndex: randomId,
  };
}