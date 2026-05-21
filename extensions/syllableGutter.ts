import { gutter, GutterMarker } from '@codemirror/view';
import { setSyllableLinesEffect, syllableLinesField } from './syllableData';

class SyllableCountMarker extends GutterMarker {
  constructor(private readonly count: number) {
    super();
  }

  eq(other: SyllableCountMarker): boolean {
    return other.count === this.count;
  }

  toDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'cm-syllable-count';
    element.textContent = String(this.count);
    element.title = `${this.count} syllables`;
    return element;
  }
}

export const syllableGutter = gutter({
  class: 'cm-syllable-gutter',
  lineMarker(view, line) {
    const lineNumber = view.state.doc.lineAt(line.from).number - 1;
    const data = view.state.field(syllableLinesField, false)?.[lineNumber];

    if (!data || data.isHeader || data.isComment || data.text.trim().length === 0 || data.syllableCount <= 0) {
      return null;
    }

    return new SyllableCountMarker(data.syllableCount);
  },
  lineMarkerChange(update) {
    return update.docChanged || update.transactions.some(transaction =>
      transaction.effects.some(effect => effect.is(setSyllableLinesEffect)),
    );
  },
});
