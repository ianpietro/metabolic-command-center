import { parseMealText, type ParseResult } from "./parser";
import { computeRisk, type RiskResult } from "./risk";
import { nextAction, type PreventiveAction } from "./actions";
import type { LogEntry, Profile } from "./types";

export interface MetabolicEngine {
  parse(text: string): ParseResult;
  risk(logs: LogEntry[], profile?: Profile, now?: number): RiskResult;
  action(risk: RiskResult, logs: LogEntry[], profile?: Profile): PreventiveAction;
}

export class LocalMockEngine implements MetabolicEngine {
  parse(text: string) { return parseMealText(text); }
  risk(logs: LogEntry[], profile?: Profile, now = Date.now()) {
    return computeRisk(logs, profile, now);
  }
  action(risk: RiskResult, logs: LogEntry[], profile?: Profile) {
    return nextAction(risk, logs, profile);
  }
}

// Singleton — trocar por EdgeFunctionEngine quando Supabase Cloud estiver ligado.
export const engine: MetabolicEngine = new LocalMockEngine();
