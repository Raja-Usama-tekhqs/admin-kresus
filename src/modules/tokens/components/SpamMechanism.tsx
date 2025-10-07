import type { TableProps } from "antd";
import { Button, message, Popconfirm, Select, Spin, Table } from "antd";
import classNames from "classnames";
import useApiClient from "hooks/useApiClient";
import React, { useEffect, useMemo, useState } from "react";
import { IoMoveOutline } from "react-icons/io5";
import CustomSearch from '../../../components/CustomSearch/CustomSearch';
import "./styles.css";



interface Token {
    id: number;
    token_address: string;
    name: string;
    chain: string;
    score: string;
    data: string;
    moved_by: string | null;
    created_at: string;
    updated_at: string;
}

interface ApiError {
    message: string;
    details?: { message: string }[];
}

interface SpamMechanismProps {
    activeTab: string;
}

const chainOptions = [
    { label: "Select a chain", value: "" },
    { label: "Solana Mainnet", value: "solana-mainnet" },
    { label: "Base Mainnet", value: "base-mainnet" },
    { label: "WorldChain Mainnet", value: "worldchain-mainnet" },
];

const scoreRangeOptions = [
    { label: "Select option", value: "" },
    { label: "Below 50", value: "below-50" },
    { label: "Between 50 and 60", value: "50-60" },
    { label: "Between 60 and 70", value: "60-70" },
    { label: "Between 70 and 80", value: "70-80" },
    { label: "Between 80 and 90", value: "80-90" },
    { label: "Between 90 and 100", value: "90-100" },
];

const sortOptions = [
    { label: "Select option", value: "" },
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
];

const SpamMechanism: React.FC<SpamMechanismProps> = ({ activeTab }) => {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
    console.log(setDeleteLoading)
    const [moveLoading, setMoveLoading] = useState<Record<string, boolean>>({});
    const [tokens, setTokens] = useState<Token[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedChain, setSelectedChain] = useState<string>("");
    const [scoreRange, setScoreRange] = useState<string>("");
    const [scoreSort, setScoreSort] = useState<string>("");
    const [dateSort, setDateSort] = useState<string>("");
    const [error, setError] = useState<string | ApiError | null>(null);
    console.log(error, "error")
    const { getRequest, patchRequest } = useApiClient();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const fetchTokens = async () => {
        console.log('fetchTokens called with:', { activeTab, selectedChain, scoreSort, dateSort });
        
        setLoading(true);
        setError(null);
        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL as string;
            
            // Build query parameters
            const params = new URLSearchParams();
            
            // Only add chain parameter if a chain is selected
            if (selectedChain) {
                params.append('chain', selectedChain);
            }
            
            if (scoreSort) {
                params.append('order_by', scoreSort);
            }
            
            if (dateSort) {
                params.append('order_by_date', dateSort);
            }
            
            const queryString = params.toString();
            const url = queryString 
                ? `${vaultURL}spam-tokens/mechanism?${queryString}`
                : `${vaultURL}spam-tokens/mechanism`;
            
            console.log('Making API call to:', url);
            const response = await getRequest<Token[]>(url, {});
            console.log('API response:', response);
            setTokens(response || []);
            setPagination(prev => ({ ...prev, total: response?.length || 0 }));
        } catch (err: any) {
            let msg: string | ApiError = "Failed to fetch spam tokens";
            if (err?.response?.data) {
                msg = err.response.data;
            } else if (err?.message) {
                msg = err.message;
            } else if (typeof err === "string") {
                msg = err;
            }
            setError(msg);
            setTokens([]);
            if (typeof msg === "string") {
                message.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'spam-mechanism') {
            fetchTokens();
        }
    }, [activeTab, selectedChain, scoreSort, dateSort]);

   

    const handleMove = async (tokenAddress: string, chain: string) => {
        const key = `${tokenAddress}-${chain}`;
        setMoveLoading(prev => ({ ...prev, [key]: true }));
        setError(null);

        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL as string;
            const payload = {
                token_address: tokenAddress,
                chain: chain
            };
            
            // Empty object response type since that's what we get on success
            await patchRequest<Record<string, never>>(
                `${vaultURL}spam-tokens/move`,
                payload
            );

            message.success("Token moved successfully");
            // Refresh the list after moving
            await fetchTokens();
        } catch (err: any) {
            let msg: string | ApiError = "Failed to move token";
            if (err?.response?.data) {
                msg = err.response.data;
            } else if (err?.message) {
                msg = err.message;
            } else if (typeof err === "string") {
                msg = err;
            }
            setError(msg);
            if (typeof msg === "string") {
                message.error(msg);
            }
        } finally {
            setMoveLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const filteredTokens = useMemo(() => {
        let filtered = tokens;

        // Filter by score range (frontend filtering)
        if (scoreRange) {
            filtered = filtered.filter(token => {
                const score = Number(token.score);
                switch (scoreRange) {
                    case 'below-50':
                        return score < 50;
                    case '50-60':
                        return score >= 50 && score < 60;
                    case '60-70':
                        return score >= 60 && score < 70;
                    case '70-80':
                        return score >= 70 && score < 80;
                    case '80-90':
                        return score >= 80 && score < 90;
                    case '90-100':
                        return score >= 90 && score <= 100;
                    default:
                        return true;
                }
            });
        }

        // Filter by search text
        if (searchText.trim()) {
            const searchTerms = searchText.toLowerCase().trim().split(/\s+/);
            filtered = filtered.filter(token => {
                const searchableText = [
                    token.name?.toLowerCase() || '',
                    token.token_address.toLowerCase(),
                    token.chain.toLowerCase()
                ].join(' ');

                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        return filtered;
    }, [tokens, searchText, scoreRange]);

    const paginatedTokens = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredTokens.slice(start, end);
    }, [filteredTokens, pagination.current, pagination.pageSize]);

  

    const columns: TableProps<Token>["columns"] = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id) => (
                <span className="font-mono text-sm">{id}</span>
            ),
            sorter: (a, b) => a.id - b.id,
            width: 80,
        },

        // add here create a column for created at from response and show it in localtime 
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render: (createdAt) => (
                <span className="font-mono text-sm">{new Date(createdAt).toLocaleString()}</span>
            ),
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            width: 180,
        },
        {
            title: "Token Address",
            dataIndex: "token_address",
            key: "token_address",
            render: (address) => (
                <span className="font-mono text-sm">{address}</span>
            ),
            sorter: (a, b) => a.token_address.localeCompare(b.token_address),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name) => name || "N/A",
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
        },
        {
            title: "Chain",
            dataIndex: "chain",
            key: "chain",
            render: (chain) => chain.replace("-mainnet", "").split("-").map((word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(" "),
            sorter: (a, b) => a.chain.localeCompare(b.chain),
        },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            render: (score: string) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    Number(score) <= 49 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                    {score}
                </span>
            ),
            sorter: (a, b) => Number(a.score) - Number(b.score),
            width: 100,
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => {
                const key = `${record.token_address}-${record.chain}`;
                const isDeleteLoading = deleteLoading[key] || false;
                const isMoveLoading = moveLoading[key] || false;
                const isAnyLoading = isDeleteLoading || isMoveLoading;

                return (
                    <div className="flex flex-row gap-2">
                     
                        <Popconfirm
                            title="Move token"
                            description="Are you sure you want to move this token?"
                            onConfirm={() => handleMove(record.token_address, record.chain)}
                            okText="Yes"
                            cancelText="No"
                            disabled={isAnyLoading}
                        >
                            <Button
                                type="primary"
                                icon={<IoMoveOutline />}
                                size="small"
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                                loading={isMoveLoading}
                                disabled={isAnyLoading}
                            >
                                Move
                            </Button>
                        </Popconfirm>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ">
            <div className="mb-4 sm:mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
                    {/* Left side - Total Tokens Count */}
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-lg sm:text-lg font-bold text-gray-800">Mechanism Tokens:</span>
                        <span className=" text-blue-800 font-bold py-1 rounded-full text-2xl">
                            {loading ? (
                                <Spin size="small" />
                            ) : (
                                filteredTokens?.length ?? 0
                            )}
                        </span>
                    </div>

                    {/* Right side - Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Chain Selection */}
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Chain</label>
                            <Select
                                value={selectedChain}
                                onChange={(value) => {
                                    setSelectedChain(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                className="w-full custom-select-dropdown"
                                size="middle"
                                style={{
                                    height: '40px'
                                }}
                                options={chainOptions}
                            />
                        </div>

                        {/* Score Range Filter */}
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Score Range</label>
                            <Select
                                value={scoreRange}
                                onChange={(value) => {
                                    setScoreRange(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                className="w-full custom-select-dropdown"
                                size="middle"
                                style={{
                                    height: '40px'
                                }}
                                options={scoreRangeOptions}
                            />
                        </div>

                        {/* Score Sort */}
                        <div className="w-full sm:w-auto sm:min-w-[150px]">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Score Sort</label>
                            <Select
                                value={scoreSort}
                                onChange={(value) => {
                                    setScoreSort(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                className="w-full custom-select-dropdown"
                                size="middle"
                                style={{
                                    height: '40px'
                                }}
                                options={sortOptions}
                            />
                        </div>

                        {/* Date Sort */}
                        <div className="w-full sm:w-auto sm:min-w-[150px]">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Date Sort</label>
                            <Select
                                value={dateSort}
                                onChange={(value) => {
                                    setDateSort(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                className="w-full custom-select-dropdown"
                                size="middle"
                                style={{
                                    height: '40px'
                                }}
                                options={sortOptions}
                            />
                        </div>

                        {/* Search */}
                        <div className="w-full sm:w-auto sm:max-w-md">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Search Tokens</label>
                            <CustomSearch
                                placeholder="Search..."
                                value={searchText}
                                onChange={(value) => {
                                    setSearchText(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                onSearch={(value) => {
                                    setSearchText(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                error={typeof error === "string" ? error : null}
                                className="w-full custom-search-input"
                                onClear={() => {
                                    setSearchText("");
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={paginatedTokens}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "30", "50"],
                            onChange: (page, pageSize) => {
                                setPagination(prev => ({
                                    ...prev,
                                    current: page,
                                    pageSize: pageSize || 20,
                                }));
                            },
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            className: "px-4 py-2"
                        }}
                        className={classNames(
                            "custom-table",
                            "hover:shadow-md transition-shadow duration-200",
                            "[&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-bold"
                        )}
                        scroll={{ x: "max-content" }}
                        locale={{
                            emptyText: (
                                <div className="py-8 text-center">
                                    <div className="text-gray-500 text-lg mb-2">
                                        {searchText 
                                            ? 'No spam tokens found matching your search' 
                                            : 'No spam tokens available'
                                        }
                                    </div>
                                    {searchText && (
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                setSearchText("");
                                                setPagination(prev => ({ ...prev, current: 1 }));
                                            }}
                                        >
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            )
                        }}
                    />
                </Spin>
            </div>
        </div>
    );
};

export { SpamMechanism as default };


