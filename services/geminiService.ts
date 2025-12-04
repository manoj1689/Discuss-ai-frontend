import type { ContextProfile, Message } from "../types"
import { apiFetch } from "@/lib/api"

// 1. Interview Phase: Generate questions based on the draft
export const generateInterviewQuestions = async (draft: string, token?: string): Promise<string[]> => {
  try {
    const data = await apiFetch<{ questions: string[] }>("/ai/interview", {
      method: "POST",
      token,
      body: JSON.stringify({ draft }),
    })
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
export const generateContextProfile = async (
  draft: string,
  interviewHistory: Message[],
  token?: string,
): Promise<ContextProfile> => {
  try {
    const data = await apiFetch<{ profile: ContextProfile }>("/ai/context-profile", {
      method: "POST",
      token,
      body: JSON.stringify({ draft, interview_history: interviewHistory }),
    })
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
  token?: string,
): Promise<string> => {
  try {
    const data = await apiFetch<{ response: string }>("/ai/delegate", {
      method: "POST",
      token,
      body: JSON.stringify({ original_post: originalPost, profile, user_query: userQuery, chat_history: chatHistory }),
    })
    return data.response
  } catch (error) {
    console.error("Error generating delegate response:", error)
    return "I am unable to respond at this moment."
  }
}
