const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'to', 'with', 'of', 'in', 'on', 'is', 'are', 'user', 'users', 'system', 'must', 'should', 'can']);
const tokens = (text) => new Set(String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 1 && !STOP_WORDS.has(word)));

export function splitRequirement(text) {
  return String(text || '').split(/[.?!\n]+/).map((part) => part.trim()).filter((part) => part.length >= 8).map((text, index) => ({ id: `R${index + 1}`, text }));
}

export function autoLinkByKeywords(cases, points) {
  return cases.map((tc) => {
    if (tc.requirementId) return tc;
    const caseWords = tokens(`${tc.scenario} ${tc.description}`);
    let best = null; let high = 0;
    points.forEach((point) => {
      const overlap = [...caseWords].filter((word) => tokens(point.text).has(word)).length;
      if (overlap > high) { high = overlap; best = point.id; }
    });
    return best ? { ...tc, requirementId: best } : tc;
  });
}

export function buildTraceabilityMatrix(cases, points) {
  return points.map((point) => {
    const linked = cases.filter((tc) => tc.requirementId === point.id);
    const count = (status) => linked.filter((tc) => tc.status === status).length;
    return { ...point, total: linked.length, pass: count('Pass'), fail: count('Fail'), blocked: count('Blocked'), notRun: count('Not Run'), coverage: linked.length ? 'Covered' : 'No tests' };
  });
}
