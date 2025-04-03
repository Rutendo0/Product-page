import { useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<PaginationProps> = ({ 
  currentPage,
  totalPages,
  onPageChange 
}) => {
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const paginationItems = useMemo(() => {
    // Determine the range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && endPage < totalPages) {
      endPage = Math.min(totalPages, startPage + 4);
    }
    
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const items = [];
    
    // Add first page button if not already in range
    if (startPage > 1) {
      items.push(
        <button
          key="page-1"
          className="px-4 py-2 border-t border-b border-neutral bg-white text-neutral-dark hover:bg-neutral transition-colors"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
      
      // Add ellipsis if needed
      if (startPage > 2) {
        items.push(
          <span
            key="ellipsis-1"
            className="px-4 py-2 border-t border-b border-neutral bg-white text-neutral-dark"
          >
            ...
          </span>
        );
      }
    }
    
    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={`page-${i}`}
          className={`px-4 py-2 border-t border-b border-neutral hover:bg-neutral transition-colors ${
            currentPage === i ? 'bg-primary text-white' : 'bg-white text-neutral-dark'
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // Add last page button if not already in range
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <span
            key="ellipsis-2"
            className="px-4 py-2 border-t border-b border-neutral bg-white text-neutral-dark"
          >
            ...
          </span>
        );
      }
      
      items.push(
        <button
          key={`page-${totalPages}`}
          className="px-4 py-2 border-t border-b border-neutral bg-white text-neutral-dark hover:bg-neutral transition-colors"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex justify-center mt-10">
      <nav className="inline-flex rounded-md shadow">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-l-md border border-neutral bg-white text-neutral-dark hover:bg-neutral disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft />
        </button>
        
        <div className="flex">
          {paginationItems}
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-r-md border border-neutral bg-white text-neutral-dark hover:bg-neutral disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronRight />
        </button>
      </nav>
    </div>
  );
};

export default ProductPagination;
