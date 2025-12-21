import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure, updateTicketSuccess } from '../store/slices/ticketSlice';
import ticketService from '../services/ticketService';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import CreateTicketDrawer from '../components/CreateTicketDrawer';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../contexts/ToastContext';

const COLUMNS = ['Open', 'In Progress', 'Resolved', 'Closed'];

const KanbanBoardPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading } = useSelector((state) => state.tickets);
    const { showToast } = useToast();

    // Local state for the board to ensure immediate UI updates
    const [boardData, setBoardData] = useState({
        'Open': [],
        'In Progress': [],
        'Resolved': [],
        'Closed': []
    });

    const [activeId, setActiveId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Sync Redux state to local board state
    useEffect(() => {
        if (tickets && tickets.length > 0) {
            const newBoard = {
                'Open': [],
                'In Progress': [],
                'Resolved': [],
                'Closed': []
            };

            tickets.forEach(ticket => {
                if (newBoard[ticket.status]) {
                    newBoard[ticket.status].push(ticket);
                }
            });

            setBoardData(newBoard);
        }
    }, [tickets]);

    // Initial fetch
    useEffect(() => {
        const loadTickets = async () => {
            dispatch(fetchTicketsStart());
            try {
                const data = await ticketService.getTickets({ limit: 100 });
                dispatch(fetchTicketsSuccess(data));
            } catch (error) {
                dispatch(fetchTicketsFailure(error.message));
                showToast('Failed to load tickets', 'error');
            }
        };
        loadTickets();
    }, [dispatch]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id; // Could be a ticket ID or a column ID

        // Find the source and destination containers
        const sourceColumn = findColumn(activeId);
        let destColumn = findColumn(overId);

        // If overId is a column name itself (empty column drop)
        if (COLUMNS.includes(overId)) {
            destColumn = overId;
        }

        if (!sourceColumn || !destColumn) {
            setActiveId(null);
            return;
        }

        if (sourceColumn !== destColumn) {
            // Moving to a different column (Status Change)
            const activeTicket = boardData[sourceColumn].find(t => t._id === activeId);

            // Optimistic Update
            setBoardData(prev => {
                const sourceItems = [...prev[sourceColumn]];
                const destItems = [...prev[destColumn]];
                const movedItem = { ...activeTicket, status: destColumn };

                return {
                    ...prev,
                    [sourceColumn]: sourceItems.filter(t => t._id !== activeId),
                    [destColumn]: [...destItems, movedItem]
                };
            });

            showToast(`Moved ticket to ${destColumn}`, 'info', 2000);

            // API Call
            try {
                const updatedTicket = await ticketService.updateTicket(activeId, { status: destColumn });
                // Update Redux to keep sync
                // We verify the update was successful
            } catch (error) {
                showToast('Failed to update ticket status', 'error');
                // Revert logic would go here in a production app
                // For now, reload tickets
                const data = await ticketService.getTickets({ limit: 100 });
                dispatch(fetchTicketsSuccess(data));
            }

        } else {
            // Reordering within same column (Not persisted in BE for now, just local UI)
            const oldIndex = boardData[sourceColumn].findIndex(t => t._id === activeId);
            const newIndex = boardData[sourceColumn].findIndex(t => t._id === overId);

            if (oldIndex !== newIndex) {
                setBoardData(prev => ({
                    ...prev,
                    [sourceColumn]: arrayMove(prev[sourceColumn], oldIndex, newIndex)
                }));
            }
        }

        setActiveId(null);
    };

    const findColumn = (id) => {
        if (COLUMNS.includes(id)) return id;
        for (const col of COLUMNS) {
            if (boardData[col].find(t => t._id === id)) {
                return col;
            }
        }
        return null;
    };

    const handleTicketClick = (ticket) => {
        setTicketToEdit(ticket);
        setIsDrawerOpen(true);
    };

    const activeTicket = activeId ? (
        Object.values(boardData).flat().find(t => t._id === activeId)
    ) : null;

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8 bg-transparent min-h-full overflow-hidden flex flex-col">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Predictive Flow
                    </h1>
                    <p className="text-gray-500 font-medium">Drag and drop tickets through the workflow.</p>
                </div>
            </motion.div>

            {isLoading && tickets.length === 0 ? (
                <div className="flex gap-6 h-full overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="min-w-[300px] flex-1">
                            <SkeletonLoader.Text className="h-8 w-1/2 mb-4" />
                            <SkeletonLoader.Card />
                            <SkeletonLoader.Card />
                        </div>
                    ))}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="flex h-full gap-6 pb-4 min-w-max">
                            {COLUMNS.map((col) => (
                                <KanbanColumn
                                    key={col}
                                    id={col}
                                    title={col}
                                    tickets={boardData[col]}
                                    count={boardData[col].length}
                                    onAddTicket={() => {
                                        setTicketToEdit(null);
                                        setIsDrawerOpen(true);
                                    }}
                                    onTicketClick={handleTicketClick}
                                />
                            ))}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeTicket ? (
                            <div className="w-[300px]">
                                <KanbanCard ticket={activeTicket} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <CreateTicketDrawer
                open={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setTicketToEdit(null);
                }}
                ticketToEdit={ticketToEdit}
            />
        </div>
    );
};

export default KanbanBoardPage;
