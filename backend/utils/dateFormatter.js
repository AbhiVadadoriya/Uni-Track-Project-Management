// Format date to DD/MM/YYYY
export const formatDateDDMMYYYY = (date) => {
    if (!date) return null;
    
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
};

// Format all date fields in the document
export const formatDeadlineDates = (deadline) => {
    if (!deadline) return null;
    
    const formatted = deadline.toObject ? deadline.toObject() : { ...deadline };
    
    if (formatted.dueDate) {
        formatted.dueDate = formatDateDDMMYYYY(formatted.dueDate);
    }
    if (formatted.updatedAt) {
        formatted.updatedAt = formatDateDDMMYYYY(formatted.updatedAt);
    }
    if (formatted.createdAt) {
        formatted.createdAt = formatDateDDMMYYYY(formatted.createdAt);
    }
    
    return formatted;
};

// Format an array of deadlines
export const formatDeadlinesDates = (deadlines) => {
    return deadlines.map(deadline => formatDeadlineDates(deadline));
};
