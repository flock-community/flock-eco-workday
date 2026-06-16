import * as fs from 'fs';
import * as path from 'path';

/**
 * Phase 08 - CTR-01: Contract form shows studyHours and studyMoney fields
 * Structural tests verify the form source contains the required fields
 * without rendering (avoids MUI LocalizationProvider/formik-mui dependencies).
 */

const SOURCE_PATH = path.join(__dirname, 'ContractFormInternal.tsx');
const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

describe('ContractFormInternal - CTR-01: study budget fields (structural)', () => {
  it('contains a Field with name="studyHours"', () => {
    expect(source).toMatch(/name\s*[=:]\s*["']studyHours["']/);
  });

  it('contains a Field with name="studyMoney"', () => {
    expect(source).toMatch(/name\s*[=:]\s*["']studyMoney["']/);
  });

  it('studyHours field uses number type', () => {
    expect(source).toMatch(/studyHours[\s\S]{0,200}type\s*[=:]\s*["']number["']/);
  });

  it('studyMoney field uses number type', () => {
    expect(source).toMatch(/studyMoney[\s\S]{0,200}type\s*[=:]\s*["']number["']/);
  });

  it('initializes studyHours with default value 0 in schema or init', () => {
    expect(source).toMatch(/studyHours[\s\S]{0,100}(default\(0\)|:\s*0)/);
  });

  it('initializes studyMoney with default value 0 in schema or init', () => {
    expect(source).toMatch(/studyMoney[\s\S]{0,100}(default\(0\)|:\s*0)/);
  });

  it('has studyHours and studyMoney fields alongside existing hackHours', () => {
    expect(source).toMatch(/hackHours/);
    expect(source).toMatch(/studyHours/);
    expect(source).toMatch(/studyMoney/);
  });
});
