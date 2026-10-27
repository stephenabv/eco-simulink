/**
 * Pure state machine behind every placement activity. It supports three
 * input styles with the same rules, so touch, mouse, keyboard and screen
 * reader users get equivalent activities:
 *   - drag an item onto a slot           → `place(item, slot)`
 *   - tap an item, then tap a slot       → `select(item)` then `placeSelected(slot)`
 *   - keyboard: focus item, Enter, focus slot, Enter (same as tap)
 *
 * A slot holds at most one item unless created with `slotCapacity: "many"`
 * (used for categorisation, where several organisms share a category).
 */

export interface PlacementBoardState<TSlot extends string> {
  readonly items: readonly string[];
  readonly slots: readonly TSlot[];
  /** item id → slot id. Items absent from the map are still in the tray. */
  readonly placements: Readonly<Record<string, TSlot>>;
  readonly selectedItem: string | null;
  readonly slotCapacity: "one" | "many";
}

export function createBoard<TSlot extends string>(
  items: readonly string[],
  slots: readonly TSlot[],
  slotCapacity: "one" | "many",
): PlacementBoardState<TSlot> {
  if (new Set(items).size !== items.length) throw new RangeError("Item ids must be unique");
  if (new Set(slots).size !== slots.length) throw new RangeError("Slot ids must be unique");
  return { items, slots, placements: {}, selectedItem: null, slotCapacity };
}

function assertItem<TSlot extends string>(state: PlacementBoardState<TSlot>, item: string): void {
  if (!state.items.includes(item)) throw new RangeError(`Unknown item: ${item}`);
}

export function place<TSlot extends string>(
  state: PlacementBoardState<TSlot>,
  item: string,
  slot: TSlot,
): PlacementBoardState<TSlot> {
  assertItem(state, item);
  if (!state.slots.includes(slot)) throw new RangeError(`Unknown slot: ${slot}`);

  const placements: Record<string, TSlot> = { ...state.placements };
  if (state.slotCapacity === "one") {
    // Swap: the item already in the target slot moves to where the dragged item came from (or back to the tray).
    const occupant = Object.keys(placements).find((key) => placements[key] === slot && key !== item);
    const origin = placements[item];
    if (occupant !== undefined) {
      if (origin !== undefined) placements[occupant] = origin;
      else delete placements[occupant];
    }
  }
  placements[item] = slot;
  return { ...state, placements, selectedItem: null };
}

export function select<TSlot extends string>(state: PlacementBoardState<TSlot>, item: string | null): PlacementBoardState<TSlot> {
  if (item !== null) assertItem(state, item);
  return { ...state, selectedItem: state.selectedItem === item ? null : item };
}

export function placeSelected<TSlot extends string>(state: PlacementBoardState<TSlot>, slot: TSlot): PlacementBoardState<TSlot> {
  return state.selectedItem === null ? state : place(state, state.selectedItem, slot);
}

export function returnToTray<TSlot extends string>(state: PlacementBoardState<TSlot>, item: string): PlacementBoardState<TSlot> {
  assertItem(state, item);
  const { [item]: _removed, ...placements } = state.placements;
  return { ...state, placements, selectedItem: null };
}

export function resetBoard<TSlot extends string>(state: PlacementBoardState<TSlot>): PlacementBoardState<TSlot> {
  return { ...state, placements: {}, selectedItem: null };
}

export function itemsInSlot<TSlot extends string>(state: PlacementBoardState<TSlot>, slot: TSlot): string[] {
  return state.items.filter((item) => state.placements[item] === slot);
}

export function trayItems<TSlot extends string>(state: PlacementBoardState<TSlot>): string[] {
  return state.items.filter((item) => state.placements[item] === undefined);
}

/** Ordered answer for sequence activities: the item in each slot, or null. */
export function sequenceAnswer<TSlot extends string>(state: PlacementBoardState<TSlot>): (string | null)[] {
  return state.slots.map((slot) => itemsInSlot(state, slot)[0] ?? null);
}
