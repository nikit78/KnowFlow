import { colors } from "@/styles/colors";
import { radius } from "@/styles/radius";
import { spacing } from "@/styles/spacing";

type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button
      type="button"
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        border: `1px solid ${colors.primary}`,
        padding: `${spacing.sm} ${spacing.xl}`,
        borderRadius: radius.md,
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 600,
      }}
      className="transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
    >
      {children}
    </button>
  );
}