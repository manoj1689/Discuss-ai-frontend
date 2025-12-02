import { NextResponse } from "next/server"
import OpenAI from "openai"

const getAiClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing in env")
  return new OpenAI({ apiKey })
}

export async function POST(req: Request) {
  try {
    const { draft } = await req.json()

    const ai = getAiClient()

    const prompt = `
      You are an insightful editor for Discuzz.ai. The user wants to post the following draft:

      "${draft}"

      Your goal:
      - Extract the user's hidden context.
      - Generate 3 short, sharp, leading questions that uncover:
        1. Their underlying intent or goal.
        2. The unspoken assumptions they are making.
        3. The emotional tone or nuance they want to convey.

      Format:
      Return ONLY a JSON array of 3 strings.
    `

    const response = await ai.chat.completions.create({
      model: "gpt-4.1-mini", // or "gpt-4o-mini", "gpt-4.1"
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json"
      }
    })

    const json = response.choices[0]?.message?.content
    if (!json) throw new Error("No AI response")

    const questions = JSON.parse(json)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("AI Error:", error)
    return NextResponse.json(
      {
        questions: [
          "What is your main goal with this post?",
          "Who exactly are you speaking to?",
          "What assumptions are you making that you haven't said out loud?",
        ],
      },
      { status: 200 }
    )
  }
}
