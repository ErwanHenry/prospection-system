import {
  List,
  Datagrid,
  TextField,
  EmailField,
  SelectField,
  ReferenceField,
  DateField,
  ChipField,
  Filter,
  TextInput,
  SelectInput,
  ReferenceInput,
} from 'react-admin';

const statusChoices = [
  { id: 'TO_CONTACT', name: 'À contacter' },
  { id: 'CONTACTED', name: 'Contacté' },
  { id: 'RESPONDED', name: 'A répondu' },
  { id: 'QUALIFIED', name: 'Qualifié' },
  { id: 'CONVERTED', name: 'Converti' },
  { id: 'REJECTED', name: 'Rejeté' },
];

const priorityChoices = [
  { id: 'LOW', name: 'Basse' },
  { id: 'MEDIUM', name: 'Moyenne' },
  { id: 'HIGH', name: 'Haute' },
  { id: 'URGENT', name: 'Urgent' },
];

const ProspectFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Recherche" source="q" alwaysOn />
    <SelectInput source="status" choices={statusChoices} alwaysOn />
    <SelectInput source="priority" choices={priorityChoices} />
    <ReferenceInput source="campaignId" reference="campaigns">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const ProspectList = () => (
  <List filters={<ProspectFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="edit">
      <TextField source="fullName" label="Nom" />
      <TextField source="company" label="Entreprise" />
      <TextField source="jobTitle" label="Poste" />
      <EmailField source="email" label="Email" />
      <ChipField source="status" label="Statut" />
      <ChipField source="priority" label="Priorité" />
      <ReferenceField source="campaignId" reference="campaigns" label="Campagne">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="lastContactedAt" label="Dernier contact" />
    </Datagrid>
  </List>
);
