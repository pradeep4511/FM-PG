import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import ListingCard
  from "./ListingCard";

const sharingTypes = [
  "2 Sharing",
  "3 Sharing",
  "4 Sharing",
  "5 Sharing",
];

const genders = [
  {
    id: "girls",
    label: "Girls",
  },
  {
    id: "boys",
    label: "Boys",
  },
  {
    id: "coliving",
    label: "Co-living",
  },
];

export default function Browse({
  listings,
  onOpen,
}) {
  const [
    gender,
    setGender,
  ] =
    useState("girls");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedSharing,
    setSelectedSharing,
  ] =
    useState([]);

  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState("");

  const [
    minRating,
    setMinRating,
  ] =
    useState(0);

  const [
    sort,
    setSort,
  ] =
    useState("distance");

  function toggleSharing(type) {

    if (
      selectedSharing.includes(
        type
      )
    ) {

      setSelectedSharing(
        selectedSharing.filter(
          (item) =>
            item !== type
        )
      );

    } else {

      setSelectedSharing([
        ...selectedSharing,
        type,
      ]);

    }
  }

  const filtered =
    useMemo(() => {

      let result =
        listings.filter(
          (listing) => {

            // Hide PGs with no vacancy
            if (
              listing.vacancies <= 0
            ) {
              return false;
            }

            // Girls / Boys / Co-living
            if (
              listing.gender !== gender
            ) {
              return false;
            }

            // Search
            if (
              search &&
              !listing.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            ) {
              return false;
            }

            // Sharing
            if (
              selectedSharing.length > 0
            ) {

              const available =
                listing.pg_sharing_options?.some(
                  (option) =>
                    selectedSharing.includes(
                      option.sharing_type
                    )
                );

              if (!available) {
                return false;
              }

            }

            // Rating
            if (
              Number(
                listing.rating || 0
              ) < minRating
            ) {
              return false;
            }

            // Budget
            if (
              maxPrice
            ) {

              const cheapest =
                Math.min(
                  ...listing.pg_sharing_options.map(
                    (option) =>
                      Number(
                        option.price
                      )
                  )
                );

              if (
                cheapest >
                Number(maxPrice)
              ) {
                return false;
              }

            }

            return true;

          }
        );

      result.sort(
        (a, b) => {

          if (
            sort === "price"
          ) {

            const aPrice =
              Math.min(
                ...a.pg_sharing_options.map(
                  (o) =>
                    Number(o.price)
                )
              );

            const bPrice =
              Math.min(
                ...b.pg_sharing_options.map(
                  (o) =>
                    Number(o.price)
                )
              );

            return (
              aPrice - bPrice
            );

          }

          if (
            sort === "rating"
          ) {

            return (
              Number(
                b.rating
              ) -
              Number(
                a.rating
              )
            );

          }

          return 0;

        }
      );

      return result;

    }, [
      listings,
      gender,
      search,
      selectedSharing,
      maxPrice,
      minRating,
      sort,
    ]);

  return (
    <main className="browse-page">

      <div className="gender-tabs">

        {genders.map(
          (item) => (

            <button
              key={item.id}
              className={
                gender === item.id
                  ? "active-chip"
                  : "chip"
              }
              onClick={() =>
                setGender(
                  item.id
                )
              }
            >
              {item.label}
            </button>

          )
        )}

      </div>

      <div className="filters">

        <div className="search-box">

          <Search size={16} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search PG name"
          />

        </div>

        {sharingTypes.map(
          (type) => (

            <button
              key={type}
              className={
                selectedSharing.includes(
                  type
                )
                  ? "active-chip"
                  : "chip"
              }
              onClick={() =>
                toggleSharing(
                  type
                )
              }
            >
              {type}
            </button>

          )
        )}

        <select
          value={minRating}
          onChange={(e) =>
            setMinRating(
              Number(
                e.target.value
              )
            )
          }
        >
          <option value="0">
            Any Rating
          </option>

          <option value="3.5">
            3.5+
          </option>

          <option value="4">
            4+
          </option>

          <option value="4.5">
            4.5+
          </option>

        </select>

        <input
          type="number"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(
              e.target.value
            )
          }
          placeholder="Max Budget ₹"
        />

        <select
          value={sort}
          onChange={(e) =>
            setSort(
              e.target.value
            )
          }
        >

          <option value="distance">
            Nearest First
          </option>

          <option value="price">
            Price: Low to High
          </option>

          <option value="rating">
            Rating: High to Low
          </option>

        </select>

      </div>

      <div className="listing-grid">

        {filtered.map(
          (listing) => (

            <ListingCard
              key={listing.id}
              listing={listing}
              distance={null}
              onOpen={onOpen}
            />

          )
        )}

      </div>

      {filtered.length === 0 && (

        <p className="no-results">
          No PGs match your filters.
        </p>

      )}

    </main>
  );
}