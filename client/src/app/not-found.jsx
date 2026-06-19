import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-foreground px-4">
      <div className="text-center">
        {/* Animated 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for seems to have wandered off into the
          digital void.
        </p>

        {/* Decorative Elements */}
        <div className="mb-12 flex justify-center gap-2">
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6.5 py-2.5 bg-background text-foreground font-semibold rounded-md "
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
