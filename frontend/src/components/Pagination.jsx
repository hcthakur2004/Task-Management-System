function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="button button--ghost"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        type="button"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="button button--ghost"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
