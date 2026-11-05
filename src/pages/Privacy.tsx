import { Layout } from "@/components/layout/Layout";
import { Shield, Lock, FileText, Scale, UserCheck, AlertCircle, Building, CheckCircle2, Mail, MapPin, Clock } from "lucide-react";

const Privacy = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Compliant with DPDP Act, 2023 & IT Act, 2000 (India)
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              EduProof is committed to protecting your digital personal data in strict compliance with the laws and regulations of the Government of India.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              Last Updated & Reviewed: February 2026 • Effective in Republic of India
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Regulatory Notice Banner */}
            <div className="bg-primary/5 rounded-3xl p-6 sm:p-8 border border-primary/20 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                  Indian Statutory Compliance Framework
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This Privacy Policy is formulated and published pursuant to the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong>, 
                  the <strong>Information Technology Act, 2000 (IT Act)</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)</strong>, 
                  and the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
                </p>
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-soft border border-border/50 space-y-10">
              {/* 1. Introduction & Data Fiduciary */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Data Fiduciary & Scope
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  EduProof Technologies ("<strong>EduProof</strong>", "<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>") operates as a <strong>Data Fiduciary</strong> as defined under Section 2(i) of the Digital Personal Data Protection Act, 2023. This policy governs how we collect, process, verify, store, and safeguard the digital personal data of students, academic institutions, recruiters, and verifiers ("<strong>Data Principals</strong>") using our credential verification platform.
                </p>
              </div>

              {/* 2. Categories of Digital Personal Data Collected */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Categories of Personal Data Collected
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In accordance with the principle of data minimization (processing only what is necessary), EduProof collects:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-muted/40 rounded-2xl p-5 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4 text-primary" /> Identity & Account Data
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Full name, official email address, mobile number, role classification (Candidate, Recruiter, Institution), and hashed authentication credentials.
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-2xl p-5 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" /> Academic & Credential Records
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Degree certificates, diplomas, transcripts, issuing authority/university names, student identification codes, graduation years, and cryptographic hash values (SHA-256).
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-2xl p-5 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" /> Verification Telemetry
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Automated authenticity score metrics, tamper-detection logs, digital issuer signatures, and public verification lookup records.
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-2xl p-5 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-primary" /> Technical & CERT-In Audit Logs
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      IP addresses, browser type, device identifiers, and timestamp logs maintained in compliance with the directives of the Indian Computer Emergency Response Team (CERT-In).
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Lawful Grounds and Purpose of Processing */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Lawful Purpose & Grounds of Processing
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Digital personal data is processed solely on legitimate grounds specified under Section 4 and Section 7 of the DPDP Act 2023:
                </p>
                <ul className="space-y-2.5 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Credential Verification:</strong> Authenticating educational credentials against verified institutional registries and detecting fraudulent documents.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Verifiable CV Generation:</strong> Enabling candidates to showcase tamper-proof verifiable trust badges to prospective recruiters.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Recruiter Access:</strong> Sharing candidate credentials with recruiters exclusively upon the candidate's explicit, affirmative consent.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Legal & Regulatory Compliance:</strong> Complying with directions issued by Indian law enforcement, statutory courts, or regulatory authorities.</span>
                  </li>
                </ul>
              </div>

              {/* 4. Consent Architecture & Right to Withdraw */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Notice, Consent & Withdrawal
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                  In accordance with <strong>Section 6 of the DPDP Act, 2023</strong>:
                </p>
                <div className="bg-muted/30 rounded-2xl p-5 border border-border/50 text-sm text-muted-foreground space-y-2">
                  <p>
                    • Every request for consent is accompanied by an itemized, clear notice specifying the personal data requested and the exact purpose of verification.
                  </p>
                  <p>
                    • <strong>Right to Withdraw Consent:</strong> You may withdraw your consent at any time via your Account Settings or by notifying our Grievance Officer. The ease of withdrawing consent is designed to be equal to giving it.
                  </p>
                  <p>
                    • Withdrawal of consent does not affect the legality of data processed prior to withdrawal.
                  </p>
                </div>
              </div>

              {/* 5. Processing of Data of Children & Minors */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Protection of Children and Minors' Data
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                  In strict compliance with <strong>Section 9 of the DPDP Act, 2023</strong>:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-2">
                  <li>Before processing personal data of any individual below the age of 18 years, verifiable consent of the parent or lawful guardian is obtained.</li>
                  <li>EduProof does <strong>not</strong> engage in tracking, behavioral monitoring, or targeted advertising directed towards children.</li>
                  <li>No processing that causes any detrimental effect on the well-being of a child is permitted on the platform.</li>
                </ul>
              </div>

              {/* 6. Reasonable Security Practices & Data Storage */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    6
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Reasonable Security Practices & Storage in India
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                  In adherence to <strong>Rule 8 of the Information Technology (SPDI) Rules, 2011</strong> and ISO/IEC 27001 standards:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-card rounded-2xl p-4 border border-border/70 shadow-sm">
                    <h5 className="font-semibold text-foreground mb-1">Cryptographic Protection</h5>
                    <p className="text-xs text-muted-foreground">TLS 1.3 transit encryption and AES-256 resting encryption for all stored credential artifacts.</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border/70 shadow-sm">
                    <h5 className="font-semibold text-foreground mb-1">Data Sovereignty & Local Storage</h5>
                    <p className="text-xs text-muted-foreground">Primary databases and verification vaults reside in secure data center regions located within India.</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border/70 shadow-sm">
                    <h5 className="font-semibold text-foreground mb-1">Row-Level Security (RLS)</h5>
                    <p className="text-xs text-muted-foreground">Strict database isolation ensuring users can only access credentials they own or are granted explicit access to.</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border/70 shadow-sm">
                    <h5 className="font-semibold text-foreground mb-1">Cross-Border Transfers</h5>
                    <p className="text-xs text-muted-foreground">Transfers outside India occur only in strict accordance with Central Government notifications under Section 16 of the DPDP Act.</p>
                  </div>
                </div>
              </div>

              {/* 7. Rights of the Data Principal */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    7
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Your Statutory Rights (DPDP Act, 2023)
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                  As a Data Principal residing in India, you are entitled to the following statutory rights:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <strong className="text-foreground">Right to Access Information (Section 11):</strong>
                    <span className="text-muted-foreground ml-1">You may obtain a summary of digital personal data processed by EduProof and the identities of third parties with whom it was shared.</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <strong className="text-foreground">Right to Correction & Erasure (Section 12):</strong>
                    <span className="text-muted-foreground ml-1">You may request the correction of inaccurate data, completion of incomplete data, or erasure of personal data that is no longer necessary for verification.</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <strong className="text-foreground">Right of Grievance Redressal (Section 13):</strong>
                    <span className="text-muted-foreground ml-1">You have the right to register grievances with our designated Grievance Officer regarding the performance of our obligations.</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <strong className="text-foreground">Right to Nominate (Section 14):</strong>
                    <span className="text-muted-foreground ml-1">You have the right to nominate an individual who shall exercise your data principal rights in the event of death or incapacity.</span>
                  </div>
                </div>
              </div>

              {/* 8. Retention and Disposal */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    8
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Data Retention & Disposal
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Personal data is retained only for the duration required to satisfy the verification purpose or to comply with statutory audit periods under Indian law. Upon expiration of the retention need or upon receipt of a valid erasure request, data is securely sanitized using cryptographic deletion techniques.
                </p>
              </div>

              {/* 9. Grievance Officer & Redressal Mechanism */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    9
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Grievance Officer & Redressal Mechanism
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                  In compliance with <strong>Rule 5(9) of the Information Technology (SPDI) Rules, 2011</strong>, <strong>Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021</strong>, and <strong>Section 13 of the DPDP Act, 2023</strong>, the details of the designated Grievance & Data Protection Officer are as follows:
                </p>

                <div className="bg-primary/5 rounded-3xl p-6 sm:p-8 border border-primary/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                    <div>
                      <h4 className="font-display font-bold text-foreground text-lg">
                        Grievance & Data Protection Officer
                      </h4>
                      <p className="text-sm text-primary font-medium">
                        EduProof Technologies India
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/15 text-primary px-3 py-1 rounded-full font-medium w-fit">
                      <Clock className="w-3.5 h-3.5" /> 24-hr Acknowledgment • 15-day Resolution
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm pt-2">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Email for Grievances & Inquiries</span>
                        <a href="mailto:grievance@eduproof.com" className="text-foreground font-semibold hover:text-primary transition-colors">
                          grievance@eduproof.com
                        </a>
                        <span className="text-xs text-muted-foreground block mt-0.5">Copy: privacy@eduproof.com</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Registered Office (India)</span>
                        <span className="text-foreground font-medium text-xs leading-relaxed block">
                          EduProof Technologies India<br />
                          Outer Ring Road, Bellandur, Bengaluru,<br />
                          Karnataka - 560103, India
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/10 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      If any grievance is not satisfactorily redressed by our Grievance Officer within thirty (30) days, the Data Principal has the right to appeal to the <strong>Data Protection Board of India (DPBI)</strong> in accordance with Section 13(3) of the DPDP Act, 2023.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
