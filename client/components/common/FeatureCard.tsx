type FeatureCardProps = {
  number: string;
  icon: string;
  title: string;
  description: string;
};

export default function FeatureCard({
  number,
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111113] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-[#141416]">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/[0.06] blur-2xl transition-all duration-300 group-hover:bg-blue-500/[0.1]" />

      <div className="relative flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-blue-300">
          {icon}
        </div>

        <span className="text-xs font-medium text-zinc-700">
          {number}
        </span>
      </div>

      <h3 className="relative mt-8 text-lg font-semibold text-zinc-100">
        {title}
      </h3>

      <p className="relative mt-3 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <div className="relative mt-7 flex items-center gap-2 text-xs font-medium text-zinc-600 transition-colors group-hover:text-blue-300">
        Learn more
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </article>
  );
}