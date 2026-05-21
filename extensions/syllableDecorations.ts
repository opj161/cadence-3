import { StateField, type Range } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { setShowSyllablesEffect, setSyllableLinesEffect, showSyllablesField, syllableLinesField } from './syllableData';
import type { LineStats } from '../types';

const hyphenatedWordMark = Decoration.mark({ class: 'cm-hyphenated-word' });

class SyllableMarkerWidget extends WidgetType {
  constructor(private readonly marker: string) {
    super();
  }

  eq(other: SyllableMarkerWidget): boolean {
    return other instanceof SyllableMarkerWidget && other.marker === this.marker;
  }

  toDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'cm-syllable-marker';
    element.setAttribute('aria-hidden', 'true');
    element.textContent = this.marker;
    return element;
  }
}

function buildDecorations(doc: import('@codemirror/state').Text, lines: LineStats[], showSyllables: boolean): DecorationSet {
  const decorations: Range<Decoration>[] = [];

  for (let index = 0; index < lines.length && index < doc.lines; index++) {
    const stats = lines[index];
    const cmLine = doc.line(index + 1);

    if (stats.isHeader) {
      decorations.push(Decoration.line({ class: 'cm-section-header' }).range(cmLine.from));
      continue;
    }

    if (stats.isComment) {
      decorations.push(Decoration.line({ class: 'cm-comment-line' }).range(cmLine.from));
      continue;
    }

    if (!showSyllables) {
      continue;
    }

    for (const word of stats.words) {
      if (word.markerOffsets.length === 0) {
        continue;
      }

      const from = cmLine.from + word.from;
      const to = cmLine.from + word.to;

      if (from < to && to <= cmLine.to) {
        decorations.push(hyphenatedWordMark.range(from, to));
      }

      for (const markerOffset of word.markerOffsets) {
        const markerPosition = cmLine.from + word.from + markerOffset;
        if (markerPosition <= cmLine.from || markerPosition >= cmLine.to) {
          continue;
        }

        decorations.push(
          Decoration.widget({
            widget: new SyllableMarkerWidget('·'),
            side: 1,
          }).range(markerPosition),
        );
      }
    }
  }

  return Decoration.set(decorations, true);
}

export const syllableDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    let nextDecorations = decorations.map(transaction.changes);
    let shouldRebuild = transaction.docChanged;

    for (const effect of transaction.effects) {
      if (effect.is(setSyllableLinesEffect) || effect.is(setShowSyllablesEffect)) {
        shouldRebuild = true;
      }
    }

    if (!shouldRebuild) {
      return nextDecorations;
    }

    return buildDecorations(
      transaction.state.doc,
      transaction.state.field(syllableLinesField),
      transaction.state.field(showSyllablesField),
    );
  },
  provide: field => EditorView.decorations.from(field),
});
