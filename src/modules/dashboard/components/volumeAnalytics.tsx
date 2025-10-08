import React, { useMemo } from "react";
import { Card, Skeleton } from "antd";
import homePage from "../../../assets/allAssets/homePage.png";

interface VolumeItem {
  chain: string;
  [key: string]: any;
}

interface VolumeAnalyticsSectionProps {
  title: string;
  data: VolumeItem[];
  loading: boolean;
  fields: [string, string][];
  chainSpecificFields?: Record<string, Array<[string, string]>>;
  isMonetary?: boolean;
  renderChainIcon: (chain: string) => React.ReactNode;
  renderChainTitle: (chain: string) => string;
  renderMetric: (label: string, value: any) => React.ReactNode;
}

const VolumeAnalytics: React.FC<VolumeAnalyticsSectionProps> = ({
  title,
  data,
  loading,
  fields,
  chainSpecificFields = {},
  isMonetary = false,
  renderChainIcon,
  renderChainTitle,
  renderMetric,
  
}) => {
  // 🧠 Handle empty state or loading placeholders
  const fallbackCard = {
    chain: "N/A",
    ...Object.fromEntries(fields.map(([_, key]) => [key, 0])),
  };

  const finalData = loading ? [1, 2] : data.length > 0 ? data : [fallbackCard];

  // 🧩 Filter logic for per-chain fields
  const getFilteredFields = (chain: string, item: any) => {
    let filteredFields =
      chain === "worldchain-mainnet"
        ? fields.filter(([label]) => !label.includes("Swapped"))
        : fields;

    filteredFields = filteredFields.filter(([label, key]) => {
      if (label.includes("Dapp")) {
        const value = item[key];
        return value !== undefined && value !== null && Number(value) !== 0;
      }
      return true;
    });

    return filteredFields;
  };

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <h2 className="text-xl text-white sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b border-gray-200 relative">
        {title}
      </h2>

      <div className="overflow-x-auto px-1 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-[280px] sm:min-w-[300px]">
          {finalData.map((item: any, idx: number) => (
            <Card
              key={loading ? idx : item.chain}
              title={
                loading ? (
                  <Skeleton.Input active size="small" />
                ) : (
                  <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-t-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {renderChainIcon(item.chain)}
                      <span className="text-base sm:text-lg font-semibold text-black border-b border-gray-200 truncate">
                        {renderChainTitle(item.chain)}
                      </span>
                    </div>
                  </div>
                )
              }
              className="rounded-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 border-2 border-gray-200"
              style={{
                background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }}
              headStyle={{
                padding: 0,
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                overflow: "hidden",
                borderBottom: "3px solid blue",
              }}
              bodyStyle={{
                padding: "16px",
              }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <div className="space-y-2 divide-y">
                  {getFilteredFields(item.chain, item).map(([label, key]) => (
                    <div key={label} className="first:pt-0">
                      {renderMetric(label, item[key])}
                    </div>
                  ))}

                  {chainSpecificFields[item?.chain]?.map(([label, key]) => {
                    if (label.includes("Dapp")) {
                      const value = item[key];
                      if (
                        value === undefined ||
                        value === null ||
                        Number(value) === 0
                      ) {
                        return null;
                      }
                    }
                    return (
                      <div key={label}>
                        {renderMetric(label, item[key])}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolumeAnalytics;
