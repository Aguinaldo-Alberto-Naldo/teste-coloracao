import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useTicketsStore } from "../stores/ticketsStore";
import { Plus, MessageSquare, Send, AlertCircle } from "lucide-react";

export default function ClientSupport() {
    const { currentUser } = useAuthStore();
    const { tickets, createTicket, addReply } = useTicketsStore();

    const [isCreating, setIsCreating] = useState(false);
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const messagesEndRef = useRef(null);

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedTicket) {
            scrollToBottom();
        }
    }, [selectedTicket?.ticket_replies?.length, selectedTicketId]);

    const myTickets = tickets.filter(t => t.user_id === currentUser.id || t.user_email === currentUser.email);

    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!newSubject.trim() || !newMessage.trim()) return;

        const ticket = createTicket(currentUser.id, currentUser.email, newSubject, newMessage);
        setNewSubject("");
        setNewMessage("");
        setIsCreating(false);
        setSelectedTicketId(ticket.id);
    };

    const handleReply = (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;
        addReply(selectedTicket.id, replyText, false);
        setReplyText("");
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
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">

            {/* Tickets List */}
            <div className={`flex-1 md:w-1/3 flex flex-col bg-card shadow-sm border border-border rounded-xl overflow-hidden ${(selectedTicket || isCreating) ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h2 className="text-xl font-heading font-bold text-foreground">Meus Tickets</h2>
                    <button
                        onClick={() => { setSelectedTicket(null); setIsCreating(true); }}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        title="Novo Ticket"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {myTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => { setIsCreating(false); setSelectedTicketId(ticket.id); }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTicketId === ticket.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/50'} relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                                    {getStatusLabel(ticket.status)}
                                </span>
                                <span className="text-[11px] text-slate-500 font-bold italic">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{ticket.subject}</h3>
                            <p className="text-xs text-slate-500 font-bold line-clamp-1 flex items-center gap-1">
                                {(ticket.ticket_replies?.length || 0) > 0 && <MessageSquare className="w-3 h-3" />}
                                {ticket.ticket_replies?.length || 0} respostas
                            </p>
                        </div>
                    ))}

                    {myTickets.length === 0 && (
                        <div className="text-center py-10 text-slate-500 px-4">
                            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold mb-4">Ainda não abriu nenhum ticket de suporte.</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                Abrir Novo Ticket
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Area */}
            <div className={`flex-1 md:w-2/3 flex flex-col bg-card shadow-sm border border-border rounded-xl overflow-hidden ${(!selectedTicketId && !isCreating) ? 'hidden md:flex items-center justify-center' : 'flex'}`}>

                {/* Empty State */}
                {(!selectedTicketId && !isCreating) && (
                    <div className="text-center text-slate-500 p-10">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <h3 className="text-xl font-heading font-bold mb-2">Central de Suporte</h3>
                        <p className="text-sm font-medium max-w-md mx-auto">Seleccione um ticket na lista ou crie um novo para falar com a nossa equipa de apoio ao cliente.</p>
                    </div>
                )}

                {/* Create New Ticket */}
                {isCreating && (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-border bg-muted/10 flex justify-between items-center">
                            <h2 className="text-2xl font-heading font-bold text-foreground">Novo Ticket de Suporte</h2>
                            <button onClick={() => setIsCreating(false)} className="md:hidden text-slate-500 p-2 hover:bg-secondary rounded text-sm font-bold">Cancelar</button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form id="create-ticket-form" onSubmit={handleCreateTicket} className="max-w-xl mx-auto space-y-4 pt-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Assunto da Dúvida/Reclamação</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        placeholder="Ex: Problema com pagamento, Dúvida na Paleta..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Mensagem Detalhada</label>
                                    <textarea
                                        required
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        placeholder="Descreva a sua situação da forma mais detalhada possível..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-secondary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="create-ticket-form"
                                disabled={!newSubject.trim() || !newMessage.trim()}
                                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                Enviar Ticket
                            </button>
                        </div>
                    </div>
                )}

                {/* View Ticket / Reply */}
                {selectedTicket && !isCreating && (
                    <>
                        <div className="p-6 border-b border-border bg-muted/10 shrink-0">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-heading font-bold text-foreground mb-1 pr-8">{selectedTicket.subject}</h2>
                                <button onClick={() => setSelectedTicketId(null)} className="md:hidden text-muted-foreground p-2 hover:bg-secondary rounded shrink-0">Voltar</button>
                            </div>
                            <div className="items-center gap-3 hidden md:flex">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStatusStyle(selectedTicket.status)}`}>
                                    Estado: {getStatusLabel(selectedTicket.status)}
                                </span>
                                <span className="text-sm text-slate-500 font-bold">
                                    {new Date(selectedTicket.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
                            {/* Original Message */}
                            <div className="flex gap-4 flex-row-reverse">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                    {currentUser.fullName[0].toUpperCase()}
                                </div>
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tr-none p-4 max-w-[80%] shadow-sm ml-auto">
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                                </div>
                            </div>

                            {/* Replies */}
                            {(selectedTicket.ticket_replies || []).map((reply) => (
                                <div key={reply.id} className={`flex gap-4 ${!reply.is_from_admin ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${reply.is_from_admin ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'}`}>
                                        {reply.is_from_admin ? 'A' : currentUser.fullName[0].toUpperCase()}
                                    </div>
                                    <div className={`border rounded-2xl p-4 max-w-[80%] shadow-sm ${!reply.is_from_admin ? 'bg-primary/5 border-primary/20 rounded-tr-none ml-auto' : 'bg-card border-border rounded-tl-none'}`}>
                                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{reply.text}</p>
                                        <p className={`text-[10px] mt-2 font-bold ${!reply.is_from_admin ? 'text-primary/60 text-right' : 'text-slate-500'}`}>{new Date(reply.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-border bg-card shrink-0">
                            {selectedTicket.status === 'closed' ? (
                                <div className="text-center py-4 text-muted-foreground text-sm font-medium">
                                    Este ticket foi encerrado. Não é possível enviar mais mensagens. <br /> Por favor, abra um novo ticket se precisar de ajuda.
                                </div>
                            ) : (
                                <form onSubmit={handleReply} className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Escrever resposta..."
                                        className="w-full h-24 p-3 pr-14 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
