const { AzureOpenAI } = require("openai");
const { AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_VERSION } = require('../constants/env')

const systemMsg = `
you are an AI agent who responds to a mail.
1. Use tools/funtions provided to you for generating the response
2. Do not assume anything yourself
`

const mailTool = {
    "type": "function",
    "function": {
        "name": "mail_reply",
        "description": "whenever user gives you an email body , use this function to create the response",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": "Categorize the email based on the content and assign label as follows : 1. Interested 2.Not_Interested 3. More_Information"
                },
                "reply": {
                    "type": "string",
                    "description": `suggest an appropriate response based on the content of the email and send out a reply. For example - 
                                 a. If the email mentions they are interested to know more, your reply should ask them if they are willing
                                 to hop on to a demo call by suggesting a time.
                                 b.If email mentions they are not interested your reply tell them that you are sorry to hear that and if they have some feedback.
                                 c.If email mentions they need some more information then ask them to reachn out to you at xyz@gmail.com
                                 always start with hey {user} and end with thanks and regards.
                                 note: always return an html body that can be directly send in a mail`
                }
            }
        },
        "required": ["category", "reply"]
    }
}
class AzureClient {
    constructor() {
        this.client = new AzureOpenAI({ endpoint: AZURE_OPENAI_ENDPOINT, apiKey: AZURE_OPENAI_API_KEY, apiVersion: AZURE_OPENAI_VERSION, deployment: AZURE_OPENAI_DEPLOYMENT });
    }
    async getCompletion(msg) {
        console.log("msg sent to llm", msg)

        const result = await this.client.chat.completions.create({
            messages: [{ "role": "system", "content": systemMsg }, ...msg],
            tools: [mailTool]
            // tool_choice: "required"
        });
        return result?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    }
}


module.exports = AzureClient;