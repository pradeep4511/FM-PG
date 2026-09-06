export default function Landing({
  onSelectRole,
}) {
  return (
    <main className="landing">

      <p className="landing-small">
        Bengaluru, one room at a time
      </p>

      <h1>
        Find a PG that actually
        has a vacancy.
      </h1>

      <p className="landing-description">
        Find PGs and hostels listed by
        real owners. Filter by sharing type,
        budget, ratings and distance.
      </p>

      <div className="landing-buttons">

        <button
          className="primary-btn"
          onClick={() =>
            onSelectRole("seeker")
          }
        >
          Find a PG
        </button>

        <button
          className="secondary-btn"
          onClick={() =>
            onSelectRole("owner")
          }
        >
          I own a PG
        </button>

      </div>

    </main>
  );
}