import {
  List,
  Datagrid,
  TextField,
  SelectField,
  NumberField,
  DateField,
  FilterList,
  FilterListItem,
  ChipField,
} from 'react-admin';
import { Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import DraftsIcon from '@mui/icons-material/Drafts';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

const statusChoices = [
  { id: 'DRAFT', name: 'Brouillon' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'PAUSED', name: 'En pause' },
  { id: 'COMPLETED', name: 'Terminée' },
];

const StatusFilter = () => (
  <Card sx={{ order: -1, mr: 2, mt: 8, width: 200 }}>
    <CardContent>
      <FilterList label="Statut" icon={<CheckCircleIcon />}>
        <FilterListItem label="Brouillon" value={{ status: 'DRAFT' }} icon={<DraftsIcon />} />
        <FilterListItem label="Active" value={{ status: 'ACTIVE' }} icon={<PlayCircleIcon />} />
        <FilterListItem label="En pause" value={{ status: 'PAUSED' }} icon={<PauseCircleIcon />} />
        <FilterListItem label="Terminée" value={{ status: 'COMPLETED' }} icon={<CheckCircleIcon />} />
      </FilterList>
    </CardContent>
  </Card>
);

export const CampaignList = () => (
  <List aside={<StatusFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="edit">
      <TextField source="name" label="Nom" />
      <SelectField source="status" choices={statusChoices} label="Statut" />
      <NumberField source="prospectsScraped" label="Prospects" />
      <NumberField source="messagesSent" label="Messages envoyés" />
      <NumberField source="responsesReceived" label="Réponses" />
      <NumberField source="dailyLimit" label="Limite/jour" />
      <DateField source="createdAt" label="Créée le" showTime />
    </Datagrid>
  </List>
);
