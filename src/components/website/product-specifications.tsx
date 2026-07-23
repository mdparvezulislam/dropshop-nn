import { cn } from "@/lib/utils/cn";

interface ProductSpecificationsProps {
  specifications: { key: string; value: string }[];
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (specifications.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Specifications</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full">
          <tbody>
            {specifications.map((spec, i) => (
              <tr
                key={spec.key}
                className={cn(
                  "text-sm",
                  i % 2 === 0 ? "bg-muted/20" : "bg-transparent",
                )}
              >
                <td className="px-4 py-3 text-foreground/50 w-2/5 font-medium">
                  {spec.key}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
