// import React, { useMemo } from "react";
// import { Card, Skeleton } from "antd";
// import homePage from "../../../assets/allAssets/homePage.png";

// interface VolumeItem {
//   chain: string;
//   [key: string]: any;
// }

// interface VolumeAnalyticsSectionProps {
//   title: string;
//   data: VolumeItem[];
//   loading: boolean;
//   fields: [string, string][];
//   chainSpecificFields?: Record<string, Array<[string, string]>>;
//   isMonetary?: boolean;
//   renderChainIcon: (chain: string) => React.ReactNode;
//   renderChainTitle: (chain: string) => string;
//   renderMetric: (label: string, value: any) => React.ReactNode;
// }

// const VolumeAnalytics: React.FC<VolumeAnalyticsSectionProps> = ({
//   title,
//   data,
//   loading,
//   fields,
//   chainSpecificFields = {},
//   isMonetary = false,
//   renderChainIcon,
//   renderChainTitle,
//   renderMetric,

// }) => {
//   // 🧠 Handle empty state or loading placeholders
//   const fallbackCard = {
//     chain: "N/A",
//     ...Object.fromEntries(fields.map(([_, key]) => [key, 0])),
//   };

//   const finalData = loading ? [1, 2] : data.length > 0 ? data : [fallbackCard];

//   // 🧩 Filter logic for per-chain fields
//   const getFilteredFields = (chain: string, item: any) => {
//     let filteredFields =
//       chain === "worldchain-mainnet"
//         ? fields.filter(([label]) => !label.includes("Swapped"))
//         : fields;

//     filteredFields = filteredFields.filter(([label, key]) => {
//       if (label.includes("Dapp")) {
//         const value = item[key];
//         return value !== undefined && value !== null && Number(value) !== 0;
//       }
//       return true;
//     });

//     return filteredFields;
//   };

//   return (
//     <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
//       <h2 className="text-xl text-white sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b border-gray-200 relative">
//         {title}
//       </h2>

//       <div className="overflow-x-auto px-1 sm:px-0">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-[280px] sm:min-w-[300px]">
//           {finalData.map((item: any, idx: number) => (
//             <Card
//               key={loading ? idx : item.chain}
//               title={
//                 loading ? (
//                   <Skeleton.Input active size="small" />
//                 ) : (
//                   <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-t-xl">
//                     <div className="flex items-center gap-2 sm:gap-3">
//                       {renderChainIcon(item.chain)}
//                       <span className="text-base sm:text-lg font-semibold text-black border-b border-gray-200 truncate">
//                         {renderChainTitle(item.chain)}
//                       </span>
//                     </div>
//                   </div>
//                 )
//               }
//               className="rounded-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 border-2 border-gray-200"
//               style={{
//                 background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 backgroundAttachment: "fixed",
//               }}
//               headStyle={{
//                 padding: 0,
//                 borderTopLeftRadius: "12px",
//                 borderTopRightRadius: "12px",
//                 overflow: "hidden",
//                 borderBottom: "3px solid blue",
//               }}
//               bodyStyle={{
//                 padding: "16px",
//               }}
//             >
//               {loading ? (
//                 <Skeleton active paragraph={{ rows: 4 }} />
//               ) : (
//                 <div className="space-y-2 divide-y">
//                   {getFilteredFields(item.chain, item).map(([label, key]) => (
//                     <div key={label} className="first:pt-0">
//                       {renderMetric(label, item[key])}
//                     </div>
//                   ))}

//                   {chainSpecificFields[item?.chain]?.map(([label, key]) => {
//                     if (label.includes("Dapp")) {
//                       const value = item[key];
//                       if (
//                         value === undefined ||
//                         value === null ||
//                         Number(value) === 0
//                       ) {
//                         return null;
//                       }
//                     }
//                     return (
//                       <div key={label}>
//                         {renderMetric(label, item[key])}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VolumeAnalytics;

import { Card, Skeleton, Image } from "antd";
import { kresusAssets } from "assets";
import { useMemo } from "react";

interface VolumeItem {
  chain: string;
  total_volume: string;
  sent_volume: string;
  received_volume: string;
  swapped_volume: string;
  dapp_volume?: string;
  usdcDepositAmount?: number;
  solDepositAmount?: number;
  usdcWithdrawAmount?: number;
  solWithdrawAmount?: number;
}

interface EarnMetrics {
  totalUsdcVolume: number;
  totalSolVolume: number;
  usdcDepositAmount: number;
  solDepositAmount: number;
  usdcWithdrawAmount: number;
  solWithdrawAmount: number;
}

interface VolumeAnalyticsProps {
  volumeData: VolumeItem[];
  earnMetrics: EarnMetrics;
  loading: boolean;
}

const solanaa = "../../../assets/allAssets/solanaa.png";
const base = "../../../assets/allAssets/base.png";
const worldchain = "../../../assets/allAssets/worldchain.png";
const homePage = "../../../assets/allAssets/homePage.png";

const VolumeAnalytics: React.FC<VolumeAnalyticsProps> = ({
  volumeData,
  earnMetrics,
  loading,
}) => {
  const renderChainTitle = (chain: string) =>
    chain
      .replace("-mainnet", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const renderChainIcon = (chain: string) => {
    switch (chain) {
      case "solana-mainnet":
        return (
          <Image
            src={kresusAssets.solana}
            alt="Solana"
            width={35}
            height={40}
            preview={false}
          />
        );
      case "base-mainnet":
        return (
          <Image
            src={kresusAssets.base}
            alt="Base"
            width={45}
            height={40}
            preview={false}
          />
        );
      case "worldchain-mainnet":
        return (
          <Image
            src={kresusAssets.worldChain}
            width={45}
            height={40}
            alt="WorldChain"
            preview={false}
          />
        );
      default:
        return <span className="text-xl sm:text-2xl">🔗</span>;
    }
  };

  const renderMetric = (label: string, value: number | string) => {
    const icons: Record<string, string> = {
      "Total Volume (USD)": "📊",
      "Sent Volume (USD)": "📤",
      "Received Volume (USD)": "📥",
      "Swapped Volume (USD)": "🔄",
      "Dapp Volume (USD)": "🔄",
      "USDC Deposit (Token Value)": "💵",
      "SOL Deposit (Token Value)": "💎",
      "USDC Withdraw (Token Value)": "💸",
      "SOL Withdraw (Token Value)": "💎",
    };

    const icon = icons[label] || "📌";

    return (
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-1 p-2 sm:p-3 hover:bg-blue-600 hover:text-blue-600 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-gray-100 hover:border-blue-200">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white font-medium">
          <span className="text-lg sm:text-xl transform transition-transform duration-300 hover:scale-110 text-white">
            {icon}
          </span>
          <span className="hover:text-blue-600 transition-colors duration-300 text-white">
            {label}
          </span>
        </div>
        <div className="text-sm sm:text-base lg:text-lg font-semibold break-words text-white hover:text-blue-600 text-right sm:text-left bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          {typeof value === "number"
            ? value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : Number(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
        </div>
      </div>
    );
  };

  const augmentedVolumeData = useMemo(
    () =>
      volumeData.map((v) => {
        if (v.chain === "solana-mainnet") {
          const totalVolume =
            parseFloat(v.total_volume) +
            earnMetrics.totalUsdcVolume +
            earnMetrics.totalSolVolume;
          return {
            ...v,
            total_volume: totalVolume.toString(),
            usdcDepositAmount: earnMetrics.usdcDepositAmount,
            solDepositAmount: earnMetrics.solDepositAmount,
            usdcWithdrawAmount: earnMetrics.usdcWithdrawAmount,
            solWithdrawAmount: earnMetrics.solWithdrawAmount,
          };
        }
        return v;
      }),
    [volumeData, earnMetrics]
  );

  const getFilteredFields = (chain: string, item: any) => {
    const baseFields = [
      ["Total Volume (USD)", "total_volume"],
      ["Sent Volume (USD)", "sent_volume"],
      ["Received Volume (USD)", "received_volume"],
      ["Swapped Volume (USD)", "swapped_volume"],
      ["Dapp Volume (USD)", "dapp_volume"],
    ];

    // Filter out swapped fields for worldchain
    let filteredFields =
      chain === "worldchain-mainnet"
        ? baseFields.filter(([label]) => !label.includes("Swapped"))
        : baseFields;

    // Filter out dapp metrics if they are 0 or undefined
    filteredFields = filteredFields.filter(([label, key]) => {
      if (label.includes("Dapp")) {
        const value = item[key];
        return value !== undefined && value !== null && Number(value) !== 0;
      }
      return true;
    });

    return filteredFields;
  };

  const finalData = loading
    ? [1, 2]
    : augmentedVolumeData.length > 0
    ? augmentedVolumeData
    : [
        {
          chain: "N/A",
          total_volume: 0,
          sent_volume: 0,
          received_volume: 0,
          swapped_volume: 0,
          dapp_volume: 0,
        },
      ];

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <h2 className="text-xl text-white sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b border-gray-200 relative">
        Volume Analytics
      </h2>
      <div className="overflow-x-auto px-1 sm:px-0">
        <div className="grid grid-cols-3 grid-rows-2 gap-6 auto-rows-fr">
          {/* Solana - tall left column */}
          <div className="row-span-2">
            <Card className="!bg-[#0B0B0F] !rounded-[20px] !border-none h-[60vh]">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                {renderChainIcon("solana-mainnet")}
                <span className="text-white font-roboto font-bold text-[20px]">
                  Solana
                </span>
              </div>
              <div className="bg-[#0F0F14] rounded-[16px] px-4 py-3 space-y-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b !border-[#f6f6fa] last:border-none py-2"
                  >
                    <span className="font-inter text-[14px] font-normal text-[#C7C7CC]">
                      Sent Volume (USD)
                    </span>
                    <span className="font-inter text-[14px] font-normal text-[#6C63FF]">
                      7,123,456,789.12
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Base - top right */}
          <div className="col-span-1 row-span-1">
            <Card className="!bg-[#0B0B0F] !rounded-[20px] !border-none h-[30vh]">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                {renderChainIcon("base-mainnet")}
                <span className="text-white font-roboto font-bold text-[20px]">
                  Base
                </span>
              </div>
              <div className="bg-[#0F0F14] rounded-[16px] px-4 py-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-[#1A1A22] last:border-none py-2"
                  >
                    <span className="font-inter text-[14px] font-normal text-[#C7C7CC]">
                      Sent Volume (USD)
                    </span>
                    <span className="font-inter text-[14px] font-normal text-[#6C63FF]">
                      7,123,456,789.12
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sui - middle right */}
          <div className="col-span-1 row-span-1">
            <Card className="!bg-[#0B0B0F] !rounded-[20px] !border-none h-[30vh]">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                {renderChainIcon("sui-mainnet")}
                <span className="text-white font-roboto font-bold text-[20px]">
                  Sui
                </span>
              </div>
              <div className="bg-[#0F0F14] rounded-[16px] px-4 py-3 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-[#1A1A22] last:border-none py-2"
                  >
                    <span className="font-inter text-[14px] font-normal text-[#C7C7CC]">
                      Sent Volume (USD)
                    </span>
                    <span className="font-inter text-[14px] font-normal text-[#6C63FF]">
                      7,123,456,789.12
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Worldchain - full width bottom row */}
          <div className="col-span-2 row-span-1">
            <Card className="!bg-[#0B0B0F] !rounded-[20px] !border-none">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                {renderChainIcon("worldchain-mainnet")}
                <span className="text-white font-roboto font-bold text-[20px]">
                  Worldchain
                </span>
              </div>
              <div className="bg-[#0F0F14] rounded-[16px] px-4 py-3 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-[#1A1A22] last:border-none py-2"
                  >
                    <span className="font-inter text-[14px] font-normal text-[#C7C7CC]">
                      Sent Volume (USD)
                    </span>
                    <span className="font-inter text-[14px] font-normal text-[#6C63FF]">
                      5,987,654,321.45
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeAnalytics;
