const BACKEND_URL = "http://127.0.0.1:5000"; // auto-switch if needed
async function checkServer() {
  try {
    const res = await fetch(BACKEND_URL);
    const text = await res.text();
    document.body.innerHTML = `<h1 style='color:#00ffcc;font-family:monospace;text-align:center;margin-top:20%'>${text}</h1>`;
  } catch (err) {
    document.body.innerHTML = `<h1 style='color:red;font-family:monospace;text-align:center;margin-top:20%'>⚠️ Unable to reach backend server.</h1>`;
    console.error(err);
  }
}
window.onload = checkServer;
