/**
 * INKLOOM AI - Jev Decision-Support & Risk Engine
 * Explainable, severity-weighted compliance risk calculation and routing recommendation
 */

export function calculateJevScore({ findings = [], guidelineConfig = {}, claimVerificationResult = null }) {
  const scoreWeights = guidelineConfig.scoreWeights || {
    critical: 40,
    high: 25,
    medium: 12,
    low: 4
  };

  let rawScore = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;

  const severityBreakdown = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0
  };

  for (const finding of findings) {
    const sev = (finding.severity || 'LOW').toUpperCase();
    const contrib = finding.score_contribution || scoreWeights[sev.toLowerCase()] || 0;

    rawScore += contrib;
    severityBreakdown[sev] = (severityBreakdown[sev] || 0) + contrib;

    if (sev === 'CRITICAL') criticalCount++;
    else if (sev === 'HIGH') highCount++;
    else if (sev === 'MEDIUM') mediumCount++;
    else if (sev === 'LOW') lowCount++;
    else infoCount++;
  }

  // Claim verification penalty if unverified or contradicts policy
  if (claimVerificationResult) {
    if (claimVerificationResult.status === 'CONTRADICTS_POLICY') {
      rawScore += 30;
      severityBreakdown.CRITICAL = (severityBreakdown.CRITICAL || 0) + 30;
      criticalCount++;
    } else if (claimVerificationResult.status === 'UNVERIFIED_CLAIM') {
      rawScore += 15;
      severityBreakdown.HIGH = (severityBreakdown.HIGH || 0) + 15;
      highCount++;
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Risk Level Classification
  let riskLevel = 'LOW';
  if (finalScore >= 80 || criticalCount >= 1) {
    riskLevel = 'CRITICAL';
  } else if (finalScore >= 60 || highCount >= 1) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 30 || mediumCount >= 1) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Workflow Routing Recommendation
  let routing = 'AUTO_APPROVE';
  let recommendedStatus = 'APPROVED';
  let routingReason = '';

  if (criticalCount >= 2 || (criticalCount >= 1 && finalScore >= 90)) {
    routing = 'CRITICAL_ESCALATION';
    recommendedStatus = 'CHANGES_REQUESTED';
    routingReason = `Escalated due to ${criticalCount} critical violation(s) generating an unacceptable risk score of ${finalScore}/100.`;
  } else if (criticalCount >= 1 || highCount >= 1 || finalScore >= 50) {
    routing = 'MANAGER_REVIEW';
    recommendedStatus = 'IN_REVIEW';
    routingReason = `Requires authorized Manager review due to ${highCount} high/critical finding(s) with total risk score ${finalScore}/100.`;
  } else if (finalScore >= 30) {
    routing = 'MANAGER_REVIEW';
    recommendedStatus = 'IN_REVIEW';
    routingReason = `Medium compliance risk (${finalScore}/100) flagged for manager verification.`;
  } else {
    routing = 'AUTO_APPROVE';
    recommendedStatus = 'APPROVED';
    routingReason = `Content aligns with brand guidelines with low risk score (${finalScore}/100) and 0 severe violations.`;
  }

  return {
    riskScore: finalScore,
    riskLevel,
    routing,
    recommendedStatus,
    routingReason,
    explanation: generateExplanation(finalScore, riskLevel, criticalCount, highCount, mediumCount, lowCount),
    counts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      info: infoCount,
      total: findings.length
    },
    severityBreakdown,
    confidence: calculateConfidence(findings)
  };
}

function generateExplanation(score, level, critical, high, med, low) {
  if (score === 0) {
    return '100% compliant. No prohibited terms, missing disclaimers, or unverified claims detected.';
  }
  const parts = [];
  if (critical > 0) parts.push(`${critical} CRITICAL legal/policy finding(s)`);
  if (high > 0) parts.push(`${high} HIGH severity brand violation(s)`);
  if (med > 0) parts.push(`${med} MEDIUM terminology adjustment(s)`);
  if (low > 0) parts.push(`${low} formatting/length suggestion(s)`);

  return `Evaluated as ${level} RISK (${score}/100) driven by ${parts.join(', ')}.`;
}

function calculateConfidence(findings) {
  if (findings.length === 0) return 0.99;
  const avg = findings.reduce((acc, f) => acc + (f.confidence || 0.9), 0) / findings.length;
  return Math.round(avg * 100) / 100;
}
