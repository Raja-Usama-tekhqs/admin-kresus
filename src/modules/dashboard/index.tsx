import React from "react";
// import AnalyticsHolding from "./components/analyticsHolding";
import MonthlyActive from "./components/monthlyActive";
import MenuAntD from "layout/menu";
import FooterAntD from "layout/footer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen px-120px">
      {/* <div className="static h-20 bg-[#000000] flex justify-between items-center  shadow-sm px-[120px]">
          <MenuAntD />
        </div> */}
      <MenuAntD />
      <MonthlyActive />
      {/* <AnalyticsHolding /> */}
      <FooterAntD />
    </div>
  );
};

export default Index;
