export type TemplateRecord = {
  id: string;
  project: string;
  owner: string;
  status: "Backlog" | "In Progress" | "Review" | "Blocked" | "Done";
  priority: "Low" | "Medium" | "High";
  category: string;
  impactScore: number;
  updatedAt: string;
  summary: string;
};
