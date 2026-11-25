// Loads Razorpay's checkout script once, on demand.
let pending = null;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve(window.Razorpay);
      s.onerror = () => { pending = null; s.remove(); reject(new Error("Could not load the payment window. Please check your connection and try again.")); };
      document.head.appendChild(s);
    });
  }
  return pending;
}
