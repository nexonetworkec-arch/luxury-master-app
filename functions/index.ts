
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Inicialización de Gemini con la clave de API segura del entorno del servidor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Middleware: Verificación de Identidad de Firebase
 */
const verifyFirebaseToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'TOKEN_MISSING', message: 'Se requiere un token de autenticación válido.' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) { 
    return res.status(401).json({ error: 'TOKEN_INVALID', message: 'Token expirado o inválido.' }); 
  }
};

/**
 * Middleware: Verificación de Privilegios Administrativos
 */
const checkAdminStatus = async (req: any, res: any, next: any) => {
  try {
    const snap = await admin.database().ref(`admins/${req.user.uid}`).once('value');
    if (snap.exists()) return next();
    return res.status(403).json({ error: 'ACCESS_DENIED', message: 'Se requieren privilegios de administrador para esta acción.' });
  } catch (e) {
    return res.status(500).json({ error: 'INTERNAL_SECURITY_ERROR' });
  }
};

// --- ENDPOINTS DE IA (GEMINI BACKEND) ---

app.post('/quantum-audit', verifyFirebaseToken, checkAdminStatus, async (req, res) => {
  const { logs } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Realiza una auditoría de seguridad y entropía cuántica sobre estos logs: ${JSON.stringify(logs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entropyScore: { type: Type.NUMBER },
            encryptionStrength: { type: Type.STRING },
            detectedAnomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  risk: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e) { 
    res.status(500).json({ error: "QUANTUM_AUDIT_FAILED" }); 
  }
});

app.post('/generate-report', verifyFirebaseToken, checkAdminStatus, async (req, res) => {
  const { data } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Genera un reporte ejecutivo de BI basado en estos datos: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            aiExecutiveSummary: { type: Type.STRING },
            securityStatus: { type: Type.STRING }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e) { 
    res.status(500).json({ error: "REPORT_GENERATION_FAILED" }); 
  }
});

app.post('/predictive-insights', verifyFirebaseToken, checkAdminStatus, async (req, res) => {
  const { history } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza este historial de leads para generar insights predictivos: ${JSON.stringify(history)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conversionProbability: { type: Type.NUMBER },
            growthStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
            userSentiment: { type: Type.STRING }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e) {
    res.status(500).json({ error: "PREDICTIVE_ANALYSIS_FAILED" });
  }
});

app.post('/suggest-prizes', verifyFirebaseToken, async (req, res) => {
  const { businessType, theme } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugiere una lista de 8 premios de lujo para una empresa de tipo ${businessType} con temática ${theme || 'General'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prizes: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || "{\"prizes\":[]}"));
  } catch (e) {
    res.status(500).json({ error: "PRIZE_SUGGESTION_FAILED" });
  }
});

app.post('/analyze-code', verifyFirebaseToken, async (req, res) => {
  const { code } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza arquitectónicamente este código y devuelve un reporte de calidad, seguridad y complejidad: \n\n${code}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            complexityScore: { type: Type.NUMBER },
            securityConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanations: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { section: { type: Type.STRING }, content: { type: Type.STRING } } 
              } 
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e) {
    res.status(500).json({ error: "CODE_ANALYSIS_FAILED" });
  }
});

// --- OPERACIONES ADMINISTRATIVAS ---

app.post('/licenses/generate', verifyFirebaseToken, checkAdminStatus, async (req, res) => {
  const { level } = req.body;
  const key = `LXM-${level.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const licenseData = { 
    key, 
    level, 
    isActive: true, 
    createdAt: admin.database.ServerValue.TIMESTAMP,
    generatedBy: req.user.uid
  };
  await admin.database().ref(`licenses/${key}`).set(licenseData);
  
  // Auditoría master
  await admin.database().ref('audit_master').push({
    event: `LICENSE_GENERATED: ${key} (${level})`,
    timestamp: new Date().toISOString(),
    type: 'security',
    user: req.user.email
  });

  res.json({ key });
});

export const api = functions.https.onRequest(app);
