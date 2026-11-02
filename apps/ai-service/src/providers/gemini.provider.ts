import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import type {
  AiProvider,
  GenerateDraftsParams,
  SummarizeProjectParams,
  AiTaskDraft,
  ProjectSummaryOutput,
  TaskPriority,
} from './ai-provider.interface.js';

@Injectable()
export class GeminiProvider implements AiProvider {
  readonly providerName = 'Google Gemini (Official SDK)';
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
      this.logger.log('GeminiProvider initialized with API key.');
    } else {
      this.logger.warn('GEMINI_API_KEY not found; GeminiProvider will throw if invoked directly.');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateTaskDrafts(params: GenerateDraftsParams): Promise<AiTaskDraft[]> {
    if (!this.client) {
      throw new Error('GeminiProvider is not configured with an API key.');
    }

    const limit = Math.min(Math.max(params.maxDrafts ?? 3, 1), 6);
    const sanitizedObjective = params.projectObjective.slice(0, 500).trim();

    const systemInstruction = `You are an expert technical project management AI for TaskFlow AI SaaS.
Given a project objective, generate between 1 and ${limit} actionable, professional task proposals.
Your output must be strict JSON matching this structure:
{
  "drafts": [
    {
      "title": "Clear action-oriented title",
      "description": "Specific deliverable description",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "subtasks": ["subtask 1", "subtask 2"],
      "estimatedHours": "X hours",
      "rationale": "Brief architectural or operational justification"
    }
  ]
}
Do not include markdown fences, HTML tags, or extra commentary. Output JSON only.`;

    const userPrompt = `Project Objective: "${sanitizedObjective}". Generate up to ${limit} task drafts.`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      const rawDrafts = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.drafts) ? parsed.drafts : [];

      const validated: AiTaskDraft[] = rawDrafts.slice(0, limit).map((d: any, idx: number) => {
        const allowedPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        const priority: TaskPriority = allowedPriorities.includes(d.priority?.toUpperCase())
          ? (d.priority.toUpperCase() as TaskPriority)
          : 'MEDIUM';

        return {
          id: `draft-${Date.now()}-${idx + 1}`,
          title: String(d.title || `Task Proposal ${idx + 1}`).slice(0, 150),
          description: String(d.description || 'AI drafted project task').slice(0, 500),
          priority,
          subtasks: Array.isArray(d.subtasks)
            ? d.subtasks.map((s: any) => String(s).slice(0, 100)).slice(0, 5)
            : [],
          estimatedHours: String(d.estimatedHours || '2 hours').slice(0, 20),
          rationale: String(d.rationale || 'Suggested for project execution').slice(0, 300),
        };
      });

      if (validated.length === 0) {
        throw new Error('Model produced zero valid task drafts.');
      }

      return validated;
    } catch (err) {
      this.logger.error(`Gemini generation failure: ${(err as Error).message}`);
      throw new Error(`Gemini task drafting failed: ${(err as Error).message}`);
    }
  }

  async summarizeProject(params: SummarizeProjectParams): Promise<ProjectSummaryOutput> {
    if (!this.client) {
      throw new Error('GeminiProvider is not configured with an API key.');
    }

    const sanitizedName = params.projectName.slice(0, 100);
    const systemInstruction = `You are a technical delivery manager for TaskFlow AI SaaS.
Summarize project health based on the stats provided.
Output must be strict JSON matching:
{
  "headline": "Brief executive summary headline",
  "healthStatus": "ON_TRACK" | "AT_RISK" | "CRITICAL",
  "keyAchievements": ["Achievement 1", "Achievement 2"],
  "milestoneRisks": ["Risk or blocker 1", "Risk or blocker 2"]
}`;

    const userPrompt = `Project: "${sanitizedName}". Completed tasks: ${params.completedCount}. Pending tasks: ${params.pendingCount}. Notes: "${params.milestoneNotes || 'None'}".`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      const allowedStatuses: ('ON_TRACK' | 'AT_RISK' | 'CRITICAL')[] = [
        'ON_TRACK',
        'AT_RISK',
        'CRITICAL',
      ];
      const healthStatus = allowedStatuses.includes(parsed.healthStatus?.toUpperCase())
        ? parsed.healthStatus.toUpperCase()
        : 'ON_TRACK';

      return {
        headline: String(parsed.headline || `${sanitizedName} Summary`).slice(0, 150),
        healthStatus,
        keyAchievements: Array.isArray(parsed.keyAchievements)
          ? parsed.keyAchievements.map((a: any) => String(a).slice(0, 150)).slice(0, 4)
          : ['Completed scheduled milestones on track'],
        milestoneRisks: Array.isArray(parsed.milestoneRisks)
          ? parsed.milestoneRisks.map((r: any) => String(r).slice(0, 150)).slice(0, 4)
          : ['No critical blockers reported'],
      };
    } catch (err) {
      this.logger.error(`Gemini summarization failure: ${(err as Error).message}`);
      throw new Error(`Gemini summarization failed: ${(err as Error).message}`);
    }
  }
}
