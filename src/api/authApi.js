// frontend/src/api/authApi.js
export const login = async (email, password) => {
  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
