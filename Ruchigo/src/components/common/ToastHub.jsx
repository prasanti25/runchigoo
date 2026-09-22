import { CircleCheck, CircleAlert, Info, LoaderCircle, X } from "lucide-react";
import toast, { Toaster, resolveValue } from "react-hot-toast";

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  loading: LoaderCircle,
  blank: Info,
};

export default function ToastHub() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      containerClassName="toast-hub"
      toastOptions={{
        duration: 5000,
        removeDelay: 180,
        error: { duration: 7000 },
      }}
    >
      {(notification) => {
        const Icon = icons[notification.type] || Info;
        return (
          <div
            className={`app-toast app-toast--${notification.type} ${notification.visible ? "is-visible" : "is-leaving"}`}
          >
            <span className="app-toast-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <div className="app-toast-message" {...notification.ariaProps}>
              {resolveValue(notification.message, notification)}
            </div>
            <button
              className="app-toast-dismiss"
              aria-label="Dismiss notification"
              onClick={() => toast.dismiss(notification.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      }}
    </Toaster>
  );
}
