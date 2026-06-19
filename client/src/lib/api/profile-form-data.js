export const hasProfileImageFile = (data) => {
  return data?.profileImageFile instanceof File;
};

export const toProfileFormData = (data = {}) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;

    if (key === "profileImageFile") {
      if (value instanceof File) {
        formData.append("profileImage", value);
      }
      return;
    }

    if (value === null) {
      formData.append(key, "");
      return;
    }

    formData.append(key, value);
  });

  return formData;
};