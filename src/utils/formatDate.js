export const formatDate = (dateStr, monthFormat = "short") =>
  new Date(dateStr).toLocaleDateString(undefined, {
    month: monthFormat,
    year: "numeric",
  });
