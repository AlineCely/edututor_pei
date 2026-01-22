export default function Pagination() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginTop: "12px"
      }}
    >
      <button>{"<"}</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>{">"}</button>
    </div>
  );
}
