import {
  Star,
  MapPin,
} from "lucide-react";

export default function ListingCard({
  listing,
  distance,
  onOpen,
}) {
  const mainImage =
    listing.pg_images?.find(
      (image) =>
        image.category === "building"
    )?.image_url;

  return (
    <button
      className="listing-card"
      onClick={() =>
        onOpen(listing.id)
      }
    >

      <div className="listing-image">

        <img
          src={
            mainImage ||
            "https://placehold.co/600x400?text=PG"
          }
          alt={listing.name}
        />

        <span className="vacancy-badge">
          {listing.vacancies} Vacant
        </span>

      </div>

      <div className="listing-content">

        <div className="listing-heading">

          <h3>
            {listing.name}
          </h3>

          <span className="rating">
            <Star
              size={15}
              fill="#C97A2B"
            />
            {listing.rating || "New"}
          </span>

        </div>

        <p className="location">

          <MapPin size={14} />

          {listing.area}

          {distance !== null &&
            ` · ${distance.toFixed(1)} km away`}

        </p>

        <div className="sharing-prices">

          {listing.pg_sharing_options?.map(
            (option) => (

              <span
                key={option.id}
              >
                {option.sharing_type}
                {" – "}
                ₹
                {Number(
                  option.price
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            )
          )}

        </div>

      </div>

    </button>
  );
}