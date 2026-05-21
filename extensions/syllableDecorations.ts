import { StateField, type Range } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { setSyllableLinesEffect } from './syllableData';
import type { LineStats } from '../types';

class HyphenatedWordWidget extends WidgetType {
  constructor(private readonly display: string) {
    super();
  }

  eq(other: HyphenatedWordWidget): boolean {
    return other instanceof HyphenatedWordWidget && other.display === this.display;
  }

  toDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'cm-hyphenated-word';
    element.textContent = this.display;
    return element;
  }

  ignoreEvent(): boolean {
    return false;
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
      if (word.count <= 1 || word.display === word.word) {
        continue;
      }

      const from = cmLine.from + word.from;
      const to = cmLine.from + word.to;

      if (from < to && to <= cmLine.to) {
        decorations.push(
          Decoration.replace({
            widget: new HyphenatedWordWidget(word.display),
          }).range(from, to),
        );
      }
    }
  }

  return Decoration.set(decorations, true);
}

export function syllableDecorations(showSyllables: boolean) {
  return StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },
    update(decorations, transaction) {
      decorations = decorations.map(transaction.changes);

      for (const effect of transaction.effects) {
        if (effect.is(setSyllableLinesEffect)) {
          return buildDecorations(transaction.state.doc, effect.value, showSyllables);
        }
      }

      if (transaction.docChanged) {
        return Decoration.none;
      }

      return decorations;
    },
    provide: field => EditorView.decorations.from(field),
  });
}
