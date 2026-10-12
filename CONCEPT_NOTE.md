# PROJECT CONCEPT NOTE: MindPulse AI
**Project Title:** MindPulse AI: Youth Mental Health Screening & First-line Supportive Companion  
**Thematic Area:** UN Sustainable Development Goal 3: Good Health and Well-being (Target 3.4)  
**Program:** IBM SkillsBuild Masterclass 5: Creating Real Life Projects  
**Author / Team:** Student Developer  
**Status:** MVP Fully Functional & Live in `d:/Project`  

---

## 1. Executive Summary
MindPulse AI is an accessible, privacy-preserving, AI-powered mental wellness web application engineered to lower the barriers to early psychological support. It provides young individuals with an empathetic conversational agent ("Aura"), standardized clinical psychometric screeners (PHQ-9 for Depression and GAD-7 for Anxiety), somatic de-escalation tools (4-7-8 and Box breathing), and immediate 24/7 crisis safety routing. By eliminating financial hurdles, mandatory registrations, and social stigma, MindPulse AI bridges the critical gap between silent personal struggle and professional healthcare.

---

## 2. Background & Problem Statement
* **Background:** According to the World Health Organization (WHO), depression, anxiety, and behavioral disorders are among the leading causes of illness and disability among youth. In developing economies, especially in Tier-2 and Tier-3 urban and rural clusters, this crisis is severely compounded by deep-seated cultural stigma, an acute deficit of clinical practitioners (less than 1 professional per 100,000 citizens in semi-urban sectors), and private therapy costs (₹1,500 – ₹4,000/hour) that are inaccessible to youth.
* **Problem Statement:**
  > *"Lack of mental health support among youth results in stress and anxiety. This project aims to create an AI-powered chatbot for mental wellness check-ins and guidance."* (IBM SkillsBuild Masterclass 5, Slide 5).

---

## 3. Project Objectives
1. **Early Identification:** Provide standardized psychometric screening instruments (PHQ-9 and GAD-7) to help young users recognize early depressive and anxiety patterns before symptom escalation.
2. **24/7 Empathetic Support:** Deliver continuous, judgment-free conversational assistance using active listening and Cognitive Behavioral Therapy (CBT) reframing frameworks.
3. **Neuro-Somatic De-escalation:** Equip users with real-time paced breathing visualizers (4-7-8 and Box breathing) and 5-4-3-2-1 sensory grounding to counter acute anxiety and panic symptoms.
4. **Crisis Triage & Safe Escalation:** Automatically detect acute self-harm language and immediately present national 24/7 toll-free crisis hotlines (Tele-MANAS, KIRAN, Vandrevala Foundation).
5. **Absolute Privacy:** Maintain 100% on-device client-side data isolation with zero remote tracking of sensitive personal thoughts.

---

## 4. System Architecture & Technical Specifications
* **Frontend Architecture:** Lightweight semantic HTML5, CSS3 Glassmorphism System, and Vanilla ES6+ JavaScript.
* **Audio Synthesis:** Real-time Web Audio API frequency oscillator (zero external MP3 assets needed; works offline).
* **Local Data Vault:** Browser `localStorage` sandbox for mood tracking, streaks, and assessment logs.
* **Conversational AI Engine ("Aura"):** Hybrid intent and sentiment detection pipeline trained on empathetic active listening, CBT reframing, and crisis phrase detection.
* **Clinical Scoring Engine:** Validated mathematical summation and clinical classification protocols for PHQ-9 (scores 0–27) and GAD-7 (scores 0–21).

```
+----------------------------------------------------------------------------+
|                          MindPulse AI Application                          |
+----------------------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+-------------------+      +---------------------+      +---------------------+
| Conversational AI |      | Clinical Screener   |      | Neuro-Somatic Zone  |
|  Engine ("Aura")  |      |   (PHQ-9 & GAD-7)   |      |  & Mood Micro-Log   |
+-------------------+      +---------------------+      +---------------------+
         |                            |                            |
         | (Intent / Crisis)          | (Validated Sum)            | (Web Audio API)
         v                            v                            v
+-------------------+      +---------------------+      +---------------------+
| 24/7 SOS Escalation|      | Diagnostic Triage & |      | Parasympathetic     |
| (Tele-MANAS/KIRAN)|      | Evidence Guidance   |      | Breathing Guide     |
+-------------------+      +---------------------+      +---------------------+
         |                            |                            |
         +----------------------------+----------------------------+
                                      v
                 +------------------------------------------+
                 | Local Storage Privacy Vault (On-Device)  |
                 +------------------------------------------+
```

---

## 5. Key Modules & Features
| Module | Description | Clinical / User Benefit |
| :--- | :--- | :--- |
| **Aura AI Wellness Chat** | Active listening agent with cognitive reframing, study-stress guidance, and emotional validation. | De-escalates feelings of loneliness and panic; provides a safe sounding board. |
| **Standardized Screener** | Full 9-item PHQ-9 and 7-item GAD-7 questionnaires with instant clinical stratification (Minimal to Severe). | Benchmark self-awareness without clinical intimidation; printable report generation. |
| **Calm Zone & Breathing Visualizer** | Interactive 4-7-8 and Box breathing visual pacing circle with synthesized audio tones. | Stimulates parasympathetic vagal response, reducing racing heart rate in under 2 minutes. |
| **5-4-3-2-1 Sensory Grounding** | Stepped cognitive grounding exercises (sight, touch, hearing, smell, affirmation). | Proven cognitive interrupt technique during dissociation or acute panic attacks. |
| **Mood Tracker & Micro-Journal** | Visual 7-day trend chart, energy slider (1-10), streak counter, and private reflection box. | Longitudinal self-reflection, identifying emotional triggers over time. |
| **Crisis SOS Directory** | 1-click access to verified 24/7 national toll-free helplines (Tele-MANAS: 14416, KIRAN: 1800-599-0019). | Life-saving triage adhering to psychological duty-of-care guidelines. |

---

## 6. Ethical Framework & Privacy Guarantees
* **Clear Role Definition:** MindPulse AI acts as a *supportive companion and educational screening tool*, not a medical device or certified doctor.
* **Emergency Override:** Any expression of self-harm triggers immediate safety alerts with crisis contact details.
* **Zero Tracking:** Zero ad tracking, cookies, or cloud transmission of sensitive diary text.

---

## 7. Expected Impact & Evaluation Plan
* **Impact Metric 1:** Number of youth completing early depression/anxiety screenings before symptom escalation.
* **Impact Metric 2:** User-reported anxiety reduction before vs. after somatic breathing sessions.
* **Impact Metric 3:** Timely connection of distressed individuals to certified public helplines.

---

## 8. Future Roadmap
* Multi-lingual Indian regional language support (Hindi, Marathi, Bengali, Tamil, Telugu).
* Offline Progressive Web App (PWA) installation with push notification wellness reminders.
* Institutional campus dashboard providing anonymous, aggregate stress analytics for college counselors.
