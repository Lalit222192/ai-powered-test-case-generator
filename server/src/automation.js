import { execFile } from 'node:child_process';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const artifacts = path.join(root, 'server', 'artifacts');

function parseReport(output) {
  const start = output.indexOf('{');
  if (start < 0) throw new Error('Playwright did not return a JSON report.');
  return JSON.parse(output.slice(start));
}

async function copyScreenshot(source, testId, number) {
  if (!source) return null;
  await mkdir(artifacts, { recursive: true });
  const filename = `${Date.now()}-${testId.replace(/[^A-Za-z0-9-]/g, '-')}-${number}.png`;
  await copyFile(source, path.join(artifacts, filename));
  return filename;
}

// Runs the real Playwright browser suite and returns only machine-verifiable output.
export async function runLoginAutomation(port) {
  let stdout = '';
  try {
    ({ stdout } = await run(process.execPath, ['run-login-suite.mjs'], {
      cwd: path.join(root, 'e2e'),
      env: { ...process.env, E2E_BACKEND_PORT: String(port), E2E_FRONTEND_URL: process.env.E2E_FRONTEND_URL || 'http://127.0.0.1:5173' },
      timeout: 60000,
      maxBuffer: 10_000_000,
    }));
  } catch (error) {
    stdout = error.stdout || '';
    if (!stdout) throw error;
  }
  const report = parseReport(stdout);
  await mkdir(artifacts, { recursive: true });
  const reportName = `${Date.now()}-login-suite-report.json`;
  await writeFile(path.join(artifacts, reportName), JSON.stringify(report, null, 2));
  const tests = await Promise.all((report.results || []).map(async (result, index) => ({
    id: result.id, title: result.title, status: result.status, report: reportName,
    screenshot: await copyScreenshot(result.screenshot, result.id, index),
  })));
  return { tests, report: reportName };
}
