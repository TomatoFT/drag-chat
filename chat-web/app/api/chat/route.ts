import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"
import { addResource, queryResource } from "@/lib/vector-store"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant with a memory. You can remember information users tell you by storing it in your knowledge base.
    
    When a user tells you a fact about themselves or shares information, ALWAYS use the addResource tool to save it.
    
    When a user asks a question that might be related to previously stored information, ALWAYS use the queryResource tool to check your knowledge base before answering.
    
    Only respond to questions using information from your knowledge base. If no relevant information is found, respond with "I don't have that information in my knowledge base yet."
    
    Be conversational and helpful.`,
    messages,
    tools: {
      addResource: tool({
        description: `Add information to your knowledge base.
          Use this tool whenever the user shares any information or facts.`,
        parameters: z.object({
          content: z.string().describe("The information to add to the knowledge base"),
        }),
        execute: async ({ content }) => {
          await addResource(content)
          return { success: true, message: "Information saved to knowledge base" }
        },
      }),

      queryResource: tool({
        description: `Search your knowledge base for relevant information.
          Use this tool whenever the user asks a question that might relate to previously stored information.`,
        parameters: z.object({
          query: z.string().describe("The query to search for in the knowledge base"),
        }),
        execute: async ({ query }) => {
          const results = await queryResource(query)
          return {
            results,
            found: results.length > 0,
          }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
