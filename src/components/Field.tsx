
function Field(props: {
  label?: string;
  onInput: (value: string) => void;
  placeholder?: string;
  type?: string;
  value?: string;
  onBlur?: () => void;
}) {
  return (
    <div>
      {props.label && (
        <label class="block text-xs font-medium text-gray-700 mb-0.5">
          {props.label}
        </label>
      )}
      <input
        type={props.type ?? "text"}
        value={props.value ?? ""}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onBlur={() => props.onBlur?.()}
        placeholder={props.placeholder ?? ""}
        class="block w-full rounded-lg border-0 bg-gray-50 px-2.5 py-1 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-shadow"
      />
    </div>
  );
}

export default Field;
