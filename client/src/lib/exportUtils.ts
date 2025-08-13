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

  // Show export modal with options
  showExportModal: (options: {
    title: string;
    data: any[];
    pdfElementId?: string;
    elementId?: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Exportar Dados</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">${options.title}</p>
            <div class="space-y-3">
              <button id="export-csv" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Exportar CSV
              </button>
              <button id="export-excel" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Exportar Excel
              </button>
              <button id="export-pdf" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Exportar PDF
              </button>
              <button id="export-json" class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                Exportar JSON
              </button>
            </div>
            <button id="export-cancel" class="w-full mt-4 px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
          </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
          document.body.removeChild(modal);
        };

        // CSV Export
        document.getElementById('export-csv')?.addEventListener('click', () => {
          exportUtils.exportToCSV(options.data, options.title);
          closeModal();
          resolve();
        });

        // Excel Export
        document.getElementById('export-excel')?.addEventListener('click', () => {
          exportUtils.exportToExcel(options.data, options.title);
          closeModal();
          resolve();
        });

        // PDF Export
        document.getElementById('export-pdf')?.addEventListener('click', async () => {
          const elementId = options.pdfElementId || options.elementId;
          if (elementId) {
            try {
              await exportUtils.exportToPDF(elementId, options.title, {
                title: options.title,
                orientation: 'landscape'
              });
            } catch (error) {
              console.warn('PDF export failed, falling back to CSV:', error);
              exportUtils.exportToCSV(options.data, options.title);
            }
          } else {
            exportUtils.exportToCSV(options.data, options.title);
          }
          closeModal();
          resolve();
        });

        // JSON Export
        document.getElementById('export-json')?.addEventListener('click', () => {
          exportUtils.exportToJSON(options.data, options.title);
          closeModal();
          resolve();
        });

        // Cancel
        document.getElementById('export-cancel')?.addEventListener('click', () => {
          closeModal();
          resolve();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal();
            resolve();
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }
};