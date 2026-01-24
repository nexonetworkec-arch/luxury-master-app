
import { useState, useMemo } from 'react';

interface FilterOptions<T> {
  data: T[];
  searchKeys: (keyof T | string)[]; // Soporta claves anidadas tipo 'leadData.nombre'
  dateKey: keyof T;
}

export function useFilteredData<T>({ data, searchKeys, dateKey }: FilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Búsqueda por texto
      const term = searchTerm.toLowerCase();
      const matchesSearch = term === '' || searchKeys.some(key => {
        const val = typeof key === 'string' ? getNestedValue(item, key) : item[key];
        return String(val || '').toLowerCase().includes(term);
      });
      if (!matchesSearch) return false;

      // 2. Filtro de Fechas
      const timestamp = item[dateKey];
      if (startDate || endDate) {
        const itemDate = new Date(timestamp as any);
        if (isNaN(itemDate.getTime())) return false;

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, startDate, endDate, searchKeys, dateKey]);

  const exportCSV = (filename: string, headers: string[], rowMapper: (item: T) => string[]) => {
    const rows = filteredData.map(item => {
      const dataRow = rowMapper(item).map(val => `"${String(val || '').replace(/"/g, '""')}"`);
      return dataRow.join(",");
    });
    
    const csv = "\ufeff" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    filteredData,
    searchTerm, setSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    exportCSV
  };
}
