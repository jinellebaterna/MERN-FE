
export const loginUser = async ({ email, password }) => {
  const response = await fetch("http://localhost:5001/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Login failed");
  }

  return response.json();
};

export const signupUser = async ({ name, email, password, image }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("name", name);
  formData.append("password", password);
  formData.append("image", image);

  const response = await fetch("http://localhost:5001/api/users/signup", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Signup failed");
  }

  return response.json();
};