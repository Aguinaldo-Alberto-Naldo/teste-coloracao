export default function StatusBadge({ status }) {
    const styles = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        completed: "bg-green-500/10 text-green-500 border-green-500/20",
        error: "bg-destructive/10 text-destructive border-destructive/20"
    };

    const labels = {
        pending: "Pendente",
        processing: "A processar...",
        completed: "Concluído",
        error: "Erro"
    };

    const style = styles[status] || styles.pending;
    const label = labels[status] || "Pendente";

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${style}`}>
            {label}
        </span>
    );
}
