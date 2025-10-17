import React from "react";
import MonthlyActive from "./components/monthlyActive";
import MenuAntD from "layout/menu";
import FooterAntD from "layout/footer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen px-120px">

      <MenuAntD />
      <MonthlyActive />
      <FooterAntD />
    </div>
  );
};

export default Index;
