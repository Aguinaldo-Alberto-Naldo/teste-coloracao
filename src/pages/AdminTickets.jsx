import { useState, useEffect, useRef } from "react";
import { useTicketsStore } from "../stores/ticketsStore";
import { useAuthStore } from "../stores/authStore";
import { Search, MessageSquare, AlertCircle, CheckCircle2, MoreVertical, Send, Loader2 } from "lucide-react";

export default function AdminTickets() {
    const { tickets, loadTickets, updateStatus, addReply, loading } = useTicketsStore();
    const { currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedTicket) {
            scrollToBottom();
        }
    }, [selectedTicket?.ticket_replies?.length, selectedTicketId, selectedTicket]);

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.user_profile?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket || !currentUser) return;
        try {
            await addReply(selectedTicket.id, currentUser.id, replyText, true);
            setReplyText("");
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return "bg-red-100 text-red-700 border-red-200";
            case 'in_progress': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'resolved': return "bg-green-100 text-green-700 border-green-200";
            case 'closed': return "bg-slate-100 text-slate-700 border-slate-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return "Aberto";
            case 'in_progress': return "Em Curso";
            case 'resolved': return "Resolvido";
            case 'closed': return "Fechado";
            default: return status;
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
            {/* Tickets List View */}
            <div className={`flex-1 md:w-1/3 flex flex-col bg-card shadow-sm border border-border rounded-xl overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-4">Tickets de Suporte</h2>
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Procurar por assunto ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'open', 'in_progress', 'resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                >
                                    {status === 'all' ? 'Todos' : getStatusLabel(status)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        filteredTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTicketId === ticket.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/50'} relative overflow-hidden`}
                            >
                                {ticket.status === 'open' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}

                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex gap-3 items-center">
                                    {ticket.user_profile?.avatar_url ? (
                                        <img
                                            src={ticket.user_profile.avatar_url}
                                            alt={ticket.user_profile.full_name || 'U'}
                                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-border mt-1"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border border-primary/20 mt-1">
                                            {(ticket.user_profile?.full_name || ticket.user_email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-foreground mb-0.5 line-clamp-1">{ticket.subject}</h3>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium italic">
                                            {ticket.user_profile?.full_name || "Utilizador"} • {ticket.user_email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!loading && filteredTickets.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Nenhum ticket encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Detail / Reply Area */}
            <div className={`flex-1 md:w-2/3 flex flex-col bg-card shadow-sm border border-border rounded-xl overflow-hidden ${!selectedTicket ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {!selectedTicket ? (
                    <div className="text-center text-muted-foreground p-10">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <h3 className="text-xl font-heading font-bold mb-2">Selecione um Ticket</h3>
                        <p className="text-sm">Clique num ticket na lista para ver detalhes e responder.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-border bg-muted/10 flex-shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    {selectedTicket.user_profile?.avatar_url ? (
                                        <img
                                            src={selectedTicket.user_profile.avatar_url}
                                            alt={selectedTicket.user_profile.full_name || 'U'}
                                            className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-primary/20 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border-2 border-primary/20 shadow-sm text-lg">
                                            {(selectedTicket.user_profile?.full_name || selectedTicket.user_email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-heading font-bold text-foreground mb-0.5">{selectedTicket.subject}</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                            <span className="text-foreground font-bold">{selectedTicket.user_profile?.full_name || "Utilizador"}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{selectedTicket.user_email}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => {
                                            updateStatus(selectedTicket.id, e.target.value);
                                        }}
                                        className={`text-sm font-bold rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none ${getStatusStyle(selectedTicket.status)}`}
                                    >
                                        <option value="open">Aberto</option>
                                        <option value="in_progress">Em Curso</option>
                                        <option value="resolved">Resolvido</option>
                                        <option value="closed">Fechado</option>
                                    </select>

                                    <button onClick={() => setSelectedTicketId(null)} className="md:hidden text-muted-foreground p-2 hover:bg-secondary rounded">Voltar</button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
                            {/* Original Message */}
                            <div className="flex gap-4">
                                {selectedTicket.user_profile?.avatar_url ? (
                                    <img
                                        src={selectedTicket.user_profile.avatar_url}
                                        alt={selectedTicket.user_profile.full_name || 'U'}
                                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-border shadow-sm"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border border-primary/20 shadow-sm">
                                        {(selectedTicket.user_profile?.full_name || selectedTicket.user_email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm">
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                                </div>
                            </div>

                            {/* Replies */}
                            {(selectedTicket.ticket_replies || []).map((reply) => (
                                <div key={reply.id} className={`flex gap-4 ${reply.is_from_admin ? 'flex-row-reverse' : ''}`}>
                                    {reply.sender_profile?.avatar_url ? (
                                        <img
                                            src={reply.sender_profile.avatar_url}
                                            alt={reply.sender_profile.full_name || (reply.is_from_admin ? 'Admin' : 'U')}
                                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-border shadow-sm"
                                        />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 border shadow-sm ${reply.is_from_admin ? 'bg-accent/20 text-accent-foreground border-accent/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {reply.is_from_admin ? 'A' : (reply.sender_profile?.full_name || selectedTicket.user_email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`border rounded-2xl p-4 max-w-[80%] shadow-sm ${reply.is_from_admin ? 'bg-accent/5 border-accent/20 rounded-tr-none' : 'bg-card border-border rounded-tl-none'}`}>
                                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{reply.text}</p>
                                        <p className={`text-[10px] mt-2 ${reply.is_from_admin ? 'text-accent-foreground/60 text-right' : 'text-muted-foreground'}`}>{new Date(reply.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-border bg-card">
                            <form onSubmit={handleReply} className="relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Escrever resposta..."
                                    className="w-full h-24 p-3 pr-14 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                                    disabled={selectedTicket.status === 'closed'}
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || selectedTicket.status === 'closed'}
                                    className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            {selectedTicket.status === 'closed' && (
                                <p className="text-xs text-center text-muted-foreground mt-2">Este ticket está fechado. Reabra-o para responder.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
