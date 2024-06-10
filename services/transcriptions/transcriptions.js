import { createClient } from "@deepgram/sdk";

export class TranscriptionService {
    constructor() {
        this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    }

    async transcribeAudioFromUrl(audioUrl) {
        try {
            const response =
                await this.deepgram.listen.prerecorded.transcribeUrl(
                    {
                        url: audioUrl,
                    },
                    {
                        model: "nova-2",
                        language: "es-419",
                        filler_words: false,
                        smart_format: true,
                    }
                );

            if (response.error) throw new Error(response.error);

            return response.result;
        } catch (error) {
            console.error("Error in transcribeAudioFromUrl:", error);
            throw new Error("Failed to transcribe audio");
        }
    }
}
