"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyUniversityEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Verification token is missing from the link.");
      return;
    }

    async function submitVerification() {
      try {
        const response = await fetch("/api/v1/users/me/university-email/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          const data = await response.json();
          setStatus("error");
          setErrorMessage(data?.error?.message || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }

    submitVerification();
  }, [token]);

  if (status === "verifying") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Verifying your university email...</p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">University email verified!</h1>
          <p className="mt-2 text-gray-600">Your university email has been successfully verified.</p>
          <a href="/me" className="mt-4 inline-block text-blue-600 underline">
            Go to your profile
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Verification failed</h1>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        <a href="/" className="mt-4 inline-block text-blue-600 underline">
          Go to home
        </a>
      </div>
    </main>
  );
}
