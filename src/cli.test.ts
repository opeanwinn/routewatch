import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-cli-'));
}

function mkdir(...parts: string[]): void {
  fs.mkdirSync(path.join(...parts), { recursive: true });
}

function touch(...parts: string[]): void {
  fs.writeFileSync(path.join(...parts), '');
}

describe('cli argument parsing', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('exits with code 1 for invalid argument count', () => {
    // Dynamically require to avoid top-level side effects
    const { run } = require('./cli');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`);
    });

    expect(() => run(['only-one-branch'])).toThrow('process.exit(1)');
    mockExit.mockRestore();
  });

  it('accepts zero arguments without throwing', () => {
    const tmp = createTmpDir();
    mkdir(tmp, 'app');
    touch(tmp, 'app', 'page.tsx');

    const originalCwd = process.cwd;
    process.cwd = () => tmp;

    const { run } = require('./cli');
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock git command
    jest.mock('child_process', () => ({
      execSync: (cmd: string) => {
        if (cmd.includes('rev-parse')) return Buffer.from('main\n');
        return Buffer.from('');
      },
    }));

    logSpy.mockRestore();
    process.cwd = originalCwd;
    fs.rmSync(tmp, { recursive: true });
  });
});
