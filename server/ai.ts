import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Instantiate GoogleGenAI with appropriate headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Configure the Response Schema for the Gemini model
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    is_valid_skin_image: {
      type: Type.BOOLEAN,
      description: "Must be true if the uploaded image represents actual human skin, moles, hair, or nails. Must be false if the image provided does NOT contain or show human skin or related dermatological areas (for instance, if the image shows objects, scenery, text, food, animals, or general household items). If no image is provided, default to true since analysis is based on symptoms."
    },
    condition: {
      type: Type.STRING,
      description: "Specific medical name of the detected skin condition"
    },
    confidence: {
      type: Type.STRING,
      description: "Confidence level of analysis. Must be one of: High, Moderate, Low"
    },
    severity: {
      type: Type.STRING,
      description: "Severity of condition. Must be one of: Low, Moderate, High"
    },
    description: {
      type: Type.STRING,
      description: "2-3 sentence clinical description of this condition"
    },
    causes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 key causes of this condition"
    },
    risk_factors: {
      type: Type.STRING,
      description: "2 sentences on who is most at risk and why"
    },
    when_to_see_doctor: {
      type: Type.STRING,
      description: "Clear guidance on urgency and warning signs to watch for"
    },
    products: {
      type: Type.ARRAY,
      description: "4-5 skincare products useful for treating the condition, taking into account user's skin type.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Specific product name" },
          brand: { type: Type.STRING, description: "Brand name" },
          type: { 
            type: Type.STRING, 
            description: "Product category, must be one of: Cleanser, Moisturizer, Cream, Serum, Ointment, Sunscreen, Gel, Lotion, Toner, Antifungal, Antihistamine" 
          },
          emoji: { type: Type.STRING, description: "single highly relevant emoji for the product type" },
          description: { type: Type.STRING, description: "Why this specific product helps for this condition (1-2 sentences)" },
          key_ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 active ingredients" },
          price_range: { type: Type.STRING, description: "Realistic price range, e.g. $8-$15" },
          how_to_use: { type: Type.STRING, description: "Brief usage instructions" }
        },
        required: ["name", "brand", "type", "emoji", "description", "key_ingredients", "price_range", "how_to_use"]
      }
    },
    immediate_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 key immediate care steps"
    },
    daily_routine: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Daily care routine steps, including morning/evening guidance"
    },
    avoid: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key things or ingredients to avoid"
    },
    disclaimer: {
      type: Type.STRING,
      description: "One clear sentence medical disclaimer stating that this is an AI recommendation and not a replacement for medical diagnosis"
    }
  },
  required: [
    "is_valid_skin_image", "condition", "confidence", "severity", "description", "causes", 
    "risk_factors", "when_to_see_doctor", "products", "immediate_steps", 
    "daily_routine", "avoid", "disclaimer"
  ]
};

export async function analyzeSkinWithGemini(params: {
  imageBase64?: string;
  imageMimeType?: string;
  bodyPart: string;
  duration: string;
  skinType: string;
  symptoms: string[];
}): Promise<any> {
  const { imageBase64, imageMimeType, bodyPart, duration, skinType, symptoms } = params;

  const symptomListText = symptoms.length > 0 ? symptoms.join(', ') : 'None reported';

  const systemInstruction = 
    `You are an expert clinical dermatologist. You are analyzing reported patient details and an optional image.
CRITICAL PROTOCOL FOR IMAGE VALIDATION:
1. If an image is uploaded (imageBase64 is provided), you must examine it to confirm if it represents human skin, moles, rash, follicles, nails, or other dermatological regions.
2. If the image is unrelated, showing completely non-skin subjects (e.g., animals, text, landscape scenery, food, machinery, furniture, general objects), you MUST strictly do the following:
   - Set "is_valid_skin_image" to false.
   - Set "condition" to "Invalid Image / Non-Skin Photo".
   - Set "confidence" to "Low" and "severity" to "Low".
   - Set "description" to: "The uploaded file does not contain a recognizable human skin specimen, mole, or dermatological issue. For a precise and personalized AI analysis, please upload a close-up, sharp, and well-lit photo of your specific skin concern."
   - Set "causes" to: ["Non-dermatological image upload", "Unclear perspective or distance", "Camera sensor artifact"].
   - Populate "products", "immediate_steps", "daily_routine", "avoid" with absolute gentlest basic neutral hygiene protocols (like mild generic hydrating cleansers, plain moisturizers, daily mineral sunscreen) and explicitly note in descriptions that these are gentle standard moisturization recommendations, since the image subject is unrecognized.
3. If the image is indeed a valid human skin or mole sample, process it with high scientific precision, diagnostic care, and clinical recommendations tailored to skinType: ${skinType || 'Not specified'}. Under this valid case, set "is_valid_skin_image" to true.

CRITICAL PROTOCOL FOR AUTHENTIC recommendations:
- DO NOT provide generic placeholders like "Gentle Cleanser" or "Healing Cream".
- ALWAYS recommend actual, commercially available, real-world skincare brands and specific product names (e.g., "CeraVe Foaming Facial Cleanser", "La Roche-Posay Effaclar Duo Dual Action Acne Treatment", "Eucerin Rugged Skin Relief", "The Ordinary Niacinamide 10% + Zinc 1%", "Aquaphor Healing Ointment", "Neutrogena Hydro Boost Water Gel").
- Ensure all therapeutic steps, causes, immediate steps, and avoidance guidance are highly medically accurate, realistic, detailed, and directly address the identified clinical state (e.g., citing specific pathological triggers, inflammatory mediators, and barrier recovery mechanisms).`;

  const promptText = `
Reported details:
- Affected Body Part: ${bodyPart || 'Not specified'}
- Duration of Condition: ${duration || 'Not specified'}
- Patient's Skin Type: ${skinType || 'Not specified'}
- Reported Symptoms: [ ${symptomListText} ]
- Image provided: ${imageBase64 ? 'Yes (attached to payload)' : 'No'}

Please review all details and formulate a full diagnosis. If an image is provided, examine it closely to classify the skin disease condition.
Return the result structured exactly matches the required response schema.
  `;

  try {
    const contents: any[] = [];

    // Attach image if base64 data exists
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: imageBase64
        }
      });
    }

    contents.push({
      text: promptText
    });

    let result: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Sending scan request to Google Gemini API (model: ${modelName}, attempt: ${attempt}/2)...`);
          result = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: analysisSchema
            }
          });
          lastError = null;
          break; // Succeeded! Break out of the attempt loop
        } catch (error: any) {
          console.error(`Attempt ${attempt} with model ${modelName} failed:`, error?.message || error);
          lastError = error;
          // Wait briefly before retrying (exponential backoff)
          const waitMs = attempt * 1500;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
      if (result) {
        break; // Succeeded! Break out of the model loop
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const outputText = result?.text;
    if (!outputText) {
      throw new Error("Empty response received from Gemini API");
    }

    return JSON.parse(outputText);
  } catch (error) {
    console.error('Gemini API analysis failed:', error);
    throw error;
  }
}
