// AI interpretation/rewrite helpers (server-side only).
import { invokeLLM } from "./_core/llm";

const SYSTEM_PROMPT = `Você é um assistente de comunicação assistiva do app OneVox, usado por pessoas com dificuldades de fala ou de digitação (ex: ELA).
Sua tarefa é transformar uma entrada que pode conter erros de digitação, palavras faltando, fonação atípica ou transcrição imperfeita em uma frase CLARA, natural e bem escrita em português do Brasil, preservando 100% a intenção original.
Regras:
- Corrija erros de ortografia e gramática.
- Complete palavras ou ideias obviamente implícitas, sem inventar informações novas.
- Mantenha o tom pessoal e na primeira pessoa quando aplicável.
- Seja conciso e direto; a frase será falada em voz alta.
- NÃO adicione saudações, explicações ou comentários. Responda APENAS com a frase final reescrita.`;

/**
 * Rewrite/interpret a raw text (typed or transcribed) into a clean, speakable sentence.
 */
export async function interpretText(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  const result = typeof content === "string" ? content.trim() : "";
  return result || trimmed;
}
