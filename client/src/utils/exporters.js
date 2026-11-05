// Export helpers are deliberately text-only: generated scripts are starting points,
// not automatic browser tests against an unknown application.
function comment(value = '') {
  return String(value).replace(/\r?\n/g, ' ');
}

function jsString(value = '') {
  return JSON.stringify(String(value));
}

function safeTitle(value, fallback) {
  return String(value || fallback).replace(/[\r\n]+/g, ' ').trim();
}

export function toPlaywrightScript(cases, requirementTitle = 'Generated test suite') {
  const title = safeTitle(requirementTitle, 'Generated test suite');
  const tests = cases.map((tc) => {
    const lines = [
      `  test(${jsString(`${tc.id} - ${tc.scenario}`)}, async ({ page }) => {`,
      `    // Preconditions: ${comment(tc.preconditions || 'None')}`,
      ...tc.steps.map((step, index) => `    // Step ${index + 1}: ${comment(step)}`),
      `    // Test data: ${comment(tc.testData || 'N/A')}`,
      `    // Expected result: ${comment(tc.expectedResult || '')}`,
      '    // TODO: implement steps',
      '    test.fixme(true, "Not automated yet");',
      '  });',
    ];
    return lines.join('\n');
  });
  return `import { test, expect } from "@playwright/test";\n\ntest.describe(${jsString(title)}, () => {\n${tests.join('\n\n')}\n});\n`;
}

function tag(value) {
  return String(value || '').replace(/[^A-Za-z0-9]/g, '');
}

export function toGherkin(cases, requirement = 'Generated test suite') {
  const feature = safeTitle(requirement, 'Generated test suite').slice(0, 100);
  const scenarios = cases.map((tc) => {
    const lines = [
      `@${tag(tc.id)} @${tag(tc.priority)} @${tag(tc.type)}`,
      `Scenario: ${safeTitle(tc.scenario, tc.id)}`,
    ];
    if (tc.preconditions && tc.preconditions.trim().toLowerCase() !== 'none') lines.push(`  Given ${comment(tc.preconditions)}`);
    if (tc.steps?.length) {
      lines.push(`  When ${comment(tc.steps[0])}`);
      tc.steps.slice(1).forEach((step) => lines.push(`  And ${comment(step)}`));
    }
    lines.push(`  Then ${comment(tc.expectedResult)}`);
    lines.push(`  # Test data: ${comment(tc.testData || 'N/A')}`);
    return lines.join('\n');
  });
  return `Feature: ${feature}\n\n${scenarios.join('\n\n')}\n`;
}

export function downloadTextFile(text, filename, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
