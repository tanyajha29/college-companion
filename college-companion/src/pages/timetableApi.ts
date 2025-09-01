import axios from "axios";

const API_URL = "http://localhost:5000/api/timetable";

// Fetch timetable for current user
export const fetchTimetable = async (token: string) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Add new entry
export const addTimetableEntry = async (entry: any, token: string) => {
  const res = await axios.post(API_URL, entry, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update entry
export const updateTimetableEntry = async (id: number, entry: any, token: string) => {
  const res = await axios.put(`${API_URL}/${id}`, entry, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete entry
export const deleteTimetableEntry = async (id: number, token: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
