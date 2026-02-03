import DashboardLayout from "../layouts/DashboardLayout";
import ProfissionaisHeader from "../components/Profissionais/ProfissionaisHeader";
import ProfissionaisTable from "../components/Profissionais/ProfissionaisTable";
import { useState } from "react";

export default function Profissionais() {
  const [total, setTotal] = useState(0);
  return (
    <DashboardLayout>
      <ProfissionaisHeader total={total} />
      <ProfissionaisTable onTotalChange={setTotal}/>
    </DashboardLayout>
  );
}
