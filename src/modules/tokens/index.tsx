import React, { useState } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import FooterAntD from "layout/footer";
import MenuAntD from "layout/menu";
import ActiveTokens from "./components/ActiveTokens";
import SpamTokens from "./components/SpamTokens";
import "./components/styles.css";
import homePage from "../../../src/assets/allAssets/homePage.png";
import SpamMechanism from "./components/SpamMechanism";
import Overview from "./components/Overview";

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("active");

  const items: TabsProps["items"] = [
    {
      key: "active",
      label: "Active Tokens",
      children: <ActiveTokens activeTab={activeTab} />,
    },
    {
      key: "spam",
      label: "Spam Tokens",
      children: <SpamTokens activeTab={activeTab} />,
    },
    {
      key: "spam-mechanism",
      label: "Spam Mechanism",
      children: <SpamMechanism activeTab={activeTab} />,
    },
    {
      key: "overview",
      label: "Overview",
      children: <Overview activeTab={activeTab} />,
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <MenuAntD />

      {/* Main Content */}

          <div className=" flex flex-col px-[10px] sm:[px-20px] md:[px-40px] lg:[px-120px]">
            {/* Title Row */}
            <div className="my-14">
              <h1 className="font-roboto font-medium text-[20px] sm:text-[32px] leading-[100%] tracking-[0]  align-middle text-[#FFFFFF] sm:mx-20">
                Token Management
              </h1>
            </div>

            {/* Dropdown Row */}

            {/* Tabs */}
            <div className="px-4 sm:px-6 mt-2 lg:px-8  ">
              <Tabs
                defaultActiveKey="active"
                items={items}
                className="custom-tabss  "
                size="large"
                onChange={handleTabChange}
                tabBarStyle={{
                  background: "#000000",
                  borderRadius: "40px",
                  marginBottom: "2rem",
                  marginLeft:"100px",
                  marginRight:"100px"
                }}
                tabBarGutter={16}
              />
            </div>
          </div>
      

      {/* Footer */}
      <div className="mt-auto">
        <FooterAntD />
      </div>
    </div>
  );
};

export default Index;
