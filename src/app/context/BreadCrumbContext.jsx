"use client";

import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Define marketplace-specific home paths
const marketplaceHomePaths = {
  foodmarketplace: {
    label: "Home",
    path: "/foodmarketplace",
  },
  electronicsmarketplace: {
    label: "Home",
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
    console.log("BreadcrumbProvider - Pathname:", pathname);
    console.log("BreadcrumbProvider - Marketplace prop:", marketplace);
    console.log("BreadcrumbProvider - Path Segments:", pathname.split("/").filter(Boolean));
    const pathSegments = pathname.split("/").filter(Boolean);
    const detectedMarketplace = pathSegments[0] in marketplaceHomePaths ? pathSegments[0] : marketplace;
    console.log("BreadcrumbProvider - Detected Marketplace:", detectedMarketplace);
    const homeConfig = detectedMarketplace in marketplaceHomePaths 
      ? marketplaceHomePaths[detectedMarketplace]
      : { label: "Home", path: "/" };
    console.log("BreadcrumbProvider - Home Config:", homeConfig);

    let newBreadcrumbs = [];

    if (pathSegments.length === 0 || !detectedMarketplace) {
      newBreadcrumbs = [{ label: homeConfig.label, path: homeConfig.path }];
    } else if (detectedMarketplace === "foodmarketplace" && pathSegments.length >= 3) {
      // Handle /foodmarketplace/[restaurantName]/[locationName]
      const restaurantSegment = pathSegments[1];
      const locationSegment = pathSegments[2];
      const restaurantLabel = labelMap[restaurantSegment] || 
        restaurantSegment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      const locationLabel = labelMap[locationSegment] || 
        locationSegment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      const combinedLabel = `${restaurantLabel}, ${locationLabel}`;
      newBreadcrumbs = [
        { label: homeConfig.label, path: homeConfig.path },
        {
          label: combinedLabel,
          path: `${homeConfig.path}/${restaurantSegment}/${locationSegment}`,
        },
      ];
    } else {
      // Default case for other paths
      newBreadcrumbs = [
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
    }

    console.log("BreadcrumbProvider - New Breadcrumbs:", newBreadcrumbs);
    setBreadcrumbs(newBreadcrumbs);
  }, [pathname, marketplace]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default BreadcrumbContext;