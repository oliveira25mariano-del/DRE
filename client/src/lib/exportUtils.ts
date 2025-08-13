import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Utility functions for exporting data
export const exportUtils = {
  // Export table data to CSV
  exportToCSV: (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // Export table data to Excel format
  exportToExcel: (data: any[], filename: string, sheetName = 'Sheet1') => {
    if (!data.length) return;
    
    // Create Excel-compatible CSV with UTF-8 BOM
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => row[header] ?? '').join('\t')
      )
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // Export HTML element to PDF
  exportToPDF: async (
    elementId: string, 
    filename: string, 
    options: {
      orientation?: 'portrait' | 'landscape';
      title?: string;
      subtitle?: string;
      format?: 'a4' | 'letter';
    } = {}
  ) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento com ID '${elementId}' não encontrado`);
      }

      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1e40af',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
      });

      // Add title and subtitle if provided
      if (options.title) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", 'bold');
        pdf.text(options.title, 20, 20);
        
        if (options.subtitle) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", 'normal');
          pdf.text(options.subtitle, 20, 30);
        }
      }

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginTop = options.title ? 40 : 20;
      const availableHeight = pageHeight - marginTop - 20;
      const availableWidth = pageWidth - 40;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pageWidth - scaledWidth) / 2;
      const y = marginTop;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Add page numbers and date
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
          pageWidth - 60,
          pageHeight - 10
        );
      }

      pdf.save(`${filename}.pdf`);
      return true;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  },

  // Export data to JSON
  exportToJSON: (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // Generate filename with timestamp
  generateFilename: (baseName: string, extension?: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-]/g, '');
    const ext = extension ? `.${extension}` : '';
    return `${baseName}_${timestamp}${ext}`;
  },

  // Show export options modal
  showExportModal: (options: {
    title: string;
    data: any[];
    elementId?: string;
    pdfOptions?: {
      title?: string;
      subtitle?: string;
      orientation?: 'portrait' | 'landscape';
    }
  }) => {
    return new Promise<string>((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
      modal.innerHTML = `
        <div class="bg-blue-900 border border-blue-400/30 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-white text-lg font-semibold mb-4">Exportar Dados</h3>
          <p class="text-blue-300 text-sm mb-6">Escolha o formato de exportação:</p>
          <div class="space-y-3">
            <button data-format="pdf" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              📄 Exportar como PDF
            </button>
            <button data-format="csv" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              📊 Exportar como CSV
            </button>
            <button data-format="excel" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              📈 Exportar como Excel
            </button>
            <button data-format="json" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              🔗 Exportar como JSON
            </button>
            <button data-format="cancel" class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.addEventListener('click', async (e) => {
        const target = e.target as HTMLButtonElement;
        const format = target.getAttribute('data-format');
        
        if (format && format !== 'cancel') {
          const filename = exportUtils.generateFilename(options.title);
          
          try {
            switch (format) {
              case 'pdf':
                if (options.elementId) {
                  await exportUtils.exportToPDF(options.elementId, filename, {
                    ...options.pdfOptions,
                    title: options.pdfOptions?.title || `Relatório - ${options.title}`,
                    subtitle: options.pdfOptions?.subtitle || `Gerado em ${new Date().toLocaleDateString('pt-BR')}`
                  });
                } else {
                  throw new Error('PDF export requires elementId');
                }
                break;
              case 'csv':
                exportUtils.exportToCSV(options.data, filename);
                break;
              case 'excel':
                exportUtils.exportToExcel(options.data, filename);
                break;
              case 'json':
                exportUtils.exportToJSON(options.data, filename);
                break;
            }
            resolve(format);
          } catch (error) {
            console.error('Erro na exportação:', error);
            alert('Erro ao exportar dados. Tente novamente.');
            resolve('error');
          }
        } else {
          resolve('cancel');
        }
        
        document.body.removeChild(modal);
      });
    });
  }
};