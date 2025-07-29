import { useContext } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BreadcrumbContext from "@/app/context/BreadCrumbContext";

// Animation variants for individual breadcrumb items
const breadcrumbItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Breadcrumbs() {
  const { breadcrumbs } = useContext(BreadcrumbContext);

  // console.log("Breadcrumbs Component - Breadcrumbs:", breadcrumbs); // Debug log

  return (
    <AnimatePresence>
      {breadcrumbs.length > 0 && (
        <div className="w-full px-4 py-2 bg-white text-black sticky top-0 z-50 shadow-sm">
          <nav className="flex items-center text-sm font-medium">
            {breadcrumbs.map((crumb, index) => (
              <motion.span
                key={crumb.path}
                className="flex items-center"
                variants={breadcrumbItemVariants}
                initial="hidden"
                animate="visible"
              >
                {index > 0 && (
                  <span className="mx-2 text-gray-200">/</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-black font-semibold px-2 py-1 rounded-md">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className=" text-black hover:text-gray-800 px-2 py-1 rounded-md transition-all duration-200"
                  >
                    {crumb.label}
                  </Link>
                )}
              </motion.span>
            ))}
          </nav>
        </div>
      )}
    </AnimatePresence>
  );
}
