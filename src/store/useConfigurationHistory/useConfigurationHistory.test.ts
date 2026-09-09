import { beforeEach, describe, expect, it } from 'vitest';

import type { cartItemConfigurationType } from '@types';

import { HISTORY_LIMIT, useConfigurationHistory } from '@store/useConfigurationHistory/useConfigurationHistory';

const ITEM_ID = 'cart-item-1';

const buildConfiguration = (color: string): cartItemConfigurationType =>
  ({
    color: { byPart: { front: color }, gradientsByPart: {} },
    design: { activePatternKey: null, patternColors: {}, designLayerColors: {}, activeOpacity: 1, designOpacity: 1 },
    name: { instances: [], selectedInstanceId: null },
    number: { instances: [], selectedInstanceId: null },
    testo: { instances: [], selectedInstanceId: null },
    logo: { instances: [], selectedInstanceId: null },
  }) as cartItemConfigurationType;

const entry = (color: string, activeStep = 1) => ({ configuration: buildConfiguration(color), activeStep });

const colorOf = (result: { configuration: cartItemConfigurationType } | null) => result?.configuration.color.byPart.front;

describe('useConfigurationHistory', () => {
  beforeEach(() => {
    useConfigurationHistory.setState({ stacks: {}, activeItemId: null });
  });

  it('undoes to the previous snapshot and redoes back', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red'));
    history.commit(ITEM_ID, entry('green'));
    history.commit(ITEM_ID, entry('blue'));

    expect(colorOf(history.undo(ITEM_ID))).toBe('green');
    expect(colorOf(history.undo(ITEM_ID))).toBe('red');
    expect(history.undo(ITEM_ID)).toBeNull();

    expect(colorOf(history.redo(ITEM_ID))).toBe('green');
    expect(colorOf(history.redo(ITEM_ID))).toBe('blue');
    expect(history.redo(ITEM_ID)).toBeNull();
  });

  it('drops the redo branch once a new edit is committed', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red'));
    history.commit(ITEM_ID, entry('green'));
    history.undo(ITEM_ID);

    expect(history.canRedo(ITEM_ID)).toBe(true);

    history.commit(ITEM_ID, entry('blue'));

    expect(history.canRedo(ITEM_ID)).toBe(false);
    expect(colorOf(history.undo(ITEM_ID))).toBe('red');
  });

  it('restores the step the snapshot was taken on', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red', 1));
    history.commit(ITEM_ID, entry('green', 3));

    expect(history.undo(ITEM_ID)?.activeStep).toBe(1);
  });

  it('keeps histories separate per cart item', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red'));
    history.commit(ITEM_ID, entry('green'));
    history.resetItem('cart-item-2', entry('white'));

    expect(history.canUndo('cart-item-2')).toBe(false);
    expect(colorOf(history.undo(ITEM_ID))).toBe('red');
  });

  it('caps the stack at the history limit', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('base'));
    for (let index = 0; index < HISTORY_LIMIT + 20; index += 1) {
      history.commit(ITEM_ID, entry(`color-${index}`));
    }

    expect(useConfigurationHistory.getState().stacks[ITEM_ID].past.length).toBe(HISTORY_LIMIT);
  });

  it('keeps an existing history when another item is added and then returned from', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red'));
    history.commit(ITEM_ID, entry('green'));

    history.resetItem('cart-item-2', entry('white'));
    history.commit('cart-item-2', entry('black'));

    expect(history.canUndo(ITEM_ID)).toBe(true);
    expect(colorOf(history.undo(ITEM_ID))).toBe('red');
  });

  it('forgets the history of a removed item', () => {
    const history = useConfigurationHistory.getState();
    history.resetItem(ITEM_ID, entry('red'));
    history.commit(ITEM_ID, entry('green'));
    history.removeItem(ITEM_ID);

    expect(history.canUndo(ITEM_ID)).toBe(false);
    expect(useConfigurationHistory.getState().stacks[ITEM_ID]).toBeUndefined();
  });

  it('reports no undo for an unknown item', () => {
    const history = useConfigurationHistory.getState();

    expect(history.canUndo('missing')).toBe(false);
    expect(history.undo('missing')).toBeNull();
  });
});
