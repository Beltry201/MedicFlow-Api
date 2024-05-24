import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export class BedrockService {
    constructor(region = "us-east-1") {
        this.client = new BedrockRuntimeClient({ region });
    }

    async runPrompt(prompt, audio_transcript, template_json) {
        const input = {
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                temperature: 0.2,
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `${String(audio_transcript)}\n${String(
                                    prompt
                                )}\n${JSON.stringify(template_json)}`,
                            },
                        ],
                    },
                ],
            }),
        };

        try {
            const command = new InvokeModelCommand(input);
            const response = await this.client.send(command);
            const jsonString = new TextDecoder().decode(response.body);
            const parsedResponse = JSON.parse(jsonString);

            console.log(parsedResponse);

            // Ensure the response content is properly formatted
            const answerText = parsedResponse.content[0].text.trim();
            let answer;

            try {
                answer = JSON.parse(answerText);
            } catch (e) {
                console.error("Response is not valid JSON:", answerText);
                throw new Error("Invalid response format");
            }

            return answer;
        } catch (error) {
            console.error("Error running prompt:", error);
            return null;
        }
    }
}
