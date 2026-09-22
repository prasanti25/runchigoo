export default function UserAvatar({ user, className = "" }) {
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "RG";
  return (
    <span className={`user-avatar ${className}`}>
      <span aria-hidden="true">{initials}</span>
      {user?.avatar && (
        <img
          key={user.avatar}
          src={user.avatar}
          alt="Profile photo"
          decoding="async"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
    </span>
  );
}
