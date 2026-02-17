const formatZodErrors = (issues: any[]) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

export default formatZodErrors;
