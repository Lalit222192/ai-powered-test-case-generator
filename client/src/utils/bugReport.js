export function severityFromPriority(priority) {
  return { High: 'Major', Medium: 'Moderate', Low: 'Minor' }[priority] || 'Moderate';
}

export function validateActualResult(value) {
  return String(value || '').trim() ? null : 'Actual result is required to create a bug report.';
}

export function toBugReportMarkdown({ testCase, actualResult, severity, environment }) {
  return `# [${testCase.id}] ${testCase.scenario} fails\n\n**Severity:** ${severity}\n**Priority:** ${testCase.priority}\n**Environment:** ${environment || 'Not specified'}\n\n## Preconditions\n${testCase.preconditions || 'None'}\n\n## Steps to Reproduce\n${testCase.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n## Test Data\n${testCase.testData || 'N/A'}\n\n## Expected Result\n${testCase.expectedResult}\n\n## Actual Result\n${actualResult.trim()}\n\n## Linked Test Case ID\n${testCase.id}\n`;
}
