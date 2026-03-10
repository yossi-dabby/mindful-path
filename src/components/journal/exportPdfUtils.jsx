import { jsPDF } from 'jspdf';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
};

const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
};

const addHeader = (doc, title, date) => {
  doc.setFillColor(38, 166, 154);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, 20, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(date, 190, 13, { align: 'right' });
  return 30;
};

const addSection = (doc, title, content, y, maxWidth = 165) => {
  if (!content) return y;
  if (y > 265) { doc.addPage(); y = 20; }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 58, 52);
  doc.text(title, 20, y);
  y += 4;
  doc.setLineWidth(0.2);
  doc.setDrawColor(180, 220, 210);
  doc.line(20, y, 190, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);

  const lines = doc.splitTextToSize(content, maxWidth);
  lines.forEach(line => {
    if (y > 273) { doc.addPage(); y = 20; }
    doc.text(line, 20, y);
    y += 5;
  });
  return y + 5;
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setLineWidth(0.2);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 283, 190, 283);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(160, 160, 160);
    doc.text('For personal records only. Not a substitute for professional medical advice.', 20, 288);
    doc.text(`Generated ${new Date().toLocaleDateString()} · Page ${i} of ${pageCount}`, 190, 288, { align: 'right' });
  }
};

export const exportSessionSummaryPdf = (summary) => {
  const doc = new jsPDF();
  const date = new Date(summary.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let y = addHeader(doc, 'AI Session Summary', date);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 130, 125);
  doc.text('AI insights from your CBT therapy conversation', 20, y);
  y += 12;

  if (summary.summary_content) {
    y = addSection(doc, 'SESSION OVERVIEW', stripMarkdown(summary.summary_content), y);
  }

  if (summary.key_takeaways?.length > 0) {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 52);
    doc.text('KEY TAKEAWAYS', 20, y);
    y += 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 220, 210);
    doc.line(20, y, 190, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 55, 55);
    summary.key_takeaways.forEach(item => {
      if (y > 273) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize(`• ${item}`, 158);
      lines.forEach((line, idx) => {
        if (y > 273) { doc.addPage(); y = 20; }
        doc.text(line, idx === 0 ? 22 : 26, y);
        y += 5;
      });
    });
    y += 5;
  }

  if (summary.actionable_advice?.length > 0) {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 52);
    doc.text('ACTIONABLE ADVICE', 20, y);
    y += 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 220, 210);
    doc.line(20, y, 190, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 55, 55);
    summary.actionable_advice.forEach(item => {
      if (y > 273) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize(`• ${item}`, 158);
      lines.forEach((line, idx) => {
        if (y > 273) { doc.addPage(); y = 20; }
        doc.text(line, idx === 0 ? 22 : 26, y);
        y += 5;
      });
    });
    y += 5;
  }

  if (summary.recommended_resources?.length > 0) {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 52);
    doc.text('RECOMMENDED RESOURCES', 20, y);
    y += 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 220, 210);
    doc.line(20, y, 190, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 55, 55);
    summary.recommended_resources.forEach(res => {
      if (y > 273) { doc.addPage(); y = 20; }
      const text = res.url ? `• ${res.title} — ${res.url}` : `• ${res.title}`;
      const lines = doc.splitTextToSize(text, 158);
      lines.forEach((line, idx) => {
        if (y > 273) { doc.addPage(); y = 20; }
        doc.text(line, idx === 0 ? 22 : 26, y);
        y += 5;
      });
    });
  }

  addFooter(doc);
  doc.save(`session-summary-${new Date(summary.created_date).toISOString().split('T')[0]}.pdf`);
};

export const exportThoughtRecordPdf = (entry) => {
  const doc = new jsPDF();
  const date = new Date(entry.created_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  let y = addHeader(doc, 'CBT Thought Record', date);

  if (entry.entry_type) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 130, 125);
    doc.text(`Type: ${entry.entry_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`, 20, y);
    y += 12;
  }

  if (entry.situation) {
    y = addSection(doc, 'SITUATION', stripHtml(entry.situation), y);
  }

  if (entry.automatic_thoughts) {
    y = addSection(doc, 'AUTOMATIC THOUGHTS', stripHtml(entry.automatic_thoughts), y);
  }

  if (entry.emotions?.length > 0) {
    const intensityPart = entry.emotion_intensity ? ` | Initial intensity: ${entry.emotion_intensity}/10` : '';
    y = addSection(doc, 'EMOTIONS', entry.emotions.join(', ') + intensityPart, y);
  }

  if (entry.cognitive_distortions?.length > 0) {
    y = addSection(doc, 'COGNITIVE DISTORTIONS (THINKING PATTERNS)', entry.cognitive_distortions.join(', '), y);
  }

  if (entry.evidence_for) {
    y = addSection(doc, 'EVIDENCE SUPPORTING THE THOUGHT', stripHtml(entry.evidence_for), y);
  }

  if (entry.evidence_against) {
    y = addSection(doc, 'EVIDENCE AGAINST THE THOUGHT', stripHtml(entry.evidence_against), y);
  }

  if (entry.balanced_thought) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 52);
    doc.text('BALANCED THOUGHT', 20, y);
    y += 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 220, 210);
    doc.line(20, y, 190, y);
    y += 5;

    const btLines = doc.splitTextToSize(stripHtml(entry.balanced_thought), 158);
    const boxH = btLines.length * 5 + 8;
    doc.setFillColor(232, 246, 243);
    doc.roundedRect(18, y - 3, 174, boxH, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(26, 58, 52);
    btLines.forEach(line => {
      if (y > 273) { doc.addPage(); y = 20; }
      doc.text(line, 24, y);
      y += 5;
    });
    y += 8;
  }

  if (entry.outcome_emotion_intensity) {
    const diff = (entry.emotion_intensity || 0) - entry.outcome_emotion_intensity;
    const outcomeText = `After reframing: ${entry.outcome_emotion_intensity}/10${diff > 0 ? ` (reduced by ${diff} points ✓)` : ''}`;
    y = addSection(doc, 'OUTCOME', outcomeText, y);
  }

  if (entry.homework_tasks?.length > 0) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 52);
    doc.text('HOMEWORK TASKS', 20, y);
    y += 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 220, 210);
    doc.line(20, y, 190, y);
    y += 5;

    entry.homework_tasks.forEach((task, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(55, 55, 55);
      const taskLines = doc.splitTextToSize(`${i + 1}. ${task.task}`, 160);
      taskLines.forEach(line => {
        if (y > 273) { doc.addPage(); y = 20; }
        doc.text(line, 22, y);
        y += 5;
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      if (task.duration_minutes) { doc.text(`   Duration: ${task.duration_minutes} min`, 22, y); y += 4; }
      if (task.success_criteria) {
        const scLines = doc.splitTextToSize(`   Success: ${task.success_criteria}`, 158);
        scLines.forEach(line => { if (y > 273) { doc.addPage(); y = 20; } doc.text(line, 22, y); y += 4; });
      }
      y += 3;
    });
  }

  addFooter(doc);
  doc.save(`thought-record-${new Date(entry.created_date).toISOString().split('T')[0]}.pdf`);
};