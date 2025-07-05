"use client";

import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Define marketplace-specific home paths
const marketplaceHomePaths = {
  foodmarketplace: {
    label: "Food Marketplace",
    path: "/foodmarketplace",
  },
  electronicsmarketplace: {
    label: "Electronics Marketplace",
    path: "/electronicsmarketplace",
  },
  autopartsmarketplace: {
    label: "Auto Parts Marketplace",
    path: "/autopartsmarketplace",
  },
};

const labelMap = {
  "tasty-bites": "Tasty Bites",
  "paldi-ahmedabad": "Paldi, Ahmedabad",
};

const BreadcrumbContext = createContext({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export const BreadcrumbProvider = ({ children, marketplace }) => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);

    const detectedMarketplace = pathSegments[0] in marketplaceHomePaths ? pathSegments[0] : marketplace;
    const homeConfig = detectedMarketplace in marketplaceHomePaths 
      ? marketplaceHomePaths[detectedMarketplace]
      : { label: "Home", path: "/" };

    const newBreadcrumbs = pathSegments.length === 0 || !detectedMarketplace
      ? [{ label: homeConfig.label, path: homeConfig.path }]
      : [
          { label: homeConfig.label, path: homeConfig.path },
          ...pathSegments.slice(1).map((segment, index) => {
            const formattedLabel = labelMap[segment] || 
              segment
                .split("-")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            return {
              label: formattedLabel,
              path: `${homeConfig.path}/${pathSegments.slice(1, index + 2).join("/")}`,
            };
          }),
        ];
    setBreadcrumbs(newBreadcrumbs);
  }, [pathname, marketplace]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default BreadcrumbContext;