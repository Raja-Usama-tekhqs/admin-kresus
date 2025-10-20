// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  DatePicker,
  message,
  Select,
  Skeleton,
  Image,
  Tabs,
  TabsProps,
  Dropdown,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import useApiClient from "hooks/useApiClient";
import "./index.css";
import classNames from "classnames";
const { Option } = Select;
import solanaa from "../../../assets/allAssets/solanaa.png";
import base from "../../../assets/allAssets/base.png";
import worldchain from "../../../assets/allAssets/worldchain.png";
import homePage from "../../../assets/allAssets/homePage.png";
import { FcCalendar } from "react-icons/fc";
import { kresusAssets } from "assets";
import AnalyticsHolding from "./analyticsHolding";
import VolumeAnalytics from "./volumeAnalytics";
import TransactionAnalytics from "./transactionAnalytics";
interface VolumeItem {
  chain: string;
  total_volume: string;
  sent_volume: string;
  received_volume: string;
  swapped_volume: string;
}

interface TransactionItem {
  chain: string;
  total_transaction: number;
  sent_transaction: number;
  received_transaction: number;
  swapped_transaction: number;
}

interface ActiveUserResponse {
  monthlyActiveUsers: number;
  weeklyActiveUsers: number;
  dailyActiveUsers: number;
  filteredActiveUsers: number;
}

interface FormState {
  chain?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
}

interface EarnItem {
  token_in?: string;
  token_out?: string;
  count: string;
  total_deposit?: string;
  total_withdraw?: string;
}

interface EarnResponse {
  deposit: EarnItem[];
  withdraw: EarnItem[];
}

const chainOptions = [
  // { label: "All chains", value: "" },
  { label: "Solana Mainnet", value: "solana-mainnet" },
  { label: "Base Mainnet", value: "base-mainnet" },
  { label: "WorldChain Mainnet", value: "worldchain-mainnet" },
];

const addressOptions = [
  { label: "Select Your Address", value: "" },
  {
    label: "0x10d543e2e0355e36c5cab769df8d2d60abb77a73",
    value: "0x10d543e2e0355e36c5cab769df8d2d60abb77a73",
  },
  {
    label: "0x20d543e2e0355e36c5cab769df8d2d60abb77a73",
    value: "0x20d543e2e0355e36c5cab769df8d2d60abb77a73",
  },
  {
    label: "0x20d543e2e0355e36c5cab769df8d2d60abb77a74",
    value: "0x20d543e2e0355e36c5cab769df8d2d60abb77a74",
  },
];

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";

const MonthlyActive = () => {
  const [form, setForm] = useState<FormState>({});
  const [volumeData, setVolumeData] = useState<VolumeItem[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionItem[]>([]);
  const [earnData, setEarnData] = useState<EarnResponse>({
    deposit: [],
    withdraw: [],
  });
  const [activeTab, setActiveTab] = useState<string>("active");

  const [activeUserStats, setActiveUserStats] =
    useState<ActiveUserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getRequest } = useApiClient();
  const [dateError, setDateError] = useState<string | null>(null);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateDates = (
    startDate: string | undefined,
    endDate: string | undefined
  ): boolean => {
    if (!startDate || !endDate) return true;
    return dayjs(endDate).isAfter(dayjs(startDate));
  };

  const handleDateChange = (
    name: "start_date" | "end_date",
    date: Dayjs | null
  ) => {
    const newDate = date ? date.format("YYYY-MM-DD") : undefined;

    setDateError(null);

    const otherDate = name === "start_date" ? form.end_date : form.start_date;

    if (newDate && otherDate) {
      if (name === "end_date" && !validateDates(otherDate, newDate)) {
        setDateError("End date must be after the start date");
        return;
      } else if (name === "start_date" && !validateDates(newDate, otherDate)) {
        setDateError("End date must be after the start date");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: newDate,
    }));
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { start_date, end_date } = form;
    const commonParams = Object.fromEntries(
      Object.entries({ ...form }).filter(([_, val]) => val?.trim() !== "")
    );
    const dateOnlyParams = { start_date, end_date };
    const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;
    try {
      const [volumeRes, transactionRes, earnRes, activeRes] = await Promise.all(
        [
          getRequest<{ volume: VolumeItem[] }>(
            `${vaultURL}analytics/volume`,
            commonParams
          ),
          getRequest<{ transaction: TransactionItem[] }>(
            `${vaultURL}analytics/transaction`,
            commonParams
          ),
          getRequest<EarnResponse>(`${vaultURL}analytics/earn`, commonParams),
          getRequest<ActiveUserResponse>(
            `${vaultURL}analytics/monthly-active`,
            dateOnlyParams
          ),
        ]
      );

      setVolumeData(volumeRes.volume || []);
      setTransactionData(transactionRes.transaction || []);
      setEarnData(earnRes || { deposit: [], withdraw: [] });
      setActiveUserStats(activeRes || null);
      // message.success("Analytics data loaded successfully");
    } catch (err) {
      console.error("Error fetching analytics data", err);
      message.error("Error fetching analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchAllData, 500);
    return () => clearTimeout(debounce);
  }, [form]);

  const earnMetrics = useMemo(() => {
    const usdcDeposit = earnData.deposit.find((e) => e.token_in === USDC_MINT);
    const solDeposit = earnData.deposit.find((e) => e.token_in === SOL_MINT);
    const usdcWithdraw = earnData.withdraw.find(
      (e) => e.token_out === USDC_MINT
    );
    const solWithdraw = earnData.withdraw.find((e) => e.token_out === SOL_MINT);

    return {
      usdcDepositAmount: usdcDeposit
        ? parseFloat(usdcDeposit.total_deposit!)
        : 0,
      solDepositAmount: solDeposit ? parseFloat(solDeposit.total_deposit!) : 0,
      usdcDepositCount: usdcDeposit ? parseInt(usdcDeposit.count) : 0,
      solDepositCount: solDeposit ? parseInt(solDeposit.count) : 0,
      usdcWithdrawAmount: usdcWithdraw
        ? parseFloat(usdcWithdraw.total_withdraw!)
        : 0,
      solWithdrawAmount: solWithdraw
        ? parseFloat(solWithdraw.total_withdraw!)
        : 0,
      usdcWithdrawCount: usdcWithdraw ? parseInt(usdcWithdraw.count) : 0,
      solWithdrawCount: solWithdraw ? parseInt(solWithdraw.count) : 0,
      totalUsdcVolume:
        (usdcDeposit ? parseFloat(usdcDeposit.total_deposit!) : 0) +
        (usdcWithdraw ? parseFloat(usdcWithdraw.total_withdraw!) : 0),
      totalSolVolume:
        (solDeposit ? parseFloat(solDeposit.total_deposit!) : 0) +
        (solWithdraw ? parseFloat(solWithdraw.total_withdraw!) : 0),
      totalUsdcTransactions:
        (usdcDeposit ? parseInt(usdcDeposit.count) : 0) +
        (usdcWithdraw ? parseInt(usdcWithdraw.count) : 0),
      totalSolTransactions:
        (solDeposit ? parseInt(solDeposit.count) : 0) +
        (solWithdraw ? parseInt(solWithdraw.count) : 0),
    };
  }, [earnData]);

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
      "Total Volume (USD)": "📊",
      "Sent Volume (USD)": "📤",
      "Received Volume (USD)": "📥",
      "Swapped Volume (USD)": "🔄",
      "Dapp Volume (USD)": "🔄",
      "Dapp Transaction": "📈",
      "Total Transactions": "📈",
      Sent: "📤",
      Received: "📥",
      Swapped: "🔄",
      "USDC Deposit (Token Value)": "💵",
      "SOL Deposit (Token Value)": "💎",
      "USDC Withdraw (Token Value)": "💸",
      "SOL Withdraw (Token Value)": "💎",
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
        <div className="text-sm sm:text-base lg:text-lg font-semibold  break-words text-white hover:text-blue-600 text-right sm:text-left bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
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

  const renderCardSection = (
    title: string,
    data: any[],
    fields: [string, string][],
    chainSpecificFields: Record<string, Array<[string, string]>> = {},
    _isMonetary: boolean = false
  ) => {
    const fallbackCard = {
      chain: "N/A",
      ...Object.fromEntries(fields.map(([_, key]) => [key, 0])),
    };
    const finalData = loading
      ? [1, 2]
      : data.length > 0
      ? data
      : [fallbackCard];

    const getFilteredFields = (chain: string, item: any) => {
      // First filter out swapped fields for worldchain
      let filteredFields =
        chain === "worldchain-mainnet"
          ? fields.filter(([label]) => !label.includes("Swapped"))
          : fields;

      // Then filter out dapp metrics if they are 0 or undefined
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
        <h2 className="text-xl text-white sm:text-2xl font-bold  mb-4 sm:mb-6 pb-2 border-b border-gray-200 relative ">
          {title}
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
                    {getFilteredFields(item.chain, item)?.map(
                      ([label, key]) => (
                        <div key={label} className="first:pt-0">
                          {renderMetric(label, item[key])}
                        </div>
                      )
                    )}
                    {chainSpecificFields[item?.chain]?.map(([label, key]) => {
                      // Also filter out dapp metrics from chain specific fields
                      if (label.includes("Dapp")) {
                        const value = (item as any)[key];
                        if (
                          value === undefined ||
                          value === null ||
                          Number(value) === 0
                        ) {
                          return null;
                        }
                      }
                      return (
                        <div key={label} className="">
                          {renderMetric(label, (item as any)[key])}
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

  const items: TabsProps["items"] = [
    {
      key: "active",
      label: "Holding Analytics",
      children: <AnalyticsHolding activeTab={activeTab} />,
    },
    {
      key: "volume",
      label: "Volume Analytics",
      children: (
        <VolumeAnalytics
          volumeData={volumeData}
          earnMetrics={earnMetrics}
          loading={loading}
        />
      ),
    },
    {
      key: "transaction",
      label: "Transactions Analytics",
      children: (
        <TransactionAnalytics
          transactionData={transactionData}
          earnMetrics={earnMetrics}
          loading={loading}
        />
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
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

  const renderActiveUserCard = () => (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 bg-[#161616]  p-[24px] rounded-[24px] ">
      <Card
        style={
          {
            // background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
            // backgroundSize: "cover",
            // backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
            // backgroundAttachment: "fixed",
          }
        }
      >
        {loading || !activeUserStats ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-4  text-white">
            {[
              {
                label: "Monthly Active",
                icon: kresusAssets.calendar,
                value: activeUserStats.monthlyActiveUsers,
              },
              {
                label: "Weekly Active",
                icon: kresusAssets.weeklyActiveCalendar,
                value: activeUserStats.weeklyActiveUsers,
              },
              {
                label: "Daily Active",
                icon: kresusAssets.dailyActiveIcon,
                value: activeUserStats.dailyActiveUsers,
              },
              {
                label: "Filtered Users",
                icon: kresusAssets.filteredUserIcon,
                value: activeUserStats.filteredActiveUsers,
              },
            ].map((metric, index) =>
              index === 0 ? (
                // ✅ Custom gradient card for Monthly Active
                <div
                  key={metric?.label}
                  className="bg-[linear-gradient(314.39deg,#0734A9_0%,#0E1696_53.42%,#4B0792_98.92%)]  gap-[16px] opacity-100 rounded-[16px] px-[64px] py-[32px]"
                >
                  <div className="flex justify-center items-center gap-5">
                    <div className="w-[72px] h-[72px]">
                      <img src={metric.icon} className="w-[72px] h-[72px]" />
                    </div>
                    <div className="flex flex-col gap-5">
                      <div>
                        <span className="font-roboto font-semibold text-[56px] leading-[100%] tracking-[0%]">
                          {metric?.value?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-roboto font-normal text-[20px] leading-[100%] tracking-[0%] text-[#AEAEB2]">
                          {metric?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={metric?.label}
                  className=" opacity-100 rounded-[16px] px-[16px] py-[32px] bg-[#000000] flex flex-col items-center gap-2"
                >
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 transform transition-transform duration-300 hover:scale-110 text-white flex justify-center items-center">
                    <img src={metric.icon} alt="" />
                  </div>
                  <div className="font-roboto font-bold text-[32px] leading-[100%] tracking-[0%] text-center text-[#FFFFFF]">
                    {metric?.value?.toLocaleString()}
                  </div>

                  <div className="font-roboto font-normal text-[16px] leading-[100%] tracking-[0%] text-center text-[#8E8E93]">
                    {metric?.label}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col gap-8"
      style={{
        background: `linear-gradient(135deg, rgba(7, 9, 85, 0.85) 10%, rgba(17, 43, 129, 0.7) 25%, rgba(12, 20, 136, 0.6) 50%, rgba(35, 27, 153, 0.7) 75%, rgba(3, 5, 53, 0.85) 100%), url(${homePage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="flex items-center justify-between  mt-10 px-[120px]">
        <span className="font-roboto font-medium text-[32px] leading-[100%] tracking-[0%] text-center align-middle text-[#FFFFFF] ">
          Dashboard Analytics
        </span>

        <Dropdown
          trigger={["hover"]}
          placement="bottomRight"
          dropdownRender={() => (
            <div
              className="bg-[#0C0C0E] text-white w-[340px] p-6 rounded-[20px] flex flex-col gap-4 border border-[#1A26E7]
                 shadow-[0_0_25px_rgba(26,38,231,0.2)]"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-[#2C2C2E]">
                <img
                  src={kresusAssets?.tokenDropdownIcon}
                  alt="Filters Icon"
                  className="w-[24px] h-[24px] text-[#FFFFFF]"
                />
                <span className="font-roboto font-semibold text-[20px] leading-[100%]">
                  Filters
                </span>
              </div>

              {/* Select Chain */}
              <div className="flex flex-col gap-1 custom-select-wrapper">
                <Select
                  value={form.chain}
                  onChange={(val) =>
                    handleChange("chain", Array.isArray(val) ? val[0] : val)
                  }
                  placeholder="Select Chain"
                  className="custom-placeholder !bg-[#1C1C1E] !text-[#C7C7CC] !border-none rounded-lg h-[50px] hover:!bg-[#2C2C2E] transition-all"
                  popupClassName="!bg-[#1C1C1E] !text-white !border-none"
                  suffixIcon={
                    <img
                      src={kresusAssets?.filterDownArrow}
                      alt=""
                      className="w-5 h-5"
                    />
                  }
                >
                  {chainOptions?.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      <span className="text-[#C7C7CC]">{opt.label}</span>
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Select Address */}
              <div className="flex flex-col gap-1 custom-select-wrapper">
                <Select
                  value={form.address}
                  onChange={(val) =>
                    handleChange("address", Array.isArray(val) ? val[0] : val)
                  }
                  placeholder="Select Address"
                  className="custom-placeholder !bg-[#1C1C1E] !text-[#C7C7CC] !border-none rounded-lg h-[48px] hover:!bg-[#2C2C2E] transition-all"
                  popupClassName="!bg-[#1C1C1E] !text-white !border-none"
                  suffixIcon={
                    <img
                      src={kresusAssets?.filterDownArrow}
                      alt=""
                      className="w-5 h-5"
                    />
                  }
                >
                  {addressOptions?.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      <span className="text-[#C7C7CC]">{opt.label}</span>
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <DatePicker
                  value={form.start_date ? dayjs(form.start_date) : null}
                  onChange={(d) => handleDateChange("start_date", d)}
                  format="YYYY-MM-DD"
                  className="w-full !bg-[#1C1C1E] !text-[#C7C7CC] !border-none rounded-lg h-[48px] px-3 hover:!bg-[#2C2C2E]  custom-datepicker"
                  suffixIcon={
                    <img
                      src={kresusAssets?.filterDateCalendar}
                      alt=""
                      className="w-5 h-5"
                    />
                  }
                  placeholder="Select Start Date"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1">
                <DatePicker
                  value={form.end_date ? dayjs(form.end_date) : null}
                  onChange={(d) => handleDateChange("end_date", d)}
                  format="YYYY-MM-DD"
                  className="w-full !bg-[#1C1C1E] !text-[#C7C7CC] !border-none rounded-lg h-[48px] px-3 hover:!bg-[#2C2C2E] custom-datepicker"
                  suffixIcon={
                    <img
                      src={kresusAssets?.filterDateCalendar}
                      alt=""
                      className="w-5 h-5"
                    />
                  }
                  placeholder="Select End Date"
                />
              </div>
            </div>
          )}
        >
          <div className="rounded-[24px] py-[12px] px-[24px] bg-[#FFFFFF] cursor-pointer hover:bg-[#F3F3F3] transition-all">
            <div className="flex items-center justify-center gap-[8px]">
              <img src={kresusAssets.filterAnalyticsIcon} alt="" />
              <span className="font-roboto font-medium text-[16px] text-[#000]">
                Filter Analytics
              </span>
            </div>
          </div>
        </Dropdown>
      </div>

      {/* <div className=" rounded-xl text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 sm:p-6 mb-6 sm:mb-8 border-2 !border-white transition-all duration-300 ease-in-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-2 !border-white">
          <div className="space-y-2">
            <div className="w-full">
              <label className="block mb-1 font-bold text-xs sm:text-sm">
                Select Chain
              </label>
              <Select
                value={form.chain}
                onChange={(val) =>
                  handleChange("chain", Array.isArray(val) ? val[0] : val)
                }
                placeholder="Select chain"
                className="custom-select w-full"
                size="large"
                dropdownClassName="custom-select-dropdown"
              >
                {chainOptions?.map((opt) => (
                  <Option
                    key={opt.value}
                    value={opt.value}
                    className="custom-select-option"
                  >
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full">
              <label className="block mb-1 font-bold text-xs sm:text-sm">
                Select Address
              </label>
              <Select
                value={form.address}
                onChange={(val) =>
                  handleChange("address", Array.isArray(val) ? val[0] : val)
                }
                placeholder="Select Address"
                className="custom-select w-full"
                size="large"
                dropdownClassName="custom-select-dropdown"
              >
                {addressOptions?.map((opt) => (
                  <Option
                    key={opt.value}
                    value={opt.value}
                    className="custom-select-option"
                  >
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="w-full">
            <label className="block mb-1 font-bold text-xs sm:text-sm">
              Start Date
            </label>
            <div className="custom-select-input">
              <DatePicker
                value={form.start_date ? dayjs(form.start_date) : null}
                onChange={(d) => handleDateChange("start_date", d)}
                format="YYYY-MM-DD"
                className={classNames("w-full", {
                  "border-red-500": dateError,
                })}
                size="large"
                status={dateError ? "error" : undefined}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block mb-1 font-bold text-xs sm:text-sm">
              End Date
            </label>
            <div className="custom-select-input">
              <DatePicker
                value={form.end_date ? dayjs(form.end_date) : null}
                onChange={(d) => handleDateChange("end_date", d)}
                format="YYYY-MM-DD"
                className={classNames("w-full", {
                  "border-red-500": dateError,
                })}
                size="large"
                status={dateError ? "error" : undefined}
              />
              {dateError && (
                <div className="text-red-500 text-xs mt-1">{dateError}</div>
              )}
            </div>
          </div>
        </div>
      </div> */}

      <div className=" px-10px sm:px-[40px] md:px-[120px]">{renderActiveUserCard()}</div>
      {/* Tabs */}

      <div className="px-4 sm:px-6 mt-2 md:px-[120px] ">
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
            marginLeft: "100px",
            marginRight: "100px",
          }}
          tabBarGutter={16}
        />
      </div>
      {/* 
     {renderCardSection(
        "Volume Analytics",
        augmentedVolumeData,
        [
          ["Total Volume (USD)", "total_volume"],
          ["Sent Volume (USD)", "sent_volume"],
          ["Received Volume (USD)", "received_volume"],
          ["Swapped Volume (USD)", "swapped_volume"],
          ["Dapp Volume (USD)", "dapp_volume"],
        ],
        {
          "solana-mainnet": [
            ["USDC Deposit (Token Value)", "usdcDepositAmount"],
            ["SOL Deposit (Token Value)", "solDepositAmount"],
            ["USDC Withdraw (Token Value)", "usdcWithdrawAmount"],
            ["SOL Withdraw (Token Value)", "solWithdrawAmount"],
            ["Dapp Volume (USD)", "dapp_volume"],
          ],
        },
        true
      )}  */}

      {/* {renderCardSection(
        "Transaction Analytics",
        augmentedTransactionData,
        [
          ["Total Transactions", "total_transaction"],
          ["Sent", "sent_transaction"],
          ["Received", "received_transaction"],
          ["Swapped", "swapped_transaction"],
          ["Dapp Transaction", "dapp_transaction"],
        ],
        {
          "solana-mainnet": [
            ["USDC Deposit Count", "usdcDepositCount"],
            ["SOL Deposit Count", "solDepositCount"],
            ["USDC Withdraw Count", "usdcWithdrawCount"],
            ["SOL Withdraw Count", "solWithdrawCount"],
            ["Dapp Transaction", "dapp_transaction"],
          ],
        }
      )} */}
    </div>
  );
};

export default MonthlyActive;
