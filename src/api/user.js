export const fetchUserById = async (userId) => {
  const response = await fetch(`http://localhost:5001/api/users/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  const data = await response.json();
  return data.user;
};

export const updateUser = async ({ userId, userData, token }) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  if (userData.image) formData.append("image", userData.image);

  const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
    body: formData,
  });

  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update user");
  }
  return response.json();
};
