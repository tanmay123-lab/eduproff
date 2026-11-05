import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  action?: {
    label: string;
    to: string;
  };
  timestamp: string;
}

export type SupportedLanguage = "en" | "hi";

interface KnowledgeResponse {
  match: RegExp;
  en: string;
  hi: string;
  action?: { labelEn: string; labelHi: string; to: string };
}

const FAQ_KNOWLEDGE_BASE: KnowledgeResponse[] = [
  {
    match: /(what is eduproof|about eduproof|what do you do|who are you|safar|क्या है eduproof|सफर कौन है)/i,
    en: "I am Safar, your EduProof AI Assistant! EduProof is an enterprise-grade credential verification trust platform. We eliminate degree and certificate fraud by cross-verifying academic and professional credentials against official institutional records with transparent Trust Scores.",
    hi: "नमस्ते! मैं 'सफर' हूँ, EduProof का AI सहायक! EduProof एक क्रेडेंशियल सत्यापन ट्रस्ट सिस्टम है जो प्रमाणपत्र धोखाधड़ी को रोकता है और संस्थान के डेटाबेस से तुरंत सत्यापन कर ट्रस्ट स्कोर प्रदान करता है।",
    action: { labelEn: "Learn More", labelHi: "और जानें", to: "/how-it-works" }
  },
  {
    match: /(how to verify|check certificate|verify certificate|verify my certificate|सत्यापन कैसे करें|सर्टिफिकेट चेक)/i,
    en: "To verify a certificate:\n1. Go to the Verification portal\n2. Enter the official Certificate ID\n3. Our system scans the institutional registry and calculates a 0-100% Trust Score instantly.",
    hi: "प्रमाणपत्र सत्यापित करने के लिए:\n1. सत्यापन पोर्टल पर जाएं\n2. आधिकारिक सर्टिफिकेट आईडी दर्ज करें\n3. हमारा सिस्टम संस्थान के डेटाबेस से मिलान कर तुरंत 0-100% ट्रस्ट स्कोर दिखाता है।",
    action: { labelEn: "Verify Certificate", labelHi: "सर्टिफिकेट सत्यापित करें", to: "/check" }
  },
  {
    match: /(trust score|how does trust score work|what is trust score|ट्रस्ट स्कोर)/i,
    en: "EduProof Trust Score is calculated in real-time:\n• 100%: Exact database match with verified institutional issuer.\n• Pending/Review: Under manual or secondary institutional review.\n• 0% (Failed): Not found or altered credential.\n\nPassed certificates receive a verifiable cryptographic seal.",
    hi: "EduProof ट्रस्ट स्कोर:\n• 100%: संस्थान के आधिकारिक डेटाबेस से पूर्ण मिलान।\n• पेंडिंग: संस्थान द्वारा समीक्षाधीन।\n• 0%: प्रमाणपत्र नहीं मिला या अमान्य है।\nसफल सत्यापन पर डिजिटल ट्रस्ट सील मिलती है।",
    action: { labelEn: "View Demo Result", labelHi: "डेमो देखें", to: "/demo" }
  },
  {
    match: /(candidate|student|upload certificate|how to upload|student dashboard|विद्यार्थी|छात्र|अपलोड)/i,
    en: "Students & Candidates can:\n1. Upload certificate PDF files\n2. Track verification status on their dashboard\n3. Generate a verified CV with verifiable trust badges to stand out to employers.",
    hi: "विद्यार्थी और उम्मीदवार:\n1. सर्टिफिकेट PDF अपलोड कर सकते हैं\n2. अपने डैशबोर्ड में लाइव स्टेटस देख सकते हैं\n3. नियोक्ताओं के लिए वेरिफाइड CV बना सकते हैं।",
    action: { labelEn: "Student Dashboard", labelHi: "स्टूडेंट डैशबोर्ड", to: "/student" }
  },
  {
    match: /(generate cv|resume|verified resume|cv|सीवी|बायोडाटा)/i,
    en: "With EduProof CV Generator, you can transform your verified credentials into a high-trust, employer-ready resume with QR codes and verifiable badges.",
    hi: "EduProof CV जनरेटर के साथ, आप अपने सत्यापित प्रमाणपत्रों को नियोक्ता-तैयार वेरिफाइड रिज्यूमे में बदल सकते हैं, जिसमें QR कोड और ट्रस्ट बैज शामिल हैं।",
    action: { labelEn: "Generate Verified CV", labelHi: "वेरिफाइड CV बनाएं", to: "/generate-cv" }
  },
  {
    match: /(recruiter|employer|hiring|talent|रिक्रूटर|कंपनी|भर्ती)/i,
    en: "For Recruiters & Hiring Managers:\n• Fast verification of job applicants\n• Zero manual phone calls or emails to universities\n• Full tamper detection and historical audit logs.",
    hi: "रिक्रूटर्स और नियोक्ताओं के लिए:\n• नौकरी आवेदकों का त्वरित सत्यापन\n• बिना किसी देरी के डिजिटल जांच\n• जालसाजी रोकथाम और ऑडिट लॉग।",
    action: { labelEn: "Recruiter Portal", labelHi: "रिक्रूटर पोर्टल", to: "/recruiter" }
  },
  {
    match: /(institution|university|college|issue certificate|संस्थान|कॉलेज|विश्वविद्यालय)/i,
    en: "Educational Institutions can issue tamper-proof certificates with cryptographically verifiable IDs, manage registries, and track verification analytics.",
    hi: "शैक्षणिक संस्थान सुरक्षित डिजिटल प्रमाणपत्र जारी कर सकते हैं, अपने रिकॉर्ड प्रबंधित कर सकते हैं और सत्यापन आंकड़े देख सकते हैं।",
    action: { labelEn: "Issue Certificate", labelHi: "सर्टिफिकेट जारी करें", to: "/institution/issue" }
  },
  {
    match: /(login|sign in|signup|register|account|लॉगिन|खाता|साइन अप)/i,
    en: "You can sign up or log in as a Candidate, Recruiter, or Educational Institution to get started with EduProof.",
    hi: "आप उम्मीदवार, रिक्रूटर या शैक्षणिक संस्थान के रूप में EduProof में खाता बना सकते हैं या लॉगिन कर सकते हैं।",
    action: { labelEn: "Log In / Sign Up", labelHi: "लॉग इन / साइन अप", to: "/auth" }
  }
];

export async function processSafarMessage(
  userText: string,
  lang: SupportedLanguage = "en"
): Promise<{ text: string; action?: { label: string; to: string } }> {
  const clean = userText.trim();
  if (!clean) {
    return {
      text: lang === "hi" ? "कृपया अपना प्रश्न लिखें।" : "Please enter a question or certificate ID."
    };
  }

  // Check if input looks like a Certificate ID lookup (e.g. CERT-xxx or UUID or alphanumeric code)
  const isCertIdQuery = /^(cert-[a-z0-9-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|aws-[a-z0-9]+)$/i.test(clean) ||
    /^(verify|check)\s+([a-z0-9-]+)$/i.test(clean);

  if (isCertIdQuery) {
    const certCode = clean.replace(/^(verify|check)\s+/i, "").trim();
    try {
      const { data, error } = await supabase
        .from("issued_certificates")
        .select("student_name, course_name, issue_date, certificate_id")
        .eq("certificate_id", certCode)
        .maybeSingle();

      if (data) {
        return {
          text: lang === "hi"
            ? `✅ प्रमाणपत्र मिल गया!\n\n• छात्र: ${data.student_name}\n• कोर्स: ${data.course_name}\n• जारी करने की तारीख: ${data.issue_date}\n• ट्रस्ट स्कोर: 100% (सत्यापित)`
            : `✅ Certificate Found & Verified!\n\n• Student: ${data.student_name}\n• Course: ${data.course_name}\n• Issue Date: ${data.issue_date}\n• Trust Score: 100% (Authentic Institutional Record)`,
          action: {
            label: lang === "hi" ? "सत्यापन विवरण देखें" : "View Full Certificate",
            to: `/check?id=${encodeURIComponent(certCode)}`
          }
        };
      }
    } catch {
      // Fall through to public verify prompt
    }

    return {
      text: lang === "hi"
        ? `सर्टिफिकेट आईडी "${certCode}" की विस्तृत जांच के लिए हमारे आधिकारिक सार्वजनिक सत्यापन पोर्टल पर जाएं:`
        : `To check Certificate ID "${certCode}" against our institutional database, use our official Verification portal:`,
      action: {
        label: lang === "hi" ? "सत्यापित करें" : "Open Verification Portal",
        to: `/check?id=${encodeURIComponent(certCode)}`
      }
    };
  }

  // Match Knowledge Base
  for (const item of FAQ_KNOWLEDGE_BASE) {
    if (item.match.test(clean)) {
      return {
        text: lang === "hi" ? item.hi : item.en,
        action: item.action
          ? {
              label: lang === "hi" ? item.action.labelHi : item.action.labelEn,
              to: item.action.to
            }
          : undefined
      };
    }
  }

  // Greetings
  if (/^(hi|hello|hey|namaste|नमस्ते|हैलो)/i.test(clean)) {
    return {
      text: lang === "hi"
        ? "नमस्ते! मैं 'सफर' हूँ — आपका EduProof AI सहायक। मैं प्रमाणपत्र सत्यापन, ट्रस्ट स्कोर, CV जनरेटर या संस्थान पोर्टल में आपकी कैसे सहायता कर सकता हूँ?"
        : "Hello! I am Safar, your EduProof AI Assistant. How can I help you today with certificate verification, trust scoring, CV generation, or institution portals?",
      action: {
        label: lang === "hi" ? "सर्टिफिकेट जांचें" : "Verify a Certificate",
        to: "/check"
      }
    };
  }

  // Default trained fallback
  return {
    text: lang === "hi"
      ? "मैं EduProof क्रेडेंशियल ट्रस्ट सिस्टम में आपकी सहायता कर सकता हूँ। आप प्रमाणपत्र सत्यापन, ट्रस्ट स्कोर, छात्र डैशबोर्ड, रिक्रूटर सर्च या संस्थान पोर्टल के बारे में पूछ सकते हैं। या नीचे दिए गए विकल्पों में से चुनें:"
      : "I am trained to help you with the EduProof Credential Verification System. You can ask me about checking a certificate, understanding trust scores, student upload & verified CVs, or institutional certificate issuance.",
    action: {
      label: lang === "hi" ? "सत्यापन पोर्टल" : "Public Verification",
      to: "/check"
    }
  };
}
