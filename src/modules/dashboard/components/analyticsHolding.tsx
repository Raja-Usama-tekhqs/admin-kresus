// src/components/AnalyticsHolding.tsx
import {
  Button,
  DatePicker,
  Image,
  Input,
  Pagination,
  Select,
  Spin,
  message,
  Tooltip,
  Dropdown,
  Table,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import classNames from "classnames";
import dayjs, { Dayjs } from "dayjs";
import useApiClient from "hooks/useApiClient";
import React, { useEffect, useRef, useState } from "react";
import base from "../../../assets/allAssets/base.png";
import solanaa from "../../../assets/allAssets/solanaa.png";
import worldchain from "../../../assets/allAssets/worldchain.png";
import CustomSearch from "../../../components/CustomSearch/CustomSearch.tsx";
import "./index.css";
import TokenModal from "./TokenModal.tsx";
import ExportHolding from "./exportHolding.tsx";
import homePage from "../../../assets/allAssets/homePage.png";
import { kresusAssets } from "assets/index.ts";
import { CiExport } from "react-icons/ci";
import { MdExpandMore } from "react-icons/md";
import { AlignCenter } from "lucide-react";

const { Option } = Select;
console.log(Option, "Option");
const { Search } = Input;
console.log(Search, "Search");

export interface Token {
  token_address: string;
  chain: string;
  name: string | null;
  symbol: string | null;
  balance_formatted: string;
  usd_balance_formatted: string;
}

interface User {
  email: string;
  address: string;
  solana_address: string;
  tokens: {
    [chain: string]: Token[];
  };
}

interface ChainHolding {
  chain: string;
  holding: string;
}

interface HoldingResponse {
  chainHoldings: ChainHolding[];
  users: User[];
  pagination: {
    currentPage: string;
    totalPages: number;
  };
}

interface FormState {
  email: string;
  start_date?: string;
  end_date?: string;
}

interface ApiError {
  message: string;
  details?: { message: string }[];
}

export const chainIcon = (chain: string, size?: number) => {
  switch (chain) {
    case "solana-mainnet":
      return (
        <Image
          src={kresusAssets?.solana}
          alt="Solana"
          width={size || 25}
          height={size || 30}
          preview={false}
        />
      );
    case "base-mainnet":
      return (
        <Image
          src={kresusAssets?.base}
          alt="Base"
          width={25}
          height={30}
          preview={false}
        />
      );
    case "worldchain-mainnet":
      return (
        <Image
          src={kresusAssets?.worldChain}
          width={25}
          height={30}
          alt="WorldChain"
          preview={false}
        />
      );
    default:
      return (
        <Image
          src={kresusAssets?.sui}
          width={25}
          height={30}
          alt=""
          preview={false}
        />
      );
  }
};

const formatChainName = (chain: string) => {
  switch (chain) {
    case "base-mainnet":
      return "Base";
    case "solana-mainnet":
      return "Solana";
    case "worldchain-mainnet":
      return "WLD";
    default:
      return chain;
  }
};

const TokenList: React.FC<{
  tokens: { [chain: string]: Token[] };
  showCount?: number;
}> = ({ tokens, showCount }) => {
  const allTokens = Object.values(tokens).flat();
  const sortedTokens = [...allTokens].sort((a, b) => {
    const aValue = parseFloat(a.balance_formatted || "0");
    const bValue = parseFloat(b.balance_formatted || "0");
    return bValue - aValue;
  });
  const displayTokens = showCount
    ? sortedTokens.slice(0, showCount)
    : sortedTokens;
  return (
    <ol className="list-decimal pl-3 sm:pl-4">
      {displayTokens.map((token, tIdx) => (
        <li key={tIdx} className="font-medium">
          {token.name || "nil"}{" "}
          <span className="text-xs text-white">
            ({formatChainName(token.chain)})
          </span>
        </li>
      ))}
    </ol>
  );
};

const TokenBalanceList: React.FC<{
  tokens: { [chain: string]: Token[] };
  showCount?: number;
}> = ({ tokens, showCount }) => {
  const allTokens = Object.values(tokens).flat();
  const sortedTokens = [...allTokens].sort((a, b) => {
    const aValue = parseFloat(a.balance_formatted || "0");
    const bValue = parseFloat(b.balance_formatted || "0");
    return bValue - aValue;
  });
  const displayTokens = showCount
    ? sortedTokens.slice(0, showCount)
    : sortedTokens;
  return (
    <ol className="list-decimal pl-3 sm:pl-4">
      {displayTokens.map((token, tIdx) => (
        <li key={tIdx}>
          <div>
            <span className="font-semibold">{token.symbol || "Unknown"}</span>:{" "}
            <span className="text-blue-700 font-bold">
              {parseFloat(token.balance_formatted || "0").toFixed(2)}
            </span>
            <span className="text-xs text-white ml-1">
              ({formatChainName(token.chain)})
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

const TokenValueList: React.FC<{
  tokens: { [chain: string]: Token[] };
  totalUsd: number;
  showCount?: number;
}> = ({ tokens, totalUsd, showCount }) => {
  const allTokens = Object.values(tokens).flat();
  const sortedTokens = [...allTokens].sort((a, b) => {
    const aValue = parseFloat(a.usd_balance_formatted || "0");
    const bValue = parseFloat(b.usd_balance_formatted || "0");
    return bValue - aValue;
  });
  const displayTokens = showCount
    ? sortedTokens.slice(0, showCount)
    : sortedTokens;
  return (
    <div>
      <ol className="list-decimal pl-3 sm:pl-4">
        {displayTokens.map((token, tIdx) => (
          <li key={tIdx}>
            <span className="font-semibold">{token.symbol || "Unknown"}</span>:{" "}
            <span className="text-green-700 font-bold">
              ${parseFloat(token.usd_balance_formatted || "0").toFixed(2)}
            </span>
            <span className="text-xs text-white ml-1">
              ({formatChainName(token.chain)})
            </span>
          </li>
        ))}
      </ol>
      {showCount && allTokens.length > showCount && (
        <div className="border-t">
          <span className="text-[#BE5B50]">
            +{allTokens.length - showCount} more tokens
          </span>
        </div>
      )}
      <div className="mt-1 sm:mt-2 border-t pt-1">
        Overall Total:{" "}
        <span className="text-purple-700 font-bold">
          ${totalUsd.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const AnalyticsHolding: React.FC = ({ activeTab }) => {
  const [form, setForm] = useState<FormState>({
    email: "",
  });
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [data, setData] = useState<HoldingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { getRequest } = useApiClient();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
  });
  const [error, setError] = useState<string | ApiError | null>(null);
  console.log(error, "error");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [selectedUser, setSelectedUser] = useState<{
    tokens: { [chain: string]: Token[] };
    totalUsd: number;
    email: string;
    address: string;
    solana_address: string;
  } | null>(null);
  const TOKENS_TO_SHOW = 3;
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailInputChange = (value: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Clear email error when user starts typing
    setEmailError(null);

    // Update form email
    setForm((prev) => ({ ...prev, email: value }));

    // If input is cleared, trigger search with empty email
    if (!value.trim()) {
      setSearchEmail("");
    }

    setError(null);
  };

  const handleEmailSearch = (value: string) => {
    if (!value.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    // Update both form and search email when search is clicked
    setForm((prev) => ({ ...prev, email: value }));
    setSearchEmail(value);
    setError(null);
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
    // Clear any existing date errors
    setDateError(null);
    // Get the other date value
    const otherDate = name === "start_date" ? form.end_date : form.start_date;
    // If both dates are set, validate them
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
    setError(null);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || 10,
    });
    setError(null);
  };

  const fetchHolding = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries({
          ...form,
          email: searchEmail,
        }).filter(([, v]) => typeof v === "string" && v.trim() !== "")
      );
      params.page = pagination.current.toString();
      params.limit = pagination.pageSize.toString();
      const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;
      const res = await getRequest<HoldingResponse>(
        `${vaultURL}analytics/holding`,
        params
      );
      setData(res);
    } catch (err: any) {
      let msg: string | ApiError = "Failed to load holding analytics";
      if (err?.response?.data) {
        msg = err.response.data;
      } else if (err?.message) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }
      setError(msg);
      setData(null);
      if (typeof msg === "string") {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchEmail,
    form.start_date,
    form.end_date,
    pagination.current,
    pagination.pageSize,
  ]);

  const calculateTotalUsd = (tokens: { [chain: string]: Token[] }): number => {
    return Object.values(tokens).reduce(
      (sum, chainTokens) =>
        sum +
        chainTokens.reduce(
          (chainSum, token) =>
            chainSum + (parseFloat(token.usd_balance_formatted || "0") || 0),
          0
        ),
      0
    );
  };

  const getTotalTokensCount = (tokens: {
    [chain: string]: Token[];
  }): number => {
    return Object.values(tokens).reduce(
      (sum, chainTokens) => sum + chainTokens.length,
      0
    );
  };

  const formatAddress = (address: string) => {
    if (!address) return "-";
    if (address.length <= 6) return address;
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  const handleCopyAddress = async (
    address: string,
    type: "wallet" | "solana"
  ) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      message.error("Failed to copy address");
    }
  };

  const AddressCell: React.FC<{
    address: string;
    type: "wallet" | "solana";
  }> = ({ address, type }) => {
    if (!address) return <span>-</span>;

    return (
      <div className="address-cell">
        <Tooltip
          title={copiedAddress === type ? "Copied!" : "Click to copy"}
          placement="top"
          color={copiedAddress === type ? "#52c41a" : undefined}
        >
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <span className="address-text">{formatAddress(address)}</span>
            <button
              onClick={() => handleCopyAddress(address, type)}
              className={`copy-button ${
                copiedAddress === type ? "copied" : ""
              }`}
            >
              <CopyOutlined className="copy-icon" />
            </button>
          </div>
        </Tooltip>
      </div>
    );
  };

  const ChainTokenCount: React.FC<{ tokens: { [chain: string]: Token[] } }> = ({
    tokens,
  }): JSX.Element => {
    const hasTokens = Object.values(tokens).some(
      (chainTokens) => chainTokens.length > 0
    );

    if (!hasTokens) {
      return <span className="text-red-600 font-semibold">No Chain Found</span>;
    }

    return (
      <div className="chain-token-count">
        {Object.entries(tokens).map(
          ([chain, chainTokens]) =>
            chainTokens.length > 0 && (
              <div key={chain} className="chain-token-row">
                <span className="chain-name">
                  {formatChainName(chain)}:{" "}
                  <span className="text-blue-600 font-semibold">
                    {chainTokens.length}
                  </span>
                </span>
              </div>
            )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-6 sm:py-8  ">
      <div className=" ">
        <h1 className="text-white">Holding Analytics</h1>
        <div className="">
          {/* <div
            className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-white border border-gray-400  shadow-none w-full"
            style={{
              background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full ">
              <div className="w-full">
                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">
                  Email
                </label>
                <CustomSearch
                  value={form.email}
                  onChange={handleEmailInputChange}
                  onSearch={handleEmailSearch}
                  placeholder="Search by email"
                  error={emailError}
                  onClear={() => {
                    setForm((prev) => ({ ...prev, email: "" }));
                    setSearchEmail("");
                    setEmailError(null);
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">
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
                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">
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

              <div className="w-full ">
                <ExportHolding
                  start_date={form.start_date}
                  end_date={form.end_date}
                />
              </div>
            </div>
          </div> */}

          {/* Chain Holdings Cards */}
          <div className="mb-4 sm:mb-6 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 sm:h-28 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <Spin size="large" />
                  </div>
                ))}
              </div>
            ) : data && data.chainHoldings && data.chainHoldings.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {data.chainHoldings.map((ch) => (
                  <div
                    key={ch.chain}
                    className="flex-1 min-w-[300px] lg:basis-[calc(30.333%-12px)] bg-[#161616] p-[24px] rounded-[24px] border-[2px] border-[#161616] flex flex-col gap-3 shadow-[ -8px_7px_24px_0px_#15228A1A, -33px_28px_44px_0px_#15228A17, -75px_63px_59px_0px_#15228A0D, -134px_112px_70px_0px_#15228A03, -209px_174px_76px_0px_#15228A00 ]"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2 ">
                      <div className="">{chainIcon(ch.chain)}</div>
                      <span className="text-base sm:text-lg font-bold tracking-wide capitalize text-white">
                        {ch.chain.replace("-mainnet", "")}
                      </span>
                    </div>
                    <div className="flex-1 flex items-end">
                      <div className="flex flex-col gap-3">
                        <div className="font-roboto font-normal text-[16px] leading-[100%] tracking-[0px] text-[#C7C7CC]">
                          Total Holdings
                        </div>

                        <div className="font-roboto font-semibold text-[32px] leading-[100%] tracking-[0px] text-[#7654FE]">
                          $
                          {parseFloat(ch.holding).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Amount Card */}
                <div className="flex-1 min-w-[300px] lg:basis-[calc(33.333%-12px)] p-[24px] rounded-[24px] bg-gradient-to-r from-[#0734A9] to-[#4B0792] text-white">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                    <div className="p-1 rounded-full">
                      <img
                        className="t "
                        src={kresusAssets.totalAmount}
                        alt="Total amount"
                        width={30}
                        height={40}
                      />
                    </div>
                    <span className="text-base sm:text-lg font-bold tracking-wide  text-white">
                      Total Amount
                    </span>
                  </div>
                  <div className="flex-1 flex items-end">
                    <div className="w-full text-indigo-900">
                      <div className="font-roboto font-normal text-[16px] leading-[100%] tracking-[0px] text-[#C7C7CC]">
                        Across All Chains
                      </div>
                      <div className="font-roboto font-semibold text-[32px] leading-[100%] tracking-[0px]  text-[#FFFFFF] mt-3">
                        $
                        {data.chainHoldings
                          .reduce((sum, ch) => sum + parseFloat(ch.holding), 0)
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-8 mb-5">
            
            <div className="flex items-center gap-1">
              {/* Dropdown (Filter Icon) */}
              <Dropdown
                trigger={["hover"]}
                placement="bottomRight"
                dropdownRender={() => (
                  <div
                    className="bg-black text-white  min-w-[325px] px-[24px] py-[32px] rounded-[16px] flex flex-col gap-2 border border-[#2C2C2E]
                   [box-shadow:-12px_12px_37px_0px_#4C377B1A,_-47px_47px_67px_0px_#4C377B17,_-106px_106px_90px_0px_#4C377B0D,_-188px_189px_107px_0px_#4C377B03,_-294px_295px_117px_0px_#4C377B00]"
                  >
                    {/* Dropdown Header */}
                    <div className="flex items-center gap-2 px-2 pb-2 border-b border-[#2C2C2E]">
                      <img
                        src={kresusAssets?.tokenDropdownIcon}
                        alt=""
                        className="w-6 h-6 text-[#AEAEB2]"
                      />
                      <span className="font-roboto font-semibold leading-[100%] text-[#AEAEB2] text-[16px]">
                        Filters
                      </span>
                    </div>

                    {/* Dropdown Options */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex flex-col gap-3">
                        {/* Start Date */}
                        <div className="flex flex-col gap-1">
                          <DatePicker
                            value={
                              form.start_date ? dayjs(form.start_date) : null
                            }
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
                      {/* ))} */}
                    </div>
                  </div>
                )}
              >
                {/* Dropdown Trigger Button */}
                <div className="w-[45px] h-[45px] rounded-full bg-[#2C2C2E] flex items-center justify-center border border-[#2C2C2E] cursor-pointer hover:bg-[#3A3A3C] transition-all">
                  <img src={kresusAssets?.whiteFilter} alt="" />
                </div>
              </Dropdown>

              {/* Search Input */}
              <div className=" w-auto sm:max-w-md px-[24px] py-[6px] rounded-[24px] bg-[#2C2C2E] border-2 border-[#161616]">
                <Input
                  placeholder="Search by email"
                  suffix={<img src={kresusAssets.searchIcon} className="" />}
                  value={form.email}
                  onChange={(e) => handleEmailInputChange(e.target.value)}
                  allowClear
                  variant="borderless"
                  size="large"
                  style={{
                    height: "40px",
                    backgroundColor: "transparent",
                    color: "white",
                    fontSize: "16px",
                    fontFamily: "Roboto, sans-serif",
                  }}
                  classNames={{
                    input: "text-white placeholder:text-[#7D7D7D]",
                  }}
                />
              </div>
            </div>

            <ExportHolding
              start_date={form.start_date}
              end_date={form.end_date}
            />

          </div>

          <div className="">
            {loading ? (
              <div className="text-center py-8 sm:py-10">
                <Spin size="large" />
              </div>
            ) : data && data?.users && data?.users?.length > 0 ? (
              <>
                <div className="">
                  <Spin spinning={loading}>
                    <Table
                      columns={[
                        {
                          title: "Email",
                          dataIndex: "email",
                          key: "email",
                          render: (email, record) => (
                            <div className="">
                              <Button
                                type="text"
                                icon={
                                  <img
                                    src={kresusAssets?.arrowRight}
                                    alt="Expand"
                                    className={`transition-transform p-1 ${
                                      record.expanded ? "rotate-90" : ""
                                    }`}
                                  />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newUsers = data.users.map((user) =>
                                    user.email === record.email
                                      ? { ...user, expanded: !user.expanded }
                                      : { ...user, expanded: false }
                                  );
                                  setData((prev) =>
                                    prev ? { ...prev, users: newUsers } : null
                                  );
                                }}
                                className="!flex items-center justify-center hover:!bg-[#2C2C2E]"
                              >
                                <span className="whitespace-nowrap font-roboto font-normal text-[14px] leading-[100%] tracking-[0%] align-middle underline decoration-solid text-[#4898F3] underline-offset-[0px]">
                                  {email}
                                </span>
                              </Button>
                            </div>
                          ),
                        },
                        {
                          title: "Base Address",
                          dataIndex: "address",
                          key: "address",
                          render: (address) => (
                            <AddressCell address={address} type="wallet" />
                          ),
                        },
                        {
                          title: "Solana Address",
                          dataIndex: "solana_address",
                          key: "solana_address",
                          render: (solana_address) => (
                            <AddressCell
                              address={solana_address}
                              type="solana"
                            />
                          ),
                        },
                        {
                          title: "Actions",
                          key: "actions",
                          align: "center",
                          render: (_, record) => (
                            <Button
                              type="link"
                              onClick={() =>
                                setSelectedUser({
                                  tokens: record.tokens,
                                  totalUsd: calculateTotalUsd(record.tokens),
                                  email: record.email,
                                  address: record.address,
                                  solana_address: record.solana_address,
                                })
                              }
                              className="text-[#4898F3] font-semibold underline hover:text-[#7D0BF4] !p-0"
                            >
                              <img src={kresusAssets.eyeIcon} alt="" />
                            </Button>
                          ),
                        },
                      ]}
                      dataSource={data?.users?.map((user) => ({
                        ...user,
                        key: user.email,
                        expanded: user.expanded || false,
                      }))}
                      rowKey="email"
                      pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: data.pagination?.totalPages
                          ? data.pagination.totalPages * pagination.pageSize
                          : 0,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "50", "100"],
                        onChange: handlePageChange,
                        onShowSizeChange: handlePageChange,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      className="active-token-table bg-bla"
                      scroll={{ x: "max-content" }}
                      rowClassName={(record) =>
                        record.expanded
                          ? "!bg-gradient-to-r from-[#2D2D2D]  to-[#2D2D2D] "
                          : ""
                      }
                      expandable={{
                        expandedRowRender: (record) => {
                          const allTokens = Object.values(record.tokens).flat();
                          const sortedTokens = [...allTokens].sort((a, b) => {
                            const aValue = parseFloat(
                              a.usd_balance_formatted || "0"
                            );
                            const bValue = parseFloat(
                              b.usd_balance_formatted || "0"
                            );
                            return bValue - aValue;
                          });

                          const expandedColumns = [
                            {
                              title: "Sr",
                              key: "serial",
                              width: 60,
                              align: "center",
                              render: (_, __, index) => index + 1,
                            },
                            {
                              title: "Chain Token",
                              key: "chain",
                              align: "center",
                              width: 120,
                              render: (_, token, index) => {
                                const firstIndex = sortedTokens.findIndex(
                                  (t) => t.chain === token.chain
                                );
                                const sameChainTokens = sortedTokens.filter(
                                  (t) => t.chain === token.chain
                                );
                                const isFirst = index === firstIndex;

                                if (isFirst) {
                                  return {
                                    children: (
                                      <div className="flex flex-col items-center justify-center text-white font-medium">
                                        <span>
                                          {formatChainName(token.chain)}
                                        </span>
                                      </div>
                                    ),
                                    props: {
                                      rowSpan: sameChainTokens.length,
                                      className: "align-middle text-center",
                                    },
                                  };
                                }

                                return {
                                  children: null,
                                  props: { rowSpan: 0 },
                                };
                              },
                            },
                            {
                              title: "Token Name",
                              key: "tokenName",
                              width: 200,
                              align: "center",
                              render: (_, token) => (
                                <span className="text-white">
                                  {token.name || "Unknown"}{" "}
                                  {token.symbol ? `(${token.symbol})` : ""}
                                </span>
                              ),
                            },
                            {
                              title: "Tokens",
                              key: "tokens",
                              width: 120,
                              align: "center",
                              render: (_, token) => (
                                <span className="text-white font-medium">
                                  {parseFloat(
                                    token.balance_formatted || "0"
                                  ).toFixed(2)}
                                </span>
                              ),
                            },
                            {
                              title: "AC in USD",
                              key: "usdValue",
                              width: 120,
                              align: "center",
                              render: (_, token) => (
                                <span className="text-green-400 font-bold">
                                  $
                                  {parseFloat(
                                    token.usd_balance_formatted || "0"
                                  ).toFixed(2)}
                                </span>
                              ),
                            },
                            {
                              title: "Total AC in USD",
                              key: "totalUsd",
                              width: 150,
                              align: "center",
                              render: (_, token, index) => {
                                // Only show once (first row)
                                if (index === 0) {
                                  const totalUsd = sortedTokens.reduce(
                                    (sum, t) =>
                                      sum +
                                      parseFloat(
                                        t.usd_balance_formatted || "0"
                                      ),
                                    0
                                  );
                                  return {
                                    children: (
                                      <span className="text-purple-400 font-bold text-center">
                                        ${totalUsd.toFixed(2)}
                                      </span>
                                    ),
                                    props: {
                                      rowSpan: sortedTokens.length,
                                      className:
                                        "text-center border-l border-[#3B3B3B] total-usd-cell",
                                    },
                                  };
                                }

                                // Hide rest of cells
                                return {
                                  children: null,
                                  props: {
                                    rowSpan: 0,
                                  },
                                };
                              },
                            },
                          ];

                          return (
                            <div className="bg-[#393939]  p-4 rounded-b-2xl ">
                              {/* <div className="mb-4">
                                <h3 className="text-white font-roboto font-semibold text-[16px] mb-2">
                                  Token Details for {record.email}
                                </h3>
                                <div className="flex gap-4 text-sm text-gray-300">
                                  <div>
                                    <span className="font-medium">
                                      Base Address:{" "}
                                    </span>
                                    <span className="text-blue-400">
                                      {formatAddress(record.address)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Solana Address:{" "}
                                    </span>
                                    <span className="text-blue-400">
                                      {formatAddress(record.solana_address)}
                                    </span>
                                  </div>
                                </div>
                              </div> */}

                              <Table
                                columns={expandedColumns}
                                dataSource={sortedTokens.map(
                                  (token, index) => ({
                                    ...token,
                                    key: `${token.token_address}-${index}`,
                                    chainGroup:
                                      index > 0 &&
                                      token.chain ===
                                        sortedTokens[index - 1].chain
                                        ? "same-chain-row"
                                        : "",
                                  })
                                )}
                                rowClassName={(record, index) => {
                                  const baseClass = record.chainGroup || "";

                                  // Add a class for the first row of each chain group
                                  if (
                                    index === 0 ||
                                    record.chain !==
                                      sortedTokens[index - 1]?.chain
                                  ) {
                                    return `${baseClass} chain-group-first`;
                                  }

                                  return baseClass;
                                }}
                                pagination={false}
                                size="small"
                                className="expanded-tokens-table  "
                                scroll={{ x: "max-content" }}
                                locale={{
                                  emptyText: (
                                    <div className="expanded-empty-container ">
                                      <table className="w-full border-none ">
                                        <tbody>
                                          <tr>
                                            {expandedColumns.map(
                                              (column, index) => (
                                                <td
                                                  key={column.key || index}
                                                  className={`text-[#BA2130] font-inter font-normal text-[14px]  ${
                                                    index ===
                                                    expandedColumns.length - 1
                                                      ? "border-l border-[#f1ecec]" // Use your existing border color
                                                      : "border-none !border-0"
                                                  }`}
                                                  style={{
                                                    width: column.width,
                                                    minWidth: column.width,
                                                    textAlign:
                                                      column.align || "center",
                                                  }}
                                                >
                                                  N/A
                                                </td>
                                              )
                                            )}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          );
                        },
                        expandedRowKeys: data.users
                          .filter((user) => user.expanded)
                          .map((user) => user.email),
                        onExpand: (expanded, record) => {
                          const newUsers = data.users.map((user) =>
                            user.email === record.email
                              ? { ...user, expanded }
                              : { ...user, expanded: false }
                          );
                          setData((prev) =>
                            prev ? { ...prev, users: newUsers } : null
                          );
                        },
                        expandIcon: () => null,
                        rowExpandable: () => true,
                      }}
                      summary={() =>
                        data?.users && data.users.length > 0 ? (
                          <Table.Summary>
                            <Table.Summary.Row className="total-row bg-[#2C2C2E] bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_33.33%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.08)_66.5%)]">
                              <Table.Summary.Cell
                                index={0}
                                colSpan={4}
                                className="font-roboto font-bold text-[16px] leading-[100%] tracking-[0] text-center text-[#FFFFFF]"
                              >
                                Total AC in USD of above Data
                              </Table.Summary.Cell>
                              <Table.Summary.Cell
                                index={1}
                                className="text-center"
                              >
                                <span className="font-roboto font-bold text-[16px] leading-[100%] tracking-[0] align-middle bg-[linear-gradient(135deg,#7D0BF4_0%,#0D4BEF_100%)] bg-clip-text text-transparent">
                                  {`$${data.users
                                    .reduce(
                                      (sum, user) =>
                                        sum + calculateTotalUsd(user.tokens),
                                      0
                                    )
                                    .toFixed(2)}`}
                                </span>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        ) : null
                      }
                    />
                  </Spin>
                </div>
              </>
            ) : (
              <div className="overflow-x-auto w-full border border-gray-600 rounded-lg">
                <div className="min-w-[800px] sm:min-w-full">
                  <table className="w-full bg-white border border-gray-600 text-xs sm:text-sm md:text-base">
                    <thead className="bg-[#05025e] text-white">
                      <tr>
                        <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">
                          Email
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">
                          Base Address
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">
                          Solana Address
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">
                          Chain Tokens
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="border">
                          <div className="text-center py-8 text-red-400 font-medium">
                            No data available
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedUser && (
        <TokenModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          tokens={selectedUser.tokens}
          totalUsd={selectedUser.totalUsd}
          email={selectedUser.email}
          address={selectedUser.address}
          solana_address={selectedUser.solana_address}
        />
      )}
    </div>
  );
};

export default AnalyticsHolding;
