async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    const data = await res.json();

    if (data.ok) {
        localStorage.setItem("token", data.token);
        window.location = "dashboard.html";
    } else {
        document.getElementById("error").innerText = data.error || "Erreur";
    }
}

async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    const data = await res.json();
    if (data.ok) {
        window.location = "index.html";
    } else {
        document.getElementById("error").innerText = data.error;
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location = "index.html";
}
