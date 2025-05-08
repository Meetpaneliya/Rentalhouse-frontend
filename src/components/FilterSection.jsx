import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Listings from "../pages/Listings";
import { FaChevronDown } from "react-icons/fa";
import { MdApartment, MdHotel } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar2";
import { useSearchQuery } from "../redux/APi/listingApi";
import toast from "react-hot-toast";
import { skipToken } from "@reduxjs/toolkit/query";

const FilterSection = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const city = params.get("city");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  // Always call the hook, even if params are missing
  const { data, isLoading, error } = useSearchQuery(
    city && startDate && endDate ? { city, startDate, endDate } : skipToken // <-- prevents request if missing
  );

  const amenitiesList = ["WiFi", "AC", "Geyser", "More"];

  const [filters, setFilters] = useState({
    price: [500, 5000],
    rooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    location: "",
    rentalRoomName: "",
  });

  const [isResetChecked, setIsResetChecked] = useState(false); // ✅ Moved inside component
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showNearbyFilter, setShowNearbyFilter] = useState(false);
  const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
  const [showBedBathFilter, setShowBedBathFilter] = useState(false);
  const [showAmenitiesFilter, setShowAmenitiesFilter] = useState(false);
  const [showRoomNameFilter, setshowRoomNameFilter] = useState(false);
  const [showResetFilter, setShowResetFilter] = useState(false);
  const [showAvailableFilter, setShowAvailableFilter] = useState(false);

  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);

  const priceFilterRef = useRef(null);
  const nearbyFilterRef = useRef(null);
  const bedroomsFilterRef = useRef(null);
  const bedBathFilterRef = useRef(null);
  const amenitiesFilterRef = useRef(null);
  const RoomNameFilterRef = useRef(null);
  const resetFilterRef = useRef(null);
  const availableFilterRef = useRef(null);

  // Handle property type selection
  const handlePropertyTypeSelect = (type) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      propertyType: type,
    }));
    //onFilterChange({ ...filters, propertyType: type });
    setShowBedroomsFilter(false);
  };

  // Update bedroom/bathroom count
  const updateCount = (type, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: Math.max(1, prevFilters[type] + value),
    }));
  };

  // Handle amenity selection
  const handleAmenityChange = (amenity) => {
    setFilters((prevFilters) => {
      const updatedAmenities = prevFilters.amenities.includes(amenity)
        ? prevFilters.amenities.filter((item) => item !== amenity)
        : [...prevFilters.amenities, amenity];
      return { ...prevFilters, amenities: updatedAmenities };
    });
  };

  // Filter listings by Room Title
  const handleRoomTitleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      rentalRoomName: e.target.value,
    }));
  };

  // Handle available only toggle
  const handleAvailableChange = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      availableOnly: !prevFilters.availableOnly,
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [
        priceFilterRef,
        nearbyFilterRef,
        bedroomsFilterRef,
        bedBathFilterRef,
        amenitiesFilterRef,
        RoomNameFilterRef,
        resetFilterRef,
        availableFilterRef,
      ];
      const states = [
        setShowPriceFilter,
        setShowNearbyFilter,
        setShowBedroomsFilter,
        setShowBedBathFilter,
        setShowAmenitiesFilter,
        setshowRoomNameFilter,
        setShowResetFilter,
        setShowAvailableFilter,
      ];

      refs.forEach((ref, index) => {
        if (ref.current && !ref.current.contains(event.target)) {
          states[index](false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch listings from the API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER}/api/v1/listings/all`
        );
        setListings(response.data);
        setFilteredListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    fetchListings();
  }, []);

  // Apply filtering only when filters change

  useEffect(() => {
    if (
      filters &&
      (filters.rentalRoomName ||
        filters.location ||
        filters.propertyType ||
        filters.amenities.length > 0 ||
        filters.rooms > 1 || // Updated condition
        filters.beds > 1 || // Updated condition
        filters.bathrooms > 1 || // Updated condition
        filters.price[0] !== 500 ||
        filters.price[1] !== 5000)
    ) {
      const filtered = listings.filter((listing) => {
        return (
          listing.price >= filters.price[0] &&
          listing.price <= filters.price[1] &&
          listing.rooms >= filters.rooms &&
          listing.beds >= filters.beds &&
          listing.bathrooms >= filters.bathrooms &&
          (!filters.location ||
            listing.location
              .toLowerCase()
              .includes(filters.location.toLowerCase())) &&
          (!filters.propertyType ||
            listing.propertyType === filters.propertyType) &&
          (!filters.rentalRoomName ||
            listing.title
              .toLowerCase()
              .includes(filters.rentalRoomName.toLowerCase())) &&
          (filters.amenities.length === 0 ||
            filters.amenities.some((amenity) =>
              listing.amenities.includes(amenity)
            )) // Updated condition
        );
      });
      console.log("filterd listing: ", filtered);

      setFilteredListings(filtered);
    } else {
      setFilteredListings([...listings]);
    }
  }, [filters, listings]);

  // ✅ Proper Reset Filters Function
  const handleResetFilters = () => {
    setFilters({
      price: [500, 5000],
      rooms: 1,
      beds: 1,
      bathrooms: 1,
      amenities: [],
      location: "",
      propertyType: "",
      availableOnly: false,
      rentalRoomName: "",
    });
  };

  // Update the filter handlers to include navigation
  const handleFilterApply = () => {
    navigate("/filtered-listings", { state: { filters } });
  };

  // Update price filter
  const handlePriceApply = () => {
    setShowPriceFilter(false);
    handleFilterApply();
  };

  // Update nearby filter
  const handleNearbyApply = () => {
    setShowNearbyFilter(false);
    handleFilterApply();
  };

  // Update property type filter
  const handlePropertyTypeApply = () => {
    setShowBedroomsFilter(false);
    handleFilterApply();
  };

  // Update bed/bath filter
  const handleBedBathApply = () => {
    setShowBedBathFilter(false);
    handleFilterApply();
  };

  // Update amenities filter
  const handleAmenitiesApply = () => {
    setShowAmenitiesFilter(false);
    handleFilterApply();
  };

  // Update listing room filter
  const handleListingRoomApply = () => {
    setshowRoomNameFilter(false);
    handleFilterApply();
  };

  // Update available filter
  const handleAvailableApply = () => {
    setShowAvailableFilter(false);
    handleFilterApply();
  };

  return (
    <div>
      {/* All Filter */}
      <div className="w-full mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
        {/* Header and filters container */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          {/* Logo container */}
          <Navbar />
        </div>

        {/* Filters grid */}
        <div className=" w-auto mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex gap-2 sm:gap-4">
          {/* Price Filter */}
          <div className="relative w-full" ref={priceFilterRef}>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Price</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showPriceFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Price Range
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={`$${filters.price[0]}`}
                    readOnly
                    className="w-1/2 px-4 py-2 border rounded-lg text-gray-500 text-center mr-2"
                  />
                  <input
                    type="text"
                    value={`$${filters.price[1]}`}
                    readOnly
                    className="w-1/2 px-4 py-2 border rounded-lg text-gray-500 text-center"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    value={filters.price[0]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        price: [Number(e.target.value), prev.price[1]],
                      }))
                    }
                    className="w-full bg-indigo-900 h-2 rounded-lg outline-none"
                  />
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    value={filters.price[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        price: [prev.price[0], Number(e.target.value)],
                      }))
                    }
                    className="w-full bg-indigo-900 h-2 rounded-lg outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Unsure of your price range?{" "}
                  <a href="#" className="text-indigo-800 underline">
                    Get pre-approved.
                  </a>
                </p>
                <button
                  className="w-full bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handlePriceApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Nearby Filter */}
          <div className="relative w-full" ref={nearbyFilterRef}>
            <button
              onClick={() => setShowNearbyFilter(!showNearbyFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Nearby</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showNearbyFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <h3 className="text-lg font-semibold mb-4">
                  Search by Neighborhood
                </h3>
                <input
                  type="text"
                  placeholder="Search by Neighborhood"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-500 mb-4"
                />
                <div className="space-y-2">
                  {[
                    "Brooklyn",
                    "Bedford-Stuyvesant, Brooklyn",
                    "Bushwick, Brooklyn",
                    "Clinton Hill, Brooklyn",
                    "Crown Heights, Brooklyn",
                  ]
                    .filter((neighborhood) =>
                      neighborhood
                        .toLowerCase()
                        .includes(filters.location.toLowerCase())
                    )
                    .map((neighborhood, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.location === neighborhood}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              location: neighborhood,
                            }))
                          }
                          className="form-checkbox h-4 w-4 text-indigo-800"
                        />
                        <span>{neighborhood}</span>
                      </label>
                    ))}
                </div>
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handleNearbyApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Property Type Filter */}
          <div className="relative w-full" ref={bedroomsFilterRef}>
            <button
              onClick={() => setShowBedroomsFilter(!showBedroomsFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>{filters.propertyType || "Property Type"}</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showBedroomsFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <div className="flex justify-between items-center mb-4">
                  <div
                    className={`w-1/2 p-4 border rounded-lg flex flex-col items-center cursor-pointer ${
                      filters.propertyType === "Apartment"
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handlePropertyTypeSelect("apartment")}
                  >
                    <MdApartment className="text-3xl text-indigo-800" />
                    <span className="mt-2 font-medium">Apartment</span>
                  </div>
                  <div
                    className={`w-1/2 p-4 border rounded-lg flex flex-col items-center cursor-pointer ${
                      filters.propertyType === "Bedroom"
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handlePropertyTypeSelect("hotel")}
                  >
                    <MdHotel className="text-3xl text-indigo-800" />
                    <span className="mt-2 font-medium">Hotel</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  This is a shared apartment that you will rent with other
                  roommates. June will help you find them.
                </p>
                <button
                  className="w-full bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handlePropertyTypeApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Bed/Bath Filter */}
          <div className="relative w-full" ref={bedBathFilterRef}>
            <button
              onClick={() => setShowBedBathFilter(!showBedBathFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Bed/Bath</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showBedBathFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <div className="grid grid-cols-2 divide-x">
                  <div className="flex flex-col items-center px-4">
                    <span className="text-indigo-700 font-semibold text-lg">
                      Bed
                    </span>
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => updateCount("beds", -1)}
                        className="bg-indigo-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-900"
                      >
                        −
                      </button>
                      <span className="text-indigo-700 font-bold text-lg">
                        {filters.beds}
                      </span>

                      <button
                        onClick={() => updateCount("beds", 1)}
                        className="bg-indigo-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-900"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-indigo-700 font-semibold text-lg">
                      Bath
                    </span>
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => updateCount("bathrooms", -1)}
                        className="bg-indigo-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-900"
                      >
                        −
                      </button>
                      <span className="text-indigo-700 font-bold text-lg">
                        {filters.bathrooms}
                      </span>

                      <button
                        onClick={() => updateCount("bathrooms", 1)}
                        className="bg-indigo-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-900"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handleBedBathApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Amenities Filter */}
          <div className="relative w-full" ref={amenitiesFilterRef}>
            <button
              onClick={() => setShowAmenitiesFilter(!showAmenitiesFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Amenities</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showAmenitiesFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-72 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <div className="space-y-3">
                  {amenitiesList.map((amenity, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="form-checkbox h-5 w-5 text-indigo-800 rounded bg-indigo-800"
                      />
                      <span className="text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handleAmenitiesApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Listing Room Filter */}
          <div className="relative w-full" ref={RoomNameFilterRef}>
            <button
              onClick={() => setshowRoomNameFilter(!showRoomNameFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Listing Room</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showRoomNameFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Listing Room
                </h3>
                <input
                  type="text"
                  value={filters.rentalRoomName}
                  onChange={handleRoomTitleFilterChange}
                  placeholder="Enter the Rental Room Name"
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handleListingRoomApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Available Filter */}
          <div className="relative w-full" ref={availableFilterRef}>
            <button
              onClick={() => setShowAvailableFilter(!showAvailableFilter)}
              className="w-full px-3 sm:px-4 py-2 border rounded-full shadow text-black flex items-center justify-between cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
            >
              <span>Available</span>
              <FaChevronDown className="text-black ml-1" />
            </button>
            {showAvailableFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-72 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={handleAvailableChange}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="text-indigo-700 font-semibold text-lg">
                    Show only Available
                  </span>
                </label>
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={handleAvailableApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Reset Filter */}
          <div className="relative w-full" ref={resetFilterRef}>
            <button
              onClick={() => setShowResetFilter(!showResetFilter)}
              className="w-full px-3 sm:px-4 py-2 bg-red-600 text-white rounded-full shadow cursor-pointer hover:bg-red-700 text-sm sm:text-base"
            >
              Reset
            </button>
            {showResetFilter && (
              <div className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto mt-3 w-full sm:w-80 bg-white shadow-xl rounded-t-xl sm:rounded-xl p-4 sm:p-6 z-50 border border-gray-300 sm:translate-y-0 translate-y-0 transition-transform">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isResetChecked}
                    onChange={() => setIsResetChecked(!isResetChecked)} // Toggle checkbox state
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="text-indigo-700 font-semibold text-lg">
                    Reset Filters
                  </span>
                </label>
                <button
                  className="w-full mt-4 bg-indigo-800 text-white py-2 rounded-lg hover:bg-indigo-900"
                  onClick={() => {
                    handleResetFilters(); // Reset filters
                    setShowResetFilter(false); // Close dropdown
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listings + Map section */}
      <div>
        <Listings listings={filteredListings} data={data} city={city} />
      </div>
    </div>
  );
};

export default FilterSection;
