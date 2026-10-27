"use client";

import { ArrowDown, ArrowRight, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  createBoard,
  itemsInSlot,
  place,
  placeSelected,
  resetBoard,
  returnToTray,
  select,
  trayItems,
  type PlacementBoardState,
} from "@/lib/activities/placement-board";
import type { EvaluationResult, PlacementStatus } from "@/lib/activities/evaluation";
import { progressService } from "@/lib/progress/progress-service";
import type { Illustration } from "@/types/ecology";
import { Button } from "@/components/shared/button";
import { OrganismArt } from "@/components/shared/organism-figure";
import { StatusLabel } from "@/components/shared/status-label";
import { usePointerDrag, type DropTarget } from "./use-pointer-drag";

export interface PlacementItem {
  readonly id: string;
  readonly name: string;
  readonly illustration: Illustration;
  /** Extra context shown under the name, e.g. the food chain a question refers to. */
  readonly detail?: string;
}

export interface PlacementSlot {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
}

export interface CheckOutcome {
  readonly result: EvaluationResult;
  readonly itemStatus: Readonly<Record<string, PlacementStatus>>;
}

export type PlacementLayout = "chain" | "pyramid" | "bins";

interface PlacementActivityProps {
  readonly activityId: string;
  readonly items: readonly PlacementItem[];
  /** For "pyramid", list slots from the top tier to the bottom tier. */
  readonly slots: readonly PlacementSlot[];
  readonly layout: PlacementLayout;
  readonly evaluate: (board: PlacementBoardState<string>) => CheckOutcome;
  /** Explanation shown under each item after checking. */
  readonly explain: (itemId: string, status: PlacementStatus) => string;
  /** Rendered before the first slot, e.g. the Sun as the energy source. */
  readonly chainStart?: ReactNode;
  /** When provided, a "New round" button asks for a fresh set of items. */
  readonly onNewRound?: () => void;
}

/**
 * Generic placement activity. Students can drag items, tap an item then a
 * slot, or use the keyboard (Tab to an item, Enter, Tab to a slot, Enter).
 */
export function PlacementActivity({
  activityId,
  items,
  slots,
  layout,
  evaluate,
  explain,
  chainStart,
  onNewRound,
}: PlacementActivityProps) {
  const slotIds = useMemo(() => slots.map((slot) => slot.id), [slots]);
  const capacity = layout === "chain" ? "one" : "many";
  const [board, setBoard] = useState(() => createBoard(items.map((item) => item.id), slotIds, capacity));
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const slotById = useMemo(() => new Map(slots.map((slot) => [slot.id, slot])), [slots]);
  const locked = outcome !== null;

  const nameOf = useCallback((id: string) => itemById.get(id)?.name ?? id, [itemById]);

  const handleDrop = useCallback(
    (itemId: string, target: DropTarget) => {
      if (target.slotId) {
        setBoard((current) => place(current, itemId, target.slotId as string));
        setAnnouncement(`${nameOf(itemId)} placed in ${slotById.get(target.slotId)?.label ?? "slot"}.`);
      } else if (target.isTray) {
        setBoard((current) => returnToTray(current, itemId));
        setAnnouncement(`${nameOf(itemId)} returned to the cards.`);
      }
    },
    [nameOf, slotById],
  );

  const { drag, handlers, consumeSuppressedClick } = usePointerDrag(handleDrop, locked);

  const onItemClick = (itemId: string) => {
    if (consumeSuppressedClick() || locked) return;
    setBoard((current) => select(current, itemId));
    setAnnouncement(
      board.selectedItem === itemId ? `${nameOf(itemId)} unselected.` : `${nameOf(itemId)} selected. Now choose where it goes.`,
    );
  };

  const onSlotClick = (slotId: string) => {
    if (locked || board.selectedItem === null) return;
    const itemId = board.selectedItem;
    setBoard((current) => placeSelected(current, slotId));
    setAnnouncement(`${nameOf(itemId)} placed in ${slotById.get(slotId)?.label ?? "slot"}.`);
  };

  const check = () => {
    const checked = evaluate(board);
    setOutcome(checked);
    const { correctCount, total } = checked.result;
    setAnnouncement(`You got ${correctCount} out of ${total} correct.`);
    progressService
      .recordAttempt("activity", activityId, { correct: correctCount, total, durationMs: Date.now() - startedAt })
      .then(() => setSaveError(false))
      .catch((error: unknown) => {
        console.error("Could not save attempt.", error);
        setSaveError(true);
      });
  };

  const tryAgain = () => {
    setOutcome(null);
    setStartedAt(Date.now());
    setAnnouncement("Fix the cards marked Not quite, then check again.");
  };

  const reset = () => {
    setOutcome(null);
    setBoard((current) => resetBoard(current));
    setStartedAt(Date.now());
    setAnnouncement("Activity reset. All cards are back.");
  };

  const renderItem = (itemId: string, compact: boolean) => {
    const item = itemById.get(itemId);
    if (!item) return null;
    const isSelected = board.selectedItem === itemId;
    const status = outcome?.itemStatus[itemId];
    const isDragging = drag?.itemId === itemId;
    return (
      <button
        key={itemId}
        type="button"
        {...handlers(itemId)}
        onClick={() => onItemClick(itemId)}
        aria-pressed={isSelected}
        aria-disabled={locked}
        aria-label={`${item.name}${status ? `, ${status === "correct" ? "correct" : status === "incorrect" ? "not quite" : "not placed"}` : ""}`}
        className={`flex min-h-12 touch-none select-none items-center gap-2 rounded-2xl border-2 bg-white px-3 py-2 text-left font-bold shadow-sm transition ${
          isSelected ? "border-sun-400 ring-4 ring-sun-400/40" : "border-forest-100"
        } ${status === "correct" ? "border-forest-500 bg-forest-50" : ""} ${
          status === "incorrect" ? "border-danger-600 bg-red-50" : ""
        } ${isDragging ? "opacity-40" : ""} ${locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"} ${
          compact ? "w-full" : ""
        }`}
      >
        <OrganismArt illustration={item.illustration} className="text-2xl" />
        <span className="flex-1">
          {item.name}
          {item.detail && <span className="block text-xs font-semibold text-ink-muted">{item.detail}</span>}
        </span>
        {status && <StatusLabel status={status} compact />}
      </button>
    );
  };

  const renderSlot = (slot: PlacementSlot, index: number) => {
    const contents = itemsInSlot(board, slot.id);
    const canReceive = !locked && board.selectedItem !== null;
    const widthClass =
      layout === "pyramid" ? PYRAMID_WIDTHS[Math.min(index, PYRAMID_WIDTHS.length - 1)] ?? "w-full" : "w-full";
    return (
      <div
        key={slot.id}
        data-slot-id={slot.id}
        className={`${widthClass} mx-auto rounded-3xl border-2 border-dashed p-3 transition ${
          canReceive ? "border-sun-400 bg-sun-400/10" : "border-forest-500/40 bg-forest-50/60"
        }`}
      >
        <button
          type="button"
          onClick={() => onSlotClick(slot.id)}
          disabled={!canReceive}
          className="mb-2 flex w-full min-h-11 flex-col items-start rounded-xl px-2 text-left disabled:cursor-default"
          aria-label={`${slot.label}${canReceive ? `. Place ${nameOf(board.selectedItem as string)} here` : ""}`}
        >
          <span className="font-extrabold text-forest-900">{slot.label}</span>
          {slot.hint && <span className="text-sm text-ink-muted">{slot.hint}</span>}
        </button>
        <div className={`flex flex-col gap-2 ${layout === "bins" ? "" : "sm:flex-row sm:flex-wrap sm:justify-center"}`}>
          {contents.length === 0 ? (
            <p className="px-2 pb-1 text-sm text-ink-muted">{canReceive ? "Tap here to place" : "Drop a card here"}</p>
          ) : (
            contents.map((itemId) => renderItem(itemId, layout !== "pyramid"))
          )}
        </div>
      </div>
    );
  };

  const tray = trayItems(board);
  const selectedIsPlaced = board.selectedItem !== null && board.placements[board.selectedItem] !== undefined;

  return (
    <div className="space-y-5">
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <section aria-label="Cards to place" data-tray className="rounded-3xl bg-earth-100/70 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold text-earth-700">Cards</h2>
          {selectedIsPlaced && !locked && (
            <Button variant="ghost" onClick={() => handleDrop(board.selectedItem as string, { slotId: null, isTray: true })}>
              <Undo2 aria-hidden className="size-4" /> Return {nameOf(board.selectedItem as string)} to cards
            </Button>
          )}
        </div>
        {tray.length === 0 ? (
          <p className="text-sm text-earth-700">All cards are placed.</p>
        ) : (
          <div className="flex flex-wrap gap-2">{tray.map((itemId) => renderItem(itemId, false))}</div>
        )}
      </section>

      {layout === "chain" ? (
        <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {chainStart && (
            <li className="flex flex-col items-center gap-2 md:flex-row">
              {chainStart}
              <ChainArrow />
            </li>
          )}
          {slots.map((slot, index) => (
            <li key={slot.id} className="flex flex-1 flex-col items-center gap-2 md:flex-row">
              {renderSlot(slot, index)}
              {index < slots.length - 1 && <ChainArrow />}
            </li>
          ))}
        </ol>
      ) : layout === "pyramid" ? (
        <div className="space-y-2">{slots.map(renderSlot)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{slots.map(renderSlot)}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {!locked ? (
          <Button onClick={check} disabled={tray.length === items.length}>
            Check answer
          </Button>
        ) : (
          !outcome.result.isPerfect && <Button onClick={tryAgain}>Try again</Button>
        )}
        <Button variant="secondary" onClick={reset}>
          <RotateCcw aria-hidden className="size-4" /> Reset
        </Button>
        {onNewRound && (
          <Button variant="secondary" onClick={onNewRound}>
            <Shuffle aria-hidden className="size-4" /> New round
          </Button>
        )}
      </div>

      {outcome && (
        <ResultPanel outcome={outcome} items={items} explain={explain} saveError={saveError} />
      )}

      {drag && itemById.get(drag.itemId) && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-sun-400 bg-white px-3 py-2 font-bold shadow-xl"
          style={{ left: drag.x, top: drag.y }}
        >
          <OrganismArt illustration={itemById.get(drag.itemId)!.illustration} className="mr-2 text-2xl" />
          {itemById.get(drag.itemId)!.name}
        </div>
      )}
    </div>
  );
}

const PYRAMID_WIDTHS = ["w-full sm:w-2/5", "w-full sm:w-3/5", "w-full sm:w-4/5", "w-full"];

function ChainArrow() {
  return (
    <span className="text-forest-500" aria-label="gives energy to">
      <ArrowDown aria-hidden className="size-6 md:hidden" />
      <ArrowRight aria-hidden className="hidden size-6 md:block" />
    </span>
  );
}

function ResultPanel({
  outcome,
  items,
  explain,
  saveError,
}: {
  outcome: CheckOutcome;
  items: readonly PlacementItem[];
  explain: PlacementActivityProps["explain"];
  saveError: boolean;
}) {
  const { result, itemStatus } = outcome;
  const heading = result.isPerfect
    ? "Excellent! Everything is in the right place."
    : `You got ${result.correctCount} out of ${result.total} correct.`;
  return (
    <section aria-labelledby="result-heading" className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 id="result-heading" className="text-xl font-extrabold text-forest-900">
        {heading}
      </h2>
      <p className="mt-1 text-ink-muted">Score: {result.scorePercent}%</p>
      {saveError && <p className="mt-2 text-sm text-danger-600">Your score could not be saved on this device.</p>}
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const status = itemStatus[item.id] ?? "missing";
          return (
            <li key={item.id} className="flex gap-3 rounded-2xl bg-sand-50 p-3">
              <OrganismArt illustration={item.illustration} className="text-2xl" />
              <div>
                <p className="flex flex-wrap items-center gap-2 font-bold">
                  {item.name} <StatusLabel status={status} />
                </p>
                <p className="text-ink-muted">{explain(item.id, status)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
