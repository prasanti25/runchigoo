export const accountAccessLabel = (person) => {
  if (person.is_active) return "Active";
  return person.access_status === "pending" ? "Pending approval" : "Blocked";
};

export const accountAccessAction = (person) => {
  if (person.is_active) return "block";
  return person.access_status === "pending" ? "approve" : "unblock";
};
