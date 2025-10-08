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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <MenuAntD />

      {/* Main Content */}
      <div
        className="flex-grow w-full  sm:py-8"
        style={{
          background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="bg-white  mx-4 sm:mx-6 lg:mx-8"
          style={{
            background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="w-full">
            {/* Title Row */}
            <div className="my-14">
              <h1 className="font-roboto font-medium text-[32px] leading-[100%] tracking-[0]  align-middle text-[#FFFFFF] sm:mx-20">
                Token Management
              </h1>
            </div>

            {/* Dropdown Row */}

            {/* Tabs */}
            <div className="px-4 sm:px-6 mt-2 lg:px-8 mx-8 ">
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
