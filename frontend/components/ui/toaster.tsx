"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";

export const toaster = createToaster({
  overlap: true,
  placement: "bottom-end",
  gap: 16,
});

const toastTypes = [
  {
    type: "success" as const,
    title: "Success!",
    description: "Your changes have been saved.",
    icon: CheckCircle,
    colors: "bg-white border border-green-200 text-black",
    iconColor: "text-green-500",
  },
  {
    type: "error" as const,
    title: "Error occurred",
    description: "Something went wrong. Please try again.",
    icon: AlertCircle,
    colors: "bg-white border border-red-200 text-black",
    iconColor: "text-red-500",
  },
  {
    type: "warning" as const,
    title: "Warning",
    description: "This action cannot be undone.",
    icon: AlertTriangle,
    colors: "bg-white border border-yellow-200 text-black",
    iconColor: "text-yellow-500",
  },
  {
    type: "info" as const,
    title: "Update Info",
    description: "A new update is available.",
    icon: Info,
    colors: "bg-white border border-orange-200 text-black",
    iconColor: "text-orange-500",
  },
];

export default function ToasterComponent() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => {
          const toastConfig = toastTypes.find((t) => t.type === toast.type) || toastTypes[3];
          const Icon = toastConfig.icon;

          return (
            <Toast.Root
              className={`rounded-2xl shadow-xl min-w-80 p-5 relative overflow-anywhere transition-all duration-300 ease-in-out will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index) ${
                toastConfig.colors
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl bg-gray-50 flex items-center justify-center shrink-0`}>
                   <Icon
                    className={`w-5 h-5 ${
                      toastConfig.iconColor
                    }`}
                  />
                </div>
                <div className="flex-1 pr-6">
                  <Toast.Title className="font-black text-sm tracking-tight">
                    {toast.title}
                  </Toast.Title>
                  <Toast.Description className="text-xs text-black/50 font-bold mt-1 leading-relaxed">
                    {toast.description}
                  </Toast.Description>
                </div>
              </div>
              <Toast.CloseTrigger className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-black/20 hover:text-orange-500">
                <X className="w-4 h-4" />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </Portal>
  );
}
