import { GoogleGenAI, Type } from "@google/genai";
import type { ReorderSuggestion, InvoiceItem, Patient, DietPlan, NHISClaimItem, GeneticMarker, DrugInteractionResult, PillIdentificationResult, SOAPNote, MoodEntry, WellbeingAssessment, MentalHealthSession, CrisisAnalysisResult, TreatmentCycle, TriageLevel, TriageSuggestion, Prescription, PrescriptionReviewSuggestion } from '../types';

export const API_KEY = typeof process !== 'undefined' ? process.env.API_KEY : undefined;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll throw an error to make it clear.
  console.error("Gemini API key is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const getSymptomAnalysis = async (symptoms: string, patientHistory: string): Promise<string> => {
  if (!API_KEY) {
      throw new Error("Gemini API key not configured. Please set the API_KEY environment variable.");
  }
  try {
    const prompt = `
      Act as an expert medical assistant for a doctor in Ghana. 
      Analyze the following patient information and provide a structured clinical summary.
      
      **Patient's Reported Symptoms:**
      "${symptoms}"

      **Relevant Medical History:**
      "${patientHistory}"

      **Instructions:**
      1.  **Differential Diagnosis:** List 3-5 potential diagnoses, from most likely to least likely. For each, provide a brief rationale based on the provided information.
      2.  **Recommended Investigations:** Suggest relevant laboratory tests, imaging, or other diagnostic procedures to confirm the diagnosis. Be specific (e.g., "Full Blood Count," "Chest X-ray," "Malaria RDT").
      3.  **Immediate Management Suggestions:** Recommend initial steps for patient management while awaiting test results.
      4.  **Red Flags:** Mention any critical symptoms or signs that would warrant immediate emergency referral.
      5.  **Disclaimer:** End with a clear disclaimer that this is an AI-generated suggestion and should not replace professional clinical judgment.

      Format the entire response in clean Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API for symptom analysis:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during symptom analysis.");
  }
};

export const getPatientChartSummary = async (patientData: string): Promise<string> => {
    if (!API_KEY) {
      return "Error: Gemini API key not configured.";
    }
    try {
        const prompt = `
        Act as an expert clinician reviewing a patient's chart in a Ghanaian hospital.
        Based on the comprehensive data provided below, generate a concise and structured clinical summary.

        **Patient Chart Data:**
        ${patientData}

        **Instructions:**
        Provide a summary in clean Markdown format with the following sections:
        1.  **Patient Overview:** A brief one-sentence summary including age, gender, and major chronic conditions.
        2.  **Key Medical History:** A bulleted list of significant past diagnoses and treatments.
        3.  **Recent Events:** A paragraph summarizing the most recent visit, vital signs, and any critical lab results.
        4.  **Active Medications & Allergies:** A clear list of current prescriptions and all known allergies.
        5.  **Clinical Impression:** A brief, AI-generated assessment of the patient's current overall health status and potential areas for attention.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for chart summary:', error);
         if (error instanceof Error) {
            return `An error occurred while generating the summary: ${error.message}.`;
        }
        return "An unknown error occurred while generating the summary.";
    }
};

export const getDischargeSummary = async (patientData: string): Promise<string> => {
    if (!API_KEY) {
      return "Error: Gemini API key not configured.";
    }
    try {
        const prompt = `
        Act as an expert physician writing a hospital discharge summary for a patient in Ghana.
        Based on the comprehensive patient data provided below, generate a formal and structured discharge summary.

        **Patient Chart Data:**
        ${patientData}

        **Instructions:**
        Generate a summary in clean Markdown format with the following essential sections:
        1.  **Admitting Diagnosis:** The primary reason for admission.
        2.  **Hospital Course:** A concise summary of the patient's treatment, progress, and significant events during their hospital stay.
        3.  **Procedures Performed:** A bulleted list of any surgical or significant medical procedures.
        4.  **Condition at Discharge:** A brief description of the patient's health status upon leaving the hospital (e.g., "Stable," "Improved," "Afebrile").
        5.  **Discharge Medications:** A clear, bulleted list of all medications the patient should take after discharge, including dosage and frequency.
        6.  **Follow-up Instructions:** Specific instructions for the patient, including any necessary follow-up appointments, dietary restrictions, or activity limitations.
        7.  **Discharge Diet:** Recommend a diet plan based on the patient's condition.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for discharge summary:', error);
         if (error instanceof Error) {
            return `An error occurred while generating the summary: ${error.message}.`;
        }
        return "An unknown error occurred while generating the summary.";
    }
};

export const getInventoryReorderSuggestion = async (inventoryData: string, consumptionData: string): Promise<ReorderSuggestion[]> => {
    if (!API_KEY) {
      throw new Error("Gemini API key not configured.");
    }
    try {
        const prompt = `
        Act as an expert hospital supply chain manager in Ghana.
        Analyze the following inventory data and recent consumption patterns to create a prioritized reorder list.

        **Current Inventory Status:**
        ${inventoryData}

        **Recent Consumption Data (from dispensed prescriptions):**
        ${consumptionData}

        **Instructions:**
        1.  Identify all items that are out of stock (quantity 0) or below their reorder level.
        2.  Analyze consumption data to estimate usage velocity for these items.
        3.  Suggest a reorder quantity that balances immediate need with preventing overstocking. A reasonable suggestion is to replenish stock to double the reorder level, or more if recent consumption is high.
        4.  Provide a brief, clear reason for each suggestion (e.g., "Critically low stock," "High recent usage," "Below reorder threshold").
        5.  Return ONLY the items that need reordering. If all stock is sufficient, return an empty array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemId: { type: Type.STRING },
                            itemName: { type: Type.STRING },
                            currentQuantity: { type: Type.INTEGER },
                            reorderLevel: { type: Type.INTEGER },
                            suggestedQuantity: { type: Type.INTEGER },
                            supplier: { type: Type.STRING },
                            reasoning: { type: Type.STRING },
                        },
                        required: ["itemId", "itemName", "currentQuantity", "reorderLevel", "suggestedQuantity", "supplier", "reasoning"],
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ReorderSuggestion[];
    } catch (error) {
        console.error('Error calling Gemini API for inventory suggestion:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the reorder list: ${error.message}.`);
        }
        throw new Error("An unknown error occurred while generating the reorder list.");
    }
};

export const getBillExplanation = async (items: InvoiceItem[]): Promise<string> => {
    if (!API_KEY) {
      return "Error: Gemini API key not configured.";
    }
    try {
        const itemsString = items.map(item => `- ${item.description}: GH₵ ${item.total.toFixed(2)}`).join('\n');

        const prompt = `
        Act as a patient advocate at a hospital in Ghana.
        A patient has asked for an explanation of their bill.
        Explain the following charges in simple, non-technical language that anyone can understand.
        Avoid medical jargon. Keep the tone reassuring and clear.
        Format the response in clean Markdown.

        **Bill Items:**
        ${itemsString}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for bill explanation:', error);
        return "An error occurred while generating the explanation.";
    }
};

export const getMealSuggestionForPatient = async (diagnosis: string, dietPlan: DietPlan): Promise<string> => {
  const prompt = `
      Act as a hospital dietitian in Ghana.
      Create a simple, one-day meal plan (Breakfast, Lunch, Dinner) for a patient with the following details:
      - **Diagnosis:** ${diagnosis}
      - **Prescribed Diet:** ${dietPlan}

      **Instructions:**
      - Suggest locally available Ghanaian foods where possible.
      - Keep the meals simple and easy to prepare.
      - Provide a brief rationale for your choices based on the patient's condition and diet.
      - Format as clean Markdown.
  `;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
};

export const getGenomicTreatmentSuggestion = async (cancerType: string, markers: GeneticMarker[]): Promise<string> => {
    const prompt = `
        Act as an oncologist specializing in precision medicine.
        For a patient with **${cancerType} cancer**, analyze the following genetic markers and suggest potential targeted therapies or clinical trials.
        
        **Genetic Markers Found:**
        ${markers.map(m => `- **${m.gene} (${m.variant})**: ${m.classification} - ${m.implication}`).join('\n')}

        **Instructions:**
        1.  For each pathogenic or likely pathogenic marker, list relevant FDA-approved targeted therapies.
        2.  Suggest if any clinical trials could be relevant based on these markers.
        3.  Provide a brief, high-level explanation of why these treatments might be effective.
        4.  Include a strong disclaimer that this is an informational AI suggestion for a clinician and not a direct treatment recommendation for a patient.
        - Format as clean Markdown.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateClinicalNotesFromTranscript = async (transcript: string): Promise<SOAPNote> => {
    const prompt = `
        Act as an expert medical scribe.
        Convert the following doctor-patient conversation transcript into a structured SOAP note.
        Extract the key information for each section.

        **Transcript:**
        "${transcript}"

        **Instructions:**
        - Keep each section concise and to the point.
        - Use medical terminology where appropriate.
        - If a section has no relevant information, state "Not discussed."
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subjective: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    assessment: { type: Type.STRING },
                    plan: { type: Type.STRING },
                },
                required: ["subjective", "objective", "assessment", "plan"],
            },
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const getShareablePatientSummary = async (patient: Patient): Promise<string> => {
    const prompt = `
        Generate a patient-friendly, shareable summary of the following medical record.
        Use simple language, avoid jargon, and format it clearly. This will be shared via text message.
        
        **Patient:** ${patient.name}, ${patient.age}, ${patient.gender}
        **Key Diagnosis:** ${patient.medicalHistory[0]?.diagnosis}
        **Last Treatment:** ${patient.medicalHistory[0]?.treatment}
        **Allergies:** ${patient.allergies.join(', ') || 'None'}
        **Next Appointment:** ${patient.appointments.find(a => a.status === 'Scheduled')?.date || 'None scheduled'}

        **Instructions:**
        Create a very brief summary starting with "Summary for [Patient Name]:". Include the main health issue, last treatment, and any upcoming appointments.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getRadiologyAnalysis = async (base64Image: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const getSurgicalProcedureExplanation = async (procedureName: string): Promise<string> => {
    const prompt = `Explain the surgical procedure "${procedureName}" in simple, patient-friendly terms. Describe what it is for and what generally happens. Keep it under 100 words.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getNhisClaimValidation = async (patientName: string, items: NHISClaimItem[]): Promise<string> => {
    const prompt = `
        Act as an NHIS claims expert. Validate the following claim for patient ${patientName}.
        Items:
        ${items.map(i => `- ${i.description} (Code: ${i.code}, Amount: ${i.amount})`).join('\n')}
        
        Check for common errors like mismatched codes, invalid amounts, or non-covered services. Provide feedback. If it looks good, say "VALIDATION PASSED".
    `;
     const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getOncologyTreatmentExplanation = async (treatmentType: string): Promise<string> => {
    const prompt = `Explain what "${treatmentType}" is for a cancer patient in simple, reassuring terms. Keep it under 150 words.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getWellbeingInsights = async (moods: MoodEntry[], assessments: WellbeingAssessment[], sessions: MentalHealthSession[]): Promise<string> => {
    const prompt = `
        Analyze the mental wellbeing data for a patient.
        - **Recent Moods:** ${moods.slice(-5).map(m => `Date: ${m.date}, Rating: ${m.rating}/10`).join('; ')}
        - **Assessments:** ${assessments.map(a => `${a.type} score ${a.score} (${a.interpretation}) on ${a.date}`).join('; ')}
        - **Therapy Sessions:** ${sessions.slice(-2).map(s => `${s.type} on ${s.date}`).join('; ')}

        Provide a brief, bulleted list of clinical insights for the therapist.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getWellbeingAssessmentInterpretation = async (type: 'GAD-7' | 'PHQ-9', score: number): Promise<string> => {
    const prompt = `What is the clinical interpretation of a score of ${score} on a ${type} assessment?`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeMoodForCrisis = async (mood: MoodEntry): Promise<CrisisAnalysisResult> => {
    const prompt = `
        Analyze this patient mood entry for signs of a mental health crisis (e.g., self-harm, severe depression).
        - **Mood Rating:** ${mood.rating}/10
        - **Notes:** "${mood.notes}"
        
        Is this a crisis? If yes, why?
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isCrisis: { type: Type.BOOLEAN },
                    reason: { type: Type.STRING },
                },
                required: ["isCrisis", "reason"],
            },
        },
    });
    return JSON.parse(response.text);
};

export const getDrugInteractionAnalysis = async (drugs: string[]): Promise<DrugInteractionResult[]> => {
    const prompt = `
        Analyze the potential interactions for the following list of drugs: ${drugs.join(', ')}.
        Identify pairs with known interactions and classify the severity as 'Minor', 'Moderate', or 'Severe'.
        Provide a brief explanation for each interaction found.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        drugsInvolved: { type: Type.ARRAY, items: { type: Type.STRING } },
                        severity: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                    },
                    required: ["drugsInvolved", "severity", "explanation"],
                },
            },
        },
    });
    return JSON.parse(response.text);
};

export const identifyPillFromImage = async (base64Image: string): Promise<PillIdentificationResult> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = {
            text: `
                Analyze the image of this pill. Identify it and provide details in JSON format.
                - pillName: The likely name of the medication. If unsure, state "Unknown".
                - dosage: The dosage if visible (e.g., "500mg"). If not visible, state "Not visible".
                - commonUses: A brief description of what the pill is typically used for.
                - sideEffects: A list of 2-3 common side effects.
                - confidence: Your confidence level in the identification ('High', 'Medium', 'Low', 'Uncertain').
                - disclaimer: Include this exact disclaimer: "This is an AI-generated identification and is not a substitute for professional medical advice. Verify with a pharmacist."
            `
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pillName: { type: Type.STRING },
                        dosage: { type: Type.STRING },
                        commonUses: { type: Type.STRING },
                        sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        confidence: { type: Type.STRING },
                        disclaimer: { type: Type.STRING },
                    },
                    required: ["pillName", "dosage", "commonUses", "sideEffects", "confidence", "disclaimer"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PillIdentificationResult;

    } catch (error) {
        console.error('Error calling Gemini API for pill identification:', error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during pill identification.");
    }
};

export const getRoboticSurgeryGuidance = async (base64Image: string, prompt: string): Promise<string> => {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: `Surgical context: ${prompt}. Analyze the provided surgical image. Identify key anatomical structures visible. Point out any anomalies or areas requiring caution. Provide concise guidance.` };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const getNhisRejectionAnalysis = async (rejectionReason: string, items: NHISClaimItem[]): Promise<string> => {
    if (!API_KEY) {
      return "Error: Gemini API key not configured.";
    }
    try {
        const itemsString = items.map(item => `- ${item.description} (Code: ${item.code}, Amount: ${item.amount.toFixed(2)})`).join('\n');

        const prompt = `
        Act as an expert NHIS claims adjudicator in Ghana. A claim has been rejected or queried.
        Analyze the official rejection reason and the submitted items to provide clear, actionable advice for resubmission.

        **Official Rejection/Query Reason:**
        "${rejectionReason}"

        **Submitted Claim Items:**
        ${itemsString}

        **Instructions:**
        1.  **Explain the Problem:** In simple terms, what does the rejection reason mean?
        2.  **Identify Problematic Items:** Pinpoint which specific items from the list are likely causing the issue, based on the reason.
        3.  **Provide Specific Corrections:** For each problematic item, suggest a concrete fix. This could be a corrected description, a different procedure code, or an adjusted amount. Be specific.
        4.  **General Advice:** Offer a brief piece of advice to avoid this issue in the future.
        
        Format the entire response in clean Markdown. If the reason is unclear or no specific items seem to be at fault, state that and recommend a manual review.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for NHIS rejection analysis:', error);
        return "An error occurred while analyzing the claim rejection.";
    }
};

export const startVideoGeneration = async (prompt: string, image?: { base64: string, mimeType: string }): Promise<any> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }
    try {
        const generationRequest: any = {
            model: 'veo-2.0-generate-001',
            prompt,
            config: {
                numberOfVideos: 1,
            },
        };

        if (image) {
            generationRequest.image = {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            };
        }

        const operation = await ai.models.generateVideos(generationRequest);
        return operation;
    } catch (error) {
        console.error('Error starting video generation:', error);
        if (error instanceof Error) {
            throw new Error(`Error starting video generation: ${error.message}`);
        }
        throw new Error("An unknown error occurred while starting video generation.");
    }
};

export const checkVideoGenerationStatus = async (operation: any): Promise<any> => {
     if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        console.error('Error checking video generation status:', error);
        if (error instanceof Error) {
            throw new Error(`Error checking video status: ${error.message}`);
        }
        throw new Error("An unknown error occurred while checking video status.");
    }
};

export const getReportSummary = async (reportData: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured.");
  }
  try {
    const prompt = `
      Act as an expert hospital data analyst reviewing a performance report for a hospital in Ghana.
      Analyze the following report data and provide a concise, insightful summary.

      **Report Data:**
      ${reportData}

      **Instructions:**
      1.  **Executive Summary:** Start with a brief, high-level overview of the hospital's performance for the selected period.
      2.  **Key Observations:** Use a bulleted list to highlight the most important trends, achievements, or areas of concern. For example, mention significant increases in revenue, trends in appointments, or which departments are busiest.
      3.  **Financial Health:** Briefly comment on the financial performance, noting the ratio of paid to outstanding revenue.
      4.  **Actionable Insight:** Conclude with one strategic recommendation or a question for management to consider based on the data.
      5.  **Tone:** Maintain a professional and data-driven tone.

      Format the entire response in clean Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API for report summary:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during report summary generation.");
  }
};

export const getAppointmentBriefing = async (patientData: string, appointmentReason: string): Promise<string> => {
  if (!API_KEY) {
      throw new Error("Gemini API key not configured. Please set the API_KEY environment variable.");
  }
  try {
    const prompt = `
      Act as an expert clinical assistant preparing a doctor for an upcoming appointment.
      
      **Patient's Relevant History:**
      ${patientData}

      **Reason for this Appointment:**
      "${appointmentReason}"

      **Instructions:**
      1.  **Briefing Summary:** Provide a 2-3 sentence overview of the patient and the purpose of this visit.
      2.  **Key Historical Points:** Bullet list 3-4 of the most relevant past diagnoses, treatments, or critical lab results from the patient's history.
      3.  **Suggested Talking Points:** Based on the history and appointment reason, suggest 2-3 key questions or topics the doctor should address during the consultation.
      4.  **Formatting:** Use clean Markdown. Keep the entire briefing concise and scannable.

      Example output:
      **Briefing for Kofi Annan (45M):**
      This is a follow-up for hypertension management. Patient has a history of high cholesterol and a previous appendectomy.

      **Key Historical Points:**
      - Diagnosed with Hypertension (2024-04-22), managed with Lisinopril.
      - Lab results showed high Cholesterol (220 mg/dL) on 2024-04-22.
      - Appendectomy performed on 2024-01-15.

      **Suggested Talking Points:**
      - Inquire about medication adherence and any side effects from Lisinopril.
      - Discuss lifestyle modifications for blood pressure and cholesterol control.
      - Check if there have been any new symptoms since the last visit.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API for appointment briefing:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during briefing generation.");
  }
};

export const getDischargePrediction = async (patientData: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured.");
  }
  try {
    const prompt = `
      Act as an experienced hospital discharge planner in Ghana.
      Based on the following patient snapshot, predict a likely discharge date.

      **Patient Information:**
      ${patientData}

      **Instructions:**
      1.  **Predicted Discharge Date:** Provide a specific date in YYYY-MM-DD format.
      2.  **Confidence Level:** State a confidence level (e.g., High, Medium, Low).
      3.  **Rationale:** Briefly explain your reasoning in a few bullet points, considering the diagnosis, age, and typical recovery patterns for the given condition in this context.
      4.  **Factors to Monitor:** List 1-2 key factors that could change this prediction (e.g., "Stable vital signs," "Response to medication").
      
      Format the entire response in clean Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API for discharge prediction:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during discharge prediction.");
  }
};

export const getTriageSuggestion = async (age: number, gender: string, chiefComplaint: string): Promise<TriageSuggestion> => {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured.");
  }
  try {
    const prompt = `
      Act as an expert ER triage nurse in Ghana.
      Based on the patient's brief details, suggest a triage level and provide a rationale.
      The triage levels are: 'Resuscitation (I)', 'Emergent (II)', 'Urgent (III)', 'Non-urgent (IV)'.

      **Patient Information:**
      - Age: ${age}
      - Gender: ${gender}
      - Chief Complaint: "${chiefComplaint}"

      **Instructions:**
      1.  **Analyze Urgency:** Based on keywords (e.g., "chest pain", "difficulty breathing", "head injury", "fover", "cut finger"), age, and potential severity, determine the most appropriate triage level. Prioritize potential life-threatening conditions.
      2.  **Provide Rationale:** Give a brief, clear reason for your choice, referencing the patient's complaint.
      3.  **Return JSON:** Respond ONLY with a JSON object.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedLevel: { 
                        type: Type.STRING,
                    },
                    rationale: { type: Type.STRING },
                },
                required: ["suggestedLevel", "rationale"],
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TriageSuggestion;
  } catch (error) {
    console.error('Error calling Gemini API for triage suggestion:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during triage suggestion.");
  }
};

export const getLabResultInterpretation = async (testName: string, results: string, isCritical: boolean, icd10Code?: string): Promise<string> => {
    if (!API_KEY) {
      throw new Error("Gemini API key not configured.");
    }
    try {
      const prompt = `
        Act as a clinical pathologist providing an interpretation of lab results for a general practitioner in Ghana.
        ${isCritical ? `\n**URGENCY: CRITICAL**\nThis test has been marked as critical. Please prioritize the analysis of any values that may indicate an immediate life-threatening condition. Your interpretation should reflect this urgency.\n` : ''}
        **Test Name:** ${testName}
        ${icd10Code ? `**Associated ICD-10 Code:** ${icd10Code}\n` : ''}
        **Results:** 
        ${results}

        **Instructions:**
        Provide a structured interpretation in clean Markdown format:
        1.  **Overall Interpretation:** A one-sentence summary of the findings (e.g., "Results indicate signs of anemia and inflammation.").
        2.  **Abnormal Values:** Create a bulleted list of any values that are outside of typical reference ranges. For each, briefly state if it's high or low.
        3.  **Clinical Significance:** Explain what the abnormal values might indicate in the context of common health issues in the region, considering the provided ICD-10 code for clinical context if available.
        4.  **Recommendations:** Suggest potential next steps, such as further tests or clinical correlations.
        5.  **Disclaimer:** Add a standard disclaimer that this is an AI-generated interpretation and requires correlation with clinical findings.
      `;
  
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
  
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API for lab interpretation:', error);
      if (error instanceof Error) {
          throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw new Error("An unknown error occurred during lab interpretation.");
    }
};

export const getPrescriptionReview = async (
    patient: Patient,
    prescriptionItems: { name: string; dosage: string; quantity: number }[],
    existingPrescriptions: { name: string; dosage: string }[]
): Promise<PrescriptionReviewSuggestion> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }
    try {
        const prompt = `
            Act as an expert clinical pharmacist reviewing a new prescription for a patient in Ghana.

            **Patient Profile:**
            - Age: ${patient.age}
            - Gender: ${patient.gender}
            - Known Allergies: ${patient.allergies.join(', ') || 'None'}
            - Significant Medical History: ${patient.medicalHistory.slice(0, 3).map(h => h.diagnosis).join(', ')}

            **New Prescription Items to Review:**
            ${prescriptionItems.map(item => `- ${item.name}, Dosage: ${item.dosage}, Quantity: ${item.quantity}`).join('\n')}

            **Patient's Other Active Medications (for redundancy check):**
            ${existingPrescriptions.length > 0 ? existingPrescriptions.map(item => `- ${item.name}, Dosage: ${item.dosage}`).join('\n') : 'None'}

            **Instructions:**
            Analyze the new prescription in the context of the patient's profile and existing medications. Provide a structured JSON response with the following checks:
            1.  **dosageWarnings:** Flag any dosages that seem unusually high or low for the medication, especially considering the patient's age. If none, return an empty array.
            2.  **redundancyAlerts:** Check if any new medication is therapeutically redundant with an existing medication (e.g., two ACE inhibitors). If none, return an empty array.
            3.  **alternativeSuggestions:** Suggest cheaper, generic alternatives if a brand-name drug is prescribed. Provide the original, the suggestion, and a brief reason. If none, return an empty array.
            4.  **clarityFlags:** Identify any ambiguous instructions (e.g., "take as needed" without frequency limits) that a pharmacist might need to clarify with the prescriber. If none, return an empty array.
            5.  **overallAssessment:** Provide a single, brief summary statement of your findings (e.g., "Prescription appears safe, consider generic substitution for cost savings.").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dosageWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                        redundancyAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        alternativeSuggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    original: { type: Type.STRING },
                                    suggested: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ["original", "suggested", "reason"],
                            },
                        },
                        clarityFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        overallAssessment: { type: Type.STRING },
                    },
                    required: ["dosageWarnings", "redundancyAlerts", "alternativeSuggestions", "clarityFlags", "overallAssessment"],
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PrescriptionReviewSuggestion;

    } catch (error) {
        console.error('Error calling Gemini API for prescription review:', error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during prescription review.");
    }
};