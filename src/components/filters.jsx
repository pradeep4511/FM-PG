export default function Filters({
  filters,
  setFilters,
}) {

  function updateFilter(
    key,
    value
  ) {
    setFilters({
      ...filters,
      [key]: value,
    });
  }


  return (
    <div className="filters">

      <input
        type="text"
        placeholder="Search PG or area..."
        value={filters.search}
        onChange={(e) =>
          updateFilter(
            "search",
            e.target.value
          )
        }
      />


      <select
        value={filters.area}
        onChange={(e) =>
          updateFilter(
            "area",
            e.target.value
          )
        }
      >
        <option value="">
          All Areas
        </option>

        <option value="Koramangala">
          Koramangala
        </option>

        <option value="HSR Layout">
          HSR Layout
        </option>

        <option value="Whitefield">
          Whitefield
        </option>

        <option value="Marathahalli">
          Marathahalli
        </option>

        <option value="BTM Layout">
          BTM Layout
        </option>

      </select>


      <select
        value={filters.gender}
        onChange={(e) =>
          updateFilter(
            "gender",
            e.target.value
          )
        }
      >
        <option value="">
          All PG Types
        </option>

        <option value="boys">
          Boys
        </option>

        <option value="girls">
          Girls
        </option>

        <option value="coliving">
          Co-living
        </option>

      </select>


      <select
        value={filters.price}
        onChange={(e) =>
          updateFilter(
            "price",
            e.target.value
          )
        }
      >
        <option value="">
          Any Price
        </option>

        <option value="5000">
          Under ₹5,000
        </option>

        <option value="8000">
          Under ₹8,000
        </option>

        <option value="12000">
          Under ₹12,000
        </option>

        <option value="20000">
          Under ₹20,000
        </option>

      </select>


      <button
        className="clear-filter"
        onClick={() =>
          setFilters({
            search: "",
            area: "",
            gender: "",
            price: "",
          })
        }
      >
        Clear
      </button>

    </div>
  );
}