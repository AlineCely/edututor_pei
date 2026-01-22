import type { ReactNode } from 'react';

interface Props {
  headers: string[];
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export default function TableBase({ children, title, actions }: Props) {
   return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        color: "#374151",
        border: "1px solid #eee",
        width: "490px",

      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3>{title}</h3>
        {actions}
      </div>

      {children}
    </div>
  );
}

