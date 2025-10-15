import { LogoutOutlined, MoreOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, MenuProps } from "antd";
import { kresusAssets } from "assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles.css';
const MenuAntD = () => {
  type MenuItem = Required<MenuProps>["items"][number];

  const [current, setCurrent] = useState(location.pathname || "/");
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate("/dashboard"); // Navigate to the profile page
    } else if (key === "logout") {
      // Clear session and local storage
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to login page
      navigate("/");
    }
  };
  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };
  const items: MenuItem[] = [
    {
    
    label: (
      <span
        className={`py-[12px] px-[24px] rounded-[24px] text-white font-semibold transition-all 
          ${
            current === "/dashboard"
              ? "border border-blue-400"
              : "hover:bg-[#5C5C5E]"
          }`}
      >
        Dashboard
      </span>
    ),
    key: "/dashboard",
    onClick: () => navigate("/dashboard"),
  },
    {
      label: (
        <span className="py-[12px] px-[24px] rounded-[24px] text-white">
          Tokens
        </span>
      ),
      key: "/tokens",
      onClick: () => {
        navigate("/tokens");
      },
    },
  ];

  const items_md: MenuItem[] = [
    {
      label: (
        <MoreOutlined
          style={{ transform: "rotate(90deg)", marginTop: "12px" }}
        />
      ),
      key: "SubMenuitems",
      children: [
        {
          label: "Dashboard",
          key: "/dashboard",
          onClick: () => {
            navigate("/dashboard");
          },
        },
        {
          label: "Tokens",
          key: "/tokens",
          onClick: () => {
            navigate("/tokens");
          },
        },
      ],
    },
  ];
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        My Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <div className="static h-20 bg-[#000000] flex justify-between items-center  shadow-sm px-[120px] ">
        <div className="flex items-center">
          <img
            src={kresusAssets.KresusLogo}
            alt="Bryt Logo"
            className="h-36 w-36"
          />
        </div>

        <div className="flex items-center justify-between w-[269px] gap-[16px]">
          <div className="max-md:hidden ">
            <Menu
              onClick={onClick}
              selectedKeys={[current]}
              mode="horizontal"
              items={window.innerWidth > 768 ? items : items_md}
              theme="light"
              style={{
                overflow: "hidden",
              }}
              className="custom-menu rounded-[24px] bg-[#48484A] text-white custom-tabss"
            />
          </div>

          <div className="flex gap-5 items-center">
            <Dropdown overlay={menu} trigger={["click"]}>
              <Avatar src={kresusAssets.Avatar} className="cursor-pointer" />
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuAntD;
