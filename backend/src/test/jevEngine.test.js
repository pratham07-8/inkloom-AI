import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateJevScore } from '../services/jevEngine.js';

describe('Jev Decision-Support Engine Tests', () => {
  it('should auto-approve low risk submissions with 0 high/critical findings', () => {
    const findings = [
      { severity: 'LOW', score_contribution: 4 },
      { severity: 'INFO', score_contribution: 0 }
    ];

    const result = calculateJevScore({ findings });

    assert.equal(result.riskScore, 4);
    assert.equal(result.riskLevel, 'LOW');
    assert.equal(result.routing, 'AUTO_APPROVE');
    assert.equal(result.recommendedStatus, 'APPROVED');
  });

  it('should route to manager review when high severity findings exist', () => {
    const findings = [
      { severity: 'HIGH', score_contribution: 25 },
      { severity: 'MEDIUM', score_contribution: 12 }
    ];

    const result = calculateJevScore({ findings });

    assert.equal(result.riskScore, 37);
    assert.equal(result.riskLevel, 'HIGH');
    assert.equal(result.routing, 'MANAGER_REVIEW');
    assert.equal(result.recommendedStatus, 'IN_REVIEW');
  });

  it('should route to critical escalation when multiple critical violations occur', () => {
    const findings = [
      { severity: 'CRITICAL', score_contribution: 40 },
      { severity: 'CRITICAL', score_contribution: 40 },
      { severity: 'HIGH', score_contribution: 25 }
    ];

    const result = calculateJevScore({ findings });

    assert.equal(result.riskScore, 100);
    assert.equal(result.riskLevel, 'CRITICAL');
    assert.equal(result.routing, 'CRITICAL_ESCALATION');
    assert.equal(result.recommendedStatus, 'CHANGES_REQUESTED');
  });
});
