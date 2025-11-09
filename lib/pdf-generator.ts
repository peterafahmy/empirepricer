import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './utils';
import { createPricingEngine } from './pricing';

export async function generateItineraryPDF(itinerary: any, pricingRules: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('EMPIRE TRAVEL', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99); // Gray color
  doc.text('Travel Itinerary Proposal', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setDrawColor(229, 231, 235); // Border color
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  // Customer Information
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Itinerary Details', 20, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const details = [
    ['Title:', itinerary.title],
    ['Customer:', itinerary.customerName],
    ['Travel Dates:', `${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`],
    ['Number of Travelers:', itinerary.travelers.length.toString()],
    ['Currency:', itinerary.currency],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPosition);
    yPosition += 6;
  });

  // Travelers Section
  if (itinerary.travelers.length > 0) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Travelers', 20, yPosition);
    yPosition += 5;

    const travelerData = itinerary.travelers.map((t: any, index: number) => [
      (index + 1).toString(),
      t.name,
      t.age ? `${t.age} years` : 'N/A',
      `Room ${t.roomNumber} - ${t.roomType.toLowerCase()}`,
      t.isSingleOccupancy ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Name', 'Age', 'Room Assignment', 'Single Occupancy']],
      body: travelerData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Services Section
  if (itinerary.services.length > 0) {
    // Group services by type
    const servicesByType: { [key: string]: any[] } = {
      ACCOMMODATION: [],
      TRANSFER: [],
      TOUR: [],
      MISCELLANEOUS: [],
    };

    itinerary.services.forEach((service: any) => {
      servicesByType[service.type].push(service);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Included Services', 20, yPosition);
    yPosition += 5;

    Object.entries(servicesByType).forEach(([type, services]) => {
      if (services.length === 0) return;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(type.charAt(0) + type.slice(1).toLowerCase(), 20, yPosition);
      yPosition += 5;

      const serviceData = services.map((s: any) => [
        s.name,
        s.description || '',
        s.date ? formatDate(s.date) : '',
        `${s.pricingType.replace('_', ' ').toLowerCase()}`,
        formatCurrency(s.basePrice, itinerary.currency),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Service', 'Description', 'Date', 'Pricing', 'Rate']],
        body: serviceData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;
    });
  }

  // Pricing Summary
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Pricing Summary', 20, yPosition);
  yPosition += 5;

  // Calculate pricing
  const engine = createPricingEngine(
    itinerary.travelers,
    itinerary.services,
    pricingRules
  );
  const breakdown = engine.calculateTotal();

  const pricingData = [
    ['Subtotal', formatCurrency(breakdown.subtotal, itinerary.currency)],
  ];

  if (breakdown.supplements > 0) {
    pricingData.push([
      'Supplements (Single occupancy, etc.)',
      formatCurrency(breakdown.supplements, itinerary.currency),
    ]);
  }

  if (breakdown.discounts > 0) {
    pricingData.push([
      'Discounts (Triple room, child, etc.)',
      `-${formatCurrency(breakdown.discounts, itinerary.currency)}`,
    ]);
  }

  if (breakdown.taxes > 0) {
    pricingData.push([
      'Taxes & Fees',
      formatCurrency(breakdown.taxes, itinerary.currency),
    ]);
  }

  pricingData.push([
    'TOTAL PRICE',
    formatCurrency(breakdown.total, itinerary.currency),
  ]);

  if (itinerary.travelers.length > 0) {
    pricingData.push([
      `Price per Person (${itinerary.travelers.length} travelers)`,
      formatCurrency(breakdown.perPerson, itinerary.currency),
    ]);
  }

  autoTable(doc, {
    startY: yPosition,
    body: pricingData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.row.index === pricingData.length - 1) {
        data.cell.styles.fontSize = 12;
        data.cell.styles.fillColor = [37, 99, 235];
        data.cell.styles.textColor = 255;
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Terms & Conditions
  if (itinerary.termsConditions) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions', 20, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(itinerary.termsConditions, pageWidth - 40);
    doc.text(splitText, 20, yPosition);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Empire Travel - Your Journey, Our Expertise',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `Itinerary_${itinerary.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
