import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Tabs, Table, Tooltip, Spin, Button } from 'antd';
import type { TabsProps, TableProps } from 'antd';
import { Token } from './analyticsHolding';
import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';
import useApiClient from "hooks/useApiClient";

// Types
interface TokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokens: { [chain: string]: Token[] };
    totalUsd: number;
    email: string;
    address: string;
    solana_address: string;
}

interface SpamTokensResponse {
    spamTokens?: { [chain: string]: Token[] };
    error?: string;
}

interface ChainSummary {
    chain: string;
    total: number;
    tokenCount: number;
    sortedTokens: Token[];
}

interface SortConfig {
    key: string;
    order: 'ascend' | 'descend' | null;
}

// Constants
const CHAIN_NAME_MAP: Record<string, string> = {
    'base-mainnet': 'Base',
    'solana-mainnet': 'Solana',
    'worldchain-mainnet': 'WLD',
};

const ALL_CHAINS = ['base-mainnet', 'worldchain-mainnet', 'solana-mainnet'] as const;

const TABLE_SCROLL_CONFIG = { x: 400, y: 250 };
const SYMBOL_MAX_LENGTH = 8;
const BALANCE_DECIMAL_PLACES = 6;
const USD_DECIMAL_PLACES = 2;

// Utility functions
const formatChainName = (chain: string): string => {
    return CHAIN_NAME_MAP[chain] || chain;
};

const truncateAddress = (address: string): React.ReactElement => {
    if (!address) return <></>;
    const start = address.slice(0, 3);
    const end = address.slice(-3);
    return (
        <span className="truncated-address">
            <span className="start">{start}</span>
            <span className="separator">...</span>
            <span className="end">{end}</span>
        </span>
    );
};

const formatBalance = (value: string): string => {
    return parseFloat(value).toFixed(BALANCE_DECIMAL_PLACES);
};

const formatUsdValue = (value: string): string => {
    return `$${parseFloat(value).toFixed(USD_DECIMAL_PLACES)}`;
};

const parseNumericValue = (value: string | null | undefined): number => {
    return parseFloat(value || "0");
};

// Sub-components
const CopyButton: React.FC<{ text: string; onCopy: (text: string) => void }> = ({ text, onCopy }) => (
    <button
        onClick={() => onCopy(text)}
        className="ml-2 p-1 hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Copy address"
    >
        <CopyOutlined className="text-blue-500" />
    </button>
);

const UserInfo: React.FC<{ email: string; address: string; solanaAddress?: string; onCopy: (text: string) => void }> = ({
    email,
    address,
    solanaAddress,
    onCopy
}) => (
    <div className="user-info">
        <p>
            <span className="label">Email:</span>
            <span className="value">{email}</span>
        </p>
        <p>
            <span className="label">Base:</span>
            <span className="value">
                {truncateAddress(address)}
                <CopyButton text={address} onCopy={onCopy} />
            </span>
        </p>
        {solanaAddress && (
            <p>
                <span className="label">Solana:</span>
                <span className="value">
                    {truncateAddress(solanaAddress)}
                    <CopyButton text={solanaAddress} onCopy={onCopy} />
                </span>
            </p>
        )}
    </div>
);

const ChainSummaryCard: React.FC<{ summary: ChainSummary }> = ({ summary }) => (
    <div key={summary.chain} className="chain-card" data-chain={summary.chain}>
        <div className="chain-header">
            <span className="chain-name">{formatChainName(summary.chain)}</span>
            <span className="chain-value">${summary.total.toFixed(USD_DECIMAL_PLACES)}</span>
        </div>
        <div className="token-count">
            <strong>{summary.tokenCount}</strong> tokens
        </div>
    </div>
);

const SpamTokensSection: React.FC<{
    spamTokens: SpamTokensResponse | null;
    spamLoading: boolean;
    onRetry: () => void;
}> = ({ spamTokens, spamLoading, onRetry }) => {
    const spamColumns = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string | null) => text || 'Unknown',
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (text: string | null) => text || 'Unknown',
        },
        {
            title: 'Balance',
            dataIndex: 'balance_formatted',
            key: 'balance_formatted',
            render: formatBalance,
            align: 'right' as const,
        },
        {
            title: 'USD Value',
            dataIndex: 'usd_balance_formatted',
            key: 'usd_balance_formatted',
            render: formatUsdValue,
            align: 'right' as const,
        },
    ], []);

    if (spamLoading) {
        return (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
                <h4 style={{ marginBottom: 12 }}>Spam Tokens</h4>
                <Spin size="large" style={{ padding: 32 }} />
            </div>
        );
    }

    if (spamTokens?.error) {
        return (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
                <h4 style={{ marginBottom: 12, color: "red" }}>Spam Tokens</h4>
                <p style={{ color: "red" }}>{spamTokens.error}</p>
                <Button size="small" onClick={onRetry} style={{ marginTop: '8px' }}>
                    Retry
                </Button>
            </div>
        );
    }

    if (!spamTokens?.spamTokens) return null;

    return (
        <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ color: "red", margin: 0 }}>Spam Tokens</h2>
            </div>
            <Tabs
                items={ALL_CHAINS.map((chain) => {
                    const chainTokens = spamTokens.spamTokens?.[chain] || [];
                    return {
                        key: chain,
                        label: (
                            <div className="tab-label">
                                <span className="capitalize">{formatChainName(chain)}</span>
                                <span className="token-count">{chainTokens.length}</span>
                            </div>
                        ),
                        children: (
                            <div className="mt-4">
                                <Table
                                    dataSource={chainTokens}
                                    columns={spamColumns}
                                    rowKey="token_address"
                                    pagination={false}
                                    size="small"
                                    className="token-table"
                                    scroll={TABLE_SCROLL_CONFIG}
                                />
                            </div>
                        )
                    };
                })}
                className="token-tabs"
            />
        </div>
    );
};

// Main component
const TokenModal: React.FC<TokenModalProps> = ({
    isOpen,
    onClose,
    tokens,
    totalUsd,
    email,
    address,
    solana_address
}) => {
    const [activeTab, setActiveTab] = useState<string>(Object.keys(tokens)[0] || '');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'usd_value',
        order: 'descend'
    });
    console.log(sortConfig)
    const [spamTokens, setSpamTokens] = useState<SpamTokensResponse | null>(null);
    const [spamLoading, setSpamLoading] = useState(false);
    const { getRequest } = useApiClient();

    // Memoized values
    const totalTokenCount = useMemo(() => 
        Object.values(tokens).reduce((sum, tokens) => sum + tokens.length, 0), 
        [tokens]
    );

    const chainSummaries = useMemo((): ChainSummary[] => 
        Object.entries(tokens).map(([chain, chainTokens]) => {
            const sortedChainTokens = [...chainTokens].sort((a, b) => {
                const aValue = parseNumericValue(a.usd_balance_formatted);
                const bValue = parseNumericValue(b.usd_balance_formatted);
                return bValue - aValue;
            });
            const chainTotal = sortedChainTokens.reduce((sum, token) =>
                sum + parseNumericValue(token.usd_balance_formatted), 0
            );
            return {
                chain,
                total: chainTotal,
                tokenCount: chainTokens.length,
                sortedTokens: sortedChainTokens
            };
        }), [tokens]
    );

    const columns = useMemo(() => [
        {
            title: 'Token Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string | null) => text || 'Unknown',
            width: 120,
            ellipsis: true,
            sorter: (a: Token, b: Token) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (text: string | null) => {
                const symbol = text || 'Unknown';
                if (symbol.length <= SYMBOL_MAX_LENGTH) return symbol;
                return (
                    <Tooltip title={symbol}>
                        <span>{symbol.slice(0, SYMBOL_MAX_LENGTH)}...</span>
                    </Tooltip>
                );
            },
            width: 80,
            sorter: (a: Token, b: Token) => (a.symbol || '').localeCompare(b.symbol || ''),
        },
        {
            title: 'Balance',
            dataIndex: 'balance_formatted',
            key: 'balance',
            render: formatBalance,
            width: 100,
            align: 'right' as const,
            sorter: (a: Token, b: Token) => {
                const aValue = parseNumericValue(a.balance_formatted);
                const bValue = parseNumericValue(b.balance_formatted);
                return aValue - bValue;
            },
        },
        {
            title: 'USD Value',
            dataIndex: 'usd_balance_formatted',
            key: 'usd_value',
            render: formatUsdValue,
            width: 100,
            align: 'right' as const,
            sorter: (a: Token, b: Token) => {
                const aValue = parseNumericValue(a.usd_balance_formatted);
                const bValue = parseNumericValue(b.usd_balance_formatted);
                return aValue - bValue;
            },
        },
    ], []);

   

    // Callbacks
    const fetchSpamTokens = useCallback(async () => {
        setSpamLoading(true);
        setSpamTokens(null);
        try {
            const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;
            const params: Record<string, string> = { address };
            if (solana_address) params.solana = solana_address;
            const res = await getRequest<SpamTokensResponse>(`${vaultURL}analytics/spamTokens`, params);
            setSpamTokens(res);
        } catch (err) {
            setSpamTokens({ error: 'Failed to fetch spam tokens' });
            // message.error('Faizled to fetch spam tokens');
        } finally {
            setSpamLoading(false);
        }
    }, [address, solana_address]);

    const handleCopyAddress = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success('Address copied to clipboard');
        } catch (err) {
            message.error('Failed to copy address');
        }
    }, []);

    const handleTableChange: TableProps<Token>['onChange'] = useCallback((sorter: any) => {
        if (Array.isArray(sorter)) return;
        setSortConfig({
            key: sorter.field as string,
            order: sorter.order
        });
    }, []);


    const tabItems = useMemo((): TabsProps['items'] => 
        Object.entries(tokens).map(([chain, chainTokens]) => {
            const sortedChainTokens = [...chainTokens].sort((a, b) => {
                const aValue = parseNumericValue(a.usd_balance_formatted);
                const bValue = parseNumericValue(b.usd_balance_formatted);
                return bValue - aValue;
            });

            return {
                key: chain,
                label: (
                    <div className="tab-label">
                        <span className="capitalize">{formatChainName(chain)}</span>
                        <span className="token-count">{chainTokens.length}</span>
                    </div>
                ),
                children: (
                    <div className="mt-4">
                        <Table
                            dataSource={sortedChainTokens}
                            columns={columns}
                            rowKey="token_address"
                            pagination={false}
                            size="small"
                            className="token-table"
                            scroll={TABLE_SCROLL_CONFIG}
                            onChange={handleTableChange}
                            sortDirections={['ascend', 'descend']}
                        />
                    </div>
                ),
            };
        }), [tokens, columns]
    );
    // Effects
    useEffect(() => {
        if (isOpen && address) {
            fetchSpamTokens();
        }
        if (!isOpen) {
            setSpamTokens(null);
            setSpamLoading(false);
        }
    }, [isOpen, address, solana_address]);

    return (
        <Modal
            title={
                <div>
                    <h3 className="text-lg font-bold">Token Details</h3>
                    <UserInfo 
                        email={email} 
                        address={address} 
                        solanaAddress={solana_address} 
                        onCopy={handleCopyAddress} 
                    />
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            className="token-modal"
        >
            <div className="chain-summary">
                <div className="chain-card total-card">
                    <div className="chain-header">
                        <span className="chain-name">Total</span>
                        <span className="chain-value">${totalUsd.toFixed(USD_DECIMAL_PLACES)}</span>
                    </div>
                    <div className="text-white">
                        <strong>{totalTokenCount}</strong> tokens
                    </div>
                </div>
                {chainSummaries.map((summary) => (
                    <ChainSummaryCard key={summary.chain} summary={summary} />
                ))}
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="token-tabs"
            />

            <SpamTokensSection 
                spamTokens={spamTokens}
                spamLoading={spamLoading}
                onRetry={fetchSpamTokens}
            />
        </Modal>
    );
};

export default TokenModal;