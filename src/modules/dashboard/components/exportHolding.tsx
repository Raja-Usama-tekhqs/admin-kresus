import { useState } from "react";
import { Dropdown, MenuProps, Spin } from "antd";
import { CiExport } from "react-icons/ci";
import { MdExpandMore } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { FaRegEnvelope } from "react-icons/fa6";
import { RiTokenSwapLine } from "react-icons/ri";
import useApiClient from "hooks/useApiClient";

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
    status: "pending" | "complete";
    fileUrl?: string;
  };
}

type ExportType = "tokens" | "emails" | "";

const ExportHolding: React.FC<ExportHoldingProps> = ({
  start_date,
  end_date,
}) => {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const { getRequest } = useApiClient();
  const vaultURL = import.meta.env.VITE_REACT_APPLICATION_VAULT_URL;

  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await getRequest<JobStatusResponse>(
        `${vaultURL}analytics/csv-status`,
        { jobId }
      );

      if (response.job.status === "complete" && response.job.fileUrl) {
        window.location.href = response.job.fileUrl;
        setLoading(false);
        setJobId(null);
      } else if (response.job.status === "pending") {
        setTimeout(() => checkJobStatus(jobId), 3000);
      }
    } catch (error) {
      setLoading(false);
      setJobId(null);
    }
  };

  const handleExport = async (type: ExportType) => {
    if (!type) return;
    setLoading(true);
    try {
      const response = await getRequest<ExportResponse>(
        `${vaultURL}analytics/holding-csv`,
        {
          type,
          ...(start_date && { start_date }),
          ...(end_date && { end_date }),
        }
      );
      if (response.jobId) {
        setJobId(response.jobId);
        checkJobStatus(response.jobId);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // ✅ Dropdown menu items
  const items: MenuProps["items"] = [
    {
      key: "title",
      disabled: true,
      label: (
        <div className="flex items-center gap-2 text-[#A5A5A5] font-roboto font-medium text-[14px]">
          <FiFilter className="text-[16px]" />
          Export Type
        </div>
      ),
    },

    {
      key: "tokens",
      label: (
        <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-[#111111] transition">
          <RiTokenSwapLine className="text-[18px] text-[#7A2FF9]" />
          <span className="text-[14px] text-white font-roboto">
            Export By Tokens
          </span>
        </div>
      ),
      onClick: () => handleExport("tokens"),
    },
    {
      key: "divider2",
      label: <div className="h-[1px] bg-[#222] my-2" />,
      disabled: false,
    },
    {
      key: "emails",
      label: (
        <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-[#111111] transition">
          <FaRegEnvelope className="text-[18px] text-[#7A2FF9]" />
          <span className="text-[14px] text-white font-roboto">
            Export By Email & Address
          </span>
        </div>
      ),
      onClick: () => handleExport("emails"),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        style: { background: "transparent" }, // 👈 removes white default bg
        className:
          "!bg-transparent [&_.ant-dropdown-menu-item]:!bg-transparent [&_.ant-dropdown-menu-item:hover]:!bg-[#111111]",
      }}
      trigger={["hover"]}
      placement="bottomRight"
      dropdownRender={(menu) => (
        <div className="bg-[#000000] rounded-[16px] border border-[#222] p-4 w-[260px] shadow-[-12px_12px_37px_0px_#4C377B1A,_-47px_47px_67px_0px_#4C377B17,_-106px_106px_90px_0px_#4C377B0D,_-188px_189px_107px_0px_#4C377B03,_-294px_295px_117px_0px_#4C377B00]">
          {menu}
        </div>
      )}
    >
      <div className="px-[24px] h-[48px] rounded-[24px] bg-white flex gap-[10px] justify-center items-center text-[#000000]   cursor-pointer hover:bg-gray-100 transition">
        {loading ? (
          <Spin size="small" />
        ) : (
          <>
            <CiExport className="text-[20px]" />
            <p className="text-[16px] font-roboto font-medium">Export</p>
            <MdExpandMore className="text-[20px]" />
          </>
        )}
      </div>
    </Dropdown>
  );
};

export default ExportHolding;
