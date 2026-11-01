export default function JobDetailsLoading() {
  return (
    <main className="job-details-page" id="main-content" aria-busy="true">
      <div className="container">
        <div className="vagas-empty-container">
          <div className="dashboard-empty-state" style={{ minHeight: "180px", flexDirection: "column", gap: "1rem" }}>
            <p role="status">Carregando os detalhes da vaga…</p>
          </div>
        </div>
      </div>
    </main>
  );
}
