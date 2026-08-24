import * as fs from 'fs';
import * as path from 'path';

/**
 * Phase 08 - CTR-01: Contract form shows trainingTimeBudget and trainingMoneyBudget fields
 * Structural tests verify the form source contains the required fields
 * without rendering (avoids MUI LocalizationProvider/formik-mui dependencies).
 */

const SOURCE_PATH = path.join(__dirname, 'ContractFormInternal.tsx');
const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

describe('ContractFormInternal - CTR-01: training budget fields (structural)', () => {
  it('contains a Field with name="trainingTimeBudget"', () => {
    expect(source).toMatch(/name\s*[=:]\s*["']trainingTimeBudget["']/);
  });

  it('contains a Field with name="trainingMoneyBudget"', () => {
    expect(source).toMatch(/name\s*[=:]\s*["']trainingMoneyBudget["']/);
  });

  it('trainingTimeBudget field uses number type', () => {
    expect(source).toMatch(
      /trainingTimeBudget[\s\S]{0,200}type\s*[=:]\s*["']number["']/,
    );
  });

  it('trainingMoneyBudget field uses number type', () => {
    expect(source).toMatch(
      /trainingMoneyBudget[\s\S]{0,200}type\s*[=:]\s*["']number["']/,
    );
  });

  it('initializes trainingTimeBudget with default value 0 in schema or init', () => {
    expect(source).toMatch(
      /trainingTimeBudget[\s\S]{0,100}(default\(0\)|:\s*0)/,
    );
  });

  it('initializes trainingMoneyBudget with default value 0 in schema or init', () => {
    expect(source).toMatch(
      /trainingMoneyBudget[\s\S]{0,100}(default\(0\)|:\s*0)/,
    );
  });

  it('has trainingTimeBudget and trainingMoneyBudget fields alongside existing hackTimeBudget', () => {
    expect(source).toMatch(/hackTimeBudget/);
    expect(source).toMatch(/trainingTimeBudget/);
    expect(source).toMatch(/trainingMoneyBudget/);
  });
});
