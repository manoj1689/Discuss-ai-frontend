import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"
import type { Message } from "@/types"

const getAiClient = () => {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables")
  }
  return new GoogleGenAI({ apiKey })
}

export async function POST(request: Request) {
  try {
    const { originalPost, profile, userQuery, chatHistory } = await request.json()

    const ai = getAiClient()

    const historyText = chatHistory
      .slice(-5)
      .map((m: Message) => `${m.role === "user" ? "Reader" : "Author Delegate"}: ${m.content}`)
      .join("\n")

    const systemInstruction = `
      You are the AI Delegate for the author of this post.
      
      Original Post: "${originalPost}"
      
      Author's Context Profile (The "Truth"):
      - Intent: ${profile.intent}
      - Tone: ${profile.tone}
      - Assumptions: ${profile.assumptions}
      - Core Argument: ${profile.coreArgument}
      
      Your Task:
      Respond to the Reader's query effectively.
      1. STRICTLY adhere to the Author's tone and logic.
      2. Do NOT invent new facts outside the context; if unsure, pivot back to the core argument.
      3. Defend the author's viewpoint using the provided assumptions.
      4. Keep it concise (under 280 characters if possible, max 500).
      5. Do not start with "As the author..." just speak directly.
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Previous Chat:
        ${historyText}

        Reader: ${userQuery}
      `,
      config: {
        systemInstruction: systemInstruction,
      },
    })

    const responseText = response.text || "I cannot clarify that based on the current context."
    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ response: "I am unable to respond at this moment." }, { status: 200 })
  }
}
