import Container from "../layout/Container";

export default function About() {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            About KnowFlow
          </span>

          <h2 className="mt-4 text-4xl font-bold text-white">
            Your Personal AI Knowledge Workspace
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-400">
            KnowFlow helps you collect notes, organize ideas, search documents,
            and chat with AI—all from one secure workspace. Instead of using
            multiple apps, everything stays connected in one place.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white">
              Organize Everything
            </h3>

            <p className="mt-4 text-gray-400">
              Keep notes, documents and ideas structured in one workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white">
              AI Assistance
            </h3>

            <p className="mt-4 text-gray-400">
              Ask questions, summarize documents and quickly find information.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white">
              Secure Storage
            </h3>

            <p className="mt-4 text-gray-400">
              Your knowledge remains private and securely stored in the cloud.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}