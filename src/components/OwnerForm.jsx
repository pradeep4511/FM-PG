import {
  useState,
} from "react";

import {
  Plus,
  Minus,
} from "lucide-react";

import { supabase }
  from "../lib/supabase";

const sharingTypes = [
  "2 Sharing",
  "3 Sharing",
  "4 Sharing",
  "5 Sharing",
];

const areas = [
  "Koramangala",
  "HSR Layout",
  "Indiranagar",
  "Whitefield",
  "BTM Layout",
  "Marathahalli",
  "Electronic City",
  "Jayanagar",
];

export default function OwnerForm({
  owner,
  onSuccess,
}) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    gender,
    setGender,
  ] =
    useState("girls");

  const [
    area,
    setArea,
  ] =
    useState(
      "Koramangala"
    );

  const [
    contact,
    setContact,
  ] =
    useState(
      owner.phone || ""
    );

  const [
    vacancies,
    setVacancies,
  ] =
    useState("");

  const [
    deposit,
    setDeposit,
  ] =
    useState("");

  const [
    sharingOptions,
    setSharingOptions,
  ] =
    useState([
      {
        type: "2 Sharing",
        price: "",
      },
    ]);

  const [
    buildingFiles,
    setBuildingFiles,
  ] =
    useState([]);

  const [
    roomFiles,
    setRoomFiles,
  ] =
    useState([]);

  const [
    washroomFiles,
    setWashroomFiles,
  ] =
    useState([]);

  const [
    messFiles,
    setMessFiles,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  function updateOption(
    index,
    field,
    value
  ) {

    const updated =
      [...sharingOptions];

    updated[index][field] =
      value;

    setSharingOptions(
      updated
    );
  }

  async function uploadFiles(
    files,
    category,
    pgId
  ) {

    for (
      const file of files
    ) {

      const fileName =
        `${pgId}/${Date.now()}-${file.name}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("pg-images")
          .upload(
            fileName,
            file
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data,
      } =
        supabase.storage
          .from("pg-images")
          .getPublicUrl(
            fileName
          );

      await supabase
        .from("pg_images")
        .insert({
          pg_id: pgId,
          category,
          image_url:
            data.publicUrl,
        });

    }
  }

  async function handleSubmit(
    e
  ) {

    e.preventDefault();

    setLoading(true);

    try {

      // 1. Create PG listing

      const {
        data: listing,
        error: listingError,
      } =
        await supabase
          .from("pg_listings")
          .insert({
            owner_id: owner.id,
            name,
            gender,
            area,
            contact,
            vacancies:
              Number(
                vacancies
              ),
            deposit:
              Number(
                deposit
              ),
            rating: 0,
          })
          .select()
          .single();

      if (
        listingError
      ) {
        throw listingError;
      }

      // 2. Save sharing options

      const sharingData =
        sharingOptions.map(
          (option) => ({
            pg_id:
              listing.id,
            sharing_type:
              option.type,
            price:
              Number(
                option.price
              ),
          })
        );

      const {
        error: sharingError,
      } =
        await supabase
          .from(
            "pg_sharing_options"
          )
          .insert(
            sharingData
          );

      if (
        sharingError
      ) {
        throw sharingError;
      }

      // 3. Upload images

      await uploadFiles(
        buildingFiles,
        "building",
        listing.id
      );

      await uploadFiles(
        roomFiles,
        "rooms",
        listing.id
      );

      await uploadFiles(
        washroomFiles,
        "washroom",
        listing.id
      );

      await uploadFiles(
        messFiles,
        "mess",
        listing.id
      );

      onSuccess();

    } catch (error) {

      alert(
        error.message
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="owner-page">

      <div className="owner-form">

        <h2>
          List Your PG
        </h2>

        <p>
          Add your PG details
          so seekers can find it.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>
            PG Name

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            PG Type

            <select
              value={gender}
              onChange={(e) =>
                setGender(
                  e.target.value
                )
              }
            >

              <option value="girls">
                Girls
              </option>

              <option value="boys">
                Boys
              </option>

              <option value="coliving">
                Co-living
              </option>

            </select>

          </label>

          <label>
            Area

            <select
              value={area}
              onChange={(e) =>
                setArea(
                  e.target.value
                )
              }
            >

              {areas.map(
                (item) => (

                  <option
                    key={item}
                  >
                    {item}
                  </option>

                )
              )}

            </select>

          </label>

          <label>
            Contact Number

            <input
              value={contact}
              onChange={(e) =>
                setContact(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            Number of Vacancies

            <input
              type="number"
              min="0"
              value={vacancies}
              onChange={(e) =>
                setVacancies(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            Security Deposit ₹

            <input
              type="number"
              value={deposit}
              onChange={(e) =>
                setDeposit(
                  e.target.value
                )
              }
            />

          </label>

          <h3>
            Sharing & Price
          </h3>

          {sharingOptions.map(
            (
              option,
              index
            ) => (

              <div
                className="sharing-row"
                key={index}
              >

                <select
                  value={
                    option.type
                  }
                  onChange={(e) =>
                    updateOption(
                      index,
                      "type",
                      e.target.value
                    )
                  }
                >

                  {sharingTypes.map(
                    (type) => (

                      <option
                        key={type}
                      >
                        {type}
                      </option>

                    )
                  )}

                </select>

                <input
                  type="number"
                  placeholder="Price ₹"
                  value={
                    option.price
                  }
                  onChange={(e) =>
                    updateOption(
                      index,
                      "price",
                      e.target.value
                    )
                  }
                  required
                />

                {sharingOptions.length >
                  1 && (

                  <button
                    type="button"
                    onClick={() =>
                      setSharingOptions(
                        sharingOptions.filter(
                          (
                            _,
                            i
                          ) =>
                            i !==
                            index
                        )
                      )
                    }
                  >
                    <Minus
                      size={16}
                    />
                  </button>

                )}

              </div>

            )
          )}

          <button
            type="button"
            className="add-sharing"
            onClick={() =>
              setSharingOptions([
                ...sharingOptions,
                {
                  type:
                    "2 Sharing",
                  price:
                    "",
                },
              ])
            }
          >

            <Plus size={16} />

            Add Sharing Type

          </button>

          <label>
            Building Images

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setBuildingFiles(
                  Array.from(
                    e.target.files
                  )
                )
              }
            />

          </label>

          <label>
            Room Images

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setRoomFiles(
                  Array.from(
                    e.target.files
                  )
                )
              }
            />

          </label>

          <label>
            Washroom Images

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setWashroomFiles(
                  Array.from(
                    e.target.files
                  )
                )
              }
            />

          </label>

          <label>
            Mess Images

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setMessFiles(
                  Array.from(
                    e.target.files
                  )
                )
              }
            />

          </label>

          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={
              loading
            }
          >

            {loading
              ? "Uploading..."
              : "List My PG"}

          </button>

        </form>

      </div>

    </main>
  );
}