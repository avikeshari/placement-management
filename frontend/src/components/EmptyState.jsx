import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "Nothing here yet",
  message = "No data is currently available.",
  action
}) => {
  return (
    <div className="bg-white border rounded-2xl p-10 text-center">
      <Inbox size={42} className="mx-auto text-slate-400" />
      <h2 className="text-xl font-semibold mt-4">{title}</h2>
      <p className="text-slate-500 mt-2">{message}</p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
