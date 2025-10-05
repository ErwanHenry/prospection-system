import { useEffect, useState } from 'react';
import { useDataProvider, Title } from 'react-admin';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, Typography, Avatar, Chip, Box, Grid } from '@mui/material';

const statusColumns = [
  { id: 'TO_CONTACT', title: 'À contacter', color: '#9e9e9e' },
  { id: 'CONTACTED', title: 'Contacté', color: '#2196f3' },
  { id: 'RESPONDED', title: 'A répondu', color: '#ff9800' },
  { id: 'QUALIFIED', title: 'Qualifié', color: '#4caf50' },
  { id: 'CONVERTED', title: 'Converti', color: '#8bc34a' },
  { id: 'REJECTED', title: 'Rejeté', color: '#f44336' },
];

const ProspectCard = ({ prospect, index }) => (
  <Draggable draggableId={prospect.id} index={index}>
    {(provided, snapshot) => (
      <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        sx={{
          mb: 1,
          opacity: snapshot.isDragging ? 0.8 : 1,
          transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }} src={prospect.profilePicture}>
              {prospect.fullName?.charAt(0)}
            </Avatar>
            <Typography variant="subtitle2">{prospect.fullName}</Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {prospect.jobTitle}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {prospect.company}
          </Typography>
          {prospect.tags?.length > 0 && (
            <Box>
              {prospect.tags.slice(0, 2).map((tag, i) => (
                <Chip key={i} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          )}
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Chip
              label={prospect.priority || 'MEDIUM'}
              size="small"
              color={prospect.priority === 'URGENT' ? 'error' : 'default'}
            />
            {prospect.email && (
              <Typography variant="caption" color="success.main">
                ✓ Email
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    )}
  </Draggable>
);

const Column = ({ column, prospects }) => (
  <Card sx={{ minHeight: 500, bgcolor: '#f5f5f5' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" sx={{ color: column.color }}>
          {column.title}
        </Typography>
        <Chip label={prospects.length} size="small" />
      </Box>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 400,
              bgcolor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
              transition: 'background-color 0.2s',
              borderRadius: 1,
              p: 1,
            }}
          >
            {prospects.map((prospect, index) => (
              <ProspectCard key={prospect.id} prospect={prospect} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </CardContent>
  </Card>
);

export const ProspectKanban = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataProvider = useDataProvider();

  useEffect(() => {
    dataProvider
      .getList('prospects', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
      })
      .then(({ data }) => {
        setProspects(data);
        setLoading(false);
      });
  }, [dataProvider]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // Update prospect status
    dataProvider
      .update('prospects', {
        id: draggableId,
        data: { status: destination.droppableId },
        previousData: prospects.find((p) => p.id === draggableId),
      })
      .then(() => {
        // Optimistic update
        setProspects((prev) =>
          prev.map((p) =>
            p.id === draggableId ? { ...p, status: destination.droppableId } : p
          )
        );
      });
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box p={2}>
      <Title title="Pipeline Kanban" />
      <Typography variant="h4" gutterBottom>
        Pipeline de prospection
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {statusColumns.map((column) => (
            <Grid item xs={12} md={2} key={column.id}>
              <Column
                column={column}
                prospects={prospects.filter((p) => p.status === column.id)}
              />
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
};
