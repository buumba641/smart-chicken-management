import { GoogleGenAI } from '@google/genai'
import { collection, getDocs, getFirestore, limit, query } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'smart-chicken-management',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig, 'chicdoc-server')
const db = getFirestore(app)
const systemInstruction = `You are ChicDoc, a practical poultry health assistant for small and medium chicken farmers. Give concise, farmer-friendly guidance. Use supplied sensor readings and chicken age when relevant; never invent sensor values. This chicken house has a heater but no cooling system. Distinguish possible causes, checks, immediate practical actions, and when to contact a qualified veterinarian. Do not present uncertain information as a diagnosis and do not claim equipment exists when it does not.`

function normalize(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function retrieveKnowledge(question) {
  try {
    const snapshot = await getDocs(query(collection(db, 'knowledgeBase'), limit(30)))
    const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 2)
    return snapshot.docs.map((item) => item.data()).map((item) => ({
      item,
      score: terms.reduce((score, term) => score + `${item.title || ''} ${item.content || ''} ${Array.isArray(item.tags) ? item.tags.join(' ') : ''}`.toLowerCase().includes(term) ? 1 : 0, 0),
    })).sort((a, b) => b.score - a.score).slice(0, 5).map(({ item }) => `${item.title || 'Knowledge note'}: ${item.content || ''}`).join('\n\n')
  } catch (error) {
    console.error('ChicDoc knowledge retrieval failed', error instanceof Error ? error.message : error)
    return ''
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  const message = normalize(request.body?.message)
  if (!message) return response.status(400).json({ error: 'Please enter a question.' })
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'ChicDoc is not configured on the server yet.' })

  try {
    const context = request.body?.context || {}
    const knowledge = await retrieveKnowledge(message)
    const prompt = `Current chicken-house context:\n${JSON.stringify(context)}\n\nRelevant knowledge-base notes:\n${knowledge || 'No matching notes found.'}\n\nFarmer question:\n${message}`
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const result = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, maxOutputTokens: 500 } })
    return response.status(200).json({ text: result.text || 'ChicDoc could not produce an answer right now.' })
  } catch (error) {
    console.error('ChicDoc request failed', error instanceof Error ? error.message : error)
    const status = error?.status === 429 ? 429 : 502
    return response.status(status).json({ error: status === 429 ? 'ChicDoc is busy. Please try again shortly.' : 'ChicDoc is temporarily unavailable. Please try again shortly.' })
  }
}