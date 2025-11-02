import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  const toast = (options: ToastOptions | string) => {
    if (typeof options === "string") {
      return sonnerToast(options);
    }
    
    const { title, description, variant, duration } = options;
    const message = title || description || "";
    
    if (variant === "destructive") {
      return sonnerToast.error(message, { description: title ? description : undefined, duration });
    }
    
    return sonnerToast.success(message, { description: title ? description : undefined, duration });
  };
  
  return { toast };
}

export const toast = (options: ToastOptions | string) => {
  if (typeof options === "string") {
    return sonnerToast(options);
  }
  
  const { title, description, variant, duration } = options;
  const message = title || description || "";
  
  if (variant === "destructive") {
    return sonnerToast.error(message, { description: title ? description : undefined, duration });
  }
  
  return sonnerToast.success(message, { description: title ? description : undefined, duration });
};
