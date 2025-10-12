import React, { useState, useEffect, useMemo } from "react";

// ------------------ SVG ICONS ------------------
const TrashIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ------------------ CONSTANTS ------------------
const RANGE_OPTIONS = ["Gold", "Silver", "Platinum"];
const FREQUENCY_OPTIONS = ["Per Month", "Per Year"];
const API_BASE = "http://localhost:3000/integrity-settings";

// ------------------ MAIN COMPONENT ------------------
const Integrity = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // -------- FETCH TIERS --------
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await fetch(API_BASE, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch tiers");

        const data = await res.json();

        setCategories(
          data.map((tier) => ({
            id: tier.id,
            name: tier.name,
            rangeType: tier.name,
            visits: tier.visits,
            visitFrequency: tier.period === "month" ? "Per Month" : "Per Year",
          })),
        );
      } catch (err) {
        console.error("Error fetching tiers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [token]);

  // -------- HANDLERS --------
  const handleAddCategory = () => {
    const usedTypes = categories.map((cat) => cat.rangeType);
    const availableType =
      RANGE_OPTIONS.find((type) => !usedTypes.includes(type)) ||
      RANGE_OPTIONS[0];

    setEditingCategory({
      id: crypto.randomUUID(), // temporary id for frontend
      name: "",
      rangeType: availableType,
      visits: 0,
      visitFrequency: FREQUENCY_OPTIONS[0],
      isNew: true, // mark as new
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tier?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setEditingCategory(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ------------------ UI COMPONENTS ------------------
  const CustomDropdown = ({ label, value, options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const id = useMemo(
      () => `dropdown-${Math.random().toString(36).substring(2, 9)}`,
      [],
    );

    return (
      <div className="relative z-10 w-full mb-6">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            className="flex justify-between items-center w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            id={id}>
            <span>{value}</span>
            <ChevronDownIcon
              className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {isOpen && (
            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-60 z-20">
              <ul
                tabIndex="-1"
                role="listbox"
                aria-labelledby={id}
                className="p-0 m-0">
                {options.map((option) => (
                  <li
                    key={option}
                    className="px-4 py-2 text-gray-800 hover:bg-blue-50 cursor-pointer transition duration-150 ease-in-out"
                    role="option"
                    aria-selected={option === value}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}>
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CategoryEditor = ({ category, setCategory, onDelete }) => {
    const handleChange = (field, value) => {
      setCategory((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
      // Check for duplicate rangeType
      const duplicate = categories.some(
        (cat) => cat.rangeType === category.rangeType && cat.id !== category.id,
      );

      if (duplicate) {
        alert(
          `A category with the range type "${category.rangeType}" already exists.`,
        );
        return;
      }

      try {
        const payload = {
          name: category.rangeType,
          visits: Number(category.visits),
          period: category.visitFrequency === "Per Month" ? "month" : "year",
        };

        const isNew = category.isNew;
        const url = isNew ? API_BASE : `${API_BASE}/${category.id}`;
        const method = isNew ? "POST" : "PATCH";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Save failed");

        const savedTier = await res.json();

        // Map backend response to frontend format
        const mappedTier = {
          id: savedTier.id,
          name: savedTier.name,
          rangeType: savedTier.name,
          visits: savedTier.visits,
          visitFrequency:
            savedTier.period === "month" ? "Per Month" : "Per Year",
        };

        setCategories((prev) => {
          if (isNew) return [...prev, mappedTier]; // add new category
          return prev.map((cat) =>
            cat.id === mappedTier.id ? mappedTier : cat,
          ); // update existing
        });

        setEditingCategory(null); // close editor
      } catch (err) {
        console.error("Save error:", err);
        alert("Failed to save category. Check console for details.");
      }
    };
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 relative">
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
            {category.id ? "Edit Category" : "New Category"}
          </span>
          {category.id && (
            <button
              onClick={() => onDelete(category.id)}
              className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out p-1 rounded-full hover:bg-red-50"
              aria-label="Delete category">
              <TrashIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          <CustomDropdown
            label="Range Type"
            value={category.rangeType}
            options={RANGE_OPTIONS.filter(
              (option) =>
                !categories.some(
                  (cat) => cat.rangeType === option && cat.id !== category.id,
                ),
            )}
            onSelect={(value) => handleChange("rangeType", value)}
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visits
              </label>
              <input
                type="number"
                min="0"
                value={category.visits}
                onChange={(e) =>
                  handleChange("visits", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 pt-6">
              <CustomDropdown
                value={category.visitFrequency}
                options={FREQUENCY_OPTIONS}
                onSelect={(value) => handleChange("visitFrequency", value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200">
            Save Category
          </button>
        </div>
      </div>
    );
  };

  const CategoryList = () => {
    if (categories.length === 0)
      return (
        <div className="text-center py-10 text-gray-500">
          No categories yet.
        </div>
      );

    return (
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <span className="font-medium text-gray-800">
              {cat.rangeType} — {cat.visits} visits (
              {cat.visitFrequency.toLowerCase()})
            </span>
            <button
              onClick={() => setEditingCategory(cat)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Edit
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  // ------------------ PAGE LAYOUT ------------------
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Integrity Settings
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Categories</h2>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add New Category
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {editingCategory ? (
              <CategoryEditor
                category={editingCategory}
                setCategory={setEditingCategory}
                onDelete={handleDeleteCategory}
              />
            ) : (
              <CategoryList />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integrity;
