const axios = require('axios');

class AIService {
    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY;
        this.baseURL = 'https://api.deepseek.com/v1';
    }

    async generateResponse(prompt) {
        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: "deepseek-coder",
                messages: [
                    { role: "system", content: "You are a helpful AI programming tutor." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            throw error;
        }
    }

    async analyzePracticeCode(code, language) {
        try {
            const response = await axios.post(`${this.baseURL}/code/analyze`, {
                code,
                language,
                analysis_type: ['bugs', 'improvements', 'complexity']
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error analyzing code:', error);
            throw error;
        }
    }

    async generateHints(problem, difficulty) {
        try {
            const prompt = `Generate a hint for this ${difficulty} level programming problem: ${problem}`;
            return await this.generateResponse(prompt);
        } catch (error) {
            console.error('Error generating hints:', error);
            throw error;
        }
    }

    async generateCustomLearningPath(userSkills, goals) {
        try {
            const prompt = `Create a personalized learning path for a student with the following skills: ${JSON.stringify(userSkills)} 
                           who wants to achieve these goals: ${JSON.stringify(goals)}`;
            return await this.generateResponse(prompt);
        } catch (error) {
            console.error('Error generating learning path:', error);
            throw error;
        }
    }
}

module.exports = new AIService();
