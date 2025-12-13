import React from "react";

/**
 * Profit Cards Component
 * Displays profit metrics: Today's profit, this month's profit, profit per invoice
 *
 * NOTE: Logic is unchanged. Only styling and layout have been enhanced.
 */
const ProfitCardsSection = ({
  todayMetrics,
  monthMetrics,
  loading = false,
}) => {
  const cards = [
    {
      label: "Gross Profit",
      value: todayMetrics?.grossProfit,
      subtext: `${todayMetrics?.invoiceCount || 0} invoices`,
      icon: "📅",
      color: "blue",
    },
    {
      label: "Net Profit (After Expenses)",
      value: todayMetrics?.netProfit,
      subtext: `Expenses: LKR ${(
        todayMetrics?.totalExpenses || 0
      ).toLocaleString("en-US")}`,
      icon: "💰",
      color: "green",
    },
    {
      label: "Monthly Net Profit",
      value: monthMetrics?.netProfit,
      subtext: `Expenses: LKR ${(
        monthMetrics?.totalExpenses || 0
      ).toLocaleString("en-US")}`,
      icon: "📊",
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="w-full">
      {/* Desktop / Large Tablet View (original grid layout) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${
              colorClasses[card.color]
            } rounded-2xl p-5 sm:p-6 text-white shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
          >
            {/* Subtle decorative circles */}
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full border border-white/20 opacity-40 pointer-events-none" />
            <div className="absolute -right-12 top-8 w-20 h-20 rounded-full border border-white/10 opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mb-4">
              <span className="text-2xl sm:text-3xl">{card.icon}</span>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
            </div>

            <h3 className="relative z-10 text-xs sm:text-sm font-medium text-white/90 mb-1.5 tracking-wide uppercase">
              {card.label}
            </h3>

            <p className="relative z-10 text-2xl sm:text-3xl font-bold mb-1">
              {!loading && typeof card.value === "number"
                ? `LKR ${card.value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : loading
                ? "..."
                : "LKR 0.00"}
            </p>

            <p className="relative z-10 text-xs sm:text-sm text-white/80">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile / Small Tablet View (stacked cards for better UX) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${
              colorClasses[card.color]
            } rounded-2xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
          >
            {/* Subtle decorative circles (same style, smaller screens) */}
            <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full border border-white/20 opacity-40 pointer-events-none" />
            <div className="absolute -right-14 top-6 w-20 h-20 rounded-full border border-white/10 opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-xs sm:text-sm font-medium text-white/90 tracking-wide uppercase">
                  {card.label}
                </h3>
              </div>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <p className="text-2xl font-bold">
                {!loading && typeof card.value === "number"
                  ? `LKR ${card.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : loading
                  ? "..."
                  : "LKR 0.00"}
              </p>
              <p className="text-xs sm:text-sm text-white/80">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitCardsSection;
