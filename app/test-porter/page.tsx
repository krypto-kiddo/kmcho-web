export default function PorterTest() {
  return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ color: "#c9a84c", marginBottom: "16px", fontSize: "16px", alignSelf: "flex-start" }}>Porter tracking</h1>
      <iframe
        src="https://porter.in/rd/d7c234488c"
        style={{ width: "390px", height: "80vh", border: "none", borderRadius: "16px", maxWidth: "100%" }}
      />
    </main>
  );
}