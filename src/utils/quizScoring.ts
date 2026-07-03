import type { QuizItem, QuizAnswer } from "@/types/quiz";

function normalizeText(s: string): string {
  // Case-insensitive, trims whitespace, and strips Arabic diacritics (tashkeel)
  // so typing answers aren't marked wrong over vowel marks students often omit.
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "");
}

function arraysEqualUnordered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function arraysEqualOrdered(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Scores a single quiz item against a student's response. `response` shape
 * varies per kind — see the runner components for what each kind submits.
 * Returns null-correctness for kinds that aren't auto-scorable (audio,
 * pronunciation, flip cards) so the UI can show "submitted" rather than
 * right/wrong.
 */
export function scoreQuizItem(item: QuizItem, response: unknown): QuizAnswer {
  const award = (correct: boolean | null) => ({
    itemId: item.id,
    response,
    correct,
    pointsAwarded: correct ? item.points : 0
  });

  switch (item.kind) {
    case "multipleChoice":
    case "listening":
    case "reading": {
      const selected = (response as string[]) ?? [];
      return award(arraysEqualUnordered(selected, item.correctChoiceIds));
    }

    case "trueFalse":
      return award((response as boolean) === item.correctAnswer);

    case "matching": {
      // response: Record<pairId-left, pairId-right> — a correct match links
      // a pair's own left id to its own right id.
      const answer = (response as Record<string, string>) ?? {};
      const allCorrect = item.pairs.every((pair) => answer[pair.id] === pair.id);
      return award(allCorrect);
    }

    case "dragDrop": {
      const answer = (response as Record<string, string>) ?? {};
      const allCorrect = Object.entries(item.correctMapping).every(
        ([draggableId, targetId]) => answer[draggableId] === targetId
      );
      return award(allCorrect);
    }

    case "fillBlank": {
      const answer = (response as Record<string, string>) ?? {};
      const allCorrect = item.blanks.every((blank) =>
        blank.correctAnswers.some((accepted) => normalizeText(accepted) === normalizeText(answer[blank.id] ?? ""))
      );
      return award(allCorrect);
    }

    case "ordering": {
      const order = (response as string[]) ?? [];
      return award(arraysEqualOrdered(order, item.correctOrder));
    }

    case "connectItems": {
      const connections = (response as { leftId: string; rightId: string }[]) ?? [];
      const key = (c: { leftId: string; rightId: string }) => `${c.leftId}::${c.rightId}`;
      const madeSet = new Set(connections.map(key));
      const correctSet = new Set(item.correctConnections.map(key));
      const allCorrect =
        madeSet.size === correctSet.size && [...correctSet].every((c) => madeSet.has(c));
      return award(allCorrect);
    }

    case "typing": {
      const answer = (response as string) ?? "";
      const correct = item.correctAnswers.some((accepted) => normalizeText(accepted) === normalizeText(answer));
      return award(correct);
    }

    case "imageSelection": {
      const selected = (response as string[]) ?? [];
      return award(arraysEqualUnordered(selected, item.correctImageIds));
    }

    case "wordBuilder": {
      const answer = (response as string) ?? "";
      return award(normalizeText(answer) === normalizeText(item.correctWord));
    }

    case "sentenceBuilder": {
      const answer = (response as string[]) ?? [];
      return award(arraysEqualOrdered(answer.map(normalizeText), item.correctSentence.map(normalizeText)));
    }

    case "memoryGame": {
      // Scored on completion (all pairs found); the runner only submits once solved.
      return award(true);
    }

    case "flipCards":
    case "audioRecording":
    case "pronunciation":
      // Not auto-scorable — mark as submitted/reviewed rather than right/wrong.
      return award(null);
  }
}
