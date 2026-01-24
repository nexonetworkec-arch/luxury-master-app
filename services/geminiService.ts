
import { AnalysisResult, PredictiveInsights, WinnerEntry, QuantumAuditResult, ExecutiveReport } from "../types";
import { auth } from "./firebase";

const API_BASE = (window as any).process?.env?.VITE_API_BASE || "/api";

async function callBackend(path: string, body: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED: Usuario no autenticado.");

  const idToken = await user.getIdToken();
  
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "SERVER_ERROR");
  }

  return response.json();
}

export const getQuantumAudit = async (logs: any[]): Promise<QuantumAuditResult> => {
  return callBackend("/quantum-audit", { logs });
};

export const generateExecutiveReport = async (data: any): Promise<ExecutiveReport> => {
  return callBackend("/generate-report", { data });
};

export const getPredictiveInsights = async (history: WinnerEntry[]): Promise<PredictiveInsights> => {
  return callBackend("/predictive-insights", { history });
};

export const suggestPrizes = async (businessType: string, theme?: string): Promise<string[]> => {
  try {
    const data = await callBackend("/suggest-prizes", { businessType, theme });
    return data.prizes;
  } catch (e) {
    return ["BONO VIP", "TARJETA REGALO", "DÍA LIBRE", "EXPERIENCIA EXCLUSIVA"];
  }
};

export const analyzeCode = async (code: string): Promise<AnalysisResult> => {
  return callBackend("/analyze-code", { code });
};

export const generateBrandedBackground = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "16:9"): Promise<string | null> => {
  try {
    const data = await callBackend("/generate-background", { prompt, aspectRatio, model: 'imagen-4.0-generate-001' });
    return data.imageUrl;
  } catch (e) {
    return null;
  }
};

export const generateVictoryVideo = async (prizeName: string): Promise<string | null> => {
  try {
    const data = await callBackend("/generate-video", { prizeName, model: 'veo-3.1-fast-generate-preview' });
    return data.videoUrl;
  } catch (e) {
    return null;
  }
};

export const generateLicenseKey = async (level: 'pro' | 'ppe'): Promise<string> => {
  const data = await callBackend("/licenses/generate", { level });
  return data.key;
};
