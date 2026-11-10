# Employee Handbook Demo Files

This directory contains demo files for testing the RAG system with a comprehensive employee handbook.

## Files Created

1. **`employee-handbook.md`** - Markdown version of the employee handbook
2. **`employee-handbook.html`** - HTML version with professional styling
3. **`serve-handbook.py`** - Python script to serve the HTML file locally

## How to Use Each Method

### 1. Upload File Method
- Use the `employee-handbook.md` file
- In the Documents tab, click "📎 Upload File"
- Select and upload the markdown file
- The system will process and index the content

### 2. Paste Text Method
- In the Documents tab, click "✏️ Paste Text"
- Click the "📋 Try Employee Handbook" button
- The full handbook content will be loaded into the text area
- Click "📝 Add Text" to process it

### 3. URL Load Method
- Start the local web server: `python serve-handbook.py`
- In the Documents tab, click "🌐 Web URL"
- Enter URL: `http://localhost:8000/employee-handbook.html`
- Click "🔗 Load URL" to fetch and process the content

## Testing the RAG System

Once you've loaded the employee handbook using any method, you can test the RAG system by asking questions like:

- "What are the company values?"
- "What is the dress code policy?"
- "How much vacation time do employees get?"
- "What should I do if I experience harassment?"
- "What are the health and safety procedures?"
- "How does the performance review process work?"

## Handbook Content

The employee handbook includes comprehensive sections covering:

- Company overview and values
- Code of conduct and ethics
- Employment policies (hours, attendance, remote work)
- Compensation and benefits
- Work environment and facilities
- Technology and equipment policies
- Health and safety guidelines
- Professional development opportunities
- Communication protocols
- Disciplinary procedures

This provides a realistic test case for how the RAG system handles structured business documents with multiple sections and detailed policies.