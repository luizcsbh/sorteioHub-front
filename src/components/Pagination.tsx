import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemName = 'itens',
  className = '',
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calcula quais números de página exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-white/70 ${className}`}
    >
      {/* Resumo e Seletor de Tamanho */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Exibindo <strong className="text-white font-bold">{startItem}</strong> a{' '}
          <strong className="text-white font-bold">{endItem}</strong> de{' '}
          <strong className="text-yellow-400 font-bold">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-white/40">Por pág:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-900 border border-white/20 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center space-x-1">
        {/* Primeira Página */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Primeira página"
          className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Página Anterior */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Página anterior"
          className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números das Páginas */}
        <div className="flex items-center space-x-1 px-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-lg font-bold transition text-xs flex items-center justify-center cursor-pointer ${
                  currentPage === p
                    ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 hover:text-white'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-white/40 select-none">
                {p}
              </span>
            )
          )}
        </div>

        {/* Próxima Página */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Próxima página"
          className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Última Página */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Última página"
          className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
