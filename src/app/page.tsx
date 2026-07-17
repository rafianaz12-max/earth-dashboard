"use client";

import React, { useEffect, useState } from "react";

interface Country {
  name: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  independent?: boolean;
  unMember?: boolean;
  flag?: string;
}

export default function Page() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filtered, setFiltered] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const [independentFilter, setIndependentFilter] = useState("");
  const [unFilter, setUnFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Countries data
        const resCountries = await fetch("https://countries.dev/countries");
        const countriesData = await resCountries.json();

        // Flags data
        const resFlags = await fetch("https://countriesnow.space/api/v0.1/countries/flag/images");
        const flagsData = await resFlags.json();

        // Merge datasets
        const merged = countriesData.map((c: any) => {
          const flagMatch = flagsData.data.find(
            (f: any) => f.name.toLowerCase() === c.name.toLowerCase()
          );
          return {
            ...c,
            flag: flagMatch?.flag || null,
          };
        });

        setCountries(merged);
        setFiltered(merged);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...countries];
    // Search
    if (search) {
      result = result.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const capital = c.capital?.toLowerCase() || "";
        const region = c.region?.toLowerCase() || "";
        return (
          name.includes(search.toLowerCase()) ||
          capital.includes(search.toLowerCase()) ||
          region.includes(search.toLowerCase())
        );
      });
    }
    // Filters
    if (continentFilter) {
      result = result.filter((c) => c.region === continentFilter);
    }
    if (independentFilter) {
      result = result.filter((c) =>
        independentFilter === "Yes" ? c.independent : !c.independent
      );
    }
    if (unFilter) {
      result = result.filter((c) =>
        unFilter === "Yes" ? c.unMember : !c.unMember
      );
    }
    // Sorting
    if (sort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "popHigh") {
      result.sort((a, b) => (b.population || 0) - (a.population || 0));
    } else if (sort === "popLow") {
      result.sort((a, b) => (a.population || 0) - (b.population || 0));
    }
    setFiltered(result);
  }, [search, sort, continentFilter, independentFilter, unFilter, countries]);

  const totalPopulation = countries.reduce((acc, c) => acc + (c.population || 0), 0);
  const totalContinents = Array.from(new Set(countries.map((c) => c.region))).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-900 via-blue-900 to-green-700 text-white">
      {/* Header */}
      <header className="p-6 text-center bg-gradient-to-r from-green-800 to-blue-800 shadow-lg">
        <h1 className="text-4xl font-bold">🌍 Earth Dashboard</h1>
        <p className="text-lg mt-2">Explore countries, continents, and global statistics</p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-lg shadow p-4 text-center">
          <h2 className="text-xl font-semibold">Total Countries</h2>
          <p className="text-2xl">{countries.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg shadow p-4 text-center">
          <h2 className="text-xl font-semibold">Total Population</h2>
          <p className="text-2xl">{totalPopulation.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow p-4 text-center">
          <h2 className="text-xl font-semibold">Total Continents</h2>
          <p className="text-2xl">{totalContinents}</p>
        </div>
      </section>

      {/* Controls */}
      <section className="p-6 flex flex-col md:flex-row gap-4 justify-center items-center">
        <input
          type="text"
          placeholder="Search by name, capital, region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 bg-white text-black font-bold border-2 border-white shadow"
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSort("az")} className="bg-white text-black font-bold px-3 py-2 border-2 border-white shadow hover:bg-gray-200">A–Z</button>
          <button onClick={() => setSort("za")} className="bg-white text-black font-bold px-3 py-2 border-2 border-white shadow hover:bg-gray-200">Z–A</button>
          <button onClick={() => setSort("popHigh")} className="bg-white text-black font-bold px-3 py-2 border-2 border-white shadow hover:bg-gray-200">Population High → Low</button>
          <button onClick={() => setSort("popLow")} className="bg-white text-black font-bold px-3 py-2 border-2 border-white shadow hover:bg-gray-200">Population Low → High</button>
        </div>
        <select
          value={continentFilter}
          onChange={(e) => setContinentFilter(e.target.value)}
          className="p-2 bg-white text-black font-bold border-2 border-white shadow"
        >
          <option value="">All Continents</option>
          {Array.from(new Set(countries.map((c) => c.region))).map((cont) => (
            <option key={cont} value={cont}>{cont}</option>
          ))}
        </select>
        <select
          value={independentFilter}
          onChange={(e) => setIndependentFilter(e.target.value)}
          className="p-2 bg-white text-black font-bold border-2 border-white shadow"
        >
          <option value="">All</option>
          <option value="Yes">Independent</option>
          <option value="No">Not Independent</option>
        </select>
        <select
          value={unFilter}
          onChange={(e) => setUnFilter(e.target.value)}
          className="p-2 bg-white text-black font-bold border-2 border-white shadow"
        >
          <option value="">All</option>
          <option value="Yes">UN Members</option>
          <option value="No">Not UN Members</option>
        </select>
      </section>

      {/* Content */}
      <main className="flex-1 p-6">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-4 border-green-400 rounded-full animate-spin"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-600 p-6 rounded-lg text-center shadow">
            <h2 className="text-2xl font-bold">Error fetching data</h2>
            <p>Please try again later.</p>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-xl bg-gradient-to-r from-green-700 to-blue-700 p-6 rounded-lg shadow">
            No country found.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.name} className="bg-gradient-to-br from-green-800 to-blue-800 rounded-lg shadow p-4 hover:shadow-xl">
              <img
                src={c.flag || "https://dummyimage.com/300x200/ffffff/000000&text=No+Flag"}
                alt={c.name}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold">{c.name}</h2>
              <p><strong>Capital:</strong> {c.capital || "Not Available"}</p>
              <p><strong>Region:</strong> {c.region || "Not Available"}</p>
              <p><strong>Subregion:</strong> {c.subregion || "Not Available"}</p>
              <p><strong>Population:</strong> {c.population?.toLocaleString() || "Not Available"}</p>
              <p><strong>Area:</strong> {c.area?.toLocaleString() || "Not Available"} km²</p>
              <p><strong>Independent:</strong> {c.independent ? "Yes" : "No"}</p>
              <p><strong>UN Member:</strong> {c.unMember ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-gradient-to-r from-green-800 to-blue-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <div>Developed by <strong>Rafia Naz</strong></div>
        <div>© 2026 Rafia Naz. All Rights Reserved.</div>
        <div>Built with Next.js, TypeScript & Tailwind CSS</div>
      </footer>
    </div>
  );
}
