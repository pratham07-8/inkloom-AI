import { config } from '../config/index.js';

/**
 * Deterministic template-based compliant rewrite generator fallback
 */
function localRuleGroundedRewrite(text, findings) {
  let rewritten = text;

  // 1. Term replacements
  const replacements = [
    { find: /guaranteed 100% uptime/gi, replace: '99.99% Enterprise SLA' },
    { find: /100% uptime/gi, replace: '99.99% Enterprise SLA' },
    { find: /unhackable/gi, replace: 'Zero-Trust verified' },
    { find: /bulletproof/gi, replace: 'Zero-Trust hardened' },
    { find: /best in the world/gi, replace: 'industry-leading ISO 3691-4 certified' },
    { find: /cheap/gi, replace: 'cost-effective' },
    { find: /magic/gi, replace: 'advanced neural processing' },
    { find: /without needing human intervention/gi, replace: 'with designated human safety supervisor oversight' }
  ];

  for (const r of replacements) {
    rewritten = rewritten.replace(r.find, r.replace);
  }

  // 2. Add required disclaimers if flagged as missing
  for (const f of findings) {
    if (f.rule_id === 'rule-missing-disclaimer' && f.recommended_action) {
      const match = f.recommended_action.match(/"([^"]+)"/);
      if (match && match[1] && !rewritten.includes(match[1])) {
        rewritten = `${rewritten.trim()} ${match[1]}`;
      }
    }
  }

  return rewritten;
}

/**
 * Generate LLM Explanations and Suggested Compliant Rewrite
 */
export async function generateLlmExplanation({ title, textContent, findings, evidenceChunks }) {
  const apiKey = config.huggingface.apiKey;
  const model = config.huggingface.llmModel;

  const fallbackRewrite = localRuleGroundedRewrite(textContent, findings);

  if (!apiKey) {
    return {
      status: 'LOCAL_RULE_GROUNDED_FALLBACK',
      model: `${model} (offline rule-guided synthesis)`,
      explanation: findings.length > 0
        ? `Identified ${findings.length} governance item(s). Recommended actions focus on replacing prohibited absolutes with substantiated facts and inserting required disclaimers.`
        : 'Content adheres strictly to approved guidelines.',
      suggestedRewrite: fallbackRewrite,
      disclaimer: 'Note: AI suggestions are advisory and require human editorial review prior to publication.'
    };
  }

  try {
    const prompt = `You are INKLOOM AI Brand Governance Assistant.
Brand Guidelines Violations:
${findings.map(f => `- [${f.severity}] ${f.message} (Action: ${f.recommended_action})`).join('\n')}

Original Submission:
"${textContent}"

Task: Provide a compliant, professional rewrite that resolves all flagged issues while preserving original messaging intent. Return only the revised text.`;

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 350, temperature: 0.3 }
      })
    });

    if (!res.ok) throw new Error(`HF LLM error: ${res.statusText}`);

    const data = await res.json();
    const rawGenerated = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    const cleaned = rawGenerated ? rawGenerated.replace(prompt, '').trim() : fallbackRewrite;

    return {
      status: 'LIVE_HF_LLM',
      model,
      explanation: `LLM evaluated ${findings.length} findings against enterprise brand guidelines.`,
      suggestedRewrite: cleaned || fallbackRewrite,
      disclaimer: 'Note: AI suggestions are advisory and require human editorial review prior to publication.'
    };
  } catch (err) {
    return {
      status: 'FALLBACK_ON_ERROR',
      model: `${model} (fallback: ${err.message})`,
      explanation: `Fallback generator resolved ${findings.length} compliance item(s).`,
      suggestedRewrite: fallbackRewrite,
      disclaimer: 'Note: AI suggestions are advisory and require human editorial review prior to publication.'
    };
  }
}
