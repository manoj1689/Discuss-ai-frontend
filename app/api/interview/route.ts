import { GoogleGenAI, Type } from "@google/genai"
import { NextResponse } from "next/server"

const getAiClient = () => {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables")
  }
  return new GoogleGenAI({ apiKey })
}

export async function POST(request: Request) {
  try {
    const { draft } = await request.json()

    const ai = getAiClient()
    const prompt = `
      You are an insightful editor for Discuzz.ai. The user wants to post the following draft:
      "${draft}"

      Your goal is to extract the user's hidden context. Generate 3 short, sharp, leading questions that will help uncover:
      1. Their underlying intent/goal.
      2. The unspoken assumptions they are making.
      3. The specific emotional tone or nuance they want to convey.

      Return ONLY a JSON array of strings.
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    })

    const text = response.text
    if (!text) throw new Error("No response from AI")

    const questions = JSON.parse(text)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        questions: [
          "What is your main goal with this post?",
          "Who is the specific target audience?",
          "What assumptions are you making that aren't stated?",
        ],
      },
      { status: 200 },
    )
  }
}
