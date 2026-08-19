// Small shared bit used by both MongoForm.tsx and DirSelector.tsx (the
// icon + title + optional right-side content row at the top of each
// panel) — not part of the numbered reading order, just a shared leaf.
export function PanelHeader(props: {
  title: string;
  icon: (p: object) => any;
  right?: any;
}) {
  return (
    <div class="flex items-center justify-between mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600">
          {props.icon({ size: 12 })}
        </span>
        <h2 class="text-sm font-semibold text-gray-900">{props.title}</h2>
      </div>
      {props.right}
    </div>
  );
}

export default PanelHeader;
