import {
  Create,
  TabbedForm,
  FormTab,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  required,
  JsonInput,
} from 'react-admin';

const statusChoices = [
  { id: 'DRAFT', name: 'Brouillon' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'PAUSED', name: 'En pause' },
  { id: 'COMPLETED', name: 'Terminée' },
];

export const CampaignCreate = () => (
  <Create>
    <TabbedForm>
      <FormTab label="Informations générales">
        <TextInput source="name" label="Nom de la campagne" validate={required()} fullWidth />
        <SelectInput
          source="status"
          choices={statusChoices}
          label="Statut"
          defaultValue="DRAFT"
          fullWidth
        />
      </FormTab>

      <FormTab label="Ciblage">
        <TextInput
          source="linkedinSearchUrl"
          label="URL de recherche LinkedIn"
          helperText="Ex: https://www.linkedin.com/search/results/people/?keywords=CTO%20startup%20Paris"
          fullWidth
        />
        <JsonInput
          source="filters"
          label="Filtres avancés (JSON)"
          helperText='Ex: {"location": "Paris", "industry": "Tech", "companySize": "11-50"}'
          fullWidth
        />
        <NumberInput
          source="maxProspects"
          label="Nombre max de prospects"
          defaultValue={1000}
          fullWidth
        />
      </FormTab>

      <FormTab label="Planification">
        <DateInput source="startDate" label="Date de début" fullWidth />
        <DateInput source="endDate" label="Date de fin" fullWidth />
        <NumberInput
          source="dailyLimit"
          label="Limite quotidienne d'actions"
          defaultValue={50}
          helperText="Recommandé: 30-50 pour éviter les limitations LinkedIn"
          fullWidth
        />
      </FormTab>
    </TabbedForm>
  </Create>
);
