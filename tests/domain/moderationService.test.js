const mockMessagesCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  }));
});

import { moderateComment } from "@/domain/moderationService";

beforeEach(() => jest.clearAllMocks());

function mockApiResponse(jsonObject) {
  mockMessagesCreate.mockResolvedValue({
    content: [{ text: JSON.stringify(jsonObject) }],
  });
}

describe("moderationService", () => {
  it("returns APPROVED for a valid review comment", async () => {
    mockApiResponse({ status: "APPROVED", reason: null });

    const result = await moderateComment("Ótima universidade, recomendo!");

    expect(result).toEqual({
      moderationStatus: "APPROVED",
      moderationReason: null,
    });
  });

  it("returns REJECTED_OFFENSIVE for offensive content", async () => {
    const reason = "Sua avaliação contém linguagem ofensiva.";
    mockApiResponse({ status: "REJECTED_OFFENSIVE", reason });

    const result = await moderateComment("Texto ofensivo aqui");

    expect(result).toEqual({
      moderationStatus: "REJECTED_OFFENSIVE",
      moderationReason: reason,
    });
  });

  it("returns REJECTED_NONSENSE for gibberish", async () => {
    const reason = "Sua avaliação não contém conteúdo compreensível.";
    mockApiResponse({ status: "REJECTED_NONSENSE", reason });

    const result = await moderateComment("asdjkfhaslkdjfhaskljdfh");

    expect(result).toEqual({
      moderationStatus: "REJECTED_NONSENSE",
      moderationReason: reason,
    });
  });

  it("returns REJECTED_OTHER for spam or off-topic content", async () => {
    const reason = "Sua avaliação foi identificada como spam.";
    mockApiResponse({ status: "REJECTED_OTHER", reason });

    const result = await moderateComment("Compre agora! Clique no link!");

    expect(result).toEqual({
      moderationStatus: "REJECTED_OTHER",
      moderationReason: reason,
    });
  });

  it("defaults to PENDING_MODERATION when API returns an invalid status", async () => {
    mockApiResponse({ status: "INVALID_STATUS", reason: "something" });

    const result = await moderateComment("Qualquer texto");

    expect(result).toEqual({
      moderationStatus: "PENDING_MODERATION",
      moderationReason: null,
    });
  });

  it("defaults to PENDING_MODERATION when API call fails", async () => {
    mockMessagesCreate.mockRejectedValue(new Error("API timeout"));

    const result = await moderateComment("Qualquer texto");

    expect(result).toEqual({
      moderationStatus: "PENDING_MODERATION",
      moderationReason: null,
    });
  });

  it("defaults to PENDING_MODERATION when API returns unparseable JSON", async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: "not valid json" }],
    });

    const result = await moderateComment("Qualquer texto");

    expect(result).toEqual({
      moderationStatus: "PENDING_MODERATION",
      moderationReason: null,
    });
  });

  it("sets moderationReason to null when reason is missing from response", async () => {
    mockApiResponse({ status: "REJECTED_OFFENSIVE" });

    const result = await moderateComment("Texto ofensivo");

    expect(result).toEqual({
      moderationStatus: "REJECTED_OFFENSIVE",
      moderationReason: null,
    });
  });

  it("sends the comment to the Claude API", async () => {
    mockApiResponse({ status: "APPROVED", reason: null });

    await moderateComment("Minha avaliação da universidade");

    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-haiku-4-5-20251001",
        messages: [
          expect.objectContaining({
            content: expect.stringContaining("Minha avaliação da universidade"),
          }),
        ],
      }),
    );
  });
});
