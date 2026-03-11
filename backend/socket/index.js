const rooms = new Map();

module.exports = {
    rooms,
    init: (io) => {
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            socket.on('join-room', ({ roomId, username, config }) => {
                socket.join(roomId);

                if (!rooms.has(roomId)) {
                    rooms.set(roomId, {
                        id: roomId,
                        participants: [],
                        status: 'lobby',
                        config: config || {},
                        content: null // Stores generated DSA/Voice questions
                    });
                } else if (config && Object.keys(config).length > 0) {
                    // Update config if the current room has no config (e.g. created by a joiner without params)
                    const room = rooms.get(roomId);
                    if (!room.config || Object.keys(room.config).length === 0) {
                        room.config = config;
                    }
                }

                const room = rooms.get(roomId);

                // Cleanup existing participants with the same name (handle refreshes)
                const existingIndex = room.participants.findIndex(p => p.name === username);
                if (existingIndex !== -1) {
                    room.participants.splice(existingIndex, 1);
                }

                const participant = {
                    id: socket.id,
                    name: username || `Candidate ${room.participants.length + 1}`,
                    isReady: false,
                    // Evaluation tracking
                    dsaSubmissions: [],
                    voiceAnswers: [],
                    actions: [],
                    penalties: {
                        revealCode: 0,
                        hints: 0,
                        submissions: 0
                    }
                };

                room.participants.push(participant);

                // Broadcast the new participant list to everyone in the room
                io.to(roomId).emit('room-update', room);
                console.log(`User ${participant.name} joined room ${roomId} (Total: ${room.participants.length})`);
            });

            socket.on('update-room-content', ({ roomId, content }) => {
                const room = rooms.get(roomId);
                if (room) {
                    room.content = content;
                    io.to(roomId).emit('room-update', room);
                }
            });

            socket.on('update-room-status', ({ roomId, status }) => {
                const room = rooms.get(roomId);
                if (room) {
                    room.status = status;
                    io.to(roomId).emit('room-update', room);
                }
            });

            socket.on('player-ready', ({ roomId, isReady }) => {
                const room = rooms.get(roomId);
                if (!room) return;

                const participant = room.participants.find(p => p.id === socket.id);
                if (participant) {
                    participant.isReady = isReady;
                }

                // Check if all participants are ready
                const allReady = room.participants.every(p => p.isReady);
                if (allReady && room.participants.length > 0) {
                    const includeDSA = room.config?.includeDSA !== false;
                    room.status = includeDSA ? 'coding' : 'voice';
                    console.log(`Phase transition: Room ${roomId} moving to ${room.status} (DSA: ${includeDSA})`);
                    io.to(roomId).emit('start-interview', room);
                } else {
                    io.to(roomId).emit('room-update', room);
                }
            });

            // Track reveal code usage (heavy penalty: -5 points)
            socket.on('reveal-code-used', ({ roomId, questionId }) => {
                const room = rooms.get(roomId);
                if (!room) return;

                const participant = room.participants.find(p => p.id === socket.id);
                if (participant) {
                    participant.actions.push({
                        type: 'reveal-code',
                        questionId,
                        timestamp: Date.now()
                    });
                    participant.penalties.revealCode += -5;
                    console.log(`${participant.name} used reveal code on Q${questionId} (Penalty: -5)`);
                }
            });

            // Track AI hint requests (penalty: -1 point per hint)
            socket.on('ai-hint-requested', ({ roomId, questionId }) => {
                const room = rooms.get(roomId);
                if (!room) return;

                const participant = room.participants.find(p => p.id === socket.id);
                if (participant) {
                    participant.actions.push({
                        type: 'ai-hint',
                        questionId,
                        timestamp: Date.now()
                    });
                    participant.penalties.hints += -1;
                    console.log(`${participant.name} requested AI hint on Q${questionId} (Penalty: -1)`);
                }
            });

            // Track code submissions
            socket.on('code-submission', ({ roomId, questionId, code, testResults, timeSpent }) => {
                const room = rooms.get(roomId);
                if (!room) return;

                const participant = room.participants.find(p => p.id === socket.id);
                if (participant) {
                    // Find or create submission record
                    let submission = participant.dsaSubmissions.find(s => s.questionId === questionId);
                    if (!submission) {
                        submission = {
                            questionId,
                            attempts: 0,
                            revealCodeUsed: participant.actions.some(a => a.type === 'reveal-code' && a.questionId === questionId),
                            hintsUsed: participant.actions.filter(a => a.type === 'ai-hint' && a.questionId === questionId).length
                        };
                        participant.dsaSubmissions.push(submission);
                    }

                    submission.attempts += 1;
                    submission.lastCode = code;
                    submission.lastTestResults = testResults;
                    submission.timeSpent = timeSpent;

                    // Apply submission penalty after 2 attempts
                    if (submission.attempts > 2) {
                        const additionalPenalty = -0.5;
                        participant.penalties.submissions += additionalPenalty;
                        console.log(`${participant.name} submission #${submission.attempts} on Q${questionId} (Penalty: ${additionalPenalty})`);
                    }

                    participant.actions.push({
                        type: 'code-submission',
                        questionId,
                        timestamp: Date.now(),
                        passed: testResults.every(t => t.passed)
                    });
                }
            });

            // Track voice answers
            socket.on('voice-answer-submitted', ({ roomId, questionId, transcript, duration }) => {
                const room = rooms.get(roomId);
                if (!room) return;

                const participant = room.participants.find(p => p.id === socket.id);
                if (participant) {
                    participant.voiceAnswers.push({
                        questionId,
                        transcript,
                        duration,
                        timestamp: Date.now()
                    });
                    console.log(`${participant.name} submitted voice answer for Q${questionId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                // Handle cleanup (remove from room)
                rooms.forEach((room, roomId) => {
                    const index = room.participants.findIndex(p => p.id === socket.id);
                    if (index !== -1) {
                        room.participants.splice(index, 1);
                        io.to(roomId).emit('room-update', room);
                    }
                });
            });
        });
    }
};
