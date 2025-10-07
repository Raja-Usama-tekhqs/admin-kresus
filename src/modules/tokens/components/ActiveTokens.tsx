import React, { useState, useEffect, useMemo } from "react";
import { Table, Input, Button, message, Checkbox, Spin, Select } from "antd";
import type { TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useApiClient from "hooks/useApiClient";

interface Token {
    token_address: string;
    chain: string;
    symbol: string;
    name: string | null;
    usd_price: string;
}

interface SaveTokenRequest {
    tokens: {
        token_address: string;
        chain: string;
    }[];
}

interface ApiError {
    message: string;
    details?: { message: string }[];
}

interface ActiveTokensProps {
    activeTab: string;
}


const { Option } = Select;

const chainOptions = [
    { label: "Solana Mainnet", value: "solana-mainnet" },
    { label: "Base Mainnet", value: "base-mainnet" },
    { label: "WorldChain Mainnet", value: "worldchain-mainnet" },
];


const ActiveTokens: React.FC<ActiveTokensProps> = ({ activeTab }) => {
    const [selectedChain, setSelectedChain] = useState<string>("solana-mainnet");
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | ApiError | null>(null);
    console.log(error, "error")
    const { getRequest, postRequest } = useApiClient();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const fetchTokens = async () => {
        if (!selectedChain) return;

        setLoading(true);
        setError(null);
        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;
            const response = await getRequest<Token[]>(
                `${vaultURL}spam-tokens/unique-list`,
                { chain: selectedChain }
            );
            setTokens(response || []);
            setPagination(prev => ({ ...prev, total: response?.length || 0 }));
        } catch (err: any) {
            let msg: string | ApiError = "Failed to fetch tokens";
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
        if (activeTab === 'active') {
            setPagination(prev => ({ ...prev, current: 1 }));
            fetchTokens();
        }
    }, [selectedChain, activeTab]);

    const handleSave = async () => {
        if (selectedTokens.size === 0) {
            message.warning("Please select at least one token");
            return;
        }

        setSaveLoading(true);
        setError(null);

        const tokensToSave: SaveTokenRequest = {
            tokens: [...selectedTokens].map(address => ({
                token_address: address,
                chain: selectedChain
            }))
        };

        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;
            await postRequest<Record<string, never>>(
                `${vaultURL}spam-tokens`,
                tokensToSave
            );
            message.success("Tokens moved to spam successfully");
            setSelectedTokens(new Set());
            await fetchTokens();
        } catch (err: any) {
            let msg: string | ApiError = "Failed to save tokens";
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
            setSaveLoading(false);
        }
    };

    const filteredTokens = useMemo(() => {
        if (!searchText.trim()) return tokens;

        const searchTerms = searchText.toLowerCase().trim().split(/\s+/);

        return tokens.filter(token => {
            const searchableText = [
                token.name?.toLowerCase() || '',
                token.symbol?.toLowerCase() || '',
                token.token_address.toLowerCase(),
                token.chain.toLowerCase()
            ].join(' ');

            return searchTerms.every(term => searchableText.includes(term));
        });
    }, [tokens, searchText]);

    const paginatedTokens = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredTokens.slice(start, end);
    }, [filteredTokens, pagination.current, pagination.pageSize]);

    const columns: TableProps<Token>["columns"] = [
        {
            title: "Select",
            key: "select",
            width: 80,
            render: (_, record) => (
                <Checkbox
                    checked={selectedTokens.has(record.token_address)}
                    onChange={(e) => {
                        const newSelected = new Set(selectedTokens);
                        if (e.target.checked) {
                            newSelected.add(record.token_address);
                        } else {
                            newSelected.delete(record.token_address);
                        }
                        setSelectedTokens(newSelected);
                    }}
                />
            ),
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
            render: (chain: string) => chain.replace("-mainnet", "").split("-").map((word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(" "),
            sorter: (a, b) => a.chain.localeCompare(b.chain),
        },

        {
            title: "USD Price",
            dataIndex: "usd_price",
            key: "usd_price",
            render: (price) => `$${Number(price).toFixed(6)}`,
            sorter: (a, b) => Number(a.usd_price) - Number(b.usd_price),
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-6 ">
                <Input
                    placeholder="Search by name, symbol, token address or chain"
                    prefix={<SearchOutlined className="text-gray-800" />}
                    value={searchText}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchText(value);
                        setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    allowClear
                    className="max-w-md text-gray-800 border-black"
                    size="large"
                    style={{ height: '40px' }}
                />
                
                <div className="flex gap-4 items-end">
                    <div className="w-full sm:w-auto">
                        <label className="block text-black font-semibold text-sm  mb-1">Select Chain</label>
                        <Select
                            value={selectedChain}
                            onChange={setSelectedChain}
                            placeholder="Select chain"
                            className="w-full sm:w-64 custom-select"
                            size="large"
                            style={{ height: '40px' }}
                            dropdownClassName="custom-select-dropdown"
                        >
                            {chainOptions.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        danger
                        onClick={handleSave}
                        disabled={selectedTokens.size === 0 || saveLoading}
                        loading={saveLoading}
                        size="large"
                        style={{ height: '70px' }}
                        className="!h-10"
                    >
                        Move to Spam Tokens
                    </Button>
                </div>
            </div>

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
                    }}
                    className="custom-table [&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-bold"
                    scroll={{ x: "max-content" }}
                    locale={{
                        emptyText: searchText ? 'No tokens found matching your search' : 'No tokens available'
                    }}
                />
            </Spin>
        </div>
    );
};

export default ActiveTokens; 