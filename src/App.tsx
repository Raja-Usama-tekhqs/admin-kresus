import { ConfigProvider } from "antd";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AllRoutes } from "routes";
import AuthRoute from "routes/AuthRoute";
import { RouteConfig } from "type/types";
import './App.less';
import './i18n';
function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#002a36",
            colorSuccess: "#002a36",
            fontFamily: "sans-serif",
            // colorBgTextHover: "transparent",
            colorLink: "#002a36",
            colorLinkHover: "#002a36e4",
            fontSize: 12,
          },
          components: {
            Layout: {
              bodyBg: "#efe8d7",
              headerBg: "#ffffff",
              siderBg: "#002a36",
              headerHeight: 0,
              headerPadding: "0 0px",
            },
            Collapse: {
              // contentBg: "#FFFFFF66",
              // headerBg: "#FFFFFF66",
            },
            Menu: {
              fontSize: 16,
              itemMarginInline: 0,
              itemColor: "#344054",
              itemBg: "transparent",
              itemSelectedColor: "#344054",
              itemSelectedBg: "#cbd8e6",
              itemHoverColor: "#1f2329",
              itemHoverBg: "#cbd8e6",
              itemActiveBg: "#cbd8e6",
              popupBg: "#ffffff",
              subMenuItemBg: "#ffffff",
              subMenuItemSelectedColor: "#344054",
              subMenuItemBorderRadius: 8,
              itemHeight: 48,
              itemBorderRadius: 8,
              itemMarginBlock: 0,
              // activeBarHeight: 48,
              iconSize: 20,
              groupTitleColor: "#344054",
              groupTitleFontSize: 16,
            },
            Table: {
              headerBg: "#FCFCFD",
              headerColor: "#475467",
              bodySortBg: "#FCFCFD",
              borderColor: "#f0f0f0",
              headerSplitColor: "#FCFCFD",
              rowHoverBg: "#FCFCFD",
              headerFilterHoverBg: "",
              headerSortHoverBg: "#FCFCFD",
              headerSortActiveBg: "#FCFCFD",
              rowExpandedBg: "#FCFCFD",
              fontSize: 14,
              fontWeightStrong: 600,
              headerBorderRadius: 0,
              // backgroundColor: "#000000",
            },
            Pagination: {
              // itemActiveBg: "#002a36",
              colorBgTextActive: "#ffffff",
              colorTextPlaceholder: "#ffff",
              colorTextDescription: "#ffff",
            },
            Button: {
              defaultColor: "#002a36",
              defaultBorderColor: "#475467",
              primaryShadow: "0 0 0",
              defaultShadow: "0 0 0",
              borderRadius: 8,
              paddingBlock: 6,
              paddingInline: 20,
              colorPrimaryHover: "#002a36f1",
              defaultHoverColor: "#475467",
              defaultHoverBorderColor: "#475467",
              colorTextDisabled: "#fff",
              colorBgContainerDisabled: "#002a36b7",
            },
            Switch: {
              colorPrimary: "#475467",
              handleBg: "#002A36",
              colorPrimaryHover: "#475467",
            },
            Tabs: {
              itemColor: "#475467",
              horizontalItemGutter: 20,
              horizontalItemPaddingLG: "10px 20px",
              fontSize: 12,
              titleFontSize: 12,
              itemHoverColor: "#002a36f1",
            },
            Upload: {
              colorTextHeading: "#002a36",
              controlHeightLG: 55,
              lineWidth: 2,
              colorBorder: "#707070",
              colorBgMask: "#ffffff",
              lineType: "solid",
            },
            Breadcrumb: {
              itemColor: "#000000",
              lastItemColor: "#000000",
              linkColor: "#000000",
              linkHoverColor: "#000000",
            },
            Progress: {
              colorSuccess: "#000000",
              circleIconFontSize: "50px",
              defaultColor: "#002a36",
              remainingColor: "#475467",
            },
            Radio: {
              // dotSize: 0,
              // radioSize: 10,
            },
            Tooltip: {},
            Input: {
              fontSize: 16,
            },
            Select: {
              activeBorderColor: "black",
              hoverBorderColor: "black",
              activeOutlineColor: "none",
              selectorBg: "transparent",
              optionActiveBg: "#FFF5F0",
              optionSelectedBg: "#EFE8D7",
            },
          },
        }}
      >
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            {AllRoutes?.map((item: RouteConfig, index: number) => (
              <Route
                key={index}
                path={item?.path}
                element={
                  <AuthRoute
                  >
                    {item?.page}
                  </AuthRoute>
                }
              />
            ))}
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </div>
  )
}

export default App
