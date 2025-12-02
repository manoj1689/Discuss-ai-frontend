import type { ContextProfile, Message } from "../types"

// Function to get AI client (not used in the updated code)
const getAiClient = () => {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables")
  }
  // Placeholder for AI client initialization
  return {}
}

// 1. Interview Phase: Generate questions based on the draft
export const generateInterviewQuestions = async (draft: string): Promise<string[]> => {
  try {
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    })

    if (!response.ok) throw new Error("Failed to generate questions")
    const data = await response.json()
    return data.questions
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return [
      "What is your main goal with this post?",
      "Who is the specific target audience?",
      "What assumptions are you making that aren't stated?",
    ]
  }
}

// 2. Synthesis Phase: Create Context Profile from draft + interview
export const generateContextProfile = async (draft: string, interviewHistory: Message[]): Promise<ContextProfile> => {
  try {
    const response = await fetch("/api/context-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft, interviewHistory }),
    })

    if (!response.ok) throw new Error("Failed to generate profile")
    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error("Error creating context profile:", error)
    return {
      intent: "To share an opinion.",
      tone: "Neutral",
      assumptions: "None explicitly stated.",
      audience: "General public",
      coreArgument: draft,
    }
  }
}

// 3. Delegate Phase: Respond to a user query based on the profile
export const generateDelegateResponse = async (
  originalPost: string,
  profile: ContextProfile,
  userQuery: string,
  chatHistory: Message[],
): Promise<string> => {
  try {
    const response = await fetch("/api/delegate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalPost, profile, userQuery, chatHistory }),
    })

    if (!response.ok) throw new Error("Failed to generate response")
    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("Error generating delegate response:", error)
    return "I am unable to respond at this moment."
  }
}
