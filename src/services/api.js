import axios from "axios";

const API_BASE = "http://localhost:8000";

export const fetchDashboards = (creds) =>
  axios.post(`${API_BASE}/looker/dashboards`, {
    looker_url: creds.url,
    looker_client_id: creds.id,
    looker_client_secret: creds.secret,
  });

export const migrateDashboard = (payload) =>
  axios.post(`${API_BASE}/migrate`, payload);



















// import axios from "axios";

// const API_BASE = "http://localhost:8000";

// // Fetch dashboards from Looker
// export const fetchDashboards = (lookerCreds) => {
//   return axios.post(`${API_BASE}/looker/dashboards`, {
//     looker_url: lookerCreds.url,
//     looker_client_id: lookerCreds.id,
//     looker_client_secret: lookerCreds.secret,
//   });
// };

// // Run migration
// export const migrateDashboard = (payload) => {
//   return axios.post(`${API_BASE}/migrate`, payload);
// };