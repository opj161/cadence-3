import { StateEffect, StateField } from '@codemirror/state';
import type { LineStats } from '../types';

export const setSyllableLinesEffect = StateEffect.define<LineStats[]>();

export const syllableLinesField = StateField.define<LineStats[]>({
  create() {
    return [];
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSyllableLinesEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});
