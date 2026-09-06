export default function Landing({
  onBrowse,
  onOwner,
}) {
  return (
    <main className="landing">

      <section className="hero">

        <div className="hero-content">

          <span className="hero-tag">
            Find Your Perfect Stay
          </span>

          <h1>
            Find the Perfect
            <span> PG Near You</span>
          </h1>

          <p>
            Discover verified PGs,
            compare prices and find
            your comfortable home.
          </p>

          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={onBrowse}
            >
              Explore PGs
            </button>

            <button
              className="secondary-btn"
              onClick={onOwner}
            >
              List Your PG
            </button>

          </div>

        </div>

      </section>


      <section className="landing-features">

        <div className="feature-card">
          <h3>🏠 Easy Search</h3>

          <p>
            Find PGs based on
            location and preferences.
          </p>
        </div>


        <div className="feature-card">
          <h3>💰 Compare Prices</h3>

          <p>
            Compare sharing options
            and monthly prices.
          </p>
        </div>


        <div className="feature-card">
          <h3>📸 Real Images</h3>

          <p>
            View uploaded PG,
            room and facility images.
          </p>
        </div>

      </section>

    </main>
  );
}