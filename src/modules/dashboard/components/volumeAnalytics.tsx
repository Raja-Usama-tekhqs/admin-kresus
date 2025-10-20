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
            width={32}
            height={32}
            preview={false}
          />
        );
      case "base-mainnet":
        return (
          <Image
            src={kresusAssets.base}
            alt="Base"
            width={32}
            height={32}
            preview={false}
          />
        );
      case "worldchain-mainnet":
        return (
          <Image
            src={kresusAssets.worldChain}
            width={32}
            height={32}
            alt="WorldChain"
            preview={false}
          />
        );
      default:
        return <img src={kresusAssets?.sui} alt="" width={32} height={32} />;
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

  // Add chain-specific fields for Solana
  if (chain === "solana-mainnet") {
    const solanaSpecificFields = [
      ["USDC Deposit (Token Value)", "usdcDepositAmount"],
      ["SOL Deposit (Token Value)", "solDepositAmount"],
      ["USDC Withdraw (Token Value)", "usdcWithdrawAmount"],
      ["SOL Withdraw (Token Value)", "solWithdrawAmount"],
    ];
    
    // Add all solana specific fields to filteredFields
    solanaSpecificFields.forEach(field => {
      filteredFields.push(field);
    });
  }

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
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 mt-2 sm:mt-7">
      <div className="overflow-x-auto px-1 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-auto">
          {finalData?.map((item, idx) => {
            // Determine sizing based on chain name
            const isSolana = item.chain === "solana-mainnet";
            const isWorldchain = item.chain === "worldchain-mainnet";

            return (
              <div
                key={loading ? idx : item.chain}
                className={`
          ${isSolana ? "lg:row-span-2" : ""}
          ${isWorldchain ? "lg:col-span-2" : ""}
        `}
              >
                <Card
                  title={
                    loading ? (
                      <Skeleton.Input active size="small" />
                    ) : (
                      <div
                        className={`flex  ${
                          isWorldchain ? "flex-row items-center" : "flex-col"
                        }  gap-2 ps-[2px]`}
                      >
                        {renderChainIcon(item?.chain)}
                        <span className="font-roboto font-medium text-[20px] sm:text-[32px] leading-[100%] tracking-[0] capitalize text-[#FFFFFF]">
                          {renderChainTitle(item?.chain)}
                        </span>
                      </div>
                    )
                  }
                  className="!bg-[#161616] !border-none !shadow-none !rounded-[24px] !p-[24px]  h-full"
                  headStyle={{
                    background: "transparent",
                    borderBottom: "none",
                  }}
                  // bodyStyle={{
                  //   padding: "0 16px 16px 16px",
                  // }}
                >
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                  ) : (
                    <div className="bg-[#000000] rounded-[24px] px-5  ">
                      {getFilteredFields(item.chain, item)?.map(
                        ([label, key]) => (
                          <div
                            key={label}
                            className="flex justify-between gap-[18px] items-center card-border-bottom  py-5"
                          >
                            <span className="font-roboto font-normal text-[12px] sm:text-[16px] leading-[100%] tracking-[0px] text-[#C7C7CC]">
                              {label}
                            </span>
                            <span className="ont-roboto font-normal text-[12px] sm:text-[16px] leading-[100%] tracking-[0px] text-right text-[#7654FE]">
                              {Number(item[key]).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VolumeAnalytics;
