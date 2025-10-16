import { Card, Skeleton, Image } from "antd";
import { useMemo } from "react";

interface TransactionItem {
  chain: string;
  total_transaction: number;
  sent_transaction: number;
  received_transaction: number;
  swapped_transaction: number;
  dapp_transaction?: number;
  usdcDepositCount?: number;
  solDepositCount?: number;
  usdcWithdrawCount?: number;
  solWithdrawCount?: number;
}

interface EarnMetrics {
  totalUsdcTransactions: number;
  totalSolTransactions: number;
  usdcDepositCount: number;
  solDepositCount: number;
  usdcWithdrawCount: number;
  solWithdrawCount: number;
}

interface TransactionAnalyticsProps {
  transactionData: TransactionItem[];
  earnMetrics: EarnMetrics;
  loading: boolean;
}

const solanaa = "../../../assets/allAssets/solanaa.png";
const base = "../../../assets/allAssets/base.png";
const worldchain = "../../../assets/allAssets/worldchain.png";
const homePage = "../../../assets/allAssets/homePage.png";

const TransactionAnalytics: React.FC<TransactionAnalyticsProps> = ({
  transactionData,
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
            src={solanaa}
            alt="Solana"
            width={35}
            height={40}
            preview={false}
          />
        );
      case "base-mainnet":
        return (
          <Image src={base} alt="Base" width={45} height={40} preview={false} />
        );
      case "worldchain-mainnet":
        return (
          <Image
            src={worldchain}
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
      "Total Transactions": "📈",
      Sent: "📤",
      Received: "📥",
      Swapped: "🔄",
      "Dapp Transaction": "📈",
      "USDC Deposit Count": "💵",
      "SOL Deposit Count": "💎",
      "USDC Withdraw Count": "💸",
      "SOL Withdraw Count": "💎",
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
            ? value.toLocaleString()
            : Number(value).toLocaleString()}
        </div>
      </div>
    );
  };

  const augmentedTransactionData = useMemo(
    () =>
      transactionData.map((t) => {
        if (t.chain === "solana-mainnet") {
          const totalTransactions =
            t.total_transaction +
            earnMetrics.totalUsdcTransactions +
            earnMetrics.totalSolTransactions;
          return {
            ...t,
            total_transaction: totalTransactions,
            usdcDepositCount: earnMetrics.usdcDepositCount,
            solDepositCount: earnMetrics.solDepositCount,
            usdcWithdrawCount: earnMetrics.usdcWithdrawCount,
            solWithdrawCount: earnMetrics.solWithdrawCount,
          };
        }
        return t;
      }),
    [transactionData, earnMetrics]
  );

  const getFilteredFields = (chain: string, item: any) => {
    const baseFields = [
      ["Total Transactions", "total_transaction"],
      ["Sent", "sent_transaction"],
      ["Received", "received_transaction"],
      ["Swapped", "swapped_transaction"],
      ["Dapp Transaction", "dapp_transaction"],
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
    : augmentedTransactionData.length > 0
    ? augmentedTransactionData
    : [
        {
          chain: "N/A",
          total_transaction: 0,
          sent_transaction: 0,
          received_transaction: 0,
          swapped_transaction: 0,
          dapp_transaction: 0,
        },
      ];

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <h2 className="text-xl text-white sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b border-gray-200 relative">
        Transaction Analytics
      </h2>
      <div className="overflow-x-auto px-1 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-[280px] sm:min-w-[300px]">
          {finalData?.map((item, idx) => (
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
                padding: "16px sm:20px",
              }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <div className="space-y-2 divide-y">
                  {getFilteredFields(item.chain, item)?.map(([label, key]) => (
                    <div key={label} className="first:pt-0">
                      {renderMetric(label, item[key])}
                    </div>
                  ))}
                  {item.chain === "solana-mainnet" &&
                    [
                      ["USDC Deposit Count", "usdcDepositCount"],
                      ["SOL Deposit Count", "solDepositCount"],
                      ["USDC Withdraw Count", "usdcWithdrawCount"],
                      ["SOL Withdraw Count", "solWithdrawCount"],
                    ].map(([label, key]) => {
                      const value = (item as any)[key];
                      if (
                        value === undefined ||
                        value === null ||
                        Number(value) === 0
                      ) {
                        return null;
                      }
                      return (
                        <div key={label} className="">
                          {renderMetric(label, value)}
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

export default TransactionAnalytics;
