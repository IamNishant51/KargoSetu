import { ProcurementDecisionBrief } from "@/components/ProcurementDecisionBrief";

export const metadata = {
  title: "Procurement Decision Brief | KargoSetu",
  description: "View and export the printable procurement decision brief.",
};

export default function BriefPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <ProcurementDecisionBrief />
    </div>
  );
}
