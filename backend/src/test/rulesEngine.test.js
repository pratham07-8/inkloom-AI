import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRules } from '../services/rulesEngine.js';

describe('Rules Engine Tests', () => {
  const sampleGuideline = {
    prohibitedTerms: [
      { term: 'guaranteed 100% uptime', severity: 'CRITICAL', message: 'Never guarantee 100% uptime.' },
      { term: 'best in the world', severity: 'HIGH', message: 'Unsubstantiated superlative.' }
    ],
    requiredPhrases: [
      {
        phrase: 'Subject to standard SLA terms and regional availability.',
        category: 'DISCLAIMER',
        severity: 'HIGH',
        triggerOnKeywords: ['uptime', 'sla']
      }
    ],
    approvedTerminology: [
      { preferred: 'cost-efficient', replaces: ['cheap'] }
    ],
    scoreWeights: { critical: 40, high: 25, medium: 12, low: 4 },
    rules: { maxTitleLength: 50 }
  };

  it('should detect prohibited terms with correct severity and score', () => {
    const text = 'Our platform provides guaranteed 100% uptime for all clients.';
    const findings = evaluateRules({
      title: 'Uptime Announcement',
      textContent: text,
      guidelineConfig: sampleGuideline
    });

    const prohibitedFinding = findings.find(f => f.rule_id === 'rule-prohibited-guaranteed-100%-uptime');
    assert.ok(prohibitedFinding, 'Should detect prohibited term');
    assert.equal(prohibitedFinding.severity, 'CRITICAL');
    assert.equal(prohibitedFinding.score_contribution, 40);
  });

  it('should flag missing mandatory disclaimer when trigger keywords are present', () => {
    const text = 'We offer an incredible SLA uptime benchmark.';
    const findings = evaluateRules({
      title: 'Performance Report',
      textContent: text,
      guidelineConfig: sampleGuideline
    });

    const disclaimerFinding = findings.find(f => f.rule_id === 'rule-missing-disclaimer');
    assert.ok(disclaimerFinding, 'Should flag missing disclaimer when triggered by "uptime" / "sla"');
    assert.equal(disclaimerFinding.severity, 'HIGH');
  });

  it('should not flag disclaimer when trigger keywords are absent', () => {
    const text = 'Our team attended the annual developer conference today.';
    const findings = evaluateRules({
      title: 'Conference Recap',
      textContent: text,
      guidelineConfig: sampleGuideline
    });

    const disclaimerFinding = findings.find(f => f.rule_id === 'rule-missing-disclaimer');
    assert.equal(disclaimerFinding, undefined, 'Should not require disclaimer on unrelated topic');
  });

  it('should detect unapproved terminology and suggest preferred alternative', () => {
    const text = 'This new feature provides cheap hosting.';
    const findings = evaluateRules({
      title: 'Pricing Plan',
      textContent: text,
      guidelineConfig: sampleGuideline
    });

    const termFinding = findings.find(f => f.rule_id === 'rule-terminology-cheap');
    assert.ok(termFinding, 'Should flag discouraged term');
    assert.match(termFinding.recommended_action, /cost-efficient/);
  });
});
