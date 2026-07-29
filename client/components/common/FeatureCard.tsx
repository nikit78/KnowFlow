type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
        <span className="text-lg">✦</span>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <div className="mt-6 text-sm font-medium text-blue-300 transition-colors group-hover:text-blue-200">
        Explore feature →
      </div>
    </article>
  );
}