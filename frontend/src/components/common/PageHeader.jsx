import React from "react";

/**
 * Reusable page header component
 * @param {string} icon - Emoji or icon to display
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {ReactNode} action - Optional action button or element (e.g., Add button)
 * @param {string} className - Additional CSS classes
 */
const PageHeader = ({
  icon = "📄",
  title = "Page Title",
  description = "",
  action = null,
  className = "",
}) => {
  return (
    <div className={`max-w-7xl mx-auto mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-4 w-full md:w-auto flex-col sm:flex-row">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="w-full md:w-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 mt-2 max-w-2xl text-sm md:text-base mx-auto md:mx-0">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
