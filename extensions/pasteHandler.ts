import { EditorView } from '@codemirror/view';

function cleanPastedText(text: string): string {
  const lines = text.split(/\r?\n/).map(line => line.trimEnd());
  const cleaned: string[] = [];
  let blankCount = 0;

  for (const line of lines) {
    if (line.trim().length === 0) {
      blankCount += 1;
      if (blankCount <= 2) {
        cleaned.push(line);
      }
    } else {
      blankCount = 0;
      cleaned.push(line);
    }
  }

  return cleaned.join('\n');
}

export const pasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const text = event.clipboardData?.getData('text/plain');
    if (!text) {
      return false;
    }

    const cleaned = cleanPastedText(text);
    if (cleaned === text) {
      return false;
    }

    event.preventDefault();
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: cleaned },
      selection: { anchor: from + cleaned.length },
    });

    return true;
  },
});
