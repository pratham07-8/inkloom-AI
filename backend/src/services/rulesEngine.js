/**
 * INKLOOM AI - Deterministic Rules Engine
 * Evaluates submitted content against brand guideline configuration
 */

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function evaluateRules({ title = '', textContent = '', guidelineConfig = {} }) {
  const findings = [];
  const fullText = `${title}\n\n${textContent}`;
  const lowerText = fullText.toLowerCase();

  const prohibitedTerms = guidelineConfig.prohibitedTerms || [];
  const requiredPhrases = guidelineConfig.requiredPhrases || [];
  const approvedTerminology = guidelineConfig.approvedTerminology || [];
  const scoreWeights = guidelineConfig.scoreWeights || {
    critical: 40,
    high: 25,
    medium: 12,
    low: 4
  };
  const rules = guidelineConfig.rules || {};

  let findingCounter = 1;

  // 1. Prohibited Terms Check
  for (const item of prohibitedTerms) {
    const termLower = item.term.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegex(termLower)}\\b`, 'gi');
    let match;

    while ((match = regex.exec(fullText)) !== null) {
      const severity = item.severity || 'HIGH';
      const score = scoreWeights[severity.toLowerCase()] || 20;

      findings.push({
        finding_id: `fnd-rule-${findingCounter++}`,
        rule_id: `rule-prohibited-${item.term.replace(/\s+/g, '-').toLowerCase()}`,
        category: severity === 'CRITICAL' ? 'LEGAL_COMPLIANCE' : 'BRAND_POLICY',
        severity,
        message: item.message || `Prohibited term detected: "${item.term}"`,
        evidence: match[0],
        location: {
          start: match.index,
          end: match.index + match[0].length
        },
        recommended_action: `Remove or replace prohibited term "${item.term}".`,
        score_contribution: score,
        source: 'deterministic_rule',
        confidence: 1.0
      });
    }
  }

  // 2. Required Phrases & Mandatory Disclaimers
  for (const item of requiredPhrases) {
    const phraseLower = item.phrase.toLowerCase();
    const triggers = item.triggerOnKeywords || [];

    // If keywords are specified, check if the content discusses relevant topics
    let shouldCheck = triggers.length === 0;
    if (triggers.length > 0) {
      for (const kw of triggers) {
        if (lowerText.includes(kw.toLowerCase())) {
          shouldCheck = true;
          break;
        }
      }
    }

    if (shouldCheck) {
      const isPresent = lowerText.includes(phraseLower);
      if (!isPresent) {
        const severity = item.severity || 'HIGH';
        const score = scoreWeights[severity.toLowerCase()] || 25;

        findings.push({
          finding_id: `fnd-rule-${findingCounter++}`,
          rule_id: `rule-missing-${(item.category || 'phrase').toLowerCase()}`,
          category: item.category || 'COMPLIANCE',
          severity,
          message: `Missing mandatory ${item.category || 'disclaimer'}: "${item.phrase}"`,
          evidence: triggers.length > 0 ? `Triggered by keywords: [${triggers.join(', ')}]` : 'Mandatory across all brand publications',
          location: null,
          recommended_action: `Include the required text: "${item.phrase}"`,
          score_contribution: score,
          source: 'deterministic_rule',
          confidence: 1.0
        });
      }
    }
  }

  // 3. Approved Terminology Recommendations (Unapproved aliases)
  for (const item of approvedTerminology) {
    const replaces = item.replaces || [];
    for (const discouraged of replaces) {
      const regex = new RegExp(`\\b${escapeRegex(discouraged)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(fullText)) !== null) {
        findings.push({
          finding_id: `fnd-rule-${findingCounter++}`,
          rule_id: `rule-terminology-${discouraged.replace(/\s+/g, '-').toLowerCase()}`,
          category: 'TERMINOLOGY',
          severity: 'MEDIUM',
          message: `Discouraged terminology "${match[0]}" should be updated to approved brand phrasing.`,
          evidence: match[0],
          location: {
            start: match.index,
            end: match.index + match[0].length
          },
          recommended_action: `Replace "${match[0]}" with approved term: "${item.preferred}"`,
          score_contribution: scoreWeights.medium || 12,
          source: 'deterministic_rule',
          confidence: 1.0
        });
      }
    }
  }

  // 4. Length and Formatting Constraints
  if (rules.maxTitleLength && title.length > rules.maxTitleLength) {
    findings.push({
      finding_id: `fnd-rule-${findingCounter++}`,
      rule_id: 'rule-title-length',
      category: 'FORMATTING',
      severity: 'LOW',
      message: `Title length (${title.length} characters) exceeds policy maximum of ${rules.maxTitleLength}.`,
      evidence: title.slice(0, 40) + '...',
      location: null,
      recommended_action: `Condense title to within ${rules.maxTitleLength} characters.`,
      score_contribution: scoreWeights.low || 4,
      source: 'deterministic_rule',
      confidence: 1.0
    });
  }

  if (rules.maxBodyLength && textContent.length > rules.maxBodyLength) {
    findings.push({
      finding_id: `fnd-rule-${findingCounter++}`,
      rule_id: 'rule-body-length',
      category: 'FORMATTING',
      severity: 'LOW',
      message: `Content length (${textContent.length} characters) exceeds maximum of ${rules.maxBodyLength}.`,
      evidence: `${textContent.length} chars`,
      location: null,
      recommended_action: `Reduce content to within ${rules.maxBodyLength} characters.`,
      score_contribution: scoreWeights.low || 4,
      source: 'deterministic_rule',
      confidence: 1.0
    });
  }

  return findings;
}
