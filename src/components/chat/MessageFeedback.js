import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
export default function MessageFeedback({ conversationId, messageIndex, agentName, context }) {
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleFeedback = async (type) => {
        if (isSubmitting || feedback)
            return;
        setIsSubmitting(true);
        setFeedback(type);
        try {
            await base44.entities.TherapyFeedback.create({
                conversation_id: conversationId,
                message_index: messageIndex,
                feedback_type: type,
                agent_name: agentName,
                session_context: context
            });
            // Analytics tracking
            if (appParams.appId) {
                base44.analytics.track({
                    eventName: 'message_feedback_given',
                    properties: {
                        feedback_type: type,
                        conversation_id: conversationId,
                        agent_name: agentName,
                        context: context
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to submit feedback:', error);
            setFeedback(null);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-1 mt-2", children: [_jsx("span", { className: "text-slate-50 mr-2 text-xs", children: "Was this helpful?" }), _jsx("button", { onClick: () => handleFeedback('helpful'), disabled: feedback !== null, "data-testid": "feedback-helpful", className: "text-slate-50 p-1 rounded-md transition-colors hover:text-green-600 hover:bg-green-50", "aria-label": "Helpful", children: _jsx(ThumbsUp, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => handleFeedback('not_helpful'), disabled: feedback !== null, "data-testid": "feedback-not-helpful", className: "text-slate-50 p-1 rounded-md transition-colors hover:text-red-600 hover:bg-red-50", "aria-label": "Not helpful", children: _jsx(ThumbsDown, { className: "w-3.5 h-3.5" }) }), feedback &&
                _jsx("span", { className: "text-slate-50 ml-2 text-xs", children: "Thanks for your feedback!" })] }));
}
