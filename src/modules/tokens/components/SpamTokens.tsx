import { DeleteOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Button, message, Popconfirm, Select, Spin, Table } from "antd";
import classNames from "classnames";
import useApiClient from "hooks/useApiClient";
import React, { useEffect, useMemo, useState } from "react";
import CustomSearch from '../../../components/CustomSearch/CustomSearch';
import "./styles.css";
import { IoMoveOutline } from "react-icons/io5";

interface Token {
    token_address: string;
    chain: string;
    symbol: string;
    name: string;
    usd_price: string;
    is_automated: boolean | null | undefined;
    created_at: string;
}

interface ApiError {
    message: string;
    details?: { message: string }[];
}

interface SpamTokensProps {
    activeTab: string;
}

const SpamTokens: React.FC<SpamTokensProps> = ({ activeTab }) => {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
    const [moveLoading, setMoveLoading] = useState<Record<string, boolean>>({});
    const [tokens, setTokens] = useState<Token[]>([]);
    const [searchText, setSearchText] = useState("");
    const [automatedFilter, setAutomatedFilter] = useState<string>("all");
    const [error, setError] = useState<string | ApiError | null>(null);
    console.log(error, "error")
    const { getRequest, deleteRequest, patchRequest } = useApiClient();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const fetchTokens = async () => {
        setLoading(true);
        setError(null);
        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL as string;
            const response = await getRequest<Token[]>(
                `${vaultURL}spam-tokens/unique-spam-list`,
                {}
            );
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
        if (activeTab === 'spam') {
            fetchTokens();
        }
    }, [activeTab]);

    const handleDelete = async (tokenAddress: string, chain: string) => {
        const key = `${tokenAddress}-${chain}`;
        setDeleteLoading(prev => ({ ...prev, [key]: true }));
        setError(null);

        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL as string;
            // Empty object response type since that's what we get on success
            await deleteRequest<Record<string, never>>(
                `${vaultURL}spam-tokens/${tokenAddress}/${chain}`
            );

            message.success("Token removed from spam list");
            // Refresh the list after deletion
            await fetchTokens();
        } catch (err: any) {
            let msg: string | ApiError = "Failed to remove token from spam list";
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
            setDeleteLoading(prev => ({ ...prev, [key]: false }));
        }
    };

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

        // Filter by automated status
        if (automatedFilter !== "all") {
            if (automatedFilter === "true") {
                filtered = filtered.filter(token => token.is_automated === true);
            } else if (automatedFilter === "false") {
                filtered = filtered.filter(token => token.is_automated === false);
            }
        }

        // Filter by search text
        if (searchText.trim()) {
            const searchTerms = searchText.toLowerCase().trim().split(/\s+/);
            filtered = filtered.filter(token => {
                const searchableText = [
                    token.name?.toLowerCase() || '',
                    token.symbol?.toLowerCase() || '',
                    token.token_address.toLowerCase(),
                    token.chain.toLowerCase()
                ].join(' ');

                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        return filtered;
    }, [tokens, searchText, automatedFilter]);

    const paginatedTokens = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredTokens.slice(start, end);
    }, [filteredTokens, pagination.current, pagination.pageSize]);

    const columns: TableProps<Token>["columns"] = [
        
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
            render: (name, record) => name || record.symbol || "N/A",
            sorter: (a, b) => (a.name || a.symbol || "").localeCompare(b.name || b.symbol || ""),
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
            title: "USD Price",
            dataIndex: "usd_price",
            key: "usd_price",
            render: (price: string) => `$${Number(price).toFixed(2)}`,
            sorter: (a, b) => Number(a.usd_price) - Number(b.usd_price),
        },
        {
            title: "Automated",
            dataIndex: "is_automated",
            key: "is_automated",
            render: (isAutomated: boolean | null | undefined) => {
                if (isAutomated === null || isAutomated === undefined) {
                    return (
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 font-bold">
                            N/A
                        </span>
                    );
                }
                
                return (
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        isAutomated 
                            ? 'bg-green-200 text-green-800 font-bold' 
                            : 'bg-red-200 text-red-800 font-bold'
                    }`}>
                        {isAutomated ? 'True' : 'False'}
                    </span>
                );
            },
            sorter: (a, b) => Number(a.is_automated) - Number(b.is_automated),
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
                            title="Remove from spam list"
                            description="Are you sure you want to remove this token from the spam list?"
                            onConfirm={() => handleDelete(record.token_address, record.chain)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                            disabled={isAnyLoading}
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                className="flex items-center gap-1"
                                loading={isDeleteLoading}
                                disabled={isAnyLoading}
                            >
                                Remove
                            </Button>
                        </Popconfirm>
                        
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
            <div className="mb-4 sm:mb-6 bg-white border border-gray-200 rounded-lg shadow-sm ">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
                    {/* Left side - Total Tokens Count */}
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-lg sm:text-xl font-bold text-gray-800">Total Spam Tokens:</span>
                        <span className=" text-blue-800 font-bold px-3 py-1 rounded-full text-2xl">
                            {filteredTokens?.length ?? 0}
                        </span>
                    </div>

                    {/* Right side - Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Automated Status Filter */}
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block mb-1 font-bold text-xs sm:text-sm text-gray-700">Automated Status</label>
                            <Select
                                value={automatedFilter}
                                onChange={(value) => {
                                    setAutomatedFilter(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                className="w-full custom-select-dropdown"
                                size="middle"
                                style={{
                                    height: '40px'
                                }}
                                options={[
                                    { value: "all", label: "Select Automated Status" },
                                    { value: "true", label: "True" },
                                    { value: "false", label: "False" }
                                ]}
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
                        rowKey="token_address"
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
                            "active-token-table",
                            "hover:shadow-md transition-shadow duration-200",
                            "[&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-bold"
                        )}
                        scroll={{ x: "max-content" }}
                        locale={{
                            emptyText: (
                                <div className="py-8 text-center">
                                    <div className="text-gray-500 text-lg mb-2">
                                        {searchText ? 'No spam tokens found matching your search' : 'No spam tokens available'}
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

export { SpamTokens as default };


