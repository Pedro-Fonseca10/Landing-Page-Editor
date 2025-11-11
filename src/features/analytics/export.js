/*
  Funções para exportar dados analíticos em CSV e PDF.
*/

import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportCSV(filename, rows, headers) {
  const csv = [headers.join(',')]
    .concat(
      rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
}

export function exportMetricsPDF(filename, summary, sources, periodLabel) {
  const doc = new jsPDF({ unit: 'pt' });
  doc.setFontSize(14);
  doc.text('Relatório de Métricas', 40, 40);
  doc.setFontSize(10);
  if (periodLabel) doc.text(`Período: ${periodLabel}`, 40, 58);

  // KPIs
  doc.autoTable({
    startY: 78,
    head: [
      [
        'Visitantes',
        'Sessões',
        'Page Views',
        'CTR',
        'Conversões',
        'Conv/Sessão',
        'Conv/Visitante',
        'Rejeição',
      ],
    ],
    body: [
      [
        summary.visitors,
        summary.sessions,
        summary.pageViews,
        pct(summary.ctr),
        summary.conversions,
        pct(summary.convRateSessions),
        pct(summary.convRateVisitors),
        pct(summary.bounceRate),
      ],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
  });

  // Canais
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 18,
    head: [
      [
        'Canal',
        'Visitantes',
        'Sessões',
        'Page Views',
        'Conversões',
        'Conv/PageView',
      ],
    ],
    body: sources.map((s) => [
      s.source,
      s.visitors,
      s.sessions,
      s.page_views,
      s.conversions,
      pct(s.conv_rate),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
  });

  doc.save(filename);
}

function pct(x) {
  return (x * 100).toFixed(1) + '%';
}
