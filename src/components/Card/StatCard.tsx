interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon = "📊",
  color = "#4F46E5"
}: StatCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: "120px"
      }}
    >
      {/* Top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#6B7280"
          }}
        >
          {title}
        </span>

        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px"
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#111827"
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span
          style={{
            fontSize: "12px",
            color: "#9CA3AF"
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
