import {
  Edit,
  TabbedForm,
  FormTab,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  required,
  ReferenceManyField,
  Datagrid,
  TextField,
  DateField,
  ChipField,
} from 'react-admin';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const statusChoices = [
  { id: 'DRAFT', name: 'Brouillon' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'PAUSED', name: 'En pause' },
  { id: 'COMPLETED', name: 'Terminée' },
];

const StatsCard = ({ title, value, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const StatsPanel = ({ record }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12} sm={3}>
      <StatsCard title="Prospects scrapés" value={record?.prospectsScraped || 0} />
    </Grid>
    <Grid item xs={12} sm={3}>
      <StatsCard title="Messages envoyés" value={record?.messagesSent || 0} color="success" />
    </Grid>
    <Grid item xs={12} sm={3}>
      <StatsCard title="Réponses reçues" value={record?.responsesReceived || 0} color="warning" />
    </Grid>
    <Grid item xs={12} sm={3}>
      <StatsCard
        title="Taux de réponse"
        value={
          record?.messagesSent > 0
            ? `${Math.round((record?.responsesReceived / record?.messagesSent) * 100)}%`
            : '0%'
        }
        color="info"
      />
    </Grid>
  </Grid>
);

export const CampaignEdit = () => (
  <Edit>
    <TabbedForm>
      <FormTab label="Informations générales">
        <TextInput source="name" label="Nom de la campagne" validate={required()} fullWidth />
        <SelectInput source="status" choices={statusChoices} label="Statut" fullWidth />
      </FormTab>

      <FormTab label="Ciblage">
        <TextInput source="linkedinSearchUrl" label="URL de recherche LinkedIn" fullWidth />
        <TextInput source="filters" label="Filtres avancés (JSON)" multiline fullWidth format={(v) => JSON.stringify(v, null, 2)} parse={(v) => {
          try { return JSON.parse(v); } catch { return v; }
        }} />
        <NumberInput source="maxProspects" label="Nombre max de prospects" fullWidth />
      </FormTab>

      <FormTab label="Planification">
        <DateInput source="startDate" label="Date de début" fullWidth />
        <DateInput source="endDate" label="Date de fin" fullWidth />
        <NumberInput source="dailyLimit" label="Limite quotidienne" fullWidth />
      </FormTab>

      <FormTab label="Statistiques">
        <StatsPanel />

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Prospects de cette campagne
        </Typography>
        <ReferenceManyField reference="prospects" target="campaignId" label="">
          <Datagrid bulkActionButtons={false}>
            <TextField source="fullName" label="Nom" />
            <TextField source="company" label="Entreprise" />
            <TextField source="jobTitle" label="Poste" />
            <ChipField source="status" label="Statut" />
            <DateField source="createdAt" label="Ajouté le" />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
    </TabbedForm>
  </Edit>
);
