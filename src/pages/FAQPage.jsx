'use client'
import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import './FAQPage.css';
import Link from 'next/link';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      question: "How does the AI resume screening work?",
      answer: "Our AI analyzes resumes using advanced natural language processing to extract skills, experience, and personality traits. It then compares these against job requirements to provide accurate matching scores and rankings."
    },
    {
      question: "What file formats are supported?",
      answer: "We support PDF and DOCX formats for resumes and job descriptions. For best results, ensure your files are text-based and not scanned images."
    },
    {
      question: "How accurate is the personality analysis?",
      answer: "Our personality analysis is based on the Big Five model (OCEAN), which is scientifically validated. The AI analyzes language patterns in resumes to infer personality traits with approximately 85% accuracy compared to professional assessments."
    },
    {
      question: "Can I upload multiple resumes at once?",
      answer: "Currently, the system processes one resume at a time for detailed analysis. However, you can quickly analyze multiple candidates by uploading them sequentially."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security seriously. All uploaded files are encrypted, processed securely, and automatically deleted after 24 hours. We never share your data with third parties."
    },
    {
      question: "What makes a resume ATS-friendly?",
      answer: "ATS-friendly resumes use standard formatting, clear section headings, relevant keywords, and avoid complex layouts, graphics, or unusual fonts that might confuse automated systems."
    },
    {
      question: "How long does the analysis take?",
      answer: "The analysis typically takes 30-60 seconds per resume, depending on the document length and complexity. You'll see real-time progress updates during processing."
    },
    {
      question: "Can I export the results?",
      answer: "Yes, you can export detailed analysis reports in PDF format, including candidate rankings, skill matches, and personality profiles."
    },
    {
      question: "What if the analysis seems inaccurate?",
      answer: "While our AI is highly accurate, results can vary based on resume quality and format. For best results, ensure resumes are well-structured and contain detailed information about skills and experience."
    },
    {
      question: "Do you offer bulk processing for enterprises?",
      answer: "Yes, we offer enterprise plans with bulk processing capabilities, API access, and custom integrations. Contact us for more details about enterprise solutions."
    }
  ];

  return (
    <div className="faq-page">
      <div className="container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our AI resume screening tool</p>
        </div>

        <div className="faq-content">
          <div className="faq-list">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.question}</span>
                  {openItems[index] ? <ChevronUp /> : <ChevronDown />}
                </button>
                {openItems[index] && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="faq-contact-section">
            <div className="contact-card">
              <div className="contact-icon">
                <MessageCircle />
              </div>
              <h3>Still have questions?</h3>
              {/* FIX: Escaped apostrophes in "Can't" and "you're" */}
              <p>Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.</p> 
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;