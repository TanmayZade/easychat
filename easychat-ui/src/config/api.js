const API_BASE = process.env.REACT_APP_API_BASE;

if (!API_BASE) {
    console.error("API base URL is not defined");
}

export default API_BASE;