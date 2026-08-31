# SIH 2026: Simple Team & Mentor Explanation Guide
**Target Audience:** For sharing with Team Members, Team Lead, and College Faculty Mentor  
**Objective:** Easily understand the Top 5 SIH 2026 Problem Statements, pick the best one for your team, and explain why it can win!

---

## 🏆 1. SIH26101 (MoSPI — Ministry of Statistics)
### **Title:** AI-Powered Smart Learning: Competency-Gap Detection & Auto-Quiz Engine for iGOT Karmayogi

#### 💡 The Super Simple Analogy:
> **"It's like Duolingo + ChatGPT for Government Officials!"**

#### 📌 What is the problem?
Government officers in India (over 25 million of them) have to upskill using a portal called **iGOT Karmayogi**. But every time a new policy or 200-page statistical manual is released, nobody wants to read it line-by-line. Currently, creating quizzes manually takes weeks, and officers get assigned random courses that don't match what they actually need to learn.

#### 🚀 How our app solves it (What we build):
1. **Drop a PDF:** Drop any government training PDF (e.g. 200-page Survey Manual).
2. **Auto Extract Skills:** AI reads the document and automatically lists the skills (called Civil Service FRAC competencies) taught in that PDF.
3. **Generate 5-Minute Quiz:** AI instantly creates a 5-question quiz (MCQs + Case Scenarios) with **exact page number proofs** (`[Page 42, Para 3]`).
4. **Spider Chart of Skill Gaps:** When the officer takes the quiz, an interactive **Radar Chart (Spider Chart)** shows their skill level (e.g., *"Good in Data Collection, but -35% gap in Sampling Math"*).
5. **One-Click iGOT Sync:** One click automatically assigns the right course on the officer's iGOT Karmayogi profile to fill that exact skill gap.

#### 🎯 Why explain this to your Mentor/Team?
* **Why Team Will Love It:** **0% GPU required!** Runs 100% on free cloud APIs (Groq / Gemini / OpenAI) on any basic laptop. No local model crashes!
* **Why Mentor Will Love It:** Super easy to demo live in 3 minutes during judging. Direct fit for India's national Mission Karmayogi program.

---

## 🚢 2. SIH26006 (Ministry of Steel)
### **Title:** Intelligent Freight Forecasting & Vessel Chartering Model for Overseas Bulk Cargo to East Coast of India

#### 💡 The Super Simple Analogy:
> **"It's like Uber / MakeMyTrip for Giant Cargo Ships carrying Coal & Iron Ore!"**

#### 📌 What is the problem?
Indian Steel giants (like SAIL, RINL, NTPC) import millions of tonnes of coal and iron ore from Australia and Indonesia to East Coast Indian ports (Paradip, Vizag, Haldia). 
Ship rental rates (vessel chartering) change every single day like stock prices or flight tickets. If a logistics manager books a ship on the wrong day, or rents a massive ship that is too deep for a shallow port like Haldia, the company loses **crores of rupees** in waiting fees (demurrage).

#### 🚀 How our app solves it (What we build):
1. **Predict Ship Rates:** AI forecasts ship rental prices for the next 30 to 90 days.
2. **Best Booking Window:** Tells managers: *"Don't book today! Rates will drop by 15% next week—wait 8 days to book."*
3. **Smart Ship Selection:** Matches cargo size and port water depth (e.g., recommending a *Panamax* ship for Paradip port vs. a *Handysize* ship for shallow Haldia port).

#### 🎯 Why explain this to your Mentor/Team?
* **Why Team Will Love It:** **Very Low Competition!** Most student teams avoid maritime logistics because they think it's too hard. But we can fetch all the data for free in 2 lines of Python using `yfinance` (`BDRY` ETF)!
* **Why Mentor Will Love It:** Shows massive real-world monetary savings ($200,000+ per ship delivery) for steel PSUs.

---

## 📜 3. SIH26045 (Ministry of Ayush)
### **Title:** IP-SAKTI Sahayak — Multilingual RAG Assistant for Ayurveda IP & Regulatory Guidance

#### 💡 The Super Simple Analogy:
> **"It's like a Legal Siri / ChatGPT for Ayurvedic Doctors, Researchers & Herbal Companies!"**

#### 📌 What is the problem?
In India, you **cannot patent traditional knowledge** (like basic Haldi/Turmeric or Neem remedies) under Section 3(p) of the Patent Act to prevent biopiracy. Also, selling Ayurvedic products requires filling out complex government legal forms (Form 24D, Rule 158B). Rural doctors (Vaidyas) and small herbal businesses don't understand complex English legal jargon.

#### 🚀 How our app solves it (What we build):
1. **Ask via Voice or Text:** Ask questions in Hindi, Tamil, Marathi, Sanskrit, or English using voice input.
2. **Patentability Check:** AI evaluates if a new herbal formula can be patented or if it violates traditional knowledge rules.
3. **Auto-Fill Govt Forms:** Automatically pre-fills government licensing forms (Form 24D checklist) with **exact law section citations**.
4. **Zero Hallucination Proof:** Every answer provides clickable links to official government gazette directives.

#### 🎯 Why explain this to your Mentor/Team?
* **Why Team Will Love It:** Easy legal-tech web application using standard RAG + Bhashini voice integration.
* **Why Mentor Will Love It:** Multilingual voice search in 11+ Indian languages makes judges from the Ministry of Ayush go "WOW!"

---

## 🔍 4. SIH26102 (MoSPI — Ministry of Statistics)
### **Title:** AI-Based Automated Inspection & Anomaly Detection in MPLAD Scheme Infrastructure Projects

#### 💡 The Super Simple Analogy:
> **"It's an AI Detective that catches fake or corrupt public work claims!"**

#### 📌 What is the problem?
Members of Parliament (MPs) get crores of rupees under the MPLAD scheme to build public projects (solar street lights, school buildings, rural roads). Sometimes corrupt contractors submit fake photos, duplicate photos, or claim money for projects that were never actually built. Government inspectors can't travel to thousands of remote villages to inspect every single street light.

#### 🚀 How our app solves it (What we build):
1. **Upload Site Photos:** Inspectors/citizens upload geotagged photos of the built project.
2. **AI Computer Vision (YOLOv8):** AI scans the photos to detect:
   - **Duplicate/Stolen Photos:** Checks if the contractor uploaded a photo copied from Google or another village.
   - **Location Fraud:** Verifies if GPS coordinates match the actual sanctioned site.
   - **Structural Quality Check:** Detects if the street light or road construction meets basic visual quality standards.

#### 🎯 Why explain this to your Mentor/Team?
* **Why Team Will Love It:** Computer vision demos (showing AI boxes detecting solar panels and flagging duplicate images) look visually amazing on screen!
* **Why Mentor Will Love It:** Anti-corruption and fraud detection tools carry huge social relevance and government praise.

---

## 🏥 5. SIH26046 (Ministry of Ayush / AIIA)
### **Title:** AIIA Real-Time GCP-Compliant Clinical Trial Management System (CTMS)

#### 💡 The Super Simple Analogy:
> **"It's like Google Forms + Medical Excel + Digital Vault for Ayurvedic Hospital Trials!"**

#### 📌 What is the problem?
When top institutions like the **All India Institute of Ayurveda (AIIA)** test new Ayurvedic medicines on patients in clinical trials, they currently record data on paper forms or messy Excel files. This breaks international medical trial standards (Good Clinical Practice - GCP) and makes trial data vulnerable to errors or tampering.

#### 🚀 How our app solves it (What we build):
1. **Doctor Dashboard:** Secure web portal for doctors to record patient consent, daily dosages, and medicine side effects in real-time.
2. **Randomization Engine:** Automatically assigns patients to test groups fairly (Drug vs. Placebo).
3. **Audit Trail Vault:** Tracks every single data entry with timestamped digital signatures to meet 100% GCP medical compliance.

#### 🎯 Why explain this to your Mentor/Team?
* **Why Team Will Love It:** Very straightforward Full-Stack Web App (React + Node.js/FastAPI + PostgreSQL/MongoDB). No complex ML models needed!
* **Why Mentor Will Love It:** High production utility. Can be directly deployed at AIIA hospital immediately after the hackathon.

---

## 🏆 Final Recommendation to Share with Your Team:

If your team wants:
1. **Fastest Build & Zero Laptop Overheating:** Pick **SIH26101 (MoSPI — iGOT Smart Learning)**.
2. **Niche Domain & Low Competition:** Pick **SIH26006 (Ministry of Steel — Freight Forecasting)**.
3. **Pure Full-Stack Web Development (No Heavy ML):** Pick **SIH26046 (Ayush CTMS Clinical Trials)**.

---
*Created for Team Discussion & Mentor Alignment — SIH 2026*
