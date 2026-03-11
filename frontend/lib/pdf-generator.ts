import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EvaluationData {
    detailedEvaluation?: {
        overallAssessment: string;
        strengths: any[];
        weaknesses: any[];
        topicsToLearn: any[];
        recommendedCourses: any[];
    };
    finalScore: number;
    maxPossibleScore: number;
    dsaTotalScore: number;
    voiceTotalScore: number;
}

export const generateEvaluationPDF = (candidateName: string, score: number, evaluationData: EvaluationData) => {
    const doc = new jsPDF();
    const { detailedEvaluation } = evaluationData;

    // --- CONFIG ---
    const COLORS = {
        ORANGE: '#f97316',
        DARK_ORANGE: '#ea580c',
        BLACK: '#0f172a',
        GRAY: '#64748b',
        LIGHT_GRAY: '#f1f5f9',
        WHITE: '#ffffff'
    };

    let yPos = 0;

    // --- HEADER ---
    doc.setFillColor(COLORS.BLACK);
    doc.rect(0, 0, 210, 50, 'F');

    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("NITI AI", 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // spacing of 0.3em equivalent in PDF is manual
    doc.text("AI INTERVIEW ASSESSMENT REPORT", 20, 35);

    doc.setTextColor(COLORS.ORANGE);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}`, 170, 25);
    doc.setFontSize(10);
    doc.text("/ 100", 190, 25);

    // Candidate Info
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(12);
    doc.text(`${candidateName}`, 170, 35);
    doc.setTextColor(COLORS.GRAY);
    doc.text(`${new Date().toLocaleDateString()}`, 170, 42);

    yPos = 65;

    // --- OVERALL ASSESSMENT ---
    if (detailedEvaluation?.overallAssessment) {
        doc.setFillColor(COLORS.LIGHT_GRAY);
        doc.setDrawColor(COLORS.LIGHT_GRAY);
        doc.roundedRect(15, yPos - 5, 180, 25, 3, 3, 'F');

        doc.setTextColor(COLORS.BLACK);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("EXECUTIVE SUMMARY", 20, yPos + 5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.GRAY);

        const splitText = doc.splitTextToSize(detailedEvaluation.overallAssessment, 170);
        doc.text(splitText, 20, yPos + 15);

        yPos += 20 + (splitText.length * 5);
    }

    // --- STRENGTHS & WEAKNESSES ---
    yPos += 10;

    if (detailedEvaluation?.strengths) {
        autoTable(doc, {
            startY: yPos,
            head: [['KEY STRENGTHS']],
            body: detailedEvaluation.strengths.map((s: any) => [`• ${s.area}: ${s.description}`]),
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold', fontSize: 10 },
            styles: { fontSize: 10, cellPadding: 6 },
            margin: { left: 15, right: 105 } // Left side
        });
    }

    // @ts-ignore
    const finalYStrengths = doc.lastAutoTable.finalY;

    if (detailedEvaluation?.weaknesses) {
        autoTable(doc, {
            startY: yPos,
            head: [['AREAS FOR IMPROVEMENT']],
            body: detailedEvaluation.weaknesses.map((w: any) => [`• ${w.area}: ${w.description}`]),
            theme: 'striped',
            headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', fontSize: 10 },
            styles: { fontSize: 10, cellPadding: 6 },
            margin: { left: 110, right: 15 } // Right side
        });
    }

    // @ts-ignore
    yPos = Math.max(finalYStrengths, doc.lastAutoTable.finalY) + 15;

    // --- LEARNING ROADMAP (Detailed Table) ---
    doc.setFontSize(14);
    doc.setTextColor(COLORS.BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text("PERSONALIZED LEARNING PLAN", 15, yPos);
    yPos += 5;

    if (detailedEvaluation?.topicsToLearn) {
        const rows = detailedEvaluation.topicsToLearn.map((topic: any) => {
            const videoTitles = topic.recommendedVideos
                ? topic.recommendedVideos.map((v: any) => `▶ ${v.title}`).join('\n')
                : 'No videos found';

            return [
                topic.topic,
                topic.priority,
                topic.reason,
                videoTitles
            ];
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Topic', 'Priority', 'Why Learn?', 'Recommended Tutorials']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: COLORS.BLACK, textColor: COLORS.ORANGE, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 30, fontStyle: 'bold' },
                1: { cellWidth: 20 },
                2: { cellWidth: 50 },
                3: { cellWidth: 80, fontSize: 8 }
            },
            styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        });

        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;
    }

    // --- FOOTER ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(COLORS.GRAY);
        doc.text(`Niti AI AI Assessment • Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`${candidateName.replace(/\s+/g, '_')}_NitiAI_Report.pdf`);
};
