import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
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

// Detect if any text contains RTL characters (Hebrew, Arabic)
const containsRTL = (...texts) => {
  const combined = texts.filter(Boolean).join(' ');
  return /[\u0590-\u05FF\u0600-\u06FF]/.test(combined);
};

// ─── Core PDF capture engine ──────────────────────────────────────────────────
// Renders HTML to a hidden DOM node, captures via html2canvas, saves as PDF.
// This approach supports ALL Unicode scripts and RTL languages natively.

const captureAndSavePdf = async (htmlContent, filename) => {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',
    'background:#ffffff',
    'font-family:Arial,"Noto Sans Hebrew","Noto Sans",sans-serif',
    'font-size:14px',
    'line-height:1.5',
    'color:#222',
  ].join(';');
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
    const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfH = pdf.internal.pageSize.getHeight();  // 297mm

    // canvas dimensions are at scale:2, convert back to logical pixels
    const logicalW = canvas.width / 2;
    const logicalH = canvas.height / 2;

    // mm per logical pixel
    const mmPerPx = pdfW / logicalW;
    const totalMmH = logicalH * mmPerPx;

    const imgData = canvas.toDataURL('image/png');

    if (totalMmH <= pdfH) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, totalMmH);
    } else {
      // Slice content across pages
      const totalPages = Math.ceil(totalMmH / pdfH);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(page * pdfH), pdfW, totalMmH);
      }
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
};

// ─── Shared style constants ───────────────────────────────────────────────────

const HEADER_BG = '#26a69a';
const SECTION_TITLE_COLOR = '#1a3a34';
const SECTION_LINE_COLOR = '#b4dcd2';
const HIGHLIGHT_BG = '#e8f6f3';

const sectionHtml = (title, content, dir = 'ltr') => {
  if (!content) return '';
  return `
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:bold;color:${SECTION_TITLE_COLOR};letter-spacing:0.05em;margin-bottom:4px;">
        ${title}
      </div>
      <div style="border-top:1px solid ${SECTION_LINE_COLOR};margin-bottom:6px;"></div>
      <div style="font-size:13px;color:#373737;direction:auto;unicode-bidi:plaintext;">
        ${content}
      </div>
    </div>`;
};

const bulletListHtml = (title, items) => {
  if (!items?.length) return '';
  const listItems = items.map(item =>
    `<li style="margin-bottom:4px;direction:auto;unicode-bidi:plaintext;">${item}</li>`
  ).join('');
  return `
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:bold;color:${SECTION_TITLE_COLOR};letter-spacing:0.05em;margin-bottom:4px;">
        ${title}
      </div>
      <div style="border-top:1px solid ${SECTION_LINE_COLOR};margin-bottom:6px;"></div>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#373737;">
        ${listItems}
      </ul>
    </div>`;
};

const headerHtml = (title, subtitle, date) => `
  <div style="background:${HEADER_BG};color:#fff;padding:16px 24px;margin-bottom:24px;">
    <div style="font-size:17px;font-weight:bold;">${title}</div>
    ${subtitle ? `<div style="font-size:11px;opacity:0.85;margin-top:2px;">${subtitle}</div>` : ''}
    <div style="font-size:10px;opacity:0.75;margin-top:4px;">${date}</div>
  </div>
  <div style="padding:0 24px 24px;">`;

const footerHtml = () => `
  </div>
  <div style="border-top:1px solid #ccc;margin:0 24px;padding:10px 0;">
    <div style="font-size:9px;color:#aaa;font-style:italic;">
      For personal records only. Not a substitute for professional medical advice. 
      Generated ${new Date().toLocaleDateString()}
    </div>
  </div>`;

// ─── Thought Record export ────────────────────────────────────────────────────

const buildThoughtRecordHtml = (entry) => {
  const date = new Date(entry.created_date).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const entryTypeLabel = entry.entry_type
    ? entry.entry_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  const intensityPart = entry.emotion_intensity ? ` | Initial intensity: ${entry.emotion_intensity}/10` : '';
  const emotionsText = entry.emotions?.length
    ? entry.emotions.join(', ') + intensityPart
    : null;

  const outcomeText = entry.outcome_emotion_intensity
    ? (() => {
        const diff = (entry.emotion_intensity || 0) - entry.outcome_emotion_intensity;
        return `After reframing: ${entry.outcome_emotion_intensity}/10${diff > 0 ? ` (reduced by ${diff} points ✓)` : ''}`;
      })()
    : null;

  const balancedThoughtHtml = entry.balanced_thought
    ? `<div style="margin-bottom:18px;">
        <div style="font-size:11px;font-weight:bold;color:${SECTION_TITLE_COLOR};letter-spacing:0.05em;margin-bottom:4px;">BALANCED THOUGHT</div>
        <div style="border-top:1px solid ${SECTION_LINE_COLOR};margin-bottom:6px;"></div>
        <div style="background:${HIGHLIGHT_BG};border-radius:6px;padding:10px 14px;font-size:13px;color:${SECTION_TITLE_COLOR};direction:auto;unicode-bidi:plaintext;">
          ${stripHtml(entry.balanced_thought)}
        </div>
      </div>`
    : '';

  const homeworkHtml = entry.homework_tasks?.length
    ? `<div style="margin-bottom:18px;">
        <div style="font-size:11px;font-weight:bold;color:${SECTION_TITLE_COLOR};letter-spacing:0.05em;margin-bottom:4px;">HOMEWORK TASKS</div>
        <div style="border-top:1px solid ${SECTION_LINE_COLOR};margin-bottom:6px;"></div>
        ${entry.homework_tasks.map((task, i) => `
          <div style="margin-bottom:8px;">
            <div style="font-size:13px;font-weight:bold;color:#373737;direction:auto;unicode-bidi:plaintext;">${i + 1}. ${task.task}</div>
            ${task.duration_minutes ? `<div style="font-size:11px;color:#888;margin-top:2px;">Duration: ${task.duration_minutes} min</div>` : ''}
            ${task.success_criteria ? `<div style="font-size:11px;color:#888;direction:auto;unicode-bidi:plaintext;">Success: ${task.success_criteria}</div>` : ''}
          </div>`).join('')}
      </div>`
    : '';

  return [
    headerHtml('CBT Thought Record', entryTypeLabel ? `Type: ${entryTypeLabel}` : '', date),
    sectionHtml('SITUATION', stripHtml(entry.situation)),
    sectionHtml('AUTOMATIC THOUGHTS', stripHtml(entry.automatic_thoughts)),
    emotionsText ? sectionHtml('EMOTIONS', emotionsText) : '',
    entry.cognitive_distortions?.length ? sectionHtml('THINKING PATTERNS', entry.cognitive_distortions.join(', ')) : '',
    sectionHtml('EVIDENCE SUPPORTING THE THOUGHT', stripHtml(entry.evidence_for)),
    sectionHtml('EVIDENCE AGAINST THE THOUGHT', stripHtml(entry.evidence_against)),
    balancedThoughtHtml,
    outcomeText ? sectionHtml('OUTCOME', outcomeText) : '',
    homeworkHtml,
    footerHtml(),
  ].join('');
};

// ─── Session Summary export ───────────────────────────────────────────────────

const buildSessionSummaryHtml = (summary) => {
  const date = new Date(summary.created_date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const resourcesHtml = summary.recommended_resources?.length
    ? `<div style="margin-bottom:18px;">
        <div style="font-size:11px;font-weight:bold;color:${SECTION_TITLE_COLOR};letter-spacing:0.05em;margin-bottom:4px;">RECOMMENDED RESOURCES</div>
        <div style="border-top:1px solid ${SECTION_LINE_COLOR};margin-bottom:6px;"></div>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#373737;">
          ${summary.recommended_resources.map(res => {
            const text = res.url ? `${res.title} — ${res.url}` : res.title;
            return `<li style="margin-bottom:4px;">${text}</li>`;
          }).join('')}
        </ul>
      </div>`
    : '';

  return [
    headerHtml('AI Session Summary', 'AI insights from your CBT therapy conversation', date),
    sectionHtml('SESSION OVERVIEW', stripMarkdown(summary.summary_content)),
    bulletListHtml('KEY TAKEAWAYS', summary.key_takeaways),
    bulletListHtml('ACTIONABLE ADVICE', summary.actionable_advice),
    resourcesHtml,
    footerHtml(),
  ].join('');
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const exportThoughtRecordPdf = async (entry) => {
  const html = buildThoughtRecordHtml(entry);
  const filename = `thought-record-${new Date(entry.created_date).toISOString().split('T')[0]}.pdf`;
  await captureAndSavePdf(html, filename);
};

export const exportSessionSummaryPdf = async (summary) => {
  const html = buildSessionSummaryHtml(summary);
  const filename = `session-summary-${new Date(summary.created_date).toISOString().split('T')[0]}.pdf`;
  await captureAndSavePdf(html, filename);
};