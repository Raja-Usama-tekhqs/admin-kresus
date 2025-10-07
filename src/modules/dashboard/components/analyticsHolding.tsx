// src/components/AnalyticsHolding.tsx
import { Button, DatePicker, Image, Input, Pagination, Select, Spin, message, Tooltip } from "antd";
import { CopyOutlined } from '@ant-design/icons';
import classNames from "classnames";
import dayjs, { Dayjs } from "dayjs";
import useApiClient from "hooks/useApiClient";
import React, { useEffect, useRef, useState } from "react";
import base from "../../../assets/allAssets/base.png";
import solanaa from "../../../assets/allAssets/solanaa.png";
import worldchain from "../../../assets/allAssets/worldchain.png";
import CustomSearch from '../../../components/CustomSearch/CustomSearch.tsx';
import "./index.css";
import TokenModal from './TokenModal.tsx';
import ExportHolding from "./exportHolding.tsx";
import homePage from "../../../assets/allAssets/homePage.png";

const { Option } = Select;
console.log(Option, "Option")
const { Search } = Input;
console.log(Search, "Search")

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


const chainIcon = (chain: string) => {
    switch (chain) {
        case "solana-mainnet":
            return <Image src={solanaa} alt="Solana" width={35} height={40} preview={false} />;
        case "base-mainnet":
            return <Image src={base} alt="Base" width={45} height={40} preview={false} />;
        case "worldchain-mainnet":
            return <Image src={worldchain} width={45} height={40} alt="WorldChain" preview={false} />;
        default:
            return <span className="text-xl sm:text-2xl">🔗</span>;
    }
};

const formatChainName = (chain: string) => {
    switch (chain) {
        case 'base-mainnet':
            return 'Base';
        case 'solana-mainnet':
            return 'Solana';
        case 'worldchain-mainnet':
            return 'WLD';
        default:
            return chain;
    }
};

const TokenList: React.FC<{ tokens: { [chain: string]: Token[] }, showCount?: number }> = ({ tokens, showCount }) => {
    const allTokens = Object.values(tokens).flat();
    const sortedTokens = [...allTokens].sort((a, b) => {
        const aValue = parseFloat(a.balance_formatted || "0");
        const bValue = parseFloat(b.balance_formatted || "0");
        return bValue - aValue;
    });
    const displayTokens = showCount ? sortedTokens.slice(0, showCount) : sortedTokens;
    return (
        <ol className="list-decimal pl-3 sm:pl-4">
            {displayTokens.map((token, tIdx) => (
                <li key={tIdx} className="font-medium">
                    {token.name || "nil"} <span className="text-xs text-white">({formatChainName(token.chain)})</span>
                </li>
            ))}
        </ol>
    );
};

const TokenBalanceList: React.FC<{ tokens: { [chain: string]: Token[] }, showCount?: number }> = ({ tokens, showCount }) => {
    const allTokens = Object.values(tokens).flat();
    const sortedTokens = [...allTokens].sort((a, b) => {
        const aValue = parseFloat(a.balance_formatted || "0");
        const bValue = parseFloat(b.balance_formatted || "0");
        return bValue - aValue;
    });
    const displayTokens = showCount ? sortedTokens.slice(0, showCount) : sortedTokens;
    return (
        <ol className="list-decimal pl-3 sm:pl-4">
            {displayTokens.map((token, tIdx) => (
                <li key={tIdx}>
                    <div>
                        <span className="font-semibold">{token.symbol || "Unknown"}</span>
                        : <span className="text-blue-700 font-bold">{parseFloat(token.balance_formatted || "0").toFixed(2)}</span>
                        <span className="text-xs text-white ml-1">({formatChainName(token.chain)})</span>
                    </div>
                </li>
            ))}
        </ol>
    );
};

const TokenValueList: React.FC<{ tokens: { [chain: string]: Token[] }, totalUsd: number, showCount?: number }> = ({ tokens, totalUsd, showCount }) => {
    const allTokens = Object.values(tokens).flat();
    const sortedTokens = [...allTokens].sort((a, b) => {
        const aValue = parseFloat(a.usd_balance_formatted || "0");
        const bValue = parseFloat(b.usd_balance_formatted || "0");
        return bValue - aValue;
    });
    const displayTokens = showCount ? sortedTokens.slice(0, showCount) : sortedTokens;
    return (
        <div>
            <ol className="list-decimal pl-3 sm:pl-4">
                {displayTokens.map((token, tIdx) => (
                    <li key={tIdx}>
                        <span className="font-semibold">{token.symbol || "Unknown"}</span>
                        : <span className="text-green-700 font-bold">${parseFloat(token.usd_balance_formatted || "0").toFixed(2)}</span>
                        <span className="text-xs text-white ml-1">({formatChainName(token.chain)})</span>
                    </li>
                ))}
            </ol>
            {showCount && allTokens.length > showCount && (
                <div className="border-t">
                    <span className="text-[#BE5B50]">+{allTokens.length - showCount} more tokens</span>
                </div>
            )}
            <div className="mt-1 sm:mt-2 border-t pt-1">
                Overall Total: <span className="text-purple-700 font-bold">${totalUsd.toFixed(2)}</span>
            </div>
        </div>
    );
};

const AnalyticsHolding: React.FC = () => {
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
    console.log(error, "error")
    const [emailError, setEmailError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
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

    const validateDates = (startDate: string | undefined, endDate: string | undefined): boolean => {
        if (!startDate || !endDate) return true;
        return dayjs(endDate).isAfter(dayjs(startDate));
    };

    const handleDateChange = (name: "start_date" | "end_date", date: Dayjs | null) => {
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
                    email: searchEmail
                }).filter(
                    ([, v]) => typeof v === "string" && v.trim() !== ""
                )
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
    }, [searchEmail, form.start_date, form.end_date, pagination.current, pagination.pageSize]);

    const calculateTotalUsd = (tokens: { [chain: string]: Token[] }): number => {
        return Object.values(tokens).reduce((sum, chainTokens) =>
            sum + chainTokens.reduce((chainSum, token) =>
                chainSum + (parseFloat(token.usd_balance_formatted || "0") || 0), 0
            ), 0
        );
    };

    const getTotalTokensCount = (tokens: { [chain: string]: Token[] }): number => {
        return Object.values(tokens).reduce((sum, chainTokens) => sum + chainTokens.length, 0);
    };

    const formatAddress = (address: string) => {
        if (!address) return '-';
        if (address.length <= 6) return address;
        return `${address.slice(0, 3)}...${address.slice(-3)}`;
    };

    const handleCopyAddress = async (address: string, type: 'wallet' | 'solana') => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(type);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            message.error('Failed to copy address');
        }
    };

    const AddressCell: React.FC<{ address: string; type: 'wallet' | 'solana' }> = ({ address, type }) => {
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
                            className={`copy-button ${copiedAddress === type ? 'copied' : ''}`}
                        >
                            <CopyOutlined className="copy-icon" />
                        </button>
                    </div>
                </Tooltip>
            </div>
        );
    };

    const ChainTokenCount: React.FC<{ tokens: { [chain: string]: Token[] } }> = ({ tokens }): JSX.Element => {
        const hasTokens = Object.values(tokens).some(chainTokens => chainTokens.length > 0);

        if (!hasTokens) {
            return <span className="text-red-600 font-semibold">No Chain Found</span>;
        }

        return (
            <div className="chain-token-count">
                {Object.entries(tokens).map(([chain, chainTokens]) => (
                    chainTokens.length > 0 && (
                        <div key={chain} className="chain-token-row">
                            <span className="chain-name">
                                {formatChainName(chain)}: <span className="text-blue-600 font-semibold">{chainTokens.length}</span>
                            </span>
                        </div>
                    )
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen  px-3 sm:px-4 py-6 sm:py-8 lg:px-8"  style={{
            background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}>
            <div className=" mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center justify-center  mx-auto after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600">
                    Holding Analytics
                </h1>
                <div>

                    <div className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-white border border-gray-400  shadow-none w-full"  style={{
                    background: `linear-gradient(135deg, rgba(24, 71, 201, 0.9) 0%, rgba(11, 28, 84, 0.8) 25%, rgba(19, 71, 213, 0.7) 50%, rgba(14, 40, 96, 0.8) 75%, rgba(24, 79, 209, 0.9) 100%), url(${homePage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                  }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full ">
                            <div className="w-full">
                                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">Email</label>
                                <CustomSearch
                                    value={form.email}
                                    onChange={handleEmailInputChange}
                                    onSearch={handleEmailSearch}
                                    placeholder="Search by email"
                                    error={emailError}
                                    onClear={() => {
                                        setForm(prev => ({ ...prev, email: "" }));
                                        setSearchEmail("");
                                        setEmailError(null);
                                    }}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">Start Date</label>
                                <div className="custom-select-input">
                                    <DatePicker
                                        value={form.start_date ? dayjs(form.start_date) : null}
                                        onChange={(d) => handleDateChange("start_date", d)}
                                        format="YYYY-MM-DD"
                                        className={classNames("w-full", {
                                            "border-red-500": dateError
                                        })}
                                        size="large"
                                        status={dateError ? "error" : undefined}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block mb-1 font-bold text-xs sm:text-sm text-white">End Date</label>
                                <div className="custom-select-input">
                                    <DatePicker
                                        value={form.end_date ? dayjs(form.end_date) : null}
                                        onChange={(d) => handleDateChange("end_date", d)}
                                        format="YYYY-MM-DD"
                                        className={classNames("w-full", {
                                            "border-red-500": dateError
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
                    </div>

                    {/* Chain Holdings Cards */}
                    <div className="mb-4 sm:mb-6 w-full">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-24 sm:h-28 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                                        <Spin size="large" />
                                    </div>
                                ))}
                            </div>
                        ) : data && data.chainHoldings && data.chainHoldings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                {data.chainHoldings.map((ch) => (
                                    <div
                                        key={ch.chain}
                                        className={`h-24 sm:h-28 flex flex-col p-2 sm:p-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${ch.chain === "solana-mainnet"
                                            ? "bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-300"
                                            : ch.chain === "base-mainnet"
                                                ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300"
                                                : "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-300"
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                                            <div className={`p-1 sm:p-2 rounded-full ${ch.chain === "solana-mainnet"
                                                ? "bg-purple-100"
                                                : ch.chain === "base-mainnet"
                                                    ? "bg-blue-100"
                                                    : "bg-green-100"
                                                }`}>
                                                {chainIcon(ch.chain)}
                                            </div>
                                            <span className={`text-base sm:text-lg font-bold tracking-wide capitalize ${ch.chain === "solana-mainnet"
                                                ? "text-purple-800"
                                                : ch.chain === "base-mainnet"
                                                    ? "text-blue-800"
                                                    : "text-green-800"
                                                }`}>
                                                {ch.chain.replace("-mainnet", "")}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-end">
                                            <div className={`w-full ${ch.chain === "solana-mainnet"
                                                ? "text-purple-900"
                                                : ch.chain === "base-mainnet"
                                                    ? "text-blue-900"
                                                    : "text-green-900"
                                                }`}>
                                                <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 opacity-75">Total Holdings</div>
                                                <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                                                    ${parseFloat(ch.holding).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Total Amount Card */}
                                <div
                                    className="h-24 sm:h-28 flex flex-col p-2 sm:p-3 rounded-lg shadow-md border-2 border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-200 transition-all duration-300 hover:shadow-lg hover:border-indigo-400"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                                        <div className="p-1 sm:p-2 rounded-full bg-indigo-100">
                                            <span className="text-xl sm:text-2xl">💰</span>
                                        </div>
                                        <span className="text-base sm:text-lg font-bold tracking-wide text-indigo-800">
                                            Total Amount
                                        </span>
                                    </div>
                                    <div className="flex-1 flex items-end">
                                        <div className="w-full text-indigo-900">
                                            <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 opacity-75">Across All Chains</div>
                                            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                                                ${data.chainHoldings.reduce((sum, ch) =>
                                                    sum + parseFloat(ch.holding), 0
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div>
                        {loading ? (
                            <div className="text-center py-8 sm:py-10">
                                <Spin size="large" />
                            </div>
                        ) : data && data?.users && data?.users?.length > 0 ? (
                            <>
                                <div className="table-container">
                                    <div className="min-w-full">
                                        <table className="analytics-table" >
                                            <thead >
                                                <tr>
                                                    <th>Email</th>
                                                    <th>Base Address</th>
                                                    <th>Solana Address</th>
                                                    <th>Chain Tokens</th>
                                                    <th>Token Names</th>
                                                    <th>Tokens</th>
                                                    <th>View Spam Tokens</th>
                                                    <th>Total AC in USD</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data?.users?.map((user: User, idx: number) => {
                                                    const totalUsd = calculateTotalUsd(user.tokens);
                                                    const totalTokens = getTotalTokensCount(user.tokens);
                                                    return (
                                                        <tr key={idx}>
                                                            <td className="whitespace-nowrap">{user.email}</td>
                                                            <td>
                                                                <AddressCell address={user.address} type="wallet" />
                                                            </td>
                                                            <td>
                                                                <AddressCell address={user.solana_address} type="solana" />
                                                            </td>
                                                            <td>
                                                                <ChainTokenCount tokens={user.tokens} />
                                                            </td>
                                                            <td>
                                                                {totalTokens > 0 ? (
                                                                    <div>
                                                                        <TokenList tokens={user.tokens} showCount={TOKENS_TO_SHOW} />
                                                                        {totalTokens > TOKENS_TO_SHOW && (
                                                                            <Button
                                                                                type="link"
                                                                                onClick={() => setSelectedUser({
                                                                                    tokens: user.tokens,
                                                                                    totalUsd: totalUsd,
                                                                                    email: user.email,
                                                                                    address: user.address,
                                                                                    solana_address: user.solana_address
                                                                                })}
                                                                                className="mt-1 text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                Show All Tokens ({totalTokens})
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-red-600 font-semibold">No Token Found</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {totalTokens > 0 ? (
                                                                    <div>
                                                                        <TokenBalanceList tokens={user.tokens} showCount={TOKENS_TO_SHOW} />
                                                                        {totalTokens > TOKENS_TO_SHOW && (
                                                                            <Button
                                                                                type="link"
                                                                                onClick={() => setSelectedUser({
                                                                                    tokens: user.tokens,
                                                                                    totalUsd: totalUsd,
                                                                                    email: user.email,
                                                                                    address: user.address,
                                                                                    solana_address: user.solana_address
                                                                                })}
                                                                                className="mt-1 text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                Show All Balances
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-red-600 font-semibold">No Token Found</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    type="link"
                                                                    onClick={() =>
                                                                        setSelectedUser({
                                                                            tokens: user.tokens,
                                                                            totalUsd: totalUsd,
                                                                            email: user.email,
                                                                            address: user.address,
                                                                            solana_address: user.solana_address,
                                                                        })
                                                                    }
                                                                    size="large"
                                                                    className="text-blue-800 text-bold text-md underline"
                                                                >
                                                                    View Spam Tokens
                                                                </Button>
                                                            </td>
                                                            <td className="font-semibold">
                                                                {totalTokens > 0 ? (
                                                                    <div>
                                                                        <TokenValueList tokens={user.tokens} totalUsd={totalUsd} showCount={TOKENS_TO_SHOW} />
                                                                        {totalTokens > TOKENS_TO_SHOW && (
                                                                            <Button
                                                                                type="link"
                                                                                onClick={() => setSelectedUser({
                                                                                    tokens: user.tokens,
                                                                                    totalUsd: totalUsd,
                                                                                    email: user.email,
                                                                                    address: user.address,
                                                                                    solana_address: user.solana_address
                                                                                })}
                                                                                className="mt-1 text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                Show All Values
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-green-700 font-bold">$0.00</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}


                                                {/* Total row */}
                                                {data?.users && data.users.length > 0 && (
                                                    <tr className="total-row">
                                                        <td colSpan={7} className="text-center">
                                                            Total AC in USD of above Data
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="text-white font-bold">
                                                                {`$${data.users
                                                                    .reduce((sum, user) => sum + calculateTotalUsd(user.tokens), 0)
                                                                    .toFixed(2)}`}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="flex justify-end  bg-white  p-2">
                                    <Pagination
                                        current={pagination.current}
                                        pageSize={pagination.pageSize}
                                        total={data.pagination?.totalPages ? data.pagination.totalPages * pagination.pageSize : 0}
                                        showSizeChanger
                                        pageSizeOptions={["5", "10", "20", "50", "100"]}
                                        onChange={handlePageChange}
                                        onShowSizeChange={handlePageChange}
                                        size="small"
                                        className="text-xs sm:text-sm text-white"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="overflow-x-auto w-full border border-gray-600 rounded-lg">
                                <div className="min-w-[800px] sm:min-w-full">
                                    <table className="w-full bg-white border border-gray-600 text-xs sm:text-sm md:text-base">
                                        <thead className="bg-[#05025e] text-white">
                                            <tr>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Email</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Wallet Address</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Solana Address</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Token Names</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Tokens</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">View Spam Tokens</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-2 border font-bold">Total AC in USD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={6} className="border">
                                                    <div className="text-center py-8 text-red-400 font-medium">No data available</div>
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
