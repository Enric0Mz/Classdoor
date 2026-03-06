import Anthropic from "@anthropic-ai/sdk";

let anthropicClient;

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

const MODERATION_PROMPT = `You are a content moderator for a Brazilian university review platform.
Analyze the following review comment and classify it into one of these categories:

- APPROVED: The comment is a legitimate review, even if negative or critical.
- REJECTED_OFFENSIVE: The comment contains profanity, hate speech, insults, slurs, or harassment.
- REJECTED_NONSENSE: The comment is gibberish, random characters, or has no meaningful content.
- REJECTED_OTHER: The comment is spam, off-topic, or violates review guidelines for other reasons.

Be lenient with grammar and spelling mistakes — those are normal. Only reject content that is clearly offensive or clearly nonsensical.

Respond ONLY with a JSON object (no markdown, no code fences):
{"status": "APPROVED", "reason": null}

If rejected, include a short reason in Portuguese explaining why:
{"status": "REJECTED_OFFENSIVE", "reason": "Sua avaliação contém linguagem ofensiva e não pode ser publicada."}

Review comment to analyze:`;

const DEFAULT_APPROVED_RESULT = {
  moderationStatus: "APPROVED",
  moderationReason: null,
};

/**
 * Moderates a review comment using Claude AI.
 * Returns the moderation status and an optional reason in Portuguese.
 * Fails open (defaults to APPROVED) if the API call fails.
 *
 * @param {string} comment - The review comment to moderate
 * @returns {Promise<{moderationStatus: string, moderationReason: string|null}>}
 */
export async function moderateComment(comment) {
  try {
    const response = await getAnthropicClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `${MODERATION_PROMPT}\n\n"${comment}"`,
        },
      ],
    });

    const responseText = response.content[0].text.trim();
    const parsed = JSON.parse(responseText);

    const validStatuses = [
      "APPROVED",
      "REJECTED_OFFENSIVE",
      "REJECTED_NONSENSE",
      "REJECTED_OTHER",
    ];

    if (!validStatuses.includes(parsed.status)) {
      return DEFAULT_APPROVED_RESULT;
    }

    return {
      moderationStatus: parsed.status,
      moderationReason: parsed.reason || null,
    };
  } catch (error) {
    console.error(
      "Moderation API error, defaulting to APPROVED:",
      error.message,
    );
    return DEFAULT_APPROVED_RESULT;
  }
}
