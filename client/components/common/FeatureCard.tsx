type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 p-6">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-gray-400">
        {description}
      </p>
    </div>
  );
}