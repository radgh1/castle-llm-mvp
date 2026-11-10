import { useState, useRef } from 'react';
import { api, DocumentIngestRequest } from '../lib/api';

interface DocumentUploadProps {
  model?: string;
  temperature?: number;
  useRag?: boolean;
  onRagChange?: (useRag: boolean) => void;
  onDocumentIngested?: (result: { success: boolean; message: string; documentCount?: number }) => void;
}

export default function DocumentUpload({ model = 'ollama:llama2', temperature = 0.7, useRag = false, onRagChange, onDocumentIngested }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [uploadSubTab, setUploadSubTab] = useState<'file' | 'url' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Reading file...');

    try {
      let content = '';
      let type: DocumentIngestRequest['type'] = 'text';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files, we'll send the file as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.name.endsWith('.docx')) {
        // For DOCX files, we'll send as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else {
        // For text files
        content = await file.text();
        type = 'file';
      }

      setUploadStatus('Ingesting document...');

      const result = await api.ingestDocument({
        content,
        filename: file.name,
        type,
      });

      setUploadStatus(result.success ? 'Document ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setUploadStatus('Please enter a URL');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Fetching URL content...');

    try {
      const result = await api.ingestDocument({
        content: '', // Will be processed server-side
        filename: urlInput,
        type: 'url',
        url: urlInput,
      });

      setUploadStatus(result.success ? 'URL content ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setUrlInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      setUploadStatus('Please enter some text');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Ingesting text...');

    try {
      const result = await api.ingestDocument({
        content: textInput,
        filename: 'manual-text-input.txt',
        type: 'text',
      });

      setUploadStatus(result.success ? 'Text ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setTextInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  const sendChatMessage = async (text?: string) => {
    const messageText = text || chatInput;
    if (!messageText.trim()) return;

    const next = [...chatMessages, { role: 'user', content: messageText } as const];
    setChatMessages(next);
    setChatInput('');

    setIsChatting(true);

    try {
      const resp = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          model, 
          temperature, 
          system: 'You are a helpful assistant that answers questions based on the uploaded documents. If you cannot find relevant information in the documents, say so clearly.', 
          useRag: true, // Always use RAG for document chat
          promptName: 'document-chat',
          messages: next 
        }) 
      });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistant = '';
      setChatMessages(curr => [...curr, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n\n').forEach(evt => {
          if (!evt.trim()) return;
          const [header, dataLine] = evt.split('\n');
          const type = header.replace('event: ', '').trim();
          const data = JSON.parse((dataLine || '').replace('data: ', ''));
          if (type === 'token') {
            assistant += data.token;
            setChatMessages(curr => {
              const cp = curr.slice(); 
              cp[cp.length - 1] = { role: 'assistant', content: assistant }; 
              return cp;
            });
          }
        });
      }
    } catch (error) {
      setChatMessages(curr => [...curr, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <section className="document-upload">
      <div className="doc-header">
        <h2>� Your Documents</h2>
        <p>Add documents to provide context for AI responses</p>
      </div>

      {/* RAG Toggle */}
      <div className="toggles">
        <label>
          <input type="checkbox" checked={useRag} onChange={(e) => onRagChange?.(e.target.checked)} />
          <strong>Use RAG</strong> <em>(Search uploaded documents)</em>
        </label>
      </div>

      {/* Three Simple Use Cases */}
      <div className="use-cases-grid">
        {/* Use Case 1: Upload File */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>📎 Upload File</h3>
            <p className="use-case-desc">Upload PDF, DOCX, or TXT files</p>
          </div>
          <div className="use-case-content">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileSelect}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="action-button"
            >
              {isUploading ? '⏳ Uploading...' : '📁 Choose File'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Research papers, meeting notes, company policies, technical docs
            </p>
          </div>
        </div>

        {/* Use Case 2: Web URL */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>🌐 Web URL</h3>
            <p className="use-case-desc">Fetch content from any webpage</p>
          </div>
          <div className="use-case-content">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isUploading}
              className="input-field"
            />
            <button
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
              className="action-button"
            >
              {isUploading ? '⏳ Fetching...' : '🔗 Load URL'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Blog articles, Wikipedia, docs, news articles, FAQs
            </p>
          </div>
        </div>

        {/* Use Case 3: Paste Text */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>✏️ Paste Text</h3>
            <p className="use-case-desc">Paste or type content directly</p>
          </div>
          <div className="use-case-content">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your text here..."
              disabled={isUploading}
              className="input-field text-area"
              rows={4}
            />
            <button
              onClick={handleTextUpload}
              disabled={isUploading || !textInput.trim()}
              className="action-button"
            >
              {isUploading ? '⏳ Processing...' : '📝 Add Text'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Email content, code snippets, chat transcripts, quick notes
              <br /><br />
              <button
                className="example-link"
                onClick={() => setTextInput(`# Modern HR Best Practices

## Recruitment & Talent Acquisition

### Effective Job Descriptions
- Use clear, concise language that accurately reflects the role
- Include key responsibilities, required skills, and growth opportunities
- Specify must-have vs. nice-to-have qualifications
- Highlight company culture and values

### Candidate Experience
- Respond to applications within 48 hours
- Provide clear timeline for hiring process
- Offer constructive feedback to unsuccessful candidates
- Use applicant tracking systems for efficient communication

## Employee Onboarding

### 90-Day Integration Plan
1. **First Day**: Welcome, paperwork, tour, introductions
2. **First Week**: Role expectations, tools training, team meetings
3. **First Month**: Performance goals, feedback sessions, skill development
4. **First Quarter**: Performance review, career planning, mentorship

### Key Success Factors
- Clear communication of expectations
- Regular check-ins and feedback
- Access to necessary tools and resources
- Buddy/mentor system for support

## Performance Management

### Continuous Feedback Model
- Regular one-on-one meetings (bi-weekly)
- Real-time recognition of achievements
- Constructive feedback on improvement areas
- Goal setting and progress tracking

### Performance Review Process
1. Self-assessment by employee
2. Manager evaluation and calibration
3. Collaborative discussion and goal setting
4. Development plan creation
5. Follow-up and progress monitoring

## Employee Development

### Learning & Development
- Individual development plans
- Cross-training opportunities
- Conference and certification support
- Leadership development programs

### Career Progression
- Clear career paths and ladders
- Internal job posting system
- Succession planning
- Skills gap analysis and training

## Workplace Culture

### Diversity, Equity & Inclusion
- Unconscious bias training
- Employee resource groups
- Inclusive hiring practices
- Regular DEI assessments

### Work-Life Balance
- Flexible work arrangements
- Mental health support
- Paid time off policies
- Wellness programs

## Compensation & Benefits

### Competitive Packages
- Market research and benchmarking
- Transparent salary ranges
- Performance-based incentives
- Comprehensive benefits (health, dental, retirement)

### Total Rewards Strategy
- Base salary + variable pay
- Health and wellness benefits
- Professional development support
- Work-life balance perks`)}
                title="Load comprehensive HR best practices content"
              >
                💼 Try HR Best Practices
              </button>
              <br /><br />
              <button
                className="example-link"
                onClick={() => setTextInput(`# Employee Handbook

## Welcome to Our Company

Welcome to [Company Name]! We're excited to have you join our team. This Employee Handbook serves as your guide to our company policies, procedures, and culture. Please read it carefully and refer to it as needed throughout your employment.

## Table of Contents

1. [Company Overview](#company-overview)
2. [Code of Conduct](#code-of-conduct)
3. [Employment Policies](#employment-policies)
4. [Compensation and Benefits](#compensation-and-benefits)
5. [Work Environment](#work-environment)
6. [Technology and Equipment](#technology-and-equipment)
7. [Health and Safety](#health-and-safety)
8. [Professional Development](#professional-development)
9. [Communication](#communication)
10. [Disciplinary Procedures](#disciplinary-procedures)

## Company Overview

### Our Mission
[Company Name] is committed to [mission statement]. We strive to create innovative solutions that [company goals].

### Our Values
- **Innovation**: We embrace new ideas and creative solutions
- **Collaboration**: We work together to achieve common goals
- **Integrity**: We conduct business with honesty and transparency
- **Excellence**: We deliver high-quality work in everything we do
- **Respect**: We value diversity and treat everyone with dignity

### Organizational Structure
Our company is organized into the following departments:
- Executive Leadership
- Product Development
- Sales and Marketing
- Customer Support
- Human Resources
- Finance and Administration

## Code of Conduct

### Professional Behavior
All employees are expected to maintain professional behavior both in and out of the workplace. This includes:
- Treating colleagues, customers, and partners with respect
- Maintaining confidentiality of company information
- Avoiding conflicts of interest
- Complying with all applicable laws and regulations

### Harassment and Discrimination
We maintain a zero-tolerance policy for harassment and discrimination. This includes:
- Sexual harassment
- Racial or ethnic discrimination
- Religious discrimination
- Age discrimination
- Disability discrimination

### Reporting Violations
If you experience or witness any violation of our code of conduct, please report it immediately to:
- Your supervisor
- Human Resources department
- Anonymous reporting hotline: 1-800-XXX-XXXX

## Employment Policies

### Work Hours
- Standard work hours: 9:00 AM - 5:00 PM, Monday through Friday
- Flexible scheduling available for eligible positions
- Overtime must be pre-approved by your supervisor

### Attendance
- Regular attendance is essential for team success
- Notify your supervisor in advance if you will be absent
- Use of sick leave should be reported according to company policy

### Remote Work
- Remote work may be available based on position requirements
- Remote employees must maintain productivity standards
- Regular check-ins with supervisors are required

### Performance Expectations
- Clear job descriptions and performance goals will be provided
- Regular performance reviews will be conducted
- Professional development opportunities are available

## Compensation and Benefits

### Salary
- Competitive salaries based on experience and market rates
- Annual salary reviews tied to performance
- Transparent compensation structure

### Benefits Package
- Health insurance (medical, dental, vision)
- Retirement plan with company matching
- Paid time off (vacation, sick leave, holidays)
- Life and disability insurance
- Employee assistance program

### Paid Time Off
- Vacation: 15 days per year (increases with tenure)
- Sick leave: 10 days per year
- Personal days: 3 days per year
- Holidays: 10 company holidays per year

## Work Environment

### Office Environment
- Clean and professional workspace
- Ergonomic equipment provided
- Quiet zones available for focused work
- Collaborative spaces for team meetings

### Dress Code
- Business casual attire for office environments
- Position-specific dress requirements may apply
- Comfortable attire for remote work

### Facilities
- Modern office spaces with necessary amenities
- Kitchen and break areas
- Fitness center access
- Parking facilities

## Technology and Equipment

### Computer Equipment
- Company-provided laptops and desktops
- Software licenses for required applications
- Regular hardware upgrades

### Software and Tools
- Email and communication tools
- Project management software
- Development tools and environments
- Security software and protocols

### Data Security
- All company data must be protected
- Use of encryption for sensitive information
- Regular security training required
- Personal devices may be used with approval

## Health and Safety

### Workplace Safety
- Emergency evacuation procedures
- First aid kits available
- Safety training for hazardous equipment
- Reporting of safety concerns

### Health Programs
- Annual health screenings
- Wellness programs and challenges
- Mental health resources
- Work-life balance initiatives

### COVID-19 Policies
- Vaccination requirements (where applicable)
- Remote work options
- Sanitization protocols
- Health monitoring procedures

## Professional Development

### Training Programs
- Onboarding training for new employees
- Department-specific training
- Leadership development programs
- Technical skill development

### Career Development
- Individual development plans
- Mentorship programs
- Internal job opportunities
- Conference and certification support

### Performance Management
- Regular feedback sessions
- Goal setting and tracking
- Career path planning
- Succession planning

## Communication

### Internal Communication
- Company email for official communications
- Intranet for policies and announcements
- Team meetings and updates
- Company newsletter

### External Communication
- Social media guidelines
- Press release protocols
- Customer communication standards
- Brand representation

### Feedback Mechanisms
- Anonymous suggestion box
- Employee surveys
- Open door policy
- Regular town hall meetings

## Disciplinary Procedures

### Progressive Discipline
Our disciplinary process follows these steps:
1. Verbal warning for minor issues
2. Written warning for repeated issues
3. Performance improvement plan
4. Suspension or termination for serious violations

### Termination Procedures
- Notice periods based on position and tenure
- Exit interviews conducted
- Return of company property
- Final paycheck procedures

### Appeals Process
- Employees may appeal disciplinary decisions
- Appeals must be submitted within 5 business days
- Review by HR and management
- Final decision communicated within 10 business days

## Contact Information

### Human Resources
- Email: hr@company.com
- Phone: (555) 123-4567
- Address: 123 Business Street, Suite 100, City, State 12345

### Emergency Contacts
- Emergency: 911
- Building Security: (555) 987-6543
- IT Support: (555) 246-8135

### Department Contacts
- Executive Team: executives@company.com
- IT Department: it@company.com
- Facilities: facilities@company.com

## Acknowledgment

I acknowledge that I have received and read the Employee Handbook. I understand that it contains important information about company policies and procedures. I agree to comply with all policies outlined in this handbook.

Employee Signature: ___________________________ Date: __________

Supervisor Signature: _________________________ Date: __________`)}
                title="Load comprehensive employee handbook content"
              >
                📋 Try Employee Handbook
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
          {uploadStatus}
        </div>
      )}

      {/* Chat with Documents */}
      <div className="document-chat">
        <div className="chat-header">
          <h3>💬 Chat with Your Documents</h3>
            <p>Ask questions about your uploaded documents. RAG is automatically enabled for document-based responses.</p>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <h4>Start a conversation with your documents</h4>
                <p>Try these example questions:</p>
                <div className="example-buttons">
                  <button
                    className="example-btn"
                    onClick={() => sendChatMessage("What are the main topics covered in the documents?")}
                  >
                    📋 Document Summary
                  </button>
                  <button
                    className="example-btn"
                    onClick={() => sendChatMessage("Explain the key concepts from the uploaded content")}
                  >
                    🔑 Key Concepts
                  </button>
                  <button
                    className="example-btn"
                    onClick={() => sendChatMessage("What are the practical applications mentioned?")}
                  >
                    💼 Applications
                  </button>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.role}`}>
                    <div className="msg-content">{m.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <div className="chat-input">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about your documents..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !isChatting) sendChatMessage(); }}
              disabled={isChatting}
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={isChatting || !chatInput.trim()}
            >
              {isChatting ? '⏳' : '📤'}
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
            {uploadStatus}
          </div>
        )}
    </section>
  );
}
