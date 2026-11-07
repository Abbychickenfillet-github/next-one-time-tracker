import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say hello',
  })
  console.log('✅ API 成功:', response)
} catch (error) {
  console.error('❌ API 錯誤:', error.message)
  console.error('完整錯誤:', error)
}
