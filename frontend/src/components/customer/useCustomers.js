import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchCustomers } from "./customerApi";

export const useCustomers = (initialQuery = "") => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const load = async (q = query) => {
    setLoading(true);
    try {
      const data = await fetchCustomers(q);
      setCustomers(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { customers, setCustomers, loading, query, setQuery, reload: load };
};
