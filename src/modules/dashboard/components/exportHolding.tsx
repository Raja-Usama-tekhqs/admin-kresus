// src/components/ExportHolding.tsx
import { DownloadOutlined } from '@ant-design/icons';
import { Button, message, Select, Spin } from 'antd';
import classNames from 'classnames';
import useApiClient from "hooks/useApiClient";
import { useState } from 'react';


const { Option } = Select;

interface ExportHoldingProps {
    start_date?: string;
    end_date?: string;
}

interface ExportResponse {
    status: string;
    jobId: string;
}

interface JobStatusResponse {
    job: {
        status: 'pending' | 'complete';
        fileUrl?: string;
    };
}

type ExportType = 'tokens' | 'emails' | '';

const ExportHolding: React.FC<ExportHoldingProps> = ({ start_date, end_date }) => {
    const [exportType, setExportType] = useState<ExportType>('');
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    console.log(jobId)
    const { getRequest } = useApiClient();
    const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;

    const checkJobStatus = async (jobId: string) => {
        try {
            const response = await getRequest<JobStatusResponse>(
                `${vaultURL}analytics/csv-status`,
                { jobId }
            );

            if (response.job.status === 'complete' && response.job.fileUrl) {
                // Download the file
                window.location.href = response.job.fileUrl;
                setLoading(false);
                setJobId(null);
                message.success('CSV file downloaded successfully');
            } else if (response.job.status === 'pending') {
                // Check again after 3 seconds
                setTimeout(() => checkJobStatus(jobId), 3000);
            }
        } catch (error) {
            setLoading(false);
            setJobId(null);
            message.error('Failed to check export status');
        }
    };

    const handleExport = async () => {
        if (!exportType) {
            message.error('Please select an export type');
            return;
        }

        setLoading(true);
        try {
            const response = await getRequest<ExportResponse>(
                `${vaultURL}analytics/holding-csv`,
                {
                    type: exportType,
                    ...(start_date && { start_date }),
                    ...(end_date && { end_date })
                }
            );

            if (response.jobId) {
                setJobId(response.jobId);
                checkJobStatus(response.jobId);
            }
        } catch (error) {
            setLoading(false);
            message.error('Failed to start export');
        }
    };

    return (
        <div className=" lg:pr-4">
            <div className="w-full">
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm text-white ">Export CSV</label>
                </div>
                <div className="flex flex-col w-full sm:flex-row items-start sm:items-center gap-4 mt-1">
                    <Select
                        value={exportType}
                        onChange={(value: ExportType) => setExportType(value)}
                        disabled={loading}
                        className="export-select"
                        size="large"
                        placeholder="Select Type"
                        dropdownStyle={{ minWidth: '200px' }}
                    >
                        <Option value="">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span className="font-medium">Select Type</span>
                            </div>
                        </Option>
                        <Option value="tokens">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span className="font-medium">By Tokens</span>
                            </div>
                        </Option>
                        <Option value="emails">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="font-medium">By Email & Address</span>
                            </div>
                        </Option>
                    </Select>
                    {loading ? (
                        <div className="export-loading-state">
                            <Spin size="small" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleExport}
                            disabled={!exportType}
                            size="large"
                            className={classNames(
                                "w-full sm:w-auto min-w-[130px]",
                                "flex items-center justify-center gap-2",
                                "bg-white text-white hover:bg-blue-700",
                                "transition-all duration-200",
                                "shadow-sm hover:shadow-md",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "text-base font-medium",
                                "border-2 border-black"
                            )}
                            icon={<DownloadOutlined className="text-lg" />}
                        >
                            <span>Export</span>
                        </Button>
                    )}
                </div>
                {!exportType && !loading && (
                    <div className="mt-2 text-xs text-white italic">
                        Please select an export type to download
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportHolding;
