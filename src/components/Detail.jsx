import {
  useState,
} from "react";

import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Check,
} from "lucide-react";

import { supabase }
  from "../lib/supabase";

export default function Detail({
  listing,
  user,
  onBack,
}) {
  const [
    category,
    setCategory,
  ] =
    useState("building");

  const [
    booked,
    setBooked,
  ] =
    useState(false);

  const images =
    listing.pg_images?.filter(
      (image) =>
        image.category ===
        category
    ) || [];

  async function bookPG() {

    if (!user) return;

    const {
      error,
    } =
      await supabase
        .from("bookings")
        .insert({
          pg_id: listing.id,
          seeker_id: user.id,
          status: "pending",
        });

    if (error) {
      alert(
        error.message
      );
      return;
    }

    setBooked(true);
  }

  return (
    <main className="detail-page">

      <button
        className="back-btn"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to listings
      </button>

      <div className="detail-grid">

        <section>

          <div className="main-image">

            {images.length > 0 ? (

              <img
                src={
                  images[0]
                    .image_url
                }
                alt={
                  listing.name
                }
              />

            ) : (

              <img
                src="https://placehold.co/800x500?text=PG"
                alt="PG"
              />

            )}

          </div>

          <div className="image-tabs">

            {[
              "building",
              "rooms",
              "washroom",
              "mess",
            ].map(
              (item) => (

                <button
                  key={item}
                  className={
                    category === item
                      ? "active-chip"
                      : "chip"
                  }
                  onClick={() =>
                    setCategory(
                      item
                    )
                  }
                >
                  {item}
                </button>

              )
            )}

          </div>

          <div className="image-list">

            {images.map(
              (image) => (

                <img
                  key={image.id}
                  src={
                    image.image_url
                  }
                  alt=""
                />

              )
            )}

          </div>

        </section>

        <section className="detail-info">

          <h1>
            {listing.name}
          </h1>

          <p className="detail-location">

            <Star
              size={16}
              fill="#C97A2B"
            />

            {listing.rating || "New"}

            <MapPin
              size={16}
            />

            {listing.area}

          </p>

          <div className="detail-box">

            <h3>
              Sharing & Price
            </h3>

            {listing.pg_sharing_options?.map(
              (option) => (

                <div
                  className="price-row"
                  key={option.id}
                >

                  <span>
                    {
                      option.sharing_type
                    }
                  </span>

                  <strong>
                    ₹
                    {Number(
                      option.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              )
            )}

            <hr />

            <div className="price-row">

              <span>
                Security Deposit
              </span>

              <strong>
                ₹
                {Number(
                  listing.deposit
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="price-row">

              <span>
                Vacancies
              </span>

              <strong>
                {
                  listing.vacancies
                }
              </strong>

            </div>

          </div>

          <div className="contact-box">

            <Phone size={17} />

            {
              listing.contact
            }

          </div>

          {booked ? (

            <div className="booking-success">

              <Check size={18} />

              Booking request sent
              successfully.

            </div>

          ) : (

            <button
              className="primary-btn full-btn"
              onClick={bookPG}
            >
              Pre-book Vacancy
            </button>

          )}

        </section>

      </div>

    </main>
  );
}