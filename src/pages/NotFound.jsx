import { Link } from "react-router-dom";
import FlowLayout from "../components/FlowLayout";
import usePageTitle from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found — Midsoft");
  return (
    <FlowLayout className="center">
      <h1>Page not found</h1>
      <p className="sub">The page you’re looking for doesn’t exist.</p>
      <Link className="btn" to="/">Go to home</Link>
    </FlowLayout>
  );
}
