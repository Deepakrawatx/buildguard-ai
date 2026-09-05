export type Project = {
  id: string;
  name: string;
  city: string | null;
  project_type: string | null;
  value_cr: number;
  progress: number;
  planned_progress: number;
  budget_planned_l: number;
  budget_actual_l: number;
  created_at?: string;
};

export function calculateHealth(p: Project) {
  const scheduleGap = Number(p.planned_progress || 0) - Number(p.progress || 0);
  const budgetGap = Number(p.budget_actual_l || 0) - Number(p.budget_planned_l || 0);

  if (scheduleGap >= 8 || (p.budget_planned_l > 0 && budgetGap / p.budget_planned_l >= 0.08)) {
    return { label: "Critical", tone: "red" as const };
  }
  if (scheduleGap >= 3 || budgetGap > 0) {
    return { label: "Watch", tone: "amber" as const };
  }
  return { label: "Healthy", tone: "green" as const };
}

export function projectInsights(p: Project) {
  const insights: string[] = [];
  const scheduleGap = Number(p.planned_progress || 0) - Number(p.progress || 0);
  const budgetGap = Number(p.budget_actual_l || 0) - Number(p.budget_planned_l || 0);

  if (scheduleGap > 0) insights.push(`${p.name} is ${scheduleGap}% behind planned progress.`);
  if (budgetGap > 0) insights.push(`${p.name} is ₹${budgetGap.toFixed(1)}L above the current control budget.`);
  if (!insights.length) insights.push(`${p.name} has no major schedule or budget exception in the current data.`);
  return insights;
}
