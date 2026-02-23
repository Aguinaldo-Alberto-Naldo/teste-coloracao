import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReportsStore } from "../stores/reportsStore";

export default function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, loadReports, getBySubject } = useReportsStore();

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    useEffect(() => {
        if (reports.length > 0) {
            const report = reports.find(r => r.subject_id === id) || reports.find(r => r.id === id);
            if (report) {
                navigate(`/reports/${report.subject_id}`, { replace: true });
            } else {
                navigate('/dashboard');
            }
        }
    }, [id, reports, navigate]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-muted">A carregar detalhes...</div>
        </div>
    );
}
