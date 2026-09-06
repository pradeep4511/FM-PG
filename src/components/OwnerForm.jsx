import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { uploadImage } from "/workspaces/FM-PG/src/uploadImage.js";

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
  const [name, setName] = useState("");

  const [gender, setGender] =
    useState("girls");

  const [area, setArea] =
    useState("Koramangala");

  const [contact, setContact] =
    useState(owner?.phone || "");

  const [vacancies, setVacancies] =
    useState("");

  const [deposit, setDeposit] =
    useState("");

  const [
    sharingOptions,
    setSharingOptions,
  ] = useState([
    {
      type: "2 Sharing",
      price: "",
    },
  ]);

  const [
    buildingFiles,
    setBuildingFiles,
  ] = useState([]);

  const [
    roomFiles,
    setRoomFiles,
  ] = useState([]);

  const [
    washroomFiles,
    setWashroomFiles,
  ] = useState([]);

  const [
    messFiles,
    setMessFiles,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);


  function updateOption(
    index,
    field,
    value
  ) {
    const updated = [
      ...sharingOptions,
    ];

    updated[index][field] = value;

    setSharingOptions(updated);
  }


  async function uploadFiles(
    files,
    category,
    pgId
  ) {
    if (!files || files.length === 0) {
      return;
    }

    for (const file of files) {
      const fileName =
        `${pgId}/${Date.now()}-${file.name}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("pg-images")
        .upload(
          fileName,
          file
        );

      if (uploadError) {
        throw new Error(
          `Failed to upload ${file.name}: ${uploadError.message}`
        );
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("pg-images")
        .getPublicUrl(fileName);

      const {
        error: imageInsertError,
      } = await supabase
        .from("pg_images")
        .insert({
          pg_id: pgId,
          category,
          image_url:
            publicUrlData.publicUrl,
        });

      if (imageInsertError) {
        throw new Error(
          `Failed to save image record: ${imageInsertError.message}`
        );
      }
    }
  }


  async function handleSubmit(e) {
    e.preventDefault();


    // Basic validation

    if (!name.trim()) {
      alert("Please enter PG name");
      return;
    }


    if (!contact.trim()) {
      alert(
        "Please enter contact number"
      );
      return;
    }


    if (
      vacancies === "" ||
      Number(vacancies) < 0
    ) {
      alert(
        "Please enter valid number of vacancies"
      );
      return;
    }


    if (
      deposit === "" ||
      Number(deposit) < 0
    ) {
      alert(
        "Please enter valid deposit amount"
      );
      return;
    }


    const hasValidPrice =
      sharingOptions.some(
        (option) =>
          option.price !== "" &&
          Number(option.price) > 0
      );


    if (!hasValidPrice) {
      alert(
        "Please add at least one sharing type with valid price"
      );
      return;
    }


    setLoading(true);


    try {
      /*
       * STEP 1
       * Get current authenticated user
       */

      const {
        data: {
          user: authUser,
        },
        error: authError,
      } = await supabase.auth.getUser();


      if (authError) {
        throw authError;
      }


      if (!authUser) {
        throw new Error(
          "No authenticated user found. Please log out and log in again."
        );
      }


      console.log(
        "CURRENT AUTH USER ID:",
        authUser.id
      );


      /*
       * STEP 2
       * Verify matching profile exists
       */

      const {
        data: currentProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "id",
          authUser.id
        )
        .single();


      if (
        profileError ||
        !currentProfile
      ) {
        throw new Error(
          `Owner profile not found: ${
            profileError?.message ||
            "Unknown error"
          }`
        );
      }


      /*
       * STEP 3
       * Verify this account is an owner
       */

      if (
        currentProfile.role !==
        "owner"
      ) {
        throw new Error(
          "Only PG owners can create a PG listing."
        );
      }


      console.log(
        "OWNER PROFILE:",
        currentProfile
      );


      /*
       * STEP 4
       * Create PG listing
       */

      const {
        data: listing,
        error: listingError,
      } = await supabase
        .from("pg_listings")
        .insert({
          owner_id:
            authUser.id,

          name:
            name.trim(),

          gender,

          area,

          contact:
            contact.trim(),

          vacancies:
            Number(vacancies),

          deposit:
            Number(deposit),

          rating:
            0,
        })
        .select()
        .single();


      if (listingError) {
        console.error(
          "Listing creation error:",
          listingError
        );

        throw new Error(
          `Failed to create listing: ${listingError.message}`
        );
      }


      console.log(
        "PG LISTING CREATED:",
        listing
      );


      /*
       * STEP 5
       * Save sharing options
       */

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
      } = await supabase
        .from(
          "pg_sharing_options"
        )
        .insert(
          sharingData
        );


      if (sharingError) {
        throw new Error(
          `Failed to save sharing options: ${sharingError.message}`
        );
      }


      console.log(
        "SHARING OPTIONS SAVED"
      );


      /*
       * STEP 6
       * Upload building images
       */

      try {
        await uploadFiles(
          buildingFiles,
          "building",
          listing.id
        );
      } catch (error) {
        console.warn(
          "Building images failed:",
          error
        );
      }


      /*
       * STEP 7
       * Upload room images
       */

      try {
        await uploadFiles(
          roomFiles,
          "rooms",
          listing.id
        );
      } catch (error) {
        console.warn(
          "Room images failed:",
          error
        );
      }


      /*
       * STEP 8
       * Upload washroom images
       */

      try {
        await uploadFiles(
          washroomFiles,
          "washroom",
          listing.id
        );
      } catch (error) {
        console.warn(
          "Washroom images failed:",
          error
        );
      }


      /*
       * STEP 9
       * Upload mess images
       */

      try {
        await uploadFiles(
          messFiles,
          "mess",
          listing.id
        );
      } catch (error) {
        console.warn(
          "Mess images failed:",
          error
        );
      }


      console.log(
        "PG LISTING CREATED SUCCESSFULLY"
      );


      alert(
        "PG listed successfully!"
      );


      onSuccess();


    } catch (error) {

      console.error(
        "Error creating listing:",
        error
      );


      alert(
        error.message ||
        "Failed to create listing. Please try again."
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
          onSubmit={handleSubmit}
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
              min="0"
              value={deposit}
              onChange={(e) =>
                setDeposit(
                  e.target.value
                )
              }
              required
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
                  min="1"
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
            disabled={loading}
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