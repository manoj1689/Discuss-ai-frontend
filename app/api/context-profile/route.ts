import { GoogleGenAI, Type } from "@google/genai"
import { NextResponse } from "next/server"
import type { ContextProfile, Message } from "@/types"

const getAiClient = () => {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables")
  }
  return new GoogleGenAI({ apiKey })
}

export async function POST(request: Request) {
  try {
    const { draft, interviewHistory } = await request.json()

    const ai = getAiClient()

    const conversationText = interviewHistory.map((m: Message) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")

    const prompt = `
      Analyze the following draft and interview transcript to create a structured Context Profile.
      
      Draft: "${draft}"
      
      Interview Transcript:
      ${conversationText}

      Extract the following fields accurately.
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, description: "The primary goal of the post" },
            tone: { type: Type.STRING, description: "The emotional nuance" },
            assumptions: { type: Type.STRING, description: "Underlying premises" },
            audience: { type: Type.STRING, description: "Target demographic" },
            coreArgument: { type: Type.STRING, description: "The central thesis in one sentence" },
          },
          required: ["intent", "tone", "assumptions", "audience", "coreArgument"],
        },
      },
    })

    const text = response.text
    if (!text) throw new Error("No response from AI")

    const profile: ContextProfile = JSON.parse(text)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error:", error)
    const fallbackProfile: ContextProfile = {
      intent: "To share an opinion.",
      tone: "Neutral",
      assumptions: "None explicitly stated.",
      audience: "General public",
      coreArgument: "",
    }
    return NextResponse.json({ profile: fallbackProfile }, { status: 200 })
  }
}
