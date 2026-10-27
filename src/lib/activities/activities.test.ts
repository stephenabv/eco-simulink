import { describe, expect, it } from "vitest";
import { FEEDING_RELATIONS, FOOD_CHAINS, ORGANISMS } from "@/data/organisms/catalog";
import { FoodWeb } from "@/lib/ecology/food-web";
import { seededRandom } from "@/lib/random";
import { buildClassificationRound } from "./classification";
import { evaluateCategorization, evaluateSequence } from "./evaluation";
import {
  createBoard,
  itemsInSlot,
  place,
  placeSelected,
  resetBoard,
  returnToTray,
  select,
  sequenceAnswer,
  trayItems,
} from "./placement-board";

describe("evaluateSequence", () => {
  const chain = ["grass", "grasshopper", "frog", "snake"];

  it("marks each slot correct, incorrect or missing", () => {
    const result = evaluateSequence(chain, ["grass", "frog", null, "snake"]);
    expect(result.feedback.map((f) => f.status)).toEqual(["correct", "incorrect", "missing", "correct"]);
    expect(result.correctCount).toBe(2);
    expect(result.scorePercent).toBe(50);
    expect(result.isComplete).toBe(false);
    expect(result.isPerfect).toBe(false);
  });

  it("recognises a perfect answer", () => {
    expect(evaluateSequence(chain, chain).isPerfect).toBe(true);
  });

  it("rejects answers with the wrong number of slots", () => {
    expect(() => evaluateSequence(chain, ["grass"])).toThrow(RangeError);
  });
});

describe("evaluateCategorization", () => {
  it("checks every expected item and rejects unknown items", () => {
    const expected = { grass: "producer", frog: "secondary-consumer" } as const;
    const result = evaluateCategorization(expected, { grass: "producer" });
    expect(result.feedback.map((f) => f.status)).toEqual(["correct", "missing"]);
    expect(() => evaluateCategorization(expected, { eagle: "producer" })).toThrow(RangeError);
  });
});

describe("placement board", () => {
  const slots = ["0", "1", "2"] as const;

  it("supports drag (place) and tap-to-select-then-place with identical results", () => {
    const dragged = place(createBoard(["a", "b"], slots, "one"), "a", "1");
    const tapped = placeSelected(select(createBoard(["a", "b"], slots, "one"), "a"), "1");
    expect(tapped.placements).toEqual(dragged.placements);
    expect(tapped.selectedItem).toBeNull();
  });

  it("toggles selection and ignores placing with nothing selected", () => {
    let board = createBoard(["a"], slots, "one");
    board = select(select(board, "a"), "a");
    expect(board.selectedItem).toBeNull();
    expect(placeSelected(board, "0")).toBe(board);
  });

  it("swaps items when dropping onto an occupied single-item slot", () => {
    let board = createBoard(["a", "b"], slots, "one");
    board = place(place(board, "a", "0"), "b", "1");
    board = place(board, "b", "0");
    expect(sequenceAnswer(board)).toEqual(["b", "a", null]);
  });

  it("sends the occupant back to the tray when a tray item takes its slot", () => {
    let board = createBoard(["a", "b"], slots, "one");
    board = place(place(board, "a", "0"), "b", "0");
    expect(trayItems(board)).toEqual(["a"]);
  });

  it("allows many items per category slot", () => {
    let board = createBoard(["a", "b"], ["producer"] as const, "many");
    board = place(place(board, "a", "producer"), "b", "producer");
    expect(itemsInSlot(board, "producer")).toEqual(["a", "b"]);
  });

  it("returns items to the tray and resets", () => {
    let board = place(createBoard(["a"], slots, "one"), "a", "2");
    expect(trayItems(returnToTray(board, "a"))).toEqual(["a"]);
    board = resetBoard(board);
    expect(board.placements).toEqual({});
  });

  it("rejects unknown items, slots and duplicate ids", () => {
    const board = createBoard(["a"], slots, "one");
    expect(() => place(board, "z", "0")).toThrow(RangeError);
    expect(() => place(board, "a", "9" as "0")).toThrow(RangeError);
    expect(() => createBoard(["a", "a"], slots, "one")).toThrow(RangeError);
  });
});

describe("buildClassificationRound", () => {
  const web = new FoodWeb(ORGANISMS, FEEDING_RELATIONS);
  const decomposers = ORGANISMS.filter((o) => o.role === "decomposer");

  it("produces unique organisms with answers that match their chain", () => {
    const round = buildClassificationRound(web, FOOD_CHAINS, decomposers, 8, seededRandom(42));
    expect(round).toHaveLength(8);
    expect(new Set(round.map((item) => item.organismId)).size).toBe(8);
    for (const item of round) {
      if (item.chainId === null) {
        expect(item.expected).toBe("decomposer");
        continue;
      }
      const chain = FOOD_CHAINS.find((c) => c.id === item.chainId)!;
      const position = web.positionsInChain(chain).find((p) => p.organismId === item.organismId)!;
      expect(item.expected).toBe(position.position);
    }
  });

  it("is reproducible with the same seed and varies with another", () => {
    const a = buildClassificationRound(web, FOOD_CHAINS, decomposers, 6, seededRandom(1));
    const b = buildClassificationRound(web, FOOD_CHAINS, decomposers, 6, seededRandom(1));
    const c = buildClassificationRound(web, FOOD_CHAINS, decomposers, 6, seededRandom(2));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});
