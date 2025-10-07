import React from "react";
import "./styles.css";

interface OverviewProps {
    activeTab: string;
}

const Overview: React.FC<OverviewProps> = ({activeTab}) => {
    console.log(activeTab)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ">
          <p className="text-2xl font-bold text-center">
            Coming Soon...!
          </p>
        </div>
    );
};

export { Overview as default };


