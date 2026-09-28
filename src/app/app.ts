import { ChangeDetectionStrategy, Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div dir="rtl" class="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 class="text-3xl font-bold text-indigo-700 mb-2">مكتشف السجلات المكررة</h1>
          <p class="text-gray-500">قم برفع ملف Excel (XLSX) للبحث عن الأسماء أو السجلات المكررة بناءً على معاييرك</p>
        </div>

        <!-- File Upload Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="flex flex-col items-center justify-center w-full">
            <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-40 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-10 h-10 mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p class="mb-2 text-sm text-gray-700"><span class="font-semibold">اضغط لرفع الملف</span> أو قم بالسحب والإفلات</p>
                <p class="text-xs text-gray-500">XLSX, XLS (جدول بيانات إكسيل)</p>
              </div>
              <input id="dropzone-file" type="file" class="hidden" accept=".xlsx, .xls" (change)="onFileChange($event)" />
            </label>
          </div>

          @if (fileName()) {
            <div class="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              تم رفع الملف بنجاح: <strong>{{ fileName() }}</strong>
            </div>
          }
        </div>

        @if (headers().length > 0) {
          <!-- Criteria Selection -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">اختر معايير التكرار</h2>
            <p class="text-sm text-gray-500 mb-4">حدد الأعمدة التي تريد استخدامها للبحث عن السجلات المكررة (مثال: المعرف، اسم الطالب).</p>

            <div class="flex flex-wrap gap-3">
              @for (header of headers(); track header) {
                <label class="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all select-none"
                       [class.bg-indigo-50]="selectedColumns().includes(header)"
                       [class.border-indigo-400]="selectedColumns().includes(header)">
                  <input type="checkbox"
                         class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                         [checked]="selectedColumns().includes(header)"
                         (change)="toggleColumn(header)">
                  <span class="text-sm font-medium text-gray-700">{{ header }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Preview Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">معاينة البيانات (أول 5 سجلات)</h2>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm text-right text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    @for (header of headers(); track header) {
                      <th scope="col" class="px-6 py-3 whitespace-nowrap">{{ header }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of previewData(); track $index) {
                    <tr class="bg-white border-b border-gray-100 hover:bg-gray-50">
                      @for (header of headers(); track header) {
                        <td class="px-6 py-4 whitespace-nowrap">{{ row[header] !== undefined ? row[header] : '-' }}</td>
                      }
                    </tr>
                  }
                  @if (previewData().length === 0) {
                    <tr>
                      <td [colSpan]="headers().length" class="px-6 py-8 text-center text-gray-500">لا توجد بيانات للعرض</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Duplicates Results Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-800">السجلات المكررة</h2>
              <span class="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {{ duplicates().length }} مجموعات مكررة
              </span>
            </div>

            @if (selectedColumns().length === 0) {
              <div class="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-100">
                يرجى تحديد عمود واحد على الأقل من الأعلى للبحث عن التكرارات.
              </div>
            } @else if (duplicates().length === 0) {
              <div class="p-8 text-center bg-green-50 rounded-xl border border-green-100">
                <svg class="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-green-800 font-medium text-lg">لا توجد سجلات مكررة بناءً على المعايير المحددة!</p>
              </div>
            } @else {
              <div class="space-y-6">
                @for (group of duplicates(); track group.key; let i = $index) {
                  <div class="border border-red-100 rounded-xl overflow-hidden shadow-sm">
                    <div class="bg-red-50 px-6 py-3 border-b border-red-100 flex justify-between items-center">
                      <div class="font-medium text-red-800 text-sm flex gap-2">
                        <span>قيمة التكرار:</span>
                        <span class="font-bold bg-white px-2 rounded border border-red-200">{{ group.displayKey }}</span>
                      </div>
                      <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">مكرر {{ group.count }} مرات</span>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm text-right text-gray-600">
                        <thead class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th class="px-4 py-2 w-12 text-center">#</th>
                            @for (header of headers(); track header) {
                              <th class="px-4 py-2 whitespace-nowrap">{{ header }}</th>
                            }
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of group.rows; track $index) {
                            <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td class="px-4 py-3 text-center text-gray-400">{{ $index + 1 }}</td>
                              @for (header of headers(); track header) {
                                <td class="px-4 py-3 whitespace-nowrap">{{ row[header] !== undefined ? row[header] : '-' }}</td>
                              }
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class App implements OnInit {
  // Signals for state management
  fileName = signal<string | null>(null);
  headers = signal<string[]>([]);
  previewData = signal<any[]>([]);
  fullData = signal<any[]>([]);
  selectedColumns = signal<string[]>([]);

  // SheetJS instance
  private XLSX: any;

  constructor() {
    // Effect to save selected columns to local storage whenever they change
    effect(() => {
      const selected = this.selectedColumns();
      localStorage.setItem('duplicateFinderSelectedColumns', JSON.stringify(selected));
    });
  }

  ngOnInit() {
    this.loadXlsxLibrary();
    this.loadSavedSelection();
  }

  private loadSavedSelection() {
    const saved = localStorage.getItem('duplicateFinderSelectedColumns');
    if (saved) {
      try {
        this.selectedColumns.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved columns', e);
      }
    }
  }

  private loadXlsxLibrary() {
    // Dynamically load the SheetJS library from CDN to ensure standalone functionality
    if ((window as any).XLSX) {
      this.XLSX = (window as any).XLSX;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => {
      this.XLSX = (window as any).XLSX;
    };
    document.head.appendChild(script);
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file || !this.XLSX) return;

    this.fileName.set(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = this.XLSX.read(data, { type: 'array' });

      // Assume the first sheet is the one we want
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Extract headers explicitly
      const rawData: any[][] = this.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rawData.length > 0) {
        // Find the first non-empty row to act as header
        let headerRowIndex = 0;
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i] && rawData[i].length > 0) {
            headerRowIndex = i;
            break;
          }
        }

        const extractedHeaders = (rawData[headerRowIndex] || []).map((h: any) => String(h).trim()).filter((h: string) => h.length > 0);

        // Remove duplicates in headers if they exist to prevent mapping issues
        const uniqueHeaders = [...new Set(extractedHeaders)];
        this.headers.set(uniqueHeaders as string[]);

        // Extract complete data as an array of objects mapping to headers
        // Start from the row after headers
        const jsonData = this.XLSX.utils.sheet_to_json(worksheet, {
           range: headerRowIndex + 1,
           header: uniqueHeaders,
           defval: '' // Default empty values to empty string
        });

        this.fullData.set(jsonData);
        this.previewData.set(jsonData.slice(0, 5));
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset file input so the same file can be selected again if needed
    target.value = '';
  }

  toggleColumn(column: string) {
    const current = this.selectedColumns();
    if (current.includes(column)) {
      this.selectedColumns.set(current.filter(c => c !== column));
    } else {
      this.selectedColumns.set([...current, column]);
    }
  }

  // Computed signal that automatically recalculates duplicates when data or selection changes
  duplicates = computed(() => {
    const cols = this.selectedColumns();
    const data = this.fullData();

    if (cols.length === 0 || data.length === 0) {
      return [];
    }

    // Map to store groups of rows by their composite key
    const groups = new Map<string, any[]>();

    for (const row of data) {
      // Create a composite key based on selected criteria
      // Uses a unique delimiter '|||' to prevent accidental matches
      const compositeKey = cols.map(c => {
        const val = row[c];
        return val !== undefined && val !== null ? String(val).trim().toLowerCase() : '';
      }).join('|||');

      if (!groups.has(compositeKey)) {
        groups.set(compositeKey, []);
      }
      groups.get(compositeKey)!.push(row);
    }

    const duplicatesResult = [];
    for (const [key, rows] of groups.entries()) {
      if (rows.length > 1) {
        // Create a display-friendly key replacing the separator
        const displayKey = cols.map(c => {
           const val = rows[0][c];
           return val !== undefined && val !== null ? String(val) : '-';
        }).join(' - ');

        duplicatesResult.push({
          key,
          displayKey,
          count: rows.length,
          rows
        });
      }
    }

    // Sort by most repeated first
    return duplicatesResult.sort((a, b) => b.count - a.count);
  });
}
