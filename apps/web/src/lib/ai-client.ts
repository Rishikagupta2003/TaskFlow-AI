import type {
  AiTaskDraft,
  GenerateTaskDraftsRequestDto,
  GenerateTaskDraftsResponseData,
  SummarizeProjectRequestDto,
  SummarizeProjectResponseData,
} from '@taskflow/contracts';

export class AiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AiClientError';
  }
}

export interface FetchAiOptions {
  apiUrl?: string;
  timeoutMs?: number;
}

export interface EditableAiDraft extends AiTaskDraft {
  isEditing?: boolean;
  isApproved?: boolean;
  isDiscarded?: boolean;
}

export function toEditableDraft(draft: AiTaskDraft): EditableAiDraft {
  return {
    ...draft,
    isEditing: false,
    isApproved: false,
    isDiscarded: false,
  };
}

export async function requestTaskDrafts(
  params: GenerateTaskDraftsRequestDto,
  accessToken: string | null | undefined,
  options: FetchAiOptions = {},
): Promise<GenerateTaskDraftsResponseData> {
  if (!accessToken) {
    throw new AiClientError(
      'Authentication required: Please sign in to generate AI task proposals.',
      401,
      'UNAUTHORIZED',
    );
  }

  const baseApiUrl = options.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const url = `${baseApiUrl.replace(/\/$/, '')}/ai/task-drafts`;
  const timeoutMs = options.timeoutMs ?? 15000;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        throw new AiClientError(
          'Your session has expired. Please sign in again.',
          401,
          'SESSION_EXPIRED',
        );
      }
      if (response.status === 504) {
        throw new AiClientError(
          'AI service timed out while generating drafts. Please try again with a shorter prompt.',
          504,
          'GATEWAY_TIMEOUT',
        );
      }
      if (response.status === 502) {
        throw new AiClientError(
          'Unable to reach downstream AI service. Please verify backend services are running.',
          502,
          'BAD_GATEWAY',
        );
      }

      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `AI drafting request failed (${response.status})`;

      throw new AiClientError(
        Array.isArray(errorMessage) ? errorMessage.join('; ') : errorMessage,
        response.status,
        data?.error?.code || `HTTP_${response.status}`,
      );
    }

    return data as GenerateTaskDraftsResponseData;
  } catch (error) {
    if (error instanceof AiClientError) {
      throw error;
    }

    const err = error as Error;
    if (err.name === 'TimeoutError' || err.message?.toLowerCase().includes('timeout')) {
      throw new AiClientError(
        'The request timed out. Please check your connection and try again.',
        504,
        'TIMEOUT',
      );
    }

    throw new AiClientError(
      `Network error connecting to API Gateway: ${err.message}`,
      0,
      'NETWORK_ERROR',
    );
  }
}

export async function requestProjectSummary(
  params: SummarizeProjectRequestDto,
  accessToken: string | null | undefined,
  options: FetchAiOptions = {},
): Promise<SummarizeProjectResponseData> {
  if (!accessToken) {
    throw new AiClientError(
      'Authentication required: Please sign in to request project summary.',
      401,
      'UNAUTHORIZED',
    );
  }

  const baseApiUrl = options.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const url = `${baseApiUrl.replace(/\/$/, '')}/ai/project-summary`;
  const timeoutMs = options.timeoutMs ?? 15000;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        throw new AiClientError('Your session has expired. Please sign in again.', 401, 'SESSION_EXPIRED');
      }
      if (response.status === 504) {
        throw new AiClientError('AI service timed out while generating summary.', 504, 'GATEWAY_TIMEOUT');
      }
      if (response.status === 502) {
        throw new AiClientError('Unable to reach downstream AI service.', 502, 'BAD_GATEWAY');
      }
      const errorMessage = data?.error?.message || data?.message || 'Summary request failed';
      throw new AiClientError(
        Array.isArray(errorMessage) ? errorMessage.join('; ') : errorMessage,
        response.status,
        data?.error?.code || `HTTP_${response.status}`,
      );
    }

    return data as SummarizeProjectResponseData;
  } catch (error) {
    if (error instanceof AiClientError) {
      throw error;
    }
    const err = error as Error;
    if (err.name === 'TimeoutError' || err.message?.toLowerCase().includes('timeout')) {
      throw new AiClientError('The summary request timed out.', 504, 'TIMEOUT');
    }
    throw new AiClientError(`Network error: ${err.message}`, 0, 'NETWORK_ERROR');
  }
}
