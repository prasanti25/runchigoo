import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { ErrorNotice, Modal } from "../product/UI.jsx";
import UserAvatar from "./UserAvatar.jsx";

function PhotoEditor({ onClose }) {
  const { user, updateProfile } = useAuth();
  const uploadAvailable = user.can_upload_photo !== false;
  const input = useRef(null);
  const [selection, setSelection] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (selection?.url) URL.revokeObjectURL(selection.url);
    },
    [selection],
  );
  const choose = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose a photo smaller than 5 MB.");
      return;
    }
    setSelection({ file, url: URL.createObjectURL(file) });
  };
  const save = async (remove = false) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      if (!remove) form.append("avatar", selection.file);
      await updateProfile(remove ? { avatar: null } : form);
      toast.success(remove ? "Profile photo removed" : "Profile photo updated");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Profile photo" onClose={busy ? () => {} : onClose}>
      <div className="photo-editor">
        <UserAvatar
          user={{ ...user, avatar: selection?.url || user.avatar }}
          className="photo-preview"
        />
        <p>
          {uploadAvailable
            ? "Choose a photo that feels like you."
            : "Photo uploads are temporarily unavailable."}
        </p>
        {uploadAvailable ? (
          <small>
            JPG, PNG or WebP · up to 5 MB · max 4096 × 4096 px.
            <br />
            Your photo is cropped to a square and shown in a circle.
          </small>
        ) : (
          <small>
            You can still edit your name and contact details in account
            settings.
          </small>
        )}
        <input
          ref={input}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose profile photo"
          onChange={choose}
          disabled={busy || !uploadAvailable}
        />
        <button
          type="button"
          className="btn secondary"
          disabled={busy || !uploadAvailable}
          onClick={() => input.current?.click()}
        >
          <ImagePlus size={17} />
          {selection ? "Choose another photo" : "Choose photo"}
        </button>
        <ErrorNotice error={error} />
        <div className="photo-editor-actions">
          <button
            type="button"
            className="btn secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={!selection || busy || !uploadAvailable}
            onClick={() => save()}
          >
            {busy ? "Saving…" : "Save photo"}
          </button>
        </div>
        {user.avatar && (
          <button
            type="button"
            className="text-link photo-remove"
            disabled={busy}
            onClick={() => save(true)}
          >
            <Trash2 size={15} />
            Remove photo
          </button>
        )}
      </div>
    </Modal>
  );
}

export default function ProfilePhoto({ compact = false }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`profile-photo-control ${compact ? "is-compact" : ""}`}
        aria-label="Change profile photo"
        onClick={() => setEditing(true)}
      >
        <UserAvatar user={user} />
        <span className="photo-camera">
          <Camera size={15} />
        </span>
        {!compact && <span className="photo-control-label">Change photo</span>}
      </button>
      {editing && <PhotoEditor onClose={() => setEditing(false)} />}
    </>
  );
}
