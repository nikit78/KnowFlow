import { colors } from "@/styles/colors";
import { radius } from "@/styles/radius";
import { spacing } from "@/styles/spacing";


type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        border: "none",
        padding: `${spacing.md} ${spacing.xl}`,
        borderRadius: radius.md,
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}