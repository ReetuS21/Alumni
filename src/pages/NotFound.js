import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
    <p className="text-sm font-semibold text-blue-600">404</p>
    <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
    <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
    <Link to="/" className="btn btn-primary mt-6">
      Go to dashboard
    </Link>
  </div>
);
